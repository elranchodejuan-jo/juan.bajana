#!/usr/bin/env python3
"""Descarga materiales de un curso Moodle usando una sesión ya iniciada.

El estudiante abre Chromium en el escritorio remoto, inicia sesión manualmente,
entra al curso de Diseño Experimental y después ejecuta este archivo. La
contraseña nunca se guarda ni se solicita al script.
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import mimetypes
import re
import sys
import unicodedata
import zipfile
from collections import deque
from dataclasses import asdict, dataclass
from datetime import datetime
from email.message import Message
from pathlib import Path
from typing import Iterable
from urllib.parse import parse_qsl, urlencode, urljoin, urlparse, urlunparse

from bs4 import BeautifulSoup
from playwright.async_api import APIResponse, BrowserContext, Page, async_playwright
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table

CONSOLE = Console()
CDP_ENDPOINT = "http://127.0.0.1:9222"
DEFAULT_OUTPUT = Path(__file__).resolve().parent / "Descargas" / "Diseno_Experimental"

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".ppt",
    ".pptx",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".csv",
    ".txt",
    ".rtf",
    ".odt",
    ".ods",
    ".odp",
    ".zip",
    ".rar",
    ".7z",
}

FOLLOW_PATH_MARKERS = (
    "/course/view.php",
    "/mod/resource/view.php",
    "/mod/folder/view.php",
    "/mod/page/view.php",
    "/mod/url/view.php",
    "/mod/book/view.php",
    "/mod/lesson/view.php",
)

FILE_PATH_MARKERS = (
    "/pluginfile.php/",
    "/draftfile.php/",
    "/webservice/pluginfile.php/",
)

ASSET_EXTENSIONS = {
    ".css",
    ".js",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".webp",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".map",
}


@dataclass(slots=True)
class DownloadRecord:
    source_url: str
    final_url: str
    filename: str
    bytes: int
    sha256: str
    status: str
    note: str = ""


def normalize_url(url: str) -> str:
    parsed = urlparse(url)
    query = urlencode(sorted(parse_qsl(parsed.query, keep_blank_values=True)))
    return urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, query, ""))


def sanitize_filename(value: str, fallback: str = "material") -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = re.sub(r"[\\/:*?\"<>|\x00-\x1f]", "_", value)
    value = re.sub(r"\s+", " ", value).strip(" ._")
    return (value or fallback)[:180]


def extension_from_url(url: str) -> str:
    return Path(urlparse(url).path).suffix.lower()


def is_probable_file_url(url: str) -> bool:
    path = urlparse(url).path.lower()
    return extension_from_url(url) in ALLOWED_EXTENSIONS or any(marker in path for marker in FILE_PATH_MARKERS)


def is_asset_url(url: str) -> bool:
    return extension_from_url(url) in ASSET_EXTENSIONS


def can_follow_page(url: str, allowed_host: str) -> bool:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or parsed.netloc != allowed_host:
        return False
    path = parsed.path.lower()
    return any(marker in path for marker in FOLLOW_PATH_MARKERS)


def filename_from_headers(response: APIResponse, hint: str, final_url: str) -> str:
    headers = response.headers
    content_disposition = headers.get("content-disposition", "")
    if content_disposition:
        message = Message()
        message["content-disposition"] = content_disposition
        filename = message.get_filename()
        if filename:
            return sanitize_filename(filename)

    path_name = Path(urlparse(final_url).path).name
    if path_name and "." in path_name:
        return sanitize_filename(path_name)

    content_type = headers.get("content-type", "").split(";", 1)[0].strip().lower()
    guessed_ext = mimetypes.guess_extension(content_type) or ""
    if guessed_ext == ".jpe":
        guessed_ext = ".jpg"
    return sanitize_filename(hint or "material") + guessed_ext


def unique_destination(directory: Path, filename: str, digest: str) -> Path:
    filename = sanitize_filename(filename)
    candidate = directory / filename
    if not candidate.exists():
        return candidate

    try:
        existing_digest = hashlib.sha256(candidate.read_bytes()).hexdigest()
        if existing_digest == digest:
            return candidate
    except OSError:
        pass

    stem = candidate.stem
    suffix = candidate.suffix
    index = 2
    while True:
        candidate = directory / f"{stem} ({index}){suffix}"
        if not candidate.exists():
            return candidate
        index += 1


def page_title_hint(anchor_text: str, url: str) -> str:
    text = re.sub(r"\s+", " ", anchor_text).strip()
    if text:
        return text
    name = Path(urlparse(url).path).name
    return name or "material"


class MoodleMaterialDownloader:
    def __init__(
        self,
        context: BrowserContext,
        start_url: str,
        output_dir: Path,
        max_pages: int,
        max_files: int,
    ) -> None:
        self.context = context
        self.start_url = normalize_url(start_url)
        self.output_dir = output_dir
        self.max_pages = max_pages
        self.max_files = max_files
        self.allowed_host = urlparse(self.start_url).netloc
        self.visited_pages: set[str] = set()
        self.visited_files: set[str] = set()
        self.content_hashes: set[str] = set()
        self.records: list[DownloadRecord] = []

    async def download_response(self, source_url: str, hint: str, response: APIResponse) -> bool:
        content_type = response.headers.get("content-type", "").lower()
        final_url = response.url
        if "text/html" in content_type or "application/xhtml" in content_type:
            return False

        if not response.ok:
            self.records.append(
                DownloadRecord(source_url, final_url, "", 0, "", "error", f"HTTP {response.status}")
            )
            return True

        body = await response.body()
        if not body:
            return True

        digest = hashlib.sha256(body).hexdigest()
        filename = filename_from_headers(response, hint, final_url)
        ext = Path(filename).suffix.lower()

        if ext in ASSET_EXTENSIONS or content_type.startswith("image/"):
            return True

        if digest in self.content_hashes:
            self.records.append(
                DownloadRecord(source_url, final_url, filename, len(body), digest, "duplicate", "Contenido repetido")
            )
            return True

        destination = unique_destination(self.output_dir, filename, digest)
        destination.write_bytes(body)
        self.content_hashes.add(digest)
        self.records.append(
            DownloadRecord(source_url, final_url, destination.name, len(body), digest, "downloaded")
        )
        return True

    async def request_url(self, url: str, hint: str) -> tuple[APIResponse | None, str | None]:
        try:
            response = await self.context.request.get(
                url,
                timeout=45_000,
                fail_on_status_code=False,
                max_redirects=10,
            )
            return response, None
        except Exception as exc:
            return None, str(exc)

    async def extract_links(self, html: str, base_url: str) -> list[tuple[str, str]]:
        soup = BeautifulSoup(html, "html.parser")
        links: list[tuple[str, str]] = []
        for anchor in soup.select("a[href]"):
            href = (anchor.get("href") or "").strip()
            if not href or href.startswith(("#", "javascript:", "mailto:", "tel:")):
                continue
            absolute = normalize_url(urljoin(base_url, href))
            text = anchor.get_text(" ", strip=True)
            links.append((absolute, page_title_hint(text, absolute)))
        return links

    async def run(self) -> list[DownloadRecord]:
        self.output_dir.mkdir(parents=True, exist_ok=True)
        queue: deque[tuple[str, str]] = deque([(self.start_url, "Curso Diseño Experimental")])

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            transient=True,
            console=CONSOLE,
        ) as progress:
            task = progress.add_task("Analizando el curso…", total=None)

            while queue and len(self.visited_pages) < self.max_pages and self.downloaded_count < self.max_files:
                url, hint = queue.popleft()

                if is_probable_file_url(url):
                    if url in self.visited_files:
                        continue
                    self.visited_files.add(url)
                    progress.update(task, description=f"Descargando: {hint[:70]}")
                    response, error = await self.request_url(url, hint)
                    if response is None:
                        self.records.append(DownloadRecord(url, url, "", 0, "", "error", error or "Error de red"))
                        continue
                    handled = await self.download_response(url, hint, response)
                    if handled:
                        continue
                    html = await response.text()
                    for child_url, child_hint in await self.extract_links(html, response.url):
                        if is_probable_file_url(child_url) and child_url not in self.visited_files:
                            queue.appendleft((child_url, child_hint or hint))
                    continue

                if url in self.visited_pages or not can_follow_page(url, self.allowed_host):
                    continue

                self.visited_pages.add(url)
                progress.update(task, description=f"Revisando página {len(self.visited_pages)}: {hint[:60]}")
                response, error = await self.request_url(url, hint)
                if response is None:
                    self.records.append(DownloadRecord(url, url, "", 0, "", "error", error or "Error de red"))
                    continue

                if await self.download_response(url, hint, response):
                    continue

                if not response.ok:
                    self.records.append(
                        DownloadRecord(url, response.url, "", 0, "", "error", f"HTTP {response.status}")
                    )
                    continue

                html = await response.text()
                for child_url, child_hint in await self.extract_links(html, response.url):
                    if is_asset_url(child_url):
                        continue
                    if is_probable_file_url(child_url):
                        if child_url not in self.visited_files:
                            queue.append((child_url, child_hint))
                    elif can_follow_page(child_url, self.allowed_host) and child_url not in self.visited_pages:
                        queue.append((child_url, child_hint))

        return self.records

    @property
    def downloaded_count(self) -> int:
        return sum(record.status == "downloaded" for record in self.records)


def choose_active_page(pages: Iterable[Page]) -> Page | None:
    candidates = [page for page in pages if page.url.startswith(("http://", "https://"))]
    if not candidates:
        return None
    for page in reversed(candidates):
        if "/course/view.php" in page.url:
            return page
    return candidates[-1]


def write_report(output_dir: Path, start_url: str, records: list[DownloadRecord]) -> Path:
    report_path = output_dir / "reporte_descarga.json"
    payload = {
        "generated_at": datetime.now().astimezone().isoformat(),
        "start_url": start_url,
        "downloaded": sum(record.status == "downloaded" for record in records),
        "duplicates": sum(record.status == "duplicate" for record in records),
        "errors": sum(record.status == "error" for record in records),
        "records": [asdict(record) for record in records],
    }
    report_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return report_path


def create_zip(output_dir: Path) -> Path:
    zip_path = output_dir.parent / "Diseno_Experimental.zip"
    temporary = zip_path.with_suffix(".zip.tmp")
    if temporary.exists():
        temporary.unlink()
    with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(output_dir.rglob("*")):
            if path.is_file():
                archive.write(path, path.relative_to(output_dir.parent))
    temporary.replace(zip_path)
    return zip_path


def print_summary(records: list[DownloadRecord], output_dir: Path, zip_path: Path) -> None:
    table = Table(title="Resultado de la descarga")
    table.add_column("Estado")
    table.add_column("Cantidad", justify="right")
    table.add_row("Descargados", str(sum(record.status == "downloaded" for record in records)))
    table.add_row("Repetidos", str(sum(record.status == "duplicate" for record in records)))
    table.add_row("Errores", str(sum(record.status == "error" for record in records)))
    CONSOLE.print(table)
    CONSOLE.print(f"\n[bold green]Carpeta:[/] {output_dir}")
    CONSOLE.print(f"[bold green]ZIP listo:[/] {zip_path}")


async def async_main(args: argparse.Namespace) -> int:
    output_dir = args.output.resolve()

    async with async_playwright() as playwright:
        try:
            browser = await playwright.chromium.connect_over_cdp(CDP_ENDPOINT)
        except Exception:
            CONSOLE.print(
                "[bold red]No encontré Chromium abierto.[/] Abre el escritorio EVA y usa "
                "el acceso directo ‘Abrir EVEA UTMACH’."
            )
            return 2

        if not browser.contexts:
            CONSOLE.print("[bold red]Chromium no tiene un contexto activo.[/]")
            return 2

        context = browser.contexts[0]
        pages = [page for ctx in browser.contexts for page in ctx.pages]
        active_page = choose_active_page(pages)
        start_url = args.url or (active_page.url if active_page else "")

        if not start_url.startswith(("http://", "https://")):
            CONSOLE.print("[bold red]Abre primero el curso de Diseño Experimental en Chromium.[/]")
            return 2

        if "/login/" in start_url or "login.microsoftonline.com" in start_url:
            CONSOLE.print(
                "[bold yellow]La sesión todavía está en la pantalla de inicio de sesión.[/] "
                "Ingresa manualmente, abre el curso y vuelve a ejecutar el descargador."
            )
            return 2

        CONSOLE.print(f"[bold]Curso que se analizará:[/] {start_url}")
        downloader = MoodleMaterialDownloader(
            context=context,
            start_url=start_url,
            output_dir=output_dir,
            max_pages=args.max_pages,
            max_files=args.max_files,
        )
        records = await downloader.run()
        write_report(output_dir, start_url, records)
        zip_path = create_zip(output_dir)
        print_summary(records, output_dir, zip_path)
        return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Descarga materiales del curso Moodle abierto en el navegador EVA."
    )
    parser.add_argument(
        "url",
        nargs="?",
        help="URL del curso. Si se omite, se usa la pestaña de curso actualmente abierta.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Carpeta de salida (predeterminada: {DEFAULT_OUTPUT})",
    )
    parser.add_argument("--max-pages", type=int, default=120, help="Máximo de páginas Moodle a revisar.")
    parser.add_argument("--max-files", type=int, default=200, help="Máximo de archivos a descargar.")
    return parser.parse_args()


def main() -> int:
    try:
        return asyncio.run(async_main(parse_args()))
    except KeyboardInterrupt:
        CONSOLE.print("\n[yellow]Descarga cancelada.[/]")
        return 130
    except Exception as exc:
        CONSOLE.print(f"[bold red]Error inesperado:[/] {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())

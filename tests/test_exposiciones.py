import importlib.util
import json
import math
import tempfile
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('builder', ROOT/'scripts/build-exposiciones.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)

class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self.ids=[]; self.images=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='img':self.images.append(a)
        for k in ('href','src'):
            if a.get(k):self.links.append(a[k])

class ExposicionesTests(unittest.TestCase):
    def setUp(self):
        self.content=json.loads((ROOT/'exposiciones/content/fisiopatologia--equilibrio-acido-base.json').read_text())

    def test_published_content_and_vancouver_sequence(self):
        builder.validate(self.content,published=True)
        first=[]
        for s in self.content['scenes']:
            for r in s.get('references',[]):
                if r not in first:first.append(r)
        self.assertEqual(first,list(range(1,len(self.content['references'])+1)))

    def test_draft_creation_rejects_traversal_and_duplicates(self):
        with tempfile.TemporaryDirectory() as td:
            for slug in ('../escape','a/b','a--b','', '/root','Acento','a%2fb'):
                with self.assertRaises(ValueError):builder.create_draft('genetica',slug,td)
            draft=builder.create_draft('genetica','prueba-temporal',td)
            data=json.loads(draft.read_text());builder.validate(data)
            self.assertEqual(data['status'],'draft')
            self.assertEqual(data['scenes'],[])
            with self.assertRaises(ValueError):builder.create_draft('genetica','prueba-temporal',td)
            with self.assertRaises(ValueError):builder.validate(data,published=True)
            catalog=json.loads((ROOT/'exposiciones/catalog.json').read_text())
            self.assertFalse(any(x['slug']=='prueba-temporal' for x in catalog))

    def test_resource_traversal_and_absent_download_rejected(self):
        for path in ('https://example.com/a','/exposiciones/../../secret','/exposiciones/a?b'):
            with self.assertRaises(ValueError):builder.local_path(path)
        self.content['resources']=[{'path':'/exposiciones/no-existe.pdf'}]
        with self.assertRaises(ValueError):builder.validate(self.content,published=True)

    def test_html_links_ids_images_and_no_remote_runtime(self):
        files=list((ROOT/'exposiciones').rglob('index.html'))
        self.assertEqual(len(files),4)
        for p in files:
            parsed=Links();parsed.feed(p.read_text())
            self.assertEqual(len(parsed.ids),len(set(parsed.ids)),f'Duplicate id {p}')
            for image in parsed.images:self.assertIn('alt',image)
            for url in parsed.links:
                parts=urlsplit(url)
                if parts.scheme or parts.netloc:continue
                target=(ROOT/parts.path.lstrip('/')) if parts.path.startswith('/') else (p.parent/parts.path)
                if not parts.path:target=p
                if target.is_dir():target/='index.html'
                self.assertTrue(target.is_file(),f'Missing {url} from {p}')
                if parts.fragment and target.suffix=='.html':
                    dest=Links();dest.feed(target.read_text());self.assertIn(unquote(parts.fragment),dest.ids)
            self.assertNotIn('https://cdn.',p.read_text())
        for p in (ROOT/'exposiciones/shared').glob('*'):
            self.assertNotIn('eval(',p.read_text())

    def test_case_calculations_match_displayed_values(self):
        for s in self.content['scenes']:
            if s['layout']!='case':continue
            c=s['case'];values=c['values']
            def value(prefix):
                key=next(k for k in values if k.startswith(prefix) and 'prev' not in k)
                return float(values[key].split()[0].replace(',','.'))
            expected=6.1+math.log10(value('HCO')/(.03*value('PCO')))
            self.assertAlmostEqual(value('pH'),expected,delta=.005)
            self.assertGreaterEqual(c['correct'],0);self.assertLess(c['correct'],len(c['options']))

    def test_study_content_is_static_and_genetics_is_honest(self):
        p=ROOT/'exposiciones/fisiopatologia/equilibrio-acido-base/index.html'
        source=p.read_text()
        for scene in self.content['scenes']:
            self.assertIn(builder.esc(scene['title']),source)
            self.assertIn(f'id="{scene["id"]}"',source)
        self.assertIn('<noscript>',source)
        self.assertIn('Lectura del razonamiento completo',source)
        genetics=(ROOT/'exposiciones/genetica/index.html').read_text()
        self.assertIn('Todavía no hay exposiciones publicadas',genetics)
        self.assertNotIn('data-expo-card',genetics)

if __name__=='__main__':unittest.main()

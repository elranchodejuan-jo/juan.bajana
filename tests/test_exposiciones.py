import importlib.util
import hashlib
import json
import math
import re
import tempfile
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote, urljoin

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_PAGES = {
    'exposiciones/index.html', 'exposiciones/fisiopatologia/index.html',
    'exposiciones/genetica/index.html',
    'exposiciones/fisiopatologia/equilibrio-acido-base/index.html',
    'exposiciones/genetica/cromosomas-y-determinacion-sexual/index.html',
}
spec = importlib.util.spec_from_file_location('builder', ROOT/'scripts/build-exposiciones.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)

class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self.ids=[]; self.images=[]; self.downloads=[]; self.active_download=None
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='img':self.images.append(a)
        if tag=='a' and 'download' in a:
            self.active_download={'href':a.get('href'), 'label':''}
            self.downloads.append(self.active_download)
        for k in ('href','src'):
            if a.get(k):self.links.append(a[k])
    def handle_data(self, data):
        if self.active_download is not None:self.active_download['label']+=data
    def handle_endtag(self, tag):
        if tag=='a':self.active_download=None

class RuntimeAssets(HTMLParser):
    def __init__(self):
        super().__init__(); self.scripts=[]; self.styles=[]; self.import_maps=[]; self.map_data=None
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='script':
            self.scripts.append(a)
            if a.get('type')=='importmap':self.map_data=''
        if tag=='link' and a.get('rel')=='stylesheet':self.styles.append(a['href'])
    def handle_data(self, data):
        if self.map_data is not None:self.map_data+=data
    def handle_endtag(self, tag):
        if tag=='script' and self.map_data is not None:
            self.import_maps.append(json.loads(self.map_data));self.map_data=None

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

    def test_other_subjects_do_not_receive_acid_base_visuals(self):
        data=dict(self.content,subject='genetica',slug='tema-real-futuro')
        cover=builder.scene_html(data['scenes'][0],data,0)
        self.assertNotIn('data-hero',cover)
        self.assertIn('expo-figure',cover)
        pulmonary=next(s for s in data['scenes'] if s['id']=='regulacion-pulmonar')
        self.assertNotIn('data-visual-lab',builder.scene_html(pulmonary,data,3))

    def test_asset_hash_changes_for_css_and_transitive_dependency(self):
        with tempfile.TemporaryDirectory() as td:
            root=Path(td)
            files={
                '/exposiciones/shared/expo.css':'body { color: white; }',
                '/exposiciones/shared/experience.mjs':"import('./visual-models.mjs');",
                '/exposiciones/shared/visual-models.mjs':"import { value } from './simulator.mjs';",
                '/exposiciones/shared/simulator.mjs':'export const value = 1;',
                '/exposiciones/vendor/reveal/reveal.esm.js':'export default {};',
            }
            for path, content in files.items():
                target=root/path.lstrip('/');target.parent.mkdir(parents=True,exist_ok=True);target.write_text(content)
            css='/exposiciones/shared/expo.css';dependency='/exposiciones/shared/simulator.mjs'
            css_before=builder.asset_url(css,root=root);imports_before=builder.module_imports(root=root)
            (root/css.lstrip('/')).write_text('body { color: cyan; }')
            self.assertNotEqual(css_before,builder.asset_url(css,root=root))
            self.assertEqual(imports_before,builder.module_imports(root=root))
            (root/dependency.lstrip('/')).write_text('export const value = 2;')
            imports_after=builder.module_imports(root=root)
            self.assertNotEqual(imports_before[dependency],imports_after[dependency])
            self.assertEqual(set(imports_after),set(files)-{css})
            for path in set(imports_before)-{dependency}:
                self.assertEqual(imports_before[path],imports_after[path])

    def test_generated_html_versions_css_entry_and_complete_module_graph(self):
        shared=ROOT/'exposiciones/shared';vendor=ROOT/'exposiciones/vendor'
        modules={*shared.rglob('*.mjs'),*vendor.rglob('*.mjs'),*vendor.rglob('*.esm.js')}
        expected={f'/{p.relative_to(ROOT).as_posix()}':f'/{p.relative_to(ROOT).as_posix()}?v={hashlib.sha256(p.read_bytes()).hexdigest()[:16]}' for p in modules}
        css=shared/'expo.css';css_url=f'/exposiciones/shared/expo.css?v={hashlib.sha256(css.read_bytes()).hexdigest()[:16]}'
        pages=list((ROOT/'exposiciones').rglob('index.html'))
        self.assertEqual({p.relative_to(ROOT).as_posix() for p in pages},EXPECTED_PAGES)
        for page in pages:
            parsed=RuntimeAssets();parsed.feed(page.read_text())
            expected_styles=[css_url]
            if 'cromosomas-y-determinacion-sexual' in page.parts:
                expected_styles += [builder.asset_url('/exposiciones/shared/'+name) for name in
                                    ['genetics.css','genetics-ambient.css','genetics-layout.css']]
            self.assertEqual(parsed.styles,expected_styles,str(page))
            self.assertEqual(parsed.import_maps,[{'imports':expected}],str(page))
            self.assertEqual([s.get('type') for s in parsed.scripts],['importmap','module'],str(page))
            self.assertEqual(parsed.scripts[-1]['src'],expected['/exposiciones/shared/experience.mjs'])
        # A versioned importer still resolves ./dependency to an unversioned URL;
        # the map must intercept that normalized URL at every level of the graph.
        count=0
        for module in modules:
            parent=expected[f'/{module.relative_to(ROOT).as_posix()}']
            imports=re.findall(r'\b(?:import\s*\(\s*|from\s+|import\s+)[\'\"]([^\'\"]+)[\'\"]',module.read_text())
            for specifier in imports:
                if not specifier.startswith(('.', '/')):continue
                resolved=urljoin(f'https://vetjb.com{parent}',specifier)
                self.assertIn(urlsplit(resolved).path,expected,f'Unmapped import {specifier} in {module}')
                count+=1
        self.assertGreaterEqual(count,7)

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

    def test_academic_downloads_include_powerpoint_and_version_every_file(self):
        resources=self.content['resources']
        self.assertEqual([(Path(r['path']).suffix,r['label']) for r in resources],[
            ('.docx','Informe académico · Word'),
            ('.pptx','Presentación académica · PowerPoint'),
            ('.pdf','Informe académico · PDF'),
        ])
        expected=[{'href':f'{r["path"]}?v={hashlib.sha256((ROOT/r["path"].lstrip("/")).read_bytes()).hexdigest()[:16]}',
                   'label':r['label']} for r in resources]
        closing=next(s for s in self.content['scenes'] if s['layout']=='closing')
        rendered=Links();rendered.feed(builder.scene_html(closing,self.content,0))
        self.assertEqual(rendered.downloads,expected)
        published=Links();published.feed((ROOT/'exposiciones/fisiopatologia/equilibrio-acido-base/index.html').read_text())
        self.assertEqual(published.downloads,expected,'Regenerate the page after replacing any downloadable file.')

    def test_html_links_ids_images_and_no_remote_runtime(self):
        files=list((ROOT/'exposiciones').rglob('index.html'))
        self.assertEqual({p.relative_to(ROOT).as_posix() for p in files},EXPECTED_PAGES)
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
        self.assertEqual(len(self.content['scenes']),15)
        self.assertEqual(source.count('class="expo-scene"'),15)
        self.assertEqual(source.count('<section'),15, 'Nested sections become unintended vertical slides in reveal.js')
        self.assertIn('data-view-mode="estudiar"',source)
        self.assertIn('data-view-mode="presentar"',source)
        self.assertIn('data-motion-toggle',source)
        self.assertIn('Lectura del razonamiento completo',source)
        genetics=(ROOT/'exposiciones/genetica/index.html').read_text()
        self.assertNotIn('Todavía no hay exposiciones publicadas',genetics)
        self.assertEqual(genetics.count('data-expo-card'),1)
        self.assertIn('/exposiciones/genetica/cromosomas-y-determinacion-sexual/?modo=presentar',genetics)
        self.assertIn('/exposiciones/genetica/cromosomas-y-determinacion-sexual/?modo=estudiar',genetics)

    def test_genetics_content_citations_scope_and_downloads(self):
        data=json.loads((ROOT/'exposiciones/content/genetica--cromosomas-y-determinacion-sexual.json').read_text())
        builder.validate(data,published=True)
        self.assertEqual(len(data['scenes']),18)
        self.assertEqual(data['authors'],['Juan José Bajaña Chuno'])
        first=[]
        for scene in data['scenes']:
            self.assertTrue(scene.get('notes'),scene['id'])
            for ref in scene.get('references',[]):
                if ref not in first:first.append(ref)
        self.assertEqual(first,list(range(1,len(data['references'])+1)))
        self.assertEqual(len({r['key'] for r in data['references']}),len(data['references']))
        source=(ROOT/'exposiciones/genetica/cromosomas-y-determinacion-sexual/index.html').read_text()
        self.assertEqual(source.count('<section'),18)
        self.assertEqual(source.count('<h1>'),1)
        for acid_only in ['data-simulator','data-visual-lab=','data-hero ','Henderson','HCO₃']:
            self.assertNotIn(acid_only,source)
        self.assertIn('data-genetics-hero',source)
        self.assertIn('conceptual',source)
        self.assertNotIn('/workspace/',source)
        self.assertNotIn('sandbox:',source)
        self.assertEqual(len(data['quiz']),5)
        for question in data['quiz']:
            self.assertIn(question['correct'],range(len(question['options'])))
            self.assertTrue(question['feedback'])
        parsed=Links();parsed.feed(source)
        self.assertEqual(len(parsed.downloads),2)
        expected_hashes={
            'informe-determinacion-sexual-animal.docx':'52605524ebd3db1ddf3dc1461ac74b8008e8577b7c9b7d41a3efb79bb628cb9f',
            'presentacion-determinacion-sexual-animal.pptx':'670b86c56a6af47891374190328f0e7631f86d6968196642773e4c825b7f3d2b',
        }
        for link in parsed.downloads:
            path=urlsplit(link['href']).path
            digest=hashlib.sha256((ROOT/path.lstrip('/')).read_bytes()).hexdigest()
            self.assertEqual(digest,expected_hashes[Path(path).name])
            self.assertEqual(link['href'],path+'?v='+digest[:16])

    def test_genetics_renderer_is_scoped_to_its_lesson(self):
        data=json.loads((ROOT/'exposiciones/content/genetica--cromosomas-y-determinacion-sexual.json').read_text())
        scene=next(s for s in data['scenes'] if s['id']=='cruces-cromosomicos')
        self.assertIn('data-genetics-lab',builder.scene_html(scene,data,3))
        unrelated=dict(data,slug='otra-leccion')
        self.assertNotIn('data-genetics-lab',builder.scene_html(scene,unrelated,3))

    def test_genetics_widget_sources_are_numbered_and_cannot_be_orphaned(self):
        data=json.loads((ROOT/'exposiciones/content/genetica--cromosomas-y-determinacion-sexual.json').read_text())
        scene=next(s for s in data['scenes'] if s['id']=='via-ovarica')
        markup='<a class="gen-source" href="'+data['references'][2]['url']+'">Ridnik et al.</a>'
        resolved=builder.numbered_visual_sources(markup,data,scene)
        self.assertIn('href="#ref-3"',resolved)
        self.assertIn('>[3]</a>',resolved)
        with self.assertRaises(ValueError):
            builder.numbered_visual_sources(markup,data,dict(scene,references=[]))
        with self.assertRaises(ValueError):
            builder.numbered_visual_sources('<a class="gen-source" href="https://example.com/unknown">Unknown</a>',data,scene)
        source=(ROOT/'exposiciones/genetica/cromosomas-y-determinacion-sexual/index.html').read_text()
        sources=re.findall(r'<a class="gen-source" href="([^"]+)"',source)
        self.assertGreaterEqual(len(sources),6)
        self.assertTrue(all(url.startswith('#ref-') for url in sources))

if __name__=='__main__':unittest.main()

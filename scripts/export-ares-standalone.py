#!/usr/bin/env python3
"""Package the Ares lesson for direct offline use, without a web server."""
import argparse
import base64
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def data_url(path):
    types={'.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'}
    p=ROOT/path.lstrip('/')
    return 'data:'+types[p.suffix]+';base64,'+base64.b64encode(p.read_bytes()).decode()

def export(destination):
    source=(ROOT/'exposiciones/farmacologia-ii/caso-ares/index.html').read_text()
    source=re.sub(r'<script\b[^>]*>.*?</script>','',source,flags=re.S)
    styles=[]
    for path in ['exposiciones/shared/expo.css','exposiciones/shared/pharmacology.css']:
        text=(ROOT/path).read_text()
        text=re.sub(r'url\("(/assets/[^\"]+)"\)',lambda m:'url("'+data_url(m[1])+'")',text)
        styles.append(text)
    source=re.sub(r'<link rel="stylesheet"[^>]+>','',source)
    source=source.replace('</head>','<style>'+''.join(styles)+OVERRIDES+'</style></head>')
    source=re.sub(r'(/exposiciones/assets/imagenes/ares/[a-z-]+\.(?:webp|jpe?g|png))(?:\?v=[a-f0-9]+)?',lambda m:data_url(m[1]),source)
    source=source.replace('/assets/favicon.png',data_url('/assets/favicon.png'))
    source=re.sub(r'<svg class="expo-icon".*?</svg>','',source)
    source=source.replace('/exposiciones/assets/descargas/tesina-ares-farmacologia-ii-final.docx','Tesina_Ares_Farmacologia_II_final.docx').replace('/exposiciones/assets/descargas/presentacion-ares-farmacologia-ii-final.pptx','Presentacion_Ares_Farmacologia_II_final.pptx')
    source=re.sub(r'((?:Tesina|Presentacion)_Ares_Farmacologia_II_final\.(?:docx|pptx))\?v=[a-f0-9]+',r'\1',source)
    source=re.sub(r'href="(/[^\"]*)"',r'href="https://vetjb.com\1"',source)
    source=re.sub(r'<button[^>]*data-share-open[^>]*>.*?</button>','',source)
    source=source.replace('<h2>Fuentes y materiales</h2>','<h2>Fuentes y materiales</h2>')
    source=source.replace('<div class="expo-actions"><a class="expo-button" href="Tesina_', '<p class="expo-small">Para abrir los archivos descargables sin conexión, coloca el Word y el PowerPoint junto a este HTML.</p><div class="expo-actions"><a class="expo-button" href="Tesina_')
    models=(ROOT/'exposiciones/shared/pharmacology-models.mjs').read_text().replace('export function','function')
    labs=(ROOT/'exposiciones/shared/pharmacology-labs.mjs').read_text();labs=re.sub(r'^import .*?;\n','',labs);labs=labs.replace('export function','function')
    source=source.replace('</body>','<dialog id="offline-notes" class="expo-dialog"><button type="button" data-dialog-close class="expo-button">Cerrar notas</button><h2>Notas del expositor</h2><div></div></dialog><script>'+models+labs+RUNTIME+'</script></body>')
    destination.parent.mkdir(parents=True,exist_ok=True);destination.write_text(source)
    print(destination)

OVERRIDES='''
body[data-exposition="caso-ares"][data-mode="presentar"] {height:auto;overflow:auto;}
body[data-exposition="caso-ares"][data-mode="presentar"] #expo-deck {position:relative;top:auto;bottom:auto;height:auto;width:100%;font-size:24px;margin-top:var(--expo-toolbar-height);margin-bottom:70px;}
body[data-exposition="caso-ares"][data-mode="presentar"] #expo-deck .expo-scene {height:auto;min-height:calc(100dvh - var(--expo-toolbar-height) - 60px);padding:28px 5vw;}
body[data-exposition="caso-ares"][data-mode="presentar"] .expo-scene:not(.offline-active){display:none!important;}
body[data-exposition="caso-ares"][data-mode="presentar"] .expo-scene-heading h2 {font-size:clamp(30px,3.2vw,46px);}
body[data-exposition="caso-ares"][data-mode="presentar"] .expo-scene[data-layout="cover"] h2{font-size:clamp(36px,4.2vw,60px);}
body[data-exposition="caso-ares"][data-mode="presentar"] .expo-lead {font-size:clamp(18px,2vw,26px);}
body[data-exposition="caso-ares"][data-mode="presentar"] .expo-points{font-size:clamp(18px,2vw,25px);}
body[data-exposition="caso-ares"][data-mode="presentar"] .expo-cover-layout .expo-figure img{max-height:310px;}
body[data-exposition="caso-ares"][data-mode="presentar"] .expo-case-data{font-size:clamp(16px,1.8vw,23px);}
body[data-exposition="caso-ares"][data-mode="presentar"] .expo-comparison p{font-size:clamp(17px,1.9vw,24px);}
body[data-exposition="caso-ares"][data-mode="presentar"] .expo-comparison h3{font-size:clamp(21px,2.1vw,28px);}
body[data-exposition="caso-ares"][data-mode="presentar"] .pharma-dose,body[data-exposition="caso-ares"][data-mode="presentar"] .pharma-mechanism,body[data-exposition="caso-ares"][data-mode="presentar"] .pharma-weight{font-size:clamp(17px,1.9vw,24px);}
body[data-exposition="caso-ares"][data-mode="presentar"] .pharma-photos img{height:210px;}
body[data-exposition="caso-ares"] .pharma-mechanism-flow {line-height:1.4;}
body[data-exposition="caso-ares"][data-mode="estudiar"] .notes{display:none;}
@media print {body[data-exposition="caso-ares"] .expo-scene:not(.offline-active){display:block!important;}body[data-exposition="caso-ares"] #expo-deck{margin:0!important;}body[data-exposition="caso-ares"] .expo-toolbar,body[data-exposition="caso-ares"] .expo-navigation{display:none!important;}}
'''

RUNTIME=r'''
const body=document.body,scenes=[...document.querySelectorAll('.expo-scene')];
let index=0,questionIndex=0;
function measure(){const t=document.querySelector('.expo-toolbar');body.style.setProperty('--expo-toolbar-height',`${Math.ceil(t.getBoundingClientRect().height)}px`);}
function showScene(i){index=Math.max(0,Math.min(scenes.length-1,i));scenes.forEach((s,j)=>s.classList.toggle('offline-active',j===index));document.querySelector('[data-progress]').textContent=`${index+1} / ${scenes.length}`;if(body.dataset.mode==='presentar')window.scrollTo(0,0);try{history.replaceState(null,'','#'+scenes[index].id);}catch{};}
function setMode(mode){body.dataset.mode=mode;document.querySelectorAll('[data-view-mode]').forEach(a=>a.setAttribute('aria-current',String(a.dataset.viewMode===mode)));showScene(index);refreshQuestions();measure();if(mode==='estudiar')scenes[index].scrollIntoView({block:'start'});}
document.querySelectorAll('[data-view-mode]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();setMode(a.dataset.viewMode);}));
document.querySelectorAll('[data-prev]').forEach(b=>b.addEventListener('click',()=>showScene(index-1)));
document.querySelectorAll('[data-next]').forEach(b=>b.addEventListener('click',()=>showScene(index+1)));
document.querySelectorAll('[data-theme-toggle]').forEach(b=>b.addEventListener('click',()=>{body.dataset.theme=body.dataset.theme==='light'?'dark':'light';document.querySelectorAll('[data-theme-toggle]').forEach(x=>x.querySelector('[data-control-label]').textContent=body.dataset.theme==='light'?'Tema oscuro':'Tema claro');}));
document.querySelectorAll('[data-dialog-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
document.querySelectorAll('[data-index-open]').forEach(b=>b.addEventListener('click',()=>document.getElementById('expo-index').showModal()));
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const target=document.getElementById(a.getAttribute('href').slice(1));if(!target)return;const scene=target.closest('.expo-scene');if(!scene)return;e.preventDefault();showScene(scenes.indexOf(scene));a.closest('dialog')?.close();if(target.id.startsWith('ref-'))setMode('estudiar');if(body.dataset.mode==='estudiar')target.scrollIntoView({block:'start'});}));
document.querySelectorAll('[data-enlarge]').forEach(b=>b.addEventListener('click',()=>{const d=document.getElementById('expo-figure'),im=d.querySelector('img');im.src=b.dataset.src;im.alt=b.dataset.alt;d.showModal();}));
document.querySelector('[data-speaker]')?.addEventListener('click',()=>{const d=document.getElementById('offline-notes');d.querySelector('div').textContent=scenes[index].querySelector('.notes')?.textContent||'';d.showModal();});
document.querySelector('[data-fullscreen]')?.addEventListener('click',()=>{document.documentElement.requestFullscreen?.().catch(()=>{});});
document.addEventListener('keydown',e=>{if(body.dataset.mode!=='presentar'||document.querySelector('dialog[open]')||/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName))return;if(['ArrowRight','PageDown'].includes(e.key)){e.preventDefault();showScene(index+1);}if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();showScene(index-1);}});
const questions=[...document.querySelectorAll('[data-question]')];
function refreshQuestions(){questions.forEach((q,i)=>q.hidden=body.dataset.mode==='presentar'&&i!==questionIndex);document.querySelector('[data-quiz-position]').textContent=`${questionIndex+1} / ${questions.length}`;}
document.querySelector('[data-quiz-prev]')?.addEventListener('click',()=>{questionIndex=Math.max(0,questionIndex-1);refreshQuestions();});
document.querySelector('[data-quiz-next]')?.addEventListener('click',()=>{questionIndex=Math.min(questions.length-1,questionIndex+1);refreshQuestions();});
questions.forEach(q=>{const feedback=q.querySelector('[data-feedback]'),original=feedback.textContent;q.addEventListener('change',()=>{feedback.hidden=true;});q.querySelector('[data-question-check]').addEventListener('click',()=>{const selected=q.querySelector('input:checked');feedback.hidden=false;feedback.textContent=selected?((selected.value===q.dataset.answer?'Correcto. ':'Revisa tu respuesta. ')+original):'Selecciona una respuesta antes de comprobar.';feedback.dataset.correct=String(selected?.value===q.dataset.answer);});});
document.querySelector('[data-quiz]')?.addEventListener('reset',()=>{questions.forEach(q=>q.querySelector('[data-feedback]').hidden=true);questionIndex=0;refreshQuestions();});
initializePharmacologyLabs(document);
const fragment=document.getElementById(location.hash.slice(1))?.closest('.expo-scene');if(fragment)index=scenes.indexOf(fragment);
setMode(new URLSearchParams(location.search).get('modo')==='presentar'?'presentar':'estudiar');window.addEventListener('resize',measure);
'''
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('destination',type=Path);args=p.parse_args();export(args.destination)

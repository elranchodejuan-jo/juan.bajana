#!/usr/bin/env python3
"""Static 16:9 PDF from the canonical exposition JSON and original SVG figures.

Reproduce from repository root: python scripts/export-expo-pdf.py
Optional arguments: --source path --assets path --output path --font-dir path --workdir path
Needs reportlab, DejaVu Sans TTF, Node and sharp for SVG rendering.
Uses CODEX_PRIMARY_RUNTIME_NODE / CODEX_PRIMARY_RUNTIME_NODE_MODULES when set.
"""
from pathlib import Path
import argparse, json, math, os, subprocess, html, tempfile, atexit, shutil
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.utils import ImageReader

ROOT=Path(__file__).resolve().parent.parent
ap=argparse.ArgumentParser()
ap.add_argument('--source',type=Path,default=ROOT/'exposiciones/content/fisiopatologia--equilibrio-acido-base.json')
ap.add_argument('--assets',type=Path,default=ROOT/'exposiciones/assets/figuras')
ap.add_argument('--output',type=Path,default=ROOT/'exposiciones/assets/descargas/equilibrio-acido-base.pdf')
ap.add_argument('--font-dir',type=Path,default=Path('/usr/share/fonts/truetype/dejavu'))
ap.add_argument('--workdir',type=Path,default=None)
args=ap.parse_args()
d=json.loads(args.source.read_text())
# Normalize the canonical web representation without adding a second content file.
d['authors']=[{'name':a} if isinstance(a,str) else a for a in d['authors']]
if isinstance(d['quiz'],list):
 d['quiz']={'questions':[{'id':'question-'+str(i+1),'prompt':q['question'],
  'options':[{'id':chr(97+j),'text':o,'correct':j==q['correct'],'feedback':''} for j,o in enumerate(q['options'])],
  'feedback':q.get('feedback',''),'references':q.get('references',[])} for i,q in enumerate(d['quiz'])]}
embedded=[dict(s['case']) for s in d['scenes'] if isinstance(s.get('case'),dict)]
if embedded:
 for case in embedded:
  if isinstance(case['values'],dict):
   vals=case['values']
   if case.get('baseline'): vals={k:v for k,v in vals.items() if 'actual' in k}
   case['values']=[{'label':k,'value':v,'unit':''} for k,v in vals.items()]
  if case['options'] and 'label' in case['options'][0]:
   case['options']=[{'id':chr(97+i),'text':o['label'],'correct':i==case['correct'],'feedback':o['feedback']} for i,o in enumerate(case['options'])]
  for i,step in enumerate(case['steps']):
   if not step['title'][:1].isdigit():step['title']=str(i+1)+'. '+step['title']
 d['cases']=embedded
args.output.parent.mkdir(parents=True,exist_ok=True)
TMP=args.workdir or Path(tempfile.mkdtemp(prefix='vetjb-expo-pdf-'))
TMP.mkdir(parents=True,exist_ok=True)
if args.workdir is None:atexit.register(shutil.rmtree,TMP,ignore_errors=True)
for nm,file in [('Body','DejaVuSans.ttf'),('Bold','DejaVuSans-Bold.ttf')]:
 pdfmetrics.registerFont(TTFont(nm,str(args.font_dir/file)))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='Bold',italic='Body',boldItalic='Bold')
# Render originals from SVG at 2x. This avoids any dependence on prior PNG previews.
node=os.environ.get('CODEX_PRIMARY_RUNTIME_NODE','node')
modules=os.environ.get('CODEX_PRIMARY_RUNTIME_NODE_MODULES','')
js=r'''const fs=require('fs');const path=require('path');const sharp=require(process.argv[1]?path.join(process.argv[1],'sharp'):'sharp');
(async()=>{for(const n of ['bicarbonato','pulmon','renal']){const s=fs.readFileSync(path.join(process.argv[2],n+'.svg'),'utf8').replace('class="diagram"','class="diagram" data-theme="light"');await sharp(Buffer.from(s),{density:192}).png().toFile(path.join(process.argv[3],n+'.png'));}})().catch(e=>{console.error(e);process.exit(1)});'''
subprocess.run([node,'-e',js,modules,str(args.assets),str(TMP)],check=True)

W,H=960,540
M=40
INK=HexColor('#15384D');ACC=HexColor('#086D95');MUTED=HexColor('#456277');PALE=HexColor('#EAF5FA');RULE=HexColor('#B7D4E1')
c=canvas.Canvas(str(args.output),pagesize=(W,H),pageCompression=1)
c.setTitle(d['title']+' - Respaldo estático')
c.setAuthor(', '.join(a['name'] for a in d['authors']))
c.setSubject('Exposición educativa veterinaria. Versión estática con soluciones y referencias.')
PAGE=0
BOUNDS=[]

def norm(v): return str(v).replace('\u2011','-').replace('\u2013','-').replace('\u2014','-')
def esc(v): return html.escape(norm(v))
def para(v,x,y,w,size=17,bold=False,color=INK,leading=None,gap=10,allow_bottom=43):
 st=ParagraphStyle('p',fontName='Bold' if bold else 'Body',fontSize=size,leading=leading or size*1.3,textColor=color,spaceAfter=0,allowWidows=0,allowOrphans=0)
 p=Paragraph(esc(v).replace('\n','<br/>'),st)
 _,h=p.wrap(w,H)
 if y-h<allow_bottom: raise RuntimeError(f'Page {PAGE}: text overflow {y-h:.1f}: {v[:100]}')
 p.drawOn(c,x,y-h)
 BOUNDS.append((PAGE,x,y-h,w,h))
 return y-h-gap

def rawpara(v,x,y,w,size=14,color=INK,gap=8):
 st=ParagraphStyle('raw',fontName='Body',fontSize=size,leading=size*1.25,textColor=color,splitLongWords=1)
 p=Paragraph(v,st);_,h=p.wrap(w,H)
 if y-h<43:raise RuntimeError(f'Page {PAGE}: raw overflow')
 p.drawOn(c,x,y-h);return y-h-gap

def start(title,refs=(),label=''):
 global PAGE
 if PAGE:c.showPage()
 PAGE+=1
 c.setFillColor(white);c.rect(0,0,W,H,fill=1,stroke=0)
 c.setStrokeColor(RULE);c.setLineWidth(.6);c.line(M,35,W-M,35)
 c.setFont('Body',9);c.setFillColor(MUTED)
 c.drawString(M,18,label or 'VETJB · Fisiopatología · Respaldo estático')
 c.drawRightString(W-M,18,f'{PAGE:02d} / 20')
 if refs:c.drawCentredString(W/2,18,'Referencias: '+', '.join(map(str,refs)))
 return para(title,M,H-32,W-2*M,28,True,gap=22)

def table(values,x,y,widths,size=16,row_pad=10):
 st=ParagraphStyle('cell',fontName='Body',fontSize=size,leading=size*1.25,textColor=INK)
 head=ParagraphStyle('head',parent=st,fontName='Bold',textColor=white)
 cells=[[Paragraph(esc(v),head if r==0 else st) for v in row] for r,row in enumerate(values)]
 t=Table(cells,colWidths=widths,hAlign='LEFT')
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),INK),('ROWBACKGROUNDS',(0,1),(-1,-1),[PALE,white]),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),12),('RIGHTPADDING',(0,0),(-1,-1),12),('TOPPADDING',(0,0),(-1,-1),row_pad),('BOTTOMPADDING',(0,0),(-1,-1),row_pad),('LINEBELOW',(0,0),(-1,0),1,white)]))
 _,h=t.wrap(sum(widths),H)
 if y-h<43:raise RuntimeError(f'Page {PAGE}: table overflow {y-h:.1f}')
 t.drawOn(c,x,y-h)
 return y-h-15

def bullets(items,x,y,w,size=18):
 for v in items:
  y=para('• '+v,x,y,w,size,gap=13)
 return y

def comparison(s):
 y=start(s['title'],s['references'])
 y=para(s['summary'],M,y,880,20,color=ACC,gap=22)
 y=table([['Proceso','Mecanismo o significado']]+[[q.get('label',q.get('title','')),q['text']] for q in s['comparison']],M,y,([320,560] if s['id']=='compensacion-mixtos' else [282,598]),18,13)
 y=para(s['explanation'],M,y-9,880,17,gap=14)
 # Additional bullets supply directions not contained in the comparison rows.
 if s['id'] in ('trastornos-metabolicos','trastornos-respiratorios'):
  para('  '.join(s['bullets'][:2]),M,y,880,17,True,color=ACC)

sc={s['id']:s for s in d['scenes']}
# 1. Cover and question.
s=sc['inicio'];y=start(d['title'],s['references'])
y=para(d['subjectLabel']+' · '+d['audience'],M,y,880,18,color=MUTED,gap=35)
y=para(s['bullets'][0],M,y,880,29,True,color=ACC,gap=28)
y=para(s['summary'],M,y,880,21,gap=18)
y=para(s['explanation'],M,y,880,18,gap=25)
y=para(' · '.join(d['authors'][0].get(k,'') for k in ['name','role','affiliation'] if d['authors'][0].get(k)),M,y,880,15,color=MUTED,gap=12)
para('Versión estática. Incluye escenarios calculados, soluciones de casos y autoevaluación. Revisión: '+d['reviewedOn']+'.',M,y,880,14,color=MUTED)
# 2. Distinctions.
comparison(sc['ph-y-procesos'])
# 3-5. Figures from original SVG assets.
for key,asset in [('bicarbonato-co2','bicarbonato'),('regulacion-pulmonar','pulmon'),('regulacion-renal','renal')]:
 s=sc[key];y=start(s['title'],s['references'])
 c.drawImage(ImageReader(str(TMP/(asset+'.png'))),32,73,width=510,height=340,preserveAspectRatio=True,mask='auto')
 yy=para(s['summary'],568,411,352,18,True,color=ACC,gap=22)
 yy=para(s['explanation'],568,yy,352,16.4,gap=18)
 if key=='bicarbonato-co2':
  para('La relación 20:1 corresponde a HCO₃⁻ frente a CO₂ disuelto, no frente a PCO₂.',568,yy,352,15.5,color=MUTED)
# 6-8. Mechanisms and response.
for key in ['trastornos-metabolicos','trastornos-respiratorios','compensacion-mixtos']:comparison(sc[key])
# 9. Ordered gasometry.
s=sc['lectura-gasometria'];y=start(s['title'],s['references'])
y=para(s['summary'],M,y,880,20,color=ACC,gap=25)
y1=y
for i,v in enumerate(s['steps']):y1=para(str(i+1)+'. '+v,M,y1,406,18,gap=18)
para(s['explanation'],492,y,428,17,gap=10)
# 10. Static formula, domain and limits.
s=sc['simulador'];sim=d['simulator'];y=start('Modelo de Henderson-Hasselbalch',s['references'])
y=para(sim['formula'],M,y,880,25,True,color=ACC,gap=20)
y=table([['Entrada','Unidad','Límites del ejercicio','Punto inicial']]+[[i['label'],i['unit'],str(i['min'])+' a '+str(i['max']),str(i['default'])] for i in sim['inputs']],M,y,[180,180,280,240],16,9)
y=para(s['explanation'],M,y,880,16.2,gap=14)
para(sim['notice']+'.',M,y,880,16,True,color=ACC)
# 11. All static scenarios, independently calculated from model inputs.
y=start('Escenarios estáticos del modelo',sim['references'])
y=para('El pH mostrado es una salida calculada. HCO₃⁻ en mmol/L y PCO₂ en mmHg.',M,y,880,18,color=ACC,gap=16)
rows=[['Escenario','HCO₃⁻','PCO₂','pH calculado']]
for p in sim['presets']:
 ph=sim['constants']['pK']+math.log10(p['bicarbonate']/(sim['constants']['co2Solubility']*p['pco2']))
 assert abs(ph-p['expectedPh'])<=sim['testTolerance']['calculationAbsolute']
 rows.append([p['label'],str(p['bicarbonate']),str(p['pco2']),f'{ph:.2f}'.replace('.',',')])
y=table(rows,M,y,[440,145,145,150],16,8)
y=para(sim['limits'],M,y,880,14.2,gap=10)
# 12-15. Case facts then full solutions, source order retained.
for n,case in enumerate(d['cases'],1):
 y=start(f'Caso {n}. '+case['title'],case['references'])
 left_y=para(case['species']+' · '+case['age']+' · '+case['status'],M,y,430,15,True,color=ACC,gap=12)
 left_y=para(case['history'],M,left_y,430,16.6,gap=12)
 left_y=para('Muestra: '+case['sample'],M,left_y,430,15.2,color=MUTED,gap=12)
 if case.get('baseline'):
  rows=[['Variable','Previa','Actual']]
  for base,val in zip(case['baseline'],case['values']):rows.append([val['label'].replace(' actual',''),str(base['value']).replace('.',',')+' '+base['unit'],str(val['value']).replace('.',',')+' '+val['unit']])
  yy=table(rows,502,y,[130,144,144],15.5,10)
 else:
  yy=table([['Variable','Resultado']]+[[v['label'],str(v['value']).replace('.',',')+' '+v['unit']] for v in case['values']],502,y,[145,273],15.5,7)
 yy=min(left_y,yy)-6
 yy=para(case['question'],M,yy,880,18,True,gap=13)
 for o in case['options']:yy=para(o['id'].upper()+') '+o['text'],M,yy,880,15.3,gap=8)
 # All data and framing remain explicit; no printed control implies interactivity.
 y=start(f'Caso {n}. Solución razonada',case['references'])
 yl=y
 for step in case['steps']:
  yl=para(step['title'],M,yl,432,16,True,color=ACC,gap=3)
  yl=para(step['text'],M,yl,432,14.5,leading=18.5,gap=8)
 yr=para('Alcance del criterio',510,y,410,16.5,True,color=ACC,gap=8)
 yr=para(case['criterion'],510,yr,410,14.2,gap=16)
 for o in case['options']:
  status='Correcta' if o['correct'] else 'Incorrecta'
  yr=para(o['id'].upper()+') '+status,510,yr,410,15.5,True,color=ACC,gap=5)
  yr=para(o['feedback'],510,yr,410,14.2,gap=12)
# 16-18. Five questions, every option and its reasoning.
qs=d['quiz']['questions']
def quiz_question(q,idx,x,y,w):
 y=para(str(idx)+'. '+q['prompt'],x,y,w,18.3,True,gap=17)
 for o in q['options']:
  status='Correcta' if o['correct'] else 'Incorrecta'
  y=para(o['id'].upper()+') '+o['text']+' ['+status+']',x,y,w,15.5,True,color=ACC if o['correct'] else INK,gap=5)
  if o.get('feedback'):y=para(o['feedback'],x,y,w,14.5,color=MUTED,gap=14)
 if q.get('feedback'):
  y=para('Explicación de las alternativas',x,y-5,w,15.5,True,color=ACC,gap=8)
  y=para(q['feedback'],x,y,w,14.5,color=MUTED,gap=14)
 return y
for pair in [(0,1),(2,3),(4,)]:
 refs=sorted({r for i in pair for r in qs[i]['references']})
 y=start('Autoevaluación - soluciones',refs)
 quiz_question(qs[pair[0]],pair[0]+1,M,y,412)
 if len(pair)==2:quiz_question(qs[pair[1]],pair[1]+1,508,y,412)
 else:
  s=sc.get('conclusiones',sc['autoevaluacion']);yy=para('Conclusiones',508,y,412,23,True,color=ACC,gap=22)
  yy=bullets(s['bullets'],508,yy,412,20)
  para(s['summary'],508,yy-8,412,18,color=MUTED)
# 19-20. Vancouver citations and clickable full URLs.
refs=d['references']
for batch_i,batch in enumerate([refs[:6],refs[6:]],1):
 y=start(f'Referencias ({batch_i}/2)',label='VETJB · Fuentes de consulta y alcance veterinario')
 for ref in batch:
  y=para(str(ref['id'])+'. '+ref['citation'],M,y,880,13.9,gap=5)
  url=ref['url'];y=rawpara('<link href="'+html.escape(url,quote=True)+'" color="#086D95">'+html.escape(url)+'</link>',M,y,880,12.3,gap=15)
assert PAGE==20,PAGE
c.save()
# Exact output and scene coverage check written outside the public output folder.
(TMP/'manifest.json').write_text(json.dumps({'pages':PAGE,'source':str(args.source),'figures':['bicarbonato.svg','pulmon.svg','renal.svg'],'case_ids':[x['id'] for x in d['cases']],'question_ids':[x['id'] for x in qs],'reference_ids':[x['id'] for x in refs],'output':str(args.output)},ensure_ascii=False,indent=2))
print(str(args.output),f'({PAGE} páginas)')

"""Capture synchronized local 3/6 homepage views and a phone-sized cast gallery."""
from pathlib import Path
import base64,io,json,subprocess
from PIL import Image,ImageDraw,ImageFont
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent;output=root/'artifacts/crowd-six';output.mkdir(parents=True,exist_ok=True)
frames=Path('/tmp/crowd-gait/six-phone-frames');frames.mkdir(exist_ok=True)
fontfile='/System/Library/AssetsV2/com_apple_MobileAsset_Font8/86ba2c91f017a3749571a82f2c6d890ac7ffb2fb.asset/AssetData/PingFang.ttc'
font=lambda n:ImageFont.truetype(fontfile,n)
title,label,small=font(30),font(24),font(19)
script="""(()=>{let next=1;const pending=new Map();window.requestAnimationFrame=cb=>{const id=next++;pending.set(id,cb);return id};window.cancelAnimationFrame=id=>pending.delete(id);window.__gaitStep=now=>{const calls=[...pending.values()];pending.clear();calls.forEach(cb=>cb(now))}})()"""
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True);captures=[]
 for mode in ['?crowd=three','']:
  context=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True);context.add_init_script(script);page=context.new_page();page.goto('http://localhost:3112/zh'+mode,wait_until='networkidle');page.wait_for_function("document.querySelector('canvas')?.dataset.walkerSource==='video-derived'");rect=page.locator('canvas').evaluate('c=>{const r=c.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,scale:1}}');captures.append((page,context.new_cdp_session(page),rect))
 for index in range(192):
  panels=[]
  for page,cdp,rect in captures:
   page.evaluate('t=>window.__gaitStep(t)',100+index*1000/24);png=cdp.send('Page.captureScreenshot',{'format':'png','clip':rect,'captureBeyondViewport':True})['data'];panel=Image.open(io.BytesIO(base64.b64decode(png))).convert('RGB')
   if index>=96:
    w,h=panel.size;nw,nh=round(w*.72),round(h*.72);panel=panel.crop(((w-nw)//2,(h-nh)//2,(w+nw)//2,(h+nh)//2))
   panels.append(panel.resize((680,490),Image.Resampling.LANCZOS))
  image=Image.new('RGB',(720,1280),'#f7f7f7');d=ImageDraw.Draw(image);d.text((24,30),'首页人群｜从三种扩充到六种',font=title,fill='#242820');d.text((24,80),'实际首页 · '+('局部放大' if index>=96 else '手机尺寸')+' · 同时钟播放',font=small,fill='#777b72');d.text((24,128),'之前 · 三种轮廓 / 一位真人',font=label,fill='#777b72');image.paste(panels[0],(20,168));d.line((24,683,696,683),fill='#dfe2d9');d.text((24,704),'现在 · 六种轮廓 / 四位真人',font=label,fill='#366d4e');image.paste(panels[1],(20,746));d.text((24,1248),'新增独立真人：短发便装、公文包、配送箱。',font=small,fill='#777b72');image.save(frames/f'{index:04}.png')
  if index==145:image.save(output/'homepage-three-to-six-phone.png')
  if index%48==0:print('homepage',index,flush=True)
 browser.close()
cast=json.loads((root/'public/walkers/cast.json').read_text());atlases=[Image.open(root/'public'/s['src'].lstrip('/')).convert('RGBA') for s in cast];calibrations=[json.loads((root/'public'/s['calibration'].lstrip('/')).read_text()) for s in cast]
for index in range(96):
 image=Image.new('RGB',(720,1280),'#f7f7f4');d=ImageDraw.Draw(image);d.text((24,25),'六种轮廓，各自走起来。',font=title,fill='#242820');d.text((24,72),'四位真人 · 外套、双肩包为程序变体',font=small,fill='#747970')
 for k,(s,a,c) in enumerate(zip(cast,atlases,calibrations)):
  x,y=20+(k%2)*350,115+(k//2)*365;d.rounded_rectangle((x,y,x+330,y+345),radius=10,fill='#eeefe9');ground=y+262;bh=205*s['height']/1.8;scale=bh/99;duration=c['cyclePeriodSourceFrames']/c['sourceFps'];cycle=(index/24)/duration;f=int(cycle*48)%48;tile=a.crop((f%8*88,f//8*140,f%8*88+88,f//8*140+140)).resize((round(88*scale),round(140*scale)),Image.Resampling.LANCZOS)
  d.line((x+15,ground,x+315,ground),fill='#c8cec2');offset=-cycle*bh*s['stride']%28
  for tick in range(12):
   tx=x+15+offset+tick*28
   if tx<x+315:d.line((tx,ground,tx,ground+5),fill='#c8cec2')
  image.paste(tile,(round(x+165-44*scale),round(ground-117*scale)),tile);d.text((x+18,y+278),s['label'],font=label,fill='#292c28');d.text((x+18,y+313),'程序服饰变体' if k in [1,2] else '独立真人步态',font=small,fill='#747970')
 d.text((24,1232),'本地原型 · 图集播放 · 尚未上线',font=small,fill='#747970');image.save(frames/f'{index+192:04}.png')
 if index==18:image.save(output/'six-walker-gallery-phone.png')
subprocess.run(['/opt/homebrew/bin/ffmpeg','-y','-loglevel','error','-framerate','24','-i',str(frames/'%04d.png'),'-c:v','libx264','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart',str(output/'homepage-three-to-six-phone.mp4')],check=True)
print('Saved phone video and gallery.',flush=True)

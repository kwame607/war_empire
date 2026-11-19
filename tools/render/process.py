import json, math, os
from PIL import Image
S='/tmp/claude-0/-home-claude/509012e9-4909-5163-a357-93a24e2ebc94/scratchpad/bake'
OUT='/home/claude/war-empire/assets/town'
os.makedirs(OUT,exist_ok=True)
K=0.6            # shipped pixels per baked pixel
PPU=40*K         # pixels per world unit in shipped assets
SIN=19/math.sqrt(16*16+19*19+16*16)
sprites={}
for n in ['farm','timber','quarry','workshop','market','library','academy','bureau','armoury','barracks','shipyard','ship','keep0','keep1','keep2','keep3']:
    im=Image.open(f'{S}/{n}.png').convert('RGBA')
    bb=im.getbbox(); ox,oy=750,1200
    tr=im.crop(bb); nw,nh=max(1,round(tr.width*K)),max(1,round(tr.height*K))
    tr=tr.resize((nw,nh),Image.LANCZOS)
    tr.save(f'{OUT}/{n}.png',optimize=True)
    sprites[n]={'w':nw,'h':nh,'ax':round((ox-bb[0])*K,1),'ay':round((oy-bb[1])*K,1)}
t=Image.open(f'{S}/terrain.png').convert('RGB'); tw,th=round(t.width*K),round(t.height*K)
t.resize((tw,th),Image.LANCZOS).save(f'{OUT}/terrain.jpg',quality=84,optimize=True)
terrain={'w':tw,'h':th,'ox':round(3500/2*K,1),'oy':round(0.56*1800*K,1)}
json.dump({'ppu':PPU,'sin':SIN,'terrain':terrain,'sprites':sprites},open('/home/claude/render/manifest.json','w'),indent=1)
print(terrain, sum(os.path.getsize(f'{OUT}/{f}') for f in os.listdir(OUT))//1024,'KB')
for k,v in sprites.items(): print(k,v)

import json
from PIL import Image
from layout import LAYOUT, SHIPS
M=json.load(open('manifest.json')); D='/home/claude/war-empire/assets/town'
t=Image.open(D+'/terrain.jpg').convert('RGBA'); ppu=M['ppu']; sin=M['sin']; ox=M['terrain']['ox']; oy=M['terrain']['oy']
items=[]
for k,(sp,sx,sd) in LAYOUT.items():
    n='keep3' if k=='keep' else sp
    items.append((sd,n,sx,sd))
for sx,sd in SHIPS: items.append((sd,'ship',sx,sd))
import sys
for sd,n,sx,sd in sorted(items):
    s=M['sprites'][n]; im=Image.open(f'{D}/{n}.png').convert('RGBA')
    x=ox+sx*ppu-s['ax']; y=oy+sd*ppu*sin-s['ay']
    t.alpha_composite(im,(round(x),round(y)))
t.convert('RGB').resize((1450,750)).save('/tmp/claude-0/-home-claude/509012e9-4909-5163-a357-93a24e2ebc94/scratchpad/r3d/comp.png')

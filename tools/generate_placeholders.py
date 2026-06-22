from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import json, math
root=Path(__file__).resolve().parents[1]
try:
    font_big=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',80)
    font_mid=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',34)
    font_sm=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',22)
except Exception:
    font_big=font_mid=font_sm=None

def save_bg(path, title):
    path.parent.mkdir(parents=True, exist_ok=True)
    w,h=1080,1920
    img=Image.new('RGB',(w,h),(5,9,12))
    d=ImageDraw.Draw(img)
    for y in range(h):
        r=int(5+18*y/h); g=int(9+15*y/h); b=int(12+10*y/h)
        d.line([(0,y),(w,y)], fill=(r,g,b))
    # stadium lights arcs
    for i in range(32):
        x=int(w*(i+0.5)/32); y=300+int(60*math.sin(i/31*math.pi))
        d.ellipse((x-8,y-8,x+8,y+8), fill=(240,216,120))
    d.arc((-160,180,w+160,700), 195, 345, fill=(150,120,40), width=4)
    d.rectangle((0,1320,w,1920), fill=(3,22,12))
    for x in range(0,w,80):
        d.line((x,1320,x+80,1920), fill=(18,70,35), width=2)
    d.rectangle((34,34,w-34,h-34), outline=(185,141,32), width=4)
    d.text((60,70), 'VALE FUTEBOL MANAGER', font=font_mid, fill=(245,245,245))
    d.text((60,112), 'GOLD EDITION', font=font_sm, fill=(245,197,59))
    d.text((60,h-100), title.upper(), font=font_sm, fill=(190,190,190))
    img.save(path, quality=86)

def save_png(path, title, kind='generic'):
    path.parent.mkdir(parents=True, exist_ok=True)
    w,h=512,512
    img=Image.new('RGBA',(w,h),(0,0,0,0))
    d=ImageDraw.Draw(img)
    d.rounded_rectangle((18,18,w-18,h-18), radius=60, fill=(8,13,18,235), outline=(221,174,55,255), width=8)
    if kind=='club':
        d.polygon([(256,70),(390,130),(360,360),(256,440),(152,360),(122,130)], fill=(15,15,15,255), outline=(245,245,245,255))
        d.text((180,210), 'CLUB', font=font_mid, fill=(245,197,59))
    elif kind=='player':
        d.ellipse((178,90,334,246), fill=(190,190,190,255))
        d.rounded_rectangle((128,260,384,430), radius=45, fill=(68,68,68,255))
        d.text((185,350), 'PLAYER', font=font_sm, fill=(245,197,59))
    elif kind=='avatar':
        d.ellipse((160,75,352,267), fill=(210,180,130,255))
        d.rounded_rectangle((96,285,416,448), radius=55, fill=(30,32,36,255))
        d.text((178,365), 'MANAGER', font=font_sm, fill=(245,197,59))
    elif kind=='flag':
        d.rectangle((80,160,432,352), fill=(40,100,80,255), outline=(245,245,245,255), width=4)
        d.text((197,235),'FLAG',font=font_mid,fill=(245,197,59))
    elif kind=='sponsor':
        d.text((128,225),'SPONSOR',font=font_mid,fill=(245,197,59))
    elif kind=='icon':
        d.ellipse((150,150,362,362), fill=(245,197,59,255))
        d.text((210,228),'UI',font=font_mid,fill=(5,9,12))
    elif kind=='competition':
        d.rectangle((210,120,302,330), fill=(245,197,59,255))
        d.ellipse((160,90,352,230), outline=(245,197,59,255), width=20)
        d.text((155,365),'CUP',font=font_mid,fill=(245,245,245))
    else:
        d.text((140,230), title[:10].upper(), font=font_mid, fill=(245,197,59))
    img.save(path)

# placeholders
items=[('avatar-generic.png','avatar','avatar'),('player-generic.png','player','player'),('staff-generic.png','staff','player'),('club-generic.png','club','club'),('league-generic.png','league','competition'),('competition-generic.png','competition','competition'),('country-flag-generic.png','flag','flag'),('sponsor-generic.png','sponsor','sponsor'),('icon-generic.png','icon','icon')]
for fname,title,kind in items:
    save_png(root/'assets/placeholders'/fname, title, kind)
save_bg(root/'assets/placeholders/background-generic.jpg','background generic')
save_bg(root/'assets/placeholders/stadium-generic.jpg','stadium generic')
# backgrounds
with open(root/'data/asset-map.json') as f: amap=json.load(f)
for key,path in amap['backgrounds'].items():
    save_bg(root/path, key.replace('-', ' '))
# icons from names
for icon in ['home','lobby','championship','tactics','sponsorship','staff','training','standings','transfers','settings','club','calendar','messages','store','finance','play-match','substitution','statistics','finish-match','back','help','notification','save','load']:
    save_png(root/f'assets/icons/{icon}.png', icon, 'icon')
# avatars
for i in range(1,13):
    save_png(root/f'assets/avatars/manager-{i:02d}.png', f'Manager {i}', 'avatar')
# clubs and competitions/countries initial placeholders at real paths
for slug, data in amap['clubs'].items():
    for field,path in data.items():
        if field=='stadium': save_bg(root/path, slug)
        else: save_png(root/path, slug, 'club')
for k,path in amap['competitions'].items():
    save_png(root/path, k, 'competition')
for k,path in amap['countries'].items():
    save_png(root/path, k, 'flag')
# players/staff santos sample
players=['joao-paulo','gil','joaquim','escobar','madson','tomas-rincon','joao-schmidt','soteldo','marcos-leonardo','angelo','lucas-lima','dodo']
for p in players: save_png(root/f'assets/players/brazil/santos/{p}.png', p, 'player')
staff=['treinador','auxiliar-01','auxiliar-02','medico','fisioterapeuta','preparador-fisico','preparador-goleiros','olheiro','diretor-comercial','analista-desempenho']
for s in staff: save_png(root/f'assets/staff/brazil/santos/{s}.png', s, 'player')
for sp in ['blaze','binance','umbro','philco','kodilar','tekbond','pixbet','one-x-bet','corr-plastik','brahma']:
    save_png(root/f'assets/sponsors/{sp}.png', sp, 'sponsor')
print('generated placeholders')

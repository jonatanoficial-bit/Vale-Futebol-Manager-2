from pathlib import Path
import json, os, re, sys, subprocess
root=Path(__file__).resolve().parents[1]
errors=[]; warnings=[]
required=['index.html','css/base.css','css/components.css','css/screens.css','js/app.js','data/asset-map.json','build/build-info.json','ASSET_GUIDE.md','ASSET_MAP.md']
for r in required:
    if not (root/r).exists(): errors.append(f'Missing required file: {r}')
try:
    amap=json.loads((root/'data/asset-map.json').read_text())
    for cat in ['fallbacks','backgrounds','clubs','competitions','countries']:
        if cat not in amap: errors.append(f'asset-map missing {cat}')
    def check_path(p, label):
        if not (root/p).exists(): warnings.append(f'Missing asset path will fallback in browser: {label}: {p}')
    for k,p in amap.get('fallbacks',{}).items():
        if not (root/p).exists(): errors.append(f'Missing fallback asset: {k}: {p}')
    for k,p in amap.get('backgrounds',{}).items(): check_path(Path(p), f'background {k}')
except Exception as e: errors.append(f'asset-map invalid: {e}')
# Build visible indicator
idx=(root/'index.html').read_text(errors='ignore')
app=(root/'js/app.js').read_text(errors='ignore')
router=(root/'js/systems/router.js').read_text(errors='ignore')
if 'build-info.json' not in app or 'build-badge' not in router+idx: errors.append('Build badge or build-info loading not found')
# no external dependencies
for p in [root/'index.html'] + list((root/'js').rglob('*.js')) + list((root/'css').rglob('*.css')):
    txt=p.read_text(errors='ignore')
    if 'http://' in txt or 'https://' in txt:
        warnings.append(f'External URL found in {p.relative_to(root)}')
# node syntax check
for p in (root/'js').rglob('*.js'):
    res=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
    if res.returncode!=0: errors.append(f'JS syntax error {p.relative_to(root)}: {res.stderr.strip()}')
print('AUDIT REPORT - Vale Futebol Manager')
print(f'Files: {sum(1 for _ in root.rglob("*"))}')
print(f'Errors: {len(errors)}')
for e in errors: print('[ERROR]', e)
print(f'Warnings: {len(warnings)}')
for w in warnings[:50]: print('[WARN]', w)
if len(warnings)>50: print(f'[WARN] plus {len(warnings)-50} more warnings')
if errors: sys.exit(1)

"""Make reviewed crop windows from source frames before local Vision segmentation."""
import argparse,json,shutil
from pathlib import Path
from PIL import Image
p=argparse.ArgumentParser();p.add_argument('--root',type=Path,required=True);p.add_argument('--id',choices=['commuter','business','courier'],required=True);a=p.parse_args()
data=Path(__file__).with_name('walker-capture-data');out=a.root/f'{a.id}-pose-crops';out.mkdir(parents=True,exist_ok=True)
for suffix in ['crop-map','refined-poses']:shutil.copyfile(data/f'{a.id}-{suffix}.json',a.root/f'{a.id}-{suffix}.json')
for name,c in json.loads((data/f'{a.id}-crop-map.json').read_text()).items():
 image=Image.open(a.root/f'{a.id}-frames'/name)
 assert image.size==(c['originalWidth'],c['originalHeight']), 'Source resolution differs from reviewed crop map'
 image.crop((c['x'],c['y'],c['x']+c['width'],c['y']+c['height'])).save(out/name)

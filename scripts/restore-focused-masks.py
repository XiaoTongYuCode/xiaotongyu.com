"""Restore reviewed Vision crop masks to source coordinates and remove background pixels.

Crop maps contain x/y/width/height/originalWidth/originalHeight. Courier's lower
body is restricted to generous pose envelopes to exclude the parked bicycle;
this only removes segmented pixels and never paints missing anatomy.
"""
import argparse,json
from pathlib import Path
import cv2,numpy as np
p=argparse.ArgumentParser();p.add_argument('--root',type=Path,required=True);p.add_argument('--id',required=True);a=p.parse_args()
root=a.root;kind=a.id;mapping=json.loads((root/f'{kind}-crop-map.json').read_text());poses=json.loads((root/f'{kind}-refined-poses.json').read_text());out=root/f'{kind}-focused-masks';out.mkdir(exist_ok=True)
for name,c in mapping.items():
 m=cv2.imread(str(root/f'{kind}-cropped-masks'/name),0)
 m=cv2.resize(m,(c['width'],c['height']));full=np.zeros((c['originalHeight'],c['originalWidth']),np.uint8)
 full[c['y']:c['y']+c['height'],c['x']:c['x']+c['width']]=m
 if kind=='courier':
  pose=poses[name];H,W=full.shape
  def point(key):
   v=pose[key];return (round(v[0]*W),round(v[1]*H))
  neck=point('neck_1_joint');rootpoint=point('root');height=round((rootpoint[1]-neck[1])*2.9)
  allowed=np.zeros_like(full);allowed[:rootpoint[1]+round(height*.03)]=255
  for side in ['left','right']:
   hip,knee,ankle=[point(f'{side}_{joint}') for joint in ['upLeg_joint','leg_joint','foot_joint']]
   cv2.line(allowed,hip,knee,255,round(height*.12));cv2.line(allowed,knee,ankle,255,round(height*.10))
   cv2.ellipse(allowed,(ankle[0]+round(height*.025),ankle[1]+round(height*.02)),(round(height*.085),round(height*.045)),0,0,360,255,-1)
  full[allowed==0]=0
 cv2.imwrite(str(out/name),full)

"""Bake one reviewed live-action side-view capture. Companion to build-walker-atlas.py."""
import argparse
import importlib.util
import json
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageFilter

spec=importlib.util.spec_from_file_location("walker_builder", Path(__file__).with_name("build-walker-atlas.py"))
builder=importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)

def main():
    p=argparse.ArgumentParser()
    for key in ["frames","masks","poses","out"]:p.add_argument("--"+key,type=Path,required=True)
    p.add_argument("--id",required=True)
    p.add_argument("--source",required=True)
    p.add_argument("--fps",type=float,required=True)
    p.add_argument("--segment-start",type=float,default=0)
    p.add_argument("--minimum-period",type=int,required=True)
    p.add_argument("--maximum-period",type=int,required=True)
    p.add_argument("--limit",type=int)
    p.add_argument("--skip",type=int,default=0)
    p.add_argument("--cleanup",choices=["pavement","none"],default="none")
    p.add_argument("--pose-envelope",action="store_true")
    p.add_argument("--preserve-carry",action="store_true")
    p.add_argument("--unconstrained-mask",action="store_true")
    p.add_argument("--ground-support",action="store_true",help="Measure visible shoe support when a bag hides ankle landmarks")
    p.add_argument("--optical-support",action="store_true",help="Recover root travel from the ground immediately below the shoes")
    p.add_argument("--seam-blend",type=int,default=0,help="Blend a small capture mismatch across the final N atlas samples")
    p.add_argument("--qa-dir",type=Path,required=True)
    args=p.parse_args();args.out.mkdir(parents=True,exist_ok=True);args.qa_dir.mkdir(parents=True,exist_ok=True)
    result=builder.normalize(args.frames,args.masks,json.loads(args.poses.read_text()),args.cleanup,args.pose_envelope,args.limit,args.skip,args.preserve_carry,not args.unconstrained_mask,args.optical_support)
    masks,feet=result[:2]
    first_source_frame=int(sorted(args.masks.glob('*.png'))[args.skip].stem)-1
    error,start,period=builder.find_cycle(masks,args.minimum_period,args.maximum_period)
    points=feet[start:start+period]
    points=sum(np.roll(points,k,axis=0)*w for k,w in [(-2,1),(-1,2),(0,3),(1,2),(2,1)])/9
    delta=np.roll(points,-1,axis=0)-points
    support=np.argmin(delta,axis=1)
    support_delta=delta[np.arange(period),support]
    ground_samples=None
    optical_samples=None
    if args.optical_support:
      registered=result[2];optical_samples=[]
      for i in range(start,start+period):
        a,b=registered[i],registered[i+1]
        roi=np.zeros_like(a);roi[477:548,28:324]=255
        roi[a<8]=0
        corners=cv2.goodFeaturesToTrack(a,maxCorners=180,qualityLevel=.008,minDistance=5,mask=roi)
        values=[];locations=[]
        if corners is not None:
          tracked,status,err=cv2.calcOpticalFlowPyrLK(a,b,corners,None,winSize=(25,25),maxLevel=3,
            criteria=(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,30,.01))
          for origin,dest,ok,error_value in zip(corners[:,0],tracked[:,0],status[:,0],err[:,0]):
            dx,dy=(dest-origin)/4
            x,y=np.round(dest).astype(int)
            if ok and error_value<25 and -9<dx<-.03 and abs(dy)<1.5 and 0<=x<352 and 0<=y<560 and b[y,x]>8:
              values.append(float(dx))
              locations.append(((origin[0]-176)/4,(origin[1]-468)/4))
        estimate=None
        if len(values)>=8:
          # Floor points below the shoes are closer to the camera. Fit local
          # planar flow, then evaluate it at the actual foot plane instead of
          # treating the nearer pixels as the actor's stride distance.
          X=np.column_stack([np.ones(len(values)),np.asarray(locations)])
          y=np.asarray(values);beta=np.linalg.lstsq(X,y,rcond=None)[0]
          residual=abs(X@beta-y);threshold=max(.12,float(np.median(residual))*3)
          valid_fit=residual<threshold
          if sum(valid_fit)>=6:beta=np.linalg.lstsq(X[valid_fit],y[valid_fit],rcond=None)[0]
          if -9<beta[0]<-.03:estimate=float(beta[0])
        elif len(values)>=3:estimate=float(np.median(values))
        optical_samples.append(estimate)
      valid=np.array([i for i,v in enumerate(optical_samples) if v is not None])
      if len(valid)<period*.6:raise ValueError(f'Ground optical flow insufficient: {len(valid)}/{period}')
      values=np.array([optical_samples[i] for i in valid])
      raw=np.interp(np.arange(period),np.r_[valid-period,valid,valid+period],np.tile(values,3))
      support_delta=sum(np.roll(raw,k)*w for k,w in [(-2,1),(-1,2),(0,3),(1,2),(2,1)])/9
    if args.ground_support:
      candidates=[]
      for mask in masks[start:start+period]:
        ys,xs=np.where(mask>170);ground=int(max(ys))
        band=mask[ground-16:ground+1]>170
        counts=np.sum(band,axis=0).astype(float)
        # The larger connected patch at sole level is the supporting shoe.
        groups=np.split(np.where(counts>0)[0],np.where(np.diff(np.where(counts>0)[0])>3)[0]+1)
        mass=max(counts[group].sum() for group in groups)
        candidates.append([float(np.average(group,weights=counts[group]))/4 for group in groups if counts[group].sum()>mass*.2])
      # Follow the same supporting shoe through double support, rather than
      # switching when the other foot happens to cover more pixels.
      previous=max(candidates[0]);trace=[]
      for i in range(period*3):
        choices=candidates[i%period]
        continuation=[x for x in choices if -9 < x-previous < 2]
        current=min(continuation,key=lambda x:abs(x-(previous-1.7))) if continuation else max(choices)
        trace.append(current);previous=current
      ground_samples=trace[-period:]
      raw=np.roll(ground_samples,-1)-ground_samples
      handover=abs(raw)>10
      normal=raw[(raw<-.1)&(raw>-10)]
      if len(normal)<period*.3:raise ValueError('Insufficient visible ground support; review source cycle')
      raw[handover]=float(np.median(normal))
      support_delta=sum(np.roll(raw,k)*w for k,w in [(-2,1),(-1,2),(0,3),(1,2),(2,1)])/9
    travel=float(-sum(support_delta))
    offsets=np.r_[0,np.cumsum(-travel/period-support_delta)]
    offsets-=np.mean(offsets[:-1])
    calibration={"source":args.source,"sourceFps":args.fps,"segmentStartSeconds":args.segment_start,
      "cycleStartFrameInSegment":start+first_source_frame,"cyclePeriodSourceFrames":period,"frameCount":48,"bodyHeight":99,
      "stridePerBodyHeight":travel/99,"rootOffsets":offsets.tolist(),"smoothedAnkles":points.tolist(),
      "supportLeg":support.tolist(),"uncorrectedSeamMeanAlphaDifference":error,
      "note":"Independent captured gait. Root support calibration uses smoothed ankle estimates; toe/heel roll is approximate."}
    if ground_samples is not None:
      calibration.update({"supportMethod":"silhouette-ground-band","groundSamples":ground_samples,
        "supportDeltas":support_delta.tolist(),"note":"Bag occludes ankles. Step distance estimated from visible sole contours; support handovers are excluded. Heel/toe roll is approximate."})
      calibration.pop('smoothedAnkles');calibration.pop('supportLeg')
    if optical_samples is not None:
      residual=raw+np.diff(offsets)+travel/period
      calibration.update({"supportMethod":"local-ground-optical-flow","measuredGroundDeltas":optical_samples,
        "supportDeltas":support_delta.tolist(),"supportResidualP95PixelsAt99Height":float(np.quantile(abs(residual),.95)),
        "note":"Root travel measured using local floor optical flow fitted to the foot plane; sparse feature gaps are interpolated. No hidden limbs are reconstructed."})
      calibration.pop('smoothedAnkles');calibration.pop('supportLeg')
    calibration['seamBlendFrames']=args.seam_blend
    (args.out/f"{args.id}-calibration.json").write_text(json.dumps(calibration,indent=2)+"\n")
    atlas=Image.new("RGBA",(704,840))
    for i in range(48):
      t=start+period*i/48;a=int(t);mix=t-a
      mask=masks[a].astype(float)*(1-mix)+masks[a+1].astype(float)*mix
      shift=float(np.interp(period*i/48,np.arange(period+1),offsets))*4
      mask=cv2.warpAffine(mask,np.float32([[1,0,shift],[0,1,0]]),(352,560))
      if args.seam_blend and i >= 48-args.seam_blend:
        fraction=(i-(48-args.seam_blend))/args.seam_blend
        weight=fraction*fraction*(3-2*fraction)
        first=cv2.warpAffine(masks[start],np.float32([[1,0,offsets[0]*4],[0,1,0]]),(352,560))
        mask=mask*(1-weight)+first*weight
      alpha=Image.fromarray(np.clip(mask,0,255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.08)).resize((88,140),Image.Resampling.LANCZOS)
      tile=Image.new('RGBA',(88,140),(83,84,80,0));tile.putalpha(alpha)
      atlas.paste(tile,((i%8)*88,(i//8)*140))
    atlas.save(args.out/f"{args.id}.webp",lossless=True,method=6)
    blurred=Image.new('L',(704,3360))
    for bank,blur in enumerate(builder.BLURS):blurred.paste(atlas.getchannel('A').filter(ImageFilter.GaussianBlur(blur)),(0,bank*840))
    blurred=blurred.resize((352,1680),Image.Resampling.LANCZOS)
    rgba=Image.new('RGBA',blurred.size,(83,84,80,0));rgba.putalpha(blurred)
    rgba.save(args.out/f"{args.id}-blurred.webp",lossless=True,method=6)
    atlas.save(args.qa_dir/f"{args.id}-atlas.png")
    print(json.dumps({"id":args.id,"start":start,"period":period,"stride":travel/99,"rootRange":float(max(offsets)-min(offsets))}),flush=True)

if __name__=='__main__':main()

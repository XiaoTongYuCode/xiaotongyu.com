/** Small, repeatable differences in an otherwise relaxed walking cycle. */
export const WALKING_STYLES = [
  { stride: .60, clearance: 1.35, toeOff: .26, heelStrike: .11, asymmetry: .006, sway: .32, lean: 1.5, arm: .13, lag: .16 },
  { stride: .57, clearance: 1.05, toeOff: .23, heelStrike: .09, asymmetry: -.008, sway: .40, lean: .7, arm: .10, lag: .24 },
  { stride: .62, clearance: 1.55, toeOff: .28, heelStrike: .12, asymmetry: .010, sway: .26, lean: 1.1, arm: .15, lag: .08 },
  { stride: .64, clearance: 1.70, toeOff: .30, heelStrike: .12, asymmetry: -.005, sway: .34, lean: 2.0, arm: .17, lag: .19 },
  { stride: .58, clearance: 1.15, toeOff: .24, heelStrike: .10, asymmetry: .004, sway: .42, lean: .6, arm: .11, lag: .29 },
  { stride: .61, clearance: 1.40, toeOff: .27, heelStrike: .10, asymmetry: -.010, sway: .29, lean: 1.0, arm: .12, lag: .12 },
  { stride: .63, clearance: 1.65, toeOff: .29, heelStrike: .13, asymmetry: .008, sway: .36, lean: 1.7, arm: .18, lag: .21 },
  { stride: .59, clearance: 1.20, toeOff: .25, heelStrike: .10, asymmetry: -.006, sway: .31, lean: 1.2, arm: .14, lag: .32 },
] as const;

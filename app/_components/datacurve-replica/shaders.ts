export const vertexShader = `
  attribute vec2 aUv;
  attribute float aSeed;

  uniform sampler2D uTextureA;
  uniform sampler2D uTextureB;
  uniform sampler2D uFinalTexture0;
  uniform sampler2D uFinalTexture1;
  uniform sampler2D uFinalTexture2;
  uniform vec2 uTexelA;
  uniform vec2 uTexelB;
  uniform float uFlipA;
  uniform float uFlipB;
  uniform float uFinalFlip0;
  uniform float uFinalFlip1;
  uniform float uFinalFlip2;
  uniform vec4 uFinalRect0;
  uniform vec4 uFinalRect1;
  uniform vec4 uFinalRect2;
  uniform float uFinalT;
  uniform vec2 uPlaneScale;
  uniform vec2 uViewportScale;
  uniform float uFieldFade;
  uniform float uDepthStrength;
  uniform float uIntroT;
  uniform float uMorph;
  uniform float uAvoidFeather;
  uniform float uAvoidStrength0;
  uniform float uAvoidStrength1;
  uniform float uAvoidStrength2;
  uniform float uAvoidStrength3;
  uniform vec4 uAvoidRect0;
  uniform vec4 uAvoidRect1;
  uniform vec4 uAvoidRect2;
  uniform vec4 uAvoidRect3;
  uniform float uPixelRatio;
  uniform float uPointScale;
  uniform float uTime;
  uniform float uTransitionSeed;
  uniform float uLowQuality;
  uniform float uReducedMotion;
  uniform vec2 uExitAxis;
  uniform vec2 uEnterSide;
  uniform vec3 uTintA;
  uniform vec3 uTintB;
  uniform float uDepthGammaA;
  uniform float uDepthGammaB;
  uniform vec3 uFinalTint0;
  uniform vec3 uFinalTint1;
  uniform vec3 uFinalTint2;

  varying vec3 vColor;
  varying float vAlpha;

  float luma(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
  }

  float ease(float value) {
    return value * value * (3.0 - 2.0 * value);
  }

  float hash11(float value) {
    return fract(sin(value * 127.1) * 43758.5453123);
  }

  float hash21(vec2 value) {
    return fract(sin(dot(value, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise2(vec2 value) {
    vec2 i = floor(value);
    vec2 f = fract(value);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm2(vec2 value) {
    float amount = 0.0;
    float amplitude = 0.5;
    mat2 turn = mat2(1.62, 1.18, -1.18, 1.62);

    for (int i = 0; i < 3; i += 1) {
      amount += noise2(value) * amplitude;
      value = turn * value + vec2(7.13, 3.91);
      amplitude *= 0.5;
    }

    return amount;
  }

  vec2 fbmVec2(vec2 value) {
    return vec2(
      fbm2(value),
      fbm2(value + vec2(19.17, 31.41))
    ) * 2.0 - 1.0;
  }

  float rectInfluence(vec2 point, vec4 rect, float strength) {
    if (strength <= 0.001) {
      return 0.0;
    }

    vec2 rectMin = rect.xy;
    vec2 rectMax = rect.zw;
    vec2 closest = clamp(point, rectMin, rectMax);
    float distanceToRect = length(point - closest);
    float inside =
      step(rectMin.x, point.x) *
      step(point.x, rectMax.x) *
      step(rectMin.y, point.y) *
      step(point.y, rectMax.y);
    float feather = 1.0 - smoothstep(0.0, uAvoidFeather, distanceToRect);
    return max(inside, feather) * strength;
  }

  float sourceValue(vec3 color) {
    float value = luma(color);
    value = clamp((value - 0.015) * 1.08, 0.0, 1.0);
    return pow(value, 0.92);
  }

  float sobelEdge(sampler2D textureMap, vec2 uv, vec2 texel) {
    // Single-scale Sobel at the tightest possible radius (1 texel). Wider radii
    // smear the edge across multiple pixels and produce thick outlines. We also
    // subtract the local mean - this thins responses to the actual gradient peak
    // rather than its skirt, so only the crest of the edge fires strongly.
    // Low-quality mode drops the 4 corner samples (uses a 5-tap cross), which
    // cuts per-vertex texture fetches by ~44% on mobile at the cost of slightly
    // softer edge detection.
    vec2 px = texel;
    float lowQ = step(0.5, uLowQuality);
    float fullQ = 1.0 - lowQ;
    float tc = sourceValue(texture2D(textureMap, clamp(uv + px * vec2(0.0, -1.0), vec2(0.0), vec2(1.0))).rgb);
    float ml = sourceValue(texture2D(textureMap, clamp(uv + px * vec2(-1.0, 0.0), vec2(0.0), vec2(1.0))).rgb);
    float mc = sourceValue(texture2D(textureMap, uv).rgb);
    float mr = sourceValue(texture2D(textureMap, clamp(uv + px * vec2(1.0, 0.0), vec2(0.0), vec2(1.0))).rgb);
    float bc = sourceValue(texture2D(textureMap, clamp(uv + px * vec2(0.0, 1.0), vec2(0.0), vec2(1.0))).rgb);
    float tl = fullQ * sourceValue(texture2D(textureMap, clamp(uv + px * vec2(-1.0, -1.0), vec2(0.0), vec2(1.0))).rgb);
    float tr = fullQ * sourceValue(texture2D(textureMap, clamp(uv + px * vec2(1.0, -1.0), vec2(0.0), vec2(1.0))).rgb);
    float bl = fullQ * sourceValue(texture2D(textureMap, clamp(uv + px * vec2(-1.0, 1.0), vec2(0.0), vec2(1.0))).rgb);
    float br = fullQ * sourceValue(texture2D(textureMap, clamp(uv + px * vec2(1.0, 1.0), vec2(0.0), vec2(1.0))).rgb);
    float gx = -tl - 2.0 * ml - bl + tr + 2.0 * mr + br;
    float gy = -tl - 2.0 * tc - tr + bl + 2.0 * bc + br;
    // Compensate for missing corner energy when lowQ - bump the cross-only
    // gradient so it triggers smoothstep at a similar threshold.
    float gradient = sqrt(gx * gx + gy * gy) * mix(1.0, 1.4, lowQ);
    // Mild Laplacian crispening - keeps the crest preference (thin lines) without
    // suppressing the long tail of subtle gradients that depth maps are full of.
    float laplacian = abs(4.0 * mc - ml - mr - tc - bc);
    float crest = gradient * (0.85 + 0.7 * laplacian);
    // Gamma curve (pow < 1) lifts low-magnitude gradients into a visible band,
    // so a barely-perceivable depth change (folds, fingers, distant geometry)
    // registers nearly as strongly as a hard silhouette.
    float boosted = pow(crest, 0.55);
    return smoothstep(0.05, 0.55, boosted);
  }

  void main() {
    vec2 uvA = vec2(aUv.x, mix(aUv.y, 1.0 - aUv.y, uFlipA));
    vec2 uvB = vec2(aUv.x, mix(aUv.y, 1.0 - aUv.y, uFlipB));
    vec4 sampleA = texture2D(uTextureA, uvA);
    vec4 sampleB = texture2D(uTextureB, uvB);
    float morphRaw = clamp(uMorph, 0.0, 1.0);
    float morph = ease(morphRaw);
    float intro = ease(clamp(uIntroT, 0.0, 1.0));
    float valueA = sourceValue(sampleA.rgb);
    float valueB = sourceValue(sampleB.rgb);
    // Per-clip depth lift: gamma < 1 lifts far/dark depth into the visible range
    // for clips that have most of their mass at high depth (far from camera).
    valueA = pow(valueA, uDepthGammaA);
    valueB = pow(valueB, uDepthGammaB);
    float value = mix(valueA, valueB, morph);

    float finalGroup = floor(hash11(aSeed * 211.13 + 9.0) * 3.0);
    float final0 = 1.0 - step(0.5, finalGroup);
    float final1 = step(0.5, finalGroup) * (1.0 - step(1.5, finalGroup));
    float final2 = step(1.5, finalGroup);
    vec2 finalUv = clamp(
      aUv + vec2(hash11(aSeed * 37.0 + 2.0) - 0.5, hash11(aSeed * 41.0 + 8.0) - 0.5) * 0.0025,
      vec2(0.0),
      vec2(1.0)
    );
    vec2 uvFinal0 = vec2(finalUv.x, mix(finalUv.y, 1.0 - finalUv.y, uFinalFlip0));
    vec2 uvFinal1 = vec2(finalUv.x, mix(finalUv.y, 1.0 - finalUv.y, uFinalFlip1));
    vec2 uvFinal2 = vec2(finalUv.x, mix(finalUv.y, 1.0 - finalUv.y, uFinalFlip2));
    vec4 sampleFinal0 = texture2D(uFinalTexture0, uvFinal0);
    vec4 sampleFinal1 = texture2D(uFinalTexture1, uvFinal1);
    vec4 sampleFinal2 = texture2D(uFinalTexture2, uvFinal2);
    vec3 finalRgb = sampleFinal0.rgb * final0 + sampleFinal1.rgb * final1 + sampleFinal2.rgb * final2;
    float finalValue = sourceValue(finalRgb);
    vec3 finalTint = uFinalTint0 * final0 + uFinalTint1 * final1 + uFinalTint2 * final2;
    vec4 finalRect = uFinalRect0 * final0 + uFinalRect1 * final1 + uFinalRect2 * final2;
    float groupDelay = hash11(aSeed * 17.0 + 4.0) * 0.15;
    float finalTravel = smoothstep(groupDelay, min(1.0, groupDelay + 0.76), clamp(uFinalT, 0.0, 1.0));
    float finalSettle = ease(finalTravel);
    value = mix(value, finalValue, finalSettle);

    float edgeA = morphRaw < 0.99 ? sobelEdge(uTextureA, uvA, uTexelA) : 0.0;
    float edgeB = morphRaw > 0.01 ? sobelEdge(uTextureB, uvB, uTexelB) : 0.0;
    float relief = mix(edgeA, edgeB, morph);
    relief = mix(relief, max(relief, finalValue * sourceValue(finalRgb)), finalSettle * 0.42);

    float clarity = smoothstep(0.035, 0.92, value);
    float presence = smoothstep(0.07, 0.22, value);
    presence = max(presence, relief * 1.2);
    float heightValue = pow(value, 1.05);
    float crest = smoothstep(0.5, 0.96, heightValue);
    float valley = 1.0 - smoothstep(0.08, 0.48, heightValue);
    float transition = sin(morphRaw * 3.14159265);
    vec2 centered = position.xy;
    float radial = length(centered * vec2(1.0, 1.14));
    float radialNorm = clamp(radial / 0.78, 0.0, 1.0);
    float randA = hash11(aSeed + aUv.x * 17.23 + aUv.y * 41.91);
    float randB = hash11(aSeed * 13.37 + aUv.x * 73.11 - aUv.y * 19.74);
    float randC = hash11(aSeed * 31.7 + aUv.x * 5.37 + aUv.y * 97.03);
    float plumeGlow = 0.0;
    float birthStart = (radialNorm * 0.28) + (randA * 0.36);
    float birth = smoothstep(birthStart, birthStart + 0.18 + randB * 0.08, intro);
    float birthEase = ease(birth);
    float coreSeed = 1.0 - step(0.0016, aSeed);
    float coreVisible = coreSeed * (1.0 - smoothstep(0.02, 0.27, intro));
    float seedWave = sin((aSeed * 44.0) + (uTime * 0.58));
    vec2 flow = vec2(
      sin((centered.y * 8.4) + (uTime * 0.36) + (aSeed * 5.0)),
      cos((centered.x * 7.2) - (uTime * 0.31) + (aSeed * 3.0))
    );

    float angle = (randA * 6.2831853) + (uTime * 0.16);
    vec2 seedDirection = vec2(cos(angle), sin(angle));
    vec2 radialDirection = centered / max(length(centered), 0.0001);
    vec2 tangentDirection = vec2(-radialDirection.y, radialDirection.x) * mix(-1.0, 1.0, step(0.5, randC));
    vec2 splitDirection = normalize(seedDirection * 0.92 + radialDirection * 0.42 + tangentDirection * (randB - 0.5) * 0.96);
    vec2 origin = seedDirection * (0.001 + randB * 0.003);
    float splitPhase = sin(birthEase * 3.14159265);
    float splitArc = splitPhase * (0.072 + randB * 0.15) * (1.0 - radialNorm * 0.16);
    float sidewaysDrift = sin((birthEase * 2.6 + randC * 1.8) * 3.14159265) * (0.025 + randA * 0.056);
    float tumble = sin((uTime * 1.2) + randC * 18.0) * splitPhase * (1.0 - birthEase) * 0.018;
    vec2 revealedPosition = mix(origin, centered, birthEase);
    revealedPosition += splitDirection * splitArc * (1.0 - intro * 0.28);
    revealedPosition += tangentDirection * sidewaysDrift * birth * (1.0 - birthEase * 0.82);
    revealedPosition += seedDirection * tumble;
    float depth = (heightValue - 0.5) * uDepthStrength * birthEase;
    depth += crest * 0.08 * birthEase;
    depth -= valley * 0.026 * birthEase;
    depth += (randB - 0.5) * 0.02 * smoothstep(0.08, 0.92, value) * birthEase;
    depth += transition * seedWave * 0.04 * birthEase;
    depth += (1.0 - radial) * 0.045 * birthEase;
    depth += relief * 0.075 * birthEase;

    float motionScale = 1.0 - uReducedMotion;
    vec2 silkDrift = vec2(
      sin((centered.y * 15.5) + (uTime * 0.22) + (randA * 6.2831853)),
      cos((centered.x * 13.5) - (uTime * 0.19) + (randB * 6.2831853))
    ) * (0.0018 + clarity * 0.0028) * birthEase * motionScale;
    vec2 depthParallax = vec2(0.022, -0.009) * depth;
    vec2 streamSource = (
      revealedPosition +
      flow * transition * 0.012 * birthEase +
      silkDrift +
      depthParallax
    );

    float routeSeedA = hash11(uTransitionSeed * 11.13 + 1.0);
    float routeSeedB = hash11(uTransitionSeed * 17.31 + 4.0);
    float routeSeedC = hash11(uTransitionSeed * 23.71 + 9.0);

    if (morphRaw > 0.001 && uReducedMotion < 0.5) {
    float routeMirror = mix(-1.0, 1.0, step(0.5, routeSeedA));
    float routeFlip = mix(-1.0, 1.0, step(0.5, routeSeedB));
    float routeAngle = (routeSeedC - 0.5) * 0.78;
    float routeSin = sin(routeAngle);
    float routeCos = cos(routeAngle);
    mat2 routeRotate = mat2(routeCos, routeSin, -routeSin, routeCos);

    float hasExitAxis = step(0.001, dot(uExitAxis, uExitAxis));
    float hasEnterSide = step(0.001, dot(uEnterSide, uEnterSide));
    vec2 autoExitAxis = normalize(routeRotate * vec2(routeMirror, 0.0));
    vec2 departAxis = normalize(mix(autoExitAxis, uExitAxis, hasExitAxis));
    vec2 routeSide = vec2(-departAxis.y, departAxis.x) * routeFlip;
    vec2 autoEnterSide = normalize(-departAxis);
    vec2 enterSide = normalize(mix(autoEnterSide, uEnterSide, hasEnterSide));
    float turnWidth = mix(0.16, 0.27, routeSeedB);
    float laneY = mix(0.12, 0.22, routeSeedC);
    float departureNoise = fbm2(centered * vec2(4.2, 5.6) + vec2(routeSeedA * 8.0 + uTime * 0.025, routeSeedB * 5.0));
    float arrivalNoise = fbm2(centered * vec2(6.1, 4.7) + enterSide * 1.7 + vec2(routeSeedC * 6.0, routeSeedA * 4.0 - uTime * 0.035));
    float departurePocket = fbm2(aUv * vec2(11.0, 15.0) + vec2(routeSeedB * 9.0 - uTime * 0.04, routeSeedC * 6.0));
    float arrivalPocket = fbm2(aUv * vec2(14.0, 10.0) + vec2(routeSeedA * 7.0 + uTime * 0.03, routeSeedB * 5.0));
    float departureChaos = fbm2(aUv * vec2(26.0, 19.0) + centered * 5.0 + vec2(routeSeedC * 11.0, routeSeedA * 9.0 - uTime * 0.085));
    float arrivalChaos = fbm2(aUv * vec2(22.0, 28.0) - centered * 4.0 + vec2(routeSeedB * 10.0 + uTime * 0.07, routeSeedC * 12.0));
    float departureSpeckle = hash11(aSeed * 149.0 + floor(departurePocket * 6.0) * 13.0 + routeSeedA * 41.0);
    float arrivalSpeckle = hash11(aSeed * 173.0 + floor(arrivalPocket * 7.0) * 17.0 + routeSeedC * 37.0);
    float departureOrder = clamp(
      departureNoise * 0.23 +
        departurePocket * 0.29 +
        departureChaos * 0.24 +
        departureSpeckle * 0.21 +
        radialNorm * 0.04 +
        dot(centered, departAxis) * 0.04 -
        0.05,
      0.0,
      1.0
    );
    float arrivalOrder = clamp(
      arrivalNoise * 0.24 +
        arrivalPocket * 0.28 +
        arrivalChaos * 0.25 +
        arrivalSpeckle * 0.21 +
        (1.0 - radialNorm) * 0.04 -
        dot(centered, enterSide) * 0.03 -
        0.04,
      0.0,
      1.0
    );
    float departStart = departureOrder * 0.46;
    float departWidth = mix(0.16, 0.34, departureChaos);
    float departProgress = smoothstep(departStart, departStart + departWidth, morphRaw);
    float arrivalSpan = mix(0.29, 0.39, max(routeSeedB, arrivalChaos));
    float arriveStart = 0.35 + arrivalOrder * (0.72 - arrivalSpan);
    float arriveProgress = smoothstep(arriveStart, arriveStart + arrivalSpan, morphRaw);
    float revealNoise = fbm2(aUv * vec2(12.0, 8.6) + vec2(routeSeedA * 5.0 - uTime * 0.045, routeSeedC * 7.0));
    float arrivalBreakup = (arrivalNoise - 0.5) * 0.36 + (arrivalChaos - 0.5) * 0.34 + (randA - 0.5) * 0.16;
    float cloudyArrive = clamp(
      arriveProgress +
        (arrivalBreakup + (revealNoise - 0.5) * 0.32) * sin(arriveProgress * 3.14159265),
      0.0,
      1.0
    );
    float settleEase = ease(cloudyArrive);
    float cloudLife = smoothstep(0.03, 0.62, cloudyArrive) * (1.0 - smoothstep(0.72, 1.0, cloudyArrive));
    float pathEnd = 0.56 + arrivalOrder * 0.2 + arrivalChaos * 0.16;
    float streamPhase = smoothstep(departStart, max(departStart + 0.001, pathEnd), morphRaw);
    streamPhase = clamp(streamPhase + (randC - 0.5) * 0.08 * (1.0 - cloudyArrive) + (departureChaos - 0.5) * 0.05, 0.0, 1.0);
    vec2 routePoint = vec2(0.0);
    vec2 routeTangent = vec2(1.0, 0.0);

    if (streamPhase < 0.37) {
      float q = streamPhase / 0.37;
      routePoint = vec2(mix(-0.5, 0.16, q), -laneY);
      routeTangent = vec2(1.0, 0.0);
    } else if (streamPhase < 0.69) {
      float q = (streamPhase - 0.37) / 0.32;
      float angle = -1.5707963 + q * 3.14159265;
      routePoint = vec2(0.16 + cos(angle) * turnWidth, sin(angle) * laneY);
      routeTangent = normalize(vec2(-sin(angle) * turnWidth, cos(angle) * laneY));
    } else {
      float q = (streamPhase - 0.69) / 0.31;
      routePoint = vec2(mix(0.16, -0.5, q), laneY);
      routeTangent = vec2(-1.0, 0.0);
    }

    vec2 localRoutePoint = routePoint;
    vec2 localRouteTangent = routeTangent;
    routePoint = departAxis * localRoutePoint.x + routeSide * localRoutePoint.y;
    routeTangent = normalize(departAxis * localRouteTangent.x + routeSide * localRouteTangent.y);
    float routeBody = smoothstep(0.05, 0.34, streamPhase) * (1.0 - smoothstep(0.72, 1.0, streamPhase));
    vec2 routeTurbulence = fbmVec2(centered * 5.4 + vec2(routeSeedA * 6.0 + streamPhase * 4.0, routeSeedB * 8.0 - uTime * 0.04));
    vec2 routeTurbulenceFine = fbmVec2(centered * 15.0 - routePoint * 4.0 + vec2(routeSeedC * 7.0 - uTime * 0.095, routeSeedA * 5.0));
    routePoint += routeTurbulence * routeBody * (0.095 + routeSeedC * 0.13);
    routePoint += routeTurbulenceFine * routeBody * (0.035 + departureChaos * 0.055);
    vec2 routeExit = enterSide * (0.08 + randA * 0.08) * hasEnterSide;
    routeExit += routeSide * ((arrivalPocket - 0.5) * 0.62 + (arrivalChaos - 0.5) * 0.34 + (randB - 0.5) * 0.22);
    routeExit += departAxis * ((arrivalNoise - 0.5) * 0.42 + (departureChaos - 0.5) * 0.34 + (randC - 0.5) * 0.18);
    float mouthPull = smoothstep(0.5, 1.0, streamPhase) * (0.36 + hasEnterSide * 0.24);
    routePoint = mix(routePoint, routeExit, mouthPull * 0.38);
    routeTangent = normalize(mix(routeTangent, normalize(routeExit - routePoint + routeTurbulenceFine * 0.1 + vec2(0.001, -0.001)), mouthPull * 0.34));

    vec2 streamNormal = vec2(-routeTangent.y, routeTangent.x);
    float pack = departProgress * (1.0 - cloudyArrive * 0.78);
    float swarmMass = smoothstep(0.08, 0.58, morphRaw) * (1.0 - smoothstep(0.76, 1.0, morphRaw));
    float strandSeed = hash11(aSeed * 97.13 + routeSeedA * 11.0);
    float strandIndex = floor(strandSeed * 7.0);
    float strandCenter = (strandIndex - 3.0) / 3.0;
    float wake = sin(streamPhase * 25.132741 - morphRaw * 8.0 + strandIndex * 1.7 + routeSeedC * 6.2831853);
    float curlA = sin(dot(centered, vec2(17.0, 9.0)) + uTime * 0.36 + randA * 6.2831853);
    float curlB = cos(dot(centered, vec2(-8.0, 19.0)) - uTime * 0.31 + randB * 6.2831853);
    float cloudNoise = fbm2(routePoint * 4.8 + centered * 2.0 + vec2(uTime * 0.045 + routeSeedA * 3.0, routeSeedC * 4.0));
    float gasEnvelope = transition * smoothstep(0.02, 0.58, pack) * (1.0 - smoothstep(0.62, 1.0, cloudyArrive));
    vec2 gasField = fbmVec2(centered * 8.0 + routePoint * 3.7 + vec2(uTime * 0.055 + routeSeedA * 6.0, routeSeedB * 8.0));
    vec2 gasFieldFine = fbmVec2(centered * 21.0 - routePoint * 5.2 + vec2(routeSeedC * 4.0 - uTime * 0.09, routeSeedA * 3.0));
    vec2 gasFieldWild = fbmVec2(aUv * vec2(34.0, 29.0) + routePoint * 7.5 + vec2(uTime * 0.13 + routeSeedB * 11.0, routeSeedC * 9.0));
    vec2 gasDirection = normalize(gasField + vec2(randA - 0.5, randB - 0.5) + vec2(0.001, -0.001));
    float streamWidth = mix(0.004, 0.024, swarmMass);
    float laneOffset = strandCenter * mix(0.003, 0.025, swarmMass) * (0.55 + randB * 0.45);
    float sideScatter = (randB - 0.5) * streamWidth * mix(0.3, 1.35, pow(abs(randB - 0.5) * 2.0, 1.55));
    float filament = (randC - 0.5) * mix(0.24, 0.56, swarmMass);
    filament -= randA * mix(0.08, 0.28, swarmMass) * (1.0 - streamPhase);
    vec2 sourcePlane = streamSource;
    vec2 transitionStream = routePoint;
    transitionStream += streamNormal * (laneOffset + sideScatter + wake * 0.0065 * pack + (curlA + curlB) * 0.006 * pack);
    transitionStream += routeTangent * (filament + sin(uTime * 0.45 + randA * 8.0) * 0.022) * pack;
    transitionStream += (streamNormal * (cloudNoise - 0.5) + routeTangent * (arrivalNoise - 0.5)) * pack * mix(0.01, 0.052, cloudLife);
    transitionStream += vec2(curlA, curlB) * 0.014 * pack * (1.0 - cloudyArrive);
    vec2 gasCloud = routePoint;
    float gasRadius = (0.09 + randC * 0.38) * gasEnvelope * (0.65 + cloudNoise * 0.8 + arrivalChaos * 0.45);
    gasCloud += routeTangent * (filament * 0.42 + gasField.x * 0.28 + gasFieldFine.x * 0.11 + gasFieldWild.x * 0.09) * pack;
    gasCloud += streamNormal * ((randB - 0.5) * (0.18 + gasEnvelope * 0.52) + gasField.y * 0.25 + gasFieldFine.y * 0.1 + gasFieldWild.y * 0.08) * gasEnvelope;
    gasCloud += gasDirection * gasRadius;
    gasCloud += vec2(curlA, curlB) * gasEnvelope * 0.082;
    gasCloud += gasFieldWild * gasEnvelope * (0.035 + arrivalChaos * 0.055);
    transitionStream = mix(transitionStream, gasCloud, clamp(gasEnvelope * 1.18 + cloudLife * 0.32, 0.0, 1.0));
    float transitionTravelScale = 0.94;
    transitionStream = sourcePlane + (transitionStream - sourcePlane) * transitionTravelScale;
    float streamPull = pow(pack, 0.4) * (0.78 + presence * 0.08);
    streamSource = mix(sourcePlane, transitionStream, clamp(streamPull, 0.0, 0.98));
    float settleDust = cloudyArrive * (1.0 - cloudyArrive);
    vec2 dustCurl = vec2(
      sin(dot(sourcePlane, vec2(10.0, 16.0)) + uTime * 0.22 + randA * 6.2831853),
      cos(dot(sourcePlane, vec2(-15.0, 9.0)) - uTime * 0.2 + randB * 6.2831853)
    );
    vec2 settleCurl = (
      streamNormal * (wake + curlA * 0.55 + (cloudNoise - 0.5) * 1.6) +
      routeTangent * (curlB * 0.6 + randC - 0.5 + (arrivalNoise - 0.5) * 1.2) +
      dustCurl * 0.9
    ) * settleDust * mix(0.052, 0.088, gasEnvelope) * transitionTravelScale;
    streamSource = mix(streamSource, sourcePlane + settleCurl, settleEase);
    streamSource += streamNormal * sin((morphRaw + randA) * 6.2831853 + uTime * 0.42) * pack * 0.004 * transitionTravelScale;
    streamSource += (gasField * 0.022 + gasFieldFine * 0.012 + gasFieldWild * 0.016) * gasEnvelope * (1.0 - settleEase) * transitionTravelScale;
    plumeGlow = max(plumeGlow, (gasEnvelope * 0.78 + cloudLife * 0.56 + pack * 0.1) * transition * birthEase);

    float orderedInfluence = smoothstep(0.08, 0.96, transition);
    float orderedMorph = mix(morph, settleEase, orderedInfluence);
    value = mix(valueA, valueB, orderedMorph);
    value = mix(value, finalValue, finalSettle);
    relief = mix(edgeA, edgeB, orderedMorph);
    relief = mix(relief, max(relief, finalValue * sourceValue(finalRgb)), finalSettle * 0.42);
    clarity = smoothstep(0.035, 0.92, value);
    presence = smoothstep(0.07, 0.22, value);
    presence = max(presence, relief * 1.2);
    heightValue = pow(value, 1.05);
    crest = smoothstep(0.5, 0.96, heightValue);
    valley = 1.0 - smoothstep(0.08, 0.48, heightValue);
    float orderedDepth = (heightValue - 0.5) * uDepthStrength * birthEase;
    orderedDepth += crest * 0.08 * birthEase;
    orderedDepth -= valley * 0.026 * birthEase;
    orderedDepth += (randB - 0.5) * 0.02 * smoothstep(0.08, 0.92, value) * birthEase;
    orderedDepth += transition * seedWave * 0.04 * birthEase;
    orderedDepth += (1.0 - radial) * 0.045 * birthEase;
    orderedDepth += relief * 0.075 * birthEase;
    depth = mix(depth, orderedDepth, orderedInfluence * 0.78);
    }

    vec2 xy = streamSource * uPlaneScale;
    float bottomHintFade = (1.0 - smoothstep(0.0, 0.72, intro)) * (1.0 - finalSettle);
    float compactViewport = 1.0 - step(0.75, uViewportScale.x / max(uViewportScale.y, 0.0001));
    float bottomHintKeep = step(mix(0.8, 0.86, compactViewport), hash11(aSeed * 191.0 + 23.0));
    float bottomHintLife = fract(hash11(aSeed * 67.0 + 5.0) + uTime * 0.035);
    float bottomHintCycle = smoothstep(0.0, 0.16, bottomHintLife) * (1.0 - smoothstep(0.66, 1.0, bottomHintLife));
    float bottomHintAlpha = bottomHintKeep * bottomHintFade * bottomHintCycle * mix(1.0, 0.72, compactViewport);
    vec2 bottomHintFlow = fbmVec2(aUv * vec2(18.0, 9.0) + vec2(uTime * 0.055, aSeed * 0.01));
    float bottomHintRise = (
      mix(0.02, 0.012, compactViewport) +
      pow(bottomHintLife, 1.65) * mix(0.29, 0.15, compactViewport) +
      randB * mix(0.03, 0.018, compactViewport)
    ) * uViewportScale.y;
    float bottomHintSpread = mix(0.32, 0.96, smoothstep(0.02, 0.28, bottomHintRise / max(uViewportScale.y, 0.0001)));
    vec2 bottomHintXY = vec2(
      (hash11(aSeed * 83.0 + 17.0) - 0.5) * uViewportScale.x * bottomHintSpread + bottomHintFlow.x * 0.035 * uViewportScale.x,
      -uViewportScale.y * 0.5 + bottomHintRise + bottomHintFlow.y * 0.028 * uViewportScale.y
    );
    float bottomHintPosition = smoothstep(0.002, 0.035, bottomHintAlpha);
    xy = mix(xy, bottomHintXY, bottomHintPosition);
    depth = mix(depth, -0.08 + (randC - 0.5) * 0.03, bottomHintPosition);

    vec2 targetUv = finalUv;
    vec2 targetXY = vec2(
      mix(finalRect.x, finalRect.z, targetUv.x),
      mix(finalRect.w, finalRect.y, targetUv.y)
    );
    vec2 targetCenter = vec2((finalRect.x + finalRect.z) * 0.5, (finalRect.y + finalRect.w) * 0.5);
    float finalRaw = clamp(uFinalT, 0.0, 1.0);
    float finalStreamSeed = hash11(aSeed * 29.0 + 7.0);
    float finalCloudNoise = fbm2(targetUv * vec2(7.2, 5.5) + vec2(finalGroup * 2.7 + uTime * 0.035, routeSeedC * 3.0));
    float finalTravelBroken = clamp(
      finalTravel + ((finalCloudNoise - 0.5) * 0.18 + (randA - 0.5) * 0.06) * sin(finalTravel * 3.14159265),
      0.0,
      1.0
    );
    float finalGather = smoothstep(0.0, 0.31, finalRaw);
    float finalSplit = smoothstep(0.15, 0.9, finalTravelBroken);
    float sharedPhase = fract(aUv.y * 0.72 + aUv.x * 0.18 + finalStreamSeed * 0.32 + finalCloudNoise * 0.12 + finalRaw * 0.18);
    float sharedWave = sin(sharedPhase * 6.2831853 + uTime * 0.18 + finalStreamSeed * 3.0);
    vec2 sharedTangent = normalize(vec2(1.0, cos(sharedPhase * 6.2831853 + finalStreamSeed * 2.0) * 0.28));
    vec2 sharedNormal = vec2(-sharedTangent.y, sharedTangent.x);
    float sharedWidth = mix(0.12, 0.014, finalGather) * min(uPlaneScale.x, uPlaneScale.y);
    vec2 sharedStream = vec2(
      mix(-0.34, 0.34, sharedPhase) * uPlaneScale.x,
      targetCenter.y + 0.46 + sharedWave * 0.045
    );
    sharedStream += sharedNormal * (randB - 0.5) * sharedWidth;
    sharedStream += sharedTangent * (randC - 0.5) * 0.14 * min(uPlaneScale.x, uPlaneScale.y);
    vec2 branchControl = vec2(
      mix(sharedStream.x, targetCenter.x, 0.58),
      max(sharedStream.y, targetCenter.y) + 0.13 + hash11(aSeed * 43.0) * 0.06
    );
    vec2 branchA = mix(sharedStream, branchControl, finalSplit);
    vec2 branchB = mix(branchControl, targetCenter, finalSplit);
    vec2 branchCenterline = mix(branchA, branchB, finalSplit);
    vec2 branchTangent = normalize(targetCenter - sharedStream + vec2(0.0001, 0.0001));
    vec2 branchNormal = vec2(-branchTangent.y, branchTangent.x);
    float branchWidth = mix(0.075, 0.012, finalSplit) * min(uPlaneScale.x, uPlaneScale.y);
    vec2 branchStream = branchCenterline;
    branchStream += branchNormal * ((randB - 0.5) * branchWidth + sin(finalTravel * 10.0 + randA * 6.2831853) * branchWidth * 0.14);
    branchStream += branchTangent * (randC - 0.5) * 0.08 * min(uPlaneScale.x, uPlaneScale.y);
    float targetSpread = smoothstep(0.66, 1.0, finalTravelBroken);
    float finalDust = finalTravelBroken * (1.0 - finalTravelBroken);
    vec2 finalCloudCurl = vec2(
      sin(dot(targetXY, vec2(8.0, 15.0)) + uTime * 0.2 + finalStreamSeed * 6.2831853),
      cos(dot(targetXY, vec2(-13.0, 7.0)) - uTime * 0.18 + randB * 6.2831853)
    ) * finalDust * 0.055 * min(uPlaneScale.x, uPlaneScale.y);
    vec2 finalCloudTarget = targetXY + finalCloudCurl + branchNormal * (finalCloudNoise - 0.5) * finalDust * 0.055 * min(uPlaneScale.x, uPlaneScale.y);
    vec2 finalLanding = mix(branchStream, finalCloudTarget, targetSpread);
    vec2 gatheredStream = mix(xy, sharedStream, finalGather * (1.0 - finalSplit * 0.08));
    xy = mix(gatheredStream, finalLanding, finalSplit);
    plumeGlow = max(plumeGlow, finalDust * smoothstep(0.05, 0.72, finalRaw) * 0.76);
    depth = mix(depth, (finalValue - 0.5) * 0.32, finalSettle);

    // Soft per-particle dispersion during scene-to-scene morphs. transition peaks at
    // morph=0.5 (sin curve), so particles puff outward at the midpoint of a clip
    // crossfade and recohere as the new clip settles. Hides the hard brightness cut.
    {
      vec2 dispDir = normalize(vec2(randA - 0.5, randB - 0.5) + vec2(0.0001));
      // Skip dispersion during the final-gather phase - it has its own choreography.
      float dispGate = 1.0 - finalSettle;
      xy += dispDir * transition * 0.038 * dispGate * motionScale;
    }
    vec4 modelPosition = modelViewMatrix * vec4(xy, depth, 1.0);
    gl_Position = projectionMatrix * modelPosition;

    vec2 ndc = gl_Position.xy / max(gl_Position.w, 0.0001);
    vec2 screen = vec2(ndc.x * 0.5 + 0.5, 0.5 - ndc.y * 0.5);
    float avoid = 0.0;
    avoid = max(avoid, rectInfluence(screen, uAvoidRect0, uAvoidStrength0));
    avoid = max(avoid, rectInfluence(screen, uAvoidRect1, uAvoidStrength1));
    avoid = max(avoid, rectInfluence(screen, uAvoidRect2, uAvoidStrength2));
    avoid = max(avoid, rectInfluence(screen, uAvoidRect3, uAvoidStrength3));
    avoid = clamp(avoid, 0.0, 1.0);
    float motionStream = max(
      max(max(transition, bottomHintPosition * 0.62), smoothstep(0.02, 0.5, uFinalT) * (1.0 - smoothstep(0.76, 1.0, uFinalT))),
      plumeGlow
    );
    avoid *= 1.0 - motionStream * 0.72;
    float sparseKeep = smoothstep(0.22 + avoid * 0.56, 1.0, hash11(aSeed * 109.7 + 17.0));
    float quietAlpha = mix(1.0, 0.16 + sparseKeep * 0.42, avoid);
    float quietSize = mix(1.0, 0.74 + sparseKeep * 0.12, avoid);
    vec2 fieldHalf = max(uPlaneScale * 0.5, vec2(0.0001));
    float fieldEdge = max(abs(xy.x) / fieldHalf.x, abs(xy.y) / fieldHalf.y);
    float fieldFade = mix(1.0, 1.0 - smoothstep(0.76, 1.0, fieldEdge), uFieldFade);

    float camZ = max(0.72, -modelPosition.z);
    float perspective = 1.98 / camZ;
    float pointReveal = mix(0.5, 1.0, birthEase);
    float coreScale = coreVisible * 2.35;

    float grainJitter = mix(0.58, 1.18, hash11(aSeed * 17.31 + 5.0));

    float depthNear = smoothstep(3.08, 1.96, camZ);
    float depthSize = mix(0.62, 1.2, depthNear);

    float sparkleSeed = hash11(aSeed * 73.0 + 11.0);
    float sparkle = step(0.982, sparkleSeed) * smoothstep(0.66, 0.98, value);

    float finalPointScale = mix(1.0, 0.66, finalSettle);
    float motionFine = mix(1.0, 0.7, clamp(motionStream * 0.62 + plumeGlow * 0.38, 0.0, 1.0));
    gl_PointSize = uPointScale * uPixelRatio * perspective *
      ((0.34 + clarity * 0.88 + depthNear * 0.12 + relief * 0.22 + transition * 0.26 + plumeGlow * 0.32 + bottomHintPosition * 0.38) * pointReveal + coreScale) *
      quietSize * grainJitter * depthSize * mix(0.34, 1.0, presence) * (1.0 + sparkle * 0.62) * finalPointScale * motionFine;

    vec3 tint = mix(mix(uTintA, uTintB, morph), finalTint, finalSettle);
    // Neutral gray-to-tint depth ramp (was blue-tinted). With tint black, the
    // dots read essentially monochrome black against the cream background.
    vec3 farDepth = mix(vec3(0.18, 0.18, 0.18), tint, 0.55);
    vec3 midDepth = mix(tint, vec3(0.05, 0.05, 0.05), 0.28);
    vec3 nearDepth = mix(vec3(0.0, 0.0, 0.0), tint, 0.35);
    float lowToMid = smoothstep(0.05, 0.54, value);
    float midToNear = smoothstep(0.44, 0.94, value);
    vec3 depthColor = mix(farDepth, midDepth, lowToMid);
    depthColor = mix(depthColor, nearDepth, midToNear * 0.86);
    depthColor = mix(depthColor, vec3(0.02, 0.02, 0.02), relief * 0.34);
    vec3 shadow = farDepth * 0.58;
    vec3 imageColor = mix(shadow, depthColor, 0.34 + clarity * 0.66);
    vec3 introColor = mix(farDepth, nearDepth, 0.45);
    float imageAlpha = presence * (0.14 + clarity * 0.78 + relief * 0.55) * smoothstep(birthStart, birthStart + 0.12, intro);
    float coreAlpha = coreVisible * 0.08;
    vec3 baseColor = mix(introColor, imageColor, birthEase);

    vec3 bgHaze = vec3(0.96, 0.95, 0.92);
    baseColor = mix(baseColor, bgHaze, (1.0 - depthNear) * 0.24);
    baseColor *= mix(0.9, 1.08, depthNear);
    baseColor = mix(baseColor, vec3(0.1, 0.1, 0.1), sparkle * 0.58);
    vec3 streamGlow = mix(vec3(0.05, 0.05, 0.05), vec3(0.92, 0.92, 0.92), 0.18 + plumeGlow * 0.56 + sparkle * 0.46);
    float glowBlend = clamp(motionStream * (0.16 + sparkle * 0.2) + plumeGlow * 0.48, 0.0, 0.72);
    baseColor = mix(baseColor, streamGlow, glowBlend);
    baseColor += streamGlow * plumeGlow * 0.16;
    vec3 bottomHintColor = mix(vec3(0.05, 0.05, 0.05), vec3(0.78, 0.78, 0.78), hash11(aSeed * 43.0 + 29.0));
    baseColor = mix(baseColor, bottomHintColor, bottomHintPosition * 0.82);

    vColor = baseColor;
    float streamAlpha = (
      motionStream * (0.075 + hash11(aSeed * 61.0 + 3.0) * 0.22) +
      plumeGlow * (0.18 + hash11(aSeed * 71.0 + 13.0) * 0.34)
    ) * birthEase;
    vAlpha = max(imageAlpha, coreAlpha) * quietAlpha * fieldFade * mix(0.58, 1.08, depthNear) * (1.0 + transition * 0.58 + plumeGlow * 0.72 + finalGather * 0.18);
    vAlpha = max(vAlpha, streamAlpha * quietAlpha * fieldFade * mix(0.72, 1.08, depthNear));
    vAlpha = max(vAlpha, bottomHintAlpha * quietAlpha * fieldFade * (0.26 + hash11(aSeed * 101.0 + 7.0) * 0.46));
    vAlpha = max(vAlpha, sparkle * 0.5 * birthEase * fieldFade);
  }
`;

export const fragmentShader = `
  precision highp float;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float r2 = dot(coord, coord);
    float core = exp(-r2 * 26.0);
    float halo = exp(-r2 * 7.5) * 0.34;
    float alpha = (core + halo) * vAlpha;
    if (alpha < 0.007) discard;
    gl_FragColor = vec4(vColor, min(alpha, 1.0));
  }
`;

# Offline depth sources

These MP4 files are authoring inputs only. Keep them outside `public/` and do
not import them into the browser application. This removes the playable video
URLs that resource-detection browsers previously discovered.

To regenerate fallback static image atlases after editing a source:

```sh
npm run depth:build
```

This local authoring step needs `ffmpeg`, `ffprobe`, and the `sharp` development
dependency. Normal development and production builds use committed depth packets
and WebP files and do not need any encoder installed.

The tooling source is already rotated 180 degrees; no additional rotation is
applied. WebP images use quality 95 while retaining all original frames and
dimensions. The browser samples them as depth data, without color conversion.

The fallback uses static images, which remain visible to the browser and are
not a content-protection mechanism.

## WebCodecs depth packets

Generate the default depth packets with `npm run depth:codecs` (requires `ffprobe`).
The packager preserves every original H.264 sample, dimension, timestamp and
decoder configuration without transcoding. Four content-addressed `.depth`
files total 2,492,130 bytes, compared with 14,064,488 bytes of WebP atlases.
They are custom sample containers, not encryption or content protection.

Run `npm run build && npm start -- --port 3100`, then compare:

- `http://localhost:3100/` uses WebCodecs when supported.
- `http://localhost:3100/?depth=atlas` uses the existing implementation.
- The earlier `?depth=webcodecs` test URL also continues to work.

Each scene downloads its packet once in a dedicated Worker. The Worker decodes
from the preceding key frame, accounts for B-frame decode/display ordering,
and retains two LRU windows of up to 24 VideoFrames each. A scene change keeps
the compressed packet and bounded cache. Main-thread seeks coalesce to the
latest position, while the last displayed frame remains available during
decoding. Three.js uploads transferred VideoFrames directly to a texture; no
HTML media element is created. Frames, textures and workers are released on
disposal. Unsupported APIs/codecs, startup failure or later decode failure
fall back to the existing atlases.

Inspect `window.__morph.records.map(r => r.sequence.diagnostics)` in local
DevTools for the actual mode, fallback reason, packet bytes, worker resource
request count, cache size and decode timings. WebCodecs needs HTTPS or localhost;
an HTTP LAN address on a phone will use the fallback. A custom extension and
octet-stream response do not guarantee that a resource-detecting browser will
never identify the encoded video. Baidu/Quark resource detection still needs
verification on real devices using a secure origin.

Local validation: `npm run test:depth` (11 tests), `npm run build`, desktop and
390x844 layout checks, unsupported/decode-error fallback checks, and forward/
reverse scrubbing after switching the browser offline. A 904-position local
desktop probe measured roughly 5.4–5.6 ms p95 from requesting a frame to receiving
it, including polling overhead; separate uncached scene jumps took up to about
78 ms. These are local decode/transfer measurements, not mobile FPS guarantees.
Every scene still reported one packet request after repeated scrubbing.

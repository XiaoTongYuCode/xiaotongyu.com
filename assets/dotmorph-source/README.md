# Offline depth sources

These MP4 files are authoring inputs only. Keep them outside `public/` and do
not import them into the browser application. This removes the playable video
URLs that resource-detection browsers previously discovered.

To regenerate static image atlases after editing a source:

```sh
npm run depth:build
```

This local authoring step needs `ffmpeg`, `ffprobe`, and the `sharp` development
dependency. Normal development and production builds use committed WebP files
and do not need any encoder installed.

The tooling source is already rotated 180 degrees; no additional rotation is
applied. WebP images use quality 95 while retaining all original frames and
dimensions. The browser samples them as depth data, without color conversion.

This avoids video sniffing and playback takeover. Static images remain visible
to the browser and are not a content-protection mechanism.

# Dot Morph Assets

The homepage samples **static WebP image atlases** to render its scroll-driven
particle field. It creates no media elements and requests no video resources.
Each atlas contains up to 16 frames in a 4 x 4 grid. The manifests preserve the
source dimensions, frame rate, frame count, and duration. The shader samples
inside each tile to prevent adjacent frames from bleeding across its edges.

The loader prefetches the next atlas in the scroll direction and releases old
textures. An inactive scene retains only its displayed atlas. Failed image
loads keep the last displayed frame without issuing repeated failed requests.

| Manifest directory | Scene | Dimensions | Frames |
| --- | --- | --- | --- |
| frames/analyst-copilot | 电脑前思考、查阅 | 640 x 360 | 120 |
| frames/prototype-making | 机械工具与产品制造 | 640 x 360 | 61 |
| frames/knowledge-structure | 建楼过程 | 688 x 464 | 145 |
| frames/industry-map | 城市 | 640 x 360 | 119 |

Atlas filenames contain a content hash and can be cached immutably. The JSON
manifests are revalidated so an updated deployment can reference new images.

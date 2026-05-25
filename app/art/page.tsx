import type { Metadata } from "next";

import ArtPageClient from "./ArtPageClient";
import { ART_STORY_IMAGES, ART_STORY_PRELOAD_URLS } from "./storyImages";

export const metadata: Metadata = {
  title: "圆涟畸漪 | XiaoTongYu",
  description: "圆涟畸漪，一组以滚动渐变切换阅读的水墨故事连载。",
};

export default function ArtPage() {
  return (
    <main className="artPage">
      <ArtPageClient images={ART_STORY_IMAGES} preloadUrls={ART_STORY_PRELOAD_URLS} />
    </main>
  );
}

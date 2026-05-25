import type { Metadata } from "next";

import LoadingGate from "../components/LoadingGate";
import ArtStoryViewer from "./ArtStoryViewer";
import { ART_STORY_IMAGES, ART_STORY_PRELOAD_URLS } from "./storyImages";

export const metadata: Metadata = {
  title: "圆涟畸漪 | XiaoTongYu",
  description: "圆涟畸漪，一组以滚动渐变切换阅读的水墨故事连载。",
};

export default function ArtPage() {
  return (
    <main className="artPage">
      <LoadingGate
        buttonLabel="进入连载"
        description="A short artwork series from @圆涟畸漪"
        loadingButtonLabel="预载中"
        preloadUrls={ART_STORY_PRELOAD_URLS}
        revealDelayMs={620}
        title="Please view in landscape for the best experience"
      />
      <ArtStoryViewer images={ART_STORY_IMAGES} />
      <section className="artSignature" aria-label="署名">
        <p>圆涟畸漪</p>
      </section>
    </main>
  );
}

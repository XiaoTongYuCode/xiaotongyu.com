import type { StaticImageData } from "next/image";

import image01 from "../../assets/art_story/1.jpg";
import image02 from "../../assets/art_story/2.jpg";
import image03 from "../../assets/art_story/3.jpg";
import image04 from "../../assets/art_story/4.jpg";
import image05 from "../../assets/art_story/5.jpg";
import image06 from "../../assets/art_story/6.jpg";
import image07 from "../../assets/art_story/7.jpg";
import image08 from "../../assets/art_story/8.jpg";
import image09 from "../../assets/art_story/9.jpg";
import image10 from "../../assets/art_story/10.jpg";
import image11 from "../../assets/art_story/11.jpg";
import image12 from "../../assets/art_story/12.jpg";
import image13 from "../../assets/art_story/13.jpg";
import image14 from "../../assets/art_story/14.jpg";
import image15 from "../../assets/art_story/15.jpg";
import image16 from "../../assets/art_story/16.jpg";
import image17 from "../../assets/art_story/17.jpg";
import image18 from "../../assets/art_story/18.jpg";
import image19 from "../../assets/art_story/19.jpg";
import image20 from "../../assets/art_story/20.jpg";
import image21 from "../../assets/art_story/21.jpg";
import image22 from "../../assets/art_story/22.jpg";
import image23 from "../../assets/art_story/23.jpg";
import image24 from "../../assets/art_story/24.jpg";
import image25 from "../../assets/art_story/25.jpg";
import image26 from "../../assets/art_story/26.jpg";
import image27 from "../../assets/art_story/27.jpg";
import image28 from "../../assets/art_story/28.jpg";
import image29 from "../../assets/art_story/29.jpg";
import image30 from "../../assets/art_story/30.jpg";
import image31 from "../../assets/art_story/31.jpg";
import image32 from "../../assets/art_story/32.jpg";
import image33 from "../../assets/art_story/33.jpg";
import image34 from "../../assets/art_story/34.jpg";
import image35 from "../../assets/art_story/35.jpg";
import image36 from "../../assets/art_story/36.jpg";
import image37 from "../../assets/art_story/37.jpg";
import image38 from "../../assets/art_story/38.jpg";
import image39 from "../../assets/art_story/39.jpg";
import image40 from "../../assets/art_story/40.jpg";
import image41 from "../../assets/art_story/41.jpg";
import image42 from "../../assets/art_story/42.jpg";
import image43 from "../../assets/art_story/43.jpg";
import image44 from "../../assets/art_story/44.jpg";
import image45 from "../../assets/art_story/45.jpg";
import image46 from "../../assets/art_story/46.jpg";
import image47 from "../../assets/art_story/47.jpg";
import image48 from "../../assets/art_story/48.jpg";
import image49 from "../../assets/art_story/49.jpg";
import image50 from "../../assets/art_story/50.jpg";
import image51 from "../../assets/art_story/51.jpg";
import image52 from "../../assets/art_story/52.jpg";
import image53 from "../../assets/art_story/53.jpg";
import image54 from "../../assets/art_story/54.jpg";
import image55 from "../../assets/art_story/55.jpg";
import image56 from "../../assets/art_story/56.jpg";
import image57 from "../../assets/art_story/57.jpg";
import image58 from "../../assets/art_story/58.jpg";
import image59 from "../../assets/art_story/59.jpg";
import image60 from "../../assets/art_story/60.jpg";
import image61 from "../../assets/art_story/61.jpg";
import image62 from "../../assets/art_story/62.jpg";
import image63 from "../../assets/art_story/63.jpg";
import image64 from "../../assets/art_story/64.jpg";
import image65 from "../../assets/art_story/65.jpg";
import image66 from "../../assets/art_story/66.jpg";
import image67 from "../../assets/art_story/67.jpg";
import image68 from "../../assets/art_story/68.jpg";
import image69 from "../../assets/art_story/69.jpg";
import image70 from "../../assets/art_story/70.jpg";
import image71 from "../../assets/art_story/71.jpg";
import image72 from "../../assets/art_story/72.jpg";
import image73 from "../../assets/art_story/73.jpg";
import image74 from "../../assets/art_story/74.jpg";
import image75 from "../../assets/art_story/75.jpg";
import image76 from "../../assets/art_story/76.jpg";

export type ArtStoryImage = {
  alt: string;
  height: number;
  index: number;
  src: string;
  width: number;
};

const imageData = [
  image01,
  image02,
  image03,
  image04,
  image05,
  image06,
  image07,
  image08,
  image09,
  image10,
  image11,
  image12,
  image13,
  image14,
  image15,
  image16,
  image17,
  image18,
  image19,
  image20,
  image21,
  image22,
  image23,
  image24,
  image25,
  image26,
  image27,
  image28,
  image29,
  image30,
  image31,
  image32,
  image33,
  image34,
  image35,
  image36,
  image37,
  image38,
  image39,
  image40,
  image41,
  image42,
  image43,
  image44,
  image45,
  image46,
  image47,
  image48,
  image49,
  image50,
  image51,
  image52,
  image53,
  image54,
  image55,
  image56,
  image57,
  image58,
  image59,
  image60,
  image61,
  image62,
  image63,
  image64,
  image65,
  image66,
  image67,
  image68,
  image69,
  image70,
  image71,
  image72,
  image73,
  image74,
  image75,
  image76,
] as const satisfies readonly StaticImageData[];

export const ART_STORY_IMAGES: readonly ArtStoryImage[] = imageData.map((image, index) => ({
  alt: `圆涟畸漪 第 ${index + 1} 幅`,
  height: image.height,
  index: index + 1,
  src: image.src,
  width: image.width,
}));

export const ART_STORY_PRELOAD_URLS = ART_STORY_IMAGES.map((image) => image.src);

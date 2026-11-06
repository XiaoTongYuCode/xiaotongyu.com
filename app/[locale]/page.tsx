import HomePage from "../_components/home/HomePage";
import { pageLocale, pageMetadata, type LocalizedPageProps } from "../_seo/pages";

export async function generateMetadata(props: LocalizedPageProps) {
  return pageMetadata("/", await pageLocale(props));
}

export default function Home() {
  return <HomePage />;
}

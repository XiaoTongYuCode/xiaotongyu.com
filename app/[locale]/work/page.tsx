import WorkPageClient from "../../work/WorkPageClient";
import { pageLocale, pageMetadata, type LocalizedPageProps } from "../../_seo/pages";

export async function generateMetadata(props: LocalizedPageProps) {
  return pageMetadata("/work", await pageLocale(props));
}

export default function WorkPage() {
  return <WorkPageClient />;
}

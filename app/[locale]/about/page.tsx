import DotMorphReplica from "../../_components/datacurve-replica/DotMorphReplica";
import { pageLocale, pageMetadata, profilePageJsonLd, type LocalizedPageProps } from "../../_seo/pages";
import { serializeJsonLd } from "../../_seo/site";

export async function generateMetadata(props: LocalizedPageProps) {
  return pageMetadata("/about", await pageLocale(props));
}

export default async function AboutPage(props: LocalizedPageProps) {
  const locale = await pageLocale(props);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(profilePageJsonLd(locale)) }} />
      <DotMorphReplica />
    </>
  );
}

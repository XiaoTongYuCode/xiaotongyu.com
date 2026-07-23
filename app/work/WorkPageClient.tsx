"use client";

import { useEffect } from "react";
import { ArrowIcon } from "../_components/datacurve-replica/ui";
import { SiteFooter, SiteNav, useSiteCopy } from "../_components/site/SiteChrome";
import { WorkPageStyles } from "./WorkPageStyles";

export default function WorkPageClient() {
  const { copy, languageSwitcher } = useSiteCopy();

  useEffect(() => {
    const isChinese = copy.htmlLang === "zh-CN";
    document.title = isChinese
      ? "精选作品 | XiaoTongYu"
      : "Selected Work | Xiaotong Yu";

    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (description) {
      description.content = isChinese
        ? "小童近期围绕本地 AI、社区产品与浏览器体验完成的项目与实验。"
        : "Selected products and experiments by Xiaotong Yu across local AI, community software, and playful browser experiences.";
    }
  }, [copy.htmlLang]);

  return (
    <main className="dotmorph-page work-page">
      <div className="work-page-surface">
        <SiteNav copy={copy} languageSwitcher={languageSwitcher} />

        <section className="work-page-content" aria-labelledby="work-page-heading">
          <header className="work-page-heading">
            <h1 id="work-page-heading">{copy.work.heading}</h1>
            <p>{copy.work.intro}</p>
          </header>

          <ol className="work-page-list">
            {copy.work.items.map((item, index) => (
              <li key={item.url}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${copy.work.itemAria}: ${item.title}`}
                >
                  <span className="work-item-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="work-item-copy">
                    <span className="work-item-title">{item.title}</span>
                    <span className="work-item-description">
                      {item.description}
                    </span>
                  </span>
                  <span className="work-item-kind">{item.kind}</span>
                  <span className="work-item-arrow" aria-hidden="true">
                    <ArrowIcon size={16} />
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </section>

      </div>

      <SiteFooter copy={copy} />
      <WorkPageStyles />
    </main>
  );
}

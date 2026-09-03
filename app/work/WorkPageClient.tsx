"use client";

import { ArrowIcon } from "../_components/datacurve-replica/ui";
import { SiteFooter, SiteNav, useSiteCopy } from "../_components/site/SiteChrome";
import { WorkPageStyles } from "./WorkPageStyles";

export default function WorkPageClient() {
  const { copy, languageSwitcher } = useSiteCopy();

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

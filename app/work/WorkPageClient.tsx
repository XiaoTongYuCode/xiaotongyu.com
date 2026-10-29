"use client";

import { useState } from "react";
import type { HomeCopy, WorkItemCopy } from "../_i18n/types";
import { SiteFooter, SiteNav, useSiteCopy } from "../_components/site/SiteChrome";
import { WorkPageStyles } from "./WorkPageStyles";

function ProjectChevron() {
  return (
    <span className="t-learn-chevron" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path className="t-learn-arm t-learn-arm-top" d="M6 4L10 8" />
        <path className="t-learn-arm t-learn-arm-bot" d="M10 8L6 12" />
      </svg>
    </span>
  );
}

function ProjectMedia({ media, copy }: { media: NonNullable<WorkItemCopy["media"]>; copy: HomeCopy["work"] }) {
  const [filmError, setFilmError] = useState(false);

  return (
    <div className="work-media">
      <div className="work-media-stage">
        <video
          src={media.video}
          poster={media.preview}
          width={1280}
          height={720}
          controls
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={copy.filmLabel}
          onError={() => setFilmError(true)}
        />
        {filmError ? (
          <p className="work-film-error" role="status">
            {copy.filmError} <a href={media.video} target="_blank" rel="noreferrer">{copy.openFilm}</a>
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function WorkPageClient() {
  const { copy, languageSwitcher } = useSiteCopy();

  return (
    <main className="dotmorph-page work-page">
      <div className="work-page-surface">
        <SiteNav copy={copy} languageSwitcher={languageSwitcher} />

        <section className="work-page-content" aria-labelledby="work-page-heading">
          <header className="work-page-heading">
            <h1 id="work-page-heading">{copy.work.heading}</h1>
          </header>

          <ol className="work-page-list">
            {copy.work.items.map((item, index) => (
              <li key={item.url}>
                {item.media ? (
                  <article className="work-featured" aria-labelledby="mewa-title">
                    <div className="work-featured-copy">
                      <h2 id="mewa-title">{item.title}</h2>
                      <p className="work-featured-description">{item.description}</p>
                      <a className="work-visit t-learn" href={item.url} target="_blank" rel="noreferrer" aria-label={`${copy.work.itemAria}: ${item.title}`}>
                        {copy.work.visit}<ProjectChevron />
                      </a>
                    </div>
                    <ProjectMedia media={item.media} copy={copy.work} />
                  </article>
                ) : (
                  <a className="work-row t-learn" href={item.url} target="_blank" rel="noreferrer" aria-label={`${copy.work.itemAria}: ${item.title}`}>
                    <span className="work-item-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <div className="work-item-copy">
                      <h2 className="work-item-title">{item.title}</h2>
                      <p className="work-item-description">{item.description}</p>
                    </div>
                    <span className="work-item-kind">{item.kind}</span>
                    <span className="work-row-visit">{copy.work.visit}<ProjectChevron /></span>
                  </a>
                )}
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

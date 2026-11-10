"use client";

import { SiteFooter, SiteNav, useSiteCopy } from "../site/SiteChrome";
import { DISPLAY_NAME, GITHUB_URL } from "../site/identity";
import ContactButton from "./ContactButton";
import CrowdScene from "./CrowdScene";
import DeskPerson from "./DeskPerson";
import { HOME_COPY } from "./copy";
import styles from "./home.module.css";
import { localizedPath } from "../../_i18n/routing";

export default function HomePage() {
  const { copy, languageSwitcher, locale } = useSiteCopy();
  const isChinese = locale === "zh-CN";
  const content = HOME_COPY[locale];

  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-labelledby="v2-heading">
        <SiteNav copy={copy} languageSwitcher={languageSwitcher} />

        <CrowdScene locale={locale} projects={copy.work.items} />

        <div className={styles.heroCopy}>
          <h1 id="v2-heading">
            {content.hero.title[0]}<br />{content.hero.title[1]}
          </h1>
          <div className={styles.heroAside}>
            <p>{content.hero.intro}</p>
            <div className={styles.actions}>
              <a className={styles.primaryButton} href={localizedPath("/work", locale)}>{content.hero.work}</a>
              <div className={styles.contactActions}>
                <ContactButton
                  key={locale}
                  label={content.hero.contact}
                  copyLabel={copy.contact.copyEmail}
                  copied={copy.contact.emailCopied}
                  copyFailed={copy.contact.emailCopyFailed}
                />
                <a
                  className={styles.githubButton}
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={isChinese ? `访问 ${DISPLAY_NAME} 的 GitHub（新窗口）` : `${DISPLAY_NAME} on GitHub (opens in a new tab)`}
                  title="GitHub"
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 .75a11.25 11.25 0 0 0-3.558 21.923c.563.104.768-.244.768-.542 0-.267-.01-.974-.015-1.912-3.13.68-3.79-1.509-3.79-1.509-.512-1.3-1.25-1.646-1.25-1.646-1.022-.698.078-.684.078-.684 1.13.079 1.725 1.16 1.725 1.16 1.004 1.72 2.633 1.223 3.275.935.102-.727.393-1.223.715-1.504-2.499-.284-5.126-1.25-5.126-5.566 0-1.23.44-2.234 1.16-3.022-.117-.284-.503-1.43.11-2.98 0 0 .945-.302 3.094 1.154A10.79 10.79 0 0 1 12 6.18c.956.005 1.919.13 2.818.38 2.148-1.456 3.092-1.154 3.092-1.154.614 1.55.228 2.696.112 2.98.722.788 1.157 1.792 1.157 3.022 0 4.327-2.631 5.279-5.139 5.558.404.35.765 1.043.765 2.1 0 1.516-.014 2.74-.014 3.112 0 .3.203.651.774.54A11.252 11.252 0 0 0 12 .75Z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.about} id="about" aria-labelledby="v2-about-heading">
        <DeskPerson />
        <div className={styles.aboutBody}>
          <h2 id="v2-about-heading">{content.about.title}</h2>
          {content.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <div className={styles.projectList}>
            {copy.work.items.map((project, index) => (
              <a key={project.title} href={project.url} target="_blank" rel="noreferrer">
                <span className={styles.projectNumber}>0{index + 1}</span>
                <span>{project.title}<small>{content.projects[project.title]?.description ?? project.kind}</small></span>
              </a>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter copy={copy} />
    </main>
  );
}

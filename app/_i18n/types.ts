export type Locale = "zh-CN" | "en-US";

export type WorkItemCopy = {
  title: string;
  description: string;
  kind: string;
  url: string;
  media?: {
    preview: string;
    video: string;
  };
};

export type HomeCopy = {
  localeName: string;
  htmlLang: string;
  meta: {
    title: string;
    description: string;
  };
  nav: {
    ariaMain: string;
    ariaMobile: string;
    work: string;
    about: string;
    contact: string;
    openMenu: string;
    closeMenu: string;
  };
  language: {
    aria: string;
    current: string;
  };
  contact: {
    email: string;
    openEmail: string;
    copyEmail: string;
    copied: string;
    emailCopied: string;
    emailCopyFailed: string;
  };
  hero: {
    sectionLabel: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  content: {
    kicker: string;
    paragraphs: string[];
    closing: string;
    join: string;
  };
  work: {
    heading: string;
    itemAria: string;
    visit: string;
    filmLabel: string;
    filmError: string;
    openFilm: string;
    items: WorkItemCopy[];
  };
  footer: {
    heading: string[];
    links: string;
    socials: string;
    email: string;
  };
  scenes: Record<string, string>;
};

export type LocaleMessages = {
  home: HomeCopy;
};

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  I18N_MESSAGES,
  isLocale,
  LOCALE_STORAGE_KEY,
  type HomeCopy,
  type Locale,
} from "../../_i18n";
import { DISPLAY_NAME } from "./identity";
import styles from "./site-chrome.module.css";
import { SiteChromeStyles } from "./SiteChromeStyles";

export const CONTACT_EMAIL = "work@xiaotongyu.com";
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;

export function handleContactEmailClick(event: MouseEvent<HTMLAnchorElement>, feedback: string, fallback: string) {
  event.preventDefault();
  void copyTextToClipboard(CONTACT_EMAIL)
    .then(() => showContactFeedback(feedback, "success"))
    .catch(() => showContactFeedback(fallback, "warning"));
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the DOM fallback for browsers that expose clipboard but deny access.
    }
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.inset = "0 auto auto 0";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  try {
    if (!document.execCommand("copy")) {
      throw new Error("Clipboard copy was rejected");
    }
  } finally {
    document.body.removeChild(textArea);
  }
}

let contactFeedbackTimer: number | undefined;

function showContactFeedback(text: string, tone: "success" | "warning") {
  const existingToast = document.querySelector<HTMLElement>("[data-contact-feedback]");
  existingToast?.remove();

  if (contactFeedbackTimer) {
    window.clearTimeout(contactFeedbackTimer);
  }

  const toast = document.createElement("div");
  toast.className = "contact-copy-toast";
  toast.dataset.contactFeedback = tone;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = text;
  document.body.appendChild(toast);

  window.requestAnimationFrame(() => {
    toast.dataset.visible = "true";
  });

  contactFeedbackTimer = window.setTimeout(() => {
    toast.remove();
    contactFeedbackTimer = undefined;
  }, 2400);
}

type SiteCopyState = {
  copy: HomeCopy;
  languageSwitcher: ReactNode;
  locale: Locale;
};

export function useSiteCopy(): SiteCopyState {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [hasLoadedLocale, setHasLoadedLocale] = useState(false);
  const copy = I18N_MESSAGES[locale].home;
  const toggleLocale = () => setLocale((value) => (value === "zh-CN" ? "en-US" : "zh-CN"));

  useEffect(() => {
    try {
      const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isLocale(savedLocale)) {
        setLocale(savedLocale);
      }
    } catch {
      // Use the default locale when browser storage is blocked.
    }
    setHasLoadedLocale(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = copy.htmlLang;
  }, [copy.htmlLang]);

  useEffect(() => {
    if (!hasLoadedLocale) return;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Ignore storage failures so rendering is not blocked in privacy-restricted contexts.
    }
  }, [hasLoadedLocale, locale]);

  const languageSwitcher = (
    <button type="button" className="language-trigger" aria-label={copy.language.aria} onClick={toggleLocale}>
      <img src="/icon/translation.svg" width={16} height={16} alt="" aria-hidden="true" />
    </button>
  );

  return { copy, languageSwitcher, locale };
}

type SiteNavProps = {
  copy: HomeCopy;
  languageSwitcher: ReactNode;
};

export function SiteNav({ copy, languageSwitcher }: SiteNavProps) {
  const pathname = usePathname();
  const isChinese = copy.htmlLang === "zh-CN";
  const navLinks = [
    { href: "/work", label: copy.nav.work },
    { href: "/about", label: copy.nav.about },
  ];
  const copyContact = (event: MouseEvent<HTMLAnchorElement>) =>
    handleContactEmailClick(event, copy.contact.emailCopied, copy.contact.emailCopyFailed);

  return (
    <>
      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label={`${DISPLAY_NAME} — ${isChinese ? "首页" : "home"}`}>
          <img src="/xtyopen-icon.svg" width="22" height="22" alt="" />
          <span>{DISPLAY_NAME}</span>
        </a>
        <nav className={styles.nav} aria-label={copy.nav.ariaMain}>
          {navLinks.map((link) => (
            <a href={link.href} key={link.href} aria-current={pathname === link.href ? "page" : undefined}>
              {link.label}
            </a>
          ))}
          <a className={styles.contactLink} href={CONTACT_MAILTO} onClick={copyContact}>{copy.nav.contact}</a>
        </nav>
        <div className={styles.headerActions}>
          {languageSwitcher}
          <a href={CONTACT_MAILTO} className={styles.sayHello} onClick={copyContact}>
            {isChinese ? "打个招呼" : "Say hello"}
          </a>
        </div>
      </header>
      <SiteChromeStyles />
    </>
  );
}

type SiteFooterProps = {
  copy: HomeCopy;
};

export function SiteFooter({ copy }: SiteFooterProps) {
  return (
    <footer className={styles.footer}>
      <span>© {new Date().getFullYear()} {DISPLAY_NAME}</span>
      <a href="/work">{copy.nav.work}</a>
      <a href="/about">{copy.nav.about}</a>
      <a href="https://github.com/XiaoTongYuCode" target="_blank" rel="noreferrer">GitHub</a>
      <a href={CONTACT_MAILTO} onClick={(event) => handleContactEmailClick(event, copy.contact.emailCopied, copy.contact.emailCopyFailed)}>
        {CONTACT_EMAIL}
      </a>
    </footer>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { type MouseEvent, type ReactNode } from "react";
import {
  I18N_MESSAGES,
  type HomeCopy,
  type Locale,
} from "../../_i18n";
import { rememberLocale, useLocale } from "../../_i18n/LocaleProvider";
import { languageSwitchPath, localizedPath, unlocalizedPath } from "../../_i18n/routing";
import { DISPLAY_NAME, GITHUB_URL, X_URL } from "./identity";
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
  const locale = useLocale();
  const pathname = usePathname();
  const copy = I18N_MESSAGES[locale].home;
  const nextLocale = locale === "zh-CN" ? "en-US" : "zh-CN";

  const languageSwitcher = (
    <a
      className="language-trigger"
      href={languageSwitchPath(pathname, nextLocale)}
      hrefLang={nextLocale}
      aria-label={copy.language.aria}
      onClick={(event) => {
        // Modified clicks should open the alternate without changing this tab's preference.
        if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
          rememberLocale(nextLocale);
        }
      }}
    >
      <img src="/icon/translation.svg" width={16} height={16} alt="" aria-hidden="true" />
    </a>
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
  const sitePath = (path: string) => localizedPath(path, isChinese ? "zh-CN" : "en-US");
  const navLinks = [
    { href: "/work", label: copy.nav.work },
    { href: "/about", label: copy.nav.about },
  ];
  const copyContact = (event: MouseEvent<HTMLAnchorElement>) =>
    handleContactEmailClick(event, copy.contact.emailCopied, copy.contact.emailCopyFailed);

  return (
    <>
      <header className={styles.header}>
        <a className={styles.brand} href={sitePath("/")} aria-label={`${DISPLAY_NAME} — ${isChinese ? "首页" : "home"}`}>
          <img src="/xtyopen-icon.svg" width="22" height="22" alt="" />
          <span>{DISPLAY_NAME}</span>
        </a>
        <nav className={styles.nav} aria-label={copy.nav.ariaMain}>
          {navLinks.map((link) => (
            <a href={sitePath(link.href)} key={link.href} aria-current={unlocalizedPath(pathname) === link.href ? "page" : undefined}>
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
  const sitePath = (path: string) => localizedPath(path, copy.htmlLang === "zh-CN" ? "zh-CN" : "en-US");
  return (
    <footer className={styles.footer}>
      <span>© {new Date().getFullYear()} {DISPLAY_NAME}</span>
      <a href={sitePath("/work")}>{copy.nav.work}</a>
      <a href={sitePath("/about")}>{copy.nav.about}</a>
      <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
      <a href={X_URL} target="_blank" rel="noreferrer" aria-label="TongYu Xiao on X (@tongyu_xiao)">X</a>
      <a href={CONTACT_MAILTO} onClick={(event) => handleContactEmailClick(event, copy.contact.emailCopied, copy.contact.emailCopyFailed)}>
        {CONTACT_EMAIL}
      </a>
    </footer>
  );
}

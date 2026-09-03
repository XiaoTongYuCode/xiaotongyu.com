"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  I18N_MESSAGES,
  isLocale,
  LOCALE_STORAGE_KEY,
  type HomeCopy,
  type Locale,
} from "../../_i18n";
import { BrandLogo, IconMark } from "../datacurve-replica/ui";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const framedNavClass = pathname === "/" ? "" : " site-nav-framed";
  const mobileMenuTabIndex = menuOpen ? 0 : -1;
  const navLinks = [
    { href: "/work", label: copy.nav.work },
    { href: "/game/1", label: copy.nav.game },
    { href: "/#about", label: copy.nav.about },
  ] as const;

  return (
    <>
      <nav className={`site-nav site-nav-desktop${framedNavClass}`} aria-label={copy.nav.ariaMain}>
        <a className="brand" href="/">
          <BrandLogo />
        </a>
        <div>
          {navLinks.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
          <a
            href={CONTACT_MAILTO}
            onClick={(event) => handleContactEmailClick(event, copy.contact.emailCopied, copy.contact.emailCopyFailed)}
          >
            {copy.nav.contact}
          </a>
          {languageSwitcher}
        </div>
      </nav>

      <nav className={`site-nav site-nav-mobile${framedNavClass}`} aria-label={copy.nav.ariaMobile}>
        <a className="brand" href="/">
          <BrandLogo />
        </a>
        <div className="mobile-nav-actions">
          {languageSwitcher}
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-label={menuOpen ? copy.nav.closeMenu : copy.nav.openMenu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
        <div className="mobile-menu" data-open={menuOpen ? "true" : undefined} aria-hidden={!menuOpen}>
          {navLinks.map((link) => (
            <a href={link.href} key={link.href} tabIndex={mobileMenuTabIndex} onClick={closeMenu}>
              {link.label}
            </a>
          ))}
          <a
            href={CONTACT_MAILTO}
            tabIndex={mobileMenuTabIndex}
            onClick={(event) => {
              closeMenu();
              handleContactEmailClick(event, copy.contact.emailCopied, copy.contact.emailCopyFailed);
            }}
          >
            {copy.nav.contact}
          </a>
        </div>
      </nav>
      <SiteChromeStyles />
    </>
  );
}

type ContactActionsProps = {
  copy: HomeCopy;
  className?: string;
};

export function ContactActions({ copy, className = "" }: ContactActionsProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const timeoutRef = useRef<number | undefined>(undefined);
  const classes = ["contact-actions", className].filter(Boolean).join(" ");

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  const copyEmail = async () => {
    try {
      await copyTextToClipboard(CONTACT_EMAIL);
      setCopyState("copied");
      showContactFeedback(copy.contact.emailCopied, "success");
    } catch {
      setCopyState("failed");
      showContactFeedback(copy.contact.emailCopyFailed, "warning");
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => setCopyState("idle"), 1800);
  };

  return (
    <div className={classes}>
      <span>{copy.contact.email}</span>
      <a
        href={CONTACT_MAILTO}
        onClick={(event) => handleContactEmailClick(event, copy.contact.emailCopied, copy.contact.emailCopyFailed)}
      >
        {copy.contact.openEmail}
      </a>
      <button type="button" onClick={copyEmail}>
        {copyState === "copied"
          ? copy.contact.copied
          : copyState === "failed"
            ? copy.contact.emailCopyFailed
            : copy.contact.copyEmail}
      </button>
    </div>
  );
}

type SiteFooterProps = {
  copy: HomeCopy;
};

export function SiteFooter({ copy }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-heading">
          {copy.footer.heading.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="footer-side">
          <a className="brand footer-brand" href="/">
            <IconMark />
            <span>Xiaotong Yu</span>
          </a>
          <div className="footer-columns">
            <div>
              <span>{copy.footer.links}</span>
              <a href="/work">{copy.nav.work}</a>
              <a href="/game/1">{copy.nav.game}</a>
              <a href="/#about">{copy.nav.about}</a>
              <a
                href={CONTACT_MAILTO}
                onClick={(event) => handleContactEmailClick(event, copy.contact.emailCopied, copy.contact.emailCopyFailed)}
              >
                {copy.nav.contact}
              </a>
            </div>
            <div>
              <span>{copy.footer.socials}</span>
              <a href="https://github.com/XiaoTongYuCode" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href="https://x.com/tongyu_xiao" target="_blank" rel="noreferrer">
                X
              </a>
              <a
                href={CONTACT_MAILTO}
                onClick={(event) => handleContactEmailClick(event, copy.contact.emailCopied, copy.contact.emailCopyFailed)}
              >
                {copy.contact.email}
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-legal">
          <span>© 2026 Xiaotong Yu</span>
        </div>
      </div>
    </footer>
  );
}

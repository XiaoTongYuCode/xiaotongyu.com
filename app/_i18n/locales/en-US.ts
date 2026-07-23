import type { LocaleMessages } from "../types";

export const enUS: LocaleMessages = {
  home: {
    localeName: "English",
    htmlLang: "en",
    meta: {
      title: "Xiaotong Yu | Product Engineering & AI Experiments",
      description:
        "Xiaotong Yu's personal website for product engineering, AI applications, creative coding, and thoughtful web experiments.",
    },
    nav: {
      ariaMain: "Main navigation",
      ariaMobile: "Mobile navigation",
      work: "Work",
      game: "Game",
      about: "About",
      contact: "Contact",
      openMenu: "Open menu",
      closeMenu: "Close menu",
    },
    language: {
      aria: "Switch language",
      current: "EN",
    },
    contact: {
      email: "work@xiaotongyu.com",
      openEmail: "Open email",
      copyEmail: "Copy email",
      copied: "Copied",
      emailCopied: "Email copied: work@xiaotongyu.com",
      emailCopyFailed:
        "Copy failed. Please copy manually: work@xiaotongyu.com",
    },
    hero: {
      sectionLabel: "Software engineer / Personal portfolio",
      title: "Building useful products, AI tools, and web experiences.",
      subtitle:
        "Xiaotong Yu is a software engineer based in Beijing, working across product interfaces, AI workflows, and thoughtful web experiments.",
      primaryCta: "Get in touch",
      secondaryCta: "View work",
    },
    content: {
      kicker:
        "Good software often comes from careful choices, steady iteration, and respect for the details.",
      paragraphs: [
        "xiaotongyu.com is my personal space on the web—a place for product practice, AI experiments, engineering work, and an ongoing exploration of interface and interaction.",
        "I like turning early ideas into products people can actually use. From information structure and interaction feedback to maintainable implementation, I try to make each step clear, dependable, and grounded in real tasks.",
        "Recent work includes Myrisle, a privacy-first local AI diary; Petspace, a pet community built around everyday sharing; and Pixel Roguelite, a pixel-art browser combat prototype.",
        "In AI applications, I care about how models connect with retrieval, tools, and human review to become workflows people want to return to—not just polished one-off demos.",
      ],
      closing: "New work, experiments, and engineering notes will keep growing here.",
      join: "View selected work",
    },
    work: {
      heading: "Selected work",
      intro:
        "A few recent products and experiments across local AI, community software, and playful browser experiences.",
      itemAria: "Open project",
      items: [
        {
          title: "Myrisle",
          description:
            "A private, local-first AI diary designed to keep reflection personal.",
          kind: "iOS · Local AI · Privacy-first",
          url: "https://apps.apple.com/us/app/%E7%A7%81%E5%B1%BF/id6759214981",
        },
        {
          title: "Petspace",
          description:
            "A friendly web community for sharing the small moments of life with pets.",
          kind: "Web product · Pet community · Daily sharing",
          url: "https://petspace.xiaotongyu.com/",
        },
        {
          title: "Pixel Roguelite",
          description:
            "A compact browser combat prototype built around pixel art and quick runs.",
          kind: "Browser game · Pixel art · Combat prototype",
          url: "https://pixel-roguelite.vercel.app/",
        },
      ],
    },
    footer: {
      heading: [
        "Turn ideas into products.",
        "Make complexity feel clear.",
        "Build the details to last.",
      ],
      links: "Explore",
      socials: "Elsewhere",
      email: "Email",
    },
    scenes: {
      "analyst-copilot":
        "Let AI carry the repetition and leave judgment and craft to people.",
      "prototype-making":
        "Products take shape when tools, systems, and intent move together.",
      "knowledge-structure":
        "Good software is built one careful layer at a time.",
      "industry-map":
        "Small experiments connect into a digital place I can call my own.",
    },
  },
};

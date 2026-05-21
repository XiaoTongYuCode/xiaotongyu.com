export type CapabilityAccent = "systems" | "ai" | "creative";

export type Capability = {
  title: string;
  accent: CapabilityAccent;
  description: string;
};

export type WorkItem = {
  index: string;
  title: string;
  type: string;
  url: string;
};

export type NavLink = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const SITE_EMAIL = "work@xiaotongyu.com";

export const NAV_LINKS: readonly NavLink[] = [
  { label: "Profile", href: "#profile" },
  { label: "Work", href: "#work" },
  { label: "Studio", href: "#studio" },
  { label: "Contact", href: "#contact" },
] as const;

export const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: "GitHub", href: "https://github.com/XiaoTongYuCode", external: true },
  { label: "X", href: "https://x.com/tongyu_xiao", external: true },
  { label: "Email", href: `mailto:${SITE_EMAIL}` },
] as const;

export const CAPABILITIES: readonly Capability[] = [
  {
    title: "Product Systems",
    accent: "systems",
    description:
      "I help shape early ideas into practical interfaces, with attention to structure, interaction, and maintainable implementation.",
  },
  {
    title: "AI Applications",
    accent: "ai",
    description:
      "I work on AI-assisted workflows that connect models, retrieval, tools, and review into systems people can actually use.",
  },
  {
    title: "Creative Engineering",
    accent: "creative",
    description:
      "I enjoy small details in motion, canvas, data visualization, and frontend craft when they make a product clearer.",
  },
] as const;

export const SELECTED_WORK: readonly WorkItem[] = [
  {
    index: "01",
    title: "Myrisle iOS App",
    type: "Local AI diary / iOS / Privacy-first",
    url: "https://apps.apple.com/us/app/%E7%A7%81%E5%B1%BF/id6759214981",
  },
  {
    index: "02",
    title: "Petspace Web",
    type: "Pet community / Web product / Daily sharing",
    url: "https://petspace.xiaotongyu.com/",
  },
  {
    index: "03",
    title: "Pixel Roguelite",
    type: "Browser game / Pixel art / Combat prototype",
    url: "https://pixel-roguelite.vercel.app/",
  },
] as const;

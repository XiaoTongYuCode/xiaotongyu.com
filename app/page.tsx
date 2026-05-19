import InteractiveLayer from "./components/InteractiveLayer";
import LoadingGate from "./components/LoadingGate";

const capabilities = [
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
];

const selectedWork = [
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
];

export default function Home() {
  return (
    <main>
      <InteractiveLayer />
      <LoadingGate />
      <div className="motionLoader" aria-hidden="true" />
      <div className="scrollProgress" aria-hidden="true" />

      <header className="siteHeader">
        <a className="brand" href="#top" aria-label="xtyopen home">
          <img src="/xtyopen-logo.svg" alt="xtyopen" />
        </a>
        <nav className="navLinks" aria-label="Primary navigation">
          <a href="#profile">Profile</a>
          <a href="#work">Work</a>
          <a href="#studio">Studio</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="headerCta magnetic" href="#contact">
          Get in touch
        </a>
      </header>

      <section id="top" className="hero">
        <div className="heroCanvasMask" aria-hidden="true" />
        <div className="heroInner reveal">
          <p className="kicker">Software Engineer</p>
          <h1>
            Building useful products, AI tools, and web experiences.
          </h1>
          <p className="heroLead">
            Xiaotong Yu is a software engineer working across product
            interfaces, AI workflows, and thoughtful web experiments.
          </p>
          <div className="heroActions">
            <a className="buttonPrimary magnetic" href="#work">
              Explore work
            </a>
            <a className="buttonGhost magnetic" href="mailto:work@xiaotongyu.com">
              work@xiaotongyu.com
            </a>
          </div>
        </div>
        <div className="heroMeta reveal">
          <span>Based in Shanghai</span>
          <span>Product Engineering</span>
          <span>AI Experience Design</span>
        </div>
      </section>

      <section id="profile" className="profile sectionWrap">
        <div className="sectionLabel reveal">Profile</div>
        <div className="profileStatement reveal">
          <h2>
            A small personal space for product work, AI experiments, and web
            engineering notes.
          </h2>
          <p>
            xtyopen is my home on the web: a place for experiments, product
            notes, engineering work, and collaborations around AI tooling and
            interface craft.
          </p>
        </div>
      </section>

      <section id="studio" className="capabilities sectionWrap">
        {capabilities.map((item) => (
          <article
            className={`capabilityCard capabilityCard--${item.accent} reveal`}
            key={item.title}
          >
            <div className="capabilityIcon" aria-hidden="true">
              <span className="capabilityIconDot" />
              <span className="capabilityIconDot" />
            </div>
            <div className="capabilityContent">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </section>

      <section id="work" className="work sectionWrap">
        <div className="workHeader reveal">
          <div className="workHeaderLabel">
            <p className="sectionLabel">Selected Work</p>
          </div>
          <h2>
            <span>Recent</span>
            {" "}
            <span>directions</span>
          </h2>
        </div>
        <div className="workList">
          {selectedWork.map((work) => (
            <a
              className="workItem reveal"
              href={work.url}
              key={work.title}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${work.title}`}
            >
              <span>{work.index}</span>
              <h3>{work.title}</h3>
              <p>{work.type}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="philosophy">
        <div className="sectionWrap philosophyInner reveal">
          <p>
            Good software often comes from careful choices, steady iteration,
            and respect for the details.
          </p>
        </div>
      </section>

      <section id="contact" className="contact sectionWrap reveal">
        <p className="sectionLabel">Contact</p>
        <h2>
          Open to thoughtful product, prototype, and research collaborations.
        </h2>
        <a className="contactLink magnetic" href="mailto:work@xiaotongyu.com">
          work@xiaotongyu.com
        </a>
        <span className="emailClickStatus" role="status" aria-live="polite" />
      </section>

      <footer className="footer">
        <div className="footerInner">
          <img src="/xtyopen-logo.svg" alt="xtyopen" />
          <nav aria-label="Social links">
            <a
              href="https://github.com/XiaoTongYuCode"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a href="https://x.com/tongyu_xiao" target="_blank" rel="noreferrer">
              X
            </a>
            <a href="mailto:work@xiaotongyu.com">Email</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}

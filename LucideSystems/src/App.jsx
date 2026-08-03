import { useState, useEffect, useRef } from "react";
import "./App.css";

const SERVICES = [
  {
    title: "Web Design",
    desc: "Interfaces built around how your customers actually think, not a template pulled off a shelf.",
    icon: <path d="M4 4h16v16H4z M4 9h16 M9 9v11" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: "Web Development",
    desc: "Fast, accessible, maintainable code — React, Node, or whatever the job actually calls for.",
    icon: <path d="M8 6 2 12l6 6 M16 6l6 6-6 6 M13 4l-2 16" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: "E-Commerce",
    desc: "Storefronts that convert — Shopify, headless commerce, or a custom checkout built from scratch.",
    icon: <path d="M3 6h18l-2 12H5L3 6z M8 6V4a4 4 0 0 1 8 0v2" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: "Web Applications",
    desc: "Dashboards, portals, and internal tools that hold up under real, daily use.",
    icon: <path d="M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: "SEO & Performance",
    desc: "Sites that load fast and get found — Core Web Vitals, structured data, real optimization.",
    icon: <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: "Ongoing Support",
    desc: "Monitoring, updates, and a team that picks up the phone after launch day, too.",
    icon: <path d="M12 2v4 M12 18v4 M4.9 4.9l2.8 2.8 M16.3 16.3l2.8 2.8 M2 12h4 M18 12h4 M4.9 19.1l2.8-2.8 M16.3 7.7l2.8-2.8" strokeLinecap="round" />,
  },
];

const WORK = [
  { name: "Northwind Freight", tag: "Logistics · Web App", swatch: "swatch-a" },
  { name: "Marrow Coffee Co.", tag: "E-Commerce · Shopify", swatch: "swatch-b" },
  { name: "Attend Health", tag: "Healthcare · Web Platform", swatch: "swatch-c" },
  { name: "Foundry Studio", tag: "Creative Agency · Marketing Site", swatch: "swatch-d" },
  { name: "Ledger & Kin", tag: "Fintech · Dashboard", swatch: "swatch-e" },
  { name: "Basecamp Outdoors", tag: "Retail · E-Commerce", swatch: "swatch-f" },
];

const PROCESS = [
  { step: "01", title: "Discover", desc: "We map your goals, your users, and what \u201cdone\u201d actually looks like." },
  { step: "02", title: "Design", desc: "Wireframes and visual direction, reviewed with you before a line of code ships." },
  { step: "03", title: "Build", desc: "Development in the open — staging links, weekly check-ins, no black box." },
  { step: "04", title: "Launch", desc: "We ship, monitor, and stay on for support once the site is live." },
];

// ---- Hero typewriter ----
// Stage 1: types "LucideSystems." in full, with "Systems" in blue.
// Stage 2: "Lucide" slides/fades away, leaving "Systems" as the anchor.
// Stage 3: "Systems" cycles through short marketing statements forever,
//          ending each loop on a finale line that pulls every highlight together.
const INTRO_FULL = "LucideSystems.";
const LUCIDE_LEN = 6;
const SYSTEMS_LEN = 7;

const CYCLE_PHRASES = [
  [
    { text: " that ", bold: false },
    { text: "scale", bold: true },
    { text: ".", bold: false },
  ],
  [
    { text: " that ", bold: false },
    { text: "Grow.", bold: true },
  ],
  [
    { text: " you ", bold: false },
    { text: " can ", bold: false },
    { text: "trust", bold: true },
    { text: ".", bold: false },
  ],
  [
    { text: ", delivered ", bold: false },
    { text: "fast", bold: true },
    { text: ".", bold: false },
  ],
  [
    { text: " that ", bold: false },
    { text: "Inspire ", bold: true },
    { text: "growth.", bold: true }
  ],
  [
    { text: " that ", bold: false },
    { text: "make ", bold: true },
    { text: "an ", bold: false },
    { text: "impact. ", bold: true }
  ],
];

const INTRO_TYPE_SPEED = 110;
const INTRO_PAUSE = 1500;
const TRANSITION_DURATION = 600;
const CYCLE_TYPE_SPEED = 68;
const DELETE_SPEED = 32;
const PAUSE_FULL = 2200;
const PAUSE_FULL_FINALE = 3200;
const PAUSE_EMPTY = 420;

function renderCycleParts(parts, count) {
  let remaining = count;
  const out = [];
  for (const part of parts) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, part.text.length);
    out.push({ text: part.text.slice(0, take), bold: part.bold });
    remaining -= take;
  }
  return out;
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", type: "New website", budget: "$5k \u2013 $10k", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const [stage, setStage] = useState("introTyping"); // introTyping -> introPause -> transition -> cycle
  const [introLen, setIntroLen] = useState(0);
  const [cycleState, setCycleState] = useState({ phraseIdx: 0, count: 0, deleting: false });
  const timeoutRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const scheduleCycle = (phraseIdx, count, deleting) => {
      if (cancelled) return;
      setCycleState({ phraseIdx, count, deleting });
      const full = CYCLE_PHRASES[phraseIdx].map((p) => p.text).join("");

      if (!deleting) {
        if (count < full.length) {
          timeoutRef.current = setTimeout(() => scheduleCycle(phraseIdx, count + 1, false), CYCLE_TYPE_SPEED);
        } else {
          const isFinale = phraseIdx === CYCLE_PHRASES.length - 1;
          timeoutRef.current = setTimeout(
            () => scheduleCycle(phraseIdx, count, true),
            isFinale ? PAUSE_FULL_FINALE : PAUSE_FULL
          );
        }
      } else {
        if (count > 0) {
          timeoutRef.current = setTimeout(() => scheduleCycle(phraseIdx, count - 1, true), DELETE_SPEED);
        } else {
          const next = (phraseIdx + 1) % CYCLE_PHRASES.length;
          timeoutRef.current = setTimeout(() => scheduleCycle(next, 0, false), PAUSE_EMPTY);
        }
      }
    };

    const scheduleIntro = (len) => {
      if (cancelled) return;
      setIntroLen(len);
      if (len < INTRO_FULL.length) {
        timeoutRef.current = setTimeout(() => scheduleIntro(len + 1), INTRO_TYPE_SPEED);
      } else {
        setStage("introPause");
        timeoutRef.current = setTimeout(() => {
          setStage("transition");
          timeoutRef.current = setTimeout(() => {
            setStage("cycle");
            scheduleCycle(0, 0, false);
          }, TRANSITION_DURATION);
        }, INTRO_PAUSE);
      }
    };

    scheduleIntro(0);
    return () => {
      cancelled = true;
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const lucideShown = INTRO_FULL.slice(0, Math.min(introLen, LUCIDE_LEN));
  const systemsShown = INTRO_FULL.slice(LUCIDE_LEN, Math.min(introLen, LUCIDE_LEN + SYSTEMS_LEN));
  const periodShown = INTRO_FULL.slice(LUCIDE_LEN + SYSTEMS_LEN, introLen);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="app">
      {/* NAV */}
      <header className="nav">
        <div className="nav-inner">
          <button className="logo" onClick={() => scrollTo("top")}>
            <span className="logo-badge">L</span>
            <span className="logo-text">
              Lucide<span className="logo-accent">Systems</span>
            </span>
          </button>

          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
            <button onClick={() => scrollTo("work")}>Work</button>
            <button onClick={() => scrollTo("services")}>Services</button>
            <button onClick={() => scrollTo("process")}>Process</button>
            <button className="nav-cta" onClick={() => scrollTo("start")}>
              Start a Project
            </button>
            <button id="login">Login</button>
            <button id="sign">Sign Up</button>
          </nav>

          <button
            className="menu-toggle"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="hero-glow" aria-hidden="true" />

          <div className="hero-type">
            <h1 className="sr-only">
              LucideSystems. Systems that scale with you, built to convert, trusted by
              customers, and delivered fast — all in one system.
            </h1>
            <div className="type-line" aria-hidden="true">
              {stage !== "cycle" ? (
                <>
                  <span className={`intro-lucide ${stage === "transition" ? "hide" : ""}`}>
                    {lucideShown}
                  </span>
                  <span className="type-grad">{systemsShown}</span>
                  <span className="type-plain">{periodShown}</span>
                  {stage !== "transition" && <span className="cursor" />}
                </>
              ) : (
                <>
                  <span className="type-grad">Systems</span>
                  {renderCycleParts(CYCLE_PHRASES[cycleState.phraseIdx], cycleState.count).map((seg, i) => (
                    <span key={i} className={seg.bold ? "type-grad" : "type-plain"}>
                      {seg.text}
                    </span>
                  ))}
                  <span className="cursor" />
                </>
              )}
            </div>
          </div>

          <p className="hero-sub">
            LucideSystems designs and builds websites, storefronts, and web
            applications for teams who need it done right the first time.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => scrollTo("start")}>
              Get Your Website
            </button>
            <button className="btn btn-ghost" onClick={() => scrollTo("work")}>
              See Our Work
            </button>
          </div>
          <div className="hero-meta">
            <div className="stat">
              <span className="stat-num">99.98%</span>
              <span className="stat-label">Uptime</span>
            </div>
            <div className="stat">
              <span className="stat-num">120+</span>
              <span className="stat-label">Sites shipped</span>
            </div>
            <div className="stat">
              <span className="stat-num">0.8s</span>
              <span className="stat-label">Avg. load time</span>
            </div>
          </div>
        </section>

        {/* START A PROJECT / LEAD FORM */}
        <section id="start" className="start">
          <div className="start-copy">
            <p className="eyebrow">Get started</p>
            <h2>Tell us what you're building.</h2>
            <p className="section-sub">
              Send over the basics and a project lead will reply within one
              business day with next steps and a rough timeline.
            </p>
            <ul className="start-list">
              <li>No obligation, no sales pressure</li>
              <li>Fixed-price or ongoing retainer options</li>
              <li>Free technical audit on existing sites</li>
            </ul>
          </div>

          <form className="start-form" onSubmit={handleSubmit}>
            {submitted ? (
              <div className="form-success">
                <p>Brief received. We'll be in touch shortly.</p>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <label>
                    Name
                    <input name="name" value={form.name} onChange={handleChange} required placeholder="Jane Doe" />
                  </label>
                  <label>
                    Email
                    <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="jane@company.com" />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Company
                    <input name="company" value={form.company} onChange={handleChange} placeholder="Company name" />
                  </label>
                  <label>
                    Project type
                    <select name="type" value={form.type} onChange={handleChange}>
                      <option>New website</option>
                      <option>Redesign</option>
                      <option>E-commerce</option>
                      <option>Web application</option>
                      <option>Ongoing support</option>
                    </select>
                  </label>
                </div>
                <label>
                  Budget range
                  <select name="budget" value={form.budget} onChange={handleChange}>
                    <option>Under $5k</option>
                    <option>$5k \u2013 $10k</option>
                    <option>$10k \u2013 $25k</option>
                    <option>$25k+</option>
                  </select>
                </label>
                <label>
                  Project details
                  <textarea name="message" value={form.message} onChange={handleChange} rows={4} placeholder="What are you trying to build?" />
                </label>
                <button type="submit" className="btn btn-primary btn-block">
                  Send Project Brief
                </button>
              </>
            )}
          </form>
        </section>

        {/* SERVICES */}
        <section id="services" className="services">
          <p className="eyebrow">Services</p>
          <h2>Everything your web team needs, under one roof.</h2>
          <div className="services-grid">
            {SERVICES.map((s) => (
              <div className="service-card" key={s.title}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {s.icon}
                </svg>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WORK */}
        <section id="work" className="work">
          <p className="eyebrow">Selected work</p>
          <h2>Things we've shipped.</h2>
          <div className="work-grid">
            {WORK.map((w) => (
              <a className="work-card" href="#" key={w.name} onClick={(e) => e.preventDefault()}>
                <div className={`work-thumb ${w.swatch}`}>
                  <span className="work-arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
                <div className="work-info">
                  <h3>{w.name}</h3>
                  <p>{w.tag}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" className="process">
          <p className="eyebrow">How we work</p>
          <h2>Four steps. No surprises.</h2>
          <div className="process-list">
            {PROCESS.map((p, i) => (
              <div className="process-step" key={p.step}>
                <span className="process-num">{p.step}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
                {i < PROCESS.length - 1 && <span className="process-line" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </section>

        {/* CTA BAND */}
        <section className="cta-band">
          <h2>Ready to build something that works?</h2>
          <button className="btn btn-primary" onClick={() => scrollTo("start")}>
            Start a Project
          </button>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="logo-badge">L</span>
            <span className="logo-text">
              Lucide<span className="logo-accent">Systems</span>
            </span>
          </div>
          <div className="footer-cols">
            <div>
              <h4>Studio</h4>
              <a href="#" onClick={(e) => e.preventDefault()}>About</a>
              <a href="#" onClick={(e) => e.preventDefault()}>Careers</a>
              <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
            </div>
            <div>
              <h4>Work</h4>
              <button onClick={() => scrollTo("work")}>Case Studies</button>
              <button onClick={() => scrollTo("services")}>Services</button>
              <button onClick={() => scrollTo("process")}>Process</button>
            </div>
            <div>
              <h4>Connect</h4>
              <a href="#" onClick={(e) => e.preventDefault()}>Twitter / X</a>
              <a href="#" onClick={(e) => e.preventDefault()}>LinkedIn</a>
              <a href="#" onClick={(e) => e.preventDefault()}>GitHub</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} LucideSystems. All rights reserved.</span>
          <span>Built with React.</span>
        </div>
      </footer>
    </div>
  );
}
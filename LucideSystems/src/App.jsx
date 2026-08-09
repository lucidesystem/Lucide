import { useState, useEffect, useRef } from "react";
import "./App.css";

const SERVICES = [
  {
    title: "Web Design",
    desc: "Interfaces built around how your customers actually think, not a template pulled off a shelf.",
    icon: (
      <path
        d="M4 4h16v16H4z M4 9h16 M9 9v11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Web Development",
    desc: "Fast, accessible, maintainable code — React, Node, or whatever the job actually calls for.",
    icon: (
      <path
        d="M8 6 2 12l6 6 M16 6l6 6-6 6 M13 4l-2 16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "E-Commerce",
    desc: "Storefronts that convert — Shopify, headless commerce, or a custom checkout built from scratch.",
    icon: (
      <path
        d="M3 6h18l-2 12H5L3 6z M8 6V4a4 4 0 0 1 8 0v2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Web Applications",
    desc: "Dashboards, portals, and internal tools that hold up under real, daily use.",
    icon: (
      <path
        d="M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "SEO & Performance",
    desc: "Sites that load fast and get found — Core Web Vitals, structured data, real optimization.",
    icon: (
      <path
        d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M21 21l-4.35-4.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Ongoing Support",
    desc: "Monitoring, updates, and a team that picks up the phone after launch day, too.",
    icon: (
      <path
        d="M12 2v4 M12 18v4 M4.9 4.9l2.8 2.8 M16.3 16.3l2.8 2.8 M2 12h4 M18 12h4 M4.9 19.1l2.8-2.8 M16.3 7.7l2.8-2.8"
        strokeLinecap="round"
      />
    ),
  },
];

const STATS_URL = "https://rooter-thinkcentre-e73.tailb0c61f.ts.net/stats";
const POLL_MS = 8000;

function formatUptime(seconds) {
  if (!seconds && seconds !== 0) return "—";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

// Polls STATS_URL on an interval, timing each request itself so "latency"
// reflects what an actual visitor experiences, not a server-side ping.
function useServerStats() {
  const [state, setState] = useState({
    status: "connecting", // connecting | online | degraded | offline
    stats: null,
    latencyMs: null,
  });
  const timeoutRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const start = performance.now();
      try {
        const res = await fetch(STATS_URL, { cache: "no-store" });
        const latencyMs = Math.round(performance.now() - start);
        if (!res.ok) throw new Error("bad response");
        const stats = await res.json();
        if (cancelled) return;
        setState({
          status: stats.status === "online" ? "online" : "degraded",
          stats,
          latencyMs,
        });
      } catch {
        if (cancelled) return;
        setState((prev) => ({ ...prev, status: "offline" }));
      } finally {
        if (!cancelled) {
          timeoutRef.current = setTimeout(poll, POLL_MS);
        }
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return state;
}

function ServerStats() {
  const { status, stats, latencyMs } = useServerStats();

  const statusLabel =
    status === "online"
      ? "Online"
      : status === "degraded"
        ? "Degraded"
        : status === "offline"
          ? "Offline"
          : "Connecting…";

  return (
    <section id="server-status" className="services reveal">
      <p className="eyebrow">Live status</p>
      <h2>Our server, in real time.</h2>

      <div className={`status-pill status-${status}`}>
        <span className="status-dot" aria-hidden="true" />
        {statusLabel}
      </div>

      <div className="services-grid reveal-stagger">
        <div className="service-card">
          <h3>Uptime</h3>
          <p className="stat-num">{formatUptime(stats?.uptimeSeconds)}</p>
        </div>
        <div className="service-card">
          <h3>CPU load</h3>
          <p className="stat-num">
            {stats?.cpu?.loadPercent != null ? `${stats.cpu.loadPercent}%` : "—"}
          </p>
        </div>
        <div className="service-card">
          <h3>Memory</h3>
          <p className="stat-num">
            {stats?.memory?.usedPercent != null
              ? `${stats.memory.usedPercent}%`
              : "—"}
          </p>
          <p>
            {stats?.memory
              ? `${stats.memory.usedGB} / ${stats.memory.totalGB} GB`
              : ""}
          </p>
        </div>
        <div className="service-card">
          <h3>Disk</h3>
          <p className="stat-num">
            {stats?.disk?.usedPercent != null ? `${stats.disk.usedPercent}%` : "—"}
          </p>
          <p>
            {stats?.disk ? `${stats.disk.usedGB} / ${stats.disk.totalGB} GB` : ""}
          </p>
        </div>
        <div className="service-card">
          <h3>Latency</h3>
          <p className="stat-num">{latencyMs != null ? `${latencyMs} ms` : "—"}</p>
          <p>to you, right now</p>
        </div>
      </div>
    </section>
  );
}

const WORK = [
  { name: "Northwind Freight", tag: "Logistics · Web App", swatch: "swatch-a" },
  {
    name: "Marrow Coffee Co.",
    tag: "E-Commerce · Shopify",
    swatch: "swatch-b",
  },
  {
    name: "Attend Health",
    tag: "Healthcare · Web Platform",
    swatch: "swatch-c",
  },
  {
    name: "Foundry Studio",
    tag: "Creative Agency · Marketing Site",
    swatch: "swatch-d",
  },
  { name: "Ledger & Kin", tag: "Fintech · Dashboard", swatch: "swatch-e" },
  { name: "Basecamp Outdoors", tag: "Retail · E-Commerce", swatch: "swatch-f" },
];

const PROCESS = [
  {
    step: "01",
    title: "Discover",
    desc: "We map your goals, your users, and what \u201cdone\u201d actually looks like.",
  },
  {
    step: "02",
    title: "Design",
    desc: "Wireframes and visual direction, reviewed with you before a line of code ships.",
  },
  {
    step: "03",
    title: "Build",
    desc: "Development in the open — staging links, weekly check-ins, no black box.",
  },
  {
    step: "04",
    title: "Launch",
    desc: "We ship, monitor, and stay on for support once the site is live.",
  },
];

const VALUES = [
  {
    title: "Ship what we'd use",
    desc: "If we wouldn't run it in production ourselves, it doesn't leave the studio.",
  },
  {
    title: "Plain-language process",
    desc: "No jargon, no black box. You always know what's happening and why.",
  },
  {
    title: "Built to last",
    desc: "Maintainable code and clear documentation, not a site that rots in a year.",
  },
  {
    title: "Small team, direct access",
    desc: "You work with the people actually building your project, not a rotating cast.",
  },
];

const FOUNDERS = [
  {
    name: "Austin Rich",
    role: "Co-Founder",
    bio: "A student on Newton High Schools robotics team, team935, leaded the development of the widley known scouting software called northstar.",
    initials: "MV",
  },
  {
    name: "Sam Menninga",
    role: "Co-Founder",
    bio: "Server Manager and backend specialist. I am good at networking, managing databases, organizing file systems, and full-stack development.",
    initials: "SM",
  },
];

const MILESTONES = [
  {
    step: "2019",
    title: "Founded",
    desc: "Mara and Theo started LucideSystems out of a two-desk office, taking on small business sites.",
  },
  {
    step: "2021",
    title: "First enterprise client",
    desc: "Grew into web applications and dashboards for larger teams, expanding past marketing sites.",
  },
  {
    step: "2023",
    title: "120+ sites shipped",
    desc: "Crossed 120 projects delivered across e-commerce, healthcare, fintech, and logistics.",
  },
  {
    step: "Today",
    title: "A team of specialists",
    desc: "Design, engineering, and ongoing support under one roof, still small enough to know every client by name.",
  },
];

// ============================================================================
// Hero typewriter
//
// Three stages, driven by one state machine:
//   1. introTyping  — types "LucideSystems." in full, "Systems" in blue.
//   2. transition   — "Lucide" slides/fades away, leaving "Systems" as anchor.
//   3. cycle        — "Systems" cycles short marketing lines forever.
//
// Everything below (constants, helpers, and the useHeroTypewriter hook) is
// self-contained so the App component itself doesn't have to know how the
// animation works — it just reads the current frame back out.
// ============================================================================
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
    { text: "growth.", bold: true },
  ],
  [
    { text: " that ", bold: false },
    { text: "make ", bold: true },
    { text: "an ", bold: false },
    { text: "impact. ", bold: true },
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

// Slices a cycle phrase's parts down to `count` characters, preserving
// which parts are bold so the render step doesn't need to re-derive it.
function sliceCyclePhrase(parts, count) {
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

// Owns the whole typing animation. Returns plain data — the strings and
// stage name the hero needs to render this frame — and nothing else.
function useHeroTypewriter() {
  const [stage, setStage] = useState("introTyping"); // introTyping -> introPause -> transition -> cycle
  const [introLen, setIntroLen] = useState(0);
  const [cycleState, setCycleState] = useState({
    phraseIdx: 0,
    count: 0,
    deleting: false,
  });
  const timeoutRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    // Types forward, then deletes back, cycling through CYCLE_PHRASES
    // forever. The last phrase in the list gets a longer pause, acting
    // as a "finale" beat before the loop restarts.
    function runCycleStep(phraseIdx, count, deleting) {
      if (cancelled) return;
      setCycleState({ phraseIdx, count, deleting });
      const fullText = CYCLE_PHRASES[phraseIdx].map((p) => p.text).join("");

      if (!deleting) {
        const stillTyping = count < fullText.length;
        const delay = stillTyping
          ? CYCLE_TYPE_SPEED
          : phraseIdx === CYCLE_PHRASES.length - 1
            ? PAUSE_FULL_FINALE
            : PAUSE_FULL;
        const next = stillTyping
          ? () => runCycleStep(phraseIdx, count + 1, false)
          : () => runCycleStep(phraseIdx, count, true);
        timeoutRef.current = setTimeout(next, delay);
        return;
      }

      const stillDeleting = count > 0;
      if (stillDeleting) {
        timeoutRef.current = setTimeout(
          () => runCycleStep(phraseIdx, count - 1, true),
          DELETE_SPEED,
        );
      } else {
        const nextPhrase = (phraseIdx + 1) % CYCLE_PHRASES.length;
        timeoutRef.current = setTimeout(
          () => runCycleStep(nextPhrase, 0, false),
          PAUSE_EMPTY,
        );
      }
    }

    // Types "LucideSystems." one character at a time, then hands off to
    // the transition beat and finally the cycle loop above.
    function runIntroStep(len) {
      if (cancelled) return;
      setIntroLen(len);
      if (len < INTRO_FULL.length) {
        timeoutRef.current = setTimeout(
          () => runIntroStep(len + 1),
          INTRO_TYPE_SPEED,
        );
        return;
      }
      setStage("introPause");
      timeoutRef.current = setTimeout(() => {
        setStage("transition");
        timeoutRef.current = setTimeout(() => {
          setStage("cycle");
          runCycleStep(0, 0, false);
        }, TRANSITION_DURATION);
      }, INTRO_PAUSE);
    }

    runIntroStep(0);
    return () => {
      cancelled = true;
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    stage,
    lucideShown: INTRO_FULL.slice(0, Math.min(introLen, LUCIDE_LEN)),
    systemsShown: INTRO_FULL.slice(
      LUCIDE_LEN,
      Math.min(introLen, LUCIDE_LEN + SYSTEMS_LEN),
    ),
    periodShown: INTRO_FULL.slice(LUCIDE_LEN + SYSTEMS_LEN, introLen),
    cycleState,
  };
}

// Renders whichever frame of the typewriter is current. Kept separate from
// the hero section markup so that section stays readable.
function AnimatedHeadline({
  stage,
  lucideShown,
  systemsShown,
  periodShown,
  cycleState,
}) {
  if (stage !== "cycle") {
    return (
      <>
        <span className={`intro-lucide ${stage === "transition" ? "hide" : ""}`}>
          {lucideShown}
        </span>
        <span className="type-grad">{systemsShown}</span>
        <span className="type-plain">{periodShown}</span>
        {stage !== "transition" && <span className="cursor" />}
      </>
    );
  }

  return (
    <>
      <span className="type-grad">Systems</span>
      {sliceCyclePhrase(CYCLE_PHRASES[cycleState.phraseIdx], cycleState.count).map(
        (seg, i) => (
          <span key={i} className={seg.bold ? "type-grad" : "type-plain"}>
            {seg.text}
          </span>
        ),
      )}
      <span className="cursor" />
    </>
  );
}

// ============================================================================
// Scroll reveal
//
// Any element with a "reveal" or "reveal-stagger" class fades/rises into
// place the first time it enters the viewport. This hook just wires up the
// IntersectionObserver once per page render — the CSS does the animating.
// ============================================================================
function useScrollReveal(watchedValue) {
  useEffect(() => {
    const targets = document.querySelectorAll(".reveal, .reveal-stagger");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [watchedValue]);
}

// Formspree endpoint for the project-brief form. Sign up free at
// https://formspree.io, create a form, and paste your form ID below —
// every submission will then land in your inbox automatically.
const FORM_ENDPOINT = "https://formspree.io/f/xdenaajk";

export default function App() {
  const [page, setPage] = useState("home"); // "home" | "about"
  const pendingScroll = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    type: "New website",
    budget: "$20 \u2013 $50",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (page === "home" && pendingScroll.current) {
      const id = pendingScroll.current;
      pendingScroll.current = null;
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      });
    } else if (page === "about") {
      window.scrollTo({
        top: 0,
        behavior: "instant" in window ? "instant" : "auto",
      });
    }
  }, [page]);

  const headline = useHeroTypewriter();
  useScrollReveal(page);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSendError(false);
    setSending(true);
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
    } catch (err) {
      // Falls back to a mailto draft so the lead isn't lost if the
      // endpoint above hasn't been configured yet.
      const body = `Name: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company}\nProject type: ${form.type}\nBudget: ${form.budget}\n\n${form.message}`;
      window.location.href = `mailto:hello@lucidesystems.com?subject=${encodeURIComponent(
        "New project brief: " + form.name,
      )}&body=${encodeURIComponent(body)}`;
      setSendError(true);
    } finally {
      setSending(false);
    }
  };

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Navigates to a section, switching back to the home page first if needed.
  const goTo = (id) => {
    setMenuOpen(false);
    if (page !== "home") {
      pendingScroll.current = id;
      setPage("home");
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goToAbout = () => {
    setMenuOpen(false);
    setPage("about");
  };

  return (
    <div className="app">
      {/* NAV */}
      <header className="nav">
        <div className="nav-inner">
          <button
            className="logo"
            onClick={() => {
              setMenuOpen(false);
              setPage("home");
            }}
          >
            <span className="logo-badge">L</span>
            <span className="logo-text">
              Lucide<span className="logo-accent">Systems</span>
            </span>
          </button>

          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
            <div id="nav-links-div">
              <button onClick={() => goTo("services")}>Services</button>
              <button onClick={() => goTo("work")}>Work</button>
              <button onClick={() => goTo("process")}>Process</button>
              <button onClick={goToAbout}>About</button>
              <button className="nav-cta" onClick={() => goTo("start")}>
                Start a Project
              </button>
            </div>
          </nav>

          <button
            className={`menu-toggle ${menuOpen ? "open" : ""}`}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <main id="top">
        {page === "about" ? (
          <div className="page-enter" key="about">
            <AboutPage onStart={() => goTo("start")} />
          </div>
        ) : (
          <div className="page-enter" key="home">
            {/* HERO */}
            <section className="hero">
              <div className="hero-glow" aria-hidden="true" />

              <div className="hero-type">
                <h1 className="sr-only">
                  LucideSystems. Systems that scale with you, built to convert,
                  trusted by customers, and delivered fast — all in one system.
                </h1>
                <div className="type-line" aria-hidden="true">
                  <AnimatedHeadline {...headline} />
                </div>
              </div>

              <p className="hero-sub">
                LucideSystems designs and builds websites, storefronts, and web
                applications for teams who need it done right the first time.
              </p>
              <div className="hero-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => scrollTo("start")}
                >
                  Get Your Website
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => scrollTo("work")}
                >
                  See Our Work
                </button>
              </div>
              <div className="hero-meta reveal">
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

            {/* LIVE SERVER STATUS */}
            <ServerStats />

            {/* START A PROJECT / LEAD FORM */}
            <section id="start" className="start reveal">
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
                    {sendError && (
                      <p className="form-note">
                        Couldn't reach our inbox automatically, so we opened an
                        email draft for you instead — hit send there and we've
                        got it.
                      </p>
                    )}
                    <div className="form-row">
                      <label>
                        Name
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          placeholder="Jane Doe"
                        />
                      </label>
                      <label>
                        Email
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          placeholder="jane@company.com"
                        />
                      </label>
                    </div>
                    <div className="form-row">
                      <label>
                        Company
                        <input
                          name="company"
                          value={form.company}
                          onChange={handleChange}
                          placeholder="Company name"
                        />
                      </label>
                      <label>
                        Project type
                        <select
                          name="type"
                          value={form.type}
                          onChange={handleChange}
                        >
                          <option>New website</option>
                          <option> Website Redesign</option>
                        </select>
                      </label>
                    </div>
                    <label>
                      Budget range
                      <select
                        name="budget"
                        value={form.budget}
                        onChange={handleChange}
                      >
                        <option>$100 and below</option>
                        <option>$100 - $300</option>
                        <option>$300+</option>
                      </select>
                    </label>
                    <label>
                      Project details
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={4}
                        placeholder="What are you trying to build?"
                      />
                    </label>
                    <button
                      type="submit"
                      className="btn btn-primary btn-block"
                      disabled={sending}
                    >
                      {sending ? "Sending\u2026" : "Send Project Brief"}
                    </button>
                  </>
                )}
              </form>
            </section>

            {/* SERVICES */}
            <section id="services" className="services reveal">
              <p className="eyebrow">Services</p>
              <h2>Everything your web team needs, under one roof.</h2>
              <div className="services-grid reveal-stagger">
                {SERVICES.map((s) => (
                  <div className="service-card" key={s.title}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      {s.icon}
                    </svg>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* WORK */}
            <section id="work" className="work reveal">
              <p className="eyebrow">Selected work</p>
              <h2>Things we've shipped.</h2>
              <div className="work-grid reveal-stagger">
                {WORK.map((w) => (
                  <a
                    className="work-card"
                    href="#"
                    key={w.name}
                    onClick={(e) => e.preventDefault()}
                  >
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
            <section id="process" className="process reveal">
              <p className="eyebrow">How we work</p>
              <h2>Four steps. No surprises.</h2>
              <div className="process-list reveal-stagger">
                {PROCESS.map((p, i) => (
                  <div className="process-step" key={p.step}>
                    <span className="process-num">{p.step}</span>
                    <div>
                      <h3>{p.title}</h3>
                      <p>{p.desc}</p>
                    </div>
                    {i < PROCESS.length - 1 && (
                      <span className="process-line" aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* CTA BAND */}
            <section className="cta-band reveal">
              <h2>Ready to build something that works?</h2>
              <button
                className="btn btn-primary"
                onClick={() => scrollTo("start")}
              >
                Start a Project
              </button>
            </section>
          </div>
        )}
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
              <button onClick={goToAbout}>About</button>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Careers
              </a>
              <button onClick={() => goTo("start")}>Contact</button>
            </div>
            <div>
              <h4>Work</h4>
              <button onClick={() => goTo("work")}>Case Studies</button>
              <button onClick={() => goTo("services")}>Services</button>
              <button onClick={() => goTo("process")}>Process</button>
            </div>
            <div>
              <h4>Connect</h4>
              <a href="#" onClick={(e) => e.preventDefault()}>
                Twitter / X
              </a>
              <a href="#" onClick={(e) => e.preventDefault()}>
                LinkedIn
              </a>
              <a href="#" onClick={(e) => e.preventDefault()}>
                GitHub
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} LucideSystems. All rights reserved.
          </span>
          <span>Built with React.</span>
        </div>
      </footer>
    </div>
  );
}

function AboutPage({ onStart }) {
  return (
    <>
      {/* ABOUT HERO */}
      <section className="hero about-hero">
        <div className="hero-glow" aria-hidden="true" />
        <p className="eyebrow">About us</p>
        <h1 className="type-line">
          A small business for{" "}
          <span className="type-grad">small business.</span>
        </h1>
        <p className="hero-sub">
          LucideSystems is an independent web design and development business. Built by students who love what they do, and want to help the local community flourish.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={onStart}>
            Start a Project
          </button>
        </div>
      </section>

      {/* STORY */}
      <section className="about-story reveal">
        <div className="about-story-copy">
          <p className="eyebrow">Our story</p>
          <h2>Started with a hobby and a future inmind</h2>
          <p>
            LucideSystems was founded on (xx/yy/zzzz) by two high school students Austin Rich and Sam Menninga. 
            As we investigated the small business community, we realized how far behind they were from lack of funds, no skills to build their own sites, or noo time.
          </p>
          <p>
            LucideSystems looks to close the gap between small businesses and how the rest of the world functions.
          </p>
        </div>
        <div className="about-stats">
          <div className="stat">
            <span className="stat-num">2019</span>
            <span className="stat-label">Founded</span>
          </div>
          <div className="stat">
            <span className="stat-num">120+</span>
            <span className="stat-label">Sites shipped</span>
          </div>
          <div className="stat">
            <span className="stat-num">12</span>
            <span className="stat-label">People on the team</span>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="services about-values reveal">
        <p className="eyebrow">What we value</p>
        <h2>How we make it affordable, yet customizable.</h2>
        <div className="services-grid reveal-stagger">
          {VALUES.map((v) => (
            <div className="service-card" key={v.title}>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOUNDERS */}
      <section className="founders reveal">
        <p className="eyebrow">Leadership</p>
        <h2>Founders &amp; team leads.</h2>
        <div className="founders-grid reveal-stagger">
          {FOUNDERS.map((f) => (
            <div className="founder-card" key={f.name}>
              <div className="founder-avatar">{f.initials}</div>
              <h3>{f.name}</h3>
              <p className="founder-role">{f.role}</p>
              <p>{f.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MILESTONES */}
      <section className="process about-milestones reveal">
        <p className="eyebrow">Milestones</p>
        <h2>Where we've been.</h2>
        <div className="process-list reveal-stagger">
          {MILESTONES.map((m, i) => (
            <div className="process-step" key={m.step}>
              <span className="process-num">{m.step}</span>
              <div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
              </div>
              {i < MILESTONES.length - 1 && (
                <span className="process-line" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band reveal">
        <h2>Want to work with us?</h2>
        <button className="btn btn-primary" onClick={onStart}>
          Start a Project
        </button>
      </section>
    </>
  );
}


"use client";

import { useEffect, useState } from "react";

const projects = [
  {
    number: "01",
    name: "Digital Experiences",
    type: "WEB DEVELOPMENT",
    description:
      "Exploring modern interfaces, interactive experiences and digital products.",
  },
  {
    number: "02",
    name: "Intelligent Systems",
    type: "AI & TECHNOLOGY",
    description:
      "Exploring automation, AI workflows and intelligent system architecture.",
  },
  {
    number: "03",
    name: "Business Innovation",
    type: "ENTREPRENEURSHIP",
    description:
      "Connecting business thinking with technology and practical innovation.",
  },
];

const featured = [
  {
    number: "01.",
    type: "EXPERIENCE",
    title: "Business Operations",
    description:
      "Practical exposure to customer relations, projects and business development.",
    href: "#ventures",
  },
  {
    number: "02.",
    type: "EXPLORATION",
    title: "AI & Technology",
    description:
      "Exploring intelligent tools, digital systems and emerging technologies.",
    href: "#interests",
  },
  {
    number: "03.",
    type: "DIRECTION",
    title: "Digital Experiences",
    description:
      "Building knowledge around modern interfaces and meaningful digital products.",
    href: "#projects",
  },
];

type Spark = {
  id: number;
  x: number;
  y: number;
  angle: number;
  color: string;
};

export default function Home() {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // Colourful cursor-following particles
  useEffect(() => {
    let last = 0;
    let id = 0;

    const colors = [
      "#ff5267",
      "#a78bfa",
      "#ffd166",
      "#69d8e7",
      "#f4f0ed",
    ];

    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      const now = Date.now();

      if (now - last < 42) return;
      last = now;

      const spark: Spark = {
        id: id++,
        x: event.clientX,
        y: event.clientY,
        angle: Math.random() * 360,
        color: colors[id % colors.length],
      };

      setSparks((current) => [...current.slice(-17), spark]);

      window.setTimeout(() => {
        setSparks((current) =>
          current.filter((item) => item.id !== spark.id)
        );
      }, 720);
    };

    window.addEventListener("pointermove", move, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", move);
    };
  }, []);

  // Scroll reveal animation
  useEffect(() => {
    const elements =
      document.querySelectorAll<HTMLElement>(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main>
      {/* CURSOR PARTICLES */}
      <div className="cursor-trail" aria-hidden="true">
        {sparks.map((spark) => (
          <span
            className="cursor-spark"
            key={spark.id}
            style={{
              left: spark.x,
              top: spark.y,
              color: spark.color,
              backgroundColor: spark.color,
              transform: `translate(-50%, -50%) rotate(${spark.angle}deg)`,
              clipPath:
                "polygon(50% 0%, 100% 100%, 0% 100%)",
              width: "12px",
              height: "12px",
              position: "fixed",
              pointerEvents: "none",
            }}
          />
        ))}
      </div>

      {/* NAVIGATION */}
      <nav className="navbar">
        <a
          className="brand"
          href="#home"
          aria-label="Niranjan Yadav home"
          onClick={closeMenu}
        >
          <span className="brand-mark">NY</span>
          <span className="brand-name">
            NIRANJAN<span className="accent">.</span>
          </span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>

        <div
          className={`nav-links ${
            menuOpen ? "nav-links-open" : ""
          }`}
        >
          <a href="#about" onClick={closeMenu}>ABOUT</a>
          <a href="#interests" onClick={closeMenu}>INTERESTS</a>
          <a href="#ventures" onClick={closeMenu}>EXPERIENCE</a>
          <a href="#projects" onClick={closeMenu}>PROJECTS</a>
          <a href="#contact" onClick={closeMenu}>CONTACT</a>
        </div>

        <a className="nav-status" href="#contact">
          <span className="status-dot" />
          AVAILABLE FOR CONNECTION
        </a>
      </nav>

      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-grid" />

        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <div
          className="hero-wordmark"
          aria-hidden="true"
        >
          PORTFOLIO
        </div>

        <div className="hero-layout">

          {/* HERO CONTENT */}
          <div className="hero-content">
            <div className="eyebrow">
              <span className="status-dot" />
              PERSONAL PORTFOLIO
              <span className="eyebrow-divider">/</span>
              2026
            </div>

            <p className="hero-pretitle">
              Hello, I&apos;m
            </p>

            <h1>
              NIRANJAN
              <br />
              <span>
                YADAV<span className="accent">.</span>
              </span>
            </h1>

            <div className="role-tag">
              <span className="status-dot" />
              BUSINESS &amp; TECHNOLOGY ENTHUSIAST
            </div>

            <p className="hero-description">
              Exploring the intersection of business,
              technology and innovation. Interested in
              turning ideas into meaningful experiences
              through continuous learning and execution.
            </p>

            <div className="hero-actions">
              <a className="primary-link" href="#contact">
                INITIATE A CONVERSATION <span>↗</span>
              </a>

              <a className="secondary-link" href="#about">
                EXPLORE MY JOURNEY
              </a>
            </div>

            <div className="hero-stats">
              <div>
                <strong>01</strong>
                <span>BUSINESS EXPOSURE</span>
              </div>

              <div>
                <strong>04</strong>
                <span>AREAS OF INTEREST</span>
              </div>

              <div>
                <strong>∞</strong>
                <span>ROOM TO EVOLVE</span>
              </div>
            </div>
          </div>

          {/* YOUR PROFILE PHOTOGRAPH */}
          <div className="portrait-column">
            <div className="portrait-card">

              <div className="portrait-topline">
                <span>PROFILE / 001</span>
                <span>INDIA</span>
              </div>

              <div className="portrait-placeholder">
                <img
                  className="portrait-photo"
                  src="/niranjan.JPG"
                  alt="Niranjan Yadav"
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "380px",
                    objectFit: "cover",
                    objectPosition: "center 25%",
                    display: "block",
                  }}
                />

                <span className="portrait-caption">
                  NIRANJAN YADAV / 2026
                </span>
              </div>

              <div className="portrait-status">
                <span className="status-dot" />
                INDEPENDENT THINKING ACTIVE
              </div>
            </div>

            <span className="portrait-index">
              FIG. 01 — NIRANJAN YADAV
            </span>
          </div>

          {/* FEATURED CONTENT */}
          <aside className="hero-featured">
            <div className="featured-heading">
              <span>SELECTED FOCUS</span>
              <span>01 — 03</span>
            </div>

            {featured.map((item) => (
              <a
                className="featured-card"
                href={item.href}
                key={item.number}
              >
                <span className="featured-number">
                  {item.number}
                </span>

                <span className="featured-type">
                  {item.type}
                </span>

                <h3>{item.title}</h3>

                <p>{item.description}</p>

                <span className="featured-arrow">↗</span>
              </a>
            ))}

            <div className="tech-tags">
              <span>Business</span>
              <span>Technology</span>
              <span>AI</span>
              <span>Innovation</span>
            </div>
          </aside>

        </div>

        <div className="hero-index">
          <span>01 / 05 — INTRODUCTION</span>
          <span>INDEPENDENT THINKING. CONTINUOUS EVOLUTION.</span>
        </div>

{/* FLOATING PARTICLE FIELD */}
<div className="particle-field" aria-hidden="true">
  {Array.from({ length: 18 }).map((_, i) => (
    <span
      key={i}
      className={`particle particle-${(i % 6) + 1}`}
    />
  ))}
</div>

        <a className="scroll-cue" href="#about">
          <span />
          SCROLL TO EXPLORE
        </a>
      </section>

      {/* ABOUT SECTION */}
      <section className="section about-section" id="about">
        <div className="section-label">
          <span>01 / ABOUT</span>
          <span>GET TO KNOW ME</span>
        </div>

        <div className="about-content reveal">
          <h2>
            Business mindset.
            <br />
            <span className="muted">Technology driven.</span>
            <br />
            Future focused<span className="accent">.</span>
          </h2>

          <div className="about-copy">
            <p>
              I&apos;m Niranjan Yadav — curious about
              business, technology, digital innovation
              and emerging ideas.
            </p>

            <p>
              I believe in continuous learning, exploring
              new possibilities and gaining practical
              experience that creates real value.
            </p>

            <a className="text-link" href="#contact">
              CONNECT WITH ME ↗
            </a>
          </div>
        </div>
      </section>

      {/* INTERESTS SECTION */}
      <section
        className="section interests-section"
        id="interests"
      >
        <div className="section-label">
          <span>02 / INTERESTS</span>
          <span>AREAS OF EXPLORATION</span>
        </div>

        <div className="interest-grid reveal">
          <div className="interest-card">
            <span>01</span>
            <div className="interest-icon">⌘</div>
            <h3>TECHNOLOGY</h3>
            <p>Modern tools, software and digital ecosystems.</p>
          </div>

          <div className="interest-card">
            <span>02</span>
            <div className="interest-icon">◎</div>
            <h3>ARTIFICIAL INTELLIGENCE</h3>
            <p>Intelligent systems, automation and AI innovation.</p>
          </div>

          <div className="interest-card">
            <span>03</span>
            <div className="interest-icon">↗</div>
            <h3>ENTREPRENEURSHIP</h3>
            <p>Business development, strategy and new opportunities.</p>
          </div>

          <div className="interest-card">
            <span>04</span>
            <div className="interest-icon">✳</div>
            <h3>DIGITAL INNOVATION</h3>
            <p>Creative thinking and meaningful digital experiences.</p>
          </div>
        </div>
      </section>

      {/* EXPERIENCE SECTION */}
      <section
        className="section ventures-section"
        id="ventures"
      >
        <div className="section-label">
          <span>03 / EXPERIENCE</span>
          <span>LEARNING THROUGH EXPOSURE</span>
        </div>

        <div className="projects-heading reveal">
          <h2>
            BUSINESS INTO
            <br />
            <span className="accent">OPPORTUNITY.</span>
          </h2>

          <p>
            Practical exposure, business operations and
            an interest in how ideas become meaningful results.
          </p>
        </div>

        <div className="venture-card reveal">
          <div className="venture-number">
            01 <span>/ BUSINESS VENTURE</span>
          </div>

          <div className="venture-main">
            <div className="venture-kicker">
              ALUMINIUM &amp; ARCHITECTURAL SOLUTIONS
            </div>

            <h3>NS ALUMINIUM</h3>

            <p className="project-subtitle">
              Aluminium Solutions &amp; Architectural Innovation
            </p>

            <p>
              Exposure to business operations, customer
              relations, project coordination and business
              development in the aluminium and architectural
              solutions industry.
            </p>

            <span className="venture-location">
              JHUMRI TELAIYA, JHARKHAND
            </span>
          </div>

          <span className="venture-arrow">↗</span>
        </div>

        <p className="clarification-note">
          Professional experience and exposure — not a claim
          of business ownership.
        </p>
      </section>

      {/* PROJECTS SECTION */}
      <section
        className="section projects-section"
        id="projects"
      >
        <div className="section-label">
          <span>04 / PROJECTS</span>
          <span>IDEAS INTO EXECUTION</span>
        </div>

        <div className="projects-heading reveal">
          <h2>
            SELECTED
            <br />
            EXPLORATIONS<span className="accent">.</span>
          </h2>

          <p>
            A growing collection of interests, experiments
            and future projects.
          </p>
        </div>

        <div className="project-list reveal">
          {projects.map((project) => (
            <article
              className="project-row"
              key={project.number}
            >
              <span className="project-number">
                {project.number}
              </span>

              <div className="project-info">
                <span>{project.type}</span>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
              </div>

              <span className="project-arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="contact-section" id="contact">
        <div className="section-label">
          <span>05 / CONTACT</span>
          <span>OPEN TO CONVERSATIONS</span>
        </div>

        <p className="contact-kicker">HAVE AN IDEA?</p>

        <h2>
          LET&apos;S BUILD
          <br />
          SOMETHING <span>GREAT.</span>
        </h2>

        <a
          className="contact-link"
          href="mailto:hello@example.com"
        >
          START A CONVERSATION ↗
        </a>

        <footer>
          <a className="brand" href="#home">
            <span className="brand-mark">NY</span>
            <span className="brand-name">
              NIRANJAN<span className="accent">.</span>
            </span>
          </a>

          <p>DESIGNED TO EVOLVE. © 2026 NIRANJAN YADAV</p>

          <a href="#home">BACK TO TOP ↑</a>
        </footer>
      </section>
    </main>
  );
}

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Coffee, Calculator, Shuffle, Sparkles, IceCreamCone, Lightbulb, ChevronDown } from "lucide-react";

/* ── Scroll parallax setup ── */
function useParallax(scrollYProgress, output) {
  const raw = useTransform(scrollYProgress, [0, 1], output);
  return useSpring(raw, { stiffness: 80, damping: 20, restDelta: 0.001 });
}

/* ── Counting stat number ── */
function CountUp({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const isDecimal = String(target).includes(".");
        const duration = 1000;
        const steps = 40;
        const step = duration / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += 1;
          const val = Math.min(
            isDecimal ? parseFloat((target * current / steps).toFixed(1)) : Math.round(target * current / steps),
            target
          );
          setCount(val);
          if (current >= steps) clearInterval(timer);
        }, step);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Hero container for useScroll ── */
const FEATURES = [
  {
    color: "blue",
    icon: <Calculator size={28} />,
    title: "Real Computed Gaps",
    desc: "A deterministic grid search finds the most under-served point in flavor space before the AI is ever called — and you watch the point land inside it.",
    initRotate: -3,
  },
  {
    color: "pink",
    icon: <Shuffle size={28} />,
    title: "Coordinated Batches",
    desc: "Refresh the whole menu at once — a greedy farthest-point search spreads multiple drinks across the open space instead of clustering.",
    initRotate: 0,
  },
  {
    color: "yellow",
    icon: <Coffee size={28} />,
    title: "Honest Costing",
    desc: "Real arithmetic from your entered prices, or a bundled reference table — never a guess dressed up as a computation.",
    initRotate: 3,
  },
];

const MARQUEE_TEXT = "Computed, not retrieved  •  Real flavor math  •  Deterministic gap search  •  Honest cost arithmetic  •  No vibes allowed  •  5-axis flavor space  •  ";

export default function LandingPage({ onStart }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });

  // Parallax layers at different depths
  const headlineY = useParallax(scrollYProgress, [0, -90]);
  const subY      = useParallax(scrollYProgress, [0, -55]);
  const badgeY    = useParallax(scrollYProgress, [0, -35]);
  const icon1Y    = useParallax(scrollYProgress, [0, -160]); // closest, fastest
  const icon2Y    = useParallax(scrollYProgress, [0, -60]);  // furthest, slowest
  const icon3Y    = useParallax(scrollYProgress, [0, -110]); // mid
  const heroBgY   = useParallax(scrollYProgress, [0, -20]);  // very subtle bg drift

  return (
    <div className="landing" ref={containerRef}>

      {/* ── Hero ── */}
      <section className="landing-hero">
        {/* Parallax background dot grid drift */}
        <motion.div className="landing-hero-bg" style={{ y: heroBgY }} aria-hidden />

        {/* Floating icons at three different parallax depths */}
        <motion.div
          className="landing-float"
          style={{ top: 50, left: "7%", y: icon1Y }}
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles size={42} />
        </motion.div>
        <motion.div
          className="landing-float"
          style={{ top: 90, right: "8%", y: icon2Y }}
          animate={{ rotate: [0, -6, 6, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        >
          <IceCreamCone size={48} />
        </motion.div>
        <motion.div
          className="landing-float"
          style={{ top: 14, right: "27%", y: icon3Y }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
        >
          <Coffee size={36} />
        </motion.div>

        {/* Content layers — each at a different parallax depth */}
        <div className="landing-hero-content">
          <motion.div
            className="header-eyebrow landing-badge"
            style={{ y: badgeY }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
          >
            ☕ Hey, café owner!
          </motion.div>

          <motion.h1
            className="landing-h1"
            style={{ y: headlineY }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.12 }}
          >
            Stop Guessing. <br />
            <span className="landing-h1-accent">
              Start Computing.
            </span>
          </motion.h1>

          <motion.p
            className="landing-sub"
            style={{ y: subY }}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.22 }}
          >
            It's 7am, the oat milk delivery didn't show, and three drinks on the board can't be made.
            Palette invents a complete, original drink from exactly what's in the building today —
            <span className="landing-sub-accent"> computed, not retrieved.</span>
          </motion.p>

          <motion.div
            className="landing-cta-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.5 }}
          >
            <motion.button
              type="button"
              className="compute-btn landing-cta"
              onClick={onStart}
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Coffee size={18} /> Start Inventing <ArrowRight size={18} />
            </motion.button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown size={28} />
            </motion.div>
            <span>scroll to explore</span>
          </motion.div>
        </div>
      </section>

      {/* ── Marquee strip ── */}
      <div className="landing-marquee" aria-hidden>
        <div className="landing-marquee-track">
          <span>{MARQUEE_TEXT.repeat(4)}</span>
        </div>
      </div>

      {/* ── Feature cards — staggered entrance with initial rotation ── */}
      <section className="landing-features">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            className={`refresh-card landing-feature-card landing-feature-card--${f.color}`}
            initial={{ opacity: 0, y: 50, rotate: f.initRotate, scale: 0.92 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ type: "spring", stiffness: 130, damping: 16, delay: i * 0.14 }}
            whileHover={{ y: -10, rotate: f.initRotate * 0.4, scale: 1.02 }}
          >
            <motion.div
              className="landing-feature-icon"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              {f.icon}
            </motion.div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* ── Stats box — parallax inner glow + counting numbers ── */}
      <motion.section
        className="landing-stats"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ type: "spring", stiffness: 90, damping: 18 }}
      >
        <motion.div
          className="landing-stats-glow"
          animate={{ scale: [1, 1.3, 1], x: [0, 20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="landing-stats-inner">
          <motion.div
            className="landing-stats-copy"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 16, delay: 0.1 }}
          >
            <h2>
              Built on real math, <br /><span className="landing-h1-accent">not vibes.</span>
            </h2>
            <p>Every number on screen is something you can verify by hand.</p>
          </motion.div>
          <motion.div
            className="landing-stats-grid"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 16, delay: 0.18 }}
          >
            <div className="landing-stat">
              <div className="landing-stat-value"><CountUp target={5} /></div>
              <div className="landing-stat-label">Flavor axes tracked</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat-value"><CountUp target={100} suffix="%" /></div>
              <div className="landing-stat-label">Deterministic gap math</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat-value">&lt;2s</div>
              <div className="landing-stat-label">Tweak regeneration</div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── Footer CTA ── */}
      <motion.div
        className="landing-footer-cta"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, damping: 16 }}
      >
        <Lightbulb size={18} />
        <span>Ready when you are.</span>
        <motion.button
          type="button"
          className="refresh-btn"
          onClick={onStart}
          whileHover={{ scale: 1.04, rotate: -1 }}
          whileTap={{ scale: 0.96 }}
        >
          Open the workspace <ArrowRight size={15} />
        </motion.button>
      </motion.div>
    </div>
  );
}

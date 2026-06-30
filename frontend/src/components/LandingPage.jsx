import { motion } from "framer-motion";
import { ArrowRight, Coffee, Calculator, Shuffle, Sparkles, IceCreamCone, Lightbulb } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 28, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 110, damping: 12 } },
};

const floatLoop = (delay) => ({
  y: [-10, 10, -10],
  transition: { duration: 3.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay },
});

const FEATURES = [
  {
    color: "blue",
    icon: <Calculator size={28} />,
    title: "Real Computed Gaps",
    desc: "A deterministic grid search finds the most under-served point in flavor space before the AI is ever called — and you watch the point land inside it.",
    rotate: "rotate-2",
  },
  {
    color: "pink",
    icon: <Shuffle size={28} />,
    title: "Coordinated Batches",
    desc: "Refresh the whole menu at once — a greedy farthest-point search spreads multiple drinks across the open space instead of clustering.",
    rotate: "-rotate-2",
  },
  {
    color: "yellow",
    icon: <Coffee size={28} />,
    title: "Honest Costing",
    desc: "Real arithmetic from your entered prices, or a bundled reference table — never a guess dressed up as a computation.",
    rotate: "rotate-2",
  },
];

export default function LandingPage({ onStart }) {
  return (
    <div className="landing">
      {/* Hero */}
      <motion.section className="landing-hero" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div animate={floatLoop(0)} className="landing-float" style={{ top: 40, left: "8%" }}>
          <Sparkles size={40} />
        </motion.div>
        <motion.div animate={floatLoop(0.6)} className="landing-float" style={{ top: 100, right: "10%" }}>
          <IceCreamCone size={46} />
        </motion.div>
        <motion.div animate={floatLoop(1.1)} className="landing-float" style={{ top: 10, right: "28%" }}>
          <Coffee size={34} />
        </motion.div>

        <motion.div variants={itemVariants} className="header-eyebrow landing-badge">
          ☕ Hey, café owner!
        </motion.div>

        <motion.h1 variants={itemVariants} className="landing-h1">
          Stop Guessing. <br />
          <span className="landing-h1-accent">Start Computing.</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="landing-sub">
          It's 7am, the oat milk delivery didn't show, and three drinks on the board can't be made.
          Palette invents a complete, original drink from exactly what's in the building today —
          computed, not retrieved.
        </motion.p>

        <motion.div variants={itemVariants} className="landing-cta-row">
          <motion.button
            type="button"
            className="compute-btn landing-cta"
            onClick={onStart}
            whileHover={{ scale: 1.04, rotate: -1 }}
            whileTap={{ scale: 0.96 }}
          >
            <Coffee size={18} /> Start Inventing <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </motion.section>

      {/* Feature grid — scroll reveal */}
      <motion.section
        className="landing-features"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            className={`refresh-card landing-feature-card landing-feature-card--${f.color}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.12 }}
            whileHover={{ y: -8, rotate: 0 }}
          >
            <div className="landing-feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Stats teaser — scroll reveal */}
      <motion.section
        className="landing-stats"
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="landing-stats-glow"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="landing-stats-inner">
          <div className="landing-stats-copy">
            <h2>
              Built on real math, <br /><span className="landing-h1-accent">not vibes.</span>
            </h2>
            <p>Every number on screen is something you can verify by hand.</p>
          </div>
          <div className="landing-stats-grid">
            <div className="landing-stat">
              <div className="landing-stat-value">5</div>
              <div className="landing-stat-label">Flavor axes tracked</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat-value">100%</div>
              <div className="landing-stat-label">Deterministic gap math</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat-value">&lt;2s</div>
              <div className="landing-stat-label">Tweak regeneration</div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.div
        className="landing-footer-cta"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Lightbulb size={18} />
        <span>Ready when you are.</span>
        <motion.button
          type="button"
          className="refresh-btn"
          onClick={onStart}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
        >
          Open the workspace <ArrowRight size={15} />
        </motion.button>
      </motion.div>
    </div>
  );
}

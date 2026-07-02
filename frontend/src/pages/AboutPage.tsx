import React from 'react';
import { motion } from 'framer-motion';
import './Pages.css';

const AboutPage: React.FC = () => (
  <div className="page about-page">
    <div className="page-hero">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="page-label">Our Story</div>
        <h1 className="page-title">Born from<br />Restraint.</h1>
        <p className="page-sub">TozYcozY was founded on a single belief: that true luxury lies in what you remove, not what you add.</p>
      </motion.div>
    </div>

    <motion.div
      className="about-story"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.1 }}
    >
      <div className="story-text">
        <h2>Why TozYcozY?</h2>
        <p>The name is a duality — <strong>TOZY</strong> for the warmth of refined comfort, <strong>COZY</strong> for the ease of living beautifully. Together, they describe the feeling we want you to carry all day.</p>
        <p>We started in a small studio with one obsession: make a shirt that feels as good as it looks. Three years and hundreds of prototypes later, we found our formula — premium linen, minimal design, obsessive finishing.</p>
        <p>We're a small team. We know every supplier by name. We visit every factory. And we reject anything that doesn't meet the standard.</p>
      </div>
      <div className="story-aside">
        <div className="aside-stat"><span className="aside-num">2024</span><span className="aside-label">Founded</span></div>
        <div className="aside-stat"><span className="aside-num">India</span><span className="aside-label">Crafted in</span></div>
        <div className="aside-stat"><span className="aside-num">2</span><span className="aside-label">Core Products</span></div>
      </div>
    </motion.div>

    <motion.div
      className="about-values"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.15 }}
    >
      <h2 className="values-title">What We Stand For</h2>
      <div className="values-grid">
        {[
          { icon: '◈', title: 'Minimal',  desc: 'No logos, no noise. The fabric speaks.' },
          { icon: '◉', title: 'Honest',   desc: 'Transparent pricing. Real materials. No greenwashing.' },
          { icon: '◌', title: 'Durable',  desc: 'Designed to outlive trends by decades.' },
          { icon: '◎', title: 'Local',    desc: 'Indian artisans, global standards.' },
        ].map(v => (
          <div key={v.title} className="value-item">
            <div className="value-icon">{v.icon}</div>
            <h3>{v.title}</h3>
            <p>{v.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

export default AboutPage;

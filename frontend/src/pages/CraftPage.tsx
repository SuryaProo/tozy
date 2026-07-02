import React from 'react';
import { motion } from 'framer-motion';
import './Pages.css';

const STEPS = [
  { num: '01', title: 'Sourcing',   desc: 'We hand-pick 180 GSM European linen and full-grain Italian leather — nothing less makes the cut.' },
  { num: '02', title: 'Cutting',    desc: 'Precision laser-guided cutting ensures every panel is identical. Zero fabric waste.' },
  { num: '03', title: 'Stitching',  desc: 'Double-reinforced lockstitch seams. Each piece stitched by artisans with 10+ years experience.' },
  { num: '04', title: 'Finishing',  desc: 'Hand-pressed collars, natural wood buttons, and a final QC inspection before packaging.' },
];

const CraftPage: React.FC = () => (
  <div className="page craft-page">
    <div className="page-hero">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0 }}
      >
        <div className="page-label">Our Process</div>
        <h1 className="page-title">The Art of<br />Making.</h1>
        <p className="page-sub">Every TozYcozY piece passes through four meticulous stages before it earns the right to wear our name.</p>
      </motion.div>
    </div>

    <div className="craft-steps">
      {STEPS.map((s, i) => (
        <motion.div
          key={s.num}
          className="craft-step"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: i * 0.1 }}
        >
          <div className="step-num">{s.num}</div>
          <div className="step-body">
            <h3 className="step-title">{s.title}</h3>
            <p className="step-desc">{s.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>

    <motion.div
      className="craft-values"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <div className="value-card"><div className="value-num">180</div><div className="value-label">GSM Linen Weight</div></div>
      <div className="value-card"><div className="value-num">48h</div><div className="value-label">Per Garment Craft Time</div></div>
      <div className="value-card"><div className="value-num">0%</div><div className="value-label">Synthetic Dyes Used</div></div>
      <div className="value-card"><div className="value-num">100%</div><div className="value-label">Hand Finished Collars</div></div>
    </motion.div>
  </div>
);

export default CraftPage;

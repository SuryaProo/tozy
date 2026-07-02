import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Pages.css';

const ContactPage: React.FC = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="page contact-page">
      <div className="page-hero">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="page-label">Get in Touch</div>
          <h1 className="page-title">Let's Talk<br />Craft.</h1>
          <p className="page-sub">Questions, collaborations, wholesale enquiries — we're a small team and we read every message.</p>
        </motion.div>
      </div>

      <div className="contact-layout">
        <motion.div
          className="contact-info"
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="contact-item">
            <div className="contact-label">Email</div>
            <a href="mailto:hello@tozycozy.com" className="contact-value">hello@tozycozy.com</a>
          </div>
          <div className="contact-item">
            <div className="contact-label">Instagram</div>
            <a href="#" className="contact-value">@tozycozy</a>
          </div>
          <div className="contact-item">
            <div className="contact-label">Response Time</div>
            <div className="contact-value muted">Within 24 hours</div>
          </div>
          <div className="contact-item">
            <div className="contact-label">For Returns</div>
            <div className="contact-value muted">returns@tozycozy.com</div>
          </div>
        </motion.div>

        <motion.div
          className="contact-form-wrap"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {sent ? (
            <motion.div
              className="form-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="success-icon">✓</div>
              <h3>Message Sent.</h3>
              <p>We'll be in touch within 24 hours.</p>
            </motion.div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <input className="form-input" placeholder="Your Name" required />
                <input className="form-input" type="email" placeholder="Email Address" required />
              </div>
              <select className="form-input form-select">
                <option value="">Subject</option>
                <option>Order Query</option>
                <option>Returns & Exchange</option>
                <option>Wholesale</option>
                <option>Collaboration</option>
                <option>Other</option>
              </select>
              <textarea className="form-input form-textarea" placeholder="Your message..." rows={5} required />
              <button type="submit" className="btn-send">Send Message →</button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;

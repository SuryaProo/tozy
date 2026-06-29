import React from 'react';
import { motion } from 'framer-motion';
import { Page } from './Navbar';
import './Footer.css';

interface FooterProps {
  onNavClick?: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  const nav = (page: Page) => onNavClick?.(page);
  return (
    <footer className="footer">
      <motion.div className="newsletter"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <h3>Stay <span>Elevated</span></h3>
        <p>New drops, craft stories, and early access — only for the inner circle.</p>
        <div className="newsletter-form">
          <input type="email" placeholder="your@email.com" aria-label="Email for newsletter" />
          <button>Subscribe</button>
        </div>
      </motion.div>

      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo"><span className="red">TOZY</span>COZY</div>
          <p className="footer-tagline">Luxury fashion for those who understand that elegance is a choice, not a coincidence.</p>
        </div>
        <div className="footer-col">
          <h4>Brand</h4>
          <button onClick={() => nav('about')}>About Us</button>
          <button onClick={() => nav('craft')}>Our Craft</button>
          <button onClick={() => nav('contact')}>Careers</button>
        </div>
        <div className="footer-col">
          <h4>Collections</h4>
          <button onClick={() => nav('home')}>Shirts</button>
          <button onClick={() => nav('home')}>Shoes</button>
          <button onClick={() => nav('home')}>New Arrivals</button>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <button onClick={() => nav('contact')}>Contact</button>
          <button onClick={() => nav('contact')}>Returns</button>
          <a href="#">Privacy Policy</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2024 TozYcozY · Made with passion.</p>
        <div className="footer-social">
          <a href="#" aria-label="Instagram">Instagram</a>
          <a href="#" aria-label="Pinterest">Pinterest</a>
          <a href="#" aria-label="Facebook">Facebook</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

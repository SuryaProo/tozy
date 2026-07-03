import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Hero.css';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  animKey?: number;
}

const Hero: React.FC<HeroProps> = ({ animKey }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const tozyRef    = useRef<HTMLSpanElement>(null);
  const cozyRef    = useRef<HTMLSpanElement>(null);
  const labelRef   = useRef<HTMLDivElement>(null);
  const descRef    = useRef<HTMLParagraphElement>(null);
  const hintRef    = useRef<HTMLDivElement>(null);
  const badgesRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ScrollTrigger.getAll().forEach(t => t.kill());
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(labelRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 })
        .fromTo([tozyRef.current, cozyRef.current],
          { opacity: 0, y: 60, scale: 0.88 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.08 }, '-=0.3')
        .fromTo(descRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
        .fromTo(badgesRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
        .fromTo(hintRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3');

      // Word split on scroll
      gsap.to(tozyRef.current, { x: () => -(window.innerWidth * 0.18), ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1.2 } });
      gsap.to(cozyRef.current, { x: () => window.innerWidth * 0.18, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1.2 } });
    }, sectionRef);
    return () => { ctx.revert(); ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, [animKey]);

  return (
    <section ref={sectionRef} className="hero" id="hero">
      <div className="hero-bg" />

      {/* Decorative editorial images */}
      <div className="hero-img-left">
        <img src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80" alt="Shirt" />
      </div>
      <div className="hero-img-right">
        <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" alt="Shoes" />
      </div>

      <div className="hero-content">
        <div ref={labelRef} className="hero-label" style={{ opacity: 0 }}>
          Luxury · Minimal · Conscious
        </div>

        <div className="hero-words" aria-label="TOZYCOZY">
          <span ref={tozyRef} className="hero-word red"   style={{ opacity: 0 }}>TOZY</span>
          <span ref={cozyRef} className="hero-word black" style={{ opacity: 0 }}>COZY</span>
        </div>

        <p ref={descRef} className="hero-desc" style={{ opacity: 0 }}>
          Premium linen shirts & artisanal leather shoes —<br />
          crafted for those who know the difference.
        </p>

        <div ref={badgesRef} className="hero-badges" style={{ opacity: 0 }}>
          <span className="hero-badge">🌿 Natural Fabrics</span>
          <span className="hero-badge">🇮🇳 Made in India</span>
          <span className="hero-badge">✦ Free Shipping</span>
        </div>

        <div ref={hintRef} className="hero-scroll-hint" style={{ opacity: 0 }}>
          <span>Scroll to explore</span>
          <div className="scroll-line" />
        </div>
      </div>
    </section>
  );
};

export default Hero;

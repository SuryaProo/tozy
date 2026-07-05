import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Hero.css';

gsap.registerPlugin(ScrollTrigger);

const MARQUEE_TOP = 'PREMIUM LINEN · FREE SHIPPING · ARTISAN LEATHER · MADE IN INDIA · NEW ARRIVALS · LUXURY CRAFTED · ';
const MARQUEE_BOT = 'TOZYCOZY · 30 DAY RETURNS · HAND FINISHED · NATURAL FABRICS · GOODYEAR WELT · AGRA COBBLERS · ';

const SHIRT_IMGS = [
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
  'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80',
];
const SHOE_IMGS = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80',
  'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80',
];

interface HeroProps {
  animKey?: number;
  onShopClick?: (cat: 'shirts' | 'shoes') => void;
}

// Image cycler with crossfade
const ImageCycler: React.FC<{ images: string[]; alt: string }> = ({ images, alt }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), 3000);
    return () => clearInterval(t);
  }, [images.length]);
  return (
    <>
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={alt}
          className={`hcard-img ${i === idx ? 'active' : ''}`}
          loading={i === 0 ? 'eager' : 'lazy'}
          onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
        />
      ))}
    </>
  );
};

const Hero: React.FC<HeroProps> = ({ animKey, onShopClick }) => {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const tozyRef  = useRef<HTMLSpanElement>(null);
  const cozyRef  = useRef<HTMLSpanElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const leftCardRef  = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapRef.current,
            start: 'top top',
            end: '+=300%',
            scrub: 1.4,
            pin: stickyRef.current,
          },
        });

        // 0→25%: entrance
        tl.fromTo([tozyRef.current, cozyRef.current],
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.25, stagger: 0.05 },
          0
        )
        .fromTo([leftCardRef.current, rightCardRef.current],
          { opacity: 0, scale: 0.88 },
          { opacity: 1, scale: 1, duration: 0.25, stagger: 0.05 },
          0
        )

        // 25→65%: TOZY flies left, COZY right, both fade, cards get darker
        .to(tozyRef.current, {
          x: () => -(window.innerWidth * 0.36),
          opacity: 0.15,
          duration: 0.4,
        }, 0.25)
        .to(cozyRef.current, {
          x: () => window.innerWidth * 0.36,
          opacity: 0.15,
          duration: 0.4,
        }, 0.25)
        .to(leftCardRef.current, {
          x: -40,
          scale: 1.05,
          duration: 0.4,
        }, 0.25)
        .to(rightCardRef.current, {
          x: 40,
          scale: 1.05,
          duration: 0.4,
        }, 0.25)

        // 65→85%: center content fades in
        .fromTo(centerRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.2 },
          0.65
        );

      }, wrapRef);
      return () => ctx.revert();
    }, 150);
    return () => clearTimeout(timer);
  }, [animKey]);

  // 3D tilt on cards
  const makeTilt = (ref: React.RefObject<HTMLDivElement | null>) => ({
    onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      ref.current.style.transform = `perspective(800px) rotateY(${x * 20}deg) rotateX(${-y * 16}deg) scale(1.03)`;
    },
    onMouseLeave: () => {
      if (ref.current) ref.current.style.transform = '';
    },
  });

  return (
    <div ref={wrapRef} className="hero-wrap">
      <div ref={stickyRef} className="hero-sticky">

        {/* ── Top Marquee ── */}
        <div className="hero-marquee hero-marquee-top">
          <div className="hero-marquee-inner">
            <span>{MARQUEE_TOP}</span><span>{MARQUEE_TOP}</span>
          </div>
        </div>

        {/* ── Main Stage ── */}
        <div className="hero-stage">

          {/* Left Card — Shirts */}
          <div className="hcard hcard-left" onClick={() => onShopClick?.('shirts')}>
            <div
              ref={leftCardRef}
              className="hcard-inner"
              style={{ transition: 'transform 0.18s ease' }}
              {...makeTilt(leftCardRef)}
            >
              <ImageCycler images={SHIRT_IMGS} alt="Linen Shirts" />
              <div className="hcard-darken" />
              <div className="hcard-info">
                <span className="hcard-name">Linen Shirts</span>
                <span className="hcard-price">from ₹2,799</span>
                <span className="hcard-cta">Shop Now →</span>
              </div>
            </div>
          </div>

          {/* Center */}
          <div className="hero-center">
            {/* Brand words — split on scroll */}
            <div className="hero-wordmark">
              <span ref={tozyRef} className="hero-tozy" style={{ opacity: 0 }}>TOZY</span>
              <span ref={cozyRef} className="hero-cozy" style={{ opacity: 0 }}>COZY</span>
            </div>

            {/* This fades in AFTER words split */}
            <div ref={centerRef} className="hero-center-content" style={{ opacity: 0 }}>
              <p className="hero-tagline">Luxury · Minimal · Conscious</p>
              <p className="hero-desc">
                Premium linen shirts &amp; artisanal leather shoes —<br />
                crafted for those who know the difference.
              </p>
              <div className="hero-btns">
                <button className="hbtn-primary" onClick={() => onShopClick?.('shirts')}>Shop Shirts</button>
                <button className="hbtn-outline" onClick={() => onShopClick?.('shoes')}>Shop Shoes</button>
              </div>
            </div>
          </div>

          {/* Right Card — Shoes */}
          <div className="hcard hcard-right" onClick={() => onShopClick?.('shoes')}>
            <div
              ref={rightCardRef}
              className="hcard-inner"
              style={{ transition: 'transform 0.18s ease' }}
              {...makeTilt(rightCardRef)}
            >
              <ImageCycler images={SHOE_IMGS} alt="Leather Shoes" />
              <div className="hcard-darken" />
              <div className="hcard-info">
                <span className="hcard-name">Leather Shoes</span>
                <span className="hcard-price">from ₹6,999</span>
                <span className="hcard-cta">Shop Now →</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Marquee ── */}
        <div className="hero-marquee hero-marquee-bot">
          <div className="hero-marquee-inner hero-marquee-rev">
            <span>{MARQUEE_BOT}</span><span>{MARQUEE_BOT}</span>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="hero-scroll-hint">
          <span>Scroll to discover</span>
          <div className="hero-scroll-bar" />
        </div>
      </div>
    </div>
  );
};

export default Hero;

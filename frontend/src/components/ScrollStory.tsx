import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollStory.css';

gsap.registerPlugin(ScrollTrigger);

const IMAGES = [
  { src: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&q=80', label: 'Premium Linen Shirt', sub: '180 GSM · Hand Finished' },
  { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80', label: 'Signature Derby', sub: 'Goodyear Welt · Vibram Sole' },
  { src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80', label: 'Black Linen Shirt', sub: 'Natural Dye · Relaxed Fit' },
  { src: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=700&q=80', label: 'Derby — Black', sub: 'Full-Grain Italian Leather' },
  { src: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=700&q=80', label: 'Olive Overshirt', sub: 'Linen Blend · Drop Shoulder' },
  { src: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=700&q=80', label: 'Minimal Runner', sub: 'Cloud White · No Logo' },
];

interface Props { onShopClick: (c: 'shirts' | 'shoes') => void; }

const ScrollStory: React.FC<Props> = ({ onShopClick }) => {
  const outerRef  = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const tozyRef   = useRef<HTMLDivElement>(null);
  const cozyRef   = useRef<HTMLDivElement>(null);
  const imgRef    = useRef<HTMLDivElement>(null);
  const labelRef  = useRef<HTMLDivElement>(null);
  const ctaRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait a tick for DOM to settle
    const timer = setTimeout(() => {
      const outer  = outerRef.current;
      const sticky = stickyRef.current;
      const tozy   = tozyRef.current;
      const cozy   = cozyRef.current;
      const img    = imgRef.current;
      const label  = labelRef.current;
      const cta    = ctaRef.current;
      if (!outer || !sticky || !tozy || !cozy || !img || !label || !cta) return;

      // Kill any old triggers
      ScrollTrigger.getAll().filter(t => t.vars.id === 'storyscroll').forEach(t => t.kill());

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // How far each letter group needs to travel to reach the edge
      const travelX = vw * 0.42;

      const tl = gsap.timeline({
        scrollTrigger: {
          id:      'storyscroll',
          trigger: outer,
          start:   'top top',
          end:     'bottom top',
          scrub:   1.5,
        },
      });

      // ── 0→20%: letters enter from center, image fades in ──
      tl.fromTo([tozy, cozy],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.2 },
        0
      )
      .fromTo(img,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.2 },
        0.05
      )

      // ── 20→55%: letters fly to sides + rotate vertical ──
      .to(tozy, {
        x: -travelX,
        rotation: -90,
        duration: 0.35,
        ease: 'power2.inOut',
      }, 0.2)
      .to(cozy, {
        x: travelX,
        rotation: 90,
        duration: 0.35,
        ease: 'power2.inOut',
      }, 0.2)

      // ── 55→90%: images cycle one by one ──
      ;

      // Cycle images via individual triggers
      IMAGES.forEach((imgData, i) => {
        const progress = 0.55 + (i / IMAGES.length) * 0.35;
        tl.call(() => {
          // Update main image src
          const el = img.querySelector('img') as HTMLImageElement;
          if (el) el.src = imgData.src;
          // Update label
          label.innerHTML = `
            <div class="ss-lbl-name">${imgData.label}</div>
            <div class="ss-lbl-sub">${imgData.sub}</div>
          `;
        }, undefined, progress);
      });

      // ── 90→100%: CTA appears ──
      tl.fromTo(cta,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.1 },
        0.9
      );

    }, 100);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().filter(t => t.vars.id === 'storyscroll').forEach(t => t.kill());
    };
  }, []);

  return (
    /*
      outerRef = tall div (400vh) — provides scroll room
      stickyRef = panel that sticks at top:0
    */
    <div ref={outerRef} className="ss-outer">
      <div ref={stickyRef} className="ss-sticky">

        {/* TOZY — left side */}
        <div ref={tozyRef} className="ss-word ss-tozy" aria-hidden="true">
          {'TOZY'.split('').map((l, i) => (
            <span key={i} className="ss-letter ss-red">{l}</span>
          ))}
        </div>

        {/* Center image + label */}
        <div ref={imgRef} className="ss-img-wrap" style={{ opacity: 0 }}>
          <img
            src={IMAGES[0].src}
            alt="Product"
            className="ss-img"
            onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x500/f5f5f3/999?text=TozYcozY'; }}
          />
          {/* Overlay label */}
          <div ref={labelRef} className="ss-label">
            <div className="ss-lbl-name">{IMAGES[0].label}</div>
            <div className="ss-lbl-sub">{IMAGES[0].sub}</div>
          </div>
        </div>

        {/* COZY — right side */}
        <div ref={cozyRef} className="ss-word ss-cozy" aria-hidden="true">
          {'COZY'.split('').map((l, i) => (
            <span key={i} className="ss-letter ss-black">{l}</span>
          ))}
        </div>

        {/* CTA — appears at end of scroll */}
        <div ref={ctaRef} className="ss-cta" style={{ opacity: 0 }}>
          <button className="ss-btn" onClick={() => onShopClick('shirts')}>Shop Shirts →</button>
          <button className="ss-btn ss-btn-outline" onClick={() => onShopClick('shoes')}>Shop Shoes →</button>
        </div>

        {/* Scroll hint — visible at start */}
        <div className="ss-hint">
          <span>Scroll</span>
          <div className="ss-hint-line" />
        </div>
      </div>
    </div>
  );
};

export default ScrollStory;

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './Landing.css';

interface LandingProps {
  onEnter: () => void;
}

const BRAND = ['T', 'O', 'Z', 'Y', 'C', 'O', 'Z', 'Y'];

const Landing: React.FC<LandingProps> = ({ onEnter }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const logoRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        logoRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.8 }
      )
      .fromTo(
        lettersRef.current.filter(Boolean),
        { opacity: 0, y: 40, rotateZ: -4, scale: 0.85 },
        {
          opacity: 1, y: 0, rotateZ: 0, scale: 1,
          duration: 0.7,
          stagger: 0.06,
        },
        '-=0.3'
      )
      .fromTo(
        taglineRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.2'
      )
      .fromTo(
        btnRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.3'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleEnter = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.8,
      ease: 'power3.inOut',
      onComplete: onEnter,
    });
  };

  return (
    <div ref={containerRef} className="landing">
      <div ref={logoRef} className="landing-logo">
        Luxury Fashion · Est. 2024
      </div>

      <div className="landing-name" aria-label="TOZYCOZY">
        {BRAND.map((letter, i) => (
          <span
            key={i}
            ref={el => { lettersRef.current[i] = el; }}
            className={`landing-letter ${i < 4 ? 'red' : 'black'}`}
          >
            {letter}
          </span>
        ))}
      </div>

      <div ref={taglineRef} className="landing-tagline">
        Crafted for the Discerning Few
      </div>

      <button ref={btnRef} className="landing-enter" onClick={handleEnter}>
        Enter Collection
      </button>
    </div>
  );
};

export default Landing;

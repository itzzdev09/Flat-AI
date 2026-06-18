import React from 'react';
import image1 from '../../Images/image1.jpeg';
import { motion, useReducedMotion } from 'framer-motion';

const Poster = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="hero-shell">
      <img className="hero-media" src={image1} alt="Kolkata residential skyline" />
      <motion.div
        className="hero-content"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="eyebrow">Kolkata property intelligence</div>
        <h1 className="hero-title">Find a home that fits your life, budget, and future.</h1>
        <p className="hero-copy">
          Explore curated listings, save your favorites, review neighborhood insights, and
          move from browsing to booking with confidence.
        </p>
        <div className="hero-stats">
          <motion.div className="hero-stat" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.45 }}>
            <strong>1,000+</strong>
            <span>listed flats</span>
          </motion.div>
          <motion.div className="hero-stat" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.45 }}>
            <strong>Smart</strong>
            <span>price ranges</span>
          </motion.div>
          <motion.div className="hero-stat" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.45 }}>
            <strong>Live</strong>
            <span>recommendations</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Poster;

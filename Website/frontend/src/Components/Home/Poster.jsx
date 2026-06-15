import React from 'react';
import image1 from '../../Images/image1.jpeg';

const Poster = () => {
  return (
    <section className="hero-shell">
      <img className="hero-media" src={image1} alt="Kolkata residential skyline" />
      <div className="hero-content">
        <div className="eyebrow">Kolkata property intelligence</div>
        <h1 className="hero-title">Find a home that fits your life, budget, and future.</h1>
        <p className="hero-copy">
          Explore curated listings, save your favorites, review neighborhood insights, and
          move from browsing to booking with confidence.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <strong>1,000+</strong>
            <span>listed flats</span>
          </div>
          <div className="hero-stat">
            <strong>ML</strong>
            <span>price insights</span>
          </div>
          <div className="hero-stat">
            <strong>Live</strong>
            <span>recommendations</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Poster;

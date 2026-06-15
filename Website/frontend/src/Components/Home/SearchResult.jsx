import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getStoredAuth } from '../../utils/auth';
import { getPropertyImage } from '../../utils/propertyUtils';

const formatPrice = (price) => (
  price > 1 ? `Rs. ${price.toFixed(2)} Cr` : `Rs. ${(price * 100).toFixed(2)} Lakh`
);

const SearchResult = () => {
  const { data } = useSelector((state) => state.searchResult || { data: { result: [] } });
  const [savedId, setSavedId] = useState(null);
  const navigate = useNavigate();
  const { token, user } = getStoredAuth();
  const storageKey = user ? `wishList:${user._id}` : 'wishList';

  const wishlistHandler = (flat) => {
    if (!token) {
      navigate('/login');
      return;
    }

    const existingData = JSON.parse(localStorage.getItem(storageKey)) || [];
    const flatExists = existingData.some((item) => item._id === flat._id);

    if (!flatExists) existingData.push(flat);
    localStorage.setItem(storageKey, JSON.stringify(existingData));
    setSavedId(flat._id);
    window.setTimeout(() => setSavedId((currentId) => (currentId === flat._id ? null : currentId)), 700);
  };

  if (!data || !Array.isArray(data.result) || data.result.length === 0) return null;
  const headingLabel = data.result[0].location ? `Search results for ${data.result[0].location}` : 'Search results';

  return (
    <section className="section-shell">
      <div className="section-heading">
        <div>
          <h2>{headingLabel}</h2>
          <p>{data.result.length} matching properties found.</p>
        </div>
      </div>

      <div className="property-grid">
        {data.result.map((flat) => (
          <article className="property-card" key={flat._id}>
            <div className="property-card-row">
              <img className="property-image" src={getPropertyImage(flat)} alt={`${flat.LISTING_TITLE || flat.SOCIETY_NAME}, ${flat.CITY}`} />
              <div className="property-body">
                <div className="d-flex justify-content-between gap-3">
                  <div>
                    <div className="property-title">{flat.LISTING_TITLE || flat.SOCIETY_NAME}</div>
                    <div className="property-meta">
                      {[flat.PROJECT_LABEL, flat.location, flat.CITY].filter(Boolean).join(' | ')}
                    </div>
                  </div>
                  <Button
                    aria-label="Add to wishlist"
                    className={`wishlist-button ${savedId === flat._id ? 'is-saved' : ''}`}
                    onClick={() => wishlistHandler(flat)}
                  >
                    <i className={`fa-solid fa-heart ${savedId === flat._id ? 'wishlist-icon-pop' : ''}`}></i>
                  </Button>
                </div>

                <div className="price-line">
                  <strong>{formatPrice(flat.PRICE)}</strong>
                  <span className="property-meta">Rs. {flat.Price_per_sqft} / sqft</span>
                </div>

                <div className="chip-row">
                  <span className="chip">{flat.AREA} sqft</span>
                  <span className="chip">{flat.FURNISH}</span>
                  <span className="chip">{flat.amenity_luxury} amenities</span>
                </div>

                <div className="card-action-row">
                  <Link to={`/flats/${flat._id}`} className="text-link">
                    View details <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                  <Button onClick={() => { window.location.href = `tel:${flat.Contact}`; }}>
                    <i className="fa-solid fa-phone"></i>
                  </Button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default SearchResult;

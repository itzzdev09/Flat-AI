import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getPropertyImage } from '../utils/propertyUtils';
import { getStoredAuth } from '../utils/auth';

const formatPrice = (price) => (
  price > 1 ? `Rs. ${price.toFixed(2)} Cr` : `Rs. ${(price * 100).toFixed(2)} Lakh`
);

const WishList = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const { token, user } = getStoredAuth();
  const storageKey = user ? `wishList:${user._id}` : 'wishList';

  useEffect(() => {
    if (!token) {
      setData([]);
      return;
    }

    const storedData = localStorage.getItem(storageKey);
    setData(storedData ? JSON.parse(storedData) : []);
  }, [storageKey, token]);

  if (!token) {
    return (
      <>
        <section className="page-hero">
          <div className="eyebrow" style={{ color: 'var(--teal)' }}>Saved homes</div>
          <h1>Log in to use the wishlist.</h1>
          <p>Wishlist items are tied to your account now, so saved homes stay with you instead of living in a shared browser cache.</p>
        </section>

        <section className="section-shell">
          <div className="feature-band text-center">
            <h2>Authentication required</h2>
            <p className="property-meta mb-4">Please sign in to save and manage shortlist items.</p>
            <Button onClick={() => navigate('/login')}>Go to login</Button>
          </div>
        </section>
      </>
    );
  }

  const deleteElement = (id) => {
    const updatedData = data.filter((item) => item._id !== id);
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
    setData(updatedData);
  };

  return (
    <>
      <section className="page-hero">
        <div className="eyebrow" style={{ color: 'var(--teal)' }}>Saved homes</div>
        <h1>Your shortlist, ready for a second look.</h1>
        <p>
          Compare saved homes without losing your place in the search flow.
          Wishlist data stays local to this browser.
        </p>
      </section>

      <section className="section-shell">
        {!Array.isArray(data) || data.length === 0 ? (
          <div className="empty-state feature-band">
            <div>
              <h2>No homes saved yet</h2>
              <p className="property-meta">Save properties from search results to build your shortlist.</p>
              <Link className="text-link" to="/">Browse properties</Link>
            </div>
          </div>
        ) : (
          <div className="property-grid">
            {data.map((flat) => (
              <article className="property-card" key={flat._id}>
                <div className="property-card-row">
                  <img className="property-image" src={getPropertyImage(flat)} alt={`${flat.LISTING_TITLE || flat.SOCIETY_NAME}, ${flat.CITY}`} />
                  <div className="property-body">
                    <div className="d-flex justify-content-between gap-3">
                      <div>
                        <div className="property-title">{flat.LISTING_TITLE || flat.SOCIETY_NAME}</div>
                        <div className="property-meta">
                          {[flat.PROJECT_LABEL || flat.SOCIETY_NAME, flat.location, flat.CITY].filter(Boolean).join(' | ')}
                        </div>
                      </div>
                      <Button onClick={() => deleteElement(flat._id)} aria-label="Remove from wishlist">
                        <i className="fa-solid fa-trash"></i>
                      </Button>
                    </div>

                    <div className="price-line">
                      <strong>{formatPrice(flat.PRICE)}</strong>
                      <span className="property-meta">Rs. {flat.Price_per_sqft} / sqft</span>
                    </div>

                    <div className="chip-row">
                      <span className="chip">{flat.BEDROOM_NUM} BHK</span>
                      <span className="chip">{flat.AREA} sqft</span>
                      <span className="chip">{flat.FURNISH}</span>
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
        )}
      </section>
    </>
  );
};

export default WishList;

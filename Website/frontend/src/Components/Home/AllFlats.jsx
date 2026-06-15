import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllData } from '../../RTK/Slices/allDataSlice';
import { Button, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Loading from '../Sections/Loading';
import { getStoredAuth } from '../../utils/auth';
import { getPropertyImage } from '../../utils/propertyUtils';

const formatPrice = (price) => (
  price > 1 ? `Rs. ${price.toFixed(2)} Cr` : `Rs. ${(price * 100).toFixed(2)} Lakh`
);

const PropertyCard = ({ flat }) => {
  const [savedId, setSavedId] = useState(null);
  const navigate = useNavigate();
  const { token, user } = getStoredAuth();
  const storageKey = user ? `wishList:${user._id}` : 'wishList';

  const wishlistHandler = () => {
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

  return (
    <article className="property-card">
      <div className="property-card-row">
        <img
          className="property-image"
          src={getPropertyImage(flat)}
          alt={`${flat.LISTING_TITLE || flat.SOCIETY_NAME}, ${flat.CITY}`}
          loading="lazy"
          decoding="async"
        />
        <div className="property-body">
          <div className="property-card-header">
            <div className="property-card-kicker">
              {flat.PROPERTY_TYPE ? <span className="chip">{flat.PROPERTY_TYPE}</span> : null}
              {flat.CITY ? <span className="chip">{flat.CITY}</span> : null}
            </div>
            <Button
              aria-label="Add to wishlist"
              className={`wishlist-button ${savedId === flat._id ? 'is-saved' : ''}`}
              onClick={wishlistHandler}
            >
              <i className={`fa-solid fa-heart ${savedId === flat._id ? 'wishlist-icon-pop' : ''}`}></i>
            </Button>
          </div>

          <div className="d-flex justify-content-between gap-3 mt-3">
            <div>
              <div className="property-title">{flat.LISTING_TITLE || flat.SOCIETY_NAME}</div>
              <div className="property-meta">
                {[flat.PROJECT_LABEL, flat.location, flat.CITY].filter(Boolean).join(' | ')}
              </div>
            </div>
          </div>

          <div className="price-line">
            <strong>{formatPrice(flat.PRICE)}</strong>
            <span className="property-meta">Rs. {flat.Price_per_sqft} / sqft</span>
          </div>

          <div className="chip-row">
            <span className="chip">{flat.BEDROOM_NUM} BHK</span>
            <span className="chip">{flat.AREA} sqft</span>
            <span className="chip">{flat.FURNISH}</span>
            <span className="chip">{flat.AGE}</span>
          </div>

          <p className="property-copy mt-3 mb-0">
            {flat.PROPERTY_TYPE} with {flat.BALCONY_NUM} balconies. Status: {flat.Situation || 'Available'}.
          </p>

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
  );
};

const AllFlats = () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const { data, loading, error, total, limit } = useSelector((state) => state.allData);

  useEffect(() => {
    dispatch(fetchAllData(page));
  }, [page, dispatch]);

  if (loading && page === 1) return <Loading />;

  if (error) {
    return (
      <Container className="section-shell text-center">
        <p className="text-danger">Error: {error}</p>
        <Button onClick={() => dispatch(fetchAllData(page))}>Retry</Button>
      </Container>
    );
  }

  const totalPages = Math.ceil(total / limit) || 1;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <section className="section-shell">
      {Array.isArray(data) && data.length > 0 ? (
        <>
          <div className="section-heading">
            <div>
              <h2>Available properties</h2>
              <p>Browse verified local data with fast pagination and detail views.</p>
            </div>
          </div>
          <div className={`property-grid ${loading ? 'opacity-50' : ''}`} style={{ transition: 'opacity 0.2s ease-in-out' }}>
            {data.map((flat) => <PropertyCard key={flat._id} flat={flat} />)}
          </div>

          {totalPages > 1 && (
            <div className="pagination-wrapper mt-5 d-flex justify-content-center align-items-center flex-wrap gap-2">
              <Button
                className="pagination-btn pagination-prev-next"
                disabled={page === 1 || loading}
                onClick={() => {
                  setPage((p) => Math.max(p - 1, 1));
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
              >
                <i className="fa-solid fa-chevron-left"></i> Prev
              </Button>

              {pageNumbers.map((num, idx) => {
                if (num === '...') {
                  return (
                    <span key={`dots-${idx}`} className="pagination-ellipsis px-2 text-muted">
                      ...
                    </span>
                  );
                }
                return (
                  <Button
                    key={num}
                    className={`pagination-btn pagination-num ${page === num ? 'active' : ''}`}
                    disabled={loading}
                    onClick={() => {
                      setPage(num);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                  >
                    {num}
                  </Button>
                );
              })}

              <Button
                className="pagination-btn pagination-prev-next"
                disabled={page === totalPages || loading}
                onClick={() => {
                  setPage((p) => Math.min(p + 1, totalPages));
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
              >
                Next <i className="fa-solid fa-chevron-right"></i>
              </Button>
            </div>
          )}
        </>
      ) : null}
      {loading && page > 1 ? <div className="mt-3"><Loading /></div> : null}
    </section>
  );
};

export default AllFlats;

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllData } from '../../RTK/Slices/allDataSlice';
import { Button, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
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
        <img className="property-image" src={getPropertyImage(flat)} alt={`${flat.LISTING_TITLE || flat.SOCIETY_NAME}, ${flat.CITY}`} />
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
  const { data, loading, error, hasMoreData } = useSelector((state) => state.allData);

  useEffect(() => {
    if (page > 1 && !loading && hasMoreData) {
      dispatch(fetchAllData(page));
    }
  }, [page, dispatch, loading, hasMoreData]);

  useEffect(() => {
    const handleScroll = debounce(() => {
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      const currentScrollPosition = window.scrollY;

      if (windowHeight + currentScrollPosition + 100 >= fullHeight && hasMoreData && !loading) {
        setPage((prevPage) => prevPage + 1);
      }
    }, 300);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMoreData, loading]);

  if (loading && page === 1) return <Loading />;

  if (error) {
    return (
      <Container className="section-shell text-center">
        <p className="text-danger">Error: {error}</p>
        <Button onClick={() => dispatch(fetchAllData(page))}>Retry</Button>
      </Container>
    );
  }

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
          <div className="property-grid">
            {data.map((flat) => <PropertyCard key={flat._id} flat={flat} />)}
          </div>
        </>
      ) : null}
      {loading && page > 1 ? <Loading /> : null}
    </section>
  );
};

export default AllFlats;

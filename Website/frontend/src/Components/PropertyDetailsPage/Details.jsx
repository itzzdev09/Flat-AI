import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchData } from '../../RTK/Slices/PropertyDetailsSlice';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap';
import SuggestedProperty from './SuggestedProperty';
import Loading from '../Sections/Loading';
import { normalizeCoordinates } from '../Analysis/analysisHelpers';
import { getPropertyImage } from '../../utils/propertyUtils';
import { getStoredAuth } from '../../utils/auth';
import { MotionSection } from '../Sections/Motion';

const formatPrice = (price) => (
  price > 1 ? `Rs. ${price.toFixed(2)} Cr` : `Rs. ${(price * 100).toFixed(2)} Lakh`
);

const Details = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [saved, setSaved] = useState(false);
  const propertyDetails = useSelector((state) => state.propertyDetails?.data);
  const loading = useSelector((state) => state.propertyDetails.loading);
  const error = useSelector((state) => state.propertyDetails.error);
  const { token, user } = getStoredAuth();
  const storageKey = user ? `wishList:${user._id}` : 'wishList';

  useEffect(() => {
    const wishList = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const foundItem = wishList.find((property) => property._id === id);
    if (foundItem) setItem(foundItem);
    else dispatch(fetchData(id));
  }, [id, dispatch, storageKey]);

  useEffect(() => {
    if (propertyDetails && propertyDetails._id === id) setItem(propertyDetails);
  }, [propertyDetails, id]);

  const wishlistHandler = () => {
    if (!token) {
      navigate('/login');
      return;
    }

    const existingData = JSON.parse(localStorage.getItem(storageKey)) || [];
    const flatExists = existingData.some((property) => property._id === item._id);
    if (!flatExists) existingData.push(item);
    localStorage.setItem(storageKey, JSON.stringify(existingData));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 700);
  };

  const renderNearbyPlaces = (places, category, icon) => {
    const entries = Object.entries(places || {});
    if (entries.length === 0) return null;

    return (
      <div className="property-card" key={category}>
        <div className="property-body">
          <div className="property-title" style={{ fontSize: '1rem' }}>
            {icon} {category}
          </div>
          {entries.map(([placeName, distance]) => (
            <div key={placeName} className="d-flex justify-content-between mt-2 property-meta">
              <span>{placeName}</span>
              <strong>{distance} km</strong>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <Loading />;
  if (error) return <section className="section-shell"><p className="text-danger">Error: {error}</p></section>;
  if (!item) return <Loading />;
  const coordinates = normalizeCoordinates(item);

  return (
    <>
      <MotionSection className="section-shell">
        <div className="detail-hero">
          <img className="detail-image" src={getPropertyImage(item)} alt={`${item.LISTING_TITLE || item.SOCIETY_NAME}, ${item.CITY}`} />
          <aside className="detail-panel">
            <div className="eyebrow">Property profile</div>
            <h1>{item.LISTING_TITLE || item.SOCIETY_NAME}</h1>
            {item.PROJECT_LABEL ? <p className="detail-project-label">{item.PROJECT_LABEL}</p> : null}
            <p style={{ color: 'rgba(255, 255, 255, 0.82)' }}>
              <i className="fa-solid fa-location-dot"></i> {item.location}, {item.CITY}
            </p>
            <div className="price-line">
              <strong>{formatPrice(item.PRICE)}</strong>
              <span style={{ color: 'rgba(255, 255, 255, 0.82)' }}>Rs. {item.Price_per_sqft} / sqft</span>
            </div>
            <div className="spec-grid">
              <div className="spec-tile"><span>Type</span><strong>{item.PROPERTY_TYPE}</strong></div>
              <div className="spec-tile"><span>Bedrooms</span><strong>{item.BEDROOM_NUM} BHK</strong></div>
              <div className="spec-tile"><span>Area</span><strong>{item.AREA} sqft</strong></div>
              <div className="spec-tile"><span>Floor</span><strong>{item.FLOOR_NUM} of {item.TOTAL_FLOOR}</strong></div>
              <div className="spec-tile"><span>Age</span><strong>{item.AGE}</strong></div>
              <div className="spec-tile"><span>Facing</span><strong>{item.Facing_Direction}</strong></div>
            </div>
            <div className="card-action-row">
              <Button onClick={() => { window.location.href = `tel:${item.Contact}`; }}>
                <i className="fa-solid fa-phone"></i> Contact
              </Button>
              <Button className={`wishlist-button ${saved ? 'is-saved' : ''}`} onClick={wishlistHandler}>
                <i className={`fa-solid fa-heart ${saved ? 'wishlist-icon-pop' : ''}`}></i> Save
              </Button>
            </div>
          </aside>
        </div>
      </MotionSection>

      <MotionSection className="section-shell content-grid">
        <div className="feature-band">
          <div className="section-heading">
            <div>
              <h2>Description</h2>
              <p>{item.Situation || 'Available property'} listed by {item.Owner_Type || 'seller'}.</p>
            </div>
          </div>
          <p className="property-copy" style={{ lineHeight: 1.8 }}>{item.DESCRIPTION}</p>
          <div className="chip-row mt-4">
            <span className="chip">{item.FURNISH}</span>
            <span className="chip">{item.amenity_luxury} amenities</span>
            <span className="chip">{item.Pet_Friendly ? 'Pet friendly' : 'No pets'}</span>
            <span className="chip">{item.Power_Backup ? 'Power backup' : 'No backup'}</span>
            <span className="chip">{item.Visitor_Parking ? 'Visitor parking' : 'No visitor parking'}</span>
          </div>
        </div>

        <aside className="feature-band">
          <h2>Costs</h2>
          <div className="d-flex justify-content-between mt-3"><span>Monthly EMI</span><strong>{item.Estimated_Monthly_EMI ? `Rs. ${item.Estimated_Monthly_EMI}` : 'N/A'}</strong></div>
          <div className="d-flex justify-content-between mt-3"><span>Maintenance</span><strong>Rs. {item.Maintenance_Fees}</strong></div>
          <div className="d-flex justify-content-between mt-3"><span>Property tax</span><strong>Rs. {item.Property_Tax}</strong></div>
          <div className="d-flex justify-content-between mt-3"><span>Stamp duty</span><strong>{item.Stamp_Duty_Registration_Costs}%</strong></div>
          <a
            className="text-link d-inline-block mt-4"
            href={coordinates ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in maps <i className="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </aside>
      </MotionSection>

      <MotionSection className="section-shell">
        <div className="section-heading">
          <div>
            <h2>Neighborhood access</h2>
            <p>Nearby services and conveniences generated with the property dataset.</p>
          </div>
        </div>
        <div className="nearby-grid">
          {renderNearbyPlaces(item.Nearest_Schools, 'Schools', <i className="fa-solid fa-school"></i>)}
          {renderNearbyPlaces(item.Nearest_Colleges, 'Colleges', <i className="fa-solid fa-graduation-cap"></i>)}
          {renderNearbyPlaces(item.Nearest_Hospitals, 'Hospitals', <i className="fa-regular fa-hospital"></i>)}
          {renderNearbyPlaces(item.Nearest_Markets, 'Markets', <i className="fa-solid fa-shop"></i>)}
          {renderNearbyPlaces(item.Nearest_Public_Transport, 'Transit', <i className="fa-solid fa-bus"></i>)}
          {renderNearbyPlaces(item.Nearest_Restaurants, 'Restaurants', <i className="fa-solid fa-utensils"></i>)}
        </div>
      </MotionSection>

      <MotionSection className="section-shell">
        <SuggestedProperty id={id} />
      </MotionSection>
    </>
  );
};

export default Details;

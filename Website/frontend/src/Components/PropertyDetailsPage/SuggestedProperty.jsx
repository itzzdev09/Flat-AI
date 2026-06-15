import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Loading from '../Sections/Loading';
import { getPropertyImage } from '../../utils/propertyUtils';

const SuggestedProperty = ({ id }) => {
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const storedData = JSON.parse(localStorage.getItem('wishList') || '[]');
  const localStorageData = storedData.find((property) => property._id === id);
  const propertyFromRedux = useSelector((state) => state.propertyDetails.data);
  const propId = localStorageData ? localStorageData.PROP_ID : propertyFromRedux ? propertyFromRedux.PROP_ID : null;

  useEffect(() => {
    const dataFetch = async () => {
      if (!propId) {
        setLoading(false);
        setError('No property ID available.');
        return;
      }

      try {
        const similarityResponse = await axios.post(`${process.env.REACT_APP_DJANGO_API_URL}recommend/recommendations/${propId}/`);
        const similarityData = Array.isArray(similarityResponse.data) ? similarityResponse.data : [];
        const propertyIDs = similarityData.map((item) => item.PropertyID);
        if (propertyIDs.length === 0) {
          setResult([]);
          return;
        }

        const fetchRecommendation = await axios.post(`${process.env.REACT_APP_NODE_API_URL}recommendations/${propId}/`, propertyIDs);
        const properties = Array.isArray(fetchRecommendation.data) ? fetchRecommendation.data : [];

        setResult(properties.map((property) => {
          const match = similarityData.find((simProp) => simProp.PropertyID === property.PROP_ID);
          return { ...property, Similarity: match ? match.Similarity : null };
        }));
      } catch (err) {
        console.error('Error fetching recommendations or property details:', err);
        const status = err.response?.status;
        const serviceMessage = status === 404
          ? 'No recommendations were found for this property.'
          : status === 500
            ? 'The recommendation service hit an internal error.'
            : 'Failed to fetch recommendations. Check that both the Django and Node APIs are running.';
        setError(serviceMessage);
      } finally {
        setLoading(false);
      }
    };

    dataFetch();
  }, [propId]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 1200,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2600,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-danger">{error}</p>;
  if (result.length === 0) return null;

  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Similar homes</h2>
          <p>Recommendations ranked by the Django service and hydrated through the Node API.</p>
        </div>
      </div>

      <Slider {...sliderSettings}>
        {result.map((item) => (
          <div key={item._id}>
            <Card className="property-card" style={{ margin: '10px' }}>
                <Card.Img
                variant="top"
                src={getPropertyImage(item)}
                alt={`${item.LISTING_TITLE || item.SOCIETY_NAME || 'Property'} image`}
                style={{ height: '220px', objectFit: 'cover' }}
              />
              <Card.Body>
                <Card.Title>{item.LISTING_TITLE || item.SOCIETY_NAME}</Card.Title>
                <div className="chip-row mb-3">
                  <span className="chip">{item.BEDROOM_NUM} BHK</span>
                  <span className="chip">{item.AREA} sqft</span>
                  <span className="chip">{item.Similarity || 'N/A'}% match</span>
                </div>
                <p className="property-meta">{[item.PROJECT_LABEL, item.location, item.CITY].filter(Boolean).join(' | ')}</p>
                <div className="card-action-row">
                  <strong>{item.PRICE >= 1 ? `Rs. ${item.PRICE} Cr` : `Rs. ${(item.PRICE * 100).toFixed(2)} Lakh`}</strong>
                  <Link to={`/flats/${item._id}`} className="text-link">
                    View <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </Slider>
    </>
  );
};

export default SuggestedProperty;

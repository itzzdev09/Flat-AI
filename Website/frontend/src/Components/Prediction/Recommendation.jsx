import React, { useEffect } from 'react';
import { Card, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchData } from '../../RTK/Slices/PredictionRecommendationSlice';
import Loading from '../../Components/Sections/Loading';
import Slider from 'react-slick';
import { getPropertyImage } from '../../utils/propertyUtils';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Recommendation = ({ data }) => {
  const dispatch = useDispatch();
  const { data: result, loading, error } = useSelector((state) => state.predictionSuggestion);

  useEffect(() => {
    // Only call the hydrator when the Node API returns ranked property IDs.
    if (Array.isArray(data) && data.length > 0) {
      dispatch(fetchData(data));
    }
  }, [data, dispatch]);

  // Keep the carousel simple so it loads quickly on the prediction page.
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    lazyLoad: 'ondemand',
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  if (loading) return <Loading />;
  if (error) return <p>Error fetching recommendations: {error}</p>;
  if (!result || result.length === 0) return null;

  return (
    <Container className="my-5">
      <div className="section-heading">
        <div>
          <h2>Recommended for your query</h2>
          <p>Similar homes ranked by match quality so you can compare good fits quickly.</p>
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
                style={{ height: '200px', objectFit: 'cover' }}
                loading="lazy"
                decoding="async"
              />
              <Card.Body>
                <Card.Title>{item.LISTING_TITLE || item.SOCIETY_NAME}</Card.Title>
                <Card.Text>
                  <strong>Community:</strong> {item.PROJECT_LABEL || item.SOCIETY_NAME || 'N/A'} <br />
                  <strong>Location:</strong> {[item.location, item.CITY].filter(Boolean).join(', ') || 'N/A'} <br />
                  <strong>Bedrooms:</strong> {item.BEDROOM_NUM || 'N/A'} <br />
                  <strong>Area:</strong> {item.AREA ? `${item.AREA} sq ft` : 'N/A'} <br />
                  <strong>Price:</strong> Rs. {item.PRICE >= 1 ? `${item.PRICE} Cr` : `${(item.PRICE * 100).toFixed(2)} Lakh`}
                </Card.Text>
                <div className="card-action-row">
                  <span className="chip">{item.Similarity || 'N/A'}% match</span>
                  <Link to={`/flats/${item._id}`} className="text-link">
                    View <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </Slider>
    </Container>
  );
};

export default Recommendation;

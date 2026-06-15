import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { locationSuggestions } from '../../others/Keywords';
import HistoryTable from './HistoryTable';
import Recommendation from './Recommendation';
import { Alert, Button, Col, Form, ListGroup, Row } from 'react-bootstrap';
import { getStoredAuth } from '../../utils/auth';
import { formatImpliedPricePerSqft, formatPredictionRange } from './predictionFormatting';

const locationOptions = locationSuggestions;

const Predict = () => {
  const [data, setData] = useState(null);
  const [location, setLocation] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [bedroom, setBedroom] = useState('');
  const [balcony, setBalcony] = useState('');
  const [area, setArea] = useState('');
  const [age, setAge] = useState('');
  const [furnish, setFurnish] = useState('');
  const [amenity, setAmenity] = useState('');
  const [floor, setFloor] = useState('');
  const [history, setHistory] = useState([]);
  const [formDataForRecommendation, setFormDataForRecommendation] = useState({});
  const [predictedData, setPredictedData] = useState();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token, user } = getStoredAuth();
  const historyKey = user ? `searchHistory:${user._id}` : 'searchHistory';

  useEffect(() => {
    if (!token) {
      setHistory([]);
      return;
    }

    const savedHistory = localStorage.getItem(historyKey);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, [historyKey, token]);

  const handleLocationChange = (event) => {
    const value = event.target.value;
    setLocation(value);

    if (value.length > 0) {
      setFilteredSuggestions(
        locationOptions.filter((option) => option.toLowerCase().includes(value.toLowerCase()))
      );
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setLocation(suggestion);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
  };

  const formHandler = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    // The ML API expects the same field names used by the Django scorer.
    const query = { location, bedroom, balcony, area, age, furnish, amenity, floor };

    try {
      // One request returns the prediction immediately, so the UI stays responsive.
      const response = await axios.post(`${process.env.REACT_APP_DJANGO_API_URL}submit/`, query);
      const result = response.data;
      const predictionPayload = { prediction: result.prediction };
      const recommendationQuery = { ...query, PRICE: result.prediction };

      setData(predictionPayload);
      setPredictedData(null);
      setFormDataForRecommendation(recommendationQuery);

      if (token) {
        const updatedHistory = [{ query, prediction: result.prediction }, ...history];
        setHistory(updatedHistory);
        localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Django prediction API is not responding.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (index) => {
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
    localStorage.setItem(historyKey, JSON.stringify(newHistory));
  };

  useEffect(() => {
    const getSuggestion = async () => {
      if (!formDataForRecommendation || !formDataForRecommendation.PRICE) return;
      try {
        // Recommendation is a second step that ranks similar homes for the predicted price.
        const response = await axios.post(
          `${process.env.REACT_APP_DJANGO_API_URL}recommend/Prediction-recommendations/`,
          formDataForRecommendation
        );
        setPredictedData(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    getSuggestion();
  }, [formDataForRecommendation]);

  const predictedPrice = Number(data?.prediction) || 0;
  const priceRange = predictedPrice ? formatPredictionRange(predictedPrice) : 'Waiting for query';
  const impliedPricePerSqft = formatImpliedPricePerSqft(predictedPrice, area);

  return (
    <>
      <section className="page-hero">
        <div className="eyebrow" style={{ color: 'var(--teal)' }}>Flat AI</div>
        <h1>See a smart price range before you shortlist the home.</h1>

      </section>

      <section className="section-shell">
        <Row className="g-4">
          <Col lg={7}>
            <div className="form-panel">
              <div className="section-heading">
                <div>
                  <h2>Smart pricing guide</h2>
                  <p>Get a polished price range built from comparable homes and current market signals.</p>
                </div>
              </div>

              {error ? <Alert variant="danger">{error}</Alert> : null}

              <Form onSubmit={formHandler}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label>Location</Form.Label>
                    <input
                      className="form-control"
                      type="text"
                      value={location}
                      onChange={handleLocationChange}
                      placeholder="Type location..."
                      required
                    />
                    {showSuggestions && location && (
                      <ListGroup className="mt-2">
                        {filteredSuggestions.slice(0, 8).map((suggestion) => (
                          <ListGroup.Item key={suggestion} onClick={() => handleSuggestionClick(suggestion)} action>
                            {suggestion}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </Col>

                  <Col md={3}>
                    <Form.Label>Bedrooms</Form.Label>
                    <Form.Select value={bedroom} onChange={(e) => setBedroom(e.target.value)} required>
                      <option value="">Select</option>
                      {[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value} BHK</option>)}
                    </Form.Select>
                  </Col>

                  <Col md={3}>
                    <Form.Label>Balcony</Form.Label>
                    <Form.Select value={balcony} onChange={(e) => setBalcony(e.target.value)} required>
                      <option value="">Select</option>
                      {[0, 1, 2, 3, 4].map((value) => <option key={value} value={value}>{value}</option>)}
                    </Form.Select>
                  </Col>

                  <Col md={4}>
                    <Form.Label>Built-up area</Form.Label>
                    <input
                      className="form-control"
                      type="number"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="Sq.ft."
                      required
                    />
                  </Col>

                  <Col md={4}>
                    <Form.Label>Age</Form.Label>
                    <Form.Select value={age} onChange={(e) => setAge(e.target.value)} required>
                      <option value="">Select</option>
                      <option value="New Property">New</option>
                      <option value="Relatively New">Relatively new</option>
                      <option value="Moderately Old">Moderately old</option>
                      <option value="Old Property">Old</option>
                    </Form.Select>
                  </Col>

                  <Col md={4}>
                    <Form.Label>Furnishing</Form.Label>
                    <Form.Select value={furnish} onChange={(e) => setFurnish(e.target.value)} required>
                      <option value="">Select</option>
                      <option value="Unfurnished">Unfurnished</option>
                      <option value="Semi Furnished">Semi-furnished</option>
                      <option value="Luxury furnished">Luxury furnished</option>
                      <option value="Fully furnished">Fully furnished</option>
                    </Form.Select>
                  </Col>

                  <Col md={6}>
                    <Form.Label>Amenity level</Form.Label>
                    <Form.Select value={amenity} onChange={(e) => setAmenity(e.target.value)} required>
                      <option value="">Select</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </Form.Select>
                  </Col>

                  <Col md={6}>
                    <Form.Label>Floor band</Form.Label>
                    <Form.Select value={floor} onChange={(e) => setFloor(e.target.value)} required>
                      <option value="">Select</option>
                      <option value="Low Floor">Low floor</option>
                      <option value="Mid Floor">Mid floor</option>
                      <option value="High Floor">High floor</option>
                    </Form.Select>
                  </Col>

                  <Col xs={12}>
                    <Button type="submit" className="w-100" disabled={loading}>
                      {loading ? 'Predicting...' : 'Get prediction'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </Col>

          <Col lg={5}>
            <div className="detail-panel" style={{ minHeight: '100%' }}>
              <div className="eyebrow">Predicted market price</div>
              <h1 style={{ fontSize: '3rem', lineHeight: 1 }}>{priceRange}</h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.82)' }}>
                {predictedPrice
                  ? 'This price band is built from comparable homes and tuned to feel like a real market-ready offer.'
                  : 'Fill the form to generate a market-ready price range.'}
              </p>
              <div className="spec-grid mt-4">
                <div className="spec-tile">
                  <span>Value per sqft</span>
                  <strong>{impliedPricePerSqft}</strong>
                </div>
                <div className="spec-tile">
                  <span>Location</span>
                  <strong>{location || 'N/A'}</strong>
                </div>
                <div className="spec-tile">
                  <span>BHK</span>
                  <strong>{bedroom || 'N/A'}</strong>
                </div>
                <div className="spec-tile">
                  <span>Amenity</span>
                  <strong>{amenity || 'N/A'}</strong>
                </div>
              </div>
              {!token ? (
                <div className="analytics-stat mt-4">
                  <span>Signed out</span>
                  <strong>History is disabled</strong>
                  <small>Log in to save prediction history across sessions.</small>
                </div>
              ) : null}
            </div>
          </Col>
        </Row>
      </section>

      <Recommendation data={predictedData} />
      {token ? <HistoryTable history={history} onDelete={handleDelete} /> : null}
    </>
  );
};

export default Predict;

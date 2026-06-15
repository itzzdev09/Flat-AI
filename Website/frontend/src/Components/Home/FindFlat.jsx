import React, { useState } from 'react';
import {
  Row,
  Col,
  Form,
  Button,
  Container,
  DropdownButton,
  ListGroup,
} from 'react-bootstrap';
import { locationSuggestions } from '../../others/Keywords';
import { useDispatch } from 'react-redux';
import { searchFlatSlice } from '../../RTK/Slices/SearchSlice';
import { getLocationSuggestions } from '../../utils/propertyUtils';

const FindFlat = () => {
  const locationOptions = locationSuggestions;
  const [location, setLocation] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [bedroom, setBedroom] = useState('');
  const [property, setProperty] = useState('Flat/Apartment');
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const value = e.target.value;
    setLocation(value);

    if (value.length > 0) {
      setFilteredSuggestions(getLocationSuggestions(locationOptions, value));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(searchFlatSlice({ location, bedroom, property }));
  };

  return (
    <Container>
      <div className="search-console">
        <div className="section-heading">
          <div>
            <h2>Search Kolkata flats</h2>
            <p>Filter by location, BHK, and property format using the live Node API.</p>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <Row className="g-3 align-items-start">
            <Col md={3}>
              <DropdownButton title={`BHK: ${bedroom ? `${bedroom} BHK` : 'Any'}`} className="w-100">
                <div className="p-3">
                  {[1, 2, 3, 4, 5, 6].map((value) => (
                    <Form.Check
                      key={value}
                      label={`${value} BHK`}
                      type="radio"
                      name="bedroom"
                      value={String(value)}
                      onChange={(event) => setBedroom(event.target.value)}
                      checked={bedroom === String(value)}
                    />
                  ))}
                </div>
              </DropdownButton>
            </Col>

            <Col md={3}>
              <DropdownButton title={`Type: ${property}`} className="w-100">
                <div className="p-3">
                  {['Flat/Apartment', 'Farm House', 'House/Villa', 'Residential Land'].map((value) => (
                    <Form.Check
                      key={value}
                      label={value}
                      type="radio"
                      name="property"
                      value={value}
                      onChange={(event) => setProperty(event.target.value)}
                      checked={property === value}
                    />
                  ))}
                </div>
              </DropdownButton>
            </Col>

            <Col md={4}>
              <input
                className="form-control"
                type="text"
                value={location}
                onChange={handleChange}
                placeholder="Type a location..."
                required
              />

              {showSuggestions && location && (
                <ListGroup className="mt-2">
                  {filteredSuggestions.slice(0, 8).map((suggestion) => (
                    <ListGroup.Item
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      action
                    >
                      {suggestion}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Col>

            <Col md={2}>
              <Button type="submit" className="w-100">
                <i className="fa-solid fa-magnifying-glass"></i>&nbsp; Search
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </Container>
  );
};

export default FindFlat;

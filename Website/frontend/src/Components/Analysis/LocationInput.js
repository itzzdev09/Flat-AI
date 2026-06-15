import React, { useState } from 'react';
import { locationSuggestions } from '../../others/Keywords.js';
import { getLocationSuggestions } from '../../utils/propertyUtils';

const LocationInput = ({
  locationInput,
  setLocationInput,
  suggestions = locationSuggestions,
  label = 'Location',
  placeholder = 'Filter by location...',
}) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = (event) => {
    const value = event.target.value;
    setLocationInput(value);

    if (value.length > 0) {
      setFilteredSuggestions(getLocationSuggestions(suggestions, value));
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setLocationInput(suggestion);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setLocationInput('');
    setFilteredSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="analytics-search">
      <div className="analytics-search-header">
        <label>{label}</label>
        {locationInput ? (
          <button type="button" className="analytics-clear-btn" onClick={handleClear}>
            Clear
          </button>
        ) : null}
      </div>
      <input
        className="form-control"
        type="text"
        value={locationInput}
        onChange={handleChange}
        placeholder={placeholder}
      />
      <p className="analytics-muted analytics-search-help">Type a neighborhood, locality, or road name. You can also pick from the quick suggestions below.</p>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul role="listbox" className="list-group analytics-suggestion-list">
          {filteredSuggestions.slice(0, 8).map((suggestion) => (
            <li
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className="list-group-item analytics-suggestion-item"
              style={{ cursor: 'pointer' }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationInput;

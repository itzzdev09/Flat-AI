import React from 'react';
import { Button, Table } from 'react-bootstrap';

const formatPrediction = (prediction) => {
  const low = Math.max(prediction - 0.13, 0.01);
  const high = prediction + 0.13;
  return high > 1
    ? `${low.toFixed(2)} to ${high.toFixed(2)} Cr`
    : `${(low * 100).toFixed(2)} to ${(high * 100).toFixed(2)} Lakh`;
};

const HistoryTable = ({ history, onDelete }) => {
  if (!history.length) return null;

  return (
    <section className="section-shell">
      <div className="feature-band">
        <div className="section-heading">
          <div>
            <h2>Prediction history</h2>
            <p>Recent queries are stored in local browser storage for quick comparison.</p>
          </div>
        </div>

        <Table bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>Location</th>
              <th>BHK</th>
              <th>Area</th>
              <th>Age</th>
              <th>Furnish</th>
              <th>Amenity</th>
              <th>Floor</th>
              <th>Prediction</th>
              <th>Price / sqft</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <tr key={`${entry.query.location}-${index}`} className="align-middle">
                <td>{entry.query.location}</td>
                <td>{entry.query.bedroom}</td>
                <td>{entry.query.area}</td>
                <td>{entry.query.age}</td>
                <td>{entry.query.furnish}</td>
                <td>{entry.query.amenity}</td>
                <td>{entry.query.floor}</td>
                <td><strong>{formatPrediction(entry.prediction)}</strong></td>
                <td>Rs. {((entry.prediction * 10000000) / entry.query.area).toFixed(2)}</td>
                <td>
                  <Button onClick={() => onDelete(index)} aria-label="Delete history row">
                    <i className="fa-solid fa-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <p className="property-meta mb-0">
          Predictions are directional estimates and may drift on unusual inputs.
        </p>
      </div>
    </section>
  );
};

export default HistoryTable;

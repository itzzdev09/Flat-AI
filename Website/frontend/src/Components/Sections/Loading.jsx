import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loading = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-soft)' }}>
      <Spinner animation="grow" style={{ width: '30px', height: '30px', color: 'var(--primary)' }} />
      <Spinner animation="grow" style={{ width: '60px', height: '60px', color: 'var(--accent)' }} />
      <Spinner animation="grow" style={{ width: '100px', height: '100px', color: 'var(--primary)' }} />
      <p className="mt-3 mb-0">Loading data...</p>
    </div>
  );
};

export default Loading;

import React from 'react'
import {Spinner} from 'react-bootstrap'

const Loading = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--muted)' }}>
      <Spinner animation="grow" style={{ width: '30px', height: '30px', color: 'var(--teal)' }} />
      <Spinner animation="grow" style={{ width: '60px', height: '60px', color: 'var(--forest)' }} />
      <Spinner animation="grow" style={{ width: '100px', height: '100px', color: 'var(--clay)' }} />
      <p className="mt-3 mb-0">Loading data...</p>
  </div>
  )
}

export default Loading

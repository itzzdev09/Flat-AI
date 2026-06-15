import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import '@fortawesome/fontawesome-free/css/all.min.css' 

const Footer = () => {
  const currentYear = new Date().getFullYear() 

  return (
    <footer className="footer-shell">
      <Container>
        <Row className="align-items-center">
          <Col md={6}>
            <strong style={{ color: 'var(--forest)' }}>Flat AI</strong>
            <p className="mb-0">Kolkata real estate search, prediction, and recommendations.</p>
          </Col>
          <Col md={6} className="text-md-end mt-3 mt-md-0">
            <span>&copy; {currentYear} Flat AI. All rights reserved.</span>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer

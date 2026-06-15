import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { formatSessionDuration, getStoredAuth, storeAuthSession } from '../utils/auth';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const defaultSessionLength = formatSessionDuration(60 * 60 * 24 * 7);

const Auth = ({ mode }) => {
  const isSignup = mode === 'signup';
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionLabel, setSessionLabel] = useState(defaultSessionLength);

  useEffect(() => {
    const { token, user, session } = getStoredAuth();
    if (token) {
      navigate(user?.role === 'admin' ? '/admin' : '/profile', { replace: true });
      return;
    }

    if (session?.expiresInSeconds) {
      setSessionLabel(formatSessionDuration(session.expiresInSeconds));
    }
  }, [navigate]);

  const updateField = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const trimmedEmail = formData.email.trim().toLowerCase();
      const trimmedName = formData.name.trim();

      if (isSignup && trimmedName.length < 2) {
        throw new Error('Name must be at least 2 characters');
      }

      if (!emailPattern.test(trimmedEmail)) {
        throw new Error('Enter a valid email address');
      }

      const endpoint = isSignup ? 'auth/signup' : 'auth/login';
      const payload = isSignup
        ? { ...formData, name: trimmedName, email: trimmedEmail }
        : { email: trimmedEmail, password: formData.password };
      const response = await axios.post(`${process.env.REACT_APP_NODE_API_URL}${endpoint}`, payload);

      const session = storeAuthSession(response.data);
      if (session?.expiresInSeconds) {
        setSessionLabel(formatSessionDuration(session.expiresInSeconds));
      }
      navigate(response.data.user?.role === 'admin' ? '/admin' : '/profile');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-shell" style={{ minHeight: '74vh', display: 'grid', alignItems: 'center' }}>
      <Row className="g-4 align-items-center">
        <Col lg={6}>
          <div className="page-hero" style={{ width: 'auto', padding: 0 }}>
            <div className="eyebrow" style={{ color: 'var(--teal)' }}>Private workspace</div>
            <h1>{isSignup ? 'Create your search account.' : 'Welcome back to your property desk.'}</h1>
            <p>
              Save homes, keep prediction history, and move between search and recommendations
              with a timed JWT-secured account handled by the Node API.
            </p>
          </div>
          <div className="metric-strip">
            <div className="metric-tile"><strong>{sessionLabel}</strong><span>default sign-in length</span></div>
            <div className="metric-tile"><strong>Smart</strong><span>price ranges</span></div>
            <div className="metric-tile"><strong>Mongo</strong><span>profile-ready API</span></div>
          </div>
        </Col>

        <Col lg={6}>
          <div className="form-panel">
            <h2 className="mb-1">{isSignup ? 'Sign up' : 'Login'}</h2>
            <p className="property-meta mb-4">
              {isSignup ? 'Start a new Flat AI account.' : 'Use your existing Flat AI account.'} Sessions expire automatically after {sessionLabel}.
            </p>

            {error ? <Alert variant="danger">{error}</Alert> : null}

            <Form onSubmit={handleSubmit}>
              {isSignup ? (
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    name="name"
                    value={formData.name}
                    onChange={updateField}
                    placeholder="Enter your name"
                    required
                  />
                </Form.Group>
              ) : null}

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={updateField}
                  placeholder="Enter email"
                  autoComplete="email"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={updateField}
                  placeholder="Enter password"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  minLength={6}
                  required
                />
              </Form.Group>

              <Button type="submit" className="w-100" disabled={loading}>
                {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Login'}
              </Button>
            </Form>

            <p className="text-center mt-4 mb-0">
              {isSignup ? 'Already have an account?' : 'New here?'}{' '}
              <Link className="text-link" to={isSignup ? '/login' : '/signup'}>
                {isSignup ? 'Login' : 'Create one'}
              </Link>
            </p>
          </div>
        </Col>
      </Row>
    </section>
  );
};

export default Auth;

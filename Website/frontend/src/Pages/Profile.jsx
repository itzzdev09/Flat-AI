import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { clearStoredAuth, formatSessionDuration, formatSessionExpiry, getAuthHeaders, getStoredAuth, storeAuthSession } from '../utils/auth';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Profile = () => {
  const navigate = useNavigate();
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [sessionInfo, setSessionInfo] = useState(() => getStoredAuth().session);
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const { token, session } = getStoredAuth();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    setSessionInfo(session);

    const loadProfile = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_NODE_API_URL}auth/me`, {
          headers: getAuthHeaders(),
        });
        setProfileForm({
          name: response.data.user.name || '',
          email: response.data.user.email || '',
        });
        if (response.data.session) {
          setSessionInfo(response.data.session);
        }
      } catch (err) {
        clearStoredAuth();
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const updateProfileField = (event) => {
    setProfileForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const updatePasswordField = (event) => {
    setPasswordForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setProfileMessage('');

    const trimmedName = profileForm.name.trim();
    const trimmedEmail = profileForm.email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setError('Enter a valid email address');
      return;
    }

    setSavingProfile(true);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_NODE_API_URL}auth/me`,
        { name: trimmedName, email: trimmedEmail },
        { headers: getAuthHeaders() }
      );
      const session = storeAuthSession(response.data);
      setSessionInfo(session);
      setProfileForm({ name: response.data.user.name, email: response.data.user.email });
      setProfileMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setPasswordMessage('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Fill all password fields.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setError('New password must be different from the current password.');
      return;
    }

    setSavingPassword(true);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_NODE_API_URL}auth/password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        },
        { headers: getAuthHeaders() }
      );
      const session = storeAuthSession(response.data);
      setSessionInfo(session);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMessage('Password changed successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <section className="section-shell">
        <div className="feature-band">
          <p className="mb-0">Loading profile...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="page-hero">
        <div className="eyebrow">Account</div>
        <h1>Your profile and security settings.</h1>
        <p>
          Update your name, email, and password without leaving the workspace.
          {' '}
          {sessionInfo?.expiresInSeconds
            ? `This login lasts ${formatSessionDuration(sessionInfo.expiresInSeconds)} and expires on ${formatSessionExpiry(sessionInfo.expiresAt)}.`
            : 'Your session expires automatically when the token reaches its limit.'}
        </p>
      </section>

      <section className="section-shell">
        {error ? <Alert variant="danger">{error}</Alert> : null}
        <Row className="g-4">
          <Col lg={6}>
            <div className="form-panel">
              <div className="section-heading">
                <div>
                  <h2>Profile Details</h2>
                  <p>Keep your account information up to date.</p>
                </div>
              </div>
              {profileMessage ? <Alert variant="success">{profileMessage}</Alert> : null}
              <Form onSubmit={handleProfileSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control name="name" value={profileForm.name} onChange={updateProfileField} required />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={profileForm.email} onChange={updateProfileField} required />
                </Form.Group>
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save profile'}
                </Button>
              </Form>
            </div>
          </Col>

          <Col lg={6}>
            <div className="form-panel">
              <div className="section-heading">
                <div>
                  <h2>Password</h2>
                  <p>Change your password to keep the account secure.</p>
                </div>
              </div>
              {passwordMessage ? <Alert variant="success">{passwordMessage}</Alert> : null}
              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Current password</Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={updatePasswordField}
                    autoComplete="current-password"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>New password</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={updatePasswordField}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Confirm new password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={updatePasswordField}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </Form.Group>
                <Button type="submit" disabled={savingPassword}>
                  {savingPassword ? 'Updating...' : 'Change password'}
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </section>
    </>
  );
};

export default Profile;

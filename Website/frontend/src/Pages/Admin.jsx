import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Alert, Button, Col, Form, Row, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders, getStoredAuth } from '../utils/auth';

const emptyProperty = {
  PROP_ID: '',
  PROPERTY_TYPE: 'Flat',
  SOCIETY_NAME: '',
  CITY: 'Kolkata',
  location: '',
  BEDROOM_NUM: 2,
  AREA: 900,
  PRICE: 0.75,
  Price_per_sqft: 5000,
  Image: '',
  Contact: '',
};

const Admin = () => {
  const navigate = useNavigate();
  const { token, user } = getStoredAuth();
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [propertyForm, setPropertyForm] = useState(emptyProperty);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    if ((user?.role || 'user') !== 'admin') {
      navigate('/profile', { replace: true });
      return;
    }

    const load = async () => {
      try {
        const [summaryResponse, usersResponse, propertyResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_NODE_API_URL}admin/summary`, { headers: getAuthHeaders() }),
          axios.get(`${process.env.REACT_APP_NODE_API_URL}admin/users`, { headers: getAuthHeaders() }),
          axios.get(`${process.env.REACT_APP_NODE_API_URL}admin/properties`, { headers: getAuthHeaders() }),
        ]);

        setSummary(summaryResponse.data);
        setUsers(usersResponse.data);
        setProperties(propertyResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate, token, user?.role]);

  const updateField = (event) => {
    setPropertyForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const refreshData = async () => {
    const [summaryResponse, usersResponse, propertyResponse] = await Promise.all([
      axios.get(`${process.env.REACT_APP_NODE_API_URL}admin/summary`, { headers: getAuthHeaders() }),
      axios.get(`${process.env.REACT_APP_NODE_API_URL}admin/users`, { headers: getAuthHeaders() }),
      axios.get(`${process.env.REACT_APP_NODE_API_URL}admin/properties`, { headers: getAuthHeaders() }),
    ]);
    setSummary(summaryResponse.data);
    setUsers(usersResponse.data);
    setProperties(propertyResponse.data);
  };

  const submitProperty = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      await axios.post(`${process.env.REACT_APP_NODE_API_URL}admin/properties`, propertyForm, {
        headers: getAuthHeaders(),
      });
      setPropertyForm(emptyProperty);
      setMessage('Property created successfully.');
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create property.');
    }
  };

  const toggleRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await axios.patch(
        `${process.env.REACT_APP_NODE_API_URL}admin/users/${userId}/role`,
        { role: nextRole },
        { headers: getAuthHeaders() }
      );
      setMessage(`Updated role to ${nextRole}.`);
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const deleteProperty = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_NODE_API_URL}admin/properties/${id}`, {
        headers: getAuthHeaders(),
      });
      setMessage('Property deleted.');
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete property.');
    }
  };

  if (loading) {
    return (
      <section className="section-shell">
        <div className="feature-band">Loading admin portal...</div>
      </section>
    );
  }

  return (
    <>
      <section className="page-hero">
        <div className="eyebrow" style={{ color: 'var(--teal)' }}>Admin portal</div>
        <h1>Manage users and listings.</h1>
        <p>Switch roles, review the catalog, and add or remove properties from the admin dashboard.</p>
      </section>

      <section className="section-shell">
        {error ? <Alert variant="danger">{error}</Alert> : null}
        {message ? <Alert variant="success">{message}</Alert> : null}

        <Row className="g-4 mb-4">
          <Col md={4}>
            <div className="metric-tile"><strong>{summary?.users ?? 0}</strong><span>users</span></div>
          </Col>
          <Col md={4}>
            <div className="metric-tile"><strong>{summary?.admins ?? 0}</strong><span>admins</span></div>
          </Col>
          <Col md={4}>
            <div className="metric-tile"><strong>{summary?.properties ?? 0}</strong><span>properties</span></div>
          </Col>
        </Row>

        <Row className="g-4">
          <Col lg={6}>
            <div className="form-panel">
              <div className="section-heading">
                <div>
                  <h2>Users</h2>
                  <p>Promote or demote account roles.</p>
                </div>
              </div>
              <Table responsive bordered hover className="table-sm align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.role || 'user'}</td>
                      <td>
                        <Button size="sm" onClick={() => toggleRole(item._id, item.role || 'user')}>
                          Make {item.role === 'admin' ? 'user' : 'admin'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Col>

          <Col lg={6}>
            <div className="form-panel">
              <div className="section-heading">
                <div>
                  <h2>Add property</h2>
                  <p>Quick-create a listing with sensible defaults.</p>
                </div>
              </div>
              <Form onSubmit={submitProperty}>
                <Row className="g-3">
                  <Col md={6}><Form.Control name="PROP_ID" value={propertyForm.PROP_ID} onChange={updateField} placeholder="Property ID" /></Col>
                  <Col md={6}><Form.Control name="SOCIETY_NAME" value={propertyForm.SOCIETY_NAME} onChange={updateField} placeholder="Society name" /></Col>
                  <Col md={6}><Form.Control name="location" value={propertyForm.location} onChange={updateField} placeholder="Location" /></Col>
                  <Col md={6}><Form.Control name="CITY" value={propertyForm.CITY} onChange={updateField} placeholder="City" /></Col>
                  <Col md={4}><Form.Control name="BEDROOM_NUM" type="number" value={propertyForm.BEDROOM_NUM} onChange={updateField} placeholder="BHK" /></Col>
                  <Col md={4}><Form.Control name="AREA" type="number" value={propertyForm.AREA} onChange={updateField} placeholder="Area" /></Col>
                  <Col md={4}><Form.Control name="PRICE" type="number" step="0.01" value={propertyForm.PRICE} onChange={updateField} placeholder="Price" /></Col>
                  <Col md={6}><Form.Control name="Price_per_sqft" type="number" value={propertyForm.Price_per_sqft} onChange={updateField} placeholder="Price / sqft" /></Col>
                  <Col md={6}><Form.Control name="Image" value={propertyForm.Image} onChange={updateField} placeholder="Image URL" /></Col>
                  <Col xs={12}><Form.Control name="Contact" value={propertyForm.Contact} onChange={updateField} placeholder="Contact" /></Col>
                  <Col xs={12}>
                    <Button type="submit">Create listing</Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </Col>
        </Row>

        <div className="form-panel mt-4">
          <div className="section-heading">
            <div>
              <h2>Properties</h2>
              <p>Delete a listing directly from the catalog.</p>
            </div>
          </div>
          <Table responsive bordered hover className="table-sm align-middle">
            <thead>
              <tr>
                <th>Property</th>
                <th>Location</th>
                <th>Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {properties.slice(0, 25).map((item) => (
                <tr key={item._id}>
                  <td>{item.SOCIETY_NAME}</td>
                  <td>{item.location}</td>
                  <td>{item.PRICE}</td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => deleteProperty(item._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </section>
    </>
  );
};

export default Admin;

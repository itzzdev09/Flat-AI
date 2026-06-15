import React, { useEffect, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import logo from './building.png';
import { AUTH_CHANGE_EVENT, clearStoredAuth, getStoredAuth } from '../../utils/auth';

function NavBar() {
  const [user, setUser] = useState(() => getStoredAuth().user);

  useEffect(() => {
    const syncUser = () => {
      setUser(getStoredAuth().user);
    };

    window.addEventListener(AUTH_CHANGE_EVENT, syncUser);
    window.addEventListener('storage', syncUser);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  const logout = () => {
    clearStoredAuth();
  };

  return (
    <Navbar expand="lg" variant="light" collapseOnSelect sticky="top" className="app-navbar">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand className="brand-mark">
            <img src={logo} alt="Logo" />
            <span>Flat AI</span>
          </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto" style={{ alignItems: 'center' }}>
            <LinkContainer to="/">
              <Nav.Link>
                <i className="fa-solid fa-home"></i>&nbsp; Home
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/predict">
              <Nav.Link>
                <i className="fa-solid fa-cloud"></i>&nbsp; Predict
              </Nav.Link>
            </LinkContainer>

            <LinkContainer to="/analysis">
              <Nav.Link>
                <i className="fa-solid fa-chart-simple"></i>&nbsp; Analysis
              </Nav.Link>
            </LinkContainer>


            <LinkContainer to="/wishlist">
              <Nav.Link>
              <i className="fa-solid fa-heart"></i>&nbsp; Wishlists
              </Nav.Link>
            </LinkContainer>

            {user?.role === 'admin' ? (
              <LinkContainer to="/admin">
                <Nav.Link>
                  <i className="fa-solid fa-shield-halved"></i>&nbsp; Admin
                </Nav.Link>
              </LinkContainer>
            ) : null}

            {user ? (
              <LinkContainer to="/profile">
                <Nav.Link>
                  <i className="fa-solid fa-id-card"></i>&nbsp; Profile
                </Nav.Link>
              </LinkContainer>
            ) : null}

            


          </Nav>

          <Nav>
            {user ? (
              <>
                <LinkContainer to="/profile">
                <Nav.Link>
                  <i className="fa-solid fa-user"></i>&nbsp; {user.name}
                </Nav.Link>
                </LinkContainer>
                <Nav.Link onClick={logout}>
                  <i className="fa-solid fa-right-from-bracket"></i>&nbsp; Logout
                </Nav.Link>
              </>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>
                    <i className="fa-solid fa-right-to-bracket"></i>&nbsp; Login
                  </Nav.Link>
                </LinkContainer>
                <LinkContainer to="/signup">
                  <Nav.Link>
                    <i className="fa-solid fa-user-plus"></i>&nbsp; Sign Up
                  </Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;


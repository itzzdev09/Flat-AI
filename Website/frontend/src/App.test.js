import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Match the flags set on the real Router in index.js, so the tests exercise the
// same routing behaviour the app ships with (and stay free of the v7 warnings).
const FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };

jest.mock('./Components/Sections/Navbar', () => () => <div>Navbar</div>);
jest.mock('./Components/Sections/Footer', () => () => <div>Footer</div>);
jest.mock('./Pages/Home', () => () => <div>Home Page</div>);
jest.mock('./Pages/Prediction', () => () => <div>Prediction Page</div>);
jest.mock('./Pages/AnalysisPage', () => () => <div>Analysis Page</div>);
jest.mock('./Pages/PropertyDetailsPage', () => () => <div>Property Details Page</div>);
jest.mock('./Pages/WishList', () => () => <div>Wishlist Page</div>);
jest.mock('./Pages/Auth', () => ({ mode }) => <div>{mode === 'signup' ? 'Signup Page' : 'Login Page'}</div>);
jest.mock('./Pages/Profile', () => () => <div>Profile Page</div>);
jest.mock('./Pages/Admin', () => () => <div>Admin Page</div>);

// Route components are lazy, so the page resolves on a later tick than the
// shell. Navbar and Footer stay eager and are asserted synchronously.
test('renders the home route shell', async () => {
  render(
    <MemoryRouter initialEntries={['/']} future={FUTURE}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText('Navbar')).toBeInTheDocument();
  expect(screen.getByText('Footer')).toBeInTheDocument();
  expect(await screen.findByText('Home Page')).toBeInTheDocument();
});

test('renders analysis route', async () => {
  render(
    <MemoryRouter initialEntries={['/analysis']} future={FUTURE}>
      <App />
    </MemoryRouter>
  );

  expect(await screen.findByText('Analysis Page')).toBeInTheDocument();
});

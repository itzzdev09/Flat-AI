import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

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

test('renders the home route shell', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText('Navbar')).toBeInTheDocument();
  expect(screen.getByText('Home Page')).toBeInTheDocument();
  expect(screen.getByText('Footer')).toBeInTheDocument();
});

test('renders analysis route', () => {
  render(
    <MemoryRouter initialEntries={['/analysis']}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText('Analysis Page')).toBeInTheDocument();
});

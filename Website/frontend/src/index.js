import React from 'react';
import '../src/CSS/index.css'

import ReactDOM from 'react-dom/client'; 
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import { BrowserRouter as Router } from 'react-router-dom'; 
import App from './App';
import { store } from './RTK/store'
import { Provider } from 'react-redux'




const root = ReactDOM.createRoot(document.getElementById('root')); 
root.render(
  <React.StrictMode>
    <Provider store={store}>
    {/* Opt in to the v7 behaviours now: state updates wrapped in
        React.startTransition, and v7 relative-path resolution inside splat
        routes. Without these react-router logs a deprecation warning on every
        render, and enabling them early keeps the v7 upgrade from changing
        behaviour underneath us. */}
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App/>
      </Router>
      </Provider>
  </React.StrictMode>
);



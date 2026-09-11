import '../src/CSS/App.css'
import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import NavBar from './Components/Sections/Navbar'
import Footer from './Components/Sections/Footer'
import Loading from './Components/Sections/Loading'
import './CSS/index.css'
import { pageMotion } from './Components/Sections/Motion';

// Routes are split so the initial download only carries the shell. Analysis
// pulls in plotly and the property page pulls in leaflet; eagerly importing them
// meant every visitor paid for both before the home page could render.
const Home = lazy(() => import('./Pages/Home'));
const PredictionPage = lazy(() => import('./Pages/Prediction'));
const AnalysisPage = lazy(() => import('./Pages/AnalysisPage'));
const PropertyDetailsPage = lazy(() => import('./Pages/PropertyDetailsPage'));
const WishList = lazy(() => import('./Pages/WishList'));
const Auth = lazy(() => import('./Pages/Auth'));
const Profile = lazy(() => import('./Pages/Profile'));
const Admin = lazy(() => import('./Pages/Admin'));



function App() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <>
      <div className="dark-theme">
        <NavBar />

        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            {...(reduceMotion ? { initial: false, animate: { opacity: 1, y: 0 } } : pageMotion)}
          >
            <Suspense fallback={<Loading />}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/predict" element={<PredictionPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/wishlist" element={<WishList />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/signup" element={<Auth mode="signup" />} />
              <Route path="/flats/:id" element={<PropertyDetailsPage />} />
            </Routes>
            </Suspense>
          </motion.main>
        </AnimatePresence>

        <Footer/>
        </div>
    </>
  )
}

export default App

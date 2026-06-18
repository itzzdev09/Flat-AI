import '../src/CSS/App.css'
import { Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import NavBar from './Components/Sections/Navbar'
import PredictionPage from './Pages/Prediction'
import Footer from './Components/Sections/Footer'
import Home from './Pages/Home'
import AnalysisPage from './Pages/AnalysisPage'
import PropertyDetailsPage from './Pages/PropertyDetailsPage'
import WishList from './Pages/WishList'
import Auth from './Pages/Auth'
import Profile from './Pages/Profile'
import Admin from './Pages/Admin'
import './CSS/index.css'
import { pageMotion } from './Components/Sections/Motion';



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
          </motion.main>
        </AnimatePresence>

        <Footer/>
        </div>
    </>
  )
}

export default App

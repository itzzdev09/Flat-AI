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
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<motion.main {...(reduceMotion ? { initial: false, animate: { opacity: 1, y: 0 } } : pageMotion)}><Home /></motion.main>} />
            <Route path="/predict" element={<motion.main {...(reduceMotion ? { initial: false, animate: { opacity: 1, y: 0 } } : pageMotion)}><PredictionPage /></motion.main>} />
            <Route path="/analysis" element={<motion.main {...(reduceMotion ? { initial: false, animate: { opacity: 1, y: 0 } } : pageMotion)}><AnalysisPage /></motion.main>} />
            <Route path="/wishlist" element={<motion.main {...(reduceMotion ? { initial: false, animate: { opacity: 1, y: 0 } } : pageMotion)}><WishList /></motion.main>} />
            <Route path="/profile" element={<motion.main {...(reduceMotion ? { initial: false, animate: { opacity: 1, y: 0 } } : pageMotion)}><Profile /></motion.main>} />
            <Route path="/admin" element={<motion.main {...(reduceMotion ? { initial: false, animate: { opacity: 1, y: 0 } } : pageMotion)}><Admin /></motion.main>} />
            <Route path="/login" element={<motion.main {...(reduceMotion ? { initial: false, animate: { opacity: 1, y: 0 } } : pageMotion)}><Auth mode="login" /></motion.main>} />
            <Route path="/signup" element={<motion.main {...(reduceMotion ? { initial: false, animate: { opacity: 1, y: 0 } } : pageMotion)}><Auth mode="signup" /></motion.main>} />
            <Route path="/flats/:id" element={<motion.main {...(reduceMotion ? { initial: false, animate: { opacity: 1, y: 0 } } : pageMotion)}><PropertyDetailsPage /></motion.main>} />
          </Routes>
        </AnimatePresence>

        <Footer/>
        </div>
    </>
  )
}

export default App

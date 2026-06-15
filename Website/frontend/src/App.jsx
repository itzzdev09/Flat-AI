import '../src/CSS/App.css'
import { Routes, Route } from "react-router-dom"

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



function App() {
  return (
    <>
      <div className="dark-theme">
        <NavBar />
        

      <Routes>
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
        
        <Footer/>
        </div>
    </>
  )
}

export default App

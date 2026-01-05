import { useEffect } from "react"
import MainContainer from "./Pages/Chats/MainContainer/MainContainer"
import Gig from "./Pages/Gig/Gig"
import Gigs from "./Pages/Gigs/Gigs"
import Home from "./Pages/Home/Home"
import MyGig from "./Pages/MyGig/MyGig"
import Orders from "./Pages/Orders/Orders"
import Footer from "./shared/Footer/footer"
import NavBar from "./shared/NavBar/NavBar"
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import AppLayout from "./AppLayout"
import { AuthProvider } from "./context/AuthContext"

function App() {

  return (
    <div className="app-wrapper">
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
    </div>
  )
}

export default App;

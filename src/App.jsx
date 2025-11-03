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
import Login from "./Pages/Auth/Login/Login"
import Signup from "./Pages/Auth/Signup/Signup"
import AppLayout from "./AppLayout"

function App() {

  return (
    <>
      <BrowserRouter>
        <AppLayout/>
      </BrowserRouter>
    </>
  )
}

export default App

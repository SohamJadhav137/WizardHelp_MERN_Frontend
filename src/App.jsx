import MainContainer from "./Pages/Chats/MainContainer/MainContainer"
import Gig from "./Pages/Gig/Gig"
import Gigs from "./Pages/Gigs/Gigs"
import Home from "./Pages/Home/Home"
import MyGig from "./Pages/MyGig/MyGig"
import Orders from "./Pages/Orders/Orders"
import Footer from "./shared/Footer/footer"
import NavBar from "./shared/NavBar/NavBar"
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {

  return (
    <>
      <BrowserRouter>
        <NavBar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gigs" element={<Gigs />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/gig/:id" element={<Gig/>} />
            <Route path="/my-gigs" element={<MyGig/>} />
            <Route path="/messages" element={<MainContainer/>} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </>
  )
}

export default App

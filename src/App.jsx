import { useEffect } from "react"
import MainContainer from "./Pages/Chats/MainContainer/MainContainer"
import Gig from "./Pages/Gig/Gig"
import Gigs from "./Pages/Gigs/Gigs"
import Home from "./Pages/Home/Home"
import MyGig from "./Pages/MyGig/MyGig"
import Orders from "./Pages/Orders/Orders"
import Footer from "./shared/Footer/footer"
import NavBar from "./shared/NavBar/NavBar"
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import socket from "./socket"

function App() {

  useEffect(()=> {

    window.socket = socket;
    // socket.on("connect", () => {
    //   console.log("Connected to server with ID:",socket.id);
    // });

    // socket.on("disconnect", () => {
    //   console.log("Disconnected from server");
    // });

    // socket.on("connect_error", (err) => {
    //   console.error("❌ Connection error:",err.message);
    // });

    // return () => {
    //   socket.disconnect();
    // }

    function handleConnect() {
      console.log("✅ Connected to backend with ID:", socket.id);
    }

    function handleDisconnect() {
      console.log("🔴 Disconnected from backend");
    }

    function handleError(err) {
      console.error("❌ Connection error:", err.message);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleError);
      socket.disconnect(); // ✅ ensure clean unmount
    };
  }, []);

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

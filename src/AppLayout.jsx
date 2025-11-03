import React from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import NavBar from './shared/NavBar/NavBar';
import Footer from './shared/Footer/footer';
import Login from './Pages/Auth/Login/Login';
import Signup from './Pages/Auth/Signup/Signup';
import Home from './Pages/Home/Home';
import Gigs from './Pages/Gigs/Gigs';
import Orders from './Pages/Orders/Orders';
import MyGig from './Pages/MyGig/MyGig';
import MainContainer from './Pages/Chats/MainContainer/MainContainer';
import Gig from './Pages/Gig/Gig';
import './AppLayout.css';

export default function AppLayout() {

    const location = useLocation();
    const isAuth = location.pathname === '/login' || location.pathname === '/signup';
    const mainContentForms = `main-content ${isAuth && 'main-content-align'}`

    return (
        <>
            <div className="app-layout">
                <NavBar />
                <div className={mainContentForms}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/" element={<Home />} />
                        <Route path="/gigs" element={<Gigs />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/gig/:id" element={<Gig />} />
                        <Route path="/my-gigs" element={<MyGig />} />
                        <Route path="/messages" element={<MainContainer />} />
                    </Routes>
                </div>
                <Footer />
            </div>
        </>
    )
}

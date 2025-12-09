import React, { useContext } from 'react'
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
import { AuthContext } from './context/AuthContext';
import { PrivateRoute } from './ProtectEndpoint/PrivateRoute';
import UnAuthorizedPage from './Pages/UnAuth/UnAuthorizedPage';
import CreateGig from './Pages/CreateGig/CreateGig';
import Order from './Pages/Order/Order';
import Profile from './Pages/Profile/Profile';
import EditProfile from './Pages/EditProfile/EditProfile';

export default function AppLayout() {

    const location = useLocation();
    const isAuth = location.pathname === '/login' || location.pathname === '/signup';
    const mainContentForms = `main-content ${isAuth ? 'main-content-align' : ''}`

    const { user } = useContext(AuthContext);

    return (
        <>
            <div className="app-layout">
                <NavBar />
                <div className={mainContentForms}>
                    <Routes>
                        <Route path="/login" element={!user ? <Login /> : <Home/>} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/" element={<Home />} />
                        <Route path="/category/:categoryName" element={<Gigs />} />
                        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                        <Route path="/orders/:id" element={<PrivateRoute><Order /></PrivateRoute>} />
                        <Route path="/gig/:gigId" element={<Gig />} />
                        <Route path="/my-gigs" element={<PrivateRoute allowedRoles={"seller"}><MyGig /></PrivateRoute>} />
                        <Route path="/messages" element={<PrivateRoute><MainContainer /></PrivateRoute>} />
                        <Route path="/messages/:conversationId" element={<PrivateRoute><MainContainer /></PrivateRoute>} />
                        <Route path="/unauthorized" element={<UnAuthorizedPage/>} />
                        <Route path="/create-gig" element={<PrivateRoute allowedRoles={"seller"}><CreateGig/></PrivateRoute>} />
                        <Route path="/create-gig/:gigId" element={<PrivateRoute allowedRoles={"seller"}><CreateGig/></PrivateRoute>} />
                        <Route path="/my-profile" element={<Profile/>} />
                        <Route path="/my-profile/edit" element={<EditProfile/>} />
                    </Routes>
                </div>
                <Footer />
            </div>
        </>
    )
}

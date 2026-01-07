import React, { useContext } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import NavBar from './shared/NavBar/NavBar';
import Footer from './shared/Footer/footer';
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
import ScrollToTop from './utils/ScrollToTop';
import OrderCheckOut from './Pages/OrderCheckOut/OrderCheckOut';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import AuthPage from './Pages/Auth/AuthPage';

library.add(fas, far, fab)

export default function AppLayout() {

    const location = useLocation();
    const isAuth = location.pathname === '/auth/login' || location.pathname === '/auth/signup';
    const mainContentForms = `main-content ${isAuth ? 'main-content-align' : ''}`

    const { user } = useContext(AuthContext);

    return (
        <>
            <div className="app-layout">
                <ScrollToTop/>
                <NavBar />
                <div className={mainContentForms}>
                    <Routes>
                        <Route path="/auth/:mode" element={!user ? <AuthPage /> : <Home/>} />
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
                        <Route path="/my-profile/edit" element={<PrivateRoute><EditProfile/></PrivateRoute>} />
                        <Route path="/user/:id" element={<Profile/>} />
                        <Route path="/gig/:gigId/order-checkout" element={<PrivateRoute><OrderCheckOut/></PrivateRoute>}/>
                    </Routes>
                </div>
                <Footer />
            </div>
        </>
    )
}

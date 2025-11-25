import React from 'react'
import './footer.scss'
import { useLocation } from 'react-router-dom'

export default function Footer() {
  
  const location = useLocation();
  const noFooter = location.pathname === '/login'||
  location.pathname === '/signup' ||
  location.pathname === '/messages' ||
  location.pathname === '/my-gigs' ||
  location.pathname === '/create-gig' ||
  location.pathname === '/orders' ||
  location.pathname.startsWith('/messages/');
  
  const footerForms = `footer-container ${noFooter ? 'footer-container-none' : ''}`
  return (
    <div className={footerForms}>
      <div className="top-container">
        <div className="top">
          <div className="c1">
            <h3>Categories</h3>
            <span>Web design</span>
            <span>Graphics Design</span>
            <span>3D Modeling</span>
            <span>Android</span>
          </div>
          <div className="c1">
            <h3>For Buyers</h3>
            <span>How fiverr works</span>
            <span>Guides</span>
            <span>Answers</span>
          </div>
          <div className="c1">
            <h3>For Freelancers</h3>
            <span>Join Us</span>
            <span>Forum</span>
            <span>Events</span>
            <span>Community</span>
          </div>
          <div className="c1">
            <h3>Company</h3>
            <span>Our Vision</span>
            <span>About Us</span>
            <span>Privacy Policy</span>
            <span>Partnership</span>
          </div>
        </div>
      </div>
      <div className="bottom-container">
        <div className="bottom">
          <div className="left">
            <span>Website</span>
            <span className='text'>© 2025 website, Inc.</span>
          </div>
          <div className="right">
            <span>Connect With Us:</span>
            <span><i class="fa-brands fa-instagram"></i></span>
            <span><i class="fa-brands fa-facebook"></i></span>
            <span><i class="fa-brands fa-x-twitter"></i></span>
            <span><i class="fa-brands fa-linkedin"></i></span>
          </div>
        </div>
      </div>
    </div>
  )
}

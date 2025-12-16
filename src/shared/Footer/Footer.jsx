import React from 'react'
import './footer.scss'
import { Link, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { gigCat } from '../../Data/GigCat';

export default function Footer() {
  
  const categories = gigCat;
  const location = useLocation();
  const noFooter = location.pathname === '/login'||
  location.pathname === '/signup' ||
  location.pathname === '/messages' ||
  location.pathname === '/my-gigs' ||
  location.pathname.startsWith('/create-gig') ||
  location.pathname.startsWith('/orders') ||
  location.pathname.startsWith('/messages') ||
  location.pathname === '/my-profile/edit' ||
  location.pathname.startsWith('/gig') && location.pathname.endsWith('/order-checkout');
  
  const footerForms = `footer-container ${noFooter ? 'footer-container-none' : ''}`
  return (
    <div className={footerForms}>
      <div className="top-container">
        <div className="top">
          <div className="c1">
            <h3>Categories</h3>
            {
              categories.map((c,i) => (
                <span key={i}>{c.name}</span>
              ))
            }
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
            <span>
              <Link to='/' className='link'>WizardHelp</Link>
            </span>
            <span className='text'>© 2025 website, Inc.</span>
          </div>
          <div className="right">
            <span>Connect With Us:</span>
            <span><FontAwesomeIcon icon="fa-brands fa-instagram" /></span>
            <span><FontAwesomeIcon icon="fa-brands fa-facebook" /></span>
            <span><FontAwesomeIcon icon="fa-brands fa-x-twitter" /></span>
            <span><FontAwesomeIcon icon="fa-brands fa-linkedin" /></span>
          </div>
        </div>
      </div>
    </div>
  )
}

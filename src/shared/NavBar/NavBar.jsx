import React, { useContext, useEffect, useRef, useState } from 'react'

import './NavBar.scss'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
// import useClickOutside from '../../customHooks/useClickOutside';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useClickOutside from '../../customHooks/useClickOutside';

export default function NavBar() {

  const { user, logout } = useContext(AuthContext);

  const [active, setActive] = useState(false);
  const [isLogin, setLogin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(prev => !prev);
  };

  const menuRef = useRef(null);

  useClickOutside(menuRef, () => {
    if (showMenu) setShowMenu(false);
  });

  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const navigate = useNavigate();

  // Navbar active when scrolled
  const isScroll = () => {
    window.scrollY > 0 ? setActive(true) : setActive(false)
  }

  useEffect(() => {
    window.addEventListener('scroll', isScroll)
    return () => {
      window.removeEventListener('scroll', isScroll)
    }
  }, []);

  // Scroll/Redirect to homepage and scroll to category slider
  const handleCategoryClick = (event) => {
    event.preventDefault();

    const targetSectionId = 'slider-container';

    if (!isHomePage) {
      navigate('/', { state: { scrollTo: 'slider-container' } });
    }
    else {
      const targetElement = document.getElementById(targetSectionId);

      targetElement.scrollIntoView({
        behavior: 'smooth'
      })
    }
  };

  return (
    <>
      <div className={active && isHomePage ? "navbar active" : 'navbar'}>
        {/* <div className={navBarForms}> */}
        <div className="container">
          <div className="website-name">
            <Link to='/' className='link'>
              {/* <span className='text'>Wi<FontAwesomeIcon icon="fa-solid fa-bolt" className='icon' />ardHelp</span> */}
              <span className='text'>Wi<FontAwesomeIcon icon="fa-solid fa-bolt" className='icon' />ard<span className='text-half'>Help</span></span>
              {/* <span className='text'>Wizard<span className='text-half'>Help</span></span> */}
              {/* {
              active ?
              :
              <span className='text'>Wi<FontAwesomeIcon icon="fa-solid fa-bolt" style={{color: "#F4F4F4",}} className='icon' />ardHelp</span>
              
            } */}
            </Link>
          </div>
          <div className="titles">
            {!isAuthPage && user &&
              <>
                <Link to='/orders' className='link'>Orders</Link>
                <Link to='/messages' className='link'>Messages</Link>
                <div className='cat-btn' onClick={handleCategoryClick}>Categories</div>
                {
                  user?.role === 'seller' && (
                    <>
                      <Link to='/my-gigs' className='link'>My Gigs</Link>
                      <Link to='/create-gig' className='link'>Create Gig</Link>
                    </>
                  )
                }
              </>
            }
          </div>
          <div className="auth" ref={menuRef}>
            {
              user ?
                <>
                  <div className="auth-after">
                    <div className="user-profile" onClick={toggleMenu} style={{ cursor: 'pointer' }}>
                      <div className="user-img">
                        <img src={user.profilePic || '/user.png'} alt="" />
                      </div>
                      <div className="username">{user.username}</div>
                    </div>
                    {
                      showMenu && (
                        <div className="dropdown-menu">
                          <div className='dropdown-item-button' onClick={() => { navigate('/my-profile'); setShowMenu(false); }}>
                            <FontAwesomeIcon icon="fa-solid fa-user" /> My profile
                          </div>
                          <div className='dropdown-item-button' onClick={logout}><FontAwesomeIcon icon="fa-solid fa-arrow-right-from-bracket" /> Logout</div>
                        </div>
                      )
                    }
                  </div>
                </>
                :
                !isAuthPage &&
                <>
                  <div className="auth-btns">
                      <Link to="/auth/login" className='link login-btn'>Login</Link>
                      <Link to="/auth/signup" className='signup-btn link'>Signup</Link>
                  </div>
                </>
            }
          </div>
        </div>
      </div>
    </>
  )
}

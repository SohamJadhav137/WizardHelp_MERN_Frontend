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

  // const navBarForms = `navbar ${isHomePage ? 'navbar-sticky' : 'navbar-default'}`;

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
              <span className='text'>Wi<FontAwesomeIcon icon="fa-solid fa-bolt" className='icon' />ardHelp</span>
              {/* {
              active ?
              :
              <span className='text'>Wi<FontAwesomeIcon icon="fa-solid fa-bolt" style={{color: "#F4F4F4",}} className='icon' />ardHelp</span>
              
            } */}
            </Link>
          </div>
          <div className="titles">
            {!isAuthPage &&
              <>
                <Link to='/orders' className='link'>Orders</Link>
                <Link to='/messages' className='link'>Messages</Link>
                {
                  user?.role === 'seller' && (
                    <>
                      <Link to='/my-gigs' className='link'>My Gigs</Link>
                      <Link to='/create-gig' className='link'>Create Gig</Link>
                    </>
                  )
                }
                <div className='cat-btn' onClick={handleCategoryClick}>Categories</div>
                {/* <button onClick={handleCategoryClick}>Categories</button> */}
              </>
            }
          </div>
          <div className="auth" ref={menuRef}>
            {
              user ?
                <>
                  <div className="auth-after">
                    <div className="user-profile" onClick={toggleMenu} style={{ cursor: 'pointer' }}>
                      {
                        user.profilePic ?
                          <>
                            <div className="user-img">
                              <img src={user.profilePic} alt="" />
                            </div>
                            <div className="username">{user.username}</div>
                          </>
                          :
                          <>
                          <FontAwesomeIcon icon="fa-solid fa-user" /> {user.username}
                          </>
                      }
                    </div>
                    {
                      showMenu && (
                        <div className="dropdown-menu">
                          <div className='dropdown-item-button link' onClick={() => setShowMenu(false)}>
                            <Link to='/my-profile' className='link' >My profile</Link>
                          </div>
                          <div className='dropdown-item-button link' onClick={logout} style={{ cursor: 'pointer' }}>Logout</div>
                        </div>
                      )
                    }
                  </div>
                </>
                :
                !isAuthPage &&
                <>
                  <button className='a'>
                    <Link to="/login" className='link'>Login</Link>
                  </button>
                  <button className='a'>
                    <Link to="/signup" className='link'>Signup</Link>
                  </button>
                </>
            }
          </div>
        </div>
      </div>
    </>
  )
}

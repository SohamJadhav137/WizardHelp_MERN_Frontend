import React, { useContext, useEffect, useRef, useState } from 'react'

import './NavBar.scss'
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
// import useClickOutside from '../../customHooks/useClickOutside';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function NavBar() {

  const { user, logout } = useContext(AuthContext);

  const [active, setActive] = useState(true)
  const [isLogin, setLogin] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  // const menuRef = useRef(null);

  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const navBarForms = `navbar ${isHomePage ? 'navbar-sticky' : 'navbar-default'}`;

  const toggleMenu = (event) => {
    // event.stopPropagation();
    setShowMenu(prev => !prev);
  }

  // useClickOutside(menuRef, toggleMenu);

  const isScroll = () => {
    window.scrollY > 0 ? setActive(true) : setActive(false)
  }

  useEffect(() => {
    window.addEventListener('scroll', isScroll)
    return () => {
      window.removeEventListener('scroll', isScroll)
    }
  }, [])

  return (
    <>
      <div className={active ? "navbar active" : 'navbar'}>
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
                <span className='link'>Categories</span>
              </>
            }
          </div>
          <div className="auth">
            {
              user ?
                <>
                  <div className="auth-after">
                    <div className="user-profile" onClick={toggleMenu} style={{ cursor: 'pointer' }}>
                      <span><FontAwesomeIcon icon="fa-solid fa-user" /> {user.username}</span>
                    </div>
                    {
                      showMenu && (
                        <div className="dropdown-menu">
                          <span className='dropdown-item-button link'>
                            <Link to='/my-profile' className='link'>My profile</Link>
                          </span>
                          <span className='dropdown-item-button link' onClick={logout} style={{ cursor: 'pointer' }}>Logout</span>
                        </div>
                      )
                    }
                  </div>
                </>
                :
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

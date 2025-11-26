import React, { useContext, useEffect, useState } from 'react'

import './NavBar.scss'
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

export default function NavBar() {

  const { user, logout } = useContext(AuthContext);

  // const [active, setActive] = useState(true)
  const [isLogin, setLogin] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const navBarForms = `navbar ${isHomePage ? 'navbar-sticky' : 'navbar-default'}`;

  const toggleMenu = () => {
    setShowMenu(prev => !prev)
  }

  // const isScroll = () => {
  //   window.scrollY > 0 ? setActive(true) : setActive(false)
  // }

  // useEffect(() => {
  //   window.addEventListener('scroll', isScroll)
  //   return () => {
  //     window.removeEventListener('scroll', isScroll)
  //   }
  // }, [])

  return (
    <>
      {/* <div className={active || pathName!=='/' ? "navbar" : 'navbar-title'}> */}
      <div className={navBarForms}>
        <div className="container">
          <div className="website-name">
            <Link to='/' className='link'>
              <span className='text'>Website</span>
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
                <span>Categories</span>
              </>
            }
          </div>
          <div className="auth">
            {
              user ?
                <>
                  <div className="auth-after">
                    <div className="user-profile" onClick={toggleMenu} style={{ cursor: 'pointer' }}>
                      <span><i class="fa-solid fa-user"></i> {user.name}</span>
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
                  <button className='a'> Become Seller</button>
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

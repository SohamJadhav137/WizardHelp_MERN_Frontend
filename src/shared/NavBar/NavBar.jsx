import React, { useEffect, useState } from 'react'

import './NavBar.scss'
import { Link, useLocation } from 'react-router-dom'

export default function NavBar() {

  // const [active, setActive] = useState(true)
  const [isLogin, setLogin] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const navBarForms = `navbar ${isHomePage ? 'navbar-sticky' : 'navbar-default'}`;

  const toggleMenu = () => {
    setShowMenu(prev => !prev)
  }

  const currectUser = {
    id: 1,
    name: 'Alex',
    isSeller: true
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
            <span>Home</span>
            <span>Categories</span>
            <span>About</span>
            <span>Contact</span>
          </div>
          <div className="auth">
            {
              isLogin ?
                <>
                  <div className="auth-after">
                    <span onClick={toggleMenu} style={{ cursor: 'pointer' }} className='user-profile'>User</span>
                    <span onClick={toggleMenu} style={{ cursor: 'pointer' }} className='user-profile'><i class="fa-solid fa-user"></i></span>
                    {
                      showMenu && (
                        <div className="dropdown-menu">
                          {
                            currectUser.isSeller && (
                              <>
                                <Link to='/my-gigs' className='dropdown-item link'>My Gigs</Link>
                                <Link to='/new-gig' className='dropdown-item link'>New Gig</Link>
                              </>
                            )
                          }
                          <Link to='/orders' className='dropdown-item link'>Orders</Link>
                          <Link to='/messages' className='dropdown-item link'>Messages</Link>
                          <span className='dropdown-item link'>Logout</span>
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

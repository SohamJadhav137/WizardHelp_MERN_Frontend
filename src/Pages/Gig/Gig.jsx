import React from 'react'

import './Gig.scss'
import { gigs } from '../../Data/GigsData'
import { Link, useParams } from 'react-router-dom'
import { Slider } from 'infinite-react-carousel'

export default function Gig() {
    
    const { id } = useParams()
    const gig = gigs.find((g) => g.id === parseInt(id))

    if (!gig)
        return <h2>Gig not found</h2>

    return (
        <div className='gig'>
            <div className="breadcrump">
                <div className="breadcrump-container">
                    <span> <Link to='/'>Home</Link> &gt; <Link to='/gigs'>Programming</Link></span>
                </div>
            </div>

            <div className="gig-container">
                <div className="gig-left">
                    <div className="gig-title">
                        <h2>{gig.title}</h2>
                    </div>
                    <div className="seller-details">
                        <div className="seller-profile-pic">
                            <i class="fa-solid fa-circle-user"></i>
                        </div>
                        <div className="seller-info">
                            <span className='seller-name'>{gig.seller}</span>
                            <span>{gig.rating} <i class="fa-solid fa-star"></i> ({gig.reviews})</span>
                        </div>
                    </div>
                        {/* <Slider slidesToShow={1} arrowsScroll={1} className="gig-pic">
                        <img src="https://saigontechnology.com/wp-content/uploads/how-to-estimate-a-web-application-development-project.png" alt="" />
                        <img src="https://www.umwmedia.com/cdn/shop/articles/Web-Development-Services.jpg?v=1723009547" alt="" />
                        </Slider> */}
                    <div className="gig-pic">
                        <img src="https://tagdiv.com/wp-content/uploads/2020/09/Website-business-design.jpg" alt="" />
                    </div>
                    <div className="about-gig">
                        <span className='title'>About Gig:</span>
                        <div className="about-gig-para">
                        <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Accusamus itaque aspernatur, qui voluptatem velit blanditiis expedita saepe ipsam porro sequi temporibus id dolores vel similique eaque odio autem assumenda, earum, vitae iste voluptas laboriosam officiis ipsa. Quisquam, necessitatibus voluptatem iusto dignissimos soluta nam voluptate perferendis vitae nesciunt, itaque, praesentium harum.</p>
                        </div>
                        <div className="tech-stack">
                            <span className='title'>Technologies:</span>
                            <br />
                            <div className="lang">
                                <div className="attr">
                                    <h3>Frontend:</h3>
                                </div>
                                <div className="content">
                                    <ul>
                                        <li>HTML</li>
                                        <li>CSS</li>
                                        <li>JS</li>
                                        <li>React</li>
                                    </ul>
                                </div>
                            </div>
                            <br />
                            <div className="lang">
                                <div className="attr">
                                    <h3>Backend:</h3>
                                </div>
                                <div className="content">
                                    <ul>
                                        <li>NodeJS</li>
                                        <li>ExpressJS</li>
                                        <li>MongoDB</li>
                                        <li>Python</li>
                                    </ul>
                                </div>
                            </div>
                            <br />
                            <div className="lang">
                                <div className="attr">
                                    <h3>Services:</h3>
                                </div>
                                <div className="content">
                                    <ul>
                                        <li>Software development</li>
                                        <li>Web application development </li>
                                        <li>Mobile application development</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="reviews">
                        <span className='title'>Reviews ({gig.reviews})</span>
                        <div className="r">
                            <div className="header">
                                <div className="profile">
                                    <i class="fa-solid fa-circle-user"></i>
                                </div>
                                <div className="customer-info">
                                    <div className="customer-name">
                                        <span>Steven | From: Canada</span>
                                    </div>
                                    <div className="customer-rating">
                                        <span>5 <i class="fa-solid fa-star"></i></span>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="customer-review">
                                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi accusamus id cum accusantium? Neque deserunt nisi cumque aliquam enim quos.</p>
                            </div>
                            <div className="other-details">
                                <div className="gd1">
                                    <span className='d1'>Rs 2000</span>
                                    <br />
                                    <span className='d2'>Price</span>
                                </div>
                                <div className="gd2">
                                    <span className='d1'>5 days</span>
                                    <br />
                                    <span className='d2'>Duration</span>
                                </div>
                            </div>
                        </div>
                        <div className="r">
                            <div className="header">
                                <div className="profile">
                                    <i class="fa-solid fa-circle-user"></i>
                                </div>
                                <div className="customer-info">
                                    <div className="customer-name">
                                        <span>Steven | From: Canada</span>
                                    </div>
                                    <div className="customer-rating">
                                        <span>5 <i class="fa-solid fa-star"></i></span>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="customer-review">
                                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi accusamus id cum accusantium? Neque deserunt nisi cumque aliquam enim quos.</p>
                            </div>
                            <div className="other-details">
                                <div className="gd1">
                                    <span className='d1'>Rs 2000</span>
                                    <br />
                                    <span className='d2'>Price</span>
                                </div>
                                <div className="gd2">
                                    <span className='d1'>5 days</span>
                                    <br />
                                    <span className='d2'>Duration</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="gig-right">
                    <div className="gig-info">
                        <div className="gig-price">
                            <span>Price: Rs {gig.price}</span>
                        </div>
                        <hr />
                        <div className="gig-desc">
                            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Earum voluptate veritatis animi, corporis commodi molestiae.
                        </div>
                        <hr />
                        <div className="main-attr">
                            <div className="d">
                                <span>Time: 5 Days</span>
                            </div>
                            <div className="d">
                                <span>Revisions: Unlimited</span>
                            </div>
                        </div>
                        <hr />
                        <div className="gig-features">
                            <span className='heading'>Featuring:</span>
                            <div className="features">
                                <ul>
                                    <li>3 pages</li>
                                    <li>Responsive design</li>
                                    <li>Testing</li>
                                </ul>
                            </div>
                        </div>
                        <div className="contact-seller-btn-container">
                            <button className='contact-seller-btn'>Continue</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

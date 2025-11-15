import React from 'react'

import './GigCard.scss'
import { Link } from 'react-router-dom'

export default function GigCard({gig}) {
  return (
    <div className='gig-card'>
        <Link to={`/gig/${gig._id}`}>
        <div className="image-box">
            <img src={gig.coverImageURL} alt="gig_image" />
        </div>
        </Link>
        <div className="details">
            <div className="seller-name">
                <span><i class="fa-solid fa-circle-user"></i> {gig.sellerName}</span>
            </div>
            <Link to={`/gig/${gig._id}`}>
            <div className="gig-desc">
                <p>{gig.title}</p>
            </div>
            </Link>
            <div className="gig-rating">
                <span><i class="fa-solid fa-star"></i> {gig.starRating} ({gig.totalReviews})</span>
            </div>
            <div className="gig-price">
                <span>From Rs. {gig.price}</span>
            </div>
        </div>
    </div>
  )
}

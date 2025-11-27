import React, { useContext, useEffect, useState } from 'react'

import './GigCard.scss'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AuthContext } from '../../context/AuthContext'

export default function GigCard({ gig }) {

    const { user } = useContext(AuthContext);

    const [favGigs, setFavGigs] = useState([]);

    const addFavGigs = (gigId) => {
        alert("Gig added to favourites :)");
        setFavGigs[prev => [...prev, gigId]];
    }

    useEffect(() => {
        const sendFavGigs = async () => {
            try {

            } catch (error) {

            }
        }
    })

    return (
        <div className='gig-card'>
            <Link to={`/gig/${gig._id}`}>
                <div className="image-box">
                    <img src={gig.coverImageURL} alt="gig_image" />
                    {
                        user.role === 'buyer' &&
                        <div className='heart-icon' onClick={() => addFavGigs(gig._id)}>
                            {/* <FontAwesomeIcon icon="fa-solid fa-heart" style={{ color: "#ff0000", }} /> */}
                            <FontAwesomeIcon icon="fa-regular fa-heart" style={{ color: "#363636ff", }} />
                        </div>
                    }
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

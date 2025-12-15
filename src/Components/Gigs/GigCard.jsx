import React, { useContext, useEffect, useState } from 'react'

import './GigCard.scss'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AuthContext } from '../../context/AuthContext'
import { getCurrentUser } from '../../utils/getCurrentUser'

export default function GigCard({ gig }) {

    const { user } = useContext(AuthContext);

    const [favGigs, setFavGigs] = useState([]);
    const [sellerInfo, setSellerInfo] = useState([]);

    const addFavGigs = (gigId) => {
        alert("Gig added to favourites :)");
        setFavGigs[prev => [...prev, gigId]];
    }

    // Fetch gig seller info
    useEffect(() => {
        const fetchSellerInfo = async () => {
            if (!gig) return;

            try {
                const res = await fetch(`http://localhost:5000/api/user/${gig.userId}`)
                if (res.ok) {
                    const data = await res.json();
                    setSellerInfo(data.user);
                }
                else {
                    console.error("Failed to fetch user details:", res.status);
                }
            } catch (error) {
                console.error("Some error occured:", error);
            }
        }

        fetchSellerInfo();
    }, [gig, gig._id]);

    const currentUser = getCurrentUser();
    const profileLink = currentUser.id === gig?.userId ? '/my-profile' : `/user/${gig.userId}`;

    // useEffect(() => {
    //     const sendFavGigs = async () => {
    //         try {

    //         } catch (error) {

    //         }
    //     }
    // })

    //////////////////////////////////////// LATER MOVE INSIDE RETURN JSX ///////////////////////////////////
    // {
    //     user?.role === 'buyer' &&
    //     <div className='heart-icon' onClick={() => addFavGigs(gig._id)}>
    //         {/* <FontAwesomeIcon icon="fa-solid fa-heart" style={{ color: "#ff0000", }} /> */}
    //         <FontAwesomeIcon icon="fa-regular fa-heart" style={{ color: "#363636ff", }} />
    //     </div>
    // }
    return (
        <div className='gig-card'>
            <Link to={`/gig/${gig._id}`}>
                <div className="image-box">
                    <img src={gig.coverImageURL} alt="gig_image" />
                </div>
            </Link>
            <div className="details">
                <Link to={profileLink} className='link'>
                    <div className="seller-name">
                        {
                            sellerInfo?.profilePic ?
                                <div className="profile-icon">
                                    <img src={sellerInfo?.profilePic} alt="" /> {gig.sellerName}
                                </div>
                                :
                                <>
                                    <FontAwesomeIcon icon="fa-solid fa-circle-user" className='default-icon' /> {gig.sellerName}
                                </>
                        }
                    </div>
                </Link>
                <Link to={`/gig/${gig._id}`}>
                    <div className="gig-desc">
                        <p>{gig.title}</p>
                    </div>
                </Link>
                <div className="gig-rating">
                    <span><FontAwesomeIcon icon="fa-solid fa-star" /> {gig.starRating} ({gig.totalReviews})</span>
                </div>
                <div className="gig-price">
                    <span>From Rs. {gig.price}</span>
                </div>
            </div>
        </div>
    )
}

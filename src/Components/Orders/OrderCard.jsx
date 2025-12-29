import React, { useContext, useEffect, useState } from 'react';

import './OrderCard.scss';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function OrderCard(prop) {

    const { user } = useContext(AuthContext);

    const [gigTitle, setGigTitle] = useState(null);
    const [userDetails, setUserDetails] = useState([]);
    const [coverImage, setCoverImage] = useState(null);
    const gigId = prop.order?.gigId;
    let userId = null;
    if (user.role === 'seller') {
        userId = prop.order?.buyerId;
    }
    else {
        userId = prop.order?.sellerId;
    }

    const dateObject = new Date(prop.order?.createdAt);
    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC"
    };
    const orderCreationDate = dateObject.toLocaleDateString('en-US', options);

    // const initialDays = () => {
    //     if (prop.order?.status !== "requested") {
    //         const currentDate = new Date();
    //         const deadline = new Date(prop.order?.dueDate);
    //         return Math.ceil((deadline - currentDate) / (24 * 60 * 60 * 1000));
    //     }
    // };

    const [remainingDays, setRemainingDays] = useState(-999999);
    const [urgencyLevel, setUrgencyLevel] = useState('normal');
    // Start calculation of due date after order is active
    useEffect(() => {
        if (!prop.order?.dueDate || prop.order?.status === 'requested')
            return;

        const calculateTime = () => {
            const now = new Date();
            const due = new Date(prop.order?.dueDate);

            now.setHours(0, 0, 0, 0);
            due.setHours(0, 0, 0, 0);

            const diffInMs = due - now;
            const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
            setRemainingDays(diffInDays);

            if (diffInDays <= 0) setUrgencyLevel('overdue');
            else if (diffInDays <= 2) setUrgencyLevel('warning');
            else setUrgencyLevel('normal');
        };

        calculateTime();

        const interval = setInterval(calculateTime, 1000 * 60 * 60);
        return () => clearInterval(interval);
    }, [prop.order?.dueDate, prop.order?.status]);

    const token = localStorage.getItem("token");

    const navigate = useNavigate();

    // Fetch gig details
    useEffect(() => {
        if (!gigId) return;
        const fetchGigTitle = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/gigs/${gigId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    // console.log(data);
                    setGigTitle(data.gig?.title);
                    setCoverImage(data.gig?.coverImageURL)
                }
                else {
                    console.error("Failed to fetch gig title:\n", response.status);
                }
            } catch (error) {
                console.error("Some error occured while fetching gig title:\n", error);
            }
        }

        fetchGigTitle();
    }, [gigId]);

    // Fetch username
    useEffect(() => {
        if (!userId) return;

        const fetchUserName = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserDetails(data.user);
                }
                else {
                    console.error("Failed to fetch gig title:\n", response.status);
                }
            } catch (error) {
                console.error("Some error occured while fetching gig title:\n", error);
            }
        }

        fetchUserName();
    }, [userId]);

    return (
        <div className='order-card'>
            <div className="order-card-img">
                <img src={coverImage} alt="" />
            </div>
            <div className="order-card-info">

                <div className="order-card-title-info-container">
                    <div className='order-card-title-info'>
                        <div className='order-card-title-info-gig-name'>Gig Title: {gigTitle}</div>
                        <div className='username'>
                            {
                                user.role === 'seller' ?
                                    `Buyer: ${userDetails.username}`
                                    :
                                    `Seller: ${userDetails.username}`
                            }
                        </div>
                        <div className='order-start-date'>
                            Ordered: {orderCreationDate}
                        </div>
                    </div>
                </div>

                <div className="order-price-and-status">
                    <span className='price'>
                        ₹{prop.order?.price}
                    </span>

                    <span className={`order-status ${prop.order?.status === 'completed' && 'completed'}
                    ${prop.order?.status === 'requested' && 'requested'}
                    ${prop.order?.status === 'cancelled' && 'cancelled'}
                    ${prop.order?.status === 'declined' && 'declined'}
                    ${prop.order?.status === 'delivered' && 'delivered'}
                    ${prop.order?.status === 'revision' && 'revision'}
                    ${prop.order?.status === 'request-cancellation' && 'req-cancel'}
                    ${prop.order?.status === 'active' && 'active'}`}>
                        {
                            prop.order?.status === 'request-cancellation' ?
                            <span title='order-cancellation request' style={{cursor:'default'}}>Cancel-Req !</span>
                            // <span data-tooltip='Order cancellation request'>Cancel-req <FontAwesomeIcon icon="fa-solid fa-circle-info" /></span>
                            :
                            prop.order?.status
                        }
                    </span>
                </div>

                <div className={`order-due ${(prop.order?.status !== 'completed' && prop.order?.status !== 'cancelled') && urgencyLevel}`}>
                    {
                        remainingDays === -999999 || prop.order?.status === 'completed' || prop.order?.status === 'cancelled' ?
                        <>
                        <span className='due'>N/A</span>
                        <span className='due-label'>Due</span>
                        </>
                        :
                        remainingDays < 0 ?
                        <>
                        <span className='due'>{Math.abs(remainingDays)} days</span>
                        <span className='due-label' style={{fontSize: '20px'}}>Overdue!</span>
                        </>
                            :
                            remainingDays === 0 ?
                            <span className='due'>Due <br/> Today!</span>
                            :
                            <>
                            <span className='due'>{remainingDays}</span>
                            <span className='due-label'>Days Left</span>
                            </>
                    }
                </div>

                <div className="action-bar">
                    <button onClick={() => navigate(`/orders/${prop.order?._id}`)}>View Details</button>
                </div>
            </div>
        </div>
    )
}

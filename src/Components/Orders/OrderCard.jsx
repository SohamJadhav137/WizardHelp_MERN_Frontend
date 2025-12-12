import React, { useContext, useEffect, useState } from 'react';

import './OrderCard.scss';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    
    const initialDays = () => {
        if (prop.order?.status !== "requested") {
            const currentDate = new Date();
            const deadline = new Date(prop.order?.dueDate);
            return Math.ceil((deadline - currentDate) / (24 * 60 * 60 * 1000));
        }
    };

    const [remainingDays, setRemainingDays] = useState(initialDays);

    // Start calculation of due date after order is active
    useEffect(() => {
        if (prop.order?.status === 'requested') return;

        const interval = setInterval(() => {
            const currentDate = new Date();
            const remainingDaysInMs = new Date(prop.order?.dueDate) - currentDate;
            setRemainingDays(Math.ceil(remainingDaysInMs / (24 * 60 * 60 * 1000)));
        }, 1000 * 60);

        return () => clearInterval(interval);
    }, [prop.order?.dueDate]);

    const token = localStorage.getItem("token");

    const navigate = useNavigate();

    // Fetch gig details
    useEffect(() => {
        if(!gigId) return;
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
        if(!userId) return;

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
            <div className="order-card-title">
                <div className="order-card-title-preview">
                    <img src={coverImage} alt="" />
                </div>
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
                    </div>
                </div>
            </div>
            <hr />
            <div className="order-card-info">
                <div>
                    <span>Order ID: {prop.order?._id}</span>
                    <br />
                    <span>Ordered On: {orderCreationDate}</span>
                    <br />
                    <span>Price: ₹{prop.order?.price}</span>
                    <br />
                    <span>Status: {prop.order?.status}</span>
                    <br />
                    {
                        (prop.order?.status !== 'requested' && prop.order?.status !== 'Declined' && prop.order?.status !== 'completed' && prop.order?.status !== 'cancelled') &&
                        (
                            remainingDays > 1 ?
                                <span>Due: {remainingDays} Days left</span>
                                :
                                remainingDays === 0 ?
                                    <span>Due Today</span>
                                    :
                                    <span>Due: {Math.abs(remainingDays)} Days late</span>
                        )
                    }
                </div>
            </div>
            <div className="action-bar">
                <button onClick={() => navigate(`/orders/${prop.order?._id}`)}>View Details</button>
            </div>
        </div>
    )
}

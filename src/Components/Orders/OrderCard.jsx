import React, { useContext, useEffect, useState } from 'react';

import './OrderCard.scss';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Toast } from '../../utils/copyTextToast';

export default function OrderCard({ order, gigTitle, coverImage, userDetails }) {

    const { user } = useContext(AuthContext);

    const dateObject = new Date(order?.createdAt);
    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC"
    };
    const orderCreationDate = dateObject.toLocaleDateString('en-US', options);

    const [remainingDays, setRemainingDays] = useState(-999999);
    const [urgencyLevel, setUrgencyLevel] = useState('normal');

    // Start calculation of due date after order is active
    useEffect(() => {
        if (!order?.dueDate || order?.status === 'requested')
            return;

        const calculateTime = () => {
            const now = new Date();
            const due = new Date(order?.dueDate);

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
    }, [order?.dueDate, order?.status]);

    const navigate = useNavigate();

    const handleCopyText = (text) => {
        navigator.clipboard.writeText(text);

        Toast.fire({
            icon: 'success',
            title: 'Copied to clipboard'
        });
    }

    return (
        <div className='order-card'>
            <div className="order-card-img">
                {
                    coverImage ?
                        <img src={coverImage} alt="" />
                        :
                        <img src={'/no-img.png'} alt="" className='no-img' />

                }
            </div>
            <div className="order-card-info">

                <div className="order-card-title-info-container">
                    <div className='order-card-title-info'>
                        <div className="order-id">
                            #{order?._id} <button onClick={() => handleCopyText(order?._id)} className='copy-id-button'><FontAwesomeIcon icon="fa-regular fa-copy" /></button>
                        </div>
                        <div className='order-card-title-info-gig-name'>Gig Title: {gigTitle || '-'}</div>
                        <div className='username'>
                            {
                                user.role === 'seller' ?
                                    `Buyer: ${userDetails?.username}`
                                    :
                                    `Seller: ${userDetails?.username}`
                            }
                        </div>
                        <div className='order-start-date'>
                            Ordered: {orderCreationDate}
                        </div>
                    </div>
                </div>

                <div className="order-price-and-status">
                    <span className='price'>
                        ₹{order?.price}
                    </span>

                    <span className={`order-status ${order?.status === 'completed' && 'completed'}
                    ${order?.status === 'requested' && 'requested'}
                    ${order?.status === 'cancelled' && 'cancelled'}
                    ${order?.status === 'declined' && 'declined'}
                    ${order?.status === 'delivered' && 'delivered'}
                    ${order?.status === 'revision' && 'revision'}
                    ${order?.status === 'request-cancellation' && 'req-cancel'}
                    ${order?.status === 'active' && 'active'}`}>
                        {
                            order?.status === 'request-cancellation' ?
                                <span title='order-cancellation request' style={{ cursor: 'default' }}>Cancel-Req !</span>
                                // <span data-tooltip='Order cancellation request'>Cancel-req <FontAwesomeIcon icon="fa-solid fa-circle-info" /></span>
                                :
                                order?.status
                        }
                    </span>
                </div>

                <div className={`order-due ${(order?.status !== 'completed' && order?.status !== 'cancelled') && urgencyLevel}`}>
                    {
                        remainingDays === -999999 || order?.status === 'completed' || order?.status === 'cancelled' ?
                            <>
                                <span className='due'>N/A</span>
                                <span className='due-label'>Due</span>
                            </>
                            :
                            remainingDays < 0 ?
                                <>
                                    {

                                        remainingDays === -1 ?
                                            <span className='due'>{Math.abs(remainingDays)} day</span>
                                            :
                                            <span className='due'>{Math.abs(remainingDays)} days</span>
                                    }
                                    <span className='due-label' style={{ fontSize: '20px' }}>Overdue!</span>
                                </>
                                :
                                remainingDays === 0 ?
                                    <span className='due'>Due <br /> Today!</span>
                                    :
                                    <>
                                        {
                                            remainingDays === 1 ?
                                                <>
                                                    <span className='due'>{remainingDays}</span>
                                                    <span className='due-label'>Day Left</span>
                                                </>
                                                :
                                                <>
                                                    <span className='due'>{remainingDays}</span>
                                                    <span className='due-label'>Days Left</span>
                                                </>
                                        }
                                    </>
                    }
                </div>

                <div className="action-bar">
                    <button onClick={() => navigate(`/orders/${order?._id}`)}>View Details</button>
                </div>
            </div>
        </div>
    )
}

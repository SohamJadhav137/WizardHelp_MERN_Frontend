import React from 'react'

export default function ReviewBox(prop) {
    return (
        <div className="r">
            <div className="header">
                <div className="profile">
                    <i class="fa-solid fa-circle-user"></i>
                </div>
                <div className="customer-info">
                    <div className="customer-name">
                        <span>{prop.review.buyerId.username} | From: {prop.review.buyerId.country}</span>
                    </div>
                    <div className="customer-rating">
                        <span>5 <i class="fa-solid fa-star"></i></span>
                    </div>
                </div>
            </div>
            <hr />
            <div className="customer-review">
                <p>{prop.review.comment}</p>
            </div>
            <div className="other-details">
                <div className="gd1">
                    <span className='d1'>₹ {prop.review.price}</span>
                    <br />
                    <span className='d2'>Price</span>
                </div>
                <div className="gd2">
                    <span className='d1'>{prop.review.duration} days</span>
                    <br />
                    <span className='d2'>Duration</span>
                </div>
            </div>
        </div>
    )
}

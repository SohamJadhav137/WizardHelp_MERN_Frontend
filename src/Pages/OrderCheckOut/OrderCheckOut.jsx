import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'

import './OrderCheckOut.scss';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function OrderCheckOut() {

    const { gigId } = useParams();
    const [gig, setGig] = useState([]);
    const [textareaInput, setTextareaInput] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const navigate = useNavigate();

    // Fetch single gig details
    useEffect(() => {
        const fetchSingleGig = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/gigs/${gigId}`);

                if (response.ok) {
                    const data = await response.json();
                    const { gig } = data;
                    setGig(gig);
                }
                else {
                    console.error("RESPONSE ERROR FROM BACKEND:", response.status);
                }
            } catch (error) {
                console.error("Some error occured while fetching single gig:", error);
            }
        }

        fetchSingleGig();
    }, [gigId]);

    const token = localStorage.getItem("token");

    const initiateGigOrder = async (gigId) => {

        if (!gigId) return;

        if (!textareaInput) {
            setErrorMsg("Please enter your requirements!");
            return;
        }

        if (textareaInput.length < 20) {
            setErrorMsg("Requirments should be of minimum 20 characters!");
            return;
        }

        const result = await Swal.fire({
            title: "Confirm Order",
            text: "Do you want to place this order ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#018790",
            confirmButtonText: "Place Order",
            cancelButtonText: "Cancel",
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title'
            }
        });

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`http://localhost:5000/api/orders/${gigId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ buyerRequirement: textareaInput })
            });

            const data = await response.json();

            if (response.ok) {
                await Swal.fire({
                    title: "Order Placed!",
                    text: "Your order has been sent to the seller.",
                    icon: "success",
                    confirmButtonColor: "#018790",
                    customClass: {
                        popup: 'swal-custom-popup',
                        title: 'swal-custom-title'
                    }
                });

                navigate('/orders');
            }
            else {
                Swal.fire({
                    title: response.status,
                    text: "Failed to create order!",
                    icon: "error",
                    confirmButtonColor: "#018790",
                    customClass: {
                        popup: 'swal-custom-popup',
                        title: 'swal-custom-title'
                    }
                });

                console.error("Failed to create order!", response.status);
            }
        } catch (error) {
            console.error("Some error occured while creating order\n", error);
        }
    }

    return (
        <div className="order-checkout-container">
            <div className="order-checkout">
                <Link to={`/gig/${gigId}`} className='link'>
                    <div className="back-button-gig">
                        <FontAwesomeIcon icon="fa-solid fa-arrow-left" /> Back To Gig
                    </div>
                </Link>

                <div className="title">
                    Review & Place Order
                </div>

                <div className="main-layout">

                    <div className="left-layout">

                        <div className="section-1">
                            <div className="gig-image">
                                <img src={gig?.coverImageURL || '/no-image.png'} alt="" />
                            </div>
                            <div className="gig-details">
                                <ul>
                                    <li className='gig-title'>{gig?.title}</li>
                                    <hr />
                                    <li><span className='gig-attr'>Seller:</span> {gig?.sellerName}</li>
                                    <li><span className='gig-attr'>Delivery:</span> {gig?.deliveryDays} {gig?.deliveryDays === 1 ? 'day' : 'days'}</li>
                                    <li><span className='gig-attr'>Revisions:</span> {gig?.revisions}</li>
                                </ul>
                            </div>
                        </div>

                        <div className="section-2">
                            <div className="buyer-req-label">
                                Tell seller what you need:
                            </div>
                            {
                                errorMsg &&
                                <div className='error-msg'>{errorMsg}</div>
                            }
                            <textarea name="" id="" rows={7} placeholder='Describe your requirements, expectations, tech stack, etc...' value={textareaInput} onChange={(e) => setTextareaInput(e.target.value)}>
                            </textarea>
                        </div>
                    </div>

                    <div className="right-layout">
                        <div className="order-summary">
                            <div className="order-summary-title">
                                Order Summary
                            </div>
                            <div className="order-details">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td><span className='gig-attr'>Gig price</span></td>
                                            <td>₹{gig?.price}</td>
                                        </tr>
                                        <tr>
                                            <td><span className='gig-attr'>Delivery time</span></td>
                                            <td>{gig?.deliveryDays} {gig?.deliveryDays === 1 ? 'day' : 'days'}</td>
                                        </tr>
                                        <tr>
                                            <td><span className='gig-attr'>Revisions</span></td>
                                            <td>{gig?.revisions}</td>
                                        </tr>
                                        <tr>
                                            <td><span className='gig-attr'>Add-ons</span></td>
                                            <td>₹0</td>
                                        </tr>
                                        <tr>
                                            <td>Total Price</td>
                                            <td>₹{gig?.price}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <button onClick={() => initiateGigOrder(gigId)}>Place Order</button>
                            <div className='agreement-text'>
                                By placing this order, you agree to the <u>platform terms</u>.
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

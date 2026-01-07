import React, { useContext, useEffect, useState } from 'react'

import './Gig.scss'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getCurrentUser } from '../../utils/getCurrentUser'
import ReviewBox from '../../Components/Gig/ReviewBox'
import Swal from 'sweetalert2'
import { AuthContext } from '../../context/AuthContext'

export default function Gig() {

    const { gigId } = useParams()
    const { user } = useContext(AuthContext);
    const [gig, setGig] = useState(null);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [selectedItem, setSelectedItem] = useState(mediaFiles[0]);
    const [reviews, setReviews] = useState([]);
    const [sellerInfo, setSellerInfo] = useState([]);
    const isVideo = (url) => {
        if (!url) return false;
        const videoExtensions = ['.mp4', '.mov', '.avi', '.webm'];
        return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
    };
    const navigate = useNavigate();
    const currentUser = getCurrentUser();
    const userId = currentUser?.id;
    const userDetails = localStorage.getItem("user");
    const parsedUserData = JSON.parse(userDetails);
    const userName = parsedUserData?.username;
    const token = localStorage.getItem("token");

    // Fetch single gig
    useEffect(() => {
        const fetchSingleGig = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/gigs/${gigId}`);

                if (response.ok) {
                    const data = await response.json();
                    const { gig, mediaURLs } = data;
                    // console.log(gigData)
                    setGig(gig);
                    setMediaFiles(mediaURLs)
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

    // Selected img display
    useEffect(() => {
        if (mediaFiles.length > 0 && !selectedItem) {
            setSelectedItem(mediaFiles[0]);
        }
    }, [mediaFiles]);

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
    }, [gig, gigId]);

    // console.log(`Buyer Id: ${userId}\nBuyer Name: ${userName}\nSeller Id: ${gig.userId}\nSeller Name:${gig.sellerName}`)

    const contactSellerHandler = async (token) => {
        if (!token) {
            Swal.fire({
                title: "Not Authenticated!",
                text: "Please login to use such feature.",
                icon: "info",
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title'
                }
            });
            return navigate('/auth/login');
        }

        if (userId === gig?.userId) {
            Swal.fire({
                title: "Not Allowed!",
                text: "You cannot chat with other yourself.",
                icon: "info",
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title'
                }
            });
            return;
        }

        if (user.role === 'seller') {
            Swal.fire({
                title: "Not Allowed!",
                text: "Seller cannot chat with other sellers.",
                icon: "info",
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title'
                }
            });
            return;
        }


        try {
            const response = await fetch("http://localhost:5000/api/conversations", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ buyerId: userId, buyerName: userName, sellerId: gig?.userId, sellerName: gig?.sellerName })
            });

            if (response.ok) {
                navigate(`/messages`);
            }
            else {
                console.error("BACKEND RESPONSE ERROR:", response.statusText)
            }
        } catch (error) {
            console.error("Error in initiating new conversation!", error);
        }
    }

    const orderCheckout = () => {
        if (!token) {
            Swal.fire({
                title: "Not Authenticated!",
                text: "Please login to use such feature.",
                icon: "info",
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title'
                }
            });
            return navigate('/auth/login');
        }

        if (user.role === 'seller') {
            Swal.fire({
                title: "Action Not Allowed",
                text: "Seller cannot place order",
                icon: "info",
                confirmButtonText: "Ok",
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title'
                }
            });
            return;
        }

        navigate(`/gig/${gigId}/order-checkout`);
    }

    // Fetch gig reviews
    useEffect(() => {
        const fetchGigReviews = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/review/gig-reviews/${gigId}`);

                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                }
                else {
                    console.error("Failed to fetch gig reviews:", res.status);
                }
            } catch (error) {
                console.error("Some error occured:", error);
            }
        }

        fetchGigReviews();
    }, [gigId]);

    const category = gig?.category;

    return (
        <div className='gig'>
            <div className="breadcrump">
                <div className="breadcrump-container">
                    <span> <Link to='/'>Home</Link><FontAwesomeIcon icon="fa-solid fa-angle-left" /><Link to={`/category/${category}`}>{category}</Link><FontAwesomeIcon icon="fa-solid fa-angle-left" />Gig</span>
                </div>
            </div>

            <div className="gig-container">

                <div className="gig-left">
                    <div className="gig-title">
                        <h2>{gig?.title}</h2>
                    </div>
                    <div className="seller-details">
                        <div className="seller-profile-pic">
                            {
                                sellerInfo?.profilePic ?
                                    <img src={sellerInfo?.profilePic} alt="" />
                                    :
                                    <FontAwesomeIcon icon="fa-solid fa-circle-user" />
                            }
                        </div>
                        <div className="seller-info">
                            <span className='seller-name'>{gig?.sellerName}</span>
                            <span>{gig?.starRating} <FontAwesomeIcon icon="fa-solid fa-star" /> ({gig?.totalReviews})</span>
                        </div>
                    </div>

                    <div className="gig-media">
                        <div className="gig-display">
                            {
                                isVideo(selectedItem) ?
                                    (
                                        <video src={`${selectedItem}?t=${Date.now()}`} controls />
                                    )
                                    :
                                    (
                                        <img src={selectedItem} alt="gig-img" />
                                    )
                            }
                        </div>
                        <div className="gig-thumbnails-container">
                            {
                                mediaFiles.map((media, index) => (
                                    <div key={index} className='gig-thumbnail' onClick={() => setSelectedItem(media)}>
                                        {
                                            isVideo(media) ?
                                                <>
                                                    <video src={media} muted />
                                                    <span><FontAwesomeIcon icon="fa-solid fa-play" /></span>
                                                </>
                                                :
                                                <img src={media} alt='thumbnail' />
                                        }
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    <div className="about-gig">

                        <span className='title'>About Gig:</span>

                        <div className="about-gig-para">
                            <p>{gig?.description}</p>
                        </div>
                    </div>

                    <div className='title'>Reviews ({gig?.totalReviews}):</div>
                    <div className="reviews">
                        {
                            reviews.length === 0 &&
                            <div className="reviews-empty-div">
                                No reviews posted yet...
                            </div>
                        }
                        {
                            reviews.map(r => (
                                <ReviewBox key={r._id} review={r} />
                            ))
                        }
                    </div>
                </div>

                <div className="gig-right">
                    <div className="gig-info">
                        <div className="gig-price">
                            <span>Price: Rs {gig?.price}</span>
                        </div>
                        <hr />
                        {/* <div className="gig-desc">
                            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Earum voluptate veritatis animi, corporis commodi molestiae.
                        </div> */}
                        {/* <hr /> */}
                        <div className="main-attr">
                            <div className="d">
                                <span>Time: {gig?.deliveryDays} Days</span>
                            </div>
                            <div className="d">
                                <span>Revisions: {gig?.revisions}</span>
                            </div>
                        </div>
                        {/* <hr /> */}
                        {/* <div className="gig-features">
                            <span className='heading'>Featuring:</span>
                            <div className="features">
                                <ul>
                                    <li>3 pages</li>
                                    <li>Responsive design</li>
                                    <li>Testing</li>
                                </ul>
                            </div>
                        </div> */}
                        <div className="buy-gig-btn-container">
                            <button className='buy-gig-btn' onClick={orderCheckout}>Continue</button>
                        </div>
                        <div className="contact-seller-container">
                            <span>Want to discuss or negotiate about this gig ? <span className='contact-seller-text' onClick={() => contactSellerHandler(token)}>Contact seller</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getSocket } from '../../socket';
import { Rating } from '@mui/material'

import './Order.scss';
import { getCurrentUser } from '../../utils/getCurrentUser';

const socket = getSocket();

const formatBytesToSize = (bytes) => {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i == 0) return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

export default function Order() {

    const { user } = useContext(AuthContext);

    const { id } = useParams();
    const [order, setOrder] = useState(null);
    let gigId = order?.gigId,
        sellerId = order?.sellerId,
        buyerId = order?.buyerId,
        price = order?.price;

    const [gigTitle, setGigTitle] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [username, setUsername] = useState(null);
    const [userId, setUserId] = useState(null);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const currentUser = getCurrentUser();
    const currentUsername = user.username;

    // set userId based on role
    useEffect(() => {
        if (!order) return;

        if (user.role === 'seller') {
            setUserId(buyerId);
        }
        else {
            setUserId(sellerId);
        }
    }, [order, user.role]);

    // Fetch single order
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                if (response.ok) {
                    const data = await response.json();
                    setOrder(data);
                }
                else {
                    console.error("Failed to fetch single order details:\n", response.status);
                }
            } catch (error) {
                console.error("Some error occured while fetching order details:\n", error);
            }
        }

        fetchOrderDetails();
    }, [id]);

    // Handler socket events
    useEffect(() => {
        const handlerOrderEvent = (payload) => {
            if (payload.updatedOrder._id === id) {
                setOrder(payload.updatedOrder)
            }
        };

        const events = [
            "orderReceived",
            "orderInitiated",
            "orderDeclined",
            "orderDelivered",
            "orderCompleted",
            "orderRevision",
            "orderCancellationRequest",
            "orderCancelAccept",
            "orderCancelReject",
            "orderCancelled"
        ];

        events.forEach(event => socket.on(event, handlerOrderEvent));

        return () => {
            events.forEach(event => socket.off(event, handlerOrderEvent));
        };
    }, [id]);

    // Handle order request reject event to requester 
    useEffect(() => {
        const handleSingleEvent = (payload) => {
            if (user.role === 'buyer' && payload.updatedOrder.cancellationRequestedBy === 'buyer') {
                alert("Seller has rejected order cancellation request. Order is rollbacked to previous state.");
            }
            else if (user.role === 'seller' && payload.updatedOrder.cancellationRequestedBy === 'seller') {
                alert("Buyer has rejected order cancellation request. Order is restored back to previous state");
            }
            else {
                alert("You rejected order cancellation request. Order is rollbackend to previous state.");
            }
        };

        socket.on("orderCancelReject", handleSingleEvent);

        return () => {
            socket.off("orderCancelReject", handleSingleEvent);
        };
    }, [user.role]);

    // Fetch gig details
    useEffect(() => {
        const fetchGigTitle = async () => {
            if (!gigId) return;

            try {
                const response = await fetch(`http://localhost:5000/api/gigs/${gigId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    // console.log(data);
                    setGigTitle(data.gig.title);
                    setCoverImage(data.gig.coverImageURL)
                }
                else {
                    console.error("Failed to fetch gig details:\n", response.status);
                }
            } catch (error) {
                console.error("Some error occured while fetching gig details:\n", error);
            }
        }

        fetchGigTitle();
    }, [gigId]);

    // Fetch user details
    useEffect(() => {
        const fetchUserName = async () => {
            if (!userId) return;

            try {
                const response = await fetch(`http://localhost:5000/api/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    // console.log(data);
                    setUsername(data.user.username);
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

    // Names to be sent according to role

    let buyerName, sellerName;

    if (currentUser.role === 'buyer') {
        buyerName = currentUsername;
        sellerName = username;
    }
    else if (currentUser.role === 'seller') {
        buyerName = username;
        sellerName = currentUsername;
    }

    const [rejectButtonToggle, setRejectButtonToggle] = useState(false);
    const [orderDeclineRequestNote, setOrderDeclineRequestNote] = useState('');

    const OrderRequestHandler = async (responseState) => {
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${order?._id}/order-request`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ sellerResponse: responseState, orderRejectNote: orderDeclineRequestNote })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    console.log("Order started!");
                }
                else {
                    console.log("Order declined!");
                }
            }
            else {
                console.error("Failed to handle seller's response:", res.status);
            }
        } catch (error) {
            console.error("Some error occured:", error);
        }
    }

    const redirectToChat = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/conversations", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ buyerId: order?.buyerId, buyerName: buyerName, sellerId: order?.sellerId, sellerName: sellerName })
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

    const [orderFiles, setOrderFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const uploadFilesHandler = (event) => {
        const files = Array.from(event.target.files);
        let numberOfFiles = files.length;

        if (numberOfFiles === 0) return;

        setIsUploading(true);

        const newFiles = [];

        const processFileHandler = (file, dataUrl) => {
            const newFile = {
                id: Date.now() + Math.random(),
                name: file.name,
                type: file.type,
                size: file.size,
                dataUrl: dataUrl,
                originalFile: file
            };
            newFiles.push(newFile);

            numberOfFiles--;

            if (numberOfFiles === 0) {
                setOrderFiles(prev => [...prev, ...newFiles]);
                setIsUploading(false);
            }
        }

        files.forEach(file => {
            const reader = new FileReader();

            reader.onload = (e) => {
                processFileHandler(file, e.target.result);
            };

            reader.onerror = () => {
                console.error('Error reading files:', file.name);
                numberOfFiles--;
                if (numberOfFiles === 0) setIsUploading(false);
            };

            reader.readAsDataURL(file);
        });

        event.target.value = null;
    }

    // console.log("NEW RAW FILES:\n", orderFiles);

    const deleteFileHandler = (fileId) => {
        setOrderFiles(prev => prev.filter(file => file.id !== fileId));
    }

    const FilePreview = ({ file }) => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/');

        if (isImage) {
            return (
                <img src={file.dataUrl} alt={file.name} />
            )
        }
        else if (isVideo) {
            return (
                <div className='video_icon'>
                    <FontAwesomeIcon icon="fa-solid fa-video" />
                </div>
            )
        }
        else if (isAudio) {
            return (
                <div className="audio_icon">
                    <FontAwesomeIcon icon="fa-solid fa-microphone" />
                </div>
            )
        }
        else {
            return (
                <div className="file_icon">
                    <FontAwesomeIcon icon="fa-solid fa-file" />
                </div>
            )
        }
    }

    const FilePreview2 = ({ file }) => {
        const isImage = file.fileType.startsWith('image/');
        const isVideo = file.fileType.startsWith('video/');
        const isAudio = file.fileType.startsWith('audio/');

        if (isImage) {
            return (
                <img src={file.url} alt={file.fileName} />
            )
        }
        else if (isVideo) {
            return (
                <div className='video_icon'>
                    <FontAwesomeIcon icon="fa-solid fa-video" />
                </div>
            )
        }
        else if (isAudio) {
            return (
                <div className="audio_icon">
                    <FontAwesomeIcon icon="fa-solid fa-microphone" />
                </div>
            )
        }
        else {
            return (
                <div className="file_icon">
                    <FontAwesomeIcon icon="fa-solid fa-file" />
                </div>
            )
        }
    }

    const uploadToS3 = async (file, token) => {
        const response = await fetch(`http://localhost:5000/api/upload/presign?fileName=${file.name}&fileType=${file.type}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Presigned URL request failed!" }))
            console.error("Presign URL fetch error:", errorData.message);
            throw new Error("Failed to get S3 upload link!");
        }

        const { uploadURL, fileURL } = await response.json();

        await fetch(uploadURL, {
            method: 'PUT',
            headers: { "Content-Type": file.type },
            body: file
        });

        return fileURL;
    }

    const [textareaNote, setTextareaNote] = useState('');

    // For delivery note textarea
    const handleChange = (e) => {
        setTextareaNote(e.target.value);
    }

    const deliverOrder = async () => {
        if (orderFiles.length === 0) {
            alert("No files attached!");
            return;
        }

        let uploadFileUrls = [];

        for (const file of orderFiles) {
            try {
                const url = await uploadToS3(file.originalFile, token);
                uploadFileUrls.push({
                    url,
                    name: file.originalFile.name,
                    type: file.originalFile.type,
                    size: file.originalFile.size
                });
            } catch (error) {
                alert("Failed to fetch s3 url for file!");
                console.error(error)
                return;
            }
        }

        try {
            const response = await fetch(`http://localhost:5000/api/orders/${id}/deliver`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    deliveryFiles: uploadFileUrls,
                    sellerNote: textareaNote
                })
            });

            if (response.ok) {
                const data = await response.json();
                alert(data?.message || 'Order delivered');
            }
            else {
                console.error(`Failed to deliver the order\nBackend response status: ${response.status}\nResponse Text: ${response.statusText}`);
            }

        } catch (error) {
            console.error("Some error occured while updating order's status or sending the order.\n", error);
        }
    }

    const downloadFile = async (file) => {
        const response = await fetch(file.url);
        const blob = await response.blob();
        const blobURL = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobURL;
        link.download = file.fileName;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobURL);
    };

    const acceptOrderHandler = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${id}/complete`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ buyerNote: textareaNote })
            });

            if (response.ok) {
                console.log("order status:", order?.status);
            }
            else {
                console.error("Failed to update order status to complete:", response.status);
                console.error("Response text:", response.statusText);
            }

        } catch (error) {
            console.error("Some error occured while updating order status to complete");
        }
    };

    const [remainingDays, setRemainingDays] = useState(null);

    // Initial calculation of order days
    useEffect(() => {
        if (!order) return;

        const currentDate = new Date();
        const remainingDaysInMs = new Date(order?.dueDate) - currentDate;
        setRemainingDays(Math.ceil(remainingDaysInMs / (24 * 60 * 60 * 1000)));
    }, [order]);

    // Display remaining days
    useEffect(() => {
        if (!order) return;

        const interval = setInterval(() => {
            const currentDate = new Date();
            const remainingDaysInMs = new Date(order?.dueDate) - currentDate;
            setRemainingDays(Math.ceil(remainingDaysInMs / (24 * 60 * 60 * 1000)));
        }, 1000 * 60);

        return () => clearInterval(interval);
    }, [order]);

    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
    }

    const deleteFromS3 = useCallback(async (url, token) => {
        try {
            const response = await fetch("http://localhost:5000/api/s3/delete-file", {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ fileUrl: url })
            })

            if (!response.ok) {
                console.error("Failed to delete file from s3:\n", response.status);
            }

            return response;
        } catch (error) {
            console.error("Some error during file deletion from s3:\n", error);
            throw error;
        }
    }, []);

    const requestRevisionHandler = async () => {
        try {
            for (const file of order?.deliveryFiles) {
                await deleteFromS3(file.url, token);
                console.log("Deleting file:", file.url);
            }
        } catch (error) {
            console.error("Error occured while deleting files before REVISION: ", error);
        }

        try {
            const res = await fetch(`http://localhost:5000/api/orders/${id}/revision`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ buyerNote: textareaNote })
            })

            if (res.ok) {
                console.log("Revision success!!!");
            }
            else {
                console.error("Failed to send revision request:", res.status);
            }
        } catch (error) {
            console.error("Some error occured while sending revision request:", error);
        }
    }

    const [orderCancelText, setOrderCancelText] = useState(false);
    const [showTextBox, setShowTextBox] = useState(false);
    const [textAreaCancelNote, setTextAreaCancelNote] = useState('');

    const handleCancelNote = (e) => {
        setTextAreaCancelNote(e.target.value);
    };

    const [msg, setMsg] = useState(null);

    const cancelOrderRequestHandler = async () => {
        if (textAreaCancelNote.length === 0) {
            alert("Reason is empty!");
            return;
        }
        else if (textAreaCancelNote < 10) {
            alert("Reason should be more than 10 words!")
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/orders/${id}/cancellation-request`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ cancellationReason: textAreaCancelNote })
            });

            if (res.ok) {
                const data = await res.json();
                if (confirm(data.message || "Order cancellation request sent")) {
                    setShowTextBox(false);
                    setOrderCancelText(true);
                }
            }
            else {
                console.error("Failed to send order cancellation request due to:\n", res.status);
            }
        } catch (error) {
            console.error("Some error occured while sending order cancellation request:\n", error);
        }
    }

    const acceptOrderCancelHandler = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${id}/cancel-accept`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                console.log(data || "Order cancellation request accepted");
                if (user.role === 'buyer' && order?.cancellationRequestedBy === 'buyer') {
                    setMsg("Seller has accepted the order cancellation request. Order was cancelled successfully.");
                }
                else if (user.role === 'seller' && order?.cancellationRequestedBy === 'seller') {
                    setMsg("Buyer has accepted the order cancellation request. Order was cancelled successfully.")
                }
                else {
                    setMsg("You have accepted the order cancellation request. Order was cancelled successfully.")
                }
            }
            else {
                console.error("Failed to perform order cancellation:\n", res.status);
            }
        } catch (error) {
            console.error("Catch error occured:", error);
        }
    }

    const rejectOrderCancelHandler = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${id}/cancel-reject`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                console.log(data || "Order cancellation request rejected");
            }
            else {
                console.error("Failed to perform order cancellation:\n", res.status);
            }
        } catch (error) {
            console.error("Catch error occured:", error);
        }
    }

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isReviewed, setIsReviewed] = useState(false);

    const submitReviewHandler = async () => {
        if (!rating) {
            alert("Please give rating before submitting the review!");
            return;
        }
        if (!comment) {
            alert("Please write comment before submitting the review!");
            return;
        }

        setIsReviewed(true);

        const rawDuration = new Date(order?.completedAt) - new Date(order?.createdAt);
        const duration = Math.floor(new Date(rawDuration) / (24 * 60 * 60 * 1000));

        try {
            const res = await fetch("http://localhost:5000/api/review/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ rating, comment, gigId, buyerId, sellerId, id, price, duration })
            });

            if (res.ok) {
                const data = await res.json();
                setReviewDate(new Date(data.reviewDate).toLocaleDateString('en-us', options));
            }
            else {
                console.error("Failed to submit review: ", res.status);
            }
        } catch (error) {
            console.error("Some error occured while submitting review:", error);
        }
    }

    const [isBuyerRated, setIsBuyerRated] = useState(false);

    // Fetch buyer rating
    useEffect(() => {
        if (!id) return;

        const fetchBuyerRating = async () => {
            if (user.role === 'buyer') return;

            try {
                const res = await fetch(`http://localhost:5000/api/review/buyer-rating/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setRating(data.rating);
                }
                else {
                    console.error("Failed to fetch buyer rating:", res.status);
                }
            } catch (error) {
                console.error("Some error occured while fetching buyer rating:", error);
            }
        }

        fetchBuyerRating();
    }, [id, isBuyerRated]);

    const submitBuyerRatingHandler = async () => {
        if (!rating) {
            alert("Please give rating before submitting!");
            return;
        }

        setIsBuyerRated(true);

        try {
            const res = await fetch("http://localhost:5000/api/review/buyer-rating", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ rating, buyerId: order?.buyerId, orderId: order?._id })
            });

            if (res.ok) {
                alert("Rating submitted successfully");
            }
            else {
                console.error("Failed to submit rating:", res.status);
            }
        } catch (error) {
            console.error("Some error occured while submitting the rating:", error);
        }
    }

    const [reviewDate, setReviewDate] = useState(null);

    // Fetch buyer review
    useEffect(() => {
        if (order?.status !== 'completed') return;

        const fetchBuyerReview = async () => {
            if (user.role === 'seller') {
                return;
            }

            try {
                const res = await fetch(`http://localhost:5000/api/review/by-order/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setRating(data.rating);
                    setComment(data.comment);
                    setReviewDate(new Date(data.reviewDate).toLocaleDateString('en-us', options));
                }
                else {
                    console.error("Failed to fetch buyer review:", res.status);
                }
            } catch (error) {
                console.error("Some error occured while fetching buyer review:", error);
            }
        }

        fetchBuyerReview();
    }, [id, order?.status]);

    return (
        <div className='order-container'>
            <div className="order">
                <div className="order-back-button">
                    <span>
                        <Link to='/orders' className='link'>
                            <FontAwesomeIcon icon="fa-solid fa-arrow-left" /> Orders
                        </Link>
                    </span>
                </div>
                <div className="order-title">

                    <div className="order-title-preview">
                        <img src={coverImage} alt="" />
                    </div>
                    <div className="order-title-info">
                        <div>
                            <span className='order-title-info-gig-name'>{gigTitle}</span>
                            <br />
                            <span>
                                {
                                    user.role === 'seller' ?
                                        `Buyer Name: ${username}`
                                        :
                                        `Seller Name: ${username}`
                                }
                            </span>
                        </div>
                    </div>
                    <div className='order-title-status'>
                        <span>STATUS: {order?.status}</span>
                    </div>
                </div>
                <div className="order-desc">
                    <div className="order-desc-attr">
                        <table>
                            <tbody>
                                <tr>
                                    <td><span className='order-attr'>Order ID:</span></td>
                                    <td><span>{order?._id}</span></td>
                                </tr>
                                <tr>
                                    <td><span className='order-attr'>Ordered On:</span></td>
                                    <td><span>{new Date(order?.createdAt).toLocaleDateString("en-US", options)}</span></td>
                                </tr>
                                <tr>
                                    <td><span className='order-attr'>Price:</span></td>
                                    <td><span>₹{price}</span></td>
                                </tr>
                                <tr>
                                    {
                                        (order?.status !== 'completed' && order?.status !== 'cancelled' && order?.status !== 'requested' && order?.status !== 'Declined') &&
                                        (
                                            remainingDays > 1 ?
                                                <>
                                                    <td><span className='order-attr'>Due:</span></td>
                                                    <td><span>{remainingDays} Days left</span></td>
                                                </>
                                                :
                                                remainingDays === 0 ?
                                                    <>
                                                        <td><span className='order-attr'>Due:</span></td>
                                                        <td><span>Due Today</span></td>
                                                    </>
                                                    :
                                                    <>
                                                        <td><span className='order-attr'>Due:</span></td>
                                                        <td><span>{Math.abs(remainingDays)} Days late</span></td>
                                                    </>
                                        )
                                    }
                                </tr>

                                {/* Revisions fields visible ONLY after order is active */}
                                {
                                    order?.status !== 'requested' && order?.status !== 'Declined' &&
                                    (
                                        user.role === 'buyer' ?
                                            <tr>
                                                <td><span className='order-attr'>Revisions used:</span></td>
                                                <td><span>{order?.revisionCount}</span></td>
                                            </tr>
                                            :
                                            <tr>
                                                <td><span className='order-attr'>Revisions done:</span></td>
                                                <td><span>{order?.revisionCount}</span></td>
                                            </tr>
                                    )
                                }
                            </tbody>
                        </table>

                        <div className="order-status">
                            <span className='order-status-title'>Order Status:</span>
                            <div className='order-status-items'>
                                <span>ACTIVE </span>
                                <span>--- DELIVERED </span>
                                <span>--- COMPLETED</span>
                            </div>
                            <div className="order-action">
                                {
                                    order?.status === 'requested' && user.role === 'buyer' &&
                                    (
                                        <div className="requested-note">
                                            Seller is yet to accept the order request...
                                        </div>
                                    )
                                }
                                {
                                    order?.status === 'requested' && user?.role === 'seller' &&
                                    (
                                        <>
                                            <div className="order-request-actions">
                                                {
                                                    !rejectButtonToggle ?
                                                        <>
                                                            <button onClick={() => OrderRequestHandler(true)}>Accept Order</button>
                                                            <button onClick={() => setRejectButtonToggle(true)}>Decline Order</button>
                                                        </>
                                                        :
                                                        <>
                                                            <label htmlFor="seller-delivery-msg-box">Order Reject Note:</label>
                                                            <br />
                                                            <textarea name="delivery-msg" id="seller-delivery-msg-box" value={orderDeclineRequestNote} onChange={(e) => setOrderDeclineRequestNote(e.target.value)} ></textarea>
                                                            <br />
                                                            <button onClick={() => setRejectButtonToggle(false)}>Cancel</button>
                                                            <button onClick={() => OrderRequestHandler(false)}>Decline Order</button>
                                                        </>

                                                }
                                            </div>
                                        </>
                                    )
                                }
                                {
                                    order?.status === 'Declined' &&
                                    (
                                        user?.role === 'buyer' ?
                                            <div className='order-declined-window'>
                                                Order was declined by seller due to:
                                                <br />
                                                <textarea name="" id="" readOnly value={order.sellerNote}>
                                                </textarea>
                                            </div>
                                            :
                                            <div className='order-declined-window'>
                                                Buyer order was declined due to:
                                                <br />
                                                <textarea name="" id="" readOnly value={order.sellerNote}>
                                                </textarea>
                                            </div>
                                    )
                                }
                                {
                                    order?.status === 'active' && user.role === 'seller' &&
                                    (
                                        <>
                                            <input type="file" id='order-upload-file' onChange={uploadFilesHandler} className='order-upload-file-input' multiple accept='image/*, video/*, audio/*, .pdf, .doc, .docx, .zip' disabled={isUploading} />

                                            <label htmlFor='order-upload-file' className='order-upload-file-button'>
                                                Upload Files
                                            </label>

                                            <br />


                                            <div className='order-file-preview-container'>
                                                {
                                                    isUploading && (
                                                        <span>Loading File Preview</span>
                                                    )
                                                }

                                                <div className={`order-file-preview ${orderFiles.length > 0 && 'contains'}`}>
                                                    {
                                                        orderFiles.length === 0 ?
                                                            (
                                                                <span>No files uploaded yet</span>
                                                            )
                                                            :
                                                            (
                                                                orderFiles.map(file => (
                                                                    <div key={file.id} className='order-file'>
                                                                        <FilePreview file={file} />
                                                                        <div>
                                                                            <span title={file.name}>{file.name}</span>
                                                                            <br />
                                                                            <span>{formatBytesToSize(file.size)}</span>
                                                                        </div>

                                                                        <button onClick={() => deleteFileHandler(file.id)} className='delete-img-button'>
                                                                            <FontAwesomeIcon icon="fa-solid fa-trash" />
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            )
                                                    }
                                                </div>
                                            </div>

                                            <label htmlFor="seller-delivery-msg-box">Delivery note:</label>
                                            <textarea name="delivery-msg" id="seller-delivery-msg-box" value={textareaNote} onChange={handleChange} ></textarea>
                                            <br />

                                            <button onClick={deliverOrder}>Deliver Work</button>
                                        </>
                                    )
                                }
                                {
                                    order?.status === 'active' && user.role === 'buyer' &&
                                    <div>
                                        <span>Seller has not delivered the order yet.</span>
                                    </div>
                                }
                                {
                                    order?.status === 'delivered' && user.role === 'buyer' &&
                                    <div className="order-complete">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td><span>Delivered On: </span></td>
                                                    <td><span>{new Date(order?.deliveredAt).toLocaleDateString("en-US", options)}</span></td>
                                                </tr>

                                                <tr>
                                                    <td><span>Seller Note:</span></td>
                                                    <td><span>{order?.sellerNote !== '' ? order?.sellerNote : 'Note is empty'}</span></td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span>Files: </span>
                                                    </td>
                                                    <td>
                                                        <div className="delivered-files">
                                                            {
                                                                order?.deliveryFiles.map((file, index) => (
                                                                    <div key={index} className='delivered-file'>
                                                                        <FilePreview2 file={file} />
                                                                        <div className='delivered-file-info'>
                                                                            <div className='delivered-file-name'>
                                                                                <span>{file.fileName}</span>
                                                                            </div>
                                                                            <div className='delivered-file-size'>
                                                                                <span>{formatBytesToSize(file.fileSize)}</span>
                                                                            </div>
                                                                        </div>
                                                                        <button onClick={() => downloadFile(file)} className='deliver-file-button'>
                                                                            <FontAwesomeIcon icon="fa-regular fa-circle-down" />
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        <span>Note for seller: <br /> (Optional)</span>
                                                    </td>
                                                    <td>
                                                        <textarea name="" id="" className='' onChange={handleChange}></textarea>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        <div className="order-action-buttons">
                                                            <button className='order-accept-button' onClick={acceptOrderHandler}>Accept Order</button>
                                                            <button className={`order-revise-button ${order?.revisionCount === order?.totalRevisions && 'order-revise-button-disable'}`} onClick={requestRevisionHandler} disabled={order?.revisionCount === order?.totalRevisions}>Revise Order</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                }

                                {
                                    order?.status === 'delivered' && user.role === 'seller' &&
                                    <div className="order-complete">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td><span>Delivered On: </span></td>
                                                    <td><span>{new Date(order?.deliveredAt).toLocaleDateString("en-US", options)}</span></td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span>Waiting for buyer's approval...</span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                }

                                {
                                    order?.status === 'completed' && user.role === 'buyer' &&
                                    <div className="order-complete">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td><span>Delivered On: </span></td>
                                                    <td><span>{new Date(order?.deliveredAt).toLocaleDateString("en-US", options)}</span></td>
                                                </tr>
                                                <tr>
                                                    <td><span>Completed On:</span></td>
                                                    <td><span>{new Date(order?.completedAt).toLocaleDateString("en-US", options)}</span></td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        <span>Files: </span>
                                                    </td>
                                                    <td>
                                                        <div className="delivered-files">
                                                            {
                                                                order?.deliveryFiles.map((file, index) => (
                                                                    <div key={index} className='delivered-file'>
                                                                        <FilePreview2 file={file} />
                                                                        <div className='delivered-file-info'>
                                                                            <div className='delivered-file-name'>
                                                                                <span>{file.fileName}</span>
                                                                            </div>
                                                                            <div className='delivered-file-size'>
                                                                                <span>{formatBytesToSize(file.fileSize)}</span>
                                                                            </div>
                                                                        </div>
                                                                        <button onClick={() => downloadFile(file)} className='deliver-file-button'>
                                                                            <FontAwesomeIcon icon="fa-regular fa-circle-down" />
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                }

                                {
                                    order?.status === 'completed' && user.role === 'seller' &&
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td><span>Delivered On: </span></td>
                                                <td><span>{new Date(order?.deliveredAt).toLocaleDateString("en-US", options)}</span></td>
                                            </tr>
                                            <tr>
                                                <td><span>Completed On: </span></td>
                                                <td><span>{new Date(order?.completedAt).toLocaleDateString("en-US", options)}</span></td>
                                            </tr>
                                            <tr>
                                                <td><span>Buyer Note:</span></td>
                                                <td><span>{order?.buyerNote}</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                }

                                {
                                    order?.status === 'revision' && user.role === 'buyer' &&
                                    <div className="order-complete">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <span>Files: </span>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td>
                                                        <span>Waiting for seller's next delivery...</span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                }

                                {
                                    order?.status === 'revision' && user.role === 'seller' &&
                                    (
                                        <>
                                            <table>
                                                <tbody>
                                                    <tr>
                                                        <td><span>Buyer Note:</span></td>
                                                        <td><span>{order?.buyerNote}</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <input type="file" id='order-upload-file' onChange={uploadFilesHandler} className='order-upload-file-input' multiple accept='image/*, video/*, audio/*, .pdf, .doc, .docx, .zip' disabled={isUploading} />
                                                            <label htmlFor='order-upload-file' className='order-upload-file-button'>
                                                                Upload Files
                                                            </label>
                                                        </td>
                                                        <td>
                                                            <div className='order-file-preview-container'>
                                                                {
                                                                    isUploading && (
                                                                        <span>Loading File Preview</span>
                                                                    )
                                                                }

                                                                <div className={`order-file-preview ${orderFiles.length > 0 && 'contains'}`}>
                                                                    {
                                                                        orderFiles.length === 0 ?
                                                                            (
                                                                                <span>No files uploaded yet</span>
                                                                            )
                                                                            :
                                                                            (
                                                                                orderFiles.map(file => (
                                                                                    <div key={file.id} className='order-file'>
                                                                                        <FilePreview file={file} />
                                                                                        <div>
                                                                                            <span title={file.name}>{file.name}</span>
                                                                                            <br />
                                                                                            <span>{formatBytesToSize(file.size)}</span>
                                                                                        </div>

                                                                                        <button onClick={() => deleteFileHandler(file.id)} className='delete-img-button'>
                                                                                            <FontAwesomeIcon icon="fa-solid fa-trash" />
                                                                                        </button>
                                                                                    </div>
                                                                                ))
                                                                            )
                                                                    }
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <label htmlFor="seller-delivery-msg-box">Delivery note:</label>
                                                        </td>
                                                        <td>
                                                            <textarea name="delivery-msg" id="seller-delivery-msg-box" value={textareaNote} onChange={handleChange} ></textarea>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td></td>
                                                        <td>
                                                            <button onClick={deliverOrder}>Deliver Work</button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </>
                                    )
                                }

                                {
                                    order?.status === 'request-cancellation' &&
                                    <div className="order-complete">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td><span>Delivered On: </span></td>
                                                    <td><span>{new Date(order?.deliveredAt).toLocaleDateString("en-US", options)}</span></td>
                                                </tr>

                                                {
                                                    user.role === 'buyer' &&
                                                    <>
                                                        <tr>
                                                            <td><span>Seller Note:</span></td>
                                                            <td><span>{order?.sellerNote !== '' ? order?.sellerNote : 'Note is empty'}</span></td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <div>
                                                                    <p>{orderCancelText}</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>

                                                                <div className='request-cancel-box'>
                                                                    {
                                                                        order?.cancellationRequestedBy === 'buyer' &&
                                                                        <span>Order cancellation request has been sent. Waiting for seller's response...</span>
                                                                    }
                                                                    {
                                                                        order?.cancellationRequestedBy === 'seller' &&
                                                                        <>
                                                                            <span>Seller has requested to cancel this order</span>
                                                                            <button onClick={acceptOrderCancelHandler}>Accept</button>
                                                                            <button onClick={rejectOrderCancelHandler}>Decline</button>
                                                                        </>
                                                                    }
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </>
                                                }
                                                {
                                                    user.role === 'seller' &&
                                                    <>
                                                        <tr>
                                                            <td><span>Buyer Note:</span></td>
                                                            <td><span>{order?.sellerNote !== '' ? order?.sellerNote : 'Note is empty'}</span></td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <div>
                                                                    <p>{orderCancelText}</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>

                                                                <div className='request-cancel-box'>
                                                                    {
                                                                        order?.cancellationRequestedBy === 'seller' &&
                                                                        <span>Order cancellation request has been sent. Waiting for buyer's response...</span>
                                                                    }
                                                                    {
                                                                        order?.cancellationRequestedBy === 'buyer' &&
                                                                        <>
                                                                            <span>Buyer has requested to cancel this order</span>
                                                                            <button onClick={acceptOrderCancelHandler}>Accept</button>
                                                                            <button onClick={rejectOrderCancelHandler}>Decline</button>
                                                                        </>
                                                                    }
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </>
                                                }

                                            </tbody>
                                        </table>
                                    </div>
                                }

                                {
                                    order?.status === 'cancelled' && user.role === 'buyer' && order?.cancellationRequestedBy === 'buyer' &&
                                    <p>Seller has accepted the order cancellation request. Order was cancelled successfully.</p>
                                }

                                {
                                    order?.status === 'cancelled' && user.role === 'seller' && order?.cancellationRequestedBy === 'seller' &&
                                    <p>Buyer have accepted the order cancellation request. Order was cancelled successfully.</p>
                                }
                                {
                                    order?.status === 'cancelled' && user.role === 'seller' && order?.cancellationRequestedBy === 'buyer' &&
                                    <p>You have accepted the order cancellation request. Order was cancelled successfully.</p>
                                }
                                {
                                    order?.status === 'cancelled' && user.role === 'buyer' && order?.cancellationRequestedBy === 'seller' &&
                                    <p>You have accepted the order cancellation request. Order was cancelled successfully.</p>
                                }

                                {/* Redirect Chat Button */}
                                <div>
                                    <button className='order-open-chat-button' onClick={redirectToChat}>Open Chat <FontAwesomeIcon icon="fa-solid fa-comment" /></button>
                                </div>

                                {/* CANCEL BUTTON */}
                                <div>
                                    {
                                        order?.status !== 'cancelled' && order?.status !== 'completed' && order?.status !== 'requested' && order?.status !== 'Declined' &&
                                        <button onClick={() => setShowTextBox(true)}>Cancel Order</button>
                                    }
                                    {
                                        showTextBox &&
                                        <div>
                                            <p>Why do you want to cancel this order ?</p>
                                            <textarea name="" id="" onChange={handleCancelNote} value={textAreaCancelNote} placeholder='Explain in detail...'></textarea>
                                            <br />
                                            <button onClick={() => setShowTextBox(false)}>Hide</button>
                                            <br />
                                            <button onClick={cancelOrderRequestHandler}>Request Cancellation</button>
                                        </div>
                                    }

                                </div>

                                {/* Review Space */}
                                {
                                    order?.status === 'completed' && user.role === 'buyer' &&
                                    <>
                                        {
                                            isReviewed || order.isReviewed ?
                                                <div className="buyer-review-container">
                                                    <div className="thanks-msg">
                                                        Thank you for reviewing this gig! Your feedback helps the seller serve better.
                                                    </div>
                                                    <div className="review-subtitle">
                                                        Your review:
                                                    </div>
                                                    <div className='review-rating-and-timestamp'>
                                                        <div className="review-rating">
                                                            Rating:
                                                            <Rating name="read-only" value={rating} readOnly />
                                                        </div>
                                                        <div className="review-submittedAt">
                                                            Reviewed At: {reviewDate}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <textarea name="" id="" disabled placeholder='Share your experience...' value={comment} onChange={(e) => setComment(e.target.value)}>
                                                        </textarea>
                                                    </div>
                                                </div>

                                                :
                                                <div className="buyer-review-container">
                                                    <div className="review-title">
                                                        Leave seller a review...
                                                    </div>

                                                    <div className='review-rating'>
                                                        Rating:
                                                        <Rating
                                                            name="simple-controlled"
                                                            value={rating}
                                                            onChange={(event, newValue) => {
                                                                setRating(newValue)
                                                                console.log(newValue);
                                                            }}
                                                            defaultValue={0}
                                                            precision={0.5}
                                                        />
                                                    </div>

                                                    <div>
                                                        <textarea name="" id="" placeholder='Share your experience...' value={comment} onChange={(e) => setComment(e.target.value)}>
                                                        </textarea>
                                                        <button onClick={submitReviewHandler}>Submit</button>
                                                    </div>
                                                </div>
                                        }
                                    </>
                                }

                                {
                                    order?.status === 'completed' && user.role === 'seller' &&
                                    <>
                                        {
                                            isBuyerRated || order?.isBuyerRated ?
                                                <div className="buyer-review-container">
                                                    <div className="review-title">
                                                        Thanks for rating the buyer!
                                                    </div>
                                                    <div className='review-rating'>
                                                        Rating:
                                                        <Rating name="read-only" value={rating} readOnly />
                                                    </div>
                                                </div>
                                                :
                                                <div className="buyer-review-container">
                                                    <div className="review-title">
                                                        Give buyer a rating:
                                                    </div>
                                                    <div className='review-rating'>
                                                        Rating:
                                                        <Rating
                                                            name="simple-controlled"
                                                            value={rating}
                                                            onChange={(event, newValue) => {
                                                                setRating(newValue)
                                                                console.log(newValue);
                                                            }}
                                                            defaultValue={0}
                                                            precision={0.5}
                                                        />
                                                    </div>
                                                    <div>
                                                        <button onClick={submitBuyerRatingHandler}>Submit</button>
                                                    </div>
                                                </div>
                                        }
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

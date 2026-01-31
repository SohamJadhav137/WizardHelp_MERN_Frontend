import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getSocket } from '../../socket';
import { Rating } from '@mui/material'

import './Order.scss';
import { getCurrentUser } from '../../utils/getCurrentUser';
import Swal from 'sweetalert2';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import ORDER_STATES from '../../Data/OrderStates';
import { Toast } from '../../utils/copyTextToast';


const formatBytesToSize = (bytes) => {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i == 0) return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

export default function Order() {
    const socket = getSocket();

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
    const currentRole = user.role;

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
        if (!socket) return;

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
    }, [id, socket]);

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

    // Names to be displayed according to role
    let buyerName, sellerName;

    if (currentUser.role === 'buyer') {
        buyerName = currentUsername;
        sellerName = username;
    }
    else if (currentUser.role === 'seller') {
        buyerName = username;
        sellerName = currentUsername;
    }

    const orderDeclineHandler = async (responseState) => {
        const { value: declineReason } = await Swal.fire({
            title: 'Decline Order Request',
            input: 'textarea',
            inputLabel: 'Reason for declining:',
            inputPlaceholder: 'Explain why you are declining this order...',
            inputAttributes: {
                'arial-label': 'decline reason'
            },
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title'
            },
            showCancelButton: true,
            confirmButtonText: 'Decline Order',
            cancelButtonText: 'Cancel',
            cancelButtonColor: '#d33',
            inputValidator: (value) => {
                if (!value || !value.trim()) {
                    return 'Decline reason is required!';
                }
            }
        });

        if (!declineReason) return;

        try {
            const res = await fetch(`http://localhost:5000/api/orders/${order?._id}/order-request`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ sellerResponse: responseState, orderRejectNote: declineReason })
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

    const OrderRequestHandler = async (responseState) => {
        if (!id) return;

        const result = await Swal.fire({
            title: "Start this order?",
            html: `
      <div class="accept-popup">
        <p style="margin-bottom: 8px;">
          You are about to <b>accept this order</b> and begin work.
        </p>

        <ul style="text-align: left; font-size: 14px; padding-left: 18px;">
          <li>Buyer requirements will <b>not be displayed</b> later</li>
          <li>Please review all details carefully before proceeding</li>
        </ul>

        <p style="margin-top: 10px; font-size: 13px; color: #6b7280;">
          Make sure you fully understand the buyer's expectations before accepting.
        </p>
      </div>
    `,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Accept & Start Order",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#018790",
            cancelButtonColor: "#9CA3AF",
            reverseButtons: true,
            focusCancel: true,
            customClass: {
                popup: "swal-custom-popup",
                title: "swal-custom-title"
            }
        });

        if (!result.isConfirmed) return;

        try {
            const res = await fetch(`http://localhost:5000/api/orders/${id}/order-request`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ sellerResponse: responseState })
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

    const deleteFileHandler = (fileId) => {
        setOrderFiles(prev => prev.filter(file => file.id !== fileId));
    }

    const FilePreview = ({ file }) => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/');

        if (isImage) {
            return (
                <img src={file.dataUrl} alt={file?.name} />
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
                <img src={`http://localhost:5000/api/preview/${order?._id}/file/${file._id}`} alt={file.fileName} />
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

        const { uploadURL, key, fileName } = await response.json();

        await fetch(uploadURL, {
            method: 'PUT',
            headers: { "Content-Type": file.type },
            body: file
        });

        return { key, fileName, type: file.type, size: file.size };
    }

    const [textareaNote, setTextareaNote] = useState('');

    // For delivery note textarea
    const handleChange = (e) => {
        setTextareaNote(e.target.value);
    }

    const deliverOrder = async () => {
        if (orderFiles.length === 0) {
            return Swal.fire({
                icon: 'error',
                title: 'No files uploaded',
                text: 'Please upload atleast one file to deliver a order.',
                confirmButtonColor: '#005461',
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title'
                }
            });
        }

        const result = await Swal.fire({
            title: 'Deliver Order ?',
            text: 'Are you sure you want to submit these files ?',
            icon: 'question',
            showCancelButton: true,
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title'
            },
            confirmButtonColor: '#018790',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Deliver',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {

            Swal.fire({
                title: "Delivering your work...",
                text: "Please wait a while.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title'
                },
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            let uploadFileUrls = [];

            for (const file of orderFiles) {
                try {
                    const uploaded = await uploadToS3(file.originalFile, token);
                    uploadFileUrls.push({
                        key: uploaded.key,
                        fileName: uploaded.fileName,
                        fileType: uploaded.type,
                        fileSize: uploaded.size
                    });
                } catch (error) {
                    console.error(error)
                    // Failed to fetch s3 url for certain file
                    Swal.fire({
                        title: 'Error',
                        text: 'Something went wrong. Please try again.',
                        icon: 'error',
                        customClass: {
                            popup: 'swal-custom-popup',
                            title: 'swal-custom-title'
                        }
                    });
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
                    Swal.fire({
                        icon: "success",
                        title: "Order Delivered",
                        text: "Now waiting for buyer's approval.",
                        customClass: {
                            popup: 'swal-custom-popup',
                            title: 'swal-custom-title'
                        }
                    });
                }
                else {
                    console.error(`Failed to deliver the order\nBackend response status: ${response.status}\nResponse Text: ${response.statusText}`);
                    Swal.fire({
                        title: 'Error',
                        text: 'Something went wrong during order delivery!',
                        icon: 'error',
                        customClass: {
                            popup: 'swal-custom-popup',
                            title: 'swal-custom-title'
                        }
                    });
                }

            } catch (error) {
                console.error("Some error occured while updating order's status or sending the order.\n", error);
            }
        }
    }

    const downloadFile = async (fileId) => {
        document.location.assign(`http://localhost:5000/api/download/${order?._id}/file/${fileId}`);
    };

    const acceptOrderHandler = async () => {
        const result = await Swal.fire({
            title: "Accept this work?",
            html: `
                <div class='accept-popup'>
                    <div class='accept-popup-title'>This action is <b>final</b>.</div>
                    <ul style="text-align:left">
                        <li>Order will be completed</li>
                        <li>Payment will be released to seller</li>
                        <li>No further revisions allowed!</li>
                    </ul>
                </div>
            `,
            icon: "warning",
            showCancelButton: true,
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title'
            },
            confirmButtonText: "Accept Work",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#018790",
            reverseButtons: true
        });

        if (result.isConfirmed) {
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
                    Swal.fire({
                        icon: "success",
                        title: "Order Completed",
                        text: "You can now rate the seller and leave a review.",
                        confirmButtonText: "Ok",
                        customClass: {
                            popup: 'swal-custom-popup',
                            title: 'swal-custom-title'
                        }
                    });
                }
                else {
                    console.error("Failed to update order status to complete:", response.status);
                    console.error("Response text:", response.statusText);
                }

            } catch (error) {
                console.error("Some error occured while updating order status to complete");
            }
        }
    };

    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
    }

    const deleteFromS3 = useCallback(async (s3Key, token) => {
        try {
            const response = await fetch("http://localhost:5000/api/s3/delete-file", {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ s3Key })
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
        if (order?.revisionCount === order?.totalRevisions) {
            Toast.fire({
                icon: 'warning',
                title: 'All revisions used!'
            });
            return;
        }

        const { value: text } = await Swal.fire({
            title: 'Request a Revision',
            html: `
      <div class="revision-note">
        <div class="revision-popup-note">Note:</div>
        <div class="revision-popup-note-main">
        If you request a revision, previously delivered files will be removed.
        Please make sure you have downloaded all necessary files.
        </div>
      </div>
      <textarea
        id="swal-input"
        class="swal2-textarea"
        placeholder="Example: Please change the font and make the logo larger..."
        aria-label="Type your message here"
      ></textarea>
    `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Submit Revision',
            confirmButtonColor: '#018790',
            cancelButtonText: 'Cancel',
            cancelButtonColor: '#d33',
            reverseButtons: true,
            preConfirm: () => {
                const value = document.getElementById('swal-input').value;
                if (!value) {
                    Swal.showValidationMessage(
                        'You need to write something for the seller to work on!'
                    );
                }
                return value;
            },
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title'
            }
        });

        if (text) {
            try {
                for (const file of order?.deliveryFiles) {
                    await deleteFromS3(file.key, token);
                    console.log("Deleting file:", file.key);
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
                    body: JSON.stringify({ buyerNote: text })
                })

                if (res.ok) {
                    console.log("Revision success!!!");
                    Swal.fire({
                        title: 'Revision Sent!',
                        text: 'The seller has been notified of your changes.',
                        icon: 'success',
                        customClass: {
                            popup: 'swal-custom-popup',
                            title: 'swal-custom-title'
                        },
                        confirmButtonColor: '#018790'
                    });
                }
                else {
                    console.error("Failed to send revision request:", res.status);
                }
            } catch (error) {
                console.error("Some error occured while sending revision request:", error);
                Swal.fire({
                    title: 'Error',
                    text: 'Something went wrong. Please try again.',
                    icon: 'error',
                    customClass: {
                        popup: 'swal-custom-popup',
                        title: 'swal-custom-title'
                    }
                });
            }
        }
    }

    const cancelOrderRequestHandler = async () => {
        const { value: textAreaCancelNote } = await Swal.fire({
            title: 'Request Order Cancellation',
            input: 'textarea',
            inputLabel: 'Why do you want to cancel this order ?',
            inputPlaceholder: 'Please describe your reason for cancelling this order (e.g., lack of communication, change in requirements, technical limitations)...',
            inputAttributes: {
                'arial-label': 'cancel reason'
            },
            showCancelButton: true,
            confirmButtonText: 'Send Request',
            cancelButtonText: 'Keep Order',
            cancelButtonColor: 'rgba(87, 87, 87, 1)',
            confirmButtonColor: '#ff0000dd',
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title'
            },
            inputValidator: (value) => {
                if (!value || !value.trim()) {
                    return 'Cancel reason is required!';
                }
                else if (value.length < 10) {
                    return 'Atleast 10 characters are required!'
                }
            }
        });

        if (!textAreaCancelNote) return;

        if (!id) return;

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
            }
            else {
                console.error("Failed to send order cancellation request due to:\n", res.status);
            }
        } catch (error) {
            console.error("Some error occured while sending order cancellation request:\n", error);
        }
    }

    const acceptOrderCancelHandler = async () => {
        const result = await Swal.fire({
            title: "Accept Cancellation?",
            text: "This will cancel the order permanently. This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Cancel order",
            cancelButtonText: "Keep order",
            confirmButtonColor: "#16a34a", // green
            cancelButtonColor: "#6b7280",  // gray
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title'
            },
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        Swal.fire({
            title: "Cancelling order...",
            allowOutsideClick: false,
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title'
            },
            didOpen: () => {
                Swal.showLoading();
            }
        });

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
                for (const file of order?.deliveryFiles) {
                    await deleteFromS3(file.key, token);
                    console.log("Deleting file:", file.key);
                }
                Swal.fire({
                    title: "Order Cancelled",
                    text: "The order has been cancelled successfully.",
                    icon: "success",
                    customClass: {
                        popup: 'swal-custom-popup',
                        title: 'swal-custom-title'
                    },
                    confirmButtonColor: "#16a34a"
                });

            }
            else {
                console.error("Failed to perform order cancellation:\n", res.status);
                throw new Error("Failed to cancel order!")
            }
        } catch (error) {
            console.error("Catch error occured:", error);
            Swal.fire({
                title: "Something went wrong",
                text: error.message,
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title'
                },
                icon: "error"
            });
        }
    }

    const rejectOrderCancelHandler = async () => {
        const result = await Swal.fire({
            title: "Reject Cancellation?",
            text: "Rejecting will keep the order active.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Reject Request",
            cancelButtonText: "Go Back",
            confirmButtonColor: "#dc2626", // red
            cancelButtonColor: "#6b7280",  // gray
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title'
            },
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        Swal.fire({
            title: "Rejecting request...",
            allowOutsideClick: false,
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title'
            },
            didOpen: () => {
                Swal.showLoading();
            }
        });

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
                Swal.fire({
                    title: "Request Rejected",
                    text: "The order will continue as before.",
                    icon: "success",
                    customClass: {
                        popup: 'swal-custom-popup',
                        title: 'swal-custom-title'
                    },
                    confirmButtonColor: "#dc2626"
                });
            }
            else {
                console.error("Failed to perform order cancellation:\n", res.status);
                throw new Error("Failed to reject request!");
            }
        } catch (error) {
            console.error("Catch error occured:", error);
            Swal.fire({
                title: "Something went wrong",
                text: error.message,
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title'
                },
                icon: "error"
            });
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
            // alert("Please give rating before submitting!");
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
                console.log("Rating submitted successfully");
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

    // Truncate Order ID
    const truncateId = (id, startIndex = 5, endIndex = 5) => {
        if (!id) return;

        if (id.length <= startIndex + endIndex) return id;
        return `${id.substring(0, startIndex)}...${id.substring(id.length - endIndex)}`;
    }

    let orderState = ORDER_STATES[order?.status];

    const [remainingDays, setRemainingDays] = useState(-999999);
    const [urgencyLevel, setUrgencyLevel] = useState('normal');

    // Start calculation of due date after order is active
    useEffect(() => {
        if (!order?.dueDate ||
            order?.status === 'requested' ||
            order?.status === 'cancelled' ||
            order?.status === 'Declined' ||
            order?.status === 'completed')
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

    const handleCopyText = (text) => {
        navigator.clipboard.writeText(text);

        Toast.fire({
            icon: 'success',
            title: 'Copied to clipboard'
        });
    }

    return (
        <div className='order-container'>
            <div className="order">

                {/* "<- Orders" Button */}
                <div className="order-back-button">
                    <span>
                        <Link to='/orders' className='link'>
                            <FontAwesomeIcon icon="fa-solid fa-arrow-left" /> Orders
                        </Link>
                    </span>
                </div>

                <div className={`order-status-header ${orderState?.styleClass}`}>
                    <div className="status-icon">
                        {
                            order?.status === 'revision' ?
                                <FontAwesomeIcon icon="fa-solid fa-arrows-rotate" spin className='fontawesome-icon' />
                                :
                                (order?.status === 'completed' || order?.status === 'cancelled') ?
                                    <DotLottieReact
                                        src={orderState?.lottie}
                                        autoplay
                                    />
                                    :
                                    <DotLottieReact
                                        src={orderState?.lottie}
                                        loop
                                        autoplay
                                    />
                        }
                    </div>
                    <div className="status-info">
                        <div className="heading">
                            {orderState?.heading}
                        </div>
                        <div className="sub-heading">
                            {
                                order?.status === 'request-cancellation' ?
                                    currentRole === 'buyer' ?
                                        order?.cancellationRequestedBy === 'buyer' ?
                                            orderState?.byBuyer.buyerSub
                                            :
                                            orderState?.bySeller.buyerSub
                                        :
                                        order?.cancellationRequestedBy === 'seller' ?
                                            orderState?.bySeller.sellerSub
                                            :
                                            orderState?.byBuyer.sellerSub
                                    :
                                    order?.status === 'cancelled' ?
                                        currentRole === 'buyer' ?
                                            order?.cancellationRequestedBy === 'buyer' ?
                                                orderState?.byBuyer.buyerSub
                                                :
                                                orderState?.bySeller.buyerSub
                                            :
                                            order?.cancellationRequestedBy === 'seller' ?
                                                orderState?.bySeller.sellerSub
                                                :
                                                orderState?.byBuyer.sellerSub
                                        :
                                        currentRole === 'buyer' ?
                                            orderState?.buyerSub
                                            :
                                            orderState?.sellerSub
                            }
                        </div>
                    </div>
                </div>

                <div className="order-header">
                    <div className="order-header-major">
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
                                            `Buyer: ${username}`
                                            :
                                            `Seller: ${username}`
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className='order-title-status'>
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
                                            <span className='due'>Due Today!</span>
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
                    </div>
                </div>

                <div className="order-main">
                    <div className="order-content">

                        {/* ORDER REQUESTED/DECLINED STATE */}
                        {
                            (order?.status === 'requested' || order?.status === 'Declined') &&
                            <>
                                <div className="buyer-req-box">
                                    <div className="title">
                                        {currentUser.role === 'buyer' ? 'Your' : 'Buyer'} Requirements:
                                    </div>
                                    <div className="req">
                                        {order?.orderReq}
                                    </div>
                                </div>
                            </>
                        }

                        {/* ORDER ACTIVE STATE */}
                        {
                            order?.status === 'active' &&
                            (
                                currentUser.role === 'seller' ?
                                    <>
                                        <div className="delivery-note">
                                            <div className="title">
                                                <label htmlFor="deliveryNote">Delivery Note:</label>
                                            </div>
                                            <textarea name="" id="deliveryNote" value={textareaNote} onChange={handleChange} placeholder='Add a short note about the delivery (optional)'></textarea>
                                        </div>

                                        <div className="upload-file-box">
                                            <input type="file" id='order-upload-file' onChange={uploadFilesHandler} className='order-upload-file-input' multiple accept='image/*, video/*, audio/*, .pdf, .doc, .docx, .zip' disabled={isUploading} />

                                            <label htmlFor='order-upload-file' className='order-upload-file-button'>
                                                <FontAwesomeIcon icon="fa-solid fa-plus" /> Add Files
                                            </label>

                                            <div className="order-file-preview-container">
                                                <div className={`order-file-preview ${orderFiles.length > 0 && 'contains'}`}>
                                                    {
                                                        orderFiles.length === 0 ?
                                                            (
                                                                <div className='files-empty-text'>No files uploaded yet !</div>
                                                            )
                                                            :
                                                            (
                                                                orderFiles.map(file => (
                                                                    <div key={file.id} className='order-file'>
                                                                        <div className="file-preview">
                                                                            <FilePreview file={file} />
                                                                        </div>
                                                                        <div className='file-info'>
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
                                        </div>
                                    </>
                                    :
                                    <div className="upload-file-box emtpy">
                                        <div className='files-empty-text'>Delivered files will appear here</div>
                                    </div>
                            )
                        }

                        {/* ORDER DELIVERED STATE */}
                        {
                            order?.status === 'delivered' &&
                            <>
                                <div className="delivered-note">
                                    <div className="title">
                                        Delivery Note:
                                    </div>
                                    <div className="note">
                                        {order?.sellerNote !== '' ? order?.sellerNote : '*Empty Note'}
                                    </div>
                                </div>

                                <div className="upload-file-box">
                                    <div className="title">
                                        Delivered Files:
                                    </div>
                                    <div className="order-file-preview-container">
                                        <div className="order-file-preview contains">
                                            {
                                                order?.deliveryFiles.map((file, index) => (
                                                    <div key={index} className='order-file'>
                                                        {/* <FilePreview2 file={file} /> */}
                                                        <div className="file-preview">
                                                            <FilePreview2 file={file} />
                                                        </div>
                                                        <div className='file-info'>
                                                            <span title={file.fileName}>{file.fileName}</span>
                                                            <br />
                                                            <span>{formatBytesToSize(file.fileSize)}</span>
                                                        </div>
                                                        <button onClick={() => downloadFile(file._id)} className='deliver-file-button'>
                                                            <FontAwesomeIcon icon="fa-regular fa-circle-down" />
                                                        </button>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                            </>
                        }

                        {/* ORDER REVISION STATE */}
                        {
                            order?.status === 'revision' &&
                            <>
                                <div className="delivered-note">
                                    <div className="title">
                                        {
                                            currentRole === 'buyer' ?
                                                'Your Note:'
                                                :
                                                'Buyer Note:'
                                        }
                                    </div>
                                    <div className="note">
                                        {order?.buyerNote !== '' ? order?.buyerNote : '*Emtpy Note'}
                                    </div>
                                </div>

                                {
                                    currentRole === 'seller' ?

                                        <>
                                            <div className="delivery-note">
                                                <div className="title">
                                                    <label htmlFor="deliveryNote">Delivery Note:</label>
                                                </div>
                                                <textarea name="" id="deliveryNote" value={textareaNote} onChange={handleChange} placeholder='Add a short note about the delivery (optional)'></textarea>
                                            </div>

                                            <div className="upload-file-box">

                                                <div className='add-file-info'>
                                                    <input type="file" id='order-upload-file' onChange={uploadFilesHandler} className='order-upload-file-input' multiple accept='image/*, video/*, audio/*, .pdf, .doc, .docx, .zip' disabled={isUploading} />
                                                    <label htmlFor='order-upload-file' className='order-upload-file-button'>
                                                        <FontAwesomeIcon icon="fa-solid fa-plus" /> Add Files
                                                    </label>
                                                    <div className="add-file-info-text">
                                                        <div className='icon'>
                                                            <FontAwesomeIcon icon="fa-solid fa-circle-info" />
                                                        </div>
                                                        <div className='text'>
                                                            Please <b>delete</b> below files (if any) and upload all your work <b>AGAIN</b> as previously sent files are no more available to buyer if they haven't downloaded it.
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="order-file-preview-container">
                                                    <div className={`order-file-preview ${orderFiles.length > 0 && 'contains'}`}>
                                                        {
                                                            orderFiles.length === 0 ?
                                                                (
                                                                    <div className='files-empty-text'>No files uploaded yet !</div>
                                                                )
                                                                :
                                                                (
                                                                    orderFiles.map(file => (
                                                                        <div key={file.id} className='order-file'>
                                                                            <div className="file-preview">
                                                                                <FilePreview file={file} />
                                                                            </div>
                                                                            <div className='file-info'>
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
                                            </div>
                                        </>
                                        :
                                        <div className="upload-file-box emtpy">
                                            <div className='files-empty-text'>Delivered files will appear here</div>
                                        </div>
                                }
                            </>
                        }

                        {/* ORDER COMPLETED STATE (BUYER) */}
                        {
                            order?.status === 'completed' && user.role === 'buyer' &&
                            <>
                                <div className="upload-file-box">
                                    <div className="title">
                                        Delivered Files:
                                    </div>
                                    <div className="order-file-preview-container">
                                        <div className="order-file-preview contains">
                                            {
                                                order?.deliveryFiles.map((file, index) => (
                                                    <div key={index} className='order-file'>
                                                        {/* <FilePreview2 file={file} /> */}
                                                        <div className="file-preview">
                                                            <FilePreview2 file={file} />
                                                        </div>
                                                        <div className='file-info'>
                                                            <span title={file.fileName}>{file.fileName}</span>
                                                            <br />
                                                            <span>{formatBytesToSize(file.fileSize)}</span>
                                                        </div>
                                                        <button onClick={() => downloadFile(file._id)} className='deliver-file-button'>
                                                            <FontAwesomeIcon icon="fa-regular fa-circle-down" />
                                                        </button>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>

                                {
                                    isReviewed || order.isReviewed ?
                                        <div className="buyer-review-container">
                                            <div className="thanks-msg">
                                                Thank you for reviewing this gig! Your feedback helps the seller to serve better.
                                            </div>
                                            <div className="review-subtitle">
                                                Your review:
                                            </div>
                                            <div className='review-rating-and-timestamp'>
                                                <div className="review-rating">
                                                    <span className='review-label'>Rating:</span>
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
                                                <span className='review-label'>Rating:</span>
                                                <Rating
                                                    name="simple-controlled"
                                                    value={rating}
                                                    onChange={(e, newValue) => setRating(newValue ?? 0)}
                                                    defaultValue={0}
                                                    precision={0.5}
                                                />
                                            </div>

                                            <div>
                                                <textarea name="" id="" placeholder='Share your experience...' value={comment} onChange={(e) => setComment(e.target.value)}>
                                                </textarea>
                                                <button onClick={submitReviewHandler} className='review-submit'>Submit</button>
                                            </div>
                                        </div>
                                }
                            </>
                        }

                        {/* ORDER COMPLETED STATE (SELLER) */}
                        {
                            order?.status === 'completed' && user.role === 'seller' &&
                            <>
                                <div className="upload-file-box">
                                    <div className="title">
                                        Delivered Files:
                                    </div>
                                    <div className="order-file-preview-container">
                                        <div className="order-file-preview contains">
                                            {
                                                order?.deliveryFiles.map((file, index) => (
                                                    <div key={index} className='order-file'>
                                                        {/* <FilePreview2 file={file} /> */}
                                                        <div className="file-preview">
                                                            <FilePreview2 file={file} />
                                                        </div>
                                                        <div className='file-info'>
                                                            <span title={file.fileName}>{file.fileName}</span>
                                                            <br />
                                                            <span>{formatBytesToSize(file.fileSize)}</span>
                                                        </div>
                                                        <button onClick={() => downloadFile(file._id)} className='deliver-file-button'>
                                                            <FontAwesomeIcon icon="fa-regular fa-circle-down" />
                                                        </button>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                                {
                                    isBuyerRated || order?.isBuyerRated ?
                                        <div className="buyer-review-container">
                                            <div className="review-title">
                                                Thanks for rating the buyer!
                                            </div>
                                            <div className='review-rating'>
                                                <span className='review-label'>Rating:</span>
                                                <Rating name="read-only" value={rating || order?.buyerRating} readOnly />
                                            </div>
                                        </div>
                                        :
                                        <div className="buyer-review-container">
                                            <div className="review-title">
                                                Rate Buyer Experience:
                                            </div>
                                            <div className='review-rating'>
                                                <span className='review-label'>Rating:</span>
                                                <Rating
                                                    name="simple-controlled"
                                                    value={rating}
                                                    onChange={(event, newValue) => {
                                                        setRating(newValue)
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

                        {/* ORDER CANCELLATION REQUEST */}
                        {
                            order?.status === 'request-cancellation' &&
                            <div className="delivered-note">
                                <div className="title">
                                    {
                                        currentRole === 'buyer' ?
                                            order?.cancellationRequestedBy === 'buyer' ?
                                                'Your Reason:'
                                                :
                                                "Seller's Reason:"
                                            :
                                            order?.cancellationRequestedBy === 'seller' ?
                                                'Your Reason:'
                                                :
                                                "Buyer's Reason:"
                                    }
                                </div>
                                <div className="note">
                                    {order?.cancellationReason !== '' ? order?.cancellationReason : '*Emtpy Note'}
                                </div>
                            </div>
                        }

                        {/* ORDER CANCELLED/DECLINED STATE */}
                        {
                            (order?.status === 'cancelled' || order?.status === 'Declined') &&
                            <div className="no-action-text">
                                No furhter action is required
                            </div>
                        }
                    </div>

                    {/* ORDER SUMMARY CARD */}
                    <div className="order-summary">
                        <div className="order-summary-card">
                            <div className="title">
                                Order Summary
                            </div>
                            <div className="order-summary-table">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Order ID:</td>
                                            <td title={order?._id}>{truncateId(order?._id)} <button onClick={() => handleCopyText(order?._id)}><FontAwesomeIcon icon="fa-regular fa-copy" /></button></td>
                                        </tr>
                                        <tr>
                                            <td>Ordered On:</td>
                                            <td>{new Date(order?.createdAt).toLocaleDateString("en-US", options)}</td>
                                        </tr>
                                        {
                                            order?.status !== 'requested' && order?.status !== 'Declined' &&
                                            <tr>
                                                <td>Initiated On:</td>
                                                <td>{new Date(order?.startDate).toLocaleDateString('en-us', options)}</td>
                                            </tr>
                                        }
                                        {
                                            order?.status !== 'requested' &&
                                            order?.status !== 'Declined' &&
                                            order?.status !== 'completed' &&
                                            order?.status !== 'cancelled' &&
                                            <tr>
                                                <td>Due Date:</td>
                                                <td>{new Date(order?.dueDate).toLocaleDateString("en-US", options)}</td>
                                            </tr>
                                        }
                                        {
                                            order?.status !== 'requested' &&
                                            order?.status !== 'declined' &&
                                            <tr>
                                                <td>Delivered On:</td>
                                                <td>
                                                    {
                                                        order?.deliveredAt ?
                                                            new Date(order?.deliveredAt).toLocaleDateString('en-us', options)
                                                            :
                                                            'N/A'
                                                    }
                                                </td>
                                            </tr>
                                        }
                                        {
                                            order?.status !== 'requested' &&
                                            order?.status !== 'Declined' &&
                                            <tr>
                                                <td>Total Revisions:</td>
                                                <td>{order?.totalRevisions}</td>
                                            </tr>
                                        }
                                        {
                                            order?.revisionCount > 0 &&
                                            <tr>
                                                {
                                                    order?.revisionCount === order?.totalRevisions ?
                                                        <>
                                                            <td className='no-revisions-left-text'>Revisions Used:</td>
                                                            <td>
                                                                <span className='no-revisions-left-text'>
                                                                    {order?.revisionCount} (0 left!)
                                                                </span>
                                                            </td>
                                                        </>
                                                        :
                                                        <>
                                                        <td>Revisions Used:</td>
                                                        <td>{order?.revisionCount}</td>
                                                        </>
                                                }
                                            </tr>
                                        }
                                        {
                                            order?.completedAt &&
                                            <tr>
                                                <td>Completed On:</td>
                                                <td>{new Date(order?.completedAt).toLocaleDateString('en-us', options)}</td>
                                            </tr>
                                        }
                                        <tr className='price-field'>
                                            <td>Price:</td>
                                            <td>₹{order?.price}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* ORDER SUMMARY REQUESTED STATE */}
                            {
                                order?.status === 'requested' &&
                                <div className="order-actions">
                                    {
                                        currentRole === 'seller' ?
                                            <>
                                                <button className='accept-order' onClick={() => OrderRequestHandler(true)}>Accept Order</button>
                                                <button className='chat-button' onClick={redirectToChat}>Chat With {currentRole === 'buyer' ? 'Seller' : 'Buyer'} <FontAwesomeIcon icon="fa-solid fa-comment" /></button>
                                                <button className='decline-order' onClick={() => orderDeclineHandler(false)}>Decline Order</button>
                                            </>
                                            :
                                            <button className='chat-button' onClick={redirectToChat}>Chat With {currentRole === 'buyer' ? 'Seller' : 'Buyer'} <FontAwesomeIcon icon="fa-solid fa-comment" /></button>
                                    }
                                </div>
                            }

                            {/* ORDER SUMMARY ACTIVE STATE */}
                            {
                                (order?.status === 'active' || order?.status === 'revision') &&
                                <div className="order-actions">
                                    {
                                        currentRole === 'seller' &&
                                        <button className='deliver-order' onClick={deliverOrder}>Deliver Work</button>
                                    }
                                    <button className='chat-button' onClick={redirectToChat}>Chat With {currentRole === 'buyer' ? 'Seller' : 'Buyer'} <FontAwesomeIcon icon="fa-solid fa-comment" /></button>
                                    <button className='cancel-order' onClick={cancelOrderRequestHandler}>Cancel Order</button>
                                </div>
                            }

                            {/* ORDER SUMMARY DELIVERED STATE */}
                            {
                                order?.status === 'delivered' &&
                                <div className="order-actions">
                                    {
                                        currentUser.role === 'buyer' &&
                                        <>
                                            <button className='accept-work' onClick={acceptOrderHandler}>
                                                <FontAwesomeIcon icon="fa-solid fa-check" /> Accept Work
                                            </button>
                                            <button className='revise-order' onClick={requestRevisionHandler} disabled={order?.revisionCount === order?.totalRevisions}><FontAwesomeIcon icon="fa-solid fa-arrows-rotate" /> Revise Work</button>
                                        </>
                                    }
                                    <button className='chat-button' onClick={redirectToChat}>Chat With {currentRole === 'buyer' ? 'Seller ' : 'Buyer '}<FontAwesomeIcon icon="fa-solid fa-comment" /></button>
                                    <button className='cancel-order' onClick={cancelOrderRequestHandler}>Cancel Order</button>
                                </div>
                            }

                            {
                                order?.status === 'request-cancellation' &&
                                order?.cancellationRequestedBy !== currentRole &&
                                <div className="order-actions">
                                    <button className='accept-order-cancel' onClick={acceptOrderCancelHandler}>Accept Request</button>
                                    <button className='reject-order-cancel' onClick={rejectOrderCancelHandler}>Decline Request</button>
                                </div>
                            }
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    )
}

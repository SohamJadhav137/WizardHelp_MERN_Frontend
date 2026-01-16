import React, { useEffect, useState } from 'react'

import './MyGig.scss'
import { gigs } from '../../Data/GigsData'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Swal from 'sweetalert2';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function MyGig() {

    const [userGigs, setUserGigs] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    // Fetch all user gigs
    useEffect(() => {
        const fetchUserGigs = async () => {
            try {
                setLoading(true);

                const response = await fetch('http://localhost:5000/api/gigs/my-gigs', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserGigs(data);
                }
                else {
                    throw new Error("Error in fetching gigs:", response.status);
                }
            } catch (error) {
                console.error("CUSTOM ERROR in fetching user gigs:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchUserGigs();
    }, []);

    const deleteGigHandler = async (gigId) => {
        const result = await Swal.fire({
            title: "Delete Gig ?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title'
            }
        })

        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`http://localhost:5000/api/gigs/${gigId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
                body: { gigId: gigId }
            });

            if (response.ok) {
                const msg = await response.json();
                setUserGigs(userGigs.filter(gig => gig._id !== gigId))
                Swal.fire({
                    title: "Gig Deleted",
                    text: "Your gig was deleted successfully!",
                    icon: "success",
                    customClass: {
                        popup: 'swal-custom-popup',
                        title: 'swal-custom-title'
                    }
                });
            }
            else {
                Swal.fire({
                    title: "Error",
                    text: "Failed to delete the gig!",
                    icon: "error",
                    customClass: {
                        popup: 'swal-custom-popup',
                        title: 'swal-custom-title'
                    }
                });
                throw new Error("Failed to delete the gig! error status:", response.status);
            }

        } catch (error) {
            console.error("CUSTOM ERROR:", error);
        }
    }

    const toggleGigPublishState = async (gigId, gigPublishState) => {
        const newState = !gigPublishState;
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:5000/api/gigs/publish-state/${gigId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ isPublished: newState })
            })

            if (response.ok) {
                setUserGigs(prevGigs => prevGigs.map(gig => gig._id === gigId ? { ...gig, isPublished: newState } : gig));
                Swal.fire({
                    title: "Gig Status Changed",
                    text: `Gig status was changed to ${newState ? 'published' : 'unpublished'}`,
                    icon: "warning",
                    customClass: {
                        popup: 'swal-custom-popup',
                        title: 'swal-custom-title'
                    }
                });
            }
            else {
                throw new Error("Failed to update gig's state:", response.status);
            }
        } catch (error) {
            console.error("Some FRONTEND error occured while updating gig's state\nError:", error);
            Swal.fire({
                title: "Error",
                text: 'Failed to switch gig status!',
                icon: "error",
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title'
                }
            });
        }
    }

    return (
        <>
            <div className='header'>
                <div className="header-container">
                    <div className="my-gigs-title">
                        <span>My Gigs</span>
                    </div>
                    {
                        userGigs.length !== 0 &&
                        <div>
                            <button className="add-gig-button">
                                <Link to='/create-gig' className='link'>Create New Gig</Link>
                            </button>
                        </div>
                    }
                </div>
            </div>
            {
                loading ? (
                    <div className="my-gigs-loading">
                        <DotLottieReact
                            src='/animations/loading_orders.lottie'
                            loop
                            autoplay
                            style={{ height: "125px", width: "450px" }}
                        />
                        <h2>Loading your gigs...</h2>
                    </div>
                )
                    :
                    <div className="gigs-table">
                        <div className="gigs-table-container">
                            {
                                userGigs.length === 0 ?
                                    <div className="my-gigs-empty-text">
                                        <DotLottieReact
                                            src="https://lottie.host/208a807b-5d86-4535-8187-233164c645d7/n2yqo67dnS.lottie"
                                            loop
                                            autoplay
                                            style={{ height: "350px" }}
                                        />
                                        <h2>You haven't created any gigs yet</h2>
                                        <p>
                                            Start by creating your first gig and begin selling your services.
                                        </p>

                                        <Link to="/create-gig" className="create-first-gig-btn">
                                            Create your first gig
                                        </Link>
                                    </div>
                                    :
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Cover-Img</th>
                                                <th>Gig</th>
                                                <th>Price</th>
                                                <th>Orders</th>
                                                <th>Status</th>
                                                <th>Edit</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {userGigs.map((gig) => (
                                                <tr key={gig._id}>
                                                    <td>
                                                        <div className="gig-img">
                                                            <img src={gig.coverImageURL} alt="" />
                                                        </div>
                                                    </td>
                                                    <td>{gig.title}</td>
                                                    <td>{gig.price}</td>
                                                    <td>{gig.orders}</td>
                                                    <td>
                                                        <div className={gig.isPublished ? "p" : "np"}>
                                                            {gig.isPublished ? "Published" : "Unpublished"}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Link to={`/create-gig/${gig._id}`} className='link'>
                                                            <FontAwesomeIcon icon="fa-solid fa-pen" />
                                                        </Link>
                                                    </td>
                                                    <td>
                                                        <button className={gig.isPublished ? "gig-state-button published" : "gig-state-button draft"} onClick={() => toggleGigPublishState(gig._id, gig.isPublished)}>
                                                            {gig.isPublished ? "Revoke" : "Publish"}
                                                        </button>
                                                        <button className='delete-button' onClick={() => deleteGigHandler(gig._id)}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                            }
                        </div>
                    </div>
            }
        </>
    )
}

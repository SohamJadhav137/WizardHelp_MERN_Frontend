import React, { useEffect, useState } from 'react'

import './MyGig.scss'
import { gigs } from '../../Data/GigsData'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Swal from 'sweetalert2';

export default function MyGig() {

    const [userGigs, setUserGigs] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(() => {

        const fetchUserGigs = async () => {
            try {
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
            cancelButtonText: "Cancel"
        })

        if(!result.isConfirmed) return;
        
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
                    icon: "success"
                });
            }
            else {
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
                    icon: "warning"
                });
            }
            else {
                throw new Error("Failed to update gig's state:", response.status);
            }
        } catch (error) {
            console.error("Some FRONTEND error occured while updating gig's state\nError:", error);
        }
    }

    return (
        <>
            <div className='header'>
                <div className="header-container">
                    <div className="my-gigs-title">
                        <span>My Gigs</span>
                    </div>
                    <div>
                        <button className="add-gig-button">
                            <Link to='/create-gig' className='link'>Create New Gig</Link>
                        </button>
                    </div>
                </div>
            </div>
            <div className="gigs-table">
                <div className="gigs-table-container">
                    <table>
                        <thead>
                            <tr>
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
                </div>
            </div>
        </>
    )
}

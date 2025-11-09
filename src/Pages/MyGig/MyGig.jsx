import React, { useEffect, useState } from 'react'

import './MyGig.scss'
import { gigs } from '../../Data/GigsData'

export default function MyGig() {

    const [userGigs, setUserGigs] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(() => {
        
        const fetchUserGigs = async () => {
            try{
                const response = await fetch('http://localhost:5000/api/gigs/my-gigs', {
                    headers: { Authorization: `Bearer ${token}` }
                })
    
                if(response.ok){
                    const data = await response.json();
                    setUserGigs(data);
                }
                else{
                    throw new Error("Error in fetching gigs:", response.status);
                }
            } catch (error) {
                console.error("CUSTOM ERROR in fetching user gigs:",error);
            }
        }

        fetchUserGigs();

    }, []);
    return (
        <>
            <div className='header'>
                <div className="header-container">
                    <div className="my-gigs-title">
                        <span>My Gigs</span>
                    </div>
                    <div>
                        <button className="add-gig-button">Create New Gig</button>
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
                                        <div className={gig.status === "Published" ? "p" : "np"}>
                                            {gig.status}
                                        </div>
                                    </td>
                                    <td>
                                        <button className='revoke-button'>Revoke</button>
                                        <button className='delete-button'>Delete</button>
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

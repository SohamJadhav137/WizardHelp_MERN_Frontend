import React from 'react'

import './MyGig.scss'
import { gigs } from '../../Data/GigsData'

export default function MyGig() {
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
                            {gigs.map((gig) => (
                                <tr key={gig.id}>
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
                            {/* <tr>
                                <td>Front-end website</td>
                                <td>1000</td>
                                <td>0</td>
                                <td><div className="p">Published</div></td>
                                <td>
                                    <button className='revoke-button'>Revoke</button>
                                    <button className='delete-button'>Delete</button>
                                </td>
                            </tr>
                            <tr>
                                <td>End to end authenticated app</td>
                                <td>15000</td>
                                <td>-</td>
                                <td><div className="np">Unpublished</div></td>
                                <td>
                                    <button className='revoke-button'>Revoke</button>
                                    <button className='delete-button'>Delete</button>
                                </td>
                            </tr>
                            <tr>
                                <td>Front-end website</td>
                                <td>1000</td>
                                <td>0</td>
                                <td><div className="p">Published</div></td>
                                <td>
                                    <button className='revoke-button'>Revoke</button>
                                    <button className='delete-button'>Delete</button>
                                </td>
                            </tr> */}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

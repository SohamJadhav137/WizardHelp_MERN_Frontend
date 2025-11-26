import React, { useContext, useEffect, useState } from 'react'
import './Profile.scss';
import { AuthContext } from '../../context/AuthContext';
import { Rating } from '@mui/material';
import { getCurrentUser } from '../../utils/getCurrentUser';

export default function Profile() {
    const { user } = useContext(AuthContext);
    const [profilePhoto, setProfilePhoto] = useState(false);
    const [userInfo, setUser] = useState(null);

    // const username = userInfo?.username;
    const country = userInfo?.country;
    let rating = userInfo?.rating;
    // let language = [...userInfo?.language];
    // let skills = [...userInfo?.skills];

    const userDetails = getCurrentUser();
    const userId = userDetails.id;
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchUserRating = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/user/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
                else {
                    console.error("Failed to fetch user details:", res.status);
                }
                
            } catch (error) {
                console.error("Some error occured:", error);
            }
        };

        fetchUserRating();
    }, [userId]);

    console.log(userInfo);

    return (
        <div className='profile-container'>
            <div className="profile-title-container">
                <div className="profile-title">
                    My Profile
                </div>
            </div>

            <div className="profile-contents-container">
                <div className="profile-contents">

                    <div className="profile-info">
                        <table>
                            <tbody>
                                <tr>
                                    <td><span className='profile-attr'>Name:</span></td>
                                    <td>{user.name}</td>
                                </tr>
                                <tr>
                                    <td><span className='profile-attr'>Country:</span></td>
                                    <td>{userInfo?.country}</td>
                                </tr>
                                <tr>
                                    <td><span className='profile-attr'>Languages:</span></td>
                                    {/* <td>{userInfo.languages}</td> */}
                                </tr>
                                <tr>
                                    <td><span className='profile-attr'>Expertise:</span></td>
                                    {/* <td>{userInfo.skills}</td> */}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="profile-photo">
                        <div className="photo">
                            <img src="./user.png" alt="" />
                        </div>
                        <div className="profile-star-rating">
                            {userInfo?.rating} <Rating name="read-only" value={userInfo?.rating ?? 0} readOnly /> ({userInfo?.ratingCount})
                        </div>
                        <div className="joined-from">
                            Since, {new Date(userInfo?.createdAt).toLocaleDateString('en-us', {month: 'short', year:'numeric'})}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import './Profile.scss';
import { AuthContext } from '../../context/AuthContext';
import { Rating } from '@mui/material';
import { getCurrentUser } from '../../utils/getCurrentUser';
import GigCard from '../../Components/Gigs/GigCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate, useParams } from 'react-router-dom';
import useClickOutside from '../../customHooks/useClickOutside';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import API_BASE_URL from '../../utils/api';
import Swal from 'sweetalert2';

export default function Profile() {

    const { id } = useParams();

    const { user, login, updateUser } = useContext(AuthContext);
    const [profilePhoto, setProfilePhoto] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [activeGigs, setActiveGigs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [favGigs, setFavGigs] = useState([]);
    const [isPicMenuOpen, setIsPicMenuOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const menuRef = useRef(null)
    useClickOutside(menuRef, () => {
        if (isPicMenuOpen) setIsPicMenuOpen(false);
    });

    const togglePicMenu = () => {
        setIsPicMenuOpen(!isPicMenuOpen)
    }

    const navigate = useNavigate();

    const userDetails = getCurrentUser();
    let targetUserId = null;
    let currentUserId;
    const token = localStorage.getItem("token");

    if(!userDetails){
        targetUserId = id;
    }
    else{
        currentUserId = userDetails.id;
    }

    if (id)
        targetUserId = id;
    else
        targetUserId = currentUserId;

    // Fetch user rating & number of reviews
    useEffect(() => {
        const fetchUserRating = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/user/${targetUserId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setUserInfo(data.user);
                }
                else {
                    console.error("Failed to fetch user details:", res.status);
                }

            } catch (error) {
                console.error("Some error occured:", error);
            }
        };

        fetchUserRating();
    }, [targetUserId, profilePhoto]);

    // Fetch seller's active gigs
    useEffect(() => {
        const fetchActiveGigs = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/user/${targetUserId}/active-gigs`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }); targetUserId

                if (res.ok) {
                    const data = await res.json();
                    setActiveGigs(data);

                }
                else {
                    console.error("Failed to fetch seller active-gigs:", res.status);
                }
            } catch (error) {
                console.error("Catch block error:", error);
            }
        }

        fetchActiveGigs();
    }, [targetUserId, profilePhoto]);

    const uploadToS3 = async (file, token) => {
        const response = await fetch(`${API_BASE_URL}/api/upload/presign?fileName=${file.name}&fileType=${file.type}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Presigne URL request failed!" }))
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

    const deleteFromS3 = useCallback(async (url, token) => {
        if (!url) {
            console.warn("No url provided!");
            return true;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/s3/delete-file-by-url`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ fileURL: url })
            })

            if (!response.ok) {
                console.error("Failed to delete file from s3:\n", response.status);
            }
        } catch (error) {
            console.error("Some error during file deletion from s3:\n", error);
            throw error;
        }
    }, []);

    const removeProfilePhoto = async () => {

        setIsPicMenuOpen(false);

        try {
            const url = userInfo?.profilePic;

            if (!url) {
                console.warn("No profile pic to delete!");
                return;
            }

            setIsUploading(true);

            await deleteFromS3(url, token);

            const res = await fetch(`${API_BASE_URL}/api/user/${targetUserId}/remove-profile-photo`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            })

            if (res.ok) {
                setProfilePhoto(null);
                updateUser({ profilePic: null });
                setUserInfo(prev => ({ ...prev, profilePic: null }));
            }
            else {
                console.error("Failed to remove profile photo");
            }
        } catch (error) {
            console.error("Some error occured:", error);
        } finally {
            setIsUploading(false);
        }
    }

    const uploadProfilePhoto = async (event) => {

        setIsPicMenuOpen(false);

        try {
            const existingProfilePic = userInfo?.profilePic;
            if (existingProfilePic) {
                try {
                    await removeProfilePhoto();
                } catch (error) {
                    console.error("Some error occured:", error);
                    alert("Failed to delete existing profile photo!");
                    return;
                }
            }

            const file = event.target.files[0];

            if (!file) return;

            if (!file.type.startsWith('image/')) { alert('Only image is allowed'); event.target.value = null; return; }
            if (file.size > 5 * 1024 * 1024) { alert('Image limit is 5MB!'); event.target.value = null; return; }


            setIsUploading(true);

            const reader = new FileReader();

            reader.onload = async (e) => {
                const newFile = {
                    id: Date.now(),
                    name: file.name,
                    dataUrl: e.target.result,
                    originalFile: file
                };
                setProfilePhoto(newFile.dataUrl);
                console.log("Profile photo before upload:\n", userInfo?.profilePic);
            };

            reader.readAsDataURL(file);

            const finalImageUrl = await uploadToS3(file, token);

            const saveImage = await fetch(`${API_BASE_URL}/api/user/${targetUserId}/save-profile-photo`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ profilePic: finalImageUrl })
            });

            if (saveImage.ok) {

                updateUser({ profilePic: finalImageUrl });
                setUserInfo(prev => ({ ...prev, profilePic: finalImageUrl }));
                setProfilePhoto(prev => ({ ...(prev || {}), imageUrl: finalImageUrl }));
                console.log("Profile photo after upload:\n", userInfo?.profilePic);
            }
            else {
                console.error("Error in saving profile photo:", saveImage.status);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to upload profile photo'
                });
            }
        } catch (error) {
            console.error("Some error occured:", error);
            Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Image upload failed!'
                });
        } finally {
            setIsUploading(false);
            event.target.value = null;
        }
    }

    return (
        <div className='profile-container'>

            <div className="profile-title-container">
                <div className="profile-title">
                    <div>
                        {currentUserId === userInfo?._id ? 'My' : `${userInfo?.username}'s`} Profile
                    </div>

                    {
                        currentUserId === userInfo?._id &&
                        <div className='profile-title-edit-button'>
                            <button onClick={() => navigate('/my-profile/edit')}>Edit <FontAwesomeIcon icon="fa-solid fa-pen" /></button>
                        </div>
                    }
                </div>
            </div>

            {/* PROFILE INFO */}
            <div className="profile-contents-container">
                <div className="profile-contents">
                    <div className="profile-info">
                        <table>
                            <tbody>
                                <tr>
                                    <td><span className='profile-attr'><FontAwesomeIcon icon="fa-solid fa-user" style={{ color: "#ffffff", }} /> Name:</span></td>
                                    <td>{userInfo?.username}</td>
                                </tr>
                                <tr>
                                    <td><span className='profile-attr'><FontAwesomeIcon icon="fa-solid fa-globe" /> Country:</span></td>
                                    <td>{userInfo?.country}</td>
                                </tr>
                                <tr>
                                    <td><span className='profile-attr'><FontAwesomeIcon icon="fa-solid fa-language" /> Languages:</span></td>
                                    <td>
                                        <div className="languages">
                                            {userInfo?.languages.map((l, index) => (

                                                <div className="lang" key={index}>
                                                    {l}{index !== userInfo?.languages.length - 1 && '/'}
                                                </div>
                                            ))}
                                        </div>
                                    </td>

                                </tr>
                                {
                                    userInfo?.role === 'seller' &&
                                    <tr>
                                        <td><span className='profile-attr'><FontAwesomeIcon icon="fa-solid fa-paintbrush" /> Skills:</span></td>
                                        <td>
                                            <div className="skills">
                                                {userInfo?.skills.map((l, index) => (
                                                    <div key={index}>
                                                        {l}{index !== userInfo?.skills.length - 1 && ','}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className="profile-photo">
                        <div className="photo">
                            {
                                isUploading ?
                                    <>
                                        <img src="./loading_icon2.gif" alt="" className='loading-gif-overlay' />
                                        <img src={userInfo?.profilePic || "/user.png"} alt="" />
                                    </>
                                    :
                                    userInfo?.profilePic ?
                                        <img src={userInfo?.profilePic} alt="" />
                                        :
                                        <img src="/user.png" />
                            }
                        </div>
                        <div className="profile-star-rating">
                            {userInfo?.rating} <Rating name="read-only" value={userInfo?.rating ?? 0} readOnly /> ({userInfo?.ratingCount})
                        </div>
                        <div className="joined-from">
                            Member Since, {new Date(userInfo?.createdAt).toLocaleDateString('en-us', { month: 'short', year: 'numeric' })}
                        </div>
                        {
                            currentUserId === userInfo?._id &&
                            <div className="profile-photo-edit" ref={menuRef}>
                                {/* <FontAwesomeIcon icon="fa-solid fa-camera" /> */}
                                <button onClick={togglePicMenu}>
                                    <FontAwesomeIcon icon="fa-solid fa-ellipsis-vertical" />
                                </button>
                                {
                                    isPicMenuOpen &&
                                    <div className="pic-menu" >
                                        <input type="file" id="file" className="hidden" onChange={uploadProfilePhoto} accept='image/*' disabled={isUploading} />
                                        <label htmlFor="file" className='pic-menu-item'>Upload photo <FontAwesomeIcon icon="fa-solid fa-upload" /> </label>
                                        <button className='pic-menu-item' onClick={removeProfilePhoto}>Remove photo <FontAwesomeIcon icon="fa-solid fa-trash" /></button>
                                    </div>
                                }
                            </div>
                        }
                    </div>
                </div>
            </div>

            {/* SELLER ACTIVE GIGS */}
            {
                userInfo?.role === 'seller' &&
                <div className="active-gigs-container">
                    <div className="active-gigs">
                        <div className="active-gigs-title">
                            {currentUserId === userInfo?._id ? 'My' : `${userInfo.username}'s`} Active Gigs:
                        </div>

                        <div className="active-gigs-display">
                            {
                                loading ?
                                    (
                                        <p>Loading seller's gigs...</p>
                                    )
                                    :
                                    activeGigs.length === 0 ?

                                        <div className='empty-active-gigs'>
                                            No active gigs at the moment...
                                        </div>
                                        :
                                        activeGigs?.map((gig) => (
                                            <GigCard key={gig._id} gig={gig} />
                                        ))
                            }
                        </div>
                    </div>
                </div>
            }

            {/* {
                user.role === 'buyer' &&
                <div className="fav-gigs-container">
                    <div className="fav-gigs">
                        <div className="fav-gigs-title">
                            {userId ===  userInfo?._id ? 'My' : `${user.name}'s` } Favourite Gigs:
                        </div>

                        <div className="fav-gigs-display">
                            {
                                loading ?
                                    (
                                        <p>Loading gigs...</p>
                                    )
                                    :
                                    favGigs ?
                                    <div className="empty-fav-gigs">
                                        No Gigs added yet...
                                    </div>
                                    :
                                    activeGigs?.map((gig) => (
                                        <GigCard key={gig._id} gig={gig} />
                                    ))
                            }
                        </div>
                    </div>
                </div>
            } */}
        </div>
    )
}

import React, { useCallback, useEffect, useRef, useState } from 'react'

import './CreateGig.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faS } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { extractFileNameFromURL } from '../../utils/extractFileName';
import Swal from 'sweetalert2';
import { Info, MoveRight } from 'lucide-react';
import createGigLabels from '../../Data/CreateGigLabels';

const formatBytesToSize = (bytes) => {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i == 0) return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

export default function CreateGig() {

    const { gigId } = useParams();

    const sellerDetails = JSON.parse(localStorage.getItem("user"));
    const sellerName = sellerDetails.username;

    const [formData, setFormData] = useState({
        sellerName,
        title: '',
        description: '',
        category: '',
        tags: [],
        imageURLs: [],
        videoURL: null,
        docURLs: [],
        price: '',
        deliveryDays: '',
        revisions: '',
        isPublished: false
    });

    const [tagInput, setTagInput] = useState('');

    const [gigPublishStatus, setGigPublishStatus] = useState(false);

    const videoInputRef = useRef(null);
    const textareaRef = useRef(null);

    const MAX_CHARS = 1200;

    const handleDescriptionChange = (e) => {
        const value = e.target.value;

        if (value.length > MAX_CHARS) return;

        setFormData((prev) => ({
            ...prev,
            description: value,
        }));
    };

    const makeBold = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        if (start === end) return;

        const selected = formData.description.slice(start, end);

        const updated =
            formData.description.slice(0, start) +
            `**${selected}**` +
            formData.description.slice(end);

        setFormData((prev) => ({
            ...prev,
            description: updated,
        }));
    };

    const navigate = useNavigate();

    // UseEffect to fetch gigs for editing
    useEffect(() => {
        if (gigId) {
            const token = localStorage.getItem("token");
            const fetchExisitingGig = async () => {

                try {
                    const response = await fetch(`http://localhost:5000/api/gigs/${gigId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.ok) {
                        const { gig } = await response.json();
                        const data = gig;

                        setFormData({
                            title: data.title,
                            description: data.description,
                            category: data.category,
                            tags: data.tags,
                            imageURLs: data.imageURLs || [],
                            videoURL: data.videoURL || null,
                            docURLs: data.docURLs || [],
                            price: data.price,
                            deliveryDays: data.deliveryDays,
                            revisions: data.revisions
                        });
                        setTagInput('');

                        const existingImages = (data.imageURLs || []).map(url => ({
                            id: url,
                            name: extractFileNameFromURL(url),
                            type: 'image/',
                            size: 0,
                            dataURL: url
                        }))
                        setSelectedImage(existingImages);

                        if (data.videoURL) {
                            setSelectedVideo({
                                id: data.videoURL,
                                name: extractFileNameFromURL(data.videoURL),
                                type: 'video/',
                                size: 0,
                                dataURL: data.videoURL
                            });
                        }
                        else {
                            setSelectedVideo(null);
                        }
                    }
                    else {
                        console.error("Failed to fetch gig:", response.status);
                    }
                } catch (error) {
                    console.error("Frontend Error:", error);
                }
            };

            fetchExisitingGig();
        }
    }, [gigId]);

    const keyDownHandlers = (e) => {
        if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();

            const newTag = tagInput.trim().toLowerCase();

            if (newTag && !formData.tags.includes(newTag)) {
                setFormData({ ...formData, tags: [...formData.tags, newTag] });
                setTagInput('');
            }
        }
    };

    const submitKeyHandler = (e) => {
        if (e.key === 'Enter')
            e.preventDefault();
    }

    const deleteTagHandler = (tagToDelete) => {
        setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToDelete) });
    };

    const changeHandler = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const [selectedImage, setSelectedImage] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        console.log("Updated selectedImage:", selectedImage);
    }, [selectedImage]);

    const [deletedImageURLs, setDeletedImageURLs] = useState([]);

    const deleteFromS3 = useCallback(async (url, token) => {
        try {
            const response = await fetch("http://localhost:5000/api/s3/delete-file", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ fileUrl: url })
            })

            if (!response.ok) {
                console.error("Failed to delete file from s3:\n", response.status);
            }
        } catch (error) {
            console.error("Some error during file deletion from s3:\n", error);
        }
    }, []);

    const imageDeleteHandler = (fileId) => {
        const fileToDelete = selectedImage.find(file => file.id === fileId);
        if (fileToDelete && !fileToDelete.originalFile) {
            setDeletedImageURLs(prev => [...prev, fileToDelete.dataURL]);
        }
        setSelectedImage(prev => prev.filter(file => file.id !== fileId));
    }

    const videoDeleteHandler = () => {
        if (selectedVideo) {
            setSelectedVideo(null)
        }
        if (videoInputRef.current) {
            videoInputRef.current.value = null;
        }
    }

    const uploadImageHandler = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);

        const reader = new FileReader();

        reader.onload = (e) => {
            const newFile = {
                id: Date.now(),
                name: file.name,
                type: file.type,
                size: file.size,
                dataURL: e.target.result,
                originalFile: file
            };

            setSelectedImage(prev => [...prev, newFile]);
            setIsUploading(false);
        };

        reader.readAsDataURL(file);

        event.target.value = null;
    }

    const uploadVideoHandler = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);

        const reader = new FileReader();

        reader.onload = (e) => {
            const newFile = {
                id: Date.now(),
                name: file.name,
                type: file.type,
                size: file.size,
                dataURL: e.target.result,
                originalFile: file
            };

            setSelectedVideo(newFile);
            setIsUploading(false);
        };

        reader.readAsDataURL(file);

        event.target.value = null;
    }

    const FilePreview = ({ file }) => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (isImage) {
            return (
                <img src={file.dataURL} alt={file.name} />
            )
        }
        else if (isVideo) {
            return (
                <div className='video_icon'>
                    <FontAwesomeIcon icon="fa-solid fa-video" />
                </div>
            )
        }
    }

    const uploadToS3 = async (file, token) => {
        console.log("FILE UPLOADED TO S3:\n", file);
        const response = await fetch(`http://localhost:5000/api/upload/presign?fileName=${file.name}&fileType=${file.type}`, {
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

    let errors = ['Title is empty'];

    const validateForm = () => {
        const { title, category, description, imageURLs, price, deliveryDays, revisions } = formData

        if (!title.trim()) errors.push("Title field is empty!");
        if (!category || category === '') errors.push("Category is required!")
        if (!description.trim()) errors.push("Description is empty!");
        if (selectedImage.length === 0) errors.push("Atleast one image is required!");
        if (!price || isNaN(price) || price < 0) errors.push("Enter valid price!");
        if (!deliveryDays || isNaN(deliveryDays) || deliveryDays < 0) errors.push("Enter valid number for days!");
        if (!revisions || isNaN(revisions) || revisions < 0) errors.push("Enter valid number for revisions!");

        console.log("Form errors:", errors)

        if (errors.length > 0)
            return false;

        return true;
    }

    const gigStateSubmissionHandler = (shouldPublish) => {
        setGigPublishStatus(shouldPublish);
    };

    const formSubmitHandler = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        Swal.fire({
            title: "Creating Your Gig...",
            text: "Please wait a while.",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        const token = localStorage.getItem("token");

        let uploadImageUrls = [];

        for (const img of selectedImage) {
            try {
                const url = await uploadToS3(img.originalFile, token);
                uploadImageUrls.push(url);
            } catch (error) {
                Swal.fire({
                    title: "Upload Error",
                    text: "Failed to upload image!",
                    icon: "error"
                });
                console.error(error)
                return;
            }
        }

        let uploadVideoUrl = null

        if (selectedVideo) {
            try {
                uploadVideoUrl = await uploadToS3(selectedVideo.originalFile, token);
            } catch (error) {
                Swal.fire({
                    title: "Upload Error",
                    text: "Failed to upload video!",
                    icon: "error"
                });
                console.error(error);
                return;
            }
        }

        const finalFormData = {
            ...formData,
            imageURLs: uploadImageUrls,
            videoURL: uploadVideoUrl,
            isPublished: gigPublishStatus
        };

        // console.log("FINAL FORM DATA before sending:\n",finalFormData);

        const response = await fetch('http://localhost:5000/api/gigs', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(finalFormData)
        })

        const responseData = await response.json().catch(e => {
            console.error("Failed to parse JSON response:", e);
            return { message: "An unknown error occured (received non-JSON response)" };
        })

        if (response.ok) {
            Swal.fire({
                title: "Gig Created!",
                text: "Your gig was saved to My Gigs",
                icon: "success",
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title'
                },
            });

            navigate('/my-gigs');

            console.log("Created gigd:", responseData);
        }
        else {
            Swal.fire({
                title: "Gig Creation Error!",
                text: "Failed to create your gig",
                icon: "error",
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title'
                },
            });
        }
    }

    const formUpdateHandler = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const token = localStorage.getItem("token");

        try {
            await Promise.all(deletedImageURLs.map(url => deleteFromS3(url, token)));

            let uploadImageUrls = [];

            for (const img of selectedImage) {
                if (img.originalFile) {
                    try {
                        const url = await uploadToS3(img.originalFile, token);
                        uploadImageUrls.push(url);
                    } catch (error) {
                        Swal.fire({
                            title: "Upload Error",
                            text: "Failed to upload image!",
                            icon: "error",
                            customClass: {
                                popup: 'swal-custom-popup',
                                title: 'swal-custom-title'
                            },
                        });
                        console.error(error);
                        return;
                    }
                } else if (img.dataURL) {
                    uploadImageUrls.push(img.dataURL);
                }
            }

            let uploadVideoUrl = null
            if (selectedVideo) {
                if (selectedVideo.originalFile) {
                    try {
                        uploadVideoUrl = await uploadToS3(selectedVideo.originalFile, token);
                    } catch (error) {
                        Swal.fire({
                            title: "Upload Error",
                            text: "Failed to upload video!",
                            icon: "error",
                            customClass: {
                                popup: 'swal-custom-popup',
                                title: 'swal-custom-title'
                            },
                        });
                        console.error(error);
                        return;
                    }
                } else if (selectedVideo.dataURL) {
                    uploadVideoUrl = selectedVideo.dataURL;
                }
            }

            // let uploadDocUrls = [];
            // for (const doc of formData.docURLs) {
            //     const url = await uploadToS3(doc, token);
            //     uploadDocUrls.push(url);
            // }

            const finalFormData = {
                ...formData,
                imageURLs: uploadImageUrls,
                videoURL: uploadVideoUrl
            }

            const response = await fetch(`http://localhost:5000/api/gigs/${gigId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(finalFormData)
            })

            const responseData = await response.json().catch(e => {
                console.error("Failed to parse JSON response:", e);
                return { message: "An unknown error occured (received non-JSON response)" };
            })

            // console.log("RESPONSE DATA:\n",responseData);

            if (response.ok) {
                // const newGig = await response.json();
                Swal.fire({
                    title: "Gig Edited!",
                    text: "Gig updated with new values",
                    icon: "success",
                    customClass: {
                        popup: 'swal-custom-popup',
                        title: 'swal-custom-title'
                    },
                });
                console.log("Updated gigd:", responseData);
                setDeletedImageURLs([]);
                navigate('/my-gigs');
            }
            else {
                Swal.fire({
                    title: "Gig Edit Failed!",
                    text: "Some error occured while updating gig",
                    icon: "error",
                    customClass: {
                        popup: 'swal-custom-popup',
                        title: 'swal-custom-title'
                    },
                });
            }
        } catch (error) {
            console.error("Gig submission error:\n", error);
        }
    }

    const [step, setStep] = useState(1);
    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);
    const [gigStepLabel, setGigStepLabel] = useState(createGigLabels[0]);

    return (
        <div className='create-gig-container' onKeyDown={submitKeyHandler}>
            <form className="create-gig" onSubmit={gigId ? formUpdateHandler : formSubmitHandler}>
                <div className='main-heading'>{gigId ? "Edit your gig" : "Create your gig"}</div>

                <div className="phase-wrapper">
                    <div className="phase-item">
                        <div className='sub-heading'>Step {step} of {createGigLabels.length} - {gigStepLabel}</div>
                        <div className={`error-msg ${errors.length === 0 ? 'hidden' : ''}`}>
                            {
                                errors.length !== 0 &&
                                errors[0]
                            }
                        </div>
                        {
                            step === 1 &&
                            <div className="form-container">
                                <label htmlFor="gig-title">Title</label>
                                <div className="input-wrapper">
                                    <input type="text" name='title' id='gig-title' value={formData.title} onChange={changeHandler} placeholder="I'll develop this as per your requirements..." />
                                </div>
                            </div>
                            // <table>
                            //     <tbody>
                            //         <tr>
                            //             <td>
                            //                 <label htmlFor="gig-title" className='label-item'>Title</label>
                            //             </td>
                            //             <td>
                            //                 <input type="text" id="gig-title" name='title' onChange={changeHandler} value={formData.title} placeholder="I'll develop this as per your requirements..." />
                            //             </td>
                            //         </tr>
                            //         <tr>
                            //             <td>
                            //                 <label htmlFor="gig-category" className='label-item'>Category</label>
                            //             </td>
                            //             <td>
                            //                 <select id="gig-category" name='category' onChange={changeHandler} value={formData.category}>
                            //                     <option value="" disabled>Select a category</option>
                            //                     <option value="Software Development">Software Development</option>
                            //                     <option value="Video Editing">Video Editing</option>
                            //                     <option value="Writing & Translation">Writing & Translation</option>
                            //                     <option value="Finance">Finance</option>
                            //                     <option value="Digital Marketing">Digital Marketing</option>
                            //                     <option value="Data Analytics">Data Analytics</option>
                            //                     <option value="Music & Audio">Music & Audio</option>
                            //                 </select>
                            //             </td>
                            //         </tr>

                            //         <tr>
                            //             <td>
                            //                 <label htmlFor="gig-tags" className='label-item'>Tags</label>
                            //             </td>
                            //             <td>
                            //                 <div className="gig-tags">
                            //                     {formData.tags.map((tag, index) => (
                            //                         <div key={index} className='tag-pill' onClick={() => deleteTagHandler(tag)}>
                            //                             {tag} &times;
                            //                         </div>
                            //                     ))}
                            //                 </div>
                            //                 <input type="text" id="gig-tags" className='label-title' onChange={(e) => setTagInput(e.target.value)} value={tagInput} onKeyDown={keyDownHandlers} placeholder='Type a tag and hit enter' />
                            //             </td>
                            //         </tr>

                            //         <tr >
                            //             <td colSpan={2} className='action-buttons'>
                            //                 <button className='next-btn' type='button' onClick={nextStep}>Next</button>
                            //             </td>
                            //         </tr>
                            //     </tbody>
                            // </table>
                        }

                        {
                            step === 2 &&
                            <table>
                                <tbody>
                                    <tr>
                                        <td>
                                            <label htmlFor="gig-desc" className='label-item'>Description</label>
                                        </td>
                                        <td>
                                            <div className="gig-description">
                                                <div className="gig-desc-header">
                                                    <div className="left">
                                                        <div className="info"><FontAwesomeIcon icon="fa-solid fa-circle-info" /> Select text and click</div>
                                                        <button type="button" onClick={makeBold} title='Bold' className='bold-text-button'>
                                                            B
                                                        </button>
                                                    </div>
                                                    <div className="right">

                                                        <div className="char-count">
                                                            {formData.description.length}/{MAX_CHARS}
                                                        </div>
                                                    </div>
                                                </div>
                                                <textarea ref={textareaRef} maxLength={MAX_CHARS} name="description" id="gig-desc" className='desc' onChange={handleDescriptionChange} value={formData.description} placeholder='Explain your gig in detail...'></textarea>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr >
                                        <td colSpan={2} className='action-buttons'>
                                            <button className='next-btn' type='button' onClick={prevStep}>Previous</button>
                                            <button className='next-btn' type='button' onClick={nextStep}>Next</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        }

                        {
                            step === 3 &&
                            <table>
                                <tbody>
                                    <tr>
                                        <td>
                                            <label htmlFor="gig-images" className='label-item'>Images</label>
                                        </td>
                                        <td>
                                            <input type="file" id='gig-images' onChange={uploadImageHandler} accept='image/*' disabled={isUploading} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            <div className='file-preview-container'>
                                                {
                                                    isUploading && (
                                                        <span>Loading File Preview</span>
                                                    )
                                                }

                                                <div className='file-preview'>
                                                    {
                                                        selectedImage.length === 0 ?
                                                            (
                                                                <span>No files uploaded yet</span>
                                                            )
                                                            :
                                                            (
                                                                selectedImage.map(file => (
                                                                    <div key={file.id} className='file'>
                                                                        <FilePreview file={file} />
                                                                        <div>
                                                                            <span title={file.name}>{file.name}</span>
                                                                            <br />
                                                                            <span>{formatBytesToSize(file.size)}</span>
                                                                        </div>

                                                                        <button onClick={() => imageDeleteHandler(file.id)}>
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
                                            <label htmlFor="gig-video" className='label-item'>Video</label>
                                        </td>
                                        <td>
                                            <input type="file" id='gig-video' onChange={uploadVideoHandler} accept='video/*' ref={videoInputRef} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            <div className='file-preview-container'>
                                                {
                                                    isUploading && (
                                                        <span>Loading File Preview</span>
                                                    )
                                                }

                                                <div className='file-preview'>
                                                    {
                                                        selectedVideo ?
                                                            (
                                                                <div key={selectedVideo.id} className='file'>
                                                                    <FilePreview file={selectedVideo} />
                                                                    <div>
                                                                        <span title={selectedVideo.name}>{selectedVideo.name}</span>
                                                                        <br />
                                                                        <span>{formatBytesToSize(selectedVideo.size)}</span>
                                                                    </div>

                                                                    <button onClick={() => videoDeleteHandler(selectedVideo.id)}>
                                                                        <FontAwesomeIcon icon="fa-solid fa-trash" />
                                                                    </button>
                                                                </div>
                                                            )
                                                            :
                                                            (
                                                                <span>No files uploaded yet</span>
                                                            )
                                                    }
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr >
                                        <td colSpan={2} className='action-buttons'>
                                            <button className='next-btn' type='button' onClick={prevStep}>Previous</button>
                                            <button className='next-btn' type='button' onClick={nextStep}>Next</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        }

                        {
                            step === 4 &&
                            <table>
                                <tbody>
                                    <tr>
                                        <td>
                                            <label htmlFor="gig-price" className='label-item'>Pricing & Scope</label>
                                        </td>
                                        <td>
                                            <input name='price' type="text" id="gig-price" onChange={changeHandler} value={formData.price} placeholder='Price will be set in Rupees(₹)' />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label htmlFor="gig-delivery-days" className='label-item'>Delivery in</label>
                                        </td>
                                        <td>
                                            <input name='deliveryDays' type="text" id="gig-delivery-days" onChange={changeHandler} value={formData.deliveryDays} placeholder='Specify in terms of day(s)' />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label htmlFor="gig-revisions" className='label-item'>Revisions</label>
                                        </td>
                                        <td>
                                            <input name='revisions' type="text" id="gig-revisions" onChange={changeHandler} value={formData.revisions} placeholder='Number of modifications allowed' />
                                        </td>
                                    </tr>
                                    <tr >
                                        <td colSpan={2} className='action-buttons'>
                                            <button className='next-btn' type='button' onClick={prevStep}>Previous</button>
                                            <button className='next-btn' type='button' onClick={nextStep}>Next</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        }

                        {
                            step === 5 &&
                            <table>
                                <tbody>
                                    <tr>
                                        <td>
                                            <span className='label-item'>Final actions</span>
                                        </td>
                                        <td>
                                            {
                                                gigId ?
                                                    <>
                                                        <button className='gig-draft-btn' type="button" onClick={() => navigate('/my-gigs')} >Cancel</button>
                                                        <button className='gig-publish-btn' type='submit'>Finish Edit</button>
                                                    </>
                                                    :
                                                    <>
                                                        <button className='gig-draft-btn' type='submit' onClick={() => gigStateSubmissionHandler(false)}>Create Gig (Draft)</button>
                                                        <button className='gig-publish-btn' type='submit' onClick={() => gigStateSubmissionHandler(true)}>Create & Publish Gig</button>
                                                    </>
                                            }
                                        </td>
                                    </tr>
                                    <tr >
                                        <td colSpan={2} className='action-buttons'>
                                            <button className='next-btn' type='button' onClick={prevStep}>Previous</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        }
                    </div>
                </div>
            </form>
        </div>
    )
}

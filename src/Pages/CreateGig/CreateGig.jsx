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
import { Check, ChevronDown, Globe, Info, MoveRight, Save, X } from 'lucide-react';
import createGigLabels from '../../Data/CreateGigLabels';
import gigCat from '../../Data/GigCat';
import { extractCleanFileName } from '../../utils/extractFileName2';

const formatBytesToSize = (bytes) => {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i == 0) return bytes + ' ' + sizes[i];
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

const MAX_IMAGE_COUNT = 5;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB

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
                            name: extractCleanFileName(url),
                            type: 'image/',
                            size: 0,
                            dataURL: url
                        }))
                        setSelectedImage(existingImages);

                        if (data.videoURL) {
                            setSelectedVideo({
                                id: data.videoURL,
                                name: extractCleanFileName(data.videoURL),
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

    // useEffect(() => {
    //     console.log("Updated selectedImage:", selectedImage);
    // }, [selectedImage]);

    const [deletedImageURLs, setDeletedImageURLs] = useState([]);

    const deleteFromS3 = useCallback(async (url, token) => {
        try {
            const response = await fetch("http://localhost:5000/api/s3/delete-file-by-url", {
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

        if (file.size > MAX_IMAGE_SIZE) {
            Swal.fire({
                icon: "error",
                title: "Image too large",
                text: "Each image must be under 2MB",
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title'
                }
            });
            return;
        }

        setIsUploading(true);

        if (selectedImage.length >= MAX_IMAGE_COUNT) {
            Swal.fire({
                icon: "warning",
                title: "Image upload limit reached",
                text: `You can upload only ${MAX_IMAGE_COUNT} images`,
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title'
                }
            });
            return;
        }

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

        if (file.size > MAX_VIDEO_SIZE) {
            Swal.fire({
                icon: "error",
                title: "Video too large",
                text: "Video must be under 10MB",
                customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title'
                }
            });
            return;
        }

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
        const response = await fetch(`http://localhost:5000/api/upload/presign?fileName=${file.name}&fileType=${file.type}&fileSize=${file.size}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Presigned URL request failed!" }));
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

    const [errors, setErrors] = useState([]);

    // const validateForm = () => {
    //     const { title, category, description, imageURLs, price, deliveryDays, revisions } = formData

    //     if (!title.trim()) errors.push("Title field is empty!");
    //     if (!category || category === '') errors.push("Category is required!")
    //     if (!description.trim()) errors.push("Description is empty!");
    //     if (selectedImage.length === 0) errors.push("Atleast one image is required!");
    //     if (!price || isNaN(price) || price < 0) errors.push("Enter valid price!");
    //     if (!deliveryDays || isNaN(deliveryDays) || deliveryDays < 0) errors.push("Enter valid number for days!");
    //     if (!revisions || isNaN(revisions) || revisions < 0) errors.push("Enter valid number for revisions!");

    //     console.log("Form errors:", errors)

    //     if (errors.length > 0)
    //         return false;

    //     return true;
    // }

    const gigStateSubmissionHandler = (shouldPublish) => {
        setGigPublishStatus(shouldPublish);
    };

    const formSubmitHandler = async (e) => {
        e.preventDefault();

        Swal.fire({
            title: "Creating Your Gig...",
            text: "Please wait a while.",
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title'
            },
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
                    icon: "error",
                    customClass: {
                        popup: 'swal-custom-popup',
                        title: 'swal-custom-title'
                    }
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
                    icon: "error",
                    customClass: {
                        popup: 'swal-custom-popup',
                        title: 'swal-custom-title'
                    }
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

        Swal.fire({
            title: "Applying changes...",
            text: "Please wait a while.",
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title'
            },
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

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

    const progressPercent = (step / createGigLabels.length) * 100;

    // Clear errors when moving to next step
    useEffect(() => {
        setErrors([]);
    }, [step]);

    const validateCreateGigForm = (currentStep) => {
        const newErrors = [];

        switch (currentStep) {
            case 1:
                if (!formData.title.trim()) {
                    newErrors.push("Title is required!");
                }

                if (!formData.category) {
                    newErrors.push("Category is required!");
                }
                break;

            case 2:
                if (!formData.description.trim()) {
                    newErrors.push("Description is required!");
                }

                if (formData.description.length < 50) {
                    newErrors.push("Description should be of at least 50 characters");
                }
                break;

            case 3:
                if (selectedImage.length === 0) {
                    newErrors.push("At least one image is required");
                }
                break;

            case 4:
                if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
                    newErrors.push("Enter a valid price");
                }

                if (!formData.deliveryDays || isNaN(formData.deliveryDays) || formData.deliveryDays <= 0) {
                    newErrors.push("Enter valid delivery days");
                }

                if (formData.revisions === '' || isNaN(formData.revisions) || Number(formData.revisions) < 0) {
                    newErrors.push("Enter valid number of revisions")
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
        return newErrors.length === 0;

    }

    const nextStep = () => {
        const isValid = validateCreateGigForm(step);
        if (!isValid) return;

        setStep(prev => prev + 1);
    }

    const prevStep = () => setStep(prev => prev - 1);
    const currentStep = createGigLabels[step - 1];

    return (
        <div className='create-gig-container' onKeyDown={submitKeyHandler}>
            <form className="create-gig" onSubmit={gigId ? formUpdateHandler : formSubmitHandler}>
                <div className='main-heading'>{gigId ? "Edit your gig" : "Create your gig"}</div>

                <div className="phase-wrapper">
                    <div className="phase-item">
                        <div className="phase-item-header">

                            <div className='sub-heading'>Step {step} of {createGigLabels.length} - {currentStep}</div>

                            <div className="progress-container">
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
                                </div>
                            </div>

                            <div className={`error-msg ${errors.length > 0 ? 'show' : ''}`}>
                                {errors[0]}
                            </div>
                        </div>

                        {/* GIG OVERVIEW */}
                        {
                            step === 1 &&
                            <>
                                <div className="form-container">
                                    <div className='input-field-wrapper'>
                                        <label htmlFor="gig-title" className='label-item'>Title</label>
                                        <input type="text" name='title' id='gig-title' value={formData.title} onChange={changeHandler} placeholder="I'll develop this as per your requirements..." />
                                    </div>

                                    <div className='input-field-wrapper'>
                                        <label htmlFor="gig-category" className='label-item'>Category</label>
                                        <select id="gig-category" name='category' onChange={changeHandler} value={formData.category}>
                                            <option value="" disabled>Select category</option>
                                            {
                                                gigCat.map(c => (
                                                    <option value={c.name} key={c.name}>{c.name}</option>
                                                ))
                                            }
                                        </select>
                                        <ChevronDown className='dropdown-icon' size={18} />
                                    </div>

                                    <div className='input-field-wrapper'>
                                        <label htmlFor="gig-tags" className='label-item'>Tags</label>
                                        <input type="text" id="gig-tags" className='label-title' onChange={(e) => setTagInput(e.target.value)} value={tagInput} onKeyDown={keyDownHandlers} placeholder='Type a tag and hit enter' />
                                        <div className="gig-tags">
                                            {formData.tags.map((tag, index) => (
                                                <div key={index} className='tag-pill' onClick={() => deleteTagHandler(tag)}>
                                                    {tag} &times;
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                                <div className="action-buttons" >
                                    <button className='btn' type='button' onClick={nextStep}>Next</button>
                                </div>
                            </>
                        }

                        {/* GIG DESCRIPTION */}
                        {
                            step === 2 &&
                            <>
                                <div className="form-container">
                                    <div className="input-field-wrapper">
                                        <div className="gig-description">
                                            <div className="gig-desc-header">
                                                <div>
                                                    <label htmlFor="gig-desc" className='label-item'>Description</label>
                                                </div>
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
                                            <textarea ref={textareaRef} maxLength={MAX_CHARS} name="description" id="gig-desc" className='desc' onChange={handleDescriptionChange} value={formData.description} placeholder='Explain your gig in detail... (It is recommended to copy paste gig description content from a TEXT EDITOR for formatting purpose)'></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="action-buttons">
                                    <button className='btn prev' type='button' onClick={prevStep}>Previous</button>
                                    <button className='btn next' type='button' onClick={nextStep}>Next</button>
                                </div>
                            </>
                        }

                        {/* GIG VISUALS */}
                        {
                            step === 3 &&
                            <>
                                <div className="form-container">
                                    <div className="input-field-wrapper">
                                        <div className='gig-file-limit'>
                                            <div className='left'>
                                            <label htmlFor="gig-images" className='upload-file-button'><FontAwesomeIcon icon="fa-solid fa-plus" /> Add Image</label>
                                            <div>[Max files: 5 | Size limit: 2MB]</div>
                                            </div>
                                            <div className='right'>
                                               <Info /> First image is considered as cover-image
                                            </div>
                                        </div>
                                        <input type="file" id='gig-images' onChange={uploadImageHandler} className='img-inp-hide' accept='image/*' disabled={isUploading} />
                                        <div className='file-preview-container'>
                                            <div className={`file-preview ${selectedImage.length > 0 && 'contains'}`}>
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
                                                                    <div className='file-info'>
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
                                    </div>

                                    <div className="input-field-wrapper">
                                        <div className='gig-file-limit video'>
                                            <label htmlFor="gig-video" className='upload-file-button'><FontAwesomeIcon icon="fa-solid fa-plus" /> Add Video</label>
                                            <div>[Max file: 1 | Size limit: 10MB]</div>
                                        </div>
                                        <input type="file" id='gig-video' onChange={uploadVideoHandler} className='img-inp-hide' accept='video/*' ref={videoInputRef} />
                                        <div className='file-preview-container'>
                                            <div className={`file-preview ${selectedVideo && 'contains'}`}>
                                                {
                                                    selectedVideo ?
                                                        (
                                                            <div key={selectedVideo.id} className='file'>
                                                                <FilePreview file={selectedVideo} />
                                                                <div className='file-info'>
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
                                    </div>
                                </div>
                                <div className="action-buttons">
                                    <button className='btn prev' type='button' onClick={prevStep}>Previous</button>
                                    <button className='btn next' type='button' onClick={nextStep}>Next</button>
                                </div>
                            </>
                        }

                        {/* GIG PRICING & TIME */}
                        {
                            step === 4 &&
                            <>
                                <div className="form-container">
                                    <div className="input-field-wrapper">
                                        <label htmlFor="gig-price" className='label-item'>Price</label>
                                        <input name='price' type="text" id="gig-price" onChange={changeHandler} value={formData.price} placeholder='Price will be set in Rupees(₹)' />
                                    </div>
                                    <div className="input-field-wrapper">

                                        <label htmlFor="gig-delivery-days" className='label-item'>Delivery days</label>
                                        <input name='deliveryDays' type="text" id="gig-delivery-days" onChange={changeHandler} value={formData.deliveryDays} placeholder='Specify in terms of day(s)' />
                                    </div>

                                    <div className="input-field-wrapper">
                                        <label htmlFor="gig-revisions" className='label-item'>Revisions</label>
                                        <input name='revisions' type="text" id="gig-revisions" onChange={changeHandler} value={formData.revisions} placeholder='Number of modifications allowed' />
                                    </div>
                                </div>
                                <div className="action-buttons">
                                    <button className='btn prev' type='button' onClick={prevStep}>Previous</button>
                                    <button className='btn next' type='button' onClick={nextStep}>Next</button>
                                </div>
                            </>
                        }

                        {/* FINAL ACTIONS */}
                        {
                            step === 5 &&
                            <>
                                {
                                    gigId ?
                                        <>
                                            <div className="final-actions">
                                                <button className='gig-draft-btn' type="button" onClick={() => navigate('/my-gigs')} >
                                                    <X />
                                                    <span>
                                                        Cancel
                                                    </span>
                                                </button>
                                                <button className='gig-publish-btn' type='submit'>
                                                    <Check />
                                                    <span>
                                                        Finish Edit
                                                    </span>
                                                </button>
                                            </div>
                                        </>
                                        :
                                        <>
                                            <div className="final-actions">
                                                <button className='gig-draft-btn' type='submit' onClick={() => gigStateSubmissionHandler(false)}>
                                                    <Save size={24} />
                                                    <span>
                                                        Create Gig (Draft)
                                                    </span>
                                                </button>
                                                <button className='gig-publish-btn' type='submit' onClick={() => gigStateSubmissionHandler(true)}>
                                                    <Globe />
                                                    <span>
                                                        Create & Publish Gig
                                                    </span>
                                                </button>
                                            </div>
                                        </>
                                }

                                <div className="action-buttons">
                                    <button className='btn' type='button' onClick={prevStep}>Previous</button>
                                </div>
                            </>
                        }
                    </div>
                </div >
            </form >
        </div >
    )
}

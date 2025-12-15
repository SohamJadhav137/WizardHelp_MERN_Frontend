import React, { useCallback, useEffect, useRef, useState } from 'react'

import './CreateGig.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faS } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { extractFileNameFromURL } from '../../utils/extractFileName';

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
        if(fileToDelete && !fileToDelete.originalFile){
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
        console.log(selectedImage)

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

    const validateForm = () => {
        const { title, category, description, imageURLs, price, deliveryDays, revisions } = formData
        let errors = [];

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

        const token = localStorage.getItem("token");

        let uploadImageUrls = [];

        for (const img of selectedImage) {
            try {
                const url = await uploadToS3(img.originalFile, token);
                uploadImageUrls.push(url);
            } catch (error) {
                alert("Failed to upload image!");
                console.error(error)
                return;
            }
        }

        let uploadVideoUrl = null

        if (selectedVideo) {
            try {
                uploadVideoUrl = await uploadToS3(formData.videoURL, token);
            } catch (error) {
                alert("Failed to upload video!");
                console.error(error);
                return;
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
            alert("Gig created successfully");
            console.log("Created gigd:", responseData);
        }
        else {
            alert(`Gig creation failed: ${responseData.message || response.statusText}`);
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
                        alert("Failed to upload images!");
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
                        alert("Failed to upload video!");
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
                alert("Gig updated successfully");
                console.log("Updated gigd:", responseData);
                setDeletedImageURLs([]);
                navigate('/my-gigs');
            }
            else {
                alert(`Gig updation failed: ${responseData.message || response.statusText}`);
            }
        } catch (error) {
            console.error("Gig submission error:\n", error);
        }
    }

    return (
        <div className='create-gig-container' onKeyDown={submitKeyHandler}>
            <form className="create-gig" onSubmit={gigId ? formUpdateHandler : formSubmitHandler}>
                <div className='main-heading'>{gigId ? "Edit your gig" : "Create your gig"}</div>
                <div className="phase-item">
                    <span className='sub-heading'>Step-1: Gig Overview</span>
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <label htmlFor="gig-title" className='label-item'>Title</label>
                                </td>
                                <td>
                                    <input type="text" id="gig-title" name='title' onChange={changeHandler} value={formData.title} />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="gig-category" className='label-item'>Category</label>
                                </td>
                                <td>
                                    <select id="gig-category" name='category' onChange={changeHandler} value={formData.category}>
                                        <option value="" disabled>Select a category</option>
                                        <option value="Software Development">Software Development</option>
                                        <option value="Video Editing">Video Editing</option>
                                        <option value="Writing & Translation">Writing & Translation</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Digital Marketing">Digital Marketing</option>
                                        <option value="Data Analytics">Data Analytics</option>
                                        <option value="Music & Audio">Music & Audio</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="gig-desc" className='label-item'>Description</label>
                                </td>
                                <td>
                                    <textarea name="description" id="gig-desc" className='desc' onChange={changeHandler} value={formData.description} placeholder='Upto 1,200 characters'></textarea>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="gig-tags" className='label-item'>Tags</label>
                                </td>
                                <td>
                                    <div className="gig-tags">
                                        {formData.tags.map((tag, index) => (
                                            <div key={index} className='tag-pill' onClick={() => deleteTagHandler(tag)}>
                                                {tag} &times;
                                            </div>
                                        ))}
                                    </div>
                                    <input type="text" id="gig-tags" className='label-title' onChange={(e) => setTagInput(e.target.value)} value={tagInput} onKeyDown={keyDownHandlers} placeholder='Type a tag and hit enter' />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="phase-item">
                    <span className='sub-heading'>Step-2: Gig Visuals</span>
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
                            {/* <tr>
                                <td>
                                    <label htmlFor="gig-docs" className='label-item'>Documents</label>
                                </td>
                                <td>
                                    <input type="file" id="gig-docs" multiple onChange={fileUploadHandler} accept='.pdf,.doc,.docx' />
                                </td>
                            </tr> */}
                        </tbody>
                    </table>
                </div>

                <div className="phase-item">
                    <span className='sub-heading'>Step-3: Pricing</span>
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <label htmlFor="gig-price" className='label-item'>Price</label>
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
                                    <input name='deliveryDays' type="text" id="gig-delivery-days" onChange={changeHandler} value={formData.deliveryDays} />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label htmlFor="gig-revisions" className='label-item'>Revisions</label>
                                </td>
                                <td>
                                    <input name='revisions' type="text" id="gig-revisions" onChange={changeHandler} value={formData.revisions} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="phase-item">
                    <span className='sub-heading'>Step-4: Publish</span>
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <span>Final actions</span>
                                </td>
                                <td>
                                    {
                                        gigId ?
                                            <button type='submit'>Finish Edit</button>
                                            :
                                            <>
                                                <button type='submit' onClick={() => gigStateSubmissionHandler(false)}>Create Gig (Draft)</button>
                                                <button type='submit' onClick={() => gigStateSubmissionHandler(true)}>Create & Publish Gig</button>
                                            </>
                                    }
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </form>
        </div>
    )
}

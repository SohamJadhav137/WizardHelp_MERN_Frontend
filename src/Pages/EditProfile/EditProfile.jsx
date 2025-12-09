import React, { useEffect, useState } from 'react'
import countries from '../../Data/Countries';

import './EditProfile.scss';
import languages from '../../Data/Languages';
import { getCurrentUser } from '../../utils/getCurrentUser';
import { useNavigate } from 'react-router-dom';

export default function EditProfile() {

    const [country, setCountry] = useState(null);
    const [formData, setFormData] = useState({
        country: '',
        languages: [],
        skills: []
    })

    const [chipInput, setChipInput] = useState('');
    const [errorIndicator, setErrorIndicator] = useState(null);
    const navigate = useNavigate();

    const changeCountry = (c) => {
        setFormData({ ...formData, country: c });
        setCountry(c);
    };

    const addChip = (e) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();

            const newChip = chipInput.trim().toUpperCase();

            if (newChip && !formData.skills.includes(newChip)) {
                setFormData({ ...formData, skills: [...formData.skills, newChip] });
                setChipInput('');
            }
        }
    };

    const deleteChip = (chipToDelete) => {
        setFormData({ ...formData, skills: formData.skills.filter(c => c !== chipToDelete) });
    };

    const addLang = (l) => {

        const newChip = l.trim().toUpperCase();

        if (newChip && !formData.languages.includes(newChip)) {
            setFormData({ ...formData, languages: [...formData.languages, newChip] });
            setChipInput('');
        }
    };

    const deleteLang = (langToDelete) => {
        setFormData({ ...formData, languages: formData.languages.filter(l => l !== langToDelete) });
    };

    const user = getCurrentUser();
    const userId = user.id;
    const token = localStorage.getItem("token");
    let errors = [];

    // Fetching user details
    useEffect(() => {
        const fetchUserDetails = async () => {

            try {
                const res = await fetch(`http://localhost:5000/api/user/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (res.ok) {
                    const data = await res.json();
                    const user = data.user || {};
                    setFormData({
                        country: user.country,
                        languages: user.languages,
                        skills: user.skills
                    });
                    setCountry(user.country);

                    console.log(formData);
                }
                else {
                    console.error("Failed to fetch user details:", res.status);
                }
            } catch (error) {
                console.error("Some error occured:", error);
            }
        }

        fetchUserDetails();
    }, [userId]);

    const validateForm = () => {
        const { country, languages, skills } = formData;

        if (!country.trim()) errors.push("Please select a country!");
        if (languages.length === 0) errors.push("Please select atleast one language!");
        if (skills.length === 0) errors.push("Please enter atleast one skill");

        if (errors.length !== 0)
            return false;

        return true;
    }

    const formSubmitHandler = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setErrorIndicator(errors[0]);
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/user/${userId}/edit-profile`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const responseData = await res.json().catch(e => {
                console.error("Failed to parse JSON response:", e);
                return { message: "Some error occured while parsing JSON response!" }
            });

            if (res.ok) {
                alert("Your profile was updated successfully");
                navigate('/my-profile');
                console.log("Updated profile:\n", responseData);
            }
            else {
                alert("Failed to update your profile!");
            }
        } catch (error) {
            console.error("Some error occured:", error);
        }
    }

    const redirectToProfile = () => {
        navigate('/my-profile');
    }

    return (
        <div className='edit-profile-container'>
            <div className="edit-profile">
                <div className="edit-profile-title">
                    Edit Profile
                </div>
                <div className="edit-profile-contents">
                    {
                        errorIndicator &&
                        <div className="error-div">
                            {errorIndicator}
                        </div>
                    }
                    <table>
                        <tbody>
                            {/* ///////////////////////////// COUNTRY //////////////////////////////// */}
                            <tr>
                                <td>
                                    <label htmlFor="edit-country" className='label-item'>Country</label>
                                </td>
                                <td>
                                    <select name="country" id="edit-country" defaultValue='' onChange={(e) => changeCountry(e.target.value)} >
                                        <option value="" disabled>Select a country</option>
                                        {
                                            countries.map(c => (
                                                <option key={c} value={c} >{c}</option>
                                            ))
                                        }
                                    </select>
                                    <div className="chip shift-right">
                                        {country}
                                    </div>
                                </td>
                            </tr>
                            {/* ///////////////////////////// LANGUAGES //////////////////////////////// */}
                            <tr>
                                <td>
                                    <label htmlFor="edit-language" className='label-item'>Languages</label>
                                </td>
                                <td>
                                    <div className="lang-chips-container">
                                        {
                                            formData.languages.map((l, i) => (
                                                <div className="chip" key={i} onClick={() => deleteLang(l)}>{l} &times;</div>
                                            ))
                                        }
                                    </div>
                                    <select name="language" id="edit-language" defaultValue='' onChange={(e) => { addLang(e.target.value); e.target.value = ''; }}>
                                        <option value="" disabled>Select a language</option>
                                        {
                                            languages.map((l, i) => (
                                                <option key={l} value={l}>{l}</option>
                                            ))
                                        }
                                    </select>
                                </td>
                            </tr>
                            {/* ///////////////////////////// SKILLS //////////////////////////////// */}
                            <tr>
                                <td>
                                    <label htmlFor="edit-skill" className='label-item'>Skills</label>
                                </td>
                                <td>
                                    <div className="skill-container">
                                        {
                                            formData.skills.map((s, i) => (
                                                <div className="chip" key={i} onClick={() => deleteChip(s)}>{s} &times;</div>
                                            ))
                                        }
                                    </div>
                                    <input type="text" onChange={(e) => setChipInput(e.target.value)} onKeyDown={addChip} value={chipInput} placeholder='Type a skill and press enter' />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2}>
                                    <div className="profile-action-buttons">
                                        <button className='profile-save-btn' onClick={formSubmitHandler}>Save</button>
                                        <button className='profile-cancel-btn' onClick={redirectToProfile}>Cancel</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

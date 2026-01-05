import React, { useContext, useState } from 'react'

import './signup.scss';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import countries from '../../../Data/Countries';
import languages from '../../../Data/Languages';
import { Briefcase, Eye, EyeOff, Languages, Lock, Mail, MapPin, User, WandSparkles } from 'lucide-react';

export default function Signup() {

  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1)

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    languages: [],
    skills: [],
    role: "buyer"
  });

  const [error, setError] = useState("");
  const [chipInput, setChipInput] = useState('');

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addLang = (l) => {

    const newChip = l.trim().toUpperCase();

    if (newChip && !formData.languages.includes(newChip)) {
      setFormData({ ...formData, languages: [...formData.languages, newChip] });
      setChipInput('');
    }
  };

  const firstValidation = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!formData.username || !formData.email || !formData.password){
      setError("All fields are required!");
      return;
    }

    if(!emailRegex.test(formData.email)){
      setError("Please enter a valid email!");
      return;
    }

    if(formData.password.length < 6){
      setError("Password must be at least 6 characters");
      return;
    }

    setError('');

    nextStep();
  }

  const deleteLang = (langToDelete) => {
    setFormData({ ...formData, languages: formData.languages.filter(l => l !== langToDelete) });
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



  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    // if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.country || !formData.languages) {
    //   setError("All fields are required!");
    //   return;
    // }

    console.log(formData.username);

    if (!formData.username) {
      setError("Username is required!");
      return;
    }

    if (!formData.email.includes('@')) {
      setError("Invalid email format!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password should be of min 6 characters!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    if (formData.languages.length === 0) {
      setError("Select atleast one language!");
      return;
    }

    if (!formData.skills) {
      formData.skills = [];
    }

    setLoading(true);

    try {

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong!")
        return;
      }

      if (data.success) {
        localStorage.setItem("token", data.token);
        const user = { email: data.email, username: data.username, role: data.role, profilePic: data.profilePic || null }
        localStorage.setItem("user", user);
        console.log(data);
        console.log(user);
        login(user, data.token);
        alert("User registered successfully");
        navigate('/');
      }
      else {
        alert("User registration failed!");
      }

    } catch (error) {
      console.log(error)
      setError("Server error. Please try again later!")
    } finally {
      setLoading(false);
    }
  }

  return (

    <form className="signup" onSubmit={submitHandler}>
      <h3>Signup</h3>

      <div className="error-slot">
        {error && <span className='error-text'>{error}</span>}
      </div>

      {/* <div className="progress-bar">
        <div className={`progress-segment ${step >= 1 ? 'active' : ''}`}></div>
        <div className={`progress-segment ${step >= 2 ? 'active' : ''}`}></div>
      </div> */}

      {
        step === 1 &&
        <div className="step-container animate-in">
          {/* <h4>Basic Details</h4> */}
          <label htmlFor='username'>Username</label>
          <div className="input-wrapper">
            <User className='input-icon' size={20} />
            <input type="text" name='username' id='username' value={formData.username} onChange={onChangeHandler} />
          </div>

          <label htmlFor='email'>Email</label>
          <div className="input-wrapper">
            <Mail className='input-icon' size={20} />
            <input type="email" name='email' id='email' value={formData.email} onChange={onChangeHandler} />
          </div>

          <label htmlFor='password'>Password</label>
          <div className="input-wrapper">
            <Lock className='input-icon' size={20} />
            <input type={showPassword ? 'text' : 'password'} name='password' id='password' value={formData.password} onChange={onChangeHandler} />
            <button type='button' className='eye-icon' onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="button" className='auth-button' onClick={firstValidation}>
            Next
          </button>
        </div>
      }

      {
        step === 2 &&
        <div className="step-container animate-in">
          <div>
            <button onClick={prevStep}>Back</button>
          </div>

          <label htmlFor="">Select role:</label>
          <div className="role-grid">
            <div
              className={`role-card ${formData.role === 'buyer' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'buyer' })}
            >
              <Briefcase size={24} />
              <span>I want to Hire</span>
            </div>
            <div
              className={`role-card ${formData.role === 'seller' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'seller' })}
            >
              <WandSparkles size={24} />
              <span>I want to Work</span>
            </div>
          </div>

          <label htmlFor="country" className='label-item'>Country</label>
          <div className="input-wrapper">
            <MapPin className='input-icon' size={18} />
            <select name="country" id="country" defaultValue='' onChange={onChangeHandler}>
              <option value="" disabled>Select country</option>
              {
                countries.map(c => (
                  <option value={c} key={c}>{c}</option>
                ))
              }
            </select>
          </div>

          <label htmlFor="edit-language" className='label-item'>Spoken Languages</label>
          <div className="input-wrapper">
            <Languages className='input-icon' size={18} />
            <select name="language" id="edit-language" defaultValue='' onChange={(e) => { addLang(e.target.value); e.target.value = ''; }}>
              <option value="" disabled>Select a language</option>
              {
                languages.map((l, i) => (
                  <option key={l} value={l}>{l}</option>
                ))
              }
            </select>
            <div className="chips-container">
              {
                formData.languages.map((l, i) => (
                  <div className="chip" key={i} onClick={() => deleteLang(l)}>{l} &times;</div>
                ))
              }
            </div>
          </div>

          <button type="submit" disabled={loading} className={`auth-button ${loading && 'loading-state'}`}>
            {loading ? 'Signing up...' : 'Signup'}
          </button>
        </div>
      }


      {/* <label htmlFor="country" className='label-item'>Country</label>
      <select name="country" id="country" defaultValue='' onChange={onChangeHandler}>
        <option value="" disabled>Select country</option>
        {
          countries.map(c => (
            <option value={c} key={c}>{c}</option>
          ))
        }
      </select>

      <label htmlFor="edit-language" className='label-item'>Spoken Languages</label>
      <select name="language" id="edit-language" defaultValue='' onChange={(e) => { addLang(e.target.value); e.target.value = ''; }}>
        <option value="" disabled>Select a language</option>
        {
          languages.map((l, i) => (
            <option key={l} value={l}>{l}</option>
          ))
        }
      </select>
      <div className="chips-container">
        {
          formData.languages.map((l, i) => (
            <div className="chip" key={i} onClick={() => deleteLang(l)}>{l} &times;</div>
          ))
        }
      </div>

      <label htmlFor="edit-skill" className='label-item'>Skills</label>
      <input type="text" onChange={(e) => setChipInput(e.target.value)} onKeyDown={addChip} value={chipInput} placeholder='Type a skill and press enter' />
      <div className="chips-container">
        {
          formData.skills.map((s, i) => (
            <div className="chip" key={i} onClick={() => deleteChip(s)}>{s} &times;</div>
          ))
        }
      </div>

      <div className="radio-buttons-container">
        <label>Select Role:</label>
        <div className="radio-buttons">
          <div className="rb">
            <label htmlFor="buyer-button"> Buyer</label>
            <input type="radio" id='buyer-button' value="buyer" name='role' onChange={onChangeHandler} checked={formData.role === "buyer"} />
          </div>
          <div className="rb">
            <label htmlFor="seller-button"> Seller</label>
            <input type="radio" id='seller-button' value="seller" name='role' onChange={onChangeHandler} />
          </div>
        </div>
      </div> */}



      <span className='desc'>Already a user ? <Link to='/auth/login' className='link'><span>Login</span></Link> here</span>
    </form>
  )
}

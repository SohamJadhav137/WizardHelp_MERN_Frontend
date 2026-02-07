import React, { useContext, useEffect, useState } from 'react'

import './Signup.scss';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import countries from '../../../Data/Countries';
import languages from '../../../Data/Languages';
import { Briefcase, Brush, CheckCircle, ChevronDown, Eye, EyeOff, Info, Languages, Lock, Mail, MapPin, User, WandSparkles, XCircle } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import loadingIcon from '../../.././assets/loading_icon.svg';
import Swal from 'sweetalert2';

export default function Signup() {

  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chipInput, setChipInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    country: "",
    languages: [],
    skills: [],
    role: "buyer"
  });

  // Check username is unique
  useEffect(() => {
    setError("");

    if (formData.username.length < 3) {
      setUsernameStatus(null);
      return;
    }

    const delayDebounceFunc = setTimeout(async () => {
      setUsernameStatus('checking');

      try {
        const res = await fetch(`http://localhost:5000/api/auth/check-availability?field=username&value=${encodeURIComponent(formData.username)}`);

        if (!res.ok) {
          const errorBody = await res.text();
          console.error("Server error:", errorBody);
          return;
        }

        const data = await res.json();
        console.log("Response:", data);

        if (data.available) {
          setUsernameStatus('available');
        }
        else {
          setUsernameStatus('taken');
          setError("This username is already claimed!")
        }
      } catch (error) {
        console.error("Lookup Failed:", error);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFunc);
  }, [formData.username]);

  // Check email format & uniqueness
  useEffect(() => {
    setError("");

    const email = formData.email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setEmailStatus(null);
      return;
    }

    if (!emailRegex.test(email)) {
      setEmailStatus('invalid');
      setError('Invalid Email!')
      return;
    }

    setError('');

    const delayDebounceFunc = setTimeout(async () => {
      setEmailStatus('checking');

      try {
        const res = await fetch(`http://localhost:5000/api/auth/check-availability?field=email&value=${encodeURIComponent(formData.email)}`);

        if (!res.ok) {
          const errorBody = await res.text();
          console.error("Server error:", errorBody);
          return;
        }

        const data = await res.json();
        console.log("Response:", data);

        if (data.available) {
          setEmailStatus('available');
        }
        else {
          setEmailStatus('taken');
          setError("This email is already registered!")
        }
      } catch (error) {
        console.error("Lookup Failed:", error);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFunc);
  }, [formData.email]);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

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
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required!");
      return;
    }

    if (usernameStatus === 'taken') {
      setError("This name is already claimed!");
      return;
    }

    if (usernameStatus === 'checking') {
      setError("Hold on, we're still checking this name...");
      return;
    }

    if (emailStatus === 'invalid') {
      setError("Please enter a valid email address!");
      return;
    }

    if (emailStatus === 'taken') {
      setError("This email is already registered!");
      return;
    }

    if (emailStatus === 'checking') {
      setError("Hold on, we're still checking this email...");
      return;
    }

    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email!");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
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

  // SUBMIT form handler
  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    // Second stage form validation
    if (!formData.country) {
      setError("Please select your country!");
      return;
    }

    if (formData.languages.length === 0) {
      setError("Please select atleast one language!");
      return;
    }

    if (formData.role === 'seller' && formData.skills.length === 0) {
      setError("Please enter atleast one skill!");
      return;
    }

    setError('');

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
        const user = { email: data.email, username: data.username, role: data.role }
        localStorage.setItem("user", user);
        console.log(data);
        console.log(user);
        login(user, data.token);

        Swal.fire({
          title: 'Registration Successful!',
          html: `Welcome <b>${formData.username}</b>!<br>Your journey begins now.`,
          icon: 'success',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title'
          },
          iconColor: '#018790',
          confirmButtonColor: '#018790',
          showConfirmButton: true,
          timer: 4000, // Optional: automatically closes after 3 seconds
          timerProgressBar: true,
          background: '#ffffff'
        });

        navigate('/');
      }
      else {
        Swal.fire({
          title: 'Error',
          text: 'Ritual Failed. Try again!',
          icon: 'error',
          confirmButtonColor: '#018790',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title'
          }
        });
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

      {
        step === 1 &&
        <div className="error-slot">
          {error && <span className='error-text'>{error}</span>}
        </div>
      }

      {/* <div className="progress-bar">
        <div className={`progress-segment ${step >= 1 ? 'active' : ''}`}></div>
        <div className={`progress-segment ${step >= 2 ? 'active' : ''}`}></div>
      </div> */}

      {
        step === 1 &&
        <div className="step-container animate-left">
          {/* <h4>Basic Details</h4> */}
          <div className='username-label'>
            <label htmlFor='username'>Username</label>
            <div className="input-helper-text"> <Info size={12} /> Cannot be changed later.</div>
          </div>
          <div className="input-wrapper">
            <User className='input-icon' size={20} />
            <input type="text" name='username' id='username' value={formData.username} onChange={onChangeHandler} />
            {usernameStatus === 'checking' && <img src={loadingIcon} alt="Loading..." className='loading-icon' />}
            {usernameStatus === 'available' && <CheckCircle className='eye-icon' size={18} color='green' />}
            {usernameStatus === 'taken' && <XCircle className='eye-icon' size={18} color='red' />}
          </div>

          <label htmlFor='email'>Email</label>
          <div className="input-wrapper">
            <Mail className='input-icon' size={20} />
            <input type="email" name='email' id='email' value={formData.email} onChange={onChangeHandler} />
            {emailStatus === 'checking' && <img src={loadingIcon} alt="Loading..." className='loading-icon' />}
            {emailStatus === 'available' && <CheckCircle className='eye-icon' size={18} color='green' />}
            {emailStatus === 'taken' && <XCircle className='eye-icon' size={18} color='red' />}
          </div>

          <label htmlFor='password'>Password</label>
          <div className="input-wrapper">
            <Lock className='input-icon' size={20} />
            <input type={showPassword ? 'text' : 'password'} name='password' id='password' value={formData.password} onChange={onChangeHandler} />
            <button type='button' className='eye-icon' onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* APPLY onclick later: onClick={firstValidation} */}
          <button type="button" className='auth-button' onClick={firstValidation}>
            Next
          </button>
        </div>
      }

      {
        step === 2 &&
        <div className="step-container animate-right">
          <div>
            <button onClick={prevStep} className='prev-step-btn'>
              <FontAwesomeIcon icon="fa-solid fa-arrow-left" /> Back
            </button>
          </div>

          <div className="error-slot">
            {error && <span className='error-text'>{error}</span>}
          </div>

          <label htmlFor="">Select role:</label>
          <div className="role-grid">
            <div
              className={`role-card ${formData.role === 'buyer' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'buyer', skills: [] })}
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
            <ChevronDown className='eye-icon' size={18} />
          </div>

          <label htmlFor="edit-language" className='label-item'>Spoken Language(s)</label>
          <div className="input-wrapper">
            <Languages className='input-icon' size={18} />
            <select name="language" id="edit-language" defaultValue='' onChange={(e) => { addLang(e.target.value); e.target.value = ''; }}>
              <option value="" disabled>Select language</option>
              {
                languages.map((l, i) => (
                  <option key={l} value={l}>{l}</option>
                ))
              }
            </select>
            <ChevronDown className='eye-icon' size={18} />
          </div>
          <div className="chips-container">
            {
              formData.languages.map((l, i) => (
                <div className="chip" key={i} onClick={() => deleteLang(l)}>{l} &times;</div>
              ))
            }
          </div>

          {
            formData.role === 'seller' &&
            <>
              <label htmlFor="edit-skill" className='label-item'>Skill(s)</label>
              <div className="input-wrapper">
                <Brush className='input-icon' size={18} />
                <input type="text" onChange={(e) => setChipInput(e.target.value)} onKeyDown={addChip} value={chipInput} placeholder='Type a skill and press enter' />
              </div>
              <div className="chips-container">
                {
                  formData.skills.map((s, i) => (
                    <div className="chip" key={i} onClick={() => deleteChip(s)}>{s} &times;</div>
                  ))
                }
              </div>
            </>
          }

          <button type="submit" disabled={loading} className={`auth-button ${loading && 'loading-state'}`}>
            {loading ? 'Signing up...' : 'Signup'}
          </button>
        </div>
      }

      <span className='desc'>Already a user ? <Link to='/auth/login' className='link'><span>Login</span></Link> here</span>
    </form>
  )
}

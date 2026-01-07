import React, { useContext, useState } from 'react'

import './login.scss';
import { AuthContext } from '../../../context/AuthContext';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("All fields are required!");
      return;
    }

    if (!formData.email.includes('@')) {
      setError("Invalid email format!");
      return;
    }
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong!")
        return;
      }

      localStorage.setItem("token", data.token);
      const user = { email: data.email, username: data.username, role: data.role, profilePic: data.profilePic }
      localStorage.setItem("user", JSON.stringify(user));
      console.log(data);
      console.log(user);
      login(user, data.token);

    } catch (error) {
      console.error(error)
      setError("Server error. Please try again later!")
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login" onSubmit={submitHandler}>
      <h3>Welcome back !</h3>
      <div className="error-slot">
        {error && <span className='error-text'>{error}</span>}
      </div>

      <label>Email</label>
      <div className="input-wrapper">
        <Mail className='input-icon' size={20} />
        <input type="text" name='email' value={formData.email} onChange={onChangeHandler} />
      </div>

      <label>Password</label>
      <div className="input-wrapper">
        <Lock className='input-icon' size={20} />
        <input type={showPassword ? 'text' : 'password'} name='password' value={formData.password} onChange={onChangeHandler} />
        <button type='button' className='eye-icon' onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <button type="submit" disabled={loading} className={`auth-button ${loading && 'loading-state'}`}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <span className='desc'>New user ? <Link to='/auth/signup' className='link'><span>Signup</span></Link> here</span>
    </form>
  )
}

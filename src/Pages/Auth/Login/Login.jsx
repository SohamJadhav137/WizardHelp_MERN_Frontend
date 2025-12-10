import React, { useContext, useState } from 'react'

import './login.scss';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

export default function Login() {

  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

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
      const user = { email: data.email, name: data.username, role: data.role, profilePic: data.profilePic || null }
      localStorage.setItem("user", JSON.stringify(user));
      console.log(data);
      console.log(user);
      login(user, data.token);
      // alert("User logged in successfully");
      navigate('/');

    } catch (error) {
      console.error(error)
      setError("Server error. Please try again later!")
    } finally {
      setLoading(false);
    }
  }
  return (
    <form className="login" onSubmit={submitHandler}>
      <h3>Login</h3>
      {error && <p className='error'>{error}</p>}
      <label>Email</label>
      <input type="text" name='email' onChange={onChangeHandler} />
      <label>Password</label>
      <input type="password" name='password' onChange={onChangeHandler} />
      <button type="submit" disabled={loading} className={`auth-button ${loading && 'loading-state'}`}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <span className='desc'>New user ? <Link to='/signup' className='link'><span>Signup</span></Link> here</span>
    </form>
  )
}

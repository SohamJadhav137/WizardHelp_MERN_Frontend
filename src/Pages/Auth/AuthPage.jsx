import React, { useContext, useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import './AuthPage.scss';
import { useNavigate, useParams } from 'react-router-dom';
import Login from '../../Components/Auth/Login/Login';
import Signup from '../../Components/Auth/Signup/Signup';

export default function AuthPage() {

  const { mode } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  return (
    <div className="base">

      <div className="left">
        <div className="img-container">
          <img src="/auth_bg_final.png" alt="" />
        </div>
        <div className='auth-tagline'>
          Your creative workspace awaits
        </div>
      </div>
      
      <div className="right">
        <div key={mode} className="form-fade-container">
        {mode === 'login' ? <Login /> : <Signup />}
        </div>
      </div>
    </div>
  )
}

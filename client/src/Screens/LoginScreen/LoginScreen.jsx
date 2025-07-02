import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Valid email required';
    if (!password || password.length < 6) newErrors.password = 'Password must be 6+ characters';
    if (isSignUp && !name.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const url = process.env.REACT_APP_LOGIN_USER;
      const payload = isSignUp
        ? { email, password, name }
        : { email, password };
      const response = await axios.post(url, payload, { withCredentials: true });

      console.log(response.data); // optional: handle success response
      navigate('/dashboard'); // redirect to dashboard or any page
    } catch (error) {
      console.error("Login/Signup failed:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (error) => ({
    width: '100%',
    padding: '15px 15px 15px 45px',
    border: `2px solid ${error ? '#ff6b6b' : '#EAE4D5'}`,
    borderRadius: '12px',
    fontSize: '16px',
    background: '#F2F2F2',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit'
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F2F2F2 0%, #EAE4D5 50%, #B6B09F 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.2)',
        transform: 'translateY(0)',
        transition: 'transform 0.3s ease'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 style={{
            color: '#000000',
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p style={{
            color: '#B6B09F',
            fontSize: '16px',
            margin: 0
          }}>
            {isSignUp ? 'Join us today' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {isSignUp && (
            <div style={{ position: 'relative' }}>
              <User size={20} style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#B6B09F',
                zIndex: 1
              }} />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle(errors.name)}
                onFocus={(e) => e.target.style.borderColor = '#B6B09F'}
                onBlur={(e) => e.target.style.borderColor = errors.name ? '#ff6b6b' : '#EAE4D5'}
              />
              {errors.name && <span style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>{errors.name}</span>}
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={20} style={{
              position: 'absolute',
              left: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#B6B09F',
              zIndex: 1
            }} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle(errors.email)}
              onFocus={(e) => e.target.style.borderColor = '#B6B09F'}
              onBlur={(e) => e.target.style.borderColor = errors.email ? '#ff6b6b' : '#EAE4D5'}
            />
            {errors.email && <span style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>{errors.email}</span>}
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{
              position: 'absolute',
              left: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#B6B09F',
              zIndex: 1
            }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                ...inputStyle(errors.password),
                paddingRight: '50px'
              }}
              onFocus={(e) => e.target.style.borderColor = '#B6B09F'}
              onBlur={(e) => e.target.style.borderColor = errors.password ? '#ff6b6b' : '#EAE4D5'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#B6B09F',
                padding: '4px',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(182, 176, 159, 0.1)'}
              onMouseOut={(e) => e.target.style.background = 'none'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && <span style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>{errors.password}</span>}
          </div>

          {!isSignUp && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '5px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#B6B09F', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ marginRight: '8px', accentColor: '#B6B09F' }}
                />
                Remember me
              </label>
              <button type="button" style={{
                background: 'none',
                border: 'none',
                color: '#B6B09F',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}>
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '16px',
              background: isLoading ? '#B6B09F' : 'linear-gradient(135deg, #000000 0%, #B6B09F 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => !isLoading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => !isLoading && (e.target.style.transform = 'translateY(0)')}
          >
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '25px',
          color: '#B6B09F',
          fontSize: '15px'
        }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            style={{
              background: 'none',
              border: 'none',
              color: '#000000',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '15px',
              textDecoration: 'underline',
              padding: 0
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
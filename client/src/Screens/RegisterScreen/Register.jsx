import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (form.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email format';
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      axios.post(process.env.REACT_APP_REGISTER_USER, {
        name: form.name,
        email: form.email,
        password: form.password
      }, { withCredentials: true })
        .then((res) => {
          setSuccessMessage(res.data.message || 'Registered successfully!');
          setForm({ name: '', email: '', password: '' });
          setTimeout(() => navigate('/login'), 1500); // Redirect after delay
        })
        .catch((err) => {
          console.error('Registration error:', err);
          setSuccessMessage('Registration failed. Please try again.');
        });
    };
  }
  

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F2F2F2',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: '#EAE4D5',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        border: '2px solid #B6B09F'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          color: '#000000',
          fontSize: '1.8rem'
        }}>
          Create Account
        </h2>
        {successMessage && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            borderRadius: '5px',
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
            textAlign: 'center'
          }}>
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${errors.name ? '#dc3545' : '#B6B09F'}`,
                borderRadius: '5px',
                fontSize: '1rem',
                transition: 'border-color 0.3s',
                outline: 'none',
                background: '#F2F2F2',
                color: '#000000'
              }}
              onFocus={(e) => e.target.style.borderColor = errors.name ? '#dc3545' : '#000000'}
              onBlur={(e) => e.target.style.borderColor = errors.name ? '#dc3545' : '#B6B09F'}
            />
            {errors.name && <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.name}</div>}
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${errors.email ? '#dc3545' : '#B6B09F'}`,
                borderRadius: '5px',
                fontSize: '1rem',
                transition: 'border-color 0.3s',
                outline: 'none',
                background: '#F2F2F2',
                color: '#000000'
              }}
              onFocus={(e) => e.target.style.borderColor = errors.email ? '#dc3545' : '#000000'}
              onBlur={(e) => e.target.style.borderColor = errors.email ? '#dc3545' : '#B6B09F'}
            />
            {errors.email && <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.email}</div>}
          </div>
          
          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                paddingRight: '2.5rem',
                border: `2px solid ${errors.password ? '#dc3545' : '#B6B09F'}`,
                borderRadius: '5px',
                fontSize: '1rem',
                transition: 'border-color 0.3s',
                outline: 'none',
                background: '#F2F2F2',
                color: '#000000'
              }}
              onFocus={(e) => e.target.style.borderColor = errors.password ? '#dc3545' : '#000000'}
              onBlur={(e) => e.target.style.borderColor = errors.password ? '#dc3545' : '#B6B09F'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: '#000000'
              }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
            {errors.password && <div style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.password}</div>}
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#000000',
              color: '#F2F2F2',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#B6B09F';
              e.target.style.color = '#000000';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#000000';
              e.target.style.color = '#F2F2F2';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

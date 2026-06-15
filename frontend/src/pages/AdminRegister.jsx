import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { User, Mail, Lock, Phone, Shield, ArrowRight, Loader, AlertCircle, CheckCircle } from 'lucide-react';

const AdminRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, level: 'Weak' });
  const navigate = useNavigate();

  // Validation functions
  const validateName = (value) => {
    if (!value) {
      return 'Full name is required';
    }
    if (value.length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(value)) {
      return 'Name should contain only letters and spaces';
    }
    return '';
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      return 'Email is required';
    }
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (value) => {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return '';
  };

  const validateConfirmPassword = (value) => {
    if (!value) {
      return 'Please confirm your password';
    }
    if (value !== password) {
      return 'Passwords do not match';
    }
    return '';
  };

  const validatePhone = (value) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!value) {
      return 'Phone number is required';
    }
    if (!phoneRegex.test(value.replace(/[-\s]/g, ''))) {
      return 'Phone number must be 10 digits';
    }
    return '';
  };

  const validateAdminCode = (value) => {
    if (!value) {
      return 'Admin code is required';
    }
    if (value.length < 6) {
      return 'Admin code must be at least 6 characters';
    }
    // In a real app, validate against backend
    if (value !== 'ADMIN2026') {
      return 'Invalid admin code';
    }
    return '';
  };

  // Calculate password strength
  const calculatePasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[!@#$%^&*]/.test(pwd)) score++;

    let level = 'Weak';
    if (score >= 4) level = 'Good';
    if (score >= 5) level = 'Strong';
    if (score >= 6) level = 'Very Strong';

    setPasswordStrength({ score: Math.min(score, 6), level });
  };

  // Handle password change with strength calculation
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    calculatePasswordStrength(value);
    if (errors.password) {
      setErrors({ ...errors, password: validatePassword(value) });
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    newErrors.name = validateName(name);
    newErrors.email = validateEmail(email);
    newErrors.password = validatePassword(password);
    newErrors.confirmPassword = validateConfirmPassword(confirmPassword);
    newErrors.phoneNo = validatePhone(phoneNo);
    newErrors.adminCode = validateAdminCode(adminCode);
    
    setErrors(newErrors);
    return Object.values(newErrors).every(err => !err);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // In a real scenario, you'd send the adminCode to backend for verification
      await api.registerAdmin(name, email, password, phoneNo, adminCode);
      setSuccess('Admin account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/admin-login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score < 2) return '#ef4444';
    if (passwordStrength.score < 4) return '#f59e0b';
    if (passwordStrength.score < 5) return '#10b981';
    return '#06b6d4';
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 160px)', padding: '20px' }}>
      <div className="glass form-container" style={{ width: '100%', maxWidth: '550px' }}>
        
        {/* Admin Branding */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            display: 'inline-flex',
            background: 'rgba(59, 130, 246, 0.1)',
            padding: '12px',
            borderRadius: '50%',
            marginBottom: '15px'
          }}>
            <Shield size={28} color="#3b82f6" />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '8px' }}>Admin Registration</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)', margin: 0 }}>
            Create your EcoTrack admin account
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: '#10b981',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-secondary-dark)" style={{ position: 'absolute', left: '16px', top: '18px' }} />
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Admin Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setErrors({ ...errors, name: validateName(name) })}
                style={{
                  paddingLeft: '46px',
                  borderColor: errors.name ? '#ef4444' : 'var(--border-color)'
                }}
              />
            </div>
            {errors.name && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                {errors.name}
              </span>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-secondary-dark)" style={{ position: 'absolute', left: '16px', top: '18px' }} />
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setErrors({ ...errors, email: validateEmail(email) })}
                style={{
                  paddingLeft: '46px',
                  borderColor: errors.email ? '#ef4444' : 'var(--border-color)'
                }}
              />
            </div>
            {errors.email && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Phone Field */}
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="var(--text-secondary-dark)" style={{ position: 'absolute', left: '16px', top: '18px' }} />
              <input
                id="phone"
                type="tel"
                className="form-input"
                placeholder="9876543210"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value.replace(/[^0-9]/g, ''))}
                onBlur={() => setErrors({ ...errors, phoneNo: validatePhone(phoneNo) })}
                style={{
                  paddingLeft: '46px',
                  borderColor: errors.phoneNo ? '#ef4444' : 'var(--border-color)'
                }}
              />
            </div>
            {errors.phoneNo && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                {errors.phoneNo}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-secondary-dark)" style={{ position: 'absolute', left: '16px', top: '18px' }} />
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => setErrors({ ...errors, password: validatePassword(password) })}
                style={{
                  paddingLeft: '46px',
                  borderColor: errors.password ? '#ef4444' : 'var(--border-color)'
                }}
              />
            </div>
            {password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        height: '4px',
                        flex: 1,
                        background: i < passwordStrength.score ? getPasswordStrengthColor() : '#444',
                        borderRadius: '2px',
                        transition: 'background 0.3s'
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: getPasswordStrengthColor() }}>
                  Strength: {passwordStrength.level}
                </span>
              </div>
            )}
            {errors.password && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-secondary-dark)" style={{ position: 'absolute', left: '16px', top: '18px' }} />
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: validateConfirmPassword(e.target.value) });
                  }
                }}
                onBlur={() => setErrors({ ...errors, confirmPassword: validateConfirmPassword(confirmPassword) })}
                style={{
                  paddingLeft: '46px',
                  borderColor: errors.confirmPassword ? '#ef4444' : confirmPassword && password === confirmPassword ? '#10b981' : 'var(--border-color)'
                }}
              />
            </div>
            {errors.confirmPassword && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Admin Code Field */}
          <div className="form-group">
            <label htmlFor="adminCode">Admin Code</label>
            <div style={{ position: 'relative' }}>
              <Shield size={16} color="var(--text-secondary-dark)" style={{ position: 'absolute', left: '16px', top: '18px' }} />
              <input
                id="adminCode"
                type="password"
                className="form-input"
                placeholder="Enter admin code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                onBlur={() => setErrors({ ...errors, adminCode: validateAdminCode(adminCode) })}
                style={{
                  paddingLeft: '46px',
                  borderColor: errors.adminCode ? '#ef4444' : 'var(--border-color)'
                }}
              />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary-dark)', marginTop: '4px', display: 'block' }}>
              Required code: ADMIN2026 (demo)
            </span>
            {errors.adminCode && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                {errors.adminCode}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? 'rgba(59, 130, 246, 0.5)' : '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '20px',
              transition: 'background 0.3s'
            }}
          >
            {loading ? (
              <>
                <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Creating Account...
              </>
            ) : (
              <>
                Create Admin Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>
          Already have an account? <Link to="/admin-login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>Admin Login</Link>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminRegister;

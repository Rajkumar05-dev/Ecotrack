import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { api } from '../services/api';
import { Mail, Lock, ArrowRight, Loader, Leaf, HelpCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginSession } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.login(email, password);
      loginSession(response.token, response.userDto);
      const isAdmin = response.userDto?.role?.appRole?.includes('ADMIN');
      navigate(isAdmin ? '/admin-dashboard' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseMock = (mockEmail) => {
    setEmail(mockEmail);
    setPassword('any-password'); // Mock bypass
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 160px)' }}>
      <div className="glass form-container" style={{ width: '100%' }}>
        
        {/* App Logo/Branding inside form */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            display: 'inline-flex',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '12px',
            borderRadius: '50%',
            marginBottom: '15px'
          }}>
            <Leaf size={28} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)', margin: 0 }}>
            Log in to monitor your carbon footprint and schedule collection requests.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--danger)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-secondary-dark)" style={{ position: 'absolute', left: '16px', top: '18px' }} />
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '46px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label htmlFor="password" style={{ margin: 0 }}>Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-secondary-dark)" style={{ position: 'absolute', left: '16px', top: '18px' }} />
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '46px' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }} disabled={loading}>
            {loading ? (
              <>
                <Loader size={18} className="spin" /> Authenticating...
              </>
            ) : (
              <>
                Log In <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo Fallback Box */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--dark-border)',
          fontSize: '0.8rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--primary)', fontWeight: 600 }}>
            <HelpCircle size={14} />
            <span>Need Quick Sandbox Logins?</span>
          </div>
          <p style={{ margin: '0 0 10px 0', color: 'var(--text-secondary-dark)', lineHeight: 1.4 }}>
            If the Spring Boot MySQL server is not running locally, click below to log in with simulated credentials:
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              onClick={() => handleUseMock('raj@ecotrack.com')} 
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '6px 12px', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
            >
              Role User
            </button>
            <button 
              type="button" 
              onClick={() => handleUseMock('admin@ecotrack.com')} 
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '6px 12px', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}
            >
              Role Admin
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary-dark)', margin: '24px 0 0 0' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register here</Link>
        </p>

      </div>
      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;

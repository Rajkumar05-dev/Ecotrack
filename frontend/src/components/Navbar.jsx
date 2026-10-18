import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogOut, User, Menu, X, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logoutSession } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutSession();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isAdmin = user?.role?.appRole?.includes('ADMIN');

  return (
    <>
      {isAdmin && (
        <div style={{
          background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
          color: '#fff',
          padding: '10px 40px',
          textAlign: 'center',
          fontWeight: '700',
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          position: 'relative',
          zIndex: 101
        }}>
          <Shield size={18} />
          🛡️ ADMIN MODE ACTIVE - You have full system access
        </div>
      )}
      <nav className="glass" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '80px',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px',
      borderRadius: '0 0 var(--radius-md) var(--radius-md)',
      borderTop: 'none'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setMobileMenuOpen(false)}>
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Leaf size={20} color="#0b1511" />
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '1.4rem',
          letterSpacing: '-0.03em',
          background: 'linear-gradient(95deg, #a7f3d0 0%, #34d399 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          EcoTrack
        </span>
      </Link>

      {/* Desktop Menu */}
      <div style={{ display: 'none', gap: '30px', alignItems: 'center' }} className="desktop-menu-container">
        <Link to="/" className="nav-link" style={linkStyle}>Home</Link>
        <Link to="/workshops" className="nav-link" style={linkStyle}>Workshops</Link>
        {user ? (
          <>
            <Link to={isAdmin ? '/admin-dashboard' : '/dashboard'} className="nav-link" style={linkStyle}>
              {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '999px',
                background: isAdmin ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: isAdmin ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid var(--dark-border)',
                fontSize: '0.9rem'
              }}>
                {isAdmin ? <Shield size={14} color="#3b82f6" /> : <User size={14} color="#34d399" />}
                <span style={{ color: isAdmin ? '#3b82f6' : 'var(--text-secondary-dark)', fontWeight: 500 }}>
                  {isAdmin ? '🛡️ ADMIN' : user.name}
                </span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <LogOut size={14} /> Log Out
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>Log In</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>Sign Up</Link>
          </div>
        )}
      </div>

      {/* Mobile Toggle */}
      <button 
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-primary-dark)',
          cursor: 'pointer',
          display: 'block'
        }}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="mobile-toggle-btn"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="glass" style={{
          position: 'absolute',
          top: isAdmin ? '165px' : '85px',
          left: '20px',
          right: '20px',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 99
        }}>
          <Link to="/" style={mobileLinkStyle} onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/workshops" style={mobileLinkStyle} onClick={() => setMobileMenuOpen(false)}>Workshops</Link>
          {user ? (
            <>
              <Link to={isAdmin ? '/admin-dashboard' : '/dashboard'} style={mobileLinkStyle} onClick={() => setMobileMenuOpen(false)}>
                {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
              </Link>
              <div style={{
                padding: '12px 0',
                borderTop: '1px solid var(--dark-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary-dark)' }}>
                  Logged in as: <strong>{user.name}</strong> ({isAdmin ? 'Admin' : 'User'})
                </span>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setMobileMenuOpen(false)}>Log In</Link>
              <Link to="/register" className="btn btn-primary" style={{ width: '100%' }} onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}

      {/* Embedded CSS for responsive menu styling without Tailwind */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-menu-container {
            display: flex !important;
          }
          .mobile-toggle-btn {
            display: none !important;
          }
        }
      `}</style>
    </nav>
    </>
  );
};

const linkStyle = {
  fontSize: '0.95rem',
  fontWeight: '500',
  color: 'var(--text-secondary-dark)',
  transition: 'var(--transition-smooth)',
  cursor: 'pointer'
};

const mobileLinkStyle = {
  fontSize: '1.1rem',
  fontWeight: '500',
  color: 'var(--text-primary-dark)',
  padding: '8px 0',
  display: 'block'
};

export default Navbar;

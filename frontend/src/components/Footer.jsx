import { Leaf, Mail, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--dark-border)',
      padding: '40px 24px',
      marginTop: 'auto',
      background: 'rgba(7, 13, 11, 0.5)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '30px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Leaf size={18} color="#10b981" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
              EcoTrack
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)', margin: 0, lineHeight: 1.5 }}>
            Empowering individuals and communities to track waste recycling, register for informative eco-workshops, and minimize carbon footprints.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h5 style={{ color: '#fff', margin: 0, fontSize: '0.95rem' }}>Navigation</h5>
            <a href="/" style={footerLink}>Home</a>
            <a href="/workshops" style={footerLink}>Workshops</a>
            <a href="/dashboard" style={footerLink}>Dashboard</a>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h5 style={{ color: '#fff', margin: 0, fontSize: '0.95rem' }}>Contact Us</h5>
            <span style={footerText}><Mail size={12} /> info@ecotrack.org</span>
            <span style={footerText}><Globe size={12} /> www.ecotrack.org</span>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '30px auto 0',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
        fontSize: '0.8rem',
        color: 'var(--text-secondary-dark)'
      }}>
        <span>&copy; {new Date().getFullYear()} EcoTrack Platform. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '15px' }}>
          <a href="#" style={footerSocial}><Globe size={16} /></a>
        </div>
      </div>
    </footer>
  );
};

const footerLink = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary-dark)',
  transition: 'var(--transition-smooth)',
  textDecoration: 'none'
};

const footerText = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary-dark)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const footerSocial = {
  color: 'var(--text-secondary-dark)',
  transition: 'var(--transition-smooth)'
};

export default Footer;

import { Link } from 'react-router-dom';
import { Leaf, Recycle, Award, ArrowRight, CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section className="hero">
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
          zIndex: -1,
          pointerEvents: 'none'
        }} />
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '999px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--dark-border)',
          marginBottom: '24px',
          fontSize: '0.9rem',
          color: 'var(--text-secondary-dark)'
        }}>
          <Leaf size={14} color="var(--primary)" />
          <span>Eco-Friendly Tracker & Learning Hub</span>
        </div>

        <h1>
          Track Recycling. Learn Composting. <br />
          <span className="gradient-text">Shape a Greener Tomorrow.</span>
        </h1>

        <p>
          EcoTrack connects you to local recycling hubs and educational eco-workshops. Request waste pick-ups, track collection status, learn composting techniques, and monitor your personal contribution to environmental sustainability.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '14px 28px' }}>
              Go to Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px' }}>
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link to="/workshops" className="btn btn-secondary" style={{ padding: '14px 28px' }}>
                Browse Workshops
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Quick Metrics */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 80px', padding: '0 24px' }}>
        <div className="glass" style={{
          borderRadius: 'var(--radius-lg)',
          padding: '40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          textAlign: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '2.5rem', color: 'var(--primary)', fontWeight: 800, margin: '0 0 8px 0' }}>14.8 Tons</h3>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary-dark)' }}>Waste Diverted from Landfills</span>
          </div>
          <div style={{ borderLeft: '1px solid var(--dark-border)', borderRight: '1px solid var(--dark-border)' }} className="metric-divider">
            <h3 style={{ fontSize: '2.5rem', color: 'var(--secondary)', fontWeight: 800, margin: '0 0 8px 0' }}>3,240+</h3>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary-dark)' }}>Workshop Attendees</span>
          </div>
          <div>
            <h3 style={{ fontSize: '2.5rem', color: '#10b981', fontWeight: 800, margin: '0 0 8px 0' }}>98%</h3>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary-dark)' }}>Recycling Success Rate</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container">
        <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '16px' }}>Core Ecosystem Features</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary-dark)', maxWidth: '600px', margin: '0 auto 50px', fontSize: '1rem' }}>
          Discover how EcoTrack simplifies waste auditing and expands sustainable knowledge.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {/* Card 1 */}
          <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              width: 'max-content',
              marginBottom: '20px'
            }}>
              <Recycle size={24} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#fff' }}>Recycle Scheduling</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary-dark)', lineHeight: 1.5, margin: 0 }}>
              Easily schedule curbside pickups for plastics, cardboard, glass, or e-waste. Submit item weight details, upload photos, and track the status of requests instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{
              background: 'rgba(45, 212, 191, 0.1)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              width: 'max-content',
              marginBottom: '20px'
            }}>
              <CalendarDays size={24} color="var(--secondary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#fff' }}>Eco Workshops</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary-dark)', lineHeight: 1.5, margin: 0 }}>
              Join interactive, expert-led training sessions on zero-waste living, backyard composting, and organic gardening. Secure payments are powered by Razorpay.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              width: 'max-content',
              marginBottom: '20px'
            }}>
              <Award size={24} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#fff' }}>Impact Metrics</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary-dark)', lineHeight: 1.5, margin: 0 }}>
              Track your carbon footprint reductions. View structured analytical stats that highlight your overall environmental benefit to motivate continued sustainable action.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="container" style={{ marginTop: '60px' }}>
        <div className="glass" style={{
          borderRadius: 'var(--radius-xl)',
          padding: '60px 40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(18, 30, 26, 0.9) 0%, rgba(11, 21, 17, 0.9) 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '16px', color: '#fff' }}>Ready to minimize your ecological footprint?</h2>
          <p style={{ color: 'var(--text-secondary-dark)', maxWidth: '600px', margin: '0 auto 30px', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Join thousands of active users and start recycling smarter. Access webinars, log pickups, and secure certifications.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <Link to="/register" className="btn btn-primary">Join Today</Link>
            <Link to="/workshops" className="btn btn-secondary">Learn Composting</Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .metric-divider {
            border-left: none !important;
            border-right: none !important;
            padding: 20px 0;
            border-top: 1px solid var(--dark-border);
            border-bottom: 1px solid var(--dark-border);
          }
        }
      `}</style>
    </div>
  );
};

export default Home;

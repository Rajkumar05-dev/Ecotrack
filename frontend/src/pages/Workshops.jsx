import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import WorkshopCard from '../components/WorkshopCard';
import { Plus, X, Search, BookOpen, Loader } from 'lucide-react';

const Workshops = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workshopsError, setWorkshopsError] = useState('');
  const [search, setSearch] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingNeedsLogin, setBookingNeedsLogin] = useState(false);
  const [enrollmentState, setEnrollmentState] = useState({ userId: null, ids: [] });
  const enrolledIds = enrollmentState.userId === user?.id ? enrollmentState.ids : [];
  const enrollmentsLoading = Boolean(user?.id) && enrollmentState.userId !== user.id;

  // Create / Edit Workshop Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [wsName, setWsName] = useState('');
  const [wsDesc, setWsDesc] = useState('');
  const [wsPrice, setWsPrice] = useState('');
  const [wsDate, setWsDate] = useState('');
  const [wsTime, setWsTime] = useState('');
  const [wsDuration, setWsDuration] = useState('');
  const [wsVenue, setWsVenue] = useState('');
  const [wsImage, setWsImage] = useState('');
  const [formError, setFormError] = useState('');

  const isAdmin = user?.role?.appRole?.includes('ADMIN');

  const fetchWorkshops = useCallback(async () => {
    try {
      const data = await api.getWorkshops();
      setWorkshops(data);
      setWorkshopsError('');
    } catch (err) {
      setWorkshopsError(err.message || 'Unable to load workshops.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchWorkshops();
    });
  }, [fetchWorkshops]);

  useEffect(() => {
    if (!user?.id) return undefined;

    let active = true;
    api.getUserEnrollments(user.id)
      .then((enrollments) => {
        if (!active) return;
        const paidWorkshopIds = enrollments
          .filter((enrollment) => enrollment.paymentStatus === 'SUCCESS')
          .map((enrollment) => enrollment.workShop?.id)
          .filter((workshopId) => Number.isInteger(workshopId));
        setEnrollmentState({ userId: user.id, ids: paidWorkshopIds });
        localStorage.setItem(`enrolled_ws_${user.id}`, JSON.stringify(paidWorkshopIds));
      })
      .catch((error) => {
        console.error('Unable to load workshop enrollments:', error);
        if (active) setEnrollmentState({ userId: user.id, ids: [] });
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const handleEnroll = async (workshop) => {
    if (!user) {
      setBookingNeedsLogin(true);
      setBookingError('Sign in to book a workshop.');
      return;
    }

    if (!localStorage.getItem('ecotrack_token')) {
      setBookingNeedsLogin(true);
      setBookingError('Your login token is missing. Sign in again to continue booking.');
      return;
    }

    setBookingError('');
    setBookingNeedsLogin(false);
    try {
      // Step 1: Request enrollment from backend (creates Razorpay order)
      const order = await api.enrollInWorkshop(user.id, workshop.id);
      if (!order?.razorpayOrderId) {
        throw new Error('The payment order could not be created.');
      }

      const isMockOrder = order.razorpayOrderId?.startsWith('mock_');

      if (isMockOrder) {
        throw new Error('A real payment order was not created. Please check the backend configuration and try again.');
      }
      if (!Number.isSafeInteger(Math.round(Number(order.amount) * 100)) || Number(order.amount) <= 0) {
        throw new Error('The payment order has an invalid amount.');
      }

      const [config, rzpLoaded] = await Promise.all([
        api.getRazorpayKey(),
        loadRazorpayScript()
      ]);
      if (!config?.key || !rzpLoaded || !window.Razorpay) {
        throw new Error('Razorpay checkout is unavailable. Please try again later.');
      }

      openRazorpaySDK(order, workshop, config.key);
    } catch (err) {
      if (err.status === 401) {
        setBookingNeedsLogin(true);
        setBookingError('The backend rejected your login token. Sign in again, then retry booking. If this happens immediately after signing in, restart the backend so it uses the current JWT secret.');
        return;
      }
      setBookingError('Failed to initiate enrollment: ' + err.message);
    }
  };

  // Helper to load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => {
        script.remove();
        resolve(false);
      };
      script.async = true;
      document.body.appendChild(script);
    });
  };

  // Open the real Razorpay payment window
  const openRazorpaySDK = (order, workshop, key) => {
    const options = {
      key,
      amount: Math.round(Number(order.amount) * 100),
      currency: "INR",
      name: "EcoTrack",
      description: `Enroll: ${workshop.name}`,
      order_id: order.razorpayOrderId,
      handler: async function (response) {
        try {
          await api.confirmEnrollment(
            order.razorpayOrderId,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
          completeEnrollmentLocal(workshop.id);
          alert('Successfully Registered for Workshop!');
        } catch (err) {
          setBookingError('Payment verification failed: ' + err.message);
        }
      },
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.phoneNo
      },
      theme: {
        color: "#10b981"
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        const error = response.error || {};
        const diagnostics = {
          code: error.code,
          reason: error.reason,
          source: error.source,
          step: error.step
        };
        console.error('Razorpay payment failed', diagnostics);

        const details = [
          error.code && `Code: ${error.code}`,
          error.reason && `Reason: ${error.reason}`,
          error.step && `Step: ${error.step}`,
          error.source && `Source: ${error.source}`
        ].filter(Boolean);
        alert([
          error.description || 'Payment could not be completed.',
          details.length ? details.join('\n') : ''
        ].filter(Boolean).join('\n\n'));
      });
      rzp.open();
    } catch (error) {
      console.error('Unable to initialize Razorpay checkout', error);
      alert('Razorpay checkout failed to open. Please try again.');
    }
  };

  const completeEnrollmentLocal = (wsId) => {
    const updatedIds = [...new Set([...enrolledIds, wsId])];
    setEnrollmentState({ userId: user.id, ids: updatedIds });
    if (user?.id) {
      localStorage.setItem(`enrolled_ws_${user.id}`, JSON.stringify(updatedIds));
    }
  };

  // Create or Update Form Handling
  const handleOpenCreateModal = () => {
    setEditingWorkshop(null);
    setWsName('');
    setWsDesc('');
    setWsPrice('');
    setWsDate('');
    setWsTime('');
    setWsDuration('');
    setWsVenue('');
    setWsImage('');
    setFormError('');
    setShowFormModal(true);
  };

  const handleOpenEditModal = (ws) => {
    setEditingWorkshop(ws);
    setWsName(ws.name);
    setWsDesc(ws.description);
    setWsPrice(ws.price.toString());
    setWsDate(ws.registrationDate || '');
    // Extract time matching input datetime-local
    setWsTime(ws.time ? ws.time.substring(0, 16) : '');
    setWsDuration(ws.duration.toString());
    setWsVenue(ws.venue);
    setWsImage(ws.image || '');
    setFormError('');
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!wsName || !wsDesc || !wsPrice || !wsDate || !wsTime || !wsDuration || !wsVenue) {
      setFormError('Please fill all mandatory fields.');
      return;
    }

    const payload = {
      name: wsName,
      description: wsDesc,
      price: parseInt(wsPrice),
      registrationDate: wsDate,
      time: wsTime + ':00', // standard ISO timestamp format extension
      duration: parseInt(wsDuration),
      venue: wsVenue,
      image: wsImage || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600'
    };

    try {
      if (editingWorkshop) {
        await api.updateWorkshop(editingWorkshop.id, payload);
      } else {
        await api.createWorkshop(payload);
      }
      setShowFormModal(false);
      fetchWorkshops();
    } catch (err) {
      setFormError(err.message || 'Action failed.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workshop?')) {
      try {
        await api.deleteWorkshop(id);
        fetchWorkshops();
      } catch (err) {
        alert('Failed to delete workshop: ' + err.message);
      }
    }
  };

  const filteredWorkshops = workshops.filter(w =>
    (w.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (w.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (w.venue || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ minHeight: '80vh' }}>
      
      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '40px',
        borderBottom: '1px solid var(--dark-border)',
        paddingBottom: '24px'
      }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '8px' }}>Eco Workshops & Seminars</h2>
          <p style={{ color: 'var(--text-secondary-dark)', margin: 0, fontSize: '0.95rem' }}>
            Book seats to interactive local eco sessions, webinars, and zero-waste Masterclasses.
          </p>
        </div>

        {isAdmin && (
          <button onClick={handleOpenCreateModal} className="btn btn-primary">
            <Plus size={16} /> Create Workshop
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass" style={{
        padding: '16px 24px',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '32px'
      }}>
        <Search size={18} color="var(--text-secondary-dark)" />
        <input 
          type="text" 
          placeholder="Search workshops by name, keyword, or venue..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem',
            width: '100%'
          }}
        />
      </div>

      {bookingError && (
        <div role="alert" style={{
          marginBottom: '24px',
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          background: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--danger)'
        }}>
          {bookingError}
          {bookingNeedsLogin && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/login', {
                state: { from: '/workshops' }
              })}
              style={{ marginLeft: '12px' }}
            >
              Sign in
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px', color: 'var(--text-secondary-dark)' }}>
          <Loader size={40} className="spin" />
          <span>Loading Workshops...</span>
        </div>
      ) : workshopsError ? (
        <div role="alert" className="glass" style={{
          textAlign: 'center',
          padding: '48px 32px',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--text-secondary-dark)'
        }}>
          <h3 style={{ color: 'var(--danger)' }}>Workshops are temporarily unavailable</h3>
          <p>{workshopsError}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={fetchWorkshops}
          >
            Retry
          </button>
        </div>
      ) : filteredWorkshops.length === 0 ? (
        <div className="glass" style={{
          textAlign: 'center',
          padding: '80px 40px',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--text-secondary-dark)'
        }}>
          <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3>No Workshops Found</h3>
          <p style={{ maxWidth: '400px', margin: '8px auto 0' }}>
            We couldn't find any workshops matching your search. Please check your keywords or create one if you're an Admin!
          </p>
        </div>
      ) : (
        <div className="grid">
          {filteredWorkshops.map(ws => (
            <WorkshopCard 
              key={ws.id}
              workshop={ws}
              onEnroll={handleEnroll}
              isAdmin={isAdmin}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
              isEnrolled={enrolledIds.includes(ws.id)}
              isEnrollmentLoading={enrollmentsLoading}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Workshop Form Modal */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="glass modal-content">
            <button 
              onClick={() => setShowFormModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary-dark)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '24px' }}>
              {editingWorkshop ? 'Edit Workshop details' : 'Create New Eco Workshop'}
            </h3>

            {formError && (
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
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Workshop Title *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={wsName} 
                  onChange={(e) => setWsName(e.target.value)} 
                  placeholder="e.g. Backyard Composting Basics"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea 
                  className="form-input" 
                  value={wsDesc} 
                  onChange={(e) => setWsDesc(e.target.value)} 
                  placeholder="Detailed outline of the session activities..."
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label>Registration Price (INR) *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={wsPrice} 
                    onChange={(e) => setWsPrice(e.target.value)} 
                    placeholder="299"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration (Minutes) *</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={wsDuration} 
                    onChange={(e) => setWsDuration(e.target.value)} 
                    placeholder="120"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label>Reg. Deadline Date *</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={wsDate} 
                    onChange={(e) => setWsDate(e.target.value)} 
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Event Start Time *</label>
                  <input 
                    type="datetime-local" 
                    className="form-input" 
                    value={wsTime} 
                    onChange={(e) => setWsTime(e.target.value)} 
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Venue / Location *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={wsVenue} 
                  onChange={(e) => setWsVenue(e.target.value)} 
                  placeholder="e.g. Block C Hall / Zoom Meeting link"
                  required
                />
              </div>

              <div className="form-group">
                <label>Banner Image URL (Unsplash/HTTP)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={wsImage} 
                  onChange={(e) => setWsImage(e.target.value)} 
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowFormModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingWorkshop ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default Workshops;

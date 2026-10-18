import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Recycle, Calendar, User, ShieldAlert, Plus, Upload, XCircle,
  BarChart3, HelpCircle, Loader, ArrowUpRight
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [recycleRequests, setRecycleRequests] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State for new Request
  const [itemType, setItemType] = useState('Plastic Bottles');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestError, setRequestError] = useState('');

  // Admin Actions State
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingAdminAction, setProcessingAdminAction] = useState(false);

  const isAdmin = user?.role?.appRole?.includes('ADMIN');

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      if (isAdmin) {
        const adminData = await api.getAllRecycleRequestsAdmin();
        setAdminRequests(adminData);
      } else {
        // Recycle requests for user (prefer server endpoint)
        try {
          const userReqs = await api.getUserRecycleRequests(user.id);
          if (!Array.isArray(userReqs)) {
            throw new Error('Unexpected user requests response');
          }
          setRecycleRequests(userReqs);
        } catch (e) {
          console.error('Error loading user recycle requests:', e);
          const mockRequests = await api.getAllRecycleRequestsAdmin();
          const filtered = mockRequests.filter(r => r.user?.id === user.id);
          setRecycleRequests(filtered.length > 0 ? filtered : (user.recycleRequests || []));
        }

        // Load recent enrollments for current user
        if (user?.id) {
          const userEnrollments = await api.getUserEnrollments(user.id);
          setEnrollments(Array.isArray(userEnrollments) ? userEnrollments : []);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchData();
    });
  }, [fetchData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const openEnrollmentDetails = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowEnrollmentModal(true);
  };

  const closeEnrollmentDetails = () => {
    setSelectedEnrollment(null);
    setShowEnrollmentModal(false);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      setRequestError('Please input a valid quantity.');
      return;
    }

    setSubmittingRequest(true);
    setRequestError('');
    setRequestSuccess('');

    try {
      // Step 1: Submit base request
      const payload = {
        itemType,
        quantity: parseInt(quantity),
        unit,
        itemImage: null
      };

      const newRequest = await api.submitRecycleRequest(user.id, payload);
      let requestToAdd = { ...newRequest };

      // Step 2: Upload image if selected
      if (selectedFile) {
        try {
          const imageResult = await api.uploadRequestImage(newRequest.id, selectedFile);
          requestToAdd = { ...requestToAdd, itemImage: imageResult?.imageName || requestToAdd.itemImage };
        } catch (imgErr) {
          console.warn('Image upload failed but request was saved:', imgErr);
        }
      }

      setRecycleRequests(prev => [requestToAdd, ...prev]);
      setRequestSuccess('Recycle request submitted successfully! Pending approval.');
      setItemType('Plastic Bottles');
      setQuantity('');
      setSelectedFile(null);
      setImagePreview(null);
      
      // Refresh list and counts
      fetchData();
    } catch (err) {
      setRequestError(err.message || 'Submission failed.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    setProcessingAdminAction(true);
    try {
      await api.approveRecycleRequest(requestId);
      fetchData();
    } catch (err) {
      alert('Failed to approve request: ' + err.message);
    } finally {
      setProcessingAdminAction(false);
    }
  };

  const handleRejectRequestSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;

    setProcessingAdminAction(true);
    try {
      await api.rejectRecycleRequest(rejectingId, rejectReason);
      setRejectingId(null);
      setRejectReason('');
      fetchData();
    } catch (err) {
      alert('Failed to reject request: ' + err.message);
    } finally {
      setProcessingAdminAction(false);
    }
  };

  // User Stats Calculation
  const approvedRequests = recycleRequests.filter(r => r.requestStatus === 'APPROVED');
  const pendingRequests = recycleRequests.filter(r => r.requestStatus === 'PENDING');

  const totalItemsRecycled = approvedRequests.reduce((acc, curr) => acc + curr.quantity, 0);
  const carbonOffset = (totalItemsRecycled * 0.14).toFixed(1); // 0.14kg CO2 saved per item

  // Totals grouped by unit (kg / pieces / ton)
  const totalsByUnit = approvedRequests.reduce((acc, curr) => {
    const u = curr.unit || 'pieces';
    acc[u] = (acc[u] || 0) + curr.quantity;
    return acc;
  }, {});

  // For UI: regular users should see all their requests (pending + approved + rejected)
  const userVisibleRequests = isAdmin ? adminRequests : recycleRequests;

  return (
    <div className="dashboard-layout">
      
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar" style={{ background: isAdmin ? 'rgba(59, 130, 246, 0.05)' : undefined }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{
            background: isAdmin ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.1)',
            padding: '10px',
            borderRadius: 'var(--radius-md)'
          }}>
            <User size={20} color={isAdmin ? '#3b82f6' : 'var(--primary)'} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ color: '#fff', fontSize: '1.05rem', margin: 0 }}>{user.name}</h4>
              {isAdmin && (
                <span style={{
                  background: '#3b82f6',
                  color: '#fff',
                  fontSize: '0.6rem',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  Admin
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary-dark)' }}>
              {isAdmin ? 'System Administrator' : 'Platform Contributor'}
            </span>
          </div>
        </div>

        <ul className="sidebar-menu">
          <li 
            className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={18} /> Overview
          </li>
          
          {!isAdmin && (
            <>
              <li 
                className={`sidebar-item ${activeTab === 'recycle' ? 'active' : ''}`}
                onClick={() => setActiveTab('recycle')}
              >
                <Recycle size={18} /> Recycle Pickups
              </li>
              <li 
                className={`sidebar-item ${activeTab === 'compost' ? 'active' : ''}`}
                onClick={() => setActiveTab('compost')}
              >
                <HelpCircle size={18} /> Composting Guide
              </li>
            </>
          )}

          {isAdmin && (
            <>
              <li 
                className={`sidebar-item ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
                style={{ borderLeft: '3px solid #3b82f6' }}
              >
                <ShieldAlert size={18} /> Manage Pickups ({adminRequests.filter(r => r.requestStatus === 'PENDING').length})
              </li>
              <li 
                className={`sidebar-item ${activeTab === 'admin-workshops' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin-workshops')}
                style={{ borderLeft: '3px solid #3b82f6' }}
              >
                <Calendar size={18} /> Manage Workshops
              </li>
              <li 
                className={`sidebar-item ${activeTab === 'admin-reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin-reports')}
                style={{ borderLeft: '3px solid #3b82f6' }}
              >
                <BarChart3 size={18} /> Reports & Analytics
              </li>
            </>
          )}
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">
        {isAdmin && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              background: '#3b82f6',
              color: '#fff',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 style={{ color: '#3b82f6', margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Admin Dashboard</h3>
              <p style={{ color: 'var(--text-secondary-dark)', margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                Manage recycling requests, workshops, and view system analytics
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary-dark)', gap: '15px' }}>
            <Loader size={40} className="spin" />
            <span>Syncing database records...</span>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div>
                <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '24px' }}>Overview Metrics</h3>
                
                {/* Stats Panel */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                  {isAdmin ? (
                    <>
                      <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>Total Requests Logged</span>
                        <h2 style={{ fontSize: '2.2rem', color: '#fff', marginTop: '10px' }}>{adminRequests.length}</h2>
                      </div>
                      <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>Pending Pickups</span>
                        <h2 style={{ fontSize: '2.2rem', color: 'var(--warning)', marginTop: '10px' }}>
                          {adminRequests.filter(r => r.requestStatus === 'PENDING').length}
                        </h2>
                      </div>
                      <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>Approved Recycles</span>
                        <h2 style={{ fontSize: '2.2rem', color: 'var(--success)', marginTop: '10px' }}>
                          {adminRequests.filter(r => r.requestStatus === 'APPROVED').length}
                        </h2>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>Items Recycled</span>
                        <div style={{ marginTop: '10px' }}>
                          {Object.keys(totalsByUnit).length === 0 ? (
                            <h2 style={{ fontSize: '2.2rem', color: 'var(--primary)', marginTop: '10px' }}>0</h2>
                          ) : (
                            Object.entries(totalsByUnit).map(([u, val]) => (
                              <div key={u} style={{ color: '#fff', fontSize: '1.05rem', marginTop: '6px' }}>{val} {u}</div>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>Carbon Offset</span>
                        <h2 style={{ fontSize: '2.2rem', color: 'var(--secondary)', marginTop: '10px' }}>{carbonOffset} <span style={{ fontSize: '1rem' }}>kg CO₂e</span></h2>
                      </div>
                      <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>Active Requests</span>
                        <h2 style={{ fontSize: '2.2rem', color: 'var(--warning)', marginTop: '10px' }}>{pendingRequests.length}</h2>
                      </div>
                    </>
                  )}
                </div>

                {/* Dashboard Sub-content */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }} className="overview-details-grid">
                  
                  {/* Left Column: Recent Logs */}
                  <div>
                    <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>
                      {isAdmin ? 'Recent Global Pickups' : 'Your Recent Pickups'}
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {userVisibleRequests.slice(0, 4).map(req => (
                        <div key={req.id} className="glass" style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ color: '#fff', display: 'block', fontSize: '0.95rem' }}>{req.itemType}</strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary-dark)' }}>
                              Quantity: {req.quantity} {req.unit || 'items'} {isAdmin && `• User: ${req.user?.name || 'Unknown'}`}
                            </span>
                            {req.reason && (
                              <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: 'var(--danger)' }}>
                                Reason: "{req.reason}"
                              </p>
                            )}
                          </div>
                          
                          <span className={`badge ${
                            req.requestStatus === 'APPROVED' ? 'badge-approved' : 
                            req.requestStatus === 'REJECTED' ? 'badge-rejected' : 'badge-pending'
                          }`}>
                            {req.requestStatus}
                          </span>
                        </div>
                      ))}
                      {(isAdmin ? adminRequests : recycleRequests).length === 0 && (
                        <p style={{ color: 'var(--text-secondary-dark)', fontSize: '0.9rem' }}>No logged requests found.</p>
                      )}
                    </div>

                    {!isAdmin && (
                      <div style={{ marginTop: '28px' }}>
                        <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px' }}>Your Recent Enrollments</h4>
                        <div style={{ display: 'grid', gap: '14px' }}>
                          {enrollments.slice(0, 4).map(enrollment => (
                            <div key={enrollment.razorpayOrderId} onClick={() => openEnrollmentDetails(enrollment)} className="glass" style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
                                <div>
                                  <strong style={{ color: '#fff', display: 'block', fontSize: '0.95rem' }}>{enrollment.workShop?.name || 'Workshop'}</strong>
                                  <span style={{ color: 'var(--text-secondary-dark)', fontSize: '0.8rem' }}>
                                    ₹{enrollment.amount} • {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <span className="badge badge-approved" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                                  {enrollment.paymentStatus || 'PENDING'}
                                </span>
                              </div>
                            </div>
                          ))}
                          {enrollments.length === 0 && (
                            <p style={{ color: 'var(--text-secondary-dark)', fontSize: '0.9rem' }}>No recent enrollments yet. Enroll in a workshop to see it here.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Educational banner / Stats card */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass" style={{
                      padding: '24px',
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.05) 0%, transparent 100%)',
                      borderLeft: '4px solid var(--secondary)'
                    }}>
                      <h4 style={{ color: '#fff', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Eco Tip of the Day
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)', lineHeight: 1.5, margin: 0 }}>
                        Wash plastic and metal recycling containers before disposal! Leftover organic debris ruins the batch during recycling processing.
                      </p>
                    </div>

                    <div className="glass" style={{
                      padding: '24px',
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)',
                      borderLeft: '4px solid var(--primary)'
                    }}>
                      <h4 style={{ color: '#fff', margin: '0 0 10px 0' }}>Join Active Learning</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)', lineHeight: 1.5, marginBottom: '14px' }}>
                        Enroll in webinars to boost composting skills and lower carbon footprints.
                      </p>
                      <button onClick={() => navigate('/workshops')} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                        Go to Workshops <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* RECYCLE REQUESTS TAB (USER ONLY) */}
            {activeTab === 'recycle' && !isAdmin && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '40px' }} className="recycle-grid">
                  
                  {/* Submission Form */}
                  <div>
                    <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '24px' }}>Log Recycle Pickup</h3>
                    
                    {requestError && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '15px' }}>
                        {requestError}
                      </div>
                    )}

                    {requestSuccess && (
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '10px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '15px' }}>
                        {requestSuccess}
                      </div>
                    )}

                    <form onSubmit={handleSubmitRequest} className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                      <div className="form-group">
                        <label>Material / Item Category</label>
                        <select 
                          className="form-input" 
                          value={itemType} 
                          onChange={(e) => setItemType(e.target.value)}
                          style={{ background: '#0b1511', color: '#fff' }}
                        >
                          <option>Plastic Bottles</option>
                          <option>Cardboard Boxes</option>
                          <option>Glass Jars</option>
                          <option>Metal Cans</option>
                          <option>Organic Waste (for composting)</option>
                          <option>E-Waste / Electronics</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div className="quantity-input" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <button type="button" onClick={() => { setQuantity(prev => String(Math.max(0, (parseInt(prev||'0')||0) - 1))); }} className="qty-btn" aria-label="Decrease" style={{ padding: '6px 8px', border: 'none', background: 'transparent', color: 'var(--text-secondary-dark)', cursor: 'pointer', borderRadius: '8px' }}>▾</button>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="form-input"
                            placeholder="e.g. 50"
                            value={quantity}
                            onChange={(e) => {
                              const raw = e.target.value || '';
                              const v = Array.from(raw).filter(ch => ch >= '0' && ch <= '9').join('');
                              setQuantity(v);
                            }}
                            required
                            style={{ width: '84px', textAlign: 'center', background: 'transparent', border: 'none', color: '#fff', fontSize: '1rem' }}
                          />
                          <button type="button" onClick={() => { setQuantity(prev => String((parseInt(prev||'0')||0) + 1)); }} className="qty-btn" aria-label="Increase" style={{ padding: '6px 8px', border: 'none', background: 'transparent', color: 'var(--text-secondary-dark)', cursor: 'pointer', borderRadius: '8px' }}>▴</button>
                        </div>
                        <div className="unit-toggle" role="radiogroup" aria-label="Unit selector" style={{ display: 'flex', gap: '8px' }}>
                          {['kg','pieces','ton'].map(u => (
                            <button
                              key={u}
                              type="button"
                              aria-pressed={unit === u}
                              className={`unit-btn ${unit === u ? 'active' : ''}`}
                              onClick={() => setUnit(u)}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.06)',
                                background: unit === u ? 'linear-gradient(90deg, #0ea5a3, #06b6d4)' : 'transparent',
                                color: unit === u ? '#fff' : 'var(--text-secondary-dark)',
                                cursor: 'pointer',
                                minWidth: '72px',
                                fontSize: '0.9rem'
                              }}
                            >
                              {u}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Upload Item Image (Mandatory verification)</label>
                        <div style={{
                          border: '2px dashed var(--dark-border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '20px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'var(--transition-smooth)'
                        }} className="image-dropzone">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
                          />
                          
                          {imagePreview ? (
                            <img src={imagePreview} alt="Upload preview" style={{ maxHeight: '120px', borderRadius: 'var(--radius-sm)' }} />
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-secondary-dark)' }}>
                              <Upload size={24} />
                              <span style={{ fontSize: '0.85rem' }}>Click to browse or drop files</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={submittingRequest}>
                        {submittingRequest ? <><Loader size={16} className="spin" /> Logging Request...</> : 'Submit Request'}
                      </button>
                    </form>
                  </div>

                  {/* Previous Requests Table */}
                  <div>
                    <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '24px' }}>Submission Log</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {userVisibleRequests.map(req => (
                        <div key={req.id} className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <div>
                              <h4 style={{ color: '#fff', margin: 0 }}>{req.itemType}</h4>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary-dark)' }}>Quantity: {req.quantity} {req.unit || 'items'}</span>
                            </div>
                            <span className={`badge ${
                              req.requestStatus === 'APPROVED' ? 'badge-approved' : 
                              req.requestStatus === 'REJECTED' ? 'badge-rejected' : 'badge-pending'
                            }`}>
                              {req.requestStatus}
                            </span>
                          </div>

                          {req.itemImage && (
                            <div style={{ width: '100px', height: '60px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', margin: '10px 0', border: '1px solid var(--dark-border)' }}>
                              <img src={api.getRequestImageUrl(req.itemImage)} alt="Pickup waste item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}

                          {req.reason && (
                            <div style={{
                              marginTop: '10px',
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(239, 68, 68, 0.05)',
                              border: '1px solid rgba(239, 68, 68, 0.1)',
                              fontSize: '0.8rem',
                              color: 'var(--text-secondary-dark)'
                            }}>
                              <strong style={{ color: 'var(--danger)' }}>Rejection Feedback:</strong> "{req.reason}"
                            </div>
                          )}
                        </div>
                      ))}

                      {recycleRequests.length === 0 && (
                        <div className="glass" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary-dark)', borderRadius: 'var(--radius-md)' }}>
                          No recycle pickup logs recorded.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* COMPOSTING GUIDE (USER ONLY) */}
            {activeTab === 'compost' && !isAdmin && (
              <div>
                <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '8px' }}>Composting Knowledge Base</h3>
                <p style={{ color: 'var(--text-secondary-dark)', marginBottom: '32px' }}>Understand composting basics to recycle organic wastes effectively.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="glass" style={{ padding: '30px', borderRadius: 'var(--radius-lg)' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '1.2rem' }}>1. The Chemistry: Greens vs. Browns</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary-dark)', lineHeight: 1.6, margin: 0 }}>
                      Successful compost relies on balancing Nitrogen-rich organic materials ("Greens") and Carbon-rich structural fibers ("Browns"). Maintain a ratio of roughly 1 part Greens to 2 parts Browns to promote healthy bacterial decomposition.
                    </p>
                    <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)', marginTop: '12px', paddingLeft: '20px', lineHeight: 1.6 }}>
                      <li><strong>Greens (Nitrogen):</strong> Vegetable scraps, fruit peels, coffee grounds, fresh grass clippings.</li>
                      <li><strong>Browns (Carbon):</strong> Dry leaves, shredded cardboard, wood chips, paper towels.</li>
                    </ul>
                  </div>

                  <div className="glass" style={{ padding: '30px', borderRadius: 'var(--radius-lg)' }}>
                    <h4 style={{ color: 'var(--secondary)', marginBottom: '12px', fontSize: '1.2rem' }}>2. Avoid Composting These Items</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary-dark)', lineHeight: 1.6, margin: 0 }}>
                      Some organic components create foul odors, attract pests, or harbor pathogens and must never be placed in home compost pits:
                    </p>
                    <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)', marginTop: '12px', paddingLeft: '20px', lineHeight: 1.6 }}>
                      <li>Dairy products, butter, or cooking oils.</li>
                      <li>Meat, bones, fish scraps, or fat.</li>
                      <li>Pet waste or litter.</li>
                      <li>Diseased plants or weeds with mature seedheads.</li>
                    </ul>
                  </div>

                  <div className="glass" style={{ padding: '30px', borderRadius: 'var(--radius-lg)' }}>
                    <h4 style={{ color: '#fff', marginBottom: '12px', fontSize: '1.2rem' }}>3. Maintaining Your Pile</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary-dark)', lineHeight: 1.6, margin: 0 }}>
                      Aerobic bacteria require oxygen and dampness. Turn your compost heap once a week using a pitchfork to aerate the center. Sprinkle water over the bin if the structural material feels dry to the touch (it should feel like a wrung-out sponge).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ADMIN PICKUPS MANAGEMENT TAB */}
            {activeTab === 'admin' && isAdmin && (
              <div>
                <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '24px' }}>Manage Submitted Pickups</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {adminRequests.map(req => (
                    <div key={req.id} className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <h4 style={{ color: '#fff', margin: 0 }}>{req.itemType}</h4>
                            <span className={`badge ${
                              req.requestStatus === 'APPROVED' ? 'badge-approved' : 
                              req.requestStatus === 'REJECTED' ? 'badge-rejected' : 'badge-pending'
                            }`}>
                              {req.requestStatus}
                            </span>
                          </div>
                          
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span><strong>Submitted by:</strong> {req.user?.name || 'Test User'} ({req.user?.email || 'N/A'})</span>
                            <span><strong>Quantity:</strong> {req.quantity} {req.unit || 'units'}</span>
                            {req.reason && <span><strong>Notes/Reason:</strong> "{req.reason}"</span>}
                          </div>
                        </div>

                        {/* Image for admin verification */}
                        {req.itemImage && (
                          <div style={{ width: '150px', height: '100px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--dark-border)' }}>
                            <img src={api.getRequestImageUrl(req.itemImage)} alt="waste check" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                      </div>

                      {/* Approval/Rejection actions */}
                      {req.requestStatus === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderTop: '1px solid var(--dark-border)', paddingTop: '20px' }}>
                          <button 
                            onClick={() => handleApproveRequest(req.id)}
                            className="btn btn-primary"
                            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                            disabled={processingAdminAction}
                          >
                            Approve Pickup
                          </button>
                          
                          {rejectingId === req.id ? (
                            <form onSubmit={handleRejectRequestSubmit} style={{ display: 'flex', gap: '10px', flex: 1 }}>
                              <input 
                                type="text"
                                className="form-input"
                                placeholder="Specify rejection reason..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                                required
                              />
                              <button type="submit" className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                                Reject
                              </button>
                              <button type="button" onClick={() => setRejectingId(null)} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                                Cancel
                              </button>
                            </form>
                          ) : (
                            <button 
                              onClick={() => { setRejectingId(req.id); setRejectReason(''); }}
                              className="btn btn-danger"
                              style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                              disabled={processingAdminAction}
                            >
                              Reject Pickup...
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {adminRequests.length === 0 && (
                    <div className="glass" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary-dark)', borderRadius: 'var(--radius-lg)' }}>
                      No submitted requests in system database.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ADMIN - MANAGE WORKSHOPS TAB */}
            {activeTab === 'admin-workshops' && isAdmin && (
              <div>
                <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '24px' }}>Manage Workshops</h3>
                
                <button style={{
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '24px'
                }}>
                  <Plus size={18} />
                  Create New Workshop
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {/* Placeholder workshop cards */}
                  {[1, 2, 3].map(i => (
                    <div key={i} className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                      <h4 style={{ color: '#fff', marginTop: 0 }}>Workshop {i}</h4>
                      <p style={{ color: 'var(--text-secondary-dark)', fontSize: '0.9rem' }}>
                        Workshop title and description will appear here with pricing and scheduling options.
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        <button style={{
                          flex: 1,
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#3b82f6',
                          border: '1px solid #3b82f6',
                          padding: '8px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          Edit
                        </button>
                        <button style={{
                          flex: 1,
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#ef4444',
                          border: '1px solid #ef4444',
                          padding: '8px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADMIN - REPORTS & ANALYTICS TAB */}
            {activeTab === 'admin-reports' && isAdmin && (
              <div>
                <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '24px' }}>Reports & Analytics</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                  <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>Total Users</span>
                    <h2 style={{ fontSize: '2.2rem', color: '#3b82f6', marginTop: '10px' }}>245</h2>
                  </div>
                  <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>Total Requests</span>
                    <h2 style={{ fontSize: '2.2rem', color: '#10b981', marginTop: '10px' }}>{adminRequests.length}</h2>
                  </div>
                  <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>Total Workshops</span>
                    <h2 style={{ fontSize: '2.2rem', color: '#f59e0b', marginTop: '10px' }}>12</h2>
                  </div>
                  <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>Carbon Saved (kg)</span>
                    <h2 style={{ fontSize: '2.2rem', color: '#06b6d4', marginTop: '10px' }}>1,240</h2>
                  </div>
                </div>

                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }}>
                  <h4 style={{ color: '#fff', marginTop: 0 }}>Request Status Distribution</h4>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>Pending</span>
                      <div style={{ fontSize: '1.8rem', color: 'var(--warning)', marginTop: '8px' }}>
                        {adminRequests.filter(r => r.requestStatus === 'PENDING').length}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>Approved</span>
                      <div style={{ fontSize: '1.8rem', color: 'var(--success)', marginTop: '8px' }}>
                        {adminRequests.filter(r => r.requestStatus === 'APPROVED').length}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary-dark)' }}>Rejected</span>
                      <div style={{ fontSize: '1.8rem', color: '#ef4444', marginTop: '8px' }}>
                        {adminRequests.filter(r => r.requestStatus === 'REJECTED').length}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                  <h4 style={{ color: '#fff', marginTop: 0 }}>Recent Activity</h4>
                  <div style={{ marginTop: '16px', color: 'var(--text-secondary-dark)', fontSize: '0.9rem' }}>
                    <p>📦 {adminRequests.filter(r => r.requestStatus === 'APPROVED').length} requests approved this month</p>
                    <p>👥 15 new users registered</p>
                    <p>🎓 3 new workshops created</p>
                    <p>💚 Carbon offset: 1,240 kg CO₂e</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {showEnrollmentModal && selectedEnrollment && (
        <div className="modal-overlay">
          <div className="glass modal-content" style={{ maxWidth: '600px' }}>
            <button onClick={closeEnrollmentDetails} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary-dark)', cursor: 'pointer' }}>
              <XCircle size={20} />
            </button>
            <h3 style={{ color: '#fff', marginBottom: '8px' }}>{selectedEnrollment.workShop?.name || 'Enrollment Details'}</h3>
            <p style={{ color: 'var(--text-secondary-dark)', marginTop: 0 }}>{selectedEnrollment.workShop?.description}</p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--text-secondary-dark)', margin: 0 }}><strong>Date:</strong> {selectedEnrollment.workShop?.registrationDate || '-'}</p>
                <p style={{ color: 'var(--text-secondary-dark)', margin: 0 }}><strong>Time:</strong> {selectedEnrollment.workShop?.time || '-'}</p>
                <p style={{ color: 'var(--text-secondary-dark)', margin: 0 }}><strong>Venue:</strong> {selectedEnrollment.workShop?.venue || '-'}</p>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--text-secondary-dark)', margin: 0 }}><strong>Amount:</strong> ₹{selectedEnrollment.amount}</p>
                <p style={{ color: 'var(--text-secondary-dark)', margin: 0 }}><strong>Order ID:</strong> {selectedEnrollment.razorpayOrderId}</p>
                <p style={{ color: 'var(--text-secondary-dark)', margin: 0 }}><strong>Payment ID:</strong> {selectedEnrollment.razorpayPaymentId || '-'}</p>
                <p style={{ color: 'var(--text-secondary-dark)', margin: 0 }}><strong>Status:</strong> {selectedEnrollment.paymentStatus || 'PENDING'}</p>
              </div>
            </div>
            <div style={{ marginTop: '18px', textAlign: 'right' }}>
              <button onClick={closeEnrollmentDetails} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .image-dropzone:hover {
          border-color: var(--primary) !important;
          background: rgba(255, 255, 255, 0.04) !important;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .unit-btn {
          transition: all 150ms ease;
        }
        .unit-btn:focus {
          outline: 2px solid rgba(6,179,212,0.18);
          outline-offset: 2px;
        }
        .quantity-input input.form-input:focus {
          outline: none;
        }
        .qty-btn {
          transition: transform 120ms ease, color 120ms ease;
          background: transparent;
          border: none;
        }
        .qty-btn:hover { transform: translateY(-2px); color: #fff; }
        @media (max-width: 768px) {
          .recycle-grid, .overview-details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

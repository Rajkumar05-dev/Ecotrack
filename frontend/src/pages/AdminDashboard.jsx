import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Leaf,
  Plus,
  Recycle,
  Save,
  Shield,
  Trash2,
  Users,
  X,
  XCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyWorkshopForm = {
  name: '',
  description: '',
  price: '',
  image: '',
  registrationDate: '',
  time: '',
  duration: '',
  venue: ''
};

const statusColors = {
  PENDING: 'var(--warning)',
  APPROVED: 'var(--success)',
  REJECTED: 'var(--danger)'
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [requests, setRequests] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [workshopForm, setWorkshopForm] = useState(emptyWorkshopForm);
  const [editingWorkshopId, setEditingWorkshopId] = useState(null);
  const [savingWorkshop, setSavingWorkshop] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState(null);

  const loadAdminData = useCallback(async () => {
    try {
      const [requestData, workshopData] = await Promise.all([
        api.getAllRecycleRequestsAdmin(),
        api.getWorkshops()
      ]);
      setError('');
      setRequests(Array.isArray(requestData) ? requestData : []);
      setWorkshops(Array.isArray(workshopData) ? workshopData : []);
    } catch (err) {
      setError(err.message || 'Unable to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      loadAdminData();
    });
  }, [loadAdminData]);

  const metrics = useMemo(() => {
    const approved = requests.filter((request) => request.requestStatus === 'APPROVED');
    const pending = requests.filter((request) => request.requestStatus === 'PENDING');
    const rejected = requests.filter((request) => request.requestStatus === 'REJECTED');
    const totalQuantity = approved.reduce((sum, request) => sum + Number(request.quantity || 0), 0);
    const uniqueUsers = new Set(requests.map((request) => request.user?.email || request.user?.id).filter(Boolean));

    return {
      approved: approved.length,
      pending: pending.length,
      rejected: rejected.length,
      totalRequests: requests.length,
      totalQuantity,
      uniqueUsers: uniqueUsers.size,
      carbonSaved: (totalQuantity * 0.14).toFixed(1)
    };
  }, [requests]);

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3000);
  };

  const handleApprove = async (requestId) => {
    try {
      setProcessingRequestId(requestId);
      const updated = await api.approveRecycleRequest(requestId);
      setRequests((current) => current.map((request) => (
        request.id === requestId ? { ...request, ...updated, requestStatus: 'APPROVED' } : request
      )));
      showNotice('Pickup approved successfully.');
    } catch (err) {
      setError(err.message || 'Unable to approve pickup.');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleReject = async (event) => {
    event.preventDefault();
    if (!rejectReason.trim()) return;

    try {
      setProcessingRequestId(rejectingId);
      const updated = await api.rejectRecycleRequest(rejectingId, rejectReason.trim());
      setRequests((current) => current.map((request) => (
        request.id === rejectingId ? { ...request, ...updated, requestStatus: 'REJECTED', reason: rejectReason.trim() } : request
      )));
      setRejectingId(null);
      setRejectReason('');
      showNotice('Pickup rejected with feedback.');
    } catch (err) {
      setError(err.message || 'Unable to reject pickup.');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const startCreateWorkshop = () => {
    setEditingWorkshopId(null);
    setWorkshopForm(emptyWorkshopForm);
    setActiveTab('workshops');
  };

  const startEditWorkshop = (workshop) => {
    setEditingWorkshopId(workshop.id);
    setWorkshopForm({
      name: workshop.name || '',
      description: workshop.description || '',
      price: workshop.price ?? '',
      image: workshop.image || '',
      registrationDate: workshop.registrationDate || '',
      time: workshop.time || '',
      duration: workshop.duration ?? '',
      venue: workshop.venue || ''
    });
    setActiveTab('workshops');
  };

  const handleWorkshopChange = (event) => {
    const { name, value } = event.target;
    setWorkshopForm((current) => ({ ...current, [name]: value }));
  };

  const handleSaveWorkshop = async (event) => {
    event.preventDefault();

    const payload = {
      ...workshopForm,
      price: Number(workshopForm.price || 0),
      duration: Number(workshopForm.duration || 0)
    };

    try {
      setSavingWorkshop(true);
      const saved = editingWorkshopId
        ? await api.updateWorkshop(editingWorkshopId, payload)
        : await api.createWorkshop(payload);

      setWorkshops((current) => (
        editingWorkshopId
          ? current.map((workshop) => (workshop.id === editingWorkshopId ? saved : workshop))
          : [saved, ...current]
      ));
      setWorkshopForm(emptyWorkshopForm);
      setEditingWorkshopId(null);
      showNotice(editingWorkshopId ? 'Workshop updated.' : 'Workshop created.');
    } catch (err) {
      setError(err.message || 'Unable to save workshop.');
    } finally {
      setSavingWorkshop(false);
    }
  };

  const handleDeleteWorkshop = async (workshopId) => {
    const confirmed = window.confirm('Delete this workshop? This cannot be undone.');
    if (!confirmed) return;

    try {
      await api.deleteWorkshop(workshopId);
      setWorkshops((current) => current.filter((workshop) => workshop.id !== workshopId));
      showNotice('Workshop deleted.');
    } catch (err) {
      setError(err.message || 'Unable to delete workshop.');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    const confirmed = window.confirm('Delete this pickup request? This cannot be undone.');
    if (!confirmed) return;

    try {
      setProcessingRequestId(requestId);
      await api.deleteRecycleRequest(requestId);
      setRequests((current) => current.filter((request) => request.id !== requestId));
      showNotice('Pickup request deleted.');
    } catch (err) {
      setError(err.message || 'Unable to delete pickup request.');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const recentRequests = [...requests].slice(0, 5);

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar glass">
        <div className="admin-profile">
          <div className="admin-avatar">
            <Shield size={22} />
          </div>
          <div>
            <h3>{user?.name || 'Admin'}</h3>
            <span>EcoTrack administrator</span>
          </div>
        </div>

        <button className={`admin-nav ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <BarChart3 size={18} /> Overview
        </button>
        <button className={`admin-nav ${activeTab === 'pickups' ? 'active' : ''}`} onClick={() => setActiveTab('pickups')}>
          <Recycle size={18} /> Pickups
          {metrics.pending > 0 && <span>{metrics.pending}</span>}
        </button>
        <button className={`admin-nav ${activeTab === 'workshops' ? 'active' : ''}`} onClick={() => setActiveTab('workshops')}>
          <Calendar size={18} /> Workshops
        </button>
        <button className={`admin-nav ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
          <Leaf size={18} /> Reports
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <div>
            <p>Admin Dashboard</p>
            <h1>Operations Control</h1>
          </div>
          <button className="btn btn-primary" onClick={startCreateWorkshop}>
            <Plus size={18} /> New Workshop
          </button>
        </div>

        {notice && <div className="admin-alert success">{notice}</div>}
        {error && (
          <div className="admin-alert danger">
            {error}
            <button onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></button>
          </div>
        )}

        {loading ? (
          <div className="glass admin-loading">Loading admin records...</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <section>
                <div className="admin-metrics">
                  <Metric icon={<Recycle size={20} />} label="Total pickups" value={metrics.totalRequests} tone="blue" />
                  <Metric icon={<Clock size={20} />} label="Pending review" value={metrics.pending} tone="amber" />
                  <Metric icon={<CheckCircle2 size={20} />} label="Approved" value={metrics.approved} tone="green" />
                  <Metric icon={<Users size={20} />} label="Active users" value={metrics.uniqueUsers} tone="cyan" />
                </div>

                <div className="admin-grid">
                  <div className="glass admin-panel">
                    <div className="panel-title">
                      <h2>Recent Pickup Activity</h2>
                      <button onClick={() => setActiveTab('pickups')}>View all</button>
                    </div>
                    <div className="admin-list">
                      {recentRequests.map((request) => (
                        <RequestRow key={request.id} request={request} compact />
                      ))}
                      {recentRequests.length === 0 && <EmptyState text="No pickup requests found." />}
                    </div>
                  </div>

                  <div className="glass admin-panel">
                    <div className="panel-title">
                      <h2>Impact Summary</h2>
                    </div>
                    <div className="impact-number">{metrics.carbonSaved} kg</div>
                    <p className="muted">Estimated CO2e saved from approved recycling pickups.</p>
                    <div className="status-bars">
                      <StatusBar label="Approved" value={metrics.approved} total={metrics.totalRequests} color="var(--success)" />
                      <StatusBar label="Pending" value={metrics.pending} total={metrics.totalRequests} color="var(--warning)" />
                      <StatusBar label="Rejected" value={metrics.rejected} total={metrics.totalRequests} color="var(--danger)" />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'pickups' && (
              <section className="glass admin-panel">
                <div className="panel-title">
                  <h2>Manage Pickups</h2>
                  <span className="muted">{metrics.pending} awaiting review</span>
                </div>

                <div className="admin-list">
                  {requests.map((request) => (
                    <div key={request.id} className="request-card">
                      <RequestRow request={request} />
                      <div className="request-detail-row">
                        {request.itemImage && (
                          <button className="request-image-button" type="button" aria-label={`View ${request.itemType} image`}>
                            <img className="request-image" src={api.getRequestImageUrl(request.itemImage)} alt={`${request.itemType} submitted for pickup`} />
                          </button>
                        )}
                        <div className="request-actions">
                          <button
                            className="btn btn-danger"
                            disabled={processingRequestId === request.id}
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            <Trash2 size={17} /> Delete
                          </button>
                          {request.requestStatus === 'PENDING' && (
                            <>
                          <button
                            className="btn btn-primary"
                            disabled={processingRequestId === request.id}
                            onClick={() => handleApprove(request.id)}
                          >
                            <CheckCircle2 size={17} /> Approve
                          </button>
                          {rejectingId === request.id ? (
                            <form className="reject-form" onSubmit={handleReject}>
                              <input
                                className="form-input"
                                value={rejectReason}
                                onChange={(event) => setRejectReason(event.target.value)}
                                placeholder="Reason for rejection"
                                required
                              />
                              <button className="btn btn-danger" disabled={processingRequestId === request.id}>Reject</button>
                              <button type="button" className="btn btn-secondary" onClick={() => setRejectingId(null)}>Cancel</button>
                            </form>
                          ) : (
                            <button className="btn btn-danger" onClick={() => setRejectingId(request.id)}>
                              <XCircle size={17} /> Reject
                            </button>
                          )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {requests.length === 0 && <EmptyState text="No pickup requests found." />}
                </div>
              </section>
            )}

            {activeTab === 'workshops' && (
              <section className="admin-grid">
                <form className="glass admin-panel workshop-form" onSubmit={handleSaveWorkshop}>
                  <div className="panel-title">
                    <h2>{editingWorkshopId ? 'Edit Workshop' : 'Create Workshop'}</h2>
                    {editingWorkshopId && (
                      <button type="button" onClick={() => { setEditingWorkshopId(null); setWorkshopForm(emptyWorkshopForm); }}>
                        Clear
                      </button>
                    )}
                  </div>

                  <input className="form-input" name="name" value={workshopForm.name} onChange={handleWorkshopChange} placeholder="Workshop name" required />
                  <textarea className="form-input" name="description" value={workshopForm.description} onChange={handleWorkshopChange} placeholder="Description" required rows="4" />
                  <div className="form-grid">
                    <input className="form-input" name="price" type="number" value={workshopForm.price} onChange={handleWorkshopChange} placeholder="Price" required />
                    <input className="form-input" name="duration" type="number" value={workshopForm.duration} onChange={handleWorkshopChange} placeholder="Duration minutes" required />
                  </div>
                  <div className="form-grid">
                    <input className="form-input" name="registrationDate" type="date" value={workshopForm.registrationDate} onChange={handleWorkshopChange} required />
                    <input className="form-input" name="time" type="datetime-local" value={workshopForm.time} onChange={handleWorkshopChange} required />
                  </div>
                  <input className="form-input" name="venue" value={workshopForm.venue} onChange={handleWorkshopChange} placeholder="Venue" required />
                  <input className="form-input" name="image" value={workshopForm.image} onChange={handleWorkshopChange} placeholder="Image URL" />
                  <button className="btn btn-primary" disabled={savingWorkshop}>
                    <Save size={18} /> {savingWorkshop ? 'Saving...' : 'Save Workshop'}
                  </button>
                </form>

                <div className="glass admin-panel">
                  <div className="panel-title">
                    <h2>Workshop Catalog</h2>
                    <span className="muted">{workshops.length} listed</span>
                  </div>
                  <div className="workshop-list">
                    {workshops.map((workshop) => (
                      <article className="workshop-admin-card" key={workshop.id}>
                        {workshop.image && <img src={workshop.image} alt={workshop.name} />}
                        <div>
                          <h3>{workshop.name}</h3>
                          <p>{workshop.venue}</p>
                          <span>Rs. {workshop.price} • {workshop.duration} min</span>
                        </div>
                        <div className="icon-actions">
                          <button aria-label="Edit workshop" onClick={() => startEditWorkshop(workshop)}><Edit3 size={17} /></button>
                          <button aria-label="Delete workshop" onClick={() => handleDeleteWorkshop(workshop.id)}><Trash2 size={17} /></button>
                        </div>
                      </article>
                    ))}
                    {workshops.length === 0 && <EmptyState text="No workshops created yet." />}
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'reports' && (
              <section>
                <div className="admin-metrics">
                  <Metric icon={<Leaf size={20} />} label="Carbon saved" value={`${metrics.carbonSaved} kg`} tone="green" />
                  <Metric icon={<Recycle size={20} />} label="Material logged" value={metrics.totalQuantity} tone="cyan" />
                  <Metric icon={<Calendar size={20} />} label="Workshops" value={workshops.length} tone="amber" />
                  <Metric icon={<XCircle size={20} />} label="Rejected" value={metrics.rejected} tone="red" />
                </div>
                <div className="glass admin-panel">
                  <div className="panel-title">
                    <h2>Status Distribution</h2>
                  </div>
                  <div className="status-bars report-bars">
                    <StatusBar label="Approved pickups" value={metrics.approved} total={metrics.totalRequests} color="var(--success)" />
                    <StatusBar label="Pending pickups" value={metrics.pending} total={metrics.totalRequests} color="var(--warning)" />
                    <StatusBar label="Rejected pickups" value={metrics.rejected} total={metrics.totalRequests} color="var(--danger)" />
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <style>{`
        .admin-dashboard {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 28px;
          min-height: calc(100vh - 80px);
          padding: 28px;
        }
        .admin-sidebar {
          border-radius: var(--radius-lg);
          padding: 22px;
          height: fit-content;
          position: sticky;
          top: 104px;
        }
        .admin-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 26px;
        }
        .admin-avatar {
          display: grid;
          place-items: center;
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: rgba(59, 130, 246, 0.18);
          color: #60a5fa;
        }
        .admin-profile h3 {
          color: #fff;
          font-size: 1rem;
        }
        .admin-profile span,
        .muted {
          color: var(--text-secondary-dark);
          font-size: 0.85rem;
        }
        .admin-nav {
          width: 100%;
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-secondary-dark);
          border-radius: var(--radius-md);
          padding: 13px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          font: inherit;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 8px;
          transition: var(--transition-smooth);
        }
        .admin-nav span {
          margin-left: auto;
          min-width: 24px;
          min-height: 24px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(245, 158, 11, 0.15);
          color: var(--warning);
          font-size: 0.75rem;
        }
        .admin-nav:hover,
        .admin-nav.active {
          color: #fff;
          border-color: rgba(96, 165, 250, 0.28);
          background: rgba(59, 130, 246, 0.12);
        }
        .admin-main {
          min-width: 0;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          margin-bottom: 24px;
        }
        .admin-header p {
          margin: 0 0 8px;
          color: #60a5fa;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.78rem;
        }
        .admin-header h1 {
          color: #fff;
          font-size: clamp(2rem, 4vw, 3.2rem);
          letter-spacing: 0;
        }
        .admin-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .metric-card {
          padding: 20px;
          border-radius: var(--radius-md);
        }
        .metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--text-secondary-dark);
          margin-bottom: 18px;
        }
        .metric-card h2 {
          color: #fff;
          font-size: 2rem;
          letter-spacing: 0;
        }
        .metric-card p {
          margin: 4px 0 0;
          color: var(--text-secondary-dark);
          font-size: 0.85rem;
        }
        .admin-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
          gap: 24px;
          align-items: start;
        }
        .admin-panel {
          border-radius: var(--radius-lg);
          padding: 24px;
        }
        .panel-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 18px;
        }
        .panel-title h2 {
          color: #fff;
          font-size: 1.2rem;
          letter-spacing: 0;
        }
        .panel-title button,
        .icon-actions button,
        .admin-alert button {
          border: 0;
          background: transparent;
          color: #60a5fa;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }
        .admin-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .request-row,
        .request-card,
        .workshop-admin-card {
          border: 1px solid var(--dark-border);
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.025);
        }
        .request-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          padding: 16px;
          align-items: center;
        }
        .request-row h3 {
          color: #fff;
          font-size: 1rem;
          margin-bottom: 6px;
          letter-spacing: 0;
        }
        .request-row p,
        .request-row small {
          margin: 0;
          color: var(--text-secondary-dark);
          font-size: 0.82rem;
        }
        .request-card {
          padding: 14px;
        }
        .request-card .request-row {
          border: 0;
          background: transparent;
          padding: 0;
        }
        .request-image {
          width: 112px;
          height: 82px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          display: block;
        }
        .request-image-button {
          border: 1px solid var(--dark-border);
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-sm);
          cursor: pointer;
          padding: 0;
          overflow: hidden;
          flex: 0 0 auto;
        }
        .request-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-top: 14px;
          flex-wrap: wrap;
        }
        .request-actions,
        .reject-form {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: flex-end;
          margin-top: 0;
        }
        .reject-form {
          flex: 1;
          margin-top: 0;
        }
        .reject-form .form-input {
          min-width: 220px;
          flex: 1;
        }
        .impact-number {
          color: var(--primary);
          font-size: 3rem;
          font-family: var(--font-display);
          font-weight: 800;
          letter-spacing: 0;
        }
        .status-bars {
          display: grid;
          gap: 14px;
          margin-top: 20px;
        }
        .status-label {
          display: flex;
          justify-content: space-between;
          color: var(--text-secondary-dark);
          font-size: 0.85rem;
          margin-bottom: 8px;
        }
        .status-track {
          height: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
        }
        .status-fill {
          height: 100%;
          border-radius: 999px;
        }
        .workshop-form {
          display: grid;
          gap: 14px;
        }
        .workshop-form textarea {
          resize: vertical;
          min-height: 112px;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .workshop-list {
          display: grid;
          gap: 14px;
        }
        .workshop-admin-card {
          display: grid;
          grid-template-columns: 72px 1fr auto;
          gap: 14px;
          align-items: center;
          padding: 12px;
        }
        .workshop-admin-card img {
          width: 72px;
          height: 72px;
          object-fit: cover;
          border-radius: var(--radius-sm);
        }
        .workshop-admin-card h3 {
          color: #fff;
          font-size: 0.95rem;
          letter-spacing: 0;
        }
        .workshop-admin-card p,
        .workshop-admin-card span {
          color: var(--text-secondary-dark);
          font-size: 0.8rem;
          margin: 4px 0 0;
        }
        .icon-actions {
          display: flex;
          gap: 6px;
        }
        .icon-actions button {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          display: grid;
          place-items: center;
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-secondary-dark);
        }
        .icon-actions button:hover {
          color: #fff;
          background: rgba(59, 130, 246, 0.16);
        }
        .admin-alert {
          border-radius: var(--radius-md);
          padding: 12px 14px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          font-weight: 600;
        }
        .admin-alert.success {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.24);
          color: var(--success);
        }
        .admin-alert.danger {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.24);
          color: var(--danger);
        }
        .admin-loading,
        .empty-state {
          border-radius: var(--radius-lg);
          padding: 48px;
          text-align: center;
          color: var(--text-secondary-dark);
        }
        .report-bars {
          max-width: 760px;
        }
        @media (max-width: 1080px) {
          .admin-dashboard,
          .admin-grid {
            grid-template-columns: 1fr;
          }
          .admin-sidebar {
            position: static;
          }
          .admin-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 680px) {
          .admin-dashboard {
            padding: 16px;
          }
          .admin-header {
            align-items: flex-start;
            flex-direction: column;
          }
          .admin-metrics,
          .form-grid,
          .workshop-admin-card {
            grid-template-columns: 1fr;
          }
          .request-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

const Metric = ({ icon, label, value, tone }) => (
  <div className={`glass metric-card metric-${tone}`}>
    <div className="metric-top">
      <span>{label}</span>
      {icon}
    </div>
    <h2>{value}</h2>
    <p>Live platform data</p>
  </div>
);

const RequestRow = ({ request, compact = false }) => (
  <div className="request-row">
    <div>
      <h3>{request.itemType || 'Recycle pickup'}</h3>
      <p>
        {request.quantity} {request.unit || 'units'} submitted by {request.user?.name || 'Unknown user'}
        {request.user?.email ? ` (${request.user.email})` : ''}
      </p>
      {!compact && request.reason && <small>Feedback: {request.reason}</small>}
    </div>
    <span className={`badge ${
      request.requestStatus === 'APPROVED' ? 'badge-approved' :
      request.requestStatus === 'REJECTED' ? 'badge-rejected' : 'badge-pending'
    }`} style={{ color: statusColors[request.requestStatus] }}>
      {request.requestStatus || 'PENDING'}
    </span>
  </div>
);

const StatusBar = ({ label, value, total, color }) => {
  const width = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="status-label">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="status-track">
        <div className="status-fill" style={{ width: `${width}%`, background: color }} />
      </div>
    </div>
  );
};

const EmptyState = ({ text }) => (
  <div className="empty-state">{text}</div>
);

export default AdminDashboard;

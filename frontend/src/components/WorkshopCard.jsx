import { Calendar, Clock, MapPin, DollarSign, Edit, Trash } from 'lucide-react';

const WorkshopCard = ({ workshop, onEnroll, isAdmin, onEdit, onDelete, isEnrolled, isEnrollmentLoading }) => {
  const formattedDate = workshop.registrationDate
    ? new Date(workshop.registrationDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const formattedTime = workshop.time
    ? new Date(workshop.time).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="glass" style={{
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Workshop Image */}
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
        <img 
          src={workshop.image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600'} 
          alt={workshop.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition-smooth)' }}
          className="workshop-img"
        />
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(11, 21, 17, 0.85)',
          backdropFilter: 'blur(4px)',
          border: '1px solid var(--dark-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          fontSize: '0.9rem',
          fontWeight: '700',
          color: 'var(--primary)'
        }}>
          <DollarSign size={14} />
          {workshop.price}
        </div>
      </div>

      {/* Workshop Details */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, lineHeight: 1.4 }}>
          {workshop.name}
        </h3>
        
        <p style={{ 
          fontSize: '0.85rem', 
          color: 'var(--text-secondary-dark)', 
          lineHeight: 1.5, 
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          height: '56px'
        }}>
          {workshop.description}
        </p>

        {/* Metadata Details */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px', 
          padding: '12px 0', 
          borderTop: '1px solid var(--dark-border)',
          borderBottom: '1px solid var(--dark-border)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary-dark)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={14} color="var(--primary)" />
            <span>Reg. Deadline: {formattedDate || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={14} color="var(--primary)" />
            <span>Time: {formattedTime || 'N/A'} ({workshop.duration} mins)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={14} color="var(--primary)" />
            <span style={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>{workshop.venue}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
          {isAdmin ? (
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button 
                onClick={() => onEdit(workshop)} 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
              >
                <Edit size={14} /> Edit
              </button>
              <button 
                onClick={() => onDelete(workshop.id)} 
                className="btn btn-danger" 
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
              >
                <Trash size={14} /> Delete
              </button>
            </div>
          ) : isEnrolled ? (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: 'var(--success)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}>
              Registered & Paid
            </div>
          ) : (
            <button 
              onClick={() => onEnroll(workshop)} 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px' }}
              disabled={isEnrollmentLoading}
            >
              {isEnrollmentLoading ? 'Checking booking...' : 'Book Seat'}
            </button>
          )}
        </div>
      </div>
      <style>{`
        .workshop-img:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default WorkshopCard;

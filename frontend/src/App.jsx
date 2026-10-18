import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Workshops from './pages/Workshops';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const readStoredSession = () => {
  const token = localStorage.getItem('ecotrack_token');
  const storedUser = localStorage.getItem('ecotrack_user');
  if (!token || !storedUser) {
    return { token: null, user: null };
  }

  try {
    const payload = token.split('.')[1];
    if (!payload) {
      throw new Error('Invalid token');
    }
    const base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = base64Payload.padEnd(Math.ceil(base64Payload.length / 4) * 4, '=');
    const decoded = JSON.parse(atob(paddedPayload));
    if (!Number.isFinite(decoded.exp) || decoded.exp * 1000 <= Date.now()) {
      throw new Error('Expired token');
    }

    return { token, user: JSON.parse(storedUser) };
  } catch {
    localStorage.removeItem('ecotrack_token');
    localStorage.removeItem('ecotrack_user');
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(readStoredSession);
  const { user, token } = session;
  const loading = false;

  const loginSession = (tokenVal, userVal) => {
    localStorage.setItem('ecotrack_token', tokenVal);
    localStorage.setItem('ecotrack_user', JSON.stringify(userVal));
    setSession({ token: tokenVal, user: userVal });
  };

  const logoutSession = () => {
    localStorage.removeItem('ecotrack_token');
    localStorage.removeItem('ecotrack_user');
    setSession({ token: null, user: null });
  };

  const updateCurrentUser = (updatedUser) => {
    localStorage.setItem('ecotrack_user', JSON.stringify(updatedUser));
    setSession(current => ({ ...current, user: updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginSession, logoutSession, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Guard route for authenticated users
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#9bbbb0' }}>
        <h3>Loading Session...</h3>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const roleString = user.role?.appRole || '';
    const hasRole = allowedRoles.some(role => roleString.includes(role));
    if (!hasRole) {
      return <Navigate to="/admin-login" replace />;
    }
  }

  return children;
};

const DashboardRoute = () => {
  const { user } = useAuth();
  const isAdmin = user?.role?.appRole?.includes('ADMIN');

  if (isAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              
              {/* User Authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Admin Authentication */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin-register" element={<AdminRegister />} />
              
              {/* Authenticated Dashboard */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardRoute />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Dashboard (accessible only to admins) */}
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Workshops (accessible to all, but actions might require auth) */}
              <Route path="/workshops" element={<Workshops />} />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

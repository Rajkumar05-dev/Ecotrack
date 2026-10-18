const API_BASE_URL = 'http://localhost:8080';

const getRequestImageUrl = (imageName) => {
  if (!imageName) return '';
  if (/^(https?:|data:|blob:)/i.test(imageName)) return imageName;

  const cleanName = String(imageName).split(/[\\/]/).pop();
  return `${API_BASE_URL}/request/image/${encodeURIComponent(cleanName)}`;
};

// Mock Data Store for fallback when backend is offline
const mockData = {
  users: [
    {
      id: 'mock-user-id-1',
      name: 'Raj Chauhan',
      email: 'raj@ecotrack.com',
      phoneNo: '9876543210',
      role: { roleId: 1, appRole: 'ROLE_USER' },
      recycleRequests: [
        { id: 101, itemType: 'Plastic Bottles', quantity: 120, unit: 'pieces', itemImage: null, requestStatus: 'APPROVED', reason: 'Pick up scheduled for Friday' },
        { id: 102, itemType: 'Cardboard Boxes', quantity: 15, unit: 'kg', itemImage: null, requestStatus: 'PENDING', reason: null },
      ]
    },
    {
      id: 'mock-admin-id-1',
      name: 'Admin User',
      email: 'admin@ecotrack.com',
      phoneNo: '9999988888',
      role: { roleId: 2, appRole: 'ROLE_ADMIN' },
      recycleRequests: []
    },
    {
      id: 'mock-admin-id-2',
      name: 'Rocky Admin',
      email: 'rocky5267@gmail.com',
      phoneNo: '9988776655',
      role: { roleId: 2, appRole: 'ROLE_ADMIN' },
      recycleRequests: []
    },
    {
      id: 'mock-admin-id-3',
      name: 'Rocky Admin',
      email: 'rocky527@gmail.com',
      phoneNo: '9988776655',
      role: { roleId: 2, appRole: 'ROLE_ADMIN' },
      recycleRequests: []
    },
    {
      id: 'mock-admin-id-rock123',
      name: 'ROCK123',
      email: 'rock123@gami.com',
      phoneNo: '9876543210',
      role: { roleId: 2, appRole: 'ROLE_ADMIN' },
      recycleRequests: []
    }
  ],
  requests: [
    { id: 101, itemType: 'Plastic Bottles', quantity: 120, unit: 'pieces', itemImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500', requestStatus: 'APPROVED', reason: 'Verified weight 5.5kg.', user: { id: 'mock-user-id-1', name: 'Raj Chauhan', email: 'raj@ecotrack.com' } },
    { id: 102, itemType: 'Cardboard Boxes', quantity: 15, unit: 'kg', itemImage: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=500', requestStatus: 'PENDING', reason: null, user: { id: 'mock-user-id-1', name: 'Raj Chauhan', email: 'raj@ecotrack.com' } },
    { id: 103, itemType: 'E-Waste (Old Monitor)', quantity: 1, unit: 'pieces', itemImage: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500', requestStatus: 'PENDING', reason: null, user: { id: 'mock-user-id-2', name: 'Amit Sharma', email: 'amit@ecotrack.com' } }
  ],
  workshops: [
    {
      id: 1,
      name: 'Introduction to Home Composting',
      description: 'Learn the science and practical steps of turning kitchen waste into nutrient-rich soil for your home garden. Get hands-on training with various compost bin styles.',
      price: 299,
      image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
      registrationDate: '2026-06-15',
      time: '2026-06-20T10:00:00',
      duration: 120,
      venue: 'Green Community Hall, Block C'
    },
    {
      id: 2,
      name: 'Upcycling Plastic and E-Waste Creative Class',
      description: 'Convert daily household trash like plastic bottles, cans, and discarded electronic components into artistic planters, decor items, and functional organizers.',
      price: 199,
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
      registrationDate: '2026-06-18',
      time: '2026-06-25T14:30:00',
      duration: 180,
      venue: 'Eco Innovation Hub, Ground Floor'
    },
    {
      id: 3,
      name: 'Carbon Footprint Reduction Masterclass',
      description: 'An advanced seminar detailing energy conservation strategies, eco-friendly transit alternatives, sustainable consumption practices, and calculation of individual carbon indices.',
      price: 499,
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      registrationDate: '2026-06-20',
      time: '2026-06-30T11:00:00',
      duration: 150,
      venue: 'Virtual Classroom (Zoom Meet)'
    }
  ],
  enrollments: []
};

// Helper for local storage token
const getAuthHeaders = () => {
  const token = localStorage.getItem('ecotrack_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Auto-detector for backend availability
let useMock = false;
const isPaymentEndpoint = (endpoint) => endpoint.startsWith('/enroll/') || endpoint.startsWith('/payment/');
const requiresBackend = (endpoint) =>
  endpoint.startsWith('/auth/') ||
  endpoint === '/users/register' ||
  endpoint === '/users/register-admin' ||
  endpoint.startsWith('/workshops') ||
  isPaymentEndpoint(endpoint);

const request = async (endpoint, options = {}) => {
  if (useMock && !requiresBackend(endpoint)) {
    return handleMockRequest(endpoint, options);
  }

  if (isPaymentEndpoint(endpoint) && localStorage.getItem('ecotrack_token')?.startsWith('mock-')) {
    const error = new Error('You are signed in with a demo account. Sign in with your backend account before making a payment.');
    error.status = 401;
    throw error;
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const errText = await response.text();
      let message = errText;
      try {
        const payload = JSON.parse(errText);
        message = payload.errorMessage || payload.message || payload.error || errText;
      } catch {
        // Keep the backend response text when it is not JSON.
      }

      const error = new Error(message || `Request failed with status ${response.status}`);
      error.status = response.status;
      throw error;
    }
    
    // Some endpoints return empty body or strings
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  } catch (error) {
    if (error instanceof TypeError) {
      if (requiresBackend(endpoint)) {
        throw new Error('The backend is unavailable. Start the backend and try again.', { cause: error });
      }

      console.warn(`Backend connection failed for endpoint ${endpoint}. Falling back to mock implementation. Error:`, error.message);
      useMock = true;
      return handleMockRequest(endpoint, options);
    }
    throw error;
  }
};

// Simulated mock backend implementation
const handleMockRequest = (endpoint, options) => {
  console.log(`[Mock API] Request: ${options.method || 'GET'} ${endpoint}`, options.body ? JSON.parse(options.body) : '');
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 1. Auth Endpoint
      if (endpoint === '/auth/login' && options.method === 'POST') {
        const { email } = JSON.parse(options.body);
        const user = mockData.users.find(u => u.email === email);
        if (user) {
          resolve({
            token: 'mock-jwt-token-12345',
            userDto: { ...user, password: '' }
          });
        } else {
          // If not found, let's create a temporary session user
          const isEmailAdmin = email.includes('admin');
          const newUser = {
            id: 'mock-user-' + Date.now(),
            name: email.split('@')[0].toUpperCase(),
            email: email,
            phoneNo: '9998887776',
            role: { 
              roleId: isEmailAdmin ? 2 : 1, 
              appRole: isEmailAdmin ? 'ROLE_ADMIN' : 'ROLE_USER' 
            },
            recycleRequests: []
          };
          mockData.users.push(newUser);
          resolve({
            token: 'mock-jwt-token-' + Date.now(),
            userDto: newUser
          });
        }
        return;
      }

      // 2. Register Endpoint
      if ((endpoint === '/users/register' || endpoint === '/users/register-admin') && options.method === 'POST') {
        const body = JSON.parse(options.body);
        const exists = mockData.users.some(u => u.email === body.email);
        if (exists) {
          reject(new Error('Email already exists'));
          return;
        }
        const isAdminRegistration = endpoint === '/users/register-admin';
        const newUser = {
          id: 'mock-user-' + Date.now(),
          name: body.name || 'New User',
          email: body.email,
          phoneNo: body.phoneNo || '',
          role: { roleId: isAdminRegistration ? 2 : 1, appRole: isAdminRegistration ? 'ROLE_ADMIN' : 'ROLE_USER' },
          recycleRequests: []
        };
        mockData.users.push(newUser);
        resolve(newUser);
        return;
      }

      // 3. Get Workshops
      if (endpoint.startsWith('/workshops') && (options.method === 'GET' || !options.method)) {
        const match = endpoint.match(/\/workshops\/(\d+)/);
        if (match) {
          const id = parseInt(match[1]);
          const ws = mockData.workshops.find(w => w.id === id);
          if (ws) resolve(ws);
          else reject(new Error('Workshop not found'));
        } else {
          resolve(mockData.workshops);
        }
        return;
      }

      // 4. Create/Update/Delete Workshop
      if (endpoint === '/workshops' && options.method === 'POST') {
        const body = JSON.parse(options.body);
        const newWs = {
          ...body,
          id: mockData.workshops.length + 1
        };
        mockData.workshops.push(newWs);
        resolve(newWs);
        return;
      }

      if (endpoint.startsWith('/workshops/') && options.method === 'PUT') {
        const id = parseInt(endpoint.split('/').pop());
        const body = JSON.parse(options.body);
        const idx = mockData.workshops.findIndex(w => w.id === id);
        if (idx !== -1) {
          mockData.workshops[idx] = { ...mockData.workshops[idx], ...body };
          resolve(mockData.workshops[idx]);
        } else {
          reject(new Error('Workshop not found'));
        }
        return;
      }

      if (endpoint.startsWith('/workshops/') && options.method === 'DELETE') {
        const id = parseInt(endpoint.split('/').pop());
        mockData.workshops = mockData.workshops.filter(w => w.id !== id);
        resolve({ Message: `${id}-workshop deleted` });
        return;
      }

      // 5. Submit Recycle Request
      if (endpoint.startsWith('/request/') && options.method === 'POST') {
        // endpoint is /request/{userId} or /request/upload-image/{id}
        if (endpoint.includes('upload-image')) {
          const id = parseInt(endpoint.split('/').pop());
          const req = mockData.requests.find(r => r.id === id);
          if (req) {
            req.itemImage = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500';
            resolve({ imageName: req.itemImage, Message: 'Image upload successfully' });
          } else {
            reject(new Error('Request not found'));
          }
          return;
        }

        const userId = endpoint.split('/').pop();
        const body = JSON.parse(options.body);
        const newReq = {
          id: mockData.requests.length + 101,
          itemType: body.itemType,
          quantity: body.quantity,
          unit: body.unit || 'kg',
          itemImage: body.itemImage || null,
          requestStatus: 'APPROVED',
          reason: null,
          user: { id: userId, name: 'Current User' }
        };
        mockData.requests.push(newReq);
        
        // Also update corresponding user list
        const u = mockData.users.find(usr => usr.id === userId);
        if (u) {
          if (!u.recycleRequests) u.recycleRequests = [];
          u.recycleRequests.push(newReq);
        }
        resolve(newReq);
        return;
      }

      // GET /request/user/{userId}
      if (endpoint.startsWith('/request/user/') && (!options.method || options.method === 'GET')) {
        const userId = endpoint.split('/').pop();
        const list = mockData.requests.filter(r => r.user?.id === userId);
        resolve(list);
        return;
      }

      // 6. Approve / Reject Request
      if (endpoint.startsWith('/request/approve/') && options.method === 'PUT') {
        const id = parseInt(endpoint.split('/').pop());
        const req = mockData.requests.find(r => r.id === id);
        if (req) {
          req.requestStatus = 'APPROVED';
          // Update in user too
          mockData.users.forEach(u => {
            if (u.recycleRequests) {
              const userReq = u.recycleRequests.find(r => r.id === id);
              if (userReq) userReq.requestStatus = 'APPROVED';
            }
          });
          resolve(req);
        } else {
          reject(new Error('Request not found'));
        }
        return;
      }

      if (endpoint.startsWith('/request/reject/') && options.method === 'PUT') {
        const id = parseInt(endpoint.split('/').pop());
        // URL is usually /request/reject/{id}?reason=XYZ
        // Let's extract reason from options or URL parameters if possible
        const urlObj = new URL(endpoint, 'http://localhost');
        const reason = urlObj.searchParams.get('reason') || 'Rejected by administrator';
        const req = mockData.requests.find(r => r.id === id);
        if (req) {
          req.requestStatus = 'REJECTED';
          req.reason = reason;
          // Update in user too
          mockData.users.forEach(u => {
            if (u.recycleRequests) {
              const userReq = u.recycleRequests.find(r => r.id === id);
              if (userReq) {
                userReq.requestStatus = 'REJECTED';
                userReq.reason = reason;
              }
            }
          });
          resolve(req);
        } else {
          reject(new Error('Request not found'));
        }
        return;
      }

      if (endpoint.startsWith('/request/') && options.method === 'DELETE') {
        const id = parseInt(endpoint.split('/').pop());
        mockData.requests = mockData.requests.filter(r => r.id !== id);
        mockData.users.forEach(u => {
          if (u.recycleRequests) {
            u.recycleRequests = u.recycleRequests.filter(r => r.id !== id);
          }
        });
        resolve({ Message: `${id}-request deleted` });
        return;
      }

      // 7. Enrollment / Payments
      if (endpoint.startsWith('/enroll/') && options.method === 'POST') {
        // POST /enroll/{userId}/enroll/{workShopId}
        if (endpoint.includes('/confirm')) {
          const { razorpayOrderId, razorpayPaymentId } = JSON.parse(options.body);
          const enrollment = mockData.enrollments.find(
            item => item.razorpayOrderId === razorpayOrderId
          );

          if (!enrollment) {
            reject(new Error('Enrollment not found'));
            return;
          }

          enrollment.razorpayPaymentId = razorpayPaymentId;
          enrollment.paymentStatus = 'SUCCESS';
          resolve('Enrollment succesfull');
          return;
        }

        const parts = endpoint.split('/');
        const userId = parts[2];
        const workShopId = parseInt(parts[4]);
        
        const user = mockData.users.find(u => u.id === userId) || { id: userId, name: 'Test User' };
        const workshop = mockData.workshops.find(w => w.id === workShopId);
        
        if (!workshop) {
          reject(new Error('Workshop not found'));
          return;
        }

        const order = {
          user,
          workShop: workshop,
          enrolledAt: new Date().toISOString(),
          amount: parseFloat(workshop.price),
          razorpayOrderId: 'mock_order_' + Math.random().toString(36).substr(2, 9),
          paymentStatus: 'PENDING'
        };
        mockData.enrollments.push(order);
        resolve(order);
        return;
      }

      if (endpoint.startsWith('/enroll/user/') && options.method === 'GET') {
        const userId = endpoint.split('/').pop();
        const userEnrollments = mockData.enrollments.filter(e => e.user?.id === userId);
        resolve(userEnrollments);
        return;
      }

      reject(new Error('Endpoint mock not implemented'));
    }, 400);
  });
};

export const api = {
  // Authentication
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  
  register: (name, email, password, phoneNo) => request('/users/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, phoneNo })
  }),

  registerAdmin: (name, email, password, phoneNo, adminCode) => request('/users/register-admin', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, phoneNo, adminCode })
  }),

  // Workshops — pass large pageSize so all are returned; Spring Page response is unwrapped automatically
  getWorkshops: () => request('/workshops?pageNumber=0&pageSize=100').then(data => {
    // Spring's Page<T> wraps items in a 'content' array; handle both plain array and Page object
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    return [];
  }),
  
  getWorkshopById: (id) => request(`/workshops/${id}`),
  
  createWorkshop: (workshopData) => request('/workshops', {
    method: 'POST',
    body: JSON.stringify(workshopData)
  }),
  
  updateWorkshop: (id, workshopData) => request(`/workshops/${id}`, {
    method: 'PUT',
    body: JSON.stringify(workshopData)
  }),
  
  deleteWorkshop: (id) => request(`/workshops/${id}`, {
    method: 'DELETE'
  }),

  // Recycle Requests
  submitRecycleRequest: (userId, requestData) => request(`/request/${userId}`, {
    method: 'POST',
    body: JSON.stringify(requestData)
  }),

  uploadRequestImage: (requestId, file) => {
    if (useMock) {
      return request(`/request/upload-image/${requestId}`, { method: 'POST' });
    }
    const formData = new FormData();
    formData.append('requestImage', file);
    return fetch(`${API_BASE_URL}/request/upload-image/${requestId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    }).then(async res => {
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Image upload failed');
      }
      return res.json();
    });
  },

  getRequestImageUrl,

  approveRecycleRequest: (id) => request(`/request/approve/${id}`, {
    method: 'PUT'
  }),

  getUserRecycleRequests: (userId) => request(`/request/user/${userId}`),

  rejectRecycleRequest: (id, reason) => request(`/request/reject/${id}?reason=${encodeURIComponent(reason)}`, {
    method: 'PUT'
  }),

  deleteRecycleRequest: (id) => request(`/request/${id}`, {
    method: 'DELETE'
  }),

  // Admin special endpoints
  getAllRecycleRequestsAdmin: () => {
    if (useMock) {
      return Promise.resolve(mockData.requests);
    }

    return request('/request')
      .catch((err) => {
        console.warn('Admin request list endpoint unavailable, falling back to mock requests.', err);
        return mockData.requests;
      });
  },

  // Enrollments & payments
  enrollInWorkshop: (userId, workshopId) => request(`/enroll/${userId}/enroll/${workshopId}`, {
    method: 'POST'
  }),

  confirmEnrollment: (razorpayOrderId, razorpayPaymentId, razorpaySignature) => request('/enroll/confirm', {
    method: 'POST',
    body: JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature })
  }),

  getUserEnrollments: (userId) => request(`/enroll/user/${userId}`),
  getRazorpayKey: () => request('/payment/config')
};

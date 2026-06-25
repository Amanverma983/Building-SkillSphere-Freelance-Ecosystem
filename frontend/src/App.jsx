import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Public Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import BrowseGigs from './pages/BrowseGigs.jsx';
import BrowseFreelancers from './pages/BrowseFreelancers.jsx';
import GigDetails from './pages/GigDetails.jsx';
import FreelancerDetails from './pages/FreelancerDetails.jsx';

// Client Pages
import ClientDashboard from './pages/ClientDashboard.jsx';
import PostGig from './pages/PostGig.jsx';
import ClientGigDetails from './pages/ClientGigDetails.jsx';
import ClientProfile from './pages/ClientProfile.jsx';

// Freelancer Pages
import FreelancerDashboard from './pages/FreelancerDashboard.jsx';
import FreelancerProfile from './pages/FreelancerProfile.jsx';
import FreelancerAnalytics from './pages/FreelancerAnalytics.jsx';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard.jsx';

// Chat Page (shared for all roles)
import Chat from './pages/Chat.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <SocketProvider>
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
          <Navbar />
          <Routes>
            {/* ─── Public Routes ─── */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/gigs" element={<BrowseGigs />} />
            <Route path="/gigs/:id" element={<GigDetails />} />
            <Route path="/freelancers" element={<BrowseFreelancers />} />
            <Route path="/freelancers/:id" element={<FreelancerDetails />} />

            {/* ─── Client Routes ─── */}
            <Route element={<ProtectedRoute allowedRoles={['client']} />}>
              <Route path="/client/dashboard" element={<ClientDashboard />} />
              <Route path="/client/post-gig" element={<PostGig />} />
              <Route path="/client/gigs/:id" element={<ClientGigDetails />} />
              <Route path="/client/profile" element={<ClientProfile />} />
            </Route>

            {/* ─── Freelancer Routes ─── */}
            <Route element={<ProtectedRoute allowedRoles={['freelancer']} />}>
              <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
              <Route path="/freelancer/profile" element={<FreelancerProfile />} />
              <Route path="/freelancer/analytics" element={<FreelancerAnalytics />} />
            </Route>

            {/* ─── Admin Routes ─── */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

            {/* ─── Shared Protected Routes ─── */}
            <Route element={<ProtectedRoute allowedRoles={['client', 'freelancer', 'admin']} />}>
              <Route path="/chat" element={<Chat />} />
            </Route>

            {/* ─── Fallback ─── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </SocketProvider>
    </BrowserRouter>
  );
};

export default App;

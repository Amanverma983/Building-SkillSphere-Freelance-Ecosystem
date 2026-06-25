import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { Bell, MessageSquare, LogOut, User, Menu, X } from 'lucide-react';
import api from '../utils/api';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      console.error(err);
    }
    dispatch(logoutUser());
    navigate('/login');
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="glass sticky top-0 z-50 bg-slate-900/80 border-b border-slate-800 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold tracking-wider text-primary-500 hover:text-primary-600 transition-colors">
              SKILLSPHERE
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Link to="/gigs" className="text-sm font-medium hover:text-primary-500 transition-colors px-3 py-2 rounded-md">Browse Gigs</Link>
              <Link to="/freelancers" className="text-sm font-medium hover:text-primary-500 transition-colors px-3 py-2 rounded-md">Freelancers</Link>
            </div>
          </div>

          {/* Right hand navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <>
                {/* Dashboard link depending on role */}
                {user.role === 'client' && (
                  <Link to="/client/dashboard" className="text-sm font-medium text-slate-300 hover:text-primary-500 transition-colors">Client Hub</Link>
                )}
                {user.role === 'freelancer' && (
                  <Link to="/freelancer/dashboard" className="text-sm font-medium text-slate-300 hover:text-primary-500 transition-colors">Freelancer Hub</Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="text-sm font-medium text-slate-300 hover:text-primary-500 transition-colors">Admin Panel</Link>
                )}

                {/* Chat link */}
                <Link to="/chat" className="p-2 text-slate-400 hover:text-slate-200 transition-colors relative">
                  <MessageSquare className="h-5 w-5" />
                </Link>

                {/* Notifications dropdown trigger */}
                <div className="relative">
                  <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-slate-400 hover:text-slate-200 transition-colors relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown menu */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-700 bg-slate-800 p-2 shadow-xl ring-1 ring-black ring-opacity-5">
                      <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2 px-2">
                        <span className="text-xs font-semibold text-slate-400">Notifications</span>
                        <button onClick={markAllAsRead} className="text-[10px] text-primary-500 hover:text-primary-600">Mark all read</button>
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {notifications.length === 0 ? (
                          <div className="text-center py-4 text-xs text-slate-500">No notifications</div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n._id} className={`p-2 rounded-md transition-colors text-xs ${n.read ? 'bg-transparent text-slate-400' : 'bg-slate-700/50 text-slate-100 font-medium'}`}>
                              <p>{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Link */}
                {user.role === 'freelancer' && (
                  <Link to="/freelancer/profile" className="flex items-center space-x-1 p-2 hover:text-primary-500 transition-colors">
                    <User className="h-4 w-4" />
                    <span className="text-xs">{user.name}</span>
                  </Link>
                )}
                {user.role === 'client' && (
                  <Link to="/client/profile" className="flex items-center space-x-1 p-2 hover:text-primary-500 transition-colors">
                    <User className="h-4 w-4" />
                    <span className="text-xs">{user.name}</span>
                  </Link>
                )}

                {/* Logout Button */}
                <button onClick={handleLogout} className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-500 transition-colors">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2">Login</Link>
                <Link to="/register" className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-primary-500 transition-colors">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-400 hover:text-slate-200">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-2 pt-2 pb-4 space-y-1">
          <Link to="/gigs" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white">Browse Gigs</Link>
          <Link to="/freelancers" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white">Freelancers</Link>
          {isAuthenticated ? (
            <>
              {user.role === 'client' && (
                <>
                  <Link to="/client/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white">Client Hub</Link>
                  <Link to="/client/profile" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white">Profile</Link>
                </>
              )}
              {user.role === 'freelancer' && (
                <>
                  <Link to="/freelancer/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white">Freelancer Hub</Link>
                  <Link to="/freelancer/profile" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white">Profile</Link>
                </>
              )}
              <Link to="/chat" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white">Chat</Link>
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-slate-800 hover:text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white">Login</Link>
              <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

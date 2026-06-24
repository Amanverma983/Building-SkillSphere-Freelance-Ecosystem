import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { ShieldAlert, CheckCircle2, MapPin } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('freelancer');
  const [address, setAddress] = useState('');
  
  // Geolocation defaults
  const [coordinates, setCoordinates] = useState([77.2090, 28.6139]); // Delhi, India default

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates([position.coords.longitude, position.coords.latitude]);
          setAddress(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)} (GPS Location)`);
        },
        (error) => {
          setErrorMsg('Failed to acquire coordinates. Please enter details manually.');
        }
      );
    } else {
      setErrorMsg('Geolocator API not supported by browser.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        address,
        coordinates
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Registration successful! Verification email sent.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-950 py-8 px-4">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-wider text-slate-100 uppercase">Create Account</h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Join the hyperlocal SkillSphere network</p>
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center space-x-2 rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-xs text-green-400">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aman Verma"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aman@example.com"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Profile Role</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('freelancer')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-colors ${role === 'freelancer' ? 'bg-primary-600/10 border-primary-500 text-primary-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
              >
                Freelancer
              </button>
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-colors ${role === 'client' ? 'bg-primary-600/10 border-primary-500 text-primary-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
              >
                Client
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-400">Location Address</label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="flex items-center space-x-1 text-[10px] text-primary-500 hover:text-primary-600 font-semibold"
              >
                <MapPin className="h-3 w-3" />
                <span>Get Coordinates</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Connaught Place, New Delhi"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-lg py-2.5 text-xs font-bold transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

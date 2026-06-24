import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { authStart, authSuccess, authFailure } from '../store/authSlice';
import api from '../utils/api';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // 2FA state management
  const [isOtpRequired, setIsOtpRequired] = useState(false);
  const [tempToken, setTempToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    dispatch(authStart());

    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.success) {
        if (res.data.twoFactorRequired) {
          setIsOtpRequired(true);
          setTempToken(res.data.tempToken);
          setSuccessMsg('2FA OTP code required. Please check your authenticator application.');
        } else {
          dispatch(authSuccess({ user: res.data.user, token: res.data.token }));
          setSuccessMsg('Logged in successfully!');
          redirectOnRole(res.data.user.role);
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setErrorMsg(errMsg);
      dispatch(authFailure(errMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/auth/verify-2fa', {
        code: otp,
        tempToken
      });

      if (res.data.success) {
        dispatch(authSuccess({ user: res.data.user, token: res.data.token }));
        setSuccessMsg('2FA verified successfully!');
        redirectOnRole(res.data.user.role);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const redirectOnRole = (role) => {
    if (role === 'client') {
      navigate('/client/dashboard');
    } else if (role === 'freelancer') {
      navigate('/freelancer/dashboard');
    } else if (role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-950 px-4">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-wider text-slate-100 uppercase">SkillSphere Portal</h2>
          <p className="text-xs text-slate-400 mt-1.5">Sign in to manage your local freelance work</p>
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

        {!isOtpRequired ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-lg py-2.5 text-xs font-bold transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Enter 6-Digit OTP</label>
              <input
                type="text"
                required
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-center text-sm font-semibold tracking-widest text-slate-300 focus:outline-none focus:border-primary-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-lg py-2.5 text-xs font-bold transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-500 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

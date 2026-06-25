import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { ShieldAlert, MapPin, Check, UserCheck, Camera } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile } from '../store/authSlice';

const ClientProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState([0, 0]);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 2FA Setup State
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        const res = await api.post('/profile/upload', {
          file: reader.result,
          type: 'avatar'
        });
        if (res.data.success) {
          dispatch(updateUserProfile({ avatar: res.data.url }));
          setSuccessMsg('Profile picture updated successfully!');
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Failed to upload profile picture.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/profile/me');
      if (res.data.success) {
        const data = res.data.data;
        setCompanyName(data.companyName || '');
        setWebsite(data.website || '');
        setBio(data.bio || '');
        setAddress(data.location?.address || '');
        setCoordinates(data.location?.coordinates || [0, 0]);
        setIs2FAEnabled(data.user?.isTwoFactorEnabled || false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put('/profile/client', {
        companyName,
        website,
        bio,
        address,
        coordinates
      });

      if (res.data.success) {
        setSuccessMsg('Profile updated successfully!');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates([position.coords.longitude, position.coords.latitude]);
          setAddress(`GPS Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
        },
        () => {
          setErrorMsg('Failed to fetch coordinates. Set location details manually.');
        }
      );
    }
  };

  const handleToggle2FA = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (is2FAEnabled) {
        const res = await api.post('/auth/disable-2fa');
        if (res.data.success) {
          setIs2FAEnabled(false);
          dispatch(updateUserProfile({ isTwoFactorEnabled: false }));
          setSuccessMsg('2FA disabled successfully');
        }
      } else {
        const res = await api.post('/auth/enable-2fa');
        if (res.data.success) {
          setTwoFactorSecret(res.data.secret);
          setShow2FAModal(true);
        }
      }
    } catch (err) {
      setErrorMsg('2FA state toggle failed.');
    }
  };

  const confirm2FAActivation = () => {
    setIs2FAEnabled(true);
    dispatch(updateUserProfile({ isTwoFactorEnabled: true }));
    setShow2FAModal(false);
    setSuccessMsg('2FA activated successfully!');
  };

  return (
    <div className="flex-1 bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Security Info */}
        <div className="space-y-6">
          {/* Avatar Upload Card */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col items-center space-y-4 animate-fadeIn">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Picture</h3>
            <div className="relative group cursor-pointer h-24 w-24 rounded-full overflow-hidden border-2 border-slate-700 hover:border-primary-500 transition-colors">
              <img
                src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya'}
                alt={user?.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
              />
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-slate-200">
                <Camera className="h-5 w-5 text-white" />
                <span className="text-[9px] mt-1 font-semibold">Upload</span>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div className="text-center">
              <h4 className="text-xs font-bold text-slate-300">{companyName || user?.name}</h4>
              <span className="text-[10px] text-slate-500 capitalize">{user?.role}</span>
            </div>
          </div>

          {/* Security & 2FA */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security Control</h3>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200">Two Factor Auth (2FA)</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Protect logins using OTP codes</p>
              </div>
              <button
                onClick={handleToggle2FA}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${is2FAEnabled ? 'bg-primary-500' : 'bg-slate-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${is2FAEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
            {is2FAEnabled && (
              <span className="inline-flex items-center text-[9px] text-green-400 bg-green-600/10 border border-green-500/20 rounded px-1.5 py-0.5 font-bold">
                ✓ 2FA ACTIVE
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Profile Editor Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleUpdate} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
            <div>
              <h2 className="text-md font-bold text-slate-100 uppercase tracking-wider">Company Profile Details</h2>
              <p className="text-xs text-slate-400 mt-0.5">Tell freelancers about your corporate environment or agency</p>
            </div>

            {errorMsg && (
              <div className="flex items-center space-x-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
                <ShieldAlert className="h-4 w-4" /><span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="flex items-center space-x-2 rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-xs text-green-400">
                <UserCheck className="h-4 w-4" /><span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Company / Agency Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Tech Solutions"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Website Address</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://acme.org"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Company Bio / Description</label>
                <textarea
                  rows="4"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Briefly describe your company, values, and the type of work you outsource..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Location / Address</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Connaught Place, New Delhi"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg py-2 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 transition-colors flex items-center"
                    title="Get GPS location"
                  >
                    <MapPin className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-lg py-2.5 text-xs font-bold transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

      </div>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="glass-card max-w-md w-full p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Setup Two-Factor Authentication</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scan the barcode or copy this secret key into your Google Authenticator/Authy app:
            </p>
            <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800 select-all">
              <span className="font-mono text-sm tracking-wider text-primary-400 font-bold">{twoFactorSecret}</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Note: Authy/Google Authenticator will generate 6-digit verification codes every 30 seconds.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShow2FAModal(false)}
                className="bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-4 text-xs text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={confirm2FAActivation}
                className="bg-primary-600 hover:bg-primary-500 text-white rounded-lg py-1.5 px-4 text-xs font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProfile;

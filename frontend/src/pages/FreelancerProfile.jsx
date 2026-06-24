import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { ShieldAlert, Plus, Trash, Check, UserCheck, Calendar } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile } from '../store/authSlice';

const FreelancerProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProf, setNewSkillProf] = useState('Intermediate');
  const [hourlyRate, setHourlyRate] = useState('');
  const [publicSlug, setPublicSlug] = useState('');
  const [address, setAddress] = useState('');
  
  // Availability booked slots
  const [bookedDates, setBookedDates] = useState([]);
  
  const [completion, setCompletion] = useState(0);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 2FA Setup
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/profile/me');
      if (res.data.success) {
        const data = res.data.data;
        setBio(data.bio || '');
        setSkills(data.skills || []);
        setHourlyRate(data.hourlyRate || '');
        setPublicSlug(data.publicSlug || '');
        setAddress(data.location?.address || '');
        setBookedDates(data.availability?.bookedDates || []);
        setCompletion(data.profileCompletion || 0);
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
      const res = await api.put('/profile/freelancer', {
        bio,
        skills,
        hourlyRate: Number(hourlyRate),
        publicSlug,
        address
      });

      if (res.data.success) {
        setSuccessMsg('Profile updated successfully!');
        setCompletion(res.data.data.profileCompletion);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([...skills, { name: newSkillName.trim(), proficiency: newSkillProf }]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (idx) => {
    setSkills(skills.filter((_, i) => i !== idx));
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
        
        {/* Left Column: Stats & Setup */}
        <div className="space-y-6">
          {/* Profile completion badge */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Status</h3>
            <div className="relative inline-flex items-center justify-center">
              {/* Simple text completion indicator */}
              <div className="h-20 w-20 rounded-full border-4 border-primary-500/20 flex items-center justify-center">
                <span className="text-lg font-bold text-primary-400">{completion}%</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">Complete your bio, upload portfolio assets and resume details to reach 100%</p>
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
                className={`rounded px-3 py-1.5 text-[10px] font-bold transition-colors ${is2FAEnabled ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}
              >
                {is2FAEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>

          {/* Availability schedule slots display */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Booked Dates ({bookedDates.length})</span>
            </h3>
            {bookedDates.length === 0 ? (
              <p className="text-[11px] text-slate-500">Your calendar schedule is currently open.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {bookedDates.map((d, idx) => (
                  <div key={idx} className="text-xs bg-slate-900 border border-slate-800 p-2 rounded text-slate-300">
                    {new Date(d).toLocaleDateString()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Profile Edit Form */}
        <div className="md:col-span-2 glass-card p-8 rounded-2xl border border-slate-800 space-y-6">
          <div>
            <h2 className="text-lg font-bold tracking-wider uppercase">Edit Freelancer Profile</h2>
            <p className="text-xs text-slate-400 mt-1">Configure profile details for client search discovery</p>
          </div>

          {errorMsg && (
            <div className="flex items-center space-x-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
              <ShieldAlert className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center space-x-2 rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-xs text-green-400">
              <Check className="h-4 w-4" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Hourly Rate (INR)</label>
              <input
                type="number"
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="500"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Public Profile URL Slug</label>
              <input
                type="text"
                required
                value={publicSlug}
                onChange={(e) => setPublicSlug(e.target.value)}
                placeholder="aman-verma-react"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Profile Biography</label>
              <textarea
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Introduce yourself, experience summary, and expertise details..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Skills Set</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Skill (e.g. Node.js)"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none"
                />
                <select
                  value={newSkillProf}
                  onChange={(e) => setNewSkillProf(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-400 focus:outline-none"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Expert</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-primary-600 hover:bg-primary-500 text-white rounded-lg px-3 text-xs font-bold"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                {skills.map((s, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
                    <span>{s.name} ({s.proficiency})</span>
                    <button type="button" onClick={() => handleRemoveSkill(idx)} className="text-red-400 hover:text-red-500">
                      <Trash className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-lg py-2.5 text-xs font-bold transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Saving Profile...' : 'Save Profile Details'}
            </button>
          </form>
        </div>
      </div>

      {/* 2FA Configuration modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="glass-card max-w-sm w-full p-6 rounded-xl border border-slate-800 space-y-4 text-center">
            <UserCheck className="mx-auto text-primary-400 h-12 w-12" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Configure Two Factor Auth</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scan or enter the following secret key inside Google Authenticator or Microsoft Authenticator app:
            </p>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded text-sm font-mono tracking-widest text-slate-300">
              {twoFactorSecret}
            </div>
            <div className="flex justify-center space-x-2 pt-2">
              <button
                onClick={() => setShow2FAModal(false)}
                className="bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3.5 text-xs text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={confirm2FAActivation}
                className="bg-primary-600 hover:bg-primary-500 text-white rounded-lg py-1.5 px-3.5 text-xs font-bold"
              >
                Done / Activated
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerProfile;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ShieldAlert, Plus, Trash, MapPin } from 'lucide-react';

const PostGig = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [budgetType, setBudgetType] = useState('fixed');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState([77.2090, 28.6139]);

  const [milestones, setMilestones] = useState([{ title: '', amount: '' }]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: '', amount: '' }]);
  };

  const handleRemoveMilestone = (idx) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const handleMilestoneChange = (idx, field, value) => {
    const updated = [...milestones];
    updated[idx][field] = value;
    setMilestones(updated);
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

  const handlePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      
      const payload = {
        title,
        description,
        skills: skillsArray,
        budgetType,
        minBudget: Number(minBudget),
        maxBudget: Number(maxBudget),
        milestones: milestones.map(m => ({ title: m.title, amount: Number(m.amount) })),
        location: {
          coordinates,
          address
        }
      };

      const res = await api.post('/gigs', payload);
      if (res.data.success) {
        navigate('/client/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to post gig.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 p-6">
      <div className="mx-auto max-w-2xl glass-card p-8 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-wider text-slate-100 uppercase">Post a New Gig</h2>
          <p className="text-xs text-slate-400">Describe your project requirements and setup milestones</p>
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePost} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Project Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="React Developer for E-Commerce Dashboard"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Detailed Description</label>
            <textarea
              required
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe work parameters, timeline, and expectations..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Required Skills (comma separated)</label>
            <input
              type="text"
              required
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, Redux, Tailwind, Node.js"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Budget Type</label>
              <select
                value={budgetType}
                onChange={(e) => setBudgetType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-xs text-slate-400 focus:outline-none"
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Contract</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Min Budget (INR)</label>
              <input
                type="number"
                required
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                placeholder="5000"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Max Budget (INR)</label>
              <input
                type="number"
                required
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                placeholder="15000"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Location details */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-400">Project Location Address</label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="flex items-center space-x-1 text-[10px] text-primary-500 hover:text-primary-600 font-semibold"
              >
                <MapPin className="h-3 w-3" />
                <span>Use Current Position</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Sector 62, Noida"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none"
            />
          </div>

          {/* Milestone Setup */}
          <div className="border-t border-slate-800 pt-4 mt-2 space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-300">Project Milestones Setup</label>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="flex items-center space-x-1 text-[10px] bg-primary-600/10 text-primary-400 border border-primary-500/20 px-2 py-1 rounded hover:bg-primary-600 hover:text-white"
              >
                <Plus className="h-3 w-3" />
                <span>Add Milestone</span>
              </button>
            </div>

            {milestones.map((m, idx) => (
              <div key={idx} className="flex items-center space-x-2 bg-slate-900/40 p-2 border border-slate-800 rounded-lg">
                <input
                  type="text"
                  required
                  placeholder="Milestone Title (e.g. Design Wireframes)"
                  value={m.title}
                  onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded py-1.5 px-2 text-xs text-slate-300 focus:outline-none"
                />
                <input
                  type="number"
                  required
                  placeholder="Amount (INR)"
                  value={m.amount}
                  onChange={(e) => handleMilestoneChange(idx, 'amount', e.target.value)}
                  className="w-28 bg-slate-900 border border-slate-800 rounded py-1.5 px-2 text-xs text-slate-300 focus:outline-none"
                />
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(idx)}
                    className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-600 hover:text-white"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-lg py-2.5 text-xs font-bold transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? 'Posting Project...' : 'Publish Gig'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostGig;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { MapPin, DollarSign, Clock, ArrowLeft, ShieldAlert, CheckCircle2, MessageSquare } from 'lucide-react';

const GigDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Proposal form state
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGig();
  }, [id]);

  const fetchGig = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/gigs/${id}`);
      if (res.data.success) {
        setGig(res.data.data);
      }
    } catch (err) {
      setErrorMsg('Failed to load gig details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.post('/proposals', {
        gigId: id,
        coverLetter,
        bidAmount: Number(bidAmount),
        duration: Number(duration)
      });
      if (res.data.success) {
        setSuccessMsg('Proposal submitted successfully!');
        setShowProposalForm(false);
        setCoverLetter('');
        setBidAmount('');
        setDuration('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Browse</span>
        </button>

        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
            <ShieldAlert className="h-4 w-4" /><span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center space-x-2 rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-xs text-green-400">
            <CheckCircle2 className="h-4 w-4" /><span>{successMsg}</span>
          </div>
        )}

        {gig && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Gig Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex rounded-full bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400 capitalize">
                    {gig.status}
                  </span>
                  <span className="text-[10px] text-slate-500 capitalize">{gig.budgetType} contract</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-100">{gig.title}</h1>
                <div className="flex items-center space-x-4 text-xs text-slate-400">
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{gig.location?.address || 'Hyperlocal'}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>₹{gig.minBudget} – ₹{gig.maxBudget}</span>
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{gig.description}</p>
              </div>

              {/* Skills Required */}
              <div className="glass-card p-5 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {gig.skills.map((s, idx) => (
                    <span key={idx} className="rounded-full bg-primary-500/10 border border-primary-500/20 px-3 py-1 text-xs text-primary-400 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              {gig.milestones && gig.milestones.length > 0 && (
                <div className="glass-card p-5 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Project Milestones</h3>
                  <div className="space-y-2">
                    {gig.milestones.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-800 rounded-lg">
                        <span className="text-xs font-medium text-slate-300">{m.title}</span>
                        <span className="text-xs font-bold text-primary-400">₹{m.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Client Info */}
              <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Posted By</h3>
                {gig.client && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={gig.client.avatar || 'https://via.placeholder.com/150'}
                        alt={gig.client.name}
                        className="h-10 w-10 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">{gig.client.name}</h4>
                        <span className="text-[10px] text-slate-500">Client</span>
                      </div>
                    </div>
                    {isAuthenticated && user?.role === 'freelancer' && (
                      <Link
                        to="/chat"
                        state={{ partner: gig.client }}
                        className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isAuthenticated && user?.role === 'freelancer' && gig.status === 'published' && (
                <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submit Proposal</h3>
                  <p className="text-[11px] text-slate-500">
                    {gig.proposalsCount} application{gig.proposalsCount !== 1 ? 's' : ''} submitted
                  </p>
                  <button
                    onClick={() => setShowProposalForm(!showProposalForm)}
                    className="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-lg py-2.5 text-xs font-bold transition-colors shadow-md"
                  >
                    {showProposalForm ? 'Cancel' : 'Apply for this Gig'}
                  </button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="glass-card p-5 rounded-xl border border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-400">Login as a freelancer to submit proposals</p>
                  <button onClick={() => navigate('/login')} className="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-lg py-2 text-xs font-bold">
                    Login to Apply
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Proposal Form */}
        {showProposalForm && (
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Your Proposal</h3>
            <form onSubmit={handleSubmitProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Cover Letter</label>
                <textarea
                  required
                  rows="5"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Describe your expertise, why you're the best fit, and your approach..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Bid Amount (INR)</label>
                  <input
                    type="number"
                    required
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="e.g. 8000"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    <Clock className="inline h-3 w-3 mr-1" />
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 14"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-lg py-2.5 text-xs font-bold transition-colors shadow-md disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Proposal'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default GigDetails;

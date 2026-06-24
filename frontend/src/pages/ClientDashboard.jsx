import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { PlusCircle, FileText, IndianRupee, Briefcase, ChevronRight } from 'lucide-react';

const ClientDashboard = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    fetchClientStats();
  }, []);

  const fetchClientStats = async () => {
    setLoading(true);
    try {
      // Get my profile details (includes spentAmount)
      const profileRes = await api.get('/profile/me');
      if (profileRes.data.success) {
        setTotalSpent(profileRes.data.data.spentAmount || 0);
      }

      // Get my posted gigs
      const gigsRes = await api.get('/gigs');
      if (gigsRes.data.success) {
        // Filter gigs where client is me
        const myGigs = gigsRes.data.data; 
        setGigs(myGigs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header toolbar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-wider text-slate-100 uppercase">Client Workspace</h2>
            <p className="text-xs text-slate-400 font-medium">Manage active projects and release contract funds</p>
          </div>
          <Link
            to="/client/post-gig"
            className="flex items-center space-x-1.5 rounded-lg bg-primary-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-500 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Post a New Gig</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card p-5 rounded-xl border border-slate-800 flex items-center space-x-4">
            <div className="rounded-lg bg-primary-500/10 p-3 text-primary-400">
              <IndianRupee className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500">Total Capital Spent</span>
              <h3 className="text-xl font-bold text-slate-200 mt-0.5">₹{totalSpent.toLocaleString()}</h3>
            </div>
          </div>

          <div className="glass-card p-5 rounded-xl border border-slate-800 flex items-center space-x-4">
            <div className="rounded-lg bg-primary-500/10 p-3 text-primary-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500">Total Posted Gigs</span>
              <h3 className="text-xl font-bold text-slate-200 mt-0.5">{gigs.length}</h3>
            </div>
          </div>

          <div className="glass-card p-5 rounded-xl border border-slate-800 flex items-center space-x-4">
            <div className="rounded-lg bg-primary-500/10 p-3 text-primary-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500">Active Contracts</span>
              <h3 className="text-xl font-bold text-slate-200 mt-0.5">
                {gigs.filter(g => g.status === 'in-progress').length}
              </h3>
            </div>
          </div>
        </div>

        {/* Gigs List */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-3">My Posted Projects</h3>
          {loading ? (
            <div className="text-center py-6">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
            </div>
          ) : gigs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">You haven't posted any gigs yet.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {gigs.map((g) => (
                <div key={g._id} className="flex items-center justify-between py-4 transition-colors hover:bg-slate-900/10 px-2 rounded-lg">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-200 truncate">{g.title}</h4>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1">
                      <span className="capitalize bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 font-medium">{g.status}</span>
                      <span>Budget: ₹{g.minBudget} - ₹{g.maxBudget}</span>
                      <span>Proposals: {g.proposalsCount}</span>
                    </div>
                  </div>
                  <Link
                    to={`/client/gigs/${g._id}`}
                    className="flex items-center space-x-0.5 text-xs text-primary-400 hover:text-primary-500 font-semibold"
                  >
                    <span>View Proposals</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;

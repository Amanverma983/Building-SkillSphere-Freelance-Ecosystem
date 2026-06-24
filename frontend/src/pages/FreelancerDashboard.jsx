import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import api from '../utils/api';
import { Award, DollarSign, Send, Zap, ChevronRight } from 'lucide-react';

const FreelancerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [recommendedGigs, setRecommendedGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFreelancerStats();
  }, []);

  const fetchFreelancerStats = async () => {
    setLoading(true);
    try {
      // 1. Get analytics
      const analyticsRes = await api.get('/analytics/freelancer');
      if (analyticsRes.data.success) {
        setStats(analyticsRes.data.data);
      }

      // 2. Get proposals
      const proposalsRes = await api.get('/proposals/my');
      if (proposalsRes.data.success) {
        setProposals(proposalsRes.data.data);
      }

      // 3. Get personalized AI Gig recommendations
      const recommendationsRes = await api.get('/gigs/recommendations/freelancer');
      if (recommendationsRes.data.success) {
        setRecommendedGigs(recommendationsRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-wider text-slate-100 uppercase">Freelancer Workspace</h2>
          <p className="text-xs text-slate-400 font-medium">Monitor earnings, review applications, and find matched gigs</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="glass-card p-5 rounded-xl border border-slate-800 flex items-center space-x-3.5">
              <div className="rounded-lg bg-primary-500/10 p-3 text-primary-400">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500">Total Earnings</span>
                <h3 className="text-lg font-bold text-slate-200 mt-0.5">₹{stats.totalEarnings.toLocaleString()}</h3>
              </div>
            </div>

            <div className="glass-card p-5 rounded-xl border border-slate-800 flex items-center space-x-3.5">
              <div className="rounded-lg bg-primary-500/10 p-3 text-primary-400">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500">Reputation Score</span>
                <h3 className="text-lg font-bold text-slate-200 mt-0.5">{stats.reputationScore}/100</h3>
              </div>
            </div>

            <div className="glass-card p-5 rounded-xl border border-slate-800 flex items-center space-x-3.5">
              <div className="rounded-lg bg-primary-500/10 p-3 text-primary-400">
                <Send className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500">Bid Success Rate</span>
                <h3 className="text-lg font-bold text-slate-200 mt-0.5">{stats.applications.successRate}%</h3>
              </div>
            </div>

            <div className="glass-card p-5 rounded-xl border border-slate-800 flex items-center space-x-3.5">
              <div className="rounded-lg bg-primary-500/10 p-3 text-primary-400">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500">Active Gigs</span>
                <h3 className="text-lg font-bold text-slate-200 mt-0.5">{stats.activeGigsCount}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active applications list */}
          <div className="md:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">My Gigs Proposals ({proposals.length})</h3>
              <RouterLink to="/freelancer/analytics" className="text-xs text-primary-400 hover:underline">View Analytics</RouterLink>
            </div>
            
            {loading ? (
              <div className="text-center py-6">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
              </div>
            ) : proposals.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No active applications.</p>
            ) : (
              <div className="divide-y divide-slate-800">
                {proposals.map((p) => (
                  <div key={p._id} className="flex justify-between items-center py-3">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{p.gig.title}</h4>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">Bid: ₹{p.bidAmount} • Client: {p.gig.client?.name || 'Local Client'}</span>
                    </div>
                    <span className={`text-[10px] rounded border font-semibold px-2 py-0.5 capitalize ${p.status === 'accepted' ? 'bg-green-600/10 border-green-500 text-green-400' : p.status === 'rejected' ? 'bg-red-600/10 border-red-500 text-red-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Gig recommendations */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1 border-b border-slate-800 pb-3">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>AI Gig Matches</span>
            </h3>

            {loading ? (
              <div className="text-center py-6">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
              </div>
            ) : recommendedGigs.length === 0 ? (
              <p className="text-xs text-slate-500">No matching gigs found. Update skills in profile.</p>
            ) : (
              <div className="space-y-3">
                {recommendedGigs.map(({ gig, score }) => (
                  <div key={gig._id} className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-200 truncate max-w-[140px]">
                        <RouterLink to={`/gigs/${gig._id}`} className="hover:text-primary-400">{gig.title}</RouterLink>
                      </h4>
                      <span className="text-[9px] bg-primary-600/20 text-primary-400 font-bold border border-primary-500/20 px-1.5 py-0.5 rounded">
                        {score}% Match
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-slate-500">Budget: ₹{gig.maxBudget}</span>
                      <RouterLink
                        to={`/gigs/${gig._id}`}
                        className="flex items-center space-x-0.5 text-[9px] font-bold text-primary-400 hover:text-primary-500"
                      >
                        <span>Apply</span>
                        <ChevronRight className="h-3 w-3" />
                      </RouterLink>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;

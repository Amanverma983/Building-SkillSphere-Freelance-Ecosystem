import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Star, Send, Zap } from 'lucide-react';

const FreelancerAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/freelancer');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-500 text-xs">
        Failed to load analytics. Please refresh.
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-wider text-slate-100 uppercase">Freelancer Analytics</h2>
          <p className="text-xs text-slate-400 font-medium">Track performance and earnings momentum</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
            <div className="flex justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-primary-400" />
            </div>
            <div className="text-lg font-bold text-slate-100">₹{analytics.totalEarnings.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Total Earnings</div>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
            <div className="flex justify-center mb-2">
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="text-lg font-bold text-slate-100">{analytics.ratingAverage} ★</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Average Rating</div>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
            <div className="flex justify-center mb-2">
              <Send className="h-5 w-5 text-primary-400" />
            </div>
            <div className="text-lg font-bold text-slate-100">{analytics.applications.total}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Total Bids</div>
          </div>

          <div className="glass-card p-4 rounded-xl border border-slate-800 text-center">
            <div className="flex justify-center mb-2">
              <Zap className="h-5 w-5 text-primary-400" />
            </div>
            <div className="text-lg font-bold text-slate-100">{analytics.applications.successRate}%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Win Rate</div>
          </div>
        </div>

        {/* Monthly Earnings Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Monthly Earnings (Current Year)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: 10 }}
                labelStyle={{ color: '#cbd5e1' }}
                itemStyle={{ color: '#38bdf8' }}
                formatter={(value) => [`₹${value}`, 'Earnings']}
              />
              <Bar dataKey="earnings" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Reputation breakdown */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reputation Score Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-slate-400">Overall Score</span>
                <span className="text-xs font-bold text-primary-400">{analytics.reputationScore}/100</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full transition-all" style={{ width: `${analytics.reputationScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-slate-400">Bid Acceptance</span>
                <span className="text-xs font-bold text-green-400">{analytics.applications.successRate}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all" style={{ width: `${analytics.applications.successRate}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-slate-400">Client Satisfaction</span>
                <span className="text-xs font-bold text-yellow-400">{analytics.ratingAverage * 20}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all" style={{ width: `${analytics.ratingAverage * 20}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerAnalytics;

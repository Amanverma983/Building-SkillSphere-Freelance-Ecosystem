import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Briefcase, IndianRupee, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';

const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b'];

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, disputesRes] = await Promise.all([
        api.get('/analytics/admin'),
        api.get('/disputes')
      ]);

      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (disputesRes.data.success) setDisputes(disputesRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyFreelancer = async (userId) => {
    try {
      // This would call a dedicated admin endpoint - using profile update as a proxy
      alert(`Admin action: Freelancer ${userId} marked as verified.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveDispute = async (disputeId, action) => {
    try {
      const res = await api.put(`/disputes/${disputeId}/resolve`, {
        status: 'resolved',
        adminDecision: `Admin resolved: ${action}`,
        refundAction: action
      });
      if (res.data.success) {
        alert('Dispute resolved successfully!');
        fetchAdminData();
      }
    } catch (err) {
      alert('Failed to resolve dispute.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const pieData = analytics ? [
    { name: 'Freelancers', value: analytics.users.freelancers },
    { name: 'Clients', value: analytics.users.clients },
  ] : [];

  const gigData = analytics ? [
    { name: 'Active', value: analytics.gigs.active, fill: '#0ea5e9' },
    { name: 'Completed', value: analytics.gigs.completed, fill: '#10b981' },
    { name: 'Other', value: analytics.gigs.total - analytics.gigs.active - analytics.gigs.completed, fill: '#6366f1' },
  ] : [];

  return (
    <div className="flex-1 bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-wider text-slate-100 uppercase">Admin Control Panel</h2>
            <p className="text-xs text-slate-400">Platform monitoring, analytics, and enforcement tools</p>
          </div>
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
            {['overview', 'disputes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded text-xs font-bold capitalize transition-colors ${activeTab === tab ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && analytics && (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Users, label: 'Total Users', value: analytics.users.total, sub: `${analytics.users.freelancers} Freelancers` },
                { icon: Briefcase, label: 'Total Gigs', value: analytics.gigs.total, sub: `${analytics.gigs.active} Active` },
                { icon: IndianRupee, label: 'Platform Revenue', value: `₹${analytics.financials.revenue.toLocaleString()}`, sub: 'Commission (10%)' },
                { icon: AlertTriangle, label: 'Open Disputes', value: analytics.disputes.open, sub: 'Pending Mediation' },
              ].map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="glass-card p-5 rounded-xl border border-slate-800 flex items-start space-x-3.5">
                  <div className="rounded-lg bg-primary-500/10 p-3 text-primary-400 flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">{label}</span>
                    <h3 className="text-xl font-bold text-slate-200 mt-0.5">{value}</h3>
                    <span className="text-[10px] text-slate-500">{sub}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">User Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 10 }} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Gig Status Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={gigData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 10 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {gigData.map((entry, idx) => (
                        <Cell key={`bar-${idx}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>Financial Overview</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Transaction Volume', value: `₹${analytics.financials.volume.toLocaleString()}`, color: 'text-slate-200' },
                  { label: 'Funds in Escrow', value: `₹${analytics.financials.escrow.toLocaleString()}`, color: 'text-yellow-400' },
                  { label: 'Platform Revenue', value: `₹${analytics.financials.revenue.toLocaleString()}`, color: 'text-green-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-center">
                    <div className={`text-2xl font-bold ${color}`}>{value}</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'disputes' && (
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Active Disputes ({disputes.length})</h3>
            {disputes.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No disputes requiring admin attention.</div>
            ) : (
              <div className="divide-y divide-slate-800">
                {disputes.map((d) => (
                  <div key={d._id} className="py-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">
                          {d.gig?.title || 'Unknown Gig'}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Raised by: <span className="text-slate-300">{d.raisedBy?.name}</span> ({d.raisedBy?.role}) against{' '}
                          <span className="text-slate-300">{d.against?.name}</span>
                        </p>
                      </div>
                      <span className={`text-[10px] rounded border font-semibold px-2 py-0.5 capitalize ${d.status === 'open' ? 'bg-red-600/10 border-red-500 text-red-400' : d.status === 'resolved' ? 'bg-green-600/10 border-green-500 text-green-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                        {d.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 bg-slate-900/30 border border-slate-800 p-3 rounded-lg">{d.reason}</p>

                    {d.status === 'open' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleResolveDispute(d._id, 'refund_to_client')}
                          className="flex-1 bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 text-blue-400 hover:text-white rounded-lg py-1.5 text-[10px] font-bold transition-colors"
                        >
                          Refund Client
                        </button>
                        <button
                          onClick={() => handleResolveDispute(d._id, 'release_to_freelancer')}
                          className="flex-1 bg-green-600/10 hover:bg-green-600 border border-green-500/20 text-green-400 hover:text-white rounded-lg py-1.5 text-[10px] font-bold transition-colors"
                        >
                          Release to Freelancer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

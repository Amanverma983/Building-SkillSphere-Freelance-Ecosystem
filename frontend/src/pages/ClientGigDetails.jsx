import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { ShieldAlert, Check, AlertTriangle, ArrowLeft, MessageSquare, ShieldCheck } from 'lucide-react';

const ClientGigDetails = () => {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Dispute state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  useEffect(() => {
    fetchGigAndProposals();
  }, [id]);

  const fetchGigAndProposals = async () => {
    setLoading(true);
    try {
      const gigRes = await api.get(`/gigs/${id}`);
      if (gigRes.data.success) {
        setGig(gigRes.data.data);
        
        // If gig is open/published, fetch proposals
        if (gigRes.data.data.status === 'published') {
          const propRes = await api.get(`/proposals/gig/${id}`);
          if (propRes.data.success) {
            setProposals(propRes.data.data);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load gig details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptProposal = async (proposalId) => {
    try {
      const res = await api.put(`/proposals/${proposalId}/status`, { status: 'accepted' });
      if (res.data.success) {
        alert('Proposal accepted successfully! Contract started.');
        fetchGigAndProposals();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept proposal.');
    }
  };

  const handleFundEscrow = async (milestoneId) => {
    try {
      // 1. Create order on backend
      const orderRes = await api.post('/payments/order', { gigId: id, milestoneId });
      if (!orderRes.data.success) {
        alert('Failed to initialize payment order');
        return;
      }
      
      const order = orderRes.data.data;

      // Check if it is a mock order (returned when no real keys are set)
      if (order.id.startsWith('order_mock_')) {
        console.log('Mock payment order detected. Bypassing real gateway overlay...');
        const verifyRes = await api.post('/payments/verify', {
          gigId: id,
          milestoneId,
          razorpayOrderId: order.id,
          razorpayPaymentId: `pay_mock_${order.id.slice(11)}`,
          razorpaySignature: 'mock_signature'
        });

        if (verifyRes.data.success) {
          alert('Milestone funded and deposited in Escrow successfully! (Sandbox/Mock)');
          fetchGigAndProposals();
        }
        return;
      }

      // Load Razorpay script dynamically
      const loadScript = () => {
        return new Promise((resolve) => {
          if (window.Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isScriptLoaded = await loadScript();
      if (!isScriptLoaded) {
        alert('Failed to load payment gateway script. Check your internet connection.');
        return;
      }

      // Configure checkout options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mockkeyid123',
        amount: order.amount,
        currency: order.currency,
        name: 'SkillSphere',
        description: 'Fund Escrow Milestone',
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/payments/verify', {
              gigId: id,
              milestoneId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            if (verifyRes.data.success) {
              alert('Milestone funded and deposited in Escrow successfully!');
              fetchGigAndProposals();
            }
          } catch (verifyErr) {
            alert(verifyErr.response?.data?.message || 'Payment signature verification failed.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: {
          color: '#0ea5e9'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert('Failed to fund milestone escrow.');
    }
  };

  const handleReleaseEscrow = async (milestoneId) => {
    try {
      // Find the payment associated with this milestone
      const paymentsRes = await api.get('/payments/history');
      const payment = paymentsRes.data.data.find(p => p.gig._id === id && p.milestoneId === milestoneId && p.status === 'escrow');
      
      if (!payment) {
        alert('Active escrow payment record not found for this milestone');
        return;
      }

      const res = await api.post(`/payments/release/${payment._id}`);
      if (res.data.success) {
        alert('Milestone funds released to freelancer successfully!');
        fetchGigAndProposals();
      }
    } catch (err) {
      alert('Failed to release escrow.');
    }
  };

  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/disputes', {
        gigId: id,
        reason: disputeReason
      });

      if (res.data.success) {
        alert('Dispute raised. Admin mediation has been requested.');
        setShowDisputeModal(false);
        setDisputeReason('');
        fetchGigAndProposals();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to raise dispute.');
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
        <Link to="/client/dashboard" className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Hub</span>
        </Link>

        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
            <ShieldAlert className="h-4 w-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {gig && (
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex rounded-full bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400 capitalize">
                  {gig.status}
                </span>
                <h2 className="text-xl font-bold mt-2">{gig.title}</h2>
              </div>
              {gig.status === 'in-progress' && (
                <button
                  onClick={() => setShowDisputeModal(true)}
                  className="flex items-center space-x-1 bg-red-600/10 hover:bg-red-600 border border-red-500/30 rounded-lg px-3 py-1.5 text-xs text-red-400 hover:text-white transition-colors"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Raise Dispute</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400">{gig.description}</p>
          </div>
        )}

        {/* Proposals Bids log (For published gigs) */}
        {gig?.status === 'published' && (
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Submitted Applications ({proposals.length})</h3>
            {proposals.length === 0 ? (
              <p className="text-xs text-slate-500">No applications received yet.</p>
            ) : (
              <div className="divide-y divide-slate-800">
                {proposals.map((p) => (
                  <div key={p._id} className="py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Link to={`/freelancers/${p.freelancer._id}`} className="flex items-center space-x-2 group">
                          <img
                            src={p.freelancer.avatar || 'https://via.placeholder.com/150'}
                            alt={p.freelancer.name}
                            className="h-8 w-8 rounded-full object-cover group-hover:opacity-80 transition-opacity"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-200 group-hover:text-primary-400 transition-colors">{p.freelancer.name}</h4>
                            <span className="text-[9px] text-slate-500">Bid amount: ₹{p.bidAmount} in {p.duration} days</span>
                          </div>
                        </Link>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link 
                          to="/chat" 
                          state={{ partner: p.freelancer }}
                          className="p-1.5 bg-slate-900 border border-slate-800 rounded text-slate-400 hover:text-slate-200"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleAcceptProposal(p._id)}
                          className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-500 rounded px-2.5 py-1 text-[10px] font-bold text-white shadow"
                        >
                          <Check className="h-3 w-3" />
                          <span>Accept & Start</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">{p.coverLetter}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Milestone Contracts log (For active/completed gigs) */}
        {gig && (gig.status === 'in-progress' || gig.status === 'completed' || gig.status === 'cancelled') && (
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Milestone Payments</h3>
              {gig.freelancer ? (
                <Link 
                  to="/chat" 
                  state={{ partner: gig.freelancer }}
                  className="flex items-center space-x-1 text-xs text-primary-400 hover:underline"
                >
                  <MessageSquare className="h-4.5 w-4.5" />
                  <span>Chat Collaborator</span>
                </Link>
              ) : (
                <Link to="/chat" className="flex items-center space-x-1 text-xs text-primary-400 hover:underline">
                  <MessageSquare className="h-4.5 w-4.5" />
                  <span>Chat Collaborator</span>
                </Link>
              )}
            </div>
            <div className="space-y-3">
              {gig.milestones.map((m) => (
                <div key={m._id} className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded-lg">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{m.title}</h4>
                    <span className="text-[9px] text-slate-500 font-medium">Amount: ₹{m.amount}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded border capitalize font-semibold ${m.status === 'released' ? 'bg-green-600/10 border-green-500 text-green-400' : m.status === 'escrow' ? 'bg-yellow-600/10 border-yellow-500 text-yellow-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                      {m.status}
                    </span>

                    {m.status === 'pending' && (
                      <button
                        onClick={() => handleFundEscrow(m._id)}
                        className="bg-primary-600 hover:bg-primary-500 rounded px-2.5 py-1 text-[10px] font-bold text-white transition-colors"
                      >
                        Fund Escrow
                      </button>
                    )}

                    {m.status === 'escrow' && (
                      <button
                        onClick={() => handleReleaseEscrow(m._id)}
                        className="bg-green-600 hover:bg-green-500 rounded px-2.5 py-1 text-[10px] font-bold text-white transition-colors"
                      >
                        Release Funds
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dispute Resolution Modal */}
        {showDisputeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
            <div className="glass-card max-w-md w-full p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <AlertTriangle className="text-red-500 h-5 w-5" />
                <span>Initiate Dispute Resolution</span>
              </h3>
              <form onSubmit={handleRaiseDispute} className="space-y-4">
                <p className="text-xs text-slate-400">
                  Provide details about why you want to raise a dispute. Admin staff will mediate to resolve this contract.
                </p>
                <textarea
                  required
                  rows="4"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Explain details..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowDisputeModal(false)}
                    className="bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3.5 text-xs text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-500 text-white rounded-lg py-1.5 px-3.5 text-xs font-bold"
                  >
                    Submit Dispute
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientGigDetails;

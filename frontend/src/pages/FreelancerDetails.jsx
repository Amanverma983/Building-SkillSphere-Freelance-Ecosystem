import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { MapPin, Star, MessageSquare, Briefcase, Award, ArrowLeft, ShieldAlert } from 'lucide-react';

const FreelancerDetails = () => {
  const { id } = useParams(); // user ID of the freelancer
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchFreelancerProfile();
  }, [id]);

  const fetchFreelancerProfile = async () => {
    setLoading(true);
    try {
      // Fetch details by User ID (backend profile controller supports this)
      const res = await api.get(`/profile/freelancer/${id}`);
      if (res.data.success) {
        setFreelancer(res.data.data);
      }
    } catch (err) {
      setErrorMsg('Failed to load freelancer profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Navigate to Chat page with the freelancer's user info as state
    navigate('/chat', { state: { partner: freelancer.user } });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (errorMsg || !freelancer) {
    return (
      <div className="flex-1 bg-slate-950 p-6 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <ShieldAlert className="h-10 w-10 text-red-500" />
        <p className="text-xs">{errorMsg || 'Freelancer profile not found.'}</p>
        <button onClick={() => navigate('/freelancers')} className="text-xs text-primary-400 hover:underline">
          Back to Browse Freelancers
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-4xl space-y-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Basic Info Card */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col items-center text-center space-y-4 h-fit">
            <img
              src={freelancer.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun'}
              alt={freelancer.user?.name}
              className="h-24 w-24 rounded-full object-cover border-4 border-slate-700 shadow-lg"
            />
            <div>
              <h2 className="text-lg font-bold text-slate-200">{freelancer.user?.name}</h2>
              <div className="flex items-center justify-center space-x-1 mt-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-slate-300">{freelancer.ratingAverage}</span>
                <span className="text-xs text-slate-500">({freelancer.ratingCount} reviews)</span>
              </div>
            </div>

            {freelancer.isVerified && (
              <span className="rounded bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 text-[10px] font-bold text-green-400">
                ✓ VERIFIED TALENT
              </span>
            )}

            <div className="w-full border-t border-slate-800/60 pt-4 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Hourly Rate</span>
                <span className="font-bold text-primary-400">₹{freelancer.hourlyRate}/hr</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Location</span>
                <span className="text-slate-300 flex items-center">
                  <MapPin className="h-3 w-3 mr-0.5" />
                  {freelancer.location?.address?.slice(0, 18) || 'Local'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Completion</span>
                <span className="text-slate-300 font-medium">{freelancer.completionRate}%</span>
              </div>
            </div>

            {/* Direct Message Button */}
            {user?.id !== id && user?._id !== id && (
              <button
                onClick={handleContact}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-lg py-2.5 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-md"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Contact Freelancer</span>
              </button>
            )}
          </div>

          {/* Right Column: Bio, Skills, Portfolio, Certs */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About Me</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{freelancer.bio || 'No bio provided.'}</p>
            </div>

            {/* Skills */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expertise & Skills</h3>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills.map((s, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5 rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs">
                    <span className="text-slate-300 font-medium">{s.name}</span>
                    <span className="text-[10px] text-primary-400 bg-primary-500/10 rounded px-1">{s.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            {freelancer.experience && freelancer.experience.length > 0 && (
              <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                  <Briefcase className="h-4 w-4" />
                  <span>Work Experience</span>
                </h3>
                <div className="space-y-4">
                  {freelancer.experience.map((exp, idx) => (
                    <div key={idx} className="border-l-2 border-slate-800 pl-4 space-y-1">
                      <h4 className="text-xs font-bold text-slate-200">{exp.title}</h4>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {exp.company} • {new Date(exp.from).getFullYear()} - {exp.current ? 'Present' : new Date(exp.to).getFullYear()}
                      </div>
                      {exp.description && <p className="text-[11px] text-slate-400 mt-1">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {freelancer.certifications && freelancer.certifications.length > 0 && (
              <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                  <Award className="h-4 w-4" />
                  <span>Certifications</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {freelancer.certifications.map((c, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-lg p-3 space-y-1">
                      <h4 className="text-xs font-bold text-slate-200">{c.name}</h4>
                      <div className="text-[10px] text-slate-400">{c.issuingOrg}</div>
                      <div className="text-[9px] text-slate-500">{new Date(c.date).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDetails;

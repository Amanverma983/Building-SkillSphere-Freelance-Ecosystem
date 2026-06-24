import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, MapPin, Zap } from 'lucide-react';

const Home = () => {
  return (
    <div className="relative flex-1 flex flex-col justify-center overflow-hidden bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative Glow backgrounds */}
      <div className="glow-bg top-10 left-10 w-96 h-96 bg-primary-600 rounded-full" />
      <div className="glow-bg bottom-10 right-10 w-96 h-96 bg-indigo-600 rounded-full" />

      <div className="relative z-10 mx-auto max-w-4xl text-center space-y-6">
        <div className="inline-flex items-center space-x-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1.5 text-xs text-primary-400 font-semibold uppercase tracking-wider">
          <Sparkles className="h-3 w-3" />
          <span>Intelligent Hyperlocal Freelancing</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Find Top Local Freelancers, <br />
          <span className="bg-gradient-to-r from-primary-400 to-indigo-500 bg-clip-text text-transparent">
            Powered by AI matching
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400">
          SkillSphere connects talented freelancers with local clients. Post projects, submit milestone milestones, release escrow funds securely, and collaborate in real-time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/gigs"
            className="w-full sm:w-auto rounded-lg bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-primary-500 transition-colors"
          >
            Explore Gigs Marketplace
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto rounded-lg border border-slate-700 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Register Profile
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16">
          <div className="glass-card p-6 rounded-xl text-left border border-slate-800">
            <div className="rounded-lg bg-primary-500/15 p-2 w-max text-primary-400 mb-4">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="text-md font-bold text-slate-100 mb-2">Hyperlocal Discovery</h3>
            <p className="text-xs text-slate-400">
              Find freelancers and clients within your immediate geographic coordinates for offline or quick collaboration.
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl text-left border border-slate-800">
            <div className="rounded-lg bg-primary-500/15 p-2 w-max text-primary-400 mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-md font-bold text-slate-100 mb-2">AI-Powered Matching</h3>
            <p className="text-xs text-slate-400">
              Our intelligent recommendation service calculates skill similarity scores and rates match indices automatically.
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl text-left border border-slate-800">
            <div className="rounded-lg bg-primary-500/15 p-2 w-max text-primary-400 mb-4">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-md font-bold text-slate-100 mb-2">Milestone Escrows</h3>
            <p className="text-xs text-slate-400">
              Secure payments are verified and deposited into milestone escrows via Razorpay, released only upon approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

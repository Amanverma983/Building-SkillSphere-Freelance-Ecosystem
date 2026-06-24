import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { MapPin, Star, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const BrowseFreelancers = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [useLocation, setUseLocation] = useState(false);
  const [coords, setCoords] = useState(null);
  const [radius, setRadius] = useState('50');

  useEffect(() => {
    fetchFreelancers();
  }, [useLocation, radius]);

  const fetchFreelancers = async () => {
    setLoading(true);
    try {
      let queryParams = [];
      if (skills) queryParams.push(`skills=${skills}`);
      if (minRate) queryParams.push(`minRate=${minRate}`);
      if (maxRate) queryParams.push(`maxRate=${maxRate}`);
      if (useLocation && coords) {
        queryParams.push(`latitude=${coords.latitude}`);
        queryParams.push(`longitude=${coords.longitude}`);
        queryParams.push(`radius=${radius}`);
      }
      const queryStr = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const res = await api.get(`/profile/freelancers${queryStr}`);
      if (res.data.success) setFreelancers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationToggle = () => {
    if (!useLocation) {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setUseLocation(true);
        },
        () => alert('Unable to retrieve location.')
      );
    } else {
      setUseLocation(false);
      setCoords(null);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-wider text-slate-100 uppercase">Browse Freelancers</h2>
          <p className="text-xs text-slate-400">Discover verified hyperlocal talent for your next project</p>
        </div>

        {/* Filters */}
        <form onSubmit={(e) => { e.preventDefault(); fetchFreelancers(); }}
          className="glass-card p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Skills (e.g. React, Node)"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-8 pr-4 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-primary-500"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          </div>
          <input
            type="number"
            value={minRate}
            onChange={(e) => setMinRate(e.target.value)}
            placeholder="Min Rate (₹/hr)"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none"
          />
          <input
            type="number"
            value={maxRate}
            onChange={(e) => setMaxRate(e.target.value)}
            placeholder="Max Rate (₹/hr)"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 focus:outline-none"
          />
          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-lg py-2 text-xs font-bold transition-colors">
            Search
          </button>

          <div className="sm:col-span-4 flex items-center space-x-4 border-t border-slate-800 pt-3 mt-1">
            <button
              type="button"
              onClick={handleLocationToggle}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${useLocation ? 'bg-primary-600/10 border-primary-500 text-primary-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>{useLocation ? `Nearby (${radius}km)` : 'Enable Location Filter'}</span>
            </button>
            {useLocation && (
              <select value={radius} onChange={(e) => setRadius(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-xs text-slate-300">
                <option value="10">10 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
              </select>
            )}
          </div>
        </form>

        {/* Results Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : freelancers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/20 border border-slate-800 rounded-xl">
            No freelancers matched your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {freelancers.map((f) => (
              <div key={f._id} className="glass-card p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors space-y-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={f.user?.avatar || 'https://via.placeholder.com/150'}
                    alt={f.user?.name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-slate-700"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-200 truncate">{f.user?.name}</h3>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-[11px] text-slate-400">{f.ratingAverage || '0.0'} ({f.ratingCount || 0} reviews)</span>
                    </div>
                    {f.isVerified && (
                      <span className="inline-flex items-center text-[9px] text-green-400 bg-green-600/10 border border-green-500/20 rounded px-1.5 mt-0.5">✓ Verified</span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{f.bio || 'No bio provided.'}</p>

                <div className="flex flex-wrap gap-1.5">
                  {f.skills.slice(0, 4).map((s, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                      {s.name}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                  <span className="text-xs font-bold text-primary-400">₹{f.hourlyRate}/hr</span>
                  <div className="flex items-center text-[10px] text-slate-500">
                    <MapPin className="h-3 w-3 mr-0.5" />
                    {f.location?.address?.slice(0, 20) || 'Local'}
                  </div>
                  <Link
                    to={`/freelancers/${f.user?._id}`}
                    className="rounded-lg bg-primary-600/10 border border-primary-500/20 hover:bg-primary-600 hover:text-white px-3 py-1 text-[10px] font-bold text-primary-400 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseFreelancers;

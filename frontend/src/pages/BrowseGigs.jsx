import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, MapPin, DollarSign, Calendar } from 'lucide-react';

const BrowseGigs = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skills, setSkills] = useState('');
  const [budgetType, setBudgetType] = useState('');
  
  // Hyperlocal coordinates and radius
  const [radius, setRadius] = useState('50');
  const [useLocation, setUseLocation] = useState(false);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    fetchGigs();
  }, [budgetType, useLocation, radius]);

  const fetchGigs = async () => {
    setLoading(true);
    try {
      let queryParams = [];
      if (search) queryParams.push(`search=${search}`);
      if (skills) queryParams.push(`skills=${skills}`);
      if (budgetType) queryParams.push(`budgetType=${budgetType}`);

      if (useLocation && coords) {
        queryParams.push(`latitude=${coords.latitude}`);
        queryParams.push(`longitude=${coords.longitude}`);
        queryParams.push(`radius=${radius}`);
      }

      const queryStr = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const res = await api.get(`/gigs${queryStr}`);
      if (res.data.success) {
        setGigs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationToggle = () => {
    if (!useLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
            setUseLocation(true);
          },
          () => {
            alert('Failed to acquire coordinates. Cannot use location radius filter.');
          }
        );
      } else {
        alert('Geolocation API not supported by browser.');
      }
    } else {
      setUseLocation(false);
      setCoords(null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGigs();
  };

  return (
    <div className="flex-1 bg-slate-950 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-wider text-slate-100 uppercase">Gig Marketplace</h2>
          <p className="text-xs text-slate-400">Discover active hyperlocal freelancing contracts</p>
        </div>

        {/* Filter Toolbar */}
        <form onSubmit={handleSearchSubmit} className="glass-card p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search keyword..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-8 pr-4 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-primary-500"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          </div>

          <div>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Skills (comma separated)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-300 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={budgetType}
              onChange={(e) => setBudgetType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-slate-400 focus:outline-none"
            >
              <option value="">All Budgets</option>
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly Contract</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-lg py-2 text-xs font-bold transition-colors">
            Apply Filters
          </button>

          {/* Hyperlocal settings */}
          <div className="sm:col-span-4 flex items-center justify-between border-t border-slate-800 pt-3 mt-1">
            <button
              type="button"
              onClick={handleLocationToggle}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${useLocation ? 'bg-primary-600/10 border-primary-500 text-primary-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>{useLocation ? 'Location radius Active' : 'Enable Location Radius Filter'}</span>
            </button>

            {useLocation && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Radius:</span>
                <select
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-xs text-slate-300"
                >
                  <option value="10">10 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km</option>
                  <option value="100">100 km</option>
                </select>
              </div>
            )}
          </div>
        </form>

        {/* Listings */}
        {loading ? (
          <div className="text-center py-12">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/20 border border-slate-800 rounded-xl">
            No gigs matched your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gigs.map((g) => (
              <div key={g._id} className="glass-card p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="inline-flex rounded-full bg-slate-800 px-2 py-1 text-[10px] font-semibold text-slate-400 capitalize">
                      {g.budgetType}
                    </span>
                    <span className="flex items-center text-xs text-slate-400">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {g.location?.address || 'Hyperlocal'}
                    </span>
                  </div>
                  <h3 className="text-md font-bold text-slate-200 mt-2 hover:text-primary-400 transition-colors">
                    <Link to={`/gigs/${g._id}`}>{g.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{g.description}</p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {g.skills.map((s, idx) => (
                    <span key={idx} className="rounded bg-slate-900 border border-slate-800/80 px-2 py-0.5 text-[10px] text-slate-400">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
                  <div className="flex items-center text-xs font-semibold text-primary-400">
                    <DollarSign className="h-4 w-4" />
                    <span>{g.minBudget} - {g.maxBudget}</span>
                  </div>
                  <Link
                    to={`/gigs/${g._id}`}
                    className="rounded-lg bg-primary-600/10 border border-primary-500/20 hover:bg-primary-600 hover:text-white px-3.5 py-1.5 text-[11px] font-bold text-primary-400 transition-colors"
                  >
                    View Details
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

export default BrowseGigs;

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Trophy, Users, RefreshCw, Lock, Settings, History, AlertCircle } from 'lucide-react';

export default function FPLDraftTracker() {
  const [config, setConfig] = useState({
    leagueId: "81877",
    leagueName: "Spreadsheet Merchants 3.0",
    password: "merchants2026",
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [leagueData, setLeagueData] = useState(null);
  const [standings, setStandings] = useState([]);
  const [waivers, setWaivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const authStatus = localStorage.getItem('fpl-draft-auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === config.password) {
      setIsAuthenticated(true);
      localStorage.setItem('fpl-draft-auth', 'true');
      setPasswordInput('');
    } else {
      alert('Incorrect password!');
      setPasswordInput('');
    }
  };

  const fetchLeagueData = async () => {
    if (!config.leagueId) {
      setError('Please configure your League ID in the settings');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use our serverless function to proxy the API calls
      // When deployed, this will be: https://your-site.netlify.app/.netlify/functions/fpl-proxy
      // For now, you'll update this URL after deployment
      const apiBase = '/.netlify/functions/fpl-proxy?endpoint=';
      
      // Get the team entry data first
      const entryResponse = await fetch(`${apiBase}/api/entry/${config.leagueId}/public`);
      if (!entryResponse.ok) {
        const errorData = await entryResponse.json();
        throw new Error(`Failed to fetch entry data: ${errorData.error || entryResponse.status}`);
      }
      const entryData = await entryResponse.json();
      
      console.log('Entry data:', entryData);
      
      // Extract league ID from entry data
      const actualLeagueId = entryData.entry?.league || entryData.league;
      
      if (!actualLeagueId) {
        throw new Error('Could not find league ID in entry data.');
      }
      
      console.log('Found league ID:', actualLeagueId);
      
      // Fetch league details using the correct endpoint
      const leagueResponse = await fetch(`${apiBase}/api/league/${actualLeagueId}/details`);
      if (!leagueResponse.ok) {
        const errorData = await leagueResponse.json();
        throw new Error(`Failed to fetch league details: ${errorData.error || leagueResponse.status}`);
      }
      const league = await leagueResponse.json();
      
      console.log('League data:', league);
      setLeagueData(league);

      // Process standings from league_entries
      if (league.league_entries) {
        const standingsWithPoints = league.league_entries.map(entry => ({
          ...entry,
          total: entry.total || 0,
          event_total: entry.event_total || 0,
          entry_name: entry.entry_name || `${entry.player_first_name || ''} ${entry.player_last_name || ''}`.trim()
        }));
        setStandings(standingsWithPoints.sort((a, b) => (b.total || 0) - (a.total || 0)));
      } else if (league.standings) {
        setStandings(league.standings.sort((a, b) => (b.total || 0) - (a.total || 0)));
      }

      // Also fetch transactions for waiver data
      try {
        const transactionsResponse = await fetch(`${apiBase}/api/draft/entry/${config.leagueId}/transactions`);
        if (transactionsResponse.ok) {
          const transactions = await transactionsResponse.json();
          console.log('Transactions:', transactions);
        }
      } catch (e) {
        console.log('Could not fetch transactions:', e);
      }

      setLastUpdated(new Date());
      loadWaivers();
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadWaivers = async () => {
    try {
      const result = await window.storage.get('draft-waivers');
      if (result && result.value) {
        setWaivers(JSON.parse(result.value));
      }
    } catch (err) {
      console.log('No previous waivers found');
    }
  };

  const saveWaivers = async (newWaivers) => {
    try {
      await window.storage.set('draft-waivers', JSON.stringify(newWaivers));
      setWaivers(newWaivers);
    } catch (err) {
      console.error('Error saving waivers:', err);
    }
  };

  const addWaiver = async (managerName, playerOut, playerIn, gameweek) => {
    const newWaiver = {
      id: Date.now(),
      managerName,
      playerOut,
      playerIn,
      gameweek,
      date: new Date().toISOString(),
    };
    const updatedWaivers = [newWaiver, ...waivers];
    await saveWaivers(updatedWaivers);
  };

  const deleteWaiver = async (id) => {
    const updatedWaivers = waivers.filter(w => w.id !== id);
    await saveWaivers(updatedWaivers);
  };

  const [waiverForm, setWaiverForm] = useState({
    manager: '',
    playerOut: '',
    playerIn: '',
    gameweek: '',
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-blue-950 flex items-center justify-center p-5">
        <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-16 rounded-3xl border-4 border-green-400 shadow-2xl max-w-md w-full text-center">
          <Lock size={64} className="text-green-400 mx-auto mb-5" />
          <h1 className="text-green-400 text-5xl font-black mb-3">FPL DRAFT</h1>
          <p className="text-gray-500 mb-10">League Tracker</p>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter password"
              className="w-full p-4 mb-5 bg-gray-950 border-2 border-green-400 rounded-xl text-white text-lg"
              autoFocus
            />
            <button type="submit" className="w-full p-4 bg-gradient-to-r from-green-400 to-green-500 rounded-xl text-gray-900 font-bold text-lg hover:scale-105 transition-transform">
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-blue-950 p-5">
      {showConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-5">
          <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-10 rounded-2xl max-w-2xl w-full border-2 border-green-400 shadow-2xl">
            <h2 className="text-green-400 text-3xl font-bold mb-8">⚙️ Configuration</h2>
            
            <div className="mb-5">
              <label className="text-white block mb-2 font-semibold">League ID</label>
              <input
                type="text"
                value={config.leagueId || ''}
                onChange={(e) => setConfig({ ...config, leagueId: e.target.value })}
                placeholder="Enter your FPL Draft League ID"
                className="w-full p-3 bg-gray-950 border-2 border-green-400 rounded-lg text-white"
              />
              <p className="text-gray-500 text-xs mt-2">Find this in your league URL or API response</p>
            </div>

            <div className="mb-5">
              <label className="text-white block mb-2 font-semibold">League Name</label>
              <input
                type="text"
                value={config.leagueName}
                onChange={(e) => setConfig({ ...config, leagueName: e.target.value })}
                className="w-full p-3 bg-gray-950 border-2 border-green-400 rounded-lg text-white"
              />
            </div>

            <div className="mb-8">
              <label className="text-white block mb-2 font-semibold">Password</label>
              <input
                type="password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                className="w-full p-3 bg-gray-950 border-2 border-green-400 rounded-lg text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfig(false);
                  if (config.leagueId) fetchLeagueData();
                }}
                className="flex-1 p-4 bg-gradient-to-r from-green-400 to-green-500 rounded-lg text-gray-900 font-bold"
              >
                Save & Refresh Data
              </button>
              <button onClick={() => setShowConfig(false)} className="px-6 py-4 bg-gray-800 border-2 border-gray-600 rounded-lg text-white font-semibold">
                Cancel
              </button>
            </div>

            <div className="mt-8 p-5 bg-green-400 bg-opacity-10 rounded-lg border border-green-400">
              <h3 className="text-green-400 mb-3">📖 How to Find Your League ID</h3>
              <ol className="text-gray-300 text-sm pl-5 list-decimal space-y-1">
                <li>Go to draft.premierleague.com</li>
                <li>Open DevTools (F12) → Network tab</li>
                <li>Navigate your league page</li>
                <li>Look for /api/league/XXXXX/details</li>
                <li>XXXXX is your League ID</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto mb-10 bg-gradient-to-br from-gray-900 to-blue-900 p-8 rounded-2xl border-2 border-green-400 shadow-xl">
        <div className="flex justify-between items-center flex-wrap gap-5">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent mb-2">
              {config.leagueName}
            </h1>
            <p className="text-gray-500">
              FPL Draft League Tracker {lastUpdated && `• ${lastUpdated.toLocaleTimeString()}`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchLeagueData}
              disabled={loading}
              className={`px-6 py-4 rounded-xl font-bold flex items-center gap-2 ${loading ? 'bg-gray-700' : 'bg-gradient-to-r from-green-400 to-green-500 text-gray-900'}`}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button onClick={() => setShowConfig(true)} className="px-6 py-4 bg-gray-800 border-2 border-gray-600 rounded-xl text-white font-semibold flex items-center gap-2">
              <Settings size={18} />
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-500 bg-opacity-10 border-2 border-red-500 rounded-xl p-5 mb-8 flex items-center gap-3">
            <AlertCircle size={24} className="text-red-500" />
            <div>
              <h3 className="text-red-500">Error</h3>
              <p className="text-white">{error}</p>
            </div>
          </div>
        )}

        {!config.leagueId && (
          <div className="bg-gradient-to-br from-gray-900 to-blue-900 border-2 border-green-400 rounded-2xl p-10 mb-8 text-center">
            <Trophy size={64} className="text-green-400 mx-auto mb-5" />
            <h2 className="text-green-400 text-4xl mb-4 font-bold">Welcome!</h2>
            <p className="text-gray-300 text-lg mb-8">Click Settings to configure your League ID</p>
            <button onClick={() => setShowConfig(true)} className="px-8 py-4 bg-gradient-to-r from-green-400 to-green-500 rounded-xl text-gray-900 font-bold text-lg">
              Configure Now
            </button>
          </div>
        )}

        {standings.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-8 rounded-2xl border-2 border-green-400 mb-8">
            <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <Users size={28} />
              League Standings
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-green-400">
                    <th className="p-4 text-left text-green-400">Rank</th>
                    <th className="p-4 text-left text-green-400">Manager</th>
                    <th className="p-4 text-left text-green-400">Points</th>
                    <th className="p-4 text-left text-green-400">Form</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team, idx) => (
                    <tr key={idx} className={`border-b border-gray-800 ${idx === 0 ? 'bg-green-400 bg-opacity-5' : ''}`}>
                      <td className="p-4 text-white font-semibold">
                        {idx + 1}
                        {idx === 0 && <Trophy size={16} className="text-yellow-500 inline ml-2" />}
                      </td>
                      <td className="p-4 text-white">{team.entry_name || team.player_name || 'Unknown'}</td>
                      <td className="p-4 text-green-400 font-bold text-lg">{team.total || 0}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-green-400 bg-opacity-10 rounded-full text-green-400 text-sm">
                          {team.event_total || 0} pts
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-8 rounded-xl border-2 border-green-400 mb-8">
          <h3 className="text-green-400 mb-5 text-xl font-bold">📝 Add Waiver Transaction</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Manager Name"
              value={waiverForm.manager}
              onChange={(e) => setWaiverForm({ ...waiverForm, manager: e.target.value })}
              className="p-3 bg-gray-950 border-2 border-gray-700 rounded-lg text-white"
            />
            <input
              type="text"
              placeholder="Gameweek (e.g., GW23)"
              value={waiverForm.gameweek}
              onChange={(e) => setWaiverForm({ ...waiverForm, gameweek: e.target.value })}
              className="p-3 bg-gray-950 border-2 border-gray-700 rounded-lg text-white"
            />
            <input
              type="text"
              placeholder="Player OUT"
              value={waiverForm.playerOut}
              onChange={(e) => setWaiverForm({ ...waiverForm, playerOut: e.target.value })}
              className="p-3 bg-gray-950 border-2 border-gray-700 rounded-lg text-white"
            />
            <input
              type="text"
              placeholder="Player IN"
              value={waiverForm.playerIn}
              onChange={(e) => setWaiverForm({ ...waiverForm, playerIn: e.target.value })}
              className="p-3 bg-gray-950 border-2 border-gray-700 rounded-lg text-white"
            />
          </div>
          <button
            onClick={() => {
              if (waiverForm.manager && waiverForm.playerOut && waiverForm.playerIn && waiverForm.gameweek) {
                addWaiver(waiverForm.manager, waiverForm.playerOut, waiverForm.playerIn, waiverForm.gameweek);
                setWaiverForm({ manager: '', playerOut: '', playerIn: '', gameweek: '' });
              } else {
                alert('Please fill in all fields');
              }
            }}
            className="mt-4 w-full p-3 bg-gradient-to-r from-green-400 to-green-500 rounded-lg text-gray-900 font-bold"
          >
            Add Waiver
          </button>
        </div>

        {waivers.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-8 rounded-2xl border-2 border-green-400">
            <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <History size={28} />
              Waiver History
            </h2>
            <div className="space-y-4">
              {waivers.map((waiver) => (
                <div key={waiver.id} className="bg-gray-950 p-5 rounded-xl border border-gray-800 flex justify-between items-center flex-wrap gap-4">
                  <div className="flex-1">
                    <p className="text-green-400 font-bold mb-2">{waiver.managerName} • {waiver.gameweek}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-red-400 flex items-center gap-2">
                        <TrendingDown size={16} />
                        {waiver.playerOut}
                      </span>
                      <span className="text-gray-600">→</span>
                      <span className="text-green-500 flex items-center gap-2">
                        <TrendingUp size={16} />
                        {waiver.playerIn}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mt-2">{new Date(waiver.date).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => deleteWaiver(waiver.id)}
                    className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-red-400 text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

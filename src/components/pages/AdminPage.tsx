import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import {
  isAdmin,
  getFullLeaderboard,
  getDashboardStats,
  searchPlayers,
  exportAirdropCSV,
  recordAirdrop,
  getAirdropHistory,
  AdminLeaderboardEntry,
  DashboardStats,
  AirdropRecord,
} from '../../services/adminService';

type Tab = 'dashboard' | 'leaderboard' | 'airdrop' | 'history';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { twitterProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // Dashboard state
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<AdminLeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'level' | 'harvests' | 'earnings'>('score');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AdminLeaderboardEntry[] | null>(null);

  // Airdrop state
  const [topN, setTopN] = useState(100);
  const [minScore, setMinScore] = useState(0);
  const [airdropBnb, setAirdropBnb] = useState('');
  const [airdropNotes, setAirdropNotes] = useState('');

  // History state
  const [airdropHistory, setAirdropHistory] = useState<AirdropRecord[]>([]);

  // Auth check
  useEffect(() => {
    if (!twitterProfile?.uid || !isAdmin(twitterProfile.uid)) {
      setAuthorized(false);
      setIsLoading(false);
      return;
    }
    setAuthorized(true);
    loadDashboard();
  }, [twitterProfile]);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [dashStats, lb] = await Promise.all([
        getDashboardStats(),
        getFullLeaderboard('score'),
      ]);
      setStats(dashStats);
      setLeaderboard(lb);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = async (newSort: typeof sortBy) => {
    setSortBy(newSort);
    setIsLoading(true);
    try {
      const lb = await getFullLeaderboard(newSort);
      setLeaderboard(lb);
    } catch (error) {
      console.error('Failed to sort leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const results = await searchPlayers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleExportCSV = () => {
    const csv = exportAirdropCSV(leaderboard, topN, minScore);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `airdrop_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRecordAirdrop = async () => {
    if (!airdropBnb || !twitterProfile?.uid) return;
    try {
      await recordAirdrop({
        date: new Date().toISOString().split('T')[0],
        playerCount: leaderboard.filter((e) => e.bnbAddress).slice(0, topN).filter((e) => !minScore || e.score >= minScore).length,
        totalBnb: airdropBnb,
        topN,
        minScore,
        createdBy: twitterProfile.uid,
        notes: airdropNotes || undefined,
      });
      setAirdropBnb('');
      setAirdropNotes('');
      alert('Airdrop record saved!');
    } catch (error) {
      console.error('Failed to record airdrop:', error);
      alert('Failed to save airdrop record');
    }
  };

  const loadHistory = async () => {
    try {
      const history = await getAirdropHistory();
      setAirdropHistory(history);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  // Unauthorized view
  if (!isLoading && !authorized) {
    return (
      <div className="min-h-screen bg-space-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔒</p>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">You are not authorized to access the admin panel.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-space-cyan text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'airdrop', label: 'Airdrop', icon: '🪂' },
    { id: 'history', label: 'History', icon: '📜' },
  ];

  const displayList = searchResults ?? leaderboard;

  const eligibleForAirdrop = leaderboard
    .filter((e) => e.bnbAddress)
    .slice(0, topN)
    .filter((e) => !minScore || e.score >= minScore);

  const noBnbCount = leaderboard
    .slice(0, topN)
    .filter((e) => !e.bnbAddress && (!minScore || e.score >= minScore)).length;

  return (
    <div className="min-h-screen bg-space-dark">
      {/* Header */}
      <div className="bg-space-gray border-b border-space-gray-light">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛸</span>
            <h1 className="text-xl font-bold text-white">Space Farm Admin</h1>
          </div>
          <button
            onClick={() => navigate('/game')}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Back to Game
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'history') loadHistory();
              }}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                ${activeTab === tab.id
                  ? 'bg-space-cyan text-black'
                  : 'bg-space-gray text-gray-300 hover:bg-space-gray-light'
                }
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-space-cyan mx-auto mb-4"></div>
              <p className="text-gray-400">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <StatCard icon="👥" label="Total Players" value={stats.totalPlayers} />
                  <StatCard icon="🟢" label="Active (24h)" value={stats.activePlayers24h} />
                  <StatCard icon="💰" label="With BNB Address" value={stats.playersWithBnb} />
                  <StatCard icon="⚡" label="Total GOLD" value={Math.round(stats.totalGoldCirculating).toLocaleString()} />
                  <StatCard icon="📈" label="Avg Level" value={stats.averageLevel} />
                </div>

                {/* Quick leaderboard preview */}
                <div className="bg-space-gray rounded-xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Top 10 Players</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-400 border-b border-space-gray-light">
                          <th className="text-left py-2 px-3">#</th>
                          <th className="text-left py-2 px-3">Name</th>
                          <th className="text-left py-2 px-3">ID</th>
                          <th className="text-right py-2 px-3">Level</th>
                          <th className="text-right py-2 px-3">Score</th>
                          <th className="text-right py-2 px-3">GOLD</th>
                          <th className="text-center py-2 px-3">BNB</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.slice(0, 10).map((entry) => (
                          <tr key={entry.oderId} className="border-b border-space-gray-light/30 hover:bg-space-gray-light/20">
                            <td className="py-2 px-3 text-white font-bold">
                              {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                            </td>
                            <td className="py-2 px-3 text-white">{entry.name}</td>
                            <td className="py-2 px-3 text-gray-400 font-mono">{entry.oderId}</td>
                            <td className="py-2 px-3 text-right text-space-cyan">{entry.level}</td>
                            <td className="py-2 px-3 text-right text-space-glow font-bold">{entry.score.toLocaleString()}</td>
                            <td className="py-2 px-3 text-right text-gray-300">{Math.round(entry.farmBalance).toLocaleString()}</td>
                            <td className="py-2 px-3 text-center">
                              {entry.bnbAddress ? (
                                <span className="text-green-400">✓</span>
                              ) : (
                                <span className="text-red-400">✗</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-4">
                {/* Controls */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex gap-2">
                    {(['score', 'level', 'harvests', 'earnings'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSortChange(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          sortBy === s
                            ? 'bg-space-cyan text-black'
                            : 'bg-space-gray text-gray-300 hover:bg-space-gray-light'
                        }`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-1 max-w-md">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search by ID, name, or Twitter..."
                      className="flex-1 px-3 py-1.5 bg-space-gray border border-space-gray-light rounded-lg text-white text-sm focus:outline-none focus:border-space-cyan"
                    />
                    <button
                      onClick={handleSearch}
                      className="px-4 py-1.5 bg-space-cyan text-black rounded-lg text-sm font-medium hover:opacity-90"
                    >
                      Search
                    </button>
                    {searchResults && (
                      <button
                        onClick={() => { setSearchResults(null); setSearchQuery(''); }}
                        className="px-3 py-1.5 bg-space-gray text-gray-300 rounded-lg text-sm hover:bg-space-gray-light"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {searchResults && (
                  <p className="text-sm text-gray-400">{searchResults.length} results found</p>
                )}

                {/* Full table */}
                <div className="bg-space-gray rounded-xl overflow-hidden">
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-space-gray z-10">
                        <tr className="text-gray-400 border-b border-space-gray-light">
                          <th className="text-left py-3 px-3">#</th>
                          <th className="text-left py-3 px-3">Name</th>
                          <th className="text-left py-3 px-3">ID</th>
                          <th className="text-left py-3 px-3">Twitter</th>
                          <th className="text-right py-3 px-3">Level</th>
                          <th className="text-right py-3 px-3">Score</th>
                          <th className="text-right py-3 px-3">GOLD</th>
                          <th className="text-right py-3 px-3">Harvests</th>
                          <th className="text-right py-3 px-3">Earnings</th>
                          <th className="text-left py-3 px-3">BNB Address</th>
                          <th className="text-right py-3 px-3">Last Online</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayList.map((entry) => (
                          <tr key={entry.oderId} className="border-b border-space-gray-light/30 hover:bg-space-gray-light/20">
                            <td className="py-2 px-3 text-white font-bold">
                              {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                            </td>
                            <td className="py-2 px-3 text-white">{entry.name}</td>
                            <td className="py-2 px-3 text-gray-400 font-mono">{entry.oderId}</td>
                            <td className="py-2 px-3 text-blue-400">{entry.twitterHandle ? `@${entry.twitterHandle}` : '-'}</td>
                            <td className="py-2 px-3 text-right text-space-cyan">{entry.level}</td>
                            <td className="py-2 px-3 text-right text-space-glow font-bold">{entry.score.toLocaleString()}</td>
                            <td className="py-2 px-3 text-right text-gray-300">{Math.round(entry.farmBalance).toLocaleString()}</td>
                            <td className="py-2 px-3 text-right text-gray-300">{entry.totalHarvests}</td>
                            <td className="py-2 px-3 text-right text-gray-300">{Math.round(entry.totalEarnings).toLocaleString()}</td>
                            <td className="py-2 px-3 text-gray-400 font-mono text-xs max-w-[160px] truncate">
                              {entry.bnbAddress || <span className="text-red-400">Not set</span>}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-500 text-xs">
                              {entry.lastOnline ? formatTimestamp(entry.lastOnline) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Showing {displayList.length} players | Score = (Level x 100) + (Harvests x 10) + (Steals x 5)
                </p>
              </div>
            )}

            {/* Airdrop Tab */}
            {activeTab === 'airdrop' && (
              <div className="space-y-6">
                {/* Airdrop settings */}
                <div className="bg-space-gray rounded-xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Airdrop Settings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Top N Players</label>
                      <input
                        type="number"
                        value={topN}
                        onChange={(e) => setTopN(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-space-dark border border-space-gray-light rounded-lg text-white focus:outline-none focus:border-space-cyan"
                        min={1}
                        max={1000}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Minimum Score</label>
                      <input
                        type="number"
                        value={minScore}
                        onChange={(e) => setMinScore(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-space-dark border border-space-gray-light rounded-lg text-white focus:outline-none focus:border-space-cyan"
                        min={0}
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-space-gray rounded-xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Airdrop Preview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-4 bg-space-dark rounded-lg text-center">
                      <p className="text-3xl font-bold text-green-400">{eligibleForAirdrop.length}</p>
                      <p className="text-sm text-gray-400">Eligible (with BNB)</p>
                    </div>
                    <div className="p-4 bg-space-dark rounded-lg text-center">
                      <p className="text-3xl font-bold text-red-400">{noBnbCount}</p>
                      <p className="text-sm text-gray-400">Missing BNB Address</p>
                    </div>
                    <div className="p-4 bg-space-dark rounded-lg text-center">
                      <p className="text-3xl font-bold text-space-cyan">{eligibleForAirdrop.length + noBnbCount}</p>
                      <p className="text-sm text-gray-400">Total Qualifying</p>
                    </div>
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="px-6 py-3 bg-space-cyan text-black font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <span>📥</span> Export CSV ({eligibleForAirdrop.length} players)
                  </button>
                </div>

                {/* Record airdrop */}
                <div className="bg-space-gray rounded-xl p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Record Airdrop</h2>
                  <p className="text-sm text-gray-400 mb-4">
                    After sending BNB, record the airdrop for tracking purposes.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Total BNB Distributed</label>
                      <input
                        type="text"
                        value={airdropBnb}
                        onChange={(e) => setAirdropBnb(e.target.value)}
                        placeholder="e.g. 1.5"
                        className="w-full px-4 py-2 bg-space-dark border border-space-gray-light rounded-lg text-white focus:outline-none focus:border-space-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Notes (optional)</label>
                      <textarea
                        value={airdropNotes}
                        onChange={(e) => setAirdropNotes(e.target.value)}
                        placeholder="Any notes about this airdrop..."
                        className="w-full px-4 py-2 bg-space-dark border border-space-gray-light rounded-lg text-white focus:outline-none focus:border-space-cyan h-20 resize-none"
                      />
                    </div>
                    <button
                      onClick={handleRecordAirdrop}
                      disabled={!airdropBnb}
                      className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save Airdrop Record
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="bg-space-gray rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Airdrop History</h2>
                {airdropHistory.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-4xl mb-4">📜</p>
                    <p>No airdrop records yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {airdropHistory.map((record) => (
                      <div
                        key={record.id}
                        className="p-4 bg-space-dark rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-white">{record.totalBnb} BNB</span>
                            <span className="text-sm text-gray-400">{record.date}</span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            {record.playerCount} players | Top {record.topN}
                            {record.minScore > 0 ? ` | Min score: ${record.minScore}` : ''}
                          </p>
                          {record.notes && (
                            <p className="text-xs text-gray-500 mt-1">{record.notes}</p>
                          )}
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          {new Date(record.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Helper components
const StatCard: React.FC<{ icon: string; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="bg-space-gray rounded-xl p-4 text-center">
    <p className="text-2xl mb-1">{icon}</p>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-gray-400">{label}</p>
  </div>
);

const formatTimestamp = (ts: number): string => {
  const now = Date.now();
  const diff = now - ts;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 5) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

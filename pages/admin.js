import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('settings');
  const [subscribers, setSubscribers] = useState([]);
  const [pdfLink, setPdfLink] = useState('');
  const [newPdfLink, setNewPdfLink] = useState('');
  const [mintingStatus, setMintingStatus] = useState('');
  const [newMintingStatus, setNewMintingStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Copy feedback
  const [copiedId, setCopiedId] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        setIsAuthenticated(true);
        fetchData();
      } else {
        setAuthError('Invalid password');
      }
    } catch (error) {
      setAuthError('Authentication failed');
    }
    setAuthLoading(false);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subscribersRes, settingsRes, statusRes] = await Promise.all([
        fetch('/api/admin/subscribers'),
        fetch('/api/admin/settings'),
        fetch('/api/admin/status')
      ]);

      const subscribersData = await subscribersRes.json();
      const settingsData = await settingsRes.json();
      const statusData = await statusRes.json();

      if (subscribersData.subscribers) {
        setSubscribers(subscribersData.subscribers);
      }
      if (settingsData.pdfLink) {
        setPdfLink(settingsData.pdfLink);
        setNewPdfLink(settingsData.pdfLink);
      }
      if (statusData.status) {
        setMintingStatus(statusData.status);
        setNewMintingStatus(statusData.status);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    }
    setLoading(false);
  };

  const handleUpdatePdfLink = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfLink: newPdfLink })
      });

      const data = await res.json();

      if (res.ok) {
        setPdfLink(newPdfLink);
        setMessage({ type: 'success', text: 'Decode Book link updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update settings' });
    }
    setSaving(false);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newMintingStatus })
      });

      const data = await res.json();

      if (res.ok) {
        setMintingStatus(newMintingStatus);
        setMessage({ type: 'success', text: 'Minting status updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
    setSaving(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Filter subscribers based on search
  const filteredSubscribers = subscribers.filter(sub => {
    const search = searchTerm.toLowerCase();
    return (
      sub.email?.toLowerCase().includes(search) ||
      sub.wallet_address?.toLowerCase().includes(search)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubscribers = filteredSubscribers.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Login Screen
  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Admin Login - PMTR</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
          <div className="bg-black/50 border border-[#d4af37]/40 rounded-xl p-8 w-full max-w-md">
            <h1 className="text-3xl font-bold text-[#f5d76e] mb-6 text-center">Admin Login</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 bg-black/50 border border-[#d4af37]/40 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#f5d76e] transition-colors font-sans"
                  autoFocus
                />
              </div>
              {authError && (
                <p className="text-red-400 text-sm">{authError}</p>
              )}
              <button
                type="submit"
                disabled={authLoading || !password}
                className={`w-full px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f5d76e] text-black font-bold rounded-lg transition-all ${authLoading || !password ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-[#d4af37]/30'
                  }`}
              >
                {authLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Admin - PMTR</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-[#f5d76e]">Admin Dashboard</h1>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'settings'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#f5d76e] text-black'
                : 'bg-black/50 border border-[#d4af37]/40 text-[#f5d76e] hover:bg-[#d4af37]/10'
                }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'status'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#f5d76e] text-black'
                : 'bg-black/50 border border-[#d4af37]/40 text-[#f5d76e] hover:bg-[#d4af37]/10'
                }`}
            >
              Status
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'subscribers'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#f5d76e] text-black'
                : 'bg-black/50 border border-[#d4af37]/40 text-[#f5d76e] hover:bg-[#d4af37]/10'
                }`}
            >
              Subscribers ({subscribers.length})
            </button>
          </div>

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-black/50 border border-[#d4af37]/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-[#f5d76e] mb-4">Decode Book Download Link</h2>

              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Current Link:</p>
                <p className="text-white break-all bg-black/30 p-3 rounded-lg border border-[#d4af37]/20">
                  {pdfLink || 'No link set'}
                </p>
              </div>

              <form onSubmit={handleUpdatePdfLink} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">New Link:</label>
                  <input
                    type="url"
                    value={newPdfLink}
                    onChange={(e) => setNewPdfLink(e.target.value)}
                    placeholder="https://example.com/decode-book.pdf"
                    className="w-full px-4 py-3 bg-black/50 border border-[#d4af37]/40 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#f5d76e] transition-colors font-sans"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving || !newPdfLink}
                  className={`px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f5d76e] text-black font-bold rounded-lg transition-all ${saving || !newPdfLink ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-[#d4af37]/30'
                    }`}
                >
                  {saving ? 'Saving...' : 'Update Link'}
                </button>
              </form>

              {message && (
                <p className={`mt-4 text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {message.text}
                </p>
              )}
            </div>
          )}

          {/* Status Tab */}
          {activeTab === 'status' && (
            <div className="bg-black/50 border border-[#d4af37]/40 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-[#f5d76e] mb-4">Minting Status</h2>

              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Current Status:</p>
                <p className="text-white break-all bg-black/30 p-3 rounded-lg border border-[#d4af37]/20">
                  {mintingStatus || 'Coming Soon'}
                </p>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">New Status:</label>
                  <input
                    type="text"
                    value={newMintingStatus}
                    onChange={(e) => setNewMintingStatus(e.target.value)}
                    placeholder="e.g. Coming Soon, Public Sale Live"
                    className="w-full px-4 py-3 bg-black/50 border border-[#d4af37]/40 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#f5d76e] transition-colors font-sans"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving || !newMintingStatus}
                  className={`px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f5d76e] text-black font-bold rounded-lg transition-all ${saving || !newMintingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-[#d4af37]/30'
                    }`}
                >
                  {saving ? 'Saving...' : 'Update Status'}
                </button>
              </form>

              {message && (
                <p className={`mt-4 text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {message.text}
                </p>
              )}
            </div>
          )}

          {/* Subscribers Tab */}
          {activeTab === 'subscribers' && (
            <div className="bg-black/50 border border-[#d4af37]/40 rounded-xl p-6">
              {/* Header with Search and Refresh */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-[#f5d76e]">Subscribers</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search email or wallet..."
                    className="px-4 py-2 bg-black/50 border border-[#d4af37]/40 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#f5d76e] transition-colors font-sans w-full sm:w-64"
                  />
                  <button
                    onClick={fetchData}
                    disabled={loading}
                    className="px-4 py-2 bg-[#d4af37]/20 border border-[#d4af37]/40 rounded-lg text-[#f5d76e] hover:bg-[#d4af37]/30 transition-colors whitespace-nowrap"
                  >
                    {loading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading subscribers...</div>
              ) : filteredSubscribers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {searchTerm ? 'No matching subscribers found' : 'No subscribers yet'}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#d4af37]/30">
                          <th className="text-left py-3 px-4 text-[#d4af37] font-semibold">#</th>
                          <th className="text-left py-3 px-4 text-[#d4af37] font-semibold">Email</th>
                          <th className="text-left py-3 px-4 text-[#d4af37] font-semibold">Wallet Address</th>
                          <th className="text-left py-3 px-4 text-[#d4af37] font-semibold">Date</th>
                          <th className="text-left py-3 px-4 text-[#d4af37] font-semibold">Owns PMTR NFT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedSubscribers.map((sub, index) => (
                          <tr key={sub.id} className="border-b border-[#d4af37]/10 hover:bg-[#d4af37]/5">
                            <td className="py-3 px-4 text-gray-400">{startIndex + index + 1}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-sans">{sub.email}</span>
                                <button
                                  onClick={() => copyToClipboard(sub.email, `email-${sub.id}`)}
                                  className="p-1 hover:bg-[#d4af37]/20 rounded transition-colors"
                                  title="Copy email"
                                >
                                  {copiedId === `email-${sub.id}` ? (
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4 text-gray-400 hover:text-[#f5d76e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {sub.wallet_address ? (
                                <div className="flex items-center gap-2">
                                  <a
                                    href={`https://etherscan.io/address/${sub.wallet_address}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-300 font-mono text-sm hover:text-[#f5d76e] transition-colors"
                                  >
                                    {sub.wallet_address.slice(0, 6)}...{sub.wallet_address.slice(-4)}
                                  </a>
                                  <button
                                    onClick={() => copyToClipboard(sub.wallet_address, `wallet-${sub.id}`)}
                                    className="p-1 hover:bg-[#d4af37]/20 rounded transition-colors"
                                    title="Copy wallet address"
                                  >
                                    {copiedId === `wallet-${sub.id}` ? (
                                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    ) : (
                                      <svg className="w-4 h-4 text-gray-400 hover:text-[#f5d76e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-500">N/A</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-400 text-sm">{formatDate(sub.created_at)}</td>
                            <td className="py-3 px-4">
                              {sub.owns_nft ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                  Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                  No
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded border ${currentPage === 1
                          ? 'border-gray-600 text-gray-600 cursor-not-allowed'
                          : 'border-[#d4af37]/40 text-[#f5d76e] hover:bg-[#d4af37]/20'
                          }`}
                      >
                        Previous
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded ${currentPage === page
                            ? 'bg-gradient-to-r from-[#d4af37] to-[#f5d76e] text-black font-bold'
                            : 'border border-[#d4af37]/40 text-[#f5d76e] hover:bg-[#d4af37]/20'
                            }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded border ${currentPage === totalPages
                          ? 'border-gray-600 text-gray-600 cursor-not-allowed'
                          : 'border-[#d4af37]/40 text-[#f5d76e] hover:bg-[#d4af37]/20'
                          }`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}

              <div className="mt-4 text-sm text-gray-500 flex justify-between">
                <span>Total: {filteredSubscribers.length} subscriber{filteredSubscribers.length !== 1 ? 's' : ''}</span>
                {searchTerm && <span>Filtered from {subscribers.length} total</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

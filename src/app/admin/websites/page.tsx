'use client';

import { useEffect, useState } from 'react';

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newWebsite, setNewWebsite] = useState({ name: '', domain: '' });

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/websites', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setWebsites(await res.json());
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('/api/websites', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(newWebsite),
    });

    if (res.ok) {
      setShowModal(false);
      setNewWebsite({ name: '', domain: '' });
      fetchWebsites();
    }
  };

  return (
    <div>
      <div className="mb-6 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="px-6 py-6 sm:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Websites</h1>
              <p className="mt-1 text-white/80 text-sm sm:text-base">Kelola situs dan API key untuk widget.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30"
            >
              Add Website
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {websites.map((website) => (
                <tr key={website.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{website.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{website.domain}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{website.api_key}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${website.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {website.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 sm:p-8 rounded-xl w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Add New Website</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Website Name</label>
                <input
                  type="text"
                  value={newWebsite.name}
                  onChange={(e) => setNewWebsite({ ...newWebsite, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Domain</label>
                <input
                  type="text"
                  value={newWebsite.domain}
                  onChange={(e) => setNewWebsite({ ...newWebsite, domain: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="example.com"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

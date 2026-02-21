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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Websites</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Website
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
              <tr key={website.id}>
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New Website</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Website Name</label>
                <input
                  type="text"
                  value={newWebsite.name}
                  onChange={(e) => setNewWebsite({...newWebsite, name: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Domain</label>
                <input
                  type="text"
                  value={newWebsite.domain}
                  onChange={(e) => setNewWebsite({...newWebsite, domain: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="example.com"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

'use client';

import { useEffect, useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

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
      <Card className="overflow-hidden">
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
                    {website.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="danger">Inactive</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 sm:p-8 rounded-xl w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Add New Website</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Website Name</label>
                <Input
                  value={newWebsite.name}
                  onChange={(e) => setNewWebsite({ ...newWebsite, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Domain</label>
                <Input
                  value={newWebsite.domain}
                  onChange={(e) => setNewWebsite({ ...newWebsite, domain: e.target.value })}
                  placeholder="example.com"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
 
 type UserItem = {
   id: string
   email: string
   name: string
   role: 'super_admin' | 'admin' | 'agent'
   is_active: boolean
   created_at: string
 }
 
 export default function AdminsPage() {
   const router = useRouter()
   const [users, setUsers] = useState<UserItem[]>([])
   const [showModal, setShowModal] = useState(false)
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState<string | null>(null)
   const [newUser, setNewUser] = useState({
     name: '',
     email: '',
     password: '',
     role: 'admin' as 'admin' | 'agent' | 'super_admin',
   })
 
   useEffect(() => {
     try {
       const raw = localStorage.getItem('user')
       const u = raw ? JSON.parse(raw) : null
       if (!u || u.role !== 'super_admin') {
         router.replace('/admin/dashboard')
         return
       }
     } catch {
       router.replace('/admin/dashboard')
       return
     }
     fetchUsers()
   }, [])
 
   const fetchUsers = async () => {
     setLoading(true)
     setError(null)
     const token = localStorage.getItem('token')
     const res = await fetch('/api/admins', {
       headers: { Authorization: `Bearer ${token}` },
     })
     if (res.ok) {
       const data = await res.json()
       setUsers(data)
     } else {
       setError('Gagal memuat data admin')
     }
     setLoading(false)
   }
 
   const handleCreate = async (e: React.FormEvent) => {
     e.preventDefault()
     setError(null)
     const token = localStorage.getItem('token')
     const res = await fetch('/api/admins', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify(newUser),
     })
     if (res.ok) {
       setShowModal(false)
       setNewUser({ name: '', email: '', password: '', role: 'admin' })
       fetchUsers()
     } else {
       const err = await res.json().catch(() => ({ error: 'Gagal menambahkan admin' }))
       setError(err.error || 'Gagal menambahkan admin')
     }
   }
 
  return (
    <div>
      <div className="mb-6 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="px-6 py-6 sm:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Admins</h1>
              <p className="mt-1 text-white/80 text-sm sm:text-base">Kelola pengguna admin dan agent.</p>
            </div>
            <Button variant="outline" onClick={() => setShowModal(true)} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              Tambah Admin
            </Button>
          </div>
        </div>
      </div>
 
      {error && <div className="mb-4 text-red-600">{error}</div>}
 
      <Card className="overflow-hidden">
         <table className="min-w-full divide-y divide-gray-200">
           <thead className="bg-gray-50">
             <tr>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
               <th className="px-6 py-3" />
             </tr>
           </thead>
           <tbody className="bg-white divide-y divide-gray-200">
             {loading ? (
               <tr>
                 <td className="px-6 py-4" colSpan={5}>Memuat...</td>
               </tr>
             ) : users.length === 0 ? (
               <tr>
                 <td className="px-6 py-4" colSpan={5}>Belum ada admin</td>
               </tr>
             ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                   <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                   <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                   <td className="px-6 py-4 whitespace-nowrap capitalize">{u.role.replace('_', ' ')}</td>
                   <td className="px-6 py-4 whitespace-nowrap">
                    {u.is_active ? (
                      <Badge variant="success">Aktif</Badge>
                    ) : (
                      <Badge variant="danger">Nonaktif</Badge>
                    )}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500"></td>
                 </tr>
               ))
             )}
           </tbody>
         </table>
      </Card>
 
       {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 sm:p-8 rounded-xl w-full max-w-lg shadow-lg">
             <h2 className="text-xl font-bold mb-4">Tambah Admin Baru</h2>
             <form onSubmit={handleCreate}>
               <div className="mb-4">
                 <label className="block text-gray-700 mb-2">Nama</label>
                <Input
                   value={newUser.name}
                   onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                   required
                 />
               </div>
               <div className="mb-4">
                 <label className="block text-gray-700 mb-2">Email</label>
                <Input
                   value={newUser.email}
                   onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                   required
                 />
               </div>
               <div className="mb-4">
                 <label className="block text-gray-700 mb-2">Password</label>
                <Input
                   value={newUser.password}
                   onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                   minLength={6}
                   required
                 />
               </div>
               <div className="mb-6">
                 <label className="block text-gray-700 mb-2">Role</label>
                <Select
                   value={newUser.role}
                   onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'agent' | 'super_admin' })}
                 >
                   <option value="admin">Admin</option>
                   <option value="agent">Agent</option>
                   <option value="super_admin">Super Admin</option>
                </Select>
               </div>
               <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Batal</Button>
                <Button type="submit">Simpan</Button>
               </div>
             </form>
           </div>
         </div>
       )}
     </div>
   )
 }

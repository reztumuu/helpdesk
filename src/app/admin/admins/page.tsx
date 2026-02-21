 'use client';
 
 import { useEffect, useState } from 'react';
 import { useRouter } from 'next/navigation';
 
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
       <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-bold">Admins</h1>
         <button
           onClick={() => setShowModal(true)}
           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
         >
           Tambah Admin
         </button>
       </div>
 
       {error && <div className="mb-4 text-red-600">{error}</div>}
 
       <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                 <tr key={u.id}>
                   <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                   <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                   <td className="px-6 py-4 whitespace-nowrap capitalize">{u.role.replace('_', ' ')}</td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                       {u.is_active ? 'Aktif' : 'Nonaktif'}
                     </span>
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500"></td>
                 </tr>
               ))
             )}
           </tbody>
         </table>
       </div>
 
       {showModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
           <div className="bg-white p-8 rounded-lg w-[28rem]">
             <h2 className="text-xl font-bold mb-4">Tambah Admin Baru</h2>
             <form onSubmit={handleCreate}>
               <div className="mb-4">
                 <label className="block text-gray-700 mb-2">Nama</label>
                 <input
                   type="text"
                   value={newUser.name}
                   onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                   className="w-full border rounded px-3 py-2"
                   required
                 />
               </div>
               <div className="mb-4">
                 <label className="block text-gray-700 mb-2">Email</label>
                 <input
                   type="email"
                   value={newUser.email}
                   onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                   className="w-full border rounded px-3 py-2"
                   required
                 />
               </div>
               <div className="mb-4">
                 <label className="block text-gray-700 mb-2">Password</label>
                 <input
                   type="password"
                   value={newUser.password}
                   onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                   className="w-full border rounded px-3 py-2"
                   minLength={6}
                   required
                 />
               </div>
               <div className="mb-6">
                 <label className="block text-gray-700 mb-2">Role</label>
                 <select
                   value={newUser.role}
                   onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'agent' | 'super_admin' })}
                   className="w-full border rounded px-3 py-2"
                 >
                   <option value="admin">Admin</option>
                   <option value="agent">Agent</option>
                   <option value="super_admin">Super Admin</option>
                 </select>
               </div>
               <div className="flex justify-end gap-2">
                 <button
                   type="button"
                   onClick={() => setShowModal(false)}
                   className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                 >
                   Batal
                 </button>
                 <button
                   type="submit"
                   className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                 >
                   Simpan
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}
     </div>
   )
 }

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-6 text-blue-600">Helpdesk System</h1>
      <p className="text-xl text-gray-600 mb-8">A powerful customer support widget system.</p>
      <div className="flex gap-4">
        <Link 
          href="/admin/login" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
        >
          Admin Login
        </Link>
        <Link 
          href="/widget-demo" 
          className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 font-medium"
        >
          View Widget Demo
        </Link>
      </div>
    </div>
  );
}

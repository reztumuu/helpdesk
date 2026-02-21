'use client';

export default function WidgetDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-4">Widget Demo Page</h1>
      <p className="mb-4">This page simulates a client website with the helpdesk widget embedded.</p>
      <div className="mb-4">
          To see the widget, you first need to:
          <ol className="list-decimal list-inside ml-4 mt-2">
              <li>Login to Admin Dashboard</li>
              <li>Create a Website</li>
              <li>Copy the API Key</li>
              <li>Embed the script below with your API Key</li>
          </ol>
      </div>
      
      <div className="mt-10 p-6 bg-white rounded shadow">
          <h2 className="text-xl font-bold mb-2">Instructions</h2>
          <p>
              Embed the following code in your website:
          </p>
          <pre className="bg-gray-800 text-white p-4 rounded mt-2 overflow-x-auto">
              {`<script src="http://localhost:3000/widget.js" data-key="YOUR_API_KEY"></script>`}
          </pre>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function PostHelpCard() {
  const { user } = useAuth();
  const [content, setContent] = useState('');

  const submit = () => {
    alert('Mock posted: ' + content);
    setContent('');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold">Post Help Request</h1>
      <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded shadow">
        <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-900" rows={6} />
        <div className="mt-3 flex justify-end">
          <button onClick={submit} className="bg-primary text-white px-4 py-2 rounded">Post</button>
        </div>
      </div>
    </div>
  );
}

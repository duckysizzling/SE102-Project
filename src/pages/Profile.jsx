import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) return <div className="container mx-auto py-8">Please login to view your profile.</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <div className="flex items-center gap-4">
          <img src={user.avatar} alt="avatar" className="w-20 h-20 rounded-full" />
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <div className="text-sm text-gray-600 dark:text-gray-300">{user.email}</div>
          </div>
        </div>
        <div className="mt-4">
          <button onClick={logout} className="text-sm text-red-500">Logout</button>
        </div>
      </div>
    </div>
  );
}

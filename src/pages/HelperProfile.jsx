import { useParams } from 'react-router-dom';
import { mockHelpers } from '../data/MockData';

export default function HelperProfile() {
  const { id } = useParams();
  const helper = mockHelpers.find(h => String(h.id) === String(id));

  if (!helper) return <div className="container mx-auto py-8">Helper not found</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white dark:bg-gray-800 rounded p-6 shadow">
        <div className="flex items-center gap-6">
          <img src={helper.avatar} alt="avatar" className="w-24 h-24 rounded-full" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{helper.name}</h2>
            <div className="text-sm text-gray-600 dark:text-gray-300">{helper.category} · {helper.location}</div>
            <div className="mt-2">⭐ {helper.rating} · {helper.reviews} reviews</div>
          </div>
        </div>

        <div className="mt-6 text-gray-700 dark:text-gray-300">
          <h3 className="font-medium">About</h3>
          <p className="mt-2">{helper.bio}</p>
        </div>
      </div>
    </div>
  );
}

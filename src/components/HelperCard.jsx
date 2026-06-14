import { Link } from 'react-router-dom';
import TierBadge from './TierBadge';

export default function HelperCard({ helper }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded p-4 flex items-center gap-4">
      <img src={helper.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{helper.name}</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300">{helper.category} · {helper.location}</div>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-200">₱{helper.rate} <span className="text-xs">{helper.rateUnit}</span></div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TierBadge jobsDone={helper.jobsDone} />
            <div className="text-sm text-yellow-500">⭐ {helper.rating}</div>
          </div>
          <Link to={`/helper/${helper.id}`} className="text-sm text-primary">View</Link>
        </div>
      </div>
    </div>
  );
}

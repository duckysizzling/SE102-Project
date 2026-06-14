import { getTier } from '../data/MockData';

export default function TierBadge({ jobsDone = 0 }) {
  const tier = getTier(jobsDone);
  return (
    <span className="text-xs px-2 py-1 rounded" style={{ background: tier.color }}>
      {tier.label}
    </span>
  );
}

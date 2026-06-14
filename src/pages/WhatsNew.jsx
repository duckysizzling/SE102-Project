import { mockPosts } from '../data/MockData';
import PostCard from '../components/PostCard';

export default function WhatsNew() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold">What's New</h1>
      <div className="mt-4 space-y-4">
        {mockPosts.map(p => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}

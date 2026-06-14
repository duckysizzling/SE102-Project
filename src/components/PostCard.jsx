export default function PostCard({ post }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded p-4">
      <div className="flex items-center gap-3">
        <img src={post.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{post.user}</div>
          <div className="text-xs text-gray-500">{post.date} · {post.category}</div>
        </div>
      </div>
      <p className="mt-3 text-gray-700 dark:text-gray-300">{post.content}</p>
    </div>
  );
}

import { createContext, useContext, useState } from "react";
import { mockPosts } from "../data/MockData";

const PostsContext = createContext();

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem("localhelp_posts");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Backfill likedBy for posts saved before this field existed.
      // (Real user posts created after the fix already have it.)
      return parsed.map((p) => ({ ...p, likedBy: p.likedBy || [] }));
    }
    // First-ever load, no saved data yet: seed mock/demo posts with
    // placeholder "seed-N" likers so their original demo like counts
    // (12, 8, 45, 6...) show immediately instead of starting at 0.
    // These placeholder IDs never match a real account, so a real
    // user's like/unlike just adds or removes their own ID on top.
    return mockPosts.map((p) => {
      const seedCount = p.likedBy ? p.likedBy.length : p.likes || 0;
      const likedBy = p.likedBy || Array.from({ length: seedCount }, (_, i) => `seed-${p.id}-${i}`);
      return { ...p, images: p.images || [], likedBy, likes: likedBy.length };
    });
  });

  const persist = (updated) => {
    setPosts(updated);
    try {
      localStorage.setItem("localhelp_posts", JSON.stringify(updated));
    } catch (err) {
      console.error("Storage limit reached while saving posts:", err);
    }
  };

  const addPost = (newPost) => {
    const postWithId = {
      ...newPost,
      id: Date.now(),
      likes: 0,
      likedBy: [],
      comments: [],
      date: new Date().toISOString().split("T")[0],
      trending: false,
    };
    persist([postWithId, ...posts]);
    return postWithId;
  };

  const getPostAvatar = (post, currentUser) => {
    if (currentUser && post.userId === currentUser.id) {
      return currentUser.avatar;
    }
    return post.avatar || "https://i.pravatar.cc/150?img=68";
  };

  // Has this specific user already liked this post?
  const hasLiked = (post, userId) => {
    if (!userId || !post?.likedBy) return false;
    return post.likedBy.some((id) => String(id) === String(userId));
  };

  // Toggle like for a specific user. One like per account, tracked in likedBy.
  const toggleLike = (id, userId) => {
    if (!userId) return; // no-op without a logged-in user; callers should redirect to login first
    const updated = posts.map((p) => {
      if (p.id !== id) return p;
      const alreadyLiked = hasLiked(p, userId);
      const likedBy = alreadyLiked
        ? p.likedBy.filter((uid) => String(uid) !== String(userId))
        : [...p.likedBy, userId];
      return { ...p, likedBy, likes: likedBy.length };
    });
    persist(updated);
  };

  const addComment = (id, text) => {
    const updated = posts.map((p) =>
      p.id === id
        ? {
          ...p,
          comments: [
            ...p.comments,
            { user: "You", text, date: new Date().toISOString().split("T")[0] },
          ],
        }
        : p
    );
    persist(updated);
  };

  return (
    <PostsContext.Provider value={{ posts, addPost, toggleLike, addComment, getPostAvatar, hasLiked }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  return useContext(PostsContext);
}
import { createContext, useContext, useState } from "react";
import { mockPosts } from "../data/MockData";

const PostsContext = createContext();

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem("localhelp_posts");
    if (saved) return JSON.parse(saved);
    return mockPosts.map((p) => ({ ...p, images: p.images || [] }));
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
      comments: [],
      date: new Date().toISOString().split("T")[0],
      trending: false,
    };
    persist([postWithId, ...posts]);
    return postWithId;
  };

  const toggleLike = (id, liked) => {
    const updated = posts.map((p) =>
      p.id === id ? { ...p, likes: liked ? p.likes - 1 : p.likes + 1 } : p
    );
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
    <PostsContext.Provider value={{ posts, addPost, toggleLike, addComment }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  return useContext(PostsContext);
}
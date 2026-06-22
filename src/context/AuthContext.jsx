import { createContext, useContext, useState } from "react";
import { mockUser } from "../data/MockData";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("localhelp_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, password) => {
    // Mock auth — accepts mockUser credentials or any filled form
    if (email === mockUser.email && password === mockUser.password) {
      setUser(mockUser);
      localStorage.setItem("localhelp_user", JSON.stringify(mockUser));
      return { success: true };
    }
    // Also allow any valid-looking credentials for demo purposes
    if (email && password.length >= 6) {
      const demoUser = {
        ...mockUser,
        id: Date.now(),
        email,
        name: email.split("@")[0],
      };
      setUser(demoUser);
      localStorage.setItem("localhelp_user", JSON.stringify(demoUser));
      return { success: true };
    }
    return { success: false, error: "Invalid email or password." };
  };

  const signup = (name, email, password) => {
    const newUser = {
      ...mockUser,
      id: Date.now(),
      name,
      email,
    };
    setUser(newUser);
    localStorage.setItem("localhelp_user", JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("localhelp_user");
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem("localhelp_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
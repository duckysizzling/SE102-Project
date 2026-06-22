import { createContext, useContext, useState } from "react";
import { mockHelpers } from "../data/MockData";

const HelperContext = createContext();

export function HelperProvider({ children }) {
  const [helpers, setHelpers] = useState(() => {
    const saved = localStorage.getItem("localhelp_helpers");
    return saved ? JSON.parse(saved) : mockHelpers;
  });

  const addHelper = (newHelper) => {
    const helperWithId = {
      ...newHelper,
      id: Date.now(),
    };
    const updated = [...helpers, helperWithId];
    setHelpers(updated);
    localStorage.setItem("localhelp_helpers", JSON.stringify(updated));
    return helperWithId;
  };

  const updateHelper = (id, updates) => {
    const updated = helpers.map((h) =>
      String(h.id) === String(id) ? { ...h, ...updates } : h
    );
    setHelpers(updated);
    localStorage.setItem("localhelp_helpers", JSON.stringify(updated));
  };

  const deleteHelper = (id) => {
    const updated = helpers.filter((h) => String(h.id) !== String(id));
    setHelpers(updated);
    localStorage.setItem("localhelp_helpers", JSON.stringify(updated));
  };

  const getUserHelperCards = (userId) => {
    return helpers.filter((h) => h.userId === userId);
  };

  const getHelperAvatar = (helper, currentUser) => {
    if (currentUser && helper.userId === currentUser.id) {
      return currentUser.avatar;
    }
    return helper.avatar || "https://i.pravatar.cc/150?img=68";
  };

  const requestVerification = (userId) => {
  const updated = helpers.map((h) =>
    h.userId === userId ? { ...h, verificationStatus: "reviewing" } : h
  );
  setHelpers(updated);
  localStorage.setItem("localhelp_helpers", JSON.stringify(updated));

  setTimeout(() => {
    setHelpers((prev) => {
      const final = prev.map((h) =>
        h.userId === userId ? { ...h, verified: true, verificationStatus: "approved" } : h
      );
      localStorage.setItem("localhelp_helpers", JSON.stringify(final));
      return final;
    });
  }, 2500);
};

  return (
    <HelperContext.Provider
      value={{
        helpers,
        addHelper,
        updateHelper,
        deleteHelper,
        getUserHelperCards,
        getHelperAvatar,
        requestVerification,
      }}
    >
      {children}
    </HelperContext.Provider>
  );
}

export function useHelpers() {
  return useContext(HelperContext);
}
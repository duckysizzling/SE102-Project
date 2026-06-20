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
const getUserHelperCards = (userName) => {
  return helpers.filter((h) => h.name === userName);
};

  return (
    <HelperContext.Provider value={{ helpers, addHelper, updateHelper, deleteHelper, getUserHelperCards }}>
      {children}
    </HelperContext.Provider>
  );
}

export function useHelpers() {
  return useContext(HelperContext);
}
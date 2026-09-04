import { createContext, useContext } from "react";

export const SiteContext = createContext(null);

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) throw new Error("useSite must be used inside SiteProvider");
  return context;
};

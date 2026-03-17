"use client";
import { createContext, useContext } from "react";

interface AdminContextType {
  pendingCount: number;
  openTickets: number;
  refreshCounts: () => Promise<void>;
}

export const AdminContext = createContext<AdminContextType>({
  pendingCount: 0,
  openTickets: 0,
  refreshCounts: async () => {},
});

export function useAdmin() {
  return useContext(AdminContext);
}

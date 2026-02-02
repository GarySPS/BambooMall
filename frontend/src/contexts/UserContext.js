import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../config";

const UserContext = createContext();

export function UserProvider({ children }) {
  // 1. Load Initial State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("bamboomall_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  
  const [wallet, setWallet] = useState(() => {
    try {
      const saved = localStorage.getItem("bamboomall_wallet");
      return saved ? JSON.parse(saved) : { balance: 0 };
    } catch (e) {
      return { balance: 0 };
    }
  });

  // 2. Persist to LocalStorage
  useEffect(() => {
    if (user) localStorage.setItem("bamboomall_user", JSON.stringify(user));
    else localStorage.removeItem("bamboomall_user");
  }, [user]);

  useEffect(() => {
    localStorage.setItem("bamboomall_wallet", JSON.stringify(wallet));
  }, [wallet]);

  // --- Actions (WRAPPED IN useCallback TO FIX INFINITE LOOP) ---

  const login = useCallback((userObj) => {
    setUser(userObj);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setWallet({ balance: 0 });
    localStorage.removeItem("bamboomall_user");
    localStorage.removeItem("bamboomall_wallet");
    window.location.href = "/login"; 
  }, []);

  // [CRITICAL FIX] This prevents BalancePage from re-running the API endlessly
  const updateWallet = useCallback((newData) => {
    setWallet((prev) => ({ ...prev, ...newData }));
  }, []);

  // --- Fetch latest user data ---
  const refreshUser = useCallback(async () => {
    if (!user || !user.short_id) return;

    try {
      const res = await fetch(`${API_BASE_URL}/users/profile?short_id=${user.short_id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUser(prev => ({ ...prev, ...data.user }));
        if (data.wallet) setWallet(data.wallet);
      } else if (res.status === 404) {
          logout();
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  }, [user, logout]); 

  // 3. Force Sync on Load
  useEffect(() => {
    if (user && user.short_id) {
       refreshUser(); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
    <UserContext.Provider value={{ user, wallet, login, logout, updateWallet, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
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
    // Only persist wallet for UI caching; real value comes from API
    localStorage.setItem("bamboomall_wallet", JSON.stringify(wallet));
  }, [wallet]);

  // --- Actions ---

  const logout = useCallback(() => {
    setUser(null);
    setWallet({ balance: 0 });
    // SECURITY: Wipe the keys
    localStorage.removeItem("bamboomall_user");
    localStorage.removeItem("bamboomall_wallet");
    localStorage.removeItem("token"); 
    window.location.href = "/login"; 
  }, []);

  const login = useCallback((userObj) => {
    setUser(userObj);
    // Note: Token is saved by the LoginPage before calling this
  }, []);

  const updateWallet = useCallback((newData) => {
    setWallet((prev) => ({ ...prev, ...newData }));
  }, []);

  // --- SECURE REFRESH (Uses Token, not ID) ---
  const refreshUser = useCallback(async () => {
    // 1. Get the Key
    const token = localStorage.getItem("token");
    
    // If we have a user in state but no token, they are de-authenticated.
    if (!token) {
        if (user) logout(); 
        return;
    }

    try {
      // 2. Fetch Profile (No ID in URL anymore)
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // <--- THE BADGE
        }
      });

      if (res.ok) {
        const data = await res.json();
        // Update state with fresh data from server
        if (data.user) setUser(prev => ({ ...prev, ...data.user }));
        if (data.wallet) setWallet(data.wallet);
      } else if (res.status === 401 || res.status === 403) {
         // Token expired or invalid
         logout();
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  }, [user, logout]); 

  // 3. Force Sync on Load
  useEffect(() => {
    if (user) {
       refreshUser(); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <UserContext.Provider value={{ user, wallet, login, logout, updateWallet, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
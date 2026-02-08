// src/contexts/UserContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../config";
import { fetchWalletBalance } from "../utils/api"; 

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

  // --- Helpers ---
  
  const _syncWallet = async () => {
    try {
      const freshData = await fetchWalletBalance();
      setWallet(prev => ({ ...prev, ...freshData }));
    } catch (err) {
      console.error("Context: Failed to sync wallet", err);
    }
  };

  // --- Actions ---

  const logout = useCallback(() => {
    setUser(null);
    setWallet({ balance: 0 });
    localStorage.removeItem("bamboomall_user");
    localStorage.removeItem("bamboomall_wallet");
    localStorage.removeItem("token"); 
    window.location.href = "/login"; 
  }, []);

  // --- FIX: Accept token as 2nd argument and save it FIRST ---
  const login = useCallback((userObj, token) => {
    // 1. Mandatory Token Save
    if (token) {
        localStorage.setItem("token", token);
    } else {
        // Warning if no token passed (helps debugging)
        console.warn("UserContext: Login called without token. Persistence may fail.");
    }
    
    // 2. Then set user state
    setUser(userObj);

    // 3. Finally sync wallet (Now safe because token is in localStorage)
    _syncWallet();
  }, []);

  const updateWallet = useCallback((newData) => {
    setWallet((prev) => ({ ...prev, ...newData }));
  }, []);

  // --- SECURE REFRESH (Runs on F5/Reload) ---
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    
    // If we have a user in state but no token, they are de-authenticated.
    if (!token) {
        if (user) logout(); 
        return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) setUser(prev => ({ ...prev, ...data.user }));
        
        // Refresh wallet too
        await _syncWallet();

      } else if (res.status === 401 || res.status === 403) {
         logout();
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  }, [user, logout]); 

  // 3. Force Sync on App Load
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
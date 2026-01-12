// src/contexts/UserContext.js

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("bamboomall_user");
    return saved ? JSON.parse(saved) : null;
  });
  
  // FIX: Default wallet is just a single balance now
  const [wallet, setWallet] = useState(() => {
    const saved = localStorage.getItem("bamboomall_wallet");
    // Default to a simple object with balance: 0
    return saved ? JSON.parse(saved) : { balance: 0 };
  });

  // Persist user
  useEffect(() => {
    if (user) localStorage.setItem("bamboomall_user", JSON.stringify(user));
    else localStorage.removeItem("bamboomall_user");
  }, [user]);

  // Persist wallet
  useEffect(() => {
    localStorage.setItem("bamboomall_wallet", JSON.stringify(wallet));
  }, [wallet]);

  function login(userObj) {
    setUser(userObj);
  }

  function logout() {
    setUser(null);
    // FIX: Reset to single balance 0 on logout
    setWallet({ balance: 0 });
    localStorage.removeItem("bamboomall_user");
    localStorage.removeItem("bamboomall_wallet");
  }

  function updateWallet(newData) {
    setWallet((prev) => ({ ...prev, ...newData }));
  }

  // --- Fetch latest user data from DB ---
  async function refreshUser() {
    if (!user || !user.short_id) return;

    try {
      // Calls the /profile route you just fixed in auth.js
      const res = await fetch(`${API_BASE_URL}/users/profile?short_id=${user.short_id}`);
      
      if (res.ok) {
        const data = await res.json();
        
        // Update user state if data exists
        if (data.user) {
          setUser(prev => ({ ...prev, ...data.user }));
        }
        
        // Update wallet state if data exists
        if (data.wallet) {
          setWallet(data.wallet);
        }
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  }

  return (
    <UserContext.Provider value={{ user, wallet, login, logout, updateWallet, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
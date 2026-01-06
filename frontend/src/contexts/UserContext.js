//src>contexts>UserContext.js

import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("bamboomall_user");
    return saved ? JSON.parse(saved) : null;
  });
  
  const [wallet, setWallet] = useState(() => {
    const saved = localStorage.getItem("bamboomall_wallet");
    return saved ? JSON.parse(saved) : { usdt: 0, alipay: 0, wechat: 0 };
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
    setWallet({ usdt: 0, alipay: 0, wechat: 0 });
    localStorage.removeItem("bamboomall_user");
    localStorage.removeItem("bamboomall_wallet");
  }

  function updateWallet(amounts) {
    setWallet((prev) => ({ ...prev, ...amounts }));
  }

  // --- NEW FUNCTION: Fetch latest user data from DB ---
  async function refreshUser() {
    if (!user || !user.short_id) return;

    try {
      // Fetch fresh user data using short_id
      const res = await fetch(`/api/users/profile?short_id=${user.short_id}`);
      
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
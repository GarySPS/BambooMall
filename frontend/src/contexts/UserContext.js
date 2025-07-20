// contexts/UserContext.js
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
  }
  function updateWallet(amounts) {
    setWallet((prev) => ({ ...prev, ...amounts }));
  }

  return (
    <UserContext.Provider value={{ user, wallet, login, logout, updateWallet }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

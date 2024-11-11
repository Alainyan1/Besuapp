import React, { createContext, useState } from 'react';

export const AccountsContext = createContext();

export const AccountsProvider = ({ children }) => {
  const [accounts, setAccounts] = useState({});

  const addAccount = (key, address, type = "borrower") => {
    setAccounts((prevAccounts) => ({
      ...prevAccounts,
      [key]: { address, type }
    }));
  };

  const clearAccounts = () => {
    setAccounts({});
  };

  return (
    <AccountsContext.Provider value={{ accounts, addAccount, clearAccounts }}>
      {children}
    </AccountsContext.Provider>
  );
};
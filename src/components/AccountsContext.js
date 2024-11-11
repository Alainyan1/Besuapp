import React, { createContext, useState } from 'react';

export const AccountsContext = createContext();

export const AccountsProvider = ({ children }) => {
  const [accounts, setAccounts] = useState({
    lender1: { address: "0xf17f52151EbEF6C7334FAD080c5704D77216b732", type: "lender" },
    lender2: { address: "0x627306090abaB3A6e1400e9345bC60c78a8BEf57", type: "lender" },
    escrow: { address: "0x8adD025FBd37A46c5af45798cc94ec4e97A49698", type: "escrow" },
    borrower1: { address: "0x9", type: "borrower" },
    deployer1: { address: "0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73", type: "deployer" }
  });

  const addAccount = (key, address, type = "borrower") => {
    setAccounts((prevAccounts) => ({
      ...prevAccounts,
      [key]: { address, type }
    }));
  };

  return (
    <AccountsContext.Provider value={{ accounts, addAccount }}>
      {children}
    </AccountsContext.Provider>
  );
};
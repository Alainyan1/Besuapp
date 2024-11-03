import React, { createContext, useState } from 'react';

export const ContractContext = createContext();

export const ContractProvider = ({ children }) => {
  const [contractAddress, setContractAddress] = useState('');

  return (
    <ContractContext.Provider value={{ contractAddress, setContractAddress }}>
      {children}
    </ContractContext.Provider>
  );
};
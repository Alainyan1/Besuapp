import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { AccountsContext } from './AccountsContext';

const Aift = () => {
  const { accounts, addAccount } = useContext(AccountsContext);
  const [loans, setLoans] = useState([]);
  const [inputContractAddress, setInputContractAddress] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [walletAddress, setWalletAddress] = useState(null); // 用于存储钱包地址

  useEffect(() => {
    const storedWalletAddress = localStorage.getItem('walletAddress');
    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
    }
  }, []);

  const connectWallet = async () => {
    const provider = await detectEthereumProvider();

    if (provider) {
      try {
        console.log('MetaMask detected');
        // 每次都请求用户连接他们的 MetaMask 钱包
        await provider.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
        await provider.request({ method: 'eth_requestAccounts' });
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        localStorage.setItem('walletAddress', address);
        console.log('Connected Wallet Address:', address);

        // 添加地址到 accounts 字典中，如果不存在则默认设置为 borrower
        if (!Object.values(accounts).some(account => account.address === address)) {
          addAccount(`account${Object.keys(accounts).length + 1}`, address, "borrower");
        }

        // 打印account类型
        console.log('Accounts:', accounts, accounts.type);
        setLoans([]);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      console.error('MetaMask is not installed');
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };

    const fetchLoans = async (address) => {
      const account = Object.values(accounts).find((acc) => acc.address === walletAddress);
      if (!account) {
        console.error('Account not found');
        return;
      }
    
      let apiUrl;
      let params = { contractAddress: address };
      let processResponseData;
    
      switch (account.type) {
        case 'lender':
          apiUrl = `http://20.2.203.99:3002/api/getLenderInfo`;
          params.account = walletAddress;
          processResponseData = (data) => {
            return [{
              Lender: data.account,
              Allocated: data.allocation,
              Lensed: data.lensed,
              Principal: data.balancePrincipal,
              Interest: data.balanceInterest,
            }];
          };
          break;
        case 'borrower':
          apiUrl = `http://20.2.203.99:3002/api/getNonzeroLenders`;
          processResponseData = (data) => {
            return Object.entries(data).map(([key, value]) => ({
              Lender: value.account,
              Allocated: value.allocation,
              Lensed: value.lensed,
              Principal: value.balancePrincipal,
              Interest: value.balanceInterest,
            }));
          };
          break;
        case 'deployer':
          apiUrl = `http://20.2.203.99:3002/api/getDeployInfo`;
          processResponseData = (data) => {
            return [{
              TotalSupply: ethers.BigNumber.from(data.totalSupply).toString(),
              Principal: ethers.BigNumber.from(data.principal).toString(),
            }];
          };
          break;
        default:
          console.error('Unknown account type');
          return;
      }
    
      try {
        const response = await axios.get(apiUrl, { params });
        console.log('Loans response:', response.data);
    
        const loansData = processResponseData(response.data);
        console.log('Loans data:', loansData);
        setLoans(loansData);
      } catch (error) {
        console.error('Error fetching loans:', error);
      }
    };

  const handleFetchLoans = () => {
    setContractAddress(inputContractAddress);
    fetchLoans(inputContractAddress);
  };

  const getTableColumns = () => {
    const account = Object.values(accounts).find((acc) => acc.address === walletAddress);
    if (!account) {
      return [];
    }

    switch (account.type) {
      case 'lender':
        return ['Lender', 'Allocated', 'Lensed', 'Principal', 'Interest', 'Lender Operation'];
      case 'borrower':
        return ['Lender', 'Allocated', 'Lensed', 'Principal', 'Borrower', 'Interest', 'Borrower Operation'];
      case 'deployer':
        return ['TotalSupply', 'Principal'];
      default:
        return [];
    }
  };

  const handleRepay = (loan) => {
    // Implement the repay logic here
    console.log('Repay button clicked for loan:', loan);
  };

  const renderTableBody = () => {
    if (loans.length === 0) {
      return <tr><td colSpan={getTableColumns().length}>No loans available</td></tr>;
    }
  
    return loans.map((loan, index) => (
      <tr key={index}>
        {getTableColumns().map((column, idx) => {
          const key = column.replace(' ', '');
          return (
            <td key={idx}>
              {key === 'LenderOperation' || key === 'BorrowerOperation' ? (
                <button onClick={() => handleRepay(loan)}>Repay</button>
              ) : (
                loan[key]
              )}
            </td>
          );
        })}
      </tr>
    ));
  };
  
  return (
    <div>
      <h1>Tokenized Loan Platform</h1>
      <button onClick={connectWallet} style={{ position: 'absolute', top: 10, right: 10 }}>
        {walletAddress ? `Connected: ${walletAddress}` : 'Connect Wallet'}
      </button>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="contractAddress">Contract Address:</label>
        <input
          type="text"
          id="contractAddress"
          value={inputContractAddress}
          onChange={(e) => setInputContractAddress(e.target.value)}
          style={{ marginLeft: '10px', padding: '5px', width: '350px' }}
        />
        <button onClick={handleFetchLoans} style={{ marginLeft: '10px', padding: '5px 10px' }}>Fetch</button>
      </div>
      <h2>Contract Address: {contractAddress || 'N/A'}</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {getTableColumns().map((column, idx) => (
              <th key={idx} style={{ backgroundColor: '#2c7be5', color: 'white', padding: '10px' }}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {renderTableBody()}
        </tbody>
      </table>
    </div>
  );
};

export default Aift;
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { AccountsContext } from './AccountsContext';

const Aift = () => {
  const { accounts, addAccount } = useContext(AccountsContext);
  const [loans, setLoans] = useState([]);
  const [inputContractAddress, setInputContractAddress] = useState(localStorage.getItem('contractAddress') || '');
  const [contractAddress, setContractAddress] = useState('');
  const [walletAddress, setWalletAddress] = useState(null);
  const [transferInput, setTransferInput] = useState(''); // New state for transfer input

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
        await provider.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
        await provider.request({ method: 'eth_requestAccounts' });
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        localStorage.setItem('walletAddress', address);
        console.log('Connected Wallet Address:', address);

        if (!Object.values(accounts).some(account => account.address === address)) {
          addAccount(`account${Object.keys(accounts).length + 1}`, address, "borrower");
        }

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
      const loansData = processResponseData(response.data);
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
        return ['Lender', 'Allocated', 'Lensed', 'Principal', 'Borrower Operation', 'Interest', 'Borrower Operation'];
      case 'deployer':
        return ['TotalSupply', 'Principal'];
      default:
        return [];
    }
  };

  const handleRepay = (loan) => {
    console.log('Repay button clicked for loan:', loan);
  };

  const handleTransfer = async () => {
    const account = Object.values(accounts).find((acc) => acc.address === walletAddress);
    if (!account) {
      console.error('Account not found');
      return;
    }

    const [type, address] = transferInput.split(':');
    if (!ethers.utils.isAddress(address)) {
      alert('Invalid input format. Please use lender:address format.');
      return;
    }

    try {
      const provider = await detectEthereumProvider();
      if (provider) {
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        const fromAddress = await signer.getAddress();

        // 获取合约的 ABI 和 bytecode
        const contractDataResponse = await axios.get('http://20.2.203.99:3002/api/contractData');
        const { abi } = contractDataResponse.data;

        // 创建合约实例
        const contract = new ethers.Contract(contractAddress, abi, signer);
        console.log('to address:', address);
        console.log('from address:', fromAddress);
        let tx = await contract.transferAllData(fromAddress, address, ethers.utils.formatBytes32String("transferAllData"),{
          gasLimit: 3000000,
          maxFeePerGas: ethers.utils.parseUnits('0', 'gwei'),
          maxPriorityFeePerGas: ethers.utils.parseUnits('0', 'gwei')
        });
        const receipt = await tx.wait();
        console.log('Transaction successful:', receipt);
        alert('Transaction successful!');

        // Add the address to ContractContext.js
        if (!Object.values(accounts).some(account => account.address === address)) {
          addAccount(`${type}`, address, "lender");
        }
      } else {
        console.error('MetaMask is not installed');
        alert('MetaMask is not installed. Please install it to use this feature.');
      }
    } catch (error) {
      console.error('Error during transaction:', error);
      alert('Transaction failed. Please try again.');
    }
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
      {Object.values(accounts).find((acc) => acc.address === walletAddress)?.type === 'lender' && (
        <div style={{ marginTop: '20px' }}>
          <label htmlFor="transferInput">Transfer To Address:</label>
          <input
            type="text"
            id="transferInput"
            value={transferInput}
            onChange={(e) => setTransferInput(e.target.value)}
            placeholder="lender:address"
            style={{ marginLeft: '10px', padding: '5px', width: '350px' }}
          />
          <button onClick={handleTransfer} style={{ marginLeft: '10px', padding: '5px 10px' }}>Transfer</button>
        </div>
      )}
    </div>
  );
};

export default Aift;
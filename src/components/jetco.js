import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { AccountsContext } from './AccountsContext';

const Jetco = () => {
  const { accounts, addAccount } = useContext(AccountsContext);
  const [paymentFrom, setPaymentFrom] = useState(localStorage.getItem('paymentFrom') || '');
  const [amount, setAmount] = useState(localStorage.getItem('amount') || 1000);
  const [contractAddress, setContractAddress] = useState(localStorage.getItem('contractAddress') || '');
  const [status, setStatus] = useState(null); // 用于存储请求的结果状态
  const [walletAddress, setWalletAddress] = useState(null); // 用于存储钱包地址
  const [operation, setOperation] = useState('');
  const [lenderAddress, setLenderAddress] = useState(''); // 用于存储输入的lender地址
  const [transactionHash, setTransactionHash] = useState(''); // 用于存储交易哈希
  const [selectedPaymentFromKey, setSelectedPaymentFromKey] = useState('');
  const [selectedLenderAddressKey, setSelectedLenderAddressKey] = useState('');
  const [customAddress, setCustomAddress] = useState(''); // 用于存储用户输入的自定义地址

  useEffect(() => {
    const storedWalletAddress = localStorage.getItem('walletAddress');
    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
    }
  }, []);

  const handleConfirm = async () => {
    try {
      const provider = await detectEthereumProvider();
      if (provider) {
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        const escrowAddress = await signer.getAddress();

        // 获取合约的 ABI 和 bytecode
        const contractDataResponse = await axios.get('http://20.2.203.99:3002/api/contractData');
        const { abi } = contractDataResponse.data;

        // 创建合约实例
        const contract = new ethers.Contract(contractAddress, abi, signer);

        let tx;
        if (operation === 'interestRepay') {
          tx = await contract.repayInterest(lenderAddress, parseInt(amount, 10), ethers.utils.formatBytes32String("Interest"), {
            gasLimit: 3000000,
            maxFeePerGas: ethers.utils.parseUnits('0', 'gwei'),
            maxPriorityFeePerGas: ethers.utils.parseUnits('0', 'gwei')
          });
          console.log('tx:', tx);
        } else if (operation === 'principalRepay') {
          tx = await contract.redeemFrom(lenderAddress, parseInt(amount, 10), ethers.utils.formatBytes32String("Principal"));
        } else if (operation === 'drawdown') {
          const allowance = await contract.getEscrowAllowance(escrowAddress);
          console.log('escrow allowance from owner:', allowance);

          tx = await contract.drawdown(paymentFrom, parseInt(amount, 10), {
            gasLimit: 3000000,
            maxFeePerGas: ethers.utils.parseUnits('0', 'gwei'),
            maxPriorityFeePerGas: ethers.utils.parseUnits('0', 'gwei')
        });
        }

        // 等待交易被矿工打包
        const receipt = await tx.wait();
        console.log('Transaction successful:', receipt);
        setStatus('success');
        setTransactionHash(receipt.transactionHash);
        alert('Transaction successful!');
      } else {
        console.error('MetaMask is not installed');
        setStatus('error');
        alert('MetaMask is not installed. Please install it to use this feature.');
      }
    } catch (error) {
      console.error('Error during transaction:', error);
      setStatus('error');
      alert('Transaction failed. Please try again.');
    }
  };

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
        console.log('Connected Wallet Address:', address);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      console.error('MetaMask is not installed');
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };

  const handleOperationChange = (e) => {
    setOperation(e.target.value);
  };

  const handleInputChange = (setter, key) => (event) => {
    const value = event.target.value;
    setter(value);
    localStorage.setItem(key, value);
  };

  const handleSelectChange = (setter, key, setSelectedKey) => (event) => {
    const selectedKey = event.target.value;
    setSelectedKey(selectedKey);
    if (selectedKey === 'custom') {
      setter('');
    } else if (accounts[selectedKey]) {
      const value = accounts[selectedKey].address;
      setter(value);
      localStorage.setItem(key, value);
    }
  };

  const handleCustomAddressChange = (event) => {
    setCustomAddress(event.target.value);
  };

  const handleAddCustomAddress = (setter, key, setSelectedKey) => {
    const [customKey, customValue] = customAddress.split(':');
    addAccount(customKey, customValue, 'borrower');
    setter(customValue);
    setSelectedKey(customKey);
    localStorage.setItem(key, customValue);
    setCustomAddress('');
  };

  return (
    <div style={{ backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '20px', color: 'white' }}>
      <button onClick={connectWallet} style={{ position: 'absolute', top: 10, right: 10 }}>
        {walletAddress ? `Connected: ${walletAddress}` : 'Connect Wallet'}
      </button>
      <h2>Payment Confirmation</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
        <div>
          <label>Payment From:</label>
          <select
            value={selectedPaymentFromKey}
            onChange={handleSelectChange(setPaymentFrom, 'paymentFrom', setSelectedPaymentFromKey)}
            required
            style={{ width: '100%', padding: '10px', margin: '10px 0' }}
          >
            <option value="">Select an account</option>
            {Object.entries(accounts).map(([key, value]) => (
              <option key={key} value={key}>{key}</option>
            ))}
            <option value="custom">Enter custom address</option>
          </select>
          {selectedPaymentFromKey === 'custom' && (
            <div>
              <input
                type="text"
                value={customAddress}
                onChange={handleCustomAddressChange}
                placeholder="Enter address in format Name:address"
                style={{ width: '100%', padding: '10px', margin: '10px 0' }}
              />
              <button type="button" onClick={() => handleAddCustomAddress(setPaymentFrom, 'paymentFrom', setSelectedPaymentFromKey)}>
                Add Address
              </button>
            </div>
          )}
          {paymentFrom && <p>Address: {paymentFrom}</p>}
        </div>
        <div>
          <label>Payment To:</label>
          <select
            value={selectedLenderAddressKey}
            onChange={handleSelectChange(setLenderAddress, 'lenderAddress', setSelectedLenderAddressKey)}
            required
            style={{ width: '100%', padding: '10px', margin: '10px 0' }}
          >
            <option value="">Select an account</option>
            {Object.entries(accounts).map(([key, value]) => (
              <option key={key} value={key}>{key}</option>
            ))}
            <option value="custom">Enter custom address</option>
          </select>
          {selectedLenderAddressKey === 'custom' && (
            <div>
              <input
                type="text"
                value={customAddress}
                onChange={handleCustomAddressChange}
                placeholder="Enter address in format Name:address"
                style={{ width: '100%', padding: '10px', margin: '10px 0' }}
              />
              <button type="button" onClick={() => handleAddCustomAddress(setLenderAddress, 'lenderAddress', setSelectedLenderAddressKey)}>
                Add Address
              </button>
            </div>
          )}
          {lenderAddress && <p>Address: {lenderAddress}</p>}
        </div>
        <div>
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={handleInputChange(setAmount, 'amount')}
            required
            style={{ width: '100%', padding: '10px', margin: '10px 0' }}
          />
        </div>
        <div>
          <label>Contract Address:</label>
          <input
            type="text"
            value={contractAddress}
            onChange={handleInputChange(setContractAddress, 'contractAddress')}
            required
            style={{ width: '100%', padding: '10px', margin: '10px 0' }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="operation">Function</label>
          <select
            id="operation"
            value={operation}
            onChange={handleOperationChange}
            className="form-control"
            style={{ width: '100%', padding: '10px', margin: '10px 0' }}
          >
            <option value="">Select an operation</option>
            <option value="interestRepay">Repay Interest</option>
            <option value="principalRepay">Repay Principal</option>
            <option value="drawdown">Drawdown</option>
          </select>
        </div>
        <button type="submit" style={{ backgroundColor: '#fff', color: '#1a1a1a', border: 'none', padding: '10px 20px', marginTop: '20px' }}>Confirm</button>
      </form>
      {status === 'success' && (
        <div>
          <p style={{ color: 'green' }}>Payment confirmed!</p>
          <p>Transaction Hash: {transactionHash}</p>
        </div>
      )}
      {status === 'error' && <p style={{ color: 'red' }}>Payment failed. Please try again.</p>}
    </div>
  );
};

export default Jetco;
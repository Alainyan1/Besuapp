import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

const Jetco = () => {
  const [paymentFrom, setPaymentFrom] = useState(localStorage.getItem('paymentFrom') || '0x9B200E948576dA9BE216537C42b7f0dbff4E8d0C');
  const [amount, setAmount] = useState(localStorage.getItem('amount') || 1000);
  const [contractAddress, setContractAddress] = useState(localStorage.getItem('contractAddress') || '');
  const [status, setStatus] = useState(null); // 用于存储请求的结果状态
  const [walletAddress, setWalletAddress] = useState(null); // 用于存储钱包地址
  const [operation, setOperation] = useState('');
  const [lenderAddress, setLenderAddress] = useState(''); // 用于存储输入的lender地址


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
        // const fromAddress = await signer.getAddress();
        const fromAddress = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
        // 获取合约的 ABI 和 bytecode
        const contractDataResponse = await axios.get('http://20.2.203.99:3002/api/contractData');
        const { abi } = contractDataResponse.data;

        // 创建合约实例
        const contract = new ethers.Contract(contractAddress, abi, signer);

        const allowance = await contract.allowance(fromAddress, signer.getAddress());
        console.log('Allowance:', allowance.toString());
          
        // 调用 transferFrom 方法
        const tx = await contract.transferFrom(
          fromAddress,
          paymentFrom,
          parseInt(amount, 10),
          {
            gasLimit: 300000,
            gasPrice: ethers.utils.parseUnits('0', 'gwei'),
          }
        );

        // 等待交易被矿工打包
        await tx.wait();
        console.log('Transfer successful:', tx);
        setStatus('success');
      } else {
        console.error('MetaMask is not installed');
        setStatus('error');
      }
    } catch (error) {
      console.error('Error during transfer:', error);
      setStatus('error');
    } 
  };

  const connectWallet = async () => {
    const provider = await detectEthereumProvider();

    if (provider) {
      try {
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

  return (
    <div style={{ backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '20px', color: 'white' }}>
      <button onClick={connectWallet} style={{ position: 'absolute', top: 10, right: 10 }}>
        {walletAddress ? `Connected: ${walletAddress}` : 'Connect Wallet'}
      </button>
      <h2>Payment Confirmation</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
        <div>
          <label>Payment From:</label>
          <input
            type="text"
            value={paymentFrom}
            onChange={handleInputChange(setPaymentFrom, 'paymentFrom')}
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
            >
              <option value="">Select an operation</option>
              <option value="interestRepay">Repay Interest</option>
              <option value="principalRepay">Repay Principal</option>
              <option value="drawdown">Drawdown</option>
            </select>
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
        <button type="submit" style={{ backgroundColor: '#fff', color: '#1a1a1a', border: 'none', padding: '10px 20px', marginTop: '20px' }}>Confirm</button>
      </form>
      {status === 'success' && <p style={{ color: 'green' }}>Payment confirmed!</p>}
      {status === 'error' && <p style={{ color: 'red' }}>Payment failed. Please try again.</p>}
    </div>
  );
};

export default Jetco;
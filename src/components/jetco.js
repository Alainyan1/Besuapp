import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { AccountsContext } from './AccountsContext';
import { Form, Input, Button, Select, Typography } from 'antd';
import { WalletOutlined, ArrowLeftOutlined } from '@ant-design/icons'; // Import the Wallet icon
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../css/jetco.css';
import logo from '../images/jetco.png';
import { devUseWarning } from 'antd/es/_util/warning';

const { Option } = Select;
const { Title } = Typography;

const Jetco = () => {
  const { accounts, addAccount } = useContext(AccountsContext);
  const [paymentFrom, setPaymentFrom] = useState('');
  const [amount, setAmount] = useState(localStorage.getItem('amount') || 4000000000);
  const [contractAddress, setContractAddress] = useState(localStorage.getItem('contractAddress') || '');
  const [status, setStatus] = useState(null); // 用于存储请求的结果状态
  const [walletAddress, setWalletAddress] = useState(null); // 用于存储钱包地址
  const [operation, setOperation] = useState('');
  const [lenderAddress, setLenderAddress] = useState(''); // 用于存储输入的lender地址
  const [transactionHash, setTransactionHash] = useState(''); // 用于存储交易哈希
  const [selectedPaymentFromKey, setSelectedPaymentFromKey] = useState('');
  const [selectedLenderAddressKey, setSelectedLenderAddressKey] = useState('');
  const [customPaymentFromAddress, setCustomPaymentFromAddress] = useState(''); // 用于存储用户输入的自定义地址 for paymentFrom
  const [customPaymentToAddress, setCustomPaymentToAddress] = useState(''); // 用于存储用户输入的自定义地址 for paymentTo

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedWalletAddress = localStorage.getItem('walletAddress');
    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
    }

    // Set contract address from navigation state
    if (location.state?.contractAddress) {
      setContractAddress(location.state.contractAddress);
    }

    // Fetch addresses from the API
    const fetchAddresses = async () => {
      try {
        const response = await axios.get('https://eurybia.xyz/api/test/getAccount');
        const data = response.data;
        data.forEach((account) => {
          addAccount(account.addresskey, account.address, 'none');
        });
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };

    fetchAddresses();
  }, [location.state]);

  

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
          tx = await contract.repayInterest(lenderAddress, paymentFrom, parseInt(amount, 10), ethers.utils.formatBytes32String("Interest"), {
            gasLimit: 3000000,
            maxFeePerGas: ethers.utils.parseUnits('0', 'gwei'),
            maxPriorityFeePerGas: ethers.utils.parseUnits('0', 'gwei')
          });
          console.log('tx:', tx);
        } else if (operation === 'principalRepay') {
          tx = await contract.myredeemFrom(lenderAddress, paymentFrom, parseInt(amount, 10), ethers.utils.formatBytes32String("Principal"));
        } else if (operation === 'drawdown') {
          const allowance = await contract.getEscrowAllowance(escrowAddress);
          console.log('escrow allowance from owner:', allowance);

          tx = await contract.drawdown(paymentFrom, lenderAddress, parseInt(amount, 10), {
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

        let due_time = new Date();
        due_time.setFullYear(due_time.getFullYear() + 3);

        // Save transaction data to the database
        const transactionData = {
          contractAddress: contractAddress,
          paymentFrom: paymentFrom ,
          paymentFromKey: selectedPaymentFromKey,
          paymentTo: lenderAddress,
          paymentToKey: selectedLenderAddressKey,
          amount: amount,
          operation: operation,
          time_stamp: new Date().toISOString().replace(/T/, ' ').substring(0, 10),
          due_time: due_time.toISOString().replace(/T/, ' ').substring(0, 10)
        };
        await saveTransactionData(transactionData);
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

  const saveTransactionData = async (data) => {
    try {
      console.log('Saving transaction data to database:', data);
      await axios.post('https://eurybia.xyz/api/test/saveTransaction', data);
      console.log('Transaction data saved to database successfully');
    } catch (error) {
      console.error('Error saving transaction data to database:', error);
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

  const handleOperationChange = (value) => {
    setOperation(value);
  };

  const handleInputChange = (setter, key) => (event) => {
    const value = event.target.value;
    setter(value);
    localStorage.setItem(key, value);
  };

  const handleSelectChange = (setter, key, setSelectedKey) => (value) => {
    setSelectedKey(value);
    if (value === 'custom') {
      setter('');
    } else if (accounts[value]) {
      const accountValue = accounts[value].address;
      setter(accountValue);
      localStorage.setItem(key, accountValue);
    }
  };

  const handleCustomAddressChange = (setter) => (event) => {
    setter(event.target.value);
  };

  const handleAddCustomAddress = (setter, key, setSelectedKey, customAddress) => {
    const [customKey, customValue] = customAddress.split(':');
    addAccount(customKey, customValue, 'borrower');
    setter(customValue);
    setSelectedKey(customKey);
    localStorage.setItem(key, customValue);
    setter('');
  };

  const handleBack = () => {
    navigate('/token');
  };

  return (
    <div className='jetco-page-container'>
      <div className="top-bar"></div>
      <img src={logo} alt="Logo" className="responsive-logo" />

      {/* Grouped buttons in the right corner */}
      <div className="button-container">
        <Button 
          onClick={connectWallet} 
          className="wallet-button" 
          icon={<WalletOutlined />}
        >
          {walletAddress ? `Connected: ${walletAddress.substring(0, 8) + '...'}` : 'Connect Wallet'}
        </Button>
        
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className="back-button"
        >
          Back to Selection
        </Button>
      </div>
      
      <div className="main-content form-page-content">
        <div className="card-container payment-card">
          <div className="title-container">
            <Title level={2}>CD Token Payment</Title>
          </div>
          <Form layout='vertical' onFinish={handleConfirm} className="payment-form">
            <Form.Item label="Payment From" required className="form-item">
              <Select
                value={selectedPaymentFromKey}
                onChange={handleSelectChange(setPaymentFrom, 'paymentFrom', setSelectedPaymentFromKey)}
                className="custom-select"
              >
                <Option value="">Select an account</Option>
                {Object.entries(accounts).map(([key, value]) => (
                  <Option key={key} value={key}>{key}</Option>
                ))}
                <Option value="custom">Enter custom address</Option>
              </Select>
              {selectedPaymentFromKey === 'custom' && (
                <div className="custom-address-container">
                  <Input
                    type="text"
                    value={customPaymentFromAddress}
                    onChange={handleCustomAddressChange(setCustomPaymentFromAddress)}
                    placeholder="Enter address in format Name:address"
                    className="custom-input"
                  />
                  <Button 
                    type="button" 
                    onClick={() => handleAddCustomAddress(setPaymentFrom, 'paymentFrom', setSelectedPaymentFromKey, customPaymentFromAddress)}
                    className="add-address-button"
                  >
                    Add Address
                  </Button>
                </div>
              )}
              {selectedPaymentFromKey && selectedPaymentFromKey !== 'custom' && (
                <p className="address-display">Address: {accounts[selectedPaymentFromKey].address}</p>
              )}
            </Form.Item>
            
            <Form.Item label="Payment To" required className="form-item">
              <Select
                value={selectedLenderAddressKey}
                onChange={handleSelectChange(setLenderAddress, 'lenderAddress', setSelectedLenderAddressKey)}
                className="custom-select"
              >
                <Option value="">Select an account</Option>
                {Object.entries(accounts).map(([key, value]) => (
                  <Option key={key} value={key}>{key}</Option>
                ))}
                <Option value="custom">Enter custom address</Option>
              </Select>
              {selectedLenderAddressKey === 'custom' && (
                <div className="custom-address-container">
                  <Input
                    type="text"
                    value={customPaymentToAddress}
                    onChange={handleCustomAddressChange(setCustomPaymentToAddress)}
                    placeholder="Enter address in format Name:address"
                    className="custom-input"
                  />
                  <Button 
                    type="button"
                    onClick={() => handleAddCustomAddress(setLenderAddress, 'lenderAddress', setSelectedLenderAddressKey, customPaymentToAddress)}
                    className="add-address-button"
                  >
                    Add Address
                  </Button>
                </div>
              )}
              {selectedLenderAddressKey && selectedLenderAddressKey !== 'custom' && (
                <p className="address-display">Address: {accounts[selectedLenderAddressKey].address}</p>
              )}
            </Form.Item>
            
            <Form.Item label="Amount" required className="form-item">
              <Input
                type="number"
                value={amount}
                onChange={handleInputChange(setAmount, 'amount')}
                className="custom-input"
              />
            </Form.Item>
            
            <Form.Item label="Contract Address" required className="form-item">
              <Input
                type="text"
                value={contractAddress}
                onChange={handleInputChange(setContractAddress, 'contractAddress')}
                className="custom-input"
              />
            </Form.Item>
            
            <Form.Item label="Function" required className="form-item">
              <Select
                value={operation}
                onChange={handleOperationChange}
                className="custom-select"
              >
                <Option value="">Select an operation</Option>
                <Option value="interestRepay">Repay Interest</Option>
                <Option value="principalRepay">Repay Principal</Option>
                <Option value="drawdown">Drawdown</Option>
              </Select>
            </Form.Item>
            
            <Form.Item className="submit-container">
              <Button type="primary" htmlType="submit" className="submit-button">Confirm</Button>
            </Form.Item>
          </Form>
          
          {status === 'success' && (
            <div className="status-success">
              <p>Payment confirmed!</p>
              <p>Transaction Hash: {transactionHash}</p>
            </div>
          )}
          {status === 'error' && <p className="status-error">Payment failed. Please try again.</p>}
        </div>
      </div>
    </div>
  );
};

export default Jetco;
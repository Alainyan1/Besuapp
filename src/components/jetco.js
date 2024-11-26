import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { AccountsContext } from './AccountsContext';
import { Form, Input, Button, Select, Typography } from 'antd';
import { WalletOutlined } from '@ant-design/icons'; // Import the Wallet icon
import { useLocation } from 'react-router-dom';
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

  return (
    <div className='jetco-page-container'>
      <img src={logo} alt="Logo" className="responsive-logo" />
      <Button onClick={connectWallet} style={{
        backgroundColor: '#fff', // 背景颜色为白色
        color: 'red', // 字体颜色为红色
        borderRadius: '10px', // 设置按钮的圆角
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 添加阴影效果
        fontSize: '18px', // 增大按钮的字体
        height: '50px', // 增加按钮的高度
        position: 'fixed', top: 20, right: 10
      }} icon={<WalletOutlined />}>
        {walletAddress ? `Connected: ${walletAddress}` : 'Connect Wallet'}
      </Button>
      <div style={{ marginTop: '120px'}}> {/* Move the form down */}
        <div style={{ backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '20px', color: 'white', width: 'auto', maxWidth: '500px', margin: '20px auto' }}>
        <Title level={2} style={{ color: 'white', textAlign: 'center', marginTop: '1px' }}>Payment Confirmation</Title>
          <Form layout='vertical' onFinish={handleConfirm} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Form.Item label={<label style={{ color: 'white', fontSize: '18px' }}>Payment From</label>} required style={{ width: '100%' }}>
              <Select
                value={selectedPaymentFromKey}
                onChange={handleSelectChange(setPaymentFrom, 'paymentFrom', setSelectedPaymentFromKey)}
                style={{ width: '100%'}}
              >
                <Option value="">Select an account</Option>
                {Object.entries(accounts).map(([key, value]) => (
                  <Option key={key} value={key}>{key}</Option>
                ))}
                <Option value="custom">Enter custom address</Option>
              </Select>
              {selectedPaymentFromKey === 'custom' && (
                <div>
                  <Input
                    type="text"
                    value={customPaymentFromAddress}
                    onChange={handleCustomAddressChange(setCustomPaymentFromAddress)}
                    placeholder="Enter address in format Name:address"
                    style={{ width: '100%', marginTop: '10px' }}
                  />
                  <Button color='white' type="button" onClick={() => handleAddCustomAddress(setPaymentFrom, 'paymentFrom', setSelectedPaymentFromKey, customPaymentFromAddress)} style={{ marginTop: '10px', backgroundColor: 'white' }}>
                    Add Address
                  </Button>
                </div>
              )}
              {selectedPaymentFromKey && selectedPaymentFromKey !== 'custom' && (
                <p style={{ color: 'white', marginTop: '10px' }}>Address: {accounts[selectedPaymentFromKey].address}</p>
              )}
            </Form.Item>
            <Form.Item label={<label style={{ color: 'white', fontSize: '18px' }}>Payment To</label>} required style={{ width: '100%' }}>
              <Select
                value={selectedLenderAddressKey}
                onChange={handleSelectChange(setLenderAddress, 'lenderAddress', setSelectedLenderAddressKey)}
                style={{ width: '100%' }}
              >
                <Option value="">Select an account</Option>
                {Object.entries(accounts).map(([key, value]) => (
                  <Option key={key} value={key}>{key}</Option>
                ))}
                <Option value="custom">Enter custom address</Option>
              </Select>
              {selectedLenderAddressKey === 'custom' && (
                <div>
                  <Input
                    type="text"
                    value={customPaymentToAddress}
                    onChange={handleCustomAddressChange(setCustomPaymentToAddress)}
                    placeholder="Enter address in format Name:address"
                    style={{ width: '100%', marginTop: '10px' }}
                  />
                  <Button type="button" color='white' onClick={() => handleAddCustomAddress(setLenderAddress, 'lenderAddress', setSelectedLenderAddressKey, customPaymentToAddress)} style={{ marginTop: '10px', backgroundColor: 'white'}}>
                    Add Address
                  </Button>
                </div>
              )}
              {selectedLenderAddressKey && selectedLenderAddressKey !== 'custom' && (
                <p style={{ color: 'white', marginTop: '10px' }}>Address: {accounts[selectedLenderAddressKey].address}</p>
              )}
            </Form.Item>
            <Form.Item label={<label style={{ color: 'white', fontSize: '18px' }}>Amount</label>} required style={{ width: '100%' }}>
              <Input
                type="number"
                value={amount}
                onChange={handleInputChange(setAmount, 'amount')}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item label={<label style={{ color: 'white', fontSize: '18px' }}>Contract Address</label>} required style={{ width: '100%' }}>
              <Input
                type="text"
                value={contractAddress}
                onChange={handleInputChange(setContractAddress, 'contractAddress')}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item label={<label style={{ color: 'white', fontSize: '18px' }}>Function</label>} required style={{ width: '100%' }}>
              <Select
                value={operation}
                onChange={handleOperationChange}
                style={{ width: '100%' }}
              >
                <Option value="">Select an operation</Option>
                <Option value="interestRepay">Repay Interest</Option>
                <Option value="principalRepay">Repay Principal</Option>
                <Option value="drawdown">Drawdown</Option>
              </Select>
            </Form.Item>
            <Form.Item style={{ textAlign: 'center' }}>
              <Button type="primary" htmlType="submit" style={{
                backgroundColor: 'white', // 背景颜色设为白色
                color: '#000', // 字体颜色设为黑色
                padding: '15px 30px', // 增大内边距，使按钮整体变大
                fontSize: '24px', // 墛大按钮的字体
                height: '40px', // 增加按钮的高度
                borderRadius: '15px', // 设置按钮的圆角
                width: '150px'
               }}>Confirm</Button>
            </Form.Item>
          </Form>
          {status === 'success' && (
            <div>
              <p style={{ color: 'green' }}>Payment confirmed!</p>
              <p>Transaction Hash: {transactionHash}</p>
            </div>
          )}
          {status === 'error' && <p style={{ color: 'red' }}>Payment failed. Please try again.</p>}
        </div>
      </div>
    </div>
  );
};

export default Jetco;
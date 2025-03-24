import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Form, Input, Button, Row, Col, Typography, Modal, Alert, Select } from 'antd';
import { LoginOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AccountsContext } from './AccountsContext';
import { useLocation } from 'react-router-dom';
import '../css/jetco.css';
import logo from '../images/jetco.png';

const { Title } = Typography;
const { Option } = Select;

const TdToken = () => {
  const navigate = useNavigate();

  const { accounts, addAccount } = useContext(AccountsContext);
  const [customer, setCustomer] = useState('');
  const [userName, setUserName] = useState('');
  const [customerWallet, setCustomerWallet] = useState('');
  const [recipientBankName, setRecipientBankName] = useState('');
  const [recipientWalletAddress, setRecipientWalletAddress] = useState('');
  const [currency, setCurrency] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [receiveBankBicCode, setReceiveBankBicCode] = useState('');
  const [sendUserName, setSendUserName] = useState('');
  const [status, setStatus] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [txnId, setTxnId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  
  // Custom input flags for each field
  const [customCustomer, setCustomCustomer] = useState(false);
  const [customUserName, setCustomUserName] = useState(false);
  const [customCustomerWallet, setCustomCustomerWallet] = useState(false);
  const [customRecipientBank, setCustomRecipientBank] = useState(false);
  const [customRecipientWallet, setCustomRecipientWallet] = useState(false);
  const [customCurrency, setCustomCurrency] = useState(false);
  const [customBicCode, setCustomBicCode] = useState(false);
  const [customSendUserName, setCustomSendUserName] = useState(false);
  
  // Preset options for dropdown menus
  const [customerOptions, setCustomerOptions] = useState(['jetcocus04', 'ap1_client01', 'ap1_bank01', 'fuboncus03', 'fuboncus04']);
  const [userNameOptions, setUserNameOptions] = useState(['Asset Platform C1 Customer B','Asset Platform 1 Client 01', 'Asset Platform 1 Bank 01','Asset Platform C1', 'Asset Platform C1 Customer']);
  const [customerWalletOptions, setCustomerWalletOptions] = useState([]);
  const [recipientBankOptions, setRecipientBankOptions] = useState([]);
  const [recipientWalletOptions, setRecipientWalletOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState(['HKD']);
  const [bicCodeOptions, setBicCodeOptions] = useState(['JETCHKHH', 'IBALHKHH']);
  const [sendUserNameOptions, setSendUserNameOptions] = useState(['jetcocus04', 'ap1_client01', 'ap1_bank01', 'fuboncus03', 'fuboncus04']);
  //9B5234D1-FF22-4C4E-AA23-95A9A2D47C40
  // Login related states
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [loginUserName, setLoginUserName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginBicCode, setLoginBicCode] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [loginCredentials] = useState([
    { username: 'jetcocus04', password: 'AQ+xT7Voj/dbfLlvE+x5sml4sP8GRzT3LUU54crODrUip0E2Dn4=', bicCode: 'JETCHKHH' },
    { username: 'ap1_client01', password: 'qEJYDF9O3oDrPJGKIqrmw52gnJOH27EqUvInTztDm4fLMiz2HsA=', bicCode: 'JETCHKHH' },
    { username: 'ap1_bank01', password: '+6jTntd0ORoKB/PQ6YOQjCXGHTXgpN+j4Ce3YMfDaITwy6iA4dI=', bicCode: 'JETCHKHH' },
    { username: 'fuboncus03', password: '3FwCwphZrdBhqX0iKakbb4Y/csf4yuyIt0n9xVsAPTTaa74W54o=', bicCode: 'IBALHKHH' },
    { username: 'fuboncus04', password: 'y+MNQvNlsQ45GOkl3RTwMwg7tqxDzyjwYehyuKG9ZETuJXHNScM=', bicCode: 'IBALHKHH' },
  ]);
  const [isCustomLogin, setIsCustomLogin] = useState(false);
  

  const location = useLocation();

  useEffect(() => {
    // Check for auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    }
  
    // Check if we have purchase details from location state
    if (location.state?.action === 'purchase' && location.state?.purchaseDetails) {
      const { 
        clientAddress, 
        purchaseAmount,
        formattedTermId,
        contractAddress
      } = location.state.purchaseDetails;
      
      // Pre-fill the form with the purchase details
      setCustomerWallet(clientAddress);
      setTransferAmount(purchaseAmount.toString());
      setCustomer(`CD Purchase: ${formattedTermId}`);
      setRecipientWalletAddress(contractAddress);
      
      // Find matching customer from options
      for (const key in accounts) {
        if (accounts[key].address === clientAddress) {
          setUserName(key.split(':')[0] || key);
          setSendUserName(key.split(':')[0] || key);
          break;
        }
      }
      
      setCurrency('HKD');
      setRecipientBankName('Certificate Issuer');
      setReceiveBankBicCode('CDHKCD');
    }
    
    // Add some example wallet addresses to the options
    setCustomerWalletOptions([
      '0x6ef628f08cbe6bc2dc1df23a63ddea4c1d6c71e6',
      '0x1774b3bfe779c733e3efef93a9861e97e7d6fdcc',
      '0x55740d5b5ccd272ac74e2fb313bb8778de1ae5ca',
      '0x3359d12abf811e8812876b6b43e22d7c4f940c87',
      '0x763b99e09b600827f878723946f2b4ee7343be71'
    ]);
    
    setRecipientWalletOptions([
      '0x6ef628f08cbe6bc2dc1df23a63ddea4c1d6c71e6',
      '0x1774b3bfe779c733e3efef93a9861e97e7d6fdcc',
      '0x55740d5b5ccd272ac74e2fb313bb8778de1ae5ca',
      '0x3359d12abf811e8812876b6b43e22d7c4f940c87',
      '0x763b99e09b600827f878723946f2b4ee7343be71'
    ]);
    
    setRecipientBankOptions(['JETCHKHH', 'IBALHKHH']);
  }, [location.state, accounts]);

  // Add this function to handle username selection
  const handleUsernameChange = (selectedUsername) => {
    if (selectedUsername === 'custom') {
      setIsCustomLogin(true);
      setLoginUserName('');
      setLoginPassword('');
      setLoginBicCode('');
    } else {
      setIsCustomLogin(false);
      setLoginUserName(selectedUsername);
      
      // Find the matching credentials
      const credentials = loginCredentials.find(cred => cred.username === selectedUsername);
      if (credentials) {
        setLoginPassword(credentials.password);
        setLoginBicCode(credentials.bicCode);
      }
    }
  };

  // Modify handleLogin function to use these new values
  const handleLogin = async () => {
    try {
      setLoginError('');
      setLoginSuccess('');
      
      const response = await axios.post('https://eurybia.xyz/api/test/jetcoLogin', {
        username: loginUserName,
        password: loginPassword,
        bicCode: loginBicCode
      });

      const { data, succ } = response.data;
      console.log('Login response:', data, succ);
      
      if (succ === 0) {
        localStorage.setItem('authToken', data);
        setWalletAddress(data.address);
        // setLoginSuccess(`Login successful! Token address: ${data.address}`);
        setLoginSuccess(`Login successful!`);
        
        // Don't close the modal immediately, let user see the address
        setTimeout(() => {
          setIsLoginModalVisible(false);
          setIsLoggedIn(true);
        }, 2000);
      } else {
        setLoginError('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setLoginError('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setWalletAddress(null);
  };

  const showLoginModal = () => {
    setIsLoginModalVisible(true);
  };

  const handleLoginCancel = () => {
    setIsLoginModalVisible(false);
  };

  const handleConfirm = async () => {
    try {
      // First check the user's balance
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('You are not logged in. Please login first.');
        showLoginModal();
        return;
      }
  
      // Check balance before proceeding with transfer
      // const balanceResponse = await axios.post('https://eurybia.xyz/api/test/jetcoBalance', 
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      
      // const { data: balanceData, succ: balanceSucc } = balanceResponse.data;
      
      // if (balanceSucc !== 0) {
      //   setStatus('error');
      //   alert('Failed to check balance. Please try again.');
      //   return;
      // }
      
      // const userBalance = parseFloat(balanceData.balance);
      // const transferAmountValue = parseFloat(transferAmount);
      
      // if (userBalance < transferAmountValue) {
      //   setStatus('error');
      //   alert(`Insufficient balance. Your balance is ${userBalance} but you're trying to transfer ${transferAmountValue}.`);
      //   return;
      // }

      // Debug: Log the full token value to verify it's correctly formatted
      console.log('Token value:', token);
      
      // Create properly formatted authorization header
      const authHeader = `Bearer ${token}`;
      console.log('Authorization header:', authHeader);
      
      // If balance is sufficient, proceed with the transfer
      console.log('Transfer payload:', {
        customer,
        userName,
        customerWallet,
        recipientBankName,
        recipientWalletAddress,
        currency,
        transferAmout: transferAmount,
        recipientBankBicCode: receiveBankBicCode,
        sendUserName
      });
      
      // If balance is sufficient, proceed with the transfer
      const response = await axios.post('https://eurybia.xyz/api/test/jetcoTransfer', 
        {
          customer,
          userName,
          customerWallet,
          recipientBankName,
          recipientWalletAddress,
          currency,
          transferAmout: transferAmount,
          recipientBankBicCode: receiveBankBicCode,
          sendUserName
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const { data, succ } = response.data;
      if (succ === 0) {
        const { txnId } = data;
        setTxnId(txnId);
        console.log('Transaction ID:', txnId);
        setTransactionHash(txnId);
        setStatus('pending');
        
        // Poll for transaction status completion
        let completed = false;
        let attempts = 0;
        const maxAttempts = 5; // Maximum number of polling attempts
        
        while (!completed && attempts < maxAttempts) {
          attempts++;
          const transactionStatus = await checkStatus(txnId);
          console.log('Transaction status:', transactionStatus);
          
          if (transactionStatus === 'COMPLETED') {
            setStatus('success');
            alert('Transaction successful!');
            completed = true;
          } else {
            // Wait before trying again
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
        
        if (!completed) {
          setStatus('error');
          alert('Transaction timed out. Please check status later.');
        }
      } else {
        setStatus('error');
        alert('Transaction failed. Please try again');
      }
    } catch (error) {
      console.error('Error during transaction:', error);
      setStatus('error');
      alert('Transaction failed. Please try again.');
    }
};

  const checkStatus = async (txnId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post('https://eurybia.xyz/api/test/jetcoTransaction', 
        { txnId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // console.log('Transaction status response:', response.data);
  
      const { data, succ } = response.data;
      if (succ === 0) {
        const { status } = data;
        return status; // Just return the status, don't handle completion here
      } else {
        console.error('Transaction status check failed');
        return null;
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return null;
    }
  };

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
  };
  
  const handleSelectChange = (setter, setCustomFlag) => (value) => {
    if (value === 'custom') {
      setCustomFlag(true);
      setter('');
    } else {
      setter(value);
      setCustomFlag(false);
    }
  };
  
  const handleCustomInputChange = (setter) => (event) => {
    setter(event.target.value);
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
          onClick={isLoggedIn ? handleLogout : showLoginModal}
          className="login-button"
          icon={<LoginOutlined />}
        >
          {isLoggedIn ? `Logged in: ${walletAddress ? walletAddress.substring(0, 8) + '...' : ''}` : 'Login'}
        </Button>
        
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className="back-button"
        >
          Back to Selection
        </Button>
      </div>

      <Modal
        title={<div style={{ textAlign: 'center', fontSize: '20px' }}>Login</div>}
        visible={isLoginModalVisible}
        onCancel={handleLoginCancel}
        centered
        bodyStyle={{ padding: '24px' }}
        className="custom-modal"
        footer={[
          <Button key="back" onClick={handleLoginCancel} className="modal-button cancel-button">
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleLogin} className="modal-button submit-button">
            Login
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Username" required>
            <Select
              value={loginUserName}
              onChange={handleUsernameChange}
              placeholder="Select a username"
              className="custom-select"
            >
              {loginCredentials.map(cred => (
                <Option key={cred.username} value={cred.username}>{cred.username}</Option>
              ))}
              <Option value="custom">Enter custom credentials</Option>
            </Select>
            {isCustomLogin && (
              <Input 
                value={loginUserName}
                onChange={(e) => setLoginUserName(e.target.value)}
                placeholder="Enter your username"
                className="custom-input"
                style={{ marginTop: '8px' }}
              />
            )}
          </Form.Item>
          <Form.Item label="Password" required>
            <Input.Password 
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Enter your password"
              className="custom-input"
              // disabled={!isCustomLogin && loginUserName !== ''}
            />
          </Form.Item>
          <Form.Item label="BIC Code" required>
            <Input 
              value={loginBicCode}
              onChange={(e) => setLoginBicCode(e.target.value)}
              placeholder="Enter your BIC code"
              className="custom-input"
              // disabled={!isCustomLogin && loginUserName !== ''}
            />
          </Form.Item>
          
          {loginError && (
            <Alert 
              message={loginError} 
              type="error" 
              style={{ marginBottom: '10px' }} 
            />
          )}
          
          {loginSuccess && (
            <Alert 
              message={loginSuccess} 
              type="success" 
              style={{ marginBottom: '10px' }} 
            />
          )}
        </Form>
      </Modal>

      <div className="main-content form-page-content">
        <div className="card-container payment-card">
          <div className="title-container">
            <Title level={2}>TD Token Payment</Title>
          </div>
          <Form layout='vertical' onFinish={handleConfirm} className="payment-form">
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
              <Col span={12}>
                <Form.Item label="Customer" required className="form-item">
                  {!customCustomer ? (
                    <Select
                      value={customer}
                      onChange={handleSelectChange(setCustomer, setCustomCustomer)}
                      className="custom-select"
                    >
                      {customerOptions.map(opt => (
                        <Option key={opt} value={opt}>{opt}</Option>
                      ))}
                      <Option value="custom">Enter custom customer</Option>
                    </Select>
                  ) : (
                    <Input
                      value={customer}
                      onChange={handleCustomInputChange(setCustomer)}
                      placeholder="Enter customer"
                      className="custom-input"
                      addonAfter={
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={() => setCustomCustomer(false)}
                          style={{ padding: 0 }}
                        >
                          Back
                        </Button>
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="User Name" required className="form-item">
                  {!customUserName ? (
                    <Select
                      value={userName}
                      onChange={handleSelectChange(setUserName, setCustomUserName)}
                      className="custom-select"
                    >
                      {userNameOptions.map(opt => (
                        <Option key={opt} value={opt}>{opt}</Option>
                      ))}
                      <Option value="custom">Enter custom user name</Option>
                    </Select>
                  ) : (
                    <Input
                      value={userName}
                      onChange={handleCustomInputChange(setUserName)}
                      placeholder="Enter user name"
                      className="custom-input"
                      addonAfter={
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={() => setCustomUserName(false)}
                          style={{ padding: 0 }}
                        >
                          Back
                        </Button>
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
              <Col span={12}>
                <Form.Item label="Customer Wallet" required className="form-item">
                  {!customCustomerWallet ? (
                    <Select
                      value={customerWallet}
                      onChange={handleSelectChange(setCustomerWallet, setCustomCustomerWallet)}
                      className="custom-select"
                      showSearch
                      optionFilterProp="children"
                    >
                      {customerWalletOptions.map(opt => (
                        <Option key={opt} value={opt}>{opt}</Option>
                      ))}
                      <Option value="custom">Enter custom wallet</Option>
                    </Select>
                  ) : (
                    <Input
                      value={customerWallet}
                      onChange={handleCustomInputChange(setCustomerWallet)}
                      placeholder="Enter customer wallet"
                      className="custom-input"
                      addonAfter={
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={() => setCustomCustomerWallet(false)}
                          style={{ padding: 0 }}
                        >
                          Back
                        </Button>
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Recipient Bank Name" required className="form-item">
                  {!customRecipientBank ? (
                    <Select
                      value={recipientBankName}
                      onChange={handleSelectChange(setRecipientBankName, setCustomRecipientBank)}
                      className="custom-select"
                    >
                      {recipientBankOptions.map(opt => (
                        <Option key={opt} value={opt}>{opt}</Option>
                      ))}
                      <Option value="custom">Enter custom bank name</Option>
                    </Select>
                  ) : (
                    <Input
                      value={recipientBankName}
                      onChange={handleCustomInputChange(setRecipientBankName)}
                      placeholder="Enter recipient bank name"
                      className="custom-input"
                      addonAfter={
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={() => setCustomRecipientBank(false)}
                          style={{ padding: 0 }}
                        >
                          Back
                        </Button>
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
              <Col span={12}>
                <Form.Item label="Recipient Wallet Address" required className="form-item">
                  {!customRecipientWallet ? (
                    <Select
                      value={recipientWalletAddress}
                      onChange={handleSelectChange(setRecipientWalletAddress, setCustomRecipientWallet)}
                      className="custom-select"
                      showSearch
                      optionFilterProp="children"
                    >
                      {recipientWalletOptions.map(opt => (
                        <Option key={opt} value={opt}>{opt}</Option>
                      ))}
                      <Option value="custom">Enter custom wallet address</Option>
                    </Select>
                  ) : (
                    <Input
                      value={recipientWalletAddress}
                      onChange={handleCustomInputChange(setRecipientWalletAddress)}
                      placeholder="Enter recipient wallet address"
                      className="custom-input"
                      addonAfter={
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={() => setCustomRecipientWallet(false)}
                          style={{ padding: 0 }}
                        >
                          Back
                        </Button>
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Currency" required className="form-item">
                  {!customCurrency ? (
                    <Select
                      value={currency}
                      onChange={handleSelectChange(setCurrency, setCustomCurrency)}
                      className="custom-select"
                    >
                      {currencyOptions.map(opt => (
                        <Option key={opt} value={opt}>{opt}</Option>
                      ))}
                      <Option value="custom">Enter custom currency</Option>
                    </Select>
                  ) : (
                    <Input
                      value={currency}
                      onChange={handleCustomInputChange(setCurrency)}
                      placeholder="Enter currency"
                      className="custom-input"
                      addonAfter={
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={() => setCustomCurrency(false)}
                          style={{ padding: 0 }}
                        >
                          Back
                        </Button>
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
              <Col span={12}>
                <Form.Item label="Transfer Amount" required className="form-item">
                  <Input
                    type="number"
                    value={transferAmount}
                    onChange={handleInputChange(setTransferAmount)}
                    className="custom-input"
                    placeholder="Enter transfer amount"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Receive Bank BIC Code" required className="form-item">
                  {!customBicCode ? (
                    <Select
                      value={receiveBankBicCode}
                      onChange={handleSelectChange(setReceiveBankBicCode, setCustomBicCode)}
                      className="custom-select"
                    >
                      {bicCodeOptions.map(opt => (
                        <Option key={opt} value={opt}>{opt}</Option>
                      ))}
                      <Option value="custom">Enter custom BIC code</Option>
                    </Select>
                  ) : (
                    <Input
                      value={receiveBankBicCode}
                      onChange={handleCustomInputChange(setReceiveBankBicCode)}
                      placeholder="Enter BIC code"
                      className="custom-input"
                      addonAfter={
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={() => setCustomBicCode(false)}
                          style={{ padding: 0 }}
                        >
                          Back
                        </Button>
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
              <Col span={12}>
                <Form.Item label="Send User Name" required className="form-item">
                  {!customSendUserName ? (
                    <Select
                      value={sendUserName}
                      onChange={handleSelectChange(setSendUserName, setCustomSendUserName)}
                      className="custom-select"
                    >
                      {sendUserNameOptions.map(opt => (
                        <Option key={opt} value={opt}>{opt}</Option>
                      ))}
                      <Option value="custom">Enter custom user name</Option>
                    </Select>
                  ) : (
                    <Input
                      value={sendUserName}
                      onChange={handleCustomInputChange(setSendUserName)}
                      placeholder="Enter send user name"
                      className="custom-input"
                      addonAfter={
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={() => setCustomSendUserName(false)}
                          style={{ padding: 0 }}
                        >
                          Back
                        </Button>
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
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
          {status === 'pending' && <p className="status-pending">Transaction in progress...</p>}
        </div>
      </div>
    </div>
  );
};

export default TdToken;
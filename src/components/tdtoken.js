import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Form, Input, Button, Row, Col, Typography, Modal, Alert } from 'antd';
import { LoginOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AccountsContext } from './AccountsContext';
import { useLocation } from 'react-router-dom';
import '../css/jetco.css';
import logo from '../images/jetco.png';

const { Title } = Typography;

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
  
  // Login related states
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [loginUserName, setLoginUserName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginBicCode, setLoginBicCode] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    }

    const fetchAddresses = async () => {
      try {
        const response = await axios.get('https://poc-portal.xxx.com/api/getAccount');
        const data = response.data;
        data.forEach((account) => {
          addAccount(account.addresskey, account.address, 'none');
        });
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };

    fetchAddresses();
  }, [location.state, addAccount]);

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
        localStorage.setItem('authToken', data.token);
        setWalletAddress(data.address);
        setLoginSuccess(`Login successful! Token address: ${data.address}`);
        
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
      const balanceResponse = await axios.post('https://eurybia.xyz/api/test/jetcoBalance', 
        { address: customerWallet },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const { data: balanceData, succ: balanceSucc } = balanceResponse.data;
      
      if (balanceSucc !== 0) {
        setStatus('error');
        alert('Failed to check balance. Please try again.');
        return;
      }
      
      const userBalance = parseFloat(balanceData.balance);
      const transferAmountValue = parseFloat(transferAmount);
      
      if (userBalance < transferAmountValue) {
        setStatus('error');
        alert(`Insufficient balance. Your balance is ${userBalance} but you're trying to transfer ${transferAmountValue}.`);
        return;
      }
      
      // If balance is sufficient, proceed with the transfer
      const response = await axios.post('https://eurybia.xyz/api/test/jetcoTransfer', 
        {
          customer,
          userName,
          customerWallet,
          recipientBankName,
          recipientWalletAddress,
          currency,
          transferAmount: parseInt(transferAmount, 10),
          receiveBankBicCode,
          sendUserName
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const { data, succ } = response.data;
      if (succ === 0) {
        const { txnId } = data;
        setTxnId(txnId);
        setTransactionHash(data.transactionHash);
        setStatus('pending');
        await checkStatus(txnId);
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
  
      const { data, succ } = response.data;
      if (succ === 0) {
        const { status } = data;
        if (status === 'COMPLETED') {
          setStatus('success');
          alert('Transaction successful!');
        } else {
          setTimeout(() => checkStatus(txnId), 5000); // Poll every 5 seconds
        }
      } else {
        setStatus('error');
        alert('Transaction status check failed. Please try again.');
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
      setStatus('error');
      alert('Transaction status check failed. Please try again.');
    }
  };

  const handleInputChange = (setter) => (event) => {
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
            <Input 
              value={loginUserName}
              onChange={(e) => setLoginUserName(e.target.value)}
              placeholder="Enter your username"
              className="custom-input"
            />
          </Form.Item>
          <Form.Item label="Password" required>
            <Input.Password 
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Enter your password"
              className="custom-input"
            />
          </Form.Item>
          <Form.Item label="BIC Code" required>
            <Input 
              value={loginBicCode}
              onChange={(e) => setLoginBicCode(e.target.value)}
              placeholder="Enter your BIC code"
              className="custom-input"
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
                  <Input
                    type="text"
                    value={customer}
                    onChange={handleInputChange(setCustomer)}
                    className="custom-input"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="User Name" required className="form-item">
                  <Input
                    type="text"
                    value={userName}
                    onChange={handleInputChange(setUserName)}
                    className="custom-input"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
              <Col span={12}>
                <Form.Item label="Customer Wallet" required className="form-item">
                  <Input
                    type="text"
                    value={customerWallet}
                    onChange={handleInputChange(setCustomerWallet)}
                    className="custom-input"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Recipient Bank Name" required className="form-item">
                  <Input
                    type="text"
                    value={recipientBankName}
                    onChange={handleInputChange(setRecipientBankName)}
                    className="custom-input"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
              <Col span={12}>
                <Form.Item label="Recipient Wallet Address" required className="form-item">
                  <Input
                    type="text"
                    value={recipientWalletAddress}
                    onChange={handleInputChange(setRecipientWalletAddress)}
                    className="custom-input"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Currency" required className="form-item">
                  <Input
                    type="text"
                    value={currency}
                    onChange={handleInputChange(setCurrency)}
                    className="custom-input"
                  />
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
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Receive Bank BIC Code" required className="form-item">
                  <Input
                    type="text"
                    value={receiveBankBicCode}
                    onChange={handleInputChange(setReceiveBankBicCode)}
                    className="custom-input"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
              <Col span={12}>
                <Form.Item label="Send User Name" required className="form-item">
                  <Input
                    type="text"
                    value={sendUserName}
                    onChange={handleInputChange(setSendUserName)}
                    className="custom-input"
                  />
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
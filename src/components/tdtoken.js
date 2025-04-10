import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, Row, Col, Typography, Select } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/tdtoken.css';
import logo from '../images/jetco.png';

const { Title } = Typography;
const { Option } = Select;

const TdToken = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Essential form fields
  const [customer, setCustomer] = useState('');
  const [userName, setUserName] = useState('');
  const [customerWallet, setCustomerWallet] = useState('');
  const [recipientBankName, setRecipientBankName] = useState('');
  const [recipientWalletAddress, setRecipientWalletAddress] = useState('');
  const [currency, setCurrency] = useState('HKD');
  const [transferAmount, setTransferAmount] = useState('');
  const [receiveBankBicCode, setReceiveBankBicCode] = useState('');
  const [sendUserName, setSendUserName] = useState('');

  // 展示recipientName
  const [recipientName, setRecipientName] = useState('Fubon');

  
  // Transaction status tracking
  const [status, setStatus] = useState(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [txnId, setTxnId] = useState('');
  
  // Custom input flags for editable fields only
  const [customRecipientBank, setCustomRecipientBank] = useState(false);
  const [customRecipientWallet, setCustomRecipientWallet] = useState(false);
  const [customCurrency, setCustomCurrency] = useState(false);
  const [customBicCode, setCustomBicCode] = useState(false);
  
  // Options for dropdown menus
  const [recipientBankOptions] = useState(['JETCHKHH', 'IBALHKHH']);
  const [recipientWalletOptions] = useState([
    '0x6ef628f08cbe6bc2dc1df23a63ddea4c1d6c71e6',
    '0x1774b3bfe779c733e3efef93a9861e97e7d6fdcc',
    '0x55740d5b5ccd272ac74e2fb313bb8778de1ae5ca',
  ]);
  const [currencyOptions] = useState(['HKD']);
  const [bicCodeOptions] = useState(['JETCHKHH', 'IBALHKHH']);

  // Customer payment mapping
  const [paymentDetails] = useState([
    { customer: 'jetcocus04', userName: 'Asset Platform C1 Customer B', customerWallet: '0x6ef628f08cbe6bc2dc1df23a63ddea4c1d6c71e6', recipientBankName: 'JETCHKHH', recipientWalletAddress: '0x1774b3bfe779c733e3efef93a9861e97e7d6fdcc', currency: 'HKD', receiveBankBicCode: 'JETCHKHH', sendUserName: 'jetcocus04' },
    { customer: 'ap1_client01', userName: 'Asset Platform 1 Client 01', customerWallet: '0x1774b3bfe779c733e3efef93a9861e97e7d6fdcc', recipientBankName: 'JETCHKHH', recipientWalletAddress: '0x55740d5b5ccd272ac74e2fb313bb8778de1ae5ca', currency: 'HKD', receiveBankBicCode: 'JETCHKHH', sendUserName: 'ap1_client01' },
    { customer: 'ap1_bank01', userName: 'Asset Platform 1 Bank 01', customerWallet: '0x55740d5b5ccd272ac74e2fb313bb8778de1ae5ca', recipientBankName: 'JETCHKHH', recipientWalletAddress: '0x1774b3bfe779c733e3efef93a9861e97e7d6fdcc', currency: 'HKD', receiveBankBicCode: 'JETCHKHH', sendUserName: 'ap1_bank01' },
  ]);

  useEffect(() => {
    // Check for auth token (simplified)
    const token = localStorage.getItem('authToken');
    if (!token) {
      // Redirect to login if no token
      navigate('/tdplatform');
      return;
    }

    // Get customer from state
    let customerValue = '';
    
    // From login flow
    if (location.state?.username) {
      customerValue = location.state.username;
      setCustomer(customerValue);
    }
    
    // From purchase flow
    if (location.state?.action === 'purchase' && location.state?.purchaseDetails) {
      const { purchaseDetails } = location.state;
      customerValue = purchaseDetails.customer || '';
      setCustomer(customerValue);
      setTransferAmount(purchaseDetails.transferAmount || '');
    }
    
    // Auto-populate fields based on customer
    if (customerValue) {
      const customerDetails = paymentDetails.find(pd => pd.customer === customerValue);
      if (customerDetails) {
        setUserName(customerDetails.userName);
        setCustomerWallet(customerDetails.customerWallet);
        setRecipientBankName(customerDetails.recipientBankName);
        setRecipientWalletAddress(customerDetails.recipientWalletAddress);
        setCurrency(customerDetails.currency);
        setReceiveBankBicCode(customerDetails.receiveBankBicCode);
        setSendUserName(customerDetails.sendUserName);
      }
    }
    
    // Clear location state to prevent issues on refresh
    window.history.replaceState({}, document.title);
  }, [location.state, navigate, paymentDetails]);

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
  const checkBalance = async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Checking balance with token:', token);
      const balanceResponse = await axios.post('https://eurybia.xyz/api/test/jetcoBalance', { headers: { Authorization: `Bearer ${token}` } });

      const { data: balanceData, succ: balanceSucc } = balanceResponse.data;
      
      if (balanceSucc !== 0) {
        setStatus('error');
        alert('Failed to check balance. Please try again.');
        return false;
      }
      
      console.log('Balance data:', balanceData);
      const userBalance = parseFloat(balanceData.availableBalance);
      const transferAmountValue = parseFloat(transferAmount);
      
      if (userBalance < transferAmountValue) {
        setStatus('error');
        alert(`Insufficient balance. Your balance is ${userBalance} HKD but you're trying to transfer ${transferAmountValue} HKD.`);
        return false;
      }
      
      return true; // Balance is sufficient
    } catch (error) {
      console.error('Error checking balance:', error);
      setStatus('error');
      alert('Failed to check balance. Please try again.');
      return false;
    }
  };

  const handleConfirm = async () => {
    try {
      // Validate required fields
      if (!customer || !userName || !customerWallet || !recipientBankName || 
          !recipientWalletAddress || !currency || !transferAmount || 
          !receiveBankBicCode || !sendUserName) {
        alert('Please fill in all required fields');
        return;
      }

      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('You are not logged in. Please login first.');
        navigate('/tdplatform');
        return;
      }
      
      // Prepare API payload
      const payload = {
        customer,
        userName,
        customerWallet,
        recipientBankName,
        recipientWalletAddress,
        currency,
        transferAmout: transferAmount, // Note: API expects this misspelling
        recipientBankBicCode: receiveBankBicCode,
        sendUserName
      };
      
      console.log('Transfer payload:', payload);

      // Check balance before proceeding
      const balanceOk = await checkBalance();
      if (!balanceOk) {
        return; // Stop here if balance is insufficient
      }

      // Make transfer API call
      const response = await axios.post(
        'https://eurybia.xyz/api/test/jetcoTransfer', 
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const { data, succ } = response.data;
      if (succ === 0) {
        const { txnId } = data;
        setTxnId(txnId);
        setTransactionHash(txnId);
        setStatus('pending');
        
        // Poll for transaction status
        let completed = false;
        let attempts = 0;
        const maxAttempts = 5;
        
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
      
      const response = await axios.post(
        'https://eurybia.xyz/api/test/jetcoTransaction', 
        { txnId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const { data, succ } = response.data;
      if (succ === 0) {
        const { status } = data;
        return status;
      } else {
        console.error('Transaction status check failed');
        return null;
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return null;
    }
  };

  // Simplified input handlers
  const handleInputChange = (setter) => (event) => setter(event.target.value);
  
  const handleSelectChange = (setter, setCustomFlag) => (value) => {
    if (value === 'custom') {
      setCustomFlag(true);
      setter('');
    } else {
      setter(value);
      setCustomFlag(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/tdplatform');
  }

  return (
    <div className='tdtoken-page-container'>
      <div className="tdtop-bar"></div>
      <img src={logo} alt="Logo" className="responsive-logo" />
      <Typography.Title 
        level={1} 
        className="page-title"
        style={{ 
          color: '#000', 
          textAlign: 'center', 
          fontSize: '40px' 
        }}
      >
        Tokenized Deposit Payment
      </Typography.Title>

      {/* Welcome message with customer name */}
      {customer && (
        <div className="welcome-message" style={{
          textAlign: 'center',
          color: '#1d3557'
        }}>
          <Typography.Text style={{ fontSize: '18px', fontWeight: '500' }}>
            Welcome: <span style={{ color: '#457b9d', fontWeight: 'bold' }}>{userName}</span> -
            <span style={{ fontFamily: 'monospace', backgroundColor: '#f8f9fa', padding: '3px 8px', borderRadius: '4px', marginLeft: '8px' }}>
              {`${customer}`}
            </span>
            <br />
            Wallet Address: <span style={{ fontFamily: 'monospace', backgroundColor: '#f8f9fa', padding: '3px 8px', borderRadius: '4px', marginLeft: '8px' }}>
              {customerWallet}
            </span>
            <br />
          </Typography.Text>
        </div>
      )}

      <div className="button-container">
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={handleLogout}
          className="back-button"
        >
          Logout
        </Button>
      </div>

      <div className="main-content form-page-content">
        <div className="card-container payment-card">
          <div className="tdtitle-container">
            <Title level={2}>TD Token Payment</Title>
          </div>
          <Form layout='vertical' onFinish={handleConfirm} className="payment-form">
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
              <Col span={12}>
                <Form.Item label="Recipient Wallet Address" required className="tdform-item">
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
                      onChange={handleInputChange(setRecipientWalletAddress)}
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
              <Form.Item label="Recipient Name" required className="tdform-item">
                <Input
                  placeholder="Fubon"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="custom-input"
                />
              </Form.Item>
            </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
              <Col span={12}>
                <Form.Item label="Receive Bank BIC Code" required className="tdform-item">
                  {!customBicCode ? (
                    <Select
                      value={receiveBankBicCode}
                      onChange={handleSelectChange(setRecipientBankName, setReceiveBankBicCode, setCustomBicCode)}
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
                      onChange={handleInputChange(setCustomRecipientBank, setReceiveBankBicCode)}
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
              <Col span={12}>
                <Form.Item label="Currency" required className="tdform-item">
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
                      onChange={handleInputChange(setCurrency)}
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
              <Col span={24}>
                <Form.Item label="Transfer Amount" required className="tdform-item">
                  <Input
                    type="number"
                    value={transferAmount}
                    onChange={handleInputChange(setTransferAmount)}
                    className="custom-input"
                    placeholder="Enter transfer amount"
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
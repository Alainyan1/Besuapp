import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Form, Input, Button, Row, Col, Typography } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { AccountsContext } from './AccountsContext';
import { useLocation } from 'react-router-dom';
import '../css/jetco.css';
import logo from '../images/jetco.png';

const { Title } = Typography;

const TdToken = () => {
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

  const location = useLocation();

  useEffect(() => {
    const storedWalletAddress = localStorage.getItem('walletAddress');
    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
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
  }, [location.state]);

  const handleConfirm = async () => {
    try {
      const response = await axios.post('https://poc-portal.xxx.com/api/transfer', {
        customer,
        userName,
        customerWallet,
        recipientBankName,
        recipientWalletAddress,
        currency,
        transferAmount: parseInt(transferAmount, 10),
        receiveBankBicCode,
        sendUserName
      });

      const { data, succ } = response.data;
      if (succ === 0) {
        const { txnId } = data;
        setTxnId(txnId);
        setTransactionHash(data.transactionHash);
        setStatus('pending');
        await checkStatus(txnId);
      } else {
        setStatus('error');
        alert('Transaction failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during transaction:', error);
      setStatus('error');
      alert('Transaction failed. Please try again.');
    }
  };

  const checkStatus = async (txnId) => {
    try {
      const response = await axios.post('https://poc-portal.xxx.com/api/enquiryTransaction', {
        txnId
      });

      const { data, succ } = response.data;
      if (succ === 0) {
        const { status } = data;
        if (status === 'COMPLETED') {
          setStatus('success');
          alert('Transaction successful!');
        } else {
          setTimeout(() => checkStatus(txnId), 1000); // Poll per second
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

  return (
    <div className='tdtoken-page-container'>
      <img src={logo} alt="Logo" className="responsive-logo" />
      <Button onClick={() => alert('Connect Wallet functionality not implemented')} style={{
        backgroundColor: '#fff',
        color: 'red',
        borderRadius: '10px',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        fontSize: '18px',
        height: '50px',
        position: 'fixed', top: 20, right: 10
      }} icon={<WalletOutlined />}>
        {walletAddress ? `Connected: ${walletAddress}` : 'Connect Wallet'}
      </Button>
      <div style={{ marginTop: '120px'}}>
        <div style={{ backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '20px', color: 'white', width: 'auto', maxWidth: '500px', margin: '20px auto' }}>
        <Title level={2} style={{ color: 'white', textAlign: 'center', marginTop: '1px' }}>Payment Confirmation</Title>
          <Form layout='vertical' onFinish={handleConfirm} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Row gutter={16} style={{ width: '100%' }}>
              <Col span={12}>
                <Form.Item label={<label style={{ color: 'white', fontSize: '18px' }}>Customer</label>} required>
                  <Input
                    type="text"
                    value={customer}
                    onChange={handleInputChange(setCustomer)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<label style={{ color: 'white', fontSize: '18px' }}>User Name</label>} required>
                  <Input
                    type="text"
                    value={userName}
                    onChange={handleInputChange(setUserName)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} style={{ width: '100%' }}>
              <Col span={12}>
                <Form.Item label={<label style={{ color: 'white', fontSize: '18px' }}>Customer Wallet</label>} required>
                  <Input
                    type="text"
                    value={customerWallet}
                    onChange={handleInputChange(setCustomerWallet)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<label style={{ color: 'white', fontSize: '18px' }}>Recipient Bank Name</label>} required>
                  <Input
                    type="text"
                    value={recipientBankName}
                    onChange={handleInputChange(setRecipientBankName)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} style={{ width: '100%' }}>
              <Col span={12}>
                <Form.Item label={<label style={{ color: 'white', fontSize: '18px' }}>Recipient Wallet Address</label>} required>
                  <Input
                    type="text"
                    value={recipientWalletAddress}
                    onChange={handleInputChange(setRecipientWalletAddress)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<label style={{ color: 'white', fontSize: '18px' }}>Currency</label>} required>
                  <Input
                    type="text"
                    value={currency}
                    onChange={handleInputChange(setCurrency)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} style={{ width: '100%' }}>
              <Col span={12}>
                <Form.Item label={<label style={{ color: 'white', fontSize: '18px' }}>Transfer Amount</label>} required>
                  <Input
                    type="number"
                    value={transferAmount}
                    onChange={handleInputChange(setTransferAmount)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={<label style={{ color: 'white', fontSize: '18px' }}>Receive Bank BIC Code</label>} required>
                  <Input
                    type="text"
                    value={receiveBankBicCode}
                    onChange={handleInputChange(setReceiveBankBicCode)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16} style={{ width: '100%' }}>
              <Col span={12}>
                <Form.Item label={<label style={{ color: 'white', fontSize: '18px' }}>Send User Name</label>} required>
                  <Input
                    type="text"
                    value={sendUserName}
                    onChange={handleInputChange(setSendUserName)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item style={{ textAlign: 'center' }}>
              <Button type="primary" htmlType="submit" style={{
                backgroundColor: 'white',
                color: '#000',
                padding: '15px 30px',
                fontSize: '24px',
                height: '40px',
                borderRadius: '15px',
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

export default TdToken;
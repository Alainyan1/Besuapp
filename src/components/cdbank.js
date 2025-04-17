import React, { useState, useEffect } from 'react';
import { Button, Typography, Row, Col, Card } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import '../css/cdbank.css';
import logo from '../images/aift.png';

const { Title, Paragraph } = Typography;

const Cdbank = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [walletAddress, setWalletAddress] = useState(null);

  // Get wallet address from location state when component mounts
  useEffect(() => {
    if (location.state && location.state.walletAddress) {
      setWalletAddress(location.state.walletAddress);
      // console.log('Using wallet address from previous page:', location.state.walletAddress);
    } else {
      console.warn('No wallet address provided. Redirecting to platform page');
      // Optional: redirect to platform page if no wallet is connected
      // navigate('/cdplatform');
    }
  }, [location.state, navigate]);

  const handleTokenSelect = (token) => {
    if (token === 'issue') {
      // Pass the wallet address to the next page
      navigate('/cd', { state: { walletAddress } });
    } else {
      navigate('/cdtoken', { state: { walletAddress } });
    }
  };

  const handleBack = () => {
    navigate('/cdplatform');
  };

  const handleBankName = (address) => {
    if (address === '0xf17f52151EbEF6C7334FAD080c5704D77216b732') { 
      return 'Bank';
    } else {
      return 'Bank';
    }
  }

  return (
    <div className='token-page-container'>
      <div className="cdbank-top-bar"></div>
      <img src={logo} alt="Logo" className="responsive-logo" />
      <Typography.Title level={1} style={{ color: '#000', margin: '10px', textAlign: 'center', minHeight: '8vh', fontSize: '40px' }}>Bank's Task Select</Typography.Title>
      
      {/* Back button to platform */}
      <Button 
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        className="back-button"
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 100,
          backgroundColor: '#fff',
          color: '#000',
          borderRadius: '10px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          fontSize: '16px',
          height: '40px'
        }}
      >
        Back
      </Button>
      
      {/* Welcome message with wallet address */}
        {walletAddress && (
            <div style={{
            textAlign: 'center',
            marginBottom: '30px',
            padding: '10px 0',
            color: '#1d3557'
            }}>
            <Typography.Text style={{ fontSize: '18px', fontWeight: '500' }}>
                Welcome <span style={{ color: '#457b9d', fontWeight: 'bold' }}> {handleBankName(walletAddress)} </span> :
                <span style={{ fontFamily: 'monospace', backgroundColor: '#f8f9fa', padding: '3px 8px', borderRadius: '4px', marginLeft: '8px' }}>
                {`${walletAddress}`}
                </span>
            </Typography.Text>
            </div>
        )}
      
      <div className="select-card-container" style={{ maxWidth: '900px', margin: '20px auto' }}>
        <div className="title-container">
          <Title level={2} style={{ color: '#1d3557', textAlign: 'center' }}>Select Option Type</Title>
        </div>
        
        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} md={12}>
            <Card
              hoverable
              className="token-card"
              onClick={() => handleTokenSelect('issue')}
            >
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <Title level={3} style={{ color: 'white', marginBottom: '20px' }}>Issue Certificate of Deposit</Title>
                <Paragraph style={{ color: '#a8b2c1', fontSize: '16px', marginBottom: '30px' }}>
                  Issue Certificate of Deposit
                </Paragraph>
                <Button 
                  type="primary" 
                  size="large"
                  className="token-button"
                >
                  Issue
                </Button>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card
              hoverable
              className="token-card"
              onClick={() => handleTokenSelect('transfer')}
            >
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <Title level={3} style={{ color: 'white', marginBottom: '20px' }}>Transfer Certificate of Deposit</Title>
                <Paragraph style={{ color: '#a8b2c1', fontSize: '16px', marginBottom: '30px' }}>
                  Transfer Certificate of Deposit
                </Paragraph>
                <Button 
                  type="primary" 
                  size="large"
                  className="token-button"
                >
                  Transfer
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Cdbank;
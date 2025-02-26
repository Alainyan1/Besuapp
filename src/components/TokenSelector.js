import React from 'react';
import { Button, Typography, Row, Col, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import '../css/tokenselector.css';
import logo from '../images/jetco.png';

const { Title, Paragraph } = Typography;

const TokenSelector = () => {
  const navigate = useNavigate();

  const handleTokenSelect = (token) => {
    if (token === 'td') {
      navigate('/tdtoken');
    } else {
      navigate('/jetco');
    }
  };

  return (
    <div className='token-page-container'>
      <div className="top-bar"></div>
      <img src={logo} alt="Logo" className="responsive-logo" />
      
      <div className="select-card-container" style={{ maxWidth: '900px', margin: '40px auto' }}>
        <div className="title-container">
          <Title level={2} style={{ color: '#1d3557', textAlign: 'center' }}>Select Transaction Type</Title>
        </div>
        
        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} md={12}>
            <Card
              hoverable
              className="token-card"
              onClick={() => handleTokenSelect('td')}
            >
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <Title level={3} style={{ color: 'white', marginBottom: '20px' }}>TD</Title>
                <Paragraph style={{ color: '#a8b2c1', fontSize: '16px', marginBottom: '30px' }}>
                  Tokenized Deposit
                </Paragraph>
                <Button 
                  type="primary" 
                  size="large"
                  className="token-button"
                >
                  Select TD Token
                </Button>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card
              hoverable
              className="token-card"
              onClick={() => handleTokenSelect('cd')}
            >
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <Title level={3} style={{ color: 'white', marginBottom: '20px' }}>CD</Title>
                <Paragraph style={{ color: '#a8b2c1', fontSize: '16px', marginBottom: '30px' }}>
                  Certificate of Deposit
                </Paragraph>
                <Button 
                  type="primary" 
                  size="large"
                  className="token-button"
                >
                  Select CD Token
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default TokenSelector;
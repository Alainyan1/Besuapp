import React, { useState } from 'react';
import { Button, Typography, Row, Col, Card } from 'antd';
import TdToken from './tdtoken';
import Jetco from './jetco';
import '../css/jetco.css';
import logo from '../images/jetco.png';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title } = Typography;

const TokenSelector = () => {
  const [selectedToken, setSelectedToken] = useState(null);

  const handleTokenSelect = (token) => {
    setSelectedToken(token);
  };

  const handleBack = () => {
    setSelectedToken(null);
  };

  // Render the selection page
  if (!selectedToken) {
    return (
      <div className='jetco-page-container'>
        <img src={logo} alt="Logo" className="responsive-logo" />
        <div style={{ marginTop: '120px' }}>
          <div style={{ backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '30px', color: 'white', width: 'auto', maxWidth: '800px', margin: '20px auto' }}>
            <Title level={2} style={{ color: 'white', textAlign: 'center', marginBottom: '40px' }}>Select Transaction Type</Title>
            <Row gutter={[24, 24]} justify="center">
              <Col xs={24} md={12}>
                <Card
                  hoverable
                  style={{ 
                    backgroundColor: '#2a2a2a', 
                    borderRadius: '10px',
                    height: '100%'
                  }}
                  onClick={() => handleTokenSelect('td')}
                >
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Title level={3} style={{ color: 'white' }}>TD</Title>
                    <p style={{ color: '#cccccc', fontSize: '16px' }}>
                      Tokennized Deposit Token
                    </p>
                    <Button 
                      type="primary" 
                      size="large"
                      style={{
                        backgroundColor: 'white',
                        color: '#000',
                        fontSize: '18px',
                        height: '50px',
                        borderRadius: '10px',
                        marginTop: '20px'
                      }}
                    >
                      Select TD Token
                    </Button>
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  hoverable
                  style={{ 
                    backgroundColor: '#2a2a2a', 
                    borderRadius: '10px',
                    height: '100%'
                  }}
                  onClick={() => handleTokenSelect('cd')}
                >
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Title level={3} style={{ color: 'white' }}>CD</Title>
                    <p style={{ color: '#cccccc', fontSize: '16px' }}>
                      Certificate of Deposit Token
                    </p>
                    <Button 
                      type="primary" 
                      size="large"
                      style={{
                        backgroundColor: 'white',
                        color: '#000',
                        fontSize: '18px',
                        height: '50px',
                        borderRadius: '10px',
                        marginTop: '20px'
                      }}
                    >
                      Select CD Token
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }

  // Render the selected token component with back button
  return (
    <div>
      <Button 
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        style={{
          position: 'fixed',
          top: 120,
          left: 20,
          zIndex: 1000,
          backgroundColor: '#fff',
          color: '#000',
          borderRadius: '10px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          fontSize: '16px',
          height: '40px',
        }}
      >
        Back to Selection
      </Button>
      {selectedToken === 'td' ? <TdToken /> : <Jetco />}
    </div>
  );
};

export default TokenSelector;
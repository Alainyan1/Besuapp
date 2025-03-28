import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AccountsContext } from './AccountsContext';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Modal, Form, Input, Alert, Select } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import '../css/aiftRouter.css';
import logo from '../images/jetco.png';

const { Title } = Typography;
const { Option } = Select;

const TdPlatform = () => {
  const { accounts, addAccount } = useContext(AccountsContext);
  const [walletAddress, setWalletAddress] = useState(null);
  const navigate = useNavigate();

  // Login related states
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [loginUserName, setLoginUserName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginBicCode, setLoginBicCode] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [isCustomLogin, setIsCustomLogin] = useState(false);

  // Predefined credentials
  const [loginCredentials] = useState([
    { username: 'jetcocus04', password: 'AQ+xT7Voj/dbfLlvE+x5sml4sP8GRzT3LUU54crODrUip0E2Dn4=', bicCode: 'JETCHKHH' },
    { username: 'ap1_client01', password: 'qEJYDF9O3oDrPJGKIqrmw52gnJOH27EqUvInTztDm4fLMiz2HsA=', bicCode: 'JETCHKHH' },
    { username: 'ap1_bank01', password: '+6jTntd0ORoKB/PQ6YOQjCXGHTXgpN+j4Ce3YMfDaITwy6iA4dI=', bicCode: 'JETCHKHH' }
  ]);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
      // Try to extract wallet address from token if available
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        if (tokenData.address) {
          setWalletAddress(tokenData.address);
        }
      } catch (error) {
        console.error("Error parsing JWT token:", error);
      }
    }
  }, []);

  // Handle username selection
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

  // Login function
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
        setLoginSuccess(`Login successful! Redirecting to TD Token page...`);
        
        // Navigate to tdtoken after a brief delay to show success message
        setTimeout(() => {
          setIsLoginModalVisible(false);
          setIsLoggedIn(true);
          navigate('/tdtoken', { state: { walletAddress: data.address } });
        }, 2000);
      } else {
        setLoginError('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setLoginError('Login failed. Please try again.');
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setWalletAddress(null);
  };

  // Show login modal
  const showLoginModal = () => {
    setIsLoginModalVisible(true);
  };

  // Cancel login modal
  const handleLoginCancel = () => {
    setIsLoginModalVisible(false);
  };

  // Continue to TD Token page if already logged in
//   const handleContinue = () => {
//     navigate('/tdtoken', { state: { walletAddress } });
//   };

  return (
    <div className="app-container">
      <div className="background-container"></div>
      <div className="content-container">
        <img src={logo} alt="Logo" className="responsive-logo" />
        <h1 className="title">Bank Tokenized Asset Platform</h1>
        <p className="description">
          Welcome to the Tokenized Deposit platform. 
          <br />
          Login to initiate your transactions. 
          <br />
        </p>
        
        <div className="action-container" style={{ marginTop: '40px' }}>
          <Button 
            type="primary" 
            onClick={isLoggedIn ? handleLogout : showLoginModal}
            style={{
              backgroundColor: '#6EA1EB',
              color: '#000',
              borderRadius: '10px',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
              fontSize: '18px',
              height: '50px',
              width: '200px'
            }}
          >
            {isLoggedIn ? 'Logout' : 'Login'}
          </Button>
        </div>
        
        {/* Login status display */}
        {isLoggedIn && walletAddress && (
          <div style={{
            marginTop: '20px',
            padding: '10px 15px',
            backgroundColor: 'rgba(110, 161, 235, 0.2)',
            borderRadius: '8px',
            color: '#1d3557'
          }}>
            <p style={{ margin: '0', fontWeight: '500' }}>
              Logged in as: {loginUserName || 'User'} / 
              <span style={{ fontFamily: 'monospace', backgroundColor: '#f0f2f5', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>
                {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
              </span>
              <Button 
                type="link" 
                onClick={handleLogout} 
                icon={<LoginOutlined />}
                style={{ padding: '0 10px', color: '#e63946' }}
              >
                Logout
              </Button>
            </p>
          </div>
        )}
      </div>

      {/* Login Modal */}
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
              disabled={!isCustomLogin && loginUserName !== ''}
            />
          </Form.Item>
          <Form.Item label="BIC Code" required>
            <Input 
              value={loginBicCode}
              onChange={(e) => setLoginBicCode(e.target.value)}
              placeholder="Enter your BIC code"
              className="custom-input"
              disabled={!isCustomLogin && loginUserName !== ''}
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
    </div>
  );
};

export default TdPlatform;
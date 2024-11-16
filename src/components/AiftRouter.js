import React, { useState, useContext } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { AccountsContext } from './AccountsContext';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Select } from 'antd';
import '../css/aiftRouter.css';
import logo from '../images/aift.png';

//const { Title } = Typography;
const { Option } = Select;

const AiftRouter = () => {
  const { accounts, addAccount } = useContext(AccountsContext);
  const [walletAddress, setWalletAddress] = useState(null);
  const [role, setRole] = useState(undefined); // New state for role selection
  const navigate = useNavigate();

  const connectWallet = async () => {
    const provider = await detectEthereumProvider();

    if (provider) {
      try {
        await provider.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
        await provider.request({ method: 'eth_requestAccounts' });
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        console.log('Connected Wallet Address:', address);

        if (!Object.values(accounts).some(account => account.address === address)) {
          addAccount(`account${Object.keys(accounts).length + 1}`, address, role);
        }

        console.log('Accounts:', accounts, accounts.type);

        // Navigate to the appropriate page based on the selected role and pass the wallet address
        if (role === 'lender') {
          navigate('/lenderInfo', { state: { walletAddress: address } });
        } else if (role === 'issuer') {
          navigate('/issuer', { state: { walletAddress: address } });
        } else if (role === 'borrower') {
          navigate('/borrower', { state: { walletAddress: address } });
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      console.error('MetaMask is not installed');
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };

  return (
    <div className="app-container">
      <div className="background-container"></div>
      <div className="content-container">
        <img src={logo} alt="Logo" className="responsive-logo" />
        <h1 className="title">AIFT Aequitas Asset Platform</h1>
        <p className="description">
          This is an introduction about the platform and its features.
        </p>
        <div className="aift-select-container">
          <Select
            placeholder="Please Select Role"
            onChange={(value) => setRole(value)}
            value={role}
            style={{ width: '300px', marginBottom: '20px', height: '50px' }}
            dropdownStyle={{ textAlign: 'center' }}
            className="custom-select"
          >
            <Option value="issuer" style={{ textAlign: 'center', fontSize: '18px' }}>Issuer</Option>
            <Option value="lender" style={{ textAlign: 'center', fontSize: '18px' }}>Lender</Option>
            <Option value="borrower" style={{ textAlign: 'center', fontSize: '18px' }}>Borrower</Option>
          </Select>
        </div>

        {role && (
          <div className="role-container">
            <h3 className="selected-role">Selected Role: {role.charAt(0).toUpperCase() + role.slice(1)}</h3>
            {!walletAddress ? (
              <Button type="primary" onClick={connectWallet} style={{
                backgroundColor: '#6EA1EB', // 背景颜色为白色
                color: '#000', // 字体颜色为黑色
                borderRadius: '10px', // 设置按钮的圆角
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 添加阴影效果
                fontSize: '18px', // 增大按钮的字体
                height: '50px', // 增加按钮的高度
                marginTop: '10px' // 增加顶部外边距
              }}>
                Connect Wallet
              </Button>
            ) : (
              <p>Wallet connected.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiftRouter;
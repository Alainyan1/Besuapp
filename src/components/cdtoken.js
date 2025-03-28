import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { AccountsContext } from './AccountsContext';
import { Form, Input, Button, Select, Typography, Spin, Alert } from 'antd';
import { WalletOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/cdtoken.css';
import logo from '../images/aift.png';

const { Option } = Select;
const { Title, Text } = Typography;

const CDToken = () => {
  const { accounts, addAccount } = useContext(AccountsContext);
  const [clientAddress, setClientAddress] = useState('');
  const [termId, setTermId] = useState('');
  const [amount, setAmount] = useState(10000);
  const [contractAddress, setContractAddress] = useState(localStorage.getItem('contractAddress') || '');
  const [status, setStatus] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [selectedClientKey, setSelectedClientKey] = useState('');
  const [customClientAddress, setCustomClientAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle purchase details that might be passed from CdClient
  useEffect(() => {
    // Set wallet address from localStorage if available
    const storedWalletAddress = localStorage.getItem('walletAddress');
    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
    }
    
    // If purchase details were passed from CDClient
    if (location.state?.action === 'purchase' && location.state?.purchaseDetails) {
      const { 
        contractAddress: purchaseContractAddress,
        clientAddress: purchaseClientAddress,
        purchaseAmount,
        termId: purchaseTermId
      } = location.state.purchaseDetails;
      
      // Set the values from the purchase details
      setContractAddress(purchaseContractAddress);
      setClientAddress(purchaseClientAddress);
      setAmount(purchaseAmount);
      setTermId(purchaseTermId);
      
      // Try to find the client address in the accounts
      Object.entries(accounts).forEach(([key, value]) => {
        if (value.address === purchaseClientAddress) {
          setSelectedClientKey(key);
        }
      });
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
  }, [location.state, accounts, addAccount]);

  const handleIssueCertificate = async () => {
    if (!clientAddress || !termId || !amount || !contractAddress) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setStatus('processing');
    
    try {
      const provider = await detectEthereumProvider();
      if (provider) {
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        const signerAddress = await signer.getAddress();

        // Get the contract ABI
        const contractDataResponse = await axios.get('http://20.2.203.99:3002/api/cdcontractData');
        const { abi } = contractDataResponse.data;

        // Create contract instance
        const contract = new ethers.Contract(contractAddress, abi, signer);

        // Check if the signer is the trusted third party
        const ttpAddress = await contract.trustedThirdParty();
        if (signerAddress.toLowerCase() !== ttpAddress.toLowerCase()) {
          throw new Error('Only the Trusted Third Party can issue certificates');
        }

        const bytes32TermId = ethers.utils.formatBytes32String(termId);
        console.log('TermID:', termId);
        console.log('Bytes32 Term ID:', bytes32TermId);

        // Call the issueCertificate function
        console.log('Issuing certificate:', clientAddress, termId, amount);
        const tx = await contract.issueCertificate(
          clientAddress,
          bytes32TermId,
          amount,
          {
            gasLimit: 3000000,
            maxFeePerGas: ethers.utils.parseUnits('0', 'gwei'),
            maxPriorityFeePerGas: ethers.utils.parseUnits('0', 'gwei')
          }
        );

        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log('Certificate issued successfully:', receipt);
        setStatus('success');
        setTransactionHash(receipt.transactionHash);

        // Calculate maturity date based on term duration
        // const termInfo = await contract.depositTerms(termId);
        // const durationInSeconds = termInfo.duration.toNumber();
        // const maturityDate = new Date();
        // maturityDate.setSeconds(maturityDate.getSeconds() + durationInSeconds);

        // // Save the certificate data to the database
        // const certificateData = {
        //   contractAddress,
        //   clientAddress,
        //   clientKey: selectedClientKey,
        //   termId: ethers.utils.parseBytes32String(termId),
        //   amount,
        //   issueDate: new Date().toISOString().substring(0, 10),
        //   maturityDate: maturityDate.toISOString().substring(0, 10),
        //   transactionHash: receipt.transactionHash
        // };
        //await saveCertificateData(certificateData);
        setPurchaseComplete(true);
      } else {
        console.error('MetaMask is not installed');
        setStatus('error');
        alert('MetaMask is not installed. Please install it to use this feature.');
      }
    } catch (error) {
      console.error('Error issuing certificate:', error);
      setStatus('error');
      alert(`Transaction failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

//   const saveCertificateData = async (data) => {
//     try {
//       console.log('Saving certificate data to database:', data);
//       await axios.post('https://eurybia.xyz/api/test/saveCDCertificate', data);
//       console.log('Certificate data saved to database successfully');
//     } catch (error) {
//       console.error('Error saving certificate data to database:', error);
//     }
//   };

  const connectWallet = async () => {
    const provider = await detectEthereumProvider();

    if (provider) {
      try {
        console.log('MetaMask detected');
        await provider.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
        await provider.request({ method: 'eth_requestAccounts' });
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        localStorage.setItem('walletAddress', address);
        console.log('Connected Wallet Address:', address);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      console.error('MetaMask is not installed');
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
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
    addAccount(customKey, customValue, 'client');
    setter(customValue);
    setSelectedKey(customKey);
    localStorage.setItem(key, customValue);
    setter('');
  };

  const handleBack = () => {
    navigate('/token');
  };

  const renderPurchaseComplete = () => (
    <div className="success-container">
      <CheckCircleOutlined className="success-icon" />
      <Title level={2}>Certificate of Deposit Issued Successfully!</Title>
      <div className="success-details">
        <div className="success-detail-item">
          <Text strong>Client:</Text>
          <Text>{selectedClientKey || clientAddress}</Text>
        </div>
        <div className="success-detail-item">
          <Text strong>Amount:</Text>
          <Text>${amount}</Text>
        </div>
        <div className="success-detail-item">
          <Text strong>Transaction Hash:</Text>
          <Text className="hash">{transactionHash}</Text>
        </div>
      </div>
      <Button 
        type="primary"
        size="large"
        onClick={() => navigate('/cdclient')}
        className="view-cds-button"
      >
        Return to CD Marketplace
      </Button>
    </div>
  );

  const renderForm = () => (
    <div className="card-container cdtoken-card">
      <div className="title-container">
        <Title level={2}>Certificate of Deposit</Title>
      </div>
      <Form layout="vertical" onFinish={handleIssueCertificate} className="cdtoken-form">
        <Form.Item label="Client Address" required className="form-item">
          <Select
            value={selectedClientKey}
            onChange={handleSelectChange(setClientAddress, 'clientAddress', setSelectedClientKey)}
            className="custom-select"
          >
            <Option value="">Select a client</Option>
            {Object.entries(accounts).map(([key, value]) => (
              <Option key={key} value={key}>{key}</Option>
            ))}
            <Option value="custom">Enter custom address</Option>
          </Select>
          {selectedClientKey === 'custom' && (
            <div className="custom-address-container">
              <Input
                type="text"
                value={customClientAddress}
                onChange={handleCustomAddressChange(setCustomClientAddress)}
                placeholder="Enter address in format Name:address"
                className="custom-input"
              />
              <Button 
                type="button" 
                onClick={() => handleAddCustomAddress(setClientAddress, 'clientAddress', setSelectedClientKey, customClientAddress)}
                className="add-address-button"
              >
                Add Address
              </Button>
            </div>
          )}
          {selectedClientKey && selectedClientKey !== 'custom' && (
            <p className="address-display">Address: {accounts[selectedClientKey]?.address}</p>
          )}
        </Form.Item>
        
        <Form.Item label="Term ID" required className="form-item">
          <Input
            type="text"
            value={termId}
            onChange={handleInputChange(setTermId, 'termId')}
            className="custom-input"
            placeholder="Enter Term ID (e.g. 3MONTH, 6MONTH)"
          />
        </Form.Item>
        
        <Form.Item label="Amount" required className="form-item">
          <Input
            type="number"
            value={amount}
            onChange={handleInputChange(setAmount, 'amount')}
            className="custom-input"
          />
        </Form.Item>
        
        <Form.Item label="Contract Address" required className="form-item">
          <Input
            type="text"
            value={contractAddress}
            onChange={handleInputChange(setContractAddress, 'contractAddress')}
            className="custom-input"
          />
        </Form.Item>
        
        <Form.Item className="submit-container">
          <Button 
            type="primary" 
            htmlType="submit" 
            className="submit-button" 
            loading={loading}
          >
            Confirm
          </Button>
        </Form.Item>
      </Form>
      
      {status === 'success' && !purchaseComplete && (
        <Alert
          message="Certificate Issued Successfully"
          description={`Transaction Hash: ${transactionHash}`}
          type="success"
          showIcon
          className="status-alert"
        />
      )}
      
      {status === 'error' && (
        <Alert
          message="Transaction Failed"
          description="There was an error issuing the certificate. Please try again."
          type="error"
          showIcon
          className="status-alert"
        />
      )}
      
      {status === 'processing' && (
        <div className="processing-container">
          <Spin size="large" />
          <Text>Processing transaction...</Text>
        </div>
      )}
    </div>
  );

  return (
    <div className="cdtoken-page-container">
      <div className="top-bar"></div>
      <img src={logo} alt="Logo" className="responsive-logo" />

      <div className="button-container">
        <Button 
          onClick={connectWallet} 
          className="wallet-button" 
          icon={<WalletOutlined />}
        >
          {walletAddress ? `Connected: ${walletAddress.substring(0, 8) + '...'}` : 'Connect Wallet'}
        </Button>
        
       <Button 
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        className="back-button"
        >
            Back to Selection
        </Button>
      </div>
      
      <div className="main-content form-page-content">
        {purchaseComplete ? renderPurchaseComplete() : renderForm()}
      </div>
    </div>
  );
};

export default CDToken;
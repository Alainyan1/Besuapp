import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { ContractContext } from './ContractContext';
import { AccountsContext } from './AccountsContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import CDForm from './cdform';
import '../css/cddeployment.css';
import logo from '../images/aift.png';

const CDDeployment = () => {
  const { setContractAddress } = useContext(ContractContext);
  const { clearAccounts, addAccount } = useContext(AccountsContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [walletAddress, setWalletAddress] = useState(location.state.walletAddress || null);

  const [cdData, setCDData] = useState({
    name: "Certificate of Deposit",
    symbol: "CD",
    initialSupply: 100000000,
    // bankAddress: "Fubon:0xf17f52151EbEF6C7334FAD080c5704D77216b732",
    bankAddress: walletAddress ? `Fubon:${walletAddress}` : "Fubon:0xf17f52151EbEF6C7334FAD080c5704D77216b732",
    // trustedThirdParty: "Fubon:0xf17f52151EbEF6C7334FAD080c5704D77216b732",
    trustedThirdParty: walletAddress ? `Fubon:${walletAddress}` : "Fubon:0xf17f52151EbEF6C7334FAD080c5704D77216b732",
    ancillaryInfo: "Certificate of Deposit\nEarly Withdrawal: Demand rate applies",
    depositTerms: [
      {
        termId: "1MINTEST", // Simplified termId
        duration: 60, // 1 min in seconds
        fixedRate: 100000, // 100% (stored as basis points)
        demandRate: 1000, // 10% (stored as basis points)
        isActive: true
      },
    ]
  });

  // Get wallet address from location state when component mounts
  useEffect(() => {
    if (location.state && location.state.walletAddress) {
      const incomingAddress = location.state.walletAddress;
      setWalletAddress(incomingAddress);
      console.log('Using wallet address from previous page:', incomingAddress);
      // console.log('Wallet address:', walletAddress);
      // Update the cdData with the incoming wallet address
      setCDData(prevData => ({
        ...prevData,
        bankAddress: `Fubon:${incomingAddress}`,
        trustedThirdParty: `Fubon:${incomingAddress}`
      }));
    } else {
      console.warn('No wallet address provided. Redirecting to platform page');
      // Optional: redirect to platform page if no wallet is connected
      // navigate('/cdplatform');
    }
  }, [location.state, navigate]);

  // Helper function to safely convert string to bytes32
  const safeBytes32 = (str) => {
    // Ensure string is no more than 31 bytes (characters)
    const truncated = str.slice(0, 31);
    return ethers.utils.formatBytes32String(truncated);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const [field, index] = name.split('[');
    if (index) {
      const idx = parseInt(index.replace(']', ''), 10);
      setCDData((prevState) => ({
        ...prevState,
        [field]: prevState[field].map((item, i) => (i === idx ? value : item))
      }));
    } else {
      setCDData((prevState) => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  // Handle changes to deposit terms
  const handleDepositTermChange = (index, field, value) => {
    setCDData(prevState => {
      const updatedTerms = [...prevState.depositTerms];
      updatedTerms[index] = {
        ...updatedTerms[index],
        [field]: value
      };
      return {
        ...prevState,
        depositTerms: updatedTerms
      };
    });
  };

  const parseKeyValue = (input) => {
    if (!input || !input.includes(':')) return { key: '', value: input };
    const [key, value] = input.split(':');
    return { key, value };
  };

  const saveToDatabase = async (data) => {
    try {
      console.log('Saving CD data to database:', data);
      await axios.post('https://eurybia.xyz/api/test/saveCDDeployment', data);
      console.log('CD data saved to database successfully');
    } catch (error) {
      console.error('Error saving CD data to database:', error);
    }
  };

  const handleSubmit = async (values) => {
    if (!walletAddress) {
      alert('No wallet connected. Please go back to the platform page and connect your wallet.');
      return;
    }

    navigate('/cdstatus', { state: { status: 'deploying' } });

    try {
      console.log('CD Data:', cdData);
      const formattedCDData = {
        name: cdData.name,
        symbol: cdData.symbol,
        initialSupply: parseFloat(cdData.initialSupply),
        bankAddress: parseKeyValue(cdData.bankAddress).value,
        trustedThirdParty: parseKeyValue(cdData.bankAddress).value,
        ancillaryInfo: cdData.ancillaryInfo,
        depositTerms: cdData.depositTerms.map(term => ({
          ...term,
          termId: safeBytes32(term.termId)
        }))
      };
      console.log('Formatted CD Data:', formattedCDData);

      // Get contract bytecode and ABI
      const contractDataResponse = await axios.get('http://20.2.203.99:3002/api/cdcontractData');
      const { abi, bytecode } = contractDataResponse.data;

      const provider = await detectEthereumProvider();
      if (provider) {
        await provider.request({ method: 'eth_requestAccounts' });
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        // Use the signer address that should match our stored walletAddress
        const deployerAddress = await signer.getAddress();
        
        if (deployerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
          console.warn('Connected wallet address does not match the address from previous page');
        }

        // Deploy the contract with only the trusted third party address as constructor parameter
        const factory = new ethers.ContractFactory(abi, bytecode, signer);
        const contract = await factory.deploy(
          formattedCDData.trustedThirdParty
        );

        await contract.deployed();
        console.log('CD Contract deployed at address:', contract.address);
        setContractAddress(contract.address);
        localStorage.setItem('contractAddress', contract.address);

        // After deployment, create deposit terms
        for (const term of formattedCDData.depositTerms) {
          const tx = await contract.createDepositTerm(
            term.termId,
            term.duration,
            term.fixedRate,
            term.demandRate
          );
          await tx.wait();
          console.log(`Deposit term created`);
        }

        // Set up accounts for UI reference
        clearAccounts();
        addAccount('deployer', deployerAddress, 'deployer');
        const { key: bankKey, value: bankValue } = parseKeyValue(cdData.bankAddress);
        addAccount(bankKey, bankValue, 'bank');
        
        const { key: ttpKey, value: ttpValue } = parseKeyValue(cdData.trustedThirdParty);
        addAccount(ttpKey, ttpValue, 'trustedThirdParty');
        
        // Save data to database
        const deploymentData = {
          contractAddress: contract.address,
          deployerAddress,
          assetType: 'CD',
          cdType: 'Fixed', 
          bankName: parseKeyValue(cdData.bankAddress).key,
          bankAddress: formattedCDData.bankAddress,
          ttpName: parseKeyValue(cdData.trustedThirdParty).key,
          ttpAddress: formattedCDData.trustedThirdParty,
          cdName: cdData.name,
          symbol: cdData.symbol,
          initialSupply: cdData.initialSupply,
          depositTerms: JSON.stringify(cdData.depositTerms),
          ancillaryInfo: cdData.ancillaryInfo,
          issue_date: new Date().toISOString().substring(0, 10)
        };
        await saveToDatabase(deploymentData);

        navigate('/cdstatus', { state: { status: 'success', address: contract.address } });
        setContractAddress(contract.address);
      } else {
        console.error('MetaMask is not installed');
        alert('MetaMask is not installed. Please install it to use this feature.');
        navigate('/cdstatus', { state: { status: 'error' } });
      }
    } catch (error) {
      console.error('Error deploying CD:', error);
      navigate('/cdstatus', { state: { status: 'error' } });
    }
  };

  const handleBack = () => {
    navigate('/cdbank', { state: { walletAddress } });
  };

  const handleBankName = (address) => {
    if (address === '0xf17f52151EbEF6C7334FAD080c5704D77216b732') { 
      return 'Fubon';
    } else {
      return 'Bank';
    }
  }

  return (
    <div className="cdbank-page-container" style={{ padding: '20px'}}>
      <div className="cd-top-bar"></div>
      <img src={logo} alt="Logo" style={{ position: 'absolute', top: '20px', left: '20px', height: '80px' }} />
      <Typography.Title level={1} style={{ color: '#000', margin: '10px', textAlign: 'center', minHeight: '8vh', fontSize: '45px' }}>Certificate of Deposit Configuration</Typography.Title>
      
      {/* Back button */}
      <Button 
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        style={{
          backgroundColor: '#fff',
          color: '#000',
          borderRadius: '10px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          fontSize: '16px',
          height: '50px',
          position: 'absolute', 
          top: 10, 
          right: 10
        }}
      >
        Back to Selection
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
      
      {/* Directly render the CDForm with isVariable set to false (Fixed) */}
      <CDForm 
        cdData={cdData} 
        handleInputChange={handleInputChange}
        handleDepositTermChange={handleDepositTermChange}
        handleSubmit={handleSubmit} 
        isVariable={false} 
      />
    </div>
  );
};

export default CDDeployment;
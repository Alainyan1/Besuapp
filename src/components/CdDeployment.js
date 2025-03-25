import React, { useState, useContext } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { ContractContext } from './ContractContext';
import { AccountsContext } from './AccountsContext';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Select, Typography, Input } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import CDForm from './cdform';
import '../css/cddeployment.css';
import logo from '../images/aift.png'; // Make sure to use your actual logo path

const { Option } = Select;

const CDDeployment = () => {
  const [cdData, setCDData] = useState({
    name: "Certificate of Deposit",
    symbol: "CD",
    initialSupply: 100000000,
    bankAddress: "Fubon:0xf17f52151EbEF6C7334FAD080c5704D77216b732",
    trustedThirdParty: "Fubon:0xf17f52151EbEF6C7334FAD080c5704D77216b732",
    ancillaryInfo: "Certificate of Deposit\nEarly Withdrawal: Demand rate applies",
    depositTerms: [
      {
        termId: "5MINTEST", // Simplified termId
        duration: 300, // 5 min in seconds
        fixedRate: 375, // 3.75% (stored as basis points)
        demandRate: 100, // 1% (stored as basis points)
        isActive: true
      },
    ]
    // clients field removed
  });
  const [walletAddress, setWalletAddress] = useState(null);
  const [cdType, setCdType] = useState('Fixed');
  const { setContractAddress } = useContext(ContractContext);
  const { clearAccounts, addAccount } = useContext(AccountsContext);
  const navigate = useNavigate();

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
    navigate('/cdstatus', { state: { status: 'deploying' } });

    try {
      console.log('CD Data:', cdData);
      const formattedCDData = {
        name: cdData.name,
        symbol: cdData.symbol,
        initialSupply: parseFloat(cdData.initialSupply),
        bankAddress: parseKeyValue(cdData.bankAddress).value,
        // trustedThirdParty: parseKeyValue(cdData.trustedThirdParty).value,
        trustedThirdParty: parseKeyValue(cdData.bankAddress).value,
        ancillaryInfo: cdData.ancillaryInfo,
        depositTerms: cdData.depositTerms.map(term => ({
          ...term,
          // Safely convert termId to bytes32, ensuring it's not too long
          termId: safeBytes32(term.termId)
        }))
        // clients field removed
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
        const deployerAddress = await signer.getAddress();

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
        // Client-related code removed
        const { key: bankKey, value: bankValue } = parseKeyValue(cdData.bankAddress);
        addAccount(bankKey, bankValue, 'bank');
        
        const { key: ttpKey, value: ttpValue } = parseKeyValue(cdData.trustedThirdParty);
        addAccount(ttpKey, ttpValue, 'trustedThirdParty');

        
        // Save data to database
        const deploymentData = {
          contractAddress: contract.address,
          deployerAddress,
          assetType: 'CD',
          cdType: cdType,
          bankName: parseKeyValue(cdData.bankAddress).key,
          bankAddress: formattedCDData.bankAddress,
          ttpName: parseKeyValue(cdData.trustedThirdParty).key,
          ttpAddress: formattedCDData.trustedThirdParty,
          cdName: cdData.name,
          symbol: cdData.symbol,
          initialSupply: cdData.initialSupply,
          depositTerms: JSON.stringify(cdData.depositTerms),
          // Client-related fields removed
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
        console.log('Connected Wallet Address:', address);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      console.error('MetaMask is not installed');
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };

  const renderForm = () => {
    switch (cdType) {
      case 'Variable':
        return <CDForm 
          cdData={cdData} 
          handleInputChange={handleInputChange} 
          handleDepositTermChange={handleDepositTermChange}
          handleSubmit={handleSubmit} 
          isVariable={true} 
        />;
      case 'Fixed':
      default:
        return <CDForm 
          cdData={cdData} 
          handleInputChange={handleInputChange}
          handleDepositTermChange={handleDepositTermChange}
          handleSubmit={handleSubmit} 
          isVariable={false} 
        />;
    }
  };

  return (
    <div className="cdbank-page-container" style={{ padding: '20px'}}>
      <img src={logo} alt="Logo" style={{ position: 'absolute', top: '20px', left: '20px', height: '80px' }} />
      <Typography.Title level={1} style={{ color: '#000', margin: '10px', textAlign: 'center', minHeight: '8vh', fontSize: '45px' }}>Certificate of Deposit Configuration</Typography.Title>
      <Button onClick={connectWallet} style={{
        backgroundColor: '#fff',
        color: '#000',
        borderRadius: '10px',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        fontSize: '18px',
        height: '50px',
        position: 'absolute', top: 10, right: 10
      }} icon={<WalletOutlined />}>
        {walletAddress ? `Connected: ${walletAddress}` : 'Connect Wallet'}
      </Button>
      <div>
        <Form layout="horizontal" style={{ margin: '0 auto' }}>
          <Form.Item label={<label style={{ fontSize: "18px" }}>CD Type</label>} name="cdType" required labelCol={{ span: 9 }} wrapperCol={{ span: 12 }}>
            <Select placeholder="Fixed" value={cdType} onChange={(value) => setCdType(value)} 
            style={{ width: '200px', color: '#fff' }}
            className="cd-custom-select">
              <Option value="Fixed">Fixed</Option>
              <Option value="Variable">Variable</Option>
            </Select>
          </Form.Item>
        </Form>
      </div>
      <div style={{ marginTop: '0px' }}></div>
      {renderForm()}
    </div>
  );
};

export default CDDeployment;
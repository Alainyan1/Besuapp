import React, { useState, useContext } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { ContractContext } from './ContractContext';
import { AccountsContext } from './AccountsContext';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Select, Typography } from 'antd';
import { WalletOutlined } from '@ant-design/icons'; // Import the Wallet icon
import LoanForm from './LoanForm';
import BondForm from './BondForm';
import '../css/loanDeployment.css';
import logo from '../images/cspro.png';

const { Option } = Select;


const LoanDeployment = () => {
  const [loanData, setLoanData] = useState({
    name: "Fosun",
    symbol: "FOS",
    initialSupply: 10000000000,
    interestRate: 4.5,
    escrow: "Jetco:0x8adD025FBd37A46c5af45798cc94ec4e97A49698",
    ancillaryInfo: "Loan Term: 3 years (36 months)\nRepayment: Bullet at maturity\nInterest Period: 1 month\nFinal Maturity: 3 years",
    buyers: ["Fubon:0xf17f52151EbEF6C7334FAD080c5704D77216b732", "CCA(Asia):0x627306090abaB3A6e1400e9345bC60c78a8BEf57"],
    amounts: [4000000000, 6000000000]
  });
  const [walletAddress, setWalletAddress] = useState(null);
  const [assetType, setAssetType] = useState('loan'); // New state for asset type
  const { setContractAddress } = useContext(ContractContext);
  const { clearAccounts, addAccount } = useContext(AccountsContext);
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const [field, index] = name.split('[');
    if (index) {
      const idx = parseInt(index.replace(']', ''), 10);
      setLoanData((prevState) => ({
        ...prevState,
        [field]: prevState[field].map((item, i) => (i === idx ? value : item))
      }));
    } else {
      setLoanData((prevState) => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const parseKeyValue = (input) => {
    const [key, value] = input.split(':');
    return { key, value };
  };

  const saveToDatabase = async (data) => {
    try {
      console.log('Saving data to database:', data);
      await axios.post('https://eurybia.xyz/api/test/saveDeployment', data);
      console.log('Data saved to database successfully');
    } catch (error) {
      console.error('Error saving data to database:', error);
    }
  };

  const handleSubmit = async (values) => {
    navigate('/deployment-status', { state: { status: 'deploying' } });

    try {
      console.log('Loan Data:', loanData);
      const formattedLoanData = {
        name: loanData.name,
        symbol: loanData.symbol,
        initialSupply: parseFloat(loanData.initialSupply),
        interestRate: parseFloat(loanData.interestRate),
        escrow: parseKeyValue(loanData.escrow).value,
        ancillaryInfo: loanData.ancillaryInfo,
        buyers: loanData.buyers.map(buyer => parseKeyValue(buyer).value),
        amounts: loanData.amounts.filter(amount => amount !== 0)
      };
      console.log('Formatted Loan Data:', formattedLoanData);

      const contractDataResponse = await axios.get('http://20.2.203.99:3002/api/contractData');
      const { abi, bytecode } = contractDataResponse.data;
      // console.log('Contract data:', abi, bytecode);

      const provider = await detectEthereumProvider();
      if (provider) {
        await provider.request({ method: 'eth_requestAccounts' });
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        const deployerAddress = await signer.getAddress();

        const factory = new ethers.ContractFactory(abi, bytecode, signer);
        const contract = await factory.deploy(
          formattedLoanData.name,
          formattedLoanData.symbol,
          formattedLoanData.initialSupply,
          formattedLoanData.escrow,
          formattedLoanData.buyers,
          formattedLoanData.amounts,
          formattedLoanData.interestRate * 1000,
          formattedLoanData.ancillaryInfo
        );

        await contract.deployed();
        console.log('Contract deployed at address:', contract.address);
        setContractAddress(contract.address);
        localStorage.setItem('contractAddress', contract.address);

        clearAccounts();
        addAccount('deployer', deployerAddress, 'deployer');
        loanData.buyers.forEach((buyer) => {
          const { key, value } = parseKeyValue(buyer);
          addAccount(key, value, 'lender');
        });
        const { key: escrowKey, value: escrowValue } = parseKeyValue(loanData.escrow);
        addAccount(escrowKey, escrowValue, 'escrow');

        let due_time = new Date();
        due_time.setFullYear(due_time.getFullYear() + 3);
        // Save data to database
        const deploymentData = {
          contractAddress: contract.address,
          deployerAddress,
          assetType: assetType,
          companyName: loanData.name,
          symbol: loanData.symbol,
          initialSupply: loanData.initialSupply,
          interestRate: loanData.interestRate,
          lender1Address: formattedLoanData.buyers[0],
          lender1Key: parseKeyValue(loanData.buyers[0]).key,
          lender1amount: loanData.amounts[0],
          lender2Address: formattedLoanData.buyers[1],
          lender2Key: parseKeyValue(loanData.buyers[1]).key,
          lender2amount: loanData.amounts[1],
          escrowAddress: formattedLoanData.escrow,
          escrowKey: parseKeyValue(loanData.escrow).key,
          ancillaryInfo: loanData.ancillaryInfo,
          time_stamp: new Date().toISOString().replace(/T/, ' ').substring(0, 19),
          due_time: due_time.toISOString().replace(/T/, ' ').substring(0, 19)
        };
        await saveToDatabase(deploymentData);

        navigate('/deployment-status', { state: { status: 'success', address: contract.address } });
      } else {
        console.error('MetaMask is not installed');
        alert('MetaMask is not installed. Please install it to use this feature.');
        navigate('/deployment-status', { state: { status: 'error' } });
      }
    } catch (error) {
      console.error('Error deploying loan:', error);
      navigate('/deployment-status', { state: { status: 'error' } });
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
    switch (assetType) {
      case 'loan':
        return <LoanForm loanData={loanData} handleInputChange={handleInputChange} handleSubmit={handleSubmit} />;
      case 'bond':
        //return <BondForm loanData={loanData} handleInputChange={handleInputChange} handleSubmit={handleSubmit} />;
        return <LoanForm loanData={loanData} handleInputChange={handleInputChange} handleSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div className="cspro-page-container" style={{ padding: '20px'}}>
      <img src={logo} alt="Logo" style={{ position: 'absolute', top: '20px', left: '20px', height: '80px' }} />
      <Typography.Title level={1} style={{ color: '#000', margin: '10px', textAlign: 'center', minHeight: '8vh', fontSize: '45px' }}>Syndicated Loan Configuration</Typography.Title>
      <Button onClick={connectWallet} style={{
        backgroundColor: '#fff', // 背景颜色为白色
        color: '#000', // 字体颜色为黑色
        borderRadius: '10px', // 设置按钮的圆角
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 添加阴影效果
        fontSize: '18px', // 增大按钮的字体
        height: '50px', // 增加按钮的高度
        position: 'absolute', top: 10, right: 10
      }} icon={<WalletOutlined />}>
        {walletAddress ? `Connected: ${walletAddress}` : 'Connect Wallet'}
      </Button>
      <div>
        <Form layout="horizontal" style={{ margin: '0 auto' }}>
          <Form.Item label={<label style={{ fontSize: "18px" }}>Asset Type</label>} name="assetType" required labelCol={{ span: 9 }} wrapperCol={{ span: 12 }}>
            <Select placeholder="Loan" value={assetType} onChange={(value) => setAssetType(value)} 
            style={{ width: '200px', color: '#fff' }}
            className="loan-custom-select">
              <Option value="loan">Loan</Option>
              <Option value="bond">Bond</Option>
              {/* Add more asset types as needed */}
            </Select>
          </Form.Item>
        </Form>
      </div>
      <div style={{ marginTop: '0px' }}></div>
      {renderForm()}
    </div>
  );
};

export default LoanDeployment;
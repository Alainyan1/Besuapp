import React, { useState, useContext } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { ContractContext } from './ContractContext';
import { AccountsContext } from './AccountsContext';
import { useNavigate } from 'react-router-dom';

const LoanDeployment = () => {
  const [loanData, setLoanData] = useState({
    name: "Fosun",
    symbol: "FOS",
    initialSupply: 10000000000,
    interestRate: 4.5, // 确保 interestRate 是字符串
    escrow: "escrow:0x8adD025FBd37A46c5af45798cc94ec4e97A49698",
    ancillaryInfo: "Loan Term: 3 years (36 months)\nRepayment: Bullet at maturity\nInterest Period: 1 month\nFinal Maturity: 3 years",
    buyers: ["Fubon:0xf17f52151EbEF6C7334FAD080c5704D77216b732", "lender2:0x627306090abaB3A6e1400e9345bC60c78a8BEf57"],
    amounts: [4000000000, 6000000000]
  });
  const [walletAddress, setWalletAddress] = useState(null); // 用于存储钱包地址
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    navigate('/deployment-status', { state: { status: 'deploying' } });

    try {
      console.log('Loan Data:', loanData);
      // 将数组形式的数据转换为JSON对象所需的格式
      const formattedLoanData = {
        name: loanData.name,
        symbol: loanData.symbol,
        initialSupply: parseFloat(loanData.initialSupply),
        interestRate: parseFloat(loanData.interestRate), // 确保 interestRate 是数字
        escrow: parseKeyValue(loanData.escrow).value, // 使用键值对中的值
        ancillaryInfo: loanData.ancillaryInfo,
        buyers: loanData.buyers.map(buyer => parseKeyValue(buyer).value), // 使用键值对中的值
        amounts: loanData.amounts.filter(amount => amount !== 0)
      };
      console.log('Formatted Loan Data:', formattedLoanData); // 添加日志

      // 获取合约的 ABI 和 bytecode
      const contractDataResponse = await axios.get('http://20.2.203.99:3002/api/contractData');
      const { abi, bytecode } = contractDataResponse.data;

      // 连接 MetaMask 钱包
      const provider = await detectEthereumProvider();
      if (provider) {
        await provider.request({ method: 'eth_requestAccounts' });
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        const deployerAddress = await signer.getAddress();

        // 部署合约
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
        setContractAddress(contract.address); // 设置合约地址

        // 清空并添加新的 accounts
        clearAccounts();
        addAccount('deployer', deployerAddress, 'deployer');
        loanData.buyers.forEach((buyer) => {
          const { key, value } = parseKeyValue(buyer);
          addAccount(key, value, 'lender');
        });
        const { key: escrowKey, value: escrowValue } = parseKeyValue(loanData.escrow);
        addAccount(escrowKey, escrowValue, 'escrow');

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
        // 每次都请求用户连接他们的 MetaMask 钱包
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

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Syndicated Loan Configuration</h1>
      <button onClick={connectWallet} style={{ position: 'absolute', top: 10, right: 10 }}>
        {walletAddress ? `Connected: ${walletAddress}` : 'Connect Wallet'}
      </button>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Company Name</label>
        <input type="text" id="name" name="name" value={loanData.name} onChange={handleInputChange} required />
  
        <label htmlFor="symbol">Symbol</label>
        <input type="text" id="symbol" name="symbol" value={loanData.symbol} onChange={handleInputChange} required />
  
        <label htmlFor="initialSupply">Initial Supply</label>
        <input type="number" id="initialSupply" name="initialSupply" value={loanData.initialSupply} onChange={handleInputChange} required />
  
        <label htmlFor="interestRate">Interest Rate</label>
        <input type="number" id="interestRate" name="interestRate" value={loanData.interestRate} onChange={handleInputChange} required 
        style={{ width: '100px' }}
        />
        <span style={{ marginLeft: '10px' }}>%</span>

        <table>
          <thead>
            <tr>
              <th>Lenders</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input type="text" value={loanData.buyers[0]} onChange={(e) => handleInputChange(e)} name="buyers[0]" required /></td>
              <td><input type="number" value={loanData.amounts[0]} onChange={(e) => handleInputChange(e)} name="amounts[0]" required /></td>
            </tr>
            <tr>
              <td><input type="text" value={loanData.buyers[1]} onChange={(e) => handleInputChange(e)} name="buyers[1]" required /></td>
              <td><input type="number" value={loanData.amounts[1]} onChange={(e) => handleInputChange(e)} name="amounts[1]" required /></td>
            </tr>
          </tbody>
        </table>

        <label htmlFor="escrow">Escrow Account</label>
        <input type="text" id="escrow" name="escrow" value={loanData.escrow} onChange={handleInputChange} required />
  
        <label htmlFor="ancillaryInfo">Ancillary Information</label>
        <textarea id="ancillaryInfo" name="ancillaryInfo" rows="4" cols="50" value={loanData.ancillaryInfo} onChange={handleInputChange} required />
  
        <button type="submit">Deploy</button>
      </form>
    </div>
  );
};

export default LoanDeployment;
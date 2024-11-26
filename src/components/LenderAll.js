import React, { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { Layout, Button, Typography, Table, Modal, Input } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ethers } from 'ethers';
import '../css/LenderAll.css';
import logo from '../images/aift.png';

const { Content } = Layout;
const { Title } = Typography;

function LenderAll() {
  const [assetsData, setAssetsData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [transferAddress, setTransferAddress] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null); // 用于存储钱包地址
  const [name, setName] = useState(null); // 用于存储名字
  const [provider, setProvider] = useState(null); // 用于存储provider
  const navigate = useNavigate();
  const location = useLocation();
  const initialWalletAddress = location.state?.walletAddress || 'No wallet address provided';
  const initialProvider = location.state?.provider || null;

  useEffect(() => {
    async function fetchData(walletAddress) {
      try {
        const requestConfig = {
          params: { lenderAddress: walletAddress }
        };
        const response = await axios.get('https://eurybia.xyz/api/test/lendersInfo', requestConfig);
        const response_name = await axios.get('https://eurybia.xyz/api/test/getAccountByAddress', requestConfig);
        const data = await response.data;
        const data_name = await response_name.data[0]['addresskey'];       
        console.log(data);
        console.log(data_name);
        setAssetsData(data);
        setName(data_name);
      } catch (error) {
        console.error('Error fetching assets:', error);
      }
    }

    if (initialWalletAddress !== 'No wallet address provided') {
      fetchData(initialWalletAddress);
    }
  }, [walletAddress]);

  const handleTransferAll = async (record) => {
    const detectedProvider = await detectEthereumProvider();

    if (detectedProvider) {
      try {
        console.log('MetaMask detected');
        await detectedProvider.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
        await detectedProvider.request({ method: 'eth_requestAccounts' });
        const ethersProvider = new ethers.providers.Web3Provider(detectedProvider);
        const signer = ethersProvider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        setProvider(detectedProvider);
        console.log('Connected Wallet Address:', address);

        // Set the selected record and show the modal
        setSelectedRecord({ contractAddress: record.ContractAddress });
        setIsModalVisible(true);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      console.error('MetaMask is not installed');
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };

  const handleConfirmTransfer = async () => {
    const address = parseKeyValue(transferAddress);
    if (!ethers.utils.isAddress(address.value)) {
      alert('Invalid input format. Please use a valid Ethereum address.');
      return;
    }

    try {
      if (provider) {
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        const fromAddress = await signer.getAddress();

        // 获取合约的 ABI 和 bytecode
        const contractDataResponse = await axios.get('http://20.2.203.99:3002/api/contractData');
        const { abi } = contractDataResponse.data;
        console.log('ABI:', abi);
        // 创建合约实例
        console.log('selectedRecord:', selectedRecord.contractAddress);
        const contract = new ethers.Contract(selectedRecord.contractAddress, abi, signer);
        console.log('to address:', address.value);
        console.log('from address:', fromAddress);
        let tx = await contract.transferAllData(fromAddress, address.value, ethers.utils.formatBytes32String("transferAllData"), {
          gasLimit: 3000000,
          maxFeePerGas: ethers.utils.parseUnits('0', 'gwei'),
          maxPriorityFeePerGas: ethers.utils.parseUnits('0', 'gwei')
        });
        const receipt = await tx.wait();
        console.log('Transaction successful:', receipt);
        alert('Transaction successful!');
        setIsModalVisible(false);
        setTransferAddress('');
      } else {
        console.error('MetaMask is not installed');
        alert('MetaMask is not installed. Please install it to use this feature.');
      }
    } catch (error) {
      console.error('Error during transaction:', error);
      alert('Transaction failed. Please try again.');
    }
  };

  const formatData = (data) => {
    if (data > 1000000000) {
      return `${(data / 1000000000).toFixed(2)}B`;
    } else if (data > 1000000) {
      return `${(data / 1000000).toFixed(2)}M`;
    }
    return data;
  }

  const parseKeyValue = (input) => {
    const [key, value] = input.split(':');
    return { key, value };
  };

  // Filter assetsData to only include items where Type is 'loan'
  const filteredAssetsData = assetsData.filter(asset => asset.Type === 'Loan');

  const columns = [
    {
      title: 'Borrower',
      dataIndex: 'company_name',
      key: 'company_name',
      align: 'center',
    },
    // {
    //   title: 'Type',
    //   dataIndex: 'Type',
    //   key: 'Type',
    //   align: 'center',
    // },
    {
      title: 'Smart Contract Address',
      render: (text, record) => (
        <div>
          <div>{record.asset_name}</div>
          <div style={{ fontSize: '12px', color: 'gray' }}>{record.ContractAddress}</div>
        </div>
      ),
    },
    {
      title: 'Allocated',
      dataIndex: 'allocated',
      key: 'allocated',
      align: 'center',
      render: (text) => formatData(text),
    },
    {
      title: 'Lensed',
      dataIndex: 'lensed',
      key: 'lensed',
      align: 'center',
      render: (text) => formatData(text),
    },
    {
      title: 'Principal',
      dataIndex: 'principal',
      key: 'principal',
      align: 'center',
      render: (text) => formatData(text),
    },
    {
      title: 'Interest',
      dataIndex: 'interest',
      key: 'interest',
      align: 'center',
      render: (text) => formatData(text),
    },
    {
      title: 'Drawdown History',
      key: 'viewDetails',
      align: 'center',
      render: (text, record) => (
        <Button type="primary" onClick={() => navigate('/lender-details', { state: { contractAddress: record.ContractAddress, walletAddress: initialWalletAddress, assetName: record.asset_name } })} 
        style={{
          backgroundColor: '#6EA1EB',
          color: '#000', // 字体颜色为黑色
          borderRadius: '10px', // 设置按钮的圆角
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 添加阴影效果
          fontSize: '18px', // 墛大按钮的字体>
          height: '40px', // 墛大按钮的高度
          width: '120px', // 墛大按钮的宽度
        }}>
          View Details
        </Button>
      ),
    },
    {
      title: 'Drawdown',
      key: 'repay',
      align: 'center',
      render: (text, record) => {
        const isDrawdownDisabled = record.lensed === record.allocated;
        return (
          <Button type="primary"
            onClick={() => navigate('/jetco', { state: { contractAddress: record.ContractAddress } })}
            style={{
              backgroundColor: isDrawdownDisabled ? '#D3D3D3' : '#6EA1EB', // Gray if disabled, otherwise blue
              color: '#000', // 字体颜色为黑色
              borderRadius: '10px', // 设置按钮的圆角
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 添加阴影效果
              fontSize: '18px', // 墛大按钮的字体>
              height: '40px', // 墛大按钮的高度
              width: '120px', // 墛大按钮的宽度
              cursor: isDrawdownDisabled ? 'not-allowed' : 'pointer', // Change cursor if disabled
            }}
            disabled={isDrawdownDisabled} // Disable button if condition is met
          >
            Drawdown
          </Button>
        );
      },
    },
    {
      title: 'Novate',
      key: 'transferAll',
      align: 'center',
      render: (text, record) => (
        <Button type="primary" onClick={() => handleTransferAll(record)} style={{
          backgroundColor: '#6EA1EB',
          color: '#000', // 字体颜色为黑色
          borderRadius: '10px', // 设置按钮的圆角
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 添加阴影效果
          fontSize: '18px', // 墛大按钮的字体>
          height: '40px', // 墛大按钮的高度
          width: '120px', // 墛大按钮的宽度
        }}>
          Novate
        </Button>
      ),
    },
  ];

  return (
    <Layout className="lender-all-layout">
      <img src={logo} alt="Logo" className="aiftresponsive-logo" />
      <Content style={{ padding: '0 50px' }}>
        <Title level={2} className="lender-all-title">Syndicated Loan Dashboard (Lender)</Title>
        <p className="wallet-address">{name}: {initialWalletAddress}</p>
        <Table
          columns={columns}
          dataSource={filteredAssetsData}
          rowKey="key"
          bordered
          pagination={{ pageSize: 8 }}
          className="assets-table"
        />
        <Modal
          title="Transfer All"
          visible={isModalVisible}
          onOk={handleConfirmTransfer}
          onCancel={() => setIsModalVisible(false)}
        >
          <Input
            placeholder="Enter address"
            value={transferAddress}
            onChange={(e) => setTransferAddress(e.target.value)}
          />
        </Modal>
      </Content>
    </Layout>
  );
}

export default LenderAll;
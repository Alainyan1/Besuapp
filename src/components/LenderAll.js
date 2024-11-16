import React, { useState, useEffect } from 'react';
import { Layout, Button, Typography, Table, Modal, Input } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import '../css/LenderAll.css';
import logo from '../images/aift.png';

const { Content } = Layout;
const { Title } = Typography;

function LenderAll() {
  const [assetsData, setAssetsData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [transferAddress, setTransferAddress] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const walletAddress = location.state?.walletAddress || 'No wallet address provided';

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('https://eurybia.xyz/api/test/loan');
        const data = await response.data;
        
        console.log(data);
        setAssetsData(data);
      } catch (error) {
        console.error('Error fetching assets:', error);
      }
    }

    fetchData();
  }, []);

  const handleTransferAll = async () => {
    if (!ethers.utils.isAddress(transferAddress)) {
      alert('Invalid input format. Please use a valid Ethereum address.');
      return;
    }

    try {
      const provider = await detectEthereumProvider();
      if (provider) {
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        const fromAddress = await signer.getAddress();

        // 获取合约的 ABI 和 bytecode
        const contractDataResponse = await axios.get('http://20.2.203.99:3002/api/contractData');
        const { abi } = contractDataResponse.data;

        // 创建合约实例
        const contract = new ethers.Contract(selectedRecord.contractAddress, abi, signer);
        console.log('to address:', transferAddress);
        console.log('from address:', fromAddress);
        let tx = await contract.transferAllData(fromAddress, transferAddress, ethers.utils.formatBytes32String("transferAllData"), {
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

  const columns = [
    {
      title: 'Asset Name',
      dataIndex: 'asset_name',
      key: 'asset_name',
      align: 'center',
    },
    {
      title: 'Allocated',
      dataIndex: 'allocated',
      key: 'allocated',
      align: 'center',
    },
    {
      title: 'Lensed',
      dataIndex: 'lensed',
      key: 'lensed',
      align: 'center',
    },
    {
      title: 'Principal',
      dataIndex: 'principal',
      key: 'principal',
      align: 'center',
    },
    {
      title: 'Interest',
      dataIndex: 'interest',
      key: 'interest',
      align: 'center',
    },
    {
      title: 'View Details',
      key: 'viewDetails',
      align: 'center',
      render: (text, record) => (
        <Button type="primary" onClick={() => navigate(`/asset/${record.key}`)}style={{
          backgroundColor: '#6EA1EB', // 背景颜色为白色
          color: '#000', // 字体颜色为黑色
          borderRadius: '10px', // 设置按钮的圆角
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 添加阴影效果
          fontSize: '18px', // 增大按钮的字体>
          height: '40px', // 增加按钮的高度
          width: '120px', // 增加按钮的宽度
        }}>
          View Details
        </Button>
      ),
    },
    {
      title: 'Repay',
      key: 'repay',
      align: 'center',
      render: (text, record) => (
        <Button type="primary" onClick={() => navigate('/jetco', { state: { contractAddress: record.contractAddress } })}
        style={{
          backgroundColor: '#6EA1EB', // 背景颜色为白色
          color: '#000', // 字体颜色为黑色
          borderRadius: '10px', // 设置按钮的圆角
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 添加阴影效果
          fontSize: '18px', // 增大按钮的字体>
          height: '40px', // 增加按钮的高度
          width: '100px', // 增加按钮的宽度
        }}>
          Repay
        </Button>
      ),
    },
    {
      title: 'Transfer All',
      key: 'transferAll',
      align: 'center',
      render: (text, record) => (
        <Button type="primary" onClick={() => { setSelectedRecord(record); setIsModalVisible(true); }} style={{
          backgroundColor: '#6EA1EB', // 背景颜色为白色
          color: '#000', // 字体颜色为黑色
          borderRadius: '10px', // 设置按钮的圆角
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 添加阴影效果
          fontSize: '18px', // 增大按钮的字体>
          height: '40px', // 增加按钮的高度
          width: '120px', // 增加按钮的宽度
        }}>
          Transfer All
        </Button>
      ),
    },
  ];

  return (
    <Layout className="lender-all-layout">
      <img src={logo} alt="Logo" className="aiftresponsive-logo" />
      <Content style={{ padding: '0 50px' }}>
        <Title level={2} className="lender-all-title">Lender Dashboard</Title>
        <p className="wallet-address">Wallet Address: {walletAddress}</p>
        <Table
          columns={columns}
          dataSource={assetsData}
          rowKey="key"
          bordered
          pagination={{ pageSize: 5 }}
          className="assets-table"
        />
        <Modal
          title="Transfer All"
          visible={isModalVisible}
          onOk={handleTransferAll}
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
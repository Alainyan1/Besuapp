import React, { useState, useEffect } from 'react';
import { Layout, Button, Typography, Table } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/IssuerInfo.css';
import logo from '../images/aift.png';

const { Content } = Layout;
const { Title } = Typography;

function IssuerInfo() {
  const [assetsData, setAssetsData] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const walletAddress = location.state?.walletAddress || '0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73';

  useEffect(() => {
    async function fetchData(walletAddress) {
      try {
        const requestConfig = {
          params: { deployerAddress: walletAddress }
        };
        const response = await axios.get('https://eurybia.xyz/api/test/issuerInfo', requestConfig);
        const data = await response.data;
        console.log(data);
        setAssetsData(data);
      } catch (error) {
        console.error('Error fetching assets:', error);
      }
    }

    if (walletAddress !== 'No wallet address provided') {
      fetchData(walletAddress);
    }
  }, [walletAddress]);

  const formatData = (data) => {
    if (data > 1000000000) {
      return `${(data / 1000000000).toFixed(2)}B`;
    } else if (data > 1000000) {
      return `${(data / 1000000).toFixed(2)}M`;
    }
    return data;
  }

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
    },
    {
      title: 'Issue Company',
      dataIndex: 'company_name',
      key: 'company_name',
      align: 'center',
    },
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
      title: 'Total Supply',
      dataIndex: 'initial_supply',
      key: 'initial_supply',
      align: 'center',
      render: (text) => formatData(text),
    },
    {
      title: 'View Details',
      key: 'viewDetails',
      align: 'center',
      render: (text, record) => (
        <Button type="primary" onClick={() => navigate('/asset', { state: { contractAddress: record.ContractAddress, assetName: record.asset_name } })}
        style={{
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
      title: 'Configuration',
      key: 'configuration',
      align: 'center',
      render: (text, record) => (
        <Button type="primary" onClick={() => navigate('/configuration', { state: { walletAddress: record.walletAddress, contractAddress: record.ContractAddress } })}
        style={{
          backgroundColor: '#6EA1EB', // 背景颜色为白色
          color: '#000', // 字体颜色为黑色
          borderRadius: '10px', // 设置按钮的圆角
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 添加阴影效果
          fontSize: '18px', // 增大按钮的字体>
          height: '40px', // 增加按钮的高度
          width: '180px', // 增加按钮的宽度
        }}>
          View Configuration
        </Button>
      ),
    },
  ];

  // Sort assetsData to put rows with type 'Loan' at the top
  const sortedAssetsData = [...assetsData].sort((a, b) => {
    if (a.type === 'Loan' && b.type !== 'Loan') {
      return -1;
    }
    if (a.type !== 'Loan' && b.type === 'Loan') {
      return 1;
    }
    return 0;
  });

  return (
    <Layout className="issuer-info-layout">
      <img src={logo} alt="Logo" className="aiftresponsive-logo" />
      <Content style={{ padding: '0 50px' }}>
        <Title level={2} className="issuer-info-title">Tokenization Adivsor Dashboard</Title>
        <p className="wallet-address">CSPRO: {walletAddress}</p>
        <Button type="primary" onClick={() => navigate('/')}
          className="create-asset-button"
          style={{
            backgroundColor: 'white', // 背景颜色为白色
            color: 'black', // 字体颜色为黑色
            borderRadius: '10px', // 设置按钮的圆角
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 添加阴影效果
            fontSize: '18px', // 墛大按钮的字体
            height: '50px', // 墛大按钮的高度
            width: '180px', // 墛大按钮的宽度
            border: '1px solid black', // 边框颜色为黑色
            fontSize: '20px', // 墛大按钮的字体
          }}>
          Create New Asset
        </Button>
        <Table
          columns={columns}
          dataSource={sortedAssetsData}
          rowKey="key"
          bordered
          pagination={{ pageSize: 8 }}
          className="assets-table"
        />
      </Content>
    </Layout>
  );
}

export default IssuerInfo;
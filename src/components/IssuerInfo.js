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
  const walletAddress = location.state?.walletAddress || 'No wallet address provided';

  useEffect(() => {
    async function fetchData(walletAddress) {
      try {
        const response = await axios.get('https://eurybia.xyz/api/test/loan_issuer');
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

  const columns = [
    {
      title: 'Asset Name',
      dataIndex: 'asset_name',
      key: 'asset_name',
      align: 'center',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
    },
    {
      title: 'Total Supply',
      dataIndex: 'total_supply',
      key: 'total_supply',
      align: 'center',
    },
    {
      title: 'Principal',
      dataIndex: 'principal',
      key: 'principal',
      align: 'center',
    },
    {
      title: 'Configuration',
      key: 'configuration',
      align: 'center',
      render: (text, record) => (
        <Button type="primary" onClick={() => navigate('/configuration', { state: { contractAddress: record.contractAddress } })}style={{
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

  return (
    <Layout className="issuer-info-layout">
      <img src={logo} alt="Logo" className="aiftresponsive-logo" />
      <Content style={{ padding: '0 50px' }}>
        <Title level={2} className="issuer-info-title">Issuer Dashboard</Title>
        <p className="wallet-address">Wallet Address: {walletAddress}</p>
        <Table
          columns={columns}
          dataSource={assetsData}
          rowKey="key"
          bordered
          pagination={{ pageSize: 5 }}
          className="assets-table"
        />
      </Content>
    </Layout>
  );
}

export default IssuerInfo;
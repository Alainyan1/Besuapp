import React, { useState, useEffect } from 'react';
import { Layout, Button, Typography, Table } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

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
        const response = await fetch(`https://your-api-url.com/assets?walletAddress=${walletAddress}`);
        const data = await response.json();
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
      dataIndex: 'assetName',
      key: 'assetName',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Total Supply',
      dataIndex: 'totalSupply',
      key: 'totalSupply',
    },
    {
      title: 'Principal',
      dataIndex: 'principal',
      key: 'principal',
    },
    {
      title: 'Configuration',
      key: 'configuration',
      render: (text, record) => (
        <Button type="primary" onClick={() => navigate(`/configuration/${record.key}`)}>
          View Configuration
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: '0 50px' }}>
        <Title level={2}>Issuer Dashboard</Title>
        <p>Wallet Address: {walletAddress}</p>
        <Table columns={columns} dataSource={assetsData} rowKey="key" />
      </Content>
    </Layout>
  );
}

export default IssuerInfo;
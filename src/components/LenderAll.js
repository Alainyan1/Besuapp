import React, { useState, useEffect } from 'react';
import { Layout, Button, Typography, Table } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/LenderAll.css';

const { Content } = Layout;
const { Title } = Typography;

function LenderAll() {
  const [account, setAccount] = useState(null);
  const [assetsData, setAssetsData] = useState([]);
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

  const columns = [
    {
      title: 'Asset Name',
      dataIndex: 'asset_name',
      key: 'asset_name',
    },
    {
      title: 'Allocated',
      dataIndex: 'allocated',
      key: 'allocated',
    },
    {
      title: 'Lensed',
      dataIndex: 'lensed',
      key: 'lensed',
    },
    {
      title: 'Principal',
      dataIndex: 'principal',
      key: 'principal',
    },
    {
      title: 'Interest',
      dataIndex: 'interest',
      key: 'interest',
    },
    {
      title: 'Details',
      key: 'details',
      render: (text, record) => (
        <Button type="primary" onClick={() => navigate(`/asset/${record.key}`)}>
          View Details
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: '0 50px' }}>
        <Title level={2}>Lender Dashboard</Title>
        <p>Address: {walletAddress}</p>
        <Table columns={columns} dataSource={assetsData} rowKey="key" />
      </Content>
    </Layout>
  );
}

export default LenderAll;
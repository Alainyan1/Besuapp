import React, { useState, useEffect } from 'react';
import { Layout, Typography, Table } from 'antd';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/Asset.css';
import logo from '../images/aift.png';

const { Content } = Layout;
const { Title } = Typography;

function Asset() {
  const [balancesData, setBalancesData] = useState([]);
  const location = useLocation();
  const contractAddress = location.state?.contractAddress || 'No contract address provided';

  useEffect(() => {
    async function fetchData(contractAddress) {
      try {
        const response = await axios.get(`https://eurybia.xyz/api/test/getAllBalances?contractAddress=${contractAddress}`);
        const data = await response.data;
        console.log(data);
        setBalancesData(data);
      } catch (error) {
        console.error('Error fetching balances:', error);
      }
    }

    if (contractAddress !== 'No contract address provided') {
      fetchData(contractAddress);
    }
  }, [contractAddress]);

  const columns = [
    {
      title: 'Account',
      dataIndex: 'account',
      key: 'account',
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
  ];

  return (
    <Layout className="asset-layout">
      <img src={logo} alt="Logo" className="aiftresponsive-logo" />
      <Content style={{ padding: '0 50px' }}>
        <Title level={2} className="asset-title">Asset Details</Title>
        <p className="contract-address">Contract Address: {contractAddress}</p>
        <Table
          columns={columns}
          dataSource={balancesData}
          rowKey="account"
          bordered
          pagination={{ pageSize: 5 }}
          className="balances-table"
        />
      </Content>
    </Layout>
  );
}

export default Asset;
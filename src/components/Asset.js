import React, { useState, useEffect } from 'react';
import { Layout, Typography, Table, Button } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Asset.css';
import logo from '../images/aift.png';

const { Content } = Layout;
const { Title } = Typography;

function Asset() {
  const [balancesData, setBalancesData] = useState([]);
  const location = useLocation();
  const contractAddress = location.state?.contractAddress || 'No contract address provided';
  const assetName = location.state?.assetName || 'No assert name provided';
  const navigate = useNavigate();

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
      title: 'Account',
      render: (text, record) => (
        <div>
          <div>{record.name}</div>
          <div style={{ fontSize: '12px', color: 'gray' }}>{record.address}</div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      align: 'center',
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
  ];

  return (
    <Layout className="asset-layout">
      <img src={logo} alt="Logo" className="aiftresponsive-logo" />
      <Content style={{ padding: '0 50px' }}>
        <Title level={2} className="asset-title">{assetName}</Title>
        <p className="contract-address">Asset Address: {contractAddress}</p>
        <div className="asset-page-container">
          <Button type="primary" onClick={() => navigate(-1)}
            className="create-asset-button"
            style={{
              backgroundColor: 'white', // 背景颜色为白色
              color: 'black', // 字体颜色为黑色
              borderRadius: '10px', // 设置按钮的圆角
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 添加阴影效果
              fontSize: '18px', // 墛大按钮的字体
              height: '40px', // 墛大按钮的高度
              width: '150px', // 墛大按钮的宽度
              border: '1px solid black', // 边框颜色为黑色
              fontSize: '20px', // 墛大按钮的字体
            }}>
            Back
          </Button>
        </div>
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
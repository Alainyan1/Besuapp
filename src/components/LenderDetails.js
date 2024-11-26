import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Typography, Table, Button } from 'antd';
import axios from 'axios';
import '../css/LenderDetails.css';
import logo from '../images/aift.png';
// import { ANT_MARK } from 'antd/es/locale';

const { Content } = Layout;
const { Title } = Typography;

function LenderDetails() {
  const [borrowersData, setBorrowersData] = useState([]);
  const location = useLocation();
  const { contractAddress, walletAddress } = location.state || {};
  const assetName = location.state?.assetName || 'No asset name provided';
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const requestConfig = {
          params: { contractAddress, lenderAddress: walletAddress },
        };
        const response = await axios.get('https://eurybia.xyz/api/test/borrowDetails', requestConfig);
        const data = await response.data;
        // console.log('Axios response data:', data);

        // Check if data is an array
        // Map over the data to extract necessary information
        const mappedData = data.map(borrower => ({
          contractAddress: borrower.contractAddress,
          paymentFrom: borrower.paymentFrom,
          paymentFromKey: borrower.paymentFromKey,
          paymentTo: borrower.paymentTo,
          paymentToKey: borrower.paymentToKey,
          amount: borrower.amount,
          time_stamp: borrower.time_stamp,
          due_time: borrower.due_time,
          key: borrower.paymentFromKey,
     }));

        // console.log('Mapped data:', mappedData);
        setBorrowersData(mappedData);
      } catch (error) {
        console.error('Error fetching borrowers:', error);
      }
    }

    if (contractAddress) {
      fetchData();
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
      title: 'Payment From',
      render: (text, record) => (
        <div>
          <div>{record.paymentFromKey}</div>
          <div style={{ fontSize: '12px', color: 'gray' }}>{record.paymentFrom}</div>
        </div>
      ),
    },
    {
      title: 'Payment To',
      render: (text, record) => (
        <div>
          <div>{record.paymentToKey}</div>
          <div style={{ fontSize: '12px', color: 'gray' }}>{record.paymentTo}</div>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      render: (text) => formatData(text),
    },
    {
      title: 'Date',
      dataIndex: 'time_stamp',
      key: 'time_stamp',
      align: 'center',
    },
    {
      title: 'Due Date',
      dataIndex: 'due_time',
      key: 'due_time',
      align: 'center',
    },
  ];

  return (
    <Layout className="lender-details-layout">
      <img src={logo} alt="Logo" className="aiftresponsive-logo" />
      <Content style={{ padding: '0 50px' }}>
        <Title level={2} className="lender-details-title">{assetName}</Title>
        <p className="wallet-address">Smart Contract Address: {contractAddress}</p>
        <div className="asset-page-container">
          <Button type="primary" onClick={() => navigate(-1)}
            className="create-asset-button"
            style={{
              backgroundColor: 'white', // 背景颜色为白色
              color: 'black', // 字体颜色为黑色
              borderRadius: '10px', // 设置按钮的圆角
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 添加阴影效果
              fontSize: '20px', // 墛大按钮的字体
              height: '40px', // 墛大按钮的高度
              width: '150px', // 墛大按钮的宽度
              border: '1px solid black', // 边框颜色为黑色
            }}>
            Back
          </Button>
          <Table
          columns={columns}
          dataSource={borrowersData}
          rowKey="key"
          bordered
          pagination={{ pageSize: 8 }}
          className="assets-table"
        />
        </div>
      </Content>
    </Layout>
  );
}

export default LenderDetails;
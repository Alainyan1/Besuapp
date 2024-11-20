import React, { useState, useEffect } from 'react';
import { Layout, Button, Typography, Table } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/BorrowInfo.css';
import logo from '../images/aift.png';
import { Contract } from 'ethers';

const { Content } = Layout;
const { Title } = Typography;

function BorrowInfo() {
  const [lendersData, setLendersData] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const walletAddress = location.state?.walletAddress || 'No wallet address provided';

  useEffect(() => {
    async function fetchData(walletAddress) {
      try {
        const requestConfig = {
          params: { borrowerAddress: walletAddress }
        };
        const response = await axios.get('https://eurybia.xyz/api/test/getBorrowerBalance', requestConfig);
        const data = await response.data;
        console.log('Axios response data:', data);

        // Check if data is an array
        if (Array.isArray(data)) {
          // Flatten the nested list
          const flattenedData = data.flatMap(asset => 
            Array.isArray(asset) ? asset.map(lender => ({
              asset_name: lender.asset_name,
              lender_address: lender.lender,
              lender_name: lender.lender_name,
              borrower_name: lender.name,
              company_name: lender.company_name,
              principal: lender.principal,
              interest: lender.interest,
              ContractAddress: lender.ContractAddress,
              type: lender.Type,
              key: lender.ContractAddress,
            })) : []
          );

          console.log('Flattened data:', flattenedData);
          setLendersData(flattenedData);
        } else {
          console.error('Unexpected data format:', data);
        }
      } catch (error) {
        console.error('Error fetching lenders:', error);
      }
    }

    if (walletAddress !== 'No wallet address provided') {
      fetchData(walletAddress);
    }
  }, [walletAddress]);

  const columns = [
    {
      title: 'Asset',
      render: (text, record) => (
        <div>
          <div>{record.asset_name}</div>
          <div style={{ fontSize: '12px', color: 'gray' }}>{record.ContractAddress}</div>
        </div>
      ),
    },
    {
      title: 'Lender',
      render : (text, record) => (
        <div>
          <div>{record.name}</div>
          <div style={{ fontSize: '12px', color: 'gray' }}>{record.lender_address}</div>
        </div>
      ),
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
        title: 'Repay Principal',
        key: 'repayPrincipal',
        align: 'center',
        render: (text, record) => (
          <Button type="primary" onClick={() => navigate(`/jetco`)}
          style={{
            backgroundColor: '#6EA1EB',
            color: '#000', // 字体颜色为黑色
            borderRadius: '10px', // 设置按钮的圆角
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 添加阴影效果
            fontSize: '18px', // 增大按钮的字体>
            height: '40px', // 增加按钮的高度
            width: '130px', // 增加按钮的宽度
          }}>
            Repay Principal
          </Button>
        ),
    },
    {
        title: 'Repay Interest',
        key: 'repayInterest',
        align: 'center',
        render: (text, record) => (
          <Button type="primary" onClick={() => navigate(`/jetco`)}
          style={{
            backgroundColor: '#6EA1EB',
            color: '#000', // 字体颜色为黑色
            borderRadius: '10px', // 设置按钮的圆角
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // 添加阴影效果
            fontSize: '18px', // 增大按钮的字体>
            height: '40px', // 增加按钮的高度
            width: '130px', // 增加按钮的宽度
          }}>
            Repay Interest
          </Button>
        ),
    },
    // {
    //   title: 'View Details',
    //   key: 'viewDetails',
    //   align: 'center',
    //   render: (text, record) => (
    //     <Button type="primary" onClick={() => navigate(`/asset/${record.key}`)}>
    //       View Details
    //     </Button>
    //   ),
    // },
  ];

  return (
    <Layout className="borrow-info-layout">
      <img src={logo} alt="Logo" className="aiftresponsive-logo" />
      <Content style={{ padding: '0 50px' }}>
        <Title level={2} className="borrow-info-title">Borrower Dashboard</Title>
        <p className="wallet-address">Wallet Address: {walletAddress}</p>
        <Table
          columns={columns}
          dataSource={lendersData}
          rowKey="key"
          bordered
          pagination={{ pageSize: 5 }}
          className="assets-table"
        />
      </Content>
    </Layout>
  );
}

export default BorrowInfo;
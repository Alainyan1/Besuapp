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
        // Map over the data to extract necessary information
        const mappedData = data.map(lender => ({
          asset_name: lender.asset_name,
          lender_address: lender.lender,
          lender_name: lender.lender_name,
          borrower_name: lender.name,
          company_name: lender.company_name,
          principal: lender.principal,
          interest: lender.interest,
          ContractAddress: lender.ContractAddress,
          type: lender.Type,
          time: lender.time_stamp,
          due_time: lender.due_time,
          key: lender.ContractAddress,
        }));

        console.log('Mapped data:', mappedData);
        setLendersData(mappedData);
      } catch (error) {
        console.error('Error fetching lenders:', error);
      }
    }

    if (walletAddress !== 'No wallet address provided') {
      fetchData(walletAddress);
    }
  }, [walletAddress]);

  const columns = [
    // {
    //   title: 'Issue Company',
    //   dataIndex: 'company_name',
    //   key: 'company_name',
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
      title: 'Lender',
      render : (text, record) => (
        <div>
          <div>{record.lender_name}</div>
          <div style={{ fontSize: '12px', color: 'gray' }}>{record.lender_address}</div>
        </div>
      ),
    },
    {
      title: (
          <div>
              <div className="parent-column-header">Balance</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              </div>
          </div>
      ),
      children: [
          {
              title: 'Principal',
              dataIndex: 'principal',
              key: 'principal',
              align: 'center',
              className: 'sub-column-header',
          },
          {
              title: 'Interest',
              dataIndex: 'interest',
              key: 'interest',
              align: 'center',
              className: 'sub-column-header',
          },
      ],
    },
    // {
    //   title: 'Principal',
    //   dataIndex: 'principal',
    //   key: 'principal',
    //   align: 'center',
    // },
    // {
    //   title: 'Interest',
    //   dataIndex: 'interest',
    //   key: 'interest',
    //   align: 'center',
    // },
    {
      title: 'Borrow Date',
      dataIndex: 'time',
      key: 'time',
      align: 'center',
    },
    {
      title: 'Due Date',
      dataIndex: 'due_time',
      key: 'due_time',
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
        <Title level={2} className="borrow-info-title">Syndicated Loan Dashboard (Borrower)</Title>
        <p className="wallet-address">Wallet Address: {walletAddress}</p>
        <Table
          columns={columns}
          dataSource={lendersData}
          rowKey="key"
          bordered
          pagination={{ pageSize: 8 }}
          className="assets-table"
        />
      </Content>
    </Layout>
  );
}

export default BorrowInfo;
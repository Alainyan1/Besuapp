import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Typography, Table, Button } from 'antd';
import axios from 'axios';
import '../css/LenderDetails.css';
import logo from '../images/aift.png';

const { Content } = Layout;
const { Title } = Typography;

function LenderDetails() {
  const [borrowersData, setBorrowersData] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [borrowDetails, setBorrowDetails] = useState({});
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
        const response = await axios.get('https://eurybia.xyz/api/test/getAllBorrowers', requestConfig);
        const data = await response.data;
        console.log('Axios response data:', data);

        // Map over the data to extract necessary information
        const mappedData = data.map(borrower => ({
          borrower_name: borrower.name,
          borrower_address: borrower.borrowerAddress,
          principal: borrower.principal,
          interest: borrower.interest,
          time: borrower.time_stamp,
          key: borrower.borrowerAddress,
        }));

        console.log('Mapped data:', mappedData);
        setBorrowersData(mappedData);
      } catch (error) {
        console.error('Error fetching borrowers:', error);
      }
    }

    if (contractAddress) {
      fetchData();
    }
  }, [contractAddress]);

  const fetchBorrowDetails = async (borrowerAddress) => {
    try {
      const requestConfig = {
        params: { 'borrowerAddress':borrowerAddress, 'contractAddress': contractAddress, lenderAddress: walletAddress },
      };
      const response = await axios.get('https://eurybia.xyz/api/test/borrowDetails', requestConfig);
      const data = await response.data;
      console.log('Borrow details:', data);
      setBorrowDetails(prevState => ({ ...prevState, [borrowerAddress]: data }));
    } catch (error) {
      console.error('Error fetching borrow details:', error);
    }
  };

  const handleExpand = (expanded, record) => {
    if (expanded) {
      fetchBorrowDetails(record.borrower_address);
      setExpandedRowKeys([record.key]);
    } else {
      setExpandedRowKeys([]);
    }
  };

  const expandedRowRender = (record) => {
    const details = borrowDetails[record.borrower_address] || [];
    const columns = [
      { title: 'Detail Name', dataIndex: 'detailName', key: 'detailName' },
      { title: 'Detail Value', dataIndex: 'detailValue', key: 'detailValue' },
    ];

    return (
      <Table
        columns={columns}
        dataSource={details}
        pagination={false}
        rowKey="detailName"
      />
    );
  };

  const columns = [
    {
      title: 'Borrower',
      render: (text, record) => (
        <div>
          <div>{record.borrower_name}</div>
          <div style={{ fontSize: '12px', color: 'gray' }}>{record.borrower_address}</div>
        </div>
      ),
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
      title: 'Borrow Time',
      dataIndex: 'time',
      key: 'time',
      align: 'center',
    },
  ];

  return (
    <Layout className="lender-details-layout">
      <img src={logo} alt="Logo" className="aiftresponsive-logo" />
      <Content style={{ padding: '0 50px' }}>
        <Title level={2} className="lender-details-title">{assetName}</Title>
        <p className="wallet-address">Asset Address: {contractAddress}</p>
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
          dataSource={borrowersData}
          rowKey="key"
          bordered
          pagination={{ pageSize: 5 }}
          className="assets-table"
          expandable={{
            expandedRowRender,
            rowExpandable: record => true,
            expandedRowKeys,
            onExpand: handleExpand,
          }}
        />
      </Content>
    </Layout>
  );
}

export default LenderDetails;
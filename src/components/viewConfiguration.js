import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Typography, Descriptions, Button } from 'antd';
import logo from '../images/aift.png';
import '../css/ViewConfiguration.css'; // Import the CSS file for custom styles

const { Title } = Typography;

const ViewConfiguration = () => {
  const location = useLocation();
  const { contractAddress } = location.state || {};
  const [contractData, setContractData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const response = await axios.get(`https://eurybia.xyz/api/test/getDeployment?contractAddress=${contractAddress}`);
        const res = response.data;
        setContractData(res[0]);
      } catch (error) {
        console.error('Error fetching contract data:', error);
      }
    };

    if (contractAddress) {
      fetchContractData();
    }
  }, [contractAddress]);

  if (!contractData) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <img src={logo} alt="Logo" style={{ position: 'absolute', top: '20px', left: '20px', height: '80px' }} />
      <Title level={1} style={{ color: '#000', margin: '10px', textAlign: 'center', minHeight: '8vh', fontSize: '45px' }}>Contract Configuration</Title>
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
          }}>
          Back
        </Button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Descriptions bordered column={1} className="custom-descriptions">
          <Descriptions.Item label="Contract Address">{contractData.contractAddress}</Descriptions.Item>
          <Descriptions.Item label="Asset Type">{contractData.assetType}</Descriptions.Item>
          <Descriptions.Item label="Name">{contractData.companyName}</Descriptions.Item>
          <Descriptions.Item label="Symbol">{contractData.symbol}</Descriptions.Item>
          <Descriptions.Item label="Initial Supply">{contractData.initialSupply}</Descriptions.Item>
          <Descriptions.Item label="Interest Rate">{contractData.interestRate}</Descriptions.Item>
          <Descriptions.Item label="Lender 1">
            <div>Address: {`${contractData.lender1Key}: ${contractData.lender1Address}`}</div>
            <div>Amount: {contractData.lender1amount}</div>
          </Descriptions.Item>
          <Descriptions.Item label="Lender 2">
            <div>Address: {`${contractData.lender2Key}: ${contractData.lender2Address}`}</div>
            <div>Amount: {contractData.lender2amount}</div>
          </Descriptions.Item>
          <Descriptions.Item label="Escrow">{`${contractData.escrowKey}: ${contractData.escrowAddress}`}</Descriptions.Item>
          <Descriptions.Item label="Ancillary Info">{contractData.ancillaryInfo}</Descriptions.Item>
        </Descriptions>
      </div>
    </div>
  );
};

export default ViewConfiguration;
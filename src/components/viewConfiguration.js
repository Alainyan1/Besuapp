import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Typography, Descriptions } from 'antd';
import '../css/LoanForm.css'; // Import the CSS file for consistent styling
import logo from '../images/cspro.png';

const { Title } = Typography;

const ViewConfiguration = () => {
  const location = useLocation();
  const { contractAddress } = location.state || {};
  const [contractData, setContractData] = useState(null);

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
    <div className="cspro-page-container" style={{ padding: '20px' }}>
      <img src={logo} alt="Logo" style={{ position: 'absolute', top: '20px', left: '20px', height: '80px' }} />
      <Title level={1} style={{ color: '#000', margin: '10px', textAlign: 'center', minHeight: '8vh', fontSize: '45px' }}>Contract Configuration</Title>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Descriptions bordered column={1} style={{ width: '50%' }}>
          <Descriptions.Item label={<label style={{ color: "#000", fontSize: "18px" }}>Contract Address</label>}>{contractData.contractAddress}</Descriptions.Item>
          <Descriptions.Item label={<label style={{ color: "#000", fontSize: "18px" }}>Asset Type</label>}>{contractData.assetType}</Descriptions.Item>
          <Descriptions.Item label={<label style={{ color: "#000", fontSize: "18px" }}>Name</label>}>{contractData.companyName}</Descriptions.Item>
          <Descriptions.Item label={<label style={{ color: "#000", fontSize: "18px" }}>Symbol</label>}>{contractData.symbol}</Descriptions.Item>
          <Descriptions.Item label={<label style={{ color: "#000", fontSize: "18px" }}>Initial Supply</label>}>{contractData.initialSupply}</Descriptions.Item>
          <Descriptions.Item label={<label style={{ color: "#000", fontSize: "18px" }}>Interest Rate</label>}>{contractData.interestRate}</Descriptions.Item>
          <Descriptions.Item label={<label style={{ color: "#000", fontSize: "18px" }}>Lender 1</label>}>
            <div>Address: {`${contractData.lender1Key}: ${contractData.lender1Address}`}</div>
            <div>Amount: {contractData.lender1amount}</div>
          </Descriptions.Item>
          <Descriptions.Item label={<label style={{ color: "#000", fontSize: "18px" }}>Lender 2</label>}>
            <div>Address: {`${contractData.lender2Key}: ${contractData.lender2Address}`}</div>
            <div>Amount: {contractData.lender2amount}</div>
          </Descriptions.Item>
          <Descriptions.Item label={<label style={{ color: "#000", fontSize: "18px" }}>Escrow</label>}>{`${contractData.escrowKey}: ${contractData.escrowAddress}`}</Descriptions.Item>
          <Descriptions.Item label={<label style={{ color: "#000", fontSize: "18px" }}>Ancillary Info</label>}>{contractData.ancillaryInfo}</Descriptions.Item>
        </Descriptions>
      </div>
    </div>
  );
};

export default ViewConfiguration;
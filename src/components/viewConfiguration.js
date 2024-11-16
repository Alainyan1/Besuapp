import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Typography, Descriptions } from 'antd';
import '../css/loanDeployment.css';
import logo from '../images/cspro.png';

const { Title } = Typography;

const ViewConfiguration = () => {
  const location = useLocation();
  const { contractAddress } = location.state || {};
  const [contractData, setContractData] = useState(null);

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const response = await axios.get(`http://your-backend-api-url.com/api/getDeployment?contractAddress=${contractAddress}`);
        setContractData(response.data);
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
      <Descriptions bordered>
        <Descriptions.Item label="Contract Address">{contractData.contractAddress}</Descriptions.Item>
        <Descriptions.Item label="Asset Type">{contractData.assetType}</Descriptions.Item>
        <Descriptions.Item label="Name">{contractData.name}</Descriptions.Item>
        <Descriptions.Item label="Symbol">{contractData.symbol}</Descriptions.Item>
        <Descriptions.Item label="Initial Supply">{contractData.initialSupply}</Descriptions.Item>
        <Descriptions.Item label="Interest Rate">{contractData.interestRate}</Descriptions.Item>
        <Descriptions.Item label="Escrow">{contractData.escrow}</Descriptions.Item>
        <Descriptions.Item label="Ancillary Info">{contractData.ancillaryInfo}</Descriptions.Item>
        <Descriptions.Item label="Buyers">
          {contractData.buyers.map((buyer, index) => (
            <div key={index}>{buyer}</div>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label="Amounts">
          {contractData.amounts.map((amount, index) => (
            <div key={index}>{amount}</div>
          ))}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default ViewConfiguration;
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { ContractContext } from './ContractContext';
import { AccountsContext } from './AccountsContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Spin, Typography, Input, Modal, Form, InputNumber, Row, Col, Divider, Tag, Tooltip, Table } from 'antd';
import { WalletOutlined, BankOutlined, CalendarOutlined, PercentageOutlined, InfoCircleOutlined } from '@ant-design/icons';
import '../css/cdclient.css';
import logo from '../images/aift.png';

const { Title, Text } = Typography;

const CDClient = () => {
  const [depositTerms, setDepositTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(10000);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const { addAccount } = useContext(AccountsContext);
  const navigate = useNavigate();
  
  const [contractAddress, setContractAddress] = useState(localStorage.getItem('contractAddress') || '');
  const location = useLocation();

  useEffect(() => {
    // Set contract address from navigation state
    if (location.state?.contractAddress) {
        setContractAddress(location.state.contractAddress);
    }

    fetchDepositTerms();
  }, [location.state]);

  const fetchDepositTerms = async () => {
    try {
      setLoading(true);
      const params = {
        'contractAddress': "0x42699A7612A82f1d9C36148af9C77354759b210b"
      };
      const response = await axios.get('http://20.2.203.99:3002/api/getAllDepositTerms', {params});
      
      // Convert API response to camelCase to match our component's expected format
      const formattedTerms = response.data.map(term => ({
        // Match the exact case from the API response
        termId: String(term.termId),
        duration: parseInt(term.duration, 10),
        fixedRate: parseInt(term.fixedRate, 10),
        demandRate: parseInt(term.demandRate, 10),
        isActive: typeof term.isActive === 'string' ? term.isActive.toLowerCase() === 'true' : Boolean(term.isActive)
      }));
      
      setDepositTerms(formattedTerms);
      console.log('Available deposit terms:', formattedTerms);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching deposit terms:', error);
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    const provider = await detectEthereumProvider();

    if (provider) {
      try {
        console.log('MetaMask detected');
        await provider.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
        await provider.request({ method: 'eth_requestAccounts' });
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        console.log('Connected Wallet Address:', address);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      console.error('MetaMask is not installed');
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };

  const showPurchaseModal = (term) => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }
    
    setSelectedTerm(term);
    setPurchaseModalVisible(true);
  };

  const handlePurchase = async () => {
  if (!selectedTerm || !walletAddress) {
    alert('Missing required information for purchase');
    return;
  }

  try {
    // Prepare purchase data to pass to the tdtoken page
    const purchaseDetails = {
      contractAddress: contractAddress,
      clientAddress: walletAddress,
      purchaseAmount: purchaseAmount,
      termId: selectedTerm.termId,
      termDuration: selectedTerm.duration,
      fixedRate: selectedTerm.fixedRate,
      demandRate: selectedTerm.demandRate,
      formattedTermId: formatTermId(selectedTerm.termId),
      durationInMonths: getDurationInMonths(selectedTerm.duration),
      purchaseDate: new Date().toISOString().substring(0, 10)
    };
    
    // Close the modal
    setPurchaseModalVisible(false);
    
    // Navigate to tdtoken page with purchase details
    navigate('/tdtoken', { 
      state: { 
        action: 'purchase',
        purchaseDetails: purchaseDetails 
      } 
    });
  } catch (error) {
    console.error('Error preparing purchase:', error);
    Modal.error({
      title: 'Error',
      content: `There was an error preparing your purchase: ${error.message}`
    });
  }
};

  const getDurationInMonths = (durationInSeconds) => {
    return Math.round(durationInSeconds / 2629800); // 2629800 seconds in a month (average)
  };

  const formatTermId = (hexString) => {
    try {
      // Try to convert hex string to readable string if it's bytes32
      if (hexString.startsWith('0x')) {
        return ethers.utils.parseBytes32String(hexString);
      } else {
        return hexString;
      }
    } catch (error) {
      console.error('Error parsing termId', error);
      return hexString;
    }
  };

  const renderDepositTerms = () => {
    if (loading) {
      return <div className="loading-container"><Spin size="large" /></div>;
    }

    if (!depositTerms || depositTerms.length === 0) {
      return (
        <div className="no-terms-container">
          <Text>No deposit terms available for this Certificate of Deposit.</Text>
        </div>
      );
    }

    const columns = [
      {
        title: 'Term ID',
        dataIndex: 'termId',
        key: 'termId',
        render: (text) => <span>{formatTermId(text)}</span>
      },
      {
        title: 'Duration',
        dataIndex: 'duration',
        key: 'duration',
        render: (duration) => `${getDurationInMonths(duration)} Months`
      },
      {
        title: 'Fixed Rate',
        dataIndex: 'fixedRate',
        key: 'fixedRate',
        render: (rate) => `${rate / 100}%`
      },
      {
        title: 'Early Withdrawal Rate',
        dataIndex: 'demandRate',
        key: 'demandRate',
        render: (rate) => `${rate / 100}%`
      },
      {
        title: 'Status',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (isActive) => 
          isActive ? <Tag color="green">Available</Tag> : <Tag color="red">Unavailable</Tag>
      },
      {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
          <Button 
            type="primary" 
            disabled={!walletAddress || !record.isActive} 
            onClick={() => showPurchaseModal(record)}
          >
            Purchase
          </Button>
        )
      }
    ];

    return (
      <div className="terms-table-container">
        <Table 
          dataSource={depositTerms} 
          columns={columns}
          rowKey="termId"
          pagination={false}
        />
      </div>
    );
  };

  return (
    <div className="cd-client-container">
      <img src={logo} alt="Logo" style={{ position: 'absolute', top: '20px', left: '20px', height: '80px' }} />
      <Title level={1} style={{ textAlign: 'center', margin: '20px 0 40px' }}>Certificate of Deposit Terms</Title>
      
      <div className="wallet-connection">
        <Button 
          onClick={connectWallet} 
          type="primary"
          icon={<WalletOutlined />}
          size="large"
          className="wallet-button"
        >
          {walletAddress ? `Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : 'Connect Wallet'}
        </Button>
      </div>
      
      <div className="contract-info">
        <Text strong>Contract Address: </Text>
        <Text>{contractAddress}</Text>
      </div>
      
      <div className="cd-terms-container">
        {renderDepositTerms()}
      </div>
      
      <Modal
        title="Purchase Certificate of Deposit"
        visible={purchaseModalVisible}
        onCancel={() => setPurchaseModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedTerm && (
          <Form layout="vertical">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="Term ID">
                  <Input value={formatTermId(selectedTerm.termId)} disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Contract Address">
                  <Input value={contractAddress} disabled />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item label="Term Duration">
                  <Input value={`${getDurationInMonths(selectedTerm.duration)} Months`} disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Fixed Interest Rate">
                  <Input value={`${selectedTerm.fixedRate / 100}%`} disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Early Withdrawal Rate">
                  <Input value={`${selectedTerm.demandRate / 100}%`} disabled />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item label="Purchase Amount">
              <InputNumber
                min={1000}
                value={purchaseAmount}
                onChange={(value) => setPurchaseAmount(value)}
                style={{ width: '100%' }}
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
            
            <Divider />
            
            <div className="purchase-summary">
              <Row>
                <Col span={12}><Text strong>Maturity Value (Estimated):</Text></Col>
                <Col span={12}>
                  <Text className="summary-value">
                    $ {(purchaseAmount * (1 + (selectedTerm.fixedRate / 10000) * (selectedTerm.duration / 31536000))).toFixed(2)}
                  </Text>
                </Col>
              </Row>
              <Row>
                <Col span={12}><Text strong>Interest Earned:</Text></Col>
                <Col span={12}>
                  <Text className="summary-value">
                    $ {(purchaseAmount * (selectedTerm.fixedRate / 10000) * (selectedTerm.duration / 31536000)).toFixed(2)}
                  </Text>
                </Col>
              </Row>
            </div>
            
            <div className="modal-footer">
              <Button onClick={() => setPurchaseModalVisible(false)} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                onClick={handlePurchase} 
                loading={purchaseLoading}
              >
                Confirm Purchase
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default CDClient;
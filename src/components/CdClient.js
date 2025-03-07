import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { ContractContext } from './ContractContext';
import { AccountsContext } from './AccountsContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Spin, Typography, Input, Modal, Form, InputNumber, Row, Col, Divider, Tag, Tooltip, Table, Tabs, Select } from 'antd';
import { WalletOutlined, BankOutlined, CalendarOutlined, PercentageOutlined, InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import '../css/cdclient.css';
import logo from '../images/aift.png';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const CDClient = () => {
  const [depositTerms, setDepositTerms] = useState([]);
  const [userDeposits, setUserDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDepositsLoading, setUserDepositsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(10000);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [bankInfo, setBankInfo] = useState({});
  const [activeTab, setActiveTab] = useState('1');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemingDepositId, setRedeemingDepositId] = useState(null);
  const { addAccount } = useContext(AccountsContext);
  const navigate = useNavigate();
  
  // Add state for all available contract addresses
  const [allContractAddresses, setAllContractAddresses] = useState([]);
  const [contractAddress, setContractAddress] = useState(localStorage.getItem('contractAddress') || '');
  const location = useLocation();

  useEffect(() => {
    // Set contract address from navigation state
    if (location.state?.contractAddress) {
      setContractAddress(location.state.contractAddress);
    }

    // First fetch all contract addresses
    fetchAllContractAddresses();
  }, [location.state]);

  // When contract addresses are loaded, fetch deposits and bank info
  useEffect(() => {
    if (allContractAddresses.length > 0) {
      fetchAvailableDeposits();
    }
  }, [allContractAddresses]);

  // When wallet address changes, fetch user deposits
  useEffect(() => {
    if (walletAddress) {
      fetchUserDeposits();
    }
  }, [walletAddress, allContractAddresses]);

  // New function to fetch all contract addresses and bank info in one call
    const fetchAllContractAddresses = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://eurybia.xyz/api/test/getCdDeployment');
            
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            console.log('Deployment data:', response.data);
            
            // Extract addresses
            const addresses = response.data.map(item => item.contract_address);
            setAllContractAddresses(addresses);
            
            // Extract bank information
            const bankInfoMap = {};
            response.data.forEach(item => {
                if (item.contract_address) {
                bankInfoMap[item.contract_address] = {
                    bankName: item.bank_name || 'Unknown Bank',
                    // Add any other bank properties from the API response
                    bankCode: item.bankCode,
                    bankId: item.bankId,
                    // Add any other properties as needed
                };
                }
            });
            
            console.log('Extracted bank info:', bankInfoMap);
            setBankInfo(bankInfoMap);
            
            // If no contract address is selected yet, select the first one
            if (!contractAddress && addresses.length > 0) {
                setContractAddress(addresses[0]);
                localStorage.setItem('contractAddress', addresses[0]);
            }
            } else {
            console.warn('No contract addresses found.');
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching contract addresses:', error);
            setLoading(false);
        }
    };

  const fetchAvailableDeposits = async () => {
    try {
      setLoading(true);
      let allTerms = [];
      
      // Fetch deposit terms for each contract address
      for (const address of allContractAddresses) {
        const params = {
          'contractAddress': address
        };
        console.log('Fetching deposit terms for contract:', address);
        const response = await axios.get('http://20.2.203.99:3002/api/getAllDepositTerms', {params});
        
        if (response.data && Array.isArray(response.data)) {
          // Convert API response to camelCase and add contract address
          const formattedTerms = response.data.map(term => ({
            termId: String(term.termId),
            duration: parseInt(term.duration, 10),
            fixedRate: parseInt(term.fixedRate, 10),
            demandRate: parseInt(term.demandRate, 10),
            isActive: typeof term.isActive === 'string' ? term.isActive.toLowerCase() === 'true' : Boolean(term.isActive),
            contractAddress: address, // Add contract address to identify which contract this term belongs to
            bankName: bankInfo[address]?.bankName || 'Unknown Bank'
          }));
          
          allTerms = [...allTerms, ...formattedTerms];
        }
      }
      
      setDepositTerms(allTerms);
      console.log('All available deposit terms:', allTerms);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching deposit terms:', error);
      setLoading(false);
    }
  };

  const fetchUserDeposits = async () => {
    if (!walletAddress) return;

    try {
        setUserDepositsLoading(true);
        let allUserDeposits = [];
        
        // Fetch user deposits for each contract address
        for (const address of allContractAddresses) {
        const response = await axios.get('http://20.2.203.99:3002/api/getClientDeposit', {
            params: {
            clientAddress: walletAddress,
            contractAddress: address
            }
        });
        console.log('Fetching user deposits for contract:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
            // Process user deposits to add calculated fields
            const userDepositsWithInterest = response.data.map(deposit => {
            // Convert Unix timestamp in seconds to milliseconds for JavaScript Date
            const startTimeMs = parseInt(deposit.startTime) * 1000;
            const purchaseDate = new Date(startTimeMs);
            
            // Parse duration and calculate maturity date
            const durationSeconds = parseInt(deposit.duration);
            const maturityDate = new Date(startTimeMs + (durationSeconds * 1000));
            
            // Use provided expectedInterest and currentInterest from API
            const expectedInterest = deposit.expectedInterest ? 
                parseFloat(deposit.expectedInterest) : 0;
                
            const currentInterest = deposit.currentInterest ? 
                parseFloat(deposit.currentInterest) : 0;
            
            // Parse amount as number
            const amount = parseFloat(deposit.amount);
            
            // Generate deposit ID if not provided
            const depositId = deposit.certificateId || `${deposit.termId}-${purchaseDate.getTime()}`;
            
            return {
                ...deposit,
                depositId: parseInt(depositId),
                purchaseDate: purchaseDate.toISOString(),
                maturityDate: maturityDate.toISOString(),
                expectedInterest: expectedInterest,
                currentInterest: currentInterest,
                amount: amount,
                // Add bank name from our mapping
                bankName: deposit.bankName || bankInfo[address]?.bankName || 'Unknown Bank',
                contractAddress: deposit.contractAddress || address,
                isRedeemed: Boolean(deposit.isRedeemed),
                // Format rates as numbers for display
                fixedRate: parseInt(deposit.fixedRate),
                demandRate: parseInt(deposit.demandRate)
            };
            });
            
            allUserDeposits = [...allUserDeposits, ...userDepositsWithInterest];
        }
        }
        
        setUserDeposits(allUserDeposits);
        console.log('All user deposits:', allUserDeposits);
        setUserDepositsLoading(false);
        
        // Switch to the My Deposits tab if there are deposits
        if (allUserDeposits.length > 0) {
        setActiveTab('2');
        }
    } catch (error) {
        console.error('Error fetching user deposits:', error);
        console.error('Error details:', error.message);
        setUserDepositsLoading(false);
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
        localStorage.setItem('walletAddress', address);
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
        contractAddress: selectedTerm.contractAddress, // Use the contract address of the selected term
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

  const handleRedeem = async (deposit) => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setRedeemingDepositId(deposit.depositId);
      setRedeemLoading(true);

      const provider = await detectEthereumProvider();
      if (!provider) {
        alert('Please install MetaMask to redeem your deposit');
        setRedeemLoading(false);
        return;
      }

      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();

      // Get the contract ABI
      const response = await axios.get('http://20.2.203.99:3002/api/cdcontractData');
      const { abi } = response.data;

      // Create contract instance with the specific contract address of this deposit
      const contract = new ethers.Contract(deposit.contractAddress, abi, signer);

      // Call the redeem function
      const CertificateId = deposit.depositId;
      console.log('Redeeming deposit:', CertificateId);
      const tx = await contract.redeem(
        CertificateId,
        {
            gasLimit: 3000000,
            maxFeePerGas: ethers.utils.parseUnits('0', 'gwei'),
            maxPriorityFeePerGas: ethers.utils.parseUnits('0', 'gwei')
        }
      );

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log('Withdrawal successful:', receipt);

      // Update the database about the withdrawal
    //   await axios.post('http://20.2.203.99:3002/api/redeemDeposit', {
    //     depositId: deposit.depositId,
    //     userAddress: walletAddress,
    //     contractAddress: deposit.contractAddress,
    //     transactionHash: receipt.transactionHash,
    //     redeemDate: new Date().toISOString().substring(0, 10)
    //   });

      // Refresh user deposits
      fetchUserDeposits();
      
      // Show success message
      Modal.success({
        title: 'Redemption Successful',
        content: 'Your deposit has been successfully redeemed.'
      });
    } catch (error) {
      console.error('Error redeeming deposit:', error);
      Modal.error({
        title: 'Redemption Failed',
        content: `There was an error redeeming your deposit: ${error.message}`
      });
    } finally {
      setRedeemLoading(false);
      setRedeemingDepositId(null);
    }
  };

  // Handler for contract address selection
  const handleContractAddressChange = (value) => {
    setContractAddress(value);
    localStorage.setItem('contractAddress', value);
  };

  const getDurationInMonths = (durationInSeconds) => {
    return Math.round(durationInSeconds / 2629800); // 2629800 seconds in a month (average)
  };

  const formatTermId = (hexString) => {
    try {
      // Try to convert hex string to readable string if it's bytes32
      if (hexString && hexString.startsWith('0x')) {
        return ethers.utils.parseBytes32String(hexString);
      } else {
        return hexString || 'Unknown';
      }
    } catch (error) {
      console.error('Error parsing termId', error);
      return hexString || 'Unknown';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const renderDepositTerms = () => {
    if (loading) {
      return <div className="loading-container"><Spin size="large" /></div>;
    }

    if (!depositTerms || depositTerms.length === 0) {
      return (
        <div className="no-terms-container">
          <Text>No deposit terms available for any Certificate of Deposit contracts.</Text>
        </div>
      );
    }

    const columns = [
      {
        title: 'Bank Name',
        dataIndex: 'bankName',
        key: 'bankName',
      },
      {
        title: 'Contract',
        dataIndex: 'contractAddress',
        key: 'contractAddress',
        render: (address) => <Tooltip title={address}>{formatAddress(address)}</Tooltip>
      },
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
        <div className="contract-selector">
          <Text strong style={{ marginRight: '10px' }}>Filter by Contract:</Text>
          <Select 
            value={contractAddress || 'all'} 
            onChange={handleContractAddressChange}
            style={{ width: '400px' }}
          >
            <Option value="all">All Contracts</Option>
            {allContractAddresses.map(address => (
              <Option key={address} value={address}>
                {bankInfo[address]?.bankName || 'Unknown'}: {formatAddress(address)}
              </Option>
            ))}
          </Select>
        </div>
        <Table 
          dataSource={
            contractAddress === 'all' || !contractAddress
              ? depositTerms
              : depositTerms.filter(term => term.contractAddress === contractAddress)
          }
          columns={columns}
          rowKey={(record) => `${record.contractAddress}-${record.termId}`}
          pagination={false}
        />
      </div>
    );
  };

  const renderUserDeposits = () => {
    if (!walletAddress) {
      return (
        <div className="connect-wallet-prompt">
          <Text>Please connect your wallet to view your deposits.</Text>
          <Button 
            onClick={connectWallet}
            type="primary"
            icon={<WalletOutlined />}
            style={{ marginTop: 16 }}
          >
            Connect Wallet
          </Button>
        </div>
      );
    }

    if (userDepositsLoading) {
      return <div className="loading-container"><Spin size="large" /></div>;
    }

    if (!userDeposits || userDeposits.length === 0) {
      return (
        <div className="no-deposits-container">
          <Text>You don't have any Certificate of Deposits yet.</Text>
          <Button 
            type="primary" 
            onClick={() => setActiveTab('1')}
            style={{ marginTop: 16 }}
          >
            Browse Available CDs
          </Button>
        </div>
      );
    }

    const columns = [
      {
        title: 'Bank',
        dataIndex: 'bankName',
        key: 'bankName',
      },
      {
        title: 'Contract',
        dataIndex: 'contractAddress',
        key: 'contractAddress',
        render: (address) => <Tooltip title={address}>{formatAddress(address)}</Tooltip>
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        render: (amount) => formatCurrency(amount)
      },
      {
        title: 'Term',
        dataIndex: 'termId',
        key: 'term',
        render: (termId) => formatTermId(termId)
      },
      {
        title: 'Purchase Date',
        dataIndex: 'purchaseDate',
        key: 'purchaseDate',
        render: (date) => formatDate(date)
      },
      {
        title: 'Maturity Date',
        dataIndex: 'maturityDate',
        key: 'maturityDate',
        render: (date) => formatDate(date)
      },
      {
        title: 'Expected Interest',
        dataIndex: 'expectedInterest',
        key: 'expectedInterest',
        render: (interest) => formatCurrency(interest)
      },
      {
        title: 'Current Interest',
        dataIndex: 'currentInterest',
        key: 'currentInterest',
        render: (interest) => formatCurrency(interest)
      },
      {
        title: 'Status',
        dataIndex: 'isRedeemed',
        key: 'isRedeemed',
        render: (isRedeemed) => 
          isRedeemed ? <Tag color="volcano">Redeemed</Tag> : <Tag color="green">Active</Tag>
      },
      {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
          <Button 
            type="primary" 
            danger
            onClick={() => handleRedeem(record)}
            loading={redeemLoading && redeemingDepositId === record.depositId}
            disabled={record.isRedeemed}
          >
            Redeem
          </Button>
        )
      }
    ];

    return (
      <div className="user-deposits-container">
        <div className="contract-selector">
          <Text strong style={{ marginRight: '10px' }}>Filter by Contract:</Text>
          <Select 
            value={contractAddress || 'all'} 
            onChange={handleContractAddressChange}
            style={{ width: '400px' }}
          >
            <Option value="all">All Contracts</Option>
            {allContractAddresses.map(address => (
              <Option key={address} value={address}>
                {bankInfo[address]?.bankName || 'Unknown'}: {formatAddress(address)}
              </Option>
            ))}
          </Select>
        </div>
        <Table 
          dataSource={
            contractAddress === 'all' || !contractAddress
              ? userDeposits
              : userDeposits.filter(deposit => deposit.contractAddress === contractAddress)
          } 
          columns={columns}
          rowKey={(record) => `${record.contractAddress}-${record.depositId}`}
          pagination={false}
        />
      </div>
    );
  };

  return (
    <div className="cd-client-container">
      <img src={logo} alt="Logo" style={{ position: 'absolute', top: '20px', left: '20px', height: '80px' }} />
      <Title level={1} style={{ textAlign: 'center', margin: '20px 0 40px' }}>Certificate of Deposit Marketplace</Title>
      
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
      
      <div className="cd-content-container">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="cd-tabs"
        >
          <TabPane tab="Available CDs" key="1">
            {renderDepositTerms()}
          </TabPane>
          <TabPane tab="My Deposits" key="2">
            {renderUserDeposits()}
          </TabPane>
        </Tabs>
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
                <Form.Item label="Bank">
                  <Input value={selectedTerm.bankName} disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Contract Address">
                  <Input value={selectedTerm.contractAddress} disabled />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="Term ID">
                  <Input value={formatTermId(selectedTerm.termId)} disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Term Duration">
                  <Input value={`${getDurationInMonths(selectedTerm.duration)} Months`} disabled />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="Fixed Interest Rate">
                  <Input value={`${selectedTerm.fixedRate / 100}%`} disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
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
              <Row>
                <Col span={12}><Text strong>Maturity Date:</Text></Col>
                <Col span={12}>
                  <Text className="summary-value">
                    {(() => {
                      const today = new Date();
                      const maturity = new Date(today.getTime() + selectedTerm.duration * 1000);
                      return formatDate(maturity);
                    })()}
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
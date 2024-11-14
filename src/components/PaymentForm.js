// PaymentConfirmationForm.js
import React, { useState, useContext } from 'react';
import { Form, Input, Button, Select, Typography } from 'antd';
import { AccountsContext } from './AccountsContext';

const { Option } = Select;
const { Title } = Typography;

const PaymentConfirmationForm = ({ handleConfirm, accounts }) => {
  const { addAccount } = useContext(AccountsContext);
  const [selectedPaymentFromKey, setSelectedPaymentFromKey] = useState('');
  const [selectedLenderAddressKey, setSelectedLenderAddressKey] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [paymentFrom, setPaymentFrom] = useState('');
  const [lenderAddress, setLenderAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [operation, setOperation] = useState('');

  const handleSelectChange = (setter, key, setSelectedKey) => (value) => {
    setSelectedKey(value);
    if (value === 'custom') {
      setter('');
    } else if (accounts[value]) {
      const accountValue = accounts[value].address;
      setter(accountValue);
      localStorage.setItem(key, accountValue);
    }
  };

  const handleCustomAddressChange = (event) => {
    setCustomAddress(event.target.value);
  };

  const handleAddCustomAddress = (setter, key, setSelectedKey) => {
    const [customKey, customValue] = customAddress.split(':');
    addAccount(customKey, customValue, 'borrower');
    setter(customValue);
    setSelectedKey(customKey);
    localStorage.setItem(key, customValue);
    setCustomAddress('');
  };

  const handleInputChange = (setter, key) => (event) => {
    const value = event.target.value;
    setter(value);
    localStorage.setItem(key, value);
  };

  const handleOperationChange = (value) => {
    setOperation(value);
  };

  return (
    <div style={{ backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '20px', color: 'white', width: '60%', maxWidth: '500px', margin: '20px auto' }}>
      <Title level={2} style={{ color: 'white', marginTop: '20px' }}>Payment Confirmation</Title>
      <Form onFinish={handleConfirm}>
        <Form.Item label="Payment From" required>
          <Select
            value={selectedPaymentFromKey}
            onChange={handleSelectChange(setPaymentFrom, 'paymentFrom', setSelectedPaymentFromKey)}
            style={{ width: '100%' }}
          >
            <Option value="">Select an account</Option>
            {Object.entries(accounts).map(([key, value]) => (
              <Option key={key} value={key}>{key}</Option>
            ))}
            <Option value="custom">Enter custom address</Option>
          </Select>
          {selectedPaymentFromKey === 'custom' && (
            <div>
              <Input
                type="text"
                value={customAddress}
                onChange={handleCustomAddressChange}
                placeholder="Enter address in format Name:address"
                style={{ width: '100%', marginTop: '10px' }}
              />
              <Button type="button" onClick={() => handleAddCustomAddress(setPaymentFrom, 'paymentFrom', setSelectedPaymentFromKey)} style={{ marginTop: '10px' }}>
                Add Address
              </Button>
            </div>
          )}
          {paymentFrom && <p>Address: {paymentFrom}</p>}
        </Form.Item>
        <Form.Item label="Payment To" required>
          <Select
            value={selectedLenderAddressKey}
            onChange={handleSelectChange(setLenderAddress, 'lenderAddress', setSelectedLenderAddressKey)}
            style={{ width: '100%' }}
          >
            <Option value="">Select an account</Option>
            {Object.entries(accounts).map(([key, value]) => (
              <Option key={key} value={key}>{key}</Option>
            ))}
            <Option value="custom">Enter custom address</Option>
          </Select>
          {selectedLenderAddressKey === 'custom' && (
            <div>
              <Input
                type="text"
                value={customAddress}
                onChange={handleCustomAddressChange}
                placeholder="Enter address in format Name:address"
                style={{ width: '100%', marginTop: '10px' }}
              />
              <Button type="button" onClick={() => handleAddCustomAddress(setLenderAddress, 'lenderAddress', setSelectedLenderAddressKey)} style={{ marginTop: '10px' }}>
                Add Address
              </Button>
            </div>
          )}
          {lenderAddress && <p>Address: {lenderAddress}</p>}
        </Form.Item>
        <Form.Item label="Amount" required>
          <Input
            type="number"
            value={amount}
            onChange={handleInputChange(setAmount, 'amount')}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label="Contract Address" required>
          <Input
            type="text"
            value={contractAddress}
            onChange={handleInputChange(setContractAddress, 'contractAddress')}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label="Function" required>
          <Select
            value={operation}
            onChange={handleOperationChange}
            style={{ width: '100%' }}
          >
            <Option value="">Select an operation</Option>
            <Option value="interestRepay">Repay Interest</Option>
            <Option value="principalRepay">Repay Principal</Option>
            <Option value="drawdown">Drawdown</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>Confirm</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PaymentConfirmationForm;
import React, { useState } from 'react';
import { Form, Input, Button, InputNumber, Divider, Switch, Select } from 'antd';
import '../css/cddeployment.css';

const { TextArea } = Input;
const { Option } = Select;

const CDForm = ({ cdData, handleInputChange, handleDepositTermChange, handleSubmit, isPremium }) => {
  // const [clientCount, setClientCount] = useState(cdData.clients ? cdData.clients.length : 2);
  const [termCount, setTermCount] = useState(cdData.depositTerms ? cdData.depositTerms.length : 2);

  // const addClient = () => {
  //   const newClient = `Client${clientCount + 1}:0x`;
  //   const updatedClients = [...cdData.clients, newClient];
  //   setClientCount(clientCount + 1);
  //   handleInputChange({ target: { name: 'clients', value: updatedClients } });
  // };

  // const removeClient = (index) => {
  //   if (clientCount > 1) {
  //     const updatedClients = cdData.clients.filter((_, i) => i !== index);
  //     setClientCount(clientCount - 1);
  //     handleInputChange({ target: { name: 'clients', value: updatedClients } });
  //   }
  // };

  const addDepositTerm = () => {
    const newTermId = `ethers.utils.formatBytes32String('TERM${termCount + 1}')`;
    const newTerm = {
      termId: newTermId,
      duration: 2629800, // 1 month in seconds
      fixedRate: 300, // 3.00%
      demandRate: 100, // 1.00%
      isActive: true
    };
    
    const updatedTerms = [...cdData.depositTerms, newTerm];
    setTermCount(termCount + 1);
    handleInputChange({ target: { name: 'depositTerms', value: updatedTerms } });
  };

  const removeDepositTerm = (index) => {
    if (termCount > 1) {
      const updatedTerms = cdData.depositTerms.filter((_, i) => i !== index);
      setTermCount(termCount - 1);
      handleInputChange({ target: { name: 'depositTerms', value: updatedTerms } });
    }
  };

  const durationOptions = [
    { label: '1 month', value: 2629800 },
    { label: '3 months', value: 7889400 },
    { label: '6 months', value: 15778800 },
    { label: '12 months', value: 31557600 },
    { label: '24 months', value: 63115200 },
  ];

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  };

  return (
    <Form
      {...formItemLayout}
      onFinish={handleSubmit}
      className="cd-form"
    >
      <Divider orientation="left">CD Token Information</Divider>
      <Form.Item
        label="CD Name"
        rules={[{ required: true }]}
      >
        <Input
          name="name"
          value={cdData.name}
          onChange={handleInputChange}
          placeholder="Enter CD name"
        />
      </Form.Item>
      
      <Form.Item
        label="Symbol"
        rules={[{ required: true }]}
      >
        <Input
          name="symbol"
          value={cdData.symbol}
          onChange={handleInputChange}
          placeholder="Enter token symbol"
        />
      </Form.Item>
      
      <Form.Item
        label="Initial Supply"
        rules={[{ required: true }]}
      >
        <InputNumber
          name="initialSupply"
          value={cdData.initialSupply}
          onChange={(value) => handleInputChange({ target: { name: 'initialSupply', value } })}
          placeholder="Enter initial supply"
          style={{ width: '100%' }}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
        />
      </Form.Item>

      <Form.Item
        label="Bank Address"
        rules={[{ required: true }]}
      >
        <Input
          name="bankAddress"
          value={cdData.bankAddress}
          onChange={handleInputChange}
          placeholder="BankName:0xAddress"
        />
      </Form.Item>

      <Form.Item
        label="Trusted Third Party"
        rules={[{ required: true }]}
      >
        <Input
          name="trustedThirdParty"
          value={cdData.trustedThirdParty}
          onChange={handleInputChange}
          placeholder="TTPName:0xAddress"
        />
      </Form.Item>

      <Divider orientation="left">Deposit Terms</Divider>
      {cdData.depositTerms && cdData.depositTerms.map((term, index) => (
        <div key={index} className="deposit-term-row">
          <h4>Deposit Term {index + 1}</h4>
          
          <Form.Item label="Term ID">
            <Input
              value={term.termId}
              onChange={(e) => handleDepositTermChange(index, 'termId', e.target.value)}
              placeholder="ethers.utils.formatBytes32String('TERMID')"
            />
          </Form.Item>
          
          <Form.Item label="Duration">
            <Select
              value={term.duration}
              onChange={(value) => handleDepositTermChange(index, 'duration', value)}
              style={{ width: '100%' }}
            >
              {durationOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label} ({option.value} seconds)
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="Fixed Rate (basis points)">
            <InputNumber
              value={term.fixedRate}
              onChange={(value) => handleDepositTermChange(index, 'fixedRate', value)}
              placeholder="Enter fixed rate in basis points (100 = 1%)"
              style={{ width: '100%' }}
              min={0}
              max={2000}
            />
            <div style={{ marginTop: '5px', fontSize: '12px', color: 'gray' }}>
              {term.fixedRate / 100}% (Maturity rate)
            </div>
          </Form.Item>
          
          <Form.Item label="Demand Rate (basis points)">
            <InputNumber
              value={term.demandRate}
              onChange={(value) => handleDepositTermChange(index, 'demandRate', value)}
              placeholder="Enter demand rate in basis points (100 = 1%)"
              style={{ width: '100%' }}
              min={0}
              max={2000}
            />
            <div style={{ marginTop: '5px', fontSize: '12px', color: 'gray' }}>
              {term.demandRate / 100}% (Early withdrawal rate)
            </div>
          </Form.Item>
          
          <Form.Item label="Active">
            <Switch
              checked={term.isActive}
              onChange={(checked) => handleDepositTermChange(index, 'isActive', checked)}
            />
          </Form.Item>
          
          {index > 0 && (
            <Button
              type="danger"
              onClick={() => removeDepositTerm(index)}
              style={{ marginBottom: '10px' }}
            >
              Remove Term
            </Button>
          )}
          
          <Divider />
        </div>
      ))}
      
      <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
        <Button type="dashed" onClick={addDepositTerm} style={{ width: '60%' }}>
          + Add Deposit Term
        </Button>
      </Form.Item>

      {/* <Divider orientation="left">Potential Clients</Divider>
      {cdData.clients && cdData.clients.map((client, index) => (
        <div key={index} className="client-row">
          <Form.Item
            label={`Client ${index + 1}`}
            style={{ marginBottom: '10px' }}
          >
            <Input
              name={`clients[${index}]`}
              value={client}
              onChange={handleInputChange}
              placeholder="ClientName:0xAddress"
              style={{ width: 'calc(100% - 32px)' }}
            />
            {index > 0 && (
              <Button
                type="text"
                danger
                onClick={() => removeClient(index)}
                style={{ marginLeft: '8px' }}
              >
                X
              </Button>
            )}
          </Form.Item>
        </div>
      ))} */}
      
      {/* <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
        <Button type="dashed" onClick={addClient} style={{ width: '60%' }}>
          + Add Client
        </Button>
      </Form.Item> */}

      <Divider orientation="left">Additional Information</Divider>
      <Form.Item
        label="Additional Info"
      >
        <TextArea
          name="ancillaryInfo"
          value={cdData.ancillaryInfo}
          onChange={handleInputChange}
          placeholder="Enter additional information about this CD"
          rows={4}
        />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
        <Button
          type="primary"
          htmlType="submit"
          className="cd-submit-button"
          style={{
            backgroundColor: '#6EA1EB',
            color: '#000',
            borderRadius: '10px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            fontSize: '18px',
            height: '50px',
            width: '180px',
          }}
        >
          Deploy CD Token
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CDForm;
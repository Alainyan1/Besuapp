import React from 'react';
import { Form, Input, Button } from 'antd';

const BondForm = ({ loanData, handleInputChange, handleSubmit }) => {
  return (
    <Form onFinish={handleSubmit} layout="horizontal">
      <Form.Item label="Bond Name" name="name" initialValue={loanData.name} rules={[{ required: true }]} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Input name="name" onChange={handleInputChange} />
      </Form.Item>

      <Form.Item label="Symbol" name="symbol" initialValue={loanData.symbol} rules={[{ required: true }]} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Input name="symbol" onChange={handleInputChange} />
      </Form.Item>

      <Form.Item label="Initial Supply" name="initialSupply" initialValue={loanData.initialSupply} rules={[{ required: true }]} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Input type="number" name="initialSupply" onChange={handleInputChange} />
      </Form.Item>

      <Form.Item label="Interest Rate" name="interestRate" initialValue={loanData.interestRate} rules={[{ required: true }]} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Input type="number" name="interestRate" onChange={handleInputChange} addonAfter="%" />
      </Form.Item>

      <Form.Item label="Maturity Date" name="maturityDate" initialValue={loanData.maturityDate} rules={[{ required: true }]} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Input type="date" name="maturityDate" onChange={handleInputChange} />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
        <Button type="primary" htmlType="submit">Deploy</Button>
      </Form.Item>
    </Form>
  );
};

export default BondForm;
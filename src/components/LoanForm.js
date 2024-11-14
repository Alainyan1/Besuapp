import React from 'react';
import { Form, Input, Button } from 'antd';
import '../css/LoanForm.css'; // Import the CSS file

const { TextArea } = Input;

const LoanForm = ({ loanData, handleInputChange, handleSubmit }) => {
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Form onFinish={handleSubmit} layout="horizontal" style={{ width: '50%' }}>
        <Form.Item label={<label style={ {color: "#000", fontSize: "18px"}}> Company Name </label>} name="name" initialValue={loanData.name} rules={[{ required: true }]} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Input name="name" onChange={handleInputChange} style={{ height: '40px', backgroundColor: '#000', color: '#fff', fontSize: '16px' }} />
        </Form.Item>

        <Form.Item label={<label style={ {color: "#000", fontSize: "18px"}}> Symbol </label>} name="symbol" initialValue={loanData.symbol} rules={[{ required: true }]} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Input name="symbol" onChange={handleInputChange} style={{ height: '40px', backgroundColor: '#000', color: '#fff', fontSize: '16px' }} />
        </Form.Item>

        <Form.Item label={<label style={ {color: "#000", fontSize: "18px"}}> Initial Supply </label>} name="initialSupply" initialValue={loanData.initialSupply} rules={[{ required: true }]} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Input type="number" name="initialSupply" onChange={handleInputChange} style={{ height: '40px', backgroundColor: '#000', color: '#fff', fontSize: '16px' }} />
        </Form.Item>

        <Form.Item label={<label style={ {color: "#000", fontSize: "18px"}}> Interest Rate (%) </label>} name="interestRate" initialValue={loanData.interestRate} rules={[{ required: true }]} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Input type="number" name="interestRate" onChange={handleInputChange} style={{ height: '40px', backgroundColor: '#000', color: '#fff', fontSize: '16px' }} />
        </Form.Item>

        <Form.Item label={<label style={{ color: "#000", fontSize: "18px" }}> Lenders </label>} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} rules={[{ required: true }]}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ width: '70%', textAlign: 'center', fontSize: '18px', color: '#000' }}>Lender</div>
            <div style={{ width: '30%', textAlign: 'center', fontSize: '18px', color: '#000' }}>Amount</div>
          </div>
          {loanData.buyers.map((buyer, index) => (
            <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
              <Input
                name={`buyers[${index}]`}
                value={buyer}
                onChange={handleInputChange}
                placeholder="Lender"
                style={{ height: '40px', backgroundColor: '#000', color: '#fff', fontSize: '16px', width: '75%', marginRight: '10px' }}
              />
              <Input
                type="number"
                name={`amounts[${index}]`}
                value={loanData.amounts[index]}
                onChange={handleInputChange}
                placeholder="Amount"
                style={{ height: '40px', backgroundColor: '#000', color: '#fff', fontSize: '16px', width: '25%' }}
              />
            </div>
          ))}
        </Form.Item>

        <Form.Item label={<label style={ {color: "#000", fontSize: "18px"}}> Escrow Account </label>} name="escrow" initialValue={loanData.escrow} rules={[{ required: true }]} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Input name="escrow" onChange={handleInputChange} style={{ height: '40px', backgroundColor: '#000', color: '#fff', fontSize: '16px' }} />
        </Form.Item>

        <Form.Item label={<label style={ {color: "#000", fontSize: "18px"}}> Ancillary Information </label>} name="ancillaryInfo" initialValue={loanData.ancillaryInfo} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <TextArea name="ancillaryInfo" rows={4} onChange={handleInputChange} style={{ backgroundColor: '#000', color: '#fff', fontSize: '16px' }} />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 18 }} style={{ textAlign: 'center' }}>
          <Button type="primary" htmlType="submit" style={{
            backgroundColor: '#000', // 背景颜色设为黑色
            borderColor: '#000', // 边框颜色设为黑色
            color: '#fff', // 字体颜色设为白色
            padding: '15px 30px', // 增大内边距，使按钮整体变大
            fontSize: '24px', // 墛大按钮的字体
            height: '40px', // 增加按钮的高度
            borderRadius: '15px', // 设置按钮的圆角
            width: '200px'
          }}>Issue</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoanForm;
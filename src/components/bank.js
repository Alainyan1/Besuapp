import React, { useState } from 'react';
//import './App.css'; // 引入自定义的CSS文件

function Bank() {
    const [receiver, setReceiver] = useState('');
    const [amount, setAmount] = useState(0);
    const [operation, setOperation] = useState('');
    
  
    const handleReceiverChange = (e) => {
      setReceiver(e.target.value);
    };
  
    const handleAmountChange = (e) => {
      setAmount(Number(e.target.value));
    };
  
    const handleOperationChange = (e) => {
      setOperation(e.target.value);
    };
  
    const handleTransfer = () => {
      if (receiver && amount > 0 && operation) {
        console.log('Transfer details:', { receiver, amount, operation });
        // 这里可以添加实际的转账逻辑
      } else {
        alert('Please fill in all fields.');
      }
    };
  
    return (
      <div className="app-container">
        <div className="form-container">
          <h1>CBDC Transfer</h1>
          <div className="form-group">
            <label htmlFor="receiver">Receiver</label>
            <input type="text" id="receiver" value={receiver} onChange={handleReceiverChange} placeholder="Please input receiver" />
          </div>
          <div className="form-group">
            <label htmlFor="operation">Operation List</label>
            <select id="operation" value={operation} onChange={handleOperationChange} className="form-control">
              <option value="">Select an operation</option>
              <option value="Interest Repay">Interest Repay</option>
              <option value="Principal Repay">Principal Repay</option>
              <option value="Novation">Novation</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input type="number" id="amount" value={amount} onChange={handleAmountChange} />
          </div>
          <button className="transfer-button" onClick={handleTransfer}>Transfer</button>
        </div>
      </div>
    );
}

export default Bank;
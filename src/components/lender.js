import React, { useState } from 'react';

function LoanTransfer() {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (receiver && amount > 0 && operation) {
      console.log('Transfer details:', { receiver, amount, operation });
      // 这里可以添加实际的转账逻辑
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>Loan Transfer</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="receiver">To</label>
            <input
              type="text"
              id="receiver"
              value={receiver}
              onChange={handleReceiverChange}
              placeholder="Please enter the receiver"
            />
          </div>
          <div className="form-group">
            <label htmlFor="operation">Operation List</label>
            <select
              id="operation"
              value={operation}
              onChange={handleOperationChange}
              className="form-control"
            >
              <option value="">Select an operation</option>
              <option value="interestRepay">Interest Repay</option>
              <option value="principalRepay">Principal Repay</option>
              <option value="novation">Novation</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              min="0"
            />
          </div>
          <button type="submit" className="transfer-button">Transfer</button>
        </form>
      </div>
    </div>
  );
}

export default LoanTransfer;
import React, { useState } from 'react';
import axios from 'axios';

const Aift = () => {
  const [loans, setLoans] = useState([]);
  const [inputContractAddress, setInputContractAddress] = useState('');
  const [contractAddress, setContractAddress] = useState('');

  const fetchLoans = async (address) => {
    try {
      const response = await axios.get('http://20.2.203.99:3002/api/getAllBalances', {
        params: {
          contractAddress: address,
        },
      });
      console.log('Loans response:', response.data);
      const loansData = response.data.map((loan) => ({
        lender: loan.account,
        allocated: loan.allocation,
        lensed: loan.balancePrincipal,
        interest: loan.balanceInterest,
      }));
      console.log('Loans data:', loansData);
      setLoans(loansData);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const handleFetchLoans = () => {
    setContractAddress(inputContractAddress);
    fetchLoans(inputContractAddress);
  };

  return (
    <div className="aift-container">
      <h1>Tokenized Loan Platform</h1>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="contractAddress">Contract Address:</label>
        <input
          type="text"
          id="contractAddress"
          value={inputContractAddress}
          onChange={(e) => setInputContractAddress(e.target.value)}
          style={{ marginLeft: '10px', padding: '5px', width: '350px' }}
        />
        <button onClick={handleFetchLoans} style={{ marginLeft: '10px', padding: '5px 10px' }}>Fetch</button>
      </div>
      <h2>Contract Address: {contractAddress || 'N/A'}</h2>
      <div className="table-container">
        <table className="loan-table">
          <thead>
            <tr>
              <th>Lender</th>
              <th>Allocated</th>
              <th>Lensed</th>
              <th>Lender Operation</th>
              <th>Borrower Operation</th>
              <th>Interest</th>
              <th>Borrower Operation</th>
            </tr>
          </thead>
          <tbody>
            {loans.length > 0 ? (
              loans.map((loan, index) => (
                <tr key={index}>
                  <td>{loan.lender}</td>
                  <td>{loan.allocated}</td>
                  <td>{loan.lensed}</td>
                  <td>
                    <button>Fund</button>
                  </td>
                  <td>
                    <button>Repay</button>
                  </td>
                  <td>{loan.interest}</td>
                  <td>
                    <button>Repay</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No loans available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Aift;
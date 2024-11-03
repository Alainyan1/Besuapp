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
      const loansData = Object.entries(response.data).map(([address, allocated]) => ({
        lender: address,
        allocated: allocated,
        lensed: 0,
        interest: 0,
      }));
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
    <div>
      <h1>Tokenized loan Platform</h1>
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
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ backgroundColor: '#2c7be5', color: 'white', padding: '10px' }}>Lender</th>
                <th style={{ backgroundColor: '#2c7be5', color: 'white', padding: '10px' }}>Allocated</th>
                <th style={{ backgroundColor: '#2c7be5', color: 'white', padding: '10px' }}>Lensed</th>
                <th style={{ backgroundColor: '#2c7be5', color: 'white', padding: '10px' }}>Lender Operation</th>
                <th style={{ backgroundColor: '#2c7be5', color: 'white', padding: '10px' }}>Borrower</th>
                <th style={{ backgroundColor: '#2c7be5', color: 'white', padding: '10px' }}>Interest</th>
                <th style={{ backgroundColor: '#2c7be5', color: 'white', padding: '10px' }}>Borrower</th>
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
  );
};

export default Aift;
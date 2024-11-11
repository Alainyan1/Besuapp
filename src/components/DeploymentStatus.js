import React from 'react';
import { useLocation } from 'react-router-dom';

const DeploymentStatus = () => {
  const location = useLocation();
  const { status, address } = location.state || {};

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {status === 'deploying' && <h2>Contract is deploying...</h2>}
      {status === 'success' && (
        <div>
          <h2>Contract Deployment Successful</h2>
          <p>Contract Address: {address}</p>
        </div>
      )}
      {status === 'error' && <h2>Contract Deployment Failed</h2>}
    </div>
  );
};

export default DeploymentStatus;
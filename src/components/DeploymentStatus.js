import React from 'react';
import { useLocation } from 'react-router-dom';
import '../css/deploymentStatus.css';
import logo from '../images/cspro.png';

const DeploymentStatus = () => {
  const location = useLocation();
  const { status, address } = location.state || {};

  return (
    <div className='status-page-container' style={{ textAlign: 'center', marginTop: '20px' }}>
      <img src={logo} alt="Logo" style={{ position: 'absolute', top: '30px', left: '30px', height: '80px' }} />
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
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css'; // 引入CSS文件
import LoanDeployment from './components/loanDeployment'; // 引入组件
import Jetco from './components/jetco'; // 引入Jetco组件
import Aift from './components/aift'; // 引入Aift组件
import Bank from './components/bank'; // 引入Bank组件
import LoanTransfer from './components/lender';
import DeploymentStatus from './components/DeploymentStatus'; // 引入DeploymentStatus组件
import { ContractProvider } from './components/ContractContext'; // 引入ContractProvider
import { AccountsProvider } from './components/AccountsContext'; // 引入AccountsProvider

function App() {
  return (
    <ContractProvider>
      <AccountsProvider>
        <Router>
          <div className="container">
            <nav>
              <ul className="nav-links">
                <li>
                  <Link to="/">CSPro</Link>
                </li>
                <li>
                  <Link to="/jetco">JETCO</Link>
                </li>
                <li>
                  <Link to="/aift">AIFT</Link>
                </li>
                <li>
                  <Link to="/bank">Bank</Link>
                </li>
                <li>
                  <Link to="/lender">Lender</Link>
                </li>
              </ul>
            </nav>
            <Routes>
              <Route path="/" element={<LoanDeployment />} />
              <Route path="/jetco" element={<Jetco />} />
              <Route path="/aift" element={<Aift />} />
              <Route path="/bank" element={<Bank />} />
              <Route path="/lender" element={<LoanTransfer />} />
              <Route path="/deployment-status" element={<DeploymentStatus />} />
            </Routes>
          </div>
        </Router>
      </AccountsProvider>
    </ContractProvider>
  );
}

export default App;
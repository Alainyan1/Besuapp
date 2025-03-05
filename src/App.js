import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css'; // 引入CSS文件
import LoanDeployment from './components/loanDeployment'; // 引入组件
import Jetco from './components/jetco'; // 引入Jetco组件
import Aift from './components/aift'; // 引入Aift组件
import Bank from './components/bank'; // 引入Bank组件
import LoanTransfer from './components/lender';
import LenderAll from './components/LenderAll'; // 引入LenderAll组件
import AiftRouter from './components/AiftRouter'; // 引入AiftRouter组件
import IssuerInfo from './components/IssuerInfo';
import BorrowInfo from './components/BorrowInfo';
import Asset from './components/Asset';
import LenderDetails from './components/LenderDetails';
import ViewConfiguration from './components/viewConfiguration'; // 引入ViewConfiguration组件
import DeploymentStatus from './components/DeploymentStatus'; // 引入DeploymentStatus组件
import { ContractProvider } from './components/ContractContext'; // 引入ContractProvider
import { AccountsProvider } from './components/AccountsContext'; // 引入AccountsProvider

import TdToken from './components/tdtoken'; // 引入TdToken组件
import TokenSelector from './components/TokenSelector'; // 引入TokenSelector组件
import CDDeployment from './components/CdDeployment'; // 引入CDDeployment组件
import CDClient from './components/CdClient';
import CdToken from './components/cdtoken';

function App() {
  return (
    <ContractProvider>
      <AccountsProvider>
        <Router>
          <div className="container">
            {/* <nav>
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
            </nav> */}
            <Routes>
              <Route path="/" element={<LoanDeployment />} />
              <Route path="/jetco" element={<Jetco />} />
              <Route path="/aift" element={<Aift />} />
              <Route path="/bank" element={<Bank />} />
              <Route path="/lender" element={<LoanTransfer />} />
              <Route path="/deployment-status" element={<DeploymentStatus />} />
              <Route path="/lenderInfo" element={<LenderAll />} />
              <Route path="/aift-router" element={<AiftRouter />} />
              <Route path="/issuer" element={<IssuerInfo />} />
              <Route path="/configuration" element={<ViewConfiguration />} />
              <Route path="/borrower" element={<BorrowInfo />} />
              <Route path="/asset" element={<Asset />} />
              <Route path="/lender-details" element={<LenderDetails />} />
              <Route path="/tdtoken" element={<TdToken />} />
              <Route path="/token" element={<TokenSelector/>} />
              <Route path="/cd" element={<CDDeployment />} />
              <Route path="/cdclient" element={<CDClient />} />
              <Route path="/cdtoken" element={<CdToken />} />
            </Routes>
          </div>
        </Router>
      </AccountsProvider>
    </ContractProvider>
  );
}

export default App;
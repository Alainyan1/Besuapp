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


// deposit相关组件
import TdToken from './components/tdtoken'; // 引入TdToken组件
import TokenSelector from './components/TokenSelector'; // 引入TokenSelector组件
import CDDeployment from './components/CdDeployment'; // 引入CDDeployment组件
import CDClient from './components/CdClient';
import CdToken from './components/cdtoken';
import Cdstatus from './components/cdStatus';
import CdPlatform from './components/CdPlatform';
import Cdbank from './components/cdbank';
import TdPlatform from './components/tdplatform';

const routes = [
  // CSPro 相关路由
  { path: "/", element: <LoanDeployment />, title: "CSPro | Aequitas Platform" },
  { path: "/jetco", element: <Jetco />, title: "JETCO | Aequitas Platform" },
  { path: "/aift", element: <Aift />, title: "AIFT | Aequitas Platform" },
  { path: "/bank", element: <Bank />, title: "Bank | Aequitas Platform" },
  { path: "/lender", element: <LoanTransfer />, title: "Lender | Aequitas Platform" },
  { path: "/deployment-status", element: <DeploymentStatus />, title: "Deployment Status | Aequitas Platform" },
  { path: "/lenderInfo", element: <LenderAll />, title: "Lender Information | Aequitas Platform" },
  { path: "/aift-router", element: <AiftRouter />, title: "AIFT Router | Aequitas Platform" },
  { path: "/issuer", element: <IssuerInfo />, title: "Issuer Information | Aequitas Platform" },
  { path: "/configuration", element: <ViewConfiguration />, title: "Configuration | Aequitas Platform" },
  { path: "/borrower", element: <BorrowInfo />, title: "Borrower Information | Aequitas Platform" },
  { path: "/asset", element: <Asset />, title: "Asset | Aequitas Platform" },
  { path: "/lender-details", element: <LenderDetails />, title: "Lender Details | Aequitas Platform" },
  
  // CD 相关路由
  { path: "/cdplatform", element: <CdPlatform />, title: "Aequitas Tokenized Asset Platform" },
  { path: "/token", element: <TokenSelector />, title: "Aequitas Tokenized Asset Platform" },
  { path: "/tokenselector", element: <TokenSelector />, title: "Aequitas Tokenized Asset Platform" },
  { path: "/cd", element: <CDDeployment />, title: "Aequitas Tokenized Asset Platform" },
  { path: "/cdclient", element: <CDClient />, title: "Aequitas Tokenized Asset Platform" },
  { path: "/cdbank", element: <Cdbank />, title: "Aequitas Tokenized Asset Platform" },
  { path: "/cdtoken", element: <CdToken />, title: "Aequitas Tokenized Asset Platform" },
  { path: "/cdstatus", element: <Cdstatus />, title: "Aequitas Tokenized Asset Platform" },
  
  // TD 相关路由
  { path: "/tdplatform", element: <TdPlatform />, title: "JETCO Tokenized Deposit System" },
  { path: "/tdtoken", element: <TdToken />, title: "JETCO Tokenized Deposit System" },
];

export default routes;
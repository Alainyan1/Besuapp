import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import routes from './routes';
import { ContractProvider } from './components/ContractContext'; // 引入ContractProvider
import { AccountsProvider } from './components/AccountsContext'; // 引入AccountsProvider

// 标题更新组件
function TitleUpdater() {
  const location = useLocation();
  
  useEffect(() => {
    const currentRoute = routes.find(route => route.path === location.pathname);
    if (currentRoute) {
      document.title = currentRoute.title;
    }
  }, [location]);
  
  return null;
}

function App() {
  return (
    <ContractProvider>
      <AccountsProvider>
        <Router>
          <TitleUpdater />
          <div className="container">
            <Routes>
              {routes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}
            </Routes>
          </div>
        </Router>
      </AccountsProvider>
    </ContractProvider>
  );
}

export default App;
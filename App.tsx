import React from 'react';
import { AppProvider, useApp } from './context';
import { LoginPage } from './pages/Login';
import { MainApp } from './pages/MainApp';
import { BottomNavigation } from './components/Navigation';

const AppContent: React.FC = () => {
  const { isLoggedIn } = useApp();

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <>
      <MainApp />
      <BottomNavigation />
    </>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;

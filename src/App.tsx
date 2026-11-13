import React from 'react';
import { FinanceProvider, useFinance } from './context';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { Header } from './components/common/Header';
import { Toast } from './components/common/Toast';
import { FontNotice } from './components/common/FontNotice';
import { DashboardView } from './views/DashboardView';
import { TransactionsView } from './views/TransactionsView';
import { ModeHematView } from './views/ModeHematView';

const MainApp: React.FC = () => {
  const { currentView } = useFinance();

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#343F56]">
      {/* Desktop Sidebar (Fixed left ~220px) */}
      <Sidebar />

      {/* Mobile Top Bar */}
      <Header />

      {/* Main Content Area (offset by 220px on desktop, max-w 1280px, padding ~40px) */}
      <main className="md:pl-[220px] transition-all">
        <div className="max-w-[1280px] mx-auto px-5 py-6 md:px-10 md:py-9">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'transactions' && <TransactionsView />}
          {currentView === 'mode-hemat' && <ModeHematView />}

          {/* Typography & System Notice */}
          <FontNotice />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Feedback Toast */}
      <Toast />
    </div>
  );
};

export function App() {
  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
}

export default App;

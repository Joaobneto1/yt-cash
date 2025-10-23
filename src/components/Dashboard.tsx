import { useState } from 'react';
import Sidebar from './Sidebar';
import HomePage from './pages/HomePage';
import EvaluatePage from './pages/EvaluatePage';
import AICoachPage from './pages/AICoachPage';
import HistoryPage from './pages/HistoryPage';
import ProgressPage from './pages/ProgressPage';
import WithdrawPage from './pages/WithdrawPage';
import RefundPage from './pages/RefundPage';
import SupportPage from './pages/SupportPage';

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'evaluate':
        return <EvaluatePage />;
      case 'ai-coach':
        return <AICoachPage />;
      case 'history':
        return <HistoryPage />;
      case 'progress':
        return <ProgressPage />;
      case 'withdraw':
        return <WithdrawPage />;
      case 'refund':
        return <RefundPage />;
      case 'support':
        return <SupportPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-white flex">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 lg:ml-60 pt-20 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

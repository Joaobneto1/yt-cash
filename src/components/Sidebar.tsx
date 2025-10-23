import { useState } from 'react';
import { Home, Video, Bot, History, TrendingUp, DollarSign, RotateCcw, HelpCircle, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavItem {
  icon: any;
  text: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, text: 'Home', path: 'home' },
  { icon: Video, text: 'Evaluate', path: 'evaluate' },
  { icon: Bot, text: 'AI Coach', path: 'ai-coach' },
  { icon: History, text: 'History', path: 'history' },
  { icon: TrendingUp, text: 'Progress', path: 'progress' },
  { icon: DollarSign, text: 'Withdraw', path: 'withdraw' },
  { icon: RotateCcw, text: 'Refund', path: 'refund' },
  { icon: HelpCircle, text: 'Support', path: 'support' },
];

interface SidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export default function Sidebar({ currentPage = 'home', onNavigate }: SidebarProps) {
  const { userProfile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b-4 border-red-600 z-50 shadow-xl">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 rounded-full p-2">
              <span className="text-xl">🎬</span>
            </div>
            <div>
              <h1 className="text-base font-black text-red-600">YouTube Rewards</h1>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-red-600 text-white p-2 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 mt-16"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-white w-64 h-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b-2 border-red-200">
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">Welcome</p>
                <p className="text-sm font-bold text-red-600 truncate">{userProfile?.name || 'Guest'}</p>
              </div>
            </div>
            <nav className="flex-1 py-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.path;

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-all ${
                      isActive
                        ? 'bg-red-600 text-white border-l-4 border-red-800 font-bold'
                        : 'text-gray-700 hover:bg-red-50 hover:text-red-600 font-semibold'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.text}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t-2 border-red-200">
              <button
                onClick={signOut}
                className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-60 bg-white border-r-4 border-red-600 shadow-xl flex-col">
        <div className="p-6 border-b-2 border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-600 rounded-full p-2">
              <span className="text-2xl">🎬</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-red-600">YouTube</h1>
              <p className="text-xs font-bold text-gray-600">Rewards</p>
            </div>
          </div>
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-700 mb-1">Welcome</p>
            <p className="text-sm font-bold text-red-600 truncate">{userProfile?.name || 'Guest'}</p>
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full px-6 py-3 flex items-center gap-3 transition-all ${
                  isActive
                    ? 'bg-red-600 text-white border-l-4 border-red-800 font-bold'
                    : 'text-gray-700 hover:bg-red-50 hover:text-red-600 font-semibold'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.text}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t-2 border-red-200">
          <button
            onClick={signOut}
            className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

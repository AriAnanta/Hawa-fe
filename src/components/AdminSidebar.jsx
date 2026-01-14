import { useState, useEffect } from 'react';
import { LogOut, Users, Database, LayoutDashboard, X, MessageSquare } from 'lucide-react';
import { authService } from '../services/auth';
import PropTypes from 'prop-types';

export default function AdminSidebar({ isOpen, onClose }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  const currentUser = authService.getCurrentUser();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current page from hash
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 350);
    const updateActiveMenu = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'admin') {
        setActiveMenu('dashboard');
      } else if (hash === 'admin/users') {
        setActiveMenu('users');
      } else if (hash === 'admin/iot-data') {
        setActiveMenu('iot-data');
      } else if (hash === 'admin/feedback') {
        setActiveMenu('feedback');
      }
    };

    // Update saat mount
    updateActiveMenu();

    // Listen untuk hash changes
    window.addEventListener('hashchange', updateActiveMenu);

    return () => {
      window.removeEventListener('hashchange', updateActiveMenu);
      clearTimeout(timer);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.hash = '#login';
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', hash: '#admin' },
    { id: 'users', icon: Users, label: 'Users', hash: '#admin/users' },
    { id: 'iot-data', icon: Database, label: 'IoT Data', hash: '#admin/iot-data' },
    { id: 'feedback', icon: MessageSquare, label: 'Community Feedback', hash: '#admin/feedback' }
  ];

  const handleMenuClick = (hash) => {
    window.location.hash = hash;
    onClose();
  };

  return (
    <>
      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky lg:top-0 inset-y-0 left-0 z-40
        w-64 bg-white border-r border-gray-200 shadow-lg
        transform transition-transform duration-300 ease-in-out
        h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
            <div className="flex items-center space-x-2">
              <img 
                src="/logo_hawa_fix.png" 
                alt="HAWA Logo" 
                className="h-8 w-auto object-contain"
              />
              <span className="text-xl font-black text-gray-900">HAWA</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Sidebar Navigation Menu - Scrollable */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto min-h-0">
            {isLoading
              ? Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={`admin-skel-${idx}`}
                    className="h-11 rounded-xl bg-gray-100 border border-gray-200 animate-pulse"
                  />
                ))
              : menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item.hash)}
                      className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                    transition-all duration-300 relative group
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }
                  `}
                    >
                      <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'} />
                      <span className="font-medium text-sm">{item.label}</span>
                      {isActive && (
                        <div className="absolute right-3">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
          </nav>

          {/* User Info & Logout - Sticky di bagian bawah */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            {currentUser ? (
              <div className="mb-3 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-1">
                  <Users className="text-blue-600" size={16} />
                  <p className="text-xs text-gray-500">Selamat Datang</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {currentUser.name || currentUser.email || 'Admin'}
                </p>
              </div>
            ) : (
              <div className="mb-3 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm space-y-2 animate-pulse">
                <div className="h-3 w-20 bg-gray-100 rounded" />
                <div className="h-3 w-32 bg-gray-100 rounded" />
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all duration-300 text-sm font-medium shadow-sm"
            >
              <LogOut size={16} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        ></div>
      )}
    </>
  );
}

AdminSidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func
};


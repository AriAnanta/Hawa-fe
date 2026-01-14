import { useEffect, useState } from 'react';
import { LogOut, Users, LayoutDashboard, Map, User, Factory, MessageSquare } from 'lucide-react';
import { authService } from '../services/auth';
import PropTypes from 'prop-types';

export default function UserSidebar({ isOpen, onClose }) {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#landing');
  const [isLoading, setIsLoading] = useState(true);
  const userRole = typeof currentUser?.role === 'string' ? currentUser.role.toLowerCase() : currentUser?.role;
  
  // Base menu items for all users
  const baseNavItems = [
    { label: 'Dashboard', hash: '#dashboard', icon: LayoutDashboard },
    { label: 'Map Pollutan', hash: '#map', icon: Map },
    { label: 'Community Reports', hash: '#community', icon: MessageSquare }
  ];
  
  // Add Compliance menu for industry users
  const navItems = userRole === 'industry' 
    ? [...baseNavItems, { label: 'Compliance', hash: '#compliance', icon: Factory }]
    : baseNavItems;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 350);
    const onHashChange = () => setCurrentHash(window.location.hash || '#landing');
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      clearTimeout(timer);
    };
  }, []);

  // Ensure we have the freshest user (with role) for role-based menu rendering
  useEffect(() => {
    let cancelled = false;

    const syncUser = async () => {
      const stored = authService.getCurrentUser();
      if (stored?.role) {
        setCurrentUser(stored);
        setIsLoading(false);
        return;
      }

      if (!authService.isAuthenticated()) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await authService.getProfile();
        if (!cancelled && profile) {
          setCurrentUser(profile);
        }
      } catch (err) {
        console.error('Failed to refresh user profile for sidebar:', err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    syncUser();

    return () => {
      cancelled = true;
    };
  }, []);
  
  const handleLogout = () => {
    authService.logout();
    window.location.hash = '#login';
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto min-h-0">
            {isLoading
              ? Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={`skeleton-${idx}`}
                    className="h-11 rounded-xl bg-gray-100 border border-gray-200 animate-pulse"
                  />
                ))
              : navItems.map(({ label, hash, icon: Icon }) => {
                  const isActive = currentHash === hash;
                  return (
                    <button
                      key={hash}
                      onClick={() => {
                        window.location.hash = hash;
                        if (onClose) onClose();
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all shadow-sm ${
                        isActive
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-500'} />
                        <span className="text-sm font-semibold">{label}</span>
                      </div>
                      {isActive && (
                        <span className="text-[11px] font-semibold text-blue-600 bg-white border border-blue-200 px-2 py-0.5 rounded-full">
                          Aktif
                        </span>
                      )}
                    </button>
                  );
                })}
          </nav>

          {/* Footer removed: logout handled via top navbar dropdown */}
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

UserSidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func
};


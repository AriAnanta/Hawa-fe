import { useMemo, useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import PropTypes from 'prop-types';
import { authService } from '../services/auth';

export default function ProfileDropdown({ className = '' }) {
  const user = useMemo(() => authService.getCurrentUser() || {}, []);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const initials = (user.full_name || user.name || user.email || 'U')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    authService.logout();
    window.location.hash = '#login';
  };

  const handleProfile = () => {
    window.location.hash = '#profile';
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 px-3 py-2 rounded-full border border-gray-200 bg-white shadow-sm hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center text-sm font-bold">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
            {user.full_name || user.name || 'User'}
          </span>
          <span className="text-[11px] text-gray-500 truncate max-w-[140px]">
            {user.email || user.phone_e164 || 'Profil'}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50 animate-fade-in">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.full_name || user.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email || 'Profil'}</p>
          </div>
          <div className="py-1">
            <button
              onClick={handleProfile}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-blue-50 text-gray-800 transition-colors"
            >
              <Settings size={16} className="text-blue-600" />
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-red-50 text-gray-800 transition-colors"
            >
              <LogOut size={16} className="text-red-600" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

ProfileDropdown.propTypes = {
  className: PropTypes.string
};






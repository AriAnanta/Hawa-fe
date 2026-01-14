import { useState } from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import ProfileDropdown from './ProfileDropdown';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 flex">
      {/* Admin Sidebar */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation Bar - Sticky */}
        <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden text-gray-700 hover:text-blue-600 transition-colors duration-300 p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu size={24} />
                </button>
                <div className="flex items-center space-x-2">
                  <img 
                    src="/logo_hawa_fix.png" 
                    alt="HAWA Logo" 
                    className="h-6 w-auto object-contain"
                  />
                </div>
              </div>

              <ProfileDropdown />
            </div>
          </div>
        </nav>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node
};


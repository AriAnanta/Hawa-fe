import { useState, useEffect } from 'react';
import HawaLanding from '../pages/HawaLanding.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Profile from '../pages/Profile.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import AdminUsers from '../pages/AdminUsers.jsx';
import AdminIoTData from '../pages/AdminIoTData.jsx';
import AdminFeedback from '../pages/AdminFeedback.jsx';
import MapPollutan from '../pages/MapPollutan.jsx';
import CompliancePage from '../pages/CompliancePage.jsx';
import CommunityPage from '../pages/CommunityPage.jsx';
import SplashScreen from '../components/SplashScreen.jsx';
import { authService } from '../services/auth.js';

export default function AppRouter() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [pageKey, setPageKey] = useState(0);
  const [showSplash, setShowSplash] = useState(true);

  // Function to get current page from hash
  const getPageFromHash = () => {
    const hash = window.location.hash.slice(1);
    if (
      hash === 'login' ||
      hash === 'register' ||
      hash === 'dashboard' ||
      hash === 'profile' ||
      hash === 'compliance' ||
      hash === 'community' ||
      hash === 'admin' ||
      hash === 'admin/users' ||
      hash === 'admin/iot-data' ||
      hash === 'admin/feedback' ||
      hash === 'map'
    ) {
      return hash;
    }
    return 'landing';
  };

  useEffect(() => {
    // Check authentication status (for future use if needed)
    const checkAuth = () => {
      // Auth check is done inline where needed
      authService.isAuthenticated();
    };

    // Set initial page from hash
    const initialPage = getPageFromHash();
    
    // Redirect to login if trying to access dashboard without auth
    if ((initialPage === 'dashboard' || initialPage === 'profile' || initialPage === 'map' || initialPage === 'compliance' || initialPage === 'community') && !authService.isAuthenticated()) {
      setCurrentPage('login');
      window.location.hash = '#login';
    } else if ((initialPage === 'admin' || initialPage === 'admin/users' || initialPage === 'admin/iot-data') && !authService.isAuthenticated()) {
      // Redirect to login if trying to access admin without auth
      setCurrentPage('login');
      window.location.hash = '#login';
    } else if ((initialPage === 'admin' || initialPage === 'admin/users' || initialPage === 'admin/iot-data' || initialPage === 'admin/feedback') && !authService.isAdmin()) {
      // Redirect to dashboard if not admin
      setCurrentPage('dashboard');
      window.location.hash = '#dashboard';
    } else {
      setCurrentPage(initialPage);
    }
    
    // Set initial key untuk semua halaman
    setPageKey(Date.now());

    // Listen for hash changes
    const handleHashChange = () => {
      const newPage = getPageFromHash();
      
      // Protect dashboard route
      if ((newPage === 'dashboard' || newPage === 'profile' || newPage === 'map' || newPage === 'compliance' || newPage === 'community') && !authService.isAuthenticated()) {
        setCurrentPage('login');
        window.location.hash = '#login';
        return;
      }
      
      // Protect admin routes
      if ((newPage === 'admin' || newPage === 'admin/users' || newPage === 'admin/iot-data' || newPage === 'admin/feedback') && !authService.isAuthenticated()) {
        setCurrentPage('login');
        window.location.hash = '#login';
        return;
      }
      
      if ((newPage === 'admin' || newPage === 'admin/users' || newPage === 'admin/iot-data' || newPage === 'admin/feedback') && !authService.isAdmin()) {
        setCurrentPage('dashboard');
        window.location.hash = '#dashboard';
        return;
      }
      
      // Reset key untuk force re-render dan reset animasi setiap kali pindah halaman
      if (
        newPage === 'login' ||
        newPage === 'register' ||
        newPage === 'dashboard' ||
        newPage === 'profile' ||
        newPage === 'map' ||
        newPage === 'compliance' ||
        newPage === 'admin' ||
        newPage === 'admin/users' ||
        newPage === 'admin/iot-data' ||
        newPage === 'admin/feedback'
      ) {
        // Selalu update key saat pindah ke halaman untuk reset animasi
        setPageKey(Date.now());
      } else if (newPage === 'landing') {
        // Reset key saat pindah ke landing untuk reset animasi
        setPageKey(Date.now());
      }
      
      setCurrentPage(newPage);
      
      // Check auth status after navigation
      checkAuth();
    };

    // Listen for storage changes (logout from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'hawa_auth_token') {
        checkAuth();
        if (currentPage === 'dashboard' || currentPage === 'profile' || currentPage === 'map' || currentPage === 'compliance' || currentPage === 'admin' || currentPage === 'admin/users' || currentPage === 'admin/iot-data') {
          setCurrentPage('login');
          window.location.hash = '#login';
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('storage', handleStorageChange);
    
    // Check auth on mount
    checkAuth();
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentPage]);

  const [isFading, setIsFading] = useState(false);
  const [contentOpacity, setContentOpacity] = useState(0);

  const handleSplashComplete = () => {
    setIsFading(true);
    // Start fading in content simultaneously with splash fade out
    setContentOpacity(1);
    // Wait for fade animation before hiding splash
    setTimeout(() => {
      setShowSplash(false);
    }, 700);
  };

  return (
    <>
      {/* Render main content in background - always rendered but hidden behind splash */}
      <div 
        className="transition-opacity duration-700 ease-in-out"
        style={{ 
          opacity: showSplash ? contentOpacity : 1,
          pointerEvents: showSplash && !isFading ? 'none' : 'auto'
        }}
      >
        {currentPage === 'login' && <Login key={`login-${pageKey}`} />}
        {currentPage === 'register' && <Register key={`register-${pageKey}`} />}
        {currentPage === 'dashboard' && <Dashboard key={`dashboard-${pageKey}`} />}
        {currentPage === 'profile' && <Profile key={`profile-${pageKey}`} />}
        {currentPage === 'compliance' && <CompliancePage key={`compliance-${pageKey}`} />}
        {currentPage === 'admin' && <AdminDashboard key={`admin-${pageKey}`} />}
        {currentPage === 'admin/users' && <AdminUsers key={`admin-users-${pageKey}`} />}
        {currentPage === 'admin/iot-data' && <AdminIoTData key={`admin-iot-data-${pageKey}`} />}
        {currentPage === 'admin/feedback' && <AdminFeedback key={`admin-feedback-${pageKey}`} />}
        {currentPage === 'map' && <MapPollutan key={`map-${pageKey}`} />}
        {currentPage === 'community' && <CommunityPage key={`community-${pageKey}`} />}
        {currentPage === 'landing' && <HawaLanding key={`landing-${pageKey}`} />}
      </div>
      
      {/* Splash screen overlay - fades out smoothly with blue background */}
      {showSplash && (
        <div 
          className="fixed inset-0 z-[100] transition-opacity duration-700 ease-in-out"
          style={{ 
            opacity: isFading ? 0 : 1,
            pointerEvents: isFading ? 'none' : 'auto',
            background: 'linear-gradient(to bottom right, #1e3a8a, #1d4ed8, #0891b2)'
          }}
        >
          <SplashScreen onComplete={handleSplashComplete} isFading={isFading} />
        </div>
      )}
    </>
  );
}


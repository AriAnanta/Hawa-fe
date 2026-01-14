import { useEffect, useMemo, useState } from 'react';
import { Map as MapIcon, Menu } from 'lucide-react';
import UserSidebar from '../components/UserSidebar';
import HeatmapMap from '../components/HeatmapMap';
import HeatmapInfo from '../components/HeatmapInfo';
import HeatmapTips from '../components/HeatmapTips';
import CompareAnalyticsChart from '../components/CompareAnalyticsChart';
import ProfileDropdown from '../components/ProfileDropdown';
import Breadcrumbs from '../components/Breadcrumbs';
import { authService } from '../services/auth';

export default function MapPollutan() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const token = authService.getToken();
  const apiUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', []);
  
  // Get user language from profile - refresh when user data changes
  const [userLanguage, setUserLanguage] = useState(() => {
    const user = authService.getCurrentUser();
    return user?.language || 'id';
  });

  const [mapHeight, setMapHeight] = useState(() => (window.innerWidth < 768 ? '420px' : '600px'));

  // Refresh user language when profile is updated
  useEffect(() => {
    const refreshUserLanguage = () => {
      const user = authService.getCurrentUser();
      if (user?.language) {
        setUserLanguage(user.language);
      }
    };

    // Refresh on mount
    refreshUserLanguage();

    // Listen for storage changes (when profile is updated in another tab/window)
    const handleStorageChange = (e) => {
      if (e.key === 'hawa_user') {
        refreshUserLanguage();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Also check periodically (in case same tab updates)
    const interval = setInterval(refreshUserLanguage, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      setMapHeight(window.innerWidth < 768 ? '420px' : '600px');
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <nav className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden text-gray-700 hover:text-blue-600 transition-colors duration-300 p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu size={24} />
                </button>
                <div className="flex items-center space-x-2">
                  <MapIcon className="text-blue-600" size={22} />
                  <div>
                    <p className="text-xs text-gray-500">Peta Risiko</p>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900">Map Pollutan</h1>
                  </div>
                </div>
              </div>
              <ProfileDropdown />
            </div>
          </div>
        </nav>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '#dashboard' },
                { label: 'Map Pollutan' }
              ]}
              className="animate-fade-in"
            />
            {/* Map and Info Section - Side by Side */}
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${isSidebarOpen ? 'hidden lg:grid' : 'grid'} animate-fade-in`}>
              {/* Map Section - Left */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Kualitas Udara</p>
                      <h2 className="text-2xl font-bold text-gray-900 mt-1">Heatmap & Peta Risiko</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Menampilkan penyebaran polutan dan level risiko berbasis data IoT terbaru.
                      </p>
                    </div>
                    <div className="hidden md:flex items-center space-x-3 text-xs text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                      <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                      <span>Data tersinkron</span>
                    </div>
                  </div>

                  <HeatmapMap
                    apiUrl={apiUrl}
                    token={token}
                    height={mapHeight}
                    onPointSelect={setSelectedPoint}
                  />
                </div>
              </div>

              {/* Info Section - Right */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                <HeatmapInfo 
                  apiUrl={apiUrl} 
                  token={token} 
                  language={userLanguage}
                  mapHeight={mapHeight}
                />
                <CompareAnalyticsChart
                  apiUrl={apiUrl}
                  token={token}
                  defaultPrimary="Bandung"
                  defaultSecondary=""
                  defaultHours={72}
                  allowControls={false}
                  compact
                  forcePrimaryOnly
                />
              </div>
            </div>

            {/* Tips Section - Below Map, Full Width */}
            <div>
              <HeatmapTips
                apiUrl={apiUrl}
                token={token}
                pm25={selectedPoint?.pm2_5}
                pm10={selectedPoint?.pm10}
                airQuality={selectedPoint?.air_quality}
                riskLevel={selectedPoint?.risk_level}
                location={selectedPoint?.location}
                language={userLanguage}
                autoLoad={!!selectedPoint}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


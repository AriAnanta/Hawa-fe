/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { Cloud, Thermometer, Droplets, Wind, MapPin, Globe, Menu, LayoutDashboard, Gauge, Eye, X } from 'lucide-react';
import UserSidebar from '../components/UserSidebar';
import DailyForecast from '../components/DailyForecast';
import AQIPrediction from '../components/AQIPrediction';
import { WeatherCardSkeleton, ForecastCardSkeleton, MapCardSkeleton } from '../components/LoadingSkeleton';
import ProfileDropdown from '../components/ProfileDropdown';
import Breadcrumbs from '../components/Breadcrumbs';
import { authService } from '../services/auth';

export default function Dashboard() {
  const [language, setLanguage] = useState('id');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLocationBanner, setShowLocationBanner] = useState(true);
  const token = authService.getToken();
  const apiUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', []);
  
  const user = useMemo(() => authService.getCurrentUser(), []);
  const userLanguage = user?.language || language;

  useEffect(() => {
    if (user?.language && user.language !== language) {
      setLanguage(user.language);
    }
  }, [user, language]);
  const userLocation = user?.location || 'Bandung';

  const translations = {
    id: {
      title: 'Dashboard Cuaca',
      locationUnavailable: 'Lokasi tidak tersedia. Menampilkan lokasi default:',
      feelsLike: 'Terasa seperti',
      wind: 'Angin',
      pressure: 'Tekanan',
      humidity: 'Kelembaban',
      dewPoint: 'Titik Embun',
      visibility: 'Visibilitas',
      celsius: '°C',
      percent: '%',
      hpa: 'hPa',
      km: 'km',
      ms: 'm/s',
      moderateBreeze: 'Angin sedang',
      location: 'Lokasi',
      welcome: 'Selamat Datang',
      logout: 'Keluar',
    },
    en: {
      title: 'Weather Dashboard',
      locationUnavailable: 'Location unavailable. Displaying default location:',
      feelsLike: 'Feels like',
      wind: 'Wind',
      pressure: 'Pressure',
      humidity: 'Humidity',
      dewPoint: 'Dew Point',
      visibility: 'Visibility',
      celsius: '°C',
      percent: '%',
      hpa: 'hPa',
      km: 'km',
      ms: 'm/s',
      moderateBreeze: 'Moderate breeze',
      location: 'Location',
      welcome: 'Welcome',
      logout: 'Logout',
    },
    su: {
      title: 'Dashboard Cuaca',
      locationUnavailable: 'Lokasi teu sayogi. Nampilkeun lokasi default:',
      feelsLike: 'Karasa sapertos',
      wind: 'Angin',
      pressure: 'Tekanan',
      humidity: 'Kalembaban',
      dewPoint: 'Titik Embun',
      visibility: 'Visibilitas',
      celsius: '°C',
      percent: '%',
      hpa: 'hPa',
      km: 'km',
      ms: 'm/s',
      moderateBreeze: 'Angin sedeng',
      location: 'Lokasi',
      welcome: 'Wilujeng Sumping',
      logout: 'Kaluar',
    }
  };

  const t = translations[language];

  useEffect(() => {
    const fetchCurrentWeather = async () => {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${apiUrl}/weather/analytics/current?city=${userLocation}`, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        setCurrentWeather(json.data);
      } catch (err) {
        console.error('Error fetching weather:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentWeather();
  }, [apiUrl, token, userLocation]);

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString(language === 'id' ? 'id-ID' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getWeatherIcon = (weatherMain) => {
    const icons = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Fog': '🌫️'
    };
    return icons[weatherMain] || '☀️';
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 flex overflow-hidden">
      <UserSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-visible">
        <nav className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm h-14">
          <div className="px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden text-gray-700 hover:text-blue-600 transition-colors duration-300 p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu size={20} />
                </button>
                <div className="flex items-center space-x-2">
                  <LayoutDashboard className="text-blue-600 hidden sm:block" size={18} />
                  <h1 className="text-lg font-black text-gray-900 hidden sm:block">{t.title}</h1>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <ProfileDropdown />
                <div className="relative">
                  <button
                    onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                    className="px-3 py-1 pr-7 rounded-full bg-gray-50 text-xs text-gray-700 border border-gray-200 font-medium hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 cursor-pointer shadow-sm flex items-center gap-2"
                  >
                    <Globe className="w-3 h-3" />
                    <span>{language.toUpperCase()}</span>
                    <svg 
                      className={`w-3 h-3 text-gray-600 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isLangDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsLangDropdownOpen(false)}
                      ></div>
                      <div className="absolute top-full right-0 mt-2 w-28 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
                        <button
                          onClick={() => { setLanguage('id'); setIsLangDropdownOpen(false); }}
                          className={`w-full px-3 py-2 text-left text-xs font-medium transition-all ${
                            language === 'id' 
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          ID
                        </button>
                        <button
                          onClick={() => { setLanguage('en'); setIsLangDropdownOpen(false); }}
                          className={`w-full px-3 py-2 text-left text-xs font-medium transition-all ${
                            language === 'en' 
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          EN
                        </button>
                        <button
                          onClick={() => { setLanguage('su'); setIsLangDropdownOpen(false); }}
                          className={`w-full px-3 py-2 text-left text-xs font-medium transition-all ${
                            language === 'su' 
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          SU
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-rows-[auto_auto_auto_auto_auto] gap-3">
            {showLocationBanner && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-2 text-xs text-green-800">
                  <span>{t.locationUnavailable} <strong>{userLocation}</strong></span>
                </div>
                <button
                  onClick={() => setShowLocationBanner(false)}
                  className="text-green-600 hover:text-green-800 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between animate-fade-in">
              <Breadcrumbs
                items={[
                  { label: 'Home', href: '#dashboard' },
                  { label: 'Dashboard' }
                ]}
              />
              <span className="text-xs text-gray-500 hidden sm:block">Updated {getCurrentDateTime()}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 animate-fade-in">
              <div className="lg:col-span-2">
                <div className="text-xs text-gray-500 mb-1">{getCurrentDateTime()}</div>
                <div className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin size={14} className="text-blue-600" />
                  <span>{userLocation}, ID</span>
                </div>
                
                {loading ? (
                  <WeatherCardSkeleton />
                ) : currentWeather && currentWeather.current ? (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 border-b border-gray-200">
                      <div className="flex items-center space-x-4">
                        <div className="text-5xl">{getWeatherIcon(currentWeather.current.weather?.main)}</div>
                        <div>
                          <div className="text-4xl font-bold text-gray-900 mb-1">
                            {Math.round(currentWeather.current.temperature || 0)}{t.celsius}
                    </div>
                          <div className="text-sm text-gray-700">
                            {t.feelsLike} {Math.round(currentWeather.current.feels_like || currentWeather.current.temperature || 0)}{t.celsius}
                  </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            {currentWeather.current.weather?.description || 'Cerah'}. {t.moderateBreeze}
                  </div>
                </div>
              </div>
            </div>

                    <div className="p-3">
                      <div className="grid grid-cols-5 gap-3">
                        <div className="flex items-start space-x-2">
                          <div className="p-1.5 bg-blue-50 rounded-lg">
                            <Wind className="text-blue-600" size={16} />
                  </div>
                  <div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">{t.wind}</div>
                            <div className="text-sm font-bold text-gray-900">
                              {(currentWeather.current.wind_speed || 0).toFixed(1)} {t.ms}
                  </div>
                </div>
                </div>

                        <div className="flex items-start space-x-2">
                          <div className="p-1.5 bg-purple-50 rounded-lg">
                            <Gauge className="text-purple-600" size={16} />
              </div>
                          <div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">{t.pressure}</div>
                            <div className="text-sm font-bold text-gray-900">
                              {currentWeather.current.pressure || 'N/A'} {t.hpa}
              </div>
            </div>
              </div>

                        <div className="flex items-start space-x-2">
                          <div className="p-1.5 bg-green-50 rounded-lg">
                            <Droplets className="text-green-600" size={16} />
                  </div>
                          <div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">{t.humidity}</div>
                            <div className="text-sm font-bold text-gray-900">
                              {currentWeather.current.humidity || 'N/A'}{t.percent}
                </div>
                  </div>
                </div>

                        <div className="flex items-start space-x-2">
                          <div className="p-1.5 bg-cyan-50 rounded-lg">
                            <Thermometer className="text-cyan-600" size={16} />
                  </div>
                          <div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">{t.dewPoint}</div>
                            <div className="text-sm font-bold text-gray-900">
                              {currentWeather.current.dew_point || Math.round((currentWeather.current.temperature || 0) - 3)}{t.celsius}
                </div>
              </div>
            </div>

                        <div className="flex items-start space-x-2">
                          <div className="p-1.5 bg-orange-50 rounded-lg">
                            <Eye className="text-orange-600" size={16} />
                          </div>
                          <div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">{t.visibility}</div>
                            <div className="text-sm font-bold text-gray-900">
                              {currentWeather.current.visibility ? (currentWeather.current.visibility / 1000).toFixed(1) : '10.0'} {t.km}
                            </div>
                          </div>
                        </div>
                      </div>
              </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs">
                    Gagal memuat data cuaca
                  </div>
                )}
              </div>

              {loading ? (
                <MapCardSkeleton />
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-2 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-sm font-bold text-gray-900">Peta Lokasi</h3>
                  </div>
                  <div style={{ height: '100%', minHeight: '200px', position: 'relative' }}>
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${107.4},${-7.0},${107.8},${-6.8}&layer=mapnik&marker=${-6.9175},${107.6191}`}
                      style={{ border: 0 }}
                      className="w-full h-full"
                    />
                    <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-gray-600 shadow-sm border border-gray-200">
                      © OpenStreetMap
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AQI Prediction Section - Full Width */}
            <div style={{ minHeight: '380px', maxHeight: '420px' }}>
              <AQIPrediction
                city={userLocation}
                language={userLanguage}
                token={token}
              />
            </div>

            {/* Prakiraan 8 Hari */}
            <div style={{ minHeight: '300px' }}>
              <DailyForecast
                  apiUrl={apiUrl}
                  token={token}
                  city={userLocation}
                  language={userLanguage}
                />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

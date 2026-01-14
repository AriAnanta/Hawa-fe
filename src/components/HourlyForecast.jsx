import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

export default function HourlyForecast({ apiUrl, token, city = 'Bandung', language = 'id' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [hoveredPoint, setHoveredPoint] = useState(null);
  const baseUrl = useMemo(() => apiUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', [apiUrl]);

  const uiText = {
    id: {
      loading: 'Memproses prakiraan...',
      error: 'Gagal memuat data',
      title: 'Tren Prakiraan 24 Jam',
      precipitation: 'Hujan',
      clouds: 'Awan',
      wind: 'Angin',
      percent: '%',
      ms: 'm/s',
      mm: 'mm',
      now: 'Sekarang'
    },
    en: {
      loading: 'Processing forecast...',
      error: 'Failed to load data',
      title: '24H Forecast Trend',
      precipitation: 'Rain',
      clouds: 'Clouds',
      wind: 'Wind',
      percent: '%',
      ms: 'm/s',
      mm: 'mm',
      now: 'Now'
    },
    su: {
      loading: 'Ngolah prakiraan...',
      error: 'Gagal ngamuat data',
      title: 'Tren Prakiraan 24 Jam',
      precipitation: 'Hujan',
      clouds: 'Awan',
      wind: 'Angin',
      percent: '%',
      ms: 'm/s',
      mm: 'mm',
      now: 'Ayeuna'
    }
  };

  const t = uiText[language] || uiText.id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${baseUrl}/weather/analytics/hourly?city=${city}&hours=24`, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        setData(json.data);
      } catch (err) {
        setError(err.message || t.error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseUrl, token, city, t.error]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-full flex items-center justify-center">
        <div className="text-xs text-gray-500 flex flex-col items-center gap-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          {t.loading}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-full flex items-center justify-center">
        <div className="text-xs text-red-500">{error}</div>
      </div>
    );
  }

  if (!data || !data.hourly) return null;

  const hourlyData = data.hourly.slice(0, 12);
  const temps = hourlyData.map(h => h.temperature || 0);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = maxTemp - minTemp || 1;
  const dataCount = hourlyData.length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0 flex justify-between items-center">
        <h3 className="text-base font-bold text-gray-900">{t.title}</h3>
        <span className="text-[10px] px-2 py-1 bg-white/50 backdrop-blur-sm text-blue-700 rounded-full font-bold shadow-sm border border-blue-100">
          📍 {city}
        </span>
      </div>
      
      <div className="p-4 flex-1 flex flex-col overflow-hidden">
        {/* Chart Area */}
        <div className="relative h-32 mb-6 bg-white rounded-2xl border border-gray-50 p-4 shadow-[0_4px_15px_rgba(0,0,0,0.02)] group">
          {/* Tooltip */}
          {hoveredPoint && (
            <div 
              className="absolute bg-white/95 backdrop-blur-md border border-gray-100 p-2 rounded-lg shadow-xl z-50 pointer-events-none transition-all duration-200"
              style={{
                left: `${hoveredPoint.x}%`,
                top: `${hoveredPoint.y}%`,
                transform: 'translate(-50%, -120%)',
                minWidth: '80px'
              }}
            >
              <div className="text-[8px] font-bold text-gray-400 uppercase">
                {new Date(hoveredPoint.data.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm font-black text-blue-600">
                {Math.round(hoveredPoint.data.temperature)}°C
              </div>
            </div>
          )}

          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none" 
            className="overflow-visible"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const xPerc = ((e.clientX - rect.left) / rect.width) * 100;
              const idx = Math.round((xPerc / 100) * (dataCount - 1));
              const clampedIdx = Math.max(0, Math.min(dataCount - 1, idx));
              const h = hourlyData[clampedIdx];
              const x = (clampedIdx / (dataCount - 1)) * 100;
              const y = 90 - (((h.temperature || minTemp) - minTemp) / tempRange) * 70;
              setHoveredPoint({ x, y, data: h });
            }}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="temp-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <linearGradient id="temp-area" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid */}
            {[0, 50, 100].map(v => (
              <line key={v} x1="0" y1={v} x2="100" y2={v} stroke="#f1f5f9" strokeWidth="0.5" />
            ))}

            {/* Area */}
            {dataCount > 1 && (
              <path
                d={`M 0 100 L ${hourlyData.map((h, idx) => {
                  const x = (idx / (dataCount - 1)) * 100;
                  const y = 90 - (((h.temperature || minTemp) - minTemp) / tempRange) * 70;
                  return `${x} ${y}`;
                }).join(' L ')} L 100 100 Z`}
                fill="url(#temp-area)"
              />
            )}

            {/* Line */}
            {dataCount > 1 && (
              <path
                d={`M ${hourlyData.map((h, idx) => {
                  const x = (idx / (dataCount - 1)) * 100;
                  const y = 90 - (((h.temperature || minTemp) - minTemp) / tempRange) * 70;
                  return `${x} ${y}`;
                }).join(' L ')}`}
                fill="none"
                stroke="url(#temp-gradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Active Point */}
            {hoveredPoint && (
              <>
                <line x1={hoveredPoint.x} y1="0" x2={hoveredPoint.x} y2="100" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2 2" />
                <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="3" fill="white" stroke="#3b82f6" strokeWidth="2" />
              </>
            )}
          </svg>
          
          <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-[7px] font-black text-gray-300 uppercase tracking-widest px-1">
            <span>Sekarang</span>
            <span>+6 Jam</span>
            <span>+12 Jam</span>
          </div>
        </div>

        {/* List Details */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
          {hourlyData.map((hour, idx) => {
            const date = new Date(hour.datetime);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            
            return (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-white hover:border-blue-100 hover:shadow-sm transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-black">
                    {idx === 0 ? 'NOW' : timeStr}
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none mb-1">
                      {hour.weather?.main || 'Cloudy'}
                    </div>
                    <div className="text-xs font-bold text-gray-700">
                      {Math.round(hour.temperature)}° Celsius
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end pr-3 border-r border-gray-100">
                    <span className="text-[8px] font-bold text-gray-300 uppercase">Rain</span>
                    <span className="text-[10px] font-black text-blue-600">{hour.precipitation_probability || 0}%</span>
                  </div>
                  <div className="flex flex-col items-end pl-1">
                    <span className="text-[8px] font-bold text-gray-300 uppercase">Wind</span>
                    <span className="text-[10px] font-black text-green-600">{(hour.wind_speed || 0).toFixed(1)}m/s</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
}

HourlyForecast.propTypes = {
  apiUrl: PropTypes.string,
  token: PropTypes.string,
  city: PropTypes.string,
  language: PropTypes.string
};

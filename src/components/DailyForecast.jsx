import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function DailyForecast({ apiUrl, token, city = 'Bandung', language = 'id' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedDay, setExpandedDay] = useState(null);

  const baseUrl = useMemo(() => apiUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', [apiUrl]);

  const uiText = {
    id: {
      loading: 'Memuat data...',
      error: 'Gagal memuat data',
      title: 'Prakiraan 8 Hari',
      celsius: '°C'
    },
    en: {
      loading: 'Loading...',
      error: 'Failed to load data',
      title: '8-Day Forecast',
      celsius: '°C'
    },
    su: {
      loading: 'Ngamuat data...',
      error: 'Gagal ngamuat data',
      title: 'Prakiraan 8 Poé',
      celsius: '°C'
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

        const res = await fetch(`${baseUrl}/weather/analytics/forecast?city=${city}&days=8`, { headers });
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
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
        <div className="p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h3 className="text-sm font-bold text-gray-900">{t.title}</h3>
        </div>
        <div className="p-4 text-center text-xs text-gray-600 flex-1">{t.loading}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
        <div className="p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h3 className="text-sm font-bold text-gray-900">{t.title}</h3>
        </div>
        <div className="bg-red-50 border-t border-red-200 p-4 text-red-700 text-xs flex-1">{error}</div>
      </div>
    );
  }

  if (!data || !data.forecasts) return null;

  const forecasts = data.forecasts.slice(0, 8);

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
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <h3 className="text-sm font-bold text-gray-900">{t.title}</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {forecasts.map((forecast, idx) => {
            let date;
            if (typeof forecast.datetime === 'string') {
              date = new Date(forecast.datetime);
            } else if (typeof forecast.datetime === 'number') {
              date = new Date(forecast.datetime * 1000);
            } else {
              date = new Date();
            }

            const dayName = date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
              weekday: 'short'
            });
            const monthDay = date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
              month: 'short',
              day: 'numeric'
            });
            const isExpanded = expandedDay === idx;
            const weatherMain = forecast.weather?.main || 'Clear';
            const weatherDesc = forecast.weather?.description || 'Cerah';

            return (
              <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                <button
                  onClick={() => setExpandedDay(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between py-2 px-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="text-2xl flex-shrink-0">{getWeatherIcon(weatherMain)}</div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-semibold text-gray-900 text-xs">
                        {dayName}, {monthDay}
                      </div>
                      <div className="text-[10px] text-gray-600 mt-0.5 truncate">{weatherDesc}</div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="font-bold text-gray-900 text-xs">
                        {forecast.temp_max?.toFixed(0) || 'N/A'} / {forecast.temp_min?.toFixed(0) || 'N/A'}{t.celsius}
                      </div>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-2 pb-2 pt-1 bg-gray-50 border-t border-gray-200 text-[10px] text-gray-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Kelembaban:</span>
                      <span>{forecast.humidity || 'N/A'}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Angin:</span>
                      <span>{(forecast.wind_speed || 0).toFixed(1)} m/s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Tekanan:</span>
                      <span>{forecast.pressure || 'N/A'} hPa</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

DailyForecast.propTypes = {
  apiUrl: PropTypes.string,
  token: PropTypes.string,
  city: PropTypes.string,
  language: PropTypes.string
};

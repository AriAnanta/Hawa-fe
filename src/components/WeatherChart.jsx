import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Weather Chart Component
 * Displays weather analytics with simple bar/line visualization
 * Uses CSS-based charts (no external library needed)
 */
export default function WeatherChart({
  apiUrl,
  token,
  city = 'Bandung',
  type = 'current', // 'current', 'forecast', 'summary'
  language = 'id'
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const baseUrl = useMemo(() => apiUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', [apiUrl]);

  const uiText = {
    id: {
      loading: 'Memuat data cuaca...',
      error: 'Gagal memuat data cuaca',
      temperature: 'Suhu',
      humidity: 'Kelembaban',
      pressure: 'Tekanan',
      windSpeed: 'Kecepatan Angin',
      forecast: 'Prakiraan Cuaca',
      current: 'Cuaca Saat Ini',
      celsius: '°C',
      percent: '%',
      hpa: 'hPa',
      ms: 'm/s'
    },
    en: {
      loading: 'Loading weather data...',
      error: 'Failed to load weather data',
      temperature: 'Temperature',
      humidity: 'Humidity',
      pressure: 'Pressure',
      windSpeed: 'Wind Speed',
      forecast: 'Weather Forecast',
      current: 'Current Weather',
      celsius: '°C',
      percent: '%',
      hpa: 'hPa',
      ms: 'm/s'
    },
    su: {
      loading: 'Ngamuat data cuaca...',
      error: 'Gagal ngamuat data cuaca',
      temperature: 'Suhu',
      humidity: 'Kalembaban',
      pressure: 'Tekanan',
      windSpeed: 'Laju Angin',
      forecast: 'Prakiraan Cuaca',
      current: 'Cuaca Ayeuna',
      celsius: '°C',
      percent: '%',
      hpa: 'hPa',
      ms: 'm/s'
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

        let endpoint = '';
        if (type === 'current') {
          endpoint = `/weather/analytics/current?city=${city}`;
        } else if (type === 'forecast') {
          endpoint = `/weather/analytics/forecast?city=${city}&days=5`;
        } else {
          endpoint = `/weather/analytics/summary?city=${city}`;
        }

        const res = await fetch(`${baseUrl}${endpoint}`, { headers });
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
  }, [baseUrl, token, city, type, t.error]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="text-center text-gray-600">{t.loading}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (!data) return null;

  // Render current weather chart
  if (type === 'current' && data.current) {
    const current = data.current;
    const temp = current.temperature || 0;
    const humidity = current.humidity || 0;
    const pressure = current.pressure || 0;
    const windSpeed = current.wind_speed || 0;

    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t.current}</h3>
        
        <div className="space-y-4">
          {/* Temperature Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{t.temperature}</span>
              <span className="font-semibold text-gray-900">{temp}{t.celsius}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(100, ((temp + 20) / 60) * 100)}%` }}
              />
            </div>
          </div>

          {/* Humidity Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{t.humidity}</span>
              <span className="font-semibold text-gray-900">{humidity}{t.percent}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${humidity}%` }}
              />
            </div>
          </div>

          {/* Pressure Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{t.pressure}</span>
              <span className="font-semibold text-gray-900">{pressure} {t.hpa}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-purple-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(100, ((pressure - 950) / 100) * 100)}%` }}
              />
            </div>
          </div>

          {/* Wind Speed Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{t.windSpeed}</span>
              <span className="font-semibold text-gray-900">{windSpeed} {t.ms}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-orange-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(100, (windSpeed / 20) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render forecast chart
  if (type === 'forecast' && data.forecasts) {
    const forecasts = data.forecasts.slice(0, 5); // Show first 5 days

    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t.forecast}</h3>
        
        <div className="space-y-3">
          {forecasts.map((forecast, idx) => {
            // Handle both timestamp (number) and ISO string formats
            let date;
            if (typeof forecast.datetime === 'string') {
              date = new Date(forecast.datetime);
            } else if (typeof forecast.datetime === 'number') {
              date = new Date(forecast.datetime * 1000);
            } else {
              date = new Date();
            }
            
            const temp = forecast.temperature || 0;
            const maxTemp = forecast.temp_max || temp;
            const minTemp = forecast.temp_min || temp;

            return (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-20 text-xs text-gray-600">
                  {date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="text-sm font-semibold text-gray-900 w-12">
                    {minTemp.toFixed(0)}{t.celsius}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, ((temp + 20) / 60) * 100)}%`,
                        left: `${((minTemp + 20) / 60) * 100}%`
                      }}
                    />
                  </div>
                  <div className="text-sm font-semibold text-gray-900 w-12 text-right">
                    {maxTemp.toFixed(0)}{t.celsius}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

WeatherChart.propTypes = {
  apiUrl: PropTypes.string,
  token: PropTypes.string,
  city: PropTypes.string,
  type: PropTypes.oneOf(['current', 'forecast', 'summary']),
  language: PropTypes.string
};








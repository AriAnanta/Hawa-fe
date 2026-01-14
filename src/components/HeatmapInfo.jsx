import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

export default function HeatmapInfo({ apiUrl, token, language = 'id', onError }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const baseUrl = useMemo(() => apiUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', [apiUrl]);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams({ language });
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${baseUrl}/weather/heatmap/info?${params.toString()}`, {
          headers,
          signal: controller.signal
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: gagal memuat info`);
        }
        const json = await res.json();
        const payload = json?.data || json;
        setData(payload);
      } catch (err) {
        if (err.name === 'AbortError') return;
        const msg = err.message || 'Gagal memuat info';
        setError(msg);
        onError?.(msg);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [baseUrl, token, language, onError]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
        <p className="text-sm text-gray-600">Memuat informasi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
        Data info tidak tersedia
      </div>
    );
  }

  const title = data.title || 'Informasi Peta';
  const description = data.description || '';
  const categories = data.categories || [];
  const pm25 = data.pm25_explanation || data.pm25 || '';
  const pm10 = data.pm10_explanation || data.pm10 || '';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
      <div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>

      {categories.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Level Risiko</h4>
          <div className="space-y-2">
            {categories.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span
                  className="w-3 h-3 rounded-full mt-1.5 inline-block flex-shrink-0"
                  style={{ backgroundColor: item.color || '#6b7280' }}
                />
                <div className="text-sm text-gray-700">
                  <div className="font-semibold text-gray-900 capitalize">{item.label || item.level || item.name}</div>
                  {item.description && <div className="text-gray-600">{item.description}</div>}
                  {item.meaning && <div className="text-gray-600">{item.meaning}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(pm25 || pm10) && (
        <div className="space-y-3 pt-2 border-t border-gray-200">
          {pm25 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">PM2.5</p>
              <p className="text-sm text-gray-600">{pm25}</p>
            </div>
          )}
          {pm10 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">PM10</p>
              <p className="text-sm text-gray-600">{pm10}</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

HeatmapInfo.propTypes = {
  apiUrl: PropTypes.string,
  token: PropTypes.string,
  language: PropTypes.string,
  onError: PropTypes.func,
  mapHeight: PropTypes.string
};


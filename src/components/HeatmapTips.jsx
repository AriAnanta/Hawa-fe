import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

export default function HeatmapTips({
  apiUrl,
  token,
  pm25,
  pm10,
  airQuality,
  riskLevel,
  location,
  language = 'id',
  autoLoad = false
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef(null);

  const baseUrl = useMemo(() => apiUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', [apiUrl]);

  const fetchTips = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError('');
      setData(null);

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const params = new URLSearchParams();
      if (pm25 !== undefined) params.append('pm25', pm25);
      if (pm10 !== undefined) params.append('pm10', pm10);
      if (airQuality) params.append('air_quality', airQuality);
      if (riskLevel) params.append('risk_level', riskLevel);
      if (location) params.append('location', location);
      if (language) params.append('language', language);

      const tryGet = async () => {
        const res = await fetch(`${baseUrl}/weather/heatmap/tips?${params.toString()}`, {
          method: 'GET',
          headers,
          signal: controller.signal
        });
        if (!res.ok) {
          const err = new Error(res.status.toString());
          err.status = res.status;
          throw err;
        }
        return res.json();
      };

      const tryPost = async () => {
        const res = await fetch(`${baseUrl}/weather/heatmap/tips`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            pm25,
            pm10,
            risk_level: riskLevel,
            location
          }),
          signal: controller.signal
        });
        if (!res.ok) {
          const err = new Error(res.status.toString());
          err.status = res.status;
          throw err;
        }
        return res.json();
      };

      let json = null;
      try {
        json = await tryGet();
      } catch (err) {
        if (err.status === 404 || err.status === 405 || err.status === 500) {
          json = await tryPost();
        } else {
          throw err;
        }
      }

      const tipsArray = json?.data?.tips || json?.tips || [];
      const header = json?.data || json || {};
      const normalized = {
        tips: Array.isArray(tipsArray) ? tipsArray : [],
        title: header.title,
        explanation: header.explanation,
        healthImpact: header.health_impact || header.healthImpact,
        prevention: header.prevention,
        meta: json?.meta || header.meta || {},
        source: json?.source,
        location: header.location || location,
        riskLevel: header.risk_level || riskLevel,
        pm25: header.pm25 ?? pm25,
        pm10: header.pm10 ?? pm10
      };
      setData(normalized);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Gagal memuat tips');
    } finally {
      setLoading(false);
    }
  }, [baseUrl, token, pm25, pm10, airQuality, riskLevel, location, language]);

  useEffect(() => {
    if (autoLoad && (location || pm25 !== undefined || pm10 !== undefined)) {
      fetchTips();
    }
    
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [pm25, pm10, riskLevel, location, apiUrl, token, language, airQuality, autoLoad, fetchTips]);

  const tips = data?.tips || [];
  const meta = data?.meta || {};

  const uiText = {
    id: {
      recommendation: 'Rekomendasi',
      title: 'Tips Kesehatan & Pencegahan',
      description: 'Berdasarkan lokasi/polutan terpilih. Klik titik di peta untuk memperbarui.',
      refresh: 'Refresh',
      loading: 'Memuat...',
      location: 'Lokasi',
      riskLevel: 'Risk Level',
      notSelected: 'Belum dipilih',
      preparing: 'Menyiapkan tips...',
      noTips: 'Belum ada tips. Pilih titik di peta lalu refresh.'
    },
    en: {
      recommendation: 'Recommendation',
      title: 'Health & Prevention Tips',
      description: 'Based on selected location/pollutant. Click a point on the map to update.',
      refresh: 'Refresh',
      loading: 'Loading...',
      location: 'Location',
      riskLevel: 'Risk Level',
      notSelected: 'Not selected',
      preparing: 'Preparing tips...',
      noTips: 'No tips yet. Select a point on the map then refresh.'
    },
    su: {
      recommendation: 'Rekomendasi',
      title: 'Tips Kaséhatan & Pencegahan',
      description: 'Dumasar kana lokasi/polutan anu dipilih. Klik titik di peta pikeun ngapdet.',
      refresh: 'Refresh',
      loading: 'Ngamuat...',
      location: 'Lokasi',
      riskLevel: 'Tingkat Résiko',
      notSelected: 'Teu acan dipilih',
      preparing: 'Nyiapkeun tips...',
      noTips: 'Teu aya tips. Pilih titik di peta teras refresh.'
    }
  };

  const t = uiText[language] || uiText.id;

  if (!autoLoad && !location && pm25 === undefined && pm10 === undefined) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{t.recommendation}</p>
            <h3 className="text-lg font-bold text-gray-900">{t.title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {t.description}
            </p>
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">{t.noTips}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{t.recommendation}</p>
          <h3 className="text-lg font-bold text-gray-900">{t.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {t.description}
          </p>
        </div>
        <button
          onClick={fetchTips}
          disabled={loading}
          className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? t.loading : t.refresh}
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="text-sm text-gray-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">{t.location}:</span>
            <span className="text-gray-600">{data?.location || location || meta.location || t.notSelected}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">{t.riskLevel}:</span>
            <span className="text-gray-600">{data?.riskLevel || riskLevel || meta.risk_level || '-'}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex gap-4">
              <span>
                <span className="font-semibold text-gray-900">PM2.5:</span>{' '}
                <span className="text-gray-600">{data?.pm25 ?? pm25 ?? meta.pm25 ?? '-'}</span>
              </span>
              <span>
                <span className="font-semibold text-gray-900">PM10:</span>{' '}
                <span className="text-gray-600">{data?.pm10 ?? pm10 ?? meta.pm10 ?? '-'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
          {error}
        </div>
      )}

      {loading && !tips?.length && (
        <div className="text-center py-6 text-gray-600">
          <div className="animate-pulse">{t.preparing}</div>
        </div>
      )}

      {!loading && tips && tips.length > 0 && (
        <div className="space-y-4">
          {tips.map((tip, idx) => (
            <div key={idx} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              {tip.title && (
                <div className="text-base font-bold text-gray-900 mb-2">{tip.title}</div>
              )}
              {tip.description && (
                <div className="text-sm text-gray-700 mb-3 leading-relaxed">{tip.description}</div>
              )}
              {tip.items && Array.isArray(tip.items) && tip.items.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {tip.items.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !tips?.length && !error && location && (
        <div className="text-center py-6 text-gray-500 text-sm">{t.noTips}</div>
      )}
    </div>
  );
}

HeatmapTips.propTypes = {
  apiUrl: PropTypes.string,
  token: PropTypes.string,
  pm25: PropTypes.number,
  pm10: PropTypes.number,
  airQuality: PropTypes.string,
  riskLevel: PropTypes.string,
  location: PropTypes.string,
  language: PropTypes.string,
  autoLoad: PropTypes.bool
};


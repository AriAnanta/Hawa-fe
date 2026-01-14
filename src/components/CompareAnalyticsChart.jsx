import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const cityOptions = [
  'Bandung',
  'Jakarta',
  'Surabaya',
  'Yogyakarta',
  'Medan',
  'Semarang'
];

function MetricSparkline({ title, primary, secondary, unit = 'µg/m³', compact = false }) {
  const maxVal = Math.max(
    ...primary.map((p) => p.value || 0),
    ...(secondary || []).map((p) => p.value || 0),
    1
  );

  const renderBars = (series, color, border) => (
    <div className={`flex items-end gap-1 ${compact ? 'h-16' : 'h-28'}`}>
      {series.map((point, idx) => (
        <div
          key={`${point.time}-${idx}-${color}`}
          className={`${compact ? 'w-1.5' : 'w-2.5'} rounded-sm transition-all`}
          style={{
            height: `${Math.max(6, (Math.min(point.value || 0, maxVal) / maxVal) * 100)}%`,
            backgroundColor: color,
            border: border ? `1px solid ${border}` : 'none'
          }}
          title={`${point.label} • ${point.value?.toFixed(1) ?? '0'} ${unit}`}
        />
      ))}
    </div>
  );

  return (
    <div className={`bg-white border border-gray-200 rounded-xl ${compact ? 'p-3' : 'p-4'} shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500">Analytics</p>
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-600">
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            Primary
          </span>
          {secondary?.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600" />
              Secondary
            </span>
          )}
        </div>
      </div>

      <div className="flex items-end gap-3 overflow-x-auto pb-1">
        {renderBars(primary, '#3b82f6')}
        {secondary?.length > 0 && renderBars(secondary, '#f59e0b', '#d97706')}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-gray-500">
        <span>{primary[0]?.label || 'Start'}</span>
        <span>{primary[primary.length - 1]?.label || 'Latest'}</span>
      </div>
    </div>
  );
}

MetricSparkline.propTypes = {
  title: PropTypes.string.isRequired,
  primary: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.number, time: PropTypes.string })).isRequired,
  secondary: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.number, time: PropTypes.string })),
  unit: PropTypes.string,
  compact: PropTypes.bool
};

export default function CompareAnalyticsChart({
  apiUrl,
  token,
  defaultPrimary = 'Bandung',
  defaultSecondary = 'Jakarta',
  defaultHours = 72,
  allowControls = true,
  compact = false,
  forcePrimaryOnly = false
}) {
  const [primaryCity, setPrimaryCity] = useState(defaultPrimary);
  const [secondaryCity, setSecondaryCity] = useState(forcePrimaryOnly ? '' : defaultSecondary);
  const [hours, setHours] = useState(defaultHours);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const baseUrl = useMemo(() => apiUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', [apiUrl]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const params = new URLSearchParams({
          primary_city: primaryCity,
          hours: hours.toString()
        });
        if (secondaryCity && !forcePrimaryOnly) params.append('secondary_city', secondaryCity);

        const res = await fetch(`${baseUrl}/weather/analytics/compare?${params.toString()}`, {
          headers,
          signal: controller.signal
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const payload = json?.data || {};
        setData(payload);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Gagal memuat tren historis');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [baseUrl, primaryCity, secondaryCity, hours, token]);

  const buildSeries = (series) =>
    (series || []).slice(-20).map((item) => ({
      label: new Date(item.time).toLocaleString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit' }),
      value: item.pm25 ?? 0,
      time: item.time
    }));

  const buildSeriesPm10 = (series) =>
    (series || []).slice(-20).map((item) => ({
      label: new Date(item.time).toLocaleString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit' }),
      value: item.pm10 ?? 0,
      time: item.time
    }));

  const primarySeries = data?.primary?.series || [];
  const secondarySeries = data?.secondary?.series || [];

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${compact ? 'p-3 space-y-3' : 'p-6 space-y-4'}`}>
      <div className="flex flex-col gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Historical trends & analytics</p>
          <h3 className="text-base font-bold text-gray-900">Compare by Date / Location</h3>
          <p className="text-xs text-gray-600">Pantau pola polusi lintas kota dan rentang waktu.</p>
        </div>

        {allowControls ? (
          <div className="flex flex-wrap gap-2">
            <select
              value={primaryCity}
              onChange={(e) => setPrimaryCity(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {cityOptions.map((city) => (
                <option key={city} value={city}>{`Primary: ${city}`}</option>
              ))}
            </select>
            {!forcePrimaryOnly && (
              <select
                value={secondaryCity}
                onChange={(e) => setSecondaryCity(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tanpa pembanding</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>{`Secondary: ${city}`}</option>
                ))}
              </select>
            )}
            <select
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={24}>24 jam</option>
              <option value={48}>2 hari</option>
              <option value={72}>3 hari</option>
              <option value={120}>5 hari</option>
              <option value={168}>7 hari</option>
            </select>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 text-[12px] text-gray-700">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {primaryCity}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded-full">
              {hours} jam terakhir
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-600">Memuat tren historis...</div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricSparkline
            title={`PM2.5 • ${primaryCity}${secondaryCity && !forcePrimaryOnly ? ` vs ${secondaryCity}` : ''}`}
            primary={buildSeries(primarySeries)}
            secondary={secondaryCity && !forcePrimaryOnly ? buildSeries(secondarySeries) : []}
            compact={compact}
          />
          <MetricSparkline
            title={`PM10 • ${primaryCity}${secondaryCity && !forcePrimaryOnly ? ` vs ${secondaryCity}` : ''}`}
            primary={buildSeriesPm10(primarySeries)}
            secondary={secondaryCity && !forcePrimaryOnly ? buildSeriesPm10(secondarySeries) : []}
            compact={compact}
          />
        </div>
      ) : (
        <div className="text-sm text-gray-600">Data tren belum tersedia.</div>
      )}
    </div>
  );
}

CompareAnalyticsChart.propTypes = {
  apiUrl: PropTypes.string,
  token: PropTypes.string,
  defaultPrimary: PropTypes.string,
  defaultSecondary: PropTypes.string,
  defaultHours: PropTypes.number,
  allowControls: PropTypes.bool,
  compact: PropTypes.bool,
  forcePrimaryOnly: PropTypes.bool
};






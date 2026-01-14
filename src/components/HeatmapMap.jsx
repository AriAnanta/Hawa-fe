import { useEffect, useMemo, useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet default marker fix untuk bundler/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const getRiskColor = (riskLevel) => {
  if (!riskLevel) return '#6b7280';
  const level = riskLevel.toLowerCase();
  if (level === 'high') return '#ef4444';
  if (level === 'moderate') return '#f97316';
  if (level === 'low') return '#22c55e';
  return '#6b7280';
};

const getRiskRadius = (riskLevel, riskScore) => {
  if (riskScore !== null && riskScore !== undefined) {
    return 500 + riskScore * 1500; // 500m - 2000m
  }
  const level = (riskLevel || '').toLowerCase();
  if (level === 'high') return 2000;
  if (level === 'moderate') return 1200;
  if (level === 'low') return 800;
  return 1000;
};

const createDeviceIcon = () =>
  L.divIcon({
    className: 'iot-marker',
    html: `
      <div style="
        width: 34px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
        background: transparent;
      ">
        <svg width="30" height="30" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="smoke" x1="0" x2="0" y1="1" y2="0">
              <stop offset="0%" stop-color="rgba(200,200,200,0)" />
              <stop offset="100%" stop-color="rgba(200,200,200,0.7)" />
            </linearGradient>
          </defs>
          <g transform="translate(4,4)">
            <path d="M14 0 C10 8, 18 10, 14 18" stroke="rgba(200,200,200,0.6)" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M24 2 C20 10, 28 12, 24 20" stroke="rgba(200,200,200,0.6)" stroke-width="3" fill="none" stroke-linecap="round"/>
            <rect x="6" y="20" width="44" height="24" rx="3" ry="3" fill="#4b5563"/>
            <rect x="6" y="30" width="44" height="14" rx="2" ry="2" fill="#6b7280"/>
            <rect x="10" y="24" width="6" height="8" fill="#9ca3af"/>
            <rect x="20" y="24" width="6" height="8" fill="#9ca3af"/>
            <rect x="30" y="24" width="6" height="8" fill="#9ca3af"/>
            <rect x="40" y="24" width="6" height="8" fill="#9ca3af"/>
            <rect x="12" y="12" width="10" height="10" fill="#374151"/>
            <rect x="26" y="8" width="12" height="14" fill="#1f2937"/>
            <rect x="20" y="34" width="14" height="10" fill="#10b981" />
            <rect x="8" y="38" width="6" height="6" fill="#f59e0b" />
            <rect x="38" y="38" width="6" height="6" fill="#f59e0b" />
          </g>
        </svg>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -30]
  });

const Legend = ({ total }) => (
  <div className="bg-white px-4 py-3 border-b border-gray-200">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <h3 className="text-lg font-semibold text-gray-800">Peta Penyebaran Kualitas Udara</h3>
      <div className="flex items-center gap-4 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-600">Tinggi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-gray-600">Sedang</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-600">Rendah</span>
        </div>
      </div>
    </div>
    <p className="text-sm text-gray-500 mt-1">Total {total} lokasi sensor</p>
  </div>
);

Legend.propTypes = {
  total: PropTypes.number
};

export default function HeatmapMap({
  apiUrl,
  token,
  worksheetName = 'Sheet1',
  forceRefresh = false,
  height = '600px',
  onError,
  onPointSelect
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const baseUrl = useMemo(() => apiUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', [apiUrl]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchHeatmapData = async () => {
      try {
        setLoading(true);
        setError('');

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const params = new URLSearchParams({
          worksheet_name: worksheetName || 'Sheet1',
          force_refresh: forceRefresh ? 'true' : 'false'
        });

        const response = await fetch(
          `${baseUrl}/weather/heatmap?${params.toString()}`,
          {
            method: 'GET',
            headers,
            signal: controller.signal
          }
        );

        if (!response.ok) {
          if (response.status === 401) throw new Error('Unauthorized: silakan login ulang');
          if (response.status === 403) throw new Error('Forbidden: akses admin diperlukan');
          if (response.status === 404) throw new Error('Endpoint /weather/heatmap tidak ditemukan');
          throw new Error(`HTTP ${response.status}: gagal memuat heatmap`);
        }

        const result = await response.json();
        if (!result?.success) throw new Error('Gagal memuat data heatmap');
        setData(result);
      } catch (err) {
        if (err.name === 'AbortError') return;
        const message = err.message || 'Failed to load heatmap data';
        setError(message);
        onError?.(message);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
    return () => controller.abort();
  }, [baseUrl, token, worksheetName, forceRefresh, onError]);

  const renderLoading = () => (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600">Memuat data peta...</p>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center w-full rounded-2xl bg-red-50" style={{ height }}>
        <div className="text-center px-4">
          <p className="text-red-600 font-semibold text-lg">Error</p>
          <p className="text-red-500 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data?.points?.length) {
    return (
      <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200" style={{ height }}>
        <div className="relative" style={{ height }}>
          <div className="absolute inset-0 bg-gray-50">{renderLoading()}</div>
        </div>
      </div>
    );
  }

  const center = data.center
    ? [data.center.lat, data.center.lng]
    : [data.points[0].lat, data.points[0].lng];

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200">
      <Legend total={data.total_points} />

        <div style={{ height }} className="relative">
          {loading && (
            <div className="absolute inset-0 bg-white/70 z-20 flex items-center justify-center">
              {renderLoading()}
            </div>
          )}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl p-3 text-xs space-y-2 max-w-[230px]">
          <p className="text-sm font-semibold text-gray-800">Legenda</p>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rotate-45 bg-blue-500 rounded-sm border border-white shadow" />
            <span className="text-gray-700">Marker panah = perangkat IoT</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            <span className="text-gray-700">Risiko tinggi (radius ~2 km)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
            <span className="text-gray-700">Risiko sedang (radius ~1.2 km)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            <span className="text-gray-700">Risiko rendah (radius ~0.8 km)</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Radius mengikuti risk score (0.5–2 km). Klik marker untuk detail sensor & polutan.
          </p>
        </div>

        <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {data.points.map((point) => {
            const color = getRiskColor(point.risk_level);
            const radius = getRiskRadius(point.risk_level, point.risk_score);

            return (
              <Fragment key={point.id}>
                <Circle
                  center={[point.lat, point.lng]}
                  radius={radius}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.15,
                    weight: 2
                  }}
                />

                <Marker
                  position={[point.lat, point.lng]}
                  icon={createDeviceIcon()}
                  eventHandlers={{
                    click: () => {
                      if (onPointSelect) onPointSelect(point);
                    }
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-bold text-lg mb-2 text-gray-800">{point.location}</h3>

                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Risk Level:</span>
                          <span
                            className={`font-bold px-2 py-1 rounded text-xs ${
                              point.risk_level === 'high'
                                ? 'bg-red-100 text-red-700'
                                : point.risk_level === 'moderate'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {point.risk_level?.toUpperCase()}
                          </span>
                        </div>

                        {point.risk_score !== null && point.risk_score !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Risk Score:</span>
                            <span className="font-semibold text-gray-800">
                              {point.risk_score.toFixed(2)}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Air Quality:</span>
                          <span className="font-semibold text-gray-800">{point.air_quality}</span>
                        </div>

                        {point.pm2_5 !== null && point.pm2_5 !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">PM2.5:</span>
                            <span className="font-semibold text-gray-800">
                              {point.pm2_5.toFixed(1)} μg/m³
                            </span>
                          </div>
                        )}

                        {point.pm10 !== null && point.pm10 !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">PM10:</span>
                            <span className="font-semibold text-gray-800">
                              {point.pm10.toFixed(1)} μg/m³
                            </span>
                          </div>
                        )}

                        {/* Simple Visualization Bars */}
                        {(point.pm2_5 !== null || point.pm10 !== null) && (
                          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                            <div className="text-xs font-semibold text-gray-700 mb-2">Visualisasi:</div>
                            {point.pm2_5 !== null && point.pm2_5 !== undefined && (
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-600">PM2.5</span>
                                  <span className="font-semibold">{point.pm2_5.toFixed(0)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      point.pm2_5 > 75 ? 'bg-red-500' :
                                      point.pm2_5 > 35 ? 'bg-orange-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(100, (point.pm2_5 / 150) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            {point.pm10 !== null && point.pm10 !== undefined && (
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-600">PM10</span>
                                  <span className="font-semibold">{point.pm10.toFixed(0)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      point.pm10 > 100 ? 'bg-red-500' :
                                      point.pm10 > 75 ? 'bg-orange-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(100, (point.pm10 / 200) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {point.device_id && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Device ID:</span>
                            <span className="font-mono text-xs text-gray-700">{point.device_id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

HeatmapMap.propTypes = {
  apiUrl: PropTypes.string,
  token: PropTypes.string,
  worksheetName: PropTypes.string,
  forceRefresh: PropTypes.bool,
  height: PropTypes.string,
  onError: PropTypes.func,
  onPointSelect: PropTypes.func
};


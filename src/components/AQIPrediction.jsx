import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * Komponen AQIPrediction
 * Menampilkan prediksi AQI (ISPU) 48 jam ke depan dari API Machine Learning
 */
export default function AQIPrediction({ city = 'Bandung', language = 'id', token = null }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const mlApiUrl = useMemo(() => import.meta.env.VITE_ML_API_URL || 'http://localhost:8001', []);
  const backendUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', []);

  const uiText = {
    id: {
      loading: 'Memproses prediksi ML...',
      error: 'Gagal memuat prediksi',
      title: 'Prediksi AQI (ISPU) 48 Jam',
      empty: 'Data historis tidak mencukupi untuk prediksi',
      hour: 'Jam',
      aqi: 'Indeks AQI'
    },
    en: {
      loading: 'Processing ML prediction...',
      error: 'Failed to load prediction',
      title: '48H AQI Prediction',
      empty: 'Insufficient history for prediction',
      hour: 'Hour',
      aqi: 'AQI Index'
    },
    su: {
      loading: 'Ngolah prediksi ML...',
      error: 'Gagal ngamuat prediksi',
      title: 'Prediksi AQI 48 Jam',
      empty: 'Data historis teu cekap',
      hour: 'Jam',
      aqi: 'Indéks AQI'
    }
  };

  const t = uiText[language] || uiText.id;

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      setError('');

      try {
        // 1. Ambil data historis dari backend utama (butuh minimal 49 jam terakhir)
        // Kita asumsikan ada endpoint untuk mendapatkan history PM2.5
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const historyRes = await fetch(`${backendUrl}/weather/analytics/hourly?city=${city}&hours=72`, {
          headers
        });
        if (!historyRes.ok) throw new Error('Gagal mengambil data historis');
        
        const historyJson = await historyRes.json();
        const hourlyData = historyJson.data?.hourly || [];

        console.log('📊 Data dari backend:', {
          total: hourlyData.length,
          first: hourlyData[0],
          last: hourlyData[hourlyData.length - 1]
        });

        // Data dari backend sekarang bisa berisi ribuan baris (data 30 detikan)
        // Kita butuh minimal data yang mencakup rentang 49 jam
        if (hourlyData.length < 49) {
          console.warn('⚠️ Data tidak cukup:', hourlyData.length, 'butuh minimal 49');
          setError(t.empty);
          setLoading(false);
          return;
        }

        // 2. Format data untuk API ML - sesuaikan dengan skema HistoryItem di app_simple.py
        const mlPayload = hourlyData.map(h => ({
          timestamp: h.timestamp || h.datetime,
          pm25_density: h.pm25_density || h.pm25 || 20.0
        }));

        console.log('📤 Sending to ML API:', {
          url: `${mlApiUrl}/predict`,
          dataPoints: mlPayload.length,
          sample: mlPayload.slice(0, 3)
        });

        // 3. Panggil API Machine Learning
        const mlRes = await fetch(`${mlApiUrl}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mlPayload)
        });

        const mlJson = await mlRes.json().catch(() => ({}));
        
        console.log('📥 ML API Response:', mlJson);
        
        if (!mlRes.ok) {
          throw new Error(mlJson.detail || 'API ML tidak merespon');
        }

        const predictions = mlJson.predictions || [];
        console.log('✅ Predictions received:', predictions.length);
        setPredictions(predictions);
      } catch (err) {
        console.error('ML Prediction Error:', err);
        setError(t.error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [mlApiUrl, backendUrl, city, token]);

  console.log('🎨 Rendering AQIPrediction:', { loading, error, predictionsCount: predictions.length });

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

  if (predictions.length === 0) {
    console.log('⚠️ No predictions to display');
    return null;
  }

  console.log('📈 Preparing to render with predictions:', {
    count: predictions.length,
    sample: predictions[0]
  });

  // Ambil data untuk ditampilkan (misal 12 jam ke depan)
  const displayData = predictions.slice(0, 12);
  const aqiValues = predictions.map(p => p.predicted_aqi);
  const minAqi = Math.min(...aqiValues);
  const maxAqi = Math.max(...aqiValues);
  const range = maxAqi - minAqi || 1;

  console.log('📊 Chart data:', { minAqi, maxAqi, range, displayCount: displayData.length });

  const getAqiColor = (val) => {
    if (val <= 50) return 'text-green-700 bg-green-50 border-green-200 ring-green-500';
    if (val <= 100) return 'text-yellow-700 bg-yellow-50 border-yellow-200 ring-yellow-500';
    if (val <= 150) return 'text-orange-700 bg-orange-50 border-orange-200 ring-orange-500';
    if (val <= 200) return 'text-red-700 bg-red-50 border-red-200 ring-red-500';
    return 'text-purple-700 bg-purple-50 border-purple-200 ring-purple-500';
  };

  const getAqiStatus = (val) => {
    if (val <= 50) return language === 'id' ? 'Baik' : 'Good';
    if (val <= 100) return language === 'id' ? 'Sedang' : 'Moderate';
    if (val <= 150) return language === 'id' ? 'Tidak Sehat (Sensitif)' : 'Unhealthy (Sensitive)';
    if (val <= 200) return language === 'id' ? 'Tidak Sehat' : 'Unhealthy';
    if (val <= 300) return language === 'id' ? 'Sangat Tidak Sehat' : 'Very Unhealthy';
    return language === 'id' ? 'Berbahaya' : 'Hazardous';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-md">
      <div className="px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 leading-none">{t.title}</h3>
            <p className="text-[10px] text-gray-400 font-medium mt-1">Machine Learning Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Live Predict</span>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col lg:flex-row gap-5 overflow-hidden">
        {/* Grafik Line Chart - Ukuran lebih kompak */}
        <div className="flex-[2] flex flex-col">
          <div className="flex justify-between items-end mb-4 px-1">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Air Quality Trend</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-gray-900">{Math.round(aqiValues[0])}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 uppercase tracking-tighter">Current AQI</span>
              </div>
            </div>
            <div className="flex gap-6 items-center bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              <div className="text-center">
                <span className="text-[8px] text-gray-400 uppercase font-black block leading-none mb-1">Avg</span>
                <span className="text-xs font-black text-blue-600">{Math.round(aqiValues.reduce((a,b) => a+b, 0) / aqiValues.length)}</span>
              </div>
              <div className="w-px h-6 bg-gray-200"></div>
              <div className="text-center">
                <span className="text-[8px] text-gray-400 uppercase font-black block leading-none mb-1">Peak</span>
                <span className="text-xs font-black text-orange-600">{Math.round(maxAqi)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-white relative group/chart min-h-[200px] max-h-[280px]">
            {/* Axis Labels - Y */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[8px] font-black text-gray-300 uppercase pointer-events-none z-10">
              <span>{Math.round(maxAqi)}</span>
              <span>{Math.round(minAqi)}</span>
            </div>

            {/* Chart Container */}
            <div className="relative h-full ml-6">
              {/* Hover Tooltip - More Minimal */}
              {hoveredPoint && (
                <div 
                  className="absolute bg-gray-900 text-white p-2 rounded-lg shadow-xl z-50 pointer-events-none transition-all duration-200"
                  style={{
                    left: `${hoveredPoint.x}%`,
                    top: `${hoveredPoint.y}%`,
                    transform: 'translate(-50%, -120%)',
                  }}
                >
                  <div className="text-[7px] font-bold text-gray-400 uppercase leading-none mb-1">
                    {new Date(hoveredPoint.data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black">
                      {Math.round(hoveredPoint.data.predicted_aqi)}
                    </span>
                    <span className="text-[6px] font-bold px-1.5 py-0.5 rounded bg-white/20 uppercase">
                      {getAqiStatus(hoveredPoint.data.predicted_aqi)}
                    </span>
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
                  const idx = Math.round((xPerc / 100) * (predictions.length - 1));
                  const clampedIdx = Math.max(0, Math.min(predictions.length - 1, idx));
                  const p = predictions[clampedIdx];
                  const x = (clampedIdx / (predictions.length - 1)) * 100;
                  const y = 90 - (((p.predicted_aqi || minAqi) - minAqi) / range) * 80;
                  setHoveredPoint({ x, y, data: p });
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <defs>
                  <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                
                {/* Grid horizontal lines */}
                {[0, 25, 50, 75, 100].map(v => (
                  <line key={v} x1="0" y1={v} x2="100" y2={v} stroke="#f3f4f6" strokeWidth="0.5" />
                ))}
                
                {/* Area under line */}
                {predictions.length > 1 && (
                  <path
                    d={`M 0 100 L ${predictions.map((p, idx) => {
                      const x = (idx / (predictions.length - 1)) * 100;
                      const y = 90 - (((p.predicted_aqi || minAqi) - minAqi) / range) * 80;
                      return `${x} ${y}`;
                    }).join(' L ')} L 100 100 Z`}
                    fill="url(#area-gradient)"
                  />
                )}
                
                {/* Main Line */}
                {predictions.length > 1 && (
                  <path
                    d={`M ${predictions.map((p, idx) => {
                      const x = (idx / (predictions.length - 1)) * 100;
                      const y = 90 - (((p.predicted_aqi || minAqi) - minAqi) / range) * 80;
                      return `${x} ${y}`;
                    }).join(' L ')}`}
                    fill="none"
                    stroke="url(#line-gradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                  />
                )}
                
                {/* Active hover indicator line */}
                {hoveredPoint && (
                  <>
                    <line 
                      x1={hoveredPoint.x} y1="0" x2={hoveredPoint.x} y2="100" 
                      stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="4 4" 
                    />
                    <circle
                      cx={hoveredPoint.x}
                      cy={hoveredPoint.y}
                      r="4"
                      fill="#fff"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      className="shadow-xl"
                    />
                  </>
                )}
              </svg>
              
              {/* Axis Labels - X */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Sekarang</span>
                <span>+24 Jam</span>
                <span>+48 Jam</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scorecard Summary Sidebar - Lebih Ramping */}
        <div className="flex-1 flex flex-col min-w-[200px] lg:max-w-[280px]">
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Timely Insight</span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
            {[0, 6, 12, 24, 36, 48].map((hourOffset) => {
              const pred = predictions[Math.min(predictions.length - 1, hourOffset)];
              if (!pred) return null;
              
              const aqiValue = Math.round(pred.predicted_aqi);
              const status = getAqiStatus(pred.predicted_aqi);
              const colorClasses = getAqiColor(pred.predicted_aqi);
              const [textColor, bgColor, borderColor] = colorClasses.split(' ');
              const time = new Date(pred.timestamp);
              
              return (
                <div 
                  key={hourOffset} 
                  className={`group relative flex items-center justify-between p-3 rounded-xl border ${borderColor} ${bgColor} hover:brightness-95 transition-all duration-200`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-[8px] font-black uppercase tracking-tighter opacity-70 ${textColor}`}>
                        {hourOffset === 0 ? 'Now' : `+${hourOffset}H`}
                      </span>
                      <span className={`text-[9px] font-bold ${textColor} opacity-50`}>•</span>
                      <span className={`text-[9px] font-bold ${textColor}`}>
                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-tight ${textColor}`}>{status}</span>
                  </div>
                  
                  <div className="text-right">
                    <span className={`text-xl font-black tracking-tighter leading-none ${textColor}`}>{aqiValue}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
    </div>
  );
}

AQIPrediction.propTypes = {
  city: PropTypes.string,
  language: PropTypes.string,
  token: PropTypes.string
};

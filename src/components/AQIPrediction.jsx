import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { authService } from '../services/auth';

/**
 * Komponen AQIPrediction
 * Menampilkan prediksi AQI (ISPU) 48 jam ke depan dari API Machine Learning
 */
export default function AQIPrediction({ city = 'Bandung', language = 'id', token = null }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [pollutant, setPollutant] = useState('pm25');
  const [currentData, setCurrentData] = useState(null);

  const mlApiUrl = useMemo(() => import.meta.env.VITE_ML_API_URL || 'http://localhost:8001', []);
  const backendUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', []);

  const uiText = {
    id: {
      loading: 'Memproses prediksi ML...',
      error: 'Gagal memuat prediksi',
      title: 'Prediksi AQI (ISPU) 48 Jam',
      empty: 'Data historis tidak mencukupi untuk prediksi',
      hour: 'Jam',
      aqi: 'Indeks AQI',
      selectPollutant: 'Pilih Polutan'
    },
    en: {
      loading: 'Processing ML prediction...',
      error: 'Failed to load prediction',
      title: '48H AQI Prediction',
      empty: 'Insufficient history for prediction',
      hour: 'Hour',
      aqi: 'AQI Index',
      selectPollutant: 'Select Pollutant'
    },
    su: {
      loading: 'Ngolah prediksi ML...',
      error: 'Gagal ngamuat prediksi',
      title: 'Prediksi AQI 48 Jam',
      empty: 'Data historis teu cekap',
      hour: 'Jam',
      aqi: 'Indéks AQI',
      selectPollutant: 'Pilih Polutan'
    }
  };

  const t = uiText[language] || uiText.id;

  // Helper untuk hitung AQI (ISPU) secara manual untuk laporan WA
  const calculateAQI = (density, type) => {
    const points = {
      pm25: { x: [0.0, 15.5, 55.4, 150.4, 250.4, 500.0], y: [0, 50, 100, 200, 300, 500] },
      pm10: { x: [0.0, 50, 150, 350, 420, 10000], y: [0, 50, 100, 200, 300, 500] }
    };
    const { x, y } = points[type];
    
    for (let i = 0; i < x.length - 1; i++) {
      if (density >= x[i] && density <= x[i+1]) {
        return ((y[i+1] - y[i]) / (x[i+1] - x[i])) * (density - x[i]) + y[i];
      }
    }
    return y[y.length - 1];
  };

  const shareToWhatsApp = (mode = 'full') => {
    try {
      if (!currentData) {
        console.warn('⚠️ Tidak ada data saat ini untuk laporan WA');
        return;
      }
      
      if (!predictions || predictions.length === 0) {
        console.warn('⚠️ Tidak ada data prediksi untuk laporan WA');
        return;
      }

      // Ambil data profil user untuk personalisasi
      let user = null;
      try {
        user = authService.getCurrentUser();
      } catch (authErr) {
        console.error('Error fetching user profile:', authErr);
      }

      const aqi25 = Math.round(calculateAQI(currentData.pm25_density || 0, 'pm25'));
      const aqi10 = Math.round(calculateAQI(currentData.pm10_density || 0, 'pm10'));
      
      const avgAqi = Math.round(predictions.reduce((a, b) => a + (b.predicted_aqi || 0), 0) / predictions.length);
      const peakAqi = Math.round(Math.max(...predictions.map(p => p.predicted_aqi || 0)));
      
      const status25 = getAqiStatus(aqi25);
      const status10 = getAqiStatus(aqi10);

      // Cari 3 waktu terbaik (AQI terendah) dari prediksi
      const sortedPredictions = [...predictions].sort((a, b) => a.predicted_aqi - b.predicted_aqi);
      const top3Times = sortedPredictions.slice(0, 3).map(p => ({
        time: new Date(p.timestamp).toLocaleString('id-ID', { weekday: 'long', hour: '2-digit', minute: '2-digit' }),
        aqi: Math.round(p.predicted_aqi)
      }));

      const bestTimeStr = top3Times[0]?.time || '-';

      // Personalisasi Saran Kesehatan
      let personalAdvice = '';
      const isSensitive = user?.sensitivity_level === 'high' || (user?.age && (user.age < 12 || user.age > 60));
      const activity = user?.activity_level || 'moderate';

      if (aqi25 > 150 || aqi10 > 150) {
        personalAdvice = isSensitive 
          ? '🔴 *PERINGATAN:* Kualitas udara sangat buruk bagi kondisi Anda. Tetaplah di dalam ruangan dan gunakan air purifier jika memungkinkan.'
          : '🔴 *PERINGATAN:* Gunakan masker N95 jika harus keluar rumah. Hindari aktivitas fisik berat.';
      } else if (aqi25 > 100 || aqi10 > 100) {
        personalAdvice = isSensitive
          ? '🟠 *Saran:* Kelompok sensitif sebaiknya mengurangi aktivitas luar ruangan yang lama.'
          : '🟠 *Saran:* Gunakan masker medis saat beraktivitas di luar.';
      } else {
        personalAdvice = activity === 'active'
          ? '🟢 *Saran:* Kualitas udara mendukung untuk olahraga outdoor! Tetap jaga hidrasi.'
          : '🟢 *Saran:* Udara bersih. Waktu yang baik untuk ventilasi rumah atau jalan santai.';
      }

      let message = '';

      if (mode === 'status') {
        // Format ringkas untuk Status WhatsApp (Lebih estetik)
        message = `☁️ *Update Udara ${city}* ☁️\n` +
          `━━━━━━━━━━━━━━━\n` +
          `📍 PM2.5: *${aqi25}* (${status25})\n` +
          `🏃 Best Time: *${bestTimeStr}*\n` +
          `📢 _${personalAdvice.split(':')[1]?.trim() || personalAdvice}_\n` +
          `━━━━━━━━━━━━━━━\n` +
          `Cek selengkapnya di Hawa Air Quality! 🌍`;
      } else {
        // Format lengkap (Kaya Informasi)
        const nameGreeting = user?.full_name ? `Halo, *${user.full_name}*! ` : '';
        
        message = `*🌿 Laporan Kualitas Udara ${city} 🌿*\n` +
          `📅 _${new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}_\n` +
          `━━━━━━━━━━━━━━━━━━\n\n` +
          `${nameGreeting}Berikut adalah analisis udara terbaru untuk Anda:\n\n` +
          `📍 *KONDISI REAL-TIME:*\n` +
          `• AQI PM2.5: *${aqi25}* (${status25})\n` +
          `• AQI PM10: *${aqi10}* (${status10})\n\n` +
          `🩺 *REKOMENDASI KESEHATAN:*\n` +
          `${personalAdvice}\n\n` +
          `📊 *OUTLOOK 48 JAM (${pollutant.toUpperCase()}):*\n` +
          `• Rata-rata: *${avgAqi}*\n` +
          `• Puncak: *${peakAqi}*\n\n` +
          `🏃 *WAKTU TERBAIK BERAKTIVITAS:*\n` +
          top3Times.map((t, i) => `${i+1}. *${t.time}* (AQI: ${t.aqi})`).join('\n') +
          `\n\n` +
          `💡 *TIPS:* Jendela waktu di atas adalah saat polusi diprediksi mencapai titik terendah. Gunakan waktu tersebut untuk olahraga atau menjemur pakaian.\n\n` +
          `_Dikirim otomatis via Hawa Air Quality Monitor_`;
      }

      const encodedMessage = encodeURIComponent(message);
      
      // Ambil nomor WA dari profil user
      const phoneNumber = user?.phone_e164 || '';
      
      // Bersihkan nomor telepon (hanya angka)
      let cleanPhone = phoneNumber ? String(phoneNumber).replace(/[^0-9]/g, '') : '';
      
      // Auto-fix untuk nomor Indonesia yang dimulai dengan '0'
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '62' + cleanPhone.substring(1);
      }
      
      // Gunakan format api.whatsapp.com untuk kompatibilitas lebih baik
      const waUrl = cleanPhone 
        ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`
        : `https://api.whatsapp.com/send?text=${encodedMessage}`;
        
      console.log('🚀 Opening WhatsApp URL:', waUrl);
      
      // Gunakan link anchor sementara untuk memicu pembukaan aplikasi di mobile
      const link = document.createElement('a');
      link.href = waUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('❌ Error sharing to WhatsApp:', err);
      alert('Gagal mengirim laporan ke WhatsApp. Silakan coba lagi.');
    }
  };

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      setError('');

      try {
        // 1. Ambil data historis dari backend utama (butuh minimal 49 jam terakhir)
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const historyRes = await fetch(`${backendUrl}/weather/analytics/hourly?city=${city}&hours=72`, {
          headers
        });
        if (!historyRes.ok) throw new Error('Gagal mengambil data historis');
        
        const historyJson = await historyRes.json();
        const hourlyData = historyJson.data?.hourly || [];

        // Data dari backend sekarang bisa berisi ribuan baris (data 30 detikan)
        // Kita butuh minimal data yang mencakup rentang 49 jam
        if (hourlyData.length < 49) {
          setError(t.empty);
          setLoading(false);
          return;
        }

        // 2. Format data untuk API ML - sesuaikan dengan skema HistoryItem di app_simple.py
        const mlPayload = hourlyData.map(h => ({
          timestamp: h.timestamp || h.datetime,
          pm25_density: h.pm25_density || h.pm25 || 0,
          pm10_density: h.pm10_density || h.pm10 || 0
        }));

        // Simpan data terakhir untuk laporan WhatsApp
        if (mlPayload.length > 0) {
          setCurrentData(mlPayload[mlPayload.length - 1]);
        }

        // 3. Panggil API Machine Learning dengan format PredictRequest
        const mlRes = await fetch(`${mlApiUrl}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pollutant: pollutant,
            history: mlPayload
          })
        });

        const mlJson = await mlRes.json().catch(() => ({}));
        
        if (!mlRes.ok) {
          throw new Error(mlJson.detail || 'API ML tidak merespon');
        }

        const predictions = mlJson.predictions || [];
        setPredictions(predictions);
      } catch (err) {
        console.error('ML Prediction Error:', err);
        setError(t.error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [mlApiUrl, backendUrl, city, token, pollutant, t.empty, t.error]);

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
            <h3 className="text-sm font-bold text-gray-900 leading-none">
              {t.title} {pollutant === 'pm25' ? 'PM2.5' : 'PM10'}
            </h3>
            <p className="text-[10px] text-gray-400 font-medium mt-1">Machine Learning Analysis</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <button
              onClick={() => setPollutant('pm25')}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                pollutant === 'pm25' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              PM2.5
            </button>
            <button
              onClick={() => setPollutant('pm10')}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                pollutant === 'pm10' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              PM10
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Live</span>
          </div>

          <button
            onClick={() => shareToWhatsApp('full')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm group"
            title="Kirim Laporan Lengkap"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.672 1.433 5.66 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-tight">Lapor</span>
          </button>

          <button
            onClick={() => shareToWhatsApp('status')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm group"
            title="Bagikan ke Status WA"
          >
            <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-tight">Status</span>
          </button>
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
                  <div className="text-[7px] font-bold text-gray-400 uppercase leading-none mb-1">
                    PM2.5: {Math.round(hoveredPoint.data.pm25_density)} μg/m³
                  </div>
                  <div className="text-[7px] font-bold text-gray-400 uppercase leading-none mb-1">
                    PM10: {Math.round(hoveredPoint.data.pm10_density)} μg/m³
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

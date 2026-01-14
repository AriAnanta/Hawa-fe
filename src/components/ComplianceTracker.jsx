import { useState, useEffect } from 'react';
import { Factory, AlertTriangle, CheckCircle, TrendingUp, RefreshCw, BarChart3 } from 'lucide-react';
import { complianceService } from '../services/compliance';
import { authService } from '../services/auth';

export default function ComplianceTracker({ apiUrl, token, language = 'id' }) {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [thresholds, setThresholds] = useState({
    pm25: 35.0,
    pm10: 50.0
  });

  const translations = {
    id: {
      title: 'Compliance Analytics',
      subtitle: 'Analisis kepatuhan emisi dari data heatmap real-time',
      generateFromHeatmap: 'Generate dari Heatmap',
      generating: 'Mengenerate...',
      status: 'Status',
      recordedAt: 'Direkam',
      compliant: 'Compliant',
      nonCompliant: 'Non-Compliant',
      warning: 'Warning',
      stats: 'Statistik',
      totalRecords: 'Total Record',
      complianceRate: 'Tingkat Kepatuhan',
      average: 'Rata-rata',
      max: 'Maksimum',
      noRecords: 'Belum ada data compliance. Klik "Generate dari Heatmap" untuk menganalisis data real-time.',
      thresholdPm25: 'Batas PM2.5 (μg/m³)',
      thresholdPm10: 'Batas PM10 (μg/m³)',
      description: 'Compliance Tracker menganalisis data polusi real-time dari heatmap dan membandingkannya dengan batas regulasi. Data di-generate otomatis dari sensor IoT yang terhubung.',
      lastGenerated: 'Terakhir di-generate'
    },
    en: {
      title: 'Compliance Analytics',
      subtitle: 'Analyze emission compliance from real-time heatmap data',
      generateFromHeatmap: 'Generate from Heatmap',
      generating: 'Generating...',
      status: 'Status',
      recordedAt: 'Recorded',
      compliant: 'Compliant',
      nonCompliant: 'Non-Compliant',
      warning: 'Warning',
      stats: 'Statistics',
      totalRecords: 'Total Records',
      complianceRate: 'Compliance Rate',
      average: 'Average',
      max: 'Maximum',
      noRecords: 'No compliance data yet. Click "Generate from Heatmap" to analyze real-time data.',
      thresholdPm25: 'PM2.5 Threshold (μg/m³)',
      thresholdPm10: 'PM10 Threshold (μg/m³)',
      description: 'Compliance Tracker analyzes real-time pollution data from heatmap and compares it with regulatory thresholds. Data is automatically generated from connected IoT sensors.',
      lastGenerated: 'Last generated'
    }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [historyData, statsData] = await Promise.all([
        complianceService.getHistory(token, { limit: 10 }),
        complianceService.getStats(token, 30)
      ]);
      setRecords(historyData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load compliance data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFromHeatmap = async () => {
    setGenerating(true);
    setError('');
    setSuccess('');
    
    try {
      const apiBaseUrl = apiUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(
        `${apiBaseUrl}/compliance/generate-from-heatmap?regulatory_threshold_pm25=${thresholds.pm25}&regulatory_threshold_pm10=${thresholds.pm10}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to generate compliance data');
      }
      
      const generatedRecords = await response.json();
      setSuccess(`Generated ${generatedRecords.length} compliance records from heatmap data`);
      setTimeout(() => setSuccess(''), 5000);
      loadData();
    } catch (err) {
      setError('Failed to generate from heatmap: ' + err.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      compliant: 'bg-green-100 text-green-700 border-green-200',
      non_compliant: 'bg-red-100 text-red-700 border-red-200',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'compliant') return <CheckCircle size={16} className="text-green-600" />;
    if (status === 'non_compliant') return <AlertTriangle size={16} className="text-red-600" />;
    return <AlertTriangle size={16} className="text-yellow-600" />;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <BarChart3 className="text-blue-600" size={20} />
            <h3 className="text-sm font-bold text-gray-900">{t.title}</h3>
          </div>
          <p className="text-xs text-gray-500">{t.subtitle}</p>
          <p className="text-xs text-gray-400 mt-1">{t.description}</p>
        </div>
      </div>

      {/* Threshold Settings */}
      <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">{t.thresholdPm25}</label>
            <input
              type="number"
              step="0.1"
              value={thresholds.pm25}
              onChange={(e) => setThresholds({...thresholds, pm25: parseFloat(e.target.value) || 35.0})}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">{t.thresholdPm10}</label>
            <input
              type="number"
              step="0.1"
              value={thresholds.pm10}
              onChange={(e) => setThresholds({...thresholds, pm10: parseFloat(e.target.value) || 50.0})}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerateFromHeatmap}
              disabled={generating}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>{t.generating}</span>
                </>
              ) : (
                <>
                  <RefreshCw size={14} />
                  <span>{t.generateFromHeatmap}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 p-2 bg-green-50 border border-green-200 text-green-700 rounded text-xs">
          {success}
        </div>
      )}


      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-xs">
          Loading...
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {stats && stats.total_records > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp size={16} className="text-blue-600" />
                <span className="text-xs font-semibold text-gray-900">{t.stats}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <span className="text-gray-600">{t.totalRecords}:</span>
                  <span className="ml-1 font-semibold">{stats.total_records}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t.complianceRate}:</span>
                  <span className="ml-1 font-semibold">{stats.compliance_rate}%</span>
                </div>
                <div>
                  <span className="text-gray-600">{t.compliant}:</span>
                  <span className="ml-1 font-semibold text-green-600">{stats.compliant_count}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t.nonCompliant}:</span>
                  <span className="ml-1 font-semibold text-red-600">{stats.non_compliant_count}</span>
                </div>
              </div>
              {stats.average_pm25 && stats.average_pm10 && (
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-blue-200">
                  <div>
                    <span className="text-gray-600">{t.average} PM2.5:</span>
                    <span className="ml-1 font-semibold">{stats.average_pm25} μg/m³</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t.average} PM10:</span>
                    <span className="ml-1 font-semibold">{stats.average_pm10} μg/m³</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {records.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-xs">
              {t.noRecords}
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((record) => (
                <div key={record.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.compliance_status)}
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(record.compliance_status)}`}>
                        {record.compliance_status === 'compliant' ? t.compliant : 
                         record.compliance_status === 'non_compliant' ? t.nonCompliant : t.warning}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(record.recorded_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                    <div>PM2.5: {record.emission_pm25} / {record.regulatory_threshold_pm25}</div>
                    <div>PM10: {record.emission_pm10} / {record.regulatory_threshold_pm10}</div>
                  </div>
                  {record.facility_name && (
                    <div className="text-xs text-gray-500 mt-1">
                      {record.facility_name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { RefreshCw, Database, Activity, AlertCircle, Clock, FileSpreadsheet, Users, BarChart3 } from 'lucide-react';
import { adminService } from '../services/admin';
import { authService } from '../services/auth';

export default function AdminIoTData() {
  const [worksheetName, setWorksheetName] = useState('Sheet1');
  const [worksheetInput, setWorksheetInput] = useState('Sheet1'); // Input field value
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking' | 'connected' | 'disconnected'
  const [spreadsheetData, setSpreadsheetData] = useState(null);
  const [latestData, setLatestData] = useState(null);
  const [stats, setStats] = useState(null);
  const [dashboardInfo, setDashboardInfo] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Load data saat component mount
useEffect(() => {
  loadData();

  // Set interval untuk auto-refresh setiap 30 menit (1800000 ms)
  const interval = setInterval(() => {
    refreshData();
  }, 1800000); // 30 menit

  return () => {
    clearInterval(interval);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Hanya run sekali saat mount

  // Debounce untuk worksheet name input
useEffect(() => {
  // Clear previous timer
  if (debounceTimerRef.current) {
    clearTimeout(debounceTimerRef.current);
  }

  // Set new timer - tunggu 1 detik setelah user berhenti mengetik
  debounceTimerRef.current = setTimeout(() => {
    if (worksheetInput.trim() !== worksheetName) {
      setWorksheetName(worksheetInput.trim() || 'Sheet1');
      loadData();
    }
  }, 1000); // 1 detik debounce

  return () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [worksheetInput]);

  const loadData = async () => {
    // Cancel previous request jika masih berjalan
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError('');
    setConnectionStatus('checking');

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Anda harus login terlebih dahulu');
      }

      const currentWorksheet = worksheetName || 'Sheet1';

      // Load semua data secara parallel dengan error handling yang lebih baik
      const [dataResult, latestResult, statsResult, dashboardResult] = await Promise.allSettled([
        adminService.getSpreadsheetData(token, { 
          worksheetName: currentWorksheet, 
          limit: 50, 
          offset: 0,
          includeProcessed: true 
        }),
        adminService.getLatestSpreadsheetData(token, currentWorksheet, true),
        adminService.getSpreadsheetStats(token, currentWorksheet),
        adminService.getDashboardInfo(token)
      ]);

      // Process results
      const data = dataResult.status === 'fulfilled' ? dataResult.value : { error: dataResult.reason?.message || 'Failed to load data' };
      const latest = latestResult.status === 'fulfilled' ? latestResult.value : { error: latestResult.reason?.message || 'Failed to load latest data' };
      const statsData = statsResult.status === 'fulfilled' ? statsResult.value : { error: statsResult.reason?.message || 'Failed to load stats' };
      const dashboard = dashboardResult.status === 'fulfilled' ? dashboardResult.value : { error: dashboardResult.reason?.message || 'Failed to load dashboard info' };

      // Check connection status - jika semua error, berarti disconnected
      const hasErrors = data.error || latest.error || statsData.error;
      
      if (hasErrors && !data.success && !latest.success && !statsData.success) {
        setConnectionStatus('disconnected');
        const errorMessages = [data.error, latest.error, statsData.error].filter(Boolean);
        setError(errorMessages[0] || 'Tidak dapat terhubung ke spreadsheet. Periksa koneksi atau konfigurasi.');
      } else {
        setConnectionStatus('connected');
        if (data.success) setSpreadsheetData(data);
        if (latest.success) setLatestData(latest);
        if (statsData.success) setStats(statsData);
        if (dashboard && !dashboard.error) setDashboardInfo(dashboard);
        setLastUpdate(new Date());
        setError(''); // Clear error jika ada yang berhasil
      }
    } catch (err) {
      // Check if request was aborted
      if (err.name === 'AbortError') {
        return; // Don't update state if aborted
      }
      
      console.error('Error loading data:', err);
      setConnectionStatus('disconnected');
      setError(err.message || 'Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    setError('');

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Anda harus login terlebih dahulu');
      }

      const currentWorksheet = worksheetName || 'Sheet1';

      // Refresh data dengan Promise.allSettled untuk handle error lebih baik
      const [dataResult, latestResult, statsResult] = await Promise.allSettled([
        adminService.getSpreadsheetData(token, { 
          worksheetName: currentWorksheet, 
          limit: 50, 
          offset: 0,
          includeProcessed: true 
        }),
        adminService.getLatestSpreadsheetData(token, currentWorksheet, true),
        adminService.getSpreadsheetStats(token, currentWorksheet)
      ]);

      // Process results
      const data = dataResult.status === 'fulfilled' ? dataResult.value : { error: dataResult.reason?.message || 'Failed to refresh data' };
      const latest = latestResult.status === 'fulfilled' ? latestResult.value : { error: latestResult.reason?.message || 'Failed to refresh latest data' };
      const statsData = statsResult.status === 'fulfilled' ? statsResult.value : { error: statsResult.reason?.message || 'Failed to refresh stats' };

      // Update state hanya jika berhasil
      if (data.success) setSpreadsheetData(data);
      if (latest.success) setLatestData(latest);
      if (statsData.success) setStats(statsData);
      
      // Update connection status
      if (data.success || latest.success || statsData.success) {
        setConnectionStatus('connected');
        setLastUpdate(new Date());
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
      setConnectionStatus('disconnected');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Terhubung';
      case 'disconnected':
        return 'Tidak Terhubung';
      default:
        return 'Memeriksa...';
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-md">
                <Database className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900">
                  IoT Data
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Monitor data spreadsheet secara real-time
                </p>
              </div>
            </div>
            
            {/* Connection Status & Refresh */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(connectionStatus)} animate-pulse`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {getStatusText(connectionStatus)}
                </span>
              </div>
              <button
                onClick={refreshData}
                disabled={isRefreshing || isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={18} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Worksheet Selector */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-semibold text-gray-700">Worksheet:</label>
            <input
              type="text"
              value={worksheetInput}
              onChange={(e) => setWorksheetInput(e.target.value)}
              placeholder="Sheet1"
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                setWorksheetName(worksheetInput.trim() || 'Sheet1');
                loadData();
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              Load
            </button>
            {isLoading && (
              <span className="text-sm text-gray-500 flex items-center space-x-1">
                <RefreshCw className="animate-spin" size={16} />
                <span>Loading...</span>
              </span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Dashboard Stats */}
        {dashboardInfo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Users className="text-blue-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardInfo.total_users || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Activity className="text-green-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Total Admins</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardInfo.total_admins || 0}</p>
                </div>
              </div>
            </div>
            {spreadsheetData && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <FileSpreadsheet className="text-purple-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Total Records</p>
                    <p className="text-2xl font-bold text-gray-900">{spreadsheetData.total_records || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Latest Data Card */}
        {latestData && latestData.success && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Clock className="text-blue-600" size={20} />
                <h2 className="text-xl font-bold text-gray-900">Data Terbaru</h2>
              </div>
              {lastUpdate && (
                <span className="text-sm text-gray-500">
                  Update: {lastUpdate.toLocaleTimeString('id-ID')}
                </span>
              )}
            </div>
            
            {latestData.data && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(latestData.data).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">{key}</p>
                    <p className="text-lg font-semibold text-gray-900">{String(value)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Statistics */}
        {stats && stats.success && stats.stats && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="text-blue-600" size={20} />
              <h2 className="text-xl font-bold text-gray-900">Statistik Data</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(stats.stats).map(([key, statData]) => (
                <div key={key} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3 capitalize">{key}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min:</span>
                      <span className="font-medium">{statData.min}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max:</span>
                      <span className="font-medium">{statData.max}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rata-rata:</span>
                      <span className="font-medium">{statData.avg?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-2">
                      <span className="text-gray-600 font-semibold">Terbaru:</span>
                      <span className="font-bold text-blue-600">{statData.latest}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Table */}
        {spreadsheetData && spreadsheetData.success && spreadsheetData.data && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="text-blue-600" size={20} />
                <h2 className="text-xl font-bold text-gray-900">Data Spreadsheet</h2>
              </div>
              <span className="text-sm text-gray-500">
                Menampilkan {spreadsheetData.data.length} dari {spreadsheetData.total_records} records
              </span>
            </div>

            {spreadsheetData.columns && spreadsheetData.columns.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {spreadsheetData.columns.map((column, idx) => (
                        <th
                          key={idx}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {spreadsheetData.data.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-gray-50">
                        {spreadsheetData.columns.map((column, colIdx) => (
                          <td
                            key={colIdx}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {row[column] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Tidak ada data untuk ditampilkan
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && !spreadsheetData && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-12 text-center">
            <RefreshCw className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && connectionStatus === 'connected' && !spreadsheetData && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-12 text-center">
            <Database className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-600">Tidak ada data untuk ditampilkan</p>
            <button
              onClick={loadData}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
            >
              Muat Data
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}


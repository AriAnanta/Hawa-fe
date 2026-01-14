import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Database, Users, BarChart3, Activity, AlertTriangle, MessageSquare } from 'lucide-react';
import { adminService } from '../services/admin';
import { feedbackService } from '../services/feedback';
import { authService } from '../services/auth';

export default function AdminDashboard() {
  const token = authService.getToken();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total_users: 0,
    total_admins: 0,
    total_industry: 0,
    total_public: 0
  });
  const [communityStats, setCommunityStats] = useState({
    total_reports: 0,
    latest_title: '',
    latest_location: ''
  });
  const fallbackIoT = [
    { label: 'Bandung', pm25: 42, pm10: 65, risk: 'Moderate' },
    { label: 'Jakarta', pm25: 58, pm10: 82, risk: 'High' },
    { label: 'Surabaya', pm25: 33, pm10: 51, risk: 'Low' }
  ];
  const fallbackOps = [
    { label: 'Sync success', value: '98%', color: 'text-green-600' },
    { label: 'API latency', value: '420ms', color: 'text-amber-600' },
    { label: 'Error rate', value: '0.8%', color: 'text-red-600' }
  ];

  const loadData = useMemo(
    () => async () => {
      setLoading(true);
      setError('');
      try {
        const [dashboard] = await Promise.all([
          adminService.getDashboardInfo(token)
        ]);
        setStats(dashboard?.stats || {});

        // community summary: fetch first page
        const feed = await feedbackService.getCommunityFeed(token, { limit: 20, sort: 'newest' });
        const reports = feed?.reports || [];
        setCommunityStats({
          total_reports: reports.length,
          latest_title: reports[0]?.title || '',
          latest_location: reports[0]?.location || ''
        });
      } catch (err) {
        setError(err.message || 'Gagal memuat data admin');
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) loadData();
  }, [token, loadData]);

  const StatCard = ({ title, value, icon: Icon, accent = 'bg-blue-50' }) => (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-black text-gray-900 mt-1">{loading ? '...' : value}</p>
      </div>
      <div className={`p-3 rounded-xl ${accent}`}>
        <Icon className="text-blue-600" size={24} />
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-md">
              <Database className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Dashboard untuk analytical dan monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Analytical Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Users" value={stats.total_users || 0} icon={Users} />
          <StatCard title="Admin" value={stats.total_admins || 0} icon={ShieldIcon} accent="bg-purple-50" />
          <StatCard title="Industry" value={stats.total_industry || 0} icon={FactoryIcon} accent="bg-amber-50" />
          <StatCard title="Public" value={stats.total_public || 0} icon={UserIcon} accent="bg-green-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={20} />
              <h3 className="text-lg font-bold text-gray-900">Realtime & IoT</h3>
            </div>
            <p className="text-sm text-gray-600">
              Statistik IoT & data heatmap (placeholder). Tambahkan integrasi grafis di sini.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {fallbackIoT.map((item) => (
                  <div key={item.label} className="p-3 rounded-lg bg-white border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-lg font-bold text-gray-900">{item.pm25} / {item.pm10}</p>
                    <p className="text-xs text-blue-700">{item.risk}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-blue-600" size={20} />
              <h3 className="text-lg font-bold text-gray-900">Community Snapshot</h3>
            </div>
            <p className="text-sm text-gray-600">
              Laporan komunitas terbaru dan ringkasannya.
            </p>
            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div>
                <p className="text-sm text-blue-700">Total laporan (fetch page)</p>
                <p className="text-2xl font-black text-blue-900">
                  {loading ? '...' : communityStats.total_reports}
                </p>
              </div>
              <MessageSquare className="text-blue-600" size={28} />
            </div>
            {communityStats.latest_title && (
              <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Laporan terbaru</p>
                <p className="text-sm font-semibold text-gray-900">{communityStats.latest_title}</p>
                {communityStats.latest_location && (
                  <p className="text-xs text-gray-500">{communityStats.latest_location}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="text-blue-600" size={20} />
            <h3 className="text-lg font-bold text-gray-900">Operational Overview</h3>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            {fallbackOps.map((item) => (
              <div key={item.label} className="flex items-center justify-between bg-white rounded-lg border border-gray-100 px-3 py-2 shadow-sm">
                <span className="text-sm text-gray-700">{item.label}</span>
                <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// lightweight icons reused
const ShieldIcon = (props) => <svg {...props} viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M12 11h4"/><path d="M12 7h4"/></svg>;
const FactoryIcon = (props) => <svg {...props} viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor"><path d="M2 19h20"/><path d="M2 19v-7l5-3v10"/><path d="M7 9l5-3v4l5-3v12"/><path d="M10 12h.01"/><path d="M14 12h.01"/><path d="M10 16h.01"/><path d="M14 16h.01"/></svg>;
const UserIcon = (props) => <svg {...props} viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Z"/><path d="M2 22a10 10 0 0 1 20 0"/></svg>;

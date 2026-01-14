import AdminLayout from '../components/AdminLayout';
import { MessageSquare, Loader2, Search, Filter, X, Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { adminFeedbackService } from '../services/adminFeedback';
import { feedbackService } from '../services/feedback';
import { authService } from '../services/auth';
import { useState, useEffect } from 'react';

export default function AdminFeedback() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stats, setStats] = useState(null);
  
  const token = authService.getToken();
  
  useEffect(() => {
    loadFeedback();
    loadStats();
  }, []);
  
  const fallbackSamples = [
    {
      id: 101,
      title: 'Sample asap hitam',
      description: 'Asap pekat di area industri',
      location: 'Bandung',
      category: 'pollution',
      severity: 'high',
      status: 'pending',
      is_anonymous: false,
      is_public: true,
      upvotes: 2,
      view_count: 5,
      attachment_count: 1,
      attachment_paths: [],
      created_at: new Date().toISOString(),
      author: { full_name: 'Sample User', is_anonymous: false }
    }
  ];

  const getAttachments = (attachmentPaths) => {
    if (!attachmentPaths) return [];
    if (Array.isArray(attachmentPaths)) return attachmentPaths;
    try {
      const parsed = JSON.parse(attachmentPaths);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const toAttachmentUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    return `${base}/uploads/${path}`;
  };

  const loadFeedback = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        limit: 100,
        offset: 0
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (searchTerm) params.search = searchTerm;
      
      // Try admin endpoint first
      const data = await adminFeedbackService.getAllFeedback(token, params);
      const adminReports = data.reports || [];
      setReports(adminReports);
      if (data.stats) setStats(data.stats);

      // If admin endpoint returns empty, fallback to public community feed so UI tidak kosong
      if (adminReports.length === 0) {
        const feed = await feedbackService.getCommunityFeed(token, { limit: params.limit, offset: params.offset, sort: 'newest' });
        const fallback = feed?.reports || [];
        setReports(fallback.length ? fallback : fallbackSamples);
        if (!data.stats && feed?.stats) setStats(feed.stats);
      }
    } catch (err) {
      setError('Failed to load admin feedback, showing community feed: ' + err.message);
      console.error('Error loading feedback:', err);
      try {
        const feed = await feedbackService.getCommunityFeed(token, { limit: 100, offset: 0, sort: 'newest' });
        const fallback = feed?.reports || [];
        setReports(fallback.length ? fallback : fallbackSamples);
        if (feed?.stats) setStats(feed.stats);
      } catch (fallbackErr) {
        console.error('Fallback community feed also failed:', fallbackErr);
        setReports(fallbackSamples);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const loadStats = async () => {
    try {
      const data = await adminFeedbackService.getFeedbackStats(token);
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };
  
  useEffect(() => {
    loadFeedback();
  }, [statusFilter, categoryFilter]);
  
  const handleSearch = () => {
    loadFeedback();
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={16} />;
      case 'reviewed':
        return <Eye className="text-blue-500" size={16} />;
      case 'resolved':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <AlertCircle className="text-gray-500" size={16} />;
    }
  };
  
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  const getSeverityBadge = (severity) => {
    const styles = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const filteredReports = reports.filter(report => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        report.title?.toLowerCase().includes(searchLower) ||
        report.description?.toLowerCase().includes(searchLower) ||
        report.location?.toLowerCase().includes(searchLower) ||
        report.author?.full_name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });
  
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-md">
              <MessageSquare className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900">
                Community Feedback
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Manage community reports and feedback
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Total Reports</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total_reports || 0}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.by_status?.pending || 0}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Resolved</div>
              <div className="text-2xl font-bold text-green-600">{stats.by_status?.resolved || 0}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Rejected</div>
              <div className="text-2xl font-bold text-red-600">{stats.by_status?.rejected || 0}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by title, description, location, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              <option value="pollution">Pollution</option>
              <option value="health">Health</option>
              <option value="visibility">Visibility</option>
              <option value="odor">Odor</option>
            </select>
          </div>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                loadFeedback();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
            >
              <X size={16} />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* DataTable */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-600 flex items-center justify-center">
              <Loader2 className="animate-spin mr-2" size={20} />
              Loading reports...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No reports found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={report.title}>{report.title || '-'}</div>
                        {report.description && (
                          <div className="text-xs text-gray-500 mt-1 truncate" title={report.description}>
                            {report.description.length > 50 ? report.description.substring(0, 50) + '...' : report.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          {report.author?.is_anonymous ? (
                            <span className="text-gray-400 italic">Anonymous</span>
                          ) : (
                            <span className="text-gray-900">{report.author?.full_name || 'User'}</span>
                          )}
                          {report.is_anonymous && (
                            <span className="text-xs text-gray-400">(anon)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.location || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.category || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {report.severity ? (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityBadge(report.severity)}`}>
                            {report.severity}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(report.status)}
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(report.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-400">👁 {report.view_count || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getAttachments(report.attachment_paths || report.attachments)?.length > 0 ? (
                          <button
                            onClick={() => {
                              const first = getAttachments(report.attachment_paths || report.attachments)[0];
                              const url = toAttachmentUrl(first);
                              if (url) window.open(url, '_blank', 'noopener,noreferrer');
                            }}
                            className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                          >
                            View Files
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}


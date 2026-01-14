import { useState, useMemo, useEffect } from 'react';
import UserSidebar from '../components/UserSidebar';
import ProfileDropdown from '../components/ProfileDropdown';
import Breadcrumbs from '../components/Breadcrumbs';
import { authService } from '../services/auth';
import { feedbackService } from '../services/feedback';
import { Menu, MessageSquare, Plus, Eye, MapPin, Filter, Search, X, Loader2, FileImage, User, Clock } from 'lucide-react';

export default function CommunityPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  const token = authService.getToken();
  const apiUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', []);
  const user = useMemo(() => authService.getCurrentUser(), []);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    severity: '',
    is_anonymous: false,
    is_public: true,
    files: []
  });

  useEffect(() => {
    loadFeed();
  }, [categoryFilter, severityFilter, sortBy]);

  const loadFeed = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        limit: 50,
        offset: 0,
        sort: sortBy
      };
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (severityFilter !== 'all') params.severity = severityFilter;
      if (searchTerm) params.search = searchTerm;
      
      const data = await feedbackService.getCommunityFeed(token, params);
      setReports(data.reports || []);
    } catch (err) {
      setError('Gagal memuat feed: ' + err.message);
      console.error('Error loading feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadFeed();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    if (!formData.title || !formData.description) {
      setError('Title dan description wajib diisi');
      setSubmitting(false);
      return;
    }
    
    try {
      await feedbackService.submitFeedback(token, formData, formData.files);
      setSuccess('Report berhasil dikirim!');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        category: '',
        severity: '',
        is_anonymous: false,
        is_public: true,
        files: []
      });
      setTimeout(() => setSuccess(''), 3000);
      loadFeed();
    } catch (err) {
      setError('Gagal mengirim report: ' + err.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };


  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('Maksimal 5 file');
      return;
    }
    setFormData({ ...formData, files });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

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
    const base = apiUrl.replace(/\/$/, '');
    return `${base}/uploads/${path}`;
  };

  const filteredReports = reports.filter(report => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        report.title?.toLowerCase().includes(searchLower) ||
        report.description?.toLowerCase().includes(searchLower) ||
        report.location?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 flex overflow-hidden">
      <UserSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <nav className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm h-14">
          <div className="px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden text-gray-700 hover:text-blue-600 transition-colors duration-300 p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu size={20} />
                </button>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="text-blue-600 hidden sm:block" size={18} />
                  <h1 className="text-lg font-black text-gray-900">Community Reports</h1>
                </div>
              </div>
              <ProfileDropdown />
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '#dashboard' },
                { label: 'Community' }
              ]}
              className="mb-4"
            />
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">
                  Community Reports
                </h1>
                <p className="text-gray-600 max-w-2xl">
                  Laporan dan diskusi tentang polusi udara dari komunitas. Lihat laporan dari user lain dan bagikan pengalaman Anda.
                </p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus size={18} />
                <span>Buat Report</span>
              </button>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {success}
              </div>
            )}

            {/* Submit Form Modal */}
            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Buat Report Baru</h2>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setError('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Contoh: Polusi tinggi di daerah..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi *</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Jelaskan kondisi polusi yang Anda alami..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Bandung, Jawa Barat"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Pilih kategori</option>
                          <option value="pollution">Polusi</option>
                          <option value="health">Kesehatan</option>
                          <option value="visibility">Visibilitas</option>
                          <option value="odor">Bau</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Keparahan</label>
                        <select
                          value={formData.severity}
                          onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Pilih tingkat</option>
                          <option value="low">Rendah</option>
                          <option value="medium">Sedang</option>
                          <option value="high">Tinggi</option>
                          <option value="critical">Kritis</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">File (maks 5)</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.is_anonymous}
                          onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Laporkan sebagai Anonymous</span>
                      </label>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setError('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            <span>Mengirim...</span>
                          </>
                        ) : (
                          <span>Kirim Report</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari report..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="pollution">Polusi</option>
                  <option value="health">Kesehatan</option>
                  <option value="visibility">Visibilitas</option>
                  <option value="odor">Bau</option>
                </select>
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="all">Semua Tingkat</option>
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                  <option value="critical">Kritis</option>
                </select>
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="newest">Terbaru</option>
                  <option value="views">Paling Dilihat</option>
                </select>
              </div>
            </div>

            {/* Feed */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 w-3/4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 w-full bg-gray-200 rounded mb-1"></div>
                        <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Belum ada report</h3>
                <p className="text-gray-600">Jadilah yang pertama membuat report!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div key={report.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {report.author?.is_anonymous ? (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="text-gray-500" size={20} />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              {report.author?.full_name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">
                              {report.author?.is_anonymous ? 'Anonymous' : report.author?.full_name || 'User'}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Clock size={12} />
                              <span>{formatDate(report.created_at)}</span>
                              {report.location && (
                                <>
                                  <span>•</span>
                                  <MapPin size={12} />
                                  <span>{report.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {report.severity && (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityColor(report.severity)}`}>
                            {report.severity}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{report.title}</h3>
                      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{report.description}</p>

                      {/* Attachments */}
                      {getAttachments(report.attachment_paths || report.attachments)?.length > 0 && (
                        <div className="mb-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {getAttachments(report.attachment_paths || report.attachments).map((path, idx) => {
                              const url = toAttachmentUrl(path);
                              if (!url) return null;
                              return (
                                <div
                                  key={`${path}-${idx}`}
                                  className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                                >
                                  <img
                                    src={url}
                                    alt={`lampiran-${idx + 1}`}
                                    className="w-full h-28 object-cover transition-transform duration-200 hover:scale-105"
                                    loading="lazy"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {report.category && (
                        <div className="mb-4">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {report.category}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 text-gray-500 text-sm">
                            <Eye size={16} />
                            <span>{report.view_count || 0}</span>
                          </div>
                          {report.attachment_count > 0 && (
                            <div className="flex items-center space-x-1 text-gray-500 text-sm">
                              <FileImage size={16} />
                              <span>{report.attachment_count}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

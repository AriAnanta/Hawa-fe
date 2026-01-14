import { useEffect, useState } from 'react';
import { Menu, Save, CheckCircle2, XCircle, User as UserIcon } from 'lucide-react';
import { authService } from '../services/auth';
import UserSidebar from '../components/UserSidebar';
import AlertSettings from '../components/AlertSettings';
import ProfileDropdown from '../components/ProfileDropdown';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Profile() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_e164: '',
    language: 'id',
    age: '',
    occupation: '',
    location: '',
    activity_level: '',
    sensitivity_level: '',
    health_conditions: '',
    privacy_consent: false
  });

  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    setError('');
    setSuccess(false);
    try {
      const data = await authService.getProfile();
      setInitialData(data);
      setFormData({
        full_name: data.full_name || '',
        phone_e164: data.phone_e164 || '',
        language: data.language || 'id',
        age: data.age ?? '',
        occupation: data.occupation || '',
        location: data.location || '',
        activity_level: data.activity_level || '',
        sensitivity_level: data.sensitivity_level || '',
        health_conditions: '',
        privacy_consent: !!data.privacy_consent
      });
    } catch (err) {
      setError(err.message || 'Gagal memuat profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setSuccess(false);
    if (error) setError('');
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? '' : parseInt(value, 10)
    }));
    setSuccess(false);
    if (error) setError('');
  };

  const validateForm = () => {
    if (formData.phone_e164 && !formData.phone_e164.startsWith('+')) {
      setError('Nomor telepon harus diawali + (format E.164, contoh: +6281234567890)');
      return false;
    }
    if (
      formData.activity_level &&
      !['sedentary', 'moderate', 'active'].includes(formData.activity_level)
    ) {
      setError('Activity level harus: sedentary, moderate, atau active');
      return false;
    }
    if (
      formData.sensitivity_level &&
      !['low', 'medium', 'high'].includes(formData.sensitivity_level)
    ) {
      setError('Sensitivity level harus: low, medium, atau high');
      return false;
    }
    if (formData.language && !['id', 'en', 'su'].includes(formData.language)) {
      setError('Language harus: id, en, atau su');
      return false;
    }
    return true;
  };

  const getChangedFields = (initial, current) => {
    if (!initial) return current;
    const changes = {};
    Object.keys(current).forEach((key) => {
      // Skip health_conditions if empty to avoid clearing encrypted data
      if (key === 'health_conditions' && !current[key]) return;
      const initialVal = initial[key] ?? '';
      const currentVal = current[key] ?? '';
      if (initialVal !== currentVal) {
        changes[key] = current[key];
      }
    });
    return changes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) return;

    const changes = getChangedFields(initialData || {}, formData);
    if (Object.keys(changes).length === 0) {
      setError('Tidak ada perubahan untuk disimpan');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await authService.updateProfile(changes);
      setInitialData(updated);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Gagal menyimpan profil');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex">
      <UserSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <nav className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden text-gray-700 hover:text-blue-600 transition-colors duration-300 p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu size={22} />
                </button>
                <div className="flex items-center space-x-2">
                  <UserIcon className="text-blue-600" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Akun</p>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900">Profil</h1>
                  </div>
                </div>
              </div>

              <ProfileDropdown />
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '#dashboard' },
                { label: 'Profile' }
              ]}
            />
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
              {error && (
                <div className="mb-4 flex items-center space-x-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                  <XCircle size={18} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 flex items-center space-x-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                  <CheckCircle2 size={18} />
                  <span className="text-sm">Profil berhasil diperbarui</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset disabled={isLoading || isSaving} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-800">Nama Lengkap</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                        placeholder="Nama lengkap"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-800">Nomor Telepon (WhatsApp)</label>
                      <input
                        type="tel"
                        name="phone_e164"
                        value={formData.phone_e164}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                        placeholder="+6281234567890"
                      />
                      {formData.phone_e164 && !formData.phone_e164.startsWith('+') && (
                        <p className="text-xs text-amber-600">Nomor harus diawali + (format E.164)</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-800">Bahasa</label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="id">Bahasa Indonesia</option>
                        <option value="en">English</option>
                        <option value="su">Bahasa Sunda</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-800">Usia</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleNumberChange}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                        min="1"
                        max="120"
                        placeholder="25"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-800">Pekerjaan</label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                        placeholder="Karyawan / Pelajar / dll"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-800">Lokasi</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                        placeholder="Bandung"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-800">Activity Level</label>
                      <select
                        name="activity_level"
                        value={formData.activity_level}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="">Pilih activity level</option>
                        <option value="sedentary">Sedentary</option>
                        <option value="moderate">Moderate</option>
                        <option value="active">Active</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-800">Sensitivity Level</label>
                      <select
                        name="sensitivity_level"
                        value={formData.sensitivity_level}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="">Pilih sensitivity level</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-800">
                        Health Conditions (opsional, disimpan terenkripsi)
                      </label>
                      <textarea
                        name="health_conditions"
                        value={formData.health_conditions}
                        onChange={handleChange}
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                        placeholder="Contoh: Asma, Alergi"
                      />
                      <p className="text-xs text-gray-500">Data ini tidak ditampilkan ulang.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <input
                      type="checkbox"
                      name="privacy_consent"
                      checked={formData.privacy_consent}
                      onChange={handleChange}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Saya setuju data saya digunakan untuk personalisasi rekomendasi
                      </p>
                      <p className="text-xs text-gray-600">Anda dapat mengubah persetujuan kapan saja.</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving || isLoading}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Save size={18} className={isSaving ? 'animate-spin' : ''} />
                      <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                    </button>
                  </div>
                </fieldset>
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={isSaving || isLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Save size={18} className={isSaving ? 'animate-spin' : ''} />
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </form>

              {/* Alert Settings Section */}
              <div className="mt-6">
                <AlertSettings language={formData.language || 'id'} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}



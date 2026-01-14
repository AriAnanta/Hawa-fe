import { useState, useEffect } from 'react';
import { Bell, Save, Loader2 } from 'lucide-react';
import { authService } from '../services/auth';

export default function AlertSettings({ language = 'id' }) {
  const [settings, setSettings] = useState({
    alert_enabled: true,
    alert_pm25_threshold: 75,
    alert_pm10_threshold: 100,
    alert_methods: ['whatsapp'],
    alert_frequency: 'realtime'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const token = authService.getToken();
  
  useEffect(() => {
    // Load current settings from user profile
    const user = authService.getCurrentUser();
    if (user) {
      setSettings({
        alert_enabled: user.alert_enabled !== false,
        alert_pm25_threshold: user.alert_pm25_threshold || 75,
        alert_pm10_threshold: user.alert_pm10_threshold || 100,
        alert_methods: user.alert_methods ? JSON.parse(user.alert_methods) : ['whatsapp'],
        alert_frequency: user.alert_frequency || 'realtime'
      });
    }
  }, []);
  
  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    setError('');
    
    try {
      const res = await fetch(`${apiUrl}/auth/profile/alert-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to save alert settings');
      }
      
      setSuccess(true);
      // Update local storage
      const user = authService.getCurrentUser();
      if (user) {
        user.alert_enabled = settings.alert_enabled;
        user.alert_pm25_threshold = settings.alert_pm25_threshold;
        user.alert_pm10_threshold = settings.alert_pm10_threshold;
        user.alert_methods = JSON.stringify(settings.alert_methods);
        user.alert_frequency = settings.alert_frequency;
        localStorage.setItem('hawa_user', JSON.stringify(user));
      }
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Error saving alert settings');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };
  
  const uiText = {
    id: {
      title: 'Pengaturan Alert',
      enable: 'Aktifkan Alert',
      pm25Threshold: 'Threshold PM2.5 (μg/m³)',
      pm10Threshold: 'Threshold PM10 (μg/m³)',
      methods: 'Metode Notifikasi',
      frequency: 'Frekuensi Alert',
      save: 'Simpan',
      saved: 'Pengaturan tersimpan!',
      realtime: 'Real-time',
      hourly: 'Setiap Jam',
      daily: 'Harian',
      description: 'Alert akan dikirim jika nilai melebihi threshold yang ditentukan'
    },
    en: {
      title: 'Alert Settings',
      enable: 'Enable Alerts',
      pm25Threshold: 'PM2.5 Threshold (μg/m³)',
      pm10Threshold: 'PM10 Threshold (μg/m³)',
      methods: 'Notification Methods',
      frequency: 'Alert Frequency',
      save: 'Save',
      saved: 'Settings saved!',
      realtime: 'Real-time',
      hourly: 'Hourly',
      daily: 'Daily',
      description: 'Alerts will be sent when values exceed the specified threshold'
    },
    su: {
      title: 'Setélan Alert',
      enable: 'Aktipkeun Alert',
      pm25Threshold: 'Threshold PM2.5 (μg/m³)',
      pm10Threshold: 'Threshold PM10 (μg/m³)',
      methods: 'Metode Notifikasi',
      frequency: 'Frékuépsi Alert',
      save: 'Simpen',
      saved: 'Setélan disimpen!',
      realtime: 'Real-time',
      hourly: 'Unggal Jam',
      daily: 'Harian',
      description: 'Alert bakal dikirim lamun nilai ngaleuwihan threshold nu ditangtukeun'
    }
  };
  
  const t = uiText[language] || uiText.id;
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center mb-4">
        <Bell className="mr-2 text-blue-600" size={20} />
        <h3 className="text-lg font-bold text-gray-900">{t.title}</h3>
      </div>
      
      <div className="space-y-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.alert_enabled}
            onChange={(e) => setSettings({...settings, alert_enabled: e.target.checked})}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">{t.enable}</span>
        </label>
        
        {settings.alert_enabled && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.pm25Threshold}
              </label>
              <input
                type="number"
                value={settings.alert_pm25_threshold}
                onChange={(e) => setSettings({...settings, alert_pm25_threshold: parseFloat(e.target.value) || 0})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="1"
              />
              <p className="text-xs text-gray-500 mt-1">{t.description}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.pm10Threshold}
              </label>
              <input
                type="number"
                value={settings.alert_pm10_threshold}
                onChange={(e) => setSettings({...settings, alert_pm10_threshold: parseFloat(e.target.value) || 0})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="1"
              />
              <p className="text-xs text-gray-500 mt-1">{t.description}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.frequency}
              </label>
              <select
                value={settings.alert_frequency}
                onChange={(e) => setSettings({...settings, alert_frequency: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="realtime">{t.realtime}</option>
                <option value="hourly">{t.hourly}</option>
                <option value="daily">{t.daily}</option>
              </select>
            </div>
          </>
        )}
        
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              {t.save}
            </>
          )}
        </button>
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
            {t.saved}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}








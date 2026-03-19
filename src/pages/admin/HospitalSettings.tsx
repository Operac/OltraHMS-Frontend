import { useState, useEffect } from 'react';
import { Save, Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { SettingsService, CURRENCIES } from '../../services/settings.service';
import type { HospitalSettings } from '../../services/settings.service';

const HospitalSettingsPage = () => {
  const [settings, setSettings] = useState<Partial<HospitalSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await SettingsService.getHospitalSettings();
      setSettings(data);
    } catch (error) {
      console.error("Failed to load hospital settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await SettingsService.updateHospitalSettings(settings);
      toast.success("Hospital settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Settings</h1>
          <p className="text-gray-500 mt-1">Configure currency and operating hours</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Currency Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-sky-500" />
          <h2 className="text-lg font-semibold text-gray-900">Currency Settings</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency Code</label>
            <select
              value={settings.currencyCode || 'NGN'}
              onChange={(e) => {
                const currency = CURRENCIES.find(c => c.code === e.target.value);
                updateField('currencyCode', e.target.value);
                updateField('currencySymbol', currency?.symbol || e.target.value);
              }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
            <input
              type="text"
              value={settings.currencySymbol || '₦'}
              onChange={(e) => updateField('currencySymbol', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Appointment Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-sky-500" />
          <h2 className="text-lg font-semibold text-gray-900">Appointment Settings</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot Duration (minutes)</label>
            <select
              value={settings.timeSlotDuration || 30}
              onChange={(e) => updateField('timeSlotDuration', parseInt(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Duration of each appointment slot</p>
          </div>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-sky-500" />
          <h2 className="text-lg font-semibold text-gray-900">Operating Hours</h2>
        </div>

        <div className="space-y-4">
          {days.map(day => {
            const isOpenKey = `${day.key}IsOpen` as keyof HospitalSettings;
            const openKey = `${day.key}Open` as keyof HospitalSettings;
            const closeKey = `${day.key}Close` as keyof HospitalSettings;
            
            return (
              <div key={day.key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-32">
                  <span className="font-medium text-gray-900">{day.label}</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => updateField(isOpenKey, !settings[isOpenKey as keyof HospitalSettings])}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                    settings[isOpenKey as keyof HospitalSettings]
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {settings[isOpenKey as keyof HospitalSettings] ? (
                    <><CheckCircle className="w-4 h-4" /> Open</>
                  ) : (
                    <><XCircle className="w-4 h-4" /> Closed</>
                  )}
                </button>

                {settings[isOpenKey as keyof HospitalSettings] && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={settings[openKey as keyof HospitalSettings] as string || '08:00'}
                      onChange={(e) => updateField(openKey, e.target.value)}
                      className="px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={settings[closeKey as keyof HospitalSettings] as string || '17:00'}
                      onChange={(e) => updateField(closeKey, e.target.value)}
                      className="px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Telemedicine Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-sky-500" />
          <h2 className="text-lg font-semibold text-gray-900">Telemedicine Hours</h2>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.telemedicineEnabled || false}
              onChange={(e) => updateField('telemedicineEnabled', e.target.checked)}
              className="w-4 h-4 text-sky-500 rounded"
            />
            <span className="font-medium text-gray-700">Enable Telemedicine</span>
          </label>
        </div>

        {settings.telemedicineEnabled && (
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={settings.telemedicineStart || '00:00'}
                onChange={(e) => updateField('telemedicineStart', e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
              />
            </div>
            <span className="text-gray-500 mt-6">to</span>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={settings.telemedicineEnd || '23:59'}
                onChange={(e) => updateField('telemedicineEnd', e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-400 outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalSettingsPage;

import React, { useState, useEffect } from 'react';
import { Settings, Save, Building, Shield, IndianRupee, Clock, BookOpen, Mail, Phone, MapPin } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getSettings, updateSettings } from '../../services/settingService';
import { useToast } from '../../context/ToastContext';

const SettingsPage = () => {
  const [formData, setFormData] = useState({
    collegeName: '',
    libraryName: '',
    finePerDay: 5,
    loanPeriodDays: 14,
    maxBooksPerStudent: 4,
    currencySymbol: '₹',
    contactEmail: '',
    contactPhone: '',
    address: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const fetchCurrentSettings = async () => {
      try {
        setLoading(true);
        const res = await getSettings();
        if (res.success && res.settings) {
          setFormData({
            collegeName: res.settings.collegeName || '',
            libraryName: res.settings.libraryName || '',
            finePerDay: res.settings.finePerDay || 5,
            loanPeriodDays: res.settings.loanPeriodDays || 14,
            maxBooksPerStudent: res.settings.maxBooksPerStudent || 4,
            currencySymbol: res.settings.currencySymbol || '₹',
            contactEmail: res.settings.contactEmail || '',
            contactPhone: res.settings.contactPhone || '',
            address: res.settings.address || '',
          });
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load system settings');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentSettings();
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateSettings({
        ...formData,
        finePerDay: Number(formData.finePerDay),
        loanPeriodDays: Number(formData.loanPeriodDays),
        maxBooksPerStudent: Number(formData.maxBooksPerStudent),
      });

      if (res.success) {
        toast.success('Library system configuration updated successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading library system preferences..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
          Library Circulation Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Configure university fine rates, standard loan periods, student borrowing quotas, and contact metadata.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Circulation Policies Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Clock className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Circulation & Penalty Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Core loan durations and automatic penalty calculations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Fine Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fine Rate (Per Day Past Due) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  name="finePerDay"
                  value={formData.finePerDay}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Default is ₹5/day</p>
            </div>

            {/* Standard Loan Period */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Standard Loan Duration (Days) *
              </label>
              <input
                type="number"
                name="loanPeriodDays"
                value={formData.loanPeriodDays}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">Default is 14 days</p>
            </div>

            {/* Max Books */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Max Books Per Student *
              </label>
              <input
                type="number"
                name="maxBooksPerStudent"
                value={formData.maxBooksPerStudent}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">Default is 4 volumes</p>
            </div>
          </div>
        </div>

        {/* Institution Details Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Institutional & Campus Identity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Printed on formal circulation receipts and audit PDFs
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                University / College Name
              </label>
              <input
                type="text"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Library Department Name
              </label>
              <input
                type="text"
                name="libraryName"
                value={formData.libraryName}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Helpdesk Phone
              </label>
              <input
                type="text"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Campus Location Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
          >
            {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;

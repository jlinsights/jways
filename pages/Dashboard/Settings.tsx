import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Moon, Sun } from 'lucide-react';
import type { UserProfile, NotificationSetting } from '../../types';
import { getUserProfile, updateUserProfile, getNotificationSettings, updateNotificationSetting } from '../../lib/api';

const Settings: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [p, n] = await Promise.all([getUserProfile(), getNotificationSettings()]);
      setProfile(p);
      setNotifications(n);
      setLoading(false);
    };
    load();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleProfileSave = async () => {
    if (!profile) return;
    setSaving(true);
    await updateUserProfile(profile);
    setSaving(false);
    showToast('프로필이 저장되었습니다.');
  };

  const handleToggle = async (id: string, field: 'emailEnabled' | 'smsEnabled', value: boolean) => {
    await updateNotificationSetting(id, { [field]: value });
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, [field]: value } : n)
    );
  };

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-jways-blue/30 border-t-jways-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">환경 설정</h2>

      {/* Profile Section */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">프로필 정보</h3>
        {profile && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="settings-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">이름</label>
              <input
                id="settings-name"
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-jways-blue/30 focus:border-jways-blue transition-colors"
              />
            </div>
            <div>
              <label htmlFor="settings-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">이메일</label>
              <input
                id="settings-email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-jways-blue/30 focus:border-jways-blue transition-colors"
              />
            </div>
            <div>
              <label htmlFor="settings-company" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">회사명</label>
              <input
                id="settings-company"
                type="text"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-jways-blue/30 focus:border-jways-blue transition-colors"
              />
            </div>
            <div>
              <label htmlFor="settings-phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">연락처</label>
              <input
                id="settings-phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-jways-blue/30 focus:border-jways-blue transition-colors"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                onClick={handleProfileSave}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-jways-blue hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl px-6 py-2.5 text-sm font-bold transition-colors min-h-[44px]"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} aria-hidden="true" />
                )}
                저장
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Notification Section */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">알림 설정</h3>
        <div className="space-y-4">
          {notifications.map(n => (
            <div key={n.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{n.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{n.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-slate-500">이메일</span>
                  <button
                    role="switch"
                    aria-checked={n.emailEnabled}
                    aria-label={`${n.label} 이메일 알림`}
                    onClick={() => handleToggle(n.id, 'emailEnabled', !n.emailEnabled)}
                    className={`relative w-10 h-6 rounded-full transition-colors ${
                      n.emailEnabled ? 'bg-jways-blue' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      n.emailEnabled ? 'translate-x-4' : ''
                    }`} />
                  </button>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-slate-500">SMS</span>
                  <button
                    role="switch"
                    aria-checked={n.smsEnabled}
                    aria-label={`${n.label} SMS 알림`}
                    onClick={() => handleToggle(n.id, 'smsEnabled', !n.smsEnabled)}
                    className={`relative w-10 h-6 rounded-full transition-colors ${
                      n.smsEnabled ? 'bg-jways-blue' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      n.smsEnabled ? 'translate-x-4' : ''
                    }`} />
                  </button>
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Theme Section */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">테마 설정</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-amber-500" />}
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">다크 모드</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">어두운 배경으로 전환합니다</p>
            </div>
          </div>
          <button
            role="switch"
            aria-checked={isDark}
            aria-label="다크 모드 전환"
            onClick={toggleDarkMode}
            className={`relative w-10 h-6 rounded-full transition-colors ${
              isDark ? 'bg-jways-blue' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              isDark ? 'translate-x-4' : ''
            }`} />
          </button>
        </div>
      </section>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl px-4 py-3 shadow-lg text-sm font-medium z-50"
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;

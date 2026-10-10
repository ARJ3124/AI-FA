import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { User, Mail, Sun, Moon, Bell, Save, CheckCircle, LogOut } from 'lucide-react';

interface ProfilePageProps {
  profile: UserProfile;
  netBalance: number;
  onUpdateProfile: (updated: UserProfile) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  netBalance,
  onUpdateProfile,
  theme,
  onToggleTheme,
  onLogout,
}) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile.notificationsEnabled);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name,
      email,
      notificationsEnabled,
      theme,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          User Profile &amp; Settings
        </h1>
        <p className="text-sm text-slate-400">
          Manage your account details, appearance, and notification preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-emerald-300 text-sm font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          <span>Profile preferences updated successfully!</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Avatar + Name row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-800">
          <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 flex items-center justify-center text-white font-extrabold text-3xl shadow-xl shadow-indigo-500/20 shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-bold text-white">{name}</h2>
            <p className="text-sm text-slate-400 flex items-center justify-center sm:justify-start space-x-1">
              <Mail className="h-3.5 w-3.5" />
              <span>{email}</span>
            </p>
          </div>
        </div>

        {/* Net Balance stat — single card */}
        <div className="pt-6">
          <div className="inline-flex flex-col items-center bg-slate-950/60 border border-slate-800 rounded-2xl px-8 py-4">
            <span className="text-xs text-slate-400 font-medium">Net Account Balance</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-1">
              ₹{netBalance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <User className="h-5 w-5 text-indigo-400" />
          <span>Personal Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors"
            />
          </div>
        </div>

        {/* Display & Preferences */}
        <div className="pt-6 border-t border-slate-800 space-y-5">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Sun className="h-5 w-5 text-amber-400" />
            <span>Preferences &amp; Appearance</span>
          </h3>

          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <span className="text-sm font-bold text-white block">Appearance Mode</span>
              <span className="text-xs text-slate-400">Switch between dark mode and light theme</span>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span>Switch to Light Theme</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-indigo-400" />
                  <span>Switch to Dark Theme</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <span className="text-sm font-bold text-white block">In-App Notifications</span>
              <span className="text-xs text-slate-400">Receive budget alerts, savings tips, and milestone alerts</span>
            </div>
            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
                notificationsEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Bell className="h-4 w-4" />
              <span>{notificationsEnabled ? 'Enabled' : 'Disabled'}</span>
            </button>
          </div>
        </div>

        {/* Submit + Logout */}
        <div className="pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-bold text-sm transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Save Profile Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

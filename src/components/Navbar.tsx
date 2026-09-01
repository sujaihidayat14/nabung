import React, { useEffect, useState } from 'react';
import {
  Landmark,
  Wifi,
  WifiOff,
  FileSpreadsheet,
  Lock,
  LogOut,
  User,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { AuthState, GoogleSheetsConfig, SchoolProfile } from '../types';
import { StorageService } from '../services/storage';

interface NavbarProps {
  auth: AuthState;
  onLogout: () => void;
  onOpenAuth: () => void;
  onOpenChangePassword: () => void;
  onOpenWASettings: () => void;
  onOpenSheetsSync: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  school: SchoolProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  auth,
  onLogout,
  onOpenAuth,
  onOpenChangePassword,
  onOpenWASettings,
  onOpenSheetsSync,
  activeTab,
  setActiveTab,
  school,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(StorageService.getSheetsConfig());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleSheetsUpdate = (e: CustomEvent<GoogleSheetsConfig>) => {
      setSheetsConfig(e.detail);
    };
    window.addEventListener('sdn5_sheets_updated' as unknown as keyof WindowEventMap, handleSheetsUpdate as EventListener);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sdn5_sheets_updated' as unknown as keyof WindowEventMap, handleSheetsUpdate as EventListener);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner / School Bar */}
      <div className="bg-emerald-800 text-emerald-50 px-4 py-1 text-xs flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2 font-medium tracking-wide">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Sistem Informasi Kas & Tabungan Siswa Digital — {school.district}, {school.regency}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          {/* Offline / Online Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium ${
              isOnline ? 'bg-emerald-700/80 text-emerald-200' : 'bg-amber-600 text-amber-100 animate-bounce'
            }`}
            title={isOnline ? 'Terhubung ke Jaringan Internet' : 'Mode Offline Aktif: Data tersimpan aman di perangkat lokal'}
          >
            {isOnline ? <Wifi className="w-3 h-3 text-emerald-300" /> : <WifiOff className="w-3 h-3 text-amber-200" />}
            <span>{isOnline ? 'Online Ready' : 'Mode Offline'}</span>
          </div>

          {/* Sheets Status Indicator */}
          {sheetsConfig.spreadsheetUrl ? (
            <a
              href={sheetsConfig.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-emerald-200 transition-colors bg-emerald-900/60 px-2 py-0.5 rounded"
            >
              <FileSpreadsheet className="w-3 h-3 text-emerald-300" />
              <span>Google Sheets Terhubung</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-75" />
            </a>
          ) : (
            <button
              onClick={onOpenSheetsSync}
              className="flex items-center gap-1 text-emerald-200 hover:text-white transition-colors underline"
            >
              <FileSpreadsheet className="w-3 h-3" />
              <span>Hubungkan Sheets</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-base sm:text-lg leading-tight tracking-tight">
                  {school.name}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                  TABUNGAN SISWA
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Transparan & Real-time Notifikasi WhatsApp Wali Murid
              </p>
            </div>
          </div>

          {/* Nav Tabs for Admin */}
          {auth.isAuthenticated && auth.role === 'admin' && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                Ringkasan Kas
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'students'
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                Data Siswa (Kelas 1-6)
              </button>
              <button
                onClick={() => setActiveTab('daily-report')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'daily-report'
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                Laporan Harian
              </button>
              <button
                onClick={() => setActiveTab('monthly-report')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'monthly-report'
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                Rekap Bulanan
              </button>
              <button
                onClick={onOpenSheetsSync}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 flex items-center gap-1.5 transition-all"
                title="Integrasi Google Sheets"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Sheets</span>
              </button>
            </nav>
          )}

          {/* Right Action Menu */}
          <div className="flex items-center gap-2">
            {auth.isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Admin Utilities */}
                {auth.role === 'admin' && (
                  <button
                    onClick={onOpenWASettings}
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                    title="Pengaturan Format Pesan WhatsApp"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Format WA</span>
                  </button>
                )}

                {/* Profile Badge */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {auth.role === 'admin' ? 'Bendahara Sekolah' : auth.student?.name || 'Wali Murid'}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                      {auth.role === 'admin' ? (
                        <>
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Akses Admin</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 text-blue-600" />
                          <span>{auth.student?.className} • NISN: {auth.student?.nisn}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Change Password Button */}
                  <button
                    onClick={onOpenChangePassword}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    title="Ganti Password Akun"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Keluar</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 text-white hover:bg-emerald-800 shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02]"
                >
                  <Lock className="w-4 h-4" />
                  <span>Masuk Akun</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        {auth.isAuthenticated && auth.role === 'admin' && (
          <div className="md:hidden flex items-center justify-between gap-1 py-2 border-t border-slate-100 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
                activeTab === 'dashboard' ? 'bg-emerald-700 text-white' : 'text-slate-600 bg-slate-100'
              }`}
            >
              Kas
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
                activeTab === 'students' ? 'bg-emerald-700 text-white' : 'text-slate-600 bg-slate-100'
              }`}
            >
              Siswa
            </button>
            <button
              onClick={() => setActiveTab('daily-report')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
                activeTab === 'daily-report' ? 'bg-emerald-700 text-white' : 'text-slate-600 bg-slate-100'
              }`}
            >
              Harian
            </button>
            <button
              onClick={() => setActiveTab('monthly-report')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
                activeTab === 'monthly-report' ? 'bg-emerald-700 text-white' : 'text-slate-600 bg-slate-100'
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={onOpenSheetsSync}
              className="px-3 py-1.5 rounded-lg font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 whitespace-nowrap"
            >
              Sheets
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

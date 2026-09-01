import React, { useState } from 'react';
import {
  Lock,
  User,
  ShieldCheck,
  Users,
  KeyRound,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  School,
} from 'lucide-react';
import { AuthState, Student } from '../types';
import { StorageService } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (auth: AuthState) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'parent'>('admin');

  // Admin form
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Parent form
  const [parentIdentifier, setParentIdentifier] = useState('');
  const [parentPassword, setParentPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const savedPassword = StorageService.getAdminPassword();
    if (adminUsername.trim().toLowerCase() === 'admin' && adminPassword === savedPassword) {
      setSuccessMsg('Login Admin Berhasil! Mengalihkan...');
      setTimeout(() => {
        onLoginSuccess({
          isAuthenticated: true,
          role: 'admin',
          adminUsername: 'Bendahara Sekolah SDN 5 Jurit Baru',
          name: 'Bendahara Sekolah',
        });
        onClose();
      }, 400);
    } else {
      setErrorMsg('Username atau Password Admin salah. (Default: admin / admin123)');
    }
  };

  const handleParentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!parentIdentifier.trim()) {
      setErrorMsg('Silakan masukkan Nama Siswa atau NISN / NIDN anak');
      return;
    }

    const student = StorageService.findStudentByLogin(parentIdentifier);
    if (!student) {
      setErrorMsg('Data siswa dengan nama/NISN tersebut tidak ditemukan. Periksa kembali ejaan atau NISN.');
      return;
    }

    const expectedPassword = student.password || '123456';
    if (parentPassword !== expectedPassword) {
      setErrorMsg(`Password salah untuk ananda ${student.name}. (Password default awal: 123456)`);
      return;
    }

    setSuccessMsg(`Selamat datang, Wali Murid dari ananda ${student.name}!`);
    setTimeout(() => {
      onLoginSuccess({
        isAuthenticated: true,
        role: 'parent',
        studentId: student.id,
        student: student,
        name: student.parentName,
      });
      onClose();
    }, 400);
  };

  const handleQuickDemoParent = (std: Student) => {
    setParentIdentifier(std.nisn);
    setParentPassword(std.password || '123456');
    setErrorMsg('');
  };

  const demoStudents = StorageService.getStudents().slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 px-6 py-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-emerald-100 border border-white/20">
              <School className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Portal Masuk Kas Tabungan</h2>
              <p className="text-xs text-emerald-200">SDN 5 JURIT BARU • Lombok Timur</p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="mt-4 grid grid-cols-2 bg-emerald-950/40 p-1 rounded-xl border border-emerald-700/50">
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setErrorMsg('');
              }}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Login Admin / Guru</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('parent');
                setErrorMsg('');
              }}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'parent'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-700" />
              <span>Login Orang Tua / Wali</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'admin' ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username Admin</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    required
                    placeholder="admin"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password Admin</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    placeholder="admin123"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Password default: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-emerald-700">admin123</code>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Masuk Sebagai Admin Sekolah</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleParentLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Siswa / NISN / No. Induk
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={parentIdentifier}
                    onChange={(e) => setParentIdentifier(e.target.value)}
                    required
                    placeholder="Contoh: Ahmad Faiz atau 0123456781"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password Wali Murid
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={parentPassword}
                    onChange={(e) => setParentPassword(e.target.value)}
                    required
                    placeholder="Password awal default: 123456"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Password awal: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-emerald-700">123456</code></span>
                  <span className="text-emerald-700">Dapat diubah setelah login</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Lihat Tabungan Siswa</span>
              </button>

              {/* Demo Quick Login Helper */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pilih Contoh Akun Siswa (Demo Langsung):</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {demoStudents.map((std) => (
                    <button
                      key={std.id}
                      type="button"
                      onClick={() => handleQuickDemoParent(std)}
                      className="text-left p-1.5 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-[11px] transition-colors"
                    >
                      <div className="font-semibold text-slate-800 truncate">{std.name}</div>
                      <div className="text-[10px] text-slate-500">{std.className} • NISN: {std.nisn.slice(-4)}</div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

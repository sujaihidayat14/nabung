import React from 'react';
import {
  Wallet,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  PlusCircle,
  FileSpreadsheet,
  Printer,
  Calendar,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Receipt,
  GraduationCap,
  Sparkles,
  Search,
} from 'lucide-react';
import { Student, Transaction, SchoolProfile, GoogleSheetsConfig } from '../types';
import { formatRupiah, formatIndonesianDate, openWhatsAppDirect, generateTransactionWAMessage } from '../services/whatsapp';
import { StorageService } from '../services/storage';

interface AdminDashboardProps {
  students: Student[];
  transactions: Transaction[];
  school: SchoolProfile;
  onOpenNewTransaction: (studentId?: string, type?: 'deposit' | 'withdraw') => void;
  onOpenAddStudent: () => void;
  onOpenDailyReport: () => void;
  onOpenMonthlyReport: () => void;
  onOpenSheetsSync: () => void;
  onViewStudentManager: () => void;
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  transactions,
  school,
  onOpenNewTransaction,
  onOpenAddStudent,
  onOpenDailyReport,
  onOpenMonthlyReport,
  onOpenSheetsSync,
  onViewStudentManager,
  onRefresh,
}) => {
  const totalBalance = students.reduce((acc, s) => acc + s.balance, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter((t) => t.date.startsWith(todayStr));

  const todayDeposit = todayTransactions
    .filter((t) => t.type === 'deposit')
    .reduce((acc, c) => acc + c.amount, 0);

  const todayWithdraw = todayTransactions
    .filter((t) => t.type === 'withdraw')
    .reduce((acc, c) => acc + c.amount, 0);

  const recentTransactions = transactions.slice(0, 6);

  // Group balances by class
  const classBalances = [1, 2, 3, 4, 5, 6].map((clsNum) => {
    const clsId = String(clsNum);
    const clsStudents = students.filter((s) => s.classId === clsId);
    const sum = clsStudents.reduce((acc, c) => acc + c.balance, 0);
    return {
      classNum: clsNum,
      className: `Kelas ${clsNum}`,
      count: clsStudents.length,
      balance: sum,
    };
  });

  const waConfig = StorageService.getWAConfig();

  const handleResendWA = (tx: Transaction) => {
    const student = students.find((s) => s.id === tx.studentId);
    if (!student || !student.parentPhone) {
      alert('Nomor WhatsApp orang tua belum diisi.');
      return;
    }
    const msg = generateTransactionWAMessage(tx, student, waConfig, school);
    openWhatsAppDirect(student.parentPhone, msg);
    StorageService.updateTransactionStatus(tx.id, 'sent');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              Bendahara Sekolah
            </span>
            <span className="text-xs text-emerald-200">SDN 5 JURIT BARU • Tahun Pelajaran 2026/2027</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
            Dashboard Tabungan Siswa Digital
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
            Pencatatan kas tabungan offline & online, notifikasi WhatsApp real-time ke orang tua wali murid, dan terintegrasi Google Sheets.
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onOpenNewTransaction()}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
          >
            <PlusCircle className="w-4 h-4 text-emerald-950" />
            <span>+ Setor / Tarik Cepat</span>
          </button>

          <button
            onClick={onOpenDailyReport}
            className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold rounded-xl text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-300" />
            <span>Laporan Harian</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo Keseluruhan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Kas Tabungan Siswa</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight text-emerald-900">
              {formatRupiah(totalBalance)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Total dana tersimpan di {school.name}</span>
            </div>
          </div>
        </div>

        {/* Total Siswa */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Siswa Penabung</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {students.length} Siswa
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Kelas 1 sampai Kelas 6 aktif
            </div>
          </div>
        </div>

        {/* Setoran Hari Ini */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Setoran Hari Ini</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              + {formatRupiah(todayDeposit)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {todayTransactions.filter((t) => t.type === 'deposit').length} transaksi masuk
            </div>
          </div>
        </div>

        {/* Penarikan Hari Ini */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Penarikan Hari Ini</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-700 tracking-tight">
              - {formatRupiah(todayWithdraw)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {todayTransactions.filter((t) => t.type === 'withdraw').length} transaksi keluar
            </div>
          </div>
        </div>
      </div>

      {/* Class Balance Distribution & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Mutasi Transaksi Terbaru</h3>
              <p className="text-xs text-slate-500">Pembaruan transaksi setoran & penarikan terkini</p>
            </div>
            <button
              onClick={onOpenDailyReport}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
            >
              Lihat Semua Laporan →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Jenis</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4 text-right">Saldo Akhir</th>
                  <th className="py-3 px-4 text-center">Status WA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Belum ada mutasi transaksi.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-500 font-mono text-[11px]">
                        {formatIndonesianDate(tx.date, false)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{tx.studentName}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{tx.className}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tx.type === 'deposit'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.type === 'deposit' ? 'SETOR' : 'TARIK'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold">
                        <span className={tx.type === 'deposit' ? 'text-emerald-700' : 'text-rose-700'}>
                          {tx.type === 'deposit' ? '+' : '-'} {formatRupiah(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900 text-emerald-900">
                        {formatRupiah(tx.currentBalance)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleResendWA(tx)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.waNotificationStatus === 'sent'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                          title="Klik untuk kirim WhatsApp ke wali"
                        >
                          <Smartphone className="w-3 h-3" />
                          <span>{tx.waNotificationStatus === 'sent' ? 'WA Terkirim' : 'Kirim WA'}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Class Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Saldo Kas Per Kelas</h3>
              <button
                onClick={onViewStudentManager}
                className="text-xs font-bold text-emerald-800 hover:underline"
              >
                Kelola Siswa →
              </button>
            </div>

            <div className="space-y-3.5">
              {classBalances.map((cls) => {
                const pct = totalBalance > 0 ? Math.round((cls.balance / totalBalance) * 100) : 0;
                return (
                  <div key={cls.classNum} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">{cls.className} ({cls.count} siswa)</span>
                      <span className="font-bold text-emerald-800">{formatRupiah(cls.balance)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={onOpenMonthlyReport}
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Buka Rekapitulasi Bulanan Siswa</span>
            </button>
            <button
              onClick={onOpenSheetsSync}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Status Sinkron Google Sheets</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

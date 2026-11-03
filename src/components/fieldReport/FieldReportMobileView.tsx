// OOS ETMS PRO — Field Daily Report Mobile View (Module A)
// Mobile-first Interface for Field Employees matching official screenshot

import React, { useState } from 'react';
import {
  FieldDailyReport,
  FieldDailyIssue,
  FieldDailyActivity,
  FieldTomorrowPlanItem,
  FieldIssueCategory,
} from '../../types/fieldReport';
import { UserProfile } from '../../types/workforce';
import {
  Smartphone,
  Bell,
  Calendar,
  User,
  Cpu,
  ShieldAlert,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
  Home,
  FileText,
  History,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface FieldReportMobileViewProps {
  currentUser: UserProfile;
  reports: FieldDailyReport[];
  issues: FieldDailyIssue[];
  activities: FieldDailyActivity[];
  plans: FieldTomorrowPlanItem[];
  onOpenCreateWizard: () => void;
  onSelectIssue: (issue: FieldDailyIssue) => void;
  onToggleActivity: (actId: string) => void;
}

export const FieldReportMobileView: React.FC<FieldReportMobileViewProps> = ({
  currentUser,
  reports,
  issues,
  activities,
  plans,
  onOpenCreateWizard,
  onSelectIssue,
  onToggleActivity,
}) => {
  // Mobile bottom tab: 'home' | 'reports' | 'history' | 'profile'
  const [mobileNav, setMobileNav] = useState<'home' | 'reports' | 'history' | 'profile'>('home');
  const [selectedCategoryModal, setSelectedCategoryModal] = useState<FieldIssueCategory | null>(null);

  // Issues by category
  const eqmIssues = issues.filter((i) => i.category === 'EQM');
  const qcIssues = issues.filter((i) => i.category === 'QC');
  const hrIssues = issues.filter((i) => i.category === 'HR');
  const prodIssues = issues.filter((i) => i.category === 'PRODUCTION');

  const todayReport = reports.find((r) => r.reportDate === '2026-11-03') || reports[0];

  return (
    <div className="max-w-md mx-auto bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-700 text-slate-800">
      {/* Phone Screen Container */}
      <div className="bg-[#F2F6FA] rounded-[30px] overflow-hidden flex flex-col min-h-[680px] max-h-[84vh] relative">
        
        {/* ======================================================== */}
        {/* 1. MOBILE PHONE STATUS BAR                               */}
        {/* ======================================================== */}
        <div className="bg-[#082D55] text-white px-5 pt-3 pb-2 flex items-center justify-between text-[11px] font-mono shrink-0">
          <span className="font-bold">9:41</span>
          <div className="flex items-center gap-2">
            <span>5G</span>
            <span>98% 🔋</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. APP HEADER                                            */}
        {/* ======================================================== */}
        <div className="bg-[#082D55] text-white px-4 py-2.5 flex items-center justify-between border-b border-blue-900/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
              OOS
            </div>
            <div>
              <div className="font-extrabold text-xs tracking-tight leading-none text-white">
                OOS
              </div>
              <div className="text-[10px] text-cyan-300 font-mono">Field Daily Report</div>
            </div>
          </div>

          <div className="relative p-1.5 rounded-full hover:bg-blue-900/60 cursor-pointer">
            <Bell className="w-4 h-4 text-slate-200" />
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              2
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. SCROLLABLE SCREEN CONTENT                             */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          
          {/* TAB 1: HOME SCREEN (Matches Phone 1 in screenshot) */}
          {mobileNav === 'home' && (
            <>
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-[#082D55] to-[#0878E8] text-white p-3.5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    Báo cáo hiện trường
                  </div>
                  <h3 className="font-black text-sm text-white mt-0.5">
                    HÀNG NGÀY
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-white/20 text-white font-mono px-2 py-0.5 rounded-full">
                    Ca ngày
                  </span>
                </div>
              </div>

              {/* User info card */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-[#082D55] font-black text-xs flex items-center justify-center border border-blue-200">
                    NV
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-navy-950">
                      {currentUser.name || 'Nguyễn Văn A'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      SEV Factory • {currentUser.vendor || 'KHV'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-slate-700">03/11/2026</div>
                  <div className="text-[10px] text-emerald-600 font-bold">Hôm nay</div>
                </div>
              </div>

              {/* 4 Category Cards in 2x2 Grid (Matches Phone 1) */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Card 1: EQM - Thiết bị */}
                <div
                  onClick={() => setSelectedCategoryModal('EQM')}
                  className="bg-white p-3 rounded-2xl border border-blue-200 shadow-2xs hover:border-blue-400 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {eqmIssues.length}
                    </span>
                  </div>
                  <div>
                    <div className="font-black text-xs text-blue-950">EQM Thiết bị</div>
                    <div className="font-mono font-black text-sm text-blue-600">{eqmIssues.length} vấn đề</div>
                    <div className="text-[10px] text-slate-500">1 mới • 2 đang xử lý</div>
                  </div>
                </div>

                {/* Card 2: QC - Chất lượng */}
                <div
                  onClick={() => setSelectedCategoryModal('QC')}
                  className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs hover:border-amber-400 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {qcIssues.length}
                    </span>
                  </div>
                  <div>
                    <div className="font-black text-xs text-amber-950">QC Chất lượng</div>
                    <div className="font-mono font-black text-sm text-amber-600">{qcIssues.length} vấn đề</div>
                    <div className="text-[10px] text-slate-500">Đang theo dõi</div>
                  </div>
                </div>

                {/* Card 3: HR - Nhân lực */}
                <div
                  onClick={() => setSelectedCategoryModal('HR')}
                  className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-2xs hover:border-emerald-400 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                      ✓
                    </span>
                  </div>
                  <div>
                    <div className="font-black text-xs text-emerald-950">HR Nhân lực</div>
                    <div className="font-mono font-black text-sm text-emerald-700">0 vấn đề</div>
                    <div className="text-[10px] text-slate-500">Nhân lực ổn định</div>
                  </div>
                </div>

                {/* Card 4: Production - Sản lượng */}
                <div
                  onClick={() => setSelectedCategoryModal('PRODUCTION')}
                  className="bg-white p-3 rounded-2xl border border-purple-200 shadow-2xs hover:border-purple-400 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {prodIssues.length}
                    </span>
                  </div>
                  <div>
                    <div className="font-black text-xs text-purple-950">Production</div>
                    <div className="font-mono font-black text-sm text-purple-700">{prodIssues.length} vấn đề</div>
                    <div className="text-[10px] text-slate-500">Ảnh hưởng tiến độ</div>
                  </div>
                </div>
              </div>

              {/* Today's Work Card (Matches Phone 1) */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-navy-950">Công việc hôm nay</div>
                      <div className="text-[10px] text-slate-500">Đã cập nhật {activities.length} hoạt động</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-100 text-[11px]">
                  {activities.slice(0, 3).map((act) => (
                    <div key={act.id} className="flex items-center justify-between text-slate-700">
                      <span className="truncate pr-2">✓ {act.content}</span>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold shrink-0">Xong</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tomorrow's Plan Card (Matches Phone 1) */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-navy-950">Kế hoạch ngày mai</div>
                      <div className="text-[10px] text-slate-500">Đã cập nhật {plans.length} mục tiêu</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-100 text-[11px]">
                  {plans.slice(0, 3).map((pln) => (
                    <div key={pln.id} className="text-slate-600 truncate">
                      • {pln.content}
                    </div>
                  ))}
                </div>
              </div>

              {/* Big CTA Button (Matches Phone 1) */}
              <button
                type="button"
                onClick={onOpenCreateWizard}
                className="w-full py-3 bg-[#0878E8] hover:bg-blue-600 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all transform active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tạo Báo Cáo Hôm Nay</span>
              </button>
            </>
          )}

          {/* TAB 2: REPORTS LIST */}
          {mobileNav === 'reports' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs text-navy-950">Báo cáo gần đây ({reports.length})</h4>
                <button
                  type="button"
                  onClick={onOpenCreateWizard}
                  className="px-2.5 py-1 bg-blue-600 text-white text-[11px] font-bold rounded-lg"
                >
                  + Tạo mới
                </button>
              </div>

              {reports.map((r) => (
                <div key={r.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-blue-900">{r.reportDate}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Đã gửi
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800">{r.reportCode}</div>
                  <div className="text-[11px] text-slate-500">
                    {r.factory} • {r.vendor} • {r.issueIds.length} vấn đề
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: HISTORY */}
          {mobileNav === 'history' && (
            <div className="space-y-2.5">
              <h4 className="font-black text-xs text-navy-950">Lịch sử sự cố hiện trường ({issues.length})</h4>
              {issues.map((i) => (
                <div
                  key={i.id}
                  onClick={() => onSelectIssue(i)}
                  className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1 cursor-pointer hover:border-blue-400"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-blue-800">{i.id}</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      {i.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="font-extrabold text-xs text-slate-900">{i.title}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {i.reportedDate} • {i.lineCode}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {mobileNav === 'profile' && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-900 font-black text-base flex items-center justify-center">
                  NV
                </div>
                <div>
                  <div className="font-black text-sm text-navy-950">{currentUser.name || 'Nguyễn Văn A'}</div>
                  <div className="text-xs text-slate-500">{currentUser.title || 'Kỹ thuật viên hiện trường'}</div>
                  <div className="text-[10px] text-blue-700 font-mono mt-0.5">SEV Factory • KHV</div>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Mã nhân viên:</span>
                  <span className="font-mono font-bold">EMP-KHV-001</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Ca trực hiện tại:</span>
                  <span className="font-bold text-emerald-700">Ca ngày (08:00 - 17:00)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Số báo cáo tháng này:</span>
                  <span className="font-mono font-bold text-blue-700">12 báo cáo</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 4. MOBILE BOTTOM NAVIGATION (Matches Phone 1)            */}
        {/* ======================================================== */}
        <div className="bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around text-[10px] font-bold text-slate-500 shrink-0">
          <button
            type="button"
            onClick={() => setMobileNav('home')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              mobileNav === 'home' ? 'text-[#0878E8]' : 'hover:text-slate-900'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Trang chủ</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileNav('reports')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              mobileNav === 'reports' ? 'text-[#0878E8]' : 'hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Báo cáo</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileNav('history')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              mobileNav === 'history' ? 'text-[#0878E8]' : 'hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Lịch sử</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileNav('profile')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              mobileNav === 'profile' ? 'text-[#0878E8]' : 'hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Cá nhân</span>
          </button>
        </div>

        {/* Modal when tapping category card */}
        {selectedCategoryModal && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-end p-2 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-black text-xs text-[#082D55] uppercase">
                  Chi tiết sự cố nhóm {selectedCategoryModal}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryModal(null)}
                  className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {issues
                  .filter((i) => i.category === selectedCategoryModal)
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedCategoryModal(null);
                        onSelectIssue(item);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 cursor-pointer space-y-1 bg-slate-50"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="font-bold text-blue-900">{item.id}</span>
                        <span className="text-[10px] text-amber-700">{item.status.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="font-bold text-slate-800">{item.title}</div>
                      <div className="text-[10px] text-slate-500">{item.lineCode} • {item.reportedDate}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

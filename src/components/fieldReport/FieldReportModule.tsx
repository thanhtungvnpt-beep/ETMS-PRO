// OOS ETMS PRO — Field Daily Report Pro Main Module
// Coordinates Desktop Management Dashboard, Mobile Field Interface, Sub-tabs, and Issue Lifecycle

import React, { useState, useEffect } from 'react';
import {
  FieldDailyReport,
  FieldDailyIssue,
  FieldDailyActivity,
  FieldTomorrowPlanItem,
  FieldReportPhoto,
  FieldReportSubTab,
  FieldIssueCategory,
} from '../../types/fieldReport';
import { UserProfile, VendorName, FactoryName } from '../../types/workforce';
import {
  getStoredDailyReports,
  getStoredFieldIssues,
  getStoredFieldPhotos,
  getStoredFieldActivities,
  getStoredTomorrowPlans,
  saveStoredFieldActivities,
  saveStoredTomorrowPlans,
  resetFieldReportsToBaseline,
} from '../../services/fieldReportStorage';
import { FieldReportDesktopDashboard } from './FieldReportDesktopDashboard';
import { FieldReportMobileView } from './FieldReportMobileView';
import { FieldReportCreateWizardModal } from './FieldReportCreateWizardModal';
import { FieldIssueDetailModal } from './FieldIssueDetailModal';
import { FieldPhotoGalleryModal } from './FieldPhotoGalleryModal';
import {
  Smartphone,
  Monitor,
  RotateCcw,
  Plus,
  FileText,
  Cpu,
  ShieldAlert,
  Users,
  TrendingUp,
  AlertTriangle,
  History,
  BarChart3,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Building2,
  Calendar,
} from 'lucide-react';

interface FieldReportModuleProps {
  currentUser: UserProfile;
}

const VENDOR_PILLS: VendorName[] = [
  'KHV',
  'DREAM TECH',
  'HSTEC',
  'KTECH',
  'HOJEONGB',
  'HOJEONG VINA',
  'DAAL',
];

export const FieldReportModule: React.FC<FieldReportModuleProps> = ({ currentUser }) => {
  // Device View: 'desktop' (Management) or 'mobile' (Field Employee)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<FieldReportSubTab>('dashboard');
  
  // Selected Filters
  const [selectedVendor, setSelectedVendor] = useState<VendorName>('KHV');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-03');
  const [selectedFactory, setSelectedFactory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data states
  const [reports, setReports] = useState<FieldDailyReport[]>(getStoredDailyReports);
  const [issues, setIssues] = useState<FieldDailyIssue[]>(getStoredFieldIssues);
  const [activities, setActivities] = useState<FieldDailyActivity[]>(getStoredFieldActivities);
  const [plans, setPlans] = useState<FieldTomorrowPlanItem[]>(getStoredTomorrowPlans);
  const [photos, setPhotos] = useState<FieldReportPhoto[]>(getStoredFieldPhotos);

  // Modals state
  const [createWizardOpen, setCreateWizardOpen] = useState<boolean>(false);
  const [selectedIssueDetail, setSelectedIssueDetail] = useState<FieldDailyIssue | null>(null);
  const [photoGalleryOpen, setPhotoGalleryOpen] = useState<boolean>(false);
  const [photoGalleryIndex, setPhotoGalleryIndex] = useState<number>(0);
  const [notificationToast, setNotificationToast] = useState<string>('');

  // Reload data
  const reloadData = () => {
    setReports(getStoredDailyReports());
    setIssues(getStoredFieldIssues());
    setActivities(getStoredFieldActivities());
    setPlans(getStoredTomorrowPlans());
    setPhotos(getStoredFieldPhotos());
  };

  // Toggle activity
  const handleToggleActivity = (actId: string) => {
    const updated = activities.map((a) => (a.id === actId ? { ...a, isCompleted: !a.isCompleted } : a));
    setActivities(updated);
    saveStoredFieldActivities(updated);
  };

  // Toggle plan
  const handleTogglePlan = (planId: string) => {
    const updated = plans.map((p) => (p.id === planId ? { ...p, isDone: !p.isDone } : p));
    setPlans(updated);
    saveStoredTomorrowPlans(updated);
  };

  // Reset module data
  const handleReset = () => {
    if (confirm('Khôi phục toàn bộ phân hệ Báo Cáo Hiện Trường về dữ liệu mẫu gốc?')) {
      resetFieldReportsToBaseline();
      reloadData();
      setNotificationToast('Đã khôi phục dữ liệu ban đầu cho Báo cáo hiện trường!');
      setTimeout(() => setNotificationToast(''), 3500);
    }
  };

  // Filtered issues for sub-tabs
  const filteredIssuesByTab = issues.filter((iss) => {
    if (activeTab === 'eqm-issues' && iss.category !== 'EQM') return false;
    if (activeTab === 'qc-issues' && iss.category !== 'QC') return false;
    if (activeTab === 'hr-issues' && iss.category !== 'HR') return false;
    if (activeTab === 'production-issues' && iss.category !== 'PRODUCTION') return false;
    if (activeTab === 'open-issues' && iss.status === 'ĐÓNG_VẤN_ĐỀ') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        iss.id.toLowerCase().includes(q) ||
        iss.title.toLowerCase().includes(q) ||
        iss.lineCode.toLowerCase().includes(q) ||
        iss.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 text-slate-800">
      {/* ============================================================ */}
      {/* 1. TOP BAR: VENDOR PILLS & VIEW SWITCHER (Desktop vs Mobile) */}
      {/* ============================================================ */}
      <div className="bg-[#082D55] text-white px-5 py-3.5 rounded-2xl shadow-md border border-blue-900 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0878E8] to-[#55D5FF] flex items-center justify-center text-white shadow-md">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-blue-900/80 px-2 py-0.5 rounded border border-cyan-400/30">
                FIELD DAILY REPORT PRO
              </span>
              <span className="text-xs font-mono text-slate-300">v1.0</span>
            </div>
            <h2 className="text-base font-extrabold text-white">
              Báo Cáo Hiện Trường (Desktop & Mobile)
            </h2>
          </div>
        </div>

        {/* Center: 7 Vendor Quick Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {VENDOR_PILLS.map((v) => {
            const isSelected = selectedVendor === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setSelectedVendor(v)}
                className={`px-3 py-1 rounded-md text-xs font-black transition-all cursor-pointer tracking-wider ${
                  isSelected
                    ? 'bg-[#0878E8] text-white shadow-md ring-2 ring-cyan-300'
                    : 'bg-blue-950/70 hover:bg-blue-900 text-slate-300 hover:text-white border border-blue-800/60'
                }`}
              >
                {v}
              </button>
            );
          })}
        </div>

        {/* Right Controls: Device Mode Switcher (Desktop vs Mobile) */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-blue-950/80 p-1 rounded-xl border border-blue-800 flex items-center text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'desktop'
                  ? 'bg-[#0878E8] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop (Quản lý)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'mobile'
                  ? 'bg-[#0878E8] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (Nhân viên)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl bg-blue-950/70 hover:bg-blue-900 text-slate-300 hover:text-white border border-blue-800 cursor-pointer transition-colors"
            title="Khôi phục dữ liệu mẫu gốc"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notificationToast && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-md animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {notificationToast}
          </span>
          <button type="button" onClick={() => setNotificationToast('')} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. SUB-TABS NAVIGATION (When in Desktop Mode)                 */}
      {/* ============================================================ */}
      {viewMode === 'desktop' && (
        <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1 overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#0878E8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Tổng quan báo cáo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('daily-reports')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'daily-reports'
                ? 'bg-[#0878E8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Báo cáo hàng ngày</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
              {reports.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('eqm-issues')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'eqm-issues'
                ? 'bg-[#0878E8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-4 h-4 text-blue-600" />
            <span>EQM — Thiết bị</span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-mono">
              {issues.filter((i) => i.category === 'EQM').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qc-issues')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'qc-issues'
                ? 'bg-[#0878E8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>QC — Chất lượng</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-mono">
              {issues.filter((i) => i.category === 'QC').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hr-issues')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'hr-issues'
                ? 'bg-[#0878E8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>HR — Nhân lực</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-mono">
              {issues.filter((i) => i.category === 'HR').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('production-issues')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'production-issues'
                ? 'bg-[#0878E8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span>Production — Sản lượng</span>
            <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded-full font-mono">
              {issues.filter((i) => i.category === 'PRODUCTION').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('open-issues')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'open-issues'
                ? 'bg-[#0878E8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Vấn đề đang xử lý</span>
            <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-full font-mono">
              {issues.filter((i) => i.status !== 'ĐÓNG_VẤN_ĐỀ').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('report-history')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'report-history'
                ? 'bg-[#0878E8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Lịch sử báo cáo</span>
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. MAIN WORKSPACE CONTENT                                    */}
      {/* ============================================================ */}
      {viewMode === 'mobile' ? (
        // Mobile Field View
        <FieldReportMobileView
          currentUser={currentUser}
          reports={reports}
          issues={issues}
          activities={activities}
          plans={plans}
          onOpenCreateWizard={() => setCreateWizardOpen(true)}
          onSelectIssue={(iss) => setSelectedIssueDetail(iss)}
          onToggleActivity={handleToggleActivity}
        />
      ) : activeTab === 'dashboard' ? (
        // Desktop Management Dashboard (Exact match with screenshot)
        <FieldReportDesktopDashboard
          currentUser={currentUser}
          selectedDate={selectedDate}
          onChangeDate={setSelectedDate}
          selectedFactory={selectedFactory}
          onChangeFactory={setSelectedFactory}
          reports={reports}
          issues={issues}
          activities={activities}
          plans={plans}
          photos={photos}
          onOpenCreateWizard={() => setCreateWizardOpen(true)}
          onSelectIssue={(iss) => setSelectedIssueDetail(iss)}
          onSelectCategory={(cat) => {
            if (cat === 'EQM') setActiveTab('eqm-issues');
            else if (cat === 'QC') setActiveTab('qc-issues');
            else if (cat === 'HR') setActiveTab('hr-issues');
            else if (cat === 'PRODUCTION') setActiveTab('production-issues');
          }}
          onOpenPhotoGallery={(idx = 0) => {
            setPhotoGalleryIndex(idx);
            setPhotoGalleryOpen(true);
          }}
          onToggleActivity={handleToggleActivity}
          onTogglePlan={handleTogglePlan}
          onViewAllReports={() => setActiveTab('daily-reports')}
        />
      ) : activeTab === 'daily-reports' || activeTab === 'report-history' ? (
        // Daily Reports Table View
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-[#082D55]">
                {activeTab === 'daily-reports' ? 'Danh Sách Báo Cáo Hiện Trường' : 'Lịch Sử Báo Cáo Hiện Trường'}
              </h3>
              <p className="text-xs text-slate-500">
                Tổng hợp {reports.length} báo cáo hàng ngày từ các nhà máy và vendor đối tác
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCreateWizardOpen(true)}
              className="px-4 py-2 bg-[#0878E8] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-600 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tạo báo cáo mới</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b">
                <tr>
                  <th className="py-2.5 px-4">Mã báo cáo</th>
                  <th className="py-2.5 px-4">Ngày báo cáo</th>
                  <th className="py-2.5 px-4">Nhân viên</th>
                  <th className="py-2.5 px-4">Nhà máy / Vendor</th>
                  <th className="py-2.5 px-4 text-center">Ca làm việc</th>
                  <th className="py-2.5 px-4 text-center">Vấn đề</th>
                  <th className="py-2.5 px-4 text-center">Trạng thái</th>
                  <th className="py-2.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 font-mono font-bold text-blue-900">{r.reportCode}</td>
                    <td className="py-2.5 px-4 font-mono">{r.reportDate}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{r.employeeName}</td>
                    <td className="py-2.5 px-4">{r.factory} • {r.vendor}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-mono">
                        {r.shift}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.issueIds.length > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {r.issueIds.length} vấn đề
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const firstIssue = issues.find((i) => r.issueIds.includes(i.id)) || issues[0];
                          setSelectedIssueDetail(firstIssue);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded-lg font-bold text-[11px] cursor-pointer"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Specific Issues Category View (EQM, QC, HR, Production, Open Issues)
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-[#082D55]">
                {activeTab === 'eqm-issues' && 'Vấn đề Kỹ thuật & Thiết bị (EQM)'}
                {activeTab === 'qc-issues' && 'Vấn đề Quản lý Chất lượng (QC)'}
                {activeTab === 'hr-issues' && 'Vấn đề Điều phối Nhân lực (HR)'}
                {activeTab === 'production-issues' && 'Vấn đề Tiến độ & Sản lượng (Production)'}
                {activeTab === 'open-issues' && 'Tổng hợp các vấn đề Đang xử lý'}
              </h3>
              <p className="text-xs text-slate-500">
                Tìm thấy {filteredIssuesByTab.length} vấn đề cần theo dõi và giải quyết
              </p>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã, nội dung sự cố..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredIssuesByTab.map((iss) => (
              <div
                key={iss.id}
                onClick={() => setSelectedIssueDetail(iss)}
                className="p-4 bg-slate-50/70 hover:bg-blue-50/60 rounded-2xl border border-slate-200 hover:border-blue-400 cursor-pointer space-y-2 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                      {iss.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {iss.factory} • {iss.lineCode}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {iss.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="font-extrabold text-xs text-navy-950">
                  {iss.title}
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {iss.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-500 font-mono">
                  <span>Báo cáo: {iss.reportedBy} ({iss.reportedDate})</span>
                  <span className="text-blue-600 font-bold flex items-center gap-0.5">
                    Xem chi tiết →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODALS                                                       */}
      {/* ============================================================ */}

      {/* 1. Create Report Wizard Modal */}
      <FieldReportCreateWizardModal
        isOpen={createWizardOpen}
        onClose={() => setCreateWizardOpen(false)}
        currentUser={currentUser}
        onReportCreated={(newReport) => {
          reloadData();
          setNotificationToast(`Báo cáo ${newReport.reportCode} đã được lưu thành công!`);
          setTimeout(() => setNotificationToast(''), 4000);
        }}
      />

      {/* 2. Issue Detail & Multi-day Lifecycle Modal */}
      <FieldIssueDetailModal
        issue={selectedIssueDetail}
        isOpen={!!selectedIssueDetail}
        onClose={() => setSelectedIssueDetail(null)}
        currentUser={currentUser}
        onIssueUpdated={(updatedIssues) => {
          setIssues(updatedIssues);
          if (selectedIssueDetail) {
            const fresh = updatedIssues.find((i) => i.id === selectedIssueDetail.id);
            if (fresh) setSelectedIssueDetail(fresh);
          }
        }}
      />

      {/* 3. Photo Gallery Lightbox Modal */}
      <FieldPhotoGalleryModal
        photos={photos}
        initialIndex={photoGalleryIndex}
        isOpen={photoGalleryOpen}
        onClose={() => setPhotoGalleryOpen(false)}
        onSelectIssue={(issueId) => {
          const found = issues.find((i) => i.id === issueId);
          if (found) setSelectedIssueDetail(found);
        }}
      />
    </div>
  );
};

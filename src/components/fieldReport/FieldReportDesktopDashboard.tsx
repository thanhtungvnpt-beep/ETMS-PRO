// OOS ETMS PRO — Field Daily Report Desktop Dashboard (Module B)
// Desktop Management Dashboard matching official screenshot

import React from 'react';
import {
  FieldDailyReport,
  FieldDailyIssue,
  FieldDailyActivity,
  FieldTomorrowPlanItem,
  FieldReportPhoto,
  FieldIssueCategory,
} from '../../types/fieldReport';
import { UserProfile, VendorName, FactoryName } from '../../types/workforce';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Cpu,
  ShieldAlert,
  Users,
  TrendingUp,
  Calendar,
  Building2,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  Camera,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface FieldReportDesktopDashboardProps {
  currentUser: UserProfile;
  selectedDate: string;
  onChangeDate: (date: string) => void;
  selectedFactory: string;
  onChangeFactory: (factory: string) => void;
  reports: FieldDailyReport[];
  issues: FieldDailyIssue[];
  activities: FieldDailyActivity[];
  plans: FieldTomorrowPlanItem[];
  photos: FieldReportPhoto[];
  onOpenCreateWizard: () => void;
  onSelectIssue: (issue: FieldDailyIssue) => void;
  onSelectCategory: (category: FieldIssueCategory) => void;
  onOpenPhotoGallery: (index?: number) => void;
  onToggleActivity: (actId: string) => void;
  onTogglePlan: (planId: string) => void;
  onViewAllReports?: () => void;
}

export const FieldReportDesktopDashboard: React.FC<FieldReportDesktopDashboardProps> = ({
  currentUser,
  selectedDate,
  onChangeDate,
  selectedFactory,
  onChangeFactory,
  reports,
  issues,
  activities,
  plans,
  photos,
  onOpenCreateWizard,
  onSelectIssue,
  onSelectCategory,
  onOpenPhotoGallery,
  onToggleActivity,
  onTogglePlan,
  onViewAllReports,
}) => {
  // Category counts
  const eqmCount = issues.filter((i) => i.category === 'EQM').length;
  const qcCount = issues.filter((i) => i.category === 'QC').length;
  const hrCount = issues.filter((i) => i.category === 'HR').length;
  const prodCount = issues.filter((i) => i.category === 'PRODUCTION').length;

  return (
    <div className="space-y-4 text-slate-800">
      {/* ============================================================ */}
      {/* 1. HEADER ROW                                                */}
      {/* ============================================================ */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0878E8] flex items-center justify-center shrink-0 border border-blue-100">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#082D55] tracking-tight">
              Báo cáo hiện trường
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi công việc, vấn đề và tình hình hiện trường tại nhà máy
            </p>
          </div>
        </div>

        {/* Filters and CTA */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onChangeDate(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Factory Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Building2 className="w-4 h-4 text-slate-500" />
            <select
              value={selectedFactory}
              onChange={(e) => onChangeFactory(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Tất cả">Tất cả nhà máy</option>
              <option value="SEV">SEV Factory</option>
              <option value="Nhà máy A">Nhà máy A</option>
              <option value="Nhà máy B">Nhà máy B</option>
              <option value="Nhà máy C">Nhà máy C</option>
            </select>
          </div>

          {/* Create Report Button */}
          <button
            type="button"
            onClick={onOpenCreateWizard}
            className="px-4 py-2 bg-[#0878E8] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo báo cáo mới</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. 4 TOP KPI SUMMARY CARDS                                   */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Tổng báo cáo hôm nay */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0878E8] flex items-center justify-center shrink-0 border border-blue-100">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">Tổng báo cáo hôm nay</div>
            <div className="text-2xl font-black text-navy-950 font-mono leading-none mt-1">12</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
              <span>↑ +20% so với hôm qua</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Có vấn đề */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">Có vấn đề</div>
            <div className="text-2xl font-black text-rose-600 font-mono leading-none mt-1">5</div>
            <div className="text-[10px] text-rose-600 font-bold mt-1 flex items-center gap-0.5">
              <span>↑ +41.7%</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Không có vấn đề */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">Không có vấn đề</div>
            <div className="text-2xl font-black text-emerald-700 font-mono leading-none mt-1">7</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
              <span>↑ +58.3%</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Chưa gửi */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">Chưa gửi</div>
            <div className="text-2xl font-black text-slate-800 font-mono leading-none mt-1">0</div>
            <div className="text-[10px] text-slate-400 font-bold mt-1">
              <span>↑ 0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. 4 CATEGORY CARDS + MINI SUMMARY (5 Columns on Large screens)*/}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: EQM — Thiết bị */}
        <div
          onClick={() => onSelectCategory('EQM')}
          className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs hover:border-blue-400 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs text-blue-900">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>EQM — Thiết bị</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <div className="text-xl font-black text-blue-600 font-mono">{eqmCount} vấn đề</div>
            <div className="text-[10px] text-slate-500 mt-0.5">1 mới • 2 đang xử lý</div>
          </div>
        </div>

        {/* Card 2: QC — Chất lượng */}
        <div
          onClick={() => onSelectCategory('QC')}
          className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs hover:border-amber-400 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>QC — Chất lượng</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <div className="text-xl font-black text-amber-600 font-mono">{qcCount} vấn đề</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Đang theo dõi</div>
          </div>
        </div>

        {/* Card 3: HR — Nhân lực */}
        <div
          onClick={() => onSelectCategory('HR')}
          className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs hover:border-emerald-400 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>HR — Nhân lực</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-700 font-mono">{hrCount} vấn đề</div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <span>✓ Nhân lực ổn định</span>
            </div>
          </div>
        </div>

        {/* Card 4: Production — Sản lượng */}
        <div
          onClick={() => onSelectCategory('PRODUCTION')}
          className="bg-white p-4 rounded-2xl border border-purple-200 shadow-2xs hover:border-purple-400 transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs text-purple-900">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>Production — Sản lượng</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <div className="text-xl font-black text-purple-700 font-mono">{prodCount} vấn đề</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Ảnh hưởng tiến độ</div>
          </div>
        </div>

        {/* Card 5: Mini Summary Tổng quan hôm nay */}
        <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between font-bold text-xs text-navy-950 pb-1 border-b border-slate-200">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Tổng quan hôm nay
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                EQM - Thiết bị
              </span>
              <strong className="font-mono text-blue-700">{eqmCount}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                QC - Chất lượng
              </span>
              <strong className="font-mono text-amber-700">{qcCount}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                HR - Nhân lực
              </span>
              <strong className="font-mono text-emerald-700">{hrCount}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Production - Sản lượng
              </span>
              <strong className="font-mono text-purple-700">{prodCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MIDDLE SECTION: CÔNG VIỆC, KẾ HOẠCH & HÌNH ẢNH             */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Box 1: Công việc hôm nay */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-xs text-[#082D55] flex items-center gap-1.5 uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Công việc hôm nay
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              {activities.filter((a) => a.isCompleted).length}/{activities.length} hoàn tất
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {activities.map((act) => (
              <div
                key={act.id}
                onClick={() => onToggleActivity(act.id)}
                className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                    act.isCompleted ? 'bg-emerald-500 text-white' : 'border border-slate-300'
                  }`}
                >
                  {act.isCompleted && '✓'}
                </div>
                <div className="space-y-0.5">
                  <div className={`font-semibold ${act.isCompleted ? 'text-slate-800' : 'text-slate-500'}`}>
                    {act.content}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {act.area} • {act.completedAt || 'Đang thực hiện'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Box 2: Kế hoạch ngày mai */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-xs text-[#082D55] flex items-center gap-1.5 uppercase tracking-wide">
              <Calendar className="w-4 h-4 text-[#0878E8]" />
              Kế hoạch ngày mai
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              04/11/2026
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {plans.map((pln) => (
              <div
                key={pln.id}
                onClick={() => onTogglePlan(pln.id)}
                className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                    pln.isDone ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {pln.isDone && '✓'}
                </div>
                <div className="space-y-0.5">
                  <div className={`font-semibold ${pln.isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {pln.content}
                  </div>
                  {pln.relatedIssueId && (
                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      Vấn đề {pln.relatedIssueId}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Box 3: Hình ảnh hiện trường (5) with Gallery Trigger */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-xs text-[#082D55] flex items-center gap-1.5 uppercase tracking-wide">
              <Camera className="w-4 h-4 text-blue-600" />
              Hình ảnh hiện trường ({photos.length})
            </h3>
            <button
              type="button"
              onClick={() => onOpenPhotoGallery(0)}
              className="text-[11px] font-bold text-[#0878E8] hover:text-blue-700 cursor-pointer"
            >
              Xem tất cả
            </button>
          </div>

          {/* Thumbnails Grid (3 thumbnails + overlay for the rest) */}
          <div className="grid grid-cols-3 gap-2">
            {photos.slice(0, 2).map((p, idx) => (
              <div
                key={p.id || idx}
                onClick={() => onOpenPhotoGallery(idx)}
                className="relative rounded-xl overflow-hidden h-28 border border-slate-200 cursor-pointer group"
              >
                <img
                  src={p.url}
                  alt={p.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            ))}

            {/* 3rd item with "+2" overlay */}
            {photos.length >= 3 && (
              <div
                onClick={() => onOpenPhotoGallery(2)}
                className="relative rounded-xl overflow-hidden h-28 border border-slate-200 cursor-pointer group"
              >
                <img
                  src={photos[2].url}
                  alt={photos[2].caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {photos.length > 3 && (
                  <div className="absolute inset-0 bg-[#082D55]/70 flex items-center justify-center text-white font-extrabold text-base backdrop-blur-2xs">
                    +{photos.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. BOTTOM SECTION: VẤN ĐỀ NỔI BẬT & BÁO CÁO GẦN ĐÂY          */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left 2 Cols: Vấn đề nổi bật trong ngày (Field Issue Center) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-xs text-[#082D55] flex items-center gap-1.5 uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Vấn đề nổi bật trong ngày ({issues.length})
            </h3>
            <span className="text-[11px] text-slate-500">
              Nhấp vào sự cố để xem tiến độ & lịch sử xử lý
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {issues.map((iss) => (
              <div
                key={iss.id}
                onClick={() => onSelectIssue(iss)}
                className="p-3 bg-slate-50/70 hover:bg-blue-50/60 rounded-xl border border-slate-200/80 hover:border-blue-300 flex items-center justify-between gap-3 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border shrink-0 ${
                      iss.category === 'EQM'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : iss.category === 'QC'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : iss.category === 'PRODUCTION'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {iss.category}
                  </span>

                  <div>
                    <div className="font-extrabold text-navy-950 group-hover:text-blue-900 flex items-center gap-1.5">
                      <span className="font-mono text-blue-700">{iss.id}:</span>
                      <span>{iss.title}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                      <span>{iss.lineCode}</span>
                      <span>•</span>
                      <span>{iss.status.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span>{iss.reportedTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      iss.severity === 'CRITICAL' || iss.severity === 'HIGH'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : iss.severity === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {iss.severity}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Báo cáo gần đây */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-xs text-[#082D55] flex items-center gap-1.5 uppercase tracking-wide">
                <Clock className="w-4 h-4 text-blue-600" />
                Báo cáo gần đây
              </h3>
              <button
                type="button"
                onClick={onViewAllReports}
                className="text-xs font-bold text-[#0878E8] hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 mt-3 text-xs">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-mono font-bold text-navy-950 text-xs">{r.reportDate}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {r.employeeName} • {r.vendor}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block mb-0.5">
                      Đã gửi
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {r.issueIds.length} vấn đề
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono text-center">
            Dữ liệu lưu trữ tập trung OOS Enterprise
          </div>
        </div>
      </div>
    </div>
  );
};

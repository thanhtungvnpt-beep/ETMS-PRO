// OOS ETMS PRO — Phase 3: Line Filling Control Center
// Real-time Workforce Allocation & Production Line Filling Management
// Matches official UI specifications and design mockups

import React, { useState, useEffect, useMemo } from 'react';
import {
  ProductionLine,
  LineFillingSummary,
  LineAttendanceRecord,
  LineShortageAlert,
  LineTransferLog,
  LineLeaderSignOff,
  AttendanceDevice,
  ShiftType,
} from '../../types/lineFillingPhase3';
import { VendorName, FactoryName, UserProfile } from '../../types/workforce';
import {
  getStoredLines,
  getStoredLineSummaries,
  getStoredAttendances,
  getStoredShortageAlerts,
  getStoredTransferLogs,
  getStoredLineLeaderSignOffs,
  getStoredAttendanceDevices,
  calculateControlTowerKPIs,
  executeWorkforceTransfer,
  saveStoredLineSummaries,
  saveStoredShortageAlerts,
} from '../../services/lineFillingPhase3Storage';
import {
  Users,
  UserCheck,
  UserX,
  Target,
  User,
  AlertTriangle,
  Eye,
  ArrowRightLeft,
  RefreshCw,
  Clock,
  Building2,
  Cpu,
  Layers,
  Smartphone,
  Server,
  CheckCircle2,
  XCircle,
  HelpCircle,
  TrendingUp,
  BarChart2,
  PieChart,
  FileText,
  Filter,
  ShieldAlert,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { LineDetailView } from './LineDetailView';
import { LineAttendanceView } from './LineAttendanceView';
import { LineAllocationView } from './LineAllocationView';
import { LineShortageAlertsView } from './LineShortageAlertsView';
import { LineLeaderMobileModal } from './LineLeaderMobileModal';

interface LineFillingControlTowerProps {
  currentUser: UserProfile;
  onNavigateTab?: (tab: string) => void;
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

export const LineFillingControlTower: React.FC<LineFillingControlTowerProps> = ({
  currentUser,
  onNavigateTab,
}) => {
  // Master state
  const [lines, setLines] = useState<ProductionLine[]>(getStoredLines);
  const [summaries, setSummaries] = useState<LineFillingSummary[]>(getStoredLineSummaries);
  const [attendances, setAttendances] = useState<LineAttendanceRecord[]>(getStoredAttendances);
  const [alerts, setAlerts] = useState<LineShortageAlert[]>(getStoredShortageAlerts);
  const [transferLogs, setTransferLogs] = useState<LineTransferLog[]>(getStoredTransferLogs);
  const [signoffs, setSignoffs] = useState<LineLeaderSignOff[]>(getStoredLineLeaderSignOffs);
  const [devices, setDevices] = useState<AttendanceDevice[]>(getStoredAttendanceDevices);

  // Active top navigation tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'lines_detail' | 'attendance' | 'allocation' | 'alerts'
  >('overview');

  // Filter Bar state
  const [selectedFactory, setSelectedFactory] = useState<string>('SEV');
  const [selectedVendor, setSelectedVendor] = useState<VendorName>('KHV');
  const [selectedArea, setSelectedArea] = useState<string>('Tất cả');
  const [selectedLineFilter, setSelectedLineFilter] = useState<string>('Tất cả');
  const [selectedShift, setSelectedShift] = useState<ShiftType>('CA_NGAY');

  // Selected Line for bottom-right inspector (Defaults to Line 03 as in screenshot)
  const [inspectedLineCode, setInspectedLineCode] = useState<string>('Line 03');
  const [inspectorSubTab, setInspectorSubTab] = useState<'positions' | 'workers' | 'logs'>('positions');

  // Real-time clock and pulse
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('10:24:36');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals state
  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false);
  const [targetTransferLine, setTargetTransferLine] = useState<string>('Line 03');
  const [sourceTransferLine, setSourceTransferLine] = useState<string>('Line 04');
  const [transferCount, setTransferCount] = useState<number>(3);
  const [transferPosition, setTransferPosition] = useState<string>('Công nhân sản xuất');
  const [transferReason, setTransferReason] = useState<string>('Cân bằng chuyền do đơn hàng Model B gấp');

  const [leaderMobileModalOpen, setLeaderMobileModalOpen] = useState<boolean>(false);
  const [deviceArchModalOpen, setDeviceArchModalOpen] = useState<boolean>(false);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(now.toTimeString().slice(0, 8));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered summaries
  const filteredSummaries = useMemo(() => {
    return summaries.filter((s) => {
      if (selectedLineFilter !== 'Tất cả' && s.lineCode !== selectedLineFilter) return false;
      return true;
    });
  }, [summaries, selectedLineFilter]);

  // Current inspected line summary & positions
  const inspectedSummary = useMemo(() => {
    return summaries.find((s) => s.lineCode === inspectedLineCode) || summaries[2] || summaries[0];
  }, [summaries, inspectedLineCode]);

  // Workers for inspected line
  const inspectedWorkers = useMemo(() => {
    return attendances.filter((a) => a.lineCode === inspectedLineCode);
  }, [attendances, inspectedLineCode]);

  // Transfer logs for inspected line
  const inspectedLogs = useMemo(() => {
    return transferLogs.filter(
      (l) => l.fromLineCode === inspectedLineCode || l.toLineCode === inspectedLineCode
    );
  }, [transferLogs, inspectedLineCode]);

  // KPIs
  const kpis = useMemo(() => {
    return calculateControlTowerKPIs(filteredSummaries);
  }, [filteredSummaries]);

  // Handle manual data refresh
  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSummaries(getStoredLineSummaries());
      setAttendances(getStoredAttendances());
      setAlerts(getStoredShortageAlerts());
      setTransferLogs(getStoredTransferLogs());
      setSignoffs(getStoredLineLeaderSignOffs());
      setDevices(getStoredAttendanceDevices());
      setIsRefreshing(false);
    }, 400);
  };

  // Execute Transfer Action
  const handleConfirmTransfer = () => {
    const result = executeWorkforceTransfer(
      sourceTransferLine,
      targetTransferLine,
      transferCount,
      transferPosition,
      currentUser.name || 'Quản đốc xưởng',
      transferReason
    );

    if (result.success) {
      setSummaries(result.updatedSummaries);
      setTransferLogs(getStoredTransferLogs());
      setTransferModalOpen(false);
      // Auto-update alerts
      const updatedAlerts = alerts.map((a) => {
        if (a.lineCode === targetTransferLine) {
          const newShortage = Math.max(0, a.shortageCount - transferCount);
          return {
            ...a,
            shortageCount: newShortage,
            status: newShortage === 0 ? ('ĐÃ_XỬ_LÝ' as const) : ('ĐANG_ĐIỀU_CHUYỂN' as const),
            details: `Đã bù ${transferCount} người từ ${sourceTransferLine}`,
          };
        }
        return a;
      });
      setAlerts(updatedAlerts);
      saveStoredShortageAlerts(updatedAlerts);
    }
  };

  return (
    <div className="space-y-4 text-slate-800">
      {/* ============================================================ */}
      {/* 1. TOP HEADER & VENDOR SELECTOR PILLS                         */}
      {/* ============================================================ */}
      <div className="bg-[#082D55] text-white px-5 py-3.5 rounded-2xl shadow-md border border-blue-900 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1688E8] to-[#55D5FF] flex items-center justify-center text-white shadow-md">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-blue-900/80 px-2 py-0.5 rounded border border-cyan-400/30">
                PHASE 3 • REAL-TIME LINE FILLING
              </span>
              <span className="text-xs font-mono text-slate-300">v3.0.0</span>
            </div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              LINE FILLING CONTROL – GIÁM SÁT ĐIỀN ĐẦY NHÂN LỰC THEO LINE
            </h1>
          </div>
        </div>

        {/* Center: Vendor Quick Selector Pills */}
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
                    ? 'bg-[#1688E8] text-white shadow-md ring-2 ring-cyan-300'
                    : 'bg-blue-950/70 hover:bg-blue-900 text-slate-300 hover:text-white border border-blue-800/60'
                }`}
              >
                {v}
              </button>
            );
          })}
        </div>

        {/* Right Info: Today & Shift + Quick Action Modals */}
        <div className="flex items-center gap-2.5 shrink-0 text-xs">
          <div className="bg-blue-950/80 px-3 py-1.5 rounded-lg border border-blue-800 text-slate-200 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <div className="font-bold">Hôm nay: 20/04/2025</div>
              <div className="text-[10px] text-slate-300 font-mono">
                Ca: Ca ngày (08:00 - 17:00)
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLeaderMobileModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            title="Mô phỏng điện thoại Trưởng Chuyền xác nhận quân số đầu ca"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile Trưởng Chuyền</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceArchModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-900/80 hover:bg-blue-800 text-cyan-300 border border-cyan-400/30 font-bold text-xs transition-colors cursor-pointer"
            title="Kiến trúc tích hợp thiết bị IoT / RFID / FaceID"
          >
            <Server className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kiến trúc IoT</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MAIN SUB-TABS NAVIGATION (5 Tabs)                         */}
      {/* ============================================================ */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-1 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#1688E8] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Tổng quan điền đầy Line</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lines_detail')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'lines_detail'
              ? 'bg-[#1688E8] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Chi tiết theo Line</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-[#1688E8] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Hiện diện nhân sự</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('allocation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'allocation'
              ? 'bg-[#1688E8] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Phân công nhân lực</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer relative ${
            activeTab === 'alerts'
              ? 'bg-[#1688E8] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Cảnh báo & xử lý</span>
          {kpis.criticalAlertsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-2 right-2" />
          )}
        </button>
      </div>

      {/* ============================================================ */}
      {/* 3. CONDITIONAL TAB RENDERING: OVERVIEW                        */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <>
          {/* FILTER BAR WITH REAL-TIME PULSE */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Nhà máy */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 text-[11px]">Nhà máy:</span>
            <select
              value={selectedFactory}
              onChange={(e) => setSelectedFactory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold bg-white text-navy-950 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="SEV">SEV</option>
              <option value="Nhà máy A">Nhà máy A</option>
              <option value="Nhà máy B">Nhà máy B</option>
              <option value="Nhà máy C">Nhà máy C</option>
            </select>
          </div>

          {/* Vendor */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 text-[11px]">Vendor:</span>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value as VendorName)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold bg-white text-navy-950 focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="KHV">KHV - KHV TECHNOLOGY</option>
              <option value="DREAM TECH">DREAM TECH</option>
              <option value="HSTEC">HSTEC</option>
              <option value="KTECH">KTECH</option>
              <option value="HOJEONGB">HOJEONGB</option>
              <option value="HOJEONG VINA">HOJEONG VINA</option>
              <option value="DAAL">DAAL</option>
            </select>
          </div>

          {/* Khu vực */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 text-[11px]">Khu vực:</span>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium bg-white text-slate-700 cursor-pointer"
            >
              <option value="Tất cả">Tất cả</option>
              <option value="SMT">Xưởng Lắp ráp SMT</option>
              <option value="Cơ khí">Xưởng Lắp ráp Cơ khí</option>
              <option value="Đóng gói">Xưởng Đóng gói & Xuất hàng</option>
            </select>
          </div>

          {/* Line */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 text-[11px]">Line:</span>
            <select
              value={selectedLineFilter}
              onChange={(e) => setSelectedLineFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium bg-white text-slate-700 cursor-pointer"
            >
              <option value="Tất cả">Tất cả</option>
              {summaries.map((s) => (
                <option key={s.lineCode} value={s.lineCode}>
                  {s.lineCode} ({s.productModel})
                </option>
              ))}
            </select>
          </div>

          {/* Ca làm việc */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 text-[11px]">Ca làm việc:</span>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value as ShiftType)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold bg-white text-slate-800 cursor-pointer"
            >
              <option value="CA_NGAY">Ca ngày (08:00 - 17:00)</option>
              <option value="CA_DEM">Ca đêm (20:00 - 05:00)</option>
              <option value="CA_HANH_CHINH">Ca hành chính (08:00 - 17:00)</option>
            </select>
          </div>
        </div>

        {/* Real-time Indicator with Active Pulse */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold text-[11px]">
              Dữ liệu real-time (cập nhật {currentTimeStr})
            </span>
          </div>

          <button
            type="button"
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Làm mới dữ liệu từ thiết bị IoT"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. TOP 6 KPI SUMMARY CARDS                                   */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Nhu cầu nhân lực */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">Nhu cầu nhân lực</div>
            <div className="text-2xl font-black text-navy-950 font-mono leading-none mt-1">
              {kpis.totalDemand}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Người</div>
          </div>
        </div>

        {/* KPI 2: Thực có tại Line */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">Thực có tại Line</div>
            <div className="text-2xl font-black text-emerald-700 font-mono leading-none mt-1">
              {kpis.totalActual}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Người</div>
          </div>
        </div>

        {/* KPI 3: Thiếu nhân lực */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">Thiếu nhân lực</div>
            <div className="text-2xl font-black text-rose-600 font-mono leading-none mt-1">
              {kpis.totalShortage}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Người</div>
          </div>
        </div>

        {/* KPI 4: Tỷ lệ điền đầy */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">Tỷ lệ điền đầy</div>
            <div className="text-2xl font-black text-teal-700 font-mono leading-none mt-1">
              {kpis.overallFillingRate}%
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Mục tiêu &ge;90%</div>
          </div>
        </div>

        {/* KPI 5: Chính thức */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">Chính thức</div>
            <div className="text-2xl font-black text-blue-900 font-mono leading-none mt-1">
              {kpis.totalOfficial}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Người ({kpis.officialRatio}%)
            </div>
          </div>
        </div>

        {/* KPI 6: Thời vụ */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500">Thời vụ</div>
            <div className="text-2xl font-black text-indigo-900 font-mono leading-none mt-1">
              {kpis.totalSeasonal}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Người ({kpis.seasonalRatio}%)
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. MIDDLE ROW: 3 VISUAL ANALYTICS CARDS                      */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Card A: Combined Bar + Line Chart (Tỷ lệ điền đầy theo Line) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-extrabold text-sm text-[#082D55]">
              Tỷ lệ điền đầy theo Line
            </h3>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-3 h-3 rounded bg-blue-500" />
                Nhu cầu
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-3 h-3 rounded bg-emerald-400" />
                Thực có
              </span>
              <span className="flex items-center gap-1.5 text-amber-500">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Tỷ lệ điền đầy
              </span>
            </div>
          </div>

          {/* SVG Custom High-Fidelity Chart */}
          <div className="h-48 w-full mt-2 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 520 180">
              {/* Grid Lines */}
              <line x1="30" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="140" x2="500" y2="140" stroke="#e2e8f0" strokeWidth="1" />

              {/* Y Axis Left (Headcount 0-80) */}
              <text x="22" y="24" fontSize="9" fill="#94a3b8" textAnchor="end">80</text>
              <text x="22" y="64" fontSize="9" fill="#94a3b8" textAnchor="end">60</text>
              <text x="22" y="104" fontSize="9" fill="#94a3b8" textAnchor="end">40</text>
              <text x="22" y="144" fontSize="9" fill="#94a3b8" textAnchor="end">0</text>

              {/* Y Axis Right (% 60-100%) */}
              <text x="506" y="24" fontSize="9" fill="#94a3b8" textAnchor="start">100%</text>
              <text x="506" y="64" fontSize="9" fill="#94a3b8" textAnchor="start">90%</text>
              <text x="506" y="104" fontSize="9" fill="#94a3b8" textAnchor="start">80%</text>
              <text x="506" y="144" fontSize="9" fill="#94a3b8" textAnchor="start">60%</text>

              {/* Bars for Line 01 - Line 08 */}
              {summaries.map((s, idx) => {
                const x = 50 + idx * 56;
                const barWidth = 14;
                const demandHeight = (s.requiredHeadcount / 80) * 120;
                const actualHeight = (s.actualTotal / 80) * 120;

                return (
                  <g key={s.lineCode}>
                    {/* Demand Bar (Blue) */}
                    <rect
                      x={x - barWidth - 1}
                      y={140 - demandHeight}
                      width={barWidth}
                      height={demandHeight}
                      rx="2"
                      fill="#3B82F6"
                    />
                    <text
                      x={x - barWidth / 2 - 1}
                      y={140 - demandHeight - 3}
                      fontSize="8"
                      fontWeight="bold"
                      fill="#1E40AF"
                      textAnchor="middle"
                    >
                      {s.requiredHeadcount}
                    </text>

                    {/* Actual Bar (Emerald) */}
                    <rect
                      x={x + 1}
                      y={140 - actualHeight}
                      width={barWidth}
                      height={actualHeight}
                      rx="2"
                      fill="#34D399"
                    />
                    <text
                      x={x + barWidth / 2 + 1}
                      y={140 - actualHeight - 3}
                      fontSize="8"
                      fontWeight="bold"
                      fill="#065F46"
                      textAnchor="middle"
                    >
                      {s.actualTotal}
                    </text>

                    {/* X-axis Label */}
                    <text
                      x={x}
                      y="160"
                      fontSize="9"
                      fontWeight="600"
                      fill="#64748b"
                      textAnchor="middle"
                    >
                      {s.lineCode}
                    </text>
                  </g>
                );
              })}

              {/* Line Graph for Filling Rate % */}
              {(() => {
                // Calculate points: 100% -> y=20, 60% -> y=140
                const points = summaries.map((s, idx) => {
                  const x = 50 + idx * 56;
                  const rateClamped = Math.max(60, Math.min(100, s.fillingRate));
                  const y = 140 - ((rateClamped - 60) / 40) * 120;
                  return { x, y, rate: s.fillingRate };
                });

                const pathD = points
                  .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                  .join(' ');

                return (
                  <g>
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#F59E0B" stroke="#ffffff" strokeWidth="1.5" />
                        <text
                          x={p.x}
                          y={p.y - 8}
                          fontSize="8.5"
                          fontWeight="bold"
                          fill="#D97706"
                          textAnchor="middle"
                        >
                          {p.rate}%
                        </text>
                      </g>
                    ))}
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Card B: Donut Chart (Cơ cấu nhân lực theo nghiệp vụ thực có) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <h3 className="font-extrabold text-sm text-[#082D55] mb-2">
            Cơ cấu nhân lực theo nghiệp vụ (thực có)
          </h3>

          <div className="flex items-center justify-between gap-4 my-auto">
            {/* Donut SVG */}
            <div className="relative w-32 h-32 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="16" fill="transparent" />
                {/* Sản xuất 67.7% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#3B82F6"
                  strokeWidth="16"
                  strokeDasharray="161.6 238.7"
                  strokeDashoffset="0"
                  fill="transparent"
                />
                {/* Hành chính 9.3% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#10B981"
                  strokeWidth="16"
                  strokeDasharray="22.2 238.7"
                  strokeDashoffset="-161.6"
                  fill="transparent"
                />
                {/* QC 8.7% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#FBBF24"
                  strokeWidth="16"
                  strokeDasharray="20.7 238.7"
                  strokeDashoffset="-183.8"
                  fill="transparent"
                />
                {/* EQM 6.9% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#8B5CF6"
                  strokeWidth="16"
                  strokeDasharray="16.5 238.7"
                  strokeDashoffset="-204.5"
                  fill="transparent"
                />
                {/* Khác 7.4% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#94A3B8"
                  strokeWidth="16"
                  strokeDasharray="17.7 238.7"
                  strokeDashoffset="-221.0"
                  fill="transparent"
                />
              </svg>

              {/* Center Value */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black font-mono text-[#082D55] leading-none">
                  462
                </span>
                <span className="text-[9px] text-slate-400 font-bold mt-0.5">
                  Nhân lực
                </span>
              </div>
            </div>

            {/* Legend with percentages */}
            <div className="space-y-1.5 text-xs flex-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Sản xuất
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  <strong>67.7%</strong> 313
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Hành chính - Nhân sự
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  <strong>9.3%</strong> 43
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Chất lượng (QC)
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  <strong>8.7%</strong> 40
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  Thiết bị (EQM)
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  <strong>6.9%</strong> 32
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  Khác
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  <strong>7.4%</strong> 34
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card C: Cảnh báo hiện tại (Workforce Shortage Alerts) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-extrabold text-sm text-[#082D55]">
              Cảnh báo hiện tại
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab('alerts')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 my-auto">
            {alerts.slice(0, 3).map((alt) => (
              <div
                key={alt.id}
                onClick={() => {
                  setInspectedLineCode(alt.lineCode);
                  setTargetTransferLine(alt.lineCode);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                  alt.severity === 'CAO'
                    ? 'bg-rose-50/60 border-rose-200 hover:bg-rose-50'
                    : 'bg-amber-50/60 border-amber-200 hover:bg-amber-50'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    alt.severity === 'CAO'
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900 truncate">
                      {alt.lineCode}: thiếu {alt.shortageCount} người ({alt.fillingRate}%)
                    </span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                        alt.severity === 'CAO'
                          ? 'bg-rose-200 text-rose-800'
                          : 'bg-amber-200 text-amber-800'
                      }`}
                    >
                      {alt.severity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {alt.details}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Tự động phát hiện qua IoT</span>
            <button
              type="button"
              onClick={() => {
                setTargetTransferLine('Line 08');
                setTransferModalOpen(true);
              }}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              + Bù nhân sự ngay
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. BOTTOM ROW: SPLIT TABLE & LINE INSPECTOR                  */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Tình trạng điền đầy theo Line (8 Chuyền) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-[#082D55]">
                Tình trạng điền đầy theo Line
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhấp vào từng dòng để mở chi tiết cơ cấu vị trí và danh sách công nhân thực tế tại Line.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              8 Chuyền hoạt động
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Line</th>
                  <th className="py-2.5 px-3">Sản phẩm / Model</th>
                  <th className="py-2.5 px-3 text-center">Nhu cầu (người)</th>
                  <th className="py-2.5 px-3 text-center" colSpan={3}>
                    Thực có (người)
                    <div className="grid grid-cols-3 text-[9px] font-normal normal-case pt-0.5 border-t border-slate-200/60 mt-0.5">
                      <span>CT</span>
                      <span>TV</span>
                      <span className="font-bold">Tổng</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-3 text-center">Thiếu / Dư</th>
                  <th className="py-2.5 px-3 text-center">Tỷ lệ</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  <th className="py-2.5 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {filteredSummaries.map((s) => {
                  const isSelected = inspectedLineCode === s.lineCode;
                  return (
                    <tr
                      key={s.lineCode}
                      onClick={() => setInspectedLineCode(s.lineCode)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/70 font-semibold ring-1 ring-blue-300'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-extrabold text-[#082D55]">
                        {s.lineCode}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {s.productModel}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                        {s.requiredHeadcount}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-600 bg-slate-50/40">
                        {s.actualOfficial}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono text-slate-600 bg-slate-50/40">
                        {s.actualSeasonal}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-black text-navy-950 bg-slate-100/50">
                        {s.actualTotal}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-black">
                        {s.shortage === 0 ? (
                          <span className="text-slate-400">-</span>
                        ) : (
                          <span className="text-rose-600">{s.shortage}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                        {s.fillingRate}%
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {s.status === 'ĐỦ' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Đủ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            Thiếu
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectedLineCode(s.lineCode);
                            }}
                            className="p-1 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTargetTransferLine(s.lineCode);
                              setTransferModalOpen(true);
                            }}
                            className="p-1 hover:bg-purple-100 text-purple-600 rounded transition-colors"
                            title="Điều chuyển / Bù nhân lực"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Total Summary Row */}
                <tr className="bg-slate-100/90 font-black text-slate-900 border-t-2 border-slate-300">
                  <td className="py-3 px-3">Tổng cộng</td>
                  <td className="py-3 px-3">—</td>
                  <td className="py-3 px-3 text-center font-mono">{kpis.totalDemand}</td>
                  <td className="py-3 px-2 text-center font-mono">{kpis.totalOfficial}</td>
                  <td className="py-3 px-2 text-center font-mono">{kpis.totalSeasonal}</td>
                  <td className="py-3 px-2 text-center font-mono text-blue-900">
                    {kpis.totalActual}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-rose-600">
                    -{kpis.totalShortage}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-emerald-700">
                    {kpis.overallFillingRate}%
                  </td>
                  <td className="py-3 px-3 text-center" colSpan={2}>—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Chi tiết Line (e.g. Chi tiết Line 03) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-extrabold text-base text-[#082D55] flex items-center gap-2">
                <span>Chi tiết {inspectedSummary.lineCode}</span>
                <span className="text-xs font-normal text-slate-500">
                  ({inspectedSummary.productModel})
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  inspectedSummary.status === 'ĐỦ'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {inspectedSummary.fillingRate}% điền đầy
              </span>
            </div>
          </div>

          {/* Sub-tabs: Cơ cấu theo vị trí | Danh sách nhân sự | Lịch sử biến động */}
          <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setInspectorSubTab('positions')}
              className={`pb-2 px-1 border-b-2 cursor-pointer transition-colors ${
                inspectorSubTab === 'positions'
                  ? 'border-[#1688E8] text-[#1688E8]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Cơ cấu theo vị trí
            </button>
            <button
              type="button"
              onClick={() => setInspectorSubTab('workers')}
              className={`pb-2 px-1 border-b-2 cursor-pointer transition-colors ${
                inspectorSubTab === 'workers'
                  ? 'border-[#1688E8] text-[#1688E8]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Danh sách nhân sự ({inspectedWorkers.length})
            </button>
            <button
              type="button"
              onClick={() => setInspectorSubTab('logs')}
              className={`pb-2 px-1 border-b-2 cursor-pointer transition-colors ${
                inspectorSubTab === 'logs'
                  ? 'border-[#1688E8] text-[#1688E8]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Lịch sử biến động ({inspectedLogs.length})
            </button>
          </div>

          {/* SUB-VIEW 1: CƠ CẤU THEO VỊ TRÍ */}
          {inspectorSubTab === 'positions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="py-2.5 px-3">Vị trí công việc</th>
                    <th className="py-2.5 px-2 text-center">Nhu cầu</th>
                    <th className="py-2.5 px-2 text-center" colSpan={3}>
                      Thực có
                      <div className="grid grid-cols-3 text-[9px] font-normal normal-case pt-0.5 border-t border-slate-200/60 mt-0.5">
                        <span>CT</span>
                        <span>TV</span>
                        <span className="font-bold">Tổng</span>
                      </div>
                    </th>
                    <th className="py-2.5 px-2 text-center">Thiếu / Dư</th>
                    <th className="py-2.5 px-2 text-right">Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {inspectedSummary.positions.map((p) => (
                    <tr key={p.position} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {p.position}
                        {p.isCritical && (
                          <span className="ml-1 text-[9px] text-rose-600 font-normal">
                            *
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-700">
                        {p.requiredCount}
                      </td>
                      <td className="py-2.5 px-1.5 text-center font-mono text-slate-600">
                        {p.actualOfficial}
                      </td>
                      <td className="py-2.5 px-1.5 text-center font-mono text-slate-600">
                        {p.actualSeasonal}
                      </td>
                      <td className="py-2.5 px-1.5 text-center font-mono font-bold text-navy-950 bg-slate-50">
                        {p.actualTotal}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-black">
                        {p.variance === 0 ? (
                          <span className="text-slate-400">-</span>
                        ) : (
                          <span className="text-rose-600 font-bold">{p.variance}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-800">
                        {p.fillingRate}%
                      </td>
                    </tr>
                  ))}

                  {/* Summary row for this Line */}
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                    <td className="py-2.5 px-3">Tổng {inspectedSummary.lineCode}</td>
                    <td className="py-2.5 px-2 text-center font-mono">
                      {inspectedSummary.requiredHeadcount}
                    </td>
                    <td className="py-2.5 px-1.5 text-center font-mono">
                      {inspectedSummary.actualOfficial}
                    </td>
                    <td className="py-2.5 px-1.5 text-center font-mono">
                      {inspectedSummary.actualSeasonal}
                    </td>
                    <td className="py-2.5 px-1.5 text-center font-mono text-blue-900">
                      {inspectedSummary.actualTotal}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono text-rose-600">
                      {inspectedSummary.shortage === 0 ? '-' : inspectedSummary.shortage}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-emerald-700">
                      {inspectedSummary.fillingRate}%
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {inspectedSummary.shortage < 0
                    ? `⚠️ Thiếu ${Math.abs(inspectedSummary.shortage)} người so với định mức SOP`
                    : '✓ Đạt 100% định mức sản xuất'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTargetTransferLine(inspectedSummary.lineCode);
                    setTransferModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Điều chuyển bù người
                </button>
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: DANH SÁCH NHÂN SỰ CHECK-IN */}
          {inspectorSubTab === 'workers' && (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {inspectedWorkers.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Chưa có log điểm danh cho chuyền này trong ca hiện tại.
                </div>
              ) : (
                inspectedWorkers.map((w) => (
                  <div
                    key={w.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={
                          w.avatarUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                        }
                        alt={w.fullName}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 truncate">
                          {w.fullName}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 font-mono">
                          <span>{w.employeeCode}</span>
                          <span>•</span>
                          <span>{w.position}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          w.contractType === 'CHÍNH THỨC'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {w.contractType}
                      </span>
                      <div className="text-[10px] text-emerald-700 font-mono font-bold mt-0.5">
                        {w.checkInTime} ({w.verificationMethod})
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SUB-VIEW 3: LỊCH SỬ BIẾN ĐỘNG */}
          {inspectorSubTab === 'logs' && (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 text-xs">
              {inspectedLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  Chưa có ghi nhận điều chuyển nhân sự nào trong ca làm việc này.
                </div>
              ) : (
                inspectedLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-400">
                        {log.timestamp}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        {log.status}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900">
                      Điều chuyển {log.workerCount} nhân sự ({log.position}) từ {log.fromLineCode} sang {log.toLineCode}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Lý do: {log.reason}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Phê duyệt: {log.authorizedBy}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* ============================================================ */}
      {/* 4. SUB-VIEWS RENDERING ACCORDING TO ACTIVE TAB                */}
      {/* ============================================================ */}
      {activeTab === 'lines_detail' && <LineDetailView />}
      {activeTab === 'attendance' && <LineAttendanceView />}
      {activeTab === 'allocation' && <LineAllocationView />}
      {activeTab === 'alerts' && <LineShortageAlertsView />}

      {/* ============================================================ */}
      {/* MODAL 1: WORKFORCE TRANSFER / REALLOCATION MODAL             */}
      {/* ============================================================ */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#082D55]">
                    Lệnh Điều Chuyển Bù Nhân Lực Theo Line
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cân bằng chuyền sản xuất và xử lý thiếu hụt vị trí cấp bách
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Chuyền nguồn (Từ):
                  </label>
                  <select
                    value={sourceTransferLine}
                    onChange={(e) => setSourceTransferLine(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-900"
                  >
                    <option value="Line 01">Line 01 (Dư/Đủ 100%)</option>
                    <option value="Line 04">Line 04 (Đủ 100%)</option>
                    <option value="Pool Dự phòng KHV">Pool Dự phòng Vendor KHV (Còn 15 người)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Chuyền đích (Đến):
                  </label>
                  <select
                    value={targetTransferLine}
                    onChange={(e) => setTargetTransferLine(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-blue-900"
                  >
                    <option value="Line 08">Line 08 (Thiếu 13 người - 74%)</option>
                    <option value="Line 03">Line 03 (Thiếu 8 người - 84%)</option>
                    <option value="Line 02">Line 02 (Thiếu 5 người - 90%)</option>
                    <option value="Line 05">Line 05 (Thiếu 3 người - 94%)</option>
                    <option value="Line 06">Line 06 (Thiếu 5 người - 91.7%)</option>
                    <option value="Line 07">Line 07 (Thiếu 4 người - 92%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Vị trí điều chuyển:
                  </label>
                  <select
                    value={transferPosition}
                    onChange={(e) => setTransferPosition(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                  >
                    <option value="Công nhân sản xuất">Công nhân sản xuất</option>
                    <option value="QC / IPQC">QC / IPQC</option>
                    <option value="Hỗ trợ chuyền">Hỗ trợ chuyền</option>
                    <option value="Sửa chữa (Repair)">Sửa chữa (Repair)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số lượng nhân sự (Người):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={transferCount}
                    onChange={(e) => setTransferCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lý do điều chuyển:
                </label>
                <textarea
                  rows={2}
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="p-3 bg-blue-50 text-blue-900 rounded-xl text-[11px] leading-relaxed">
                <strong>💡 Quy tắc nghiệp vụ OOS:</strong> Mọi lệnh điều chuyển được ghi nhật ký bất biến (Audit Trail) và đồng bộ ngay lập tức tới máy tính bảng của Trưởng chuyền hai bên.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTransferModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmTransfer}
                className="px-5 py-2 bg-[#1688E8] hover:bg-blue-600 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                Xác nhận điều chuyển
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: LINE LEADER MOBILE CONFIRMATION COMPONENT           */}
      {/* ============================================================ */}
      <LineLeaderMobileModal
        isOpen={leaderMobileModalOpen}
        onClose={() => setLeaderMobileModalOpen(false)}
        currentUser={currentUser}
        initialLineCode="Line 03"
        onSuccess={(msg) => {
          setLeaderMobileModalOpen(false);
          setSummaries(getStoredLineSummaries());
          setAlerts(getStoredShortageAlerts());
        }}
      />

      {/* ============================================================ */}
      {/* MODAL 3: IOT & ATTENDANCE DEVICE ARCHITECTURE MODAL          */}
      {/* ============================================================ */}
      {deviceArchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#082D55]">
                    Kiến Trúc Tích Hợp Thiết Bị Điểm Danh & RFID (IoT Layer)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sơ đồ kết nối phần cứng từ Cổng RFID, Camera FaceID tới OOS Line Filling Control
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeviceArchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Architecture Schematic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Level 1: Edge Hardware */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-extrabold text-blue-900 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  1. Edge Hardware (Xưởng)
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <div className="p-2 bg-white rounded-lg border font-mono">
                    GATE-RFID-01 (Cửa Tây)
                  </div>
                  <div className="p-2 bg-white rounded-lg border font-mono">
                    GATE-RFID-02 (Cửa Đông)
                  </div>
                  <div className="p-2 bg-white rounded-lg border font-mono">
                    FACE-CAM-01 (Chuyền SMT)
                  </div>
                  <div className="p-2 bg-white rounded-lg border font-mono">
                    TERMINAL-MOBILE (Tablet)
                  </div>
                </div>
              </div>

              {/* Level 2: Edge Gateway */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                <div className="font-extrabold text-blue-900 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  2. OOS Edge Gateway
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700">
                  <div className="p-2 bg-white rounded-lg border">
                    Bộ đệm Local Buffer (Zero Data Loss)
                  </div>
                  <div className="p-2 bg-white rounded-lg border">
                    Xác thực mã vạch & Anti-Passback
                  </div>
                  <div className="p-2 bg-white rounded-lg border">
                    MQTT / WebSocket Real-time Stream
                  </div>
                </div>
              </div>

              {/* Level 3: OOS Cloud Central */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  3. OOS Control Tower
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-700">
                  <div className="p-2 bg-white rounded-lg border">
                    Tính toán Tỷ lệ điền đầy tự động
                  </div>
                  <div className="p-2 bg-white rounded-lg border">
                    Cảnh báo thiếu hụt theo vị trí
                  </div>
                  <div className="p-2 bg-white rounded-lg border">
                    Điều chuyển nhân sự & Đối soát SOP
                  </div>
                </div>
              </div>
            </div>

            {/* Registered Devices Table */}
            <div>
              <h4 className="font-bold text-xs text-[#082D55] mb-2">
                Danh sách thiết bị kết nối trực tuyến ({devices.length} thiết bị):
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold text-[10px] uppercase border-b">
                    <tr>
                      <th className="py-2 px-3">Mã thiết bị</th>
                      <th className="py-2 px-3">Tên thiết bị</th>
                      <th className="py-2 px-3">Loại</th>
                      <th className="py-2 px-3">IP</th>
                      <th className="py-2 px-3 text-center">Trạng thái</th>
                      <th className="py-2 px-3 text-right">Lượt quét</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                    {devices.map((d) => (
                      <tr key={d.deviceCode} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-blue-900">{d.deviceCode}</td>
                        <td className="py-2 px-3">{d.name}</td>
                        <td className="py-2 px-3 text-slate-500">{d.type}</td>
                        <td className="py-2 px-3 font-mono text-slate-500">{d.ipAddress}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {d.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold">{d.totalReadsToday}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeviceArchModalOpen(false)}
                className="px-5 py-2 bg-[#082D55] hover:bg-blue-900 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// OOS NEW MODEL PRO — Gantt Chart Dashboard
// Trung tâm của phân hệ — Bám sát hình ảnh tham chiếu UI/UX 100%
// Plan vs Actual, 3 Tasks chính (Mua hàng, Nhận hàng, Setup), Chi tiết Line & Donut Chart

import React, { useState, useMemo } from 'react';
import {
  NewModelProjectPro,
  ProjectLinePro,
  EquipmentItemPro,
  NewModelSubTab,
  NewModelWorkflowStep,
} from '../../types/newModelPro';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Info,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Box,
  Wrench,
  Calendar,
  Building2,
  FileText,
  Bell,
  HelpCircle,
  User,
  ExternalLink,
  Plus,
  Play,
  RotateCcw,
} from 'lucide-react';

interface NewModelGanttDashboardProps {
  project: NewModelProjectPro;
  currentUser: { name: string; role: string };
  onSelectSubTab: (tab: NewModelSubTab) => void;
  onOpenItemInspection: (item: EquipmentItemPro, lineCode: string) => void;
  onOpenCreateProject?: () => void;
  onResetSampleData?: () => void;
}

export const NewModelGanttDashboard: React.FC<NewModelGanttDashboardProps> = ({
  project,
  currentUser,
  onSelectSubTab,
  onOpenItemInspection,
  onOpenCreateProject,
  onResetSampleData,
}) => {
  // Selected filter states
  const [selectedFactory, setSelectedFactory] = useState<string>('SEV');
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');
  const [selectedVendor, setSelectedVendor] = useState<string>('ALL');
  const [selectedLineId, setSelectedLineId] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'both' | 'plan_only' | 'actual_only'>('both');

  // Focused line for bottom detail panel (defaults to CNC ON1 B1 DAAL L1)
  const [focusedLineId, setFocusedLineId] = useState<string>(
    'LINE-ON1-B1-DAAL-L1'
  );

  // Bottom panel active tab
  const [bottomTab, setBottomTab] = useState<'stages' | 'items'>('stages');

  // Collapsed blocks in tree
  const [collapsedBlocks, setCollapsedBlocks] = useState<Record<string, boolean>>({});

  const toggleBlockCollapse = (blockId: string) => {
    setCollapsedBlocks((prev) => ({ ...prev, [blockId]: !prev[blockId] }));
  };

  // Find the focused line
  const focusedLine = useMemo(() => {
    for (const fScope of project.factoriesScope) {
      for (const block of fScope.blocks) {
        const found = block.lines.find((l) => l.id === focusedLineId);
        if (found) return found;
      }
    }
    return project.factoriesScope[0]?.blocks[0]?.lines[0] || null;
  }, [project, focusedLineId]);

  // Gantt Weeks Definition (W44 to W50)
  const weeks = [
    { weekNum: 44, label: 'W44', dateRange: '26/10 – 01/11' },
    { weekNum: 45, label: 'W45', dateRange: '02/11 – 08/11' },
    { weekNum: 46, label: 'W46', dateRange: '09/11 – 15/11', isCurrent: true },
    { weekNum: 47, label: 'W47', dateRange: '16/11 – 22/11' },
    { weekNum: 48, label: 'W48', dateRange: '23/11 – 29/11' },
    { weekNum: 49, label: 'W49', dateRange: '30/11 – 06/12' },
    { weekNum: 50, label: 'W50', dateRange: '07/12 – 13/12' },
  ];

  // Helper to calculate column positioning on timeline (W44 - W50 = 7 columns)
  // Each week is ~14.28% width
  const getWeekColPos = (startW: number, endW: number) => {
    const minW = 44;
    const totalW = 7;
    const clampedStart = Math.max(minW, Math.min(50, startW));
    const clampedEnd = Math.max(clampedStart, Math.min(50, endW));
    const leftPct = ((clampedStart - minW) / totalW) * 100;
    const widthPct = (((clampedEnd - clampedStart + 1) / totalW) * 100);
    return { leftPct, widthPct };
  };

  return (
    <div className="bg-[#F2F6FA] min-h-screen text-slate-800 space-y-3.5 pb-10">
      {/* ======================================================== */}
      {/* 1. TOP HEADER (PROJECT INFO & METADATA)                  */}
      {/* ======================================================== */}
      <div className="bg-white px-5 py-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Project Title & Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <h1 className="text-xl font-black text-[#082D55] tracking-tight">
            Dự án: {project.projectCode}
          </h1>
          <span className="text-slate-300">|</span>

          <span className="text-slate-600 font-semibold">
            Process: <strong className="text-[#082D55]">{project.process}</strong>
          </span>
          <span className="text-slate-300">|</span>

          <span className="text-slate-600 font-semibold">
            Nhà máy:{' '}
            <strong className="text-[#082D55]">{project.factories.join(', ')}</strong>
          </span>
          <span className="text-slate-300">|</span>

          <span className="text-slate-600 font-semibold">
            Thời gian:{' '}
            <strong className="text-[#082D55]">{project.timeframeLabel}</strong>
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[11px] shadow-2xs">
            <Play className="w-2.5 h-2.5 fill-current" />
            {project.status}
          </span>
        </div>

        {/* Right: Notification & User Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Declarations & Master Admin shortcuts */}
          <button
            type="button"
            onClick={() => onSelectSubTab('project-declaration')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#0878E8] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Khai báo dự án (+)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSubTab('master-admin')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
            title="Quản lý danh mục Process & Sub Process / Block"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Master Admin</span>
          </button>

          {onResetSampleData && (
            <button
              type="button"
              onClick={onResetSampleData}
              title="Khôi phục dữ liệu mẫu gốc"
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
              title="Thông báo"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                2
              </span>
            </button>
          </div>

          <button
            type="button"
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Trợ giúp & Hướng dẫn"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-700">{currentUser.role || 'Planner'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. WORKFLOW STEPPER (8-STEP PIPELINE)                    */}
      {/* ======================================================== */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-2xs overflow-x-auto">
        <div className="flex items-center justify-between gap-1.5 min-w-[950px]">
          {/* Step 1: Tạo dự án */}
          <button
            type="button"
            onClick={() => onSelectSubTab('project-declaration')}
            className="flex-1 bg-sky-50/70 border border-sky-200/80 rounded-lg p-2 text-center hover:bg-sky-100/90 hover:border-blue-400 transition-all cursor-pointer"
            title="Nhấp để mở Wizard Khai báo dự án mới"
          >
            <FileText className="w-4 h-4 text-sky-600 mx-auto mb-1" />
            <div className="font-bold text-[11px] text-[#082D55] leading-tight flex items-center justify-center gap-1">
              <span>Tạo dự án</span>
              <Plus className="w-2.5 h-2.5 text-blue-600" />
            </div>
            <div className="text-[10px] text-slate-500">(Planner)</div>
          </button>
          <span className="text-slate-400 font-bold text-sm shrink-0">→</span>

          {/* Step 2: Nhà máy */}
          <button
            type="button"
            onClick={() => onSelectSubTab('project-declaration')}
            className="flex-1 bg-sky-50/70 border border-sky-200/80 rounded-lg p-2 text-center hover:bg-sky-100/90 transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-sky-600 mx-auto mb-1" />
            <div className="font-bold text-[11px] text-[#082D55] leading-tight">Nhà máy</div>
            <div className="text-[10px] text-slate-500">(Planner)</div>
          </button>
          <span className="text-slate-400 font-bold text-sm shrink-0">→</span>


          {/* Step 3: Line & Vendor */}
          <div className="flex-1 bg-sky-50/70 border border-sky-200/80 rounded-lg p-2 text-center hover:bg-sky-100/70 transition-colors">
            <Layers className="w-4 h-4 text-sky-600 mx-auto mb-1" />
            <div className="font-bold text-[11px] text-[#082D55] leading-tight">Line & Vendor</div>
            <div className="text-[10px] text-slate-500">(Planner)</div>
          </div>
          <span className="text-slate-400 font-bold text-sm shrink-0">→</span>

          {/* Step 4: Kế hoạch mua hàng (ACTIVE) */}
          <div className="flex-1 bg-blue-50 border-2 border-blue-500 rounded-lg p-2 text-center shadow-xs ring-2 ring-blue-200/60">
            <Calendar className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <div className="font-extrabold text-[11px] text-[#082D55] leading-tight">
              Kế hoạch mua hàng
            </div>
            <div className="text-[10px] text-blue-700 font-semibold">(Planner đặt)</div>
          </div>
          <span className="text-slate-400 font-bold text-sm shrink-0">→</span>

          {/* Step 5: Mua hàng */}
          <div className="flex-1 bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-2 text-center hover:bg-emerald-100/70 transition-colors">
            <ShoppingCart className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <div className="font-bold text-[11px] text-emerald-900 leading-tight">Mua hàng</div>
            <div className="text-[10px] text-slate-500">(Purchaser)</div>
          </div>
          <span className="text-slate-400 font-bold text-sm shrink-0">→</span>

          {/* Step 6: Nhận hàng */}
          <div className="flex-1 bg-cyan-50/70 border border-cyan-200/80 rounded-lg p-2 text-center hover:bg-cyan-100/70 transition-colors">
            <Box className="w-4 h-4 text-cyan-700 mx-auto mb-1" />
            <div className="font-bold text-[11px] text-cyan-900 leading-tight">Nhận hàng</div>
            <div className="text-[10px] text-slate-500">(EQM)</div>
          </div>
          <span className="text-slate-400 font-bold text-sm shrink-0">→</span>

          {/* Step 7: Setup */}
          <div className="flex-1 bg-amber-50/70 border border-amber-200/80 rounded-lg p-2 text-center hover:bg-amber-100/70 transition-colors">
            <Wrench className="w-4 h-4 text-amber-600 mx-auto mb-1" />
            <div className="font-bold text-[11px] text-amber-900 leading-tight">Setup</div>
            <div className="text-[10px] text-slate-500">(EQM)</div>
          </div>
          <span className="text-slate-400 font-bold text-sm shrink-0">→</span>

          {/* Step 8: Hoàn tất Line */}
          <div className="flex-1 bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <div className="font-extrabold text-[11px] text-emerald-800 leading-tight">
              Hoàn tất Line
            </div>
            <div className="text-[9px] text-emerald-700 font-medium">Sẵn sàng sản xuất</div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. SUB-NAV PILLS / TABS                                  */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold select-none">
        <button
          type="button"
          onClick={() => onSelectSubTab('line-schedule')}
          className="px-4 py-2 rounded-lg bg-[#0878E8] text-white shadow-xs cursor-pointer"
        >
          Kế hoạch Line
        </button>

        <button
          type="button"
          onClick={() => onSelectSubTab('equipment-list')}
          className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Danh sách thiết bị
        </button>

        <button
          type="button"
          onClick={() => onSelectSubTab('purchase-plan')}
          className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Kế hoạch mua hàng
        </button>

        <button
          type="button"
          onClick={() => onSelectSubTab('purchase-progress')}
          className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Tiến độ mua hàng
        </button>

        <button
          type="button"
          onClick={() => onSelectSubTab('issues')}
          className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer inline-flex items-center gap-2"
        >
          <span>Cảnh báo</span>
          <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
            {project.issues.length}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 4. TOP 5 KPI CARDS                                       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Tổng Line */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100/80 text-sky-700 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Tổng Line</div>
            <div className="text-2xl font-black text-[#082D55] leading-none mt-0.5">
              {project.totalLines}
            </div>
          </div>
        </div>

        {/* Card 2: Đúng tiến độ */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Đúng tiến độ</div>
            <div className="text-2xl font-black text-emerald-600 leading-none mt-0.5">
              {project.onTrackLines}{' '}
              <span className="text-xs font-bold text-slate-500">
                ({Math.round((project.onTrackLines / project.totalLines) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Nguy cơ trễ */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Nguy cơ trễ</div>
            <div className="text-2xl font-black text-amber-600 leading-none mt-0.5">
              {project.atRiskLines}{' '}
              <span className="text-xs font-bold text-slate-500">
                ({Math.round((project.atRiskLines / project.totalLines) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Trễ kế hoạch */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100/80 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Trễ kế hoạch</div>
            <div className="text-2xl font-black text-rose-600 leading-none mt-0.5">
              {project.delayedLines}{' '}
              <span className="text-xs font-bold text-slate-500">
                ({Math.round((project.delayedLines / project.totalLines) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Card 5: Tiến độ dự án */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs col-span-2 md:col-span-1 flex flex-col justify-center">
          <div className="text-[11px] font-semibold text-slate-500">Tiến độ dự án</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xl font-black text-[#082D55] leading-none">
              {project.projectProgressPct}%
            </span>
            <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${project.projectProgressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. FILTER BAR & VIEW MODE                                */}
      {/* ======================================================== */}
      <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <label className="font-semibold text-slate-600">Nhà máy</label>
            <select
              value={selectedFactory}
              onChange={(e) => setSelectedFactory(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="SEV">SEV</option>
              <option value="SV1">SV1</option>
              <option value="ALL">Tất cả nhà máy</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="font-semibold text-slate-600">Block</label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả</option>
              <option value="BLOCK-01">Block 1</option>
              <option value="BLOCK-02">Block 2</option>
              <option value="BLOCK-03">Block 3</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="font-semibold text-slate-600">Vendor</label>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả</option>
              <option value="DAAL">DAAL</option>
              <option value="KHV">KHV</option>
              <option value="HSTEC">HSTEC</option>
              <option value="KTECH">KTECH</option>
              <option value="DREAM TECH">DREAM TECH</option>
              <option value="HOJEONGB">HOJEONGB</option>
              <option value="HOJEONG VINA">HOJEONG VINA</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="font-semibold text-slate-600">Line</label>
            <select
              value={selectedLineId}
              onChange={(e) => setSelectedLineId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả</option>
              <option value="LINE-ON1-B1-DAAL-L1">CNC ON1 B1 DAAL L1</option>
              <option value="LINE-ON1-B1-DAAL-L2">CNC ON1 B1 DAAL L2</option>
              <option value="LINE-ON1-B1-KHV-L1">CNC ON1 B1 KHV L1</option>
            </select>
          </div>
        </div>

        {/* Radio view mode: Kế hoạch & Thực tế */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-600">Chế độ hiển thị:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="viewMode"
              checked={viewMode === 'both'}
              onChange={() => setViewMode('both')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="font-bold text-blue-700">Kế hoạch & Thực tế</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="viewMode"
              checked={viewMode === 'plan_only'}
              onChange={() => setViewMode('plan_only')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-600">Chỉ Kế hoạch</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="viewMode"
              checked={viewMode === 'actual_only'}
              onChange={() => setViewMode('actual_only')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-600">Chỉ Thực tế</span>
          </label>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. GANTT CHART (THE CENTERPIECE) + LEGEND                */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5">
        {/* Gantt Main Board (9 cols on XL) */}
        <div className="xl:col-span-9 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          {/* Timeline Table Container */}
          <div className="overflow-x-auto min-w-[750px]">
            {/* Header: Left column + 7 week columns */}
            <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/90 text-xs font-bold text-slate-700">
              {/* Left Column Headers */}
              <div className="col-span-4 px-3.5 py-2.5 flex items-center justify-between border-r border-slate-200">
                <span>Line / Vendor</span>
                <span className="text-slate-500 font-semibold">Trạng thái Line</span>
              </div>

              {/* 7 Weeks Timeline Header */}
              <div className="col-span-8 grid grid-cols-7 text-center relative">
                {weeks.map((w) => (
                  <div
                    key={w.weekNum}
                    className={`py-2 px-1 border-r border-slate-200 last:border-r-0 relative ${
                      w.isCurrent ? 'bg-rose-50/60' : ''
                    }`}
                  >
                    {w.isCurrent && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-rose-600 text-white font-extrabold text-[9px] shadow-xs uppercase tracking-wider">
                        Tuần hiện tại ({w.label})
                      </span>
                    )}
                    <div
                      className={`font-black text-xs ${
                        w.isCurrent ? 'text-rose-600' : 'text-[#082D55]'
                      }`}
                    >
                      {w.label}
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                      ({w.dateRange})
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Rows Hierarchy */}
            <div className="divide-y divide-slate-100 relative">
              {/* Vertical Red Dashed Line marking Current Week (W46) */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-10 border-r-2 border-dashed border-rose-500"
                style={{
                  left: 'calc(33.333% + (66.666% * (2.5 / 7)))',
                }}
              />

              {project.factoriesScope.map((fScope) => {
                if (selectedFactory !== 'ALL' && fScope.factory !== selectedFactory) return null;

                const totalFactoryLines = fScope.blocks.reduce(
                  (acc, b) => acc + b.lines.length,
                  0
                );

                return (
                  <div key={fScope.factory} className="divide-y divide-slate-100">
                    {/* Factory Header Row */}
                    <div className="grid grid-cols-12 bg-slate-100/70 text-xs font-bold px-3 py-1.5 text-slate-700">
                      <div className="col-span-12 flex items-center gap-2">
                        <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          {fScope.factory} ({totalFactoryLines} Lines)
                        </span>
                      </div>
                    </div>

                    {/* Blocks within Factory */}
                    {fScope.blocks.map((block) => {
                      if (selectedBlock !== 'ALL' && block.id !== selectedBlock) return null;
                      const isCollapsed = collapsedBlocks[block.id];

                      return (
                        <div key={block.id}>
                          {/* Block Header Row */}
                          <div
                            onClick={() => toggleBlockCollapse(block.id)}
                            className="grid grid-cols-12 bg-slate-50/50 hover:bg-slate-100/50 px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer border-t border-slate-100 transition-colors"
                          >
                            <div className="col-span-12 flex items-center gap-2 pl-4">
                              {isCollapsed ? (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              <Layers className="w-3.5 h-3.5 text-blue-500" />
                              <span className="text-[#082D55]">
                                {block.name} ({block.lines.length} Lines)
                              </span>
                            </div>
                          </div>

                          {/* Line Rows */}
                          {!isCollapsed &&
                            block.lines.map((line) => {
                              if (selectedVendor !== 'ALL' && line.vendor !== selectedVendor)
                                return null;
                              if (selectedLineId !== 'ALL' && line.id !== selectedLineId)
                                return null;

                              const isFocused = line.id === focusedLineId;

                              return (
                                <div
                                  key={line.id}
                                  onClick={() => setFocusedLineId(line.id)}
                                  className={`grid grid-cols-12 text-xs items-center cursor-pointer transition-colors ${
                                    isFocused
                                      ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-300'
                                      : 'hover:bg-slate-50/80'
                                  }`}
                                >
                                  {/* Left: Line Code, Vendor, and Status */}
                                  <div className="col-span-4 px-3 py-2.5 flex items-center justify-between border-r border-slate-200 pl-8">
                                    <div className="flex items-center gap-2 truncate">
                                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                      <span className="font-bold text-[#082D55] truncate">
                                        {line.code}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                                        {line.vendor}
                                      </span>
                                    </div>

                                    {/* Line Status Badge */}
                                    <div className="shrink-0 pl-2">
                                      {line.status === 'Đúng tiến độ' && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                          Đúng tiến độ
                                        </span>
                                      )}
                                      {line.status === 'Nguy cơ trễ' && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                                          Nguy cơ trễ
                                        </span>
                                      )}
                                      {line.status === 'Chờ mua hàng' && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                          <Clock className="w-3 h-3 text-blue-600" />
                                          Chờ mua hàng
                                        </span>
                                      )}
                                      {line.status === 'Hoàn tất' && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                          ✔ Hoàn tất
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right: Gantt Bars (7 Weeks Column Grid) */}
                                  <div className="col-span-8 h-12 relative px-1 flex items-center">
                                    {/* Background Grid Lines for 7 Weeks */}
                                    <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
                                      {weeks.map((w) => (
                                        <div
                                          key={w.weekNum}
                                          className={`border-r border-slate-100 last:border-r-0 ${
                                            w.isCurrent ? 'bg-rose-50/20' : ''
                                          }`}
                                        />
                                      ))}
                                    </div>

                                    {/* Gantt Bar Series for this line */}
                                    <div className="w-full relative h-6 flex items-center">
                                      {/* 1. Mua hàng (Green) */}
                                      {line.purchaseStage.planStartWeek && (
                                        (() => {
                                          const pos = getWeekColPos(
                                            line.purchaseStage.planStartWeek,
                                            line.purchaseStage.planEndWeek
                                          );
                                          const isPendingNotStarted =
                                            line.purchaseStage.actualProgressPct === 0 &&
                                            line.purchaseStage.status === 'Chưa bắt đầu';

                                          return (
                                            <div
                                              style={{
                                                left: `${pos.leftPct}%`,
                                                width: `${pos.widthPct}%`,
                                              }}
                                              title={`Mua hàng: Kế hoạch ${line.purchaseStage.planLabel}, Thực tế ${line.purchaseStage.actualProgressPct}%`}
                                              className={`absolute top-0 bottom-0 rounded-l-md overflow-hidden flex items-center justify-center text-[10px] font-black z-2 ${
                                                isPendingNotStarted
                                                  ? 'border-2 border-dashed border-emerald-500 bg-transparent'
                                                  : 'bg-emerald-200/70 border border-emerald-300'
                                              }`}
                                            >
                                              {/* Actual Progress Filled Bar */}
                                              {line.purchaseStage.actualProgressPct > 0 && (
                                                <div
                                                  className="absolute left-0 top-0 bottom-0 bg-emerald-600 text-white flex items-center justify-center font-bold"
                                                  style={{
                                                    width: `${line.purchaseStage.actualProgressPct}%`,
                                                  }}
                                                >
                                                  {line.purchaseStage.actualProgressPct >= 30 && (
                                                    <span>{line.purchaseStage.actualProgressPct}%</span>
                                                  )}
                                                </div>
                                              )}
                                              {line.purchaseStage.actualProgressPct < 30 &&
                                                line.purchaseStage.actualProgressPct > 0 && (
                                                  <span className="relative z-3 text-emerald-900 font-extrabold pl-1">
                                                    {line.purchaseStage.actualProgressPct}%
                                                  </span>
                                                )}
                                            </div>
                                          );
                                        })()
                                      )}

                                      {/* 2. Nhận hàng (Blue) */}
                                      {line.receivingStage.planStartWeek && (
                                        (() => {
                                          const pos = getWeekColPos(
                                            line.receivingStage.planStartWeek,
                                            line.receivingStage.planEndWeek +
                                              (line.receivingStage.overdueWeeks || 0)
                                          );
                                          const isPendingNotStarted =
                                            line.receivingStage.actualProgressPct === 0 &&
                                            line.receivingStage.status === 'Chưa bắt đầu';

                                          return (
                                            <div
                                              style={{
                                                left: `${pos.leftPct}%`,
                                                width: `${pos.widthPct}%`,
                                              }}
                                              title={`Nhận hàng: Kế hoạch ${line.receivingStage.planLabel}, Thực tế ${line.receivingStage.actualProgressPct}%`}
                                              className={`absolute top-0 bottom-0 overflow-hidden flex items-center justify-center text-[10px] font-black z-2 ${
                                                line.receivingStage.isOverdue
                                                  ? 'border-2 border-rose-500'
                                                  : isPendingNotStarted
                                                  ? 'border-2 border-dashed border-blue-500 bg-transparent'
                                                  : 'bg-blue-200/70 border border-blue-300'
                                              }`}
                                            >
                                              {/* Actual Progress Filled Bar */}
                                              {line.receivingStage.actualProgressPct > 0 && (
                                                <div
                                                  className="absolute left-0 top-0 bottom-0 bg-[#0878E8] text-white flex items-center justify-center font-bold"
                                                  style={{
                                                    width: `${line.receivingStage.actualProgressPct}%`,
                                                  }}
                                                >
                                                  {line.receivingStage.actualProgressPct >= 25 && (
                                                    <span>{line.receivingStage.actualProgressPct}%</span>
                                                  )}
                                                </div>
                                              )}

                                              {/* Overdue Hatched Region with Red Warning Icon */}
                                              {line.receivingStage.isOverdue && (
                                                <div
                                                  className="absolute right-0 top-0 bottom-0 flex items-center justify-center px-2"
                                                  style={{
                                                    width: '55%',
                                                    background:
                                                      'repeating-linear-gradient(45deg, #ef4444, #ef4444 6px, #fee2e2 6px, #fee2e2 12px)',
                                                  }}
                                                >
                                                  <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                                                    !
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })()
                                      )}

                                      {/* 3. Setup (Orange) */}
                                      {line.setupStage.planStartWeek && (
                                        (() => {
                                          const pos = getWeekColPos(
                                            line.setupStage.planStartWeek,
                                            line.setupStage.planEndWeek
                                          );
                                          const isPendingNotStarted =
                                            line.setupStage.actualProgressPct === 0 &&
                                            line.setupStage.status === 'Chưa bắt đầu';

                                          return (
                                            <div
                                              style={{
                                                left: `${pos.leftPct}%`,
                                                width: `${pos.widthPct}%`,
                                              }}
                                              title={`Setup: Kế hoạch ${line.setupStage.planLabel}, Thực tế ${line.setupStage.actualProgressPct}%`}
                                              className={`absolute top-0 bottom-0 rounded-r-md overflow-hidden flex items-center justify-center text-[10px] font-black z-2 ${
                                                isPendingNotStarted
                                                  ? 'border-2 border-dashed border-amber-500 bg-transparent'
                                                  : 'bg-amber-200/70 border border-amber-300'
                                              }`}
                                            >
                                              {/* Actual Progress Filled Bar */}
                                              {line.setupStage.actualProgressPct > 0 ? (
                                                <div
                                                  className="absolute left-0 top-0 bottom-0 bg-amber-500 text-white flex items-center justify-center font-bold"
                                                  style={{
                                                    width: `${line.setupStage.actualProgressPct}%`,
                                                  }}
                                                >
                                                  <span>{line.setupStage.actualProgressPct}%</span>
                                                </div>
                                              ) : (
                                                <span className="text-amber-900 font-bold">0%</span>
                                              )}
                                            </div>
                                          );
                                        })()
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend Box (3 cols on XL matching screenshot) */}
        <div className="xl:col-span-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-4 text-xs">
          {/* Chú giải biểu đồ */}
          <div className="space-y-2.5 pb-4 border-b border-slate-200">
            <h4 className="font-extrabold text-[#082D55] text-xs flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Chú giải biểu đồ</span>
            </h4>

            <div className="space-y-2 pl-1">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded bg-emerald-500 shrink-0" />
                <span className="font-semibold text-slate-700">
                  Mua hàng <span className="text-slate-400 font-normal">(Plan / Actual)</span>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded bg-[#0878E8] shrink-0" />
                <span className="font-semibold text-slate-700">
                  Nhận hàng <span className="text-slate-400 font-normal">(Plan / Actual)</span>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded bg-amber-500 shrink-0" />
                <span className="font-semibold text-slate-700">
                  Setup <span className="text-slate-400 font-normal">(Plan / Actual)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Ý nghĩa thanh tiến độ */}
          <div className="space-y-2.5">
            <h4 className="font-extrabold text-[#082D55] text-xs">Ý nghĩa thanh tiến độ</h4>

            <div className="space-y-2 pl-1">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-3 rounded bg-blue-200/80 border border-blue-300 shrink-0" />
                <span className="text-slate-600">= Kế hoạch (Plan)</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-3 rounded bg-emerald-600 shrink-0" />
                <span className="text-slate-600">= Thực tế (Actual)</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-3 rounded shrink-0 border border-rose-400"
                  style={{
                    background:
                      'repeating-linear-gradient(45deg, #ef4444, #ef4444 3px, #fee2e2 3px, #fee2e2 6px)',
                  }}
                />
                <span className="text-slate-600">= Phần trễ so với kế hoạch</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-3 rounded border-2 border-dashed border-slate-400 bg-transparent shrink-0" />
                <span className="text-slate-600">= Chưa bắt đầu</span>
              </div>
            </div>
          </div>

          {/* Quick Notice Box */}
          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200/70 text-[11px] text-blue-800 leading-relaxed">
            <p>
              <strong>Lưu ý:</strong> Click vào bất kỳ Line nào trên biểu đồ để xem chi tiết danh
              sách thiết bị và cập nhật tiến độ thực tế phía dưới.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 7. BOTTOM LINE DETAIL PANEL (MATCHING SCREENSHOT)        */}
      {/* ======================================================== */}
      {focusedLine && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Left Sub-card: Machine Photo & Line Metadata (3 cols on LG) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-sm text-[#082D55] truncate">
              Chi tiết Line: {focusedLine.code}
            </h3>

            <div className="flex gap-3.5">
              {/* Machine Photo */}
              <div className="w-28 h-28 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-2xs">
                <img
                  src={
                    focusedLine.machineImageUrl ||
                    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={focusedLine.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Metadata Key-Values */}
              <div className="flex-1 space-y-1.5 text-xs">
                <div className="flex">
                  <span className="text-slate-500 w-16 shrink-0">Nhà máy</span>
                  <span className="font-semibold text-slate-800">: {focusedLine.factory}</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 w-16 shrink-0">Block</span>
                  <span className="font-semibold text-slate-800">: {focusedLine.blockName}</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 w-16 shrink-0">Vendor</span>
                  <span className="font-semibold text-slate-800">: {focusedLine.vendor}</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500 w-16 shrink-0">Line</span>
                  <span className="font-bold text-[#082D55] truncate">: {focusedLine.code}</span>
                </div>
                <div className="flex items-center pt-0.5">
                  <span className="text-slate-500 w-16 shrink-0">Trạng thái</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-800">:</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {focusedLine.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Sub-card: Stages Progress or Equipment List (5 cols on LG) */}
          <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setBottomTab('stages')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  bottomTab === 'stages'
                    ? 'bg-[#0878E8] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tiến độ theo giai đoạn
              </button>

              <button
                type="button"
                onClick={() => setBottomTab('items')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  bottomTab === 'items'
                    ? 'bg-[#0878E8] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Danh sách thiết bị ({focusedLine.equipmentItems.length})
              </button>
            </div>

            {/* Content: Stage Table */}
            {bottomTab === 'stages' && (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                      <th className="py-1.5 font-bold">Giai đoạn</th>
                      <th className="py-1.5 font-bold">Kế hoạch (Plan)</th>
                      <th className="py-1.5 font-bold">Thực tế (Actual)</th>
                      <th className="py-1.5 font-bold">Tiến độ</th>
                      <th className="py-1.5 font-bold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {/* Mua hàng */}
                    <tr>
                      <td className="py-2.5 font-bold flex items-center gap-1.5 text-slate-800">
                        <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Mua hàng</span>
                      </td>
                      <td className="py-2.5 text-slate-600">{focusedLine.purchaseStage.planLabel}</td>
                      <td className="py-2.5 font-semibold text-slate-800">
                        {focusedLine.purchaseStage.actualLabel}
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${focusedLine.purchaseStage.actualProgressPct}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-700">
                            {focusedLine.purchaseStage.actualProgressPct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3 text-amber-600" />
                          {focusedLine.purchaseStage.status}
                        </span>
                      </td>
                    </tr>

                    {/* Nhận hàng */}
                    <tr>
                      <td className="py-2.5 font-bold flex items-center gap-1.5 text-slate-800">
                        <Box className="w-3.5 h-3.5 text-blue-600" />
                        <span>Nhận hàng</span>
                      </td>
                      <td className="py-2.5 text-slate-600">{focusedLine.receivingStage.planLabel}</td>
                      <td className="py-2.5 font-semibold text-slate-800">
                        {focusedLine.receivingStage.actualLabel}
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div
                              className="bg-[#0878E8] h-full rounded-full"
                              style={{ width: `${focusedLine.receivingStage.actualProgressPct}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-700">
                            {focusedLine.receivingStage.actualProgressPct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3 text-amber-600" />
                          {focusedLine.receivingStage.status}
                        </span>
                      </td>
                    </tr>

                    {/* Setup */}
                    <tr>
                      <td className="py-2.5 font-bold flex items-center gap-1.5 text-slate-800">
                        <Wrench className="w-3.5 h-3.5 text-amber-600" />
                        <span>Setup</span>
                      </td>
                      <td className="py-2.5 text-slate-600">{focusedLine.setupStage.planLabel}</td>
                      <td className="py-2.5 text-slate-500">{focusedLine.setupStage.actualLabel}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div
                              className="bg-amber-500 h-full rounded-full"
                              style={{ width: `${focusedLine.setupStage.actualProgressPct}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-500">
                            {focusedLine.setupStage.actualProgressPct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {focusedLine.setupStage.status}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Content: Equipment Items List */}
            {bottomTab === 'items' && (
              <div className="space-y-2 overflow-y-auto max-h-48 pr-1">
                {focusedLine.equipmentItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-blue-700">{item.code}</span>
                      <span className="text-slate-700 truncate">{item.name}</span>
                      <span className="text-[10px] text-slate-400">({item.category})</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === 'OK' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          ✔ OK
                        </span>
                      ) : item.status === 'Pending' ? (
                        <span
                          className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold cursor-pointer"
                          title={item.pendingReason}
                        >
                          ⚠ Pending
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px]">
                          Chưa kiểm tra
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenItemInspection(item, focusedLine.code)}
                        className="px-2 py-1 rounded bg-blue-600 text-white font-semibold text-[10px] hover:bg-blue-700 cursor-pointer"
                      >
                        Kiểm tra
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sub-card: Total Line Progress Donut Chart (3 cols on LG) */}
          <div className="lg:col-span-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
            <h3 className="font-extrabold text-sm text-[#082D55]">Tổng tiến độ Line</h3>

            <div className="flex items-center justify-around py-1">
              {/* Circular Progress Ring (Donut Chart) */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-slate-100"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress Arc */}
                  <path
                    className="text-emerald-500"
                    strokeDasharray={`${focusedLine.overallProgressPct}, 100`}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                {/* Center Percentage */}
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-[#082D55] leading-none">
                    {focusedLine.overallProgressPct}%
                  </span>
                </div>
              </div>

              {/* Progress Breakdown Legend */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-slate-600">Mua hàng:</span>
                  <strong className="text-slate-900 font-bold">
                    {focusedLine.purchaseStage.actualProgressPct}%
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <Box className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-slate-600">Nhận hàng:</span>
                  <strong className="text-slate-900 font-bold">
                    {focusedLine.receivingStage.actualProgressPct}%
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-slate-600">Setup:</span>
                  <strong className="text-slate-900 font-bold">
                    {focusedLine.setupStage.actualProgressPct}%
                  </strong>
                </div>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="bg-slate-50 p-2 rounded-lg text-center text-[11px] text-slate-500 font-semibold border border-slate-200">
              Kế hoạch bàn giao dự kiến: <strong>W47 (2026)</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

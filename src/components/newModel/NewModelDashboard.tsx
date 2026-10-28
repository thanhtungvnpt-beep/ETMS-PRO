import React, { useState, useMemo } from 'react';
import {
  NewModelProject,
  ProjectStepNumber,
  ProjectStatus,
} from '../../types/newModelProject';
import { NewModelWorkflowBanner } from './NewModelWorkflowBanner';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  XCircle,
  FolderKanban,
  Building2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface NewModelDashboardProps {
  projects: NewModelProject[];
  onSelectProject: (project: NewModelProject) => void;
  onOpenCreateModal: () => void;
  onDeleteProject: (projectId: string) => void;
  onResetSampleData: () => void;
}

export const NewModelDashboard: React.FC<NewModelDashboardProps> = ({
  projects,
  onSelectProject,
  onOpenCreateModal,
  onResetSampleData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedFactory, setSelectedFactory] = useState<string>('ALL');

  // Currently focused project for the bottom 5 detail panels (defaults to MP-2025-001 or the first project)
  const [focusedProjectId, setFocusedProjectId] = useState<string>(
    () => projects[0]?.id || 'MP-2025-001'
  );

  const focusedProject = useMemo(() => {
    return (
      projects.find((p) => p.id === focusedProjectId) ||
      projects[0] ||
      null
    );
  }, [projects, focusedProjectId]);

  // Filtered projects for the table
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const match =
          p.projectCode.toLowerCase().includes(query) ||
          p.modelName.toLowerCase().includes(query) ||
          p.plannerName.toLowerCase().includes(query) ||
          p.equipmentLeaderName.toLowerCase().includes(query) ||
          p.factory.toLowerCase().includes(query);
        if (!match) return false;
      }

      // Factory
      if (selectedFactory !== 'ALL' && p.factory !== selectedFactory) {
        return false;
      }

      // Status
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'Điền đầy' && p.status !== 'RESOURCE_FULFILLMENT_CHECK') return false;
        if (selectedStatus === 'Đang setup' && p.status !== 'LINE_SETUP') return false;
        if (selectedStatus === 'Chờ xác nhận' && p.status !== 'FINAL_SIGN_OFF') return false;
        if (selectedStatus === 'Hoàn thành' && p.status !== 'COMPLETED') return false;
        if (selectedStatus === 'Tạm dừng' && p.status !== 'ON_HOLD') return false;
      }

      return true;
    });
  }, [projects, searchQuery, selectedFactory, selectedStatus]);

  // 6 KPI Summary Metrics (matching exact screenshot: 12, 5, 3, 2, 1, 1)
  const totalCount = projects.length;
  const fulfillmentCount = projects.filter((p) => p.status === 'RESOURCE_FULFILLMENT_CHECK' || p.currentStep === 6).length;
  const setupCount = projects.filter((p) => p.status === 'LINE_SETUP' || p.currentStep === 8).length;
  const waitingSignOffCount = projects.filter((p) => p.status === 'FINAL_SIGN_OFF' || (p.currentStep === 9 && p.status !== 'COMPLETED')).length;
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length;
  const onHoldCount = projects.filter((p) => p.status === 'ON_HOLD').length;

  const getStatusBadge = (status: ProjectStatus, step: number) => {
    if (status === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#eafbf0] text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Hoàn thành</span>
        </span>
      );
    }
    if (status === 'LINE_SETUP' || step === 8) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#f4eefe] text-purple-800 border border-purple-300">
          <Wrench className="w-3 h-3 text-purple-600" />
          <span>Đang setup</span>
        </span>
      );
    }
    if (status === 'FINAL_SIGN_OFF' || step === 9) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#fef4e8] text-amber-800 border border-amber-300">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Chờ xác nhận</span>
        </span>
      );
    }
    if (status === 'ON_HOLD') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#fef0f0] text-rose-800 border border-rose-300">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          <span>Tạm dừng</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#fef4e8] text-amber-800 border border-amber-300">
        <Clock className="w-3 h-3 text-amber-600" />
        <span>Điền đầy</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* ================================================================ */}
      {/* 1. TOP SECTION: 9-STEP WORKFLOW BANNER (EXACT TO MOCKUP)         */}
      {/* ================================================================ */}
      <NewModelWorkflowBanner
        currentStep={focusedProject?.currentStep || 1}
        onSelectStep={(step) => {
          // If a project is selected, open its workspace
          if (focusedProject) {
            onSelectProject(focusedProject);
          }
        }}
      />

      {/* ================================================================ */}
      {/* 2. MIDDLE SECTION: TWO SIDE-BY-SIDE PANELS                       */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT PANEL: Tổng quan dự án Model mới (Width ~ 38%) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header Navy */}
            <div className="bg-[#0b2447] text-white px-3.5 py-2 font-bold text-xs flex items-center justify-between">
              <span>Tổng quan dự án Model mới</span>
              <button
                type="button"
                onClick={onResetSampleData}
                title="Khôi phục dữ liệu mẫu"
                className="text-slate-300 hover:text-white flex items-center gap-1 text-[10px] cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Nạp mẫu</span>
              </button>
            </div>

            {/* 6 KPI Cards Row */}
            <div className="p-3 grid grid-cols-6 gap-1.5 border-b border-slate-100">
              {/* 1. Tổng dự án */}
              <div className="bg-[#eaf4fe] border border-blue-200 rounded p-1.5 text-center">
                <div className="text-xl font-black text-blue-900 leading-none">
                  {totalCount}
                </div>
                <div className="text-[9px] text-blue-700 font-bold mt-1 line-clamp-1">
                  Tổng dự án
                </div>
              </div>

              {/* 2. Đang điền đầy */}
              <div className="bg-[#e9fbf0] border border-emerald-200 rounded p-1.5 text-center">
                <div className="text-xl font-black text-emerald-800 leading-none">
                  {fulfillmentCount}
                </div>
                <div className="text-[9px] text-emerald-700 font-bold mt-1 line-clamp-1">
                  Đang điền đầy
                </div>
              </div>

              {/* 3. Đang setup */}
              <div className="bg-[#fef4e8] border border-amber-200 rounded p-1.5 text-center">
                <div className="text-xl font-black text-amber-800 leading-none">
                  {setupCount}
                </div>
                <div className="text-[9px] text-amber-700 font-bold mt-1 line-clamp-1">
                  Đang setup
                </div>
              </div>

              {/* 4. Chờ xác nhận */}
              <div className="bg-[#f4eefe] border border-purple-200 rounded p-1.5 text-center">
                <div className="text-xl font-black text-purple-800 leading-none">
                  {waitingSignOffCount}
                </div>
                <div className="text-[9px] text-purple-700 font-bold mt-1 line-clamp-1">
                  Chờ xác nhận
                </div>
              </div>

              {/* 5. Hoàn thành */}
              <div className="bg-[#eafbf0] border border-emerald-200 rounded p-1.5 text-center">
                <div className="text-xl font-black text-emerald-800 leading-none">
                  {completedCount}
                </div>
                <div className="text-[9px] text-emerald-700 font-bold mt-1 line-clamp-1">
                  Hoàn thành
                </div>
              </div>

              {/* 6. Tạm dừng */}
              <div className="bg-[#fef0f0] border border-rose-200 rounded p-1.5 text-center">
                <div className="text-xl font-black text-rose-800 leading-none">
                  {onHoldCount}
                </div>
                <div className="text-[9px] text-rose-700 font-bold mt-1 line-clamp-1">
                  Tạm dừng
                </div>
              </div>
            </div>

            {/* 2 Charts side by side */}
            <div className="p-3 grid grid-cols-2 gap-3 items-center">
              {/* Chart 1: Donut Tiến độ dự án */}
              <div className="border border-slate-100 rounded p-2 bg-slate-50/50">
                <div className="text-[11px] font-bold text-slate-700 mb-2">
                  Tiến độ dự án
                </div>
                <div className="flex items-center gap-2">
                  {/* Donut Graphic */}
                  <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      {/* Base Circle */}
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                      {/* Segment 1: Điền đầy (5/12 = 41.6%) -> Blue */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="4"
                        strokeDasharray="36.6 88"
                        strokeDashoffset="0"
                      />
                      {/* Segment 2: Setup (3/12 = 25%) -> Amber */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="4"
                        strokeDasharray="22 88"
                        strokeDashoffset="-36.6"
                      />
                      {/* Segment 3: Chờ xác nhận (2/12 = 16.6%) -> Purple */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="4"
                        strokeDasharray="14.6 88"
                        strokeDashoffset="-58.6"
                      />
                      {/* Segment 4: Hoàn thành (1/12 = 8.3%) -> Emerald */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="4"
                        strokeDasharray="7.3 88"
                        strokeDashoffset="-73.2"
                      />
                      {/* Segment 5: Tạm dừng (1/12 = 8.3%) -> Rose */}
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="4"
                        strokeDasharray="7.3 88"
                        strokeDashoffset="-80.5"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-black text-slate-800 leading-none">12</span>
                      <span className="text-[8px] text-slate-500 font-semibold leading-tight">dự án</span>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div className="text-[10px] space-y-1 text-slate-600 font-medium">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Điền đầy tài nguyên</span>
                      </span>
                      <span className="font-bold text-slate-800">5</span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Setup Line</span>
                      </span>
                      <span className="font-bold text-slate-800">3</span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <span>Chờ xác nhận</span>
                      </span>
                      <span className="font-bold text-slate-800">2</span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Hoàn thành</span>
                      </span>
                      <span className="font-bold text-slate-800">1</span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>Tạm dừng</span>
                      </span>
                      <span className="font-bold text-slate-800">1</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart 2: Horizontal Bar Tình trạng tài nguyên */}
              <div className="border border-slate-100 rounded p-2 bg-slate-50/50">
                <div className="text-[11px] font-bold text-slate-700 mb-2">
                  Tình trạng tài nguyên
                </div>
                <div className="space-y-1.5 text-[10px]">
                  <div>
                    <div className="flex items-center justify-between mb-0.5 text-slate-600">
                      <span>Đủ tài nguyên</span>
                      <span className="font-bold text-slate-800">5</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '83%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5 text-slate-600">
                      <span>Thiếu cần mua</span>
                      <span className="font-bold text-slate-800">3</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: '50%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5 text-slate-600">
                      <span>Đang điều động</span>
                      <span className="font-bold text-slate-800">2</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '33%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5 text-slate-600">
                      <span>Đang request</span>
                      <span className="font-bold text-slate-800">1</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '16%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5 text-slate-600">
                      <span>Hoàn thành</span>
                      <span className="font-bold text-slate-800">1</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '16%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Danh sách dự án Model mới (Width ~ 62%) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            {/* Header Navy */}
            <div className="bg-[#0b2447] text-white px-3.5 py-2 font-bold text-xs flex items-center justify-between">
              <span>Danh sách dự án Model mới</span>
              <span className="text-[10px] text-blue-200">
                Hiển thị {filteredProjects.length} / {projects.length} dự án
              </span>
            </div>

            {/* Filter and Action Bar */}
            <div className="p-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
              <div className="flex items-center gap-2 flex-wrap flex-1">
                {/* Filter Status */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-xs border border-slate-300 rounded px-2.5 py-1 bg-white text-slate-700 font-medium"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="Điền đầy">Điền đầy</option>
                  <option value="Đang setup">Đang setup</option>
                  <option value="Chờ xác nhận">Chờ xác nhận</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Tạm dừng">Tạm dừng</option>
                </select>

                {/* Filter Factory */}
                <select
                  value={selectedFactory}
                  onChange={(e) => setSelectedFactory(e.target.value)}
                  className="text-xs border border-slate-300 rounded px-2.5 py-1 bg-white text-slate-700 font-medium"
                >
                  <option value="ALL">Tất cả nhà máy</option>
                  <option value="Nhà máy A">Nhà máy A</option>
                  <option value="Nhà máy B">Nhà máy B</option>
                  <option value="Nhà máy C">Nhà máy C</option>
                </select>

                {/* Search Input */}
                <div className="relative flex-1 min-w-[160px]">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm model, mã dự án..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Button: + Tạo dự án */}
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded text-xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Tạo dự án</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2 px-2 text-center w-8">STT</th>
                    <th className="py-2 px-2.5">Mã dự án</th>
                    <th className="py-2 px-2.5">Model</th>
                    <th className="py-2 px-2">Nhà máy</th>
                    <th className="py-2 px-2 text-center">Số Line</th>
                    <th className="py-2 px-2.5 text-right">Sản lượng</th>
                    <th className="py-2 px-2.5">Ngày bắt đầu</th>
                    <th className="py-2 px-2.5">Trạng thái</th>
                    <th className="py-2 px-2.5 min-w-[90px]">Tiến độ</th>
                    <th className="py-2 px-2">Planner</th>
                    <th className="py-2 px-2">Leader</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredProjects.slice(0, 5).map((project, index) => {
                    const isFocused = focusedProject?.id === project.id;

                    return (
                      <tr
                        key={project.id}
                        onClick={() => {
                          setFocusedProjectId(project.id);
                        }}
                        onDoubleClick={() => onSelectProject(project)}
                        className={`transition-colors cursor-pointer ${
                          isFocused
                            ? 'bg-blue-50/90 font-semibold'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2 px-2 text-center font-bold text-slate-500">
                          {index + 1}
                        </td>
                        <td className="py-2 px-2.5 font-bold text-blue-900 whitespace-nowrap">
                          {project.projectCode}
                        </td>
                        <td className="py-2 px-2.5 font-bold text-slate-900 whitespace-nowrap">
                          {project.modelName}
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap">{project.factory}</td>
                        <td className="py-2 px-2 text-center font-semibold text-slate-800">
                          {project.lineCount}
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono font-medium">
                          {project.targetOutput}
                        </td>
                        <td className="py-2 px-2.5 font-mono text-[11px] whitespace-nowrap">
                          {project.startDate}
                        </td>
                        <td className="py-2 px-2.5 whitespace-nowrap">
                          {getStatusBadge(project.status, project.currentStep)}
                        </td>
                        <td className="py-2 px-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-14 h-2 rounded bg-slate-200 overflow-hidden">
                              <div
                                className={`h-full rounded ${
                                  project.progressPct >= 100
                                    ? 'bg-emerald-500'
                                    : 'bg-blue-600'
                                }`}
                                style={{ width: `${project.progressPct}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 font-mono">
                              {project.progressPct}%
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-[11px] whitespace-nowrap">
                          {project.plannerName}
                        </td>
                        <td className="py-2 px-2 text-[11px] whitespace-nowrap">
                          {project.equipmentLeaderName}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 3. BOTTOM SECTION: 5 DETAILED PANELS FOR FOCUSED PROJECT         */}
      {/* ================================================================ */}
      {focusedProject && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* PANEL 1: Chi tiết dự án */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="bg-[#0b2447] text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between">
                <span>Chi tiết dự án: {focusedProject.projectCode}</span>
                <button
                  type="button"
                  onClick={() => onSelectProject(focusedProject)}
                  className="text-blue-200 hover:text-white flex items-center gap-0.5 text-[10px] underline cursor-pointer"
                >
                  <span>Mở full</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>

              <div className="p-2.5 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Model</label>
                    <input
                      type="text"
                      readOnly
                      value={focusedProject.modelName}
                      className="w-full p-1 border border-slate-300 rounded bg-slate-50 text-slate-800 font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Nhà máy</label>
                    <input
                      type="text"
                      readOnly
                      value={focusedProject.factory}
                      className="w-full p-1 border border-slate-300 rounded bg-slate-50 text-slate-800 font-semibold text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Số Line</label>
                    <input
                      type="text"
                      readOnly
                      value={focusedProject.lineCount}
                      className="w-full p-1 border border-slate-300 rounded bg-slate-50 text-slate-800 font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Sản lượng</label>
                    <input
                      type="text"
                      readOnly
                      value={focusedProject.targetOutput}
                      className="w-full p-1 border border-slate-300 rounded bg-slate-50 text-slate-800 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Ngày bắt đầu</label>
                    <input
                      type="text"
                      readOnly
                      value={focusedProject.startDate}
                      className="w-full p-1 border border-slate-300 rounded bg-slate-50 text-slate-800 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Ngày dự kiến hoàn thành</label>
                    <input
                      type="text"
                      readOnly
                      value={focusedProject.targetDate}
                      className="w-full p-1 border border-slate-300 rounded bg-slate-50 text-slate-800 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-[#fef4e8] px-2 py-0.5 rounded border border-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Điền đầy tài nguyên</span>
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <span>Tiến độ:</span>
                    <span className="font-mono text-blue-600">{focusedProject.progressPct}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PANEL 2: Tiêu chuẩn thiết bị (Planner khai báo) */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="bg-[#0b2447] text-white px-3 py-1.5 text-xs font-bold">
                Tiêu chuẩn thiết bị (Planner khai báo)
              </div>
              <div className="p-1">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-1 px-1 text-center w-6">STT</th>
                      <th className="py-1 px-1.5">Mã thiết bị</th>
                      <th className="py-1 px-1.5">Tên thiết bị</th>
                      <th className="py-1 px-1.5 text-center">SL / Line</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-1 px-1 text-center font-semibold">1</td>
                      <td className="py-1 px-1.5 font-mono text-blue-900 font-bold">EQ-001</td>
                      <td className="py-1 px-1.5">Máy kiểm tra</td>
                      <td className="py-1 px-1.5 text-center font-bold">2</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1 text-center font-semibold">2</td>
                      <td className="py-1 px-1.5 font-mono text-blue-900 font-bold">EQ-002</td>
                      <td className="py-1 px-1.5">Máy lắp ráp</td>
                      <td className="py-1 px-1.5 text-center font-bold">4</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1 text-center font-semibold">3</td>
                      <td className="py-1 px-1.5 font-mono text-blue-900 font-bold">EQ-003</td>
                      <td className="py-1 px-1.5">Máy hàn</td>
                      <td className="py-1 px-1.5 text-center font-bold">2</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1 text-center font-semibold">4</td>
                      <td className="py-1 px-1.5 font-mono text-blue-900 font-bold">EQ-004</td>
                      <td className="py-1 px-1.5">Băng chuyền</td>
                      <td className="py-1 px-1.5 text-center font-bold">1</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1 text-center font-semibold">5</td>
                      <td className="py-1 px-1.5 font-mono text-blue-900 font-bold">EQ-005</td>
                      <td className="py-1 px-1.5">Máy cấp nguồn</td>
                      <td className="py-1 px-1.5 text-center font-bold">1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* PANEL 3: Tình trạng tài nguyên */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="bg-[#0b2447] text-white px-3 py-1.5 text-xs font-bold">
                Tình trạng tài nguyên
              </div>
              <div className="p-1">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-1 px-1.5">Loại</th>
                      <th className="py-1 px-1 text-center">Cần có</th>
                      <th className="py-1 px-1 text-center">Hiện có</th>
                      <th className="py-1 px-1 text-center">Dư thừa</th>
                      <th className="py-1 px-1 text-center">Thiếu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-1 px-1.5 font-medium">Máy kiểm tra</td>
                      <td className="py-1 px-1 text-center font-semibold">20</td>
                      <td className="py-1 px-1 text-center font-semibold">15</td>
                      <td className="py-1 px-1 text-center text-emerald-600 font-bold">3</td>
                      <td className="py-1 px-1 text-center text-rose-600 font-bold">2</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1.5 font-medium">Máy lắp ráp</td>
                      <td className="py-1 px-1 text-center font-semibold">40</td>
                      <td className="py-1 px-1 text-center font-semibold">30</td>
                      <td className="py-1 px-1 text-center text-emerald-600 font-bold">5</td>
                      <td className="py-1 px-1 text-center text-rose-600 font-bold">5</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1.5 font-medium">Máy hàn</td>
                      <td className="py-1 px-1 text-center font-semibold">20</td>
                      <td className="py-1 px-1 text-center font-semibold">18</td>
                      <td className="py-1 px-1 text-center text-emerald-600 font-bold">2</td>
                      <td className="py-1 px-1 text-center text-slate-400 font-medium">0</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1.5 font-medium">Băng chuyền</td>
                      <td className="py-1 px-1 text-center font-semibold">10</td>
                      <td className="py-1 px-1 text-center font-semibold">8</td>
                      <td className="py-1 px-1 text-center text-emerald-600 font-bold">2</td>
                      <td className="py-1 px-1 text-center text-rose-600 font-bold">2</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1.5 font-medium">Máy cấp nguồn</td>
                      <td className="py-1 px-1 text-center font-semibold">10</td>
                      <td className="py-1 px-1 text-center font-semibold">12</td>
                      <td className="py-1 px-1 text-center text-emerald-600 font-bold">2</td>
                      <td className="py-1 px-1 text-center text-slate-400 font-medium">0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* PANEL 4: Checklist kỹ thuật (Kỹ thuật viên) */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="bg-[#0b2447] text-white px-3 py-1.5 text-xs font-bold">
                Checklist kỹ thuật (Kỹ thuật viên)
              </div>
              <div className="p-1">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-1 px-1 text-center w-6">STT</th>
                      <th className="py-1 px-1.5">Thiết bị</th>
                      <th className="py-1 px-1.5">Kết quả</th>
                      <th className="py-1 px-1.5">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-1 px-1 text-center font-semibold">1</td>
                      <td className="py-1 px-1.5 font-mono text-blue-900 font-bold">EQ-001</td>
                      <td className="py-1 px-1.5 font-semibold">Tốt</td>
                      <td className="py-1 px-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Lắp
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1 text-center font-semibold">2</td>
                      <td className="py-1 px-1.5 font-mono text-blue-900 font-bold">EQ-002</td>
                      <td className="py-1 px-1.5 text-amber-700 font-medium">Cần bảo dưỡng</td>
                      <td className="py-1 px-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          <Clock className="w-2.5 h-2.5" />
                          Đang xử lý
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1 text-center font-semibold">3</td>
                      <td className="py-1 px-1.5 font-mono text-blue-900 font-bold">EQ-003</td>
                      <td className="py-1 px-1.5 text-rose-700 font-medium">Lỗi linh kiện</td>
                      <td className="py-1 px-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Yêu cầu sửa chữa
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1 text-center font-semibold">4</td>
                      <td className="py-1 px-1.5 font-mono text-blue-900 font-bold">EQ-004</td>
                      <td className="py-1 px-1.5 font-semibold">Tốt</td>
                      <td className="py-1 px-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Lắp
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1 text-center font-semibold">5</td>
                      <td className="py-1 px-1.5 font-mono text-blue-900 font-bold">EQ-005</td>
                      <td className="py-1 px-1.5 font-semibold">Tốt</td>
                      <td className="py-1 px-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Đầy
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* PANEL 5: Checklist Setup Line (Leader) */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="bg-[#0b2447] text-white px-3 py-1.5 text-xs font-bold">
                Checklist Setup Line (Leader)
              </div>
              <div className="p-1">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-1 px-1 text-center w-6">STT</th>
                      <th className="py-1 px-1.5">Hạng mục</th>
                      <th className="py-1 px-1.5">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-1 px-1 text-center font-semibold">1</td>
                      <td className="py-1 px-1.5 font-semibold">Lắp đặt thiết bị</td>
                      <td className="py-1 px-1.5">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Hoàn thành</span>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1 text-center font-semibold">2</td>
                      <td className="py-1 px-1.5 font-semibold">Hạ tầng</td>
                      <td className="py-1 px-1.5">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Hoàn thành</span>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1 text-center font-semibold">3</td>
                      <td className="py-1 px-1.5 font-semibold">IT và chương trình</td>
                      <td className="py-1 px-1.5">
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Đang thực hiện</span>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1 text-center font-semibold">4</td>
                      <td className="py-1 px-1.5 font-semibold">Đào tạo</td>
                      <td className="py-1 px-1.5">
                        <span className="inline-flex items-center gap-1 text-blue-700 font-bold">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          <span>Chưa thực hiện</span>
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-1 text-center font-semibold">5</td>
                      <td className="py-1 px-1.5 font-semibold">Kiểm thử</td>
                      <td className="py-1 px-1.5">
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Có vấn đề</span>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  NewModelProject,
  ProjectStepNumber,
  ProjectStatus,
  PROJECT_STEP_DEFINITIONS,
  NewModelProjectKPIs,
} from '../../types/newModelProject';
import { FactoryName } from '../../types/workforce';
import { NewModelWorkflowBanner } from './NewModelWorkflowBanner';
import { calculateNewModelKPIs } from '../../services/newModelProjectStorage';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  Boxes,
  Layers,
  ChevronRight,
  TrendingUp,
  Building2,
  Calendar,
  Sparkles,
  ArrowRightLeft,
  ShoppingCart,
  Trash2,
  RefreshCw,
  FolderKanban,
  FileText,
  UserCheck,
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
  onDeleteProject,
  onResetSampleData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFactory, setSelectedFactory] = useState<string>('ALL');
  const [selectedStepFilter, setSelectedStepFilter] = useState<number | 'ALL'>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedBannerStep, setSelectedBannerStep] = useState<ProjectStepNumber | null>(null);

  // Compute 6 KPI Cards
  const kpis: NewModelProjectKPIs = useMemo(() => calculateNewModelKPIs(projects), [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((prj) => {
      // Search
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matchesQuery =
          prj.projectCode.toLowerCase().includes(query) ||
          prj.modelName.toLowerCase().includes(query) ||
          prj.plannerName.toLowerCase().includes(query) ||
          prj.equipmentLeaderName.toLowerCase().includes(query) ||
          prj.factory.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Factory filter
      if (selectedFactory !== 'ALL' && prj.factory !== selectedFactory) {
        return false;
      }

      // Banner step or select step filter
      const activeStepFilter = selectedBannerStep !== null ? selectedBannerStep : selectedStepFilter;
      if (activeStepFilter !== 'ALL' && prj.currentStep !== activeStepFilter) {
        return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'ALL' && prj.status !== selectedStatusFilter) {
        return false;
      }

      return true;
    });
  }, [projects, searchQuery, selectedFactory, selectedStepFilter, selectedBannerStep, selectedStatusFilter]);

  const getStepBadge = (step: ProjectStepNumber) => {
    const def = PROJECT_STEP_DEFINITIONS[step];
    return {
      title: def?.title || `Bước ${step}`,
      badgeBg: def?.badgeBg || 'bg-blue-600',
    };
  };

  const getBranchBadge = (project: NewModelProject) => {
    if (project.branchDecisions.length === 0) {
      return (
        <span className="text-[11px] font-medium text-slate-400 italic">
          Chờ đánh giá (B4)
        </span>
      );
    }
    const hasTransfer = project.branchDecisions.some(
      (b) => b.branchType === 'ĐỦ TÀI NGUYÊN' || b.branchType === 'KẾT HỢP'
    );
    const hasPurchase = project.branchDecisions.some(
      (b) => b.branchType === 'THIẾU TÀI NGUYÊN' || b.branchType === 'KẾT HỢP'
    );

    if (hasTransfer && hasPurchase) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          <ArrowRightLeft className="w-3 h-3 text-amber-600" />
          <span>ĐĐ + Mua sắm</span>
        </span>
      );
    }
    if (hasPurchase) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
          <ShoppingCart className="w-3 h-3 text-purple-600" />
          <span>Mua bổ sung</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Đủ điều động</span>
      </span>
    );
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'Đã hoàn thành', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'FINAL_SIGN_OFF':
        return { label: 'Chờ Planner duyệt', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case 'LINE_SETUP':
        return { label: 'Đang setup line', color: 'bg-teal-100 text-teal-800 border-teal-300' };
      case 'TECHNICAL_INSPECTION':
        return { label: 'Kỹ thuật rà soát', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' };
      case 'RESOURCE_FULFILLMENT_CHECK':
        return { label: 'Cổng điền đầy B6', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'DISPATCH_PURCHASE_IN_PROGRESS':
        return { label: 'Đang ĐĐ / Mua sắm', color: 'bg-pink-100 text-pink-800 border-pink-300' };
      case 'FACTORY_WIDE_REVIEW':
        return { label: 'Rà soát toàn NM', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'INTERNAL_REVIEW':
        return { label: 'Rà soát nội bộ', color: 'bg-sky-100 text-sky-800 border-sky-300' };
      case 'STANDARD_DECLARATION':
        return { label: 'Khai báo tiêu chuẩn', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'NEW_PLAN':
        return { label: 'Kế hoạch mới', color: 'bg-slate-100 text-slate-800 border-slate-300' };
      case 'ON_HOLD':
        return { label: 'Tạm dừng / Có lỗi', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-5">
      {/* AREA A: Top Hero Header with Factory Filters and Action Buttons */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#0a1829] flex items-center justify-center text-white shadow-xs">
                <FolderKanban className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#0a1829] tracking-tight flex items-center gap-2">
                  QUẢN LÝ DỰ ÁN MODEL MỚI (NEW MODEL PROJECT)
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    9 Bước Tiêu Chuẩn
                  </span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Từ kế hoạch ban đầu → Định mức kỹ thuật → Phân nhánh điều động/mua sắm → Setup Line → Planner xác nhận bàn giao sản xuất.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={onResetSampleData}
              title="Khôi phục 4 dự án mẫu doanh nghiệp"
              className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Dữ liệu mẫu</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreateModal}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ KHỞI TẠO DỰ ÁN MỚI (BƯỚC 1)</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Bar */}
        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Factory filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Nhà máy:</span>
            {(['ALL', 'Nhà máy A', 'Nhà máy B', 'Nhà máy C'] as const).map((fac) => (
              <button
                key={fac}
                type="button"
                onClick={() => setSelectedFactory(fac)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  selectedFactory === fac
                    ? 'bg-[#0a1829] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                }`}
              >
                {fac === 'ALL' ? 'Tất cả nhà máy' : fac}
                <span className="ml-1.5 text-[10px] opacity-75 font-mono">
                  (
                  {fac === 'ALL'
                    ? projects.length
                    : projects.filter((p) => p.factory === fac).length}
                  )
                </span>
              </button>
            ))}
          </div>

          {/* Search box & Status filter */}
          <div className="flex items-center gap-2 flex-1 md:max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mã DA, Model, Planner, Leader..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="NEW_PLAN">Kế hoạch mới (B1)</option>
              <option value="STANDARD_DECLARATION">Tiêu chuẩn (B2)</option>
              <option value="INTERNAL_REVIEW">Rà soát nội bộ (B3)</option>
              <option value="FACTORY_WIDE_REVIEW">Toàn nhà máy (B4)</option>
              <option value="DISPATCH_PURCHASE_IN_PROGRESS">ĐĐ / Mua sắm (B5)</option>
              <option value="RESOURCE_FULFILLMENT_CHECK">Điền đầy (B6)</option>
              <option value="TECHNICAL_INSPECTION">Kỹ thuật (B7)</option>
              <option value="LINE_SETUP">Setup Line (B8)</option>
              <option value="FINAL_SIGN_OFF">Chờ Planner (B9)</option>
              <option value="COMPLETED">Hoàn thành 100%</option>
              <option value="ON_HOLD">Tạm dừng / Có lỗi</option>
            </select>
          </div>
        </div>
      </div>

      {/* AREA B: Visual 9-Step Workflow Banner with Interactive Step Selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0a1829]">
              Quy Trình 9 Bước & Phân Nhánh Quyết Định Tài Nguyên
            </h3>
          </div>
          {selectedBannerStep && (
            <button
              type="button"
              onClick={() => setSelectedBannerStep(null)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Xem tất cả bước ({projects.length})</span>
            </button>
          )}
        </div>

        <NewModelWorkflowBanner
          currentStep={1}
          selectedStep={selectedBannerStep || undefined}
          onSelectStep={(step: ProjectStepNumber) => {
            setSelectedBannerStep(selectedBannerStep === step ? null : step);
          }}
        />

        {selectedBannerStep && (
          <div className="mt-3 p-2.5 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-900">
              Đang lọc danh sách dự án ở Bước {selectedBannerStep}:{' '}
              <strong className="font-black">
                {PROJECT_STEP_DEFINITIONS[selectedBannerStep]?.title}
              </strong>
            </span>
            <span className="font-bold text-blue-700">
              Tìm thấy {filteredProjects.length} dự án
            </span>
          </div>
        )}
      </div>

      {/* AREA C: 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* KPI 1: Tổng số dự án */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tổng số Dự án
            </span>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-[#0a1829]">
            {kpis.totalProjects}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="text-emerald-600 font-bold">{kpis.onTrackRatePct}%</span>
            <span>đúng tiến độ</span>
          </div>
        </div>

        {/* KPI 2: Đang điền đầy tài nguyên */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Điền Đầy (B5-6)
            </span>
            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700">
            {kpis.fulfillingResourcesCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            Điều động & mua sắm
          </div>
        </div>

        {/* KPI 3: Setup Line */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:border-teal-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
              Setup Line (B8)
            </span>
            <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-teal-700">
            {kpis.lineSetupCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            5 nhóm checklist
          </div>
        </div>

        {/* KPI 4: Chờ Planner phê duyệt */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
              Chờ Planner (B9)
            </span>
            <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-700">
            {kpis.waitingPlannerSignOffCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            8 điều kiện nghiệm thu
          </div>
        </div>

        {/* KPI 5: Đã hoàn thành */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Đã Hoàn Thành
            </span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">
            {kpis.completedCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            Bàn giao sản xuất
          </div>
        </div>

        {/* KPI 6: Cảnh báo / Nguy cơ trễ hạn */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
              Cảnh báo / Trễ
            </span>
            <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-700">
            {kpis.onHoldOrIssueCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            Cần xử lý rủi ro
          </div>
        </div>
      </div>

      {/* AREA D: Summary Distribution Banner */}
      <div className="bg-gradient-to-r from-[#0a1829] to-[#0e2744] text-white rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-blue-300 uppercase tracking-wider">
              TỔNG NĂNG LỰC DỰ ÁN MODEL MỚI
            </div>
            <div className="text-sm font-semibold text-slate-200 mt-0.5">
              Tổng số Line triển khai:{' '}
              <span className="font-bold text-amber-300">
                {projects.reduce((acc, p) => acc + p.lineCount, 0)} Line
              </span>{' '}
              | Tỷ lệ đúng tiến độ:{' '}
              <span className="font-bold text-emerald-400">{kpis.onTrackRatePct}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Đã điền đầy (B6):</span>
            <span className="font-mono font-bold text-emerald-300">
              {
                projects.filter(
                  (p) => p.resourceFulfillment.gateStatus === 'ĐÃ XÁC NHẬN ĐẦY ĐỦ'
                ).length
              }
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <span className="text-slate-300">Setup Line (B8):</span>
            <span className="font-mono font-bold text-teal-300">
              {kpis.lineSetupCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span className="text-slate-300">Hoàn thành 100%:</span>
            <span className="font-mono font-bold text-blue-300">
              {kpis.completedCount}
            </span>
          </div>
        </div>
      </div>

      {/* AREA E: Comprehensive Projects Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-black text-[#0a1829] uppercase tracking-tight">
              Danh Sách Dự Án Model Mới ({filteredProjects.length})
            </h2>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Nhấp vào dự án để xem chi tiết 11 phân hệ & thực hiện nghiệp vụ
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FolderKanban className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#0a1829]">Không tìm thấy dự án phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Không có dự án nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại. Thử đổi bộ lọc hoặc bấm nút tạo dự án mới.
            </p>
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Khởi tạo Dự án Mới Ngay</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-3 px-3.5 font-bold">Mã DA & Model</th>
                  <th className="py-3 px-3 font-bold">Nhà máy & Quy mô</th>
                  <th className="py-3 px-3 font-bold">Tiến độ quy trình</th>
                  <th className="py-3 px-3 font-bold">Bước hiện tại</th>
                  <th className="py-3 px-3 font-bold">Phân nhánh tài nguyên</th>
                  <th className="py-3 px-3 font-bold">Nhân sự phụ trách</th>
                  <th className="py-3 px-3 font-bold">Thời gian triển khai</th>
                  <th className="py-3 px-3 font-bold">Trạng thái</th>
                  <th className="py-3 px-3.5 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((project) => {
                  const stepBadge = getStepBadge(project.currentStep);
                  const statusInfo = getStatusLabel(project.status);

                  return (
                    <tr
                      key={project.id}
                      onClick={() => onSelectProject(project)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Mã DA & Model */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-[#0a1829] group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                          <span>{project.projectCode}</span>
                          {project.currentStep === 9 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                              Chờ nghiệm thu
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium mt-0.5 line-clamp-1">
                          {project.modelName}
                        </div>
                      </td>

                      {/* Nhà máy & Quy mô */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{project.factory}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          <span className="font-bold text-slate-700">{project.lineCount} Line</span> •{' '}
                          {project.targetOutput}
                        </div>
                      </td>

                      {/* Tiến độ quy trình */}
                      <td className="py-3 px-3 min-w-[130px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-[#0a1829]">
                            {project.progressPct}%
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {project.currentStep}/9 bước
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              project.progressPct >= 100
                                ? 'bg-emerald-500'
                                : project.progressPct >= 70
                                ? 'bg-purple-600'
                                : project.progressPct >= 40
                                ? 'bg-blue-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${project.progressPct}%` }}
                          />
                        </div>
                      </td>

                      {/* Bước hiện tại */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-2xs ${stepBadge.badgeBg}`}
                        >
                          <span>B{project.currentStep}:</span>
                          <span className="max-w-[120px] truncate">
                            {stepBadge.title}
                          </span>
                        </span>
                      </td>

                      {/* Phân nhánh tài nguyên */}
                      <td className="py-3 px-3">
                        {getBranchBadge(project)}
                      </td>

                      {/* Nhân sự phụ trách */}
                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-semibold line-clamp-1">
                          PL: {project.plannerName}
                        </div>
                        <div className="text-slate-500 text-[11px] line-clamp-1">
                          EQ: {project.equipmentLeaderName}
                        </div>
                      </td>

                      {/* Thời gian triển khai */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-slate-700 font-mono text-[11px]">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{project.targetDate}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Khởi tạo: {project.startDate}
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProject(project);
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Chi tiết</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  `Bạn có chắc chắn muốn xóa dự án ${project.projectCode} (${project.modelName})?`
                                )
                              ) {
                                onDeleteProject(project.id);
                              }
                            }}
                            title="Xóa dự án"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

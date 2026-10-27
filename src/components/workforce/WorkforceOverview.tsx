import React, { useState, useMemo } from 'react';
import {
  WeeklyWorkforceSubmission,
  ReportingCycleConfig,
  WorkforceRiskAlert,
  UserProfile,
  VendorName,
  FactoryName,
  WorkforceGroup,
  VENDOR_LIST,
  FACTORY_LIST,
} from '../../types/workforce';
import {
  calculateWorkforceKPIs,
  evaluateWorkforceRisks,
  getStoredWorkforceThresholds,
} from '../../services/workforceStorage';
import {
  Users,
  Briefcase,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  Filter,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Search,
  PieChart,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

interface WorkforceOverviewProps {
  submissions: WeeklyWorkforceSubmission[];
  cycles: ReportingCycleConfig[];
  currentUser: UserProfile;
  onNavigateTab: (tab: any) => void;
  onSelectSubmissionToEdit: (submission: WeeklyWorkforceSubmission) => void;
}

export const WorkforceOverview: React.FC<WorkforceOverviewProps> = ({
  submissions,
  cycles,
  currentUser,
  onNavigateTab,
  onSelectSubmissionToEdit,
}) => {
  const activeCycle = cycles.find((c) => c.isActive) || cycles[0];
  const [selectedCycleId, setSelectedCycleId] = useState<string>(activeCycle?.id || '2025-W16');
  const [selectedVendor, setSelectedVendor] = useState<string>(
    currentUser.role === 'VENDOR_HR' && currentUser.vendor ? currentUser.vendor : 'ALL'
  );
  const [selectedFactory, setSelectedFactory] = useState<string>('ALL');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedContract, setSelectedContract] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Thresholds & Risk Alerts
  const thresholds = useMemo(() => getStoredWorkforceThresholds(), []);
  const prevCycleId = selectedCycleId === '2025-W16' ? '2025-W15' : '2025-W16';

  const riskAlerts = useMemo(() => {
    return evaluateWorkforceRisks(submissions, selectedCycleId, prevCycleId, thresholds);
  }, [submissions, selectedCycleId, prevCycleId, thresholds]);

  // KPIs strictly calculated from filtered submissions
  const kpis = useMemo(() => {
    return calculateWorkforceKPIs(
      submissions,
      selectedCycleId,
      selectedVendor,
      selectedFactory,
      selectedGroup,
      selectedContract,
      riskAlerts
    );
  }, [
    submissions,
    selectedCycleId,
    selectedVendor,
    selectedFactory,
    selectedGroup,
    selectedContract,
    riskAlerts,
  ]);

  // Submissions list for the matrix table
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchCycle = s.cycleId === selectedCycleId;
      const matchVendor = selectedVendor === 'ALL' || s.vendor === selectedVendor;
      const matchFactory = selectedFactory === 'ALL' || s.factory === selectedFactory;
      const matchSearch =
        searchTerm === '' ||
        s.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.factory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.updatedBy.toLowerCase().includes(searchTerm.toLowerCase());

      return matchCycle && matchVendor && matchFactory && matchSearch;
    });
  }, [submissions, selectedCycleId, selectedVendor, selectedFactory, searchTerm]);

  // Breakdown by 7 Vendor for visual chart
  const vendorBreakdown = useMemo(() => {
    return VENDOR_LIST.map((v) => {
      const subs = submissions.filter(
        (s) =>
          s.cycleId === selectedCycleId &&
          s.vendor === v &&
          (selectedFactory === 'ALL' || s.factory === selectedFactory)
      );
      const total = subs.reduce((sum, s) => sum + s.totalHeadcount, 0);
      const official = subs.reduce((sum, s) => sum + s.totalOfficial, 0);
      const seasonal = subs.reduce((sum, s) => sum + s.totalSeasonal, 0);
      const sop = subs.reduce((sum, s) => sum + (s.sop?.sopPlanQty || 0), 0);
      return {
        vendor: v,
        total,
        official,
        seasonal,
        sop,
      };
    });
  }, [submissions, selectedCycleId, selectedFactory]);

  const maxVendorTotal = Math.max(...vendorBreakdown.map((b) => b.total), 1);

  const STATUS_CONFIG: Record<
    string,
    { label: string; badge: string; border: string }
  > = {
    CONFIRMED: {
      label: 'Đã xác nhận',
      badge: 'bg-emerald-100 text-emerald-800',
      border: 'border-emerald-300',
    },
    SUBMITTED: {
      label: 'Đã gửi (Chờ duyệt)',
      badge: 'bg-blue-100 text-blue-800',
      border: 'border-blue-300',
    },
    DRAFT: {
      label: 'Đang nhập (Bản nháp)',
      badge: 'bg-slate-100 text-slate-700',
      border: 'border-slate-300',
    },
    OVERDUE: {
      label: 'Quá hạn nộp',
      badge: 'bg-red-100 text-red-800',
      border: 'border-red-300',
    },
    REJECTED_REVISION: {
      label: 'Yêu cầu cập nhật lại',
      badge: 'bg-amber-100 text-amber-800',
      border: 'border-amber-300',
    },
    NOT_STARTED: {
      label: 'Chưa bắt đầu',
      badge: 'bg-gray-100 text-gray-500',
      border: 'border-gray-200',
    },
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              PHÂN HỆ NHÂN LỰC & SOP
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Phase 1
            </span>
            <h1 className="text-xl font-black text-navy-950 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Tổng Quan Nhân Lực Theo Tuần — 7 Vendor
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi quân số 4 nhóm nghiệp vụ, tỷ trọng hợp đồng, đối chiếu kế hoạch sản xuất SOP và phát hiện nguy cơ thiếu hụt
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('workforce-input')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nhập số liệu tuần
          </button>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-navy-950">
            <Filter className="w-4 h-4 text-blue-600" />
            Bộ lọc dữ liệu phân tích
          </div>
          <div className="text-[11px] text-slate-500">
            Số liệu hiển thị sẽ được cập nhật đồng bộ cho toàn bộ KPI, biểu đồ và bảng ma trận
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 text-xs">
          {/* Cycle */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Kỳ báo cáo:</label>
            <select
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-navy-950 font-bold focus:ring-1 focus:ring-blue-500"
            >
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} {c.isActive ? '(Hiện tại)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Vendor:</label>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              disabled={currentUser.role === 'VENDOR_HR' && Boolean(currentUser.vendor)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-800 font-medium"
            >
              <option value="ALL">Tất cả 7 Vendor</option>
              {VENDOR_LIST.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Factory */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Nhà máy:</label>
            <select
              value={selectedFactory}
              onChange={(e) => setSelectedFactory(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-800 font-medium"
            >
              <option value="ALL">Tất cả nhà máy</option>
              {FACTORY_LIST.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Functional Group */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Nhóm nghiệp vụ:</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-800 font-medium"
            >
              <option value="ALL">Tất cả 4 nhóm</option>
              <option value="Hành chính nhân sự">Hành chính nhân sự</option>
              <option value="Sản xuất">Sản xuất</option>
              <option value="Chất lượng">Chất lượng (QC)</option>
              <option value="Thiết bị">Thiết bị (EQM)</option>
            </select>
          </div>

          {/* Contract Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Loại hợp đồng:</label>
            <select
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-800 font-medium"
            >
              <option value="ALL">Chính thức + Thời vụ</option>
              <option value="OFFICIAL">Chỉ nhân sự chính thức</option>
              <option value="SEASONAL">Chỉ nhân sự thời vụ</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tìm nhanh:</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Tên vendor, người nhập..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 9 TOP KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* KPI 1 */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>Tổng nhân lực</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-navy-950 mt-1 font-mono">
            {kpis.totalHeadcount.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {kpis.vendorCount} đơn vị Vendor/NM
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-800 flex items-center justify-between">
            <span>Nhân sự chính thức</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
            {kpis.totalOfficial.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {kpis.totalHeadcount > 0
              ? `${Math.round((kpis.totalOfficial / kpis.totalHeadcount) * 100)}% tổng lực lượng`
              : '0%'}
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-amber-800 flex items-center justify-between">
            <span>Nhân sự thời vụ</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1 font-mono">
            {kpis.totalSeasonal.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Tỷ lệ thời vụ: <strong className="text-amber-700">{kpis.seasonalRatio}%</strong>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
            <span>Tổng kế hoạch SOP</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 mt-1 font-mono">
            {kpis.totalSOP.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Sản lượng kỳ {selectedCycleId}</div>
        </div>

        {/* KPI 5: Submission Status & Risk */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs col-span-2 md:col-span-1">
          <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
            <span>Tiến độ nộp & Rủi ro</span>
            {kpis.riskCount > 0 ? (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-navy-950 font-mono">
              {kpis.submittedVendors}
            </span>
            <span className="text-xs text-slate-500">đã nộp</span>
            {kpis.overdueVendors > 0 && (
              <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                {kpis.overdueVendors} quá hạn
              </span>
            )}
          </div>
          <div className="text-[10px] text-red-600 font-bold mt-0.5">
            {kpis.riskCount > 0 ? `⚠️ ${kpis.riskCount} cảnh báo rủi ro biến động` : 'Trạng thái an toàn'}
          </div>
        </div>
      </div>

      {/* 4 VISUAL CHARTS & ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CHART 1: Nhân lực theo 7 Vendor */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-navy-950">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Quy mô nhân lực theo 7 Vendor (Kỳ {selectedCycleId})
            </div>
            <span className="text-[11px] text-slate-500">Chính thức vs Thời vụ</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {vendorBreakdown.map((vb) => {
              const officialWidth = (vb.official / maxVendorTotal) * 100;
              const seasonalWidth = (vb.seasonal / maxVendorTotal) * 100;

              return (
                <div key={vb.vendor} className="text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{vb.vendor}</span>
                    <span className="font-mono text-slate-700 font-semibold">
                      {vb.total} người{' '}
                      <span className="text-[10px] text-slate-400">
                        ({vb.official} CT / {vb.seasonal} TV)
                      </span>
                    </span>
                  </div>
                  {/* Stacked bar */}
                  <div className="h-2.5 bg-slate-100 rounded-full flex overflow-hidden">
                    <div
                      className="bg-blue-600 h-full"
                      style={{ width: `${officialWidth}%` }}
                      title={`Chính thức: ${vb.official}`}
                    />
                    <div
                      className="bg-amber-400 h-full"
                      style={{ width: `${seasonalWidth}%` }}
                      title={`Thời vụ: ${vb.seasonal}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART 2: Cơ cấu nhân lực theo 4 Nhóm Nghiệp Vụ */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-navy-950">
              <PieChart className="w-4 h-4 text-purple-600" />
              Cơ cấu theo 4 nhóm nghiệp vụ (Tỷ trọng quân số)
            </div>
            <span className="text-[11px] text-slate-500">Tổng: {kpis.totalHeadcount}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200">
              <div className="text-[11px] font-bold text-blue-900">Sản xuất (Production)</div>
              <div className="text-xl font-black text-blue-700 font-mono mt-1">
                {kpis.byGroup.production}{' '}
                <span className="text-xs font-normal text-slate-500">
                  (
                  {kpis.totalHeadcount > 0
                    ? Math.round((kpis.byGroup.production / kpis.totalHeadcount) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Đứng line, Leader, Repair, Kho</div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
              <div className="text-[11px] font-bold text-emerald-900">Chất lượng (Quality - QC)</div>
              <div className="text-xl font-black text-emerald-700 font-mono mt-1">
                {kpis.byGroup.quality}{' '}
                <span className="text-xs font-normal text-slate-500">
                  (
                  {kpis.totalHeadcount > 0
                    ? Math.round((kpis.byGroup.quality / kpis.totalHeadcount) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">IQC, OQC, RMA, Audit</div>
            </div>

            <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-200">
              <div className="text-[11px] font-bold text-indigo-900">Thiết bị (EQM)</div>
              <div className="text-xl font-black text-indigo-700 font-mono mt-1">
                {kpis.byGroup.equipment}{' '}
                <span className="text-xs font-normal text-slate-500">
                  (
                  {kpis.totalHeadcount > 0
                    ? Math.round((kpis.byGroup.equipment / kpis.totalHeadcount) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Trực line máy, Kho MRO</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-900">Hành chính & Nhân sự</div>
              <div className="text-xl font-black text-slate-700 font-mono mt-1">
                {kpis.byGroup.adminHR}{' '}
                <span className="text-xs font-normal text-slate-500">
                  (
                  {kpis.totalHeadcount > 0
                    ? Math.round((kpis.byGroup.adminHR / kpis.totalHeadcount) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Kế toán, Kế hoạch, Quản lý Hàn</div>
            </div>
          </div>
        </div>
      </div>

      {/* EARLY WARNING RISK ALERTS PANEL (Phase 1) */}
      {riskAlerts.filter((r) => r.riskLevel === 'CAO' || r.riskLevel === 'TRUNG BÌNH').length >
        0 && (
        <div className="bg-white rounded-lg border border-red-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-red-50/60 border-b border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-red-950">
                  Cảnh Báo Sớm Nguy Cơ Biến Động Nhân Lực & SOP (Phase 1)
                </h3>
                <p className="text-xs text-red-800">
                  Phát hiện bất thường về xu hướng: SOP tăng cao trong khi nhân lực giảm, hoặc tỷ lệ thời vụ vượt ngưỡng quy định
                </p>
              </div>
            </div>
            <span className="text-xs font-bold bg-red-100 text-red-800 px-2.5 py-1 rounded">
              {riskAlerts.filter((r) => r.riskLevel === 'CAO').length} mức Cao
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {riskAlerts
              .filter((r) => r.riskLevel === 'CAO' || r.riskLevel === 'TRUNG BÌNH')
              .map((alert) => (
                <div key={alert.id} className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-3 hover:bg-slate-50/80">
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          alert.riskLevel === 'CAO'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        MỨC {alert.riskLevel}
                      </span>
                      <strong className="text-navy-950 text-sm">
                        {alert.vendor} — {alert.factory}
                      </strong>
                      <span className="text-slate-400 font-mono text-[11px]">({alert.cycleId})</span>
                    </div>

                    <div className="font-semibold text-slate-800 text-xs">{alert.primaryReason}</div>
                    <p className="text-slate-600 text-xs leading-relaxed">{alert.detailedAnalysis}</p>

                    <div className="text-[11px] text-blue-900 bg-blue-50/80 p-2 rounded border border-blue-100 mt-1">
                      <strong>Khuyến nghị hành động:</strong> {alert.recommendation}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <button
                      onClick={() => {
                        const targetSub = submissions.find(
                          (s) =>
                            s.cycleId === alert.cycleId &&
                            s.vendor === alert.vendor &&
                            s.factory === alert.factory
                        );
                        if (targetSub) {
                          onSelectSubmissionToEdit(targetSub);
                        } else {
                          onNavigateTab('workforce-input');
                        }
                      }}
                      className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded font-bold text-xs transition-all flex items-center gap-1.5 ml-auto"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Chi tiết hồ sơ
                    </button>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      Cập nhật: {alert.evaluatedAt}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MATRIX TABLE: Tiến độ nộp báo cáo tuần của 7 Vendor */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-navy-950 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              Tiến Độ Báo Cáo Nhân Lực & SOP — Kỳ {selectedCycleId}
            </h3>
            <p className="text-xs text-slate-500">
              Danh sách chi tiết các đơn vị Vendor x Nhà máy đã đăng ký trong hệ thống
            </p>
          </div>

          <div className="text-xs text-slate-600 font-medium">
            Hiển thị <strong>{filteredSubmissions.length}</strong> bản ghi
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Vendor & Nhà máy</th>
                <th className="py-3 px-3 text-center">Trạng thái nộp</th>
                <th className="py-3 px-3 text-right">Chính thức</th>
                <th className="py-3 px-3 text-right">Thời vụ</th>
                <th className="py-3 px-3 text-right">Tổng quân số</th>
                <th className="py-3 px-3 text-right">Tỷ lệ thời vụ</th>
                <th className="py-3 px-3 text-right">Kế hoạch SOP</th>
                <th className="py-3 px-3">Người nhập & Cập nhật</th>
                <th className="py-3 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    Không tìm thấy bản ghi nhân lực nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG['DRAFT'];

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => onSelectSubmissionToEdit(sub)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-navy-950 text-xs">{sub.vendor}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {sub.factory}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${cfg.badge} ${cfg.border}`}
                        >
                          {cfg.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-700">
                        {sub.totalOfficial.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-semibold text-amber-700">
                        {sub.totalSeasonal.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-navy-950">
                        {sub.totalHeadcount.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-right font-mono">
                        <span
                          className={`font-bold ${
                            sub.seasonalRatio >= 40
                              ? 'text-red-600'
                              : sub.seasonalRatio >= 30
                              ? 'text-amber-600'
                              : 'text-slate-700'
                          }`}
                        >
                          {sub.seasonalRatio}%
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-purple-700">
                        {sub.sop?.sopPlanQty ? `${sub.sop.sopPlanQty.toLocaleString()} ${sub.sop.unit}` : '—'}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{sub.updatedBy}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{sub.updatedAt}</div>
                      </td>

                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectSubmissionToEdit(sub)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-slate-700 font-bold transition-all text-[11px]"
                        >
                          Xem / Sửa
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

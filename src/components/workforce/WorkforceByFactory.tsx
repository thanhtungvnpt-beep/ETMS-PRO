import React, { useState, useMemo } from 'react';
import {
  WeeklyWorkforceSubmission,
  ReportingCycleConfig,
  UserProfile,
  FactoryName,
  FACTORY_LIST,
} from '../../types/workforce';
import {
  Building2,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Search,
  Filter,
} from 'lucide-react';

interface WorkforceByFactoryProps {
  submissions: WeeklyWorkforceSubmission[];
  cycles: ReportingCycleConfig[];
  currentUser: UserProfile;
  onSelectSubmissionToEdit: (submission: WeeklyWorkforceSubmission) => void;
}

export const WorkforceByFactory: React.FC<WorkforceByFactoryProps> = ({
  submissions,
  cycles,
  currentUser,
  onSelectSubmissionToEdit,
}) => {
  const activeCycle = cycles.find((c) => c.isActive) || cycles[0];
  const [selectedCycleId, setSelectedCycleId] = useState<string>(activeCycle?.id || '2025-W16');
  const [activeFactory, setActiveFactory] = useState<FactoryName>('Nhà máy A');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate statistics for each factory
  const factoryStats = useMemo(() => {
    return FACTORY_LIST.map((fName) => {
      const subs = submissions.filter(
        (s) => s.cycleId === selectedCycleId && s.factory === fName
      );
      const totalHeadcount = subs.reduce((sum, s) => sum + s.totalHeadcount, 0);
      const totalOfficial = subs.reduce((sum, s) => sum + s.totalOfficial, 0);
      const totalSeasonal = subs.reduce((sum, s) => sum + s.totalSeasonal, 0);
      const totalSOP = subs.reduce((sum, s) => sum + (s.sop?.sopPlanQty || 0), 0);
      const vendors = Array.from(new Set(subs.map((s) => s.vendor)));
      const seasonalRatio =
        totalHeadcount > 0 ? Math.round((totalSeasonal / totalHeadcount) * 1000) / 10 : 0;
      const overdueCount = subs.filter((s) => s.status === 'OVERDUE').length;

      return {
        name: fName,
        totalHeadcount,
        totalOfficial,
        totalSeasonal,
        totalSOP,
        seasonalRatio,
        vendorCount: vendors.length,
        vendors,
        overdueCount,
      };
    });
  }, [submissions, selectedCycleId]);

  // Current active factory's submissions
  const currentFactorySubs = useMemo(() => {
    return submissions.filter((s) => {
      const matchCycle = s.cycleId === selectedCycleId;
      const matchFactory = s.factory === activeFactory;
      const matchSearch =
        searchTerm === '' ||
        s.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.updatedBy.toLowerCase().includes(searchTerm.toLowerCase());

      return matchCycle && matchFactory && matchSearch;
    });
  }, [submissions, selectedCycleId, activeFactory, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              TRANG 3
            </span>
            <h1 className="text-xl font-black text-navy-950 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Tình Hình Nhân Lực & SOP Theo Nhà Máy
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            So sánh mật độ lao động của các Vendor và tải trọng kế hoạch sản xuất giữa Nhà máy A, B và C
          </p>
        </div>

        {/* Cycle selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Kỳ báo cáo:</label>
          <select
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
            className="border border-slate-300 rounded px-3 py-1.5 text-xs bg-white text-navy-950 font-bold"
          >
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 FACTORY COMPARISON CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {factoryStats.map((f) => {
          const isSelected = activeFactory === f.name;

          return (
            <div
              key={f.name}
              onClick={() => setActiveFactory(f.name)}
              className={`p-4 rounded-lg border transition-all cursor-pointer relative ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-navy-900 text-sm">
                    {f.name.replace('Nhà máy ', '')}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-navy-950">{f.name}</h3>
                    <span className="text-[11px] text-slate-500">
                      {f.vendorCount} Vendor hoạt động
                    </span>
                  </div>
                </div>

                {f.overdueCount > 0 && (
                  <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    {f.overdueCount} Vendor quá hạn
                  </span>
                )}
              </div>

              {/* Headcount vs SOP */}
              <div className="grid grid-cols-2 gap-2 my-3">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">Tổng nhân sự</div>
                  <div className="text-xl font-black text-navy-950 mt-0.5 font-mono">
                    {f.totalHeadcount}{' '}
                    <span className="text-xs font-normal text-slate-500">người</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {f.totalOfficial} CT / {f.totalSeasonal} TV
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">Kế hoạch SOP</div>
                  <div className="text-xl font-black text-purple-700 mt-0.5 font-mono">
                    {f.totalSOP.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-purple-600 mt-1">PCS/kỳ tuần</div>
                </div>
              </div>

              {/* Seasonal Ratio */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500">Tỷ lệ lao động thời vụ:</span>
                <span
                  className={`font-bold font-mono ${
                    f.seasonalRatio >= 40
                      ? 'text-red-600'
                      : f.seasonalRatio >= 30
                      ? 'text-amber-600'
                      : 'text-slate-800'
                  }`}
                >
                  {f.seasonalRatio}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL TABLE FOR SELECTED FACTORY */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-navy-950">
              Chi Tiết Quân Số Các Vendor Đang Hoạt Động Tại {activeFactory}
            </h3>
            <p className="text-xs text-slate-500">
              Kỳ báo cáo {selectedCycleId} — Bấm vào dòng bất kỳ để xem biểu mẫu 23 vị trí
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm Vendor tại nhà máy này..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-3 text-right">Hành chính</th>
                <th className="py-3 px-3 text-right">Sản xuất</th>
                <th className="py-3 px-3 text-right">Chất lượng (QC)</th>
                <th className="py-3 px-3 text-right">Thiết bị (EQM)</th>
                <th className="py-3 px-3 text-right">Tổng quân số</th>
                <th className="py-3 px-3 text-right">Kế hoạch SOP</th>
                <th className="py-3 px-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {currentFactorySubs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-400">
                    Không có Vendor nào hoạt động hoặc có dữ liệu tại {activeFactory}
                  </td>
                </tr>
              ) : (
                currentFactorySubs.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => onSelectSubmissionToEdit(sub)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-bold text-navy-950">{sub.vendor}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {sub.adminHRTotal}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-blue-700">
                      {sub.productionTotal}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-700">
                      {sub.qualityTotal}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-indigo-700">
                      {sub.equipmentTotal}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-navy-950 text-sm">
                      {sub.totalHeadcount}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-purple-700">
                      {sub.sop?.sopPlanQty ? `${sub.sop.sopPlanQty.toLocaleString()} ${sub.sop.unit}` : '—'}
                    </td>
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectSubmissionToEdit(sub)}
                        className="px-2.5 py-1 bg-navy-900 hover:bg-navy-800 text-white rounded font-bold text-[11px]"
                      >
                        Mở form
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

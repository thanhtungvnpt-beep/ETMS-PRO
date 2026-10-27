import React, { useState, useMemo } from 'react';
import {
  WeeklyWorkforceSubmission,
  ReportingCycleConfig,
  UserProfile,
  VendorName,
  VENDOR_LIST,
} from '../../types/workforce';
import {
  Users,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  ExternalLink,
  Search,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface WorkforceByVendorProps {
  submissions: WeeklyWorkforceSubmission[];
  cycles: ReportingCycleConfig[];
  currentUser: UserProfile;
  onSelectSubmissionToEdit: (submission: WeeklyWorkforceSubmission) => void;
}

export const WorkforceByVendor: React.FC<WorkforceByVendorProps> = ({
  submissions,
  cycles,
  currentUser,
  onSelectSubmissionToEdit,
}) => {
  const [selectedVendor, setSelectedVendor] = useState<VendorName>(
    currentUser.role === 'VENDOR_HR' && currentUser.vendor ? currentUser.vendor : 'KHV'
  );

  const activeCycle = cycles.find((c) => c.isActive) || cycles[0];
  const [selectedCycleId, setSelectedCycleId] = useState<string>(activeCycle?.id || '2025-W16');

  // Vendor summary statistics
  const vendorStats = useMemo(() => {
    return VENDOR_LIST.map((v) => {
      const allVendorSubs = submissions.filter((s) => s.vendor === v);
      const currentSubs = allVendorSubs.filter((s) => s.cycleId === selectedCycleId);
      const factories = Array.from(new Set(allVendorSubs.map((s) => s.factory)));

      const totalHeadcount = currentSubs.reduce((sum, s) => sum + s.totalHeadcount, 0);
      const totalOfficial = currentSubs.reduce((sum, s) => sum + s.totalOfficial, 0);
      const totalSeasonal = currentSubs.reduce((sum, s) => sum + s.totalSeasonal, 0);
      const totalSOP = currentSubs.reduce((sum, s) => sum + (s.sop?.sopPlanQty || 0), 0);

      const seasonalRatio =
        totalHeadcount > 0 ? Math.round((totalSeasonal / totalHeadcount) * 1000) / 10 : 0;

      const overdueCount = currentSubs.filter((s) => s.status === 'OVERDUE').length;

      return {
        vendor: v,
        factories,
        totalHeadcount,
        totalOfficial,
        totalSeasonal,
        totalSOP,
        seasonalRatio,
        overdueCount,
      };
    });
  }, [submissions, selectedCycleId]);

  // Selected vendor's submissions across all cycles (for trend)
  const selectedVendorAllSubs = useMemo(() => {
    return submissions.filter((s) => s.vendor === selectedVendor);
  }, [submissions, selectedVendor]);

  const activeVendorInfo = vendorStats.find((v) => v.vendor === selectedVendor);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              TRANG 4
            </span>
            <h1 className="text-xl font-black text-navy-950 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Hồ Sơ Nhân Lực & SOP Theo 7 Vendor
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi quân số, tỷ trọng hợp đồng và lịch sử tuân thủ hạn nộp báo cáo của từng nhà cung ứng
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

      {/* 7 VENDOR TABS SELECTOR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {vendorStats.map((vs) => {
          const isSelected = selectedVendor === vs.vendor;

          return (
            <button
              key={vs.vendor}
              disabled={currentUser.role === 'VENDOR_HR' && currentUser.vendor !== vs.vendor}
              onClick={() => setSelectedVendor(vs.vendor)}
              className={`p-3 rounded-lg border text-left transition-all relative ${
                isSelected
                  ? 'border-blue-600 bg-navy-950 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40'
              }`}
            >
              <div className="font-extrabold text-xs truncate">{vs.vendor}</div>
              <div
                className={`text-[10px] mt-1 font-mono ${
                  isSelected ? 'text-blue-300' : 'text-slate-500'
                }`}
              >
                {vs.totalHeadcount} nhân sự
              </div>
              {vs.overdueCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* ACTIVE VENDOR DOSSIER CARD */}
      {activeVendorInfo && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-navy-950">{activeVendorInfo.vendor}</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Đối tác sản xuất chiến lược
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Nhà máy triển khai: <strong>{activeVendorInfo.factories.join(', ')}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-50 px-3 py-1.5 rounded border border-slate-200 text-xs">
                <span className="text-slate-500 block text-[10px]">Tỷ lệ thời vụ:</span>
                <span
                  className={`font-mono font-bold ${
                    activeVendorInfo.seasonalRatio >= 40
                      ? 'text-red-600'
                      : activeVendorInfo.seasonalRatio >= 30
                      ? 'text-amber-600'
                      : 'text-slate-800'
                  }`}
                >
                  {activeVendorInfo.seasonalRatio}%
                </span>
              </div>
              <div className="bg-purple-50 px-3 py-1.5 rounded border border-purple-200 text-xs">
                <span className="text-purple-600 block text-[10px]">Tổng SOP kỳ {selectedCycleId}:</span>
                <span className="font-mono font-bold text-purple-900">
                  {activeVendorInfo.totalSOP.toLocaleString()} PCS
                </span>
              </div>
            </div>
          </div>

          {/* Submissions by Factory for this Vendor */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-2">
              Báo Cáo Nhân Lực & SOP Các Nhà Máy Trực Thuộc ({selectedCycleId})
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Nhà máy</th>
                    <th className="py-2.5 px-3 text-center">Trạng thái</th>
                    <th className="py-2.5 px-3 text-right">Chính thức</th>
                    <th className="py-2.5 px-3 text-right">Thời vụ</th>
                    <th className="py-2.5 px-3 text-right">Tổng cộng</th>
                    <th className="py-2.5 px-3 text-right">SOP (PCS)</th>
                    <th className="py-2.5 px-3">Cập nhật lần cuối</th>
                    <th className="py-2.5 px-3 text-center">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedVendorAllSubs
                    .filter((s) => s.cycleId === selectedCycleId)
                    .map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-800">{sub.factory}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-semibold">
                          {sub.totalOfficial}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-amber-700 font-semibold">
                          {sub.totalSeasonal}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-navy-950">
                          {sub.totalHeadcount}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-700">
                          {sub.sop?.sopPlanQty ? sub.sop.sopPlanQty.toLocaleString() : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                          {sub.updatedAt} ({sub.updatedBy})
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => onSelectSubmissionToEdit(sub)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[11px]"
                          >
                            Xem 23 vị trí
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

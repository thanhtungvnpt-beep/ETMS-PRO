import React, { useState, useMemo } from 'react';
import {
  WeeklyWorkforceSubmission,
  ReportingCycleConfig,
  UserProfile,
  WorkforceRiskAlert,
  VENDOR_LIST,
  FACTORY_LIST,
} from '../../types/workforce';
import {
  evaluateWorkforceRisks,
  getStoredWorkforceThresholds,
} from '../../services/workforceStorage';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Building2,
  Filter,
  Users,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';

interface WorkforceReportsProps {
  submissions: WeeklyWorkforceSubmission[];
  cycles: ReportingCycleConfig[];
  currentUser: UserProfile;
}

export const WorkforceReports: React.FC<WorkforceReportsProps> = ({
  submissions,
  cycles,
  currentUser,
}) => {
  const activeCycle = cycles.find((c) => c.isActive) || cycles[0];
  const [selectedCycleId, setSelectedCycleId] = useState<string>(activeCycle?.id || '2025-W16');
  const [selectedVendor, setSelectedVendor] = useState<string>(
    currentUser.role === 'VENDOR_HR' && currentUser.vendor ? currentUser.vendor : 'ALL'
  );
  const [selectedFactory, setSelectedFactory] = useState<string>('ALL');

  const [reportType, setReportType] = useState<
    'detailed_positions' | 'headcount_vs_sop' | 'weekly_variance' | 'risk_summary'
  >('detailed_positions');

  const thresholds = useMemo(() => getStoredWorkforceThresholds(), []);
  const prevCycleId = selectedCycleId === '2025-W16' ? '2025-W15' : '2025-W16';

  const riskAlerts = useMemo(() => {
    return evaluateWorkforceRisks(submissions, selectedCycleId, prevCycleId, thresholds);
  }, [submissions, selectedCycleId, prevCycleId, thresholds]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchCycle = s.cycleId === selectedCycleId;
      const matchVendor = selectedVendor === 'ALL' || s.vendor === selectedVendor;
      const matchFactory = selectedFactory === 'ALL' || s.factory === selectedFactory;
      return matchCycle && matchVendor && matchFactory;
    });
  }, [submissions, selectedCycleId, selectedVendor, selectedFactory]);

  // Export CSV respecting current filters and user role
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[] = [];
    let fileName = `Bao_Cao_${reportType}_${selectedCycleId}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (reportType === 'detailed_positions') {
      headers = [
        'Kỳ báo cáo',
        'Vendor',
        'Nhà máy',
        'Nhóm nghiệp vụ',
        'Vị trí chi tiết',
        'Chính thức',
        'Thời vụ',
        'Tổng số',
      ];

      filteredSubmissions.forEach((sub) => {
        sub.positions.forEach((pos) => {
          rows.push([
            sub.cycleId,
            `"${sub.vendor}"`,
            `"${sub.factory}"`,
            `"${pos.group}"`,
            `"${pos.position}"`,
            pos.official,
            pos.seasonal,
            pos.total,
          ]);
        });
      });
    } else if (reportType === 'headcount_vs_sop') {
      headers = [
        'Kỳ báo cáo',
        'Vendor',
        'Nhà máy',
        'Tổng nhân lực',
        'Chính thức',
        'Thời vụ',
        'Tỷ lệ thời vụ (%)',
        'Kế hoạch SOP',
        'Đơn vị tính',
        'Trạng thái nộp',
      ];

      filteredSubmissions.forEach((sub) => {
        rows.push([
          sub.cycleId,
          `"${sub.vendor}"`,
          `"${sub.factory}"`,
          sub.totalHeadcount,
          sub.totalOfficial,
          sub.totalSeasonal,
          `${sub.seasonalRatio}%`,
          sub.sop?.sopPlanQty || 0,
          sub.sop?.unit || 'PCS',
          sub.status,
        ]);
      });
    } else if (reportType === 'weekly_variance') {
      headers = [
        'Vendor',
        'Nhà máy',
        `Quân số ${prevCycleId}`,
        `Quân số ${selectedCycleId}`,
        'Độ lệch nhân lực (%)',
        `SOP ${prevCycleId}`,
        `SOP ${selectedCycleId}`,
        'Độ lệch SOP (%)',
      ];

      filteredSubmissions.forEach((sub) => {
        const prev = submissions.find(
          (s) =>
            s.cycleId === prevCycleId &&
            s.vendor === sub.vendor &&
            s.factory === sub.factory
        );

        const deltaWorkforce =
          prev && prev.totalHeadcount > 0
            ? Math.round(
                ((sub.totalHeadcount - prev.totalHeadcount) / prev.totalHeadcount) * 1000
              ) / 10
            : '—';

        const deltaSOP =
          prev && prev.sop?.sopPlanQty > 0
            ? Math.round(
                ((sub.sop.sopPlanQty - prev.sop.sopPlanQty) / prev.sop.sopPlanQty) * 1000
              ) / 10
            : '—';

        rows.push([
          `"${sub.vendor}"`,
          `"${sub.factory}"`,
          prev?.totalHeadcount || '—',
          sub.totalHeadcount,
          `${deltaWorkforce}%`,
          prev?.sop?.sopPlanQty || '—',
          sub.sop?.sopPlanQty || 0,
          `${deltaSOP}%`,
        ]);
      });
    } else {
      headers = [
        'Kỳ',
        'Vendor',
        'Nhà máy',
        'Mức độ rủi ro',
        'Nguyên nhân cảnh báo',
        'Phân tích chi tiết',
        'Đề xuất kiểm tra',
      ];

      riskAlerts
        .filter((r) => selectedVendor === 'ALL' || r.vendor === selectedVendor)
        .filter((r) => selectedFactory === 'ALL' || r.factory === selectedFactory)
        .forEach((r) => {
          rows.push([
            r.cycleId,
            `"${r.vendor}"`,
            `"${r.factory}"`,
            r.riskLevel,
            `"${r.primaryReason.replace(/"/g, '""')}"`,
            `"${r.detailedAnalysis.replace(/"/g, '""')}"`,
            `"${r.recommendation.replace(/"/g, '""')}"`,
          ]);
        });
    }

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              TRANG 5
            </span>
            <h1 className="text-xl font-black text-navy-950 flex items-center gap-2">
              <FileBarChart className="w-5 h-5 text-blue-600" />
              Báo Cáo Nhân Lực & Kế Hoạch SOP 7 Vendor
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp dữ liệu báo cáo chuyên sâu, đối chiếu biến động theo tuần và xuất báo cáo CSV phục vụ Ban Quản Lý
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 border border-slate-300 rounded text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            In biểu mẫu
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            Xuất dữ liệu (CSV)
          </button>
        </div>
      </div>

      {/* FILTER & REPORT ANGLE BAR */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Kỳ báo cáo:</label>
            <select
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white text-navy-950 font-bold"
            >
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Vendor:</label>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              disabled={currentUser.role === 'VENDOR_HR' && Boolean(currentUser.vendor)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-800 font-medium"
            >
              <option value="ALL">Tất cả 7 Vendor</option>
              {VENDOR_LIST.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Nhà máy:</label>
            <select
              value={selectedFactory}
              onChange={(e) => setSelectedFactory(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-800 font-medium"
            >
              <option value="ALL">Tất cả nhà máy</option>
              {FACTORY_LIST.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs font-semibold">
          <button
            onClick={() => setReportType('detailed_positions')}
            className={`px-3 py-1.5 rounded transition-all ${
              reportType === 'detailed_positions'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Cơ cấu 23 vị trí chi tiết
          </button>
          <button
            onClick={() => setReportType('headcount_vs_sop')}
            className={`px-3 py-1.5 rounded transition-all ${
              reportType === 'headcount_vs_sop'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            2. So sánh Nhân lực vs SOP
          </button>
          <button
            onClick={() => setReportType('weekly_variance')}
            className={`px-3 py-1.5 rounded transition-all ${
              reportType === 'weekly_variance'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Biến động theo tuần ({prevCycleId} vs {selectedCycleId})
          </button>
          <button
            onClick={() => setReportType('risk_summary')}
            className={`px-3 py-1.5 rounded transition-all ${
              reportType === 'risk_summary'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Cảnh báo rủi ro & Tuân thủ
          </button>
        </div>
      </div>

      {/* REPORT CONTENT TABLES */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {/* REPORT 1: Chi tiết 23 vị trí */}
        {reportType === 'detailed_positions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Vendor</th>
                  <th className="py-2.5 px-3">Nhà máy</th>
                  <th className="py-2.5 px-3">Nhóm nghiệp vụ</th>
                  <th className="py-2.5 px-3">Vị trí chi tiết</th>
                  <th className="py-2.5 px-3 text-right">Chính thức</th>
                  <th className="py-2.5 px-3 text-right">Thời vụ</th>
                  <th className="py-2.5 px-3 text-right">Tổng số</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSubmissions.flatMap((sub) =>
                  sub.positions.map((p, pIdx) => (
                    <tr key={`${sub.id}-${pIdx}`} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-navy-950">{sub.vendor}</td>
                      <td className="py-2 px-3 text-slate-600">{sub.factory}</td>
                      <td className="py-2 px-3 font-semibold text-slate-700">{p.group}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{p.position}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700">
                        {p.official}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-amber-700">
                        {p.seasonal}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-navy-950">
                        {p.total}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 2: Nhân lực vs SOP */}
        {reportType === 'headcount_vs_sop' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-3">Nhà máy</th>
                  <th className="py-3 px-3 text-right">Tổng nhân lực</th>
                  <th className="py-3 px-3 text-right">Chính thức</th>
                  <th className="py-3 px-3 text-right">Thời vụ</th>
                  <th className="py-3 px-3 text-right">Tỷ lệ thời vụ</th>
                  <th className="py-3 px-3 text-right">Kế hoạch SOP</th>
                  <th className="py-3 px-3 text-center">Trạng thái nộp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-navy-950">{sub.vendor}</td>
                    <td className="py-3 px-3 font-medium text-slate-700">{sub.factory}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-navy-950 text-sm">
                      {sub.totalHeadcount}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700">
                      {sub.totalOfficial}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-amber-700">
                      {sub.totalSeasonal}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      {sub.seasonalRatio}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-purple-700">
                      {sub.sop?.sopPlanQty ? `${sub.sop.sopPlanQty.toLocaleString()} ${sub.sop.unit}` : '—'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 3: Biến động qua các tuần */}
        {reportType === 'weekly_variance' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Vendor & Nhà máy</th>
                  <th className="py-3 px-3 text-right">Quân số {prevCycleId}</th>
                  <th className="py-3 px-3 text-right">Quân số {selectedCycleId}</th>
                  <th className="py-3 px-3 text-right font-bold">Biến động Nhân lực</th>
                  <th className="py-3 px-3 text-right">SOP {prevCycleId}</th>
                  <th className="py-3 px-3 text-right">SOP {selectedCycleId}</th>
                  <th className="py-3 px-3 text-right font-bold">Biến động SOP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSubmissions.map((sub) => {
                  const prev = submissions.find(
                    (s) =>
                      s.cycleId === prevCycleId &&
                      s.vendor === sub.vendor &&
                      s.factory === sub.factory
                  );

                  const deltaWorkforce =
                    prev && prev.totalHeadcount > 0
                      ? Math.round(
                          ((sub.totalHeadcount - prev.totalHeadcount) /
                            prev.totalHeadcount) *
                            1000
                        ) / 10
                      : null;

                  const deltaSOP =
                    prev && prev.sop?.sopPlanQty > 0
                      ? Math.round(
                          ((sub.sop.sopPlanQty - prev.sop.sopPlanQty) /
                            prev.sop.sopPlanQty) *
                            1000
                        ) / 10
                      : null;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <strong className="text-navy-950">{sub.vendor}</strong> —{' '}
                        <span className="text-slate-500">{sub.factory}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {prev?.totalHeadcount || '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-navy-950">
                        {sub.totalHeadcount}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black">
                        {deltaWorkforce !== null ? (
                          <span
                            className={
                              deltaWorkforce > 0
                                ? 'text-emerald-700'
                                : deltaWorkforce < 0
                                ? 'text-red-600'
                                : 'text-slate-600'
                            }
                          >
                            {deltaWorkforce > 0 ? `+${deltaWorkforce}%` : `${deltaWorkforce}%`}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {prev?.sop?.sopPlanQty ? prev.sop.sopPlanQty.toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-purple-700">
                        {sub.sop?.sopPlanQty ? sub.sop.sopPlanQty.toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black">
                        {deltaSOP !== null ? (
                          <span
                            className={
                              deltaSOP > 0
                                ? 'text-purple-700'
                                : deltaSOP < 0
                                ? 'text-amber-700'
                                : 'text-slate-600'
                            }
                          >
                            {deltaSOP > 0 ? `+${deltaSOP}%` : `${deltaSOP}%`}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 4: Cảnh báo rủi ro */}
        {reportType === 'risk_summary' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Đơn vị Vendor & Nhà máy</th>
                  <th className="py-3 px-3 text-center">Mức độ rủi ro</th>
                  <th className="py-3 px-3">Nguyên nhân cảnh báo</th>
                  <th className="py-3 px-3">Khuyến nghị xử lý</th>
                  <th className="py-3 px-3 text-center">Ngày đánh giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {riskAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-emerald-600 font-semibold">
                      Không có cảnh báo rủi ro nào cho kỳ báo cáo này.
                    </td>
                  </tr>
                ) : (
                  riskAlerts.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-navy-950">
                        {r.vendor} — {r.factory}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.riskLevel === 'CAO'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : r.riskLevel === 'TRUNG BÌNH'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {r.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{r.primaryReason}</td>
                      <td className="py-3 px-3 text-slate-600">{r.recommendation}</td>
                      <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-500">
                        {r.evaluatedAt}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

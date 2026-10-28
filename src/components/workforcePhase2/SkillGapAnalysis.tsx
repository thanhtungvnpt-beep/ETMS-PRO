import React, { useState, useMemo } from 'react';
import {
  SkillItem,
  EmployeeProfile,
  SkillAssessmentRecord,
  EmployeeCertification,
  SkillGapItem,
  SkillDeficitWarningTicket,
} from '../../types/workforcePhase2';
import {
  getStoredSkills,
  getStoredEmployees,
  getStoredAssessments,
  getStoredCertifications,
  computeSkillGaps,
  getStoredWarningTickets,
  saveStoredWarningTickets,
} from '../../services/workforcePhase2Storage';
import { VENDORS, FACTORIES, UserProfile } from '../../types';

interface Props {
  currentUser: UserProfile;
  onNavigateToAlerts?: () => void;
}

export const SkillGapAnalysis: React.FC<Props> = ({ currentUser, onNavigateToAlerts }) => {
  const [skills] = useState<SkillItem[]>(() => getStoredSkills());
  const [employees] = useState<EmployeeProfile[]>(() => getStoredEmployees());
  const [assessments] = useState<SkillAssessmentRecord[]>(() => getStoredAssessments());
  const [certifications] = useState<EmployeeCertification[]>(() => getStoredCertifications());
  const [warningTickets, setWarningTickets] = useState<SkillDeficitWarningTicket[]>(() => getStoredWarningTickets());

  // Filter states
  const [filterFactory, setFilterFactory] = useState<string>('ALL');
  const [filterVendor, setFilterVendor] = useState<string>('ALL');
  const [filterCriticality, setFilterCriticality] = useState<string>('ALL');
  const [onlyGaps, setOnlyGaps] = useState<boolean>(false);
  const [onlySinglePoint, setOnlySinglePoint] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  // Compute Skill Gaps using engine
  const allGaps = useMemo(() => {
    return computeSkillGaps(
      skills,
      employees,
      assessments,
      certifications,
      filterFactory,
      filterVendor
    );
  }, [skills, employees, assessments, certifications, filterFactory, filterVendor]);

  // Filtered Gaps
  const filteredGaps = useMemo(() => {
    return allGaps.filter((item) => {
      if (filterCriticality !== 'ALL' && item.criticality !== filterCriticality) return false;
      if (onlyGaps && item.gap <= 0) return false;
      if (onlySinglePoint && !item.singlePointOfFailure) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesSkill = item.skillName.toLowerCase().includes(term);
        const matchesCode = item.skillCode.toLowerCase().includes(term);
        const matchesPos = item.position.toLowerCase().includes(term);
        if (!matchesSkill && !matchesCode && !matchesPos) return false;
      }
      return true;
    });
  }, [allGaps, filterCriticality, onlyGaps, onlySinglePoint, searchTerm]);

  // Summary KPIs
  const gapStats = useMemo(() => {
    const totalAssessedSlots = allGaps.length;
    const totalDeficitSlots = allGaps.filter((g) => g.gap > 0).length;
    const totalSinglePoints = allGaps.filter((g) => g.singlePointOfFailure).length;
    const totalDemand = allGaps.reduce((acc, g) => acc + g.demandHeadcount, 0);
    const totalQualified = allGaps.reduce((acc, g) => acc + g.qualifiedHeadcount, 0);
    const overallRate = totalDemand > 0 ? Math.round((totalQualified / totalDemand) * 1000) / 10 : 100;

    return {
      totalAssessedSlots,
      totalDeficitSlots,
      totalSinglePoints,
      totalDemand,
      totalQualified,
      overallRate,
    };
  }, [allGaps]);

  // Vendor comparison breakdown
  const vendorBreakdown = useMemo(() => {
    const map = new Map<string, { totalDemand: number; totalQualified: number; gaps: number; singlePoints: number }>();
    VENDORS.forEach((v) => {
      map.set(v, { totalDemand: 0, totalQualified: 0, gaps: 0, singlePoints: 0 });
    });

    allGaps.forEach((g) => {
      const cur = map.get(g.vendor);
      if (cur) {
        cur.totalDemand += g.demandHeadcount;
        cur.totalQualified += g.qualifiedHeadcount;
        if (g.gap > 0) cur.gaps += g.gap;
        if (g.singlePointOfFailure) cur.singlePoints += 1;
      }
    });

    return Array.from(map.entries()).map(([vendor, stats]) => {
      const rate = stats.totalDemand > 0 ? Math.round((stats.totalQualified / stats.totalDemand) * 100) : 100;
      return {
        vendor,
        ...stats,
        rate,
      };
    });
  }, [allGaps]);

  // Quick Create Deficit Ticket from gap item
  const handleCreateTicketFromGap = (item: SkillGapItem) => {
    const existing = warningTickets.find(
      (t) =>
        t.vendor === item.vendor &&
        t.factory === item.factory &&
        t.skillCode === item.skillCode &&
        t.status !== 'ĐÃ GIẢI QUYẾT' &&
        t.status !== 'ĐÓNG'
    );

    if (existing) {
      showToast(`Đã tồn tại phiếu cảnh báo ${existing.code} cho kỹ năng này.`, 'error');
      return;
    }

    const newTicket: SkillDeficitWarningTicket = {
      id: `WRN-${Date.now().toString().slice(-6)}`,
      code: `WRN-GAP-${Date.now().toString().slice(-4)}`,
      type: item.singlePointOfFailure ? 'ĐIỂM_NGHẼN_DUY_NHẤT' : 'THIẾU_HỤT_NGHIÊM_TRỌNG',
      vendor: item.vendor,
      factory: item.factory,
      group: 'Sản xuất',
      position: item.position,
      skillCode: item.skillCode,
      skillName: item.skillName,
      severity: item.criticality === 'BẮT BUỘC' || item.gap >= 3 ? 'CAO' : 'TRUNG BÌNH',
      demand: item.demandHeadcount,
      qualified: item.qualifiedHeadcount,
      gap: item.gap,
      rootCause: item.singlePointOfFailure
        ? 'Chỉ có duy nhất 1 nhân sự đạt chứng chỉ / cấp độ L2+. Nguy cơ dừng chuyền nếu nhân sự vắng mặt.'
        : `Thiếu ${item.gap} nhân sự đạt chuẩn so với định mức vận hành.`,
      recommendedAction: 'Khởi tạo ngay kế hoạch đào tạo kèm cặp và sắp xếp nhân sự dự phòng.',
      assignedTo: `Trưởng nhóm Kỹ thuật ${item.vendor}`,
      deadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      status: 'MỚI',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const updated = [newTicket, ...warningTickets];
    setWarningTickets(updated);
    saveStoredWarningTickets(updated);
    showToast(`Đã phát hành phiếu cảnh báo ${newTicket.code} thành công.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 border shadow-lg flex items-center gap-3 text-sm font-semibold transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : 'bg-rose-900 text-rose-100 border-rose-700'
          }`}
        >
          <span>{notification.type === 'success' ? '✓' : '⚠'}</span>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#0c2340] text-white p-5 border-l-4 border-amber-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 bg-amber-600/40 text-amber-200 border border-amber-400/40">
              MODULE F • SKILL GAP INTELLIGENCE
            </span>
            <span className="text-xs text-slate-300">Tính toán & Đo lường khoảng cách năng lực thực tế</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mt-1 text-white">
            PHÂN TÍCH THIẾU HỤT KỸ NĂNG & ĐIỂM NGHẼN VẬN HÀNH (SKILL GAPS)
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Áp dụng công thức: <span className="font-mono text-amber-300">Gap = MAX(0, Nhu cầu - Thực tế đạt chuẩn)</span>. Tự động nhận diện điểm nghẽn rủi ro khi chỉ có ≤ 1 nhân sự đáp ứng.
          </p>
        </div>

        {onNavigateToAlerts && (
          <button
            onClick={onNavigateToAlerts}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
          >
            <span>🚨</span>
            <span>XEM BẢNG PHIẾU CẢNH BÁO ({warningTickets.filter(t => t.status !== 'ĐÃ GIẢI QUYẾT' && t.status !== 'ĐÓNG').length})</span>
          </button>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-blue-600">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tỷ lệ đáp ứng chuẩn chung</div>
          <div className="text-2xl font-black text-blue-900 mt-1">{gapStats.overallRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {gapStats.totalQualified} / {gapStats.totalDemand} định mức yêu cầu
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-rose-600">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vị trí thiếu hụt kỹ năng</div>
          <div className="text-2xl font-black text-rose-700 mt-1">{gapStats.totalDeficitSlots}</div>
          <div className="text-[11px] text-rose-600 mt-1">Cần bổ sung đào tạo hoặc tuyển gấp</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-amber-500">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Điểm nghẽn duy nhất (SPOF)</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{gapStats.totalSinglePoints}</div>
          <div className="text-[11px] text-amber-700 mt-1">Kỹ năng phụ thuộc chỉ đúng 1 người</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-slate-600">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng cặp Kỹ năng - Dây chuyền</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{gapStats.totalAssessedSlots}</div>
          <div className="text-[11px] text-slate-500 mt-1">Được giám sát liên tục theo SOP</div>
        </div>
      </div>

      {/* Cross-Vendor Fulfillment Comparison Bar Chart */}
      <div className="bg-white border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between border-b pb-2 mb-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            So sánh Tỷ lệ Đáp ứng Năng lực Chuẩn giữa 7 Vendor
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Mục tiêu tối thiểu: &gt; 85% nhân sự đạt chuẩn L2+
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {vendorBreakdown.map((vb) => {
            const isCritical = vb.rate < 60;
            const isWarning = vb.rate >= 60 && vb.rate < 80;

            return (
              <div
                key={vb.vendor}
                className={`p-3 border transition-colors ${
                  isCritical
                    ? 'border-rose-300 bg-rose-50/50'
                    : isWarning
                    ? 'border-amber-300 bg-amber-50/50'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 truncate">{vb.vendor}</div>
                <div className="flex items-baseline justify-between mt-2">
                  <span
                    className={`text-lg font-black font-mono ${
                      isCritical ? 'text-rose-700' : isWarning ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    {vb.rate}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {vb.totalQualified}/{vb.totalDemand}
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2 mt-1.5 overflow-hidden">
                  <div
                    className={`h-2 transition-all ${
                      isCritical ? 'bg-rose-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, vb.rate)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-slate-200">
                  <span>Thiếu: <strong className="text-rose-700">{vb.gaps}</strong></span>
                  <span>SPOF: <strong className="text-amber-700">{vb.singlePoints}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Factory filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Nhà máy:</label>
            <select
              value={filterFactory}
              onChange={(e) => setFilterFactory(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 bg-white font-medium focus:outline-none"
            >
              <option value="ALL">Tất cả nhà máy</option>
              {FACTORIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Vendor:</label>
            <select
              value={filterVendor}
              onChange={(e) => setFilterVendor(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 bg-white font-medium focus:outline-none"
            >
              <option value="ALL">Tất cả 7 Vendor</option>
              {VENDORS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Criticality filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Độ trọng yếu:</label>
            <select
              value={filterCriticality}
              onChange={(e) => setFilterCriticality(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 bg-white font-medium focus:outline-none"
            >
              <option value="ALL">Tất cả</option>
              <option value="BẮT BUỘC">Bắt buộc</option>
              <option value="QUAN TRỌNG">Quan trọng</option>
              <option value="TIÊU CHUẨN">Tiêu chuẩn</option>
              <option value="BỔ TRỢ">Bổ trợ</option>
            </select>
          </div>

          {/* Quick toggle check boxes */}
          <label className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyGaps}
              onChange={(e) => setOnlyGaps(e.target.checked)}
              className="accent-rose-600"
            />
            <span>Chỉ vị trí đang thiếu hụt (Gap &gt; 0)</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 cursor-pointer">
            <input
              type="checkbox"
              checked={onlySinglePoint}
              onChange={(e) => setOnlySinglePoint(e.target.checked)}
              className="accent-amber-600"
            />
            <span>Chỉ điểm nghẽn duy nhất (SPOF)</span>
          </label>
        </div>

        {/* Search */}
        <div className="w-full md:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo kỹ năng, vị trí..."
            className="w-full px-3 py-1.5 text-xs border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Breakdown Table */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Chi tiết Khoảng cách Năng lực Kỹ thuật ({filteredGaps.length} vị trí)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Dữ liệu tổng hợp từ các chứng chỉ còn hiệu lực & đánh giá đã được HR phê duyệt
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#0c2340] text-slate-200 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3">Vendor / Nhà máy</th>
                <th className="py-2.5 px-3">Vị trí công việc</th>
                <th className="py-2.5 px-3">Kỹ năng nghiệp vụ</th>
                <th className="py-2.5 px-3 text-center">Độ trọng yếu</th>
                <th className="py-2.5 px-3 text-center">Mức yêu cầu</th>
                <th className="py-2.5 px-3 text-center">Nhu cầu (Demand)</th>
                <th className="py-2.5 px-3 text-center">Đạt chuẩn (Qualified)</th>
                <th className="py-2.5 px-3 text-center">Thiếu hụt (Gap)</th>
                <th className="py-2.5 px-3 text-center">% Đáp ứng</th>
                <th className="py-2.5 px-3 text-center">Cảnh báo rủi ro</th>
                <th className="py-2.5 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredGaps.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 italic">
                    Không tìm thấy khoảng cách kỹ năng nào theo điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredGaps.map((item, idx) => {
                  const hasGap = item.gap > 0;
                  const isSPOF = item.singlePointOfFailure;

                  return (
                    <tr
                      key={`${item.vendor}-${item.factory}-${item.skillCode}-${item.position}-${idx}`}
                      className={`hover:bg-slate-50 transition-colors ${
                        isSPOF ? 'bg-amber-50/40' : hasGap ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-blue-900">{item.vendor}</span>
                        <span className="text-slate-400 mx-1">•</span>
                        <span className="text-slate-600">{item.factory}</span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {item.position}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{item.skillName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.skillCode}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold border ${
                            item.criticality === 'BẮT BUỘC'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : item.criticality === 'QUAN TRỌNG'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {item.criticality}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-900">
                        L{item.requiredLevel}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                        {item.demandHeadcount}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                        {item.qualifiedHeadcount}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        {hasGap ? (
                          <span className="text-rose-700 text-sm">-{item.gap}</span>
                        ) : (
                          <span className="text-emerald-600">0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        <span
                          className={
                            item.fulfillmentRatePct < 60
                              ? 'text-rose-700'
                              : item.fulfillmentRatePct < 100
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }
                        >
                          {item.fulfillmentRatePct}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isSPOF ? (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-400 animate-pulse">
                            ⚠️ SPOF (1 NGƯỜI)
                          </span>
                        ) : hasGap ? (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            THIẾU HỤT
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ĐẠT CHUẨN
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {hasGap || isSPOF ? (
                          <button
                            onClick={() => handleCreateTicketFromGap(item)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition-colors"
                            title="Tạo phiếu cảnh báo thiếu hụt vào Module G"
                          >
                            Tạo cảnh báo
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">Ổn định</span>
                        )}
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

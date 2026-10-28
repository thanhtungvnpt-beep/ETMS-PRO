import React, { useMemo } from 'react';
import {
  getStoredSkills,
  getStoredEmployees,
  getStoredAssessments,
  getStoredCertifications,
  getStoredTrainingPlans,
  getStoredWarningTickets,
  calculatePhase2KPIs,
  calculateTenureMonths,
  getSeniorityBracket,
} from '../../services/workforcePhase2Storage';
import { SKILL_LEVEL_DEFINITIONS, SkillLevel } from '../../types/workforcePhase2';
import { VENDORS, UserProfile } from '../../types';

interface Props {
  currentUser: UserProfile;
  onNavigateToView: (view: string) => void;
}

export const Phase2IntelligenceDashboard: React.FC<Props> = ({ currentUser, onNavigateToView }) => {
  const skills = useMemo(() => getStoredSkills(), []);
  const employees = useMemo(() => getStoredEmployees(), []);
  const assessments = useMemo(() => getStoredAssessments(), []);
  const certifications = useMemo(() => getStoredCertifications(), []);
  const trainingPlans = useMemo(() => getStoredTrainingPlans(), []);
  const warningTickets = useMemo(() => getStoredWarningTickets(), []);

  // Compute Master KPIs
  const kpis = useMemo(() => {
    return calculatePhase2KPIs(employees, skills, assessments, certifications, trainingPlans, warningTickets);
  }, [employees, skills, assessments, certifications, trainingPlans, warningTickets]);

  // Seniority Bracket Breakdown
  const seniorityStats = useMemo(() => {
    const counts = {
      '< 3 tháng': 0,
      '3 - 12 tháng': 0,
      '1 - 3 năm': 0,
      '> 3 năm': 0,
    };

    employees.forEach((emp) => {
      const bracket = getSeniorityBracket(emp.hireDate);
      counts[bracket]++;
    });

    const total = employees.length || 1;
    return {
      under3m: { count: counts['< 3 tháng'], pct: Math.round((counts['< 3 tháng'] / total) * 100) },
      from3to12m: { count: counts['3 - 12 tháng'], pct: Math.round((counts['3 - 12 tháng'] / total) * 100) },
      from1to3y: { count: counts['1 - 3 năm'], pct: Math.round((counts['1 - 3 năm'] / total) * 100) },
      over3y: { count: counts['> 3 năm'], pct: Math.round((counts['> 3 năm'] / total) * 100) },
    };
  }, [employees]);

  // Skill Level Distribution L0 - L4
  const skillLevelDistribution = useMemo(() => {
    const counts: Record<SkillLevel, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    assessments.forEach((asm) => {
      const level = asm.verificationStatus === 'ĐÃ XÁC NHẬN ĐẠT' ? asm.approvedLevel : asm.proposedLevel;
      counts[level] = (counts[level] || 0) + 1;
    });

    const total = assessments.length || 1;
    return ([0, 1, 2, 3, 4] as SkillLevel[]).map((lvl) => ({
      level: lvl,
      def: SKILL_LEVEL_DEFINITIONS[lvl],
      count: counts[lvl] || 0,
      pct: Math.round(((counts[lvl] || 0) / total) * 100),
    }));
  }, [assessments]);

  // 7 Vendor Cross-Comparison Matrix
  const vendorPerformance = useMemo(() => {
    return VENDORS.map((vName) => {
      const vEmps = employees.filter((e) => e.vendor === vName);
      const vEmpIds = new Set(vEmps.map((e) => e.id));
      const vAsms = assessments.filter((a) => vEmpIds.has(a.employeeId));
      const vApproved = vAsms.filter((a) => a.verificationStatus === 'ĐÃ XÁC NHẬN ĐẠT' && a.approvedLevel >= 2);
      const vTickets = warningTickets.filter((t) => t.vendor === vName && t.status !== 'ĐÃ GIẢI QUYẾT' && t.status !== 'ĐÓNG');
      const vCerts = certifications.filter((c) => vEmpIds.has(c.employeeId));
      const vExpiringCerts = vCerts.filter((c) => c.verificationStatus === 'SẮP HẾT HẠN' || c.verificationStatus === 'HẾT HẠN');

      // Avg tenure months
      let totalTenureMonths = 0;
      let validTenureCount = 0;
      vEmps.forEach((e) => {
        const m = calculateTenureMonths(e.hireDate);
        if (m !== null) {
          totalTenureMonths += m;
          validTenureCount++;
        }
      });
      const avgTenureMonths = validTenureCount > 0 ? Math.round(totalTenureMonths / validTenureCount) : 0;
      const avgTenureStr =
        avgTenureMonths < 12
          ? `${avgTenureMonths} tháng`
          : `${(avgTenureMonths / 12).toFixed(1)} năm`;

      const qualifiedRate = vAsms.length > 0 ? Math.round((vApproved.length / vAsms.length) * 100) : 0;

      return {
        vendor: vName,
        totalEmployees: vEmps.length,
        avgTenureStr,
        assessedRecords: vAsms.length,
        qualifiedRate,
        openWarnings: vTickets.length,
        criticalWarnings: vTickets.filter((t) => t.severity === 'CAO').length,
        expiringCerts: vExpiringCerts.length,
      };
    });
  }, [employees, assessments, warningTickets, certifications]);

  // Critical Alerts list for quick view
  const urgentAlerts = useMemo(() => {
    return warningTickets
      .filter((t) => t.status !== 'ĐÃ GIẢI QUYẾT' && t.status !== 'ĐÓNG')
      .sort((a, b) => (a.severity === 'CAO' ? -1 : 1))
      .slice(0, 4);
  }, [warningTickets]);

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="bg-[#0c2340] text-white p-5 border-l-4 border-blue-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 bg-blue-600/40 text-blue-200 border border-blue-400/40">
              EXECUTIVE INTELLIGENCE • PHASE 2
            </span>
            <span className="text-xs text-slate-300">Hệ thống Điều hành Năng lực & Thâm niên Nhân lực</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mt-1 text-white">
            WORKFORCE INTELLIGENCE: SENIORITY & SKILL MATRIX
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Báo cáo điều hành đánh giá thâm niên, phân bổ tay nghề L0 - L4, thẩm định năng lực bởi HR và quản trị rủi ro thiếu hụt kỹ năng 7 Vendor.
          </p>
        </div>

        {/* Quick actions button group */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateToView('workforce-verification')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>⚖</span>
            <span>HÀNG ĐỢI DUYỆT HR ({kpis.pendingVerificationCount})</span>
          </button>
          <button
            onClick={() => onNavigateToView('workforce-alerts')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>🚨</span>
            <span>CẢNH BÁO NÓNG ({kpis.activeWarningTicketsCount})</span>
          </button>
        </div>
      </div>

      {/* 6 Executive Strategic KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {/* Total Profiles */}
        <div className="bg-white border border-slate-200 p-3.5 shadow-sm border-t-2 border-t-blue-600">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Hồ sơ số hóa chi tiết</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{kpis.totalEmployees}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            {kpis.officialCount} chính thức • {kpis.seasonalCount} thời vụ
          </div>
        </div>

        {/* Assessed Rate */}
        <div className="bg-white border border-slate-200 p-3.5 shadow-sm border-t-2 border-t-indigo-600">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tỷ lệ đã khảo sát tay nghề</div>
          <div className="text-2xl font-black text-indigo-700 mt-1">{kpis.assessedRatePct}%</div>
          <div className="text-[10px] text-indigo-600 mt-0.5 font-mono">
            {kpis.assessedCount} nhân sự có dữ liệu
          </div>
        </div>

        {/* Qualified Rate */}
        <div className="bg-white border border-slate-200 p-3.5 shadow-sm border-t-2 border-t-emerald-600">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tỷ lệ đạt chuẩn L2+ (HR duyệt)</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{kpis.qualifiedRatePct}%</div>
          <div className="text-[10px] text-emerald-600 mt-0.5 font-mono">
            Độc lập thao tác theo SOP
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-white border border-slate-200 p-3.5 shadow-sm border-t-2 border-t-rose-600">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Vị trí thiếu hụt kỹ năng</div>
          <div className="text-2xl font-black text-rose-700 mt-1">{kpis.missingSkillsCount}</div>
          <div className="text-[10px] text-rose-600 mt-0.5 font-mono">
            Gap &gt; 0 so với định mức
          </div>
        </div>

        {/* SPOF (Single Point of Failure) */}
        <div className="bg-white border border-slate-200 p-3.5 shadow-sm border-t-2 border-t-amber-500">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Điểm nghẽn rủi ro (SPOF)</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{kpis.singlePointOfFailureCount}</div>
          <div className="text-[10px] text-amber-700 mt-0.5 font-mono">
            Phụ thuộc duy nhất 1 người
          </div>
        </div>

        {/* Pending HR Verification */}
        <div className="bg-white border border-slate-200 p-3.5 shadow-sm border-t-2 border-t-purple-600">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Chờ HR phê duyệt cấp độ</div>
          <div className="text-2xl font-black text-purple-700 mt-1">{kpis.pendingVerificationCount}</div>
          <div className="text-[10px] text-purple-600 mt-0.5 font-mono">
            Đang nằm trong hàng đợi
          </div>
        </div>
      </div>

      {/* Seniority Distribution & Skill Level Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Module A Summary: Seniority Brackets */}
        <div className="bg-white border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-2 mb-3">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Cơ cấu Thâm niên Nhân lực 7 Vendor (Seniority Brackets)
              </span>
              <p className="text-[11px] text-slate-500">
                Tính toán chính xác theo ngày ký HĐLĐ (Tenure tách biệt với Tay nghề)
              </p>
            </div>
            <button
              onClick={() => onNavigateToView('workforce-seniority')}
              className="text-xs text-blue-700 hover:text-blue-900 font-bold"
            >
              Xem chi tiết →
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {/* < 3 months */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">&lt; 3 tháng (Mới tuyển / Thử việc)</span>
                <span className="font-mono text-slate-900 font-bold">
                  {seniorityStats.under3m.count} nhân sự ({seniorityStats.under3m.pct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5">
                <div
                  className="bg-amber-400 h-2.5"
                  style={{ width: `${seniorityStats.under3m.pct}%` }}
                />
              </div>
            </div>

            {/* 3 - 12 months */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">3 - 12 tháng (Dưới 1 năm kinh nghiệm)</span>
                <span className="font-mono text-slate-900 font-bold">
                  {seniorityStats.from3to12m.count} nhân sự ({seniorityStats.from3to12m.pct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5">
                <div
                  className="bg-blue-400 h-2.5"
                  style={{ width: `${seniorityStats.from3to12m.pct}%` }}
                />
              </div>
            </div>

            {/* 1 - 3 years */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">1 - 3 năm (Ổn định, nòng cốt vận hành)</span>
                <span className="font-mono text-slate-900 font-bold">
                  {seniorityStats.from1to3y.count} nhân sự ({seniorityStats.from1to3y.pct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5">
                <div
                  className="bg-emerald-500 h-2.5"
                  style={{ width: `${seniorityStats.from1to3y.pct}%` }}
                />
              </div>
            </div>

            {/* > 3 years */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-700">&gt; 3 năm (Thâm niên cao / Tiềm năng Trainer)</span>
                <span className="font-mono text-slate-900 font-bold">
                  {seniorityStats.over3y.count} nhân sự ({seniorityStats.over3y.pct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5">
                <div
                  className="bg-purple-600 h-2.5"
                  style={{ width: `${seniorityStats.over3y.pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Module C Summary: Skill Levels L0 - L4 */}
        <div className="bg-white border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-2 mb-3">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Phân bổ Cấp độ Tay nghề Chuẩn (Thang đo 0 - 4)
              </span>
              <p className="text-[11px] text-slate-500">
                L0: Chưa đánh giá • L1: Kèm cặp • L2: Chuẩn SOP • L3: Độc lập • L4: Chuyên gia
              </p>
            </div>
            <button
              onClick={() => onNavigateToView('workforce-matrix')}
              className="text-xs text-blue-700 hover:text-blue-900 font-bold"
            >
              Mở ma trận →
            </button>
          </div>

          <div className="space-y-2.5 pt-1">
            {skillLevelDistribution.map((item) => (
              <div key={item.level} className="text-xs">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold font-mono border ${item.def.bgClass} ${item.def.borderClass}`}
                    >
                      {item.def.code}
                    </span>
                    <span className="font-semibold text-slate-800">{item.def.name}</span>
                  </div>
                  <span className="font-mono text-slate-900 font-bold">
                    {item.count} lượt ({item.pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2">
                  <div
                    className="h-2 transition-all"
                    style={{
                      width: `${item.pct}%`,
                      backgroundColor: item.def.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7 Vendor Comprehensive Scorecard Table */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Bảng Điều hành Năng lực Tổng hợp theo 7 Vendor
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Đánh giá đồng thời Thâm niên trung bình, Tỷ lệ đạt chuẩn L2+ và Cảnh báo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#0c2340] text-slate-200 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3">Tên Vendor</th>
                <th className="py-2.5 px-3 text-center">Hồ sơ số hóa</th>
                <th className="py-2.5 px-3 text-center">Thâm niên TB</th>
                <th className="py-2.5 px-3 text-center">Lượt đánh giá</th>
                <th className="py-2.5 px-3 text-center">Tỷ lệ đạt chuẩn (L2+)</th>
                <th className="py-2.5 px-3 text-center">Chứng chỉ sắp/đã hết hạn</th>
                <th className="py-2.5 px-3 text-center">Phiếu cảnh báo mở</th>
                <th className="py-2.5 px-3 text-center">Mức rủi ro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {vendorPerformance.map((vp) => {
                const isHighRisk = vp.criticalWarnings > 0 || vp.qualifiedRate < 60;
                const isMediumRisk = vp.openWarnings > 0 || vp.qualifiedRate < 80;

                return (
                  <tr key={vp.vendor} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {vp.vendor}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-800">
                      {vp.totalEmployees}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                      {vp.avgTenureStr}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                      {vp.assessedRecords}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      <span
                        className={
                          vp.qualifiedRate >= 80
                            ? 'text-emerald-700'
                            : vp.qualifiedRate >= 60
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }
                      >
                        {vp.qualifiedRate}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold">
                      {vp.expiringCerts > 0 ? (
                        <span className="text-amber-700">{vp.expiringCerts} CC</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold">
                      {vp.openWarnings > 0 ? (
                        <span className={vp.criticalWarnings > 0 ? 'text-rose-700' : 'text-amber-700'}>
                          {vp.openWarnings} phiếu
                        </span>
                      ) : (
                        <span className="text-emerald-700">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isHighRisk ? (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          RỦI RO CAO
                        </span>
                      ) : isMediumRisk ? (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          THEO DÕI
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          AN TOÀN
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Urgent Warning Tickets & Quick Module Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Urgent tickets box */}
        <div className="md:col-span-2 bg-white border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-2 mb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              🚨 Phiếu Cảnh báo Cần Xử lý Ngay ({urgentAlerts.length})
            </span>
            <button
              onClick={() => onNavigateToView('workforce-alerts')}
              className="text-xs text-rose-700 hover:text-rose-900 font-bold"
            >
              Xem tất cả ({kpis.activeWarningTicketsCount}) →
            </button>
          </div>

          <div className="space-y-2">
            {urgentAlerts.length === 0 ? (
              <div className="py-6 text-center text-slate-400 italic text-xs">
                Không có phiếu cảnh báo nghiêm trọng nào đang chờ xử lý.
              </div>
            ) : (
              urgentAlerts.map((t) => (
                <div
                  key={t.id}
                  className="p-3 border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 bg-slate-200 px-1.5 py-0.5 text-[10px]">
                        {t.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 border ${
                          t.severity === 'CAO'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {t.severity}
                      </span>
                      <span className="font-semibold text-blue-900">{t.vendor}</span>
                    </div>
                    <div className="font-bold text-slate-900">{t.skillName}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{t.rootCause}</div>
                  </div>

                  <div className="text-right whitespace-nowrap">
                    <div className="text-[10px] text-slate-400 font-mono">Hạn chót:</div>
                    <div className="font-mono font-bold text-rose-700 text-xs">{t.deadline}</div>
                    <button
                      onClick={() => onNavigateToView('workforce-alerts')}
                      className="mt-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-300"
                    >
                      Xử lý
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Module Navigation Box */}
        <div className="bg-white border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="border-b pb-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Điều hướng Nhanh Phân hệ Phase 2
            </span>
            <p className="text-[11px] text-slate-500">Truy cập trực tiếp các mô-đun chức năng</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onNavigateToView('workforce-seniority')}
              className="w-full text-left p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-900">Module A: Hồ sơ Thâm niên</div>
                <div className="text-[10px] text-slate-500">Quản lý ngày vào, thâm niên & hợp đồng</div>
              </div>
              <span className="text-slate-400 font-mono text-sm">→</span>
            </button>

            <button
              onClick={() => onNavigateToView('workforce-matrix')}
              className="w-full text-left p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-900">Module C: Ma trận Kỹ năng</div>
                <div className="text-[10px] text-slate-500">Lưới trực quan cấp độ L0 - L4</div>
              </div>
              <span className="text-slate-400 font-mono text-sm">→</span>
            </button>

            <button
              onClick={() => onNavigateToView('workforce-verification')}
              className="w-full text-left p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-900">Module D: Xác nhận Năng lực (HR)</div>
                <div className="text-[10px] text-slate-500">Duyệt cấp độ chính thức có lý do</div>
              </div>
              <span className="text-slate-400 font-mono text-sm">→</span>
            </button>

            <button
              onClick={() => onNavigateToView('workforce-certs')}
              className="w-full text-left p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-900">Module E: Chứng chỉ & Đào tạo</div>
                <div className="text-[10px] text-slate-500">Theo dõi thời hạn bằng nghề & lộ trình</div>
              </div>
              <span className="text-slate-400 font-mono text-sm">→</span>
            </button>

            <button
              onClick={() => onNavigateToView('workforce-gaps')}
              className="w-full text-left p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-900">Module F: Phân tích Thiếu hụt</div>
                <div className="text-[10px] text-slate-500">So sánh Nhu cầu vs Đạt chuẩn, SPOF</div>
              </div>
              <span className="text-slate-400 font-mono text-sm">→</span>
            </button>

            <button
              onClick={() => onNavigateToView('workforce-skills')}
              className="w-full text-left p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-900">Module B: Từ điển Kỹ năng Chuẩn</div>
                <div className="text-[10px] text-slate-500">Cấu hình tiêu chuẩn theo 23 vị trí</div>
              </div>
              <span className="text-slate-400 font-mono text-sm">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

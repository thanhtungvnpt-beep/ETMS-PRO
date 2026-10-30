import {
  ReportingCycleConfig,
  WeeklyWorkforceSubmission,
  WorkforceReminderTask,
  WorkforceRiskAlert,
  VendorName,
  FactoryName,
  RiskLevel,
  WorkforcePositionCount,
} from '../types/workforce';
import {
  INITIAL_REPORTING_CYCLES,
  INITIAL_WORKFORCE_SUBMISSIONS,
  INITIAL_WORKFORCE_REMINDERS,
} from '../data/mockWorkforceData';

const WORKFORCE_STORAGE_KEYS = {
  CYCLES: 'etms_workforce_cycles_v1',
  SUBMISSIONS: 'etms_workforce_submissions_v1',
  REMINDERS: 'etms_workforce_reminders_v1',
  THRESHOLDS: 'etms_workforce_thresholds_v1',
};

export interface RiskThresholds {
  seasonalHighThreshold: number; // e.g. 40%
  seasonalMediumThreshold: number; // e.g. 30%
  sopSpikeThreshold: number; // e.g. 15%
  workforceDropThreshold: number; // e.g. 5%
}

export const DEFAULT_THRESHOLDS: RiskThresholds = {
  seasonalHighThreshold: 40,
  seasonalMediumThreshold: 30,
  sopSpikeThreshold: 15,
  workforceDropThreshold: 5,
};

export const getStoredWorkforceCycles = (): ReportingCycleConfig[] => {
  try {
    const raw = localStorage.getItem(WORKFORCE_STORAGE_KEYS.CYCLES);
    if (!raw) {
      localStorage.setItem(
        WORKFORCE_STORAGE_KEYS.CYCLES,
        JSON.stringify(INITIAL_REPORTING_CYCLES)
      );
      return INITIAL_REPORTING_CYCLES;
    }
    const loaded: ReportingCycleConfig[] = JSON.parse(raw);
    // If missing any cycle from initial, merge them
    const existingIds = new Set(loaded.map((c) => c.id));
    const missing = INITIAL_REPORTING_CYCLES.filter((c) => !existingIds.has(c.id));
    if (missing.length > 0) {
      const merged = [...loaded, ...missing];
      localStorage.setItem(WORKFORCE_STORAGE_KEYS.CYCLES, JSON.stringify(merged));
      return merged;
    }
    return loaded;
  } catch (e) {
    console.error('Error loading workforce cycles', e);
    return INITIAL_REPORTING_CYCLES;
  }
};

export const saveStoredWorkforceCycles = (cycles: ReportingCycleConfig[]): void => {
  try {
    localStorage.setItem(WORKFORCE_STORAGE_KEYS.CYCLES, JSON.stringify(cycles));
  } catch (e) {
    console.error('Error saving workforce cycles', e);
  }
};

// 2. Submissions Storage
export const getStoredWorkforceSubmissions = (): WeeklyWorkforceSubmission[] => {
  try {
    const raw = localStorage.getItem(WORKFORCE_STORAGE_KEYS.SUBMISSIONS);
    if (!raw) {
      localStorage.setItem(
        WORKFORCE_STORAGE_KEYS.SUBMISSIONS,
        JSON.stringify(INITIAL_WORKFORCE_SUBMISSIONS)
      );
      return INITIAL_WORKFORCE_SUBMISSIONS;
    }
    const loaded: WeeklyWorkforceSubmission[] = JSON.parse(raw);
    // If missing historical cycles W13 or W14, merge them seamlessly
    const existingIds = new Set(loaded.map((s) => s.id));
    const missing = INITIAL_WORKFORCE_SUBMISSIONS.filter((s) => !existingIds.has(s.id));
    if (missing.length > 0) {
      const merged = [...loaded, ...missing];
      localStorage.setItem(WORKFORCE_STORAGE_KEYS.SUBMISSIONS, JSON.stringify(merged));
      return merged;
    }
    return loaded;
  } catch (e) {
    console.error('Error loading workforce submissions', e);
    return INITIAL_WORKFORCE_SUBMISSIONS;
  }
};

export const saveStoredWorkforceSubmissions = (
  submissions: WeeklyWorkforceSubmission[]
): void => {
  try {
    localStorage.setItem(
      WORKFORCE_STORAGE_KEYS.SUBMISSIONS,
      JSON.stringify(submissions)
    );
  } catch (e) {
    console.error('Error saving workforce submissions', e);
  }
};

// 3. Reminders Storage
export const getStoredWorkforceReminders = (): WorkforceReminderTask[] => {
  try {
    const raw = localStorage.getItem(WORKFORCE_STORAGE_KEYS.REMINDERS);
    if (!raw) {
      localStorage.setItem(
        WORKFORCE_STORAGE_KEYS.REMINDERS,
        JSON.stringify(INITIAL_WORKFORCE_REMINDERS)
      );
      return INITIAL_WORKFORCE_REMINDERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading workforce reminders', e);
    return INITIAL_WORKFORCE_REMINDERS;
  }
};

export const saveStoredWorkforceReminders = (
  reminders: WorkforceReminderTask[]
): void => {
  try {
    localStorage.setItem(
      WORKFORCE_STORAGE_KEYS.REMINDERS,
      JSON.stringify(reminders)
    );
  } catch (e) {
    console.error('Error saving workforce reminders', e);
  }
};

// 4. Thresholds Storage
export const getStoredWorkforceThresholds = (): RiskThresholds => {
  try {
    const raw = localStorage.getItem(WORKFORCE_STORAGE_KEYS.THRESHOLDS);
    if (!raw) {
      localStorage.setItem(
        WORKFORCE_STORAGE_KEYS.THRESHOLDS,
        JSON.stringify(DEFAULT_THRESHOLDS)
      );
      return DEFAULT_THRESHOLDS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_THRESHOLDS;
  }
};

export const saveStoredWorkforceThresholds = (thresholds: RiskThresholds): void => {
  localStorage.setItem(
    WORKFORCE_STORAGE_KEYS.THRESHOLDS,
    JSON.stringify(thresholds)
  );
};

// =========================================================================
// KPI CALCULATOR (Derived strictly from verified real stored data)
// =========================================================================

export interface WorkforceKPIs {
  totalHeadcount: number;
  totalOfficial: number;
  totalSeasonal: number;
  seasonalRatio: number; // in %
  totalSOP: number;
  submittedVendors: number;
  pendingVendors: number;
  overdueVendors: number;
  riskCount: number;
  byGroup: {
    adminHR: number;
    production: number;
    quality: number;
    equipment: number;
  };
  vendorCount: number;
}

export const calculateWorkforceKPIs = (
  submissions: WeeklyWorkforceSubmission[],
  selectedCycleId: string,
  filterVendor: string = 'ALL',
  filterFactory: string = 'ALL',
  filterGroup: string = 'ALL',
  filterContract: string = 'ALL', // 'ALL' | 'OFFICIAL' | 'SEASONAL'
  riskAlerts: WorkforceRiskAlert[] = []
): WorkforceKPIs => {
  // Filter relevant submissions for the cycle
  const currentSubmissions = submissions.filter((s) => {
    const matchCycle = s.cycleId === selectedCycleId;
    const matchVendor = filterVendor === 'ALL' || s.vendor === filterVendor;
    const matchFactory = filterFactory === 'ALL' || s.factory === filterFactory;
    return matchCycle && matchVendor && matchFactory;
  });

  let totalOfficial = 0;
  let totalSeasonal = 0;
  let totalSOP = 0;
  let adminHR = 0;
  let production = 0;
  let quality = 0;
  let equipment = 0;

  const vendorStatusMap = new Map<string, string>();

  currentSubmissions.forEach((sub) => {
    vendorStatusMap.set(`${sub.vendor}_${sub.factory}`, sub.status);

    // Sum SOP only once per submission
    if (sub.status !== 'OVERDUE') {
      totalSOP += sub.sop?.sopPlanQty || 0;
    }

    // Filter positions according to group & contract filters
    sub.positions.forEach((p) => {
      if (filterGroup !== 'ALL' && p.group !== filterGroup) return;

      const officialToAdd = filterContract === 'SEASONAL' ? 0 : p.official;
      const seasonalToAdd = filterContract === 'OFFICIAL' ? 0 : p.seasonal;

      totalOfficial += officialToAdd;
      totalSeasonal += seasonalToAdd;

      const subTotal = officialToAdd + seasonalToAdd;
      if (p.group === 'Hành chính nhân sự') adminHR += subTotal;
      if (p.group === 'Sản xuất') production += subTotal;
      if (p.group === 'Chất lượng') quality += subTotal;
      if (p.group === 'Thiết bị') equipment += subTotal;
    });
  });

  const totalHeadcount = totalOfficial + totalSeasonal;
  const seasonalRatio =
    totalHeadcount > 0 ? Math.round((totalSeasonal / totalHeadcount) * 1000) / 10 : 0;

  let submittedVendors = 0;
  let pendingVendors = 0;
  let overdueVendors = 0;

  vendorStatusMap.forEach((status) => {
    if (status === 'SUBMITTED' || status === 'CONFIRMED') submittedVendors++;
    else if (status === 'OVERDUE') overdueVendors++;
    else pendingVendors++;
  });

  // Count relevant risk alerts
  const cycleRisks = riskAlerts.filter((r) => {
    const matchCycle = r.cycleId === selectedCycleId;
    const matchVendor = filterVendor === 'ALL' || r.vendor === filterVendor;
    const matchFactory = filterFactory === 'ALL' || r.factory === filterFactory;
    return matchCycle && matchVendor && matchFactory && (r.riskLevel === 'CAO' || r.riskLevel === 'TRUNG BÌNH');
  });

  return {
    totalHeadcount,
    totalOfficial,
    totalSeasonal,
    seasonalRatio,
    totalSOP,
    submittedVendors,
    pendingVendors,
    overdueVendors,
    riskCount: cycleRisks.length,
    byGroup: {
      adminHR,
      production,
      quality,
      equipment,
    },
    vendorCount: vendorStatusMap.size,
  };
};

// =========================================================================
// PHASE 1 — RISK EVALUATION ENGINE (Early warning trends)
// =========================================================================

export const evaluateWorkforceRisks = (
  submissions: WeeklyWorkforceSubmission[],
  currentCycleId: string,
  previousCycleId: string,
  thresholds: RiskThresholds = DEFAULT_THRESHOLDS
): WorkforceRiskAlert[] => {
  const currentSubs = submissions.filter((s) => s.cycleId === currentCycleId);
  const alerts: WorkforceRiskAlert[] = [];

  currentSubs.forEach((sub) => {
    // Overdue submission is automatically high operational risk
    if (sub.status === 'OVERDUE') {
      alerts.push({
        id: `RISK-${sub.id}`,
        vendor: sub.vendor,
        factory: sub.factory,
        cycleId: currentCycleId,
        riskLevel: 'CAO',
        primaryReason: 'Chưa cập nhật số liệu nhân lực và SOP theo hạn định',
        detailedAnalysis:
          'Vendor không nộp số liệu trước thời hạn chốt tuần, gây gián đoạn công tác điều phối nhân lực và kiểm soát kế hoạch sản xuất tại nhà máy.',
        workforceDeltaPct: null,
        sopDeltaPct: null,
        seasonalRatio: 0,
        recommendation:
          'Gửi công văn đôn đốc khẩn cấp tới Ban giám đốc Vendor và lập danh sách theo dõi kỷ luật báo cáo.',
        evaluatedAt: new Date().toISOString().slice(0, 10),
      });
      return;
    }

    // Find corresponding previous cycle record for delta comparison
    const prevSub = submissions.find(
      (s) =>
        s.cycleId === previousCycleId &&
        s.vendor === sub.vendor &&
        s.factory === sub.factory
    );

    // Delta calculations with strict guard against division by zero
    let workforceDeltaPct: number | null = null;
    let sopDeltaPct: number | null = null;

    if (prevSub && prevSub.totalHeadcount > 0) {
      workforceDeltaPct =
        Math.round(
          ((sub.totalHeadcount - prevSub.totalHeadcount) / prevSub.totalHeadcount) *
            1000
        ) / 10;
    }

    if (prevSub && prevSub.sop?.sopPlanQty > 0) {
      sopDeltaPct =
        Math.round(
          ((sub.sop.sopPlanQty - prevSub.sop.sopPlanQty) / prevSub.sop.sopPlanQty) *
            1000
        ) / 10;
    }

    const seasonalRatio = sub.seasonalRatio;
    let riskLevel: RiskLevel = 'THẤP';
    let primaryReason = 'Chỉ số nhân sự và kế hoạch SOP nằm trong giới hạn an toàn';
    let detailedAnalysis =
      'Tỷ lệ lao động thời vụ ổn định, biến động nhân lực tương thích với nhịp độ sản xuất kế hoạch.';
    let recommendation = 'Duy trì theo dõi định kỳ theo quy chuẩn.';

    if (!prevSub) {
      riskLevel = 'CHƯA ĐỦ DỮ LIỆU';
      primaryReason = 'Chưa có dữ liệu kỳ liền trước để đối chiếu biến động';
      detailedAnalysis =
        'Hệ thống chưa ghi nhận báo cáo của tuần trước đó để tính toán độ lệch xu hướng. Chỉ số đang được đánh giá dựa trên kỳ hiện hành.';
      recommendation = 'Hoàn tất đủ ít nhất 2 chu kỳ nộp để hệ thống tự động kích hoạt thuật toán so sánh.';
    } else if (
      sopDeltaPct !== null &&
      workforceDeltaPct !== null &&
      sopDeltaPct >= thresholds.sopSpikeThreshold &&
      workforceDeltaPct <= -thresholds.workforceDropThreshold
    ) {
      riskLevel = 'CAO';
      primaryReason = `Kế hoạch SOP tăng đột biến (+${sopDeltaPct}%) trong khi nhân lực sụt giảm (${workforceDeltaPct}%)`;
      detailedAnalysis = `Nguy cơ thiếu hụt nhân lực sản xuất trực tiếp: Kế hoạch sản xuất tăng từ ${prevSub.sop.sopPlanQty.toLocaleString()} lên ${sub.sop.sopPlanQty.toLocaleString()} ${sub.sop.unit}, nhưng tổng quân số giảm từ ${prevSub.totalHeadcount} xuống ${sub.totalHeadcount} người.`;
      recommendation =
        'Tổ chức họp khẩn giữa Quản đốc nhà máy và Trưởng nhân sự Vendor để kiểm tra kế hoạch tăng ca hoặc bổ sung nhân sự điều chuyển gấp.';
    } else if (seasonalRatio >= thresholds.seasonalHighThreshold) {
      riskLevel = 'CAO';
      primaryReason = `Tỷ lệ lao động thời vụ vượt ngưỡng an toàn nghiêm trọng (${seasonalRatio}%)`;
      detailedAnalysis = `Tỷ lệ thời vụ đạt ${seasonalRatio}% (ngưỡng cho phép tối đa là ${thresholds.seasonalHighThreshold}%). Nguy cơ cao về tỷ lệ lỗi chất lượng IQC/OQC và tính ổn định kỷ luật dây chuyền.`;
      recommendation =
        'Yêu cầu Vendor lập phương án chuyển đổi hợp đồng chính thức và tăng cường đào tạo kỹ năng trước khi vào line.';
    } else if (
      seasonalRatio >= thresholds.seasonalMediumThreshold ||
      (workforceDeltaPct !== null && workforceDeltaPct <= -10)
    ) {
      riskLevel = 'TRUNG BÌNH';
      primaryReason = `Tỷ lệ thời vụ tiệm cận ngưỡng (${seasonalRatio}%) hoặc quân số giảm đáng chú ý (${workforceDeltaPct}%)`;
      detailedAnalysis = `Nhân lực giảm ${Math.abs(workforceDeltaPct || 0)}% so với tuần trước. Cần rà soát các vị trí trọng yếu thuộc nhóm Sản xuất và Kiểm định Chất lượng.`;
      recommendation =
        'Kiểm tra định mức công suất máy và xác minh năng suất lao động thực tế tại hiện trường.';
    }

    alerts.push({
      id: `RISK-${sub.id}`,
      vendor: sub.vendor,
      factory: sub.factory,
      cycleId: currentCycleId,
      riskLevel,
      primaryReason,
      detailedAnalysis,
      workforceDeltaPct,
      sopDeltaPct,
      seasonalRatio,
      recommendation,
      evaluatedAt: new Date().toISOString().slice(0, 10),
    });
  });

  return alerts;
};

// =========================================================================
// DATA VALIDATION ENGINE
// =========================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateWorkforceSubmission = (
  submission: Partial<WeeklyWorkforceSubmission>
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!submission.vendor) errors.push('Vui lòng chọn Vendor.');
  if (!submission.factory) errors.push('Vui lòng chọn Nhà máy.');
  if (!submission.cycleId) errors.push('Vui lòng chọn Kỳ báo cáo.');

  if (!submission.sop || submission.sop.sopPlanQty === undefined || submission.sop.sopPlanQty < 0) {
    errors.push('Kế hoạch sản xuất SOP phải là số nguyên không âm.');
  }

  if (submission.positions) {
    let calculatedOfficial = 0;
    let calculatedSeasonal = 0;

    submission.positions.forEach((p, idx) => {
      if (p.official < 0 || p.seasonal < 0) {
        errors.push(
          `Vị trí "${p.position}" (${p.group}) không được chứa số lượng âm.`
        );
      }
      if (p.total !== p.official + p.seasonal) {
        errors.push(
          `Tổng vị trí "${p.position}" (${p.total}) không bằng Chính thức (${p.official}) + Thời vụ (${p.seasonal}).`
        );
      }
      calculatedOfficial += p.official;
      calculatedSeasonal += p.seasonal;
    });

    const calculatedTotal = calculatedOfficial + calculatedSeasonal;
    if (calculatedTotal === 0 && submission.status !== 'DRAFT') {
      warnings.push('Tổng nhân lực bằng 0. Hãy kiểm tra nếu Vendor chưa vào vụ.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

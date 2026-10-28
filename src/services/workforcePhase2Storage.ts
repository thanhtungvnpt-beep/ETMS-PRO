// ETMS PRO — Workforce Intelligence (Phase 2) Storage & Calculation Service
import {
  SkillItem,
  EmployeeProfile,
  SkillAssessmentRecord,
  EmployeeCertification,
  SkillTrainingPlan,
  SkillDeficitWarningTicket,
  SeniorityBracket,
  SkillLevel,
  SkillGapItem,
  WarningTicketStatus,
} from '../types/workforcePhase2';
import {
  INITIAL_SKILLS,
  INITIAL_EMPLOYEES,
  INITIAL_ASSESSMENTS,
  INITIAL_CERTIFICATIONS,
  INITIAL_TRAINING_PLANS,
  INITIAL_WARNING_TICKETS,
} from '../data/mockWorkforcePhase2Data';
import { UserProfile, VendorName, FactoryName, WorkforceGroup } from '../types';

const STORAGE_KEYS = {
  SKILLS: 'etms_p2_skills_v1',
  EMPLOYEES: 'etms_p2_employees_v1',
  ASSESSMENTS: 'etms_p2_assessments_v1',
  CERTIFICATIONS: 'etms_p2_certifications_v1',
  TRAINING_PLANS: 'etms_p2_training_plans_v1',
  WARNING_TICKETS: 'etms_p2_warning_tickets_v1',
};

// -------------------------------------------------------------
// 1. TENURE & SENIORITY CALCULATION (Module A)
// -------------------------------------------------------------
export const calculateTenureMonths = (startDateStr?: string, asOfDateStr?: string): number | null => {
  if (!startDateStr) return null;
  const start = new Date(startDateStr);
  const end = asOfDateStr ? new Date(asOfDateStr) : new Date();
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  const days = end.getDate() - start.getDate();

  let totalMonths = years * 12 + months;
  if (days < 0) totalMonths -= 1;
  return Math.max(0, totalMonths);
};

export const formatTenureDisplay = (totalMonths: number | null): string => {
  if (totalMonths === null || isNaN(totalMonths)) return 'Chưa đủ dữ liệu';
  if (totalMonths < 1) return '< 1 tháng';
  const years = Math.floor(totalMonths / 12);
  const remMonths = totalMonths % 12;

  if (years === 0) return `${remMonths} tháng`;
  if (remMonths === 0) return `${years} năm`;
  return `${years} năm ${remMonths} tháng`;
};

export const getSeniorityBracket = (hireDateStr?: string): SeniorityBracket => {
  const months = calculateTenureMonths(hireDateStr);
  if (months === null) return '< 3 tháng';
  if (months < 3) return '< 3 tháng';
  if (months <= 12) return '3 - 12 tháng';
  if (months <= 36) return '1 - 3 năm';
  return '> 3 năm';
};

// -------------------------------------------------------------
// 2. LOCAL STORAGE GETTERS & SETTERS
// -------------------------------------------------------------
export const getStoredSkills = (): SkillItem[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.SKILLS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(INITIAL_SKILLS));
    return INITIAL_SKILLS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_SKILLS;
  }
};

export const saveStoredSkills = (skills: SkillItem[]): void => {
  localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
};

export const getStoredEmployees = (): EmployeeProfile[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
    return INITIAL_EMPLOYEES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_EMPLOYEES;
  }
};

export const saveStoredEmployees = (employees: EmployeeProfile[]): void => {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
};

export const getStoredAssessments = (): SkillAssessmentRecord[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(INITIAL_ASSESSMENTS));
    return INITIAL_ASSESSMENTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_ASSESSMENTS;
  }
};

export const saveStoredAssessments = (assessments: SkillAssessmentRecord[]): void => {
  localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
};

export const getStoredCertifications = (): EmployeeCertification[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.CERTIFICATIONS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATIONS, JSON.stringify(INITIAL_CERTIFICATIONS));
    return INITIAL_CERTIFICATIONS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_CERTIFICATIONS;
  }
};

export const saveStoredCertifications = (certs: EmployeeCertification[]): void => {
  localStorage.setItem(STORAGE_KEYS.CERTIFICATIONS, JSON.stringify(certs));
};

export const getStoredTrainingPlans = (): SkillTrainingPlan[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.TRAINING_PLANS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.TRAINING_PLANS, JSON.stringify(INITIAL_TRAINING_PLANS));
    return INITIAL_TRAINING_PLANS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_TRAINING_PLANS;
  }
};

export const saveStoredTrainingPlans = (plans: SkillTrainingPlan[]): void => {
  localStorage.setItem(STORAGE_KEYS.TRAINING_PLANS, JSON.stringify(plans));
};

export const getStoredWarningTickets = (): SkillDeficitWarningTicket[] => {
  const raw = localStorage.getItem(STORAGE_KEYS.WARNING_TICKETS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.WARNING_TICKETS, JSON.stringify(INITIAL_WARNING_TICKETS));
    return INITIAL_WARNING_TICKETS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_WARNING_TICKETS;
  }
};

export const saveStoredWarningTickets = (tickets: SkillDeficitWarningTicket[]): void => {
  localStorage.setItem(STORAGE_KEYS.WARNING_TICKETS, JSON.stringify(tickets));
};

// -------------------------------------------------------------
// 3. HR COMPETENCY VERIFICATION WORKFLOW (Module D)
// -------------------------------------------------------------
export const hrVerifyAssessment = (
  assessmentId: string,
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_REASSESSMENT',
  currentUser: UserProfile,
  reason?: string
): { success: boolean; message: string; record?: SkillAssessmentRecord } => {
  // Check permission: Vendor cannot approve official results; only HR or Admin can confirm
  const isAuthorized =
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'VENDOR_HR' ||
    currentUser.role === 'MANAGEMENT';

  if (!isAuthorized) {
    return {
      success: false,
      message: 'Từ chối quyền: Chỉ bộ phận nhân sự (HR) hoặc Quản trị viên mới được xác nhận kết quả tay nghề chính thức.',
    };
  }

  const list = getStoredAssessments();
  const index = list.findIndex((a) => a.id === assessmentId);
  if (index === -1) {
    return { success: false, message: 'Không tìm thấy hồ sơ đánh giá.' };
  }

  const record = { ...list[index] };
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const previousLevel = record.approvedLevel;

  if (decision === 'APPROVE') {
    record.approvedLevel = record.proposedLevel;
    record.verificationStatus = 'ĐÃ XÁC NHẬN ĐẠT';
    record.verifiedBy = currentUser.name;
    record.verifiedAt = now;
    record.rejectionReason = undefined;

    record.history.push({
      timestamp: now,
      changedBy: currentUser.name,
      role: currentUser.title || currentUser.role,
      action: 'HR PHÊ DUYỆT ĐẠT',
      previousLevel,
      newLevel: record.approvedLevel,
      reason: reason || 'Xác nhận đạt tiêu chuẩn tay nghề.',
    });
  } else if (decision === 'REJECT') {
    if (!reason || reason.trim().length === 0) {
      return {
        success: false,
        message: 'Bắt buộc phải ghi rõ lý do từ chối đánh giá tay nghề.',
      };
    }
    record.verificationStatus = 'TỪ CHỐI / KHÔNG ĐẠT';
    record.verifiedBy = currentUser.name;
    record.verifiedAt = now;
    record.rejectionReason = reason;

    record.history.push({
      timestamp: now,
      changedBy: currentUser.name,
      role: currentUser.title || currentUser.role,
      action: 'HR TỪ CHỐI ĐÁNH GIÁ',
      previousLevel,
      newLevel: record.approvedLevel,
      reason,
    });
  } else {
    // Request re-assessment
    record.verificationStatus = 'CẦN ĐÁNH GIÁ LẠI';
    record.rejectionReason = reason || 'Yêu cầu kiểm tra thực hành lại bổ sung bằng chứng.';

    record.history.push({
      timestamp: now,
      changedBy: currentUser.name,
      role: currentUser.title || currentUser.role,
      action: 'YÊU CẦU ĐÁNH GIÁ LẠI',
      previousLevel,
      newLevel: record.approvedLevel,
      reason: record.rejectionReason,
    });
  }

  list[index] = record;
  saveStoredAssessments(list);

  return {
    success: true,
    message:
      decision === 'APPROVE'
        ? `Đã xác nhận đạt cấp độ ${record.approvedLevel} thành công.`
        : decision === 'REJECT'
        ? 'Đã từ chối đánh giá theo quy định.'
        : 'Đã gửi yêu cầu đánh giá lại cho Quản đốc / Line Leader.',
    record,
  };
};

// -------------------------------------------------------------
// 4. SKILL GAP ENGINE (Module F)
// -------------------------------------------------------------
export const computeSkillGaps = (
  skills: SkillItem[],
  employees: EmployeeProfile[],
  assessments: SkillAssessmentRecord[],
  certifications: EmployeeCertification[],
  filterFactory: string = 'ALL',
  filterVendor: string = 'ALL'
): SkillGapItem[] => {
  const result: SkillGapItem[] = [];

  // Active employees only
  const activeEmployees = employees.filter((e) => {
    if (e.status !== 'ĐANG LÀM VIỆC') return false;
    if (filterFactory !== 'ALL' && e.factory !== filterFactory) return false;
    if (filterVendor !== 'ALL' && e.vendor !== filterVendor) return false;
    return true;
  });

  // Group active employees by position & vendor/factory
  skills.forEach((skill) => {
    if (!skill.isActive) return;

    // Applicable positions for this skill
    skill.applicablePositions.forEach((pos) => {
      // Find matching employees in this position
      const posEmployees = activeEmployees.filter((e) => e.position === pos);
      if (posEmployees.length === 0) return;

      // Group by vendor & factory
      const vendorFactoryKeys = new Set(posEmployees.map((e) => `${e.vendor}__${e.factory}`));

      vendorFactoryKeys.forEach((vfKey) => {
        const [vName, fName] = vfKey.split('__') as [VendorName, FactoryName];
        const groupEmployees = posEmployees.filter((e) => e.vendor === vName && e.factory === fName);

        // Demand rule: At least 2 people (or 50% of position) need to meet required level
        const demandHeadcount = Math.max(2, Math.ceil(groupEmployees.length * 0.4));

        // Qualified: Must have approvedLevel >= skill.requiredLevel AND verificationStatus === 'ĐÃ XÁC NHẬN ĐẠT'
        // And if requiresCertification === true, must have valid non-expired certificate
        let qualifiedCount = 0;

        groupEmployees.forEach((emp) => {
          const asm = assessments.find(
            (a) =>
              a.employeeId === emp.id &&
              a.skillCode === skill.skillCode &&
              a.verificationStatus === 'ĐÃ XÁC NHẬN ĐẠT' &&
              a.approvedLevel >= skill.requiredLevel
          );

          if (asm) {
            if (skill.requiresCertification) {
              const cert = certifications.find(
                (c) =>
                  c.employeeId === emp.id &&
                  (c.skillCode === skill.skillCode || !c.skillCode) &&
                  (c.verificationStatus === 'CÒN HIỆU LỰC' || c.verificationStatus === 'SẮP HẾT HẠN')
              );
              if (cert) qualifiedCount++;
            } else {
              qualifiedCount++;
            }
          }
        });

        const gap = Math.max(0, demandHeadcount - qualifiedCount);
        const fulfillmentRatePct =
          demandHeadcount > 0 ? Math.round((qualifiedCount / demandHeadcount) * 1000) / 10 : 100;

        result.push({
          factory: fName,
          vendor: vName,
          position: pos,
          skillCode: skill.skillCode,
          skillName: skill.name,
          criticality: skill.criticality,
          requiredLevel: skill.requiredLevel,
          demandHeadcount,
          qualifiedHeadcount: qualifiedCount,
          gap,
          fulfillmentRatePct,
          singlePointOfFailure: qualifiedCount === 1 && skill.criticality !== 'BỔ TRỢ',
        });
      });
    });
  });

  return result;
};

// -------------------------------------------------------------
// 5. PHASE 2 INTELLIGENCE DASHBOARD KPIS (Dashboard 13)
// -------------------------------------------------------------
export interface Phase2WorkforceKPIs {
  totalEmployees: number;
  officialCount: number;
  seasonalCount: number;
  assessedCount: number;
  assessedRatePct: number;
  qualifiedRatePct: number;
  missingSkillsCount: number;
  singlePointOfFailureCount: number;
  expiringCertsCount: number;
  expiredCertsCount: number;
  pendingVerificationCount: number;
  activeWarningTicketsCount: number;
  activeTrainingPlansCount: number;
  tenureBreakdown: {
    under3m: number;
    from3to12m: number;
    from1to3y: number;
    over3y: number;
  };
  levelDistribution: Record<SkillLevel, number>;
}

export const calculatePhase2KPIs = (
  employees: EmployeeProfile[],
  skills: SkillItem[],
  assessments: SkillAssessmentRecord[],
  certifications: EmployeeCertification[],
  trainingPlans: SkillTrainingPlan[],
  warnings: SkillDeficitWarningTicket[],
  filterFactory: string = 'ALL',
  filterVendor: string = 'ALL'
): Phase2WorkforceKPIs => {
  const filteredEmployees = employees.filter((e) => {
    if (e.status !== 'ĐANG LÀM VIỆC') return false;
    if (filterFactory !== 'ALL' && e.factory !== filterFactory) return false;
    if (filterVendor !== 'ALL' && e.vendor !== filterVendor) return false;
    return true;
  });

  const totalEmployees = filteredEmployees.length;
  const officialCount = filteredEmployees.filter((e) => e.contractType === 'CHÍNH THỨC').length;
  const seasonalCount = filteredEmployees.filter((e) => e.contractType === 'THỜI VỤ').length;

  // Tenure breakdown
  const tenureBreakdown = {
    under3m: 0,
    from3to12m: 0,
    from1to3y: 0,
    over3y: 0,
  };

  filteredEmployees.forEach((e) => {
    const bracket = getSeniorityBracket(e.hireDate);
    if (bracket === '< 3 tháng') tenureBreakdown.under3m++;
    else if (bracket === '3 - 12 tháng') tenureBreakdown.from3to12m++;
    else if (bracket === '1 - 3 năm') tenureBreakdown.from1to3y++;
    else tenureBreakdown.over3y++;
  });

  // Assessed employees (have at least one assessment record)
  const empIdSet = new Set(filteredEmployees.map((e) => e.id));
  const relevantAssessments = assessments.filter((a) => empIdSet.has(a.employeeId));

  const assessedEmpIds = new Set(
    relevantAssessments
      .filter((a) => a.verificationStatus !== 'CHƯA ĐÁNH GIÁ')
      .map((a) => a.employeeId)
  );

  const assessedCount = assessedEmpIds.size;
  const assessedRatePct =
    totalEmployees > 0 ? Math.round((assessedCount / totalEmployees) * 1000) / 10 : 0;

  // Level Distribution
  const levelDistribution: Record<SkillLevel, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };

  relevantAssessments.forEach((a) => {
    if (a.verificationStatus === 'ĐÃ XÁC NHẬN ĐẠT') {
      levelDistribution[a.approvedLevel]++;
    } else {
      levelDistribution[0]++;
    }
  });

  // Qualified assessments (approved level >= 2)
  const qualifiedAssessments = relevantAssessments.filter(
    (a) => a.verificationStatus === 'ĐÃ XÁC NHẬN ĐẠT' && a.approvedLevel >= 2
  );
  const qualifiedRatePct =
    relevantAssessments.length > 0
      ? Math.round((qualifiedAssessments.length / relevantAssessments.length) * 1000) / 10
      : 0;

  // Certifications status
  const relevantCerts = certifications.filter((c) => empIdSet.has(c.employeeId));
  const expiringCertsCount = relevantCerts.filter((c) => c.verificationStatus === 'SẮP HẾT HẠN').length;
  const expiredCertsCount = relevantCerts.filter((c) => c.verificationStatus === 'HẾT HẠN').length;

  // Pending HR verification queue
  const pendingVerificationCount = assessments.filter(
    (a) => a.verificationStatus === 'CHỜ NHÂN SỰ XÁC NHẬN'
  ).length;

  // Active warnings
  const activeWarningTicketsCount = warnings.filter(
    (w) => w.status === 'MỚI' || w.status === 'ĐANG XỬ LÝ'
  ).length;

  // Training plans
  const activeTrainingPlansCount = trainingPlans.filter(
    (t) => t.status === 'ĐANG ĐÀO TẠO' || t.status === 'QUÁ HẠN'
  ).length;

  // Missing skills count & SPOF from gap analysis
  const gaps = computeSkillGaps(skills, employees, assessments, certifications, filterFactory, filterVendor);
  const missingSkillsCount = gaps.filter((g) => g.gap > 0).length;
  const singlePointOfFailureCount = gaps.filter((g) => g.singlePointOfFailure).length;

  return {
    totalEmployees,
    officialCount,
    seasonalCount,
    assessedCount,
    assessedRatePct,
    qualifiedRatePct,
    missingSkillsCount,
    singlePointOfFailureCount,
    expiringCertsCount,
    expiredCertsCount,
    pendingVerificationCount,
    activeWarningTicketsCount,
    activeTrainingPlansCount,
    tenureBreakdown,
    levelDistribution,
  };
};

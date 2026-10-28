// ETMS PRO — Workforce Intelligence: Seniority & Skill Matrix (Phase 2)
// Data types and contract specifications

import { VendorName, FactoryName, WorkforceGroup, WorkforceDetailPosition } from './workforce';

// 1. Skill Criticality & Level Scale
export type SkillCriticality = 'BẮT BUỘC' | 'QUAN TRỌNG' | 'TIÊU CHUẨN' | 'BỔ TRỢ';

export type SkillLevel = 0 | 1 | 2 | 3 | 4;

export interface SkillLevelDefinition {
  level: SkillLevel;
  code: string;
  name: string;
  shortDesc: string;
  criteria: string;
  color: string;
  bgClass: string;
  borderClass: string;
}

export const SKILL_LEVEL_DEFINITIONS: Record<SkillLevel, SkillLevelDefinition> = {
  0: {
    level: 0,
    code: 'L0',
    name: 'Chưa đánh giá',
    shortDesc: 'Chưa có dữ liệu khảo sát tay nghề',
    criteria: 'Nhân viên chưa trải qua quy trình kiểm tra hoặc mới tiếp nhận công đoạn.',
    color: '#94a3b8',
    bgClass: 'bg-slate-100 text-slate-700',
    borderClass: 'border-slate-300',
  },
  1: {
    level: 1,
    code: 'L1',
    name: 'Đang học việc',
    shortDesc: 'Cần người kèm cặp, hướng dẫn trực tiếp',
    criteria: 'Nắm được khái niệm cơ bản, thao tác còn chậm và bắt buộc phải có Line Leader giám sát.',
    color: '#f59e0b',
    bgClass: 'bg-amber-100 text-amber-900',
    borderClass: 'border-amber-300',
  },
  2: {
    level: 2,
    code: 'L2',
    name: 'Làm việc cơ bản',
    shortDesc: 'Thực hiện công việc theo đúng SOP chuẩn',
    criteria: 'Tự thực hiện thao tác độc lập ở tốc độ tiêu chuẩn, tuân thủ 100% tài liệu hướng dẫn công việc.',
    color: '#3b82f6',
    bgClass: 'bg-blue-100 text-blue-900',
    borderClass: 'border-blue-300',
  },
  3: {
    level: 3,
    code: 'L3',
    name: 'Thành thạo độc lập',
    shortDesc: 'Độc lập xử lý phát sinh, chất lượng cao',
    criteria: 'Năng suất vượt chuẩn, xử lý nhanh sự cố bất thường, không phát sinh lỗi ngoại quan/kỹ thuật.',
    color: '#10b981',
    bgClass: 'bg-emerald-100 text-emerald-900',
    borderClass: 'border-emerald-300',
  },
  4: {
    level: 4,
    code: 'L4',
    name: 'Chuyên gia / Đào tạo',
    shortDesc: 'Hướng dẫn, giải quyết bài toán khó, Audit',
    criteria: 'Có khả năng đào tạo nhân viên mới, hiệu chuẩn dây chuyền, cải tiến Kaizen và làm việc với Audit.',
    color: '#8b5cf6',
    bgClass: 'bg-purple-100 text-purple-900',
    borderClass: 'border-purple-300',
  },
};

// 2. Module B: Skill Catalog & Standard Definition
export interface SkillItem {
  skillCode: string;               // e.g. 'SK-PROD-SMT-01'
  name: string;                    // e.g. 'Vận hành máy dán SMT Yamaha'
  description: string;
  group: WorkforceGroup;
  applicablePositions: WorkforceDetailPosition[];
  criticality: SkillCriticality;
  requiredLevel: SkillLevel;       // Cấp độ tối thiểu yêu cầu (thường là L2 hoặc L3)
  requiresCertification: boolean;
  evaluationCycleMonths: number;   // Chu kỳ đánh giá lại định kỳ (tháng)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 3. Module A: Employee Seniority Profile
export type EmployeeStatus = 'ĐANG LÀM VIỆC' | 'NGHỈ PHÉP' | 'ĐÃ NGHỈ VIỆC';
export type ContractType = 'CHÍNH THỨC' | 'THỜI VỤ';
export type SeniorityBracket = '< 3 tháng' | '3 - 12 tháng' | '1 - 3 năm' | '> 3 năm';

export interface EmployeeProfile {
  id: string;                      // Stable UUID
  employeeCode: string;            // e.g. 'EMP-KHV-0101'
  fullName: string;
  vendor: VendorName;
  factory: FactoryName;
  group: WorkforceGroup;
  position: WorkforceDetailPosition;
  lineOrStation?: string;          // e.g. 'Line SMT 02', 'Trạm OQC 01'
  contractType: ContractType;
  hireDate: string;                // YYYY-MM-DD
  positionStartDate: string;       // YYYY-MM-DD
  stationStartDate?: string;       // YYYY-MM-DD
  status: EmployeeStatus;
  gender?: 'Nam' | 'Nữ';
  birthYear?: number;
  dataSource: 'HỒ SƠ GỐC VENDOR' | 'NHẬP THỦ CÔNG' | 'FILE IMPORT EXCEL';
  updatedAt: string;
  notes?: string;
}

// 4. Module C & D: Skill Assessment & Verification
export type AssessmentVerificationStatus =
  | 'CHƯA ĐÁNH GIÁ'
  | 'ĐANG ĐÁNH GIÁ'
  | 'CHỜ NHÂN SỰ XÁC NHẬN'
  | 'ĐÃ XÁC NHẬN ĐẠT'
  | 'TỪ CHỐI / KHÔNG ĐẠT'
  | 'CẦN ĐÁNH GIÁ LẠI'
  | 'HẾT HIỆU LỰC';

export interface AssessmentRevisionHistory {
  timestamp: string;
  changedBy: string;
  role: string;
  action: string;                  // 'TẠO YÊU CẦU' | 'GHI NHẬN KẾT QUẢ' | 'HR PHÊ DUYỆT' | 'HR TỪ CHỐI' | 'YÊU CẦU ĐÁNH GIÁ LẠI'
  previousLevel: SkillLevel;
  newLevel: SkillLevel;
  reason?: string;
}

export interface SkillAssessmentRecord {
  id: string;                      // e.g. 'ASM-2025-001'
  employeeId: string;
  skillCode: string;
  proposedLevel: SkillLevel;       // Mức đánh giá thực tế từ Leader
  approvedLevel: SkillLevel;       // Mức chính thức sau khi HR duyệt (chỉ có hiệu lực khi status = ĐÃ XÁC NHẬN ĐẠT)
  assessmentDate: string;          // Ngày đánh giá
  assessorName: string;            // Tên người đánh giá (Line Leader / Quản đốc)
  assessorRole: string;
  evidenceNotes?: string;          // Ghi nhận chứng cứ kiểm tra, điểm thao tác
  evidenceDocUrl?: string;
  verificationStatus: AssessmentVerificationStatus;
  verifiedBy?: string;             // Đại diện bộ phận nhân sự
  verifiedAt?: string;             // Thời điểm nhân sự xác nhận
  rejectionReason?: string;        // Lý do nếu từ chối
  nextEvaluationDate?: string;     // Ngày đến hạn đánh giá lại
  history: AssessmentRevisionHistory[];
}

// 5. Module E: Certifications & Training
export type CertificationValidityStatus =
  | 'CHƯA XÁC MINH'
  | 'CÒN HIỆU LỰC'
  | 'SẮP HẾT HẠN'
  | 'HẾT HẠN'
  | 'KHÔNG HỢP LỆ';

export interface EmployeeCertification {
  id: string;
  employeeId: string;
  skillCode?: string;
  certificateName: string;         // e.g. 'Chứng chỉ Vận hành An toàn Áp lực'
  certificateNumber: string;
  issuingBody: string;             // Đơn vị cấp
  issueDate: string;               // YYYY-MM-DD
  expiryDate?: string;             // YYYY-MM-DD (null nếu vĩnh viễn)
  documentUrl?: string;
  verificationStatus: CertificationValidityStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export type TrainingPlanStatus =
  | 'CHƯA BẮT ĐẦU'
  | 'ĐANG ĐÀO TẠO'
  | 'CHỜ ĐÁNH GIÁ LẠI'
  | 'HOÀN THÀNH'
  | 'QUÁ HẠN'
  | 'ĐÃ HỦY';

export interface SkillTrainingPlan {
  id: string;
  employeeId: string;
  skillCode: string;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  trainerName: string;
  startDate: string;
  deadlineDate: string;
  status: TrainingPlanStatus;
  progressPct: number;             // 0 - 100%
  completedDate?: string;
  outcomeNotes?: string;
  evaluatedLevelAfterTraining?: SkillLevel;
}

// 6. Module F: Skill Gap Analysis
export interface SkillGapItem {
  factory: FactoryName;
  vendor: VendorName;
  position: WorkforceDetailPosition;
  skillCode: string;
  skillName: string;
  criticality: SkillCriticality;
  requiredLevel: SkillLevel;
  demandHeadcount: number;         // Nhu cầu số người cần đạt chuẩn
  qualifiedHeadcount: number;      // Số người thực tế đã được HR xác nhận đạt chuẩn
  gap: number;                     // MAX(0, Demand - Qualified)
  fulfillmentRatePct: number;      // Qualified / Demand * 100% (safe if Demand = 0)
  singlePointOfFailure: boolean;   // Kỹ năng trọng yếu chỉ có đúng 1 người đảm nhiệm
}

// 7. Module G: Skill Deficit Warning Ticket
export type SkillWarningType =
  | 'THIẾU_HỤT_NGHIÊM_TRỌNG'
  | 'ĐIỂM_NGHẼN_DUY_NHẤT'
  | 'CHỨNG_CHỈ_SẮP_HẾT_HẠN'
  | 'CHỨNG_CHỈ_ĐÃ_HẾT_HẠN'
  | 'ĐÁNH_GIÁ_QUÁ_HẠN'
  | 'ĐÀO_TẠO_QUÁ_HẠN';

export type WarningTicketStatus =
  | 'MỚI'
  | 'ĐANG XỬ LÝ'
  | 'CHỜ XÁC NHẬN'
  | 'ĐÃ GIẢI QUYẾT'
  | 'ĐÓNG';

export interface SkillDeficitWarningTicket {
  id: string;
  code: string;                    // e.g. 'WRN-2025-010'
  type: SkillWarningType;
  vendor: VendorName;
  factory: FactoryName;
  group: WorkforceGroup;
  position: WorkforceDetailPosition;
  skillCode?: string;
  skillName?: string;
  severity: 'CAO' | 'TRUNG BÌNH' | 'THẤP';
  demand: number;
  qualified: number;
  gap: number;
  rootCause: string;
  recommendedAction: string;
  assignedTo: string;              // Người chịu trách nhiệm xử lý
  deadline: string;
  status: WarningTicketStatus;
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

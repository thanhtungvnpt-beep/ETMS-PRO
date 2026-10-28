// ETMS PRO — Weekly Vendor Workforce & SOP Management (Phase 1) Types

export type VendorName =
  | 'KHV'
  | 'DREAM TECH'
  | 'HSTEC'
  | 'KTECH'
  | 'HOJEONGB'
  | 'HOJEONG VINA'
  | 'DAAL';

export const VENDOR_LIST: VendorName[] = [
  'KHV',
  'DREAM TECH',
  'HSTEC',
  'KTECH',
  'HOJEONGB',
  'HOJEONG VINA',
  'DAAL',
];

export type FactoryName = 'Nhà máy A' | 'Nhà máy B' | 'Nhà máy C';

export const FACTORY_LIST: FactoryName[] = ['Nhà máy A', 'Nhà máy B', 'Nhà máy C'];

// 4 Functional Groups
export type WorkforceGroup =
  | 'Hành chính nhân sự'
  | 'Sản xuất'
  | 'Chất lượng'
  | 'Thiết bị';

// 23 Detailed Positions
export type AdminHRDetailPosition =
  | 'Kế toán'
  | 'Nhân sự'
  | 'Kế hoạch'
  | 'Hành chính'
  | 'Bảo an'
  | 'Người Hàn Quốc'
  | 'Other';

export type ProductionDetailPosition =
  | 'Đứng line sản xuất'
  | 'Line Leader / Subleader'
  | 'Support (Transfer, Support)'
  | 'Repair & Rework'
  | 'Kho nguyên vật liệu'
  | 'Other';

export type QualityDetailPosition =
  | 'Đứng line sản xuất'
  | 'Ngoại quan IQC'
  | 'Ngoại quan OQC'
  | 'Line Leader / Subleader'
  | 'RMA & Phân tích'
  | 'Audit'
  | 'Support'
  | 'Other';

export type EquipmentDetailPosition =
  | 'Trực line'
  | 'Line Leader / Subleader'
  | 'Kho MRO'
  | 'Other';

export type WorkforceDetailPosition =
  | AdminHRDetailPosition
  | ProductionDetailPosition
  | QualityDetailPosition
  | EquipmentDetailPosition;

export interface PositionStructure {
  group: WorkforceGroup;
  positions: string[];
}

export const WORKFORCE_STRUCTURE: PositionStructure[] = [
  {
    group: 'Hành chính nhân sự',
    positions: ['Kế toán', 'Nhân sự', 'Kế hoạch', 'Hành chính', 'Bảo an', 'Người Hàn Quốc', 'Other'],
  },
  {
    group: 'Sản xuất',
    positions: [
      'Đứng line sản xuất',
      'Line Leader / Subleader',
      'Support (Transfer, Support)',
      'Repair & Rework',
      'Kho nguyên vật liệu',
      'Other',
    ],
  },
  {
    group: 'Chất lượng',
    positions: [
      'Đứng line sản xuất',
      'Ngoại quan IQC',
      'Ngoại quan OQC',
      'Line Leader / Subleader',
      'RMA & Phân tích',
      'Audit',
      'Support',
      'Other',
    ],
  },
  {
    group: 'Thiết bị',
    positions: ['Trực line', 'Line Leader / Subleader', 'Kho MRO', 'Other'],
  },
];

export const VENDORS: VendorName[] = VENDOR_LIST;
export const FACTORIES: FactoryName[] = FACTORY_LIST;
export const WORKFORCE_GROUPS: WorkforceGroup[] = [
  'Hành chính nhân sự',
  'Sản xuất',
  'Chất lượng',
  'Thiết bị',
];
export const ALL_WORKFORCE_POSITIONS: WorkforceDetailPosition[] = [
  'Kế toán',
  'Nhân sự',
  'Kế hoạch',
  'Hành chính',
  'Bảo an',
  'Người Hàn Quốc',
  'Đứng line sản xuất',
  'Line Leader / Subleader',
  'Support (Transfer, Support)',
  'Repair & Rework',
  'Kho nguyên vật liệu',
  'Ngoại quan IQC',
  'Ngoại quan OQC',
  'RMA & Phân tích',
  'Audit',
  'Trực line',
  'Kho MRO',
  'Other',
];

// Single Position Headcount Entry
export interface WorkforcePositionCount {
  group: WorkforceGroup;
  position: string;
  official: number; // Nhân sự chính thức
  seasonal: number; // Nhân sự thời vụ
  total: number;    // Tổng = official + seasonal
}

// Submission Status per Vendor / Factory / Cycle
export type SubmissionStatus =
  | 'NOT_STARTED'        // Chưa bắt đầu
  | 'DRAFT'              // Đang nhập (Bản nháp)
  | 'SUBMITTED'          // Đã gửi (Chờ xác nhận)
  | 'CONFIRMED'          // Đã xác nhận
  | 'OVERDUE'            // Quá hạn
  | 'REJECTED_REVISION'; // Yêu cầu cập nhật lại

// Weekly SOP Record (Kế hoạch sản xuất theo tuần)
export interface WeeklySOPRecord {
  id: string;
  cycleId: string;       // e.g. "2025-W16"
  vendor: VendorName;
  factory: FactoryName;
  sopPlanQty: number;    // Kế hoạch sản xuất SOP (PCS)
  unit: string;          // e.g. "PCS", "Bộ", "Chiếc"
  model?: string;        // Model nếu có
  note?: string;
  submittedBy: string;
  updatedAt: string;
}

// Revision History Log when modifying submitted data
export interface WorkforceRevisionLog {
  timestamp: string;
  user: string;
  role: string;
  action: string;
  reason: string;
  previousTotal: number;
  newTotal: number;
}

// Complete Weekly Workforce Submission for a Vendor at a specific Factory
export interface WeeklyWorkforceSubmission {
  id: string;
  cycleId: string;       // e.g. "2025-W16"
  vendor: VendorName;
  factory: FactoryName;
  status: SubmissionStatus;
  
  // Headcounts breakdown across 23 positions
  positions: WorkforcePositionCount[];
  
  // Aggregated totals
  totalOfficial: number;
  totalSeasonal: number;
  totalHeadcount: number;
  seasonalRatio: number; // in %
  
  // Group summary
  adminHRTotal: number;
  productionTotal: number;
  qualityTotal: number;
  equipmentTotal: number;
  
  // Associated Weekly SOP
  sop: WeeklySOPRecord;
  
  // Metadata & Audit
  updatedBy: string;
  updatedByRole: string;
  updatedAt: string;
  confirmedBy?: string;
  confirmedAt?: string;
  rejectionReason?: string;
  revisions: WorkforceRevisionLog[];
}

// Reporting Cycle Configuration (Admin Settings)
export interface ReportingCycleConfig {
  id: string;            // e.g. "2025-W16"
  title: string;         // e.g. "Tuần 16 (14/04 - 20/04/2025)"
  startDate: string;     // YYYY-MM-DD
  deadlineDate: string;  // Hạn cập nhật YYYY-MM-DD
  reminderStart: string; // Thời điểm nhắc trước deadline (giờ/ngày)
  reminderFrequency: 'Hằng ngày' | 'Mỗi 12 giờ' | 'Trước 4 giờ';
  targetAudience: string;
  isActive: boolean;
  isLocked: boolean;     // Khóa kỳ sau khi chốt
}

// Risk Evaluation Alert (Phase 1)
export type RiskLevel = 'THẤP' | 'TRUNG BÌNH' | 'CAO' | 'CHƯA ĐỦ DỮ LIỆU';

export interface WorkforceRiskAlert {
  id: string;
  vendor: VendorName;
  factory: FactoryName;
  cycleId: string;
  riskLevel: RiskLevel;
  primaryReason: string;
  detailedAnalysis: string;
  workforceDeltaPct: number | null; // % thay đổi nhân lực so với tuần trước
  sopDeltaPct: number | null;       // % thay đổi SOP so với tuần trước
  seasonalRatio: number;            // % lao động thời vụ
  recommendation: string;
  evaluatedAt: string;
}

// System Reminder Task (In-app task feed)
export interface WorkforceReminderTask {
  id: string;
  cycleId: string;
  vendor: VendorName;
  factory: FactoryName;
  type: 'UPCOMING_DEADLINE' | 'OVERDUE' | 'REVISION_NEEDED' | 'PENDING_APPROVAL';
  title: string;
  message: string;
  createdAt: string;
  resolved: boolean;
}

// User Profile & Role for Workforce RBAC
export type UserRole =
  | 'PLANNER'
  | 'FACTORY_A'
  | 'FACTORY_B'
  | 'ADMIN'
  | 'VENDOR_HR'
  | 'FACTORY_LEADER'
  | 'MANAGEMENT';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  factory: 'ALL' | 'Nhà máy A' | 'Nhà máy B' | 'Nhà máy C';
  title: string;
  vendor?: VendorName; // Associated vendor when role is VENDOR_HR
}

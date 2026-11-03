// OOS ETMS PRO — Field Daily Report Pro Types
// Phân hệ Báo cáo Hiện trường — Cấp 1 trong kiến trúc OOS

import { VendorName, FactoryName } from './workforce';

export type FieldIssueCategory = 'EQM' | 'QC' | 'HR' | 'PRODUCTION';

export type FieldIssueSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type FieldIssueStatus =
  | 'MỚI_PHÁT_SINH'
  | 'ĐÃ_TIẾP_NHẬN'
  | 'ĐANG_XỬ_LÝ'
  | 'CHỜ_HỖ_TRỢ'
  | 'ĐÃ_KHẮC_PHỤC'
  | 'ĐÃ_XÁC_NHẬN'
  | 'ĐÓNG_VẤN_ĐỀ';

export type DailyReportStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'RETURNED';

// Issue Timeline Update Record (Xuyên suốt nhiều ngày)
export interface FieldIssueUpdateLog {
  id: string;
  timestamp: string; // YYYY-MM-DD HH:mm
  date: string; // YYYY-MM-DD
  updatedBy: string;
  role: string;
  action: string;
  notes: string;
  statusBefore: FieldIssueStatus;
  statusAfter: FieldIssueStatus;
  evidencePhoto?: string;
}

// Single Field Issue (Quản lý xuyên suốt theo Issue ID duy nhất)
export interface FieldDailyIssue {
  id: string; // e.g. "EQM-001", "QC-001", "HR-001", "PROD-001"
  category: FieldIssueCategory;
  title: string;
  description: string;
  factory: FactoryName | 'SEV';
  vendor: VendorName;
  lineCode: string; // e.g. "Line 01", "Line 03"
  reportedBy: string;
  reportedByRole: string;
  reportedDate: string; // YYYY-MM-DD
  reportedTime: string; // HH:mm
  severity: FieldIssueSeverity;
  status: FieldIssueStatus;
  assignedTo?: string;
  assignedRole?: string;
  
  // Specific Category Attributes
  // 1. EQM Details
  equipmentCode?: string; // e.g. "EQM-MNT-01"
  equipmentName?: string; // e.g. "Máy ép EQM-001", "Máy dán linh kiện"
  stationCode?: string;
  downtimeMinutes?: number;
  
  // 2. QC Details
  productModel?: string;
  defectType?: string; // e.g. "Lệch linh kiện", "Hở chì", "Trầy xước"
  affectedQuantity?: number;
  
  // 3. HR Details
  plannedHeadcount?: number;
  actualHeadcount?: number;
  shortageCount?: number;
  hrShortageReason?: string;
  
  // 4. Production Details
  plannedOutput?: number;
  actualOutput?: number;
  outputVariance?: number;
  variancePercentage?: number;
  productionImpactReason?: string;

  // Media attachments
  photos: string[];
  
  // Multi-day Lifecycle Tracking
  rootCause?: string;
  correctiveAction?: string;
  resolvedAt?: string;
  closedAt?: string;
  historyLogs: FieldIssueUpdateLog[];
}

// Single Daily Work Activity
export interface FieldDailyActivity {
  id: string;
  content: string;
  area: string;
  result: string;
  isCompleted: boolean;
  completedAt?: string;
  photoUrl?: string;
}

// Tomorrow's Planned Task
export interface FieldTomorrowPlanItem {
  id: string;
  content: string;
  priority: 'HIGH' | 'MEDIUM' | 'NORMAL';
  isFollowUpIssue?: boolean;
  relatedIssueId?: string;
  isDone?: boolean;
}

// Attachment/Photo Item
export interface FieldReportPhoto {
  id: string;
  url: string;
  caption: string;
  category: FieldIssueCategory | 'GENERAL';
  relatedIssueId?: string;
  uploadedBy: string;
  uploadedAt: string;
  lineCode?: string;
}

// Master Daily Report Entity
export interface FieldDailyReport {
  id: string; // e.g. "RPT-20261103-001"
  reportCode: string;
  reportDate: string; // YYYY-MM-DD
  employeeId: string;
  employeeName: string;
  employeeTitle: string;
  vendor: VendorName;
  factory: FactoryName | 'SEV';
  shift: 'CA_NGAY' | 'CA_DEM' | 'CA_HANH_CHINH';
  status: DailyReportStatus;
  submittedAt?: string;
  updatedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  
  // Work Items
  todayActivities: FieldDailyActivity[];
  tomorrowPlans: FieldTomorrowPlanItem[];
  
  // Issues reported in this report
  hasIssues: boolean;
  issueIds: string[]; // references FieldDailyIssue.id
  
  // Photos
  photos: FieldReportPhoto[];
  
  generalNotes?: string;
}

// Sub-Tab Navigation for Field Report Module
export type FieldReportSubTab =
  | 'dashboard'         // Tổng quan báo cáo (Desktop Dashboard)
  | 'daily-reports'     // Danh sách Báo cáo hàng ngày
  | 'eqm-issues'        // Vấn đề Thiết bị (EQM)
  | 'qc-issues'         // Vấn đề Chất lượng (QC)
  | 'hr-issues'         // Vấn đề Nhân lực (HR)
  | 'production-issues' // Vấn đề Sản lượng (Production)
  | 'open-issues'       // Vấn đề đang xử lý
  | 'report-history'    // Lịch sử báo cáo
  | 'summary';          // Tổng hợp & phân tích

// OOS NEW MODEL PRO — Data Architecture & Types
// Quản lý triển khai Model mới từ lúc tạo dự án đến khi sẵn sàng sản xuất
// Bám sát hình ảnh tham chiếu UI/UX và tài liệu đặc tả nghiệp vụ

import { FactoryName, VendorName } from './workforce';

export type ProcessType = 'CNC' | 'SMT' | 'ASSEMBLY' | 'INJECTION' | 'PACKING';

export type LineDeploymentStatus =
  | 'Đúng tiến độ'
  | 'Nguy cơ trễ'
  | 'Trễ kế hoạch'
  | 'Chờ mua hàng'
  | 'Đang setup'
  | 'Hoàn tất';

export type EquipmentCategory =
  | 'JIG'
  | 'Machine'
  | 'Master Sample'
  | 'Spare Part / MRO';

export type ItemInspectionStatus = 'OK' | 'Pending' | 'Chưa kiểm tra';

export type PhaseTaskType = 'PURCHASE' | 'RECEIVING' | 'SETUP';

export type PhaseStatus =
  | 'Chưa bắt đầu'
  | 'Đang thực hiện'
  | 'Hoàn thành'
  | 'Trễ kế hoạch';

// Single Equipment Item within a Production Line
export interface EquipmentItemPro {
  id: string; // e.g. "EQ-ON1-B1-DAAL-01"
  code: string; // e.g. "MC-001", "JIG-A01"
  name: string; // e.g. "Máy phay CNC 5 trục Makino", "Đồ gá kẹp JIG-01"
  category: EquipmentCategory;
  specs: string; // Thông số kỹ thuật
  standardQty: number; // Số lượng tiêu chuẩn
  deliveredQty: number; // Số lượng đã nhận
  unit: string; // Chiếc, Bộ, Cụm
  supplier?: string; // Nhà cung cấp dự kiến
  status: ItemInspectionStatus; // OK | Pending
  pendingReason?: string; // Bắt buộc nếu Pending (e.g. "Sai kích thước đồ gá")
  photoUrl?: string; // Ảnh bằng chứng
  expectedResolutionDate?: string; // Ngày dự kiến xử lý xong
  checkedBy?: string; // Kỹ thuật viên / EQM kiểm tra
  checkedAt?: string; // Thời gian kiểm tra
  resolutionNotes?: string;
  isMandatory: boolean; // Bắt buộc để bàn giao line
}

// Phase Progress (Mua hàng, Nhận hàng, Setup)
export interface StageProgress {
  type: PhaseTaskType;
  name: string; // "Mua hàng", "Nhận hàng", "Setup"
  planStartWeek: number; // e.g. 44
  planEndWeek: number; // e.g. 45
  planLabel: string; // "W44 – W45"
  actualStartWeek?: number;
  actualEndWeek?: number;
  actualLabel: string; // "W44 – W45" or "W46 (dự kiến)" or "-"
  actualProgressPct: number; // 0 - 100%
  status: PhaseStatus;
  isOverdue: boolean;
  overdueWeeks?: number;
  responsibleRole: string; // "Planner", "Purchaser", "EQM"
}

// Production Line Profile
export interface ProjectLinePro {
  id: string; // "LINE-ON1-B1-DAAL-L1"
  code: string; // "CNC ON1 B1 DAAL L1"
  name: string; // "Chuyền gia công CNC 01"
  factory: FactoryName | 'SEV' | 'SV1';
  blockId: string; // "BLOCK-01"
  blockName: string; // "Block 1"
  vendor: VendorName;
  status: LineDeploymentStatus;
  overallProgressPct: number; // Calculated average or weighted progress (e.g. 50%)
  
  // 3 Primary Gantt Tasks
  purchaseStage: StageProgress;
  receivingStage: StageProgress;
  setupStage: StageProgress;

  // Equipment Items on this Line
  equipmentItems: EquipmentItemPro[];
  
  // Image for line machine
  machineImageUrl?: string;
  notes?: string;
  readyForProduction: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

// Sub-Process / Block
export interface ProjectBlockPro {
  id: string; // "BLOCK-01"
  name: string; // "Block 1"
  code: string; // "B1"
  description?: string;
  lines: ProjectLinePro[];
}

// Factory Deployment Scope
export interface ProjectFactoryPro {
  factory: FactoryName | 'SEV' | 'SV1';
  isActive: boolean;
  blocks: ProjectBlockPro[];
}

// Issue Tracking in Equipment Issue Control Center
export type IssueSeverity = 'CAO' | 'TRUNG BÌNH' | 'THẤP';

export type IssueStatus =
  | 'MỚI_PHÁT_SINH'
  | 'ĐANG_XỬ_LÝ'
  | 'ĐÃ_KHẮC_PHỤC'
  | 'ĐÃ_XÁC_MINH';

export interface EquipmentIssuePro {
  id: string; // "ISS-2026-001"
  projectId: string;
  projectName: string;
  factory: string;
  blockName: string;
  vendor: VendorName;
  lineId: string;
  lineCode: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  category: EquipmentCategory;
  title: string;
  description: string;
  severity: IssueSeverity;
  assignedTo: string;
  reportedBy: string;
  reportedAt: string;
  dueDate: string;
  photoUrl?: string;
  status: IssueStatus;
  resolutionNote?: string;
  resolvedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  history: Array<{
    timestamp: string;
    action: string;
    user: string;
    note?: string;
  }>;
}

// 8 Workflow Steps matching reference image
export type NewModelWorkflowStep =
  | 1 // Tạo dự án (Planner)
  | 2 // Nhà máy (Planner)
  | 3 // Line & Vendor (Planner)
  | 4 // Kế hoạch mua hàng (Planner đặt)
  | 5 // Mua hàng
  | 6 // Nhận hàng
  | 7 // Setup
  | 8; // Hoàn tất Line Sẵn sàng sản xuất

export interface WorkflowStepItem {
  step: NewModelWorkflowStep;
  title: string;
  role: string;
  colorTheme: 'blue' | 'green' | 'cyan' | 'orange' | 'emerald';
}

// Main Project Entity
export interface NewModelProjectPro {
  id: string; // e.g. "PRJ-CNC-ON1"
  projectCode: string; // "CNC ON1"
  modelCodename: string; // "ON1"
  process: ProcessType; // "CNC"
  factories: Array<FactoryName | 'SEV' | 'SV1'>;
  primaryFactory: FactoryName | 'SEV' | 'SV1';
  timeframeLabel: string; // "W44 – W50 (2026)"
  startWeek: number; // 44
  endWeek: number; // 50
  currentWeek: number; // 46
  year: number; // 2026
  status: 'Đang triển khai' | 'Mới khởi tạo' | 'Tạm dừng' | 'Hoàn tất';
  currentWorkflowStep: NewModelWorkflowStep;
  totalLines: number; // 56
  onTrackLines: number; // 42 (75%)
  atRiskLines: number; // 8 (14%)
  delayedLines: number; // 6 (11%)
  projectProgressPct: number; // 50%
  plannerName: string;
  createdAt: string;
  updatedAt: string;
  
  // Hierarchy
  factoriesScope: ProjectFactoryPro[];
  issues: EquipmentIssuePro[];
}

export type NewModelSubTab =
  | 'line-schedule' // Kế hoạch Line (Gantt Dashboard)
  | 'equipment-list' // Danh sách thiết bị
  | 'purchase-plan' // Kế hoạch mua hàng
  | 'purchase-progress' // Tiến độ mua hàng
  | 'issues' // Cảnh báo / Vấn đề thiết bị
  | 'project-list' // Danh sách dự án
  | 'setup-trial' // Setup & Chạy thử
  | 'project-declaration' // Khai báo dự án mới (Wizard)
  | 'master-admin' // Master Admin - Quản lý danh mục Process & Block
  | 'reports-kpi' // Báo cáo & KPI
  | 'settings'; // Cài đặt

// ==========================================
// MASTER ADMIN ENTITIES
// ==========================================

export interface ProcessMasterEntity {
  id: string; // e.g. "PRC-001"
  code: string; // "CNC", "SMT", "ASSY", "PACKING", "TEST", "PAINT"
  name: string; // "Gia công CNC", "Dán bề mặt SMT", "Lắp ráp hoàn thiện"
  description: string;
  status: 'Active' | 'Inactive';
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
}

export interface BlockMasterEntity {
  id: string; // e.g. "BLK-001"
  processId: string; // e.g. "PRC-001"
  processCode: string; // "CNC"
  code: string; // "B1", "B2", "B3" (unique within same process)
  name: string; // "Block 1", "Block 2", "Block 3"
  description: string;
  status: 'Active' | 'Inactive';
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
}

export interface MasterAdminAuditLog {
  id: string;
  timestamp: string;
  entityType: 'PROCESS' | 'BLOCK' | 'PROJECT_DECLARATION' | 'SYSTEM_MASTER';
  entityCode: string;
  action: 'CREATE' | 'UPDATE' | 'DEACTIVATE' | 'ACTIVATE';
  user: string;
  details: string;
}

// Project Declaration Wizard Draft
export interface LineDeclarationDraft {
  lineIndex: number;
  lineCode: string; // CNC ON1 B1 DAAL L1
  lineName: string; // CNC ON1 Block 1 DAAL Line 1
  vendor: VendorName;
  factory: FactoryName | 'SEV' | 'SV1';
  blockId: string;
  blockName: string;
  equipmentItems: EquipmentItemPro[];
  purchaseStartWeek: number;
  purchaseEndWeek: number;
  receivingStartWeek: number;
  receivingEndWeek: number;
  setupStartWeek: number;
  setupEndWeek: number;
}

export interface ProjectDeclarationDraft {
  processId: string;
  processCode: string;
  processName: string;
  modelCodename: string;
  projectName: string; // Formula: Process Code + " " + Model Codename
  selectedBlockIds: string[];
  factories: Array<FactoryName | 'SEV' | 'SV1'>;
  primaryFactory: FactoryName | 'SEV' | 'SV1';
  year: number;
  startWeek: number;
  endWeek: number;
  plannerName: string;
  notes: string;
  lines: LineDeclarationDraft[];
}


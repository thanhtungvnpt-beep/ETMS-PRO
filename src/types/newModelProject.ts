// ETMS PRO — New Model Project Management Types
// Quản lý dự án Model mới — Từ kế hoạch đến xác nhận hoàn thành

import { FactoryName } from './workforce';

export type ProjectStatus =
  | 'DRAFT'                          // Bản nháp
  | 'NEW_PLAN'                       // Bước 1: Kế hoạch mới
  | 'STANDARD_DECLARATION'           // Bước 2: Khai báo tiêu chuẩn thiết bị
  | 'INTERNAL_REVIEW'                // Bước 3: Rà soát tài nguyên nội bộ
  | 'FACTORY_WIDE_REVIEW'            // Bước 4: Kiểm tra tài nguyên toàn nhà máy (Phân nhánh)
  | 'DISPATCH_PURCHASE_IN_PROGRESS'  // Bước 5: Đang điều động / Mua bổ sung
  | 'RESOURCE_FULFILLMENT_CHECK'     // Bước 6: Cổng xác nhận điền đầy tài nguyên
  | 'TECHNICAL_INSPECTION'           // Bước 7: Kỹ thuật viên rà soát thiết bị
  | 'LINE_SETUP'                     // Bước 8: Leader thiết bị Setup Line
  | 'FINAL_SIGN_OFF'                 // Bước 9: Chờ Planner xác nhận hoàn thành
  | 'COMPLETED'                      // Hoàn thành dự án
  | 'ON_HOLD'                        // Tạm dừng / Có vấn đề
  | 'CANCELLED';                     // Đã hủy

export type ProjectStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface ProjectStepDefinition {
  step: ProjectStepNumber;
  title: string;
  role: string;
  shortDesc: string;
  color: string;
  badgeBg: string;
}

export const PROJECT_STEP_DEFINITIONS: Record<ProjectStepNumber, ProjectStepDefinition> = {
  1: {
    step: 1,
    title: 'Khởi tạo Kế hoạch',
    role: 'Plan',
    shortDesc: 'Khai báo thông tin dự án, số Line và sản lượng mục tiêu',
    color: '#3b82f6',
    badgeBg: 'bg-blue-600',
  },
  2: {
    step: 2,
    title: 'Khai báo Tiêu chuẩn',
    role: 'Planner',
    shortDesc: 'Thiết lập định mức thiết bị/Line và tính tổng nhu cầu',
    color: '#6366f1',
    badgeBg: 'bg-indigo-600',
  },
  3: {
    step: 3,
    title: 'Rà soát Nội bộ',
    role: 'Leader Thiết bị',
    shortDesc: 'Kiểm tra tài nguyên sẵn sàng và thiết bị dôi dư nội bộ',
    color: '#0ea5e9',
    badgeBg: 'bg-sky-600',
  },
  4: {
    step: 4,
    title: 'Rà soát Toàn nhà máy',
    role: 'Planner',
    shortDesc: 'Phân nhánh quyết định: Đủ điều động / Thiếu mua bổ sung',
    color: '#f59e0b',
    badgeBg: 'bg-amber-600',
  },
  5: {
    step: 5,
    title: 'Điều động & Mua sắm',
    role: 'Logistics & Mua hàng',
    shortDesc: 'Tạo lệnh điều động 9 bước hoặc phát hành PO mua mới',
    color: '#ec4899',
    badgeBg: 'bg-pink-600',
  },
  6: {
    step: 6,
    title: 'Điền đầy Tài nguyên',
    role: 'Cổng kiểm soát',
    shortDesc: 'Xác nhận 100% thiết bị đã có mặt đúng chuẩn và chứng từ',
    color: '#8b5cf6',
    badgeBg: 'bg-purple-600',
  },
  7: {
    step: 7,
    title: 'Rà soát Kỹ thuật',
    role: 'Kỹ thuật viên',
    shortDesc: 'Checklist thông số, ngoại quan, vận hành, dán tem Model',
    color: '#10b981',
    badgeBg: 'bg-emerald-600',
  },
  8: {
    step: 8,
    title: 'Setup Line',
    role: 'Leader Thiết bị',
    shortDesc: '5 nhóm checklist: Lắp đặt, Hạ tầng, IT, Đào tạo, Chạy thử',
    color: '#059669',
    badgeBg: 'bg-teal-600',
  },
  9: {
    step: 9,
    title: 'Xác nhận Hoàn thành',
    role: 'Planner',
    shortDesc: 'Nghiệm thu toàn diện 8 điều kiện trước khi bàn giao Line',
    color: '#0c2340',
    badgeBg: 'bg-[#0c2340]',
  },
};

// -------------------------------------------------------------
// BƯỚC 1: KẾ HOẠCH MODEL MỚI
// -------------------------------------------------------------
export interface ProjectPlanInfo {
  projectCode: string;               // e.g. 'PRJ-MDL-2025-01'
  modelName: string;                 // e.g. 'Model Galaxy Z-Fold 7 Neo'
  factory: FactoryName;              // 'Nhà máy A' | 'Nhà máy B' | 'Nhà máy C'
  lineCount: number;                 // Số lượng Line sản xuất
  targetOutput: string;              // e.g. '150,000 SP/tháng'
  startDate: string;                 // YYYY-MM-DD
  targetDate: string;                // YYYY-MM-DD
  plannerName: string;               // Planner phụ trách
  equipmentLeaderName: string;       // Leader thiết bị phụ trách
  specialRequirements?: string;      // Ghi chú và yêu cầu đặc biệt
  attachments?: Array<{
    id: string;
    fileName: string;
    fileSize: string;
    uploadDate: string;
  }>;
}

// -------------------------------------------------------------
// BƯỚC 2: TIÊU CHUẨN THIẾT BỊ (ĐỊNH MỨC)
// -------------------------------------------------------------
export type EquipmentCategoryType =
  | 'Thiết bị chính SMT/Gia công'
  | 'Thiết bị phụ trợ'
  | 'Đồ gá JIG & Khuôn'
  | 'Thiết bị đo kiểm & Thử nghiệm'
  | 'Băng tải & Bàn thao tác';

export interface EquipmentStandardItem {
  id: string;
  equipmentCode: string;             // e.g. 'EQ-SMT-01'
  equipmentName: string;             // e.g. 'Máy dán chíp tốc độ cao Yamaha YSM20R'
  category: EquipmentCategoryType;
  compatibleStandard: string;        // Model hoặc tiêu chuẩn tương thích
  qtyPerLine: number;                // Số lượng cần cho một Line
  lineCount: number;                 // Số lượng Line của dự án
  totalDemand: number;               // Tổng nhu cầu = qtyPerLine * lineCount
  unit: string;                      // Chiếc, Bộ, Cụm
  technicalSpecs: string;            // Yêu cầu kỹ thuật đặc biệt
  isMandatory: boolean;              // Thiết bị cốt lõi bắt buộc
  notes?: string;
}

// -------------------------------------------------------------
// BƯỚC 3: RÀ SOÁT TÀI NGUYÊN NỘI BỘ
// -------------------------------------------------------------
export interface InternalResourceReviewItem {
  equipmentCode: string;
  equipmentName: string;
  totalDemand: number;
  currentInFactory: number;          // Số lượng đang có tại nhà máy
  usableCount: number;               // Số lượng thực sự sẵn sàng sử dụng
  reservedCount: number;             // Số lượng đang được giữ chỗ cho dự án khác
  defectiveCount: number;            // Số lượng đang hỏng hoặc không đủ điều kiện
  transferableCount: number;         // Số lượng có thể điều động trong xưởng
  deficitCount: number;              // Số lượng còn thiếu nội bộ = MAX(0, totalDemand - usableCount)
  reviewNotes: string;
  verifiedBy: string;
  verifiedDate: string;
  status: 'ĐỦ NỘI BỘ' | 'THIẾU NỘI BỘ';
}

// -------------------------------------------------------------
// BƯỚC 4: RÀ SOÁT TOÀN NHÀ MÁY & PHÂN NHÁNH QUYẾT ĐỊNH
// -------------------------------------------------------------
export type BranchDecisionType = 'ĐỦ TÀI NGUYÊN' | 'THIẾU TÀI NGUYÊN' | 'KẾT HỢP';

export interface ResourceBranchDecision {
  equipmentCode: string;
  equipmentName: string;
  totalDemand: number;
  internalUsable: number;
  otherFactoriesSurplus: number;     // Khả dụng từ các nhà máy khác
  qtyToTransfer: number;             // Số lượng có thể điều động liên nhà máy
  qtyToPurchase: number;             // Số lượng thiếu bắt buộc mua bổ sung
  branchType: BranchDecisionType;
  decisionNotes: string;
  decidedBy: string;
  decidedDate: string;
}

// -------------------------------------------------------------
// BƯỚC 5A & 5B: ĐIỀU ĐỘNG & MUA SẮM LIÊN KẾT
// -------------------------------------------------------------
export interface ProjectTransferOrderLink {
  id: string;
  transferOrderId: string;           // Mã lệnh TR-xxxx thực tế trong ETMS PRO
  equipmentCode: string;
  equipmentName: string;
  quantity: number;
  fromFactory: FactoryName;
  toFactory: FactoryName;
  orderStatus: string;               // e.g. 'IN_TRANSIT', 'RECEIVED_VERIFIED', 'STICKER_CONFIRMED'
  currentStep: number;               // 1 to 9
  dispatchedDate: string;
  receivedDate?: string;
  isDeliveredAndVerified: boolean;
}

export type PurchaseOrderStatus = 'ĐÃ LẬP PR' | 'ĐÃ PHÁT HÀNH PO' | 'ĐANG VẬN CHUYỂN' | 'ĐÃ VỀ KHO' | 'ĐÃ TIẾP NHẬN ĐẠT';

export interface ProjectPurchaseOrderLink {
  id: string;
  poNumber: string;                  // e.g. 'PO-2025-0881'
  equipmentCode: string;
  equipmentName: string;
  quantity: number;
  supplier: string;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  status: PurchaseOrderStatus;
  receivedQuantity: number;
  isDeliveredAndVerified: boolean;
  notes?: string;
}

// -------------------------------------------------------------
// BƯỚC 6: CỔNG XÁC NHẬN ĐIỀN ĐẦY TÀI NGUYÊN
// -------------------------------------------------------------
export interface ResourceFulfillmentItem {
  equipmentCode: string;
  equipmentName: string;
  totalDemand: number;
  transferredCount: number;
  purchasedCount: number;
  fulfilledTotal: number;
  deficitCount: number;
  isFullyFulfilled: boolean;
  documentsVerified: boolean;
}

export interface ResourceFulfillmentGate {
  items: ResourceFulfillmentItem[];
  isAllMandatoryFulfilled: boolean;
  confirmedBy?: string;
  confirmedDate?: string;
  gateStatus: 'CHƯA ĐIỀN ĐẦY' | 'ĐỦ ĐIỀU KIỆN XÁC NHẬN' | 'ĐÃ XÁC NHẬN ĐẦY ĐỦ' | 'TỪ CHỐI';
  rejectionReason?: string;
}

// -------------------------------------------------------------
// BƯỚC 7: CHECKLIST RÀ SOÁT KỸ THUẬT (KỸ THUẬT VIÊN)
// -------------------------------------------------------------
export interface TechnicalInspectionItem {
  id: string;
  itemCode: string;
  name: string;
  standardCriteria: string;          // Tiêu chí đạt chuẩn
  result: 'ĐẠT' | 'KHÔNG ĐẠT' | 'CHƯA KIỂM TRA';
  inspectorName?: string;
  inspectionDate?: string;
  notes?: string;
  evidencePhotoUrl?: string;
  repairRequestId?: string;          // Liên kết yêu cầu sửa chữa nếu hỏng
  isMandatory: boolean;
}

// -------------------------------------------------------------
// BƯỚC 8: CHECKLIST SETUP LINE (LEADER THIẾT BỊ)
// -------------------------------------------------------------
export type SetupGroupType =
  | 'A. LẮP ĐẶT THIẾT BỊ'
  | 'B. HẠ TẦNG'
  | 'C. IT & CHƯƠNG TRÌNH'
  | 'D. ĐÀO TẠO'
  | 'E. KIỂM THỬ CHẠY THỬ';

export type SetupTaskStatus =
  | 'CHƯA THỰC HIỆN'
  | 'ĐANG THỰC HIỆN'
  | 'HOÀN THÀNH'
  | 'CÓ VẤN ĐỀ'
  | 'KHÔNG ÁP DỤNG';

export interface LineSetupTaskItem {
  id: string;
  group: SetupGroupType;
  taskName: string;
  details: string;
  status: SetupTaskStatus;
  assignedTo: string;
  deadline: string;
  completedDate?: string;
  confirmedBy?: string;
  notes?: string;
  evidenceUrl?: string;
  notApplicableReason?: string;
  isMandatory: boolean;
}

// -------------------------------------------------------------
// BƯỚC 9: CỔNG PHÊ DUYỆT HOÀN THÀNH (PLANNER SIGN-OFF)
// -------------------------------------------------------------
export interface PlannerSignOffConditions {
  planApproved: boolean;             // 1. Kế hoạch Model mới đã xác nhận
  standardsApproved: boolean;        // 2. Tiêu chuẩn thiết bị đã khai báo
  resourcesFulfilled: boolean;       // 3. Tài nguyên đã được điền đầy đủ
  technicalInspectionsPassed: boolean;// 4. Kỹ thuật viên kiểm tra 100% đạt
  lineSetupCompleted: boolean;       // 5. Setup Line hoàn thành các mục bắt buộc
  noCriticalIssues: boolean;         // 6. Không còn tồn đọng rủi ro chưa xử lý
  docsComplete: boolean;             // 7. Hồ sơ & chứng từ giao nhận đầy đủ
  readyForProduction: boolean;       // 8. Sẵn sàng đưa vào sản xuất đại trà
}

export interface PlannerFinalSignOff {
  conditions: PlannerSignOffConditions;
  isReadyForSignOff: boolean;
  decision: 'CHỜ DUYỆT' | 'ĐÃ PHÊ DUYỆT HOÀN THÀNH' | 'TỪ CHỐI / TRẢ LẠI' | 'YÊU CẦU BỔ SUNG';
  signedBy?: string;
  signedDate?: string;
  decisionReason?: string;
}

// -------------------------------------------------------------
// NHẬT KÝ SỰ KIỆN (AUDIT TRAIL)
// -------------------------------------------------------------
export interface ProjectEventLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  stepNumber: ProjectStepNumber;
  details: string;
}

// -------------------------------------------------------------
// MASTER NEW MODEL PROJECT ENTITY
// -------------------------------------------------------------
export interface NewModelProject {
  id: string;                        // Unique ID (e.g. 'PRJ-MDL-2025-01')
  projectCode: string;
  modelName: string;
  factory: FactoryName;
  lineCount: number;
  targetOutput: string;
  startDate: string;
  targetDate: string;
  plannerName: string;
  equipmentLeaderName: string;
  status: ProjectStatus;
  currentStep: ProjectStepNumber;
  progressPct: number;               // 0 - 100% calculated by milestone gates
  isOverdue: boolean;
  hasIssues: boolean;
  updatedAt: string;

  // 9 Step Data Modules
  planInfo: ProjectPlanInfo;
  equipmentStandards: EquipmentStandardItem[];
  internalReview: InternalResourceReviewItem[];
  branchDecisions: ResourceBranchDecision[];
  transferOrderLinks: ProjectTransferOrderLink[];
  purchaseOrderLinks: ProjectPurchaseOrderLink[];
  resourceFulfillment: ResourceFulfillmentGate;
  technicalInspections: TechnicalInspectionItem[];
  lineSetupTasks: LineSetupTaskItem[];
  finalSignOff: PlannerFinalSignOff;

  // Audit trail
  eventLogs: ProjectEventLog[];
}

// KPI Overview Summary
export interface NewModelProjectKPIs {
  totalProjects: number;
  inPlanningCount: number;
  fulfillingResourcesCount: number;
  technicalInspectionCount: number;
  lineSetupCount: number;
  waitingPlannerSignOffCount: number;
  completedCount: number;
  onHoldOrIssueCount: number;
  onTrackRatePct: number;
}

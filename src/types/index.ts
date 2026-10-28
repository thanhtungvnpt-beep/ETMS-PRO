export * from './workforce';
export * from './workforcePhase2';

export type TransferStatus =
  | 'DRAFT'                  // Lưu nháp
  | 'WAITING_CONFIRMATION'  // Chờ xác nhận
  | 'CONFIRMED'             // Đã xác nhận (A & B đã ký)
  | 'DISPATCH_REGISTERED'   // Đã đăng ký tài sản chuyển đi
  | 'IN_TRANSIT'            // Đang chuyển thiết bị
  | 'DELIVERY_UPLOADED'     // Đã tải biên bản giao nhận
  | 'RECEIVED_VERIFIED'     // Đã xác nhận nhận máy
  | 'DISCREPANCY_FLAGGED'   // Có sai lệch khi nhận máy
  | 'BOOK_TRANSFERRED'      // Đã chuyển sổ sách
  | 'QR_PRINTED'            // Đã in tem QR
  | 'STICKER_CONFIRMED'     // Đã dán tem (Hoàn tất)
  | 'CANCELLED';            // Đã hủy

export interface PlannedAssetItem {
  id: string;
  assetCode: string;
  name: string;
  quantity: number;
  note: string;
}

export interface RegisteredAssetItem {
  id: string;
  assetCode: string;
  name: string;
  serial: string;
  quantity: number;
  condition: 'Tốt' | 'Đã qua sử dụng' | 'Cần kiểm định';
  image: string;
}

export interface ReceiptVerificationItem {
  id: string;
  assetCode: string;
  serial: string;
  quantity: number;
  condition: string;
  matchResult: 'Đủ' | 'Thiếu' | 'Thừa' | 'Sai serial' | 'Hư hỏng';
  note?: string;
}

export interface DiscrepancyRecord {
  id: string;
  orderId: string;
  reportedBy: string;
  reportedDate: string;
  type: 'Thiếu tài sản' | 'Thừa tài sản' | 'Sai serial' | 'Sai số lượng' | 'Hư hỏng khi vận chuyển' | 'Thiếu chứng từ';
  severity: 'Thấp' | 'Trung bình' | 'Nghiêm trọng';
  description: string;
  evidencePhoto?: string;
  status: 'Chờ xử lý' | 'Đã giải quyết' | 'Duyệt ngoại lệ';
  assignedTo: string;
  resolutionNote?: string;
}

export interface AuditEvent {
  id: string;
  orderId: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  step?: number;
  summary: string;
  reason?: string;
  details?: string;
  beforeData?: any;
  afterData?: any;
}

export interface DeliveryDocument {
  deliveryDate: string;
  docNumber: string;
  files: Array<{
    id: string;
    name: string;
    size: string;
    uploadDate: string;
    url?: string;
  }>;
  shipmentImages: string[];
}

export interface QRItem {
  newAssetCode: string; // e.g. B-TS001
  oldAssetCode: string;
  name: string;
  qrPayload: string;
  printed: boolean;
  printDate?: string;
}

export interface StickerConfirmationItem {
  id: string;
  assetCode: string;
  qrImage: string;
  actualPhoto: string;
  status: 'Chưa dán' | 'Đã dán';
  appliedDate?: string;
}

export interface TransferOrder {
  id: string; // e.g. TR-0006
  createdDate: string;
  fromFactory: 'Nhà máy A' | 'Nhà máy B' | 'Nhà máy C';
  toFactory: 'Nhà máy A' | 'Nhà máy B' | 'Nhà máy C';
  reason: string;
  expectedDate: string;
  plannerName: string;
  status: TransferStatus;
  currentStep: number; // 1 to 9
  isOverdue: boolean;
  
  // Step 1: Planned items
  plannedItems: PlannedAssetItem[];

  // Step 2: Confirmations
  confirmations: {
    factoryA: {
      confirmed: boolean;
      signerName: string;
      signedDate: string | null;
      note?: string;
    };
    factoryB: {
      confirmed: boolean;
      signerName: string;
      signedDate: string | null;
      note?: string;
    };
  };

  // Step 3: Registered assets
  registeredItems: RegisteredAssetItem[];

  // Step 4: Physical transit info
  transitDetails: {
    carrierName: string;
    licensePlate: string;
    driverName: string;
    driverPhone: string;
    departureTime: string;
    sealNumber: string;
    status: 'Chưa khởi hành' | 'Đang vận chuyển' | 'Đã đến cổng nhà máy';
  };

  // Step 5: Delivery records & documents
  deliveryDoc: DeliveryDocument;

  // Step 6: Receipt verification & discrepancies
  receiptVerification: {
    items: ReceiptVerificationItem[];
    hasDiscrepancy: boolean;
    discrepancyRecord?: DiscrepancyRecord;
    note: string;
    verifiedDate: string | null;
    verifiedBy: string | null;
  };

  // Step 7: Book transfer (manual planner action)
  bookTransfer: {
    eligible: boolean;
    transferDate: string | null;
    transferredBy: string | null;
    referenceDocNumber: string;
    note: string;
    completed: boolean;
  };

  // Step 8: QR label generation & printing
  qrPrinting: {
    items: QRItem[];
    printedDate: string | null;
    printedBy: string | null;
    completed: boolean;
  };

  // Step 9: Sticker confirmation
  stickerConfirmation: {
    items: StickerConfirmationItem[];
    note: string;
    completed: boolean;
    completedDate: string | null;
    completedBy: string | null;
  };

  // Cancellation tracking
  cancellation?: {
    requestedBy: string;
    requestedDate: string;
    reason: string;
    approvedBy?: string;
    approvedDate?: string;
    requiresExceptionFlow: boolean;
  };

  version: number;
}

// ==========================================
// INVENTORY ENRICHED TYPES (MODULE TỒN KHO)
// ==========================================

export type AssetCategory =
  | 'Cơ khí chính xác'
  | 'Khí nén & Thủy lực'
  | 'Điện & Tự động hóa'
  | 'Đo lường & Thử nghiệm'
  | 'Phụ trợ xưởng';

export type BookOwnershipStatus =
  | 'Nhà máy A'
  | 'Đang chờ chuyển quyền'
  | 'Nhà máy B'
  | 'Nhà máy C'
  | 'Tranh chấp điều chỉnh';

export type PhysicalFactoryStatus =
  | 'Nhà máy A'
  | 'Đang vận chuyển'
  | 'Nhà máy B'
  | 'Nhà máy C'
  | 'Khu vực sửa chữa'
  | 'Vị trí khác';

export type OperationalStatus =
  | 'Đang sử dụng'
  | 'Sẵn sàng điều chuyển'
  | 'Đã giữ chỗ'
  | 'Đang điều động'
  | 'Chờ kiểm tra'
  | 'Đang sửa chữa'
  | 'Bị khóa'
  | 'Ngừng sử dụng';

export type TechnicalCondition =
  | 'Tốt'
  | 'Đã qua sử dụng'
  | 'Cần hiệu chuẩn'
  | 'Cần bảo dưỡng'
  | 'Hư hỏng';

export interface AssetQRData {
  payload: string;
  code: string;
  issuedDate: string;
  isCurrent: boolean;
  version: number;
}

export interface MasterAsset {
  // 1. Định danh
  id: string;                    // Internal unique ID (e.g. AST-001)
  code: string;                  // Current asset code (e.g. TS001 or B-TS001)
  previousCode?: string;         // Previous code before factory transfer (e.g. TS001)
  name: string;                  // Equipment name
  category: AssetCategory;       // Equipment category
  serial: string;                // Manufacturer serial number

  // 2. Tách biệt 3 khái niệm trạng thái tồn kho
  bookOwnership: BookOwnershipStatus;       // Quyền sở hữu theo sổ sách
  physicalFactory: PhysicalFactoryStatus;   // Nhà máy / vị trí vật lý thực tế
  physicalLocation: string;                 // Khu vực, line máy, xưởng cụ thể
  operationalStatus: OperationalStatus;     // Trạng thái vận hành & giữ chỗ
  
  // 3. Tình trạng kỹ thuật
  technicalCondition: TechnicalCondition;

  // 4. Liên kết điều động & QR
  activeTransferId?: string;     // Transfer order locking this asset
  transferHistory: string[];     // Array of transfer order IDs
  qrInfo: AssetQRData;           // Active QR information

  // 5. Ảnh & Thông tin tài sản
  image: string;
  intakeDate: string;            // Date received into company registry
  purchaseYear: number;
  originalValue: number;
  residualValue?: number;
  documents?: Array<{
    id: string;
    name: string;
    date: string;
    size?: string;
  }>;
  discrepancyCount?: number;     // Number of flagged audit discrepancies
}

export type StockMovementType =
  | 'INTAKE'                        // Nhập tiếp nhận tài sản mới
  | 'DISPATCH_RESERVED'             // Giữ chỗ cho lệnh điều động
  | 'DISPATCH_OUT'                  // Ghi nhận xuất kho
  | 'IN_TRANSIT'                    // Bắt đầu vận chuyển
  | 'RECEIPT_CONFIRMED'             // Nhà máy đích xác nhận nhận máy
  | 'BOOK_OWNERSHIP_TRANSFERRED'   // Chuyển sổ sách quyền sở hữu kế toán
  | 'QR_ISSUED'                     // Phát hành tem QR mới
  | 'STICKER_APPLIED'               // Dán tem QR hoàn tất
  | 'LOCATION_CHANGED'              // Chuyển vị trí trong nội bộ nhà máy
  | 'CONDITION_CHANGED'             // Cập nhật tình trạng kỹ thuật
  | 'LOCKED'                        // Khóa tài sản
  | 'UNLOCKED'                      // Mở khóa tài sản
  | 'AUDIT_ADJUSTMENT'              // Điều chỉnh sau kiểm kê
  | 'DISCREPANCY_FLAGGED';          // Phát hiện sai lệch

export interface StockMovement {
  id: string;
  movementCode: string;             // e.g. MOV-2025-0012
  assetInternalId: string;
  assetCode: string;
  assetName: string;
  type: StockMovementType;
  fromFactory: string;
  toFactory: string;
  fromLocation?: string;
  toLocation?: string;
  quantity: number;
  timestamp: string;
  performedBy: string;
  role: string;
  reason: string;
  transferOrderId?: string;
  referenceDocNumber?: string;
  details?: string;
}

export type AuditItemScanStatus =
  | 'MATCHED'              // Đã tìm thấy, đúng vị trí & tình trạng
  | 'NOT_FOUND'            // Không tìm thấy (nghi ngờ thất thoát)
  | 'WRONG_LOCATION'       // Tìm thấy nhưng sai vị trí trong xưởng
  | 'WRONG_SERIAL'         // Sai mã hoặc số serial
  | 'WRONG_CONDITION'      // Sai tình trạng kỹ thuật
  | 'UNREGISTERED'         // Tài sản phát hiện chưa có trong sổ sách
  | 'IN_TRANSIT_NOT_LOST'  // Đang điều động/vận chuyển (không phải mất)
  | 'UNINSPECTABLE';       // Chưa thể kiểm tra (khu vực hạn chế)

export interface AuditCampaignItem {
  id: string;
  assetInternalId: string;
  assetCode: string;
  name: string;
  expectedSerial: string;
  expectedFactory: string;
  expectedLocation: string;
  expectedCondition: string;
  scanStatus: AuditItemScanStatus;
  actualLocation?: string;
  actualCondition?: string;
  scannedAt?: string;
  scannedBy?: string;
  notes?: string;
}

export interface AuditCampaign {
  id: string;                     // e.g. AUD-2025-Q2
  title: string;                  // e.g. Kiểm kê toàn diện Quý 2/2025
  factory: 'Nhà máy A' | 'Nhà máy B' | 'Nhà máy C' | 'ALL';
  scopeArea: string;              // e.g. Toàn bộ nhà máy / Xưởng cơ khí
  leadAuditor: string;            // Trưởng đoàn kiểm kê
  startDate: string;
  targetEndDate: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED';
  totalExpected: number;
  totalScanned: number;
  items: AuditCampaignItem[];
  notes?: string;
  completedDate?: string;
}

export interface InventoryDiscrepancy {
  id: string;                     // e.g. IDISC-001
  auditCampaignId?: string;
  assetCode: string;
  assetName: string;
  serial: string;
  factory: string;
  type:
    | 'Thất thoát / Không tìm thấy'
    | 'Sai vị trí thực tế'
    | 'Sai tình trạng kỹ thuật'
    | 'Sai số serial'
    | 'Thừa tài sản ngoài sổ sách';
  severity: 'Thấp' | 'Trung bình' | 'Nghiêm trọng';
  description: string;
  reportedBy: string;
  reportedDate: string;
  status: 'Chờ xử lý' | 'Đang xử lý' | 'Đã giải quyết' | 'Phê duyệt điều chỉnh sổ';
  assignedTo: string;
  resolutionNote?: string;
  approvedBy?: string;
  approvedDate?: string;
}

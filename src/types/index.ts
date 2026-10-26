export type UserRole = 'PLANNER' | 'FACTORY_A' | 'FACTORY_B' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  factory: 'ALL' | 'Nhà máy A' | 'Nhà máy B' | 'Nhà máy C';
  title: string;
}

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

export interface MasterAsset {
  id: string;
  code: string;
  name: string;
  serial: string;
  currentFactory: 'Nhà máy A' | 'Nhà máy B' | 'Nhà máy C';
  condition: 'Tốt' | 'Đã qua sử dụng' | 'Cần bảo dưỡng';
  image: string;
  activeTransferId?: string;
  status: 'Sẵn sàng' | 'Đang điều động' | 'Đang bảo dưỡng';
  purchaseYear: number;
  originalValue: number;
}

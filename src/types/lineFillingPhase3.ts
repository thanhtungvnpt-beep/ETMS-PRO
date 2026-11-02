// OOS ETMS PRO — Phase 3: Line Filling Control Center Types
// Real-time Workforce Allocation & Production Line Filling Management

import { VendorName, FactoryName, WorkforceGroup } from './workforce';

export type ShiftType = 'CA_NGAY' | 'CA_DEM' | 'CA_HANH_CHINH';

export interface ProductionLine {
  id: string; // e.g. "LINE-01"
  code: string; // e.g. "Line 01"
  name: string; // e.g. "Chuyền Lắp ráp SMT 01"
  factory: FactoryName | 'SEV';
  vendor: VendorName;
  area: string; // e.g. "Khu vực SMT", "Khu vực Lắp ráp Cơ khí", "Khu vực Đóng gói"
  productModel: string; // e.g. "Model A", "Model B", "Model C", "Model D"
  status: 'HOẠT ĐỘNG' | 'TẠM DỪNG' | 'BẢO TRÌ' | 'SETUP';
  shift: ShiftType;
  taktTimeSec: number; // Takt time in seconds
  hourlyTarget: number; // Target PCS per hour
  targetSopQty: number; // Target SOP per shift
  actualSopQty: number; // Actual produced PCS
  managerName: string;
  lineLeaderName: string;
  lineLeaderPhone: string;
}

export interface PositionAllocationDemand {
  position: string; // e.g. "Line Leader / Sub-Leader", "Công nhân sản xuất", "QC / IPQC", etc.
  group: WorkforceGroup;
  requiredCount: number; // Nhu cầu (người)
  actualOfficial: number; // CT (Chính thức)
  actualSeasonal: number; // TV (Thời vụ)
  actualTotal: number; // Tổng = CT + TV
  variance: number; // Thiếu / Dư (actualTotal - requiredCount)
  fillingRate: number; // Tỷ lệ %
  isCritical: boolean; // Vị trí xung yếu (nếu thiếu sẽ dừng chuyền)
}

export interface LineFillingSummary {
  lineId: string;
  lineCode: string;
  productModel: string;
  requiredHeadcount: number;
  actualOfficial: number;
  actualSeasonal: number;
  actualTotal: number;
  shortage: number; // Negative if shortage, 0 if full, positive if surplus
  fillingRate: number; // in %
  status: 'ĐỦ' | 'THIẾU' | 'DƯ';
  positions: PositionAllocationDemand[];
}

export type AttendanceMethod = 'RFID_DEVICE' | 'FACE_ID' | 'QR_SCAN' | 'LINE_LEADER_MANUAL';

export interface LineAttendanceRecord {
  id: string;
  employeeCode: string;
  fullName: string;
  vendor: VendorName;
  factory: FactoryName | 'SEV';
  lineId: string;
  lineCode: string;
  position: string;
  contractType: 'CHÍNH THỨC' | 'THỜI VỤ';
  shift: ShiftType;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:mm:ss
  checkOutTime?: string;
  status: 'ĐÚNG GIỜ' | 'ĐI MUỘN' | 'VẮNG MẶT' | 'ĐIỀU CHUYỂN_ĐẾN' | 'ĐIỀU CHUYỂN_ĐI';
  verificationMethod: AttendanceMethod;
  deviceCode: string; // e.g. "GATE-RFID-01", "FACE-CAM-03"
  isConfirmedByLeader: boolean;
  avatarUrl?: string;
  originalLine?: string; // If transferred
}

export type AlertSeverity = 'CAO' | 'TRUNG BÌNH' | 'THẤP';

export interface LineShortageAlert {
  id: string;
  lineId: string;
  lineCode: string;
  productModel: string;
  severity: AlertSeverity;
  shortageCount: number;
  fillingRate: number;
  details: string; // e.g. "Công nhân SX: -10, QC: -3"
  detectedAt: string; // HH:mm:ss
  status: 'CHƯA_XỬ_LÝ' | 'ĐANG_ĐIỀU_CHUYỂN' | 'ĐÃ_XỬ_LÝ';
  recommendedAction: string;
  assignedTo?: string;
}

export interface LineTransferLog {
  id: string;
  timestamp: string;
  fromLineCode: string;
  toLineCode: string;
  workerCount: number;
  position: string;
  authorizedBy: string;
  reason: string;
  status: 'HOÀN THÀNH' | 'ĐANG THỰC HIỆN';
}

export type DowntimeSeverity = 'LINE_STOP' | 'SPEED_LOSS' | 'WARNING_MINOR';

export type DowntimeCauseCategory =
  | 'MECHANICAL'
  | 'ELECTRICAL'
  | 'FEEDER_COMPONENT'
  | 'SOFTWARE_VISION'
  | 'PNEUMATIC_PRESSURE'
  | 'OTHER';

export interface EquipmentDowntimeReport {
  id: string;
  reportCode: string; // e.g. "DT-20261101-001"
  lineCode: string; // e.g. "Line 03"
  stationCode: string; // e.g. "ST-04"
  stationName: string; // e.g. "Trạm Gắp Linh Kiện SMT"
  equipmentCode: string; // e.g. "EQ-MNT-03"
  equipmentName: string; // e.g. "Máy gắp linh kiện Panasonic NPM-D3"
  severity: DowntimeSeverity;
  causeCategory: DowntimeCauseCategory;
  issueDescription: string;
  reportedBy: string; // Leader name
  reportedAt: string; // HH:mm:ss
  estimatedStopMinutes: number;
  actionTaken: string;
  notifyMaintenance: boolean;
  maintenanceTicketId?: string;
  status: 'PENDING_MAINTENANCE' | 'IN_REPAIR' | 'RESOLVED';
}

export type WorkerAttendanceStatus =
  | 'CÓ_MẶT'
  | 'ĐI_MUỘN'
  | 'VẮNG_PHÉP'
  | 'VẮNG_KHÔNG_PHÉP'
  | 'ĐÃ_ĐIỀU_CHUYỂN';

export interface WorkerAttendanceConfirmationItem {
  employeeCode: string;
  fullName: string;
  position: string;
  contractType: 'CHÍNH THỨC' | 'THỜI VỤ';
  confirmedStatus: WorkerAttendanceStatus;
  lateMinutes?: number;
  note?: string;
  confirmedAt?: string;
}

export interface LineLeaderSignOff {
  id: string;
  lineCode: string;
  shift: ShiftType;
  date: string;
  leaderName: string;
  leaderCode: string;
  demandCount: number;
  actualCount: number;
  shortageCount: number;
  officialCount: number;
  seasonalCount: number;
  fillingRate: number;
  sopTargetQty: number;
  notes: string;
  signedAt: string;
  status: 'ĐÃ XÁC NHẬN' | 'CHỜ XÁC NHẬN';
  signatureToken: string;
  downtimeReports?: EquipmentDowntimeReport[];
  workerAttendanceConfirmations?: WorkerAttendanceConfirmationItem[];
}

export interface AttendanceDevice {
  deviceCode: string;
  name: string;
  location: string;
  type: 'RFID_BARRIER' | 'FACE_RECOGNITION' | 'HANDHELD_TERMINAL';
  ipAddress: string;
  status: 'ONLINE' | 'OFFLINE' | 'SYNCING';
  lastPing: string;
  totalReadsToday: number;
  firmwareVersion: string;
}


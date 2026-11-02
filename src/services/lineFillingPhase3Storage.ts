// OOS ETMS PRO — Phase 3: Line Filling Control Center Storage & Service
// Real-time Workforce Allocation & Production Line Filling Management

import {
  ProductionLine,
  LineFillingSummary,
  LineAttendanceRecord,
  LineShortageAlert,
  LineTransferLog,
  LineLeaderSignOff,
  AttendanceDevice,
  EquipmentDowntimeReport,
} from '../types/lineFillingPhase3';
import {
  INITIAL_PRODUCTION_LINES,
  INITIAL_LINE_FILLING_SUMMARIES,
  INITIAL_SHORTAGE_ALERTS,
  INITIAL_TRANSFER_LOGS,
  INITIAL_LINE_LEADER_SIGNOFFS,
  INITIAL_ATTENDANCE_DEVICES,
  generateLine03Workers,
} from '../data/mockLineFillingPhase3Data';

const STORAGE_KEYS = {
  LINES: 'oos_p3_production_lines_v1',
  SUMMARIES: 'oos_p3_line_summaries_v1',
  ATTENDANCE: 'oos_p3_attendance_records_v1',
  ALERTS: 'oos_p3_shortage_alerts_v1',
  TRANSFERS: 'oos_p3_transfer_logs_v1',
  SIGNOFFS: 'oos_p3_leader_signoffs_v1',
  DEVICES: 'oos_p3_attendance_devices_v1',
  DOWNTIME: 'oos_p3_equipment_downtime_reports_v1',
};

// 1. Production Lines
export const getStoredLines = (): ProductionLine[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LINES);
    if (!raw) {
      saveStoredLines(INITIAL_PRODUCTION_LINES);
      return INITIAL_PRODUCTION_LINES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTION_LINES;
  }
};

export const saveStoredLines = (lines: ProductionLine[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LINES, JSON.stringify(lines));
  } catch (e) {
    console.error('Failed to save lines to storage', e);
  }
};

// 2. Line Filling Summaries
export const getStoredLineSummaries = (): LineFillingSummary[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUMMARIES);
    if (!raw) {
      saveStoredLineSummaries(INITIAL_LINE_FILLING_SUMMARIES);
      return INITIAL_LINE_FILLING_SUMMARIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LINE_FILLING_SUMMARIES;
  }
};

export const saveStoredLineSummaries = (summaries: LineFillingSummary[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUMMARIES, JSON.stringify(summaries));
  } catch (e) {
    console.error('Failed to save line summaries to storage', e);
  }
};

// 3. Attendance Records
export const getStoredAttendances = (): LineAttendanceRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    if (!raw) {
      const initial = generateLine03Workers();
      saveStoredAttendances(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return generateLine03Workers();
  }
};

export const saveStoredAttendances = (records: LineAttendanceRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save attendances to storage', e);
  }
};

// 4. Shortage Alerts
export const getStoredShortageAlerts = (): LineShortageAlert[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (!raw) {
      saveStoredShortageAlerts(INITIAL_SHORTAGE_ALERTS);
      return INITIAL_SHORTAGE_ALERTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SHORTAGE_ALERTS;
  }
};

export const saveStoredShortageAlerts = (alerts: LineShortageAlert[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  } catch (e) {
    console.error('Failed to save alerts to storage', e);
  }
};

// 5. Transfer Logs
export const getStoredTransferLogs = (): LineTransferLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(INITIAL_TRANSFER_LOGS));
      return INITIAL_TRANSFER_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TRANSFER_LOGS;
  }
};

export const addStoredTransferLog = (log: LineTransferLog): LineTransferLog[] => {
  const current = getStoredTransferLogs();
  const updated = [log, ...current];
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save transfer log to storage', e);
  }
  return updated;
};

// 6. Line Leader Sign-offs
export const getStoredLineLeaderSignOffs = (): LineLeaderSignOff[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SIGNOFFS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SIGNOFFS, JSON.stringify(INITIAL_LINE_LEADER_SIGNOFFS));
      return INITIAL_LINE_LEADER_SIGNOFFS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LINE_LEADER_SIGNOFFS;
  }
};

export const saveStoredLineLeaderSignOff = (signOff: LineLeaderSignOff): LineLeaderSignOff[] => {
  const current = getStoredLineLeaderSignOffs();
  const idx = current.findIndex((s) => s.lineCode === signOff.lineCode && s.date === signOff.date && s.shift === signOff.shift);
  let updated: LineLeaderSignOff[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = signOff;
  } else {
    updated = [signOff, ...current];
  }
  try {
    localStorage.setItem(STORAGE_KEYS.SIGNOFFS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save signoff to storage', e);
  }
  return updated;
};

// 7. Attendance Devices
export const getStoredAttendanceDevices = (): AttendanceDevice[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEVICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(INITIAL_ATTENDANCE_DEVICES));
      return INITIAL_ATTENDANCE_DEVICES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ATTENDANCE_DEVICES;
  }
};

export const INITIAL_DOWNTIME_REPORTS: EquipmentDowntimeReport[] = [
  {
    id: 'DT-20250420-001',
    reportCode: 'DT-L03-0824',
    lineCode: 'Line 03',
    stationCode: 'ST-04',
    stationName: 'Trạm Gắp Linh Kiện SMT (Pick & Place)',
    equipmentCode: 'EQ-MNT-03',
    equipmentName: 'Panasonic NPM-D3 Multi-Mounter',
    severity: 'SPEED_LOSS',
    causeCategory: 'FEEDER_COMPONENT',
    issueDescription: 'Feeder #18 (IC 0402) thỉnh thoảng báo lỗi hút lệch chip và nhả bẫy cuộn dẫn đến giảm 15% nhịp dập.',
    reportedBy: 'Nguyễn Văn Tuấn (Trưởng chuyền Line 03)',
    reportedAt: '08:24:15',
    estimatedStopMinutes: 20,
    actionTaken: 'Đã tạm thời vệ sinh nozzle số 3 và giảm 10% tốc độ feeder. Đã gửi yêu cầu kỹ thuật EQM xuống hỗ trợ căn chỉnh.',
    notifyMaintenance: true,
    maintenanceTicketId: 'EQM-TK-8812',
    status: 'IN_REPAIR',
  },
  {
    id: 'DT-20250420-002',
    reportCode: 'DT-L08-0910',
    lineCode: 'Line 08',
    stationCode: 'ST-05',
    stationName: 'Lò hàn Reflow đối lưu khí Nitơ',
    equipmentCode: 'EQ-RFL-08',
    equipmentName: 'Reflow Heller 1809 MK5',
    severity: 'WARNING_MINOR',
    causeCategory: 'ELECTRICAL',
    issueDescription: 'Cảm biến nhiệt độ vùng Zone 4 dao động +/- 4°C so với dải tiêu chuẩn cấu hình hàn lead-free.',
    reportedBy: 'Đỗ Tiến Đạt (Trưởng chuyền Line 08)',
    reportedAt: '09:10:00',
    estimatedStopMinutes: 10,
    actionTaken: 'Theo dõi profile nhiệt qua phần mềm KIC 24/7. Chưa dừng chuyền.',
    notifyMaintenance: true,
    maintenanceTicketId: 'EQM-TK-8819',
    status: 'PENDING_MAINTENANCE',
  },
];

// 8. Equipment Downtime Reports
export const getStoredDowntimeReports = (): EquipmentDowntimeReport[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOWNTIME);
    if (!raw) {
      saveStoredDowntimeReports(INITIAL_DOWNTIME_REPORTS);
      return INITIAL_DOWNTIME_REPORTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DOWNTIME_REPORTS;
  }
};

export const saveStoredDowntimeReports = (reports: EquipmentDowntimeReport[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DOWNTIME, JSON.stringify(reports));
  } catch (e) {
    console.error('Failed to save downtime reports to storage', e);
  }
};

export const addStoredDowntimeReport = (report: EquipmentDowntimeReport): EquipmentDowntimeReport[] => {
  const current = getStoredDowntimeReports();
  const updated = [report, ...current];
  saveStoredDowntimeReports(updated);
  return updated;
};

// High-level KPI calculation
export interface Phase3ControlTowerKPIs {
  totalDemand: number;
  totalActual: number;
  totalShortage: number;
  overallFillingRate: number;
  totalOfficial: number;
  totalSeasonal: number;
  officialRatio: number;
  seasonalRatio: number;
  fullLinesCount: number;
  shortageLinesCount: number;
  criticalAlertsCount: number;
}

export const calculateControlTowerKPIs = (summaries: LineFillingSummary[]): Phase3ControlTowerKPIs => {
  let totalDemand = 0;
  let totalActual = 0;
  let totalOfficial = 0;
  let totalSeasonal = 0;
  let fullLinesCount = 0;
  let shortageLinesCount = 0;

  summaries.forEach((s) => {
    totalDemand += s.requiredHeadcount;
    totalActual += s.actualTotal;
    totalOfficial += s.actualOfficial;
    totalSeasonal += s.actualSeasonal;
    if (s.shortage < 0) {
      shortageLinesCount++;
    } else {
      fullLinesCount++;
    }
  });

  const totalShortage = totalActual - totalDemand; // e.g. -38
  const overallFillingRate = totalDemand > 0 ? Math.round((totalActual / totalDemand) * 1000) / 10 : 0;
  const officialRatio = totalActual > 0 ? Math.round((totalOfficial / totalActual) * 1000) / 10 : 0;
  const seasonalRatio = totalActual > 0 ? Math.round((totalSeasonal / totalActual) * 1000) / 10 : 0;

  const alerts = getStoredShortageAlerts();
  const criticalAlertsCount = alerts.filter((a) => a.severity === 'CAO').length;

  return {
    totalDemand,
    totalActual,
    totalShortage: Math.abs(totalShortage),
    overallFillingRate,
    totalOfficial,
    totalSeasonal,
    officialRatio,
    seasonalRatio,
    fullLinesCount,
    shortageLinesCount,
    criticalAlertsCount,
  };
};

// Business Action: Transfer Workers between Lines
export const executeWorkforceTransfer = (
  fromLineCode: string,
  toLineCode: string,
  workerCount: number,
  position: string,
  authorizedBy: string,
  reason: string
): { success: boolean; message: string; updatedSummaries: LineFillingSummary[] } => {
  const summaries = getStoredLineSummaries();
  const fromIdx = summaries.findIndex((s) => s.lineCode === fromLineCode);
  const toIdx = summaries.findIndex((s) => s.lineCode === toLineCode);

  if (fromLineCode !== 'Pool Dự phòng KHV' && fromIdx < 0) {
    return { success: false, message: `Không tìm thấy chuyền nguồn: ${fromLineCode}`, updatedSummaries: summaries };
  }
  if (toIdx < 0) {
    return { success: false, message: `Không tìm thấy chuyền đích: ${toLineCode}`, updatedSummaries: summaries };
  }

  const updated = [...summaries];

  // If transferring from another real line, deduct from that line
  if (fromIdx >= 0) {
    const fromLine = { ...updated[fromIdx] };
    const posIdx = fromLine.positions.findIndex((p) => p.position === position);
    if (posIdx >= 0 && fromLine.positions[posIdx].actualTotal >= workerCount) {
      fromLine.positions[posIdx].actualSeasonal = Math.max(0, fromLine.positions[posIdx].actualSeasonal - workerCount);
      fromLine.positions[posIdx].actualTotal = fromLine.positions[posIdx].actualOfficial + fromLine.positions[posIdx].actualSeasonal;
      fromLine.positions[posIdx].variance = fromLine.positions[posIdx].actualTotal - fromLine.positions[posIdx].requiredCount;
      fromLine.positions[posIdx].fillingRate = Math.round((fromLine.positions[posIdx].actualTotal / fromLine.positions[posIdx].requiredCount) * 100);
    }
    fromLine.actualSeasonal = Math.max(0, fromLine.actualSeasonal - workerCount);
    fromLine.actualTotal = fromLine.actualOfficial + fromLine.actualSeasonal;
    fromLine.shortage = fromLine.actualTotal - fromLine.requiredHeadcount;
    fromLine.fillingRate = Math.round((fromLine.actualTotal / fromLine.requiredHeadcount) * 1000) / 10;
    fromLine.status = fromLine.shortage < 0 ? 'THIẾU' : 'ĐỦ';
    updated[fromIdx] = fromLine;
  }

  // Add to target line
  const toLine = { ...updated[toIdx] };
  const toPosIdx = toLine.positions.findIndex((p) => p.position === position);
  if (toPosIdx >= 0) {
    toLine.positions[toPosIdx].actualSeasonal += workerCount;
    toLine.positions[toPosIdx].actualTotal = toLine.positions[toPosIdx].actualOfficial + toLine.positions[toPosIdx].actualSeasonal;
    toLine.positions[toPosIdx].variance = toLine.positions[toPosIdx].actualTotal - toLine.positions[toPosIdx].requiredCount;
    toLine.positions[toPosIdx].fillingRate = Math.round((toLine.positions[toPosIdx].actualTotal / toLine.positions[toPosIdx].requiredCount) * 100);
  }
  toLine.actualSeasonal += workerCount;
  toLine.actualTotal = toLine.actualOfficial + toLine.actualSeasonal;
  toLine.shortage = toLine.actualTotal - toLine.requiredHeadcount;
  toLine.fillingRate = Math.round((toLine.actualTotal / toLine.requiredHeadcount) * 1000) / 10;
  toLine.status = toLine.shortage < 0 ? 'THIẾU' : 'ĐỦ';
  updated[toIdx] = toLine;

  saveStoredLineSummaries(updated);

  // Add log
  addStoredTransferLog({
    id: `TRF-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    fromLineCode,
    toLineCode,
    workerCount,
    position,
    authorizedBy,
    reason,
    status: 'HOÀN THÀNH',
  });

  return {
    success: true,
    message: `Đã điều chuyển thành công ${workerCount} nhân sự (${position}) từ ${fromLineCode} sang ${toLineCode}.`,
    updatedSummaries: updated,
  };
};

export const resetPhase3ToBaseline = (): void => {
  localStorage.removeItem(STORAGE_KEYS.LINES);
  localStorage.removeItem(STORAGE_KEYS.SUMMARIES);
  localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
  localStorage.removeItem(STORAGE_KEYS.ALERTS);
  localStorage.removeItem(STORAGE_KEYS.TRANSFERS);
  localStorage.removeItem(STORAGE_KEYS.SIGNOFFS);
  localStorage.removeItem(STORAGE_KEYS.DEVICES);
  saveStoredLines(INITIAL_PRODUCTION_LINES);
  saveStoredLineSummaries(INITIAL_LINE_FILLING_SUMMARIES);
  saveStoredAttendances(generateLine03Workers());
  saveStoredShortageAlerts(INITIAL_SHORTAGE_ALERTS);
  saveStoredTransferLogs(INITIAL_TRANSFER_LOGS);
  saveStoredLineLeaderSignOffs(INITIAL_LINE_LEADER_SIGNOFFS);
  saveStoredAttendanceDevices(INITIAL_ATTENDANCE_DEVICES);
};

function saveStoredTransferLogs(logs: LineTransferLog[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save transfers', e);
  }
}

function saveStoredLineLeaderSignOffs(signoffs: LineLeaderSignOff[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SIGNOFFS, JSON.stringify(signoffs));
  } catch (e) {
    console.error('Failed to save signoffs', e);
  }
}

function saveStoredAttendanceDevices(devices: AttendanceDevice[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
  } catch (e) {
    console.error('Failed to save devices', e);
  }
}

// OOS ETMS PRO — Phase 3: Line Leader Mobile Confirmation Modal
// Allows Line Leaders to confirm daily attendance per worker and report immediate equipment downtime.

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ShiftType,
  LineAttendanceRecord,
  EquipmentDowntimeReport,
  DowntimeSeverity,
  DowntimeCauseCategory,
  WorkerAttendanceStatus,
  LineLeaderSignOff,
} from '../../types/lineFillingPhase3';
import { UserProfile } from '../../types/workforce';
import {
  getStoredAttendances,
  saveStoredAttendances,
  getStoredDowntimeReports,
  addStoredDowntimeReport,
  saveStoredDowntimeReports,
  saveStoredLineLeaderSignOff,
  getStoredLineSummaries,
  saveStoredLineSummaries,
} from '../../services/lineFillingPhase3Storage';
import {
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  UserX,
  Wrench,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Send,
  X,
  FileCheck,
  Zap,
  Activity,
  Layers,
  PhoneCall,
  Flame,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface LineLeaderMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  initialLineCode?: string;
  onSuccess?: (msg: string) => void;
}

// Stations and common equipment in assembly line
const STATIONS_FOR_LINE = [
  { code: 'ST-01', name: 'Trạm Cấp Bo Mạch (Auto Loader)', eqCode: 'EQ-LDR-03', eqName: 'YJ-LD460 Auto PCB Loader' },
  { code: 'ST-02', name: 'Trạm In Kem Hàn (Screen Printer)', eqCode: 'EQ-PRT-03', eqName: 'GKG G5 Solder Paste Printer' },
  { code: 'ST-03', name: 'Trạm Kiểm Tra SPI (3D SPI)', eqCode: 'EQ-SPI-03', eqName: 'CyberOptics SE500 3D SPI' },
  { code: 'ST-04', name: 'Trạm Gắp Linh Kiện (High-Speed Mounter)', eqCode: 'EQ-MNT-03', eqName: 'Panasonic NPM-D3 Multi-Mounter' },
  { code: 'ST-05', name: 'Trạm Lò Hàn Đối Lưu (Reflow Oven)', eqCode: 'EQ-RFL-03', eqName: 'Rehm VXS Nitrogen Reflow' },
  { code: 'ST-06', name: 'Trạm Kiểm Tra Quang Học (3D AOI)', eqCode: 'EQ-AOI-03', eqName: 'Koh Young Zenith 3D AOI' },
  { code: 'ST-07', name: 'Trạm Hàn Tay & Sửa Chữa (Touch-up / Repair)', eqCode: 'EQ-REP-03', eqName: 'Weller WX2021 Dual Soldering Station' },
  { code: 'ST-08', name: 'Trạm Kiểm Tra Chức Năng (FCT Tester)', eqCode: 'EQ-FCT-03', eqName: 'Keysight i3070 In-Circuit Tester' },
  { code: 'ST-09', name: 'Trạm Đóng Gói & Dán Nhãn Barcode', eqCode: 'EQ-PKG-03', eqName: 'Zebra ZT411 Industrial Labeler' },
];

export const LineLeaderMobileModal: React.FC<LineLeaderMobileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialLineCode = 'Line 03',
  onSuccess,
}) => {
  // Active navigation tab inside mobile modal
  const [activeTab, setActiveTab] = useState<'attendance' | 'downtime' | 'signoff'>('attendance');
  const [selectedLine, setSelectedLine] = useState<string>(initialLineCode);
  const [selectedShift, setSelectedShift] = useState<ShiftType>('CA_NGAY');
  
  // Data states
  const [attendances, setAttendances] = useState<LineAttendanceRecord[]>([]);
  const [downtimeReports, setDowntimeReports] = useState<EquipmentDowntimeReport[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [positionFilter, setPositionFilter] = useState<string>('Tất cả');
  const [statusFilter, setStatusFilter] = useState<string>('Tất cả');

  // Downtime reporting form state
  const [selectedStationIndex, setSelectedStationIndex] = useState<number>(3); // Default to ST-04 Mounter
  const [downtimeSeverity, setDowntimeSeverity] = useState<DowntimeSeverity>('SPEED_LOSS');
  const [causeCategory, setCauseCategory] = useState<DowntimeCauseCategory>('FEEDER_COMPONENT');
  const [issueDescription, setIssueDescription] = useState<string>(
    'Feeder #18 (IC 0402) thỉnh thoảng báo lỗi hút lệch chip và nhả bẫy cuộn dẫn đến giảm 15% nhịp dập.'
  );
  const [estimatedStopMinutes, setEstimatedStopMinutes] = useState<number>(20);
  const [actionTaken, setActionTaken] = useState<string>(
    'Tạm thời vệ sinh nozzle số 3 và giảm tốc độ feeder. Đã gọi kỹ thuật EQM xuống căn chỉnh.'
  );
  const [notifyMaintenance, setNotifyMaintenance] = useState<boolean>(true);
  const [downtimeFormExpanded, setDowntimeFormExpanded] = useState<boolean>(false);

  // Sign-off note & signature
  const [leaderNotes, setLeaderNotes] = useState<string>(
    'Đã kiểm tra đầu ca: Các trạm đủ công nhân chủ chốt, đã báo EQM hỗ trợ trạm mounter ST-04.'
  );
  const [hasDrawnSignature, setHasDrawnSignature] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // Selected workers state for 'Select All' and batch verification
  const [selectedWorkerCodes, setSelectedWorkerCodes] = useState<Set<string>>(new Set());
  const selectAllCheckboxRef = useRef<HTMLInputElement | null>(null);

  // Load initial data on open
  useEffect(() => {
    if (isOpen) {
      const allAttendances = getStoredAttendances();
      // Filter or attach for the selected line
      const lineWorkers = allAttendances.filter((a) => a.lineCode === selectedLine);
      setAttendances(lineWorkers.length > 0 ? lineWorkers : allAttendances.slice(0, 42));
      setDowntimeReports(getStoredDowntimeReports());
      setFeedbackMsg('');
      setSelectedWorkerCodes(new Set());
    }
  }, [isOpen, selectedLine]);

  // Canvas signature handler
  useEffect(() => {
    if (activeTab === 'signoff' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#082D55';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeTab]);

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawnSignature(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const handleStopDraw = () => {
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  // Filtered workers list
  const filteredWorkers = useMemo(() => {
    return attendances.filter((w) => {
      if (positionFilter !== 'Tất cả' && w.position !== positionFilter) return false;
      if (statusFilter === 'CÓ_MẶT' && w.status !== 'ĐÚNG GIỜ') return false;
      if (statusFilter === 'ĐI_MUỘN' && w.status !== 'ĐI MUỘN') return false;
      if (statusFilter === 'VẮNG_MẶT' && w.status !== 'VẮNG MẶT') return false;
      if (
        searchQuery &&
        !w.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !w.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [attendances, positionFilter, statusFilter, searchQuery]);

  // Check if all or some filtered workers are selected
  const isAllSelected = useMemo(() => {
    if (filteredWorkers.length === 0) return false;
    return filteredWorkers.every((w) => selectedWorkerCodes.has(w.employeeCode));
  }, [filteredWorkers, selectedWorkerCodes]);

  const isSomeSelected = useMemo(() => {
    return filteredWorkers.some((w) => selectedWorkerCodes.has(w.employeeCode)) && !isAllSelected;
  }, [filteredWorkers, selectedWorkerCodes, isAllSelected]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  // Toggle Select All visible workers
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const next = new Set(selectedWorkerCodes);
      filteredWorkers.forEach((w) => next.delete(w.employeeCode));
      setSelectedWorkerCodes(next);
    } else {
      const next = new Set(selectedWorkerCodes);
      filteredWorkers.forEach((w) => next.add(w.employeeCode));
      setSelectedWorkerCodes(next);
    }
  };

  // Toggle individual worker selection
  const handleToggleWorker = (empCode: string) => {
    const next = new Set(selectedWorkerCodes);
    if (next.has(empCode)) {
      next.delete(empCode);
    } else {
      next.add(empCode);
    }
    setSelectedWorkerCodes(next);
  };

  // Quick verify all selected workers as Present
  const handleConfirmSelectedPresent = () => {
    if (selectedWorkerCodes.size === 0) return;
    const updated = attendances.map((w) => {
      if (selectedWorkerCodes.has(w.employeeCode)) {
        return {
          ...w,
          status: 'ĐÚNG GIỜ' as const,
          isConfirmedByLeader: true,
        };
      }
      return w;
    });
    setAttendances(updated);
    saveStoredAttendances(updated);
    const count = selectedWorkerCodes.size;
    setFeedbackMsg(`Đã xác nhận CÓ MẶT cho ${count} công nhân được chọn thành công!`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Statistics
  const stats = useMemo(() => {
    const total = attendances.length;
    const present = attendances.filter((w) => w.status === 'ĐÚNG GIỜ' || w.status === 'ĐIỀU CHUYỂN_ĐẾN').length;
    const late = attendances.filter((w) => w.status === 'ĐI MUỘN').length;
    const absent = attendances.filter((w) => w.status === 'VẮNG MẶT' || w.status === 'ĐIỀU CHUYỂN_ĐI').length;
    const official = attendances.filter((w) => w.contractType === 'CHÍNH THỨC').length;
    const seasonal = attendances.filter((w) => w.contractType === 'THỜI VỤ').length;
    const required = 50; // Standard line target
    const rate = total > 0 ? Math.round(((present + late) / required) * 1000) / 10 : 0;
    return { total, present, late, absent, official, seasonal, required, rate };
  }, [attendances]);

  // Update a single worker's status
  const handleUpdateWorkerStatus = (empCode: string, newStatus: LineAttendanceRecord['status']) => {
    const updated = attendances.map((w) => {
      if (w.employeeCode === empCode) {
        return {
          ...w,
          status: newStatus,
          isConfirmedByLeader: true,
        };
      }
      return w;
    });
    setAttendances(updated);
    saveStoredAttendances(updated);
    setFeedbackMsg(`Đã cập nhật trạng thái nhân viên ${empCode}`);
    setTimeout(() => setFeedbackMsg(''), 2500);
  };

  // Quick action: Confirm all as Present
  const handleConfirmAllPresent = () => {
    const updated = attendances.map((w) => ({
      ...w,
      status: 'ĐÚNG GIỜ' as const,
      isConfirmedByLeader: true,
    }));
    setAttendances(updated);
    saveStoredAttendances(updated);
    setFeedbackMsg(`Đã đánh dấu ${updated.length} nhân sự CÓ MẶT thành công!`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Submit new downtime incident
  const handleReportDowntime = (e: React.FormEvent) => {
    e.preventDefault();
    const st = STATIONS_FOR_LINE[selectedStationIndex];
    const newReport: EquipmentDowntimeReport = {
      id: `DT-${Date.now().toString().slice(-6)}`,
      reportCode: `DT-L03-${new Date().getHours()}${new Date().getMinutes()}`,
      lineCode: selectedLine,
      stationCode: st.code,
      stationName: st.name,
      equipmentCode: st.eqCode,
      equipmentName: st.eqName,
      severity: downtimeSeverity,
      causeCategory: causeCategory,
      issueDescription: issueDescription.trim() || 'Sự cố thiết bị dừng tạm thời',
      reportedBy: currentUser.name || 'Nguyễn Văn Tuấn (Trưởng chuyền)',
      reportedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      estimatedStopMinutes: Number(estimatedStopMinutes) || 15,
      actionTaken: actionTaken.trim() || 'Đã thông báo bảo trì',
      notifyMaintenance: notifyMaintenance,
      maintenanceTicketId: notifyMaintenance ? `EQM-TK-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      status: 'PENDING_MAINTENANCE',
    };

    const updatedList = addStoredDowntimeReport(newReport);
    setDowntimeReports(updatedList);
    setDowntimeFormExpanded(false);
    setFeedbackMsg(`Đã phát lệnh sự cố thiết bị [${st.code}] tới bộ phận EQM thành công!`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Mark downtime as resolved
  const handleResolveDowntime = (id: string) => {
    const updated = downtimeReports.map((d) => (d.id === id ? { ...d, status: 'RESOLVED' as const } : d));
    setDowntimeReports(updated);
    saveStoredDowntimeReports(updated);
    setFeedbackMsg('Đã đánh dấu sự cố thiết bị đã khắc phục!');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Final Sign-Off Submission
  const handleSubmitSignOff = () => {
    const token = `OOS-SIG-${Date.now().toString(36).toUpperCase()}-${selectedLine.replace(' ', '')}`;
    const newSignoff: LineLeaderSignOff = {
      id: `SIGNOFF-${selectedLine.replace(' ', '-')}-${Date.now().toString().slice(-4)}`,
      lineCode: selectedLine,
      shift: selectedShift,
      date: new Date().toISOString().slice(0, 10),
      leaderName: currentUser.name || 'Nguyễn Văn Tuấn',
      leaderCode: 'KHV-LEAD-03',
      demandCount: stats.required,
      actualCount: stats.present + stats.late,
      shortageCount: Math.max(0, stats.required - (stats.present + stats.late)),
      officialCount: stats.official,
      seasonalCount: stats.seasonal,
      fillingRate: stats.rate,
      sopTargetQty: 896,
      notes: leaderNotes,
      signedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'ĐÃ XÁC NHẬN',
      signatureToken: token,
      downtimeReports: downtimeReports.filter((d) => d.lineCode === selectedLine),
    };

    saveStoredLineLeaderSignOff(newSignoff);

    // Also update line summary filling rate
    const summaries = getStoredLineSummaries();
    const sIdx = summaries.findIndex((s) => s.lineCode === selectedLine);
    if (sIdx >= 0) {
      const lineSummary = { ...summaries[sIdx] };
      lineSummary.actualTotal = stats.present + stats.late;
      lineSummary.shortage = lineSummary.actualTotal - lineSummary.requiredHeadcount;
      lineSummary.fillingRate = Math.round((lineSummary.actualTotal / lineSummary.requiredHeadcount) * 1000) / 10;
      lineSummary.status = lineSummary.shortage < 0 ? 'THIẾU' : 'ĐỦ';
      summaries[sIdx] = lineSummary;
      saveStoredLineSummaries(summaries);
    }

    if (onSuccess) {
      onSuccess(`Trưởng chuyền ${newSignoff.leaderName} đã ký chốt thành công quân số ${selectedLine} (Token: ${token})!`);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Mobile Frame Container */}
      <div className="bg-[#082D55] rounded-3xl shadow-2xl max-w-md w-full border border-blue-900 text-slate-800 flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* ======================================================== */}
        {/* 1. MOBILE PHONE STATUS BAR & HEADER                      */}
        {/* ======================================================== */}
        <div className="bg-[#082D55] text-white px-4 pt-3 pb-2.5 border-b border-blue-800/80 shrink-0">
          {/* Top fake phone status */}
          <div className="flex items-center justify-between text-[10px] text-cyan-300 font-mono mb-2">
            <span className="flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              OOS MOBILE • LEADER APP
            </span>
            <div className="flex items-center gap-2 text-slate-300">
              <span>5G</span>
              <span>98% 🔋</span>
              <span>10:24</span>
            </div>
          </div>

          {/* App title and close button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1688E8] to-[#55D5FF] flex items-center justify-center text-white shadow-xs">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white leading-tight">
                  Xác Nhận Chuyền Trưởng (Mobile)
                </h3>
                <div className="text-[11px] text-cyan-200">
                  {currentUser.name || 'Nguyễn Văn Tuấn'} • {currentUser.title || 'Trưởng chuyền'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-blue-900/60 hover:bg-blue-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Line & Shift Selector Bar */}
          <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs">
            <div className="bg-blue-950/70 p-1.5 rounded-xl border border-blue-800 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">Chuyền:</span>
              <select
                value={selectedLine}
                onChange={(e) => setSelectedLine(e.target.value)}
                className="bg-transparent text-white font-extrabold text-xs focus:outline-none cursor-pointer text-right"
              >
                <option value="Line 01" className="text-slate-900">Line 01 (Model A)</option>
                <option value="Line 02" className="text-slate-900">Line 02 (Model A)</option>
                <option value="Line 03" className="text-slate-900">Line 03 (Model B)</option>
                <option value="Line 04" className="text-slate-900">Line 04 (Model B)</option>
                <option value="Line 05" className="text-slate-900">Line 05 (Model C)</option>
                <option value="Line 06" className="text-slate-900">Line 06 (Model C)</option>
                <option value="Line 07" className="text-slate-900">Line 07 (Model D)</option>
                <option value="Line 08" className="text-slate-900">Line 08 (Model D)</option>
              </select>
            </div>

            <div className="bg-blue-950/70 p-1.5 rounded-xl border border-blue-800 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400">Ca:</span>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value as ShiftType)}
                className="bg-transparent text-white font-extrabold text-xs focus:outline-none cursor-pointer text-right"
              >
                <option value="CA_NGAY" className="text-slate-900">Ca ngày (08:00 - 17:00)</option>
                <option value="CA_DEM" className="text-slate-900">Ca đêm (20:00 - 05:00)</option>
                <option value="CA_HANH_CHINH" className="text-slate-900">Hành chính</option>
              </select>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. SUB-TABS (Điểm danh / Sự cố máy / Chốt ca)            */}
        {/* ======================================================== */}
        <div className="bg-slate-100 p-1.5 border-b border-slate-200 flex items-center gap-1 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-white text-blue-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Điểm danh</span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 rounded-full font-mono">
              {stats.present + stats.late}/{stats.required}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('downtime')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
              activeTab === 'downtime'
                ? 'bg-white text-rose-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-rose-600" />
            <span>Sự cố máy</span>
            {downtimeReports.filter((d) => d.lineCode === selectedLine && d.status !== 'RESOLVED').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-1 right-2" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('signoff')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'signoff'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ký chốt ca</span>
          </button>
        </div>

        {/* Toast / Feedback Banner if present */}
        {feedbackMsg && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-1.5 px-3 flex items-center justify-between shrink-0 animate-in fade-in">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {feedbackMsg}
            </span>
            <button
              type="button"
              onClick={() => setFeedbackMsg('')}
              className="text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. TAB CONTENT AREA                                      */}
        {/* ======================================================== */}
        <div className="bg-[#F2F6FA] flex-1 overflow-y-auto p-3 space-y-3">
          
          {/* ======================================================== */}
          {/* TAB 1: WORKER-BY-WORKER ATTENDANCE                       */}
          {/* ======================================================== */}
          {activeTab === 'attendance' && (
            <div className="space-y-3">
              {/* Quick line filling summary bar */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-navy-950 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600" />
                    Hiện diện: {selectedLine}
                  </span>
                  <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Tỷ lệ: {stats.rate}%
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                  <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <div className="text-slate-500 font-medium">Nhu cầu</div>
                    <div className="font-black text-sm text-navy-950 font-mono">{stats.required}</div>
                  </div>
                  <div className="bg-emerald-50 p-1.5 rounded-xl border border-emerald-200">
                    <div className="text-emerald-700 font-medium">Có mặt</div>
                    <div className="font-black text-sm text-emerald-800 font-mono">{stats.present}</div>
                  </div>
                  <div className="bg-amber-50 p-1.5 rounded-xl border border-amber-200">
                    <div className="text-amber-700 font-medium">Đi muộn</div>
                    <div className="font-black text-sm text-amber-800 font-mono">{stats.late}</div>
                  </div>
                  <div className="bg-rose-50 p-1.5 rounded-xl border border-rose-200">
                    <div className="text-rose-700 font-medium">Vắng mặt</div>
                    <div className="font-black text-sm text-rose-800 font-mono">{stats.absent}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                  <div
                    style={{ width: `${Math.min(100, stats.rate)}%` }}
                    className={`h-full transition-all duration-300 ${
                      stats.rate >= 95 ? 'bg-emerald-500' : stats.rate >= 85 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  />
                </div>

                {/* Batch Action Button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    CT: <strong>{stats.official}</strong> • TV: <strong>{stats.seasonal}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleConfirmAllPresent}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Zap className="w-3 h-3 text-cyan-300" />
                    Chốt tất cả Có mặt
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="space-y-1.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tên hoặc mã nhân viên..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px]">
                  <select
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                    className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium shrink-0 cursor-pointer"
                  >
                    <option value="Tất cả">Tất cả vị trí</option>
                    <option value="Line Leader / Sub-Leader">Line Leader</option>
                    <option value="Công nhân sản xuất">Công nhân sản xuất</option>
                    <option value="QC / IPQC">QC / IPQC</option>
                    <option value="Hỗ trợ chuyền">Hỗ trợ chuyền</option>
                    <option value="Sửa chữa (Repair)">Sửa chữa (Repair)</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium shrink-0 cursor-pointer"
                  >
                    <option value="Tất cả">Tất cả trạng thái</option>
                    <option value="CÓ_MẶT">Có mặt</option>
                    <option value="ĐI_MUỘN">Đi muộn</option>
                    <option value="VẮNG_MẶT">Vắng mặt</option>
                  </select>

                  <span className="text-[10px] text-slate-500 ml-auto shrink-0 font-mono">
                    {filteredWorkers.length} người
                  </span>
                </div>
              </div>

              {/* Select All & Batch Action Toolbar */}
              <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2 text-xs">
                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer select-none">
                  <input
                    ref={selectAllCheckboxRef}
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs">
                    Chọn tất cả ({filteredWorkers.length})
                  </span>
                  {selectedWorkerCodes.size > 0 && (
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-full">
                      Đã chọn: {selectedWorkerCodes.size}
                    </span>
                  )}
                </label>

                <div className="flex items-center gap-1.5">
                  {selectedWorkerCodes.size > 0 ? (
                    <button
                      type="button"
                      onClick={handleConfirmSelectedPresent}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer transition-all animate-in fade-in"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Xác nhận Có mặt ({selectedWorkerCodes.size})</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const next = new Set(selectedWorkerCodes);
                        filteredWorkers.forEach((w) => next.add(w.employeeCode));
                        setSelectedWorkerCodes(next);
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Chọn nhanh tất cả
                    </button>
                  )}
                </div>
              </div>

              {/* Worker List Cards */}
              <div className="space-y-2">
                {filteredWorkers.length === 0 ? (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                    Không tìm thấy nhân viên phù hợp bộ lọc.
                  </div>
                ) : (
                  filteredWorkers.map((worker) => {
                    const isSelected = selectedWorkerCodes.has(worker.employeeCode);
                    return (
                      <div
                        key={worker.employeeCode}
                        className={`p-3 rounded-2xl border shadow-2xs transition-all space-y-2 ${
                          isSelected
                            ? 'bg-blue-50/50 border-blue-400 ring-1 ring-blue-300'
                            : 'bg-white border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleWorker(worker.employeeCode)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0 accent-blue-600"
                              title={`Chọn ${worker.fullName}`}
                            />
                            <img
                              src={
                                worker.avatarUrl ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.fullName)}&background=082D55&color=fff`
                              }
                              alt={worker.fullName}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-xs text-navy-950">
                                  {worker.fullName}
                                </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  worker.contractType === 'CHÍNH THỨC'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {worker.contractType === 'CHÍNH THỨC' ? 'CT' : 'TV'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <span>{worker.employeeCode}</span>
                              <span>•</span>
                              <span className="text-slate-700 font-semibold">{worker.position}</span>
                            </div>
                          </div>
                        </div>

                        {/* Verification Device badge */}
                        <div className="text-right">
                          <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 block">
                            {worker.checkInTime}
                          </span>
                          <span className="text-[8px] text-slate-400 uppercase font-mono">
                            {worker.verificationMethod === 'FACE_ID'
                              ? 'FaceID'
                              : worker.verificationMethod === 'RFID_DEVICE'
                              ? 'RFID'
                              : 'Manual'}
                          </span>
                        </div>
                      </div>

                      {/* Interactive Status Selector Pills */}
                      <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => handleUpdateWorkerStatus(worker.employeeCode, 'ĐÚNG GIỜ')}
                          className={`py-1 rounded-lg border transition-all cursor-pointer ${
                            worker.status === 'ĐÚNG GIỜ'
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          ✓ Có mặt
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateWorkerStatus(worker.employeeCode, 'ĐI MUỘN')}
                          className={`py-1 rounded-lg border transition-all cursor-pointer ${
                            worker.status === 'ĐI MUỘN'
                              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          ⏰ Đi muộn
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateWorkerStatus(worker.employeeCode, 'VẮNG MẶT')}
                          className={`py-1 rounded-lg border transition-all cursor-pointer ${
                            worker.status === 'VẮNG MẶT'
                              ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          ✕ Vắng mặt
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateWorkerStatus(worker.employeeCode, 'ĐIỀU CHUYỂN_ĐẾN')}
                          className={`py-1 rounded-lg border transition-all cursor-pointer ${
                            worker.status === 'ĐIỀU CHUYỂN_ĐẾN'
                              ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          ⇄ Tăng viện
                        </button>
                      </div>
                    </div>
                  );
                }))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: IMMEDIATE EQUIPMENT DOWNTIME REPORTING            */}
          {/* ======================================================== */}
          {activeTab === 'downtime' && (
            <div className="space-y-3">
              {/* Quick status banner */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-navy-950">
                        Giám Sát & Báo Cáo Thiết Bị Đầu Ca
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {selectedLine} • Gửi cảnh báo trực tiếp tới Phòng EQM
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDowntimeFormExpanded(!downtimeFormExpanded)}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                  >
                    {downtimeFormExpanded ? 'Đóng form' : '+ Báo sự cố mới'}
                  </button>
                </div>
              </div>

              {/* Expandable Report Form */}
              {downtimeFormExpanded && (
                <form
                  onSubmit={handleReportDowntime}
                  className="bg-white p-4 rounded-2xl border-2 border-rose-300 shadow-md space-y-3 animate-in fade-in text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-black text-rose-700 flex items-center gap-1.5 uppercase text-[11px]">
                      <Flame className="w-4 h-4 text-rose-600" />
                      Nhập Báo Cáo Sự Cố Dừng Máy
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Mã Line: {selectedLine}
                    </span>
                  </div>

                  {/* 1. Chọn Trạm & Máy */}
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      1. Trạm máy gặp sự cố:
                    </label>
                    <select
                      value={selectedStationIndex}
                      onChange={(e) => setSelectedStationIndex(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-navy-950 text-xs focus:ring-1 focus:ring-rose-500 cursor-pointer"
                    >
                      {STATIONS_FOR_LINE.map((st, idx) => (
                        <option key={st.code} value={idx}>
                          {st.code} — {st.name} ({st.eqName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Mức độ nghiêm trọng */}
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      2. Mức độ nghiêm trọng:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDowntimeSeverity('LINE_STOP')}
                        className={`p-2 rounded-xl border text-center font-bold text-[10px] transition-all cursor-pointer ${
                          downtimeSeverity === 'LINE_STOP'
                            ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                            : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        🔴 Dừng chuyền
                        <span className="block text-[8px] font-normal opacity-90">Line Stop</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDowntimeSeverity('SPEED_LOSS')}
                        className={`p-2 rounded-xl border text-center font-bold text-[10px] transition-all cursor-pointer ${
                          downtimeSeverity === 'SPEED_LOSS'
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        🟡 Giảm tốc
                        <span className="block text-[8px] font-normal opacity-90">Speed Loss</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDowntimeSeverity('WARNING_MINOR')}
                        className={`p-2 rounded-xl border text-center font-bold text-[10px] transition-all cursor-pointer ${
                          downtimeSeverity === 'WARNING_MINOR'
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                            : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        🔵 Nhẹ / Cảnh báo
                        <span className="block text-[8px] font-normal opacity-90">Minor Warning</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. Phân nhóm nguyên nhân */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">
                        3. Nhóm nguyên nhân:
                      </label>
                      <select
                        value={causeCategory}
                        onChange={(e) => setCauseCategory(e.target.value as DowntimeCauseCategory)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-xs"
                      >
                        <option value="FEEDER_COMPONENT">Cấp linh kiện / Feeder</option>
                        <option value="MECHANICAL">Cơ khí / Kẹt băng tải</option>
                        <option value="ELECTRICAL">Điện / Cảm biến nhiệt</option>
                        <option value="SOFTWARE_VISION">Phần mềm / Camera thị giác</option>
                        <option value="PNEUMATIC_PRESSURE">Khí nén / Áp suất hút</option>
                        <option value="OTHER">Nguyên nhân khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">
                        4. Dừng dự kiến (phút):
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={480}
                        value={estimatedStopMinutes}
                        onChange={(e) => setEstimatedStopMinutes(Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-xs"
                      />
                    </div>
                  </div>

                  {/* 4. Hiện tượng sự cố */}
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      5. Hiện tượng chi tiết:
                    </label>
                    <textarea
                      rows={2}
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      placeholder="Mô tả hiện tượng kẹt chip, lỗi hút, lệch tọa độ..."
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  {/* 5. Hành động tức thời */}
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      6. Hành động xử lý tức thời của Chuyền trưởng:
                    </label>
                    <textarea
                      rows={2}
                      value={actionTaken}
                      onChange={(e) => setActionTaken(e.target.value)}
                      placeholder="Đã dừng cấp phôi, vệ sinh đầu nozzle..."
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>

                  {/* Checkbox dispatch */}
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyMaintenance}
                      onChange={(e) => setNotifyMaintenance(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[11px] font-bold">
                      Gửi thông báo SOS ngay tới Kỹ thuật Thiết bị (EQM) trực ca
                    </span>
                  </label>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setDowntimeFormExpanded(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 text-xs"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Phát lệnh sự cố
                    </button>
                  </div>
                </form>
              )}

              {/* Active Incidents List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
                  <span>Danh sách sự cố ghi nhận ({downtimeReports.filter((d) => d.lineCode === selectedLine).length}):</span>
                  <span className="text-[10px] text-slate-400 font-mono">Ca hôm nay</span>
                </div>

                {downtimeReports.filter((d) => d.lineCode === selectedLine).length === 0 ? (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <div className="text-xs font-bold text-slate-700">Chuyền đang vận hành bình thường</div>
                    <p className="text-[10px] text-slate-400">Không có cảnh báo dừng máy hoặc giảm tốc độ.</p>
                  </div>
                ) : (
                  downtimeReports
                    .filter((d) => d.lineCode === selectedLine)
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`bg-white p-3.5 rounded-2xl border shadow-2xs space-y-2 ${
                          item.status === 'RESOLVED'
                            ? 'border-emerald-200 opacity-80'
                            : item.severity === 'LINE_STOP'
                            ? 'border-rose-400 ring-1 ring-rose-300'
                            : 'border-amber-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  item.severity === 'LINE_STOP'
                                    ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                    : item.severity === 'SPEED_LOSS'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                                }`}
                              >
                                {item.severity === 'LINE_STOP'
                                  ? '🔴 DỪNG CHUYỀN'
                                  : item.severity === 'SPEED_LOSS'
                                  ? '🟡 GIẢM TỐC'
                                  : '🔵 CẢNH BÁO'}
                              </span>

                              <span className="font-mono text-[10px] text-slate-500">
                                {item.reportCode}
                              </span>
                            </div>

                            <div className="font-black text-xs text-navy-950 mt-1">
                              [{item.stationCode}] {item.stationName}
                            </div>
                            <div className="text-[11px] text-slate-600 font-mono">
                              {item.equipmentName}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              Dừng ~{item.estimatedStopMinutes}p
                            </span>
                            <div className="text-[9px] text-slate-400 mt-0.5 font-mono">
                              {item.reportedAt}
                            </div>
                          </div>
                        </div>

                        {/* Issue description */}
                        <div className="bg-slate-50 p-2 rounded-xl text-[11px] text-slate-700 leading-snug">
                          <strong>Mô tả:</strong> {item.issueDescription}
                        </div>

                        {/* Action & Ticket */}
                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                          <span className="text-slate-500">
                            EQM Ticket: <strong className="text-blue-700 font-mono">{item.maintenanceTicketId || 'N/A'}</strong>
                          </span>

                          {item.status === 'RESOLVED' ? (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              ✓ Đã khắc phục
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleResolveDowntime(item.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                            >
                              Đã giải quyết xong
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: SIGN-OFF & DIGITAL CONFIRMATION                   */}
          {/* ======================================================== */}
          {activeTab === 'signoff' && (
            <div className="space-y-3 text-xs">
              {/* Summary Dossier */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-extrabold text-navy-950 text-xs">
                    Phiếu Xác Nhận Đầu Ca — {selectedLine}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                    SẴN SÀNG KÝ CHỐT
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Kế hoạch sản xuất SOP:</span>
                    <span className="font-mono font-bold text-purple-800">896 PCS (Model B)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Nhu cầu quân số chuẩn:</span>
                    <span className="font-mono font-bold text-navy-950">{stats.required} người</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Thực có đã xác nhận:</span>
                    <span className="font-mono font-black text-emerald-700">
                      {stats.present + stats.late} người ({stats.rate}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Chính thức / Thời vụ:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {stats.official} CT / {stats.seasonal} TV
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Sự cố thiết bị ghi nhận:</span>
                    <span className="font-mono font-bold text-rose-600">
                      {downtimeReports.filter((d) => d.lineCode === selectedLine && d.status !== 'RESOLVED').length} sự cố đang mở
                    </span>
                  </div>
                </div>
              </div>

              {/* Leader notes */}
              <div>
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Ghi chú điều hành của Trưởng Chuyền:
                </label>
                <textarea
                  rows={2}
                  value={leaderNotes}
                  onChange={(e) => setLeaderNotes(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Digital Signature Drawing Canvas */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[11px] text-[#082D55] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Chữ ký điện tử Chuyền trưởng:
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    className="text-[10px] text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Ký lại
                  </button>
                </div>

                <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50/60 p-1 relative overflow-hidden flex flex-col items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    width={380}
                    height={110}
                    onMouseDown={handleStartDraw}
                    onMouseMove={handleDraw}
                    onMouseUp={handleStopDraw}
                    onMouseLeave={handleStopDraw}
                    onTouchStart={handleStartDraw}
                    onTouchMove={handleDraw}
                    onTouchEnd={handleStopDraw}
                    className="cursor-crosshair w-full h-[110px] touch-none"
                  />
                  {!hasDrawnSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-[11px] italic">
                      Dùng ngón tay hoặc chuột để ký tại đây
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span>Trưởng chuyền: {currentUser.name || 'Nguyễn Văn Tuấn'}</span>
                  <span>Mã: KHV-LEAD-03</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 4. BOTTOM ACTION BAR                                     */}
        {/* ======================================================== */}
        <div className="bg-white p-3 border-t border-slate-200 shrink-0 flex items-center justify-between gap-2">
          {activeTab !== 'signoff' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'attendance' ? 'downtime' : 'signoff')}
                className="flex-1 py-2 rounded-xl bg-[#1688E8] hover:bg-blue-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Tiếp theo: {activeTab === 'attendance' ? 'Báo sự cố thiết bị' : 'Ký chốt ca'} →
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleSubmitSignOff}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-emerald-200" />
              Xác Nhận & Ký Chốt Quân Số Đầu Ca
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

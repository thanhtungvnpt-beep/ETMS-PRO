// OOS ETMS PRO — Field Daily Report Create Wizard Modal
// 4-Step Interactive Form matching Mobile & Desktop mockups

import React, { useState } from 'react';
import {
  FieldDailyReport,
  FieldDailyIssue,
  FieldDailyActivity,
  FieldTomorrowPlanItem,
  FieldIssueCategory,
  FieldIssueSeverity,
} from '../../types/fieldReport';
import { UserProfile, VendorName, FactoryName } from '../../types/workforce';
import { createFieldIssue, saveOrSubmitDailyReport } from '../../services/fieldReportStorage';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Send,
  Save,
  Mic,
  Camera,
  Plus,
  Trash2,
  Cpu,
  ShieldAlert,
  Users,
  TrendingUp,
  FileCheck,
  Building2,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';

interface FieldReportCreateWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onReportCreated: (newReport: FieldDailyReport) => void;
}

const EQM_EQUIPMENT_OPTIONS = [
  { code: 'EQM-MNT-001', name: 'Máy ép thủy lực EQM-001', line: 'Line 01' },
  { code: 'EQM-SMT-003', name: 'Panasonic NPM-D3 Multi-Mounter', line: 'Line 03' },
  { code: 'EQM-RFL-005', name: 'Lò hàn Heller 1809 MK5', line: 'Line 05' },
  { code: 'EQM-AOI-002', name: 'Máy soi 3D AOI Koh Young Zenith', line: 'Line 02' },
  { code: 'EQM-PRT-004', name: 'Máy in kem hàn GKG G5', line: 'Line 04' },
];

export const FieldReportCreateWizardModal: React.FC<FieldReportCreateWizardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onReportCreated,
}) => {
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState<number>(1); // 1: Thông tin, 2: Công việc, 3: Vấn đề, 4: Kế hoạch

  // Step 1: Basic Info
  const [reportDate, setReportDate] = useState<string>('2026-11-03');
  const [vendor, setVendor] = useState<VendorName>(currentUser.vendor || 'KHV');
  const [factory, setFactory] = useState<FactoryName | 'SEV'>('SEV');
  const [shift, setShift] = useState<'CA_NGAY' | 'CA_DEM' | 'CA_HANH_CHINH'>('CA_NGAY');

  // Step 2: Today's Activities
  const [activities, setActivities] = useState<FieldDailyActivity[]>([
    {
      id: 'ACT-WIZ-1',
      content: 'Kiểm tra tình trạng thiết bị Line 01 - 04',
      area: 'Xưởng SMT Tầng 1',
      result: 'Hoàn thành kiểm tra nguồn & áp suất khí nén',
      isCompleted: true,
      completedAt: '08:45',
    },
    {
      id: 'ACT-WIZ-2',
      content: 'Theo dõi xử lý sự cố máy ép (EQM-001)',
      area: 'Line 01 Trạm ST-02',
      result: 'Kỹ thuật viên đang kiểm tra rơ le nguồn 3 pha',
      isCompleted: true,
      completedAt: '10:00',
    },
  ]);
  const [newActivityContent, setNewActivityContent] = useState<string>('');
  const [newActivityArea, setNewActivityArea] = useState<string>('Line 01');

  // Step 3: Issues
  const [hasIssues, setHasIssues] = useState<boolean>(true);
  const [selectedCategories, setSelectedCategories] = useState<FieldIssueCategory[]>(['EQM']);
  
  // EQM Form
  const [eqmMachine, setEqmMachine] = useState<string>('Máy ép EQM-001');
  const [eqmLine, setEqmLine] = useState<string>('Line 01');
  const [eqmDesc, setEqmDesc] = useState<string>(
    'Máy không khởi động, đã kiểm tra nguồn điện nhưng chưa khắc phục được. Đang đợi kỹ thuật viên đo cầu chì.'
  );
  const [eqmSeverity, setEqmSeverity] = useState<FieldIssueSeverity>('HIGH');
  const [eqmPhotos, setEqmPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
  ]);

  // QC Form
  const [qcModel, setQcModel] = useState<string>('Model A (Galaxy P2)');
  const [qcLine, setQcLine] = useState<string>('Line 02');
  const [qcDefect, setQcDefect] = useState<string>('Lỗi tiếp xúc chân JTAG Socket');
  const [qcAffectedQty, setQcAffectedQty] = useState<number>(28);
  const [qcDesc, setQcDesc] = useState<string>('Tỷ lệ NG tăng tại công đoạn test FCT, đã cách ly lô hàng.');
  const [qcSeverity, setQcSeverity] = useState<FieldIssueSeverity>('MEDIUM');

  // HR Form
  const [hrLine, setHrLine] = useState<string>('Line 03');
  const [hrShortage, setHrShortage] = useState<number>(0);
  const [hrReason, setHrReason] = useState<string>('Nhân lực ổn định, không thiếu hụt');

  // Production Form
  const [prodLine, setProdLine] = useState<string>('Line 04');
  const [prodPlanned, setProdPlanned] = useState<number>(480);
  const [prodActual, setProdActual] = useState<number>(440);
  const [prodReason, setProdReason] = useState<string>('Xe trung chuyển vật tư nội bộ giao chậm');

  // Step 4: Tomorrow's Plans
  const [plans, setPlans] = useState<FieldTomorrowPlanItem[]>([
    { id: 'PLN-WIZ-1', content: 'Theo dõi hoàn tất sửa chữa EQM-001', priority: 'HIGH', isFollowUpIssue: true, isDone: false },
    { id: 'PLN-WIZ-2', content: 'Kiểm tra lại thiết bị Line 03', priority: 'MEDIUM', isFollowUpIssue: true, isDone: false },
    { id: 'PLN-WIZ-3', content: 'Làm việc với QC về lỗi lặp lại', priority: 'HIGH', isFollowUpIssue: true, isDone: false },
    { id: 'PLN-WIZ-4', content: 'Cập nhật tiến độ sản lượng với vendor', priority: 'NORMAL', isFollowUpIssue: false, isDone: false },
  ]);
  const [newPlanContent, setNewPlanContent] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState<string>('Đã kiểm tra đầy đủ các khu vực phụ trách.');

  // Voice input placeholder
  const handleVoiceInput = () => {
    alert('Đang lắng nghe giọng nói... (Hỗ trợ nhận diện tiếng Việt trên Chrome/Android/iOS)');
  };

  // Add activity
  const handleAddActivity = () => {
    if (!newActivityContent.trim()) return;
    const act: FieldDailyActivity = {
      id: `ACT-NEW-${Date.now().toString().slice(-4)}`,
      content: newActivityContent.trim(),
      area: newActivityArea,
      result: 'Đã hoàn thành',
      isCompleted: true,
      completedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setActivities((prev) => [...prev, act]);
    setNewActivityContent('');
  };

  // Add plan
  const handleAddPlan = () => {
    if (!newPlanContent.trim()) return;
    const p: FieldTomorrowPlanItem = {
      id: `PLN-NEW-${Date.now().toString().slice(-4)}`,
      content: newPlanContent.trim(),
      priority: 'MEDIUM',
      isDone: false,
    };
    setPlans((prev) => [...prev, p]);
    setNewPlanContent('');
  };

  // Toggle category
  const handleToggleCategory = (cat: FieldIssueCategory) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories((prev) => prev.filter((c) => c !== cat));
    } else {
      setSelectedCategories((prev) => [...prev, cat]);
    }
  };

  // Final submit handler
  const handleSubmitReport = (isDraft: boolean = false) => {
    const createdIssueIds: string[] = [];

    // Create issue entities if user selected categories
    if (hasIssues) {
      if (selectedCategories.includes('EQM')) {
        const created = createFieldIssue({
          category: 'EQM',
          title: 'Máy không khởi động',
          description: eqmDesc,
          factory,
          vendor,
          lineCode: eqmLine,
          reportedBy: currentUser.name || 'Nguyễn Văn A',
          reportedByRole: currentUser.title || 'Kỹ thuật viên hiện trường',
          reportedDate: reportDate,
          reportedTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          severity: eqmSeverity,
          status: 'ĐANG_XỬ_LÝ',
          equipmentName: eqmMachine,
          equipmentCode: 'EQM-MNT-001',
          downtimeMinutes: 45,
          photos: eqmPhotos,
        });
        createdIssueIds.push(created.id);
      }

      if (selectedCategories.includes('QC')) {
        const created = createFieldIssue({
          category: 'QC',
          title: 'Tỷ lệ NG tăng tại công đoạn test',
          description: qcDesc,
          factory,
          vendor,
          lineCode: qcLine,
          reportedBy: currentUser.name || 'Nguyễn Văn A',
          reportedByRole: currentUser.title || 'Kỹ thuật viên hiện trường',
          reportedDate: reportDate,
          reportedTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          severity: qcSeverity,
          status: 'ĐANG_XỬ_LÝ',
          productModel: qcModel,
          defectType: qcDefect,
          affectedQuantity: qcAffectedQty,
          photos: [],
        });
        createdIssueIds.push(created.id);
      }

      if (selectedCategories.includes('PRODUCTION')) {
        const created = createFieldIssue({
          category: 'PRODUCTION',
          title: 'Sản lượng thấp hơn kế hoạch',
          description: prodReason,
          factory,
          vendor,
          lineCode: prodLine,
          reportedBy: currentUser.name || 'Nguyễn Văn A',
          reportedByRole: currentUser.title || 'Kỹ thuật viên hiện trường',
          reportedDate: reportDate,
          reportedTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          severity: 'MEDIUM',
          status: 'ĐANG_XỬ_LÝ',
          plannedOutput: prodPlanned,
          actualOutput: prodActual,
          outputVariance: prodActual - prodPlanned,
          photos: [],
        });
        createdIssueIds.push(created.id);
      }
    }

    const reportCode = `FDR-${reportDate.replace(/-/g, '')}-${vendor}-${Math.floor(10 + Math.random() * 90)}`;
    const newReport: FieldDailyReport = {
      id: `RPT-${Date.now().toString().slice(-6)}`,
      reportCode,
      reportDate,
      employeeId: currentUser.id || 'EMP-001',
      employeeName: currentUser.name || 'Nguyễn Văn A',
      employeeTitle: currentUser.title || 'Kỹ thuật viên hiện trường',
      vendor,
      factory,
      shift,
      status: isDraft ? 'DRAFT' : 'SUBMITTED',
      submittedAt: isDraft ? undefined : new Date().toISOString().replace('T', ' ').slice(0, 16),
      todayActivities: activities,
      tomorrowPlans: plans,
      hasIssues: createdIssueIds.length > 0,
      issueIds: createdIssueIds,
      photos: [],
      generalNotes,
    };

    saveOrSubmitDailyReport(newReport);
    onReportCreated(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 text-slate-800 flex flex-col max-h-[95vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#082D55] text-white px-5 py-3.5 flex items-center justify-between border-b border-blue-900 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (currentStep > 1) setCurrentStep((prev) => prev - 1);
                else onClose();
              }}
              className="p-1 rounded-lg hover:bg-blue-800 text-slate-300 hover:text-white cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-extrabold text-base text-white">
              Tạo Báo Cáo Hiện Trường
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-blue-900/60 hover:bg-blue-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4-Step Progress Indicator (Matching Mobile Screen 2) */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between relative max-w-md mx-auto">
            {/* Step lines */}
            <div className="absolute left-6 right-6 top-3.5 h-0.5 bg-slate-200 -z-0" />
            <div
              className="absolute left-6 top-3.5 h-0.5 bg-[#0878E8] transition-all duration-300 -z-0"
              style={{ width: `${((currentStep - 1) / 3) * 80}%` }}
            />

            {/* Step 1 */}
            <div className="flex flex-col items-center gap-1 z-10 cursor-pointer" onClick={() => setCurrentStep(1)}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === 1
                    ? 'bg-[#0878E8] text-white ring-4 ring-blue-100'
                    : currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <span className={`text-[10px] font-bold ${currentStep === 1 ? 'text-[#0878E8]' : 'text-slate-500'}`}>
                Thông tin
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-1 z-10 cursor-pointer" onClick={() => setCurrentStep(2)}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === 2
                    ? 'bg-[#0878E8] text-white ring-4 ring-blue-100'
                    : currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <span className={`text-[10px] font-bold ${currentStep === 2 ? 'text-[#0878E8]' : 'text-slate-500'}`}>
                Công việc
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-1 z-10 cursor-pointer" onClick={() => setCurrentStep(3)}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === 3
                    ? 'bg-[#0878E8] text-white ring-4 ring-blue-100'
                    : currentStep > 3
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {currentStep > 3 ? '✓' : '3'}
              </div>
              <span className={`text-[10px] font-bold ${currentStep === 3 ? 'text-[#0878E8]' : 'text-slate-500'}`}>
                Vấn đề
              </span>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-1 z-10 cursor-pointer" onClick={() => setCurrentStep(4)}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === 4
                    ? 'bg-[#0878E8] text-white ring-4 ring-blue-100'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                4
              </div>
              <span className={`text-[10px] font-bold ${currentStep === 4 ? 'text-[#0878E8]' : 'text-slate-500'}`}>
                Kế hoạch
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1 bg-[#F2F6FA]">
          {/* ======================================================== */}
          {/* STEP 1: THÔNG TIN CƠ BẢN                                 */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 animate-in fade-in">
              <h4 className="font-extrabold text-[#082D55] text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0878E8]" />
                1. Thông tin báo cáo cơ bản
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold text-[11px] mb-1">
                    Ngày báo cáo:
                  </label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-[11px] mb-1">
                    Ca làm việc:
                  </label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs"
                  >
                    <option value="CA_NGAY">Ca ngày (08:00 - 17:00)</option>
                    <option value="CA_DEM">Ca đêm (20:00 - 05:00)</option>
                    <option value="CA_HANH_CHINH">Ca hành chính</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold text-[11px] mb-1">
                    Nhân viên hiện trường:
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.name || 'Nguyễn Văn A'}
                    className="w-full p-2 bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-[11px] mb-1">
                    Chức danh:
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.title || 'Kỹ thuật viên hiện trường'}
                    className="w-full p-2 bg-slate-100 border border-slate-300 rounded-xl text-slate-600 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold text-[11px] mb-1">
                    Nhà máy trực thuộc:
                  </label>
                  <select
                    value={factory}
                    onChange={(e) => setFactory(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs"
                  >
                    <option value="SEV">SEV Factory</option>
                    <option value="Nhà máy A">Nhà máy A</option>
                    <option value="Nhà máy B">Nhà máy B</option>
                    <option value="Nhà máy C">Nhà máy C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-[11px] mb-1">
                    Vendor đối tác:
                  </label>
                  <select
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value as VendorName)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs"
                  >
                    <option value="KHV">KHV</option>
                    <option value="DREAM TECH">DREAM TECH</option>
                    <option value="HSTEC">HSTEC</option>
                    <option value="KTECH">KTECH</option>
                    <option value="HOJEONGB">HOJEONGB</option>
                    <option value="HOJEONG VINA">HOJEONG VINA</option>
                    <option value="DAAL">DAAL</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: CÔNG VIỆC HÔM NAY                                */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-extrabold text-[#082D55] text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  2. Công việc đã thực hiện hôm nay
                </h4>

                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Mic className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  <span>Nhập giọng nói</span>
                </button>
              </div>

              {/* List of activities */}
              <div className="space-y-2">
                {activities.map((act, idx) => (
                  <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-navy-950 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                        {act.content}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Khu vực: <strong>{act.area}</strong> • Kết quả: <span className="text-emerald-700 font-medium">{act.result}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActivities((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Activity Bar */}
              <div className="p-3 bg-slate-50/90 rounded-xl border border-dashed border-slate-300 space-y-2">
                <div className="font-bold text-[11px] text-slate-700">+ Thêm hoạt động / công việc đã làm:</div>
                <input
                  type="text"
                  value={newActivityContent}
                  onChange={(e) => setNewActivityContent(e.target.value)}
                  placeholder="Ví dụ: Kiểm tra căn chỉnh đầu nozzle số 3 Line 01..."
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={newActivityArea}
                    onChange={(e) => setNewActivityArea(e.target.value)}
                    placeholder="Khu vực (Line 01, SMT...)"
                    className="w-48 p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddActivity}
                    className="px-3 py-1.5 bg-[#0878E8] text-white font-bold rounded-lg text-xs shadow-xs hover:bg-blue-600 cursor-pointer"
                  >
                    Thêm công việc
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: VẤN ĐỀ PHÁT SINH (MATCHING MOBILE SCREEN 2)      */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-3.5 animate-in fade-in">
              {/* Question: Has issues? */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="font-extrabold text-[#082D55] text-xs uppercase tracking-wide">
                  3. Vấn đề phát sinh
                </div>
                <div className="text-slate-600 text-xs">
                  Hôm nay hiện trường có vấn đề phát sinh không?
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setHasIssues(false)}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      !hasIssues
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Không có vấn đề hôm nay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasIssues(true)}
                    className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      hasIssues
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Có vấn đề phát sinh</span>
                  </button>
                </div>
              </div>

              {/* Category Selector Buttons (Lưới 2x2 hoặc 4 nút như Mobile) */}
              {hasIssues && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="font-bold text-[11px] text-slate-700">
                    Chọn nhóm vấn đề (có thể chọn nhiều nhóm):
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    {/* EQM */}
                    <button
                      type="button"
                      onClick={() => handleToggleCategory('EQM')}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedCategories.includes('EQM')
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-300'
                          : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-cyan-300" />
                        <span>EQM Thiết bị</span>
                      </div>
                      {selectedCategories.includes('EQM') && <span>✓</span>}
                    </button>

                    {/* QC */}
                    <button
                      type="button"
                      onClick={() => handleToggleCategory('QC')}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedCategories.includes('QC')
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-300'
                          : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        <span>QC Chất lượng</span>
                      </div>
                      {selectedCategories.includes('QC') && <span>✓</span>}
                    </button>

                    {/* HR */}
                    <button
                      type="button"
                      onClick={() => handleToggleCategory('HR')}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedCategories.includes('HR')
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-300'
                          : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>HR Nhân lực</span>
                      </div>
                      {selectedCategories.includes('HR') && <span>✓</span>}
                    </button>

                    {/* Production */}
                    <button
                      type="button"
                      onClick={() => handleToggleCategory('PRODUCTION')}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedCategories.includes('PRODUCTION')
                          ? 'bg-purple-600 text-white border-purple-700 shadow-xs ring-2 ring-purple-300'
                          : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Production Sản lượng</span>
                      </div>
                      {selectedCategories.includes('PRODUCTION') && <span>✓</span>}
                    </button>
                  </div>
                </div>
              )}

              {/* Detailed EQM Form (Matching Screen 2 in mockup) */}
              {hasIssues && selectedCategories.includes('EQM') && (
                <div className="bg-white p-4 rounded-2xl border-2 border-blue-300 shadow-sm space-y-3 animate-in fade-in">
                  <div className="font-black text-blue-900 text-xs uppercase flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    Chi tiết sự cố EQM Thiết bị
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-[11px] mb-1">
                      Tên thiết bị *
                    </label>
                    <select
                      value={eqmMachine}
                      onChange={(e) => setEqmMachine(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs"
                    >
                      <option value="Máy ép EQM-001">Máy ép EQM-001</option>
                      <option value="Panasonic NPM-D3 Multi-Mounter">Panasonic NPM-D3 Multi-Mounter</option>
                      <option value="Lò hàn Heller 1809 MK5">Lò hàn Heller 1809 MK5</option>
                      <option value="Máy soi 3D AOI Koh Young">Máy soi 3D AOI Koh Young</option>
                      <option value="Thiết bị khác">Thiết bị khác...</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-[11px] mb-1">
                      Vị trí / Dây chuyền *
                    </label>
                    <select
                      value={eqmLine}
                      onChange={(e) => setEqmLine(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs"
                    >
                      <option value="Line 01">Line 01</option>
                      <option value="Line 02">Line 02</option>
                      <option value="Line 03">Line 03</option>
                      <option value="Line 04">Line 04</option>
                      <option value="Line 05">Line 05</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-[11px] mb-1">
                      Mô tả sự cố *
                    </label>
                    <textarea
                      rows={2}
                      value={eqmDesc}
                      onChange={(e) => setEqmDesc(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                    <div className="text-right text-[10px] text-slate-400 font-mono mt-0.5">
                      {eqmDesc.length}/500
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-[11px] mb-1">
                      Mức độ ảnh hưởng:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setEqmSeverity('LOW')}
                        className={`py-1.5 rounded-xl border font-bold text-xs cursor-pointer ${
                          eqmSeverity === 'LOW'
                            ? 'bg-slate-700 text-white border-slate-800'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        Thấp
                      </button>
                      <button
                        type="button"
                        onClick={() => setEqmSeverity('MEDIUM')}
                        className={`py-1.5 rounded-xl border font-bold text-xs cursor-pointer ${
                          eqmSeverity === 'MEDIUM'
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        Trung bình
                      </button>
                      <button
                        type="button"
                        onClick={() => setEqmSeverity('HIGH')}
                        className={`py-1.5 rounded-xl border font-bold text-xs cursor-pointer ${
                          eqmSeverity === 'HIGH'
                            ? 'bg-rose-600 text-white border-rose-700'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        Cao
                      </button>
                    </div>
                  </div>

                  {/* Photos */}
                  <div>
                    <label className="block text-slate-700 font-bold text-[11px] mb-1">
                      Hình ảnh hiện trường ({eqmPhotos.length}/5):
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {eqmPhotos.map((url, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                          <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const demo = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80';
                          setEqmPhotos((prev) => [...prev, demo]);
                        }}
                        className="w-16 h-16 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/50 flex flex-col items-center justify-center text-blue-600 hover:bg-blue-100 cursor-pointer shrink-0"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="text-[9px] font-bold">Thêm ảnh</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed QC Form */}
              {hasIssues && selectedCategories.includes('QC') && (
                <div className="bg-white p-4 rounded-2xl border-2 border-amber-300 shadow-sm space-y-3 animate-in fade-in">
                  <div className="font-black text-amber-900 text-xs uppercase flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Chi tiết vấn đề QC Chất lượng
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-bold text-[11px] mb-1">Model sản phẩm:</label>
                      <input type="text" value={qcModel} onChange={(e) => setQcModel(e.target.value)} className="w-full p-2 border rounded-xl text-xs" />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold text-[11px] mb-1">Dây chuyền:</label>
                      <select value={qcLine} onChange={(e) => setQcLine(e.target.value)} className="w-full p-2 border rounded-xl text-xs">
                        <option value="Line 02">Line 02</option>
                        <option value="Line 03">Line 03</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold text-[11px] mb-1">Loại lỗi & Mô tả:</label>
                    <textarea rows={2} value={qcDesc} onChange={(e) => setQcDesc(e.target.value)} className="w-full p-2 border rounded-xl text-xs" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: KẾ HOẠCH NGÀY MAI & GỬI BÁO CÁO                 */}
          {/* ======================================================== */}
          {currentStep === 4 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
              <h4 className="font-extrabold text-[#082D55] text-xs uppercase tracking-wide flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#0878E8]" />
                4. Kế hoạch ngày tiếp theo & Xác nhận gửi
              </h4>

              {/* Plans list */}
              <div className="space-y-2">
                <div className="text-[11px] text-slate-600 font-bold">Kế hoạch cần thực hiện:</div>
                {plans.map((p, idx) => (
                  <div key={p.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                    <span className="font-medium text-xs text-slate-800">{p.content}</span>
                    <button
                      type="button"
                      onClick={() => setPlans((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add plan */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newPlanContent}
                  onChange={(e) => setNewPlanContent(e.target.value)}
                  placeholder="+ Thêm công việc ngày mai..."
                  className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddPlan}
                  className="px-3 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs hover:bg-slate-700 cursor-pointer"
                >
                  Thêm
                </button>
              </div>

              {/* General notes */}
              <div>
                <label className="block text-slate-700 font-bold text-[11px] mb-1">
                  Ghi chú tổng hợp gửi Quản lý:
                </label>
                <textarea
                  rows={2}
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              {/* Summary recap box */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-[11px] text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Xác nhận dữ liệu báo cáo:
                </div>
                <div>• Ngày: <strong>{reportDate}</strong> ({shift}) • Nhà máy: <strong>{factory}</strong> • Vendor: <strong>{vendor}</strong></div>
                <div>• Công việc: <strong>{activities.length}</strong> mục • Vấn đề phát sinh: <strong>{hasIssues ? selectedCategories.length : 0}</strong> nhóm</div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="bg-white px-5 py-3 border-t border-slate-200 shrink-0 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-xs text-slate-700 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-xs text-slate-700 cursor-pointer"
            >
              Đóng
            </button>
          )}

          <div className="flex items-center gap-2">
            {currentStep === 4 && (
              <button
                type="button"
                onClick={() => handleSubmitReport(true)}
                className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-xs text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu nháp</span>
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-5 py-2 rounded-xl bg-[#0878E8] hover:bg-blue-600 text-white font-extrabold text-xs shadow-md flex items-center gap-1 cursor-pointer transition-all"
              >
                <span>Tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmitReport(false)}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi Báo Cáo Hôm Nay</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

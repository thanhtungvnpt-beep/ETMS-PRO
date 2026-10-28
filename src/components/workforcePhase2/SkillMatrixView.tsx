import React, { useState, useMemo } from 'react';
import {
  SkillItem,
  EmployeeProfile,
  SkillAssessmentRecord,
  SkillLevel,
  SKILL_LEVEL_DEFINITIONS,
  AssessmentVerificationStatus,
} from '../../types/workforcePhase2';
import {
  getStoredSkills,
  getStoredEmployees,
  getStoredAssessments,
  saveStoredAssessments,
} from '../../services/workforcePhase2Storage';
import {
  UserProfile,
  VendorName,
  FactoryName,
  WorkforceGroup,
  VENDOR_LIST,
  FACTORY_LIST,
} from '../../types';
import {
  Grid,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  ChevronRight,
  X,
  FileSpreadsheet,
  Download,
  Info,
  Layers,
  ShieldCheck,
  Edit3,
} from 'lucide-react';

interface SkillMatrixViewProps {
  skills?: SkillItem[];
  employees?: EmployeeProfile[];
  assessments?: SkillAssessmentRecord[];
  currentUser: UserProfile;
  onSaveAssessment?: (record: SkillAssessmentRecord) => void;
  onNavigateTab?: (tab: any) => void;
}

export const SkillMatrixView: React.FC<SkillMatrixViewProps> = ({
  skills: propSkills,
  employees: propEmployees,
  assessments: propAssessments,
  currentUser,
  onSaveAssessment: propOnSave,
  onNavigateTab,
}) => {
  const [localSkills] = useState<SkillItem[]>(() => propSkills || getStoredSkills());
  const [localEmployees] = useState<EmployeeProfile[]>(() => propEmployees || getStoredEmployees());
  const [localAssessments, setLocalAssessments] = useState<SkillAssessmentRecord[]>(() =>
    propAssessments || getStoredAssessments()
  );

  const skills = propSkills || localSkills;
  const employees = propEmployees || localEmployees;
  const assessments = propAssessments || localAssessments;

  const onSaveAssessment = (record: SkillAssessmentRecord) => {
    if (propOnSave) {
      propOnSave(record);
    } else {
      const idx = localAssessments.findIndex((a) => a.id === record.id);
      let updated: SkillAssessmentRecord[];
      if (idx >= 0) {
        updated = [...localAssessments];
        updated[idx] = record;
      } else {
        updated = [record, ...localAssessments];
      }
      setLocalAssessments(updated);
      saveStoredAssessments(updated);
    }
  };
  const [filterVendor, setFilterVendor] = useState<string>(
    currentUser.role === 'VENDOR_HR' && currentUser.vendor ? currentUser.vendor : 'KHV'
  );
  const [filterFactory, setFilterFactory] = useState<string>('ALL');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Assessment modal
  const [activeCell, setActiveCell] = useState<{
    employee: EmployeeProfile;
    skill: SkillItem;
    assessment?: SkillAssessmentRecord;
  } | null>(null);

  const [proposedLevel, setProposedLevel] = useState<SkillLevel>(2);
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

  // Filtered skills
  const activeSkills = useMemo(() => {
    return skills.filter((s) => {
      if (!s.isActive) return false;
      if (filterGroup !== 'ALL' && s.group !== filterGroup) return false;
      return true;
    });
  }, [skills, filterGroup]);

  // Filtered employees
  const matrixEmployees = useMemo(() => {
    return employees.filter((e) => {
      if (e.status !== 'ĐANG LÀM VIỆC') return false;
      if (filterVendor !== 'ALL' && e.vendor !== filterVendor) return false;
      if (filterFactory !== 'ALL' && e.factory !== filterFactory) return false;
      if (filterGroup !== 'ALL' && e.group !== filterGroup) return false;

      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchCode = e.employeeCode.toLowerCase().includes(q);
        const matchName = e.fullName.toLowerCase().includes(q);
        const matchPos = e.position.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchPos) return false;
      }

      return true;
    });
  }, [employees, filterVendor, filterFactory, filterGroup, searchTerm]);

  // Open assessment modal
  const handleOpenAssessment = (emp: EmployeeProfile, skill: SkillItem) => {
    const existing = assessments.find(
      (a) => a.employeeId === emp.id && a.skillCode === skill.skillCode
    );

    setActiveCell({
      employee: emp,
      skill,
      assessment: existing,
    });

    setProposedLevel(existing ? existing.proposedLevel : skill.requiredLevel || 2);
    setEvidenceNotes(existing?.evidenceNotes || '');
    setAssessmentError(null);
  };

  // Submit assessment
  const handleSubmitAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCell) return;

    if (!evidenceNotes.trim()) {
      setAssessmentError('Vui lòng ghi nhận bằng chứng thao tác thực tế hoặc biên bản sát hạch.');
      return;
    }

    const { employee, skill, assessment } = activeCell;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const isNew = !assessment;
    const updatedRecord: SkillAssessmentRecord = {
      id: assessment?.id || `ASM-${Date.now()}`,
      employeeId: employee.id,
      skillCode: skill.skillCode,
      proposedLevel,
      // Official approved level remains previous approvedLevel until HR approves!
      approvedLevel: assessment?.verificationStatus === 'ĐÃ XÁC NHẬN ĐẠT' ? assessment.approvedLevel : 0,
      assessmentDate: now.slice(0, 10),
      assessorName: currentUser.name,
      assessorRole: currentUser.title || currentUser.role,
      evidenceNotes: evidenceNotes.trim(),
      verificationStatus: 'CHỜ NHÂN SỰ XÁC NHẬN',
      history: [
        ...(assessment?.history || []),
        {
          timestamp: now,
          changedBy: currentUser.name,
          role: currentUser.title || currentUser.role,
          action: isNew ? 'GHI NHẬN KẾT QUẢ ĐÁNH GIÁ' : 'CẬP NHẬT ĐỀ XUẤT TAY NGHỀ',
          previousLevel: assessment ? assessment.approvedLevel : 0,
          newLevel: proposedLevel,
          reason: `Đề xuất cấp độ L${proposedLevel} chờ HR phê duyệt chính thức.`,
        },
      ],
    };

    onSaveAssessment(updatedRecord);
    setActiveCell(null);
  };

  // Cell Level Display Helper
  const renderCellBadge = (emp: EmployeeProfile, skill: SkillItem) => {
    const asm = assessments.find((a) => a.employeeId === emp.id && a.skillCode === skill.skillCode);

    if (!asm || asm.verificationStatus === 'CHƯA ĐÁNH GIÁ') {
      return (
        <span className="w-7 h-7 rounded flex items-center justify-center bg-slate-100 text-slate-400 font-mono text-xs font-bold border border-slate-200 group-hover:border-blue-400 transition-colors">
          —
        </span>
      );
    }

    const def = SKILL_LEVEL_DEFINITIONS[asm.approvedLevel || asm.proposedLevel || 0];
    const isApproved = asm.verificationStatus === 'ĐÃ XÁC NHẬN ĐẠT';
    const isPending = asm.verificationStatus === 'CHỜ NHÂN SỰ XÁC NHẬN';
    const isRejected = asm.verificationStatus === 'TỪ CHỐI / KHÔNG ĐẠT';
    const isReassessment = asm.verificationStatus === 'CẦN ĐÁNH GIÁ LẠI';

    return (
      <div className="relative group/cell inline-flex items-center justify-center">
        <span
          className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs border shadow-2xs transition-transform group-hover/cell:scale-110 ${
            isApproved
              ? `${def.bgClass} ${def.borderClass} ring-1 ring-emerald-500/30`
              : isPending
              ? 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-400'
              : 'bg-red-50 text-red-900 border-red-300'
          }`}
          title={`${def.name} • ${asm.verificationStatus}`}
        >
          {isApproved ? `L${asm.approvedLevel}` : `L${asm.proposedLevel}`}
        </span>

        {/* Small verification indicator badge */}
        {isApproved && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-600 rounded-full border border-white flex items-center justify-center text-[7px] text-white">
            ✓
          </span>
        )}
        {isPending && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border border-white flex items-center justify-center text-[7px] text-white animate-pulse">
            ⏱
          </span>
        )}
        {isRejected && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border border-white flex items-center justify-center text-[7px] text-white">
            ✕
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 text-xs text-slate-800">
      {/* 1. Header */}
      <div className="bg-white rounded border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-purple-100 text-purple-800 font-bold text-xs">
              MODULE C
            </span>
            <h2 className="text-base font-black text-slate-900 tracking-wide flex items-center gap-2">
              <Grid className="w-5 h-5 text-purple-600" />
              <span>Ma Trận Tay Nghề (Skill Matrix — Thang Cấp Độ 0 đến 4)</span>
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Trực quan hóa ma trận năng lực thực tế. Chỉ kết quả đã được bộ phận nhân sự (HR) xác nhận mới được coi là năng lực chính thức.
          </p>
        </div>

        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab('workforce-verification')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded border border-amber-300 transition-colors shadow-2xs cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Hàng đợi HR duyệt kết quả</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
          </button>
        )}
      </div>

      {/* 2. Standard Scale Legend (Thang Tay Nghề 0 - 4) */}
      <div className="bg-white rounded border border-slate-200 p-3 shadow-2xs">
        <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-blue-600" />
          <span>Thang cấp độ tay nghề chuẩn ETMS PRO:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {([0, 1, 2, 3, 4] as SkillLevel[]).map((lvl) => {
            const def = SKILL_LEVEL_DEFINITIONS[lvl];
            return (
              <div
                key={lvl}
                className={`p-2 rounded border flex items-start gap-2 ${def.bgClass} ${def.borderClass}`}
              >
                <span className="w-6 h-6 rounded-full bg-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                  {def.code}
                </span>
                <div>
                  <div className="font-bold text-xs">{def.name}</div>
                  <div className="text-[10px] leading-tight opacity-90">{def.shortDesc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white rounded border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo mã NV, tên nhân viên, vị trí..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Vendor */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600 text-[11px]">Vendor:</span>
            <select
              value={filterVendor}
              onChange={(e) => setFilterVendor(e.target.value)}
              disabled={currentUser.role === 'VENDOR_HR' && !!currentUser.vendor}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 font-bold outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả 7 Vendor</option>
              {VENDOR_LIST.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Factory */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600 text-[11px]">Nhà máy:</span>
            <select
              value={filterFactory}
              onChange={(e) => setFilterFactory(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-semibold outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả nhà máy</option>
              {FACTORY_LIST.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Group */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600 text-[11px]">Khối:</span>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-semibold outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả khối nghiệp vụ</option>
              <option value="Sản xuất">Sản xuất</option>
              <option value="Chất lượng">Chất lượng</option>
              <option value="Thiết bị">Thiết bị</option>
              <option value="Hành chính nhân sự">Hành chính nhân sự</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 italic">
          * Nhấp vào ô kỹ năng để xem bằng chứng hoặc gửi đề xuất đánh giá tay nghề
        </div>
      </div>

      {/* 4. Matrix Grid Table */}
      <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              {/* Top Skills Header Row */}
              <tr className="bg-[#0c2340] text-white border-b border-slate-700 text-[11px]">
                <th className="py-2.5 px-3 sticky left-0 z-20 bg-[#0c2340] min-w-[200px]">
                  Nhân viên ({matrixEmployees.length})
                </th>
                <th className="py-2.5 px-2.5 min-w-[130px]">Vị trí công tác</th>
                {activeSkills.map((sk) => (
                  <th
                    key={sk.skillCode}
                    className="py-2 px-2 text-center min-w-[110px] max-w-[140px] border-l border-slate-700/60"
                  >
                    <div className="font-bold text-[11px] truncate" title={sk.name}>
                      {sk.name}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span className="text-[9px] font-mono opacity-80">{sk.skillCode}</span>
                      <span
                        className={`text-[8px] font-bold px-1 rounded uppercase ${
                          sk.criticality === 'BẮT BUỘC'
                            ? 'bg-red-500 text-white'
                            : sk.criticality === 'QUAN TRỌNG'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-600 text-slate-200'
                        }`}
                      >
                        {sk.criticality === 'BẮT BUỘC' ? 'Bắt buộc' : sk.criticality === 'QUAN TRỌNG' ? 'Quan trọng' : 'Tiêu chuẩn'}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {matrixEmployees.length === 0 ? (
                <tr>
                  <td colSpan={activeSkills.length + 2} className="py-8 text-center text-slate-500 italic">
                    Không có nhân viên nào phù hợp với bộ lọc đã chọn.
                  </td>
                </tr>
              ) : (
                matrixEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* Sticky Employee Name Column */}
                    <td className="py-2 px-3 sticky left-0 z-10 bg-white hover:bg-blue-50/30 border-r border-slate-200">
                      <div className="font-bold text-slate-900">{emp.fullName}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                        <span className="font-bold text-blue-700">{emp.employeeCode}</span>
                        <span>•</span>
                        <span>{emp.vendor} ({emp.factory})</span>
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-2 px-2.5 text-slate-700">
                      <div className="font-medium truncate max-w-[130px]">{emp.position}</div>
                      <div className="text-[10px] text-slate-400 truncate">{emp.lineOrStation || emp.contractType}</div>
                    </td>

                    {/* Matrix Cells */}
                    {activeSkills.map((sk) => (
                      <td
                        key={sk.skillCode}
                        onClick={() => handleOpenAssessment(emp, sk)}
                        className="py-2 px-2 text-center border-l border-slate-100 cursor-pointer hover:bg-blue-100/50 transition-colors group"
                      >
                        {renderCellBadge(emp, sk)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Assessment Record / Proposal Modal */}
      {activeCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full border border-slate-300 overflow-hidden flex flex-col">
            <div className="bg-[#0c2340] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold tracking-wide">
                  Đánh giá tay nghề: {activeCell.skill.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCell(null)}
                className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssessment} className="p-4 space-y-3.5 text-xs">
              {assessmentError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 font-semibold text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{assessmentError}</span>
                </div>
              )}

              {/* Employee & Skill Info Header */}
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Nhân viên được đánh giá:</span>
                  <span className="font-bold text-slate-900">
                    {activeCell.employee.fullName} ({activeCell.employee.employeeCode})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Vendor & Nhà máy:</span>
                  <span className="font-semibold text-slate-800">
                    {activeCell.employee.vendor} — {activeCell.employee.factory}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Kỹ năng đánh giá:</span>
                  <span className="font-bold text-blue-700">
                    {activeCell.skill.name} ({activeCell.skill.skillCode})
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-1.5">
                  <span className="text-slate-500">Mức yêu cầu chuẩn vị trí:</span>
                  <span className="font-bold text-slate-900">
                    Cấp {activeCell.skill.requiredLevel} ({SKILL_LEVEL_DEFINITIONS[activeCell.skill.requiredLevel].name})
                  </span>
                </div>
                {activeCell.assessment && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Trạng thái hiện tại:</span>
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded ${
                        activeCell.assessment.verificationStatus === 'ĐÃ XÁC NHẬN ĐẠT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {activeCell.assessment.verificationStatus} (Chính thức: L{activeCell.assessment.approvedLevel})
                    </span>
                  </div>
                )}
              </div>

              {/* Proposed Level Selection */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Đề xuất cấp độ tay nghề sát hạch thực tế *
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {([0, 1, 2, 3, 4] as SkillLevel[]).map((lvl) => {
                    const def = SKILL_LEVEL_DEFINITIONS[lvl];
                    const isSelected = proposedLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setProposedLevel(lvl)}
                        className={`p-2 rounded text-center border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-700 font-bold shadow-xs ring-2 ring-blue-300'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="text-xs font-black">{def.code}</div>
                        <div className="text-[10px] leading-tight truncate">{def.name}</div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 italic">
                  Tiêu chí: {SKILL_LEVEL_DEFINITIONS[proposedLevel].criteria}
                </p>
              </div>

              {/* Evidence & Assessment Notes */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Ghi nhận bằng chứng kiểm tra & biên bản sát hạch *
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả kết quả thao tác thực hành, thời gian hoàn thành, lỗi phát sinh, điểm số kiểm tra mẫu..."
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                <strong>Quy tắc bảo vệ dữ liệu:</strong> Kết quả đánh giá này sẽ chuyển sang trạng thái <em>"CHỜ NHÂN SỰ XÁC NHẬN"</em>. Chỉ sau khi đại diện Nhân sự (HR) phê duyệt, cấp độ mới được tính vào năng lực chính thức của nhà máy.
              </div>

              <div className="bg-slate-50 border-t border-slate-200 -mx-4 -mb-4 px-4 py-3 flex items-center justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setActiveCell(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-xs cursor-pointer"
                >
                  Gửi đề xuất đánh giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

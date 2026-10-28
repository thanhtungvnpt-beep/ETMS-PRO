import React, { useState, useMemo } from 'react';
import {
  SkillAssessmentRecord,
  SkillItem,
  EmployeeProfile,
  AssessmentVerificationStatus,
  SKILL_LEVEL_DEFINITIONS,
} from '../../types/workforcePhase2';
import {
  hrVerifyAssessment,
  getStoredSkills,
  getStoredEmployees,
  getStoredAssessments,
} from '../../services/workforcePhase2Storage';
import { UserProfile, VendorName } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  History,
  FileText,
  UserCheck,
  Building2,
  Calendar,
  X,
  Check,
} from 'lucide-react';

interface CompetencyVerificationQueueProps {
  assessments?: SkillAssessmentRecord[];
  skills?: SkillItem[];
  employees?: EmployeeProfile[];
  currentUser: UserProfile;
  onRefreshData?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const CompetencyVerificationQueue: React.FC<CompetencyVerificationQueueProps> = ({
  assessments: propAssessments,
  skills: propSkills,
  employees: propEmployees,
  currentUser,
  onRefreshData: propOnRefresh,
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

  const onRefreshData = () => {
    if (propOnRefresh) {
      propOnRefresh();
    } else {
      setLocalAssessments(getStoredAssessments());
    }
  };
  const [filterStatus, setFilterStatus] = useState<string>('CHỜ NHÂN SỰ XÁC NHẬN');
  const [filterVendor, setFilterVendor] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Rejection modal
  const [rejectingRecord, setRejectingRecord] = useState<SkillAssessmentRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  // Selected record for deep audit inspection
  const [selectedRecord, setSelectedRecord] = useState<SkillAssessmentRecord | null>(null);

  // Mapping lookup helpers
  const employeeMap = useMemo(() => {
    const map = new Map<string, EmployeeProfile>();
    employees.forEach((e) => map.set(e.id, e));
    return map;
  }, [employees]);

  const skillMap = useMemo(() => {
    const map = new Map<string, SkillItem>();
    skills.forEach((s) => map.set(s.skillCode, s));
    return map;
  }, [skills]);

  // Filtered assessment list
  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      const emp = employeeMap.get(a.employeeId);
      const sk = skillMap.get(a.skillCode);

      if (filterStatus !== 'ALL' && a.verificationStatus !== filterStatus) return false;
      if (filterVendor !== 'ALL' && emp?.vendor !== filterVendor) return false;

      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchEmpName = emp?.fullName.toLowerCase().includes(q) || false;
        const matchEmpCode = emp?.employeeCode.toLowerCase().includes(q) || false;
        const matchSkillName = sk?.name.toLowerCase().includes(q) || false;
        const matchAssessor = a.assessorName.toLowerCase().includes(q);
        if (!matchEmpName && !matchEmpCode && !matchSkillName && !matchAssessor) return false;
      }

      return true;
    });
  }, [assessments, filterStatus, filterVendor, searchTerm, employeeMap, skillMap]);

  // Count pending queue
  const pendingCount = useMemo(() => {
    return assessments.filter((a) => a.verificationStatus === 'CHỜ NHÂN SỰ XÁC NHẬN').length;
  }, [assessments]);

  // Handle Approve
  const handleApprove = (recordId: string) => {
    setActionError(null);
    const result = hrVerifyAssessment(recordId, 'APPROVE', currentUser);
    if (!result.success) {
      setActionError(result.message);
    } else {
      onRefreshData();
      if (selectedRecord?.id === recordId) {
        setSelectedRecord(result.record || null);
      }
    }
  };

  // Handle Request Reassessment
  const handleRequestReassessment = (recordId: string) => {
    setActionError(null);
    const result = hrVerifyAssessment(
      recordId,
      'REQUEST_REASSESSMENT',
      currentUser,
      'Yêu cầu Line Leader và Quản đốc tổ chức sát hạch thực hành lại có ghi nhận chỉ số.'
    );
    if (!result.success) {
      setActionError(result.message);
    } else {
      onRefreshData();
      if (selectedRecord?.id === recordId) {
        setSelectedRecord(result.record || null);
      }
    }
  };

  // Submit Rejection
  const handleSubmitRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRecord) return;
    if (!rejectionReason.trim()) {
      setActionError('Bắt buộc phải ghi rõ lý do từ chối kết quả tay nghề.');
      return;
    }

    const result = hrVerifyAssessment(rejectingRecord.id, 'REJECT', currentUser, rejectionReason.trim());
    if (!result.success) {
      setActionError(result.message);
    } else {
      setRejectingRecord(null);
      setRejectionReason('');
      onRefreshData();
    }
  };

  // Authorization check for HR Actions
  const isHRAuthorized =
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'VENDOR_HR' ||
    currentUser.role === 'MANAGEMENT';

  return (
    <div className="space-y-4 text-xs text-slate-800">
      {/* 1. Header */}
      <div className="bg-white rounded border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-amber-100 text-amber-900 font-bold text-xs">
              MODULE D
            </span>
            <h2 className="text-base font-black text-slate-900 tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>Quy Trình Xác Nhận Năng Lực & Phê Duyệt Tay Nghề (HR Queue)</span>
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Bộ phận nhân sự là đơn vị có quyền phê duyệt kết quả tay nghề chính thức. Mọi thao tác đều có nhật ký kiểm toán bất biến.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded font-bold text-amber-900">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Đang chờ duyệt:</span>
            <span className="bg-amber-600 text-white px-1.5 py-0.2 rounded font-mono text-xs">
              {pendingCount}
            </span>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-300 rounded text-red-800 font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-red-500 hover:text-red-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Filter Bar */}
      <div className="bg-white rounded border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên nhân viên, mã NV, kỹ năng, người đánh giá..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600 text-[11px]">Trạng thái duyệt:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 font-bold outline-none cursor-pointer"
            >
              <option value="CHỜ NHÂN SỰ XÁC NHẬN">Chờ nhân sự xác nhận ({pendingCount})</option>
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ĐÃ XÁC NHẬN ĐẠT">Đã xác nhận đạt</option>
              <option value="TỪ CHỐI / KHÔNG ĐẠT">Từ chối / Không đạt</option>
              <option value="CẦN ĐÁNH GIÁ LẠI">Cần đánh giá lại</option>
            </select>
          </div>

          {/* Vendor Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600 text-[11px]">Vendor:</span>
            <select
              value={filterVendor}
              onChange={(e) => setFilterVendor(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 font-semibold outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả Vendor</option>
              {['KHV', 'DREAM TECH', 'HSTEC', 'KTECH', 'HOJEONGB', 'HOJEONG VINA', 'DAAL'].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          Hiển thị: <strong>{filteredAssessments.length}</strong> yêu cầu
        </div>
      </div>

      {/* 3. Verification Table */}
      <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <th className="py-2.5 px-3">Mã phiếu</th>
                <th className="py-2.5 px-3">Nhân viên được đánh giá</th>
                <th className="py-2.5 px-2.5">Vendor & Nhà máy</th>
                <th className="py-2.5 px-3">Kỹ năng đánh giá</th>
                <th className="py-2.5 px-2.5 text-center">Cấp hiện tại</th>
                <th className="py-2.5 px-2.5 text-center">Đề xuất mới</th>
                <th className="py-2.5 px-3">Người đánh giá & Ngày</th>
                <th className="py-2.5 px-3">Trạng thái</th>
                <th className="py-2.5 px-3 text-right">Thao tác phê duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 italic">
                    Không có yêu cầu đánh giá nào trong danh mục này.
                  </td>
                </tr>
              ) : (
                filteredAssessments.map((record) => {
                  const emp = employeeMap.get(record.employeeId);
                  const sk = skillMap.get(record.skillCode);
                  const isPending = record.verificationStatus === 'CHỜ NHÂN SỰ XÁC NHẬN';

                  return (
                    <tr
                      key={record.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        selectedRecord?.id === record.id ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                        {record.id}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{emp?.fullName || record.employeeId}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {emp?.employeeCode} • {emp?.position}
                        </div>
                      </td>

                      <td className="py-2.5 px-2.5">
                        <span className="font-bold text-slate-800">{emp?.vendor}</span>
                        <span className="text-slate-400 mx-1">·</span>
                        <span className="text-slate-600">{emp?.factory}</span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{sk?.name || record.skillCode}</div>
                        <div className="text-[10px] text-slate-500">
                          Chuẩn: L{sk?.requiredLevel} ({sk?.criticality})
                        </div>
                      </td>

                      <td className="py-2.5 px-2.5 text-center">
                        <span className="font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          L{record.approvedLevel}
                        </span>
                      </td>

                      <td className="py-2.5 px-2.5 text-center">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          L{record.proposedLevel}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800">{record.assessorName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{record.assessmentDate}</div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            record.verificationStatus === 'ĐÃ XÁC NHẬN ĐẠT'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : record.verificationStatus === 'CHỜ NHÂN SỰ XÁC NHẬN'
                              ? 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
                              : record.verificationStatus === 'TỪ CHỐI / KHÔNG ĐẠT'
                              ? 'bg-red-50 text-red-800 border-red-300'
                              : 'bg-purple-50 text-purple-800 border-purple-300'
                          }`}
                        >
                          {record.verificationStatus}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedRecord(record)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[11px] transition-colors cursor-pointer"
                            title="Xem chi tiết bằng chứng và nhật ký"
                          >
                            Xem chứng cứ
                          </button>

                          {isPending && isHRAuthorized && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(record.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Phê duyệt xác nhận đạt cấp độ chính thức"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Phê duyệt</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingRecord(record);
                                  setRejectionReason('');
                                }}
                                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded font-bold text-[11px] transition-colors cursor-pointer"
                                title="Từ chối đánh giá (kèm lý do)"
                              >
                                Từ chối
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Deep Evidence & Audit History Drawer */}
      {selectedRecord && (
        <div className="bg-white rounded border border-blue-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                Hồ sơ kiểm toán chi tiết: Phiếu đánh giá {selectedRecord.id}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedRecord(null)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Left: Evidence Description */}
            <div className="space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Bằng chứng & Biên bản kiểm tra thực hành:</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-800 leading-relaxed text-[11px]">
                {selectedRecord.evidenceNotes || 'Chưa ghi nhận bằng chứng văn bản.'}
              </div>

              {selectedRecord.rejectionReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-900 text-[11px]">
                  <strong className="block text-red-950 font-bold mb-0.5">Lý do từ chối của HR:</strong>
                  {selectedRecord.rejectionReason}
                </div>
              )}

              {selectedRecord.verifiedBy && (
                <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    Xác nhận bởi: <strong>{selectedRecord.verifiedBy}</strong> vào ngày {selectedRecord.verifiedAt}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Revision Audit Log */}
            <div className="space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-blue-600" />
                <span>Nhật ký kiểm toán thay đổi (Audit Trail):</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {selectedRecord.history.map((h, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between text-slate-500 font-mono text-[10px]">
                      <span>{h.timestamp}</span>
                      <span className="font-bold text-blue-700">{h.action}</span>
                    </div>
                    <div className="text-slate-800">
                      <strong>{h.changedBy}</strong> ({h.role}): Cấp {h.previousLevel} → Cấp {h.newLevel}
                    </div>
                    {h.reason && <div className="text-slate-600 italic">"{h.reason}"</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Reject Modal (Mandatory Reason Input) */}
      {rejectingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full border border-slate-300 overflow-hidden flex flex-col">
            <div className="bg-red-700 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                <h3 className="text-sm font-bold tracking-wide">
                  Từ chối xác nhận tay nghề ({rejectingRecord.id})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingRecord(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRejection} className="p-4 space-y-3.5 text-xs">
              <div className="text-slate-700">
                Bạn đang từ chối đề xuất cấp độ L{rejectingRecord.proposedLevel} của nhân viên. Vui lòng ghi rõ nguyên nhân và yêu cầu khắc phục theo quy định bắt buộc:
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Lý do từ chối chính thức (Bắt buộc) *
                </label>
                <textarea
                  rows={3}
                  placeholder="VD: Chưa đạt tỷ lệ bọt chì X-Ray theo tiêu chuẩn IPC; thao tác vượt quá chu kỳ Takt Time 25 giây..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="bg-slate-50 border-t border-slate-200 -mx-4 -mb-4 px-4 py-3 flex items-center justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setRejectingRecord(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-xs cursor-pointer"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  WeeklyWorkforceSubmission,
  ReportingCycleConfig,
  UserProfile,
  VendorName,
  FactoryName,
  WorkforcePositionCount,
  WORKFORCE_STRUCTURE,
  VENDOR_LIST,
  FACTORY_LIST,
} from '../../types/workforce';
import {
  createPositionBreakdown,
  calculateSubmissionTotals,
} from '../../data/mockWorkforceData';
import { validateWorkforceSubmission } from '../../services/workforceStorage';
import {
  Save,
  Send,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  ArrowLeft,
  Building2,
  Users,
  Info,
  History,
  RotateCcw,
  Check,
  X,
  Plus,
} from 'lucide-react';

interface WorkforceInputProps {
  cycles: ReportingCycleConfig[];
  submissions: WeeklyWorkforceSubmission[];
  currentUser: UserProfile;
  editingSubmission: WeeklyWorkforceSubmission | null;
  onSaveSubmission: (
    submission: WeeklyWorkforceSubmission,
    action: 'DRAFT' | 'SUBMIT' | 'CONFIRM' | 'REJECT',
    reason?: string
  ) => void;
  onCancel: () => void;
}

export const WorkforceInput: React.FC<WorkforceInputProps> = ({
  cycles,
  submissions,
  currentUser,
  editingSubmission,
  onSaveSubmission,
  onCancel,
}) => {
  const activeCycle = cycles.find((c) => c.isActive) || cycles[0];

  // Primary selectors
  const [selectedCycleId, setSelectedCycleId] = useState<string>(
    editingSubmission?.cycleId || activeCycle?.id || '2025-W16'
  );

  const [selectedVendor, setSelectedVendor] = useState<VendorName>(
    currentUser.role === 'VENDOR_HR' && currentUser.vendor
      ? currentUser.vendor
      : editingSubmission?.vendor || 'KHV'
  );

  const [selectedFactory, setSelectedFactory] = useState<FactoryName>(
    editingSubmission?.factory || 'Nhà máy A'
  );

  // Position numbers state
  const [positions, setPositions] = useState<WorkforcePositionCount[]>(() => {
    if (editingSubmission?.positions && editingSubmission.positions.length > 0) {
      return editingSubmission.positions;
    }
    // Default zero/initial positions
    return createPositionBreakdown(8, 70, 20, 12, 0.2);
  });

  // SOP State
  const [sopPlanQty, setSopPlanQty] = useState<number>(
    editingSubmission?.sop?.sopPlanQty || 30000
  );
  const [sopUnit, setSopUnit] = useState<string>(editingSubmission?.sop?.unit || 'PCS');
  const [sopModel, setSopModel] = useState<string>(editingSubmission?.sop?.model || 'MOD-STANDARD');
  const [sopNote, setSopNote] = useState<string>(editingSubmission?.sop?.note || '');

  // Validation & Revision
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [revisionReason, setRevisionReason] = useState<string>('');
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'DRAFT' | 'SUBMIT'>('DRAFT');

  // When vendor / factory / cycle changes and not in direct edit mode, check if there is an existing submission
  useEffect(() => {
    if (!editingSubmission) {
      const existing = submissions.find(
        (s) =>
          s.cycleId === selectedCycleId &&
          s.vendor === selectedVendor &&
          s.factory === selectedFactory
      );
      if (existing) {
        setPositions(existing.positions);
        setSopPlanQty(existing.sop.sopPlanQty);
        setSopUnit(existing.sop.unit);
        setSopModel(existing.sop.model || '');
        setSopNote(existing.sop.note || '');
      }
    }
  }, [selectedCycleId, selectedVendor, selectedFactory, editingSubmission, submissions]);

  // Handle cell edit
  const handleCellChange = (
    groupIndex: number,
    positionName: string,
    field: 'official' | 'seasonal',
    rawVal: string
  ) => {
    const val = Math.max(0, parseInt(rawVal, 10) || 0);

    setPositions((prev) =>
      prev.map((p) => {
        if (p.position === positionName) {
          const updated = { ...p, [field]: val };
          updated.total = updated.official + updated.seasonal;
          return updated;
        }
        return p;
      })
    );
  };

  // Real-time live totals
  const liveTotals = calculateSubmissionTotals(positions);

  // Validate and submit/save
  const handleSubmitForm = (action: 'DRAFT' | 'SUBMIT') => {
    setValidationErrors([]);
    setValidationWarnings([]);

    const candidateSubmission: Partial<WeeklyWorkforceSubmission> = {
      vendor: selectedVendor,
      factory: selectedFactory,
      cycleId: selectedCycleId,
      positions,
      status: action === 'SUBMIT' ? 'SUBMITTED' : 'DRAFT',
      sop: {
        id: `SOP-${Date.now()}`,
        cycleId: selectedCycleId,
        vendor: selectedVendor,
        factory: selectedFactory,
        sopPlanQty,
        unit: sopUnit,
        model: sopModel,
        note: sopNote,
        submittedBy: currentUser.name,
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      },
    };

    const result = validateWorkforceSubmission(candidateSubmission);

    if (!result.isValid) {
      setValidationErrors(result.errors);
      return;
    }

    if (result.warnings.length > 0) {
      setValidationWarnings(result.warnings);
    }

    // If updating a previously submitted or confirmed record, request revision reason
    if (
      editingSubmission &&
      (editingSubmission.status === 'SUBMITTED' || editingSubmission.status === 'CONFIRMED')
    ) {
      setPendingAction(action);
      setIsRevisionModalOpen(true);
      return;
    }

    executeSave(action, 'Cập nhật theo biểu mẫu tuần');
  };

  const executeSave = (action: 'DRAFT' | 'SUBMIT', reason: string) => {
    const id =
      editingSubmission?.id ||
      `SUB-${selectedCycleId}-${selectedVendor.replace(/\s+/g, '')}-${selectedFactory.replace(
        'Nhà máy ',
        ''
      )}`;

    const fullRecord: WeeklyWorkforceSubmission = {
      id,
      cycleId: selectedCycleId,
      vendor: selectedVendor,
      factory: selectedFactory,
      status: action === 'SUBMIT' ? 'SUBMITTED' : 'DRAFT',
      positions,
      ...liveTotals,
      sop: {
        id: `SOP-${id}`,
        cycleId: selectedCycleId,
        vendor: selectedVendor,
        factory: selectedFactory,
        sopPlanQty,
        unit: sopUnit,
        model: sopModel,
        note: sopNote,
        submittedBy: currentUser.name,
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      },
      updatedBy: currentUser.name,
      updatedByRole: currentUser.title,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      revisions: [
        ...(editingSubmission?.revisions || []),
        {
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          user: currentUser.name,
          role: currentUser.title,
          action: action === 'SUBMIT' ? 'Gửi báo cáo số liệu tuần' : 'Lưu bản nháp',
          reason,
          previousTotal: editingSubmission?.totalHeadcount || 0,
          newTotal: liveTotals.totalHeadcount,
        },
      ],
    };

    onSaveSubmission(fullRecord, action, reason);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Navigation */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-slate-500 hover:text-navy-950 flex items-center gap-1 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Trở lại Dashboard tổng quan
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              TRANG 2
            </span>
            <h1 className="text-xl font-black text-navy-950 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              Biểu Mẫu Nhập Số Liệu Nhân Lực & SOP Theo Tuần
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kê khai chi tiết 23 vị trí nghiệp vụ theo hợp đồng chính thức / thời vụ và kế hoạch sản xuất SOP
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmitForm('DRAFT')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-xs transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4 text-slate-500" />
            Lưu bản nháp
          </button>
          <button
            type="button"
            onClick={() => handleSubmitForm('SUBMIT')}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition-all shadow-xs flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            Gửi báo cáo chính thức
          </button>
        </div>
      </div>

      {/* Validation Alert Box */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            Không thể gửi báo cáo do có lỗi kiểm tra dữ liệu:
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2 text-[11px]">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Kỳ báo cáo tuần <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
            disabled={Boolean(editingSubmission)}
            className="w-full border border-slate-300 rounded px-3 py-2 bg-white text-navy-950 font-bold"
          >
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} {c.isActive ? '(Đang mở nộp)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Đơn vị Vendor <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value as VendorName)}
            disabled={currentUser.role === 'VENDOR_HR' && Boolean(currentUser.vendor)}
            className="w-full border border-slate-300 rounded px-3 py-2 bg-white text-navy-950 font-bold"
          >
            {VENDOR_LIST.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          {currentUser.role === 'VENDOR_HR' && (
            <span className="text-[10px] text-slate-400 mt-1 block">
              Tài khoản bị giới hạn theo Vendor {currentUser.vendor}
            </span>
          )}
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Nhà máy triển khai <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedFactory}
            onChange={(e) => setSelectedFactory(e.target.value as FactoryName)}
            disabled={Boolean(editingSubmission)}
            className="w-full border border-slate-300 rounded px-3 py-2 bg-white text-navy-950 font-bold"
          >
            {FACTORY_LIST.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SOP ENTRY PANEL */}
      <div className="bg-white p-5 rounded-lg border border-purple-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-purple-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
              SOP
            </div>
            <div>
              <h3 className="font-bold text-sm text-navy-950">
                Kế Hoạch Sản Xuất Theo Tuần (Weekly SOP)
              </h3>
              <p className="text-[11px] text-slate-500">
                Lưu ý: SOP là kế hoạch sản lượng dự kiến của kỳ, không phải sản lượng thực tế đã sản xuất
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            {sopPlanQty.toLocaleString()} {sopUnit}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Sản lượng SOP dự kiến <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="500"
              required
              value={sopPlanQty}
              onChange={(e) => setSopPlanQty(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-navy-950 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Đơn vị tính</label>
            <select
              value={sopUnit}
              onChange={(e) => setSopUnit(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 font-semibold"
            >
              <option value="PCS">PCS (Cái / Chiếc)</option>
              <option value="Bộ">Bộ (Sets)</option>
              <option value="Thùng">Thùng (Cartons)</option>
              <option value="Pallet">Pallet</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mã Model / Dòng máy (nếu có)</label>
            <input
              type="text"
              placeholder="VD: MD-2025-X1"
              value={sopModel}
              onChange={(e) => setSopModel(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Ghi chú điều độ sản xuất</label>
            <input
              type="text"
              placeholder="VD: Dự kiến tăng ca ngày thứ 7..."
              value={sopNote}
              onChange={(e) => setSopNote(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
            />
          </div>
        </div>
      </div>

      {/* LIVE SUMMARY BANNER */}
      <div className="bg-navy-950 text-white p-4 rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div>
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
            Tổng hợp thời gian thực
          </span>
          <div className="text-xl font-black font-mono text-white mt-0.5">
            {liveTotals.totalHeadcount}{' '}
            <span className="text-xs font-normal text-slate-400">nhân sự</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <span className="text-slate-400 text-[11px]">Chính thức:</span>
            <div className="font-mono font-bold text-emerald-400 text-sm">
              {liveTotals.totalOfficial}
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Thời vụ:</span>
            <div className="font-mono font-bold text-amber-400 text-sm">
              {liveTotals.totalSeasonal}
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Tỷ lệ thời vụ:</span>
            <div
              className={`font-mono font-bold text-sm ${
                liveTotals.seasonalRatio >= 40
                  ? 'text-red-400'
                  : liveTotals.seasonalRatio >= 30
                  ? 'text-amber-400'
                  : 'text-slate-200'
              }`}
            >
              {liveTotals.seasonalRatio}%
            </div>
          </div>
        </div>
      </div>

      {/* 23 DETAILED POSITIONS TABLE (4 Groups) */}
      <div className="space-y-4">
        {WORKFORCE_STRUCTURE.map((groupObj, gIdx) => {
          const groupPositions = positions.filter((p) => p.group === groupObj.group);
          const groupOfficial = groupPositions.reduce((sum, p) => sum + p.official, 0);
          const groupSeasonal = groupPositions.reduce((sum, p) => sum + p.seasonal, 0);
          const groupTotal = groupOfficial + groupSeasonal;

          return (
            <div
              key={groupObj.group}
              className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Group Header */}
              <div className="bg-slate-50 p-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <h3 className="font-bold text-sm text-navy-950 uppercase tracking-wide">
                    {gIdx + 1}. Nhóm {groupObj.group}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    ({groupObj.positions.length} vị trí chi tiết)
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span>
                    Chính thức: <strong className="text-emerald-700">{groupOfficial}</strong>
                  </span>
                  <span>
                    Thời vụ: <strong className="text-amber-700">{groupSeasonal}</strong>
                  </span>
                  <span className="bg-navy-900 text-white px-2 py-0.5 rounded font-bold">
                    Tổng: {groupTotal}
                  </span>
                </div>
              </div>

              {/* Position Inputs Table */}
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 w-12 text-center">STT</th>
                    <th className="py-2.5 px-4">Tên vị trí chi tiết</th>
                    <th className="py-2.5 px-4 w-48 text-center bg-emerald-50/50">
                      Chính thức (Người)
                    </th>
                    <th className="py-2.5 px-4 w-48 text-center bg-amber-50/50">
                      Thời vụ (Người)
                    </th>
                    <th className="py-2.5 px-4 w-32 text-right">Tổng cộng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {groupObj.positions.map((posName, pIdx) => {
                    const item = groupPositions.find((p) => p.position === posName) || {
                      group: groupObj.group,
                      position: posName,
                      official: 0,
                      seasonal: 0,
                      total: 0,
                    };

                    return (
                      <tr key={posName} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-4 text-center font-mono text-slate-400">
                          {pIdx + 1}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-800">
                          {posName}
                          {posName === 'Người Hàn Quốc' && (
                            <span className="ml-2 text-[10px] text-blue-700 font-normal bg-blue-50 px-1.5 py-0.2 rounded">
                              Chuyên gia / Quản lý
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-4 text-center bg-emerald-50/20">
                          <input
                            type="number"
                            min="0"
                            value={item.official === 0 ? '' : item.official}
                            placeholder="0"
                            onChange={(e) =>
                              handleCellChange(gIdx, posName, 'official', e.target.value)
                            }
                            className="w-28 text-center px-2 py-1 border border-slate-300 rounded font-mono font-bold text-xs focus:ring-1 focus:ring-emerald-500 bg-white"
                          />
                        </td>
                        <td className="py-2 px-4 text-center bg-amber-50/20">
                          <input
                            type="number"
                            min="0"
                            value={item.seasonal === 0 ? '' : item.seasonal}
                            placeholder="0"
                            onChange={(e) =>
                              handleCellChange(gIdx, posName, 'seasonal', e.target.value)
                            }
                            className="w-28 text-center px-2 py-1 border border-slate-300 rounded font-mono font-bold text-xs focus:ring-1 focus:ring-amber-500 bg-white"
                          />
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-navy-950 text-sm">
                          {item.total}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {/* Revision Reason Modal (When modifying submitted record) */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-navy-950 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <History className="w-4 h-4 text-blue-400" />
                Ghi nhận lý do chỉnh sửa số liệu đã gửi
              </h3>
              <button
                onClick={() => setIsRevisionModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Hồ sơ này đã được gửi trước đó. Theo quy định kiểm toán doanh nghiệp, mọi thay đổi số lượng nhân sự hoặc SOP phải kèm theo lý do cụ thể để lưu vết lịch sử.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lý do thay đổi số liệu <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="VD: Bổ sung 5 công nhân thời vụ cho line 2 theo lệnh tăng ca ngày 17/04..."
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={!revisionReason.trim()}
                  onClick={() => {
                    setIsRevisionModalOpen(false);
                    executeSave(pendingAction, revisionReason);
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold disabled:opacity-50"
                >
                  Xác nhận lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
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
  Calendar,
  TrendingUp,
  Sparkles,
  Copy,
  Sliders,
  ArrowRight,
  ShieldAlert,
  Layers,
  Activity,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface WorkforceInputProps {
  cycles: ReportingCycleConfig[];
  submissions: WeeklyWorkforceSubmission[];
  currentUser: UserProfile;
  editingSubmission: WeeklyWorkforceSubmission | null;
  onSaveSubmission: (
    submission: WeeklyWorkforceSubmission,
    action: 'DRAFT' | 'SUBMIT' | 'CONFIRM' | 'REJECT',
    reason?: string,
    batchSubmissions?: WeeklyWorkforceSubmission[]
  ) => void;
  onCancel: () => void;
}

// Data model for each week in the 5-week horizon
export interface WeekEntryState {
  cycleId: string;
  offset: number; // 0 for current week, 1..4 for future weeks
  weekNum: number;
  year: number;
  label: string;
  dateRange: string;
  isCurrent: boolean;
  sopPlanQty: number;
  sopUnit: string;
  sopModel: string;
  sopNote: string;
  positions: WorkforcePositionCount[];
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

  // Active week tab being edited in the detailed 23-position breakdown (0 = current, 1..4 = next 4 weeks)
  const [activeWeekOffset, setActiveWeekOffset] = useState<number>(0);

  // Quick projection mode or view mode
  const [showMatrix, setShowMatrix] = useState<boolean>(true);

  // Helper to parse week string like "2025-W16"
  const parseCycle = (cId: string) => {
    const parts = cId.split('-W');
    return {
      year: parseInt(parts[0], 10) || 2025,
      week: parseInt(parts[1], 10) || 16,
    };
  };

  // Helper to compute date range
  const computeDateRange = (year: number, week: number) => {
    const jan4 = new Date(year, 0, 4);
    const dayOfWeek = jan4.getDay() || 7;
    const firstMonday = new Date(jan4);
    firstMonday.setDate(jan4.getDate() - dayOfWeek + 1);

    const start = new Date(firstMonday);
    start.setDate(firstMonday.getDate() + (week - 1) * 7);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(start.getDate())}/${pad(start.getMonth() + 1)} - ${pad(end.getDate())}/${pad(
      end.getMonth() + 1
    )}/${year}`;
  };

  // Build the 5-week list (Week 0 = current selected, Weeks 1..4 = next 4 weeks)
  const weekDefinitions = useMemo(() => {
    const base = parseCycle(selectedCycleId);
    const defs = [];

    for (let offset = 0; offset <= 4; offset++) {
      const wNum = base.week + offset;
      const cId = `${base.year}-W${String(wNum).padStart(2, '0')}`;
      const matchedCycle = cycles.find((c) => c.id === cId);
      const label =
        offset === 0
          ? `Tuần ${wNum} (Hiện tại)`
          : `Tuần ${wNum} (Dự kiến +${offset}T)`;
      const dateRange = matchedCycle
        ? matchedCycle.title.split('(')[1]?.replace(')', '') || computeDateRange(base.year, wNum)
        : computeDateRange(base.year, wNum);

      defs.push({
        offset,
        cycleId: cId,
        weekNum: wNum,
        year: base.year,
        label,
        dateRange,
        isCurrent: offset === 0,
      });
    }
    return defs;
  }, [selectedCycleId, cycles]);

  // Master state: 5 weeks of data
  const [weeksState, setWeeksState] = useState<WeekEntryState[]>(() => {
    const base = parseCycle(selectedCycleId);
    const defaultPos = editingSubmission?.positions && editingSubmission.positions.length > 0
      ? editingSubmission.positions
      : createPositionBreakdown(8, 70, 20, 12, 0.2);

    return [0, 1, 2, 3, 4].map((offset) => {
      const wNum = base.week + offset;
      const cId = `${base.year}-W${String(wNum).padStart(2, '0')}`;
      const existing = submissions.find(
        (s) => s.cycleId === cId && s.vendor === selectedVendor && s.factory === selectedFactory
      );

      // Default baseline scaling if not exists: SOP slight curve, positions scaled
      const factor = 1 + offset * 0.04;
      const sopQty = existing
        ? existing.sop.sopPlanQty
        : offset === 0
        ? editingSubmission?.sop?.sopPlanQty || 30000
        : Math.round(30000 * factor);

      const positions = existing
        ? existing.positions
        : offset === 0
        ? defaultPos
        : defaultPos.map((p) => {
            const isSeasonal = p.seasonal > 0;
            const newSeasonal = isSeasonal ? Math.round(p.seasonal * factor) : 0;
            return {
              ...p,
              seasonal: newSeasonal,
              total: p.official + newSeasonal,
            };
          });

      return {
        cycleId: cId,
        offset,
        weekNum: wNum,
        year: base.year,
        label: offset === 0 ? `Tuần ${wNum} (Hiện tại)` : `Tuần ${wNum} (Dự kiến +${offset}T)`,
        dateRange: computeDateRange(base.year, wNum),
        isCurrent: offset === 0,
        sopPlanQty: sopQty,
        sopUnit: existing?.sop.unit || editingSubmission?.sop?.unit || 'PCS',
        sopModel: existing?.sop.model || editingSubmission?.sop?.model || 'MOD-STANDARD',
        sopNote:
          existing?.sop.note ||
          (offset > 0 ? `Kế hoạch điều độ sản xuất dự kiến +${offset} tuần` : ''),
        positions,
      };
    });
  });

  // Re-sync when vendor/factory or base cycle changes
  useEffect(() => {
    const base = parseCycle(selectedCycleId);
    setWeeksState((prev) => {
      return [0, 1, 2, 3, 4].map((offset) => {
        const wNum = base.week + offset;
        const cId = `${base.year}-W${String(wNum).padStart(2, '0')}`;
        const existing = submissions.find(
          (s) => s.cycleId === cId && s.vendor === selectedVendor && s.factory === selectedFactory
        );

        if (existing) {
          return {
            cycleId: cId,
            offset,
            weekNum: wNum,
            year: base.year,
            label: offset === 0 ? `Tuần ${wNum} (Hiện tại)` : `Tuần ${wNum} (Dự kiến +${offset}T)`,
            dateRange: computeDateRange(base.year, wNum),
            isCurrent: offset === 0,
            sopPlanQty: existing.sop.sopPlanQty,
            sopUnit: existing.sop.unit,
            sopModel: existing.sop.model || 'MOD-STANDARD',
            sopNote: existing.sop.note || '',
            positions: existing.positions,
          };
        }

        // If not found in submissions, preserve user edits if cycleId matches, else generate clean projection
        const existingInState = prev.find((w) => w.cycleId === cId);
        if (existingInState) return existingInState;

        const baseWeek0 = prev[0] || {
          positions: createPositionBreakdown(8, 70, 20, 12, 0.2),
          sopPlanQty: 30000,
          sopUnit: 'PCS',
          sopModel: 'MOD-STANDARD',
        };

        const factor = 1 + offset * 0.04;
        return {
          cycleId: cId,
          offset,
          weekNum: wNum,
          year: base.year,
          label: offset === 0 ? `Tuần ${wNum} (Hiện tại)` : `Tuần ${wNum} (Dự kiến +${offset}T)`,
          dateRange: computeDateRange(base.year, wNum),
          isCurrent: offset === 0,
          sopPlanQty: Math.round(baseWeek0.sopPlanQty * factor),
          sopUnit: baseWeek0.sopUnit || 'PCS',
          sopModel: baseWeek0.sopModel || 'MOD-STANDARD',
          sopNote: offset > 0 ? `Kế hoạch điều độ sản xuất dự kiến +${offset} tuần` : '',
          positions: baseWeek0.positions.map((p) => {
            const isSeasonal = p.seasonal > 0;
            const newSeasonal = isSeasonal ? Math.round(p.seasonal * factor) : 0;
            return {
              ...p,
              seasonal: newSeasonal,
              total: p.official + newSeasonal,
            };
          }),
        };
      });
    });
  }, [selectedCycleId, selectedVendor, selectedFactory, submissions]);

  // Current active week data
  const activeWeekData = weeksState[activeWeekOffset] || weeksState[0];

  // Computed summary totals for all 5 weeks
  const computedWeekSummaries = useMemo(() => {
    return weeksState.map((w, idx) => {
      const totals = calculateSubmissionTotals(w.positions);
      const prevWeek = idx > 0 ? weeksState[idx - 1] : null;
      const prevTotals = prevWeek ? calculateSubmissionTotals(prevWeek.positions) : null;

      // Delta calculations
      const sopDelta = prevWeek
        ? Math.round(((w.sopPlanQty - prevWeek.sopPlanQty) / (prevWeek.sopPlanQty || 1)) * 100)
        : 0;

      const headcountDelta = prevTotals
        ? totals.totalHeadcount - prevTotals.totalHeadcount
        : 0;

      const headcountDeltaPercent = prevTotals && prevTotals.totalHeadcount > 0
        ? Math.round(((totals.totalHeadcount - prevTotals.totalHeadcount) / prevTotals.totalHeadcount) * 100)
        : 0;

      // Productivity: SOP units per worker
      const productivity = totals.totalHeadcount > 0
        ? Math.round(w.sopPlanQty / totals.totalHeadcount)
        : 0;

      // Risk score:
      // High if seasonal ratio > 35% or SOP grows > 15% with no headcount increase
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      let riskNotice = 'Ổn định, cân đối tải tốt';

      if (totals.seasonalRatio >= 38) {
        riskLevel = 'HIGH';
        riskNotice = 'Tỷ lệ thời vụ vượt ngưỡng an toàn (>38%)';
      } else if (sopDelta >= 15 && headcountDelta <= 2) {
        riskLevel = 'HIGH';
        riskNotice = 'SOP tăng cao (+15%) nhưng quân số chưa bổ sung';
      } else if (totals.seasonalRatio >= 28 || Math.abs(headcountDeltaPercent) >= 10) {
        riskLevel = 'MEDIUM';
        riskNotice = 'Biến động nhân sự đáng chú ý';
      }

      return {
        ...w,
        ...totals,
        sopDelta,
        headcountDelta,
        headcountDeltaPercent,
        productivity,
        riskLevel,
        riskNotice,
      };
    });
  }, [weeksState]);

  // Handle cell edit for the active week
  const handleCellChange = (
    groupIndex: number,
    positionName: string,
    field: 'official' | 'seasonal',
    rawVal: string
  ) => {
    const val = Math.max(0, parseInt(rawVal, 10) || 0);

    setWeeksState((prev) =>
      prev.map((w, idx) => {
        if (idx !== activeWeekOffset) return w;
        const updatedPositions = w.positions.map((p) => {
          if (p.position === positionName) {
            const updated = { ...p, [field]: val };
            updated.total = updated.official + updated.seasonal;
            return updated;
          }
          return p;
        });
        return {
          ...w,
          positions: updatedPositions,
        };
      })
    );
  };

  // Quick SOP update for any week
  const handleSopChange = (offset: number, field: 'sopPlanQty' | 'sopUnit' | 'sopModel' | 'sopNote', val: any) => {
    setWeeksState((prev) =>
      prev.map((w) => (w.offset === offset ? { ...w, [field]: val } : w))
    );
  };

  // TOOL 1: Copy Week 0 (Current) Headcount to all 4 future weeks
  const handleCopyCurrentToAllFuture = () => {
    const currentWeek = weeksState[0];
    if (!currentWeek) return;

    setWeeksState((prev) =>
      prev.map((w, idx) => {
        if (idx === 0) return w;
        return {
          ...w,
          sopUnit: currentWeek.sopUnit,
          sopModel: currentWeek.sopModel,
          positions: currentWeek.positions.map((p) => ({ ...p })),
        };
      })
    );
  };

  // TOOL 2: Auto-scale workforce based on SOP delta for each week
  const handleAutoScaleBySop = () => {
    const baseWeek = weeksState[0];
    if (!baseWeek || baseWeek.sopPlanQty <= 0) return;

    setWeeksState((prev) =>
      prev.map((w, idx) => {
        if (idx === 0) return w;
        const sopRatio = w.sopPlanQty / baseWeek.sopPlanQty;

        // Keep official staff stable, scale seasonal in Production & QC
        const updatedPositions = baseWeek.positions.map((p) => {
          if (p.group === 'Sản xuất' || p.group === 'Chất lượng') {
            const isLineOperator = p.position === 'Đứng line sản xuất' || p.position.includes('Ngoại quan');
            const scaledSeasonal = isLineOperator
              ? Math.max(0, Math.round(p.seasonal * sopRatio))
              : p.seasonal;
            return {
              ...p,
              seasonal: scaledSeasonal,
              total: p.official + scaledSeasonal,
            };
          }
          return { ...p };
        });

        return {
          ...w,
          positions: updatedPositions,
        };
      })
    );
  };

  // TOOL 3: Apply steady +3% seasonal growth across future weeks
  const handleApplySteadyGrowth = () => {
    const baseWeek = weeksState[0];
    if (!baseWeek) return;

    setWeeksState((prev) =>
      prev.map((w, idx) => {
        if (idx === 0) return w;
        const growthFactor = 1 + idx * 0.035;

        return {
          ...w,
          sopPlanQty: Math.round(baseWeek.sopPlanQty * growthFactor),
          positions: baseWeek.positions.map((p) => {
            const newSeasonal = p.seasonal > 0 ? Math.round(p.seasonal * growthFactor) : 0;
            return {
              ...p,
              seasonal: newSeasonal,
              total: p.official + newSeasonal,
            };
          }),
        };
      })
    );
  };

  // Validation & Revision
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [revisionReason, setRevisionReason] = useState<string>('');
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'DRAFT' | 'SUBMIT'>('DRAFT');

  // Submit and save flow for all 5 weeks
  const handleSubmitForm = (action: 'DRAFT' | 'SUBMIT') => {
    setValidationErrors([]);
    setValidationWarnings([]);

    // Validate current week (Week 0)
    const currentWeek = weeksState[0];
    const candidateSubmission: Partial<WeeklyWorkforceSubmission> = {
      vendor: selectedVendor,
      factory: selectedFactory,
      cycleId: currentWeek.cycleId,
      positions: currentWeek.positions,
      status: action === 'SUBMIT' ? 'SUBMITTED' : 'DRAFT',
      sop: {
        id: `SOP-${Date.now()}`,
        cycleId: currentWeek.cycleId,
        vendor: selectedVendor,
        factory: selectedFactory,
        sopPlanQty: currentWeek.sopPlanQty,
        unit: currentWeek.sopUnit,
        model: currentWeek.sopModel,
        note: currentWeek.sopNote,
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

    executeSave(action, 'Cập nhật số liệu tuần hiện tại và kế hoạch 4 tuần tiếp theo');
  };

  const executeSave = (action: 'DRAFT' | 'SUBMIT', reason: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // Build the 5 full submission records
    const allRecords: WeeklyWorkforceSubmission[] = weeksState.map((w, idx) => {
      const totals = calculateSubmissionTotals(w.positions);
      const isCurrentWeek = idx === 0;

      const subId =
        isCurrentWeek && editingSubmission?.id
          ? editingSubmission.id
          : `SUB-${w.cycleId}-${selectedVendor.replace(/\s+/g, '')}-${selectedFactory.replace(
              'Nhà máy ',
              ''
            )}`;

      return {
        id: subId,
        cycleId: w.cycleId,
        vendor: selectedVendor,
        factory: selectedFactory,
        status: action === 'SUBMIT' ? 'SUBMITTED' : 'DRAFT',
        isProjection: !isCurrentWeek,
        forecastWeekOffset: w.offset,
        positions: w.positions,
        ...totals,
        sop: {
          id: `SOP-${subId}`,
          cycleId: w.cycleId,
          vendor: selectedVendor,
          factory: selectedFactory,
          sopPlanQty: w.sopPlanQty,
          unit: w.sopUnit,
          model: w.sopModel,
          note: w.sopNote,
          submittedBy: currentUser.name,
          updatedAt: timestamp,
        },
        updatedBy: currentUser.name,
        updatedByRole: currentUser.title,
        updatedAt: timestamp,
        revisions: [
          ...(isCurrentWeek ? editingSubmission?.revisions || [] : []),
          {
            timestamp,
            user: currentUser.name,
            role: currentUser.title,
            action:
              action === 'SUBMIT'
                ? isCurrentWeek
                  ? 'Gửi báo cáo số liệu tuần'
                  : `Gửi kế hoạch dự kiến +${w.offset} tuần`
                : 'Lưu bản nháp',
            reason,
            previousTotal: isCurrentWeek ? editingSubmission?.totalHeadcount || 0 : totals.totalHeadcount,
            newTotal: totals.totalHeadcount,
          },
        ],
      };
    });

    const primaryWeek0 = allRecords[0];
    const futureWeeks1To4 = allRecords.slice(1);

    onSaveSubmission(primaryWeek0, action, reason, futureWeeks1To4);
  };

  const activeTotals = calculateSubmissionTotals(activeWeekData.positions);

  return (
    <div className="space-y-6">
      {/* ============================================================ */}
      {/* TOP HEADER & ACTION BUTTONS                                  */}
      {/* ============================================================ */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-slate-500 hover:text-navy-950 flex items-center gap-1 mb-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Trở lại Dashboard tổng quan
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              HORIZON 5 TUẦN
            </span>
            <h1 className="text-xl font-black text-navy-950 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              Biểu Mẫu Nhập Liệu Nhân Lực & SOP (Tuần Hiện Tại + 4 Tuần Dự Kiến)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kê khai quân số 23 vị trí và kế hoạch sản xuất SOP cho tuần hiện tại cùng 4 tuần tiếp theo để chủ động nắm bắt biến động tải và kế hoạch nhân sự.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowMatrix(!showMatrix)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showMatrix
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span>{showMatrix ? 'Ẩn ma trận 4 tuần' : 'Hiện ma trận 4 tuần'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmitForm('DRAFT')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>Lưu bản nháp (5 tuần)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmitForm('SUBMIT')}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Gửi báo cáo & Kế hoạch 4 tuần</span>
          </button>
        </div>
      </div>

      {/* Validation Alert Box */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
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

      {/* ============================================================ */}
      {/* PRIMARY SELECTORS (Cycle, Vendor, Factory)                   */}
      {/* ============================================================ */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Kỳ báo cáo tuần cơ sở <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
            disabled={Boolean(editingSubmission)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-navy-950 font-bold"
          >
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} {c.isActive ? '(Kỳ hiện tại)' : ''}
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
            className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-navy-950 font-bold"
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
            className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-navy-950 font-bold"
          >
            {FACTORY_LIST.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5-WEEK HORIZON NAVIGATION CAROUSEL                           */}
      {/* ============================================================ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm text-[#082D55] uppercase tracking-wider">
              Chọn tuần để nhập & xem chi tiết 23 vị trí
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Click vào tuần bất kỳ bên dưới để chỉnh sửa chi tiết từng vị trí
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {computedWeekSummaries.map((w, idx) => {
            const isSelected = activeWeekOffset === w.offset;
            return (
              <div
                key={w.cycleId}
                onClick={() => setActiveWeekOffset(w.offset)}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#1688E8] bg-blue-50/50 shadow-md ring-2 ring-blue-300/40'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        w.isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {w.isCurrent ? 'Tuần hiện tại' : `Dự kiến +${w.offset}T`}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">
                      {w.cycleId}
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-[#082D55]">{w.label}</h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">{w.dateRange}</div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Kế hoạch SOP:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-black text-purple-700">
                        {w.sopPlanQty.toLocaleString()}
                      </span>
                      {idx > 0 && w.sopDelta !== 0 && (
                        <span
                          className={`text-[9px] font-bold px-1 rounded ${
                            w.sopDelta > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {w.sopDelta > 0 ? `+${w.sopDelta}%` : `${w.sopDelta}%`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Quân số:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-black text-navy-950">
                        {w.totalHeadcount} NV
                      </span>
                      {idx > 0 && w.headcountDelta !== 0 && (
                        <span
                          className={`text-[9px] font-bold px-1 rounded ${
                            w.headcountDelta > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {w.headcountDelta > 0 ? `+${w.headcountDelta}` : `${w.headcountDelta}`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Thời vụ:</span>
                    <span className="font-mono font-bold text-slate-600">
                      {w.totalSeasonal} ({w.seasonalRatio}%)
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-2 text-center text-[10px] font-bold text-blue-600 bg-blue-100/70 py-0.5 rounded">
                    ✓ Đang chỉnh sửa
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4-WEEK HORIZON FLUCTUATION MATRIX TABLE                      */}
      {/* ============================================================ */}
      {showMatrix && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#1688E8]" />
                <h3 className="font-extrabold text-base text-[#082D55]">
                  Bảng Tổng Hợp Biến Động Dự Kiến 4 Tuần Tiếp Theo (SOP & Nhân Sự)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Bạn có thể sửa trực tiếp Sản lượng SOP của từng tuần ngay tại bảng này hoặc dùng công cụ tự động cân đối bên phải.
              </p>
            </div>

            {/* Quick Actions Toolbar */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleCopyCurrentToAllFuture}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                title="Sao chép quân số 23 vị trí từ tuần hiện tại sang tuần 17, 18, 19, 20"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Sao chép tuần hiện tại</span>
              </button>

              <button
                type="button"
                onClick={handleAutoScaleBySop}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg cursor-pointer transition-colors"
                title="Tự động tính nhân sự thời vụ Sản xuất & QC theo độ tăng/giảm của SOP"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Cân đối nhân lực theo SOP</span>
              </button>

              <button
                type="button"
                onClick={handleApplySteadyGrowth}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer transition-colors"
                title="Tăng đều +3.5% mỗi tuần"
              >
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>Tăng đều (+3.5%/T)</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 uppercase font-black text-[11px] border-b border-slate-200">
                  <th className="py-3 px-3 w-48">Chỉ tiêu theo dõi</th>
                  {computedWeekSummaries.map((w) => (
                    <th
                      key={w.cycleId}
                      className={`py-3 px-3 text-center min-w-[140px] ${
                        w.isCurrent ? 'bg-blue-100/60 text-blue-950 font-black' : ''
                      }`}
                    >
                      <div>{w.cycleId}</div>
                      <div className="text-[10px] font-normal normal-case text-slate-500">
                        {w.label}
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center min-w-[120px] bg-slate-200/50">
                    Xu hướng 4 tuần
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {/* 1. SOP PLAN (EDITABLE ROW) */}
                <tr className="bg-purple-50/30 hover:bg-purple-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-extrabold text-purple-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    Kế hoạch SOP ({weeksState[0].sopUnit})
                  </td>
                  {weeksState.map((w) => (
                    <td key={w.cycleId} className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={w.sopPlanQty}
                        onChange={(e) =>
                          handleSopChange(
                            w.offset,
                            'sopPlanQty',
                            Math.max(0, parseInt(e.target.value, 10) || 0)
                          )
                        }
                        className="w-28 text-center px-2 py-1 font-mono font-black text-xs text-purple-950 bg-white border border-purple-200 rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-center font-bold text-xs text-purple-900">
                    {weeksState[4].sopPlanQty >= weeksState[0].sopPlanQty ? (
                      <span className="text-emerald-700">
                        +{Math.round(
                          ((weeksState[4].sopPlanQty - weeksState[0].sopPlanQty) /
                            (weeksState[0].sopPlanQty || 1)) *
                            100
                        )}% tổng kỳ
                      </span>
                    ) : (
                      <span className="text-rose-700">
                        {Math.round(
                          ((weeksState[4].sopPlanQty - weeksState[0].sopPlanQty) /
                            (weeksState[0].sopPlanQty || 1)) *
                            100
                        )}%
                      </span>
                    )}
                  </td>
                </tr>

                {/* 2. SOP DELTA % */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 text-slate-600 pl-6">
                    Biến động SOP so với tuần trước
                  </td>
                  {computedWeekSummaries.map((w, idx) => (
                    <td key={w.cycleId} className="py-2.5 px-3 text-center font-mono font-bold">
                      {idx === 0 ? (
                        <span className="text-slate-400">Tuần cơ sở</span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            w.sopDelta > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : w.sopDelta < 0
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {w.sopDelta > 0 ? `+${w.sopDelta}%` : `${w.sopDelta}%`}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-center text-slate-400 text-[11px]">—</td>
                </tr>

                {/* 3. TOTAL HEADCOUNT */}
                <tr className="bg-blue-50/20 font-bold hover:bg-blue-50/50">
                  <td className="py-2.5 px-3 text-[#082D55] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Tổng quân số (Headcount)
                  </td>
                  {computedWeekSummaries.map((w) => (
                    <td key={w.cycleId} className="py-2.5 px-3 text-center font-mono font-black text-sm text-[#082D55]">
                      {w.totalHeadcount}
                      <span className="text-[10px] text-slate-400 font-normal ml-0.5">người</span>
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-center font-mono font-black text-blue-900">
                    {computedWeekSummaries[4].totalHeadcount - computedWeekSummaries[0].totalHeadcount >= 0 ? '+' : ''}
                    {computedWeekSummaries[4].totalHeadcount - computedWeekSummaries[0].totalHeadcount} NV
                  </td>
                </tr>

                {/* 4. NET RECRUITMENT DEMAND */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 text-slate-600 pl-6">
                    Biến động ròng (+/- Tuyển mới/Điều động)
                  </td>
                  {computedWeekSummaries.map((w, idx) => (
                    <td key={w.cycleId} className="py-2.5 px-3 text-center font-mono font-bold">
                      {idx === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-black ${
                            w.headcountDelta > 0
                              ? 'text-emerald-700 bg-emerald-50'
                              : w.headcountDelta < 0
                              ? 'text-amber-700 bg-amber-50'
                              : 'text-slate-500'
                          }`}
                        >
                          {w.headcountDelta > 0 ? `+${w.headcountDelta}` : `${w.headcountDelta}`} người
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-center text-slate-600 font-bold">
                    Nhu cầu tích lũy: {computedWeekSummaries[4].totalHeadcount - computedWeekSummaries[0].totalHeadcount}
                  </td>
                </tr>

                {/* 5. OFFICIAL vs SEASONAL */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 text-slate-600 pl-6">
                    Chính thức / Thời vụ
                  </td>
                  {computedWeekSummaries.map((w) => (
                    <td key={w.cycleId} className="py-2.5 px-3 text-center font-mono text-[11px]">
                      <span className="text-emerald-700 font-bold">{w.totalOfficial}</span>
                      <span className="text-slate-300 mx-1">/</span>
                      <span className="text-amber-700 font-bold">{w.totalSeasonal}</span>
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-center text-slate-500 text-[11px]">
                    Chính thức ổn định
                  </td>
                </tr>

                {/* 6. SEASONAL RATIO */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 text-slate-600 pl-6">
                    Tỷ lệ thời vụ (%)
                  </td>
                  {computedWeekSummaries.map((w) => (
                    <td key={w.cycleId} className="py-2.5 px-3 text-center font-mono font-bold">
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          w.seasonalRatio >= 38
                            ? 'bg-rose-100 text-rose-800'
                            : w.seasonalRatio >= 28
                            ? 'bg-amber-100 text-amber-800'
                            : 'text-slate-700'
                        }`}
                      >
                        {w.seasonalRatio}%
                      </span>
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-center text-[10px] text-slate-500">
                    Ngưỡng chuẩn &lt; 30%
                  </td>
                </tr>

                {/* 7. PRODUCTIVITY (SOP/WORKER) */}
                <tr className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 text-slate-600 pl-6">
                    Năng suất (SOP / người / tuần)
                  </td>
                  {computedWeekSummaries.map((w) => (
                    <td key={w.cycleId} className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                      {w.productivity.toLocaleString()} <span className="text-[10px] text-slate-400">PCS</span>
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-center text-slate-600 font-bold">
                    Trung bình ~{Math.round(
                      computedWeekSummaries.reduce((acc, curr) => acc + curr.productivity, 0) / 5
                    )}
                  </td>
                </tr>

                {/* 8. RISK ASSESSMENT */}
                <tr className="bg-slate-50/80">
                  <td className="py-2.5 px-3 font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                    Đánh giá rủi ro nguồn lực
                  </td>
                  {computedWeekSummaries.map((w) => (
                    <td key={w.cycleId} className="py-2 px-2 text-center text-[10px]">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-bold leading-tight ${
                          w.riskLevel === 'HIGH'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : w.riskLevel === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {w.riskNotice}
                      </span>
                    </td>
                  ))}
                  <td className="py-2.5 px-3 text-center text-[10px] font-bold text-blue-700">
                    Đã kiểm soát
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DETAILED ACTIVE WEEK EDITOR PANEL (SOP + 23 POSITIONS)       */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl border-2 border-blue-200/90 shadow-sm p-5 sm:p-6 space-y-6">
        {/* Active Week Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-100">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full uppercase ${
                  activeWeekData.isCurrent
                    ? 'bg-blue-600 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {activeWeekData.isCurrent
                  ? 'TUẦN HIỆN TẠI (W0)'
                  : `TUẦN DỰ KIẾN (+${activeWeekData.offset}T)`}
              </span>
              <h2 className="text-lg font-black text-[#082D55]">
                Đang biên soạn chi tiết: {activeWeekData.label} — {activeWeekData.dateRange}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeWeekData.isCurrent
                ? 'Đây là số liệu chốt của tuần hiện tại. Số liệu này làm cơ sở định mức cho các tuần tiếp theo.'
                : `Dự báo chi tiết cho tuần thứ +${activeWeekData.offset}. Các vị trí chênh lệch so với tuần hiện tại sẽ được đánh dấu trực quan.`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              Tổng quân số tuần này: <strong className="text-blue-700 font-mono text-sm">{activeTotals.totalHeadcount}</strong> người
            </span>
          </div>
        </div>

        {/* SOP Inputs for this Active Week */}
        <div className="bg-purple-50/40 p-4 rounded-xl border border-purple-200/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                SOP
              </div>
              <h3 className="font-extrabold text-sm text-purple-950">
                Kế Hoạch Sản Xuất ({activeWeekData.label})
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
              {activeWeekData.sopPlanQty.toLocaleString()} {activeWeekData.sopUnit}
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
                value={activeWeekData.sopPlanQty}
                onChange={(e) =>
                  handleSopChange(
                    activeWeekData.offset,
                    'sopPlanQty',
                    Math.max(0, parseInt(e.target.value, 10) || 0)
                  )
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-navy-950 focus:ring-2 focus:ring-purple-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Đơn vị tính</label>
              <select
                value={activeWeekData.sopUnit}
                onChange={(e) =>
                  handleSopChange(activeWeekData.offset, 'sopUnit', e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-semibold"
              >
                <option value="PCS">PCS (Cái / Chiếc)</option>
                <option value="Bộ">Bộ (Sets)</option>
                <option value="Thùng">Thùng (Cartons)</option>
                <option value="Pallet">Pallet</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mã Model / Dòng máy</label>
              <input
                type="text"
                placeholder="VD: MD-2025-X1"
                value={activeWeekData.sopModel}
                onChange={(e) =>
                  handleSopChange(activeWeekData.offset, 'sopModel', e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ghi chú điều độ sản xuất</label>
              <input
                type="text"
                placeholder="VD: Dự kiến tăng ca, điều phối line..."
                value={activeWeekData.sopNote}
                onChange={(e) =>
                  handleSopChange(activeWeekData.offset, 'sopNote', e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
              />
            </div>
          </div>
        </div>

        {/* 23 Detailed Positions Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-[#082D55] uppercase tracking-wider">
              Chi tiết nhân sự 23 vị trí nghiệp vụ — {activeWeekData.label}
            </h4>
            {!activeWeekData.isCurrent && (
              <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                💡 Cột màu vàng hiển thị chênh lệch +/- so với Tuần hiện tại
              </span>
            )}
          </div>

          {WORKFORCE_STRUCTURE.map((groupObj, gIdx) => {
            const currentWeek0 = weeksState[0];
            const groupPositions = activeWeekData.positions.filter(
              (p) => p.group === groupObj.group
            );
            const groupOfficial = groupPositions.reduce((sum, p) => sum + p.official, 0);
            const groupSeasonal = groupPositions.reduce((sum, p) => sum + p.seasonal, 0);
            const groupTotal = groupOfficial + groupSeasonal;

            return (
              <div
                key={groupObj.group}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
              >
                {/* Group Header */}
                <div className="bg-slate-50 p-3.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <h3 className="font-bold text-xs uppercase tracking-wide text-navy-950">
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

                {/* Position Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4 w-12 text-center">STT</th>
                        <th className="py-2.5 px-4">Tên vị trí chi tiết</th>
                        <th className="py-2.5 px-4 w-44 text-center bg-emerald-50/50">
                          Chính thức (Người)
                        </th>
                        <th className="py-2.5 px-4 w-44 text-center bg-amber-50/50">
                          Thời vụ (Người)
                        </th>
                        <th className="py-2.5 px-4 w-32 text-right">Tổng tuần này</th>
                        {!activeWeekData.isCurrent && (
                          <th className="py-2.5 px-4 w-40 text-center bg-blue-50/50">
                            So với Tuần hiện tại
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {groupObj.positions.map((posName, pIdx) => {
                        const item = groupPositions.find((p) => p.position === posName) || {
                          group: groupObj.group,
                          position: posName,
                          official: 0,
                          seasonal: 0,
                          total: 0,
                        };

                        const baseItem = currentWeek0?.positions.find(
                          (p) => p.position === posName
                        ) || { total: 0 };
                        const diff = item.total - baseItem.total;

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
                                className="w-28 text-center px-2 py-1 border border-slate-300 rounded font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
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
                                className="w-28 text-center px-2 py-1 border border-slate-300 rounded font-mono font-bold text-xs focus:ring-2 focus:ring-amber-500 bg-white"
                              />
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-navy-950 text-sm">
                              {item.total}
                            </td>
                            {!activeWeekData.isCurrent && (
                              <td className="py-2.5 px-4 text-center bg-blue-50/20 font-mono text-xs">
                                {diff === 0 ? (
                                  <span className="text-slate-400">Bằng tuần HT ({baseItem.total})</span>
                                ) : diff > 0 ? (
                                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                    +{diff} (HT: {baseItem.total})
                                  </span>
                                ) : (
                                  <span className="font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                                    {diff} (HT: {baseItem.total})
                                  </span>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM ACTION BAR                                            */}
      {/* ============================================================ */}
      <div className="bg-navy-950 text-white p-5 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-slate-200">
            Sẵn sàng hoàn tất nhập liệu cho 5 tuần?
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Khi bấm Lưu hoặc Gửi, toàn bộ 5 tuần (Tuần hiện tại + 4 tuần dự kiến) sẽ được lưu đồng thời vào hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-600 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={() => handleSubmitForm('DRAFT')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-400" />
            <span>Lưu bản nháp 5 tuần</span>
          </button>
          <button
            type="button"
            onClick={() => handleSubmitForm('SUBMIT')}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Gửi báo cáo & Kế hoạch 4 tuần</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* REVISION REASON MODAL                                        */}
      {/* ============================================================ */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
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
                Hồ sơ này đã được gửi trước đó. Theo quy định kiểm toán doanh nghiệp OOS, mọi thay đổi số lượng nhân sự hoặc SOP phải kèm theo lý do cụ thể để lưu vết lịch sử.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lý do thay đổi số liệu <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="VD: Điều chỉnh tăng 10 nhân sự thời vụ và SOP thêm 2,000 PCS theo đơn hàng mới..."
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold cursor-pointer"
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
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:opacity-50 cursor-pointer"
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

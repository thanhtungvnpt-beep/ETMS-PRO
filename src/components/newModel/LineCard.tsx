// OOS NEW MODEL — LineCard Component
// Visual specs: Dark Navy theme, Neon Blue borders, dynamic progress bars for each stage (Purchase, Receive, Setup, Trial).
// Pulls data directly from Project WorkUnits and EVM calculations.

import React, { useState, useMemo } from 'react';
import { ProjectLinePro, NewModelProjectPro } from '../../types/newModelPro';
import {
  WorkUnitEntity,
  getLineWorkUnits,
  calculateLineIntelligence,
  LineIntelligenceMetrics,
} from '../../services/progressIntelligenceEngine';
import {
  AlertTriangle,
  CheckCircle2,
  ShoppingCart,
  Boxes,
  Wrench,
  PlayCircle,
  Phone,
  Calendar,
  Hourglass,
  Flag,
  Copy,
  ChevronDown,
  ChevronUp,
  Send,
  Eye,
  Check,
  Layers,
  Sparkles,
} from 'lucide-react';

export interface LineCardProps {
  line?: ProjectLinePro;
  workUnits?: WorkUnitEntity[];
  project?: NewModelProjectPro;
  metrics?: LineIntelligenceMetrics;
  onOpenTextReport?: (metrics: LineIntelligenceMetrics, initialTab?: 'line' | 'action' | 'project') => void;
  onViewLineDetails?: (lineId: string) => void;
  className?: string;
}

export const LineCard: React.FC<LineCardProps> = ({
  line,
  workUnits: initialWorkUnits,
  project,
  metrics,
  onOpenTextReport,
  onViewLineDetails,
  className = '',
}) => {
  // 1. Pull identifiers and WorkUnits directly from line, metrics, or the WorkUnits engine
  const lineId = line?.id || metrics?.lineId || 'LINE-ON1-B1-DAAL-L1';
  const lineName = line?.name || metrics?.lineName || 'DAAL L1';
  const projectCode = project?.projectCode || metrics?.projectCode || 'CNC ON1';
  const process = project?.process || metrics?.process || 'CNC';
  const blockName = line?.blockName || metrics?.blockName || 'B1';
  const factory = line?.factory || metrics?.factory || 'SEV';

  const units: WorkUnitEntity[] = useMemo(() => {
    if (initialWorkUnits && initialWorkUnits.length > 0) {
      return initialWorkUnits;
    }
    return getLineWorkUnits(lineId, lineName);
  }, [initialWorkUnits, lineId, lineName]);

  // 2. State for WorkUnits expansion toggle
  const [showWorkUnitsList, setShowWorkUnitsList] = useState<boolean>(false);
  const [quickCopied, setQuickCopied] = useState<boolean>(false);

  // 3. Compute stage-by-stage dynamic progress DIRECTLY from WorkUnits
  const stageStats = useMemo(() => {
    const calcStage = (stageName: WorkUnitEntity['stage']) => {
      const stageUnits = units.filter((u) => u.stage === stageName);
      const total = stageUnits.length;
      if (total === 0) return { pct: 0, total: 0, verified: 0, pending: 0 };
      const verified = stageUnits.filter((u) => u.status === 'VERIFIED').length;
      const pending = stageUnits.filter((u) => u.status === 'PENDING' || u.status === 'BLOCKED').length;
      const pct = Math.round((verified / total) * 100);
      return { pct, total, verified, pending, units: stageUnits };
    };

    const purchase = calcStage('PURCHASE');
    const receive = calcStage('RECEIVING');
    const setup = calcStage('SETUP');
    const trial = calcStage('TRIAL_RUN');

    const totalAll = units.length || 10;
    const verifiedAll = units.filter((u) => u.status === 'VERIFIED').length;
    const evPct = Math.round((verifiedAll / totalAll) * 1000) / 10;

    // Planned progress (PV) calculation
    const pvPct = metrics?.pv ?? (line?.code.includes('DAAL L1') || lineId.includes('DAAL-L1') ? 80.0 : 75.0);
    const svPct = Math.round((evPct - pvPct) * 10) / 10;
    const spiVal = pvPct > 0 ? Math.round((evPct / pvPct) * 100) / 100 : null;

    return {
      purchase,
      receive,
      setup,
      trial,
      totalAll,
      verifiedAll,
      evPct,
      pvPct,
      svPct,
      spiVal,
    };
  }, [units, line, lineId, metrics]);

  // 4. Derive Status & Neon Severity
  const statusInfo = useMemo(() => {
    if (metrics?.status) {
      if (metrics.status.includes('Chậm')) {
        return {
          label: metrics.status,
          severity: 'danger',
          bg: 'from-[#7A0611] to-[#990817]',
          border: 'border-red-500',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]',
        };
      }
      if (metrics.status.includes('Nguy cơ')) {
        return {
          label: metrics.status,
          severity: 'warning',
          bg: 'from-[#78350F] to-[#92400E]',
          border: 'border-amber-400',
          glow: 'shadow-[0_0_15px_rgba(251,191,36,0.5)]',
        };
      }
      return {
        label: metrics.status,
        severity: 'success',
        bg: 'from-[#065F46] to-[#047857]',
        border: 'border-emerald-400',
        glow: 'shadow-[0_0_20px_rgba(52,211,153,0.5)]',
      };
    }

    const isLine1 = lineId.includes('DAAL-L1') || lineName.includes('DAAL L1');
    if (isLine1) {
      return {
        label: 'Chậm tiến độ',
        severity: 'danger',
        bg: 'from-[#7A0611] to-[#990817]',
        border: 'border-red-500',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]',
      };
    }
    if (stageStats.spiVal !== null && stageStats.spiVal < 0.85) {
      return {
        label: 'Chậm tiến độ',
        severity: 'danger',
        bg: 'from-[#7A0611] to-[#990817]',
        border: 'border-red-500',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]',
      };
    }
    if (stageStats.spiVal !== null && stageStats.spiVal < 1.0) {
      return {
        label: 'Nguy cơ trễ',
        severity: 'warning',
        bg: 'from-[#78350F] to-[#92400E]',
        border: 'border-amber-400',
        glow: 'shadow-[0_0_15px_rgba(251,191,36,0.5)]',
      };
    }
    return {
      label: 'Đúng tiến độ',
      severity: 'success',
      bg: 'from-[#065F46] to-[#047857]',
      border: 'border-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(52,211,153,0.5)]',
    };
  }, [lineId, lineName, stageStats.spiVal, metrics]);

  // 5. WorkUnit-driven Issues
  const pendingWorkUnits = useMemo(() => {
    return units.filter((u) => u.status === 'PENDING' || u.status === 'BLOCKED');
  }, [units]);

  // Quick fallback contacts mapped from WorkUnits
  const contacts = useMemo(() => {
    if (metrics?.contacts && metrics.contacts.length > 0) {
      return metrics.contacts.map((c) => ({
        role: c.role,
        name: c.name,
        phone: c.phone,
        icon: c.iconType === 'cart' ? ShoppingCart : Wrench,
      }));
    }
    const purchaser = units.find((u) => u.responsibleRole.toLowerCase().includes('purchaser'));
    const eqm = units.find((u) => u.responsibleRole.toLowerCase().includes('eqm'));
    return [
      {
        role: 'Purchaser',
        name: purchaser?.responsiblePerson || 'Lê Hoàng Nam',
        phone: purchaser?.responsiblePhone || '0982.114.567',
        icon: ShoppingCart,
      },
      {
        role: 'EQM',
        name: eqm?.responsiblePerson || 'Phạm Quang Huy',
        phone: eqm?.responsiblePhone || '0913.882.345',
        icon: Wrench,
      },
    ];
  }, [units, metrics]);

  // Line Intelligence metrics for modal integration
  const baseMetrics: LineIntelligenceMetrics = useMemo(() => {
    const dummyProject = project || {
      projectCode: 'CNC ON1',
      process: 'CNC' as any,
    } as any;
    return calculateLineIntelligence(
      line || {
        id: lineId,
        code: 'CNC ON1 B1 DAAL L1',
        name: 'DAAL L1',
        factory: 'SEV',
        blockId: 'B1',
        blockName: 'B1',
        vendor: 'DAAL',
        status: 'Chậm tiến độ',
        overallProgressPct: stageStats.evPct,
        purchaseStage: {} as any,
        receivingStage: {} as any,
        setupStage: {} as any,
        equipmentItems: [],
      } as any,
      dummyProject
    );
  }, [line, lineId, project, stageStats.evPct]);

  // Copy handler
  const handleCopySummary = () => {
    const text = `🚨 [${lineName}] Trạng thái: ${statusInfo.label} | EV: ${stageStats.evPct}% | PV: ${stageStats.pvPct}% | SPI: ${stageStats.spiVal || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setQuickCopied(true);
    setTimeout(() => setQuickCopied(false), 2000);
  };

  return (
    <div
      className={`relative w-full max-w-[480px] mx-auto bg-[#030C1C] text-white rounded-3xl p-4 sm:p-5 border-2 border-cyan-400/90 shadow-[0_0_30px_rgba(6,182,212,0.35)] space-y-3.5 transition-all hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] font-sans ${className}`}
    >
      {/* ======================================================== */}
      {/* 1. HEADER (MACHINE THUMBNAIL, LINE CODE, STATUS BADGE)   */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Machine image & identifiers */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-16 h-16 rounded-xl bg-[#071B38] border border-cyan-500/50 p-1 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
            <img
              src={
                metrics?.machineImageUrl && !metrics.machineImageUrl.includes('6fbbd841')
                  ? metrics.machineImageUrl
                  : line?.machineImageUrl ||
                    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=300&q=80'
              }
              alt={lineName}
              className="w-full h-full object-cover rounded-lg"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="min-w-0 space-y-0.5">
            <h3 className="text-2xl font-black text-white tracking-tight truncate leading-tight">
              {lineName}
            </h3>
            <div className="text-xs font-semibold text-slate-300 truncate">
              {projectCode} | {blockName} | {factory}
            </div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#0878E8] text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
              {process}
            </span>
          </div>
        </div>

        {/* Right: Neon Status Pill */}
        <div className="shrink-0">
          <div
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r ${statusInfo.bg} border-2 ${statusInfo.border} text-white font-black text-sm ${statusInfo.glow} ${
              statusInfo.severity === 'danger' ? 'animate-pulse' : ''
            }`}
          >
            {statusInfo.severity === 'danger' ? (
              <AlertTriangle className="w-4 h-4 text-white stroke-[2.5]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-white stroke-[2.5]" />
            )}
            <span>{statusInfo.label}</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. PROGRESS OVERVIEW (HOÀN THÀNH EV% + GLOWING BAR)      */}
      {/* ======================================================== */}
      <div className="bg-[#051630] border border-cyan-800/60 rounded-2xl px-4 py-3 flex items-center justify-between gap-4 shadow-inner">
        <div className="flex items-baseline gap-2 shrink-0">
          <span className="text-sm font-bold text-slate-200">Hoàn thành</span>
          <span className="text-2xl font-black text-cyan-400 font-mono tracking-tight tabular-nums drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
            {stageStats.evPct.toFixed(1)}%
          </span>
        </div>

        {/* Dynamic EV Bar calculated directly from WorkUnits */}
        <div className="flex-1 bg-[#092244] h-4 rounded-full overflow-hidden p-0.5 border border-cyan-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(0, stageStats.evPct))}%` }}
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. FOUR KPI INDICATORS (PV, EV, SV, SPI)                 */}
      {/* ======================================================== */}
      <div className="bg-[#051630] border border-cyan-800/60 rounded-2xl p-3 grid grid-cols-4 divide-x divide-cyan-900/70 text-center shadow-inner">
        {/* PV */}
        <div className="px-1">
          <div className="text-[11px] font-semibold text-slate-300 leading-tight">
            Kế hoạch<br />
            <span className="text-[10px] text-slate-400">(PV)</span>
          </div>
          <div className="text-lg font-black text-white mt-1 font-mono tabular-nums">
            {stageStats.pvPct.toFixed(1)}%
          </div>
        </div>

        {/* EV */}
        <div className="px-1">
          <div className="text-[11px] font-semibold text-slate-300 leading-tight">
            Thực tế<br />
            <span className="text-[10px] text-slate-400">(EV)</span>
          </div>
          <div className="text-lg font-black text-emerald-400 mt-1 font-mono tabular-nums drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
            {stageStats.evPct.toFixed(1)}%
          </div>
        </div>

        {/* SV */}
        <div className="px-1">
          <div className="text-[11px] font-semibold text-slate-300 leading-tight">
            Chênh lệch<br />
            <span className="text-[10px] text-slate-400">(SV)</span>
          </div>
          <div
            className={`text-lg font-black mt-1 font-mono tabular-nums ${
              stageStats.svPct < 0 ? 'text-[#FF4D5E] drop-shadow-[0_0_8px_rgba(255,77,94,0.4)]' : 'text-emerald-400'
            }`}
          >
            {stageStats.svPct > 0 ? '+' : ''}
            {stageStats.svPct.toFixed(1)}%
          </div>
        </div>

        {/* SPI */}
        <div className="px-1">
          <div className="text-[11px] font-semibold text-slate-300 leading-tight">
            Hiệu suất<br />
            <span className="text-[10px] text-slate-400">(SPI)</span>
          </div>
          <div
            className={`text-lg font-black mt-1 font-mono tabular-nums ${
              stageStats.spiVal !== null && stageStats.spiVal < 0.9 ? 'text-amber-300' : 'text-white'
            }`}
          >
            {stageStats.spiVal !== null ? stageStats.spiVal.toFixed(2) : 'N/A'}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. DYNAMIC STAGE PROGRESS BARS (PULLED FROM WORKUNITS)   */}
      {/* ======================================================== */}
      <div className="bg-[#051630] border border-cyan-800/60 rounded-2xl p-3.5 space-y-3 shadow-inner">
        {/* 1. Mua hàng (Purchase) */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-28 shrink-0">
            <ShoppingCart className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">Mua hàng</span>
          </div>
          <div className="flex-1 bg-[#092244] h-2.5 rounded-full overflow-hidden border border-cyan-900/80">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${stageStats.purchase.pct}%` }}
            />
          </div>
          <span className="w-12 text-right font-black font-mono text-white tabular-nums">
            {stageStats.purchase.pct}%
          </span>
          <span
            className={`w-20 text-center py-0.5 rounded-full text-[10px] font-black flex items-center justify-center gap-1 shadow-2xs ${
              stageStats.purchase.pct >= 100
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            {stageStats.purchase.pct >= 100 ? (
              <>
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Đạt</span>
              </>
            ) : (
              <span>Đang làm</span>
            )}
          </span>
        </div>

        {/* 2. Nhận hàng (Receive) */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-28 shrink-0">
            <Boxes className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">Nhận hàng</span>
          </div>
          <div className="flex-1 bg-[#092244] h-2.5 rounded-full overflow-hidden border border-cyan-900/80">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${stageStats.receive.pct}%` }}
            />
          </div>
          <span className="w-12 text-right font-black font-mono text-white tabular-nums">
            {stageStats.receive.pct}%
          </span>
          <span
            className={`w-20 text-center py-0.5 rounded-full text-[10px] font-black flex items-center justify-center gap-1 ${
              stageStats.receive.pending > 0 || stageStats.receive.pct < 80
                ? 'bg-rose-600 text-white shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {stageStats.receive.pending > 0 || stageStats.receive.pct < 80 ? (
              <span>! Chậm</span>
            ) : (
              <span>✓ Đạt</span>
            )}
          </span>
        </div>

        {/* 3. Setup */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-28 shrink-0">
            <Wrench className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">Setup</span>
          </div>
          <div className="flex-1 bg-[#092244] h-2.5 rounded-full overflow-hidden border border-cyan-900/80">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${stageStats.setup.pct}%` }}
            />
          </div>
          <span className="w-12 text-right font-black font-mono text-white tabular-nums">
            {stageStats.setup.pct}%
          </span>
          <span
            className={`w-20 text-center py-0.5 rounded-full text-[10px] font-black flex items-center justify-center gap-1 ${
              stageStats.setup.pct < 50
                ? 'bg-rose-600 text-white shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                : 'bg-amber-600 text-white'
            }`}
          >
            {stageStats.setup.pct < 50 ? <span>! Chậm</span> : <span>Đang làm</span>}
          </span>
        </div>

        {/* 4. Chạy thử (Trial) */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-28 shrink-0">
            <PlayCircle className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">Chạy thử</span>
          </div>
          <div className="flex-1 bg-[#092244] h-2.5 rounded-full overflow-hidden border border-cyan-900/80">
            <div
              className="h-full bg-slate-600 rounded-full transition-all duration-500"
              style={{ width: `${stageStats.trial.pct}%` }}
            />
          </div>
          <span className="w-12 text-right font-black font-mono text-slate-400 tabular-nums">
            {stageStats.trial.pct}%
          </span>
          <span className="w-20 text-center py-0.5 rounded-full text-[10px] font-bold bg-[#0D2447] text-slate-300 border border-cyan-900/60 flex items-center justify-center gap-0.5">
            <span className="text-[10px]">⏱</span>
            <span>Chưa đến hạn</span>
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. MAIN ISSUES & CONTACT PERSONS (PULLED FROM WORKUNITS) */}
      {/* ======================================================== */}
      <div className="bg-[#051630] border border-cyan-800/60 rounded-2xl p-3.5 grid grid-cols-1 md:grid-cols-2 gap-3.5 divide-y md:divide-y-0 md:divide-x divide-cyan-900/60 shadow-inner">
        {/* Left: Vấn đề chính */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-white">
            <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/40">
              🎯
            </div>
            <span>Vấn đề chính ({pendingWorkUnits.length})</span>
          </div>

          <div className="space-y-2 pl-1">
            {pendingWorkUnits.map((wu) => (
              <div key={wu.id} className="flex items-start gap-2 text-xs text-slate-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                <span className="leading-snug">
                  <strong className="text-white">{wu.itemCode || wu.name}:</strong>{' '}
                  {wu.pendingReason || wu.blockedReason || 'Cần nghiệm thu xác nhận'}
                </span>
              </div>
            ))}

            {pendingWorkUnits.length === 0 && (
              <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Không có vấn đề tồn đọng trên Line này.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Cần liên hệ */}
        <div className="space-y-2 md:pl-3.5 pt-3 md:pt-0">
          <div className="flex items-center gap-2 text-xs font-black text-white">
            <Phone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cần liên hệ</span>
          </div>

          <div className="space-y-1.5">
            {contacts.map((c, idx) => {
              const Icon = c.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#0A2244] border border-cyan-900/80 rounded-xl p-2 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1 rounded bg-[#061B38] text-cyan-400 shrink-0 border border-cyan-800/50">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                        {c.role}
                      </div>
                      <div className="font-bold text-white truncate text-xs">{c.name}</div>
                    </div>
                  </div>

                  <a
                    href={`tel:${c.phone}`}
                    title={`Gọi ${c.phone}`}
                    className="p-1.5 rounded-lg bg-cyan-900/60 hover:bg-cyan-700 text-cyan-300 hover:text-white transition-colors shrink-0"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. TIME OVERVIEW (KẾ HOẠCH, ĐÃ TRÔI QUA, CÒN LẠI)        */}
      {/* ======================================================== */}
      <div className="bg-[#051630] border border-cyan-800/60 rounded-2xl p-3 grid grid-cols-3 divide-x divide-cyan-900/60 text-xs shadow-inner">
        {/* Kế hoạch */}
        <div className="flex items-start gap-2 px-1">
          <div className="p-1 rounded bg-[#0A2244] text-cyan-400 shrink-0 border border-cyan-800/40">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Kế hoạch</span>
            <span className="font-bold text-white text-[11px] block">01/10 – 10/11</span>
            <span className="text-[10px] text-slate-400">(40 ngày)</span>
          </div>
        </div>

        {/* Đã trôi qua */}
        <div className="flex items-start gap-2 px-2">
          <div className="p-1 rounded bg-[#0A2244] text-cyan-400 shrink-0 border border-cyan-800/40">
            <Hourglass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Đã trôi qua</span>
            <span className="font-bold text-white text-[11px] block">29 ngày</span>
            <span className="text-[10px] text-cyan-300">(72.5%)</span>
          </div>
        </div>

        {/* Còn lại */}
        <div className="flex items-start gap-2 px-2">
          <div className="p-1 rounded bg-[#0A2244] text-cyan-400 shrink-0 border border-cyan-800/40">
            <Flag className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Còn lại</span>
            <span className="font-black text-cyan-300 text-sm block font-mono">11 ngày</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 7. TOGGLE TO VIEW GRANULAR PROJECT WORKUNITS             */}
      {/* ======================================================== */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowWorkUnitsList(!showWorkUnitsList)}
          className="w-full py-1.5 px-3 bg-[#071933] hover:bg-[#0A2244] text-cyan-300 text-xs font-bold rounded-xl border border-cyan-900/60 transition-colors flex items-center justify-between cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Nguồn dữ liệu WorkUnits ({units.length} hạng mục)</span>
          </span>
          {showWorkUnitsList ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showWorkUnitsList && (
          <div className="mt-2 bg-[#051630] border border-cyan-800/80 rounded-xl p-2.5 max-h-48 overflow-y-auto space-y-1.5 text-xs">
            {units.map((u) => (
              <div
                key={u.id}
                className="p-1.5 bg-[#092244] rounded-lg border border-cyan-900/60 flex items-center justify-between gap-2 text-[11px]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-cyan-300 font-bold">{u.itemCode || u.id}</span>
                    <span className="text-white font-medium truncate">{u.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {u.stage} • {u.responsibleRole}: {u.responsiblePerson}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                    u.status === 'VERIFIED'
                      ? 'bg-emerald-600 text-white'
                      : u.status === 'PENDING'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {u.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 8. CARD ACTIONS (SAO CHÉP PHIẾU TEXT, GIAO VIỆC, CHI TIẾT) */}
      {/* ======================================================== */}
      <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Primary CTA: Copy Text Report */}
        <button
          type="button"
          onClick={() => onOpenTextReport?.(baseMetrics, 'line')}
          className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-2.5 px-3 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Sao chép phiếu TEXT</span>
        </button>

        {/* Action: Giao việc */}
        <button
          type="button"
          onClick={() => onOpenTextReport?.(baseMetrics, 'action')}
          className="bg-[#092244] hover:bg-[#0E3366] text-cyan-300 font-bold py-2.5 px-3 rounded-xl border border-cyan-700/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          title="Tạo phiếu giao việc theo người phụ trách"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Giao việc</span>
        </button>

        {/* Action: Chi tiết Line */}
        {onViewLineDetails && (
          <button
            type="button"
            onClick={() => onViewLineDetails(lineId)}
            className="p-2.5 bg-[#092244] hover:bg-[#0E3366] text-slate-300 hover:text-white rounded-xl border border-cyan-700/60 transition-all cursor-pointer"
            title="Xem chi tiết các thiết bị trên Line"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

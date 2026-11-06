// OOS NEW MODEL — Line Card (Thẻ thông số Pro)
// Chuẩn xác 100% theo ảnh tham chiếu DAAL L1: Dark Navy, Neon Cyan/Blue Border, High-Contrast Industrial Dashboard

import React, { useState } from 'react';
import { LineIntelligenceMetrics } from '../../services/progressIntelligenceEngine';
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
  FileText,
  Eye,
  Check,
  Send,
  Sparkles,
} from 'lucide-react';

interface NewModelLineCardProps {
  metrics: LineIntelligenceMetrics;
  onOpenTextReport: (metrics: LineIntelligenceMetrics, initialTab?: 'line' | 'action' | 'project') => void;
  onViewLineDetails?: (lineId: string) => void;
  compact?: boolean;
}

export const NewModelLineCard: React.FC<NewModelLineCardProps> = ({
  metrics,
  onOpenTextReport,
  onViewLineDetails,
  compact = false,
}) => {
  const [copiedQuick, setCopiedQuick] = useState(false);

  // Quick copy simple status
  const handleQuickCopySummary = () => {
    const text = `🚨 [${metrics.lineName}] Trạng thái: ${metrics.status} | PV: ${metrics.pv}% | EV: ${metrics.ev}% | SV: ${metrics.sv}% | SPI: ${metrics.spi || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopiedQuick(true);
    setTimeout(() => setCopiedQuick(false), 2000);
  };

  const isDelayed = metrics.status.includes('Chậm') || metrics.status.includes('trễ');
  const isOnTrack = metrics.status.includes('Đúng') || metrics.status.includes('Hoàn tất');

  return (
    <div className="relative w-full max-w-[480px] mx-auto bg-[#030C1C] text-white rounded-3xl p-4 sm:p-5 border-2 border-cyan-400/90 shadow-[0_0_30px_rgba(6,182,212,0.35)] space-y-3.5 transition-all hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] font-sans">
      {/* ======================================================== */}
      {/* 1. HEADER (MACHINE IMAGE, LINE CODE, STATUS BADGE)        */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Machine Thumbnail & Titles */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-16 h-16 rounded-xl bg-[#071B38] border border-cyan-500/50 p-1 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
            <img
              src={metrics.machineImageUrl}
              alt={metrics.lineName}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback icon container if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="min-w-0 space-y-0.5">
            <h3 className="text-2xl font-black text-white tracking-tight truncate leading-tight">
              {metrics.lineName}
            </h3>
            <div className="text-xs font-semibold text-slate-300 truncate">
              {metrics.projectCode} | {metrics.blockName} | {metrics.factory}
            </div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-[#0878E8] text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
              {metrics.process}
            </span>
          </div>
        </div>

        {/* Right: Status Pill with Neon Glow */}
        <div className="shrink-0">
          {isDelayed ? (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#7A0611] to-[#990817] border-2 border-red-500 text-white font-black text-sm shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse">
              <AlertTriangle className="w-4 h-4 text-white stroke-[2.5]" />
              <span>{metrics.status}</span>
            </div>
          ) : isOnTrack ? (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#065F46] to-[#047857] border-2 border-emerald-400 text-white font-black text-sm shadow-[0_0_20px_rgba(52,211,153,0.5)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 stroke-[2.5]" />
              <span>{metrics.status}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#78350F] border-2 border-amber-400 text-white font-black text-sm shadow-[0_0_15px_rgba(251,191,36,0.5)]">
              <AlertTriangle className="w-4 h-4 text-amber-200 stroke-[2.5]" />
              <span>{metrics.status}</span>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. PROGRESS OVERVIEW (HOÀN THÀNH 60.0% + LARGE BAR)      */}
      {/* ======================================================== */}
      <div className="bg-[#051630] border border-cyan-800/60 rounded-2xl px-4 py-3 flex items-center justify-between gap-4 shadow-inner">
        <div className="flex items-baseline gap-2 shrink-0">
          <span className="text-sm font-bold text-slate-200">Hoàn thành</span>
          <span className="text-2xl font-black text-cyan-400 font-mono tracking-tight tabular-nums drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
            {metrics.ev.toFixed(1)}%
          </span>
        </div>

        {/* Glowing Progress Bar */}
        <div className="flex-1 bg-[#092244] h-4 rounded-full overflow-hidden p-0.5 border border-cyan-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(0, metrics.ev))}%` }}
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
            {metrics.pv.toFixed(1)}%
          </div>
        </div>

        {/* EV */}
        <div className="px-1">
          <div className="text-[11px] font-semibold text-slate-300 leading-tight">
            Thực tế<br />
            <span className="text-[10px] text-slate-400">(EV)</span>
          </div>
          <div className="text-lg font-black text-emerald-400 mt-1 font-mono tabular-nums drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
            {metrics.ev.toFixed(1)}%
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
              metrics.sv < 0 ? 'text-[#FF4D5E] drop-shadow-[0_0_8px_rgba(255,77,94,0.4)]' : 'text-emerald-400'
            }`}
          >
            {metrics.sv > 0 ? '+' : ''}
            {metrics.sv.toFixed(1)}%
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
              metrics.spi !== null && metrics.spi < 0.9 ? 'text-amber-300' : 'text-white'
            }`}
          >
            {metrics.spi !== null ? metrics.spi.toFixed(2) : 'N/A'}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. STAGE PROGRESS (MUA HÀNG, NHẬN HÀNG, SETUP, CHẠY THỬ) */}
      {/* ======================================================== */}
      <div className="bg-[#051630] border border-cyan-800/60 rounded-2xl p-3.5 space-y-3 shadow-inner">
        {/* 1. Mua hàng */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-28 shrink-0">
            <ShoppingCart className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">Mua hàng</span>
          </div>
          <div className="flex-1 bg-[#092244] h-2.5 rounded-full overflow-hidden border border-cyan-900/80">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
              style={{ width: `${metrics.stages.purchase.actualPct}%` }}
            />
          </div>
          <span className="w-12 text-right font-black font-mono text-white tabular-nums">
            {metrics.stages.purchase.actualPct}%
          </span>
          <span className="w-20 text-center py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center justify-center gap-1 shadow-2xs">
            <Check className="w-3 h-3 stroke-[3]" />
            <span>Đạt</span>
          </span>
        </div>

        {/* 2. Nhận hàng */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-28 shrink-0">
            <Boxes className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">Nhận hàng</span>
          </div>
          <div className="flex-1 bg-[#092244] h-2.5 rounded-full overflow-hidden border border-cyan-900/80">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
              style={{ width: `${metrics.stages.receiving.actualPct}%` }}
            />
          </div>
          <span className="w-12 text-right font-black font-mono text-white tabular-nums">
            {metrics.stages.receiving.actualPct}%
          </span>
          <span
            className={`w-20 text-center py-0.5 rounded-full text-[10px] font-black flex items-center justify-center gap-1 ${
              metrics.stages.receiving.statusType === 'danger'
                ? 'bg-rose-600 text-white shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                : 'bg-emerald-600 text-white'
            }`}
          >
            <span>! Chậm</span>
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
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
              style={{ width: `${metrics.stages.setup.actualPct}%` }}
            />
          </div>
          <span className="w-12 text-right font-black font-mono text-white tabular-nums">
            {metrics.stages.setup.actualPct}%
          </span>
          <span
            className={`w-20 text-center py-0.5 rounded-full text-[10px] font-black flex items-center justify-center gap-1 ${
              metrics.stages.setup.statusType === 'danger'
                ? 'bg-rose-600 text-white shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                : 'bg-emerald-600 text-white'
            }`}
          >
            <span>! Chậm</span>
          </span>
        </div>

        {/* 4. Chạy thử */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-28 shrink-0">
            <PlayCircle className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">Chạy thử</span>
          </div>
          <div className="flex-1 bg-[#092244] h-2.5 rounded-full overflow-hidden border border-cyan-900/80">
            <div
              className="h-full bg-slate-600 rounded-full"
              style={{ width: `${metrics.stages.trialRun.actualPct}%` }}
            />
          </div>
          <span className="w-12 text-right font-black font-mono text-slate-400 tabular-nums">
            {metrics.stages.trialRun.actualPct}%
          </span>
          <span className="w-20 text-center py-0.5 rounded-full text-[10px] font-bold bg-[#0D2447] text-slate-300 border border-cyan-900/60 flex items-center justify-center gap-0.5">
            <span className="text-[10px]">⏱</span>
            <span>Chưa đến</span>
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. MAIN ISSUES & CONTACT PERSONS (SPLIT 2 COLS)          */}
      {/* ======================================================== */}
      <div className="bg-[#051630] border border-cyan-800/60 rounded-2xl p-3.5 grid grid-cols-1 md:grid-cols-2 gap-3.5 divide-y md:divide-y-0 md:divide-x divide-cyan-900/60 shadow-inner">
        {/* Left: Vấn đề chính */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-white">
            <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/40">
              🎯
            </div>
            <span>Vấn đề chính ({metrics.mainIssues.length})</span>
          </div>

          <div className="space-y-2 pl-1">
            {metrics.mainIssues.map((iss) => (
              <div key={iss.id} className="flex items-start gap-2 text-xs text-slate-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                <span className="leading-snug">
                  <strong className="text-white">{iss.itemCode}:</strong> {iss.problem}
                </span>
              </div>
            ))}

            {metrics.mainIssues.length === 0 && (
              <div className="text-xs text-slate-400 italic">
                Không có sự cố nào ghi nhận.
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
            {metrics.contacts.map((c, idx) => (
              <div
                key={idx}
                className="bg-[#0A2244] border border-cyan-900/80 rounded-xl p-2 flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1 rounded bg-[#061B38] text-cyan-400 shrink-0 border border-cyan-800/50">
                    {c.iconType === 'cart' ? (
                      <ShoppingCart className="w-3.5 h-3.5" />
                    ) : (
                      <Wrench className="w-3.5 h-3.5" />
                    )}
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
            ))}
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
            <span className="font-bold text-white text-[11px] block">{metrics.startDate} – {metrics.endDate}</span>
            <span className="text-[10px] text-slate-400">({metrics.totalDays} ngày)</span>
          </div>
        </div>

        {/* Đã trôi qua */}
        <div className="flex items-start gap-2 px-2">
          <div className="p-1 rounded bg-[#0A2244] text-cyan-400 shrink-0 border border-cyan-800/40">
            <Hourglass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Đã trôi qua</span>
            <span className="font-bold text-white text-[11px] block">{metrics.elapsedDays} ngày</span>
            <span className="text-[10px] text-cyan-300">({metrics.elapsedPct}%)</span>
          </div>
        </div>

        {/* Còn lại */}
        <div className="flex items-start gap-2 px-2">
          <div className="p-1 rounded bg-[#0A2244] text-cyan-400 shrink-0 border border-cyan-800/40">
            <Flag className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Còn lại</span>
            <span className="font-black text-cyan-300 text-sm block font-mono">{metrics.remainingDays} ngày</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 7. CARD ACTIONS (SAO CHÉP PHIẾU TEXT, GIAO VIỆC, CHI TIẾT) */}
      {/* ======================================================== */}
      <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Primary CTA: Copy Text Report */}
        <button
          type="button"
          onClick={() => onOpenTextReport(metrics, 'line')}
          className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-2.5 px-3 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Sao chép phiếu TEXT</span>
        </button>

        {/* Action: Tạo phiếu giao việc */}
        <button
          type="button"
          onClick={() => onOpenTextReport(metrics, 'action')}
          className="bg-[#092244] hover:bg-[#0E3366] text-cyan-300 font-bold py-2.5 px-3 rounded-xl border border-cyan-700/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          title="Tạo phiếu giao việc riêng cho Purchaser hoặc EQM"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Giao việc</span>
        </button>

        {/* Action: Chi tiết Line */}
        {onViewLineDetails && (
          <button
            type="button"
            onClick={() => onViewLineDetails(metrics.lineId)}
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

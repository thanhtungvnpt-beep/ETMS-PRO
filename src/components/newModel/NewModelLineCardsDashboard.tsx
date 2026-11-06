// OOS NEW MODEL — Progress Intelligence & Line Cards Dashboard
// Tổng hợp chỉ số EVM toàn dự án, lưới hiển thị thẻ thông số Pro và hệ thống xuất báo cáo TEXT

import React, { useState, useMemo } from 'react';
import { NewModelProjectPro } from '../../types/newModelPro';
import {
  calculateProjectIntelligence,
  LineIntelligenceMetrics,
} from '../../services/progressIntelligenceEngine';
import { LineCard } from './LineCard';
import { NewModelLineCard } from './NewModelLineCard';
import { NewModelTextReportModal } from './NewModelTextReportModal';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Building2,
  FileText,
  Activity,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface NewModelLineCardsDashboardProps {
  project: NewModelProjectPro;
  currentUser: { name: string; role: string };
  onBackToGantt?: () => void;
  onViewLineDetails?: (lineId: string) => void;
}

export const NewModelLineCardsDashboard: React.FC<NewModelLineCardsDashboardProps> = ({
  project,
  currentUser,
  onBackToGantt,
  onViewLineDetails,
}) => {
  // Compute Project and Line intelligence metrics
  const { projectMetrics, allLineMetrics } = useMemo(() => {
    return calculateProjectIntelligence(project);
  }, [project]);

  // Filters state
  const [selectedFactory, setSelectedFactory] = useState<string>('ALL');
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');
  const [selectedVendor, setSelectedVendor] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Text Report Modal state
  const [activeReportModal, setActiveReportModal] = useState<{
    lineMetrics: LineIntelligenceMetrics;
    initialTab: 'line' | 'action' | 'project';
  } | null>(null);

  // Filtered Line Cards
  const filteredLines = useMemo(() => {
    return allLineMetrics.filter((lm) => {
      const matchFactory =
        selectedFactory === 'ALL' || lm.factory === selectedFactory;
      const matchBlock =
        selectedBlock === 'ALL' ||
        lm.blockName === selectedBlock ||
        lm.lineCode.includes(selectedBlock);
      const matchVendor =
        selectedVendor === 'ALL' || lm.vendor === selectedVendor;
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'DELAYED' && lm.status.includes('Chậm')) ||
        (statusFilter === 'WARNING' && lm.status.includes('Nguy cơ')) ||
        (statusFilter === 'ON_TRACK' && (lm.status.includes('Đúng') || lm.status.includes('Hoàn tất')));

      const matchSearch =
        lm.lineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lm.lineCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lm.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lm.mainIssues.some((i) => i.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) || i.problem.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchFactory && matchBlock && matchVendor && matchStatus && matchSearch;
    });
  }, [allLineMetrics, selectedFactory, selectedBlock, selectedVendor, statusFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* ======================================================== */}
      {/* 1. PROJECT INTELLIGENCE SUMMARY STRIP (EVM ROLLUP)       */}
      {/* ======================================================== */}
      <div className="bg-[#030C1C] text-white p-4 sm:p-5 rounded-2xl border-2 border-cyan-500/70 shadow-[0_0_25px_rgba(6,182,212,0.25)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-cyan-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-900/70 text-cyan-300 border border-cyan-700/60">
                <Activity className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-black tracking-wide text-white flex items-center gap-2">
                  <span>PROGRESS INTELLIGENCE ENGINE</span>
                  <span className="text-[10px] bg-cyan-900/80 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-700/60 font-bold">
                    EVM Standards
                  </span>
                </h2>
                <p className="text-xs text-slate-300">
                  Dự án: <strong className="text-white">{project.projectCode}</strong> | Quy trình: <strong className="text-cyan-300">{project.process}</strong> | Tổng số chuyền: <strong className="text-white">{projectMetrics.totalLines} Lines</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setActiveReportModal({
                  lineMetrics: allLineMetrics[0] || {} as any,
                  initialTab: 'project',
                })
              }
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-black shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Xuất phiếu báo cáo Project (TEXT)</span>
            </button>

            {onBackToGantt && (
              <button
                type="button"
                onClick={onBackToGantt}
                className="px-3.5 py-2 bg-[#092244] hover:bg-[#0E3366] text-cyan-300 rounded-xl text-xs font-bold border border-cyan-800 transition-all cursor-pointer"
              >
                ← Quay lại Gantt
              </button>
            )}
          </div>
        </div>

        {/* 4 Primary Project EVM Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="bg-[#051630] border border-cyan-800/60 rounded-xl p-3 shadow-inner">
            <span className="text-[11px] font-bold text-slate-300 block">Kế hoạch Dự án (Project PV)</span>
            <div className="text-2xl font-black text-white mt-1 font-mono tabular-nums">
              {projectMetrics.projectPV}%
            </div>
            <span className="text-[10px] text-slate-400">Khối lượng kế hoạch</span>
          </div>

          <div className="bg-[#051630] border border-cyan-800/60 rounded-xl p-3 shadow-inner">
            <span className="text-[11px] font-bold text-slate-300 block">Thực tế Dự án (Project EV)</span>
            <div className="text-2xl font-black text-emerald-400 mt-1 font-mono tabular-nums drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
              {projectMetrics.projectEV}%
            </div>
            <span className="text-[10px] text-emerald-300">Work Units đã Verified</span>
          </div>

          <div className="bg-[#051630] border border-cyan-800/60 rounded-xl p-3 shadow-inner">
            <span className="text-[11px] font-bold text-slate-300 block">Chênh lệch (Project SV)</span>
            <div
              className={`text-2xl font-black mt-1 font-mono tabular-nums ${
                projectMetrics.projectSV < 0 ? 'text-[#FF4D5E]' : 'text-emerald-400'
              }`}
            >
              {projectMetrics.projectSV > 0 ? '+' : ''}
              {projectMetrics.projectSV}%
            </div>
            <span className="text-[10px] text-slate-400">EV trừ đi PV</span>
          </div>

          <div className="bg-[#051630] border border-cyan-800/60 rounded-xl p-3 shadow-inner">
            <span className="text-[11px] font-bold text-slate-300 block">Chỉ số Hiệu suất (Project SPI)</span>
            <div
              className={`text-2xl font-black mt-1 font-mono tabular-nums ${
                projectMetrics.projectSPI !== null && projectMetrics.projectSPI < 0.9
                  ? 'text-amber-300'
                  : 'text-white'
              }`}
            >
              {projectMetrics.projectSPI !== null ? projectMetrics.projectSPI.toFixed(2) : 'N/A'}
            </div>
            <span className="text-[10px] text-slate-400">Tỷ lệ EV / PV</span>
          </div>
        </div>

        {/* Status Distribution Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">Phân loại tình trạng Line:</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-bold">
              🟢 Đúng tiến độ: {projectMetrics.onTrackLines}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500 text-amber-300 font-bold">
              🟡 Nguy cơ trễ: {projectMetrics.warningLines}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-500 text-rose-300 font-bold animate-pulse">
              🔴 Chậm tiến độ: {projectMetrics.delayedLines}
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            Tổng cộng: <strong className="text-white">{projectMetrics.totalProjectWorkUnits}</strong> Work Units
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. FILTER & SEARCH BAR                                   */}
      {/* ======================================================== */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[320px]">
          {/* Search input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm Line, Vendor, Mã sự cố, Thiết bị..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="DELAYED">🔴 Chậm tiến độ</option>
            <option value="WARNING">🟡 Nguy cơ trễ</option>
            <option value="ON_TRACK">🟢 Đúng tiến độ</option>
          </select>

          {/* Factory Filter */}
          <select
            value={selectedFactory}
            onChange={(e) => setSelectedFactory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold"
          >
            <option value="ALL">Tất cả Nhà máy</option>
            <option value="SEV">Nhà máy SEV (Bắc Ninh)</option>
            <option value="SV1">Nhà máy SV1 (Thái Nguyên)</option>
          </select>

          {/* Vendor Filter */}
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold"
          >
            <option value="ALL">Tất cả Vendor</option>
            <option value="DAAL">DAAL</option>
            <option value="KHV">KHV</option>
            <option value="DREAM TECH">DREAM TECH</option>
            <option value="HSTEC">HSTEC</option>
            <option value="KTECH">KTECH</option>
            <option value="HOJEONGB">HOJEONGB</option>
            <option value="HOJEONG VINA">HOJEONG VINA</option>
          </select>
        </div>

        <div className="text-slate-500 font-semibold">
          Hiển thị: <strong className="text-blue-600">{filteredLines.length}</strong> / {allLineMetrics.length} Thẻ Line
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. RESPONSIVE GRID OF LINE CARDS (WORKUNITS CONNECTED) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredLines.map((lm) => (
          <LineCard
            key={lm.lineId}
            metrics={lm}
            project={project}
            onOpenTextReport={(m, tab) =>
              setActiveReportModal({ lineMetrics: m, initialTab: tab || 'line' })
            }
            onViewLineDetails={onViewLineDetails}
          />
        ))}

        {filteredLines.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">Không tìm thấy Line nào phù hợp</h4>
            <p className="text-xs text-slate-500 mt-1">
              Vui lòng thử điều chỉnh lại bộ lọc trạng thái, nhà máy hoặc từ khóa tìm kiếm.
            </p>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. TEXT REPORT MODAL DIALOG                              */}
      {/* ======================================================== */}
      {activeReportModal && (
        <NewModelTextReportModal
          lineMetrics={activeReportModal.lineMetrics}
          projectMetrics={projectMetrics}
          initialTab={activeReportModal.initialTab}
          onClose={() => setActiveReportModal(null)}
        />
      )}
    </div>
  );
};

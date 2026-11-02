// OOS ETMS PRO — Phase 3: Line Detail & Station Monitoring
import React, { useState } from 'react';
import {
  ProductionLine,
  LineFillingSummary,
} from '../../types/lineFillingPhase3';
import {
  getStoredLines,
  getStoredLineSummaries,
} from '../../services/lineFillingPhase3Storage';
import {
  Cpu,
  TrendingUp,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  Wrench,
  Search,
  Filter,
  BarChart3,
  Users,
} from 'lucide-react';

export const LineDetailView: React.FC = () => {
  const [lines] = useState<ProductionLine[]>(getStoredLines);
  const [summaries] = useState<LineFillingSummary[]>(getStoredLineSummaries);
  const [selectedLineId, setSelectedLineId] = useState<string>('LINE-03');

  const selectedLine = lines.find((l) => l.id === selectedLineId) || lines[2];
  const selectedSummary = summaries.find((s) => s.lineId === selectedLineId) || summaries[2];

  return (
    <div className="space-y-4">
      {/* Line Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2">
          {lines.map((l) => {
            const isSelected = l.id === selectedLineId;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => setSelectedLineId(l.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#1688E8] text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {l.code} • {l.productModel}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 font-medium shrink-0">
          Chuyền: <strong className="text-slate-900">{selectedLine.name}</strong>
        </div>
      </div>

      {/* Line Header Details */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-bold">Trạng thái Chuyền</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-base font-black text-emerald-700">{selectedLine.status}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Khu vực: {selectedLine.area}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-bold">Takt Time & Năng suất</div>
          <div className="text-xl font-black text-blue-900 font-mono mt-1">
            {selectedLine.taktTimeSec}s <span className="text-xs font-normal text-slate-500">/ SP</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Mục tiêu: {selectedLine.hourlyTarget} PCS/giờ
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-bold">Tiến độ Sản lượng SOP ca này</div>
          <div className="text-xl font-black font-mono mt-1 text-purple-700">
            {selectedLine.actualSopQty} <span className="text-xs text-slate-400">/ {selectedLine.targetSopQty} PCS</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Đạt {Math.round((selectedLine.actualSopQty / selectedLine.targetSopQty) * 100)}% kế hoạch
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-bold">Nhân sự & Điền đầy</div>
          <div className="text-xl font-black font-mono mt-1 text-[#082D55]">
            {selectedSummary.actualTotal} <span className="text-xs text-slate-400">/ {selectedSummary.requiredHeadcount} NV</span>
          </div>
          <div className="text-[10px] font-bold text-amber-600 mt-1">
            Tỷ lệ điền đầy: {selectedSummary.fillingRate}%
          </div>
        </div>
      </div>

      {/* Station Layout / Workstations */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-black text-base text-[#082D55]">
              Sơ Đồ Trạm Công Việc & Cân Bằng Chuyền (Workstation Balancing)
            </h3>
            <p className="text-xs text-slate-500">
              Trực quan hóa vị trí nhân sự thực tế tại từng trạm máy trên chuyền {selectedLine.code}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Trưởng chuyền: {selectedLine.lineLeaderName} ({selectedLine.lineLeaderPhone})
          </span>
        </div>

        {/* Stations Horizontal Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 pt-2">
          {/* Station 1: Cấp liệu & Loader */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                Trạm 01
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">100% OK</span>
            </div>
            <h4 className="font-extrabold text-xs text-slate-900">Cấp liệu & Loader PCB</h4>
            <div className="text-xs text-slate-600">Định mức: 4 người</div>
            <div className="text-xs font-mono font-bold text-emerald-700">Thực có: 4 (4 CT, 0 TV)</div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div className="bg-emerald-500 h-1.5 rounded-full w-full" />
            </div>
          </div>

          {/* Station 2: Máy dán chip SMT */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                Trạm 02
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">100% OK</span>
            </div>
            <h4 className="font-extrabold text-xs text-slate-900">Máy SMT Mounter 1-2</h4>
            <div className="text-xs text-slate-600">Định mức: 6 người</div>
            <div className="text-xs font-mono font-bold text-emerald-700">Thực có: 6 (5 CT, 1 TV)</div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div className="bg-emerald-500 h-1.5 rounded-full w-full" />
            </div>
          </div>

          {/* Station 3: Lắp ráp linh kiện xuyên lỗ */}
          <div className="p-4 rounded-xl border-2 border-rose-300 bg-rose-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">
                Trạm 03
              </span>
              <span className="text-[10px] text-rose-600 font-black">THIẾU 8 NV</span>
            </div>
            <h4 className="font-extrabold text-xs text-slate-900">Lắp ráp thủ công (Manual Insertion)</h4>
            <div className="text-xs text-slate-600">Định mức: 24 người</div>
            <div className="text-xs font-mono font-black text-rose-700">Thực có: 16 (12 CT, 4 TV)</div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div className="bg-rose-500 h-1.5 rounded-full w-[66%]" />
            </div>
          </div>

          {/* Station 4: Trạm Hàn sóng & AOI */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                Trạm 04
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">100% OK</span>
            </div>
            <h4 className="font-extrabold text-xs text-slate-900">Trạm Hàn & Kiểm tra AOI</h4>
            <div className="text-xs text-slate-600">Định mức: 8 người</div>
            <div className="text-xs font-mono font-bold text-emerald-700">Thực có: 8 (6 CT, 2 TV)</div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div className="bg-emerald-500 h-1.5 rounded-full w-full" />
            </div>
          </div>

          {/* Station 5: Kiểm tra OQC & Đóng hộp */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                Trạm 05
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">100% OK</span>
            </div>
            <h4 className="font-extrabold text-xs text-slate-900">Kiểm tra OQC & Đóng gói</h4>
            <div className="text-xs text-slate-600">Định mức: 8 người</div>
            <div className="text-xs font-mono font-bold text-emerald-700">Thực có: 8 (3 CT, 5 TV)</div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div className="bg-emerald-500 h-1.5 rounded-full w-full" />
            </div>
          </div>
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Phát hiện điểm nghẽn (Bottleneck):</strong> Trạm 03 (Lắp ráp thủ công) đang thiếu 8 công nhân đứng line, làm chu kỳ công đoạn kéo dài lên 42s (so với Takt time chuẩn 32s). Cần bổ sung nhân sự ngay để không làm chậm trạm 04 và 05.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

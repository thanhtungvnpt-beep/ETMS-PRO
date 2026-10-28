import React from 'react';
import {
  ProjectStepNumber,
  PROJECT_STEP_DEFINITIONS,
} from '../../types/newModelProject';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  GitBranch,
  Truck,
  ShoppingCart,
  ShieldCheck,
  Wrench,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

interface Props {
  currentStep?: ProjectStepNumber;
  selectedStep?: ProjectStepNumber;
  onSelectStep?: (step: ProjectStepNumber) => void;
  branchType?: 'ĐỦ TÀI NGUYÊN' | 'THIẾU TÀI NGUYÊN' | 'KẾT HỢP';
  isCompleted?: boolean;
}

export const NewModelWorkflowBanner: React.FC<Props> = ({
  currentStep = 1,
  selectedStep,
  onSelectStep,
  branchType = 'KẾT HỢP',
  isCompleted = false,
}) => {
  const steps: ProjectStepNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="bg-[#0a192f] text-white border border-[#1b3a5b] shadow-md p-4 overflow-hidden">
      {/* Top Banner Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-700/60 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-blue-500 animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
            QUY TRÌNH QUẢN LÝ DỰ ÁN MODEL MỚI (9 BƯỚC KHÉP KÍN)
          </span>
          <span className="text-[10px] bg-blue-900/60 text-blue-200 border border-blue-700/60 px-2 py-0.5 font-mono">
            ETMS PRO ENTERPRISE PIPELINE
          </span>
        </div>
        <div className="text-[11px] text-slate-300 flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Đã hoàn thành
          </span>
          <span className="flex items-center gap-1 font-semibold text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            Đang thực hiện
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            Chưa tới bước
          </span>
        </div>
      </div>

      {/* 9-Step Flow Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2">
        {steps.map((sNum) => {
          const def = PROJECT_STEP_DEFINITIONS[sNum];
          const isDone = isCompleted || sNum < currentStep;
          const isCurrent = !isCompleted && sNum === currentStep;
          const isSelected = selectedStep === sNum;

          return (
            <div
              key={sNum}
              onClick={() => onSelectStep && onSelectStep(sNum)}
              className={`relative p-2.5 transition-all cursor-pointer border flex flex-col justify-between min-h-[105px] ${
                isSelected
                  ? 'ring-2 ring-blue-400 bg-[#122842] border-blue-400 shadow-lg'
                  : isCurrent
                  ? 'bg-[#152e4d] border-amber-400 shadow-sm'
                  : isDone
                  ? 'bg-[#0e2238] border-emerald-600/50 hover:bg-[#132c49]'
                  : 'bg-[#091524] border-slate-700/60 opacity-75 hover:opacity-100 hover:bg-[#0d1e33]'
              }`}
            >
              {/* Step number badge & icon */}
              <div className="flex items-center justify-between">
                <span
                  className={`w-5 h-5 flex items-center justify-center text-[10px] font-black font-mono text-white ${
                    isDone ? 'bg-emerald-600' : isCurrent ? 'bg-amber-500 text-slate-900' : 'bg-slate-700'
                  }`}
                >
                  {sNum}
                </span>

                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">B{sNum}</span>
                )}
              </div>

              {/* Title & Role */}
              <div className="my-1.5">
                <div
                  className={`text-[11px] font-bold line-clamp-2 leading-tight ${
                    isCurrent ? 'text-amber-300' : isDone ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  {def.title}
                </div>
                <div className="text-[9px] font-medium text-slate-400 truncate mt-0.5">
                  {def.role}
                </div>
              </div>

              {/* Branching indicator on Step 4/5 */}
              {sNum === 4 && (
                <div className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.5 border border-amber-500/40 font-mono truncate text-center">
                  ⮑ Phân nhánh Đủ/Thiếu
                </div>
              )}
              {sNum === 5 && (
                <div className="text-[9px] bg-pink-500/20 text-pink-300 px-1 py-0.5 border border-pink-500/40 font-mono truncate text-center">
                  🚚 Điều động / 🛒 Mua
                </div>
              )}
              {sNum === 6 && (
                <div className="text-[9px] bg-purple-500/20 text-purple-300 px-1 py-0.5 border border-purple-500/40 font-mono truncate text-center">
                  🔒 Cổng nhận đủ 100%
                </div>
              )}
              {sNum === 9 && (
                <div className="text-[9px] bg-blue-500/20 text-blue-300 px-1 py-0.5 border border-blue-500/40 font-mono truncate text-center">
                  ★ Nghiệm thu hoàn thành
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Decision Branch Legend (Sub-ribbon showing the Step 4 -> 5 logic) */}
      <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-white text-[11px]">Quy tắc Phân nhánh Tài nguyên (Bước 4 → 5):</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 bg-blue-950/70 border border-blue-700/60 px-2 py-0.5">
            <Truck className="w-3 h-3 text-blue-400" />
            <span>
              <strong>Nhánh 1 (ĐỦ TÀI NGUYÊN):</strong> Tạo lệnh điều động nội bộ 9 bước (TR-xxxx)
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-rose-950/70 border border-rose-700/60 px-2 py-0.5">
            <ShoppingCart className="w-3 h-3 text-rose-400" />
            <span>
              <strong>Nhánh 2 (THIẾU TÀI NGUYÊN):</strong> Phát hành yêu cầu mua bổ sung (PO-xxxx)
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-950/70 border border-amber-700/60 px-2 py-0.5">
            <span className="text-amber-400 font-bold">⇄</span>
            <span>
              <strong>Nhánh Kết Hợp:</strong> Điều động phần có sẵn + Mua phần thiếu
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

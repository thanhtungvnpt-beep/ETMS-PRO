import React from 'react';
import {
  FilePlus,
  Users,
  ClipboardList,
  Truck,
  FileCheck2,
  PackageCheck,
  BookOpenCheck,
  Printer,
  QrCode,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface WorkflowBannerProps {
  activeStep?: number;
  onSelectStep?: (step: number) => void;
}

export const WORKFLOW_STEPS = [
  {
    step: 1,
    role: 'Planner',
    title: 'Tạo lệnh điều động',
    description: 'Planner tạo lệnh điều động thiết bị từ nhà máy A sang nhà máy B',
    icon: FilePlus,
    badgeBg: 'bg-sky-500 text-white',
    cardBg: 'bg-[#e0f2fe]/90 border-sky-200 text-slate-800',
    roleColor: 'text-sky-700 font-bold',
  },
  {
    step: 2,
    role: 'Nhà máy A, B',
    title: 'Xác nhận lệnh',
    description: 'Đại diện nhà máy A và B xác nhận lệnh điều động',
    icon: Users,
    badgeBg: 'bg-emerald-600 text-white',
    cardBg: 'bg-[#dcfce7]/90 border-emerald-200 text-slate-800',
    roleColor: 'text-emerald-700 font-bold',
  },
  {
    step: 3,
    role: 'Nhà máy A',
    title: 'Đăng ký tài sản chuyển đi',
    description: 'Nhà máy A đăng ký danh sách tài sản sẽ chuyển sang nhà máy B',
    icon: ClipboardList,
    badgeBg: 'bg-amber-500 text-white',
    cardBg: 'bg-[#fef3c7]/90 border-amber-200 text-slate-800',
    roleColor: 'text-amber-800 font-bold',
  },
  {
    step: 4,
    role: 'Nhà máy A',
    title: 'Chuyển thiết bị',
    description: 'Nhà máy A thực hiện chuyển sang nhà máy B',
    icon: Truck,
    badgeBg: 'bg-orange-500 text-white',
    cardBg: 'bg-[#ffedd5]/90 border-orange-200 text-slate-800',
    roleColor: 'text-orange-800 font-bold',
  },
  {
    step: 5,
    role: 'Nhà máy A',
    title: 'Tải biên bản giao nhận',
    description: 'Nhà máy A tải lên biên bản giao nhận và chứng từ liên quan',
    icon: FileCheck2,
    badgeBg: 'bg-amber-600 text-white',
    cardBg: 'bg-[#fef9c3]/90 border-amber-300 text-slate-800',
    roleColor: 'text-amber-800 font-bold',
  },
  {
    step: 6,
    role: 'Nhà máy B',
    title: 'Xác nhận nhận máy',
    description: 'Nhà máy B xác nhận nhận đúng thiết bị (đối chiếu mã, số lượng, tình trạng)',
    icon: PackageCheck,
    badgeBg: 'bg-emerald-600 text-white',
    cardBg: 'bg-[#dcfce7]/90 border-emerald-200 text-slate-800',
    roleColor: 'text-emerald-700 font-bold',
  },
  {
    step: 7,
    role: 'Planner',
    title: 'Chuyển sổ sách tài sản',
    description: 'Planner xác nhận transfer sổ sách từ A sang B',
    icon: BookOpenCheck,
    badgeBg: 'bg-blue-700 text-white',
    cardBg: 'bg-[#e0f2fe]/90 border-blue-200 text-slate-800',
    roleColor: 'text-blue-800 font-bold',
  },
  {
    step: 8,
    role: 'Planner',
    title: 'In tem tài sản mới',
    description: 'Planner in tem tài sản mới phát cho nhà máy B',
    icon: Printer,
    badgeBg: 'bg-sky-600 text-white',
    cardBg: 'bg-[#e0f2fe]/90 border-sky-200 text-slate-800',
    roleColor: 'text-sky-800 font-bold',
  },
  {
    step: 9,
    role: 'Nhà máy B',
    title: 'Xác nhận dán tem',
    description: 'Nhà máy B xác nhận nhận được tem và đã dán',
    icon: QrCode,
    badgeBg: 'bg-emerald-600 text-white',
    cardBg: 'bg-[#dcfce7]/90 border-emerald-200 text-slate-800',
    roleColor: 'text-emerald-700 font-bold',
  },
];

export const WorkflowBanner: React.FC<WorkflowBannerProps> = ({
  activeStep,
  onSelectStep,
}) => {
  return (
    <div className="bg-[#103050] text-white pt-3 pb-4 px-3 sm:px-4 border-b border-[#0b2038] shadow-inner">
      <div className="text-center mb-3">
        <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white flex items-center justify-center gap-2">
          <span>QUY TRÌNH ĐIỀU ĐỘNG THIẾT BỊ GIỮA CÁC NHÀ MÁY</span>
        </h1>
      </div>

      {/* 9 Steps Scrollable / Flex Strip */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-stretch gap-2 min-w-[1240px] xl:min-w-0 xl:grid xl:grid-cols-9">
          {WORKFLOW_STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isCurrent = activeStep === s.step;
            const isDone = activeStep ? s.step < activeStep : false;

            return (
              <div key={s.step} className="relative flex-1 flex flex-col">
                <button
                  type="button"
                  onClick={() => onSelectStep?.(s.step)}
                  className={`w-full text-left h-full flex flex-col justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                    s.cardBg
                  } ${
                    isCurrent
                      ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-[#103050] shadow-md scale-[1.02]'
                      : 'hover:brightness-95 hover:shadow-sm'
                  }`}
                >
                  <div>
                    {/* Header: Step Number & Role */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shadow-xs ${s.badgeBg}`}
                        >
                          {s.step}
                        </span>
                        <span className={`text-[11px] uppercase tracking-tight ${s.roleColor}`}>
                          {s.role}
                        </span>
                      </div>
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>

                    {/* Icon illustration area */}
                    <div className="flex justify-center my-1">
                      <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow-xs text-slate-800">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-[12px] leading-tight text-slate-900 text-center mb-1 line-clamp-1">
                      {s.title}
                    </h3>
                  </div>

                  {/* Subtitle description */}
                  <p className="text-[10px] leading-snug text-slate-700 text-center line-clamp-3 mt-1">
                    {s.description}
                  </p>
                </button>

                {/* Arrow connector between steps */}
                {idx < WORKFLOW_STEPS.length - 1 && (
                  <div className="hidden xl:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-white/50 pointer-events-none">
                    <ArrowRight className="w-3 h-3 text-slate-300 drop-shadow-sm" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

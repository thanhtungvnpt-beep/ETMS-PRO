// OOS NEW MODEL PRO — Setup & Commissioning View
// Giai đoạn 9: Setup Line & Chạy thử
// Lắp đặt máy móc, Đồ gá JIG, Kết nối IT/Điện khí, Chạy thử mẫu & Bàn giao sản xuất

import React, { useState } from 'react';
import {
  NewModelProjectPro,
  ProjectLinePro,
} from '../../types/newModelPro';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  FileCheck,
  Cpu,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface NewModelSetupViewProps {
  project: NewModelProjectPro;
  currentUser: { name: string; role: string };
}

export const NewModelSetupView: React.FC<NewModelSetupViewProps> = ({
  project,
  currentUser,
}) => {
  const [selectedLineId, setSelectedLineId] = useState<string>('LINE-ON1-B1-DAAL-L1');

  // Extract all lines
  const lines: ProjectLinePro[] = [];
  project.factoriesScope.forEach((f) => {
    f.blocks.forEach((b) => {
      b.lines.forEach((l) => lines.push(l));
    });
  });

  const activeLine = lines.find((l) => l.id === selectedLineId) || lines[0];

  const setupChecklist = [
    {
      id: 'CHK-01',
      task: 'Lắp đặt vật lý máy gia công CNC & cân bằng bàn máy',
      role: 'Kỹ thuật viên EQM',
      status: 'HOÀN THÀNH',
      date: '2026-11-08',
    },
    {
      id: 'CHK-02',
      task: 'Gá đặt đồ gá JIG-A01 & kiểm tra độ song song, vuông góc',
      role: 'Leader Thiết bị',
      status: 'HOÀN THÀNH',
      date: '2026-11-09',
    },
    {
      id: 'CHK-03',
      task: 'Hiệu chuẩn đồ gá kiểm CMM JIG-A02',
      role: 'Vendor DAAL & EQM',
      status: 'ĐANG_XỬ_LÝ',
      date: 'Hạn: 14/11',
      note: 'Chờ mài lại chốt định vị chuẩn 0.05mm',
    },
    {
      id: 'CHK-04',
      task: 'Đấu nối hệ thống khí nén 6 bar & điện 3 pha 380V',
      role: 'Đội Hạ tầng Facility',
      status: 'HOÀN THÀNH',
      date: '2026-11-07',
    },
    {
      id: 'CHK-05',
      task: 'Tải chương trình gia công CAM & chạy thử không tải (Dry Run)',
      role: 'Kỹ sư CNC CAM',
      status: 'CHƯA_THỰC_HIỆN',
      date: 'Kế hoạch W47',
    },
    {
      id: 'CHK-06',
      task: 'Gia công thử nghiệm 50 phôi Golden Sample (Trial Run)',
      role: 'EQM & QC Team',
      status: 'CHƯA_THỰC_HIỆN',
      date: 'Kế hoạch W47',
    },
    {
      id: 'CHK-07',
      task: 'Nghiệm thu toàn diện & Xác nhận Line sẵn sàng sản xuất',
      role: 'Planner & Manager',
      status: 'CHƯA_THỰC_HIỆN',
      date: 'Kế hoạch W47',
    },
  ];

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 text-xs">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#082D55]">
              Quá Trình Setup Line & Chạy Thử Nghiệm Thu (Setup & Trial Run)
            </h2>
            <p className="text-[11px] text-slate-500">
              Kiểm tra 7 hạng mục bắt buộc trước khi xác nhận Line sẵn sàng đưa vào sản xuất
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Người phụ trách EQM:</span>
          <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-bold">
            {currentUser.name}
          </span>
        </div>
      </div>

      {/* Line Selector & Summary Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="font-bold text-slate-700">Chọn Line theo dõi Setup:</label>
          <select
            value={selectedLineId}
            onChange={(e) => setSelectedLineId(e.target.value)}
            className="px-3 py-1.5 border border-amber-300 rounded-lg text-xs font-bold bg-amber-50/50 text-[#082D55]"
          >
            {lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.code} ({l.vendor} - {l.blockName})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-slate-600 font-semibold">
          <span>
            Tiến độ Setup: <strong className="text-amber-600">{activeLine?.setupStage.actualProgressPct}%</strong>
          </span>
          <span>
            Trạng thái:{' '}
            <strong className="text-slate-800">{activeLine?.setupStage.status}</strong>
          </span>
        </div>
      </div>

      {/* Checklist Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Mã mục</th>
                <th className="py-2.5 px-3">Hạng mục kiểm tra & lắp đặt</th>
                <th className="py-2.5 px-3">Người phụ trách</th>
                <th className="py-2.5 px-3">Thời hạn / Ngày thực hiện</th>
                <th className="py-2.5 px-3">Trạng thái nghiệm thu</th>
                <th className="py-2.5 px-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {setupChecklist.map((chk) => (
                <tr key={chk.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-500">{chk.id}</td>
                  <td className="py-3 px-3 font-bold text-[#082D55]">{chk.task}</td>
                  <td className="py-3 px-3 text-slate-700">{chk.role}</td>
                  <td className="py-3 px-3 text-slate-600">{chk.date}</td>
                  <td className="py-3 px-3">
                    {chk.status === 'HOÀN THÀNH' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Đã nghiệm thu
                      </span>
                    )}
                    {chk.status === 'ĐANG_XỬ_LÝ' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Đang thực hiện
                      </span>
                    )}
                    {chk.status === 'CHƯA_THỰC_HIỆN' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Chờ tiến độ
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-[11px]">{chk.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

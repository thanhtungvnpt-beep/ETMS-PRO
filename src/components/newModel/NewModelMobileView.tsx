// OOS NEW MODEL PRO — Mobile Field Interface
// Giao diện điện thoại di động tối ưu cho Kỹ thuật viên & Quản lý hiện trường
// Thao tác nhanh: Chọn Line → Chọn Thiết bị → Nút OK/Pending to rõ → Chụp ảnh sự cố

import React, { useState } from 'react';
import {
  NewModelProjectPro,
  EquipmentItemPro,
  ItemInspectionStatus,
} from '../../types/newModelPro';
import {
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Layers,
  Building2,
  User,
  ArrowRight,
  Clock,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface NewModelMobileViewProps {
  project: NewModelProjectPro;
  currentUser: { name: string; role: string };
  onOpenItemInspection: (item: EquipmentItemPro, lineCode: string) => void;
}

export const NewModelMobileView: React.FC<NewModelMobileViewProps> = ({
  project,
  currentUser,
  onOpenItemInspection,
}) => {
  const [selectedFactory, setSelectedFactory] = useState<string>('SEV');
  const [selectedLineId, setSelectedLineId] = useState<string>('LINE-ON1-B1-DAAL-L1');

  // Find active line
  const activeLine = React.useMemo(() => {
    for (const f of project.factoriesScope) {
      for (const b of f.blocks) {
        const found = b.lines.find((l) => l.id === selectedLineId);
        if (found) return found;
      }
    }
    return project.factoriesScope[0]?.blocks[0]?.lines[0] || null;
  }, [project, selectedLineId]);

  return (
    <div className="max-w-md mx-auto bg-slate-100 rounded-3xl p-3 shadow-2xl border-4 border-slate-700 space-y-3 font-sans text-xs">
      {/* Mobile Status Bar */}
      <div className="flex items-center justify-between px-3 pt-1 text-[11px] font-bold text-slate-700">
        <span>09:41</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>OOS Mobile Pro</span>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-[#082D55] text-white p-3.5 rounded-2xl shadow-md space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
            OOS NEW MODEL • FIELD CHECK
          </span>
          <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded font-bold">
            {project.projectCode}
          </span>
        </div>
        <div className="font-extrabold text-sm leading-tight">
          Kiểm Tra Kỹ Thuật Thiết Bị Hiện Trường
        </div>
        <div className="flex items-center gap-2 text-[11px] text-blue-200">
          <User className="w-3.5 h-3.5 text-cyan-300" />
          <span>{currentUser.name} (EQM Tech)</span>
        </div>
      </div>

      {/* Line Switcher */}
      <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-200 space-y-2">
        <label className="block text-[11px] font-bold text-slate-700">
          Chọn Production Line đang kiểm tra:
        </label>
        <select
          value={selectedLineId}
          onChange={(e) => setSelectedLineId(e.target.value)}
          className="w-full px-3 py-2 border border-blue-400 rounded-lg text-xs font-bold text-[#082D55] bg-blue-50/60"
        >
          <option value="LINE-ON1-B1-DAAL-L1">CNC ON1 B1 DAAL L1 (DAAL)</option>
          <option value="LINE-ON1-B1-DAAL-L2">CNC ON1 B1 DAAL L2 (DAAL)</option>
          <option value="LINE-ON1-B1-KHV-L1">CNC ON1 B1 KHV L1 (KHV)</option>
          <option value="LINE-ON1-B2-HSTEC-L1">CNC ON1 B2 HSTEC L1 (HSTEC)</option>
          <option value="LINE-ON1-B2-KTECH-L1">CNC ON1 B2 KTECH L1 (KTECH)</option>
        </select>

        {activeLine && (
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
            <span className="text-slate-500">
              Tiến độ: <strong className="text-blue-700">{activeLine.overallProgressPct}%</strong>
            </span>
            <span className="font-bold text-emerald-600">✔ {activeLine.status}</span>
          </div>
        )}
      </div>

      {/* Equipment List for Quick Inspection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-bold text-slate-700 text-xs">
            Danh sách thiết bị ({activeLine?.equipmentItems.length || 0})
          </span>
          <span className="text-[10px] text-slate-400">Chạm để kiểm tra OK/Pending</span>
        </div>

        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {activeLine?.equipmentItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenItemInspection(item, activeLine.code)}
              className="bg-white p-3 rounded-xl shadow-xs border border-slate-200 space-y-2 cursor-pointer active:scale-[0.99] transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-black text-blue-700">{item.code}</span>
                  <div className="font-bold text-slate-800 leading-tight">{item.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {item.category} • Định mức: {item.standardQty} {item.unit}
                  </div>
                </div>

                {item.status === 'OK' ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                    ✔ OK
                  </span>
                ) : item.status === 'Pending' ? (
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black">
                    ⚠ Pending
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                    Chưa kiểm
                  </span>
                )}
              </div>

              {item.pendingReason && (
                <div className="bg-rose-50 p-2 rounded-md text-[10px] text-rose-700 font-medium">
                  <strong>Lỗi:</strong> {item.pendingReason}
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                <span>Người KT: {item.checkedBy || 'Chưa'}</span>
                <span className="text-blue-600 font-bold flex items-center gap-1">
                  Cập nhật <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

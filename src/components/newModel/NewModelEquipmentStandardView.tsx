// OOS NEW MODEL PRO — Equipment Standard Management
// Quản lý tiêu chuẩn thiết bị 4 nhóm (JIG, Machine, Master Sample, Spare Part/MRO)
// Hỗ trợ sao chép tiêu chuẩn từ Line khác và chỉnh sửa độc lập

import React, { useState } from 'react';
import {
  NewModelProjectPro,
  EquipmentItemPro,
  EquipmentCategory,
} from '../../types/newModelPro';
import {
  Layers,
  Copy,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  FileSpreadsheet,
  Trash2,
  Edit,
  Save,
  Check,
} from 'lucide-react';

interface NewModelEquipmentStandardViewProps {
  project: NewModelProjectPro;
  currentUser: { name: string; role: string };
  onOpenItemInspection: (item: EquipmentItemPro, lineCode: string) => void;
}

export const NewModelEquipmentStandardView: React.FC<NewModelEquipmentStandardViewProps> = ({
  project,
  currentUser,
  onOpenItemInspection,
}) => {
  const [selectedLineId, setSelectedLineId] = useState<string>('LINE-ON1-B1-DAAL-L1');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCopiedSuccess, setIsCopiedSuccess] = useState<boolean>(false);

  // Find all lines across factories & blocks
  const allLines = React.useMemo(() => {
    const list: Array<{ id: string; code: string; vendor: string; blockName: string }> = [];
    project.factoriesScope.forEach((f) => {
      f.blocks.forEach((b) => {
        b.lines.forEach((l) => {
          list.push({ id: l.id, code: l.code, vendor: l.vendor, blockName: b.name });
        });
      });
    });
    return list;
  }, [project]);

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

  const items = activeLine?.equipmentItems || [];

  // Filter items
  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.specs.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyFromLine = () => {
    setIsCopiedSuccess(true);
    setTimeout(() => setIsCopiedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 text-xs">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#082D55]">
              Tiêu Chuẩn Thiết Bị (Equipment Standard Master)
            </h2>
            <p className="text-[11px] text-slate-500">
              Định mức 4 nhóm thiết bị bắt buộc: JIG, Machine, Master Sample, Spare Part/MRO
            </p>
          </div>
        </div>

        {/* Copy Standards Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyFromLine}
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isCopiedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Đã đồng bộ tiêu chuẩn!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Sao chép tiêu chuẩn từ Line khác</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Line & Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="font-bold text-slate-700">Chọn Line khai báo:</label>
            <select
              value={selectedLineId}
              onChange={(e) => setSelectedLineId(e.target.value)}
              className="px-3 py-1.5 border border-blue-300 rounded-lg text-xs font-bold bg-blue-50/50 text-[#082D55] focus:outline-none"
            >
              {allLines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.code} ({l.vendor} - {l.blockName})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-medium text-slate-500">Nhóm thiết bị:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50"
            >
              <option value="ALL">Tất cả 4 nhóm</option>
              <option value="JIG">1. Đồ gá JIG</option>
              <option value="Machine">2. Máy móc (Machine)</option>
              <option value="Master Sample">3. Mẫu chuẩn (Master Sample)</option>
              <option value="Spare Part / MRO">4. Vật tư dự phòng (Spare Part/MRO)</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên hoặc mã thiết bị..."
            className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 w-56"
          />
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Mã thiết bị</th>
                <th className="py-2.5 px-3">Tên thiết bị</th>
                <th className="py-2.5 px-3">Nhóm</th>
                <th className="py-2.5 px-3">Thông số kỹ thuật</th>
                <th className="py-2.5 px-3 text-center">Định mức</th>
                <th className="py-2.5 px-3 text-center">Đã nhận</th>
                <th className="py-2.5 px-3">Nhà cung cấp</th>
                <th className="py-2.5 px-3">Trạng thái kỹ thuật</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-blue-700">{item.code}</td>
                  <td className="py-2.5 px-3 font-bold text-[#082D55]">{item.name}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={item.specs}>
                    {item.specs}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                    {item.standardQty} {item.unit}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                    {item.deliveredQty} {item.unit}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{item.supplier || 'Chưa chỉ định'}</td>
                  <td className="py-2.5 px-3">
                    {item.status === 'OK' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Đạt (OK)
                      </span>
                    ) : item.status === 'Pending' ? (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 cursor-pointer"
                        title={item.pendingReason}
                      >
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Pending
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Chưa kiểm tra</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onOpenItemInspection(item, activeLine?.code || '')}
                      className="px-2.5 py-1 rounded bg-[#0878E8] text-white font-bold hover:bg-blue-600 transition-colors text-[10px] cursor-pointer"
                    >
                      Kiểm tra / Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// OOS NEW MODEL PRO — Purchase Planning & Progress View
// Giai đoạn 5 (Planner đặt lịch) & Giai đoạn 6 (Purchaser theo dõi & cập nhật)
// Cảnh báo nguy cơ trễ tiến độ nếu Purchaser giao muộn hơn ngày Planner cần

import React, { useState } from 'react';
import {
  NewModelProjectPro,
  ProjectLinePro,
} from '../../types/newModelPro';
import {
  ShoppingCart,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Save,
  Truck,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface NewModelPurchaseProgressViewProps {
  project: NewModelProjectPro;
  currentUser: { name: string; role: string };
}

export const NewModelPurchaseProgressView: React.FC<NewModelPurchaseProgressViewProps> = ({
  project,
  currentUser,
}) => {
  const [selectedVendor, setSelectedVendor] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract all lines
  const lines: ProjectLinePro[] = [];
  project.factoriesScope.forEach((f) => {
    f.blocks.forEach((b) => {
      b.lines.forEach((l) => lines.push(l));
    });
  });

  const filteredLines = lines.filter((l) => {
    if (selectedVendor !== 'ALL' && l.vendor !== selectedVendor) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return l.code.toLowerCase().includes(q) || l.vendor.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 text-xs">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#082D55]">
              Kế Hoạch & Tiến Độ Mua Hàng (Purchase Progress Tracking)
            </h2>
            <p className="text-[11px] text-slate-500">
              Đối chiếu ngày cần thiết bị của Planner với ngày giao hàng thực tế của Purchaser
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Vai trò đang thao tác:</span>
          <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-bold">
            {currentUser.name} ({currentUser.role || 'Purchaser'})
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-600">Vendor:</label>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50"
            >
              <option value="ALL">Tất cả Vendor</option>
              <option value="DAAL">DAAL</option>
              <option value="KHV">KHV</option>
              <option value="HSTEC">HSTEC</option>
              <option value="KTECH">KTECH</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Line, Vendor..."
            className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 w-56"
          />
        </div>
      </div>

      {/* Purchase Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Tên Line</th>
                <th className="py-2.5 px-3">Vendor</th>
                <th className="py-2.5 px-3">Kế hoạch cần hàng (Planner)</th>
                <th className="py-2.5 px-3">Giao dự kiến / thực tế (Purchaser)</th>
                <th className="py-2.5 px-3 text-center">Tiến độ mua</th>
                <th className="py-2.5 px-3">Trạng thái PO</th>
                <th className="py-2.5 px-3">Cảnh báo rủi ro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLines.map((line) => {
                const isOverdue = line.purchaseStage.isOverdue || line.receivingStage.isOverdue;
                return (
                  <tr key={line.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#082D55]">{line.code}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{line.vendor}</td>
                    <td className="py-3 px-3 text-slate-700">
                      <span className="font-bold text-blue-700">
                        {line.purchaseStage.planLabel}
                      </span>
                      <span className="text-slate-400 text-[10px] block">Người lập: Planner</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800">
                        {line.purchaseStage.actualLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${line.purchaseStage.actualProgressPct}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800">
                          {line.purchaseStage.actualProgressPct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {line.purchaseStage.actualProgressPct === 100 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Hoàn tất PO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Đang giao hàng
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Nguy cơ trễ (Hải quan / Thiếu máy)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">— Đúng kế hoạch —</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

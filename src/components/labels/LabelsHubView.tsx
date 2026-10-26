import React, { useState } from 'react';
import { TransferOrder, UserProfile } from '../../types';
import { QrCode, Printer, CheckCircle2, Search, Filter } from 'lucide-react';

interface LabelsHubViewProps {
  orders: TransferOrder[];
  currentUser: UserProfile;
  onOpenQRPrintModal: (order: TransferOrder) => void;
}

export const LabelsHubView: React.FC<LabelsHubViewProps> = ({ orders, currentUser, onOpenQRPrintModal }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Collect all QR label items from all orders
  const allLabels = orders.flatMap((o) =>
    o.qrPrinting.items.map((it) => ({
      ...it,
      orderId: o.id,
      fromFactory: o.fromFactory,
      toFactory: o.toFactory,
      order: o,
      isApplied: o.stickerConfirmation.items.some((sc) => sc.assetCode === it.newAssetCode && sc.status === 'Đã dán'),
    }))
  );

  const filtered = allLabels.filter((l) => {
    if (filterStatus === 'PRINTED') return l.printed;
    if (filterStatus === 'NOT_PRINTED') return !l.printed;
    if (filterStatus === 'APPLIED') return l.isApplied;
    return true;
  });

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 space-y-4 text-xs">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Quản lý & Phát hành Tem QR Tài Sản (Bước 8 & 9)</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Quy chuẩn tem định danh thiết bị sau khi chuyển quyền quản lý sang nhà máy mới.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 focus:bg-white"
          >
            <option value="ALL">Tất cả tem ({allLabels.length})</option>
            <option value="PRINTED">Đã in</option>
            <option value="NOT_PRINTED">Chưa in</option>
            <option value="APPLIED">Đã dán thực tế</option>
          </select>
        </div>
      </div>

      {/* Table of all QR labels */}
      <div className="border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
            <tr>
              <th className="py-2.5 px-3">Mã tem mới</th>
              <th className="py-2.5 px-3">Tên thiết bị</th>
              <th className="py-2.5 px-3">Mã cũ</th>
              <th className="py-2.5 px-3">Mã lệnh</th>
              <th className="py-2.5 px-3">Đơn vị quản lý mới</th>
              <th className="py-2.5 px-3">Trạng thái in</th>
              <th className="py-2.5 px-3">Xác nhận dán</th>
              <th className="py-2.5 px-3 text-right">In lại</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {filtered.map((label, idx) => (
              <tr key={`${label.orderId}-${label.newAssetCode}-${idx}`} className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-bold text-blue-700">{label.newAssetCode}</td>
                <td className="py-2.5 px-3 font-sans font-medium text-slate-800">{label.name}</td>
                <td className="py-2.5 px-3 text-slate-500">{label.oldAssetCode}</td>
                <td className="py-2.5 px-3 text-slate-700">{label.orderId}</td>
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">{label.toFactory}</td>
                <td className="py-2.5 px-3">
                  <span
                    className={`font-sans text-[10px] px-2 py-0.5 rounded font-semibold ${
                      label.printed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {label.printed ? 'Đã in' : 'Chưa in'}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`font-sans text-[10px] px-2 py-0.5 rounded font-semibold ${
                      label.isApplied ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {label.isApplied ? '✓ Đã dán' : 'Chờ dán'}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => onOpenQRPrintModal(label.order)}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                    title="In tem"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React from 'react';
import { TransferOrder, MasterAsset } from '../../types';
import { FileBarChart, ArrowRight, Download, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface ReportsViewProps {
  orders: TransferOrder[];
  assets: MasterAsset[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ orders, assets }) => {
  const completedOrders = orders.filter((o) => o.status === 'STICKER_CONFIRMED');
  const discrepancyOrders = orders.filter((o) => o.receiptVerification?.hasDiscrepancy);

  // Group by routes
  const routeStats: Record<string, number> = {};
  for (const o of orders) {
    const key = `${o.fromFactory} → ${o.toFactory}`;
    routeStats[key] = (routeStats[key] || 0) + 1;
  }

  return (
    <div className="space-y-4 text-xs">
      {/* Top Banner */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileBarChart className="w-4 h-4 text-blue-600" />
            <span>Báo Cáo & Thống Kê Hoạt Động Điều Động Thiết Bị</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Dữ liệu thống kê chuẩn hóa từ hệ thống giao nhận thực tế giữa các nhà máy thành viên.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-medium block uppercase">Tổng thiết bị lưu chuyển</span>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {orders.reduce((acc, o) => acc + (o.registeredItems.length || o.plannedItems.length), 0)} máy
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Bao gồm 3 nhà máy</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-medium block uppercase">Tỷ lệ hoàn tất thành công</span>
          <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">
            {Math.round((completedOrders.length / (orders.length || 1)) * 100)}%
          </div>
          <span className="text-[10px] text-slate-400">10/12 lệnh hoàn tất</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-medium block uppercase">Thời gian xử lý trung bình</span>
          <div className="text-xl font-bold text-blue-700 mt-1 tabular-nums">4.8 ngày</div>
          <span className="text-[10px] text-slate-400">Từ bước 1 đến bước 9</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-medium block uppercase">Tỷ lệ sai lệch phát hiện</span>
          <div className="text-xl font-bold text-amber-600 mt-1 tabular-nums">
            {Math.round((discrepancyOrders.length / (orders.length || 1)) * 100)}%
          </div>
          <span className="text-[10px] text-slate-400">Đã kiểm soát & xử lý</span>
        </div>
      </div>

      {/* Transfer Routes Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-xs mb-3">Lưu lượng điều động theo tuyến nhà máy</h3>
          <div className="space-y-2.5">
            {Object.entries(routeStats).map(([route, count]) => {
              const pct = Math.round((count / orders.length) * 100);
              return (
                <div key={route}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-800">{route}</span>
                    <span className="font-mono text-slate-600 tabular-nums">
                      {count} lệnh ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <h3 className="font-bold text-slate-900 text-xs mb-3">Hồ sơ xử lý sai lệch & sự cố</h3>
          <div className="space-y-2">
            {discrepancyOrders.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Không có sai lệch nào</p>
            ) : (
              discrepancyOrders.map((ord) => (
                <div key={ord.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-blue-700">{ord.id}</span>
                    <span className="text-rose-600 font-semibold">
                      {ord.receiptVerification.discrepancyRecord?.type || 'Sai lệch'}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    {ord.receiptVerification.discrepancyRecord?.description || ord.receiptVerification.note}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

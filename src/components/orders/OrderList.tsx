import React, { useState } from 'react';
import { TransferOrder, UserProfile } from '../../types';
import {
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Printer,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface OrderListProps {
  orders: TransferOrder[];
  currentUser: UserProfile;
  onSelectOrder: (order: TransferOrder) => void;
  onOpenOrderDetail: (order: TransferOrder) => void;
  onOpenEditModal: (order: TransferOrder) => void;
  onOpenCancelModal: (order: TransferOrder) => void;
  onOpenQRPrintModal: (order: TransferOrder) => void;
  onCreateNewClick: () => void;
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  currentUser,
  onSelectOrder,
  onOpenOrderDetail,
  onOpenEditModal,
  onOpenCancelModal,
  onOpenQRPrintModal,
  onCreateNewClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [factoryFilter, setFactoryFilter] = useState<string>('ALL');

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    // Search
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.fromFactory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.toFactory.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'IN_PROGRESS') {
      matchesStatus = o.status !== 'STICKER_CONFIRMED' && o.status !== 'CANCELLED';
    } else if (statusFilter === 'CONFIRMATION') {
      matchesStatus = !o.confirmations.factoryA.confirmed || !o.confirmations.factoryB.confirmed;
    } else if (statusFilter === 'BOOK') {
      matchesStatus = o.receiptVerification?.items.length > 0 && !o.receiptVerification.hasDiscrepancy && !o.bookTransfer?.completed;
    } else if (statusFilter === 'STICKER') {
      matchesStatus = o.qrPrinting?.completed && !o.stickerConfirmation?.completed;
    } else if (statusFilter === 'OVERDUE') {
      matchesStatus = o.isOverdue;
    } else if (statusFilter === 'COMPLETED') {
      matchesStatus = o.status === 'STICKER_CONFIRMED';
    } else if (statusFilter === 'CANCELLED') {
      matchesStatus = o.status === 'CANCELLED';
    }

    // Factory filter
    let matchesFactory = true;
    if (factoryFilter !== 'ALL') {
      matchesFactory = o.fromFactory === factoryFilter || o.toFactory === factoryFilter;
    }

    return matchesSearch && matchesStatus && matchesFactory;
  });

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã lệnh, nhà máy, lý do..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={factoryFilter}
            onChange={(e) => setFactoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 focus:bg-white"
          >
            <option value="ALL">Tất cả nhà máy</option>
            <option value="Nhà máy A">Nhà máy A</option>
            <option value="Nhà máy B">Nhà máy B</option>
            <option value="Nhà máy C">Nhà máy C</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onCreateNewClick}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo lệnh điều động mới</span>
        </button>
      </div>

      {/* Segmented Status Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-200">
        {[
          { id: 'ALL', label: 'Tất cả lệnh' },
          { id: 'IN_PROGRESS', label: 'Đang xử lý' },
          { id: 'CONFIRMATION', label: 'Chờ xác nhận' },
          { id: 'BOOK', label: 'Chờ chuyển sổ' },
          { id: 'STICKER', label: 'Chờ dán tem' },
          { id: 'OVERDUE', label: 'Quá hạn' },
          { id: 'COMPLETED', label: 'Hoàn tất' },
          { id: 'CANCELLED', label: 'Đã hủy' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap cursor-pointer transition-colors ${
              statusFilter === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
            <tr>
              <th className="py-2.5 px-3">Mã lệnh</th>
              <th className="py-2.5 px-3">Tuyến điều động</th>
              <th className="py-2.5 px-3">Lý do điều động</th>
              <th className="py-2.5 px-3">Ngày tạo / Hạn</th>
              <th className="py-2.5 px-3">Tiến độ quy trình</th>
              <th className="py-2.5 px-3">Trạng thái</th>
              <th className="py-2.5 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-slate-600">Không tìm thấy lệnh nào phù hợp với bộ lọc</p>
                  <p className="text-[11px] text-slate-400 mt-1">Hãy thử thay đổi điều kiện tìm kiếm hoặc tạo lệnh mới.</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => {
                const isCompleted = ord.status === 'STICKER_CONFIRMED';
                return (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      <button
                        type="button"
                        onClick={() => onOpenOrderDetail(ord)}
                        className="hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{ord.id}</span>
                        <span className="text-[10px] text-slate-400 font-normal">v{ord.version}</span>
                      </button>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <span>{ord.fromFactory}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span>{ord.toFactory}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={ord.reason}>
                      {ord.reason}
                    </td>

                    <td className="py-2.5 px-3 text-[11px] font-mono text-slate-500">
                      <div>Tạo: {ord.createdDate}</div>
                      <div className={ord.isOverdue ? 'text-rose-600 font-bold' : ''}>Hạn: {ord.expectedDate}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">Bước {ord.currentStep}/9</span>
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${(ord.currentStep / 9) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.isOverdue
                            ? 'bg-rose-100 text-rose-800'
                            : ord.status === 'CANCELLED'
                            ? 'bg-slate-200 text-slate-700'
                            : ord.status === 'WAITING_CONFIRMATION'
                            ? 'bg-sky-100 text-sky-800'
                            : ord.status === 'QR_PRINTED'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isCompleted
                          ? 'Hoàn tất'
                          : ord.isOverdue
                          ? 'Quá hạn'
                          : ord.status === 'CANCELLED'
                          ? 'Đã hủy'
                          : ord.status === 'WAITING_CONFIRMATION'
                          ? 'Chờ xác nhận'
                          : ord.status === 'QR_PRINTED'
                          ? 'Chờ dán tem'
                          : 'Đang xử lý'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenOrderDetail(ord)}
                          className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenEditModal(ord)}
                          className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                          title="Sửa lệnh"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenQRPrintModal(ord)}
                          className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                          title="In tem QR"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenCancelModal(ord)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                          title="Hủy lệnh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

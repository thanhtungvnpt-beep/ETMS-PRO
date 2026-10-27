import React, { useState, useMemo } from 'react';
import { MasterAsset, UserProfile, TransferOrder, StockMovement } from '../../types';
import {
  ArrowRightLeft,
  Truck,
  Bookmark,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  User,
  Shield,
  MapPin,
  ArrowRight,
} from 'lucide-react';

interface InventoryDispatchProps {
  assets: MasterAsset[];
  orders: TransferOrder[];
  currentUser: UserProfile;
  movements: StockMovement[];
  onSelectOrder: (orderId: string) => void;
  onSelectAsset?: (asset: MasterAsset) => void;
  onReleaseReservation?: (assetId: string, orderId: string) => void;
}

export const InventoryDispatch: React.FC<InventoryDispatchProps> = ({
  assets,
  orders,
  currentUser,
  movements,
  onSelectOrder,
  onSelectAsset,
  onReleaseReservation,
}) => {
  const [activeTab, setActiveTab] = useState<'reserved' | 'in_transit' | 'history'>('reserved');
  const [searchTerm, setSearchTerm] = useState('');
  const [plantFilter, setPlantFilter] = useState('ALL');

  // Reserved assets: operationalStatus === 'Đã giữ chỗ' or linked to active transfer
  const reservedAssets = useMemo(() => {
    return assets.filter((a) => {
      const isReserved =
        a.operationalStatus === 'Đã giữ chỗ' ||
        (a.activeTransferId && a.operationalStatus !== 'Đang điều động');
      const matchesSearch =
        searchTerm === '' ||
        a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.activeTransferId && a.activeTransferId.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesPlant = plantFilter === 'ALL' || a.physicalFactory === plantFilter;
      return isReserved && matchesSearch && matchesPlant;
    });
  }, [assets, searchTerm, plantFilter]);

  // Assets currently in transit: operationalStatus === 'Đang điều động' or physicalFactory === 'Đang vận chuyển'
  const inTransitAssets = useMemo(() => {
    return assets.filter((a) => {
      const isInTransit =
        a.operationalStatus === 'Đang điều động' || a.physicalFactory === 'Đang vận chuyển';
      const matchesSearch =
        searchTerm === '' ||
        a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.activeTransferId && a.activeTransferId.toLowerCase().includes(searchTerm.toLowerCase()));
      return isInTransit && matchesSearch;
    });
  }, [assets, searchTerm]);

  // Active transfer orders in dispatch phases (Steps 3, 4, 5)
  const activeDispatchOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        ['DISPATCH_REGISTERED', 'IN_TRANSIT', 'DELIVERY_UPLOADED'].includes(o.status) ||
        (o.currentStep >= 3 && o.currentStep <= 5)
    );
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              TRANG 5
            </span>
            <h1 className="text-xl font-black text-navy-950 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
              Xuất & Điều Chuyển Tài Sản
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý tài sản đã giữ chỗ cho lệnh điều động (Bước 3) và đội xe đang vận chuyển liên nhà máy (Bước 4 - 5)
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('reserved')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              activeTab === 'reserved'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Tài sản đã giữ chỗ ({reservedAssets.length})
          </button>
          <button
            onClick={() => setActiveTab('in_transit')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              activeTab === 'in_transit'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Đang trên đường ({inTransitAssets.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Lệnh xuất đang chạy ({activeDispatchOrders.length})
          </button>
        </div>
      </div>

      {/* Metric summary banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Tài sản đang giữ chỗ (Bước 3)</div>
            <div className="text-xl font-black text-navy-950 mt-0.5">
              {reservedAssets.length} <span className="text-xs font-normal text-slate-500">máy</span>
            </div>
            <div className="text-[11px] text-indigo-700">Khóa không cho đăng ký lệnh khác</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Đang trên xe vận chuyển (Bước 4)</div>
            <div className="text-xl font-black text-navy-950 mt-0.5">
              {inTransitAssets.length} <span className="text-xs font-normal text-slate-500">máy</span>
            </div>
            <div className="text-[11px] text-amber-700">Chờ NM đích kiểm tra biên bản</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Độ chính xác quy trình</div>
            <div className="text-xl font-black text-emerald-700 mt-0.5">100%</div>
            <div className="text-[11px] text-emerald-700">Đồng bộ tự động với 9 Bước Điều Động</div>
          </div>
        </div>
      </div>

      {/* TAB 1: Tài sản đã giữ chỗ */}
      {activeTab === 'reserved' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm theo mã tài sản, tên máy, mã lệnh điều động..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Nhà máy hiện tại:</span>
              <select
                value={plantFilter}
                onChange={(e) => setPlantFilter(e.target.value)}
                className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700"
              >
                <option value="ALL">Tất cả</option>
                <option value="Nhà máy A">Nhà máy A</option>
                <option value="Nhà máy B">Nhà máy B</option>
                <option value="Nhà máy C">Nhà máy C</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Mã & Tên tài sản</th>
                  <th className="py-3 px-3">Serial</th>
                  <th className="py-3 px-3">Vị trí hiện tại</th>
                  <th className="py-3 px-3">Lệnh điều động khoá</th>
                  <th className="py-3 px-3">Nhà máy đích dự kiến</th>
                  <th className="py-3 px-3">Tình trạng</th>
                  <th className="py-3 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reservedAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      Không có tài sản nào đang trong trạng thái giữ chỗ
                    </td>
                  </tr>
                ) : (
                  reservedAssets.map((asset) => {
                    const linkedOrder = orders.find((o) => o.id === asset.activeTransferId);

                    return (
                      <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={asset.image}
                              alt={asset.name}
                              className="w-9 h-9 rounded object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-navy-950">{asset.code}</div>
                              <div className="text-[11px] text-slate-500">{asset.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-slate-600">
                          {asset.serial}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-800">{asset.physicalFactory}</span>
                          <div className="text-[11px] text-slate-500">{asset.physicalLocation}</div>
                        </td>
                        <td className="py-3 px-3">
                          {asset.activeTransferId ? (
                            <button
                              onClick={() => onSelectOrder(asset.activeTransferId!)}
                              className="font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 font-mono text-xs"
                            >
                              {asset.activeTransferId}
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {linkedOrder ? (
                            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {linkedOrder.toFactory}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                            Đã giữ chỗ
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => onSelectOrder(asset.activeTransferId || 'TR-0006')}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-slate-700 font-bold transition-all text-[11px]"
                          >
                            Xem tiến trình lệnh
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Đang trên đường vận chuyển */}
      {activeTab === 'in_transit' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inTransitAssets.length === 0 ? (
              <div className="col-span-2 bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-400 text-xs">
                Hiện tại không có thiết bị nào đang di chuyển trên đường.
              </div>
            ) : (
              inTransitAssets.map((asset) => {
                const linkedOrder = orders.find((o) => o.id === asset.activeTransferId);

                return (
                  <div
                    key={asset.id}
                    className="bg-white p-4 rounded-lg border border-amber-200 shadow-xs relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl">
                      ĐANG VẬN CHUYỂN
                    </div>

                    <div className="flex items-start gap-3">
                      <img
                        src={asset.image}
                        alt={asset.name}
                        className="w-14 h-14 rounded object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-navy-950">{asset.code}</span>
                          <span className="text-xs text-slate-500 font-mono">({asset.serial})</span>
                        </div>
                        <div className="text-xs font-medium text-slate-700 truncate">{asset.name}</div>

                        {/* Origin -> Destination Route */}
                        <div className="flex items-center gap-2 my-2 text-xs font-bold text-navy-900 bg-slate-50 p-2 rounded border border-slate-100">
                          <span>{asset.bookOwnership}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="text-blue-800">
                            {linkedOrder?.toFactory || 'Nhà máy B'}
                          </span>
                        </div>

                        {/* Vehicle details if available */}
                        {linkedOrder?.transitDetails && (
                          <div className="text-[11px] text-slate-600 space-y-1 bg-amber-50/50 p-2 rounded">
                            <div className="flex justify-between">
                              <span>Biển số xe:</span>
                              <strong className="text-navy-950 font-mono">
                                {linkedOrder.transitDetails.licensePlate || '29C-889.92'}
                              </strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Tài xế phụ trách:</span>
                              <strong>{linkedOrder.transitDetails.driverName || 'Nguyễn Văn Cương'}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Số kẹp chì niêm phong:</span>
                              <strong className="font-mono">{linkedOrder.transitDetails.sealNumber || 'SEAL-2025-998'}</strong>
                            </div>
                          </div>
                        )}

                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => onSelectOrder(asset.activeTransferId || 'TR-0006')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Đến bước xác nhận nhận máy (Bước 6)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Danh sách các lệnh xuất đang chạy */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-xs uppercase tracking-wider text-navy-950">
              Tiến độ các lệnh xuất điều chuyển đang mở
            </h3>
          </div>
          <div className="divide-y divide-slate-200 text-xs">
            {activeDispatchOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order.id)}
                className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700 text-sm">{order.id}</span>
                    <span className="font-bold text-slate-800">
                      {order.fromFactory} → {order.toFactory}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      Bước {order.currentStep}/9
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Lý do: {order.reason} • Người lập: {order.plannerName} • Ngày hẹn:{' '}
                    {order.expectedDate}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-600 font-semibold text-xs">
                    {order.registeredItems.length || order.plannedItems.length} thiết bị
                  </span>
                  <button className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded text-xs font-bold transition-all flex items-center gap-1">
                    Xem lệnh
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

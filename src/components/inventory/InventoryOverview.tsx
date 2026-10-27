import React, { useState } from 'react';
import {
  MasterAsset,
  TransferOrder,
  StockMovement,
  InventoryDiscrepancy,
  UserProfile,
  AssetCategory,
} from '../../types';
import { calculateInventoryMetrics } from '../../services/storage';
import {
  Boxes,
  Cpu,
  Building2,
  CheckCircle2,
  ArrowRightLeft,
  Truck,
  PackageCheck,
  BookOpenCheck,
  Wrench,
  AlertTriangle,
  Filter,
  Plus,
  ArrowUpRight,
  History,
  FileSpreadsheet,
  ScanLine,
} from 'lucide-react';

interface InventoryOverviewProps {
  assets: MasterAsset[];
  orders: TransferOrder[];
  movements: StockMovement[];
  discrepancies: InventoryDiscrepancy[];
  currentUser: UserProfile;
  onNavigateTab: (tab: any) => void;
  onSelectAsset?: (asset: MasterAsset) => void;
}

export const InventoryOverview: React.FC<InventoryOverviewProps> = ({
  assets,
  orders,
  movements,
  discrepancies,
  currentUser,
  onNavigateTab,
  onSelectAsset,
}) => {
  const [filterFactory, setFilterFactory] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Compute metrics from real state
  const metrics = calculateInventoryMetrics(assets, orders, discrepancies);

  // Filtered assets for summary table
  const filteredAssets = assets.filter((a) => {
    const matchFactory =
      filterFactory === 'ALL' ||
      a.physicalFactory === filterFactory ||
      a.bookOwnership === filterFactory;
    const matchCategory = filterCategory === 'ALL' || a.category === filterCategory;
    return matchFactory && matchCategory;
  });

  return (
    <div className="space-y-4 text-xs">
      {/* Top Header Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Boxes className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Dashboard Tồn Kho Thiết Bị Liên Nhà Máy
            </h2>
            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-semibold">
              ETMS LIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Giám sát tài sản độc lập theo 3 trục: Quyền sở hữu sổ sách · Vị trí thực tế · Trạng thái vận hành & giữ chỗ.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateTab('inventory-intake')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tiếp nhận tài sản mới</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('inventory-audit')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold flex items-center gap-1.5 border border-slate-300 cursor-pointer text-xs"
          >
            <ScanLine className="w-3.5 h-3.5 text-slate-600" />
            <span>Đợt kiểm kê</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">Bộ lọc nhanh:</span>

          <select
            value={filterFactory}
            onChange={(e) => setFilterFactory(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:bg-white focus:outline-none"
          >
            <option value="ALL">Tất cả nhà máy</option>
            <option value="Nhà máy A">Nhà máy A (Hà Nội)</option>
            <option value="Nhà máy B">Nhà máy B (TP. HCM)</option>
            <option value="Nhà máy C">Nhà máy C (Hải Phòng)</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:bg-white focus:outline-none"
          >
            <option value="ALL">Tất cả nhóm thiết bị</option>
            <option value="Cơ khí chính xác">Cơ khí chính xác</option>
            <option value="Khí nén & Thủy lực">Khí nén & Thủy lực</option>
            <option value="Điện & Tự động hóa">Điện & Tự động hóa</option>
            <option value="Đo lường & Thử nghiệm">Đo lường & Thử nghiệm</option>
            <option value="Phụ trợ xưởng">Phụ trợ xưởng</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Đang hiển thị <strong>{filteredAssets.length}</strong> / <strong>{assets.length}</strong> tài sản
        </div>
      </div>

      {/* 10 KPI CARDS (Bắt buộc theo Mục 3) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* 1. Tổng số tài sản đang quản lý */}
        <div
          onClick={() => onNavigateTab('inventory-catalog')}
          className="bg-[#e0f2fe] p-3 rounded-lg border border-sky-200 cursor-pointer hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center justify-between text-sky-800 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tổng tài sản</span>
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold text-sky-950 tabular-nums">{metrics.totalAssets}</div>
          <div className="text-[10px] text-sky-700 mt-0.5">Toàn bộ 3 nhà máy</div>
        </div>

        {/* 2. Tài sản theo từng nhà máy */}
        <div
          onClick={() => onNavigateTab('inventory-by-factory')}
          className="bg-white p-3 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Theo nhà máy</span>
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold mt-1">
            <span className="text-blue-700" title="Nhà máy A">A: {metrics.byFactory.factoryA}</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700" title="Nhà máy B">B: {metrics.byFactory.factoryB}</span>
            <span className="text-slate-300">|</span>
            <span className="text-purple-700" title="Nhà máy C">C: {metrics.byFactory.factoryC}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Vị trí thực tế</div>
        </div>

        {/* 3. Đang sử dụng */}
        <div className="bg-[#dcfce7] p-3 rounded-lg border border-emerald-200">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Đang sử dụng</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold text-emerald-950 tabular-nums">{metrics.inUse}</div>
          <div className="text-[10px] text-emerald-700 mt-0.5">Vận hành dây chuyền</div>
        </div>

        {/* 4. Sẵn sàng điều chuyển */}
        <div className="bg-[#e0f2fe] p-3 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between text-blue-800 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Sẵn sàng điều chuyển</span>
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold text-blue-950 tabular-nums">{metrics.readyForTransfer}</div>
          <div className="text-[10px] text-blue-700 mt-0.5">Có thể tạo lệnh ngay</div>
        </div>

        {/* 5. Đã giữ chỗ cho lệnh điều động */}
        <div
          onClick={() => onNavigateTab('inventory-dispatch')}
          className="bg-[#ffedd5] p-3 rounded-lg border border-orange-200 cursor-pointer hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center justify-between text-orange-800 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Đã giữ chỗ</span>
            <Boxes className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold text-orange-950 tabular-nums">{metrics.reserved}</div>
          <div className="text-[10px] text-orange-700 mt-0.5">Khóa chống điều trùng</div>
        </div>

        {/* 6. Đang vận chuyển */}
        <div
          onClick={() => onNavigateTab('delivery')}
          className="bg-[#fef9c3] p-3 rounded-lg border border-yellow-200 cursor-pointer hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center justify-between text-yellow-800 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Đang vận chuyển</span>
            <Truck className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold text-yellow-950 tabular-nums">{metrics.inTransit}</div>
          <div className="text-[10px] text-yellow-700 mt-0.5">Đang trên đường bộ</div>
        </div>

        {/* 7. Chờ xác nhận nhận */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-[#e0e7ff] p-3 rounded-lg border border-indigo-200 cursor-pointer hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center justify-between text-indigo-800 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Chờ xác nhận nhận</span>
            <PackageCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold text-indigo-950 tabular-nums">{metrics.waitingReceipt}</div>
          <div className="text-[10px] text-indigo-700 mt-0.5">Đã đến cổng nhà máy</div>
        </div>

        {/* 8. Chờ hoàn tất chuyển sổ sách */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-[#fed7aa] p-3 rounded-lg border border-amber-300 cursor-pointer hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center justify-between text-amber-900 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Chờ chuyển sổ sách</span>
            <BookOpenCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold text-amber-950 tabular-nums">{metrics.waitingBookTransfer}</div>
          <div className="text-[10px] text-amber-800 mt-0.5">Bước 7 cần Planner duyệt</div>
        </div>

        {/* 9. Chờ sửa chữa hoặc đang khóa */}
        <div className="bg-[#fee2e2] p-3 rounded-lg border border-rose-200">
          <div className="flex items-center justify-between text-rose-800 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Sửa chữa / Khóa</span>
            <Wrench className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold text-rose-950 tabular-nums">{metrics.underRepairOrLocked}</div>
          <div className="text-[10px] text-rose-700 mt-0.5">Cần hiệu chuẩn hoặc khóa</div>
        </div>

        {/* 10. Sai lệch kiểm kê */}
        <div
          onClick={() => onNavigateTab('inventory-discrepancies')}
          className="bg-[#fee2e2] p-3 rounded-lg border border-rose-200 cursor-pointer hover:shadow-xs transition-shadow"
        >
          <div className="flex items-center justify-between text-rose-800 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Sai lệch tồn kho</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold text-rose-950 tabular-nums">{metrics.discrepancyCount}</div>
          <div className="text-[10px] text-rose-700 mt-0.5">Cần xác minh & duyệt</div>
        </div>
      </div>

      {/* Grid: Live Inventory Breakdown & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2 cols): Main Inventory Status Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-xs">
                Tài sản trọng điểm & Trạng thái phân tách 3 trục
              </h3>
              <p className="text-[10px] text-slate-400">
                Sở hữu theo sổ sách vs Vị trí thực tế vs Trạng thái vận hành
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('inventory-catalog')}
              className="text-blue-600 hover:underline text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Xem toàn bộ danh mục</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[10px] font-semibold">
                <tr>
                  <th className="py-2 px-2.5">ID / Mã tài sản</th>
                  <th className="py-2 px-2.5">Tên thiết bị & Nhóm</th>
                  <th className="py-2 px-2.5">Số Serial</th>
                  <th className="py-2 px-2.5">Sở hữu sổ sách</th>
                  <th className="py-2 px-2.5">Vị trí thực tế</th>
                  <th className="py-2 px-2.5">Trạng thái vận hành</th>
                  <th className="py-2 px-2.5 text-right">Giá trị nguyên</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {filteredAssets.slice(0, 7).map((asset) => {
                  const isOwnershipMismatch =
                    asset.bookOwnership !== asset.physicalFactory &&
                    asset.physicalFactory !== 'Đang vận chuyển' &&
                    asset.physicalFactory !== 'Khu vực sửa chữa';

                  return (
                    <tr
                      key={asset.id}
                      onClick={() => onSelectAsset?.(asset)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-2 px-2.5">
                        <div className="font-mono font-bold text-blue-700">{asset.code}</div>
                        <div className="text-[9px] text-slate-400 font-mono">{asset.id}</div>
                      </td>

                      <td className="py-2 px-2.5 max-w-[170px]">
                        <div className="font-semibold text-slate-900 truncate" title={asset.name}>
                          {asset.name}
                        </div>
                        <div className="text-[10px] text-slate-500">{asset.category}</div>
                      </td>

                      <td className="py-2 px-2.5 font-mono text-[10px] text-slate-600">
                        {asset.serial}
                      </td>

                      <td className="py-2 px-2.5">
                        <span
                          className={`font-semibold text-[10px] px-1.5 py-0.5 rounded ${
                            asset.bookOwnership === 'Nhà máy A'
                              ? 'bg-blue-50 text-blue-800'
                              : asset.bookOwnership === 'Nhà máy B'
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-purple-50 text-purple-800'
                          }`}
                        >
                          {asset.bookOwnership}
                        </span>
                      </td>

                      <td className="py-2 px-2.5">
                        <div className="flex items-center gap-1">
                          <span
                            className={`font-medium text-[10px] ${
                              asset.physicalFactory === 'Đang vận chuyển'
                                ? 'text-amber-700 font-bold'
                                : 'text-slate-800'
                            }`}
                          >
                            {asset.physicalFactory}
                          </span>
                          {isOwnershipMismatch && (
                            <span
                              title="Vị trí thực tế khác với sổ sách sở hữu - Chờ hoàn tất chuyển sổ sách"
                              className="w-1.5 h-1.5 rounded-full bg-amber-500"
                            />
                          )}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate max-w-[120px]">
                          {asset.physicalLocation}
                        </div>
                      </td>

                      <td className="py-2 px-2.5">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                            asset.operationalStatus === 'Đang sử dụng'
                              ? 'bg-emerald-100 text-emerald-800'
                              : asset.operationalStatus === 'Sẵn sàng điều chuyển'
                              ? 'bg-blue-100 text-blue-800'
                              : asset.operationalStatus === 'Đã giữ chỗ'
                              ? 'bg-orange-100 text-orange-800'
                              : asset.operationalStatus === 'Đang điều động'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {asset.operationalStatus}
                        </span>
                      </td>

                      <td className="py-2 px-2.5 text-right font-mono tabular-nums text-slate-700 text-[10px]">
                        {(asset.originalValue / 1000000).toFixed(0)} tr
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Sổ Biến Động Gần Nhất (Stock Movement Activity) */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-xs">Biến Động Tồn Kho Gần Nhất</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('inventory-movements')}
                className="text-[10px] text-blue-600 hover:underline"
              >
                Xem sổ biến động
              </button>
            </div>

            <div className="space-y-2.5 mt-2">
              {movements.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  className="p-2 rounded-md bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="font-mono font-bold text-blue-700">{m.movementCode}</span>
                    <span className="text-slate-400 font-mono">{m.timestamp.slice(5, 16)}</span>
                  </div>
                  <div className="font-semibold text-slate-800 text-[11px] truncate">
                    {m.assetName} ({m.assetCode})
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5 line-clamp-1">{m.reason}</div>
                  <div className="mt-1 flex items-center justify-between text-[9px] text-slate-500">
                    <span>
                      {m.fromFactory.replace('Nhà máy ', 'NM ')} → {m.toFactory.replace('Nhà máy ', 'NM ')}
                    </span>
                    <span className="font-medium text-slate-700">{m.performedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Tổng giao dịch: <strong>{movements.length}</strong></span>
            <span className="text-emerald-700 font-medium">✓ Bất biến và kiểm toán</span>
          </div>
        </div>
      </div>
    </div>
  );
};

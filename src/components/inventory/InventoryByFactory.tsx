import React, { useState, useMemo } from 'react';
import { MasterAsset, UserProfile, TransferOrder } from '../../types';
import {
  Building2,
  Boxes,
  Truck,
  Wrench,
  AlertTriangle,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Layers,
} from 'lucide-react';

interface InventoryByFactoryProps {
  assets: MasterAsset[];
  orders: TransferOrder[];
  currentUser: UserProfile;
  onSelectAsset?: (asset: MasterAsset) => void;
  onSelectOrder?: (orderId: string) => void;
}

export const InventoryByFactory: React.FC<InventoryByFactoryProps> = ({
  assets,
  orders,
  currentUser,
  onSelectAsset,
  onSelectOrder,
}) => {
  const [selectedPlant, setSelectedPlant] = useState<'ALL' | 'Nhà máy A' | 'Nhà máy B' | 'Nhà máy C'>('ALL');
  const [activeTab, setActiveTab] = useState<'overview' | 'discrepancy' | 'locations'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('ALL');

  // Plant stats calculation
  const plantStats = useMemo(() => {
    const plants = ['Nhà máy A', 'Nhà máy B', 'Nhà máy C'] as const;
    return plants.map((plant) => {
      const physicalAssets = assets.filter((a) => a.physicalFactory === plant);
      const bookAssets = assets.filter((a) => a.bookOwnership === plant);
      const inUse = physicalAssets.filter((a) => a.operationalStatus === 'Đang sử dụng').length;
      const ready = physicalAssets.filter((a) => a.operationalStatus === 'Sẵn sàng điều chuyển').length;
      const underMaintenance = physicalAssets.filter((a) =>
        ['Đang sửa chữa', 'Bị khóa', 'Chờ kiểm tra'].includes(a.operationalStatus)
      ).length;
      const pendingBookTransfer = assets.filter(
        (a) => a.physicalFactory === plant && a.bookOwnership !== plant
      ).length;

      return {
        name: plant,
        physicalCount: physicalAssets.length,
        bookCount: bookAssets.length,
        inUse,
        ready,
        underMaintenance,
        pendingBookTransfer,
      };
    });
  }, [assets]);

  // Ownership vs Physical Discrepancy Items
  // (Where physical location differs from legal book ownership)
  const ownershipDiscrepancies = useMemo(() => {
    return assets.filter((a) => {
      if (a.physicalFactory === 'Đang vận chuyển') return true;
      if (a.bookOwnership === 'Đang chờ chuyển quyền') return true;
      return a.bookOwnership !== a.physicalFactory;
    });
  }, [assets]);

  // Filtered asset list
  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchesPlant =
        selectedPlant === 'ALL'
          ? true
          : a.physicalFactory === selectedPlant || a.bookOwnership === selectedPlant;
      const matchesSearch =
        searchTerm === '' ||
        a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.physicalLocation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCondition =
        conditionFilter === 'ALL' || a.technicalCondition === conditionFilter;
      return matchesPlant && matchesSearch && matchesCondition;
    });
  }, [assets, selectedPlant, searchTerm, conditionFilter]);

  // Breakdown by detailed workshop / lines within selected factory
  const workshopBreakdown = useMemo(() => {
    const map: Record<string, { count: number; assets: MasterAsset[] }> = {};
    const relevant =
      selectedPlant === 'ALL'
        ? assets
        : assets.filter((a) => a.physicalFactory === selectedPlant);
    relevant.forEach((a) => {
      const loc = a.physicalLocation || 'Khu vực chung';
      if (!map[loc]) {
        map[loc] = { count: 0, assets: [] };
      }
      map[loc].count += 1;
      map[loc].assets.push(a);
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [assets, selectedPlant]);

  return (
    <div className="space-y-6">
      {/* Page Title & Navigation Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              TRANG 3
            </span>
            <h1 className="text-xl font-black text-navy-950 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Tồn Kho Theo Nhà Máy
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi phân bổ tài sản thực tế và đối chiếu chênh lệch quyền sở hữu sổ sách giữa Nhà máy A, B và C
          </p>
        </div>

        {/* Plant switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-md border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setSelectedPlant('ALL')}
            className={`px-3 py-1.5 rounded transition-all ${
              selectedPlant === 'ALL'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả nhà máy
          </button>
          <button
            onClick={() => setSelectedPlant('Nhà máy A')}
            className={`px-3 py-1.5 rounded transition-all ${
              selectedPlant === 'Nhà máy A'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nhà máy A
          </button>
          <button
            onClick={() => setSelectedPlant('Nhà máy B')}
            className={`px-3 py-1.5 rounded transition-all ${
              selectedPlant === 'Nhà máy B'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nhà máy B
          </button>
          <button
            onClick={() => setSelectedPlant('Nhà máy C')}
            className={`px-3 py-1.5 rounded transition-all ${
              selectedPlant === 'Nhà máy C'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nhà máy C
          </button>
        </div>
      </div>

      {/* 3 Factory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plantStats.map((p) => {
          const isSelected = selectedPlant === p.name;
          const hasBookMismatch = p.physicalCount !== p.bookCount;

          return (
            <div
              key={p.name}
              onClick={() => setSelectedPlant(p.name)}
              className={`p-4 rounded-lg border transition-all cursor-pointer relative ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-navy-900 text-sm">
                    {p.name.replace('Nhà máy ', '')}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-navy-950">{p.name}</h3>
                    <span className="text-[11px] text-slate-500">Khu công nghiệp trọng điểm</span>
                  </div>
                </div>
                {hasBookMismatch && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200" title="Chênh lệch giữa số máy tại chỗ và số máy theo sổ sách kế toán">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Chênh lệch sổ
                  </span>
                )}
              </div>

              {/* Counts */}
              <div className="grid grid-cols-2 gap-2 my-3">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">Hiện diện thực tế</div>
                  <div className="text-xl font-black text-navy-950 mt-0.5">
                    {p.physicalCount}{' '}
                    <span className="text-xs font-normal text-slate-500">tài sản</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">Sổ sách sở hữu</div>
                  <div className="text-xl font-black text-blue-900 mt-0.5">
                    {p.bookCount}{' '}
                    <span className="text-xs font-normal text-slate-500">tài sản</span>
                  </div>
                </div>
              </div>

              {/* Status details */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Đang hoạt động:
                  </span>
                  <span className="font-bold text-slate-900">{p.inUse}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Sẵn sàng điều chuyển:
                  </span>
                  <span className="font-bold text-slate-900">{p.ready}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Bảo dưỡng / Sửa chữa:
                  </span>
                  <span className="font-bold text-slate-900">{p.underMaintenance}</span>
                </div>
                {p.pendingBookTransfer > 0 && (
                  <div className="flex justify-between items-center text-amber-700 bg-amber-50/70 p-1 rounded font-medium text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Chờ chuyển sổ vào NM:
                    </span>
                    <span className="font-bold">+{p.pendingBookTransfer}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* View Switcher Tabs */}
      <div className="border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            Danh sách thiết bị ({filteredAssets.length})
          </button>
          <button
            onClick={() => setActiveTab('discrepancy')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'discrepancy'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Cảnh báo Lệch Sổ Sách vs Thực Tế ({ownershipDiscrepancies.length})
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'locations'
                ? 'border-navy-800 text-navy-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Phân bổ vị trí xưởng & line máy
          </button>
        </div>
      </div>

      {/* TAB 1: Danh sách thiết bị theo nhà máy */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm mã thiết bị, serial, vị trí cụ thể..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Tình trạng kỹ thuật:</span>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700 font-medium"
              >
                <option value="ALL">Tất cả tình trạng</option>
                <option value="Tốt">Tốt</option>
                <option value="Đã qua sử dụng">Đã qua sử dụng</option>
                <option value="Cần hiệu chuẩn">Cần hiệu chuẩn</option>
                <option value="Cần bảo dưỡng">Cần bảo dưỡng</option>
                <option value="Hư hỏng">Hư hỏng</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Mã & Tên tài sản</th>
                  <th className="py-3 px-3">Serial</th>
                  <th className="py-3 px-3">Vị trí thực tế</th>
                  <th className="py-3 px-3">Sở hữu sổ sách</th>
                  <th className="py-3 px-3">Trạng thái vận hành</th>
                  <th className="py-3 px-3">Tình trạng kỹ thuật</th>
                  <th className="py-3 px-3 text-center">Lệnh liên quan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      Không tìm thấy thiết bị nào phù hợp với bộ lọc
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => {
                    const isMismatched = asset.physicalFactory !== asset.bookOwnership;
                    return (
                      <tr
                        key={asset.id}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => onSelectAsset && onSelectAsset(asset)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={asset.image}
                              alt={asset.name}
                              className="w-9 h-9 rounded object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-navy-950 flex items-center gap-1.5">
                                <span>{asset.code}</span>
                                {asset.previousCode && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    (cũ: {asset.previousCode})
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-600 text-[11px]">{asset.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-slate-600">
                          {asset.serial}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800">{asset.physicalFactory}</div>
                          <div className="text-[11px] text-slate-500">{asset.physicalLocation}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <span
                              className={`font-semibold ${
                                isMismatched ? 'text-amber-700 underline font-bold' : 'text-slate-800'
                              }`}
                            >
                              {asset.bookOwnership}
                            </span>
                            {isMismatched && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded font-bold">
                                Chờ chuyển
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              asset.operationalStatus === 'Đang sử dụng'
                                ? 'bg-emerald-100 text-emerald-800'
                                : asset.operationalStatus === 'Sẵn sàng điều chuyển'
                                ? 'bg-blue-100 text-blue-800'
                                : asset.operationalStatus === 'Đã giữ chỗ'
                                ? 'bg-indigo-100 text-indigo-800'
                                : asset.operationalStatus === 'Đang điều động'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {asset.operationalStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              asset.technicalCondition === 'Tốt'
                                ? 'bg-slate-100 text-slate-800'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {asset.technicalCondition}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {asset.activeTransferId ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectOrder) onSelectOrder(asset.activeTransferId!);
                              }}
                              className="font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 text-[11px]"
                            >
                              {asset.activeTransferId}
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
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

      {/* TAB 2: Cảnh báo Lệch Sổ Sách vs Thực Tế */}
      {activeTab === 'discrepancy' && (
        <div className="bg-white rounded-lg border border-amber-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-amber-50/60 border-b border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-amber-950">
                Danh sách thiết bị có sự khác biệt giữa Vị trí thực tế và Quyền sở hữu sổ sách
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Các máy đã được di dời sang nhà máy khác nhưng chưa hoàn tất Bước 7 (Chuyển sổ sách kế toán do Planner duyệt), hoặc đang trên đường vận chuyển.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Mã tài sản</th>
                  <th className="py-3 px-3">Tên thiết bị</th>
                  <th className="py-3 px-3">Sở hữu sổ sách</th>
                  <th className="py-3 px-3">Vị trí thực tế</th>
                  <th className="py-3 px-3">Lệnh điều động liên quan</th>
                  <th className="py-3 px-3">Khuyến nghị xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ownershipDiscrepancies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-emerald-600 font-semibold">
                      Tất cả tài sản đều khớp 100% giữa sổ sách kế toán và vị trí thực tế!
                    </td>
                  </tr>
                ) : (
                  ownershipDiscrepancies.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-navy-950">
                        {asset.code}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{asset.name}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {asset.bookOwnership}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {asset.physicalFactory}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {asset.activeTransferId ? (
                          <button
                            onClick={() => onSelectOrder && onSelectOrder(asset.activeTransferId!)}
                            className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {asset.activeTransferId}
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-slate-400">Không có lệnh</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {asset.physicalFactory === 'Nhà máy B' && asset.bookOwnership === 'Nhà máy A' ? (
                          <span className="text-amber-800 font-medium">
                            Đã nhận tại NM B. Yêu cầu Planner thực hiện Bước 7 để chuyển sổ.
                          </span>
                        ) : asset.physicalFactory === 'Đang vận chuyển' ? (
                          <span className="text-blue-800 font-medium">
                            Đang di chuyển trên đường. Chờ NM nhận hoàn tất Bước 6.
                          </span>
                        ) : (
                          <span className="text-slate-600">Chờ đối soát biên bản kiểm kê</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Phân bổ vị trí xưởng & line máy */}
      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workshopBreakdown.map(([location, data]) => (
            <div
              key={location}
              className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <div className="font-bold text-sm text-navy-950 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  {location}
                </div>
                <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {data.count} máy
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {data.assets.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectAsset && onSelectAsset(item)}
                    className="p-2 bg-slate-50 hover:bg-blue-50 rounded border border-slate-200/80 flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-bold text-navy-900">{item.code}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        {item.name}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {item.physicalFactory}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

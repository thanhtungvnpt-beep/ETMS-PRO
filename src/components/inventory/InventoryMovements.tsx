import React, { useState, useMemo } from 'react';
import { StockMovement, StockMovementType, UserProfile, MasterAsset } from '../../types';
import {
  History,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
  User,
  FileText,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface InventoryMovementsProps {
  movements: StockMovement[];
  currentUser: UserProfile;
  assets: MasterAsset[];
  onSelectOrder?: (orderId: string) => void;
}

export const InventoryMovements: React.FC<InventoryMovementsProps> = ({
  movements,
  currentUser,
  assets,
  onSelectOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [factoryFilter, setFactoryFilter] = useState('ALL');
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);

  // Filtered movements
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesSearch =
        searchTerm === '' ||
        m.movementCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.transferOrderId && m.transferOrderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        m.performedBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'ALL' || m.type === typeFilter;
      const matchesFactory =
        factoryFilter === 'ALL' ||
        m.fromFactory === factoryFilter ||
        m.toFactory === factoryFilter;

      return matchesSearch && matchesType && matchesFactory;
    });
  }, [movements, searchTerm, typeFilter, factoryFilter]);

  const TYPE_BADGES: Record<StockMovementType, { label: string; color: string }> = {
    INTAKE: { label: 'Nhập tiếp nhận', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    DISPATCH_RESERVED: { label: 'Giữ chỗ điều động', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    DISPATCH_OUT: { label: 'Xuất kho NM', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    IN_TRANSIT: { label: 'Bắt đầu vận chuyển', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    RECEIPT_CONFIRMED: { label: 'Xác nhận nhận máy', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    BOOK_OWNERSHIP_TRANSFERRED: { label: 'Chuyển sổ kế toán', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    QR_ISSUED: { label: 'Phát hành QR', color: 'bg-sky-100 text-sky-800 border-sky-200' },
    STICKER_APPLIED: { label: 'Dán tem hoàn tất', color: 'bg-green-100 text-green-800 border-green-200' },
    LOCATION_CHANGED: { label: 'Đổi vị trí xưởng', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    CONDITION_CHANGED: { label: 'Đổi tình trạng KT', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    LOCKED: { label: 'Khóa tài sản', color: 'bg-red-100 text-red-800 border-red-200' },
    UNLOCKED: { label: 'Mở khóa tài sản', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    AUDIT_ADJUSTMENT: { label: 'Điều chỉnh kiểm kê', color: 'bg-rose-100 text-rose-800 border-rose-200' },
    DISCREPANCY_FLAGGED: { label: 'Ghi nhận sai lệch', color: 'bg-red-100 text-red-800 border-red-300' },
  };

  const handleExportCSV = () => {
    const headers = [
      'Mã biến động',
      'Thời gian',
      'Mã tài sản',
      'Tên thiết bị',
      'Loại biến động',
      'Từ nhà máy',
      'Đến nhà máy',
      'Người thực hiện',
      'Chức vụ',
      'Lệnh điều động',
      'Lý do / Diễn giải',
    ];

    const rows = filteredMovements.map((m) => [
      m.movementCode,
      m.timestamp,
      m.assetCode,
      `"${m.assetName.replace(/"/g, '""')}"`,
      TYPE_BADGES[m.type]?.label || m.type,
      m.fromFactory,
      m.toFactory,
      m.performedBy,
      m.role,
      m.transferOrderId || '',
      `"${m.reason.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `So_Bien_Dong_Kho_ETMS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Navigation Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              TRANG 6
            </span>
            <h1 className="text-xl font-black text-navy-950 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Lịch Sử Biến Động (Sổ Biến Động Kho)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Nhật ký kiểm toán bất biến ghi nhận mọi giao dịch nhập kho, xuất kho, giữ chỗ, chuyển quyền sở hữu và dán tem
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded font-bold text-xs transition-all flex items-center gap-2 shadow-xs shrink-0 self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          Xuất sổ biến động (CSV)
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {/* Filters */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm mã biến động, mã tài sản, tên người thực hiện, mã lệnh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Loại biến động:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700 font-medium"
              >
                <option value="ALL">Tất cả loại giao dịch</option>
                <option value="INTAKE">Nhập tiếp nhận mới</option>
                <option value="DISPATCH_RESERVED">Giữ chỗ điều động</option>
                <option value="DISPATCH_OUT">Xuất kho NM</option>
                <option value="IN_TRANSIT">Bắt đầu vận chuyển</option>
                <option value="RECEIPT_CONFIRMED">Xác nhận nhận máy</option>
                <option value="BOOK_OWNERSHIP_TRANSFERRED">Chuyển sổ kế toán</option>
                <option value="QR_ISSUED">Phát hành tem QR</option>
                <option value="STICKER_APPLIED">Dán tem hoàn tất</option>
                <option value="LOCATION_CHANGED">Thay đổi vị trí nội bộ</option>
                <option value="AUDIT_ADJUSTMENT">Điều chỉnh kiểm kê</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Nhà máy:</span>
              <select
                value={factoryFilter}
                onChange={(e) => setFactoryFilter(e.target.value)}
                className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700"
              >
                <option value="ALL">Tất cả nhà máy</option>
                <option value="Nhà máy A">Nhà máy A</option>
                <option value="Nhà máy B">Nhà máy B</option>
                <option value="Nhà máy C">Nhà máy C</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Mã biến động</th>
                <th className="py-3 px-3">Thời gian ghi sổ</th>
                <th className="py-3 px-3">Tài sản liên quan</th>
                <th className="py-3 px-3">Loại giao dịch</th>
                <th className="py-3 px-3">Hành trình / Vị trí</th>
                <th className="py-3 px-3">Người thực hiện</th>
                <th className="py-3 px-3">Lý do & Diễn giải</th>
                <th className="py-3 px-3 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Không tìm thấy bản ghi biến động kho nào
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => {
                  const badge = TYPE_BADGES[m.type] || {
                    label: m.type,
                    color: 'bg-slate-100 text-slate-700',
                  };

                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedMovement(m)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-navy-900">
                        {m.movementCode}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {m.timestamp}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-blue-700">{m.assetCode}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                          {m.assetName}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 font-semibold text-slate-800 text-[11px]">
                          <span>{m.fromFactory}</span>
                          {m.fromFactory !== m.toFactory && (
                            <>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              <span className="text-blue-800">{m.toFactory}</span>
                            </>
                          )}
                        </div>
                        {m.toLocation && (
                          <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                            {m.toLocation}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{m.performedBy}</div>
                        <div className="text-[10px] text-slate-500">{m.role}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-700 max-w-xs truncate">{m.reason}</div>
                        {m.transferOrderId && (
                          <span className="text-[10px] text-blue-600 font-mono font-semibold">
                            [{m.transferOrderId}]
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMovement(m);
                          }}
                          className="p-1 hover:bg-slate-200 rounded text-slate-600"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Movement Detail Inspection Modal */}
      {selectedMovement && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-navy-950 p-4 text-white flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-300 font-mono">BẢN GHI BIẾN ĐỘNG KHO</div>
                <h3 className="font-bold text-base">{selectedMovement.movementCode}</h3>
              </div>
              <button
                onClick={() => setSelectedMovement(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Thời gian giao dịch:</span>
                  <span className="font-mono font-bold text-navy-950">
                    {selectedMovement.timestamp}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Loại nghiệp vụ:</span>
                  <span className="font-bold text-blue-700">
                    {TYPE_BADGES[selectedMovement.type]?.label || selectedMovement.type}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Thiết bị liên quan:</span>
                <div className="p-3 bg-blue-50/50 rounded border border-blue-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-navy-950 text-sm">
                      {selectedMovement.assetCode}
                    </div>
                    <div className="text-slate-600 text-[11px]">{selectedMovement.assetName}</div>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    ID: {selectedMovement.assetInternalId}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block mb-1">Điểm xuất phát:</span>
                  <div className="font-bold text-slate-800">{selectedMovement.fromFactory}</div>
                  <div className="text-[11px] text-slate-500">
                    {selectedMovement.fromLocation || 'Khu vực xuất'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Điểm tiếp nhận:</span>
                  <div className="font-bold text-blue-900">{selectedMovement.toFactory}</div>
                  <div className="text-[11px] text-slate-500">
                    {selectedMovement.toLocation || 'Khu vực nhận'}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Diễn giải / Căn cứ nghiệp vụ:</span>
                <p className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-800 leading-relaxed">
                  {selectedMovement.reason}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-500 block text-[11px]">Người thực hiện:</span>
                  <strong className="text-slate-900">{selectedMovement.performedBy}</strong>
                  <div className="text-slate-500 text-[10px]">{selectedMovement.role}</div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Lệnh điều động:</span>
                  {selectedMovement.transferOrderId ? (
                    <button
                      onClick={() => {
                        setSelectedMovement(null);
                        if (onSelectOrder) onSelectOrder(selectedMovement.transferOrderId!);
                      }}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      {selectedMovement.transferOrderId}
                    </button>
                  ) : (
                    <span className="text-slate-400">Không có</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedMovement(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 rounded font-bold text-slate-700 text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

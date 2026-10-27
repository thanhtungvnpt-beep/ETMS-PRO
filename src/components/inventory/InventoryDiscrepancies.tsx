import React, { useState, useMemo } from 'react';
import { InventoryDiscrepancy, UserProfile, MasterAsset } from '../../types';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  FileText,
  User,
  Building,
  Check,
  X,
  Plus,
} from 'lucide-react';

interface InventoryDiscrepanciesProps {
  discrepancies: InventoryDiscrepancy[];
  currentUser: UserProfile;
  assets: MasterAsset[];
  onUpdateDiscrepancy: (updated: InventoryDiscrepancy, note: string) => void;
  onAddDiscrepancy?: (newDiscrepancy: InventoryDiscrepancy) => void;
}

export const InventoryDiscrepancies: React.FC<InventoryDiscrepanciesProps> = ({
  discrepancies,
  currentUser,
  assets,
  onUpdateDiscrepancy,
  onAddDiscrepancy,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<InventoryDiscrepancy | null>(null);

  // Resolution form states inside modal
  const [resolutionAction, setResolutionAction] = useState<
    'Đã giải quyết' | 'Phê duyệt điều chỉnh sổ' | 'Đang xử lý'
  >('Đã giải quyết');
  const [resolutionNote, setResolutionNote] = useState('');

  // Add new discrepancy modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAssetCode, setNewAssetCode] = useState('');
  const [newType, setNewType] = useState<any>('Sai vị trí thực tế');
  const [newSeverity, setNewSeverity] = useState<'Thấp' | 'Trung bình' | 'Nghiêm trọng'>('Trung bình');
  const [newDesc, setNewDesc] = useState('');
  const [newFactory, setNewFactory] = useState('Nhà máy A');

  // Filtered discrepancies
  const filteredDiscrepancies = useMemo(() => {
    return discrepancies.filter((d) => {
      const matchesSearch =
        searchTerm === '' ||
        d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeverity = severityFilter === 'ALL' || d.severity === severityFilter;
      const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [discrepancies, searchTerm, severityFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = discrepancies.length;
    const critical = discrepancies.filter((d) => d.severity === 'Nghiêm trọng').length;
    const pending = discrepancies.filter((d) => d.status === 'Chờ xử lý').length;
    const inProgress = discrepancies.filter((d) => d.status === 'Đang xử lý').length;
    const resolved = discrepancies.filter((d) => d.status === 'Đã giải quyết' || d.status === 'Phê duyệt điều chỉnh sổ').length;
    return { total, critical, pending, inProgress, resolved };
  }, [discrepancies]);

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiscrepancy) return;

    const updated: InventoryDiscrepancy = {
      ...selectedDiscrepancy,
      status: resolutionAction,
      resolutionNote,
      approvedBy: currentUser.name,
      approvedDate: new Date().toISOString().slice(0, 10),
    };

    onUpdateDiscrepancy(
      updated,
      `Xử lý sai lệch ${updated.id}: ${resolutionAction} bởi ${currentUser.name}`
    );

    setSelectedDiscrepancy(null);
    setResolutionNote('');
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetCode || !newDesc) return;

    const targetAsset = assets.find((a) => a.code.toUpperCase() === newAssetCode.toUpperCase());

    const newObj: InventoryDiscrepancy = {
      id: `IDISC-${(discrepancies.length + 1).toString().padStart(3, '0')}`,
      assetCode: newAssetCode.toUpperCase(),
      assetName: targetAsset?.name || 'Thiết bị phát hiện ngoài sổ sách',
      serial: targetAsset?.serial || 'SN-UNKNOWN',
      factory: newFactory,
      type: newType,
      severity: newSeverity,
      description: newDesc,
      reportedBy: currentUser.name,
      reportedDate: new Date().toISOString().slice(0, 10),
      status: 'Chờ xử lý',
      assignedTo: 'Quản đốc ' + newFactory,
    };

    if (onAddDiscrepancy) {
      onAddDiscrepancy(newObj);
    }
    setIsAddModalOpen(false);
    setNewAssetCode('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              TRANG 8
            </span>
            <h1 className="text-xl font-black text-navy-950 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Quản Lý Sai Lệch Tồn Kho (Discrepancy Register)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quy trình điều tra nguyên nhân, phân cấp trách nhiệm và phê duyệt giải quyết sai lệch số lượng, serial và vị trí
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-xs transition-all flex items-center gap-2 shadow-xs shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Khai báo sai lệch mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Tổng sai lệch ghi nhận</div>
          <div className="text-2xl font-black text-navy-950 mt-1">{stats.total} vụ</div>
          <div className="text-[11px] text-slate-400">Từ đầu năm đến nay</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-red-200 shadow-xs">
          <div className="text-xs text-red-700 font-medium">Mức độ nghiêm trọng</div>
          <div className="text-2xl font-black text-red-600 mt-1">{stats.critical} vụ</div>
          <div className="text-[11px] text-red-600">Yêu cầu lập biên bản giải trình</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-amber-200 shadow-xs">
          <div className="text-xs text-amber-700 font-medium">Đang chờ xử lý</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats.pending} vụ</div>
          <div className="text-[11px] text-amber-700">Cần thẩm tra thực địa</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-xs">
          <div className="text-xs text-emerald-700 font-medium">Đã giải quyết / Đóng hồ sơ</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats.resolved} vụ</div>
          <div className="text-[11px] text-emerald-700">Đã điều chỉnh sổ kế toán</div>
        </div>
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
                placeholder="Tìm mã vụ việc, mã thiết bị, serial, người phát hiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Mức độ:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700 font-medium"
              >
                <option value="ALL">Tất cả mức độ</option>
                <option value="Nghiêm trọng">Nghiêm trọng</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Thấp">Thấp</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Trạng thái:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700 font-medium"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="Chờ xử lý">Chờ xử lý</option>
                <option value="Đang xử lý">Đang xử lý</option>
                <option value="Đã giải quyết">Đã giải quyết</option>
                <option value="Phê duyệt điều chỉnh sổ">Phê duyệt điều chỉnh sổ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Mã vụ việc</th>
                <th className="py-3 px-3">Tài sản phát hiện</th>
                <th className="py-3 px-3">Loại sai lệch</th>
                <th className="py-3 px-3">Mức độ</th>
                <th className="py-3 px-3">Nhà máy</th>
                <th className="py-3 px-3">Người báo cáo & Ngày</th>
                <th className="py-3 px-3">Trạng thái</th>
                <th className="py-3 px-3 text-center">Xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDiscrepancies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Không tìm thấy sai lệch tồn kho nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredDiscrepancies.map((disc) => (
                  <tr
                    key={disc.id}
                    onClick={() => setSelectedDiscrepancy(disc)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-navy-950">{disc.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-blue-700">{disc.assetCode}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        {disc.assetName}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{disc.type}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          disc.severity === 'Nghiêm trọng'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : disc.severity === 'Trung bình'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {disc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">{disc.factory}</td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">{disc.reportedBy}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{disc.reportedDate}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          disc.status === 'Đã giải quyết' || disc.status === 'Phê duyệt điều chỉnh sổ'
                            ? 'bg-emerald-100 text-emerald-800'
                            : disc.status === 'Đang xử lý'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {disc.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDiscrepancy(disc);
                        }}
                        className="px-2.5 py-1 bg-navy-900 hover:bg-navy-800 text-white rounded font-bold text-[11px] transition-all"
                      >
                        Thẩm tra
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discrepancy Investigation & Resolution Modal */}
      {selectedDiscrepancy && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-navy-950 p-4 text-white flex items-center justify-between">
              <div>
                <div className="text-xs text-amber-300 font-mono">HỒ SƠ XỬ LÝ SAI LỆCH</div>
                <h3 className="font-bold text-base">{selectedDiscrepancy.id}</h3>
              </div>
              <button
                onClick={() => setSelectedDiscrepancy(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Tài sản liên quan:</span>
                  <div className="font-bold text-navy-950 text-sm">
                    {selectedDiscrepancy.assetCode}
                  </div>
                  <div className="text-slate-600 text-[11px]">{selectedDiscrepancy.assetName}</div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Mức độ vi phạm:</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                      selectedDiscrepancy.severity === 'Nghiêm trọng'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedDiscrepancy.severity}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Mô tả hiện trạng sai lệch:</span>
                <p className="p-2.5 bg-amber-50/60 rounded border border-amber-200 text-slate-800 leading-relaxed">
                  {selectedDiscrepancy.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block text-[11px]">Người phát hiện:</span>
                  <strong className="text-slate-900">{selectedDiscrepancy.reportedBy}</strong>
                  <div className="text-slate-500 text-[10px]">Ngày: {selectedDiscrepancy.reportedDate}</div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Phân công giải quyết:</span>
                  <strong className="text-slate-900">{selectedDiscrepancy.assignedTo}</strong>
                </div>
              </div>

              {/* Action Picker */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block font-bold text-slate-700 mb-1">
                  Quyết định thẩm tra & xử lý:
                </label>
                <select
                  value={resolutionAction}
                  onChange={(e) => setResolutionAction(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-semibold text-slate-800 bg-white"
                >
                  <option value="Đã giải quyết">Đã giải quyết (Đã tìm thấy / Xác nhận vị trí)</option>
                  <option value="Phê duyệt điều chỉnh sổ">Phê duyệt điều chỉnh sổ (Kế toán phê duyệt)</option>
                  <option value="Đang xử lý">Đang tiếp tục đối soát & xác minh</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Biên bản kết luận & giải trình:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Nhập chi tiết biện pháp khắc phục, căn cứ điều chỉnh sổ sách..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDiscrepancy(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Ký duyệt hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Discrepancy Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-navy-950 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Khai báo sai lệch tồn kho mới</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã tài sản liên quan</label>
                <input
                  type="text"
                  required
                  placeholder="VD: TS001, B-TS002..."
                  value={newAssetCode}
                  onChange={(e) => setNewAssetCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại sai lệch</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs"
                  >
                    <option value="Sai vị trí thực tế">Sai vị trí thực tế</option>
                    <option value="Thất thoát / Không tìm thấy">Thất thoát / Không tìm thấy</option>
                    <option value="Sai tình trạng kỹ thuật">Sai tình trạng kỹ thuật</option>
                    <option value="Sai số serial">Sai số serial</option>
                    <option value="Thừa tài sản ngoài sổ sách">Thừa tài sản ngoài sổ sách</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức độ nghiêm trọng</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs"
                  >
                    <option value="Thấp">Thấp</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Nghiêm trọng">Nghiêm trọng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nhà máy xảy ra sai lệch</label>
                <select
                  value={newFactory}
                  onChange={(e) => setNewFactory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="Nhà máy A">Nhà máy A</option>
                  <option value="Nhà máy B">Nhà máy B</option>
                  <option value="Nhà máy C">Nhà máy C</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả sự việc</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Mô tả hoàn cảnh phát hiện, vị trí máy, hiện trạng..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold"
                >
                  Lưu hồ sơ sai lệch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

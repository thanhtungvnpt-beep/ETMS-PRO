import React, { useState } from 'react';
import {
  MasterAsset,
  UserProfile,
  StockMovement,
  AssetCategory,
  OperationalStatus,
} from '../../types';
import {
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit2,
  Trash2,
  QrCode,
  FileText,
  History,
  AlertTriangle,
  X,
  CheckCircle2,
  Building,
  Layers,
} from 'lucide-react';
import { generateQRCodeDataURL } from '../../utils/qrGenerator';

interface InventoryCatalogProps {
  assets: MasterAsset[];
  currentUser: UserProfile;
  movements: StockMovement[];
  onAddAsset: (newAsset: Partial<MasterAsset>) => void;
  onUpdateAsset: (updated: MasterAsset, reason: string) => void;
  onOpenQRPrintModal: (asset: MasterAsset) => void;
}

export const InventoryCatalog: React.FC<InventoryCatalogProps> = ({
  assets,
  currentUser,
  movements,
  onAddAsset,
  onUpdateAsset,
  onOpenQRPrintModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [factoryFilter, setFactoryFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected asset for detailed drawer/modal
  const [selectedAsset, setSelectedAsset] = useState<MasterAsset | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'history' | 'qr'>('info');
  const [previewQRUrl, setPreviewQRUrl] = useState<string>('');

  // Add asset modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addCode, setAddCode] = useState('');
  const [addName, setAddName] = useState('');
  const [addCategory, setAddCategory] = useState<AssetCategory>('Cơ khí chính xác');
  const [addSerial, setAddSerial] = useState('');
  const [addFactory, setAddFactory] = useState<'Nhà máy A' | 'Nhà máy B' | 'Nhà máy C'>('Nhà máy A');
  const [addLocation, setAddLocation] = useState('Xưởng Sản xuất chính');
  const [addValue, setAddValue] = useState(250000000);
  const [addCondition, setAddCondition] = useState<any>('Tốt');
  const [addError, setAddError] = useState('');

  // When selecting an asset, load its QR preview
  const handleSelectAssetDetail = (asset: MasterAsset) => {
    setSelectedAsset(asset);
    generateQRCodeDataURL(asset.qrInfo?.payload || `ETMS|${asset.code}|${asset.serial}`).then((url) => {
      setPreviewQRUrl(url);
    });
  };

  // Filter logic
  const filtered = assets.filter((a) => {
    const matchSearch =
      a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.serial.toLowerCase().includes(searchTerm.toLowerCase());

    const matchFactory =
      factoryFilter === 'ALL' ||
      a.physicalFactory === factoryFilter ||
      a.bookOwnership === factoryFilter;

    const matchCategory = categoryFilter === 'ALL' || a.category === categoryFilter;
    const matchStatus = statusFilter === 'ALL' || a.operationalStatus === statusFilter;

    return matchSearch && matchFactory && matchCategory && matchStatus;
  });

  // Handle Add Asset with Duplicate Prevention
  const handleCommitAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCode.trim() || !addName.trim() || !addSerial.trim()) {
      setAddError('Vui lòng nhập đầy đủ Mã tài sản, Tên thiết bị và Số serial.');
      return;
    }

    // Duplicate checks (Section 4 policy)
    const duplicateCode = assets.find(
      (a) => a.code.trim().toUpperCase() === addCode.trim().toUpperCase()
    );
    if (duplicateCode) {
      setAddError(`Mã tài sản "${addCode}" đã tồn tại trong hệ thống (ID: ${duplicateCode.id}).`);
      return;
    }

    const duplicateSerial = assets.find(
      (a) => a.serial.trim().toUpperCase() === addSerial.trim().toUpperCase()
    );
    if (duplicateSerial) {
      setAddError(
        `Số serial "${addSerial}" đã được đăng ký cho thiết bị ${duplicateSerial.name} (${duplicateSerial.code}).`
      );
      return;
    }

    const newId = `AST-${(assets.length + 1).toString().padStart(3, '0')}`;
    const newAsset: Partial<MasterAsset> = {
      id: newId,
      code: addCode.trim().toUpperCase(),
      name: addName.trim(),
      category: addCategory,
      serial: addSerial.trim().toUpperCase(),
      bookOwnership: addFactory,
      physicalFactory: addFactory,
      physicalLocation: addLocation.trim(),
      operationalStatus: 'Sẵn sàng điều chuyển',
      technicalCondition: addCondition,
      image: '/src/assets/images/industrial_air_compressor_1793008718761.jpg',
      intakeDate: new Date().toISOString().slice(0, 10),
      purchaseYear: new Date().getFullYear(),
      originalValue: Number(addValue) || 100000000,
      residualValue: Number(addValue) || 100000000,
      transferHistory: [],
      qrInfo: {
        code: addCode.trim().toUpperCase(),
        payload: `ETMS|${addCode.trim().toUpperCase()}|${addSerial.trim()}|${addFactory}|${new Date().getFullYear()}`,
        issuedDate: new Date().toISOString().slice(0, 10),
        isCurrent: true,
        version: 1,
      },
    };

    onAddAsset(newAsset);
    setIsAddModalOpen(false);
    setAddCode('');
    setAddName('');
    setAddSerial('');
    setAddError('');
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID Nội Bộ',
      'Mã Tài Sản',
      'Mã Cũ',
      'Tên Thiết Bị',
      'Nhóm',
      'Số Serial',
      'Sở Hữu Sổ Sách',
      'Vị Trí Thực Tế',
      'Chi Tiết Vị Trí',
      'Trạng Thái Sử Dụng',
      'Tình Trạng',
      'Nguyên Giá (VND)',
    ];

    const rows = filtered.map((a) => [
      a.id,
      a.code,
      a.previousCode || '-',
      `"${a.name}"`,
      `"${a.category}"`,
      `"${a.serial}"`,
      `"${a.bookOwnership}"`,
      `"${a.physicalFactory}"`,
      `"${a.physicalLocation}"`,
      `"${a.operationalStatus}"`,
      `"${a.technicalCondition}"`,
      a.originalValue,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `danh_muc_tai_san_etms_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 space-y-4 text-xs">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã, ID nội bộ, serial, tên..."
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

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 focus:bg-white"
          >
            <option value="ALL">Tất cả nhóm</option>
            <option value="Cơ khí chính xác">Cơ khí chính xác</option>
            <option value="Khí nén & Thủy lực">Khí nén & Thủy lực</option>
            <option value="Điện & Tự động hóa">Điện & Tự động hóa</option>
            <option value="Đo lường & Thử nghiệm">Đo lường & Thử nghiệm</option>
            <option value="Phụ trợ xưởng">Phụ trợ xưởng</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 focus:bg-white"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Đang sử dụng">Đang sử dụng</option>
            <option value="Sẵn sàng điều chuyển">Sẵn sàng điều chuyển</option>
            <option value="Đã giữ chỗ">Đã giữ chỗ</option>
            <option value="Đang điều động">Đang điều động</option>
            <option value="Đang sửa chữa">Đang sửa chữa</option>
            <option value="Bị khóa">Bị khóa</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold flex items-center gap-1.5 border border-slate-300 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo tài sản mới</span>
          </button>
        </div>
      </div>

      {/* Main Catalog Table */}
      <div className="border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
            <tr>
              <th className="py-2.5 px-3">ID / Mã tài sản</th>
              <th className="py-2.5 px-3">Tên thiết bị</th>
              <th className="py-2.5 px-3">Nhóm thiết bị</th>
              <th className="py-2.5 px-3">Số Serial</th>
              <th className="py-2.5 px-3">Sở hữu sổ sách</th>
              <th className="py-2.5 px-3">Vị trí thực tế</th>
              <th className="py-2.5 px-3">Trạng thái vận hành</th>
              <th className="py-2.5 px-3">Tình trạng</th>
              <th className="py-2.5 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px]">
            {filtered.map((asset) => (
              <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-3">
                  <div className="font-mono font-bold text-blue-700">{asset.code}</div>
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <span>ID: {asset.id}</span>
                    {asset.previousCode && (
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded">
                        cũ: {asset.previousCode}
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-2.5 px-3">
                  <div className="font-semibold text-slate-900 line-clamp-1">{asset.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Năm mua: {asset.purchaseYear}
                  </div>
                </td>

                <td className="py-2.5 px-3 text-slate-700">{asset.category}</td>

                <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                  {asset.serial}
                </td>

                <td className="py-2.5 px-3">
                  <span
                    className={`font-semibold text-[10px] px-2 py-0.5 rounded ${
                      asset.bookOwnership === 'Nhà máy A'
                        ? 'bg-blue-100 text-blue-800'
                        : asset.bookOwnership === 'Nhà máy B'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {asset.bookOwnership}
                  </span>
                </td>

                <td className="py-2.5 px-3">
                  <div className="font-medium text-slate-900">{asset.physicalFactory}</div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                    {asset.physicalLocation}
                  </div>
                </td>

                <td className="py-2.5 px-3">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
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

                <td className="py-2.5 px-3">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      asset.technicalCondition === 'Tốt'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {asset.technicalCondition}
                  </span>
                </td>

                <td className="py-2.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleSelectAssetDetail(asset)}
                      className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100 cursor-pointer"
                      title="Xem chi tiết hồ sơ & lịch sử"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenQRPrintModal(asset)}
                      className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100 cursor-pointer"
                      title="In nhãn QR"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL / DRAWER */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-blue-400 text-sm">
                  {selectedAsset.code}
                </span>
                <span className="text-slate-500">|</span>
                <h3 className="font-bold text-sm text-slate-100 truncate max-w-sm">
                  {selectedAsset.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDetailTab('info')}
                className={`py-2.5 px-3 border-b-2 cursor-pointer ${
                  detailTab === 'info'
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-slate-500'
                }`}
              >
                Hồ sơ kỹ thuật & Phân tách 3 trục
              </button>
              <button
                type="button"
                onClick={() => setDetailTab('history')}
                className={`py-2.5 px-3 border-b-2 cursor-pointer ${
                  detailTab === 'history'
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-slate-500'
                }`}
              >
                Lịch sử biến động ({movements.filter((m) => m.assetCode === selectedAsset.code).length})
              </button>
              <button
                type="button"
                onClick={() => setDetailTab('qr')}
                className={`py-2.5 px-3 border-b-2 cursor-pointer ${
                  detailTab === 'qr'
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-slate-500'
                }`}
              >
                Tem QR & Mã vạch
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {detailTab === 'info' && (
                <div className="space-y-4">
                  {/* Photo & Core specs */}
                  <div className="flex gap-4">
                    <img
                      src={selectedAsset.image}
                      alt={selectedAsset.name}
                      className="w-32 h-28 object-cover rounded-md border border-slate-200 shadow-2xs"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">ID Nội Bộ:</span>
                          <span className="font-mono font-bold text-slate-800">{selectedAsset.id}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Số Serial:</span>
                          <span className="font-mono font-bold text-slate-800">{selectedAsset.serial}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Nhóm thiết bị:</span>
                          <span className="font-medium text-slate-800">{selectedAsset.category}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Tình trạng:</span>
                          <span className="font-semibold text-emerald-700">{selectedAsset.technicalCondition}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ba Trục Trạng Thái (Bắt buộc theo mục 5) */}
                  <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>Phân Tách 3 Trục Trạng Thái Độc Lập</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 text-[11px]">
                      <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded">
                        <span className="text-blue-800 font-bold block mb-1">
                          1. Quyền sở hữu sổ sách
                        </span>
                        <div className="font-semibold text-slate-900">{selectedAsset.bookOwnership}</div>
                        <p className="text-[10px] text-slate-500 mt-1">Đơn vị hạch toán tài sản cố định</p>
                      </div>

                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded">
                        <span className="text-emerald-800 font-bold block mb-1">
                          2. Vị trí thực tế
                        </span>
                        <div className="font-semibold text-slate-900">{selectedAsset.physicalFactory}</div>
                        <p className="text-[10px] text-slate-500 mt-1 truncate" title={selectedAsset.physicalLocation}>
                          {selectedAsset.physicalLocation}
                        </p>
                      </div>

                      <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded">
                        <span className="text-amber-800 font-bold block mb-1">
                          3. Trạng thái vận hành
                        </span>
                        <div className="font-semibold text-slate-900">{selectedAsset.operationalStatus}</div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {selectedAsset.activeTransferId
                            ? `Khóa bởi lệnh ${selectedAsset.activeTransferId}`
                            : 'Không có lệnh điều động khóa'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financial & Intake info */}
                  <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Ngày tiếp nhận:</span>
                      <span className="font-mono text-slate-800">{selectedAsset.intakeDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Nguyên giá ban đầu:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                          selectedAsset.originalValue
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Lệnh điều động từng tham gia:</span>
                      <span className="font-mono text-blue-700">
                        {selectedAsset.transferHistory.length > 0
                          ? selectedAsset.transferHistory.join(', ')
                          : 'Chưa điều chuyển'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'history' && (
                <div className="space-y-2">
                  <div className="font-bold text-slate-800 mb-1">
                    Nhật ký biến động tài sản {selectedAsset.code}
                  </div>
                  {movements
                    .filter((m) => m.assetCode === selectedAsset.code || m.assetInternalId === selectedAsset.id)
                    .map((m) => (
                      <div key={m.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-md">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-mono font-bold text-blue-700">{m.movementCode}</span>
                          <span className="font-mono text-slate-400">{m.timestamp}</span>
                        </div>
                        <div className="font-semibold text-slate-800 mt-1">{m.reason}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Tuyến: {m.fromFactory} → {m.toFactory} | Người thực hiện: {m.performedBy}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {detailTab === 'qr' && (
                <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="bg-white p-2 border-2 border-slate-900 rounded">
                    {previewQRUrl ? (
                      <img src={previewQRUrl} alt="QR Code" className="w-32 h-32" />
                    ) : (
                      <div className="w-32 h-32 bg-slate-100 flex items-center justify-center">
                        <QrCode className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block font-mono">Mã tem QR:</span>
                      <div className="font-mono font-black text-lg text-slate-900">{selectedAsset.code}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">Dữ liệu mã hóa (Payload):</span>
                      <div className="font-mono text-[10px] text-slate-700 bg-white p-1.5 rounded border border-slate-200 break-all">
                        {selectedAsset.qrInfo.payload}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenQRPrintModal(selectedAsset)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Xem bản in tem nhãn</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="px-3.5 py-1.5 bg-white border border-slate-300 rounded font-medium text-slate-700 hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ASSET MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Tạo tài sản mới vào sổ tồn kho</h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setAddError('');
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCommitAddAsset} className="p-5 space-y-3 text-xs">
              {addError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-700 text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{addError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Mã tài sản <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: TS013"
                    value={addCode}
                    onChange={(e) => setAddCode(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Số Serial <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: SN013-XYZ"
                    value={addSerial}
                    onChange={(e) => setAddSerial(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Tên thiết bị máy móc <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Máy phay vạn năng tự động"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Nhóm thiết bị</label>
                  <select
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                  >
                    <option value="Cơ khí chính xác">Cơ khí chính xác</option>
                    <option value="Khí nén & Thủy lực">Khí nén & Thủy lực</option>
                    <option value="Điện & Tự động hóa">Điện & Tự động hóa</option>
                    <option value="Đo lường & Thử nghiệm">Đo lường & Thử nghiệm</option>
                    <option value="Phụ trợ xưởng">Phụ trợ xưởng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Nhà máy quản lý</label>
                  <select
                    value={addFactory}
                    onChange={(e) => setAddFactory(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                  >
                    <option value="Nhà máy A">Nhà máy A (Hà Nội)</option>
                    <option value="Nhà máy B">Nhà máy B (TP. HCM)</option>
                    <option value="Nhà máy C">Nhà máy C (Hải Phòng)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Vị trí lắp đặt cụ thể</label>
                  <input
                    type="text"
                    value={addLocation}
                    onChange={(e) => setAddLocation(e.target.value)}
                    placeholder="VD: Xưởng Cơ khí 1 - Line C"
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Nguyên giá (VND)</label>
                  <input
                    type="number"
                    min="1000000"
                    step="1000000"
                    value={addValue}
                    onChange={(e) => setAddValue(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow-xs"
                >
                  Xác nhận lưu tài sản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

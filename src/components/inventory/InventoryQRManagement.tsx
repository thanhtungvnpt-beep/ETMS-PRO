import React, { useState, useEffect } from 'react';
import { MasterAsset, UserProfile } from '../../types';
import {
  ScanLine,
  Printer,
  QrCode,
  Search,
  Filter,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileText,
  Building,
  RefreshCw,
  Layers,
  Sparkles,
} from 'lucide-react';
import { generateQRCodeDataURL } from '../../utils/qrGenerator';

interface InventoryQRManagementProps {
  assets: MasterAsset[];
  currentUser: UserProfile;
  onOpenQRPrintModal: (asset: MasterAsset) => void;
}

export const InventoryQRManagement: React.FC<InventoryQRManagementProps> = ({
  assets,
  currentUser,
  onOpenQRPrintModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [factoryFilter, setFactoryFilter] = useState('ALL');
  const [selectedAssetForPreview, setSelectedAssetForPreview] = useState<MasterAsset>(
    assets[0]
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Batch print selections
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  // Update preview QR when selection changes
  useEffect(() => {
    if (selectedAssetForPreview) {
      const payload =
        selectedAssetForPreview.qrInfo?.payload ||
        `ETMS|${selectedAssetForPreview.code}|${selectedAssetForPreview.serial}|${selectedAssetForPreview.physicalFactory}|v1`;

      generateQRCodeDataURL(payload).then((url) => {
        setQrDataUrl(url);
      });
    }
  }, [selectedAssetForPreview]);

  // Filtered assets
  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      searchTerm === '' ||
      a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.previousCode && a.previousCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFactory = factoryFilter === 'ALL' || a.physicalFactory === factoryFilter;

    return matchesSearch && matchesFactory;
  });

  const handleToggleSelectAll = () => {
    if (selectedAssetIds.length === filteredAssets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(filteredAssets.map((a) => a.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyPayload = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              TRANG 10
            </span>
            <h1 className="text-xl font-black text-navy-950 flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-blue-600" />
              Quản Lý Mã QR Tài Sản & Tem Nhãn Nhiệt
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu cấu trúc dữ liệu QR, đối chiếu lịch sử đổi mã sau điều động và in tem nhãn công nghiệp chuẩn 80x50mm
          </p>
        </div>

        {/* Batch action */}
        <div className="flex items-center gap-2">
          {selectedAssetIds.length > 0 && (
            <button
              onClick={() => onOpenQRPrintModal(selectedAssetForPreview)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs transition-all flex items-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              In hàng loạt {selectedAssetIds.length} tem đã chọn
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid: Left Table + Right Thermal Label Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Asset QR List (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          {/* Filter Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm mã mới, mã cũ, serial, tên thiết bị..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Nhà máy:</span>
              <select
                value={factoryFilter}
                onChange={(e) => setFactoryFilter(e.target.value)}
                className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700 font-medium"
              >
                <option value="ALL">Tất cả nhà máy</option>
                <option value="Nhà máy A">Nhà máy A</option>
                <option value="Nhà máy B">Nhà máy B</option>
                <option value="Nhà máy C">Nhà máy C</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedAssetIds.length > 0 &&
                        selectedAssetIds.length === filteredAssets.length
                      }
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-300 text-blue-600"
                    />
                  </th>
                  <th className="py-2.5 px-3">Mã tài sản hiện tại</th>
                  <th className="py-2.5 px-3">Mã trước điều động</th>
                  <th className="py-2.5 px-3">Tên thiết bị</th>
                  <th className="py-2.5 px-3">Số Serial</th>
                  <th className="py-2.5 px-3">Phiên bản QR</th>
                  <th className="py-2.5 px-3 text-center">Xem tem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      Không có tài sản nào
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => {
                    const isSelected = selectedAssetForPreview?.id === asset.id;
                    const isChecked = selectedAssetIds.includes(asset.id);

                    return (
                      <tr
                        key={asset.id}
                        onClick={() => setSelectedAssetForPreview(asset)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td
                          className="py-2.5 px-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelectOne(asset.id)}
                            className="rounded border-slate-300 text-blue-600"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-navy-950">
                          {asset.code}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {asset.previousCode ? (
                            <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              {asset.previousCode}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 truncate max-w-[150px]">
                          {asset.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{asset.serial}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                            v{asset.qrInfo?.version || 1}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAssetForPreview(asset);
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

        {/* Right: Thermal Label Print Preview (80x50mm industrial standard) */}
        {selectedAssetForPreview && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-navy-950 flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-blue-600" />
                  Mô phỏng tem nhiệt công nghiệp (80x50mm)
                </h3>
              </div>

              {/* Physical Thermal Label Box */}
              <div className="bg-white border-2 border-slate-800 rounded p-4 shadow-md max-w-sm mx-auto font-sans text-slate-900 select-none">
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-navy-900 text-white flex items-center justify-center font-black text-[10px] rounded">
                      E
                    </div>
                    <span className="font-black text-xs tracking-wider">ETMS PRO INDUSTRIAL</span>
                  </div>
                  <span className="text-[10px] font-bold font-mono">
                    {selectedAssetForPreview.physicalFactory}
                  </span>
                </div>

                {/* Body: QR Code + Text */}
                <div className="flex items-center gap-3">
                  <div className="w-24 h-24 border border-slate-300 p-1 rounded shrink-0 flex items-center justify-center bg-white">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                    ) : (
                      <QrCode className="w-16 h-16 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Mã tài sản:</div>
                    <div className="text-base font-black font-mono leading-none text-navy-950">
                      {selectedAssetForPreview.code}
                    </div>

                    <div className="text-[10px] text-slate-500 font-bold uppercase pt-1">
                      Tên thiết bị:
                    </div>
                    <div className="text-xs font-bold truncate leading-tight">
                      {selectedAssetForPreview.name}
                    </div>

                    <div className="text-[10px] text-slate-500 font-bold uppercase pt-1">
                      Số Serial:
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-slate-700">
                      {selectedAssetForPreview.serial}
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="border-t border-slate-300 mt-3 pt-1.5 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                  <span>ID: {selectedAssetForPreview.id}</span>
                  <span>Ngày in: {new Date().toISOString().slice(0, 10)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => onOpenQRPrintModal(selectedAssetForPreview)}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  Mở hộp thoại in tem
                </button>
              </div>
            </div>

            {/* QR Payload Inspector Card */}
            <div className="bg-slate-900 text-slate-200 p-4 rounded-lg shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-bold uppercase tracking-wider text-[10px]">
                  Cấu trúc Payload QR (Standard Schema)
                </span>
                <button
                  onClick={() =>
                    handleCopyPayload(
                      selectedAssetForPreview.qrInfo?.payload ||
                        `ETMS|${selectedAssetForPreview.code}|${selectedAssetForPreview.serial}|${selectedAssetForPreview.physicalFactory}|v1`
                    )
                  }
                  className="hover:text-white flex items-center gap-1 text-[11px]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedPayload ? 'Đã sao chép!' : 'Sao chép'}
                </button>
              </div>

              <div className="bg-slate-950 p-2.5 rounded font-mono text-[11px] text-emerald-400 break-all border border-slate-800">
                {selectedAssetForPreview.qrInfo?.payload ||
                  `ETMS|${selectedAssetForPreview.code}|${selectedAssetForPreview.serial}|${selectedAssetForPreview.physicalFactory}|v1`}
              </div>

              <div className="text-[10px] text-slate-400 pt-1 leading-relaxed">
                Khi máy quét công nghiệp đọc mã này tại cổng xưởng, hệ thống sẽ tự động đối chiếu ID nội bộ và liên kết tới hồ sơ bảo trì, lịch sử chuyển giao và tình trạng kỹ thuật tức thì.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  AuditCampaign,
  AuditCampaignItem,
  AuditItemScanStatus,
  UserProfile,
  MasterAsset,
  InventoryDiscrepancy,
} from '../../types';
import {
  ClipboardCheck,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Camera,
  QrCode,
  Smartphone,
  Plus,
  Play,
  RotateCcw,
  Check,
  X,
  FileCheck,
} from 'lucide-react';

interface InventoryAuditProps {
  campaigns: AuditCampaign[];
  currentUser: UserProfile;
  assets: MasterAsset[];
  onUpdateCampaign: (updatedCampaign: AuditCampaign) => void;
  onFlagDiscrepancy: (discrepancy: Omit<InventoryDiscrepancy, 'id'>) => void;
}

export const InventoryAudit: React.FC<InventoryAuditProps> = ({
  campaigns,
  currentUser,
  assets,
  onUpdateCampaign,
  onFlagDiscrepancy,
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    campaigns[0]?.id || 'AUD-2025-Q2'
  );
  const activeCampaign =
    campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Mobile Scanner Simulator States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedInput, setScannedInput] = useState('');
  const [scanResultFeedback, setScanResultFeedback] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  // Stats calculation
  const stats = useMemo(() => {
    if (!activeCampaign) {
      return { total: 0, scanned: 0, matched: 0, wrongLocation: 0, wrongCondition: 0, notFound: 0 };
    }
    const items = activeCampaign.items;
    const total = items.length;
    const scanned = items.filter((i) => i.scanStatus !== 'NOT_FOUND').length;
    const matched = items.filter((i) => i.scanStatus === 'MATCHED').length;
    const wrongLocation = items.filter((i) => i.scanStatus === 'WRONG_LOCATION').length;
    const wrongCondition = items.filter((i) => i.scanStatus === 'WRONG_CONDITION').length;
    const notFound = items.filter((i) => i.scanStatus === 'NOT_FOUND').length;
    return { total, scanned, matched, wrongLocation, wrongCondition, notFound };
  }, [activeCampaign]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!activeCampaign) return [];
    return activeCampaign.items.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        item.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.expectedSerial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.expectedLocation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || item.scanStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [activeCampaign, searchTerm, statusFilter]);

  // Handle barcode / QR scan simulation
  const handlePerformScan = (codeToScan?: string) => {
    const targetCode = (codeToScan || scannedInput).trim().toUpperCase();
    if (!targetCode) return;

    if (!activeCampaign) return;

    const matchedItemIndex = activeCampaign.items.findIndex(
      (i) =>
        i.assetCode.toUpperCase() === targetCode ||
        i.expectedSerial.toUpperCase() === targetCode ||
        targetCode.includes(i.assetCode.toUpperCase())
    );

    if (matchedItemIndex === -1) {
      setScanResultFeedback({
        type: 'error',
        message: `Mã "${targetCode}" không nằm trong danh mục kiểm kê của đợt này!`,
      });
      return;
    }

    const currentItem = activeCampaign.items[matchedItemIndex];
    const assetObj = assets.find((a) => a.code === currentItem.assetCode);

    // Determine match or discrepancy
    let newStatus: AuditItemScanStatus = 'MATCHED';
    let feedbackMsg = `Đã khớp chính xác tài sản ${currentItem.assetCode} - ${currentItem.name}!`;

    // Simulate location or condition discrepancy detection
    if (assetObj && assetObj.physicalFactory !== activeCampaign.factory && activeCampaign.factory !== 'ALL') {
      newStatus = 'WRONG_LOCATION';
      feedbackMsg = `Cảnh báo: Thiết bị ${currentItem.assetCode} đang ở ${assetObj.physicalFactory}, khác với NM kiểm kê (${activeCampaign.factory})!`;

      // Automatically offer to flag discrepancy
      onFlagDiscrepancy({
        assetCode: currentItem.assetCode,
        assetName: currentItem.name,
        serial: currentItem.expectedSerial,
        factory: activeCampaign.factory,
        type: 'Sai vị trí thực tế',
        severity: 'Trung bình',
        description: `Phát hiện trong đợt kiểm kê ${activeCampaign.title}: Máy định vị tại ${assetObj.physicalFactory} nhưng kiểm kê tại ${activeCampaign.factory}`,
        reportedBy: currentUser.name,
        reportedDate: new Date().toISOString().slice(0, 10),
        status: 'Chờ xử lý',
        assignedTo: 'Quản đốc xưởng ' + activeCampaign.factory,
      });
    }

    const updatedItems = [...activeCampaign.items];
    updatedItems[matchedItemIndex] = {
      ...currentItem,
      scanStatus: newStatus,
      scannedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      scannedBy: currentUser.name,
    };

    const updatedCampaign: AuditCampaign = {
      ...activeCampaign,
      totalScanned: updatedItems.filter((i) => i.scanStatus !== 'NOT_FOUND').length,
      items: updatedItems,
    };

    onUpdateCampaign(updatedCampaign);
    setScanResultFeedback({
      type: newStatus === 'MATCHED' ? 'success' : 'warning',
      message: feedbackMsg,
    });
    setScannedInput('');
  };

  const STATUS_BADGES: Record<AuditItemScanStatus, { label: string; color: string }> = {
    MATCHED: { label: 'Đã quét khớp', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    NOT_FOUND: { label: 'Chưa quét / Chưa tìm thấy', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    WRONG_LOCATION: { label: 'Sai vị trí thực tế', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    WRONG_SERIAL: { label: 'Sai số serial', color: 'bg-red-100 text-red-800 border-red-200' },
    WRONG_CONDITION: { label: 'Sai tình trạng KT', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    UNREGISTERED: { label: 'Tài sản ngoài sổ', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    IN_TRANSIT_NOT_LOST: { label: 'Đang vận chuyển', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    UNINSPECTABLE: { label: 'Chưa thể kiểm tra', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              TRANG 7
            </span>
            <h1 className="text-xl font-black text-navy-950 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
              Kiểm Kê Tài Sản (Stocktaking & Audit)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tổ chức đợt kiểm kê định kỳ, quét mã QR thực địa bằng thiết bị cầm tay và đối soát sai lệch tức thời
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="border border-slate-300 rounded px-3 py-1.5 text-xs bg-white text-slate-800 font-bold"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.factory})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs transition-all flex items-center gap-2 shadow-xs"
          >
            <Smartphone className="w-4 h-4" />
            Mở máy quét QR di động
          </button>
        </div>
      </div>

      {/* Campaign Progress KPI Dashboard */}
      {activeCampaign && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-[11px] text-slate-500 font-medium">Tổng số tài sản</div>
            <div className="text-xl font-black text-navy-950 mt-1">{stats.total}</div>
            <div className="text-[10px] text-slate-400">Danh mục kỳ này</div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-[11px] text-slate-500 font-medium">Đã quét kiểm tra</div>
            <div className="text-xl font-black text-blue-700 mt-1">
              {stats.scanned}{' '}
              <span className="text-xs font-normal text-slate-500">
                ({Math.round((stats.scanned / (stats.total || 1)) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full"
                style={{ width: `${(stats.scanned / (stats.total || 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-emerald-200 shadow-xs">
            <div className="text-[11px] text-emerald-800 font-medium">Khớp hoàn toàn 100%</div>
            <div className="text-xl font-black text-emerald-700 mt-1">{stats.matched}</div>
            <div className="text-[10px] text-emerald-600">Đúng vị trí & serial</div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-amber-200 shadow-xs">
            <div className="text-[11px] text-amber-800 font-medium">Sai vị trí thực tế</div>
            <div className="text-xl font-black text-amber-700 mt-1">{stats.wrongLocation}</div>
            <div className="text-[10px] text-amber-600">Cần xác nhận dời máy</div>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
            <div className="text-[11px] text-slate-500 font-medium">Chưa tìm thấy / Chưa quét</div>
            <div className="text-xl font-black text-slate-600 mt-1">{stats.notFound}</div>
            <div className="text-[10px] text-slate-400">Đang tiếp tục rà soát</div>
          </div>
        </div>
      )}

      {/* Main Checklist Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {/* Filters */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm mã tài sản, số serial, tên thiết bị, line xưởng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Kết quả đối soát:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700 font-medium"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="MATCHED">Đã quét khớp</option>
              <option value="NOT_FOUND">Chưa quét / Chưa tìm thấy</option>
              <option value="WRONG_LOCATION">Sai vị trí</option>
            </select>
          </div>
        </div>

        {/* Audit Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Mã tài sản</th>
                <th className="py-3 px-3">Tên thiết bị</th>
                <th className="py-3 px-3">Số Serial sổ sách</th>
                <th className="py-3 px-3">Vị trí dự kiến</th>
                <th className="py-3 px-3">Trạng thái đối soát</th>
                <th className="py-3 px-3">Thời gian quét</th>
                <th className="py-3 px-3">Người kiểm kê</th>
                <th className="py-3 px-3 text-center">Thao tác nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Không có mục kiểm kê nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const badge = STATUS_BADGES[item.scanStatus] || {
                    label: item.scanStatus,
                    color: 'bg-slate-100 text-slate-700',
                  };

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-navy-950">
                        {item.assetCode}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{item.name}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{item.expectedSerial}</td>
                      <td className="py-3 px-3 text-slate-700">{item.expectedLocation}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {item.scannedAt || '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-700">{item.scannedBy || '—'}</td>
                      <td className="py-3 px-3 text-center">
                        {item.scanStatus === 'NOT_FOUND' ? (
                          <button
                            onClick={() => handlePerformScan(item.assetCode)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-300 rounded font-bold text-emerald-800 text-[11px] transition-all flex items-center gap-1 mx-auto"
                          >
                            <Check className="w-3 h-3" />
                            Xác nhận đã thấy
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold text-[11px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã kiểm
                          </span>
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

      {/* Smartphone QR Scanner Simulator Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col text-white">
            {/* Phone Notch & Header */}
            <div className="pt-3 pb-2 px-6 bg-slate-950 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[11px] font-mono font-bold tracking-wider text-slate-300">
                  CAMERA LIVE SCANNER
                </span>
              </div>
              <button
                onClick={() => {
                  setIsScannerOpen(false);
                  setScanResultFeedback(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Camera Viewport */}
            <div className="p-4 bg-black flex flex-col items-center justify-center relative min-h-[260px]">
              {/* Scan target viewfinder */}
              <div className="w-52 h-52 border-2 border-dashed border-blue-400/80 rounded-lg relative flex items-center justify-center bg-blue-950/20 overflow-hidden">
                {/* Animated green laser scanner line */}
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-bounce" />

                <QrCode className="w-24 h-24 text-slate-600/40" />

                <div className="absolute bottom-2 text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  Hướng camera vào mã QR
                </div>
              </div>

              {/* Feedback alert */}
              {scanResultFeedback && (
                <div
                  className={`mt-3 p-2 rounded text-xs w-full text-center font-bold ${
                    scanResultFeedback.type === 'success'
                      ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-600'
                      : scanResultFeedback.type === 'warning'
                      ? 'bg-amber-900/90 text-amber-200 border border-amber-600'
                      : 'bg-red-900/90 text-red-200 border border-red-600'
                  }`}
                >
                  {scanResultFeedback.message}
                </div>
              )}
            </div>

            {/* Quick barcode test buttons & input */}
            <div className="p-4 bg-slate-950 space-y-3 border-t border-slate-800 text-xs">
              <div className="text-[11px] text-slate-400 font-semibold">
                Quét nhanh thiết bị mẫu trong đợt:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeCampaign?.items.slice(0, 4).map((it) => (
                  <button
                    key={it.id}
                    onClick={() => handlePerformScan(it.assetCode)}
                    className="px-2 py-1 bg-slate-800 hover:bg-blue-600 text-slate-200 rounded text-[11px] font-mono font-bold transition-colors"
                  >
                    {it.assetCode}
                  </button>
                ))}
              </div>

              {/* Manual code input */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Nhập mã QR hoặc số Serial..."
                  value={scannedInput}
                  onChange={(e) => setScannedInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePerformScan();
                  }}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-500 font-mono"
                />
                <button
                  onClick={() => handlePerformScan()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition-colors"
                >
                  Quét
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

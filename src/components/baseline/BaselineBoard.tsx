import React, { useState, useEffect } from 'react';
import {
  TransferOrder,
  UserProfile,
  MasterAsset,
  PlannedAssetItem,
  RegisteredAssetItem,
  AuditEvent,
} from '../../types';
import { Sidebar, NavTab } from '../Sidebar';
import { generateQRCodeDataURL } from '../../utils/qrGenerator';
import {
  Plus,
  Trash2,
  Edit2,
  FileText,
  Upload,
  Check,
  CheckCircle,
  AlertTriangle,
  Printer,
  FileDown,
  Eye,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Calendar,
  X,
  Info,
  QrCode,
} from 'lucide-react';
import {
  COMPRESSOR_IMG,
  CNC_IMG,
  PANEL_IMG,
  TRUCK_IMG,
} from '../../data/mockData';

interface BaselineBoardProps {
  orders: TransferOrder[];
  activeOrder: TransferOrder;
  currentUser: UserProfile;
  masterAssets: MasterAsset[];
  onSelectOrder: (order: TransferOrder) => void;
  onUpdateOrder: (updatedOrder: TransferOrder, auditSummary: string, stepNumber?: number) => void;
  onCreateNewOrder: (newOrder: Partial<TransferOrder>) => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenQRPrintModal: (order: TransferOrder) => void;
  onOpenDiscrepancyModal: (order: TransferOrder) => void;
  onOpenEditModal: (order: TransferOrder) => void;
  onOpenCancelModal: (order: TransferOrder) => void;
}

export const BaselineBoard: React.FC<BaselineBoardProps> = ({
  orders,
  activeOrder,
  currentUser,
  masterAssets,
  onSelectOrder,
  onUpdateOrder,
  onCreateNewOrder,
  onNavigateTab,
  onOpenQRPrintModal,
  onOpenDiscrepancyModal,
  onOpenEditModal,
  onOpenCancelModal,
}) => {
  // Local form state for Block 2 (New Order Planner)
  const [newOrderCode, setNewOrderCode] = useState('TR-0007');
  const [newOrderCreatedDate, setNewOrderCreatedDate] = useState('2025-04-26');
  const [newOrderFrom, setNewOrderFrom] = useState<'Nhà máy A' | 'Nhà máy B' | 'Nhà máy C'>('Nhà máy A');
  const [newOrderTo, setNewOrderTo] = useState<'Nhà máy A' | 'Nhà máy B' | 'Nhà máy C'>('Nhà máy B');
  const [newOrderReason, setNewOrderReason] = useState('Bổ sung năng lực sản xuất quý 2');
  const [newOrderExpectedDate, setNewOrderExpectedDate] = useState('2025-05-05');
  const [newOrderPlanner, setNewOrderPlanner] = useState('Nguyễn Văn A');
  const [newPlannedItems, setNewPlannedItems] = useState<PlannedAssetItem[]>([
    { id: 'NP-1', assetCode: 'TS001', name: 'Máy nén khí', quantity: 1, note: 'Bao gồm bình tích áp' },
    { id: 'NP-2', assetCode: 'TS002', name: 'Máy CNC', quantity: 1, note: 'Bàn giao kèm đồ gá' },
    { id: 'NP-3', assetCode: 'TS003', name: 'Tủ điện', quantity: 2, note: 'Kiểm tra đấu nối tiếp địa' },
  ]);

  // Tab in Block 3
  const [step3Tab, setStep3Tab] = useState<'info' | 'assets' | 'confirm'>('confirm');

  // Signer names in Block 3
  const [signerA, setSignerA] = useState('Trần Văn A');
  const [signDateA, setSignDateA] = useState('2025-04-15');
  const [signerB, setSignerB] = useState('Lê Thị B');
  const [signDateB, setSignDateB] = useState('2025-04-16');

  // QR preview for Block 8
  const [selectedQRAsset, setSelectedQRAsset] = useState<string>('B-TS001');
  const [previewQRUrl, setPreviewQRUrl] = useState<string>('');

  // Modals for editing/adding inside blocks
  const [isAddingAssetModal, setIsAddingAssetModal] = useState(false);
  const [newAssetCode, setNewAssetCode] = useState('TS004');
  const [newAssetName, setNewAssetName] = useState('Máy cắt Laser kim loại');
  const [newAssetSerial, setNewAssetSerial] = useState('SN004-LS-2023');
  const [newAssetQty, setNewAssetQty] = useState(1);
  const [newAssetCondition, setNewAssetCondition] = useState<'Tốt' | 'Đã qua sử dụng'>('Tốt');
  const [newAssetImage, setNewAssetImage] = useState(CNC_IMG);

  // Generate QR code for preview
  useEffect(() => {
    generateQRCodeDataURL(`ETMS|${selectedQRAsset}|${activeOrder.id}|Nhà máy B|2025`).then((url) => {
      setPreviewQRUrl(url);
    });
  }, [selectedQRAsset, activeOrder.id]);

  // Calculate metrics for Block 1
  const totalOrders = orders.length;
  const inProgress = orders.filter(
    (o) => o.status !== 'STICKER_CONFIRMED' && o.status !== 'CANCELLED'
  ).length;
  const waitingBook = orders.filter(
    (o) => o.receiptVerification?.items.length > 0 && !o.receiptVerification.hasDiscrepancy && !o.bookTransfer?.completed
  ).length;
  const waitingSticker = orders.filter(
    (o) => o.qrPrinting?.completed && !o.stickerConfirmation?.completed
  ).length;
  const overdue = orders.filter((o) => o.isOverdue).length;
  const completed = orders.filter((o) => o.status === 'STICKER_CONFIRMED').length;

  // Donut chart math
  const donutData = [
    { label: 'Đang xử lý', value: inProgress, color: '#3b82f6' },
    { label: 'Chờ chuyển sổ sách', value: waitingBook, color: '#f59e0b' },
    { label: 'Chờ dán tem', value: waitingSticker, color: '#f97316' },
    { label: 'Quá hạn', value: overdue, color: '#ef4444' },
    { label: 'Hoàn tất', value: completed, color: '#10b981' },
  ];
  const donutTotal = donutData.reduce((acc, d) => acc + d.value, 0) || 1;

  // Handler for creating draft or submitting order
  const handleCreateOrder = (isDraft: boolean) => {
    const newOrd: Partial<TransferOrder> = {
      id: newOrderCode,
      createdDate: newOrderCreatedDate,
      fromFactory: newOrderFrom,
      toFactory: newOrderTo,
      reason: newOrderReason,
      expectedDate: newOrderExpectedDate,
      plannerName: newOrderPlanner,
      status: isDraft ? 'DRAFT' : 'WAITING_CONFIRMATION',
      currentStep: isDraft ? 1 : 2,
      plannedItems: newPlannedItems,
    };
    onCreateNewOrder(newOrd);
  };

  // Handler for Factory A confirmation (Block 3)
  const handleConfirmFactoryA = () => {
    const updated: TransferOrder = {
      ...activeOrder,
      confirmations: {
        ...activeOrder.confirmations,
        factoryA: {
          confirmed: true,
          signerName: signerA,
          signedDate: signDateA,
        },
      },
      currentStep: activeOrder.confirmations.factoryB.confirmed ? 3 : 2,
      status: activeOrder.confirmations.factoryB.confirmed ? 'CONFIRMED' : 'WAITING_CONFIRMATION',
    };
    onUpdateOrder(updated, `Nhà máy A (${signerA}) đã xác nhận lệnh điều động ${activeOrder.id}`, 2);
  };

  // Handler for Factory B confirmation (Block 3)
  const handleConfirmFactoryB = () => {
    const updated: TransferOrder = {
      ...activeOrder,
      confirmations: {
        ...activeOrder.confirmations,
        factoryB: {
          confirmed: true,
          signerName: signerB,
          signedDate: signDateB,
        },
      },
      currentStep: activeOrder.confirmations.factoryA.confirmed ? 3 : 2,
      status: activeOrder.confirmations.factoryA.confirmed ? 'CONFIRMED' : 'WAITING_CONFIRMATION',
    };
    onUpdateOrder(updated, `Nhà máy B (${signerB}) đã xác nhận lệnh điều động ${activeOrder.id}`, 2);
  };

  // Handler for adding asset in Block 4
  const handleAddRegisteredAsset = () => {
    const newItem: RegisteredAssetItem = {
      id: `RI-${Date.now().toString().slice(-4)}`,
      assetCode: newAssetCode,
      name: newAssetName,
      serial: newAssetSerial,
      quantity: newAssetQty,
      condition: newAssetCondition,
      image: newAssetImage,
    };
    const updated: TransferOrder = {
      ...activeOrder,
      registeredItems: [...activeOrder.registeredItems, newItem],
      currentStep: Math.max(activeOrder.currentStep, 3),
      status: 'DISPATCH_REGISTERED',
    };
    onUpdateOrder(updated, `Nhà máy A đã đăng ký thêm tài sản ${newAssetCode} cho lệnh ${activeOrder.id}`, 3);
    setIsAddingAssetModal(false);
  };

  // Handler for deleting asset in Block 4
  const handleDeleteRegisteredAsset = (itemId: string) => {
    const updated: TransferOrder = {
      ...activeOrder,
      registeredItems: activeOrder.registeredItems.filter((i) => i.id !== itemId),
    };
    onUpdateOrder(updated, `Đã xóa tài sản khỏi danh sách điều động ${activeOrder.id}`);
  };

  // Handler for Book Transfer (Block 7)
  const handleConfirmBookTransfer = () => {
    const updated: TransferOrder = {
      ...activeOrder,
      bookTransfer: {
        ...activeOrder.bookTransfer,
        completed: true,
        transferDate: new Date().toISOString().slice(0, 10),
        transferredBy: currentUser.name,
      },
      currentStep: Math.max(activeOrder.currentStep, 8),
      status: 'BOOK_TRANSFERRED',
    };
    onUpdateOrder(updated, `Planner (${currentUser.name}) xác nhận hoàn tất chuyển sổ sách tài sản`, 7);
  };

  // Handler for printing QR tags (Block 8)
  const handlePrintQR = () => {
    const updatedItems = activeOrder.qrPrinting.items.map((it) => ({
      ...it,
      printed: true,
      printDate: new Date().toISOString().slice(0, 10),
    }));
    const updated: TransferOrder = {
      ...activeOrder,
      qrPrinting: {
        ...activeOrder.qrPrinting,
        items: updatedItems,
        printedDate: new Date().toISOString().slice(0, 10),
        printedBy: currentUser.name,
        completed: true,
      },
      currentStep: Math.max(activeOrder.currentStep, 8),
      status: 'QR_PRINTED',
    };
    onUpdateOrder(updated, `Planner (${currentUser.name}) đã phát hành và in tem QR cho lệnh ${activeOrder.id}`, 8);
    onOpenQRPrintModal(updated);
  };

  // Handler for confirming sticker application (Block 9)
  const handleConfirmStickers = () => {
    const updatedItems = activeOrder.stickerConfirmation.items.map((it) => ({
      ...it,
      status: 'Đã dán' as const,
      appliedDate: new Date().toISOString().slice(0, 10),
    }));
    const updated: TransferOrder = {
      ...activeOrder,
      stickerConfirmation: {
        ...activeOrder.stickerConfirmation,
        items: updatedItems,
        completed: true,
        completedDate: new Date().toISOString().slice(0, 10),
        completedBy: currentUser.name,
        note: 'Đã nhận tem và dán hoàn tất.',
      },
      currentStep: 9,
      status: 'STICKER_CONFIRMED',
    };
    onUpdateOrder(updated, `Nhà máy B (${currentUser.name}) đã xác nhận dán tem hoàn tất lệnh điều động ${activeOrder.id}`, 9);
  };

  return (
    <div className="flex bg-slate-100 min-h-screen text-slate-800">
      {/* 1. Left Sidebar */}
      <Sidebar
        currentTab="dashboard"
        onSelectTab={onNavigateTab}
        activeSubsystem="EQUIPMENT"
        onChangeSubsystem={(sub) => {
          if (sub === 'WORKFORCE') onNavigateTab('workforce-overview');
        }}
        compact={false}
      />

      {/* Main Multi-Block Content */}
      <div className="flex-1 p-3 lg:p-4 space-y-4 max-w-[1700px] overflow-hidden">
        {/* ROW 1: Blocks 1, 2, 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          {/* BLOCK 1: Dashboard Tổng Quan */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-2xs p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                <h2 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span className="text-blue-700 font-extrabold">1.</span>
                  <span>Dashboard tổng quan</span>
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-400">Thời gian thực</span>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-[#e0f2fe] p-2 rounded border border-sky-100">
                  <div className="text-lg font-bold text-sky-900 tabular-nums">{totalOrders}</div>
                  <div className="text-[10px] text-sky-800 font-medium leading-tight">Tổng lệnh</div>
                </div>

                <div className="bg-[#dcfce7] p-2 rounded border border-emerald-100">
                  <div className="text-lg font-bold text-emerald-900 tabular-nums">{inProgress}</div>
                  <div className="text-[10px] text-emerald-800 font-medium leading-tight">Đang xử lý</div>
                </div>

                <div className="bg-[#ffedd5] p-2 rounded border border-orange-100">
                  <div className="text-lg font-bold text-orange-900 tabular-nums">{waitingBook}</div>
                  <div className="text-[10px] text-orange-800 font-medium leading-tight">Chờ chuyển sổ sách</div>
                </div>

                <div className="bg-[#fee2e2] p-2 rounded border border-rose-100">
                  <div className="text-lg font-bold text-rose-900 tabular-nums">{waitingSticker}</div>
                  <div className="text-[10px] text-rose-800 font-medium leading-tight">Chờ dán tem</div>
                </div>

                <div className="bg-[#fee2e2] p-2 rounded border border-rose-100">
                  <div className="text-lg font-bold text-rose-900 tabular-nums">{overdue}</div>
                  <div className="text-[10px] text-rose-800 font-medium leading-tight">Quá hạn</div>
                </div>

                <div className="bg-[#dcfce7] p-2 rounded border border-emerald-100">
                  <div className="text-lg font-bold text-emerald-900 tabular-nums">{completed}</div>
                  <div className="text-[10px] text-emerald-800 font-medium leading-tight">Hoàn tất</div>
                </div>
              </div>

              {/* Status Chart + Recent Orders Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                {/* SVG Donut Chart */}
                <div>
                  <h3 className="text-xs font-bold text-slate-800 mb-1.5">Tình trạng lệnh điều động</h3>
                  <div className="flex items-center gap-2">
                    <div className="relative w-20 h-20 shrink-0">
                      <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                        {/* Background ring */}
                        <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                        {/* Slice segments */}
                        {donutData.map((d, i) => {
                          const pct = (d.value / donutTotal) * 100;
                          const prevPct = donutData
                            .slice(0, i)
                            .reduce((sum, item) => sum + (item.value / donutTotal) * 100, 0);
                          const strokeDasharray = `${pct} ${100 - pct}`;
                          const strokeDashoffset = -prevPct;
                          return (
                            <circle
                              key={d.label}
                              cx="18"
                              cy="18"
                              r="14"
                              fill="transparent"
                              stroke={d.color}
                              strokeWidth="4"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              pathLength="100"
                            />
                          );
                        })}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-bold text-slate-800 tabular-nums">{totalOrders}</span>
                        <span className="text-[8px] text-slate-400">lệnh</span>
                      </div>
                    </div>

                    <div className="space-y-0.5 text-[10px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Đang xử lý</span>
                        <span className="font-semibold ml-auto tabular-nums">{inProgress}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Chờ sổ sách</span>
                        <span className="font-semibold ml-auto tabular-nums">{waitingBook}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        <span>Chờ dán tem</span>
                        <span className="font-semibold ml-auto tabular-nums">{waitingSticker}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>Quá hạn</span>
                        <span className="font-semibold ml-auto tabular-nums">{overdue}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Hoàn tất</span>
                        <span className="font-semibold ml-auto tabular-nums">{completed}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders List */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-bold text-slate-800">Lệnh gần đây</h3>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('orders')}
                      className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                    >
                      Xem tất cả
                    </button>
                  </div>
                  <div className="space-y-1">
                    {orders.slice(0, 5).map((ord) => {
                      const isActive = activeOrder.id === ord.id;
                      return (
                        <div
                          key={ord.id}
                          onClick={() => onSelectOrder(ord)}
                          className={`flex items-center justify-between p-1.5 rounded text-[11px] cursor-pointer transition-colors ${
                            isActive ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-mono font-bold text-blue-700">{ord.id}</span>
                          <span className="text-slate-500 text-[10px]">
                            {ord.fromFactory.replace('Nhà máy ', '')} → {ord.toFactory.replace('Nhà máy ', '')}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                              ord.status === 'STICKER_CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.isOverdue
                                ? 'bg-rose-100 text-rose-800'
                                : ord.status === 'WAITING_CONFIRMATION'
                                ? 'bg-sky-100 text-sky-800'
                                : ord.status === 'QR_PRINTED'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.status === 'STICKER_CONFIRMED'
                              ? 'Hoàn tất'
                              : ord.isOverdue
                              ? 'Quá hạn'
                              : ord.status === 'WAITING_CONFIRMATION'
                              ? 'Chờ xác nhận'
                              : ord.status === 'QR_PRINTED'
                              ? 'Chờ dán tem'
                              : 'Đang xử lý'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Đang chọn: <strong className="font-mono text-blue-700">{activeOrder.id}</strong></span>
              <button
                type="button"
                onClick={() => onOpenEditModal(activeOrder)}
                className="text-slate-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Sửa lệnh</span>
              </button>
            </div>
          </section>

          {/* BLOCK 2: Tạo Lệnh Điều Động (Planner) */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-2xs p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-mono text-slate-400">← Lệnh điều động</span>
                  <span>&gt;</span>
                  <span className="font-bold text-slate-800">Tạo lệnh mới</span>
                </div>
                <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded">
                  2. Tạo lệnh điều động (Planner)
                </span>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Mã lệnh</label>
                  <input
                    type="text"
                    value={newOrderCode}
                    onChange={(e) => setNewOrderCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Ngày tạo</label>
                  <input
                    type="text"
                    value={newOrderCreatedDate}
                    onChange={(e) => setNewOrderCreatedDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Nhà máy đi (A)</label>
                  <select
                    value={newOrderFrom}
                    onChange={(e) => setNewOrderFrom(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs focus:bg-white"
                  >
                    <option value="Nhà máy A">Nhà máy A</option>
                    <option value="Nhà máy B">Nhà máy B</option>
                    <option value="Nhà máy C">Nhà máy C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Nhà máy đến (B)</label>
                  <select
                    value={newOrderTo}
                    onChange={(e) => setNewOrderTo(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs focus:bg-white"
                  >
                    <option value="Nhà máy B">Nhà máy B</option>
                    <option value="Nhà máy A">Nhà máy A</option>
                    <option value="Nhà máy C">Nhà máy C</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-500 mb-0.5">Lý do điều động</label>
                  <input
                    type="text"
                    value={newOrderReason}
                    onChange={(e) => setNewOrderReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Thời gian dự kiến</label>
                  <input
                    type="text"
                    value={newOrderExpectedDate}
                    onChange={(e) => setNewOrderExpectedDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Người phụ trách</label>
                  <input
                    type="text"
                    value={newOrderPlanner}
                    onChange={(e) => setNewOrderPlanner(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs focus:bg-white"
                  />
                </div>
              </div>

              {/* Table Planned Items */}
              <div className="mb-2">
                <div className="text-[11px] font-bold text-slate-700 mb-1">Danh sách thiết bị dự kiến</div>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-1 px-2 font-medium">STT</th>
                        <th className="py-1 px-2 font-medium">Mã tài sản</th>
                        <th className="py-1 px-2 font-medium">Tên thiết bị</th>
                        <th className="py-1 px-2 font-medium text-center">Số lượng</th>
                        <th className="py-1 px-2 font-medium">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {newPlannedItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-1 px-2 tabular-nums">{idx + 1}</td>
                          <td className="py-1 px-2 font-mono font-semibold text-blue-700">{item.assetCode}</td>
                          <td className="py-1 px-2 text-slate-800">{item.name}</td>
                          <td className="py-1 px-2 text-center tabular-nums">{item.quantity}</td>
                          <td className="py-1 px-2 text-slate-500 text-[10px] truncate max-w-[80px]">{item.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const nextCode = `TS00${newPlannedItems.length + 1}`;
                  setNewPlannedItems([
                    ...newPlannedItems,
                    {
                      id: `NP-${Date.now()}`,
                      assetCode: nextCode,
                      name: 'Thiết bị phụ trợ',
                      quantity: 1,
                      note: 'Đề xuất thêm',
                    },
                  ]);
                }}
                className="text-[11px] font-medium text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer bg-blue-50 px-2 py-1 rounded"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm thiết bị</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCreateOrder(true)}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                >
                  Lưu nháp
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateOrder(false)}
                  className="px-3 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs cursor-pointer"
                >
                  Gửi lệnh điều động
                </button>
              </div>
            </div>
          </section>

          {/* BLOCK 3: Xác Nhận Lệnh (Nhà máy A và B) */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-2xs p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <h2 className="font-bold text-xs text-slate-900 tracking-tight">
                  <span className="text-blue-700 font-extrabold">3. </span>
                  Xác nhận lệnh (Nhà máy A và B)
                </h2>
                <span className="text-[10px] text-slate-400 font-mono">Order: {activeOrder.id}</span>
              </div>

              {/* Order Info Summary */}
              <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px] grid grid-cols-2 gap-x-2 gap-y-1 mb-2">
                <div>
                  <span className="text-slate-500">Mã lệnh: </span>
                  <span className="font-mono font-bold text-slate-800">{activeOrder.id}</span>
                </div>
                <div>
                  <span className="text-slate-500">Trạng thái: </span>
                  <span className="font-semibold text-orange-600">
                    {activeOrder.confirmations.factoryA.confirmed && activeOrder.confirmations.factoryB.confirmed
                      ? 'Đã xác nhận'
                      : 'Chờ xác nhận'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Nhà máy đi: </span>
                  <span className="font-medium text-slate-800">{activeOrder.fromFactory}</span>
                </div>
                <div>
                  <span className="text-slate-500">Nhà máy đến: </span>
                  <span className="font-medium text-slate-800">{activeOrder.toFactory}</span>
                </div>
                <div>
                  <span className="text-slate-500">Lý do: </span>
                  <span className="text-slate-700">{activeOrder.reason}</span>
                </div>
                <div>
                  <span className="text-slate-500">Ngày dự kiến: </span>
                  <span className="text-slate-700 font-mono">{activeOrder.expectedDate}</span>
                </div>
              </div>

              {/* Sub tabs */}
              <div className="flex border-b border-slate-200 text-xs mb-2">
                <button
                  type="button"
                  onClick={() => setStep3Tab('info')}
                  className={`px-2.5 py-1 text-[11px] font-medium border-b-2 cursor-pointer ${
                    step3Tab === 'info' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Thông tin lệnh
                </button>
                <button
                  type="button"
                  onClick={() => setStep3Tab('assets')}
                  className={`px-2.5 py-1 text-[11px] font-medium border-b-2 cursor-pointer ${
                    step3Tab === 'assets' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Danh sách thiết bị
                </button>
                <button
                  type="button"
                  onClick={() => setStep3Tab('confirm')}
                  className={`px-2.5 py-1 text-[11px] font-medium border-b-2 cursor-pointer ${
                    step3Tab === 'confirm' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Xác nhận
                </button>
              </div>

              {/* Warning Notice Callout */}
              <div className="bg-amber-50 border border-amber-200 rounded p-1.5 flex items-center gap-1.5 text-[10px] text-amber-800 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Cả nhà máy A và B <strong>cần xác nhận</strong> để tiếp tục quy trình</span>
              </div>

              {/* Tab Contents: Dual Confirmation Columns */}
              {step3Tab === 'confirm' && (
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {/* Factory A Confirmation */}
                  <div className="border border-slate-200 rounded p-2 bg-slate-50/50">
                    <div className="font-bold text-slate-800 mb-1">Xác nhận của Nhà máy A</div>
                    <div className="text-[10px] mb-1">
                      <span className="text-slate-500">Trạng thái: </span>
                      <span className={activeOrder.confirmations.factoryA.confirmed ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                        {activeOrder.confirmations.factoryA.confirmed ? 'Đã xác nhận' : 'Chưa xác nhận'}
                      </span>
                    </div>

                    <div className="mb-1">
                      <label className="block text-[10px] text-slate-500">Người xác nhận</label>
                      <select
                        value={signerA}
                        onChange={(e) => setSignerA(e.target.value)}
                        disabled={activeOrder.confirmations.factoryA.confirmed}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[11px]"
                      >
                        <option value="Trần Văn A">Trần Văn A</option>
                        <option value="Nguyễn Văn K">Nguyễn Văn K (Phó ban)</option>
                      </select>
                    </div>

                    <div className="mb-2">
                      <label className="block text-[10px] text-slate-500">Ngày xác nhận</label>
                      <input
                        type="text"
                        value={activeOrder.confirmations.factoryA.signedDate || signDateA}
                        onChange={(e) => setSignDateA(e.target.value)}
                        disabled={activeOrder.confirmations.factoryA.confirmed}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[11px]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmFactoryA}
                      disabled={activeOrder.confirmations.factoryA.confirmed}
                      className={`w-full py-1 rounded text-[11px] font-semibold text-center cursor-pointer ${
                        activeOrder.confirmations.factoryA.confirmed
                          ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {activeOrder.confirmations.factoryA.confirmed ? '✓ Đã xác nhận' : 'Xác nhận'}
                    </button>
                  </div>

                  {/* Factory B Confirmation */}
                  <div className="border border-slate-200 rounded p-2 bg-slate-50/50">
                    <div className="font-bold text-slate-800 mb-1">Xác nhận của Nhà máy B</div>
                    <div className="text-[10px] mb-1">
                      <span className="text-slate-500">Trạng thái: </span>
                      <span className={activeOrder.confirmations.factoryB.confirmed ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                        {activeOrder.confirmations.factoryB.confirmed ? 'Đã xác nhận' : 'Chưa xác nhận'}
                      </span>
                    </div>

                    <div className="mb-1">
                      <label className="block text-[10px] text-slate-500">Người xác nhận</label>
                      <select
                        value={signerB}
                        onChange={(e) => setSignerB(e.target.value)}
                        disabled={activeOrder.confirmations.factoryB.confirmed}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[11px]"
                      >
                        <option value="Lê Thị B">Lê Thị B</option>
                        <option value="Hoàng Văn T">Hoàng Văn T (Trưởng xưởng)</option>
                      </select>
                    </div>

                    <div className="mb-2">
                      <label className="block text-[10px] text-slate-500">Ngày xác nhận</label>
                      <input
                        type="text"
                        value={activeOrder.confirmations.factoryB.signedDate || signDateB}
                        onChange={(e) => setSignDateB(e.target.value)}
                        disabled={activeOrder.confirmations.factoryB.confirmed}
                        className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[11px]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmFactoryB}
                      disabled={activeOrder.confirmations.factoryB.confirmed}
                      className={`w-full py-1 rounded text-[11px] font-semibold text-center cursor-pointer ${
                        activeOrder.confirmations.factoryB.confirmed
                          ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {activeOrder.confirmations.factoryB.confirmed ? '✓ Đã xác nhận' : 'Xác nhận'}
                    </button>
                  </div>
                </div>
              )}

              {step3Tab === 'info' && (
                <div className="text-[11px] text-slate-600 p-2 bg-slate-50 rounded">
                  <p>Lệnh điều động thiết bị nội bộ được phê duyệt theo quy chế trang thiết bị công nghệ số ETMS-2025.</p>
                  <p className="mt-1">Người lập kế hoạch: <strong>{activeOrder.plannerName}</strong></p>
                </div>
              )}

              {step3Tab === 'assets' && (
                <div className="text-[11px] space-y-1">
                  {activeOrder.plannedItems.map((it, i) => (
                    <div key={it.id} className="p-1.5 bg-slate-50 rounded flex justify-between">
                      <span>{i + 1}. {it.name} ({it.assetCode})</span>
                      <span className="font-semibold">{it.quantity} cái</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ROW 2: Blocks 4, 5, 6, 7 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {/* BLOCK 4: Đăng Ký Tài Sản Chuyển Đi (Nhà máy A) */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-2xs p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <h2 className="font-bold text-xs text-slate-900 tracking-tight">
                  <span className="text-blue-700 font-extrabold">4. </span>
                  Đăng ký tài sản chuyển đi (Nhà máy A)
                </h2>
                <button
                  type="button"
                  onClick={() => setIsAddingAssetModal(true)}
                  className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm tài sản</span>
                </button>
              </div>

              <div className="text-[11px] font-bold text-slate-700 mb-1">Danh sách tài sản chuyển đi</div>
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[10px]">
                    <tr>
                      <th className="py-1 px-1.5 font-medium">STT</th>
                      <th className="py-1 px-1.5 font-medium">Mã tài sản</th>
                      <th className="py-1 px-1.5 font-medium">Tên thiết bị</th>
                      <th className="py-1 px-1.5 font-medium">Số serial</th>
                      <th className="py-1 px-1.5 font-medium text-center">SL</th>
                      <th className="py-1 px-1.5 font-medium">Tình trạng</th>
                      <th className="py-1 px-1.5 font-medium text-center">Hình ảnh</th>
                      <th className="py-1 px-1.5 font-medium text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeOrder.registeredItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-1 px-1.5 tabular-nums">{idx + 1}</td>
                        <td className="py-1 px-1.5 font-mono font-semibold text-blue-700">{item.assetCode}</td>
                        <td className="py-1 px-1.5 font-medium text-slate-800">{item.name}</td>
                        <td className="py-1 px-1.5 font-mono text-slate-500 text-[10px]">{item.serial}</td>
                        <td className="py-1 px-1.5 text-center tabular-nums font-semibold">{item.quantity}</td>
                        <td className="py-1 px-1.5">
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                              item.condition === 'Tốt'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.condition}
                          </span>
                        </td>
                        <td className="py-1 px-1.5 text-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-7 h-6 object-cover rounded border border-slate-200 inline-block shadow-2xs"
                          />
                        </td>
                        <td className="py-1 px-1.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setNewAssetCode(item.assetCode);
                                setNewAssetName(item.name);
                                setNewAssetSerial(item.serial);
                                setNewAssetQty(item.quantity);
                                setNewAssetCondition(item.condition as any);
                                setIsAddingAssetModal(true);
                              }}
                              className="text-slate-400 hover:text-blue-600 p-0.5"
                              title="Sửa"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRegisteredAsset(item.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5"
                              title="Xóa"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>Đã đăng ký: <strong>{activeOrder.registeredItems.length}</strong> loại máy</span>
              <span className="text-emerald-600 font-medium">✓ Đã kiểm định</span>
            </div>
          </section>

          {/* BLOCK 5: Tải Biên Bản Giao Nhận (Nhà máy A) */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-2xs p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <h2 className="font-bold text-xs text-slate-900 tracking-tight">
                  <span className="text-blue-700 font-extrabold">5. </span>
                  Tải biên bản giao nhận (Nhà máy A)
                </h2>
                <span className="text-[10px] text-slate-400 font-mono">Step 5</span>
              </div>

              <div className="text-[11px] font-bold text-slate-700 mb-1">Biên bản giao nhận</div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Ngày giao hàng</label>
                  <input
                    type="text"
                    defaultValue={activeOrder.deliveryDoc.deliveryDate || '20/04/2025'}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Số biên bản</label>
                  <input
                    type="text"
                    defaultValue={activeOrder.deliveryDoc.docNumber || 'BBGN-0006'}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Upload PDF Section */}
              <div className="mb-2">
                <label className="block text-[10px] text-slate-500 mb-0.5">Tải file biên bản (PDF, ảnh)</label>
                <div className="flex items-center gap-2 mb-1.5">
                  <label className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>Chọn file</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const updatedDoc = {
                            ...activeOrder.deliveryDoc,
                            files: [
                              ...activeOrder.deliveryDoc.files,
                              {
                                id: `F-${Date.now()}`,
                                name: file.name,
                                size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                                uploadDate: new Date().toISOString().slice(0, 16),
                              },
                            ],
                          };
                          onUpdateOrder(
                            { ...activeOrder, deliveryDoc: updatedDoc, currentStep: Math.max(activeOrder.currentStep, 5) },
                            `Đã tải lên chứng từ ${file.name}`,
                            5
                          );
                        }
                      }}
                    />
                  </label>
                </div>

                {/* File list */}
                <div className="space-y-1">
                  {activeOrder.deliveryDoc.files.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-1 bg-slate-50 border border-slate-200 rounded text-[10px]"
                    >
                      <div className="flex items-center gap-1 truncate text-slate-700">
                        <FileText className="w-3 h-3 text-blue-600 shrink-0" />
                        <span className="truncate">{f.name} ({f.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedDoc = {
                            ...activeOrder.deliveryDoc,
                            files: activeOrder.deliveryDoc.files.filter((item) => item.id !== f.id),
                          };
                          onUpdateOrder({ ...activeOrder, deliveryDoc: updatedDoc }, `Đã gỡ file ${f.name}`);
                        }}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Photos Gallery */}
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Hình ảnh giao hàng</label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {activeOrder.deliveryDoc.shipmentImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Shipment photo ${i + 1}`}
                      className="w-12 h-10 object-cover rounded border border-slate-200 shrink-0 shadow-2xs"
                    />
                  ))}
                  <label className="w-12 h-10 border border-dashed border-slate-300 rounded flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-400 cursor-pointer shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                    <span className="text-[8px] leading-tight mt-0.5">Thêm ảnh</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={() => {
                        const updatedDoc = {
                          ...activeOrder.deliveryDoc,
                          shipmentImages: [...activeOrder.deliveryDoc.shipmentImages, TRUCK_IMG],
                        };
                        onUpdateOrder({ ...activeOrder, deliveryDoc: updatedDoc }, 'Thêm ảnh bàn giao thiết bị');
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>Biên bản: <strong>{activeOrder.deliveryDoc.docNumber}</strong></span>
              <span className="text-emerald-600 font-medium">✓ Đầy đủ hồ sơ</span>
            </div>
          </section>

          {/* BLOCK 6: Xác Nhận Nhận Máy (Nhà máy B) */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-2xs p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <h2 className="font-bold text-xs text-slate-900 tracking-tight">
                  <span className="text-blue-700 font-extrabold">6. </span>
                  Xác nhận nhận máy (Nhà máy B)
                </h2>
                <span className="text-[10px] text-slate-400 font-mono">Step 6</span>
              </div>

              <div className="text-[11px] font-bold text-slate-700 mb-1">Đối chiếu thiết bị thực nhận</div>
              <div className="border border-slate-200 rounded overflow-hidden mb-2">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[10px]">
                    <tr>
                      <th className="py-1 px-1 font-medium">STT</th>
                      <th className="py-1 px-1 font-medium">Mã tài sản</th>
                      <th className="py-1 px-1 font-medium">Serial</th>
                      <th className="py-1 px-1 font-medium text-center">SL</th>
                      <th className="py-1 px-1 font-medium">Tình trạng</th>
                      <th className="py-1 px-1 font-medium text-center">Kết quả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[10px]">
                    {activeOrder.receiptVerification.items.map((it, idx) => (
                      <tr key={it.id} className="hover:bg-slate-50">
                        <td className="py-1 px-1 tabular-nums">{idx + 1}</td>
                        <td className="py-1 px-1 font-mono font-semibold text-blue-700">{it.assetCode}</td>
                        <td className="py-1 px-1 font-mono text-slate-500">{it.serial}</td>
                        <td className="py-1 px-1 text-center tabular-nums font-semibold">{it.quantity}</td>
                        <td className="py-1 px-1 text-slate-700">{it.condition}</td>
                        <td className="py-1 px-1 text-center">
                          <span
                            className={`px-1 py-0.2 rounded font-semibold text-[9px] ${
                              it.matchResult === 'Đủ'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            ✓ {it.matchResult}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mb-2">
                <label className="block text-[10px] text-slate-500 mb-0.5">Ghi chú</label>
                <input
                  type="text"
                  defaultValue={activeOrder.receiptVerification.note || 'Nhận đủ, tình trạng tốt.'}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
                />
              </div>

              {/* Discrepancy Alert if any */}
              {activeOrder.receiptVerification.hasDiscrepancy && (
                <div className="bg-rose-50 border border-rose-200 rounded p-1.5 text-[10px] text-rose-800 mb-2">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>Có sai lệch: {activeOrder.receiptVerification.discrepancyRecord?.type}</span>
                  </div>
                  <div>{activeOrder.receiptVerification.discrepancyRecord?.description}</div>
                </div>
              )}
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const updated: TransferOrder = {
                    ...activeOrder,
                    receiptVerification: {
                      ...activeOrder.receiptVerification,
                      hasDiscrepancy: false,
                      verifiedDate: new Date().toISOString().slice(0, 10),
                      verifiedBy: currentUser.name,
                      note: 'Nhận đủ, tình trạng tốt.',
                    },
                    bookTransfer: {
                      ...activeOrder.bookTransfer,
                      eligible: true,
                    },
                    currentStep: Math.max(activeOrder.currentStep, 7),
                    status: 'RECEIVED_VERIFIED',
                  };
                  onUpdateOrder(updated, `Nhà máy B (${currentUser.name}) đã xác nhận nhận đúng đủ máy móc`, 6);
                }}
                className="w-full py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs cursor-pointer"
              >
                Xác nhận nhận máy
              </button>
              <button
                type="button"
                onClick={() => onOpenDiscrepancyModal(activeOrder)}
                className="w-full py-0.5 text-[10px] text-slate-500 hover:text-rose-600 text-center cursor-pointer"
              >
                Báo cáo sai lệch / Sự cố bàn giao
              </button>
            </div>
          </section>

          {/* BLOCK 7: Chuyển Sổ Sách (Planner) */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-2xs p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <h2 className="font-bold text-xs text-slate-900 tracking-tight">
                  <span className="text-blue-700 font-extrabold">7. </span>
                  Chuyển sổ sách (Planner)
                </h2>
                <span className="text-[10px] text-slate-400 font-mono">Step 7</span>
              </div>

              {/* Eligibility check badge */}
              <div className="bg-emerald-50 border border-emerald-200 rounded p-1.5 flex items-center gap-1.5 text-[10px] text-emerald-800 mb-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Đã đủ điều kiện để chuyển sổ sách tài sản.</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Ngày chuyển sổ sách</label>
                  <input
                    type="text"
                    defaultValue={activeOrder.bookTransfer.transferDate || '22/04/2025'}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Người thực hiện</label>
                  <input
                    type="text"
                    defaultValue={activeOrder.bookTransfer.transferredBy || 'Nguyễn Văn A'}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Số chứng từ kế toán tham chiếu</label>
                  <input
                    type="text"
                    defaultValue={activeOrder.bookTransfer.referenceDocNumber || 'KT-CK-2025/089'}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Ghi chú</label>
                  <input
                    type="text"
                    defaultValue={activeOrder.bookTransfer.note || 'Cập nhật nhà máy quản lý từ A sang B.'}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleConfirmBookTransfer}
                disabled={activeOrder.bookTransfer.completed}
                className={`w-full py-1.5 text-xs font-semibold rounded shadow-xs cursor-pointer ${
                  activeOrder.bookTransfer.completed
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {activeOrder.bookTransfer.completed ? '✓ Đã chuyển sổ sách' : 'Xác nhận chuyển sổ sách'}
              </button>
            </div>
          </section>
        </div>

        {/* ROW 3: Blocks 8 & 9 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {/* BLOCK 8: In Tem Tài Sản Mới (Planner) */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-2xs p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <h2 className="font-bold text-xs text-slate-900 tracking-tight">
                  <span className="text-blue-700 font-extrabold">8. </span>
                  In tem tài sản mới (Planner)
                </h2>
                <span className="text-[10px] text-slate-400 font-mono">Step 8</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Table of QR labels */}
                <div className="sm:col-span-2">
                  <div className="text-[11px] font-bold text-slate-700 mb-1">Danh sách tem cần in</div>
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[10px]">
                        <tr>
                          <th className="py-1 px-2 font-medium">STT</th>
                          <th className="py-1 px-2 font-medium">Mã tài sản mới</th>
                          <th className="py-1 px-2 font-medium">Tên thiết bị</th>
                          <th className="py-1 px-2 font-medium text-center">QR Code</th>
                          <th className="py-1 px-2 font-medium">Trạng thái tem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeOrder.qrPrinting.items.map((item, idx) => (
                          <tr
                            key={item.newAssetCode}
                            onClick={() => setSelectedQRAsset(item.newAssetCode)}
                            className={`cursor-pointer ${
                              selectedQRAsset === item.newAssetCode ? 'bg-blue-50 font-medium' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-1.5 px-2 tabular-nums">{idx + 1}</td>
                            <td className="py-1.5 px-2 font-mono font-bold text-blue-700">{item.newAssetCode}</td>
                            <td className="py-1.5 px-2 text-slate-800">{item.name}</td>
                            <td className="py-1.5 px-2 text-center">
                              <span className="inline-block p-0.5 bg-slate-100 rounded border border-slate-300">
                                <QrCode className="w-3.5 h-3.5 text-slate-800" />
                              </span>
                            </td>
                            <td className="py-1.5 px-2">
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                  item.printed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {item.printed ? 'Đã in' : 'Chưa in'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mẫu tem tài sản card (Preview) */}
                <div className="border border-slate-200 rounded p-2.5 bg-slate-50/50 flex flex-col items-center justify-between">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 self-start">
                    Mẫu tem tài sản
                  </div>

                  <div className="bg-white p-2 border-2 border-slate-900 rounded shadow-xs flex flex-col items-center text-center my-1">
                    {previewQRUrl ? (
                      <img src={previewQRUrl} alt="QR Code Preview" className="w-20 h-20" />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 flex items-center justify-center">
                        <QrCode className="w-10 h-10 text-slate-400" />
                      </div>
                    )}
                    <div className="font-mono font-black text-sm tracking-tight text-slate-900 mt-1">
                      {selectedQRAsset}
                    </div>
                    <div className="text-[9px] text-slate-500 font-semibold tracking-wide">
                      Nhà máy B - 2025
                    </div>
                  </div>

                  <div className="w-full flex items-center gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={handlePrintQR}
                      className="flex-1 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Printer className="w-3 h-3" />
                      <span>In tem</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenQRPrintModal(activeOrder)}
                      className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <FileDown className="w-3 h-3" />
                      <span>Tải file PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* BLOCK 9: Xác Nhận Dán Tem (Nhà máy B) */}
          <section className="bg-white rounded-lg border border-slate-200 shadow-2xs p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <h2 className="font-bold text-xs text-slate-900 tracking-tight">
                  <span className="text-blue-700 font-extrabold">9. </span>
                  Xác nhận dán tem (Nhà máy B)
                </h2>
                <span className="text-[10px] text-slate-400 font-mono">Step 9 (Hoàn tất)</span>
              </div>

              <div className="text-[11px] font-bold text-slate-700 mb-1">Xác nhận dán tem lên thiết bị</div>
              <div className="border border-slate-200 rounded overflow-hidden mb-2">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[10px]">
                    <tr>
                      <th className="py-1 px-2 font-medium">STT</th>
                      <th className="py-1 px-2 font-medium">Mã tài sản</th>
                      <th className="py-1 px-2 font-medium text-center">Ảnh tem</th>
                      <th className="py-1 px-2 font-medium text-center">Ảnh dán thực tế</th>
                      <th className="py-1 px-2 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeOrder.stickerConfirmation.items.map((it, idx) => (
                      <tr key={it.id} className="hover:bg-slate-50">
                        <td className="py-1.5 px-2 tabular-nums">{idx + 1}</td>
                        <td className="py-1.5 px-2 font-mono font-bold text-blue-700">{it.assetCode}</td>
                        <td className="py-1.5 px-2 text-center">
                          <span className="inline-block p-0.5 bg-slate-100 rounded border border-slate-300">
                            <QrCode className="w-3.5 h-3.5 text-slate-800" />
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          {it.actualPhoto ? (
                            <img
                              src={it.actualPhoto}
                              alt={`Dán tem ${it.assetCode}`}
                              className="w-8 h-6 object-cover rounded border border-slate-200 inline-block shadow-2xs"
                            />
                          ) : (
                            <label className="text-[9px] text-blue-600 hover:underline cursor-pointer">
                              + Tải ảnh
                              <input
                                type="file"
                                className="hidden"
                                onChange={() => {
                                  const updatedStickers = activeOrder.stickerConfirmation.items.map((s) =>
                                    s.id === it.id ? { ...s, actualPhoto: COMPRESSOR_IMG, status: 'Đã dán' as const } : s
                                  );
                                  onUpdateOrder(
                                    {
                                      ...activeOrder,
                                      stickerConfirmation: {
                                        ...activeOrder.stickerConfirmation,
                                        items: updatedStickers,
                                      },
                                    },
                                    `Tải ảnh dán tem cho tài sản ${it.assetCode}`
                                  );
                                }}
                              />
                            </label>
                          )}
                        </td>
                        <td className="py-1.5 px-2">
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                              it.status === 'Đã dán' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {it.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mb-2">
                <label className="block text-[10px] text-slate-500 mb-0.5">Ghi chú</label>
                <input
                  type="text"
                  defaultValue={activeOrder.stickerConfirmation.note || 'Đã nhận tem và dán hoàn tất.'}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">
                {activeOrder.stickerConfirmation.completed
                  ? `✓ Hoàn tất: ${activeOrder.stickerConfirmation.completedDate}`
                  : 'Chờ đại diện NM B ký chốt'}
              </span>
              <button
                type="button"
                onClick={handleConfirmStickers}
                disabled={activeOrder.stickerConfirmation.completed}
                className={`px-4 py-1.5 rounded text-xs font-semibold cursor-pointer shadow-xs ${
                  activeOrder.stickerConfirmation.completed
                    ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {activeOrder.stickerConfirmation.completed ? '✓ Lệnh đã hoàn tất' : 'Xác nhận hoàn tất'}
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Modal: Thêm tài sản chuyển đi (Block 4) */}
      {isAddingAssetModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 border border-slate-200">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Đăng ký tài sản chuyển đi</h3>
              <button
                type="button"
                onClick={() => setIsAddingAssetModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Mã tài sản</label>
                <input
                  type="text"
                  value={newAssetCode}
                  onChange={(e) => setNewAssetCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Tên thiết bị</label>
                <input
                  type="text"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Số serial</label>
                <input
                  type="text"
                  value={newAssetSerial}
                  onChange={(e) => setNewAssetSerial(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Số lượng</label>
                  <input
                    type="number"
                    min="1"
                    value={newAssetQty}
                    onChange={(e) => setNewAssetQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Tình trạng</label>
                  <select
                    value={newAssetCondition}
                    onChange={(e) => setNewAssetCondition(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5"
                  >
                    <option value="Tốt">Tốt</option>
                    <option value="Đã qua sử dụng">Đã qua sử dụng</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Chọn ảnh minh chứng thiết bị</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { img: COMPRESSOR_IMG, name: 'Máy nén khí' },
                    { img: CNC_IMG, name: 'Máy CNC' },
                    { img: PANEL_IMG, name: 'Tủ điện' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setNewAssetImage(item.img)}
                      className={`cursor-pointer border-2 rounded p-1 text-center ${
                        newAssetImage === item.img ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
                      }`}
                    >
                      <img src={item.img} alt={item.name} className="w-full h-12 object-cover rounded mb-1" />
                      <span className="text-[10px] text-slate-700 block truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingAssetModal(false)}
                className="px-3 py-1.5 rounded text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAddRegisteredAsset}
                className="px-3 py-1.5 rounded text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs"
              >
                Thêm vào danh sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

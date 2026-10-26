import React, { useState, useEffect } from 'react';
import {
  TransferOrder,
  UserProfile,
  MasterAsset,
  AuditEvent,
  DiscrepancyRecord,
} from './types';
import {
  getStoredOrders,
  saveStoredOrders,
  getStoredAssets,
  saveStoredAssets,
  getStoredAuditLogs,
  addStoredAuditLog,
  getStoredCurrentUser,
  saveStoredCurrentUser,
  resetToInitialBaseline,
} from './services/storage';
import { Header } from './components/Header';
import { WorkflowBanner } from './components/WorkflowBanner';
import { Sidebar, NavTab } from './components/Sidebar';
import { BaselineBoard } from './components/baseline/BaselineBoard';
import { OrderList } from './components/orders/OrderList';
import { OrderDetailModal } from './components/orders/OrderDetailModal';
import { EditOrderModal } from './components/orders/EditOrderModal';
import { CancelOrderModal } from './components/orders/CancelOrderModal';
import { QRPrintModal } from './components/qr/QRPrintModal';
import { DiscrepancyModal } from './components/discrepancies/DiscrepancyModal';
import { AssetManagement } from './components/assets/AssetManagement';
import { AuditLogView } from './components/audit/AuditLogView';
import { DeliveryView } from './components/delivery/DeliveryView';
import { LabelsHubView } from './components/labels/LabelsHubView';
import { SettingsView } from './components/settings/SettingsView';
import { ReportsView } from './components/reports/ReportsView';
import { ToastNotification, ToastMessage } from './components/common/ToastNotification';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  FileSpreadsheet,
  Info,
} from 'lucide-react';

export default function App() {
  const [orders, setOrders] = useState<TransferOrder[]>(getStoredOrders);
  const [assets, setAssets] = useState<MasterAsset[]>(getStoredAssets);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(getStoredAuditLogs);
  const [currentUser, setCurrentUser] = useState<UserProfile>(getStoredCurrentUser);

  // Active selected order for Baseline View (defaults to TR-0006 like in reference image)
  const [activeOrderId, setActiveOrderId] = useState<string>('TR-0006');
  const activeOrder = orders.find((o) => o.id === activeOrderId) || orders[0];

  // View presentation mode: 'baseline' (matching reference screenshot) vs 'detailed'
  const [viewMode, setViewMode] = useState<'baseline' | 'detailed'>('baseline');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Modals
  const [detailModalOrder, setDetailModalOrder] = useState<TransferOrder | null>(null);
  const [editModalOrder, setEditModalOrder] = useState<TransferOrder | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<TransferOrder | null>(null);
  const [qrPrintModalOrder, setQrPrintModalOrder] = useState<TransferOrder | null>(null);
  const [discrepancyModalOrder, setDiscrepancyModalOrder] = useState<TransferOrder | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Toast Notification state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const newToast: ToastMessage = {
      ...toast,
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    setToasts((prev) => [...prev.slice(-3), newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Synchronize active order if orders list changes
  useEffect(() => {
    saveStoredOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveStoredAssets(assets);
  }, [assets]);

  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    saveStoredCurrentUser(user);
  };

  const STEP_TITLES: Record<number, string> = {
    1: 'Tạo lệnh điều động',
    2: 'Xác nhận lệnh điều động',
    3: 'Đăng ký tài sản chuyển đi',
    4: 'Chuyển thiết bị sang NM nhận',
    5: 'Tải biên bản giao nhận & chứng từ',
    6: 'Xác nhận nhận máy & đối chiếu',
    7: 'Chuyển sổ sách tài sản nội bộ',
    8: 'Phát hành tem QR tài sản mới',
    9: 'Xác nhận dán tem — Hoàn tất lệnh',
  };

  // Generic Order Updater with automatic audit logging & toast triggers
  const handleUpdateOrder = (
    updatedOrder: TransferOrder,
    auditSummary: string,
    stepNumber?: number
  ) => {
    const updatedList = orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
    setOrders(updatedList);

    const logged = addStoredAuditLog({
      orderId: updatedOrder.id,
      user: currentUser.name,
      role: currentUser.title,
      action: 'Cập nhật lệnh',
      step: updatedOrder.currentStep,
      summary: auditSummary,
    });
    setAuditLogs((prev) => [logged, ...prev]);

    // Trigger step completion toast if stepNumber provided
    if (stepNumber && STEP_TITLES[stepNumber]) {
      showToast({
        step: stepNumber,
        title: `Hoàn tất Bước ${stepNumber}: ${STEP_TITLES[stepNumber]}`,
        message: auditSummary,
        type: 'success',
      });
    }

    // If step 7 (book transfer) just completed, update Master Asset currentFactory!
    if (updatedOrder.bookTransfer.completed) {
      setAssets((prevAssets) =>
        prevAssets.map((a) => {
          const isItemInOrder = updatedOrder.registeredItems.some((ri) => ri.assetCode === a.code);
          if (isItemInOrder) {
            return {
              ...a,
              currentFactory: updatedOrder.toFactory,
              status: updatedOrder.status === 'STICKER_CONFIRMED' ? 'Sẵn sàng' : 'Đang điều động',
            };
          }
          return a;
        })
      );
    }
  };

  // Create new order handler
  const handleCreateNewOrder = (newOrderData: Partial<TransferOrder>) => {
    const orderId = newOrderData.id || `TR-${Date.now().toString().slice(-4)}`;
    const fullOrder: TransferOrder = {
      id: orderId,
      createdDate: newOrderData.createdDate || new Date().toISOString().slice(0, 10),
      expectedDate: newOrderData.expectedDate || '2025-05-15',
      fromFactory: newOrderData.fromFactory || 'Nhà máy A',
      toFactory: newOrderData.toFactory || 'Nhà máy B',
      reason: newOrderData.reason || 'Điều động bổ sung thiết bị',
      plannerName: newOrderData.plannerName || currentUser.name,
      status: newOrderData.status || 'WAITING_CONFIRMATION',
      currentStep: newOrderData.currentStep || 2,
      isOverdue: false,
      version: 1,
      plannedItems: newOrderData.plannedItems || [],
      confirmations: {
        factoryA: { confirmed: false, signerName: '', signedDate: null },
        factoryB: { confirmed: false, signerName: '', signedDate: null },
      },
      registeredItems: (newOrderData.plannedItems || []).map((p, i) => ({
        id: `RI-${Date.now()}-${i}`,
        assetCode: p.assetCode,
        name: p.name,
        serial: `SN-AUTO-${i + 1}`,
        quantity: p.quantity,
        condition: 'Tốt' as const,
        image: '/src/assets/images/industrial_air_compressor_1793008718761.jpg',
      })),
      transitDetails: {
        carrierName: 'Vận tải Nội bộ Tập đoàn',
        licensePlate: '29C-100.99',
        driverName: 'Đang điều động',
        driverPhone: '0900.000.000',
        departureTime: '',
        sealNumber: '',
        status: 'Chưa khởi hành',
      },
      deliveryDoc: {
        deliveryDate: newOrderData.expectedDate || '',
        docNumber: `BBGN-${orderId.replace('TR-', '')}`,
        files: [],
        shipmentImages: [],
      },
      receiptVerification: {
        items: (newOrderData.plannedItems || []).map((p, i) => ({
          id: `RV-NEW-${i}`,
          assetCode: p.assetCode,
          serial: `SN-AUTO-${i + 1}`,
          quantity: p.quantity,
          condition: 'Tốt',
          matchResult: 'Đủ' as const,
        })),
        hasDiscrepancy: false,
        note: '',
        verifiedDate: null,
        verifiedBy: null,
      },
      bookTransfer: {
        eligible: false,
        transferDate: null,
        transferredBy: null,
        referenceDocNumber: '',
        note: '',
        completed: false,
      },
      qrPrinting: {
        items: (newOrderData.plannedItems || []).map((p) => ({
          newAssetCode: `${newOrderData.toFactory === 'Nhà máy B' ? 'B' : 'C'}-${p.assetCode}`,
          oldAssetCode: p.assetCode,
          name: p.name,
          qrPayload: `ETMS|${p.assetCode}|${orderId}`,
          printed: false,
        })),
        printedDate: null,
        printedBy: null,
        completed: false,
      },
      stickerConfirmation: {
        items: (newOrderData.plannedItems || []).map((p, i) => ({
          id: `SC-NEW-${i}`,
          assetCode: `${newOrderData.toFactory === 'Nhà máy B' ? 'B' : 'C'}-${p.assetCode}`,
          qrImage: '',
          actualPhoto: '',
          status: 'Chưa dán' as const,
        })),
        note: '',
        completed: false,
        completedDate: null,
        completedBy: null,
      },
    };

    setOrders((prev) => [fullOrder, ...prev]);
    setActiveOrderId(orderId);

    const logged = addStoredAuditLog({
      orderId,
      user: currentUser.name,
      role: currentUser.title,
      action: 'Tạo lệnh điều động',
      step: 1,
      summary: `Tạo lệnh điều động mới ${orderId} từ ${fullOrder.fromFactory} sang ${fullOrder.toFactory}`,
    });
    setAuditLogs((prev) => [logged, ...prev]);

    showToast({
      step: 1,
      title: 'Hoàn tất Bước 1: Tạo lệnh điều động',
      message: `Khởi tạo thành công lệnh ${orderId} (${fullOrder.fromFactory} → ${fullOrder.toFactory}).`,
      type: 'success',
    });
  };

  // Cancel order execution
  const handleConfirmCancelOrder = (reason: string, isException: boolean) => {
    if (!cancelModalOrder) return;
    const updated: TransferOrder = {
      ...cancelModalOrder,
      status: 'CANCELLED',
      cancellation: {
        requestedBy: currentUser.name,
        requestedDate: new Date().toISOString().slice(0, 10),
        reason,
        requiresExceptionFlow: isException,
      },
    };
    handleUpdateOrder(
      updated,
      `Hủy lệnh ${cancelModalOrder.id}. Lý do: ${reason} (${isException ? 'Luồng ngoại lệ' : 'Hủy thông thường'})`
    );
  };

  // Discrepancy resolution
  const handleResolveDiscrepancy = (resolutionNote: string, status: 'Đã giải quyết' | 'Duyệt ngoại lệ') => {
    if (!discrepancyModalOrder) return;
    const currentDisc = discrepancyModalOrder.receiptVerification.discrepancyRecord;
    const updatedDisc: DiscrepancyRecord = currentDisc
      ? {
          ...currentDisc,
          status,
          resolutionNote,
        }
      : {
          id: `DISC-${Date.now().toString().slice(-4)}`,
          orderId: discrepancyModalOrder.id,
          reportedBy: currentUser.name,
          reportedDate: new Date().toISOString().slice(0, 10),
          type: 'Hư hỏng khi vận chuyển',
          severity: 'Trung bình',
          description: resolutionNote,
          status,
          assignedTo: currentUser.name,
          resolutionNote,
        };

    const updatedOrder: TransferOrder = {
      ...discrepancyModalOrder,
      receiptVerification: {
        ...discrepancyModalOrder.receiptVerification,
        hasDiscrepancy: false, // Discrepancy has been officially resolved or exception-approved
        discrepancyRecord: updatedDisc,
      },
      bookTransfer: {
        ...discrepancyModalOrder.bookTransfer,
        eligible: true, // Now unblocked for step 7!
      },
      currentStep: Math.max(discrepancyModalOrder.currentStep, 7),
      status: 'RECEIVED_VERIFIED',
    };

    handleUpdateOrder(
      updatedOrder,
      `Xử lý sai lệch lệnh ${discrepancyModalOrder.id}: ${status}. Ghi chú: ${resolutionNote}`
    );
  };

  // Reset database back to reference baseline
  const handleResetData = () => {
    resetToInitialBaseline();
    setOrders(getStoredOrders());
    setAssets(getStoredAssets());
    setAuditLogs(getStoredAuditLogs());
    setCurrentUser(getStoredCurrentUser());
    setActiveOrderId('TR-0006');
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. System Top Header */}
      <Header
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        viewMode={viewMode}
        onChangeViewMode={(mode) => {
          setViewMode(mode);
          if (mode === 'detailed') {
            setCurrentTab('orders');
          }
        }}
        onResetData={() => setIsResetConfirmOpen(true)}
        recentAuditCount={auditLogs.length}
        onOpenAuditLogs={() => setIsAuditModalOpen(true)}
      />

      {/* 2. Top Workflow Stepper Banner (Y hệt ảnh tham chiếu) */}
      <WorkflowBanner
        activeStep={activeOrder.currentStep}
        onSelectStep={(step) => {
          // If clicked in baseline mode, jump to or highlight that step
          if (viewMode === 'detailed') {
            setCurrentTab('orders');
          }
        }}
      />

      {/* 3. Main Workspace Area */}
      {viewMode === 'baseline' && currentTab === 'dashboard' ? (
        /* Baseline 9-Block Multi-View Canvas */
        <main className="flex-1">
          <BaselineBoard
            orders={orders}
            activeOrder={activeOrder}
            currentUser={currentUser}
            masterAssets={assets}
            onSelectOrder={(ord) => setActiveOrderId(ord.id)}
            onUpdateOrder={(ord, summary, step) => handleUpdateOrder(ord, summary, step)}
            onCreateNewOrder={handleCreateNewOrder}
            onNavigateTab={(tab) => {
              if (tab !== 'dashboard') {
                setViewMode('detailed');
                setCurrentTab(tab);
              }
            }}
            onOpenQRPrintModal={(ord) => setQrPrintModalOrder(ord)}
            onOpenDiscrepancyModal={(ord) => setDiscrepancyModalOrder(ord)}
            onOpenEditModal={(ord) => setEditModalOrder(ord)}
            onOpenCancelModal={(ord) => setCancelModalOrder(ord)}
          />
        </main>
      ) : (
        /* Detailed Management Hub (Sidebar + Dedicated View) */
        <div className="flex-1 flex">
          <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} compact={false} />

          <main className="flex-1 p-4 lg:p-6 space-y-4 max-w-[1600px] overflow-hidden">
            {currentTab === 'dashboard' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Không gian quản lý tổng quan</h2>
                    <p className="text-xs text-slate-500">
                      Bấm vào nút bên dưới để chuyển sang <strong>Bố cục tham chiếu V1 (9 Khối tương tác)</strong> như thiết kế gốc.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewMode('baseline')}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs"
                  >
                    Xem 9 khối như ảnh mẫu
                  </button>
                </div>
                <OrderList
                  orders={orders}
                  currentUser={currentUser}
                  onSelectOrder={(ord) => setActiveOrderId(ord.id)}
                  onOpenOrderDetail={(ord) => setDetailModalOrder(ord)}
                  onOpenEditModal={(ord) => setEditModalOrder(ord)}
                  onOpenCancelModal={(ord) => setCancelModalOrder(ord)}
                  onOpenQRPrintModal={(ord) => setQrPrintModalOrder(ord)}
                  onCreateNewClick={() => {
                    setViewMode('baseline');
                  }}
                />
              </div>
            )}

            {currentTab === 'orders' && (
              <OrderList
                orders={orders}
                currentUser={currentUser}
                onSelectOrder={(ord) => setActiveOrderId(ord.id)}
                onOpenOrderDetail={(ord) => setDetailModalOrder(ord)}
                onOpenEditModal={(ord) => setEditModalOrder(ord)}
                onOpenCancelModal={(ord) => setCancelModalOrder(ord)}
                onOpenQRPrintModal={(ord) => setQrPrintModalOrder(ord)}
                onCreateNewClick={() => setViewMode('baseline')}
              />
            )}

            {currentTab === 'assets' && (
              <AssetManagement assets={assets} currentUser={currentUser} />
            )}

            {currentTab === 'delivery' && (
              <DeliveryView
                orders={orders}
                currentUser={currentUser}
                onOpenOrderDetail={(ord) => setDetailModalOrder(ord)}
              />
            )}

            {currentTab === 'labels' && (
              <LabelsHubView
                orders={orders}
                currentUser={currentUser}
                onOpenQRPrintModal={(ord) => setQrPrintModalOrder(ord)}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView orders={orders} assets={assets} />
            )}

            {currentTab === 'settings' && (
              <SettingsView currentUser={currentUser} />
            )}
          </main>
        </div>
      )}

      {/* MODALS */}

      {/* 1. Order Detail Modal */}
      {detailModalOrder && (
        <OrderDetailModal
          order={detailModalOrder}
          currentUser={currentUser}
          auditLogs={auditLogs}
          onClose={() => setDetailModalOrder(null)}
          onOpenEditModal={(ord) => {
            setDetailModalOrder(null);
            setEditModalOrder(ord);
          }}
          onOpenCancelModal={(ord) => {
            setDetailModalOrder(null);
            setCancelModalOrder(ord);
          }}
          onOpenQRPrintModal={(ord) => {
            setDetailModalOrder(null);
            setQrPrintModalOrder(ord);
          }}
          onOpenDiscrepancyModal={(ord) => {
            setDetailModalOrder(null);
            setDiscrepancyModalOrder(ord);
          }}
        />
      )}

      {/* 2. Edit Order Modal */}
      {editModalOrder && (
        <EditOrderModal
          order={editModalOrder}
          currentUser={currentUser}
          onClose={() => setEditModalOrder(null)}
          onSave={(updatedOrder, reason) =>
            handleUpdateOrder(
              updatedOrder,
              `Sửa lệnh ${updatedOrder.id} (lên v${updatedOrder.version}). Lý do: ${reason}`
            )
          }
        />
      )}

      {/* 3. Cancel Order Modal */}
      {cancelModalOrder && (
        <CancelOrderModal
          order={cancelModalOrder}
          currentUser={currentUser}
          onClose={() => setCancelModalOrder(null)}
          onConfirmCancel={handleConfirmCancelOrder}
        />
      )}

      {/* 4. QR Print Modal */}
      {qrPrintModalOrder && (
        <QRPrintModal
          order={qrPrintModalOrder}
          onClose={() => setQrPrintModalOrder(null)}
        />
      )}

      {/* 5. Discrepancy Modal */}
      {discrepancyModalOrder && (
        <DiscrepancyModal
          order={discrepancyModalOrder}
          currentUser={currentUser}
          onClose={() => setDiscrepancyModalOrder(null)}
          onSaveDiscrepancy={(record) => {
            const updatedOrder: TransferOrder = {
              ...discrepancyModalOrder,
              receiptVerification: {
                ...discrepancyModalOrder.receiptVerification,
                hasDiscrepancy: true,
                discrepancyRecord: record,
              },
              status: 'DISCREPANCY_FLAGGED',
            };
            handleUpdateOrder(
              updatedOrder,
              `Báo cáo sai lệch lệnh ${discrepancyModalOrder.id}: ${record.type} - ${record.description}`
            );
          }}
          onResolveDiscrepancy={handleResolveDiscrepancy}
        />
      )}

      {/* 6. Audit Log View Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Nhật Ký Kiểm Toán Hệ Thống Toàn Doanh Nghiệp</h3>
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <AuditLogView logs={auditLogs} currentUser={currentUser} />
            </div>
          </div>
        </div>
      )}

      {/* 7. Reset Data Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-4 border border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm mb-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Khôi phục dữ liệu gốc</span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
              Thao tác này sẽ tải lại 12 lệnh mẫu ban đầu cùng dữ liệu chuẩn xác như trong ảnh tham chiếu.
              Bạn có chắc chắn muốn tiếp tục?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-1.5 rounded text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="px-3.5 py-1.5 rounded text-white bg-rose-600 hover:bg-rose-700 font-semibold shadow-xs cursor-pointer"
              >
                Xác nhận khôi phục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Floating Bottom-Right Toast Notifications for 9-Step Completion */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

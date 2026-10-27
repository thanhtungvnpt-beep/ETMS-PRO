import React, { useState, useEffect } from 'react';
import {
  TransferOrder,
  UserProfile,
  MasterAsset,
  AuditEvent,
  DiscrepancyRecord,
  StockMovement,
  AuditCampaign,
  InventoryDiscrepancy,
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
  getStoredMovements,
  saveStoredMovements,
  addStoredMovement,
  getStoredAuditCampaigns,
  saveStoredAuditCampaigns,
  getStoredInventoryDiscrepancies,
  saveStoredInventoryDiscrepancies,
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

// 10 Inventory Module Components
import { InventoryOverview } from './components/inventory/InventoryOverview';
import { InventoryCatalog } from './components/inventory/InventoryCatalog';
import { InventoryByFactory } from './components/inventory/InventoryByFactory';
import { InventoryIntake } from './components/inventory/InventoryIntake';
import { InventoryDispatch } from './components/inventory/InventoryDispatch';
import { InventoryMovements } from './components/inventory/InventoryMovements';
import { InventoryAudit } from './components/inventory/InventoryAudit';
import { InventoryDiscrepancies } from './components/inventory/InventoryDiscrepancies';
import { InventoryReports } from './components/inventory/InventoryReports';
import { InventoryQRManagement } from './components/inventory/InventoryQRManagement';

// 6 Workforce Module Components (7 Vendor & Weekly SOP)
import { WorkforceOverview } from './components/workforce/WorkforceOverview';
import { WorkforceInput } from './components/workforce/WorkforceInput';
import { WorkforceByFactory } from './components/workforce/WorkforceByFactory';
import { WorkforceByVendor } from './components/workforce/WorkforceByVendor';
import { WorkforceReports } from './components/workforce/WorkforceReports';
import { WorkforceSettings } from './components/workforce/WorkforceSettings';
import {
  ReportingCycleConfig,
  WeeklyWorkforceSubmission,
  WorkforceReminderTask,
} from './types/workforce';
import {
  getStoredWorkforceCycles,
  saveStoredWorkforceCycles,
  getStoredWorkforceSubmissions,
  saveStoredWorkforceSubmissions,
  getStoredWorkforceReminders,
  saveStoredWorkforceReminders,
  getStoredWorkforceThresholds,
  RiskThresholds,
} from './services/workforceStorage';

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

  // Inventory Management State
  const [movements, setMovements] = useState<StockMovement[]>(getStoredMovements);
  const [auditCampaigns, setAuditCampaigns] = useState<AuditCampaign[]>(getStoredAuditCampaigns);
  const [inventoryDiscrepancies, setInventoryDiscrepancies] = useState<InventoryDiscrepancy[]>(
    getStoredInventoryDiscrepancies
  );

  // Workforce Management State (7 Vendor & Weekly SOP)
  const [workforceCycles, setWorkforceCycles] = useState<ReportingCycleConfig[]>(
    getStoredWorkforceCycles
  );
  const [workforceSubmissions, setWorkforceSubmissions] = useState<WeeklyWorkforceSubmission[]>(
    getStoredWorkforceSubmissions
  );
  const [workforceReminders, setWorkforceReminders] = useState<WorkforceReminderTask[]>(
    getStoredWorkforceReminders
  );
  const [workforceThresholds, setWorkforceThresholds] = useState<RiskThresholds>(
    getStoredWorkforceThresholds
  );
  const [editingWorkforceSubmission, setEditingWorkforceSubmission] =
    useState<WeeklyWorkforceSubmission | null>(null);

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

  // Synchronize state changes to localStorage
  useEffect(() => {
    saveStoredOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveStoredAssets(assets);
  }, [assets]);

  useEffect(() => {
    saveStoredMovements(movements);
  }, [movements]);

  useEffect(() => {
    saveStoredAuditCampaigns(auditCampaigns);
  }, [auditCampaigns]);

  useEffect(() => {
    saveStoredInventoryDiscrepancies(inventoryDiscrepancies);
  }, [inventoryDiscrepancies]);

  useEffect(() => {
    saveStoredWorkforceCycles(workforceCycles);
  }, [workforceCycles]);

  useEffect(() => {
    saveStoredWorkforceSubmissions(workforceSubmissions);
  }, [workforceSubmissions]);

  useEffect(() => {
    saveStoredWorkforceReminders(workforceReminders);
  }, [workforceReminders]);

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

  // Generic Order Updater with automatic audit logging, toast triggers & 3-axis inventory sync
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

    // =========================================================================
    // INVENTORY 3-AXIS SYNCHRONIZATION WITH 9-STEP TRANSFER LIFECYCLE
    // =========================================================================
    const orderItems = updatedOrder.registeredItems || [];

    setAssets((prevAssets) =>
      prevAssets.map((asset) => {
        const item = orderItems.find((ri) => ri.assetCode === asset.code);
        if (!item) return asset;

        // Clone current asset
        let updatedAsset = { ...asset };

        // Step 3: Registration for dispatch -> Reserve asset
        if (updatedOrder.currentStep >= 3 && updatedOrder.currentStep < 4) {
          updatedAsset.operationalStatus = 'Đã giữ chỗ';
          updatedAsset.activeTransferId = updatedOrder.id;
        }

        // Step 4 & 5: Physical dispatch in transit
        if (
          updatedOrder.currentStep >= 4 &&
          updatedOrder.currentStep <= 5 &&
          updatedOrder.transitDetails.status === 'Đang vận chuyển'
        ) {
          updatedAsset.physicalFactory = 'Đang vận chuyển';
          updatedAsset.operationalStatus = 'Đang điều động';
          updatedAsset.activeTransferId = updatedOrder.id;
        }

        // Step 6: Receipt verified at destination factory B
        if (updatedOrder.currentStep >= 6) {
          updatedAsset.physicalFactory = updatedOrder.toFactory;
          if (updatedOrder.currentStep === 6) {
            updatedAsset.operationalStatus = 'Chờ kiểm tra';
          }
        }

        // Step 7: Book ownership transfer (Planner manual action)
        if (updatedOrder.bookTransfer?.completed) {
          updatedAsset.bookOwnership = updatedOrder.toFactory;
        }

        // Step 9: Sticker confirmed -> Order is completed!
        if (updatedOrder.stickerConfirmation?.completed || updatedOrder.status === 'STICKER_CONFIRMED') {
          // Switch to new plant code if assigned (e.g. B-TS001)
          const qrItem = updatedOrder.qrPrinting?.items.find((q) => q.oldAssetCode === asset.code);
          if (qrItem && qrItem.newAssetCode) {
            updatedAsset.previousCode = asset.code;
            updatedAsset.code = qrItem.newAssetCode;
          }
          updatedAsset.operationalStatus = 'Sẵn sàng điều chuyển';
          updatedAsset.activeTransferId = undefined;
          if (!updatedAsset.transferHistory.includes(updatedOrder.id)) {
            updatedAsset.transferHistory = [...updatedAsset.transferHistory, updatedOrder.id];
          }
        }

        return updatedAsset;
      })
    );

    // Record StockMovement ledger entries on milestone step completions
    if (stepNumber === 3) {
      orderItems.forEach((ri) => {
        const newMov = addStoredMovement({
          assetInternalId: ri.assetCode,
          assetCode: ri.assetCode,
          assetName: ri.name,
          type: 'DISPATCH_RESERVED',
          fromFactory: updatedOrder.fromFactory,
          toFactory: updatedOrder.toFactory,
          quantity: ri.quantity,
          performedBy: currentUser.name,
          role: currentUser.title,
          reason: `Giữ chỗ thiết bị cho lệnh điều động ${updatedOrder.id}`,
          transferOrderId: updatedOrder.id,
        });
        setMovements((prev) => [newMov, ...prev]);
      });
    } else if (stepNumber === 4) {
      orderItems.forEach((ri) => {
        const newMov = addStoredMovement({
          assetInternalId: ri.assetCode,
          assetCode: ri.assetCode,
          assetName: ri.name,
          type: 'IN_TRANSIT',
          fromFactory: updatedOrder.fromFactory,
          toFactory: updatedOrder.toFactory,
          quantity: ri.quantity,
          performedBy: currentUser.name,
          role: currentUser.title,
          reason: `Bắt đầu vận chuyển thiết bị sang ${updatedOrder.toFactory}. Xe: ${updatedOrder.transitDetails.licensePlate}`,
          transferOrderId: updatedOrder.id,
        });
        setMovements((prev) => [newMov, ...prev]);
      });
    } else if (stepNumber === 6) {
      orderItems.forEach((ri) => {
        const newMov = addStoredMovement({
          assetInternalId: ri.assetCode,
          assetCode: ri.assetCode,
          assetName: ri.name,
          type: 'RECEIPT_CONFIRMED',
          fromFactory: updatedOrder.fromFactory,
          toFactory: updatedOrder.toFactory,
          quantity: ri.quantity,
          performedBy: currentUser.name,
          role: currentUser.title,
          reason: `Xác nhận nhận máy thực tế tại cổng ${updatedOrder.toFactory}`,
          transferOrderId: updatedOrder.id,
        });
        setMovements((prev) => [newMov, ...prev]);
      });
    } else if (stepNumber === 7) {
      orderItems.forEach((ri) => {
        const newMov = addStoredMovement({
          assetInternalId: ri.assetCode,
          assetCode: ri.assetCode,
          assetName: ri.name,
          type: 'BOOK_OWNERSHIP_TRANSFERRED',
          fromFactory: updatedOrder.fromFactory,
          toFactory: updatedOrder.toFactory,
          quantity: ri.quantity,
          performedBy: currentUser.name,
          role: currentUser.title,
          reason: `Chuyển quyền sở hữu tài sản sổ sách kế toán sang ${updatedOrder.toFactory}`,
          transferOrderId: updatedOrder.id,
          referenceDocNumber: updatedOrder.bookTransfer.referenceDocNumber,
        });
        setMovements((prev) => [newMov, ...prev]);
      });
    } else if (stepNumber === 8) {
      orderItems.forEach((ri) => {
        const newMov = addStoredMovement({
          assetInternalId: ri.assetCode,
          assetCode: ri.assetCode,
          assetName: ri.name,
          type: 'QR_ISSUED',
          fromFactory: updatedOrder.fromFactory,
          toFactory: updatedOrder.toFactory,
          quantity: ri.quantity,
          performedBy: currentUser.name,
          role: currentUser.title,
          reason: `Phát hành mã QR tài sản mới cho nhà máy nhận ${updatedOrder.toFactory}`,
          transferOrderId: updatedOrder.id,
        });
        setMovements((prev) => [newMov, ...prev]);
      });
    } else if (stepNumber === 9) {
      orderItems.forEach((ri) => {
        const newMov = addStoredMovement({
          assetInternalId: ri.assetCode,
          assetCode: ri.assetCode,
          assetName: ri.name,
          type: 'STICKER_APPLIED',
          fromFactory: updatedOrder.fromFactory,
          toFactory: updatedOrder.toFactory,
          quantity: ri.quantity,
          performedBy: currentUser.name,
          role: currentUser.title,
          reason: `Dán tem QR hoàn tất trên thiết bị thực tế tại ${updatedOrder.toFactory}`,
          transferOrderId: updatedOrder.id,
        });
        setMovements((prev) => [newMov, ...prev]);
      });
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
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
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

    // Release reservations on master assets
    setAssets((prev) =>
      prev.map((a) => {
        if (a.activeTransferId === cancelModalOrder.id) {
          return {
            ...a,
            activeTransferId: undefined,
            operationalStatus: 'Sẵn sàng điều chuyển',
          };
        }
        return a;
      })
    );
  };

  // Discrepancy resolution from transfer flow
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

  // Inventory Handlers
  const handleAddAsset = (newAsset: MasterAsset, movementReason: string) => {
    setAssets((prev) => [newAsset, ...prev]);

    const newMov = addStoredMovement({
      assetInternalId: newAsset.id,
      assetCode: newAsset.code,
      assetName: newAsset.name,
      type: 'INTAKE',
      fromFactory: newAsset.bookOwnership,
      toFactory: newAsset.bookOwnership,
      toLocation: newAsset.physicalLocation,
      quantity: 1,
      performedBy: currentUser.name,
      role: currentUser.title,
      reason: movementReason,
    });
    setMovements((prev) => [newMov, ...prev]);

    showToast({
      step: 1,
      title: 'Nhập kho tài sản thành công',
      message: `Đã đăng ký ${newAsset.code} (${newAsset.name}) vào ${newAsset.bookOwnership}`,
      type: 'success',
    });
  };

  const handleBatchAddAssets = (newAssets: MasterAsset[], movementReason: string) => {
    setAssets((prev) => [...newAssets, ...prev]);

    newAssets.forEach((a) => {
      const newMov = addStoredMovement({
        assetInternalId: a.id,
        assetCode: a.code,
        assetName: a.name,
        type: 'INTAKE',
        fromFactory: a.bookOwnership,
        toFactory: a.bookOwnership,
        toLocation: a.physicalLocation,
        quantity: 1,
        performedBy: currentUser.name,
        role: currentUser.title,
        reason: movementReason,
      });
      setMovements((prev) => [newMov, ...prev]);
    });

    showToast({
      step: 1,
      title: 'Nhập lô tài sản thành công',
      message: `Đã đăng ký thành công ${newAssets.length} thiết bị qua tệp CSV`,
      type: 'success',
    });
  };

  const handleUpdateAsset = (updated: MasterAsset, reason: string) => {
    setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

    const newMov = addStoredMovement({
      assetInternalId: updated.id,
      assetCode: updated.code,
      assetName: updated.name,
      type: 'LOCATION_CHANGED',
      fromFactory: updated.physicalFactory,
      toFactory: updated.physicalFactory,
      toLocation: updated.physicalLocation,
      quantity: 1,
      performedBy: currentUser.name,
      role: currentUser.title,
      reason,
    });
    setMovements((prev) => [newMov, ...prev]);
  };

  const handleUpdateAuditCampaign = (updatedCampaign: AuditCampaign) => {
    setAuditCampaigns((prev) =>
      prev.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c))
    );
  };

  const handleFlagDiscrepancy = (discrepancy: Omit<InventoryDiscrepancy, 'id'>) => {
    const newDiscrepancy: InventoryDiscrepancy = {
      ...discrepancy,
      id: `IDISC-${(inventoryDiscrepancies.length + 1).toString().padStart(3, '0')}`,
    };
    setInventoryDiscrepancies((prev) => [newDiscrepancy, ...prev]);

    showToast({
      step: 6,
      title: 'Ghi nhận sai lệch tồn kho',
      message: `Mã vụ việc ${newDiscrepancy.id}: ${newDiscrepancy.type} trên ${newDiscrepancy.assetCode}`,
      type: 'warning',
    });
  };

  const handleUpdateDiscrepancy = (updated: InventoryDiscrepancy, note: string) => {
    setInventoryDiscrepancies((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );

    showToast({
      step: 7,
      title: 'Cập nhật hồ sơ sai lệch',
      message: `${updated.id} đã chuyển trạng thái sang "${updated.status}"`,
      type: 'info',
    });
  };

  const handleSaveWorkforceSubmission = (
    submission: WeeklyWorkforceSubmission,
    action: 'DRAFT' | 'SUBMIT' | 'CONFIRM' | 'REJECT',
    reason?: string
  ) => {
    setWorkforceSubmissions((prev) => {
      const idx = prev.findIndex((s) => s.id === submission.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = submission;
        return updated;
      }
      return [submission, ...prev];
    });

    setEditingWorkforceSubmission(null);
    setCurrentTab('workforce-overview');

    if (action === 'SUBMIT') {
      showToast({
        step: 2,
        title: 'Gửi báo cáo nhân lực thành công',
        message: `Đã nộp số liệu tuần của ${submission.vendor} (${submission.factory}) — Quân số: ${submission.totalHeadcount} người.`,
        type: 'success',
      });
    } else {
      showToast({
        step: 1,
        title: 'Đã lưu bản nháp nhân lực',
        message: `Hồ sơ ${submission.vendor} (${submission.factory}) đã được lưu nháp.`,
        type: 'info',
      });
    }
  };

  // Reset database back to reference baseline
  const handleResetData = () => {
    resetToInitialBaseline();
    setOrders(getStoredOrders());
    setAssets(getStoredAssets());
    setAuditLogs(getStoredAuditLogs());
    setCurrentUser(getStoredCurrentUser());
    setMovements(getStoredMovements());
    setAuditCampaigns(getStoredAuditCampaigns());
    setInventoryDiscrepancies(getStoredInventoryDiscrepancies());
    setWorkforceCycles(getStoredWorkforceCycles());
    setWorkforceSubmissions(getStoredWorkforceSubmissions());
    setWorkforceReminders(getStoredWorkforceReminders());
    setWorkforceThresholds(getStoredWorkforceThresholds());
    setActiveOrderId('TR-0006');
    setIsResetConfirmOpen(false);

    showToast({
      step: 1,
      title: 'Khôi phục dữ liệu gốc',
      message: 'Hệ thống đã phục hồi toàn bộ dữ liệu 12 lệnh, tồn kho và nhân lực 7 Vendor ban đầu.',
      type: 'info',
    });
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

      {/* 2. Top 9-Step Visual Workflow Banner */}
      <WorkflowBanner
        activeStep={activeOrder ? activeOrder.currentStep : 1}
        onSelectStep={(step: number) => {
          setViewMode('baseline');
          if (currentTab !== 'dashboard') {
            setCurrentTab('dashboard');
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

          <main className="flex-1 p-4 lg:p-6 space-y-4 max-w-[1600px] overflow-x-hidden">
            {/* Quick Switcher back to 9-block Baseline Canvas */}
            <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-navy-950">Chế độ giao diện:</span>
                <span className="text-xs font-medium text-slate-600">
                  {currentTab.startsWith('workforce-')
                    ? 'Phân hệ Quản lý Nhân lực 7 Vendor & SOP'
                    : currentTab.startsWith('inventory-')
                    ? 'Mô-đun Quản lý Tồn kho'
                    : 'Quản lý Điều động chi tiết'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setViewMode('baseline');
                  setCurrentTab('dashboard');
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-xs transition-colors"
              >
                Trở về 9 Khối Chuẩn V1
              </button>
            </div>

            {/* TAB: Dashboard List */}
            {currentTab === 'dashboard' && (
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

            {/* TAB: Orders List */}
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

            {/* TAB: Legacy Assets */}
            {currentTab === 'assets' && (
              <AssetManagement assets={assets} currentUser={currentUser} />
            )}

            {/* TAB: Delivery */}
            {currentTab === 'delivery' && (
              <DeliveryView
                orders={orders}
                currentUser={currentUser}
                onOpenOrderDetail={(ord) => setDetailModalOrder(ord)}
              />
            )}

            {/* TAB: Labels */}
            {currentTab === 'labels' && (
              <LabelsHubView
                orders={orders}
                currentUser={currentUser}
                onOpenQRPrintModal={(ord) => setQrPrintModalOrder(ord)}
              />
            )}

            {/* TAB: Reports System */}
            {currentTab === 'reports' && (
              <ReportsView orders={orders} assets={assets} />
            )}

            {/* TAB: Settings */}
            {currentTab === 'settings' && (
              <SettingsView currentUser={currentUser} />
            )}

            {/* ============================================================= */}
            {/* 10 INVENTORY MODULE TABS (TỒN KHO THIẾT BỊ LIÊN NHÀ MÁY)       */}
            {/* ============================================================= */}

            {/* 1. Tổng quan tồn kho */}
            {currentTab === 'inventory-overview' && (
              <InventoryOverview
                assets={assets}
                orders={orders}
                movements={movements}
                discrepancies={inventoryDiscrepancies}
                currentUser={currentUser}
                onNavigateTab={(tab) => setCurrentTab(tab as NavTab)}
                onSelectAsset={(asset) => setCurrentTab('inventory-catalog')}
              />
            )}

            {/* 2. Danh mục tài sản */}
            {currentTab === 'inventory-catalog' && (
              <InventoryCatalog
                assets={assets}
                currentUser={currentUser}
                movements={movements}
                onAddAsset={(newAsset) =>
                  handleAddAsset(
                    newAsset as MasterAsset,
                    `Tiếp nhận tài sản mới ${newAsset.code} từ Danh mục`
                  )
                }
                onUpdateAsset={handleUpdateAsset}
                onOpenQRPrintModal={(asset) => {
                  const matchingOrder = orders.find((o) => o.id === asset.activeTransferId) || orders[0];
                  setQrPrintModalOrder(matchingOrder);
                }}
              />
            )}

            {/* 3. Tồn kho theo nhà máy */}
            {currentTab === 'inventory-by-factory' && (
              <InventoryByFactory
                assets={assets}
                orders={orders}
                currentUser={currentUser}
                onSelectAsset={(asset) => setCurrentTab('inventory-catalog')}
                onSelectOrder={(ordId) => {
                  setActiveOrderId(ordId);
                  setViewMode('baseline');
                }}
              />
            )}

            {/* 4. Nhập & tiếp nhận tài sản */}
            {currentTab === 'inventory-intake' && (
              <InventoryIntake
                assets={assets}
                currentUser={currentUser}
                onAddAsset={handleAddAsset}
                onBatchAddAssets={handleBatchAddAssets}
              />
            )}

            {/* 5. Xuất & điều chuyển tài sản */}
            {currentTab === 'inventory-dispatch' && (
              <InventoryDispatch
                assets={assets}
                orders={orders}
                currentUser={currentUser}
                movements={movements}
                onSelectOrder={(ordId) => {
                  setActiveOrderId(ordId);
                  setViewMode('baseline');
                }}
                onSelectAsset={(asset) => setCurrentTab('inventory-catalog')}
              />
            )}

            {/* 6. Lịch sử biến động (Sổ biến động kho) */}
            {currentTab === 'inventory-movements' && (
              <InventoryMovements
                movements={movements}
                currentUser={currentUser}
                assets={assets}
                onSelectOrder={(ordId) => {
                  setActiveOrderId(ordId);
                  setViewMode('baseline');
                }}
              />
            )}

            {/* 7. Kiểm kê tài sản */}
            {currentTab === 'inventory-audit' && (
              <InventoryAudit
                campaigns={auditCampaigns}
                currentUser={currentUser}
                assets={assets}
                onUpdateCampaign={handleUpdateAuditCampaign}
                onFlagDiscrepancy={handleFlagDiscrepancy}
              />
            )}

            {/* 8. Sai lệch tồn kho */}
            {currentTab === 'inventory-discrepancies' && (
              <InventoryDiscrepancies
                discrepancies={inventoryDiscrepancies}
                currentUser={currentUser}
                assets={assets}
                onUpdateDiscrepancy={handleUpdateDiscrepancy}
                onAddDiscrepancy={(newDisc) =>
                  setInventoryDiscrepancies((prev) => [newDisc, ...prev])
                }
              />
            )}

            {/* 9. Báo cáo tồn kho */}
            {currentTab === 'inventory-reports' && (
              <InventoryReports
                assets={assets}
                orders={orders}
                movements={movements}
                discrepancies={inventoryDiscrepancies}
                currentUser={currentUser}
              />
            )}

            {/* 10. Quản lý mã QR tài sản */}
            {currentTab === 'inventory-qr' && (
              <InventoryQRManagement
                assets={assets}
                currentUser={currentUser}
                onOpenQRPrintModal={(asset) => {
                  const matchingOrder = orders.find((o) => o.id === asset.activeTransferId) || orders[0];
                  setQrPrintModalOrder(matchingOrder);
                }}
              />
            )}

            {/* ============================================================= */}
            {/* 6 WORKFORCE MODULE TABS (7 VENDOR & WEEKLY SOP MANAGEMENT)    */}
            {/* ============================================================= */}

            {/* 1. Tổng quan nhân lực */}
            {currentTab === 'workforce-overview' && (
              <WorkforceOverview
                submissions={workforceSubmissions}
                cycles={workforceCycles}
                currentUser={currentUser}
                onNavigateTab={(tab) => setCurrentTab(tab as NavTab)}
                onSelectSubmissionToEdit={(sub) => {
                  setEditingWorkforceSubmission(sub);
                  setCurrentTab('workforce-input');
                }}
              />
            )}

            {/* 2. Nhập số liệu theo tuần */}
            {currentTab === 'workforce-input' && (
              <WorkforceInput
                cycles={workforceCycles}
                submissions={workforceSubmissions}
                currentUser={currentUser}
                editingSubmission={editingWorkforceSubmission}
                onSaveSubmission={handleSaveWorkforceSubmission}
                onCancel={() => {
                  setEditingWorkforceSubmission(null);
                  setCurrentTab('workforce-overview');
                }}
              />
            )}

            {/* 3. Theo nhà máy */}
            {currentTab === 'workforce-by-factory' && (
              <WorkforceByFactory
                submissions={workforceSubmissions}
                cycles={workforceCycles}
                currentUser={currentUser}
                onSelectSubmissionToEdit={(sub) => {
                  setEditingWorkforceSubmission(sub);
                  setCurrentTab('workforce-input');
                }}
              />
            )}

            {/* 4. Theo 7 Vendor */}
            {currentTab === 'workforce-by-vendor' && (
              <WorkforceByVendor
                submissions={workforceSubmissions}
                cycles={workforceCycles}
                currentUser={currentUser}
                onSelectSubmissionToEdit={(sub) => {
                  setEditingWorkforceSubmission(sub);
                  setCurrentTab('workforce-input');
                }}
              />
            )}

            {/* 5. Báo cáo & xuất dữ liệu */}
            {currentTab === 'workforce-reports' && (
              <WorkforceReports
                submissions={workforceSubmissions}
                cycles={workforceCycles}
                currentUser={currentUser}
              />
            )}

            {/* 6. Cấu hình chu kỳ & nhắc việc */}
            {currentTab === 'workforce-settings' && (
              <WorkforceSettings
                cycles={workforceCycles}
                reminders={workforceReminders}
                currentUser={currentUser}
                thresholds={workforceThresholds}
                onUpdateCycles={setWorkforceCycles}
                onUpdateReminders={setWorkforceReminders}
                onUpdateThresholds={setWorkforceThresholds}
              />
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
                <X className="w-5 h-5" />
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
              Thao tác này sẽ tải lại 12 lệnh mẫu ban đầu cùng toàn bộ danh mục tài sản và sổ biến động kho chuẩn xác.
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

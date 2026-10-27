import {
  MasterAsset,
  TransferOrder,
  UserProfile,
  AuditEvent,
  UserRole,
} from '../types';
import {
  INITIAL_ORDERS,
  INITIAL_MASTER_ASSETS,
  INITIAL_AUDIT_LOGS,
  INITIAL_USERS,
} from '../data/mockData';

const STORAGE_KEYS = {
  ORDERS: 'etms_orders_v1',
  ASSETS: 'etms_assets_v1',
  LOGS: 'etms_audit_logs_v1',
  CURRENT_USER: 'etms_current_user_v1',
};

export const getStoredOrders = (): TransferOrder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading orders from localStorage', e);
    return INITIAL_ORDERS;
  }
};

export const saveStoredOrders = (orders: TransferOrder[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving orders to localStorage', e);
  }
};

export const getStoredAssets = (): MasterAsset[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(INITIAL_MASTER_ASSETS));
      return INITIAL_MASTER_ASSETS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading assets', e);
    return INITIAL_MASTER_ASSETS;
  }
};

export const saveStoredAssets = (assets: MasterAsset[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
  } catch (e) {
    console.error('Error saving assets', e);
  }
};

export const getStoredAuditLogs = (): AuditEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading audit logs', e);
    return INITIAL_AUDIT_LOGS;
  }
};

export const addStoredAuditLog = (log: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent => {
  const currentLogs = getStoredAuditLogs();
  const newLog: AuditEvent = {
    ...log,
    id: `EVT-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
  const updated = [newLog, ...currentLogs];
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving audit log', e);
  }
  return newLog;
};

export const getStoredCurrentUser = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
      return INITIAL_USERS[0];
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS[0];
  }
};

export const saveStoredCurrentUser = (user: UserProfile): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

export const resetToInitialBaseline = (): void => {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(INITIAL_MASTER_ASSETS));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
  localStorage.setItem('etms_stock_movements_v1', JSON.stringify(INITIAL_STOCK_MOVEMENTS));
  localStorage.setItem('etms_audit_campaigns_v1', JSON.stringify(INITIAL_AUDIT_CAMPAIGNS));
  localStorage.setItem('etms_inventory_discrepancies_v1', JSON.stringify(INITIAL_INVENTORY_DISCREPANCIES));
};

export interface DashboardMetrics {
  total: number;
  inProgress: number;
  waitingConfirmation: number;
  waitingBookTransfer: number;
  waitingSticker: number;
  overdue: number;
  hasDiscrepancy: number;
  completed: number;
}

export const calculateVerifiedMetrics = (orders: TransferOrder[]): DashboardMetrics => {
  let inProgress = 0;
  let waitingConfirmation = 0;
  let waitingBookTransfer = 0;
  let waitingSticker = 0;
  let overdue = 0;
  let hasDiscrepancy = 0;
  let completed = 0;

  for (const o of orders) {
    if (o.status === 'CANCELLED') continue;

    if (o.status === 'STICKER_CONFIRMED' || o.stickerConfirmation?.completed) {
      completed++;
    } else {
      inProgress++;
    }

    if (o.status === 'WAITING_CONFIRMATION' || (!o.confirmations.factoryA.confirmed || !o.confirmations.factoryB.confirmed)) {
      if (o.status !== 'DRAFT') {
        waitingConfirmation++;
      }
    }

    if (o.receiptVerification?.items.length > 0 && !o.receiptVerification.hasDiscrepancy && !o.bookTransfer?.completed) {
      waitingBookTransfer++;
    }

    if (o.qrPrinting?.completed && !o.stickerConfirmation?.completed) {
      waitingSticker++;
    }

    if (o.isOverdue || (new Date(o.expectedDate) < new Date('2025-04-22') && !o.stickerConfirmation?.completed)) {
      overdue++;
    }

    if (o.receiptVerification?.hasDiscrepancy) {
      hasDiscrepancy++;
    }
  }

  return {
    total: orders.length,
    inProgress,
    waitingConfirmation,
    waitingBookTransfer,
    waitingSticker,
    overdue,
    hasDiscrepancy,
    completed,
  };
};

// ==========================================
// INVENTORY MODULE STORAGE & METRICS
// ==========================================

import {
  StockMovement,
  AuditCampaign,
  InventoryDiscrepancy,
} from '../types';
import {
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_AUDIT_CAMPAIGNS,
  INITIAL_INVENTORY_DISCREPANCIES,
} from '../data/mockData';

const INVENTORY_STORAGE_KEYS = {
  MOVEMENTS: 'etms_stock_movements_v1',
  CAMPAIGNS: 'etms_audit_campaigns_v1',
  DISCREPANCIES: 'etms_inventory_discrepancies_v1',
};

export const getStoredMovements = (): StockMovement[] => {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEYS.MOVEMENTS);
    if (!raw) {
      localStorage.setItem(INVENTORY_STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_STOCK_MOVEMENTS));
      return INITIAL_STOCK_MOVEMENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading movements', e);
    return INITIAL_STOCK_MOVEMENTS;
  }
};

export const saveStoredMovements = (movements: StockMovement[]): void => {
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  } catch (e) {
    console.error('Error saving movements', e);
  }
};

export const addStoredMovement = (
  movement: Omit<StockMovement, 'id' | 'movementCode' | 'timestamp'>
): StockMovement => {
  const current = getStoredMovements();
  const newMovement: StockMovement = {
    ...movement,
    id: `MOV-${Date.now().toString().slice(-6)}`,
    movementCode: `MOV-2025-${(current.length + 1).toString().padStart(4, '0')}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
  const updated = [newMovement, ...current];
  saveStoredMovements(updated);
  return newMovement;
};

export const getStoredAuditCampaigns = (): AuditCampaign[] => {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEYS.CAMPAIGNS);
    if (!raw) {
      localStorage.setItem(INVENTORY_STORAGE_KEYS.CAMPAIGNS, JSON.stringify(INITIAL_AUDIT_CAMPAIGNS));
      return INITIAL_AUDIT_CAMPAIGNS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading audit campaigns', e);
    return INITIAL_AUDIT_CAMPAIGNS;
  }
};

export const saveStoredAuditCampaigns = (campaigns: AuditCampaign[]): void => {
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
  } catch (e) {
    console.error('Error saving campaigns', e);
  }
};

export const getStoredInventoryDiscrepancies = (): InventoryDiscrepancy[] => {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEYS.DISCREPANCIES);
    if (!raw) {
      localStorage.setItem(INVENTORY_STORAGE_KEYS.DISCREPANCIES, JSON.stringify(INITIAL_INVENTORY_DISCREPANCIES));
      return INITIAL_INVENTORY_DISCREPANCIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading discrepancies', e);
    return INITIAL_INVENTORY_DISCREPANCIES;
  }
};

export const saveStoredInventoryDiscrepancies = (discrepancies: InventoryDiscrepancy[]): void => {
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEYS.DISCREPANCIES, JSON.stringify(discrepancies));
  } catch (e) {
    console.error('Error saving discrepancies', e);
  }
};

export interface InventoryKPIs {
  totalAssets: number;
  byFactory: {
    factoryA: number;
    factoryB: number;
    factoryC: number;
  };
  inUse: number;
  readyForTransfer: number;
  reserved: number;
  inTransit: number;
  waitingReceipt: number;
  waitingBookTransfer: number;
  underRepairOrLocked: number;
  discrepancyCount: number;
}

export const calculateInventoryMetrics = (
  assets: MasterAsset[],
  orders: TransferOrder[],
  discrepancies: InventoryDiscrepancy[]
): InventoryKPIs => {
  const totalAssets = assets.length;
  let factoryA = 0;
  let factoryB = 0;
  let factoryC = 0;
  let inUse = 0;
  let readyForTransfer = 0;
  let reserved = 0;
  let inTransit = 0;
  let waitingReceipt = 0;
  let waitingBookTransfer = 0;
  let underRepairOrLocked = 0;

  for (const a of assets) {
    // Ownership / physical distribution
    if (a.physicalFactory === 'Nhà máy A') factoryA++;
    else if (a.physicalFactory === 'Nhà máy B') factoryB++;
    else if (a.physicalFactory === 'Nhà máy C') factoryC++;

    // Operational status
    if (a.operationalStatus === 'Đang sử dụng') inUse++;
    else if (a.operationalStatus === 'Sẵn sàng điều chuyển') readyForTransfer++;
    else if (a.operationalStatus === 'Đã giữ chỗ') reserved++;
    else if (a.operationalStatus === 'Đang điều động' || a.physicalFactory === 'Đang vận chuyển') inTransit++;
    else if (a.operationalStatus === 'Đang sửa chữa' || a.operationalStatus === 'Bị khóa' || a.operationalStatus === 'Chờ kiểm tra') {
      underRepairOrLocked++;
    }

    // Ownership transfer pending reconciliation
    if (
      a.bookOwnership === 'Đang chờ chuyển quyền' ||
      (a.physicalFactory === 'Nhà máy B' && a.bookOwnership === 'Nhà máy A')
    ) {
      waitingBookTransfer++;
    }
  }

  // Count active in-transit orders waiting for factory B to verify
  const activeWaitingReceiptOrders = orders.filter(
    (o) => (o.status === 'IN_TRANSIT' || o.status === 'DELIVERY_UPLOADED') && o.currentStep < 6
  );
  waitingReceipt = activeWaitingReceiptOrders.reduce(
    (sum, o) => sum + (o.registeredItems.length || o.plannedItems.length),
    0
  );

  const activeDiscrepancies = discrepancies.filter(
    (d) => d.status === 'Chờ xử lý' || d.status === 'Đang xử lý'
  ).length;

  return {
    totalAssets,
    byFactory: { factoryA, factoryB, factoryC },
    inUse,
    readyForTransfer,
    reserved,
    inTransit,
    waitingReceipt,
    waitingBookTransfer,
    underRepairOrLocked,
    discrepancyCount: activeDiscrepancies,
  };
};


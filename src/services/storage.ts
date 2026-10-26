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

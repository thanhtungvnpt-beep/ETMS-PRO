// OOS ETMS PRO — Field Daily Report Pro Storage & Service
// Persistent local storage, status management, multi-day issue lifecycle

import {
  FieldDailyReport,
  FieldDailyIssue,
  FieldReportPhoto,
  FieldDailyActivity,
  FieldTomorrowPlanItem,
  FieldIssueStatus,
  FieldIssueUpdateLog,
} from '../types/fieldReport';
import {
  INITIAL_DAILY_REPORTS,
  INITIAL_FIELD_ISSUES,
  INITIAL_FIELD_PHOTOS,
  INITIAL_TODAY_ACTIVITIES,
  INITIAL_TOMORROW_PLANS,
} from '../data/mockFieldReportData';

const STORAGE_KEYS = {
  REPORTS: 'oos_field_daily_reports_v1',
  ISSUES: 'oos_field_daily_issues_v1',
  PHOTOS: 'oos_field_daily_photos_v1',
  ACTIVITIES: 'oos_field_daily_activities_v1',
  PLANS: 'oos_field_tomorrow_plans_v1',
};

// 1. Reports Storage
export const getStoredDailyReports = (): FieldDailyReport[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) {
      saveStoredDailyReports(INITIAL_DAILY_REPORTS);
      return INITIAL_DAILY_REPORTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DAILY_REPORTS;
  }
};

export const saveStoredDailyReports = (reports: FieldDailyReport[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  } catch (e) {
    console.error('Failed to save daily reports to storage', e);
  }
};

// 2. Issues Storage (Single Issue ID persistent lifecycle)
export const getStoredFieldIssues = (): FieldDailyIssue[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ISSUES);
    if (!raw) {
      saveStoredFieldIssues(INITIAL_FIELD_ISSUES);
      return INITIAL_FIELD_ISSUES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FIELD_ISSUES;
  }
};

export const saveStoredFieldIssues = (issues: FieldDailyIssue[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
  } catch (e) {
    console.error('Failed to save field issues to storage', e);
  }
};

// 3. Photos Storage
export const getStoredFieldPhotos = (): FieldReportPhoto[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PHOTOS);
    if (!raw) {
      saveStoredFieldPhotos(INITIAL_FIELD_PHOTOS);
      return INITIAL_FIELD_PHOTOS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FIELD_PHOTOS;
  }
};

export const saveStoredFieldPhotos = (photos: FieldReportPhoto[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
  } catch (e) {
    console.error('Failed to save field photos to storage', e);
  }
};

// 4. Activities Storage
export const getStoredFieldActivities = (): FieldDailyActivity[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!raw) {
      saveStoredFieldActivities(INITIAL_TODAY_ACTIVITIES);
      return INITIAL_TODAY_ACTIVITIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TODAY_ACTIVITIES;
  }
};

export const saveStoredFieldActivities = (activities: FieldDailyActivity[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (e) {
    console.error('Failed to save activities to storage', e);
  }
};

// 5. Tomorrow Plans Storage
export const getStoredTomorrowPlans = (): FieldTomorrowPlanItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANS);
    if (!raw) {
      saveStoredTomorrowPlans(INITIAL_TOMORROW_PLANS);
      return INITIAL_TOMORROW_PLANS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TOMORROW_PLANS;
  }
};

export const saveStoredTomorrowPlans = (plans: FieldTomorrowPlanItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  } catch (e) {
    console.error('Failed to save tomorrow plans to storage', e);
  }
};

// =========================================================================
// BUSINESS LOGIC: ISSUE LIFECYCLE & MULTI-DAY TRACKING
// =========================================================================

// Update Issue with timeline audit log
export const updateFieldIssueStatus = (
  issueId: string,
  newStatus: FieldIssueStatus,
  updatedBy: string,
  role: string,
  notes: string,
  evidencePhoto?: string
): FieldDailyIssue[] => {
  const issues = getStoredFieldIssues();
  const idx = issues.findIndex((i) => i.id === issueId);
  if (idx === -1) return issues;

  const current = issues[idx];
  const newLog: FieldIssueUpdateLog = {
    id: `LOG-${Date.now().toString().slice(-5)}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    date: new Date().toISOString().slice(0, 10),
    updatedBy,
    role,
    action: `Chuyển trạng thái sang ${newStatus.replace(/_/g, ' ')}`,
    notes,
    statusBefore: current.status,
    statusAfter: newStatus,
    evidencePhoto,
  };

  const updatedIssue: FieldDailyIssue = {
    ...current,
    status: newStatus,
    resolvedAt: newStatus === 'ĐÃ_KHẮC_PHỤC' || newStatus === 'ĐÃ_XÁC_NHẬN' ? new Date().toISOString() : current.resolvedAt,
    closedAt: newStatus === 'ĐÓNG_VẤN_ĐỀ' ? new Date().toISOString() : current.closedAt,
    historyLogs: [newLog, ...(current.historyLogs || [])],
  };

  issues[idx] = updatedIssue;
  saveStoredFieldIssues(issues);
  return issues;
};

// Create or update Daily Report
export const saveOrSubmitDailyReport = (report: FieldDailyReport): FieldDailyReport[] => {
  const current = getStoredDailyReports();
  const idx = current.findIndex((r) => r.id === report.id || (r.reportDate === report.reportDate && r.employeeId === report.employeeId));
  let updated: FieldDailyReport[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = { ...report, updatedAt: new Date().toISOString() };
  } else {
    updated = [report, ...current];
  }
  saveStoredDailyReports(updated);
  return updated;
};

// Create new Issue ensuring unique ID and proper prefix
export const createFieldIssue = (newIssue: Omit<FieldDailyIssue, 'id' | 'historyLogs'>): FieldDailyIssue => {
  const issues = getStoredFieldIssues();
  const prefix = newIssue.category; // e.g. "EQM", "QC", "HR", "PRODUCTION"
  const prefixCode = prefix === 'PRODUCTION' ? 'PROD' : prefix;
  
  // Find highest index for this prefix
  const samePrefixIssues = issues.filter((i) => i.id.startsWith(prefixCode));
  const nextNum = samePrefixIssues.length + 1;
  const uniqueId = `${prefixCode}-${String(nextNum).padStart(3, '0')}`;

  const created: FieldDailyIssue = {
    ...newIssue,
    id: uniqueId,
    historyLogs: [
      {
        id: `LOG-${Date.now().toString().slice(-5)}`,
        timestamp: `${newIssue.reportedDate} ${newIssue.reportedTime || '09:00'}`,
        date: newIssue.reportedDate,
        updatedBy: newIssue.reportedBy,
        role: newIssue.reportedByRole,
        action: 'Tạo vấn đề mới tại hiện trường',
        notes: newIssue.description,
        statusBefore: 'MỚI_PHÁT_SINH',
        statusAfter: newIssue.status,
      },
    ],
  };

  const updated = [created, ...issues];
  saveStoredFieldIssues(updated);
  return created;
};

// Reset entire module to baseline mock data
export const resetFieldReportsToBaseline = (): void => {
  localStorage.removeItem(STORAGE_KEYS.REPORTS);
  localStorage.removeItem(STORAGE_KEYS.ISSUES);
  localStorage.removeItem(STORAGE_KEYS.PHOTOS);
  localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
  localStorage.removeItem(STORAGE_KEYS.PLANS);
  saveStoredDailyReports(INITIAL_DAILY_REPORTS);
  saveStoredFieldIssues(INITIAL_FIELD_ISSUES);
  saveStoredFieldPhotos(INITIAL_FIELD_PHOTOS);
  saveStoredFieldActivities(INITIAL_TODAY_ACTIVITIES);
  saveStoredTomorrowPlans(INITIAL_TOMORROW_PLANS);
};

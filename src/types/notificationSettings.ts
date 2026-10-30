export type NotificationChannel = 'slack' | 'email' | 'both';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface StepSLAConfig {
  step: number; // 1 to 9
  stepName: string;
  defaultHours: number; // Target SLA in hours
  warningThresholdHours: number; // Trigger proactive warning when step time exceeds this
  escalationThresholdHours: number; // Trigger escalation when step time exceeds this
  enabled: boolean;
  notifyRoles: Array<'PLANNER' | 'FACTORY_A' | 'FACTORY_B' | 'ADMIN' | 'CARRIER'>;
}

export interface SlackNotificationConfig {
  enabled: boolean;
  webhookUrl: string;
  channel: string;
  botUsername: string;
  mentionOnCritical: '@channel' | '@here' | '@lead' | 'none';
  includeStepDetail: boolean;
  includeDirectActionLink: boolean;
}

export interface EmailNotificationConfig {
  enabled: boolean;
  primaryRecipients: string[];
  escalationRecipients: string[];
  senderName: string;
  digestFrequency: 'INSTANT' | 'EVERY_4_HOURS' | 'DAILY_MORNING';
  escalateAfterHours: number;
}

export interface GeneralThresholdConfig {
  leadTimeWarningHours: number; // Warning hours before expectedDate
  criticalOverdueHours: number; // Critical breach hours past expectedDate
  triggerOnDiscrepancy: boolean; // Instant alert on Step 6 discrepancy
  autoEscalateUnassigned: boolean; // Auto escalate if step has no assignee
}

export interface NotificationLogItem {
  id: string;
  timestamp: string;
  channel: 'SLACK' | 'EMAIL';
  orderId?: string;
  step?: number;
  recipientOrChannel: string;
  title: string;
  severity: AlertSeverity;
  status: 'SENT' | 'SIMULATED_SUCCESS' | 'FAILED';
  payloadSummary: string;
}

export interface NotificationThresholdSettings {
  id: string;
  updatedAt: string;
  updatedBy: string;
  general: GeneralThresholdConfig;
  stepSLAs: StepSLAConfig[];
  slack: SlackNotificationConfig;
  email: EmailNotificationConfig;
  recentLogs: NotificationLogItem[];
}

export interface OrderBottleneckAnalysis {
  orderId: string;
  orderReason: string;
  fromFactory: string;
  toFactory: string;
  expectedDate: string;
  currentStep: number;
  currentStepName: string;
  status: string;
  isOverdue: boolean;
  hoursElapsedAtStep: number;
  stepSLATarget: number;
  slaBreachHours: number; // Positive = breached, Negative = hours remaining
  severity: AlertSeverity;
  bottleneckReason: string;
  recommendedAction: string;
  responsibleRole: string;
  responsibleUser: string;
}

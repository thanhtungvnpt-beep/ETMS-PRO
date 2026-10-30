import {
  NotificationThresholdSettings,
  StepSLAConfig,
  OrderBottleneckAnalysis,
  NotificationLogItem,
} from '../types/notificationSettings';
import { TransferOrder } from '../types';

const STORAGE_KEY = 'oos_etms_notification_settings_v1';

export const STEP_NAMES_9: Record<number, string> = {
  1: 'B1: Lập kế hoạch lệnh điều động',
  2: 'B2: Xác nhận 2 đầu Nhà máy A & B',
  3: 'B3: Đăng ký & kiểm định thiết bị xuất xưởng',
  4: 'B4: Vận chuyển đường dài & niêm phong',
  5: 'B5: Tải biên bản giao nhận (BBGN)',
  6: 'B6: Nghiệm thu tiếp nhận & xử lý sai lệch',
  7: 'B7: Chuyển giao sổ sách tài sản kế toán',
  8: 'B8: Phát hành & in tem QR mã hóa',
  9: 'B9: Dán tem QR & xác nhận hoàn tất',
};

export const DEFAULT_STEP_SLAS: StepSLAConfig[] = [
  {
    step: 1,
    stepName: 'B1: Lập kế hoạch lệnh điều động',
    defaultHours: 24,
    warningThresholdHours: 18,
    escalationThresholdHours: 36,
    enabled: true,
    notifyRoles: ['PLANNER', 'ADMIN'],
  },
  {
    step: 2,
    stepName: 'B2: Xác nhận 2 đầu Nhà máy A & B',
    defaultHours: 12,
    warningThresholdHours: 8,
    escalationThresholdHours: 20,
    enabled: true,
    notifyRoles: ['FACTORY_A', 'FACTORY_B', 'PLANNER'],
  },
  {
    step: 3,
    stepName: 'B3: Đăng ký & kiểm định thiết bị xuất xưởng',
    defaultHours: 24,
    warningThresholdHours: 16,
    escalationThresholdHours: 36,
    enabled: true,
    notifyRoles: ['FACTORY_A', 'PLANNER'],
  },
  {
    step: 4,
    stepName: 'B4: Vận chuyển đường dài & niêm phong chì',
    defaultHours: 48,
    warningThresholdHours: 36,
    escalationThresholdHours: 60,
    enabled: true,
    notifyRoles: ['CARRIER', 'PLANNER', 'FACTORY_B'],
  },
  {
    step: 5,
    stepName: 'B5: Tải biên bản giao nhận (BBGN)',
    defaultHours: 12,
    warningThresholdHours: 8,
    escalationThresholdHours: 24,
    enabled: true,
    notifyRoles: ['FACTORY_B', 'CARRIER'],
  },
  {
    step: 6,
    stepName: 'B6: Nghiệm thu tiếp nhận & đối chiếu sai lệch',
    defaultHours: 24,
    warningThresholdHours: 16,
    escalationThresholdHours: 36,
    enabled: true,
    notifyRoles: ['FACTORY_B', 'PLANNER', 'ADMIN'],
  },
  {
    step: 7,
    stepName: 'B7: Chuyển giao sổ sách tài sản kế toán',
    defaultHours: 24,
    warningThresholdHours: 16,
    escalationThresholdHours: 36,
    enabled: true,
    notifyRoles: ['PLANNER', 'ADMIN'],
  },
  {
    step: 8,
    stepName: 'B8: Phát hành & in tem QR mã hóa',
    defaultHours: 12,
    warningThresholdHours: 8,
    escalationThresholdHours: 18,
    enabled: true,
    notifyRoles: ['PLANNER'],
  },
  {
    step: 9,
    stepName: 'B9: Dán tem QR & xác nhận hoàn tất',
    defaultHours: 12,
    warningThresholdHours: 8,
    escalationThresholdHours: 20,
    enabled: true,
    notifyRoles: ['FACTORY_B', 'PLANNER'],
  },
];

export const INITIAL_NOTIFICATION_SETTINGS: NotificationThresholdSettings = {
  id: 'NSET-2025-001',
  updatedAt: '2025-04-20 09:30:00',
  updatedBy: 'Phạm Minh C (ADMIN)',
  general: {
    leadTimeWarningHours: 12, // Cảnh báo trước 12h khi sắp đến hạn giao
    criticalOverdueHours: 24, // Báo động khẩn cấp khi trễ quá 24h
    triggerOnDiscrepancy: true, // Gửi cảnh báo tức thì nếu phát hiện sai lệch ở Bước 6
    autoEscalateUnassigned: true, // Tự động báo động nếu bước chưa có người xử lý
  },
  stepSLAs: DEFAULT_STEP_SLAS,
  slack: {
    enabled: true,
    webhookUrl: 'https://hooks.slack.com/services/T08A91XYZ/B08B99ETMS/kx49102847291048201948',
    channel: '#etms-bottleneck-alerts',
    botUsername: 'OOS ETMS Bottleneck Sentinel',
    mentionOnCritical: '@channel',
    includeStepDetail: true,
    includeDirectActionLink: true,
  },
  email: {
    enabled: true,
    primaryRecipients: ['planner.team@oos.vn', 'logistics.lead@oos.vn', 'factory.equipment@oos.vn'],
    escalationRecipients: ['director.operations@oos.vn', 'qa.director@oos.vn'],
    senderName: 'Hệ thống Cảnh báo Điểm nghẽn ETMS PRO',
    digestFrequency: 'INSTANT',
    escalateAfterHours: 24,
  },
  recentLogs: [
    {
      id: 'NLOG-001',
      timestamp: '2025-04-24 16:15:20',
      channel: 'SLACK',
      orderId: 'TR-0001',
      step: 4,
      recipientOrChannel: '#etms-bottleneck-alerts',
      title: 'Cảnh báo vận chuyển quá thời gian dự kiến (B4)',
      severity: 'WARNING',
      status: 'SENT',
      payloadSummary: 'Lệnh TR-0001 đang vận chuyển đã vượt mốc cảnh báo 36 giờ. Xe 29C-882.15 chưa cập bến Nhà máy B.',
    },
    {
      id: 'NLOG-002',
      timestamp: '2025-04-24 14:00:00',
      channel: 'EMAIL',
      orderId: 'TR-0002',
      step: 6,
      recipientOrChannel: 'director.operations@oos.vn, planner.team@oos.vn',
      title: 'Báo động sai lệch thiết bị nhận máy (B6)',
      severity: 'CRITICAL',
      status: 'SENT',
      payloadSummary: 'Phát hiện thiếu 01 máy hàn và trầy xước vỏ động cơ tại Bước 6. Hệ thống tự động khóa Bước 7.',
    },
    {
      id: 'NLOG-003',
      timestamp: '2025-04-23 08:30:10',
      channel: 'SLACK',
      orderId: 'TR-0004',
      step: 2,
      recipientOrChannel: '#etms-bottleneck-alerts',
      title: 'Nhắc nhở ký xác nhận 2 đầu nhà máy',
      severity: 'INFO',
      status: 'SENT',
      payloadSummary: 'Nhà máy B chưa ký xác nhận tiếp nhận lệnh TR-0004. Còn 4 giờ trước mốc cảnh báo.',
    },
  ],
};

export const getNotificationSettings = (): NotificationThresholdSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_NOTIFICATION_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    // Ensure nested fields are backward-compatible
    return {
      ...INITIAL_NOTIFICATION_SETTINGS,
      ...parsed,
      general: { ...INITIAL_NOTIFICATION_SETTINGS.general, ...(parsed.general || {}) },
      slack: { ...INITIAL_NOTIFICATION_SETTINGS.slack, ...(parsed.slack || {}) },
      email: { ...INITIAL_NOTIFICATION_SETTINGS.email, ...(parsed.email || {}) },
      stepSLAs: parsed.stepSLAs || INITIAL_NOTIFICATION_SETTINGS.stepSLAs,
      recentLogs: parsed.recentLogs || INITIAL_NOTIFICATION_SETTINGS.recentLogs,
    };
  } catch (err) {
    console.error('Failed to parse notification settings from localStorage:', err);
    return INITIAL_NOTIFICATION_SETTINGS;
  }
};

export const saveNotificationSettings = (
  settings: NotificationThresholdSettings,
  userName = 'Current User'
): NotificationThresholdSettings => {
  const updated: NotificationThresholdSettings = {
    ...settings,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updatedBy: userName,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('oos-notification-settings-updated', { detail: updated }));
  } catch (err) {
    console.error('Failed to save notification settings:', err);
  }
  return updated;
};

export const resetNotificationSettings = (): NotificationThresholdSettings => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('oos-notification-settings-updated', { detail: INITIAL_NOTIFICATION_SETTINGS }));
  } catch (err) {
    console.error('Failed to reset notification settings:', err);
  }
  return INITIAL_NOTIFICATION_SETTINGS;
};

/**
 * Analyzes active transfer orders against 9-step SLAs and expected dates to identify bottlenecks.
 */
export const analyzeOverdueOrders = (
  orders: TransferOrder[],
  settings: NotificationThresholdSettings
): OrderBottleneckAnalysis[] => {
  const results: OrderBottleneckAnalysis[] = [];
  const now = new Date('2025-04-25T12:00:00Z'); // Fixed operational date aligned with system mock timeline

  orders.forEach((order) => {
    // Only analyze active / incomplete transfer orders
    if (order.status === 'STICKER_CONFIRMED' || order.status === 'CANCELLED') {
      return;
    }

    const stepNum = order.currentStep || 1;
    const stepConfig = settings.stepSLAs.find((s) => s.step === stepNum) || settings.stepSLAs[0];
    const stepName = STEP_NAMES_9[stepNum] || `Bước ${stepNum}`;

    // Calculate approximate hours elapsed based on createdDate or step state
    const orderCreated = new Date(order.createdDate);
    const expected = new Date(order.expectedDate);
    const hoursSinceCreation = Math.max(1, Math.round((now.getTime() - orderCreated.getTime()) / (1000 * 3600)));

    // Heuristic: step elapsed hours is proportionally estimated based on step progress
    // If order has discrepancies or transit delays, increase step elapsed time
    let hoursElapsedAtStep = Math.min(hoursSinceCreation, Math.max(8, Math.round(hoursSinceCreation / Math.max(1, stepNum))));

    if (order.receiptVerification?.hasDiscrepancy) {
      hoursElapsedAtStep = 42; // Simulated heavy discrepancy delay
    } else if (order.isOverdue) {
      hoursElapsedAtStep = Math.max(hoursElapsedAtStep, stepConfig.defaultHours + 14);
    } else if (stepNum === 4 && order.transitDetails?.status === 'Đang vận chuyển') {
      hoursElapsedAtStep = 38; // Long transit
    }

    const slaBreachHours = hoursElapsedAtStep - stepConfig.defaultHours;
    const isPastExpectedDate = now.getTime() > expected.getTime();

    // Determine severity
    let severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO';
    let bottleneckReason = 'Đang tiến hành đúng tiến độ tiêu chuẩn';
    let recommendedAction = 'Theo dõi theo quy trình định kỳ';

    if (order.receiptVerification?.hasDiscrepancy) {
      severity = 'CRITICAL';
      bottleneckReason = 'Phát hiện sai lệch tại Bước 6: Khóa tự động Bước 7 theo quy định bảo toàn sổ sách';
      recommendedAction = 'Bộ phận Thiết bị Nhà máy B & Planner cần lập biên bản xử lý bất thường để mở khóa.';
    } else if (isPastExpectedDate || slaBreachHours >= stepConfig.escalationThresholdHours - stepConfig.defaultHours) {
      severity = 'CRITICAL';
      bottleneckReason = `Vượt ngưỡng leo thang ${stepConfig.escalationThresholdHours}h tại ${stepName}. Trễ hạn giao ${Math.abs(Math.round((now.getTime() - expected.getTime()) / (1000 * 3600)))}h so với cam kết.`;
      recommendedAction = 'Gửi thông báo khẩn cấp tới Ban Giám đốc điều hành & Trưởng bộ phận phụ trách.';
    } else if (slaBreachHours >= 0 || hoursElapsedAtStep >= stepConfig.warningThresholdHours) {
      severity = 'WARNING';
      bottleneckReason = `Đã chạy ${hoursElapsedAtStep}h tại ${stepName} (Vượt ngưỡng cảnh báo sớm ${stepConfig.warningThresholdHours}h).`;
      recommendedAction = `Nhắc nhở người phụ trách ${stepConfig.notifyRoles.join(', ')} đẩy nhanh thủ tục nghiệm thu.`;
    }

    // Role & user attribution
    let responsibleRole = 'PLANNER';
    let responsibleUser = order.plannerName || 'Nguyễn Văn A';

    if (stepNum === 2 || stepNum === 3) {
      responsibleRole = 'FACTORY_A';
      responsibleUser = 'Trần Văn A (Trưởng bộ phận Thiết bị A)';
    } else if (stepNum === 4) {
      responsibleRole = 'CARRIER';
      responsibleUser = order.transitDetails?.carrierName || 'Đơn vị Vận tải Á Châu';
    } else if (stepNum === 5 || stepNum === 6 || stepNum === 9) {
      responsibleRole = 'FACTORY_B';
      responsibleUser = 'Lê Thị B (Trưởng bộ phận Thiết bị B)';
    }

    results.push({
      orderId: order.id,
      orderReason: order.reason,
      fromFactory: order.fromFactory,
      toFactory: order.toFactory,
      expectedDate: order.expectedDate,
      currentStep: stepNum,
      currentStepName: stepName,
      status: order.status,
      isOverdue: order.isOverdue || isPastExpectedDate,
      hoursElapsedAtStep,
      stepSLATarget: stepConfig.defaultHours,
      slaBreachHours,
      severity,
      bottleneckReason,
      recommendedAction,
      responsibleRole,
      responsibleUser,
    });
  });

  // Sort CRITICAL first, then WARNING, then by breach hours descending
  const severityRank = { CRITICAL: 3, WARNING: 2, INFO: 1 };
  return results.sort((a, b) => {
    if (severityRank[b.severity] !== severityRank[a.severity]) {
      return severityRank[b.severity] - severityRank[a.severity];
    }
    return b.slaBreachHours - a.slaBreachHours;
  });
};

/**
 * Generates Slack Block Kit payload preview JSON
 */
export const generateSlackBlockKitPreview = (
  analysis: OrderBottleneckAnalysis,
  settings: NotificationThresholdSettings
) => {
  const icon = analysis.severity === 'CRITICAL' ? '🚨' : analysis.severity === 'WARNING' ? '⚠️' : 'ℹ️';
  const color = analysis.severity === 'CRITICAL' ? '#E11D48' : analysis.severity === 'WARNING' ? '#D97706' : '#2563EB';

  return {
    channel: settings.slack.channel,
    username: settings.slack.botUsername,
    icon_emoji: ':factory_worker:',
    attachments: [
      {
        color,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${icon} [ETMS PRO] CẢNH BÁO TIẾN ĐỘ ĐIỀU ĐỘNG: ${analysis.orderId}`,
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Lệnh điều động:*\n<#|${analysis.orderId}> (${analysis.fromFactory} ➔ ${analysis.toFactory})` },
              { type: 'mrkdwn', text: `*Mức độ:*\n\`${analysis.severity}\` (Quá hạn ${analysis.slaBreachHours > 0 ? `+${analysis.slaBreachHours}h` : 'Chuẩn bị chạm ngưỡng'})` },
              { type: 'mrkdwn', text: `*Bước hiện tại:*\n*${analysis.currentStepName}*` },
              { type: 'mrkdwn', text: `*Thời gian tại bước:*\n*${analysis.hoursElapsedAtStep} giờ* / SLA: ${analysis.stepSLATarget}h` },
              { type: 'mrkdwn', text: `*Người chịu trách nhiệm:*\n${analysis.responsibleUser}` },
              { type: 'mrkdwn', text: `*Hạn giao cam kết:*\n${analysis.expectedDate}` },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Nguyên nhân điểm nghẽn:*\n>${analysis.bottleneckReason}\n\n*Hành động đề xuất:*\n>${analysis.recommendedAction}`,
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: { type: 'plain_text', text: '🔎 Mở Lệnh Trên ETMS PRO', emoji: true },
                style: 'primary',
                value: analysis.orderId,
              },
              {
                type: 'button',
                text: { type: 'plain_text', text: '📋 Xem Biên Bản & Xử Lý', emoji: true },
                value: `inspect_${analysis.orderId}`,
              },
            ],
          },
        ],
      },
    ],
  };
};

/**
 * Generates Email HTML layout preview
 */
export const generateEmailHTMLPreview = (
  analysis: OrderBottleneckAnalysis,
  settings: NotificationThresholdSettings
) => {
  const isCritical = analysis.severity === 'CRITICAL';
  const badgeColor = isCritical ? '#dc2626' : '#d97706';
  const badgeText = isCritical ? 'NGUY CƠ CAO — BÁO ĐỘNG LEO THANG' : 'CẢNH BÁO SỚM — SẮP QUÁ HẠN';

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0b192c; padding: 18px 24px; color: #ffffff; display: flex; align-items: center; justify-content: space-between; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; color: #ffffff; background: ${badgeColor}; }
    .content { padding: 24px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    .info-table td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
    .info-table td.label { font-weight: 600; color: #64748b; width: 38%; }
    .info-table td.val { font-weight: 600; color: #0f172a; }
    .box-reason { background: #fff1f2; border-left: 4px solid #e11d48; padding: 12px 16px; border-radius: 0 6px 6px 0; margin-top: 14px; font-size: 13px; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 20px; font-weight: 600; font-size: 13px; border-radius: 6px; margin-top: 18px; }
    .footer { background: #f8fafc; padding: 14px 24px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span style="font-size: 15px; font-weight: 800; letter-spacing: 0.5px;">OOS ETMS PRO — WORKFLOW SLA ALERT</span>
      <span class="badge">${badgeText}</span>
    </div>
    <div class="content">
      <h3 style="margin: 0 0 8px 0; font-size: 17px; color: #0f172a;">Cảnh báo quá hạn quy trình 9 bước: Lệnh ${analysis.orderId}</h3>
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569;">
        Hệ thống tự động phát hiện lệnh điều động thiết bị đang vượt quá ngưỡng thời gian cam kết (SLA) tại quy trình chuyển giao.
      </p>

      <table class="info-table">
        <tr>
          <td class="label">Mã lệnh điều động:</td>
          <td class="val"><strong>${analysis.orderId}</strong> (${analysis.fromFactory} ➔ ${analysis.toFactory})</td>
        </tr>
        <tr>
          <td class="label">Bước hiện tại đang dừng:</td>
          <td class="val" style="color: #2563eb;">${analysis.currentStepName}</td>
        </tr>
        <tr>
          <td class="label">Thời gian đã lưu lại bước:</td>
          <td class="val"><strong style="color: ${badgeColor};">${analysis.hoursElapsedAtStep} giờ</strong> (Mục tiêu SLA: ${analysis.stepSLATarget} giờ)</td>
        </tr>
        <tr>
          <td class="label">Người phụ trách chính:</td>
          <td class="val">${analysis.responsibleUser}</td>
        </tr>
        <tr>
          <td class="label">Hạn cam kết toàn trình:</td>
          <td class="val">${analysis.expectedDate}</td>
        </tr>
      </table>

      <div class="box-reason">
        <strong>Nguyên nhân điểm nghẽn:</strong>
        <p style="margin: 4px 0 0 0;">${analysis.bottleneckReason}</p>
        <p style="margin: 6px 0 0 0; font-weight: 600; color: #991b1b;">Hành động khắc phục: ${analysis.recommendedAction}</p>
      </div>

      <div style="text-align: center;">
        <a href="#open-${analysis.orderId}" class="btn">Xử Lý Lệnh Ngay Trên Hệ Thống</a>
      </div>
    </div>
    <div class="footer">
      Email tự động gửi từ OOS ETMS PRO theo quy chuẩn giám sát SLA 9 bước.<br>
      Kênh người nhận: ${settings.email.primaryRecipients.join(', ')}
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Simulates sending a test notification and records into recentLogs
 */
export const simulateSendTestNotification = (
  channel: 'SLACK' | 'EMAIL',
  orderId = 'TR-0001',
  settings: NotificationThresholdSettings,
  user = 'Current User'
): { updatedSettings: NotificationThresholdSettings; logItem: NotificationLogItem } => {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const logId = `NLOG-${Date.now().toString().slice(-4)}`;

  const recipientOrChannel = channel === 'SLACK' ? settings.slack.channel : settings.email.primaryRecipients.join(', ');
  const title =
    channel === 'SLACK'
      ? `[Simulated Slack Dispatch] Cảnh báo SLA lệnh ${orderId} gửi tới ${settings.slack.channel}`
      : `[Simulated Email Dispatch] SLA breach alert gửi tới ${settings.email.primaryRecipients.length} người nhận`;

  const logItem: NotificationLogItem = {
    id: logId,
    timestamp: now,
    channel,
    orderId,
    step: 4,
    recipientOrChannel,
    title,
    severity: 'WARNING',
    status: 'SIMULATED_SUCCESS',
    payloadSummary: `Thực hiện gửi thành công qua ${channel} (Giao thức HTTP 200 OK mô phỏng) lúc ${now}`,
  };

  const updatedSettings: NotificationThresholdSettings = {
    ...settings,
    recentLogs: [logItem, ...(settings.recentLogs || []).slice(0, 19)],
  };

  saveNotificationSettings(updatedSettings, user);

  return { updatedSettings, logItem };
};

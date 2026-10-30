import React, { useState, useMemo } from 'react';
import {
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Send,
  Save,
  RotateCcw,
  Sliders,
  Shield,
  Activity,
  FileText,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Eye,
  Check,
  Zap,
} from 'lucide-react';
import { TransferOrder, UserProfile } from '../../types';
import {
  NotificationThresholdSettings,
  OrderBottleneckAnalysis,
  StepSLAConfig,
} from '../../types/notificationSettings';
import {
  getNotificationSettings,
  saveNotificationSettings,
  resetNotificationSettings,
  analyzeOverdueOrders,
  generateSlackBlockKitPreview,
  generateEmailHTMLPreview,
  simulateSendTestNotification,
  STEP_NAMES_9,
} from '../../services/notificationSettingsService';

interface OverdueNotificationConfigProps {
  orders: TransferOrder[];
  currentUser: UserProfile;
}

export const OverdueNotificationConfig: React.FC<OverdueNotificationConfigProps> = ({
  orders,
  currentUser,
}) => {
  const [settings, setSettings] = useState<NotificationThresholdSettings>(() => getNotificationSettings());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newPrimaryEmail, setNewPrimaryEmail] = useState('');
  const [newEscalationEmail, setNewEscalationEmail] = useState('');
  const [selectedAnalysisForPreview, setSelectedAnalysisForPreview] = useState<OrderBottleneckAnalysis | null>(null);
  const [previewTab, setPreviewTab] = useState<'slack' | 'email'>('slack');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [testNotificationFeedback, setTestNotificationFeedback] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // Analyze active transfer orders in real-time based on the current threshold settings
  const bottleneckAnalyses = useMemo(() => {
    return analyzeOverdueOrders(orders, settings);
  }, [orders, settings]);

  const criticalCount = useMemo(
    () => bottleneckAnalyses.filter((b) => b.severity === 'CRITICAL').length,
    [bottleneckAnalyses]
  );
  const warningCount = useMemo(
    () => bottleneckAnalyses.filter((b) => b.severity === 'WARNING').length,
    [bottleneckAnalyses]
  );
  const totalSLAHours = useMemo(
    () => settings.stepSLAs.reduce((sum, s) => sum + (s.enabled ? s.defaultHours : 0), 0),
    [settings.stepSLAs]
  );

  // Handle Save
  const handleSave = () => {
    const updated = saveNotificationSettings(settings, currentUser.name);
    setSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Handle Reset
  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục toàn bộ cấu hình ngưỡng cảnh báo về chuẩn mặc định của nhà máy?')) {
      const reset = resetNotificationSettings();
      setSettings(reset);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  // Add primary recipient email
  const handleAddPrimaryEmail = () => {
    if (!newPrimaryEmail || !newPrimaryEmail.includes('@')) return;
    if (settings.email.primaryRecipients.includes(newPrimaryEmail.trim())) return;
    setSettings((prev) => ({
      ...prev,
      email: {
        ...prev.email,
        primaryRecipients: [...prev.email.primaryRecipients, newPrimaryEmail.trim()],
      },
    }));
    setNewPrimaryEmail('');
  };

  // Remove primary email
  const handleRemovePrimaryEmail = (emailToRemove: string) => {
    setSettings((prev) => ({
      ...prev,
      email: {
        ...prev.email,
        primaryRecipients: prev.email.primaryRecipients.filter((e) => e !== emailToRemove),
      },
    }));
  };

  // Add escalation recipient email
  const handleAddEscalationEmail = () => {
    if (!newEscalationEmail || !newEscalationEmail.includes('@')) return;
    if (settings.email.escalationRecipients.includes(newEscalationEmail.trim())) return;
    setSettings((prev) => ({
      ...prev,
      email: {
        ...prev.email,
        escalationRecipients: [...prev.email.escalationRecipients, newEscalationEmail.trim()],
      },
    }));
    setNewEscalationEmail('');
  };

  // Remove escalation email
  const handleRemoveEscalationEmail = (emailToRemove: string) => {
    setSettings((prev) => ({
      ...prev,
      email: {
        ...prev.email,
        escalationRecipients: prev.email.escalationRecipients.filter((e) => e !== emailToRemove),
      },
    }));
  };

  // Update specific step SLA field
  const handleUpdateStepSLA = (stepNumber: number, field: keyof StepSLAConfig, value: any) => {
    setSettings((prev) => ({
      ...prev,
      stepSLAs: prev.stepSLAs.map((s) => (s.step === stepNumber ? { ...s, [field]: value } : s)),
    }));
  };

  // Send Test Notification
  const handleSendTestNotification = (channel: 'SLACK' | 'EMAIL', orderId = 'TR-0001') => {
    const { updatedSettings, logItem } = simulateSendTestNotification(channel, orderId, settings, currentUser.name);
    setSettings(updatedSettings);
    setTestNotificationFeedback(`Đã bắn thành công thông báo thử nghiệm qua kênh ${channel} (Mã: ${logItem.id})`);
    setTimeout(() => setTestNotificationFeedback(null), 4000);
  };

  // Open Preview Modal
  const handleOpenPreview = (analysis: OrderBottleneckAnalysis, channel: 'slack' | 'email') => {
    setSelectedAnalysisForPreview(analysis);
    setPreviewTab(channel);
    setPreviewModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Notification Feedback Alert */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between text-emerald-800 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đã lưu thành công cấu hình ngưỡng thông báo Slack & Email vào hệ thống!</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-mono">
            Cập nhật lúc: {settings.updatedAt}
          </span>
        </div>
      )}

      {testNotificationFeedback && (
        <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg flex items-center justify-between text-blue-900 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 font-bold">
            <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>{testNotificationFeedback}</span>
          </div>
          <span className="text-[10px] bg-blue-200 text-blue-800 font-mono px-1.5 py-0.5 rounded font-bold">
            HTTP 200 OK
          </span>
        </div>
      )}

      {/* KPI Cards: Live Bottleneck Awareness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Điểm nghẽn nghiêm trọng (Báo động)
            </span>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{criticalCount}</span>
            <span className="text-xs text-slate-500 font-medium">lệnh vượt mốc leo thang</span>
          </div>
          <p className="mt-1 text-[10px] text-rose-600 font-medium">
            Tự động kích hoạt thông báo Slack & Email khẩn
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Nguy cơ trễ SLA (Cảnh báo sớm)
            </span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{warningCount}</span>
            <span className="text-xs text-slate-500 font-medium">lệnh chạm ngưỡng cảnh báo</span>
          </div>
          <p className="mt-1 text-[10px] text-amber-700 font-medium">
            Thông báo nhắc nhở người phụ trách bước
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Tổng SLA Tiêu Chuẩn 9 Bước
            </span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600">{totalSLAHours}h</span>
            <span className="text-xs text-slate-500 font-medium">~ {(totalSLAHours / 24).toFixed(1)} ngày làm việc</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-500">
            Từ khởi tạo (B1) đến dán tem nghiệm thu (B9)
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Kênh Thông Báo Kích Hoạt
            </span>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded">
              <Bell className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded font-bold border ${
                settings.slack.enabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              Slack: {settings.slack.enabled ? 'BẬT' : 'TẮT'}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-bold border ${
                settings.email.enabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              Email: {settings.email.enabled ? 'BẬT' : 'TẮT'}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-slate-500 font-mono">
            {settings.email.primaryRecipients.length} email nhận tin chính
          </p>
        </div>
      </div>

      {/* Main Grid: Channels Configuration (Slack & Email) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Slack Webhook & Channel Config */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  #
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Cấu Hình Kênh Slack Webhook</h4>
                  <p className="text-[11px] text-slate-500">
                    Bắn thông báo trực tiếp vào Channel vận hành của nhà máy
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.slack.enabled}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      slack: { ...prev.slack, enabled: e.target.checked },
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Slack Incoming Webhook URL
                </label>
                <input
                  type="text"
                  value={settings.slack.webhookUrl}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      slack: { ...prev.slack, webhookUrl: e.target.value },
                    }))
                  }
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-slate-50 text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  URL an toàn cấp bởi Slack App Incoming Webhooks.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Kênh Slack nhận tin
                  </label>
                  <input
                    type="text"
                    value={settings.slack.channel}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        slack: { ...prev.slack, channel: e.target.value },
                      }))
                    }
                    className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-purple-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tên Bot hiển thị
                  </label>
                  <input
                    type="text"
                    value={settings.slack.botUsername}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        slack: { ...prev.slack, botUsername: e.target.value },
                      }))
                    }
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-purple-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Quy tắc Mention khi khẩn cấp
                  </label>
                  <select
                    value={settings.slack.mentionOnCritical}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        slack: { ...prev.slack, mentionOnCritical: e.target.value as any },
                      }))
                    }
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded bg-white text-slate-800"
                  >
                    <option value="@channel">@channel (Toàn bộ kênh)</option>
                    <option value="@here">@here (Người đang online)</option>
                    <option value="@lead">@lead (Trưởng bộ phận & Planner)</option>
                    <option value="none">Không gắn thẻ</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end space-y-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={settings.slack.includeDirectActionLink}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          slack: { ...prev.slack, includeDirectActionLink: e.target.checked },
                        }))
                      }
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Gửi kèm nút deep-link mở lệnh</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={settings.slack.includeStepDetail}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          slack: { ...prev.slack, includeStepDetail: e.target.checked },
                        }))
                      }
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Gửi kèm chi tiết SLA bước</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={() => {
                const sample = bottleneckAnalyses[0] || {
                  orderId: 'TR-0001',
                  orderReason: 'Bổ sung máy phay CNC 5 trục',
                  fromFactory: 'Nhà máy A',
                  toFactory: 'Nhà máy B',
                  expectedDate: '2025-04-25',
                  currentStep: 4,
                  currentStepName: 'B4: Vận chuyển đường dài & niêm phong',
                  status: 'IN_TRANSIT',
                  isOverdue: true,
                  hoursElapsedAtStep: 42,
                  stepSLATarget: 48,
                  slaBreachHours: 6,
                  severity: 'WARNING',
                  bottleneckReason: 'Xe vận chuyển đường dài dừng nghỉ quá thời gian quy định',
                  recommendedAction: 'Liên hệ đội xe 29C-882.15 để xác minh lộ trình',
                  responsibleRole: 'CARRIER',
                  responsibleUser: 'Công ty Vận tải Á Châu',
                };
                handleOpenPreview(sample, 'slack');
              }}
              className="text-purple-700 hover:text-purple-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem trước mẫu Slack</span>
            </button>

            <button
              type="button"
              onClick={() => handleSendTestNotification('SLACK', bottleneckAnalyses[0]?.orderId || 'TR-0001')}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Bắn tin thử nghiệm Slack</span>
            </button>
          </div>
        </div>

        {/* Card 2: Email Alert & Escalation Threshold Config */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Cấu Hình Kênh Email & Leo Thang</h4>
                  <p className="text-[11px] text-slate-500">
                    Gửi email cảnh báo SLA tự động và báo cáo định kỳ
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email.enabled}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      email: { ...prev.email, enabled: e.target.checked },
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="mt-3 space-y-3">
              {/* Primary Recipients */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Danh sách Email nhận tin chính (Nhóm Kế hoạch & Điều phối)
                </label>
                <div className="flex gap-1.5 mb-1.5">
                  <input
                    type="email"
                    value={newPrimaryEmail}
                    onChange={(e) => setNewPrimaryEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPrimaryEmail())}
                    placeholder="Nhập email (ví dụ: logistics@oos.vn) và Enter..."
                    className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddPrimaryEmail}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {settings.email.primaryRecipients.map((em) => (
                    <span
                      key={em}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-mono"
                    >
                      {em}
                      <button
                        type="button"
                        onClick={() => handleRemovePrimaryEmail(em)}
                        className="text-blue-500 hover:text-blue-700 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Escalation Recipients */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email nhận báo động leo thang (Ban Giám Đốc / QA khi trễ &gt; {settings.email.escalateAfterHours}h)
                </label>
                <div className="flex gap-1.5 mb-1.5">
                  <input
                    type="email"
                    value={newEscalationEmail}
                    onChange={(e) => setNewEscalationEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEscalationEmail())}
                    placeholder="Nhập email lãnh đạo (ví dụ: director.ops@oos.vn)..."
                    className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-rose-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddEscalationEmail}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {settings.email.escalationRecipients.map((em) => (
                    <span
                      key={em}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-mono font-semibold"
                    >
                      {em}
                      <button
                        type="button"
                        onClick={() => handleRemoveEscalationEmail(em)}
                        className="text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tần suất thông báo email
                  </label>
                  <select
                    value={settings.email.digestFrequency}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        email: { ...prev.email, digestFrequency: e.target.value as any },
                      }))
                    }
                    className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded bg-white text-slate-800"
                  >
                    <option value="INSTANT">Gửi tức thời ngay khi chạm ngưỡng</option>
                    <option value="EVERY_4_HOURS">Tổng hợp mỗi 4 giờ một lần</option>
                    <option value="DAILY_MORNING">Báo cáo tổng hợp lúc 08:00 sáng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Ngưỡng leo thang Ban Giám Đốc
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={6}
                      max={120}
                      value={settings.email.escalateAfterHours}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          email: { ...prev.email, escalateAfterHours: parseInt(e.target.value) || 24 },
                        }))
                      }
                      className="w-20 text-xs px-2 py-1.5 border border-slate-200 rounded bg-white font-mono"
                    />
                    <span className="text-[11px] text-slate-600">giờ quá hạn</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={() => {
                const sample = bottleneckAnalyses[0] || {
                  orderId: 'TR-0002',
                  orderReason: 'Điều chuyển máy nén khí công nghiệp',
                  fromFactory: 'Nhà máy A',
                  toFactory: 'Nhà máy B',
                  expectedDate: '2025-04-20',
                  currentStep: 6,
                  currentStepName: 'B6: Nghiệm thu tiếp nhận & xử lý sai lệch',
                  status: 'DISCREPANCY_FLAGGED',
                  isOverdue: true,
                  hoursElapsedAtStep: 54,
                  stepSLATarget: 24,
                  slaBreachHours: 30,
                  severity: 'CRITICAL',
                  bottleneckReason: 'Phát hiện thiếu 01 bộ phụ kiện điều áp và sai serial vỏ máy',
                  recommendedAction: 'Trưởng bộ phận Thiết bị B ký biên bản bất thường và thông báo Planner',
                  responsibleRole: 'FACTORY_B',
                  responsibleUser: 'Lê Thị B (Trưởng bộ phận Thiết bị B)',
                };
                handleOpenPreview(sample, 'email');
              }}
              className="text-blue-700 hover:text-blue-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem trước mẫu Email HTML</span>
            </button>

            <button
              type="button"
              onClick={() => handleSendTestNotification('EMAIL', bottleneckAnalyses[0]?.orderId || 'TR-0002')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi thử nghiệm Email</span>
            </button>
          </div>
        </div>
      </div>

      {/* General SLA Thresholds Config */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
        <h4 className="font-bold text-slate-900 text-xs mb-1 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-600" />
          <span>Ngưỡng Cảnh Báo Chung & Tự Động Kích Hoạt (General Thresholds)</span>
        </h4>
        <p className="text-[11px] text-slate-500 mb-3">
          Thiết lập giới hạn kích hoạt sớm để phòng ngừa nguy cơ trễ hạn giao thiết bị giữa các nhà máy
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Cảnh báo sớm trước hạn giao
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={72}
                value={settings.general.leadTimeWarningHours}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    general: { ...prev.general, leadTimeWarningHours: parseInt(e.target.value) || 12 },
                  }))
                }
                className="w-20 px-2 py-1 border border-slate-300 rounded font-mono bg-white font-bold text-slate-800"
              />
              <span className="text-slate-600 font-medium">giờ trước deadline</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Gửi nhắc nhở chủ động trước khi lệnh bị quá hạn
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Mốc vi phạm nghiêm trọng (Critical)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={6}
                max={120}
                value={settings.general.criticalOverdueHours}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    general: { ...prev.general, criticalOverdueHours: parseInt(e.target.value) || 24 },
                  }))
                }
                className="w-20 px-2 py-1 border border-slate-300 rounded font-mono bg-white font-bold text-rose-700"
              />
              <span className="text-slate-600 font-medium">giờ quá hạn</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Bật còi báo động đỏ và leo thang cấp giám đốc
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
            <div>
              <span className="block text-[11px] font-bold text-slate-700 mb-1">
                Báo động tức thì khi có sai lệch Bước 6
              </span>
              <p className="text-[10px] text-slate-500">
                Nếu phát hiện sai serial, thiếu máy hoặc trầy xước, thông báo tức thì tới Planner
              </p>
            </div>
            <div className="mt-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-[11px] text-slate-800">
                <input
                  type="checkbox"
                  checked={settings.general.triggerOnDiscrepancy}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      general: { ...prev.general, triggerOnDiscrepancy: e.target.checked },
                    }))
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Kích hoạt báo động sai lệch</span>
              </label>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between">
            <div>
              <span className="block text-[11px] font-bold text-slate-700 mb-1">
                Tự động báo động nếu chưa gán nhân sự
              </span>
              <p className="text-[10px] text-slate-500">
                Cảnh báo nếu lệnh chuyển qua bước mới nhưng chưa có người tiếp nhận xử lý
              </p>
            </div>
            <div className="mt-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-[11px] text-slate-800">
                <input
                  type="checkbox"
                  checked={settings.general.autoEscalateUnassigned}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      general: { ...prev.general, autoEscalateUnassigned: e.target.checked },
                    }))
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Bật theo dõi phân công</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 9-Step Workflow Bottleneck SLA Threshold Matrix */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Ma Trận Ngưỡng SLA & Xác Định Điểm Nghẽn Từng Bước (Quy Trình 9 Bước)</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Mỗi bước có ngưỡng thời gian xử lý chuẩn, mốc cảnh báo sớm và mốc leo thang riêng biệt
            </p>
          </div>
          <div className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 font-medium">
            Mục tiêu toàn trình: <strong className="text-blue-700 font-bold">{totalSLAHours} giờ</strong>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="p-2.5 w-12 text-center">Bật</th>
                <th className="p-2.5">Bước quy trình 9 bước</th>
                <th className="p-2.5 text-center">SLA Chuẩn (Giờ)</th>
                <th className="p-2.5 text-center">Ngưỡng cảnh báo sớm</th>
                <th className="p-2.5 text-center">Ngưỡng leo thang khẩn</th>
                <th className="p-2.5">Vai trò nhận thông báo</th>
                <th className="p-2.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settings.stepSLAs.map((stepConfig) => {
                const isExpanded = expandedStep === stepConfig.step;
                return (
                  <React.Fragment key={stepConfig.step}>
                    <tr className={`hover:bg-slate-50/80 ${!stepConfig.enabled ? 'opacity-50 bg-slate-50/50' : ''}`}>
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={stepConfig.enabled}
                          onChange={(e) => handleUpdateStepSLA(stepConfig.step, 'enabled', e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                            {stepConfig.step}
                          </span>
                          <span>{STEP_NAMES_9[stepConfig.step]}</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            min={1}
                            max={168}
                            value={stepConfig.defaultHours}
                            onChange={(e) =>
                              handleUpdateStepSLA(
                                stepConfig.step,
                                'defaultHours',
                                parseInt(e.target.value) || stepConfig.defaultHours
                              )
                            }
                            className="w-16 px-1.5 py-1 text-center border border-slate-300 rounded font-mono font-bold text-xs"
                          />
                          <span className="text-slate-500 text-[11px]">h</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            min={1}
                            max={168}
                            value={stepConfig.warningThresholdHours}
                            onChange={(e) =>
                              handleUpdateStepSLA(
                                stepConfig.step,
                                'warningThresholdHours',
                                parseInt(e.target.value) || stepConfig.warningThresholdHours
                              )
                            }
                            className="w-16 px-1.5 py-1 text-center border border-amber-300 bg-amber-50/40 text-amber-800 rounded font-mono font-bold text-xs"
                          />
                          <span className="text-slate-500 text-[11px]">h</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            min={1}
                            max={168}
                            value={stepConfig.escalationThresholdHours}
                            onChange={(e) =>
                              handleUpdateStepSLA(
                                stepConfig.step,
                                'escalationThresholdHours',
                                parseInt(e.target.value) || stepConfig.escalationThresholdHours
                              )
                            }
                            className="w-16 px-1.5 py-1 text-center border border-rose-300 bg-rose-50/40 text-rose-800 rounded font-mono font-bold text-xs"
                          />
                          <span className="text-slate-500 text-[11px]">h</span>
                        </div>
                      </td>
                      <td className="p-2.5">
                        <div className="flex flex-wrap gap-1">
                          {stepConfig.notifyRoles.map((role) => (
                            <span
                              key={role}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => setExpandedStep(isExpanded ? null : stepConfig.step)}
                          className="text-slate-500 hover:text-slate-800 font-medium text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Chi tiết</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={7} className="p-3 text-[11px] text-slate-600 border-t border-slate-100">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div>
                              <strong className="text-slate-800">Quy tắc điểm nghẽn tại bước {stepConfig.step}:</strong>{' '}
                              Nếu lệnh lưu lại tại bước này quá <span className="font-bold text-amber-700">{stepConfig.warningThresholdHours}h</span>,
                              hệ thống sẽ tự động gửi cảnh báo nhắc việc. Nếu vượt mốc <span className="font-bold text-rose-700">{stepConfig.escalationThresholdHours}h</span>,
                              lệnh được gắn cờ điểm nghẽn khẩn cấp (Bottleneck Alert).
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSendTestNotification(
                                    'SLACK',
                                    bottleneckAnalyses.find((b) => b.currentStep === stepConfig.step)?.orderId || 'TR-0001'
                                  )
                                }
                                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded font-semibold text-[10px] cursor-pointer"
                              >
                                Test cảnh báo bước này
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Proactive Bottleneck Scanner on Current Transfer Orders */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-600" />
              <span>Bộ Quét Nhận Diện Điểm Nghẽn Trực Tiếp (Live Overdue & Bottleneck Scanner)</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Quét toàn bộ lệnh điều động theo thời gian thực và đối chiếu với ma trận ngưỡng SLA vừa thiết lập
            </p>
          </div>
          <span className="text-[11px] text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded">
            Đang giám sát <strong>{bottleneckAnalyses.length}</strong> lệnh chuyển giao
          </span>
        </div>

        {bottleneckAnalyses.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <div className="font-bold text-slate-700 text-xs">Không có lệnh nào vi phạm ngưỡng SLA</div>
            <div className="text-[11px]">Toàn bộ lệnh đang lưu chuyển đúng tiến độ cam kết.</div>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-2.5">Mã Lệnh</th>
                  <th className="p-2.5">Tuyến Điều Động</th>
                  <th className="p-2.5">Bước Đang Dừng</th>
                  <th className="p-2.5">Thời Gian Tại Bước</th>
                  <th className="p-2.5">Mức Độ Rủi Ro</th>
                  <th className="p-2.5">Người Chịu Trách Nhiệm</th>
                  <th className="p-2.5">Nguyên Nhân & Hành Động Khắc Phục</th>
                  <th className="p-2.5 text-right">Kích Hoạt Bắn Cảnh Báo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bottleneckAnalyses.map((item) => (
                  <tr key={item.orderId} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-bold text-blue-700">
                      {item.orderId}
                    </td>
                    <td className="p-2.5 font-medium text-slate-800">
                      {item.fromFactory} ➔ {item.toFactory}
                    </td>
                    <td className="p-2.5 text-slate-900 font-semibold">
                      {item.currentStepName}
                    </td>
                    <td className="p-2.5">
                      <div className="font-mono font-bold text-slate-800">
                        {item.hoursElapsedAtStep} giờ
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Mục tiêu: {item.stepSLATarget}h ({item.slaBreachHours > 0 ? `+${item.slaBreachHours}h vượt SLA` : 'Trong hạn'})
                      </div>
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : item.severity === 'WARNING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {item.severity === 'CRITICAL' ? (
                          <>
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>BÁO ĐỘNG LEO THANG</span>
                          </>
                        ) : item.severity === 'WARNING' ? (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>CẢNH BÁO SỚM</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3 text-blue-600" />
                            <span>ĐÚNG TIẾN ĐỘ</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-700 font-medium">
                      {item.responsibleUser}
                    </td>
                    <td className="p-2.5 max-w-xs">
                      <div className="text-[11px] font-semibold text-slate-900 line-clamp-1">
                        {item.bottleneckReason}
                      </div>
                      <div className="text-[10px] text-blue-700 font-medium line-clamp-1">
                        👉 {item.recommendedAction}
                      </div>
                    </td>
                    <td className="p-2.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(item, 'slack')}
                          title="Xem trước định dạng thông báo"
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendTestNotification('SLACK', item.orderId)}
                          className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <span>Slack</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendTestNotification('EMAIL', item.orderId)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <span>Email</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispatch History & Audit Trail */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Nhật Ký Thông Báo Cảnh Báo Gần Nhất (Simulated Audit Trail)</span>
          </h4>
          <span className="text-[10px] font-mono text-slate-400">
            Lưu vết tự động các lần gửi thông báo
          </span>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="p-2.5">Thời Gian</th>
                <th className="p-2.5">Kênh</th>
                <th className="p-2.5">Lệnh / Bước</th>
                <th className="p-2.5">Người Nhận / Kênh</th>
                <th className="p-2.5">Tiêu Đề Thông Báo</th>
                <th className="p-2.5">Mức Độ</th>
                <th className="p-2.5 text-right">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settings.recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-2.5 font-mono text-[11px] text-slate-500">{log.timestamp}</td>
                  <td className="p-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.channel === 'SLACK'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {log.channel}
                    </span>
                  </td>
                  <td className="p-2.5 font-mono font-bold text-slate-800">
                    {log.orderId || '-'} {log.step ? `(B${log.step})` : ''}
                  </td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                    {log.recipientOrChannel}
                  </td>
                  <td className="p-2.5 text-slate-800 font-medium max-w-sm truncate">
                    {log.title}
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-700'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="p-2.5 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                      <Check className="w-3 h-3" />
                      <span>ĐÃ BẮN TIN</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 text-white rounded-lg shadow-md">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">Quản Trị Ngưỡng Thông Báo ETMS PRO</span>
          <span className="text-[11px] text-slate-400">
            (Cập nhật bởi: {settings.updatedBy})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu cấu hình ngưỡng</span>
          </button>
        </div>
      </div>

      {/* MODAL: LIVE PREVIEW OF SLACK & EMAIL NOTIFICATION PAYLOADS */}
      {previewModalOpen && selectedAnalysisForPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>Xem Trước Định Dạng Thông Báo Cảnh Báo SLA</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Lệnh: <strong>{selectedAnalysisForPreview.orderId}</strong> — {selectedAnalysisForPreview.currentStepName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-100/50 px-4 pt-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPreviewTab('slack')}
                className={`px-3 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  previewTab === 'slack'
                    ? 'border-purple-600 text-purple-700 bg-white rounded-t'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Slack Block Kit Message</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewTab('email')}
                className={`px-3 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  previewTab === 'email'
                    ? 'border-blue-600 text-blue-700 bg-white rounded-t'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Email HTML Template</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-slate-50">
              {previewTab === 'slack' ? (
                /* Slack Preview Box */
                <div className="bg-[#1a1d21] text-[#d1d2d3] p-4 rounded-lg font-sans text-xs border border-slate-700 shadow-inner space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white"># {settings.slack.channel}</span>
                      <span>•</span>
                      <span>Bot: {settings.slack.botUsername}</span>
                    </div>
                    <span className="bg-purple-900/60 text-purple-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-purple-700">
                      APP
                    </span>
                  </div>

                  <div
                    className={`pl-3 border-l-4 rounded-r bg-[#222529] p-3 space-y-2 ${
                      selectedAnalysisForPreview.severity === 'CRITICAL'
                        ? 'border-rose-500'
                        : 'border-amber-500'
                    }`}
                  >
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <span>{selectedAnalysisForPreview.severity === 'CRITICAL' ? '🚨' : '⚠️'}</span>
                      <span>[ETMS PRO] CẢNH BÁO TIẾN ĐỘ ĐIỀU ĐỘNG: {selectedAnalysisForPreview.orderId}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Lệnh điều động:</span>
                        <strong className="text-cyan-400">{selectedAnalysisForPreview.orderId}</strong> ({selectedAnalysisForPreview.fromFactory} ➔ {selectedAnalysisForPreview.toFactory})
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Mức độ:</span>
                        <span className="text-rose-400 font-bold">`{selectedAnalysisForPreview.severity}`</span> (Quá hạn {selectedAnalysisForPreview.slaBreachHours}h)
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Bước hiện tại:</span>
                        <strong className="text-white">{selectedAnalysisForPreview.currentStepName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Thời gian tại bước:</span>
                        <strong className="text-amber-300">{selectedAnalysisForPreview.hoursElapsedAtStep} giờ</strong> / SLA: {selectedAnalysisForPreview.stepSLATarget}h
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Người chịu trách nhiệm:</span>
                        <span className="text-slate-200">{selectedAnalysisForPreview.responsibleUser}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Hạn giao cam kết:</span>
                        <span className="text-slate-200">{selectedAnalysisForPreview.expectedDate}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 text-xs">
                      <span className="text-slate-400 block text-[10px]">Nguyên nhân điểm nghẽn:</span>
                      <blockquote className="border-l-2 border-slate-600 pl-2 text-slate-300 my-1 italic">
                        {selectedAnalysisForPreview.bottleneckReason}
                      </blockquote>
                      <span className="text-slate-400 block text-[10px] mt-2">Hành động đề xuất:</span>
                      <blockquote className="border-l-2 border-blue-500 pl-2 text-blue-300 my-1 font-semibold">
                        {selectedAnalysisForPreview.recommendedAction}
                      </blockquote>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-[#007a5a] text-white font-bold rounded text-xs cursor-pointer hover:bg-[#148567]"
                      >
                        🔎 Mở Lệnh Trên ETMS PRO
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 bg-[#2c3136] text-white font-bold rounded text-xs cursor-pointer hover:bg-[#383f45]"
                      >
                        📋 Xem Biên Bản & Xử Lý
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Email Preview Box */
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-3 text-xs">
                  <div className="pb-3 border-b border-slate-200 space-y-1 text-slate-600">
                    <div>
                      <strong className="text-slate-900">Người gửi:</strong> {settings.email.senderName} &lt;alert@oos.vn&gt;
                    </div>
                    <div>
                      <strong className="text-slate-900">Người nhận:</strong> {settings.email.primaryRecipients.join(', ')}
                    </div>
                    <div>
                      <strong className="text-slate-900">Tiêu đề:</strong>{' '}
                      <span className="font-bold text-rose-700">
                        [ETMS SLA ALERT] Cảnh báo quá hạn lệnh {selectedAnalysisForPreview.orderId} tại {selectedAnalysisForPreview.currentStepName}
                      </span>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-[#0b192c] text-white p-3 flex items-center justify-between font-bold">
                      <span>OOS ETMS PRO — WORKFLOW SLA ALERT</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded ${
                          selectedAnalysisForPreview.severity === 'CRITICAL' ? 'bg-rose-600' : 'bg-amber-600'
                        }`}
                      >
                        {selectedAnalysisForPreview.severity}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <h4 className="font-bold text-slate-900 text-sm">
                        Cảnh báo quá hạn quy trình 9 bước: Lệnh {selectedAnalysisForPreview.orderId}
                      </h4>
                      <p className="text-slate-600">
                        Hệ thống tự động phát hiện lệnh điều động thiết bị đang vượt quá ngưỡng thời gian cam kết (SLA) tại quy trình chuyển giao.
                      </p>

                      <table className="w-full text-xs">
                        <tbody>
                          <tr className="border-b border-slate-100">
                            <td className="py-1.5 font-bold text-slate-500 w-1/3">Mã lệnh:</td>
                            <td className="py-1.5 font-bold text-blue-700">{selectedAnalysisForPreview.orderId}</td>
                          </tr>
                          <tr className="border-b border-slate-100">
                            <td className="py-1.5 font-bold text-slate-500">Bước hiện tại:</td>
                            <td className="py-1.5 font-bold text-slate-900">{selectedAnalysisForPreview.currentStepName}</td>
                          </tr>
                          <tr className="border-b border-slate-100">
                            <td className="py-1.5 font-bold text-slate-500">Thời gian tại bước:</td>
                            <td className="py-1.5 font-bold text-rose-600">
                              {selectedAnalysisForPreview.hoursElapsedAtStep} giờ (SLA chuẩn: {selectedAnalysisForPreview.stepSLATarget}h)
                            </td>
                          </tr>
                          <tr className="border-b border-slate-100">
                            <td className="py-1.5 font-bold text-slate-500">Người chịu trách nhiệm:</td>
                            <td className="py-1.5 text-slate-800">{selectedAnalysisForPreview.responsibleUser}</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-900 rounded-r">
                        <strong>Nguyên nhân điểm nghẽn:</strong>
                        <p className="mt-0.5">{selectedAnalysisForPreview.bottleneckReason}</p>
                        <p className="mt-1 font-bold text-rose-800">
                          Hành động khắc phục: {selectedAnalysisForPreview.recommendedAction}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-200 bg-white flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Kênh xem trước: <strong>{previewTab.toUpperCase()}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleSendTestNotification(
                      previewTab === 'slack' ? 'SLACK' : 'EMAIL',
                      selectedAnalysisForPreview.orderId
                    );
                    setPreviewModalOpen(false);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Bắn tin thực tế ngay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-xs cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

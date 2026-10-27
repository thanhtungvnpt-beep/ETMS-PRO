import React, { useState } from 'react';
import {
  ReportingCycleConfig,
  WorkforceReminderTask,
  UserProfile,
} from '../../types/workforce';
import {
  RiskThresholds,
  saveStoredWorkforceThresholds,
} from '../../services/workforceStorage';
import {
  Settings,
  Calendar,
  Bell,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Clock,
  Shield,
  Lock,
  Unlock,
  Check,
  Send,
  Info,
} from 'lucide-react';

interface WorkforceSettingsProps {
  cycles: ReportingCycleConfig[];
  reminders: WorkforceReminderTask[];
  currentUser: UserProfile;
  thresholds: RiskThresholds;
  onUpdateCycles: (cycles: ReportingCycleConfig[]) => void;
  onUpdateReminders: (reminders: WorkforceReminderTask[]) => void;
  onUpdateThresholds: (thresholds: RiskThresholds) => void;
}

export const WorkforceSettings: React.FC<WorkforceSettingsProps> = ({
  cycles,
  reminders,
  currentUser,
  thresholds,
  onUpdateCycles,
  onUpdateReminders,
  onUpdateThresholds,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';

  // State for Thresholds
  const [seasonalHigh, setSeasonalHigh] = useState<number>(thresholds.seasonalHighThreshold);
  const [seasonalMed, setSeasonalMed] = useState<number>(thresholds.seasonalMediumThreshold);
  const [sopSpike, setSopSpike] = useState<number>(thresholds.sopSpikeThreshold);
  const [wfDrop, setWfDrop] = useState<number>(thresholds.workforceDropThreshold);
  const [thresholdSaved, setThresholdSaved] = useState(false);

  // State for New Cycle Modal
  const [isNewCycleOpen, setIsNewCycleOpen] = useState(false);
  const [newCycleId, setNewCycleId] = useState('2025-W18');
  const [newTitle, setNewTitle] = useState('Tuần 18 (28/04 - 04/05/2025)');
  const [newStartDate, setNewStartDate] = useState('2025-04-28');
  const [newDeadline, setNewDeadline] = useState('2025-05-02');

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: RiskThresholds = {
      seasonalHighThreshold: seasonalHigh,
      seasonalMediumThreshold: seasonalMed,
      sopSpikeThreshold: sopSpike,
      workforceDropThreshold: wfDrop,
    };
    onUpdateThresholds(updated);
    saveStoredWorkforceThresholds(updated);
    setThresholdSaved(true);
    setTimeout(() => setThresholdSaved(false), 2500);
  };

  const handleToggleLockCycle = (cycleId: string) => {
    if (!isAdmin) return;
    const updated = cycles.map((c) =>
      c.id === cycleId ? { ...c, isLocked: !c.isLocked } : c
    );
    onUpdateCycles(updated);
  };

  const handleToggleActiveCycle = (cycleId: string) => {
    if (!isAdmin) return;
    const updated = cycles.map((c) => ({
      ...c,
      isActive: c.id === cycleId,
    }));
    onUpdateCycles(updated);
  };

  const handleCreateCycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCycleId || !newDeadline) return;

    const newObj: ReportingCycleConfig = {
      id: newCycleId.trim(),
      title: newTitle.trim(),
      startDate: newStartDate,
      deadlineDate: newDeadline,
      reminderStart: 'Trước 24 giờ',
      reminderFrequency: 'Hằng ngày',
      targetAudience: 'Toàn bộ 7 Vendor',
      isActive: false,
      isLocked: false,
    };

    onUpdateCycles([...cycles, newObj]);
    setIsNewCycleOpen(false);
  };

  const handleResolveReminder = (remId: string) => {
    const updated = reminders.map((r) =>
      r.id === remId ? { ...r, resolved: true } : r
    );
    onUpdateReminders(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              TRANG 6
            </span>
            <h1 className="text-xl font-black text-navy-950 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Cấu Hình Chu Kỳ Cập Nhật & Ngưỡng Nhắc Việc
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị thời hạn nộp số liệu tuần, cài đặt ngưỡng cảnh báo sớm và theo dõi danh sách nhắc việc nội bộ
          </p>
        </div>

        {!isAdmin && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Bạn đang xem ở chế độ chỉ đọc. Chỉ tài khoản Admin mới được sửa cấu hình.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Chu kỳ cập nhật tuần */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-navy-950">Danh Sách Chu Kỳ Báo Cáo Tuần</h3>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsNewCycleOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Mở kỳ mới
              </button>
            )}
          </div>

          <div className="space-y-3">
            {cycles.map((c) => (
              <div
                key={c.id}
                className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                  c.isActive
                    ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-navy-950 text-sm">{c.id}</span>
                    {c.isActive && (
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                        Kỳ hiện tại
                      </span>
                    )}
                    {c.isLocked && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-500" /> Đã đóng
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleActiveCycle(c.id)}
                        disabled={c.isActive}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-semibold text-slate-700 disabled:opacity-40"
                      >
                        Đặt hiện tại
                      </button>
                      <button
                        onClick={() => handleToggleLockCycle(c.id)}
                        className={`p-1 rounded text-slate-600 hover:bg-slate-100 ${
                          c.isLocked ? 'text-amber-700' : 'text-slate-600'
                        }`}
                        title={c.isLocked ? 'Mở khóa kỳ' : 'Khóa chốt số liệu'}
                      >
                        {c.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-slate-600 font-medium">{c.title}</div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-mono">
                  <div>
                    Ngày bắt đầu: <strong>{c.startDate}</strong>
                  </div>
                  <div>
                    Hạn chốt nộp: <strong className="text-red-600">{c.deadlineDate}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Cài đặt ngưỡng cảnh báo rủi ro */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-sm text-navy-950">
                Ngưỡng Đánh Giá Cảnh Báo Sớm (Phase 1)
              </h3>
            </div>
            {thresholdSaved && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Đã lưu cấu hình
              </span>
            )}
          </div>

          <form onSubmit={handleSaveThresholds} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                1. Ngưỡng cảnh báo ĐỎ: Tỷ lệ lao động thời vụ cao (%)
              </label>
              <input
                type="number"
                min="10"
                max="90"
                disabled={!isAdmin}
                value={seasonalHigh}
                onChange={(e) => setSeasonalHigh(parseInt(e.target.value, 10) || 40)}
                className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-red-600 disabled:bg-slate-100"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Khi tỷ lệ thời vụ $\ge$ ngưỡng này, hệ thống gắn cờ nguy cơ rủi ro chất lượng và kỷ luật dây chuyền.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                2. Ngưỡng cảnh báo VÀNG: Tỷ lệ lao động thời vụ tiệm cận (%)
              </label>
              <input
                type="number"
                min="5"
                max="50"
                disabled={!isAdmin}
                value={seasonalMed}
                onChange={(e) => setSeasonalMed(parseInt(e.target.value, 10) || 30)}
                className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-amber-600 disabled:bg-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  3. Kế hoạch SOP tăng đột biến ($\ge$ %)
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  disabled={!isAdmin}
                  value={sopSpike}
                  onChange={(e) => setSopSpike(parseInt(e.target.value, 10) || 15)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-purple-700 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  4. Nhân lực giảm so với tuần trước ($\le$ -%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  disabled={!isAdmin}
                  value={wfDrop}
                  onChange={(e) => setWfDrop(parseInt(e.target.value, 10) || 5)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-red-600 disabled:bg-slate-100"
                />
              </div>
            </div>

            {isAdmin && (
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold text-xs transition-all shadow-xs"
                >
                  Lưu thiết lập ngưỡng
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* BOTTOM SECTION: Danh sách nhắc việc nội bộ (In-app task feed) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600" />
            <div>
              <h3 className="font-bold text-sm text-navy-950">
                Danh Sách Nhắc Việc & Đôn Đốc Báo Cáo Trong Hệ Thống (In-App Reminder Feed)
              </h3>
              <p className="text-[11px] text-slate-500">
                Ghi chú: Tính năng đôn đốc hoạt động qua cổng tác vụ nội bộ của ETMS PRO (chưa kích hoạt cổng SMS/Email ngoài).
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
            {reminders.filter((r) => !r.resolved).length} tác vụ đang mở
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                rem.resolved ? 'bg-slate-50/50 opacity-60' : 'hover:bg-amber-50/20'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      rem.type === 'OVERDUE'
                        ? 'bg-red-100 text-red-800'
                        : rem.type === 'REVISION_NEEDED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {rem.type}
                  </span>
                  <strong className="text-navy-950 font-bold">{rem.title}</strong>
                  <span className="text-slate-500">({rem.vendor} — {rem.factory})</span>
                </div>
                <p className="text-slate-600 text-xs">{rem.message}</p>
                <div className="text-[10px] text-slate-400 font-mono">Tạo lúc: {rem.createdAt}</div>
              </div>

              {!rem.resolved && (
                <button
                  onClick={() => handleResolveReminder(rem.id)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs transition-all flex items-center gap-1 shrink-0 self-start md:self-auto"
                >
                  <Check className="w-3.5 h-3.5" />
                  Đánh dấu đã xử lý
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: Mở kỳ mới */}
      {isNewCycleOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-navy-950 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Khởi tạo chu kỳ báo cáo tuần mới</h3>
              <button
                onClick={() => setIsNewCycleOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCycle} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã kỳ báo cáo</label>
                <input
                  type="text"
                  required
                  placeholder="VD: 2025-W18"
                  value={newCycleId}
                  onChange={(e) => setNewCycleId(e.target.value.toUpperCase())}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề chu kỳ</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Tuần 18 (28/04 - 04/05/2025)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hạn chốt nộp</label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewCycleOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold"
                >
                  Tạo chu kỳ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

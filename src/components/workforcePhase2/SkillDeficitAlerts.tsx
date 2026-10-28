import React, { useState, useMemo } from 'react';
import {
  SkillDeficitWarningTicket,
  SkillWarningType,
  WarningTicketStatus,
  SkillItem,
} from '../../types/workforcePhase2';
import {
  getStoredWarningTickets,
  saveStoredWarningTickets,
  getStoredSkills,
} from '../../services/workforcePhase2Storage';
import { VENDORS, FACTORIES, WORKFORCE_GROUPS, UserProfile, VendorName, FactoryName, WorkforceGroup, WorkforceDetailPosition } from '../../types';

interface Props {
  currentUser: UserProfile;
}

export const SkillDeficitAlerts: React.FC<Props> = ({ currentUser }) => {
  const [tickets, setTickets] = useState<SkillDeficitWarningTicket[]>(() => getStoredWarningTickets());
  const [skills] = useState<SkillItem[]>(() => getStoredSkills());

  // Filter states
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterVendor, setFilterVendor] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Modal: Create Ticket
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState<{
    type: SkillWarningType;
    vendor: VendorName;
    factory: FactoryName;
    group: WorkforceGroup;
    position: WorkforceDetailPosition;
    skillCode: string;
    severity: 'CAO' | 'TRUNG BÌNH' | 'THẤP';
    demand: number;
    qualified: number;
    rootCause: string;
    recommendedAction: string;
    assignedTo: string;
    deadline: string;
  }>({
    type: 'THIẾU_HỤT_NGHIÊM_TRỌNG',
    vendor: 'DREAM TECH',
    factory: 'Nhà máy A',
    group: 'Sản xuất',
    position: 'Đứng line sản xuất',
    skillCode: skills[0]?.skillCode || '',
    severity: 'CAO',
    demand: 5,
    qualified: 2,
    rootCause: '',
    recommendedAction: '',
    assignedTo: '',
    deadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  });

  // Modal: Update Ticket Status & Resolution
  const [selectedTicket, setSelectedTicket] = useState<SkillDeficitWarningTicket | null>(null);
  const [updateStatus, setUpdateStatus] = useState<WarningTicketStatus>('ĐANG XỬ LÝ');
  const [resolutionNote, setResolutionNote] = useState<string>('');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (filterSeverity !== 'ALL' && t.severity !== filterSeverity) return false;
      if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
      if (filterVendor !== 'ALL' && t.vendor !== filterVendor) return false;
      if (filterType !== 'ALL' && t.type !== filterType) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesCode = t.code.toLowerCase().includes(term);
        const matchesSkill = (t.skillName || '').toLowerCase().includes(term);
        const matchesAssignee = t.assignedTo.toLowerCase().includes(term);
        const matchesCause = t.rootCause.toLowerCase().includes(term);
        if (!matchesCode && !matchesSkill && !matchesAssignee && !matchesCause) return false;
      }
      return true;
    });
  }, [tickets, filterSeverity, filterStatus, filterVendor, filterType, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = tickets.length;
    const high = tickets.filter((t) => t.severity === 'CAO' && t.status !== 'ĐÃ GIẢI QUYẾT' && t.status !== 'ĐÓNG').length;
    const pending = tickets.filter((t) => t.status === 'MỚI' || t.status === 'ĐANG XỬ LÝ').length;
    const resolved = tickets.filter((t) => t.status === 'ĐÃ GIẢI QUYẾT' || t.status === 'ĐÓNG').length;
    const spof = tickets.filter((t) => t.type === 'ĐIỂM_NGHẼN_DUY_NHẤT' && t.status !== 'ĐÃ GIẢI QUYẾT').length;
    return { total, high, pending, resolved, spof };
  }, [tickets]);

  // Submit Create Ticket
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.rootCause || !newTicket.recommendedAction || !newTicket.assignedTo) {
      showToast('Vui lòng điền nguyên nhân, phương án khắc phục và người chịu trách nhiệm.', 'error');
      return;
    }

    const selectedSkill = skills.find((s) => s.skillCode === newTicket.skillCode);
    const gap = Math.max(0, newTicket.demand - newTicket.qualified);

    const ticket: SkillDeficitWarningTicket = {
      id: `WRN-${Date.now().toString().slice(-6)}`,
      code: `WRN-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      type: newTicket.type,
      vendor: newTicket.vendor,
      factory: newTicket.factory,
      group: newTicket.group,
      position: newTicket.position,
      skillCode: newTicket.skillCode,
      skillName: selectedSkill?.name || 'Kỹ năng đặc thù',
      severity: newTicket.severity,
      demand: newTicket.demand,
      qualified: newTicket.qualified,
      gap,
      rootCause: newTicket.rootCause,
      recommendedAction: newTicket.recommendedAction,
      assignedTo: newTicket.assignedTo,
      deadline: newTicket.deadline,
      status: 'MỚI',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const updated = [ticket, ...tickets];
    setTickets(updated);
    saveStoredWarningTickets(updated);
    setShowCreateModal(false);
    showToast(`Đã phát hành phiếu cảnh báo ${ticket.code} thành công.`);
  };

  // Submit Update Ticket Status
  const handleSaveTicketUpdate = () => {
    if (!selectedTicket) return;
    const isResolved = updateStatus === 'ĐÃ GIẢI QUYẾT' || updateStatus === 'ĐÓNG';

    if (isResolved && (!resolutionNote || resolutionNote.trim().length === 0)) {
      showToast('Bắt buộc phải ghi nhận kết quả xử lý trước khi đóng phiếu cảnh báo.', 'error');
      return;
    }

    const updated = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: updateStatus,
          resolutionNote: resolutionNote || t.resolutionNote,
          resolvedAt: isResolved ? new Date().toISOString().slice(0, 10) : t.resolvedAt,
        };
      }
      return t;
    });

    setTickets(updated);
    saveStoredWarningTickets(updated);
    setSelectedTicket(null);
    showToast(`Đã cập nhật trạng thái phiếu ${selectedTicket.code}.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 border shadow-lg flex items-center gap-3 text-sm font-semibold transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : 'bg-rose-900 text-rose-100 border-rose-700'
          }`}
        >
          <span>{notification.type === 'success' ? '✓' : '⚠'}</span>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#0c2340] text-white p-5 border-l-4 border-rose-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 bg-rose-600/40 text-rose-200 border border-rose-400/40">
              MODULE G • DEFICIT TICKETING & ACTION PLANS
            </span>
            <span className="text-xs text-slate-300">Cơ chế phát hành & Giám sát khắc phục rủi ro kỹ năng</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mt-1 text-white">
            QUẢN LÝ PHIẾU CẢNH BÁO THIẾU HỤT & ĐIỂM NGHẼN TAY NGHỀ
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Ghi nhận nguyên nhân gốc rễ, phân công người phụ trách, thời hạn khắc phục và giám sát kết quả đào tạo bổ sung.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
        >
          <span>+</span>
          <span>PHÁT HÀNH PHIẾU CẢNH BÁO MỚI</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-rose-600">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cảnh báo mức Cao (Chưa giải quyết)</div>
          <div className="text-2xl font-black text-rose-700 mt-1">{stats.high}</div>
          <div className="text-[11px] text-rose-600 mt-1">Ưu tiên xử lý ngay trong ca</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-amber-500">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Điểm nghẽn rủi ro (SPOF)</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats.spof}</div>
          <div className="text-[11px] text-amber-700 mt-1">Chỉ có 1 nhân sự đáp ứng</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-blue-600">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Đang triển khai khắc phục</div>
          <div className="text-2xl font-black text-blue-900 mt-1">{stats.pending}</div>
          <div className="text-[11px] text-slate-500 mt-1">Đã giao đầu mối xử lý</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-emerald-600">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Đã khắc phục hoàn tất</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{stats.resolved}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Đã bổ sung nhân sự & duyệt kết quả</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Vendor */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Vendor:</label>
            <select
              value={filterVendor}
              onChange={(e) => setFilterVendor(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 bg-white font-medium focus:outline-none"
            >
              <option value="ALL">Tất cả 7 Vendor</option>
              {VENDORS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Mức độ:</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 bg-white font-medium focus:outline-none"
            >
              <option value="ALL">Tất cả mức độ</option>
              <option value="CAO">Mức Cao (Critical)</option>
              <option value="TRUNG BÌNH">Mức Trung bình</option>
              <option value="THẤP">Mức Thấp</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Trạng thái:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 bg-white font-medium focus:outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="MỚI">Mới phát hành</option>
              <option value="ĐANG XỬ LÝ">Đang xử lý</option>
              <option value="CHỜ XÁC NHẬN">Chờ xác nhận</option>
              <option value="ĐÃ GIẢI QUYẾT">Đã giải quyết</option>
              <option value="ĐÓNG">Đã đóng</option>
            </select>
          </div>

          {/* Type */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Loại cảnh báo:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 bg-white font-medium focus:outline-none"
            >
              <option value="ALL">Tất cả loại cảnh báo</option>
              <option value="THIẾU_HỤT_NGHIÊM_TRỌNG">Thiếu hụt định mức</option>
              <option value="ĐIỂM_NGHẼN_DUY_NHẤT">Điểm nghẽn duy nhất (SPOF)</option>
              <option value="CHỨNG_CHỈ_SẮP_HẾT_HẠN">Chứng chỉ sắp hết hạn</option>
              <option value="CHỨNG_CHỈ_ĐÃ_HẾT_HẠN">Chứng chỉ đã hết hạn</option>
              <option value="ĐÀO_TẠO_QUÁ_HẠN">Đào tạo quá hạn</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="w-full md:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã phiếu, kỹ năng, người phụ trách..."
            className="w-full px-3 py-1.5 text-xs border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Danh sách Phiếu Cảnh báo Rủi ro Kỹ năng ({filteredTickets.length})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Quy trình: Mới → Phân công → Hành động khắc phục → Đánh giá lại → Đóng
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredTickets.length === 0 ? (
            <div className="py-12 text-center text-slate-400 italic">
              Không có phiếu cảnh báo nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const isResolved = ticket.status === 'ĐÃ GIẢI QUYẾT' || ticket.status === 'ĐÓNG';

              return (
                <div
                  key={ticket.id}
                  className={`p-4 transition-colors ${
                    ticket.severity === 'CAO' && !isResolved
                      ? 'bg-rose-50/20 hover:bg-rose-50/40'
                      : ticket.type === 'ĐIỂM_NGHẼN_DUY_NHẤT' && !isResolved
                      ? 'bg-amber-50/20 hover:bg-amber-50/40'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      {/* Top badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 border border-slate-300">
                          {ticket.code}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 border ${
                            ticket.severity === 'CAO'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : ticket.severity === 'TRUNG BÌNH'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          MỨC {ticket.severity}
                        </span>

                        <span className="text-[10px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 border border-blue-200">
                          {ticket.vendor} • {ticket.factory}
                        </span>

                        <span className="text-[10px] text-slate-500 font-mono">
                          Tạo ngày: {ticket.createdAt}
                        </span>
                      </div>

                      {/* Title & Skill */}
                      <div className="text-sm font-bold text-slate-900">
                        {ticket.skillName || ticket.position}
                        {ticket.skillCode && (
                          <span className="ml-2 font-mono text-xs text-slate-500 font-normal">
                            ({ticket.skillCode})
                          </span>
                        )}
                      </div>

                      {/* Demand vs Qualified status */}
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="text-slate-600">
                          Nhu cầu định mức: <strong className="text-slate-900">{ticket.demand}</strong>
                        </span>
                        <span className="text-slate-600">
                          Hiện đạt chuẩn: <strong className="text-emerald-700">{ticket.qualified}</strong>
                        </span>
                        <span className="text-rose-700 font-bold">
                          Thiếu hụt: -{ticket.gap}
                        </span>
                      </div>

                      {/* Root cause and action */}
                      <div className="bg-slate-50 p-2.5 border border-slate-200 text-xs space-y-1 text-slate-700 mt-2">
                        <div>
                          <strong className="text-slate-900">Nguyên nhân gốc rễ:</strong> {ticket.rootCause}
                        </div>
                        <div>
                          <strong className="text-blue-900">Hành động khắc phục đề xuất:</strong>{' '}
                          {ticket.recommendedAction}
                        </div>
                        {ticket.resolutionNote && (
                          <div className="text-emerald-800 pt-1 border-t border-slate-200 mt-1">
                            <strong>Kết quả xử lý:</strong> {ticket.resolutionNote} ({ticket.resolvedAt})
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right action and status column */}
                    <div className="flex flex-col md:items-end justify-between gap-3 text-xs min-w-[200px]">
                      {/* Status badge */}
                      <div>
                        {ticket.status === 'MỚI' && (
                          <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            MỚI PHÁT HÀNH
                          </span>
                        )}
                        {ticket.status === 'ĐANG XỬ LÝ' && (
                          <span className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            ĐANG XỬ LÝ
                          </span>
                        )}
                        {ticket.status === 'CHỜ XÁC NHẬN' && (
                          <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            CHỜ XÁC NHẬN
                          </span>
                        )}
                        {ticket.status === 'ĐÃ GIẢI QUYẾT' && (
                          <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ĐÃ GIẢI QUYẾT
                          </span>
                        )}
                        {ticket.status === 'ĐÓNG' && (
                          <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            ĐÃ ĐÓNG
                          </span>
                        )}
                      </div>

                      {/* Assignee & Deadline */}
                      <div className="text-left md:text-right space-y-0.5">
                        <div className="text-slate-500 text-[11px]">Người phụ trách:</div>
                        <div className="font-bold text-slate-900">{ticket.assignedTo}</div>
                        <div className="text-slate-500 text-[11px] font-mono mt-1">
                          Hạn xử lý: <strong className="text-rose-700">{ticket.deadline}</strong>
                        </div>
                      </div>

                      {/* Action button */}
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setUpdateStatus(ticket.status);
                          setResolutionNote(ticket.resolutionNote || '');
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-100 text-blue-800 border border-slate-300 font-bold transition-colors text-xs"
                      >
                        ⚙ Xử lý phiếu
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Create Warning Ticket */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-lg w-full p-6 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 uppercase">
                🚨 Phát hành Phiếu Cảnh báo Thiếu hụt & Rủi ro Kỹ năng
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loại rủi ro cảnh báo:</label>
                  <select
                    value={newTicket.type}
                    onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value as SkillWarningType })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white font-medium"
                  >
                    <option value="THIẾU_HỤT_NGHIÊM_TRỌNG">Thiếu hụt định mức vận hành</option>
                    <option value="ĐIỂM_NGHẼN_DUY_NHẤT">Điểm nghẽn duy nhất (SPOF - 1 người)</option>
                    <option value="CHỨNG_CHỈ_SẮP_HẾT_HẠN">Chứng chỉ chuyên môn sắp hết hạn</option>
                    <option value="CHỨNG_CHỈ_ĐÃ_HẾT_HẠN">Chứng chỉ đã hết hạn</option>
                    <option value="ĐÀO_TẠO_QUÁ_HẠN">Kế hoạch đào tạo quá hạn</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mức độ nghiêm trọng:</label>
                  <select
                    value={newTicket.severity}
                    onChange={(e) => setNewTicket({ ...newTicket, severity: e.target.value as 'CAO' | 'TRUNG BÌNH' | 'THẤP' })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white font-bold text-rose-800"
                  >
                    <option value="CAO">Mức Cao (Critical)</option>
                    <option value="TRUNG BÌNH">Mức Trung bình (Medium)</option>
                    <option value="THẤP">Mức Thấp (Low)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor:</label>
                  <select
                    value={newTicket.vendor}
                    onChange={(e) => setNewTicket({ ...newTicket, vendor: e.target.value as VendorName })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white font-medium"
                  >
                    {VENDORS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nhà máy:</label>
                  <select
                    value={newTicket.factory}
                    onChange={(e) => setNewTicket({ ...newTicket, factory: e.target.value as FactoryName })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white font-medium"
                  >
                    {FACTORIES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kỹ năng liên quan:</label>
                <select
                  value={newTicket.skillCode}
                  onChange={(e) => setNewTicket({ ...newTicket, skillCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white font-medium"
                >
                  {skills.map((s) => (
                    <option key={s.skillCode} value={s.skillCode}>
                      [{s.skillCode}] {s.name} ({s.criticality})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nhu cầu (Định mức người):</label>
                  <input
                    type="number"
                    min="1"
                    value={newTicket.demand}
                    onChange={(e) => setNewTicket({ ...newTicket, demand: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thực tế đạt chuẩn:</label>
                  <input
                    type="number"
                    min="0"
                    value={newTicket.qualified}
                    onChange={(e) => setNewTicket({ ...newTicket, qualified: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phân tích nguyên nhân gốc rễ (Root cause):</label>
                <textarea
                  rows={2}
                  required
                  placeholder="VD: Biến động nhân sự thời vụ cao; nhân sự chính thức chuyển sang dây chuyền mới..."
                  value={newTicket.rootCause}
                  onChange={(e) => setNewTicket({ ...newTicket, rootCause: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kế hoạch hành động khắc phục (Action Plan):</label>
                <textarea
                  rows={2}
                  required
                  placeholder="VD: Mở lớp đào tạo kèm cặp trong 10 ngày; luân chuyển 1 kỹ thuật viên từ Nhà máy B hỗ trợ..."
                  value={newTicket.recommendedAction}
                  onChange={(e) => setNewTicket({ ...newTicket, recommendedAction: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Đầu mối phụ trách xử lý:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Quản đốc Nguyễn Văn C"
                    value={newTicket.assignedTo}
                    onChange={(e) => setNewTicket({ ...newTicket, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thời hạn hoàn thành (Deadline):</label>
                  <input
                    type="date"
                    required
                    value={newTicket.deadline}
                    onChange={(e) => setNewTicket({ ...newTicket, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-700 text-white font-bold hover:bg-rose-800"
                >
                  PHÁT HÀNH CẢNH BÁO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Process & Update Ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-md w-full p-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 uppercase">
                ⚙ Cập nhật Xử lý Phiếu ({selectedTicket.code})
              </h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-800">{selectedTicket.skillName}</div>
                <div className="text-slate-500 mt-0.5">
                  Đơn vị: {selectedTicket.vendor} ({selectedTicket.factory})
                </div>
                <div className="text-slate-500 mt-0.5">
                  Người phụ trách: {selectedTicket.assignedTo} • Hạn: {selectedTicket.deadline}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trạng thái xử lý:</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as WarningTicketStatus)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white font-medium"
                >
                  <option value="MỚI">Mới phát hành</option>
                  <option value="ĐANG XỬ LÝ">Đang xử lý (Triển khai đào tạo / điều chuyển)</option>
                  <option value="CHỜ XÁC NHẬN">Chờ xác nhận (Đã hoàn tất, chờ HR nghiệm thu)</option>
                  <option value="ĐÃ GIẢI QUYẾT">Đã giải quyết (Đạt chuẩn định mức)</option>
                  <option value="ĐÓNG">Đã đóng phiếu</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ghi nhận kết quả xử lý {updateStatus === 'ĐÃ GIẢI QUYẾT' ? '(Bắt buộc)' : ''}:
                </label>
                <textarea
                  rows={3}
                  placeholder="Ghi nhận số nhân sự đã hoàn thành đào tạo, số chứng chỉ mới được cấp, nghiệm thu của quản đốc..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold"
                >
                  HỦY
                </button>
                <button
                  type="button"
                  onClick={handleSaveTicketUpdate}
                  className="px-5 py-2 bg-blue-700 text-white font-bold hover:bg-blue-800"
                >
                  LƯU TIẾN TRÌNH
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

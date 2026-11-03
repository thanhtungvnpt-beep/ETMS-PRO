// OOS ETMS PRO — Field Issue Detail Modal
// Multi-day Issue Lifecycle Management, timeline audit, status transitions

import React, { useState } from 'react';
import {
  FieldDailyIssue,
  FieldIssueStatus,
  FieldIssueSeverity,
  FieldIssueCategory,
} from '../../types/fieldReport';
import { UserProfile } from '../../types/workforce';
import { updateFieldIssueStatus } from '../../services/fieldReportStorage';
import {
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Cpu,
  ShieldAlert,
  Users,
  TrendingUp,
  Building2,
  Calendar,
  User,
  Wrench,
  Camera,
  History,
  Send,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface FieldIssueDetailModalProps {
  issue: FieldDailyIssue | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onIssueUpdated: (updatedIssues: FieldDailyIssue[]) => void;
}

const STATUS_CONFIG: Record<
  FieldIssueStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  MỚI_PHÁT_SINH: { label: 'Mới phát sinh', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  ĐÃ_TIẾP_NHẬN: { label: 'Đã tiếp nhận', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  ĐANG_XỬ_LÝ: { label: 'Đang xử lý', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  CHỜ_HỖ_TRỢ: { label: 'Chờ hỗ trợ', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  ĐÃ_KHẮC_PHỤC: { label: 'Đã khắc phục', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  ĐÃ_XÁC_NHẬN: { label: 'Đã xác nhận', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  ĐÓNG_VẤN_ĐỀ: { label: 'Đóng vấn đề', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
};

const SEVERITY_CONFIG: Record<
  FieldIssueSeverity,
  { label: string; bg: string; text: string; border: string }
> = {
  CRITICAL: { label: 'Critical', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
  HIGH: { label: 'High', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  LOW: { label: 'Low', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

export const FieldIssueDetailModal: React.FC<FieldIssueDetailModalProps> = ({
  issue,
  isOpen,
  onClose,
  currentUser,
  onIssueUpdated,
}) => {
  if (!isOpen || !issue) return null;

  const [newStatus, setNewStatus] = useState<FieldIssueStatus>(issue.status);
  const [updateNotes, setUpdateNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateNotes.trim()) {
      alert('Vui lòng nhập ghi chú tiến độ cập nhật!');
      return;
    }

    setIsSubmitting(true);
    const updatedList = updateFieldIssueStatus(
      issue.id,
      newStatus,
      currentUser.name || 'Người dùng OOS',
      currentUser.title || 'Quản lý hiện trường',
      updateNotes.trim()
    );

    setIsSubmitting(false);
    onIssueUpdated(updatedList);
    setUpdateNotes('');
    setToastMsg(`Đã cập nhật tiến độ cho vấn đề ${issue.id} thành công!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const getCategoryColor = (cat: FieldIssueCategory) => {
    switch (cat) {
      case 'EQM':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'QC':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'HR':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'PRODUCTION':
        return 'text-purple-600 bg-purple-50 border-purple-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 text-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#082D55] text-white px-5 py-4 flex items-center justify-between border-b border-blue-900 shrink-0">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase border ${getCategoryColor(issue.category)}`}>
              {issue.category}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-cyan-300 text-sm">{issue.id}</span>
                <span className="text-xs text-slate-300">• {issue.factory} — {issue.vendor} — {issue.lineCode}</span>
              </div>
              <h2 className="text-base font-extrabold text-white mt-0.5">{issue.title}</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-blue-900/60 hover:bg-blue-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status banner */}
        <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">Trạng thái:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold border ${STATUS_CONFIG[issue.status].bg} ${STATUS_CONFIG[issue.status].text} ${STATUS_CONFIG[issue.status].border}`}
            >
              {STATUS_CONFIG[issue.status].label}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full font-black uppercase text-[10px] border ${SEVERITY_CONFIG[issue.severity].bg} ${SEVERITY_CONFIG[issue.severity].text} ${SEVERITY_CONFIG[issue.severity].border}`}
            >
              {SEVERITY_CONFIG[issue.severity].label}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
            <span>Phát sinh: {issue.reportedDate} {issue.reportedTime}</span>
            <span>•</span>
            <span>Báo cáo bởi: <strong className="text-slate-800">{issue.reportedBy}</strong></span>
          </div>
        </div>

        {/* Toast message if present */}
        {toastMsg && (
          <div className="bg-emerald-600 text-white px-5 py-2 text-xs font-bold flex items-center justify-between shrink-0">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {toastMsg}
            </span>
            <button type="button" onClick={() => setToastMsg('')}>✕</button>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Detailed Description */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-navy-950 text-xs uppercase tracking-wide">
              Mô tả chi tiết sự cố / Hiện tượng
            </h4>
            <p className="text-slate-700 leading-relaxed text-xs whitespace-pre-line">
              {issue.description}
            </p>
          </div>

          {/* Category-specific attributes grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {issue.category === 'EQM' && (
              <>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Thiết bị</div>
                  <div className="font-bold text-navy-950 text-xs mt-0.5">{issue.equipmentName || 'Máy ép'}</div>
                  <div className="text-[10px] font-mono text-slate-500">{issue.equipmentCode}</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Trạm máy</div>
                  <div className="font-bold text-navy-950 text-xs mt-0.5">{issue.stationCode || 'ST-01'}</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Thời gian dừng máy</div>
                  <div className="font-black text-rose-600 text-xs font-mono mt-0.5">{issue.downtimeMinutes || 0} phút</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Người phụ trách EQM</div>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">{issue.assignedTo || 'Chờ phân công'}</div>
                </div>
              </>
            )}

            {issue.category === 'QC' && (
              <>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Model sản phẩm</div>
                  <div className="font-bold text-navy-950 text-xs mt-0.5">{issue.productModel || 'Model A'}</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Loại lỗi NG</div>
                  <div className="font-bold text-amber-700 text-xs mt-0.5">{issue.defectType || 'Lỗi test'}</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Số lượng ảnh hưởng</div>
                  <div className="font-black text-rose-600 text-xs font-mono mt-0.5">{issue.affectedQuantity || 0} PCS</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Phụ trách QC</div>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">{issue.assignedTo || 'QC Manager'}</div>
                </div>
              </>
            )}

            {issue.category === 'PRODUCTION' && (
              <>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Kế hoạch SOP</div>
                  <div className="font-black text-navy-950 text-xs font-mono mt-0.5">{issue.plannedOutput || 480} PCS</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Thực tế đạt</div>
                  <div className="font-black text-purple-700 text-xs font-mono mt-0.5">{issue.actualOutput || 440} PCS</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Chênh lệch</div>
                  <div className="font-black text-rose-600 text-xs font-mono mt-0.5">{issue.outputVariance || -40} PCS ({issue.variancePercentage || -8.3}%)</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Nguyên nhân</div>
                  <div className="font-medium text-slate-700 text-[11px] mt-0.5 line-clamp-2">{issue.productionImpactReason || 'Thiếu linh kiện'}</div>
                </div>
              </>
            )}

            {issue.category === 'HR' && (
              <>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Kế hoạch quân số</div>
                  <div className="font-black text-navy-950 text-xs font-mono mt-0.5">{issue.plannedHeadcount || 50} người</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Thực có tại Line</div>
                  <div className="font-black text-emerald-700 text-xs font-mono mt-0.5">{issue.actualHeadcount || 50} người</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Thiếu hụt</div>
                  <div className="font-black text-rose-600 text-xs font-mono mt-0.5">{issue.shortageCount || 0} người</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Trạng thái</div>
                  <div className="font-bold text-emerald-700 text-xs mt-0.5">Nhân lực ổn định</div>
                </div>
              </>
            )}
          </div>

          {/* Photos */}
          {issue.photos && issue.photos.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-extrabold text-navy-950 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                <Camera className="w-4 h-4 text-blue-600" />
                Hình ảnh hiện trường ({issue.photos.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {issue.photos.map((url, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full h-36 object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full text-slate-800 shadow">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Multi-day Timeline Update Logs */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h4 className="font-extrabold text-[#082D55] text-xs flex items-center gap-1.5 uppercase tracking-wide">
              <History className="w-4 h-4 text-blue-600" />
              Tiến độ xử lý xuyên suốt (Issue Lifecycle Timeline)
            </h4>

            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
              {(issue.historyLogs || []).map((log, idx) => (
                <div key={log.id || idx} className="relative">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-navy-950">{log.action}</span>
                      <span className="font-mono text-slate-400">{log.timestamp}</span>
                    </div>
                    <div className="text-slate-600 text-xs">{log.notes}</div>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 pt-0.5">
                      <span>Cập nhật bởi: <strong>{log.updatedBy}</strong> ({log.role})</span>
                      <span>•</span>
                      <span className="text-blue-700 font-bold">{STATUS_CONFIG[log.statusAfter]?.label || log.statusAfter}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Form: Update Status & Add Progress Log */}
          <form onSubmit={handleUpdateStatus} className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200 space-y-3">
            <h4 className="font-extrabold text-[#082D55] text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#0878E8]" />
              Cập nhật tiến độ / Chuyển trạng thái xử lý
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold text-[11px] mb-1">
                  Trạng thái mới:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as FieldIssueStatus)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value="MỚI_PHÁT_SINH">Mới phát sinh</option>
                  <option value="ĐÃ_TIẾP_NHẬN">Đã tiếp nhận</option>
                  <option value="ĐANG_XỬ_LÝ">Đang xử lý</option>
                  <option value="CHỜ_HỖ_TRỢ">Chờ hỗ trợ</option>
                  <option value="ĐÃ_KHẮC_PHỤC">Đã khắc phục</option>
                  <option value="ĐÃ_XÁC_NHẬN">Đã xác nhận hoàn thành</option>
                  <option value="ĐÓNG_VẤN_ĐỀ">Đóng vấn đề</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-[11px] mb-1">
                  Người thực hiện:
                </label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser.name || 'Người dùng OOS'} (${currentUser.title || 'Quản lý'})`}
                  className="w-full p-2 bg-slate-100 border border-slate-300 rounded-xl text-slate-600 text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-[11px] mb-1">
                Ghi chú nội dung xử lý / Kết quả khắc phục:
              </label>
              <textarea
                rows={2}
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                placeholder="Ví dụ: Kỹ thuật đã thay thế rơ le nguồn, máy chạy thử 20 PCS đạt tiêu chuẩn..."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#0878E8] hover:bg-blue-600 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ghi nhận cập nhật tiến độ</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 shrink-0 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            ID: <strong className="text-slate-800">{issue.id}</strong> (Bảo toàn mã xuyên suốt nhiều ngày)
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

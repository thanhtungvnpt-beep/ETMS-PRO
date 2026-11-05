// OOS NEW MODEL PRO — Equipment Item Inspection & Status Modal
// Modal cập nhật trạng thái từng Equipment Item (OK / Pending)
// Bắt buộc nhập lý do nếu chọn Pending theo yêu cầu nghiệp vụ

import React, { useState } from 'react';
import {
  EquipmentItemPro,
  ItemInspectionStatus,
} from '../../types/newModelPro';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Calendar,
  User,
  Cpu,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface NewModelItemInspectionModalProps {
  item: EquipmentItemPro;
  lineCode: string;
  currentUser: { name: string; role: string };
  onClose: () => void;
  onSave: (
    newStatus: ItemInspectionStatus,
    reason?: string,
    photoUrl?: string,
    expectedDate?: string
  ) => void;
}

export const NewModelItemInspectionModal: React.FC<NewModelItemInspectionModalProps> = ({
  item,
  lineCode,
  currentUser,
  onClose,
  onSave,
}) => {
  const [status, setStatus] = useState<ItemInspectionStatus>(item.status || 'OK');
  const [pendingReason, setPendingReason] = useState<string>(item.pendingReason || '');
  const [photoUrl, setPhotoUrl] = useState<string>(
    item.photoUrl ||
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  );
  const [expectedDate, setExpectedDate] = useState<string>(
    item.expectedResolutionDate || '2026-11-14'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'Pending' && !pendingReason.trim()) {
      setErrorMessage('Bắt buộc phải nhập lý do khi chuyển trạng thái sang Pending.');
      return;
    }
    setErrorMessage('');
    onSave(status, pendingReason.trim(), photoUrl, expectedDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#082D55] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/50 flex items-center justify-center text-cyan-300 font-bold border border-blue-400/30">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">
                Cập nhật Tình trạng Thiết bị — {item.code}
              </h3>
              <p className="text-[11px] text-blue-200">
                Line: <span className="font-semibold text-cyan-300">{lineCode}</span> | Phân loại:{' '}
                <span className="font-semibold">{item.category}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Item Overview Box */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#082D55]">{item.name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                {item.category}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              <span className="font-medium text-slate-700">Thông số kỹ thuật:</span> {item.specs}
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 border-t border-slate-200/80">
              <span>
                Định mức: <strong>{item.standardQty} {item.unit}</strong>
              </span>
              <span>
                Đã nhận: <strong>{item.deliveredQty} {item.unit}</strong>
              </span>
              {item.supplier && (
                <span>
                  Nhà cung cấp: <strong>{item.supplier}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Status Selection: OK vs Pending */}
          <div>
            <label className="block font-bold text-slate-700 mb-2">
              Trạng thái kiểm tra kỹ thuật <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('OK')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                  status === 'OK'
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-300'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ĐẠT (OK)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('Pending')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                  status === 'Pending'
                    ? 'bg-rose-500 text-white border-rose-600 shadow-sm ring-2 ring-rose-300'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>CÓ VẤN ĐỀ (PENDING)</span>
              </button>
            </div>
          </div>

          {/* Mandatory Reason for Pending */}
          {status === 'Pending' && (
            <div className="bg-rose-50/70 p-3.5 rounded-lg border border-rose-200 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                <ShieldAlert className="w-4 h-4" />
                <span>Bắt buộc nhập chi tiết vấn đề phát sinh:</span>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Mô tả lỗi / Lý do Pending <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={pendingReason}
                  onChange={(e) => setPendingReason(e.target.value)}
                  placeholder="Ví dụ: Sai kích thước định vị chốt 0.05mm, sai bản vẽ rev 2.1..."
                  className="w-full px-3 py-2 border border-rose-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Ngày dự kiến xử lý xong
                  </label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Ảnh hiện trường / bằng chứng
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="URL hình ảnh"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-xs bg-white truncate"
                    />
                  </div>
                </div>
              </div>

              {photoUrl && (
                <div className="mt-2">
                  <span className="text-[10px] text-slate-500 block mb-1">Xem trước ảnh đính kèm:</span>
                  <img
                    src={photoUrl}
                    alt="Evidence"
                    className="h-24 w-auto rounded border border-rose-300 object-cover shadow-2xs"
                  />
                </div>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 rounded bg-rose-100 border border-rose-300 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Audit Metadata */}
          <div className="bg-slate-100/70 p-2.5 rounded text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Người kiểm tra: <strong>{currentUser.name}</strong> ({currentUser.role})
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Thời gian: <strong>Hôm nay</strong>
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#0878E8] hover:bg-blue-600 text-white font-bold shadow-sm transition-all cursor-pointer"
            >
              Lưu kết quả kiểm tra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

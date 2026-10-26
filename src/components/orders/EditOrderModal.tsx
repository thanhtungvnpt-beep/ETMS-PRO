import React, { useState } from 'react';
import { TransferOrder, UserProfile } from '../../types';
import { AlertTriangle, History, X, Check, Save } from 'lucide-react';

interface EditOrderModalProps {
  order: TransferOrder;
  currentUser: UserProfile;
  onClose: () => void;
  onSave: (updatedOrder: TransferOrder, reason: string) => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  currentUser,
  onClose,
  onSave,
}) => {
  const [reason, setReason] = useState(order.reason);
  const [expectedDate, setExpectedDate] = useState(order.expectedDate);
  const [toFactory, setToFactory] = useState(order.toFactory);
  const [changeReason, setChangeReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Business Rule check: Is the order in an un-editable state?
  const isBookTransferredOrCompleted =
    order.bookTransfer?.completed ||
    order.status === 'BOOK_TRANSFERRED' ||
    order.status === 'QR_PRINTED' ||
    order.status === 'STICKER_CONFIRMED';

  const isConfirmedByBoth =
    order.confirmations.factoryA.confirmed && order.confirmations.factoryB.confirmed;

  const willRequireReconfirmation =
    isConfirmedByBoth && (toFactory !== order.toFactory || reason !== order.reason);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeReason.trim()) {
      setErrorMsg('Bắt buộc nhập lý do thay đổi theo quy định kiểm soát hệ thống ETMS.');
      return;
    }

    if (isBookTransferredOrCompleted && currentUser.role !== 'ADMIN') {
      setErrorMsg('Lệnh này đã chuyển sổ sách kế toán. Chỉ Quản trị viên hệ thống mới có thể chỉnh sửa ngoại lệ.');
      return;
    }

    const updatedOrder: TransferOrder = {
      ...order,
      reason,
      expectedDate,
      toFactory,
      version: order.version + 1,
      // If critical fields changed and both factories had confirmed, reset confirmations
      confirmations: willRequireReconfirmation
        ? {
            factoryA: { confirmed: false, signerName: '', signedDate: null },
            factoryB: { confirmed: false, signerName: '', signedDate: null },
          }
        : order.confirmations,
      currentStep: willRequireReconfirmation ? 2 : order.currentStep,
      status: willRequireReconfirmation ? 'WAITING_CONFIRMATION' : order.status,
    };

    onSave(updatedOrder, changeReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">Chỉnh sửa lệnh điều động {order.id}</h3>
            <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
              v{order.version} → v{order.version + 1}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {isBookTransferredOrCompleted && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px] flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Cảnh báo nghiệp vụ:</strong> Lệnh này đã qua giai đoạn chuyển sổ sách/hoàn tất. Thay đổi sẽ được ghi nhận kiểm toán đặc biệt.
              </div>
            </div>
          )}

          {willRequireReconfirmation && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-[11px] flex gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Yêu cầu xác nhận lại:</strong> Bạn đang thay đổi thông tin quan trọng (Nhà máy đến / Mục đích điều động). Theo quy chuẩn ETMS, kết quả xác nhận trước đó của 2 nhà máy sẽ được hoàn nguyên về <strong>Chờ xác nhận lại</strong>.
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-700 text-[11px]">
              {errorMsg}
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Mã lệnh</label>
              <input
                type="text"
                disabled
                value={order.id}
                className="w-full bg-slate-100 border border-slate-300 rounded px-2.5 py-1.5 font-mono text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Nhà máy đi (A)</label>
              <input
                type="text"
                disabled
                value={order.fromFactory}
                className="w-full bg-slate-100 border border-slate-300 rounded px-2.5 py-1.5 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Nhà máy đến (B)</label>
              <select
                value={toFactory}
                onChange={(e) => setToFactory(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Nhà máy B">Nhà máy B</option>
                <option value="Nhà máy A">Nhà máy A</option>
                <option value="Nhà máy C">Nhà máy C</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Hạn hoàn tất dự kiến</label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-600 font-medium mb-1">Lý do / Mục tiêu điều động</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-700 font-bold mb-1">
                Lý do chỉnh sửa <span className="text-rose-500">* (Bắt buộc nhập kiểm toán)</span>
              </label>
              <textarea
                rows={2}
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Ví dụ: Cập nhật nhà máy tiếp nhận theo chỉ đạo ban điều hành ngày 26/04..."
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Diff View Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
            <div className="font-bold text-slate-700 mb-1 flex items-center gap-1.5 text-[11px]">
              <History className="w-3.5 h-3.5 text-blue-600" />
              <span>So sánh thay đổi (Trước & Sau)</span>
            </div>
            <div className="space-y-1 text-[11px] font-mono">
              {toFactory !== order.toFactory && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Nhà máy đến:</span>
                  <span className="text-rose-600 line-through">{order.toFactory}</span>
                  <span>→</span>
                  <span className="text-emerald-700 font-bold">{toFactory}</span>
                </div>
              )}
              {reason !== order.reason && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Lý do:</span>
                  <span className="text-rose-600 line-through truncate max-w-[150px]">{order.reason}</span>
                  <span>→</span>
                  <span className="text-emerald-700 font-bold truncate max-w-[200px]">{reason}</span>
                </div>
              )}
              {expectedDate !== order.expectedDate && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Ngày dự kiến:</span>
                  <span className="text-rose-600 line-through">{order.expectedDate}</span>
                  <span>→</span>
                  <span className="text-emerald-700 font-bold">{expectedDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu phiên bản mới</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

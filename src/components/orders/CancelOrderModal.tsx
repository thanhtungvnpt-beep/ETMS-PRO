import React, { useState } from 'react';
import { TransferOrder, UserProfile } from '../../types';
import { AlertOctagon, CheckCircle2, ShieldAlert, X } from 'lucide-react';

interface CancelOrderModalProps {
  order: TransferOrder;
  currentUser: UserProfile;
  onClose: () => void;
  onConfirmCancel: (reason: string, isException: boolean) => void;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  order,
  currentUser,
  onClose,
  onConfirmCancel,
}) => {
  const [reason, setReason] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check state against business cancellation policy:
  const isBookTransferred = order.bookTransfer?.completed || order.status === 'BOOK_TRANSFERRED';
  const isStickerApplied = order.stickerConfirmation?.completed || order.status === 'STICKER_CONFIRMED';
  const isReceived = order.receiptVerification?.items.length > 0 && order.status !== 'CANCELLED';
  const isInTransit = order.transitDetails?.status === 'Đang vận chuyển' || order.status === 'IN_TRANSIT';

  // Rule: Cannot directly cancel if books transferred or fully completed
  const isStrictlyBlocked = isBookTransferred || isStickerApplied;
  // Rule: Requires exception flow if goods already departed or delivered
  const requiresExceptionFlow = !isStrictlyBlocked && (isInTransit || isReceived);

  const handleConfirm = () => {
    if (!reason.trim()) {
      setErrorMsg('Vui lòng nhập lý do hủy lệnh chi tiết theo yêu cầu kiểm toán.');
      return;
    }
    if (!understood) {
      setErrorMsg('Vui lòng đánh dấu xác nhận bạn đã hiểu rõ các điều kiện ràng buộc.');
      return;
    }

    onConfirmCancel(reason, requiresExceptionFlow);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-xs">
        {/* Header */}
        <div className="px-5 py-3.5 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-slate-900 text-sm">Hủy lệnh điều động {order.id}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Policy Check Matrix */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3">
            <div className="font-bold text-slate-700 mb-2">Kiểm tra điều kiện hủy lệnh:</div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span>Thiết bị đã đăng ký xuất:</span>
                <span className="font-mono font-semibold">
                  {order.registeredItems.length > 0 ? `${order.registeredItems.length} thiết bị` : 'Chưa đăng ký'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Vận chuyển hàng:</span>
                <span className={`font-semibold ${isInTransit ? 'text-amber-600' : 'text-slate-600'}`}>
                  {order.transitDetails?.status || 'Chưa vận chuyển'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Xác nhận nhận máy (Nhà máy B):</span>
                <span className={`font-semibold ${isReceived ? 'text-blue-600' : 'text-slate-600'}`}>
                  {isReceived ? 'Đã nhận máy' : 'Chưa nhận'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sổ sách tài sản kế toán:</span>
                <span className={`font-semibold ${isBookTransferred ? 'text-rose-600' : 'text-slate-600'}`}>
                  {isBookTransferred ? 'ĐÃ CHUYỂN SỔ SÁCH' : 'Chưa chuyển'}
                </span>
              </div>
            </div>
          </div>

          {/* Conditional Guidance */}
          {isStrictlyBlocked ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 text-[11px] leading-relaxed">
              <strong>NGHIÊM CẤM HỦY TRỰC TIẾP:</strong> Lệnh này đã hoàn tất chuyển giao sổ sách tài sản giữa 2 nhà máy. Hệ thống không cho phép xóa hay tự động đảo ngược sổ sách.
              <p className="mt-1">
                Giải pháp: Hãy tạo một lệnh điều động mới theo chiều ngược lại (<strong>{order.toFactory} → {order.fromFactory}</strong>) để hoàn trả thiết bị chính thống.
              </p>
            </div>
          ) : requiresExceptionFlow ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] leading-relaxed">
              <strong>ÁP DỤNG QUY TRÌNH NGOẠI LỆ:</strong> Thiết bị đang trên đường hoặc đã giao nhận. Hủy lệnh sẽ kích hoạt luồng xử lý thu hồi khẩn cấp và lưu hồ sơ ngoại lệ có phê duyệt của Ban giám đốc.
            </div>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 text-[11px] leading-relaxed">
              Lệnh đang ở bước sơ khởi (chưa vận chuyển thực tế). Cho phép hủy an toàn. Lệnh, chứng từ và toàn bộ lịch sử vẫn được lưu trữ vĩnh viễn trong nhật ký kiểm toán.
            </div>
          )}

          {errorMsg && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-700 text-[11px]">
              {errorMsg}
            </div>
          )}

          {/* Reason input */}
          {!isStrictlyBlocked && (
            <>
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Lý do hủy lệnh <span className="text-rose-600">* (Bắt buộc theo chuẩn ETMS)</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nêu rõ căn cứ hủy lệnh, văn bản quyết định hoặc chỉ đạo từ cấp có thẩm quyền..."
                  className="w-full bg-white border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={understood}
                  onChange={(e) => setUnderstood(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-[11px] text-slate-600">
                  Tôi xác nhận tư cách người thực hiện (<strong>{currentUser.name} - {currentUser.title}</strong>) và chịu trách nhiệm về yêu cầu hủy lệnh này.
                </span>
              </label>
            </>
          )}

          {/* Action buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Đóng
            </button>
            {!isStrictlyBlocked && (
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-1.5 rounded text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer"
              >
                {requiresExceptionFlow ? 'Gửi yêu cầu hủy ngoại lệ' : 'Xác nhận hủy lệnh'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

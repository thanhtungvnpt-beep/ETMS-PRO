import React, { useState } from 'react';
import { TransferOrder, DiscrepancyRecord, UserProfile } from '../../types';
import { AlertTriangle, Camera, Check, ShieldAlert, X } from 'lucide-react';
import { COMPRESSOR_IMG } from '../../data/mockData';

interface DiscrepancyModalProps {
  order: TransferOrder;
  currentUser: UserProfile;
  onClose: () => void;
  onSaveDiscrepancy: (record: DiscrepancyRecord) => void;
  onResolveDiscrepancy: (resolutionNote: string, status: 'Đã giải quyết' | 'Duyệt ngoại lệ') => void;
}

export const DiscrepancyModal: React.FC<DiscrepancyModalProps> = ({
  order,
  currentUser,
  onClose,
  onSaveDiscrepancy,
  onResolveDiscrepancy,
}) => {
  const existingRecord = order.receiptVerification.discrepancyRecord;

  const [type, setType] = useState<DiscrepancyRecord['type']>(
    existingRecord?.type || 'Hư hỏng khi vận chuyển'
  );
  const [severity, setSeverity] = useState<DiscrepancyRecord['severity']>(
    existingRecord?.severity || 'Trung bình'
  );
  const [description, setDescription] = useState(
    existingRecord?.description || ''
  );
  const [assignedTo, setAssignedTo] = useState(
    existingRecord?.assignedTo || `${currentUser.name} & Ban thẩm định`
  );
  const [resolutionNote, setResolutionNote] = useState(
    existingRecord?.resolutionNote || ''
  );
  const [resolutionType, setResolutionType] = useState<'Đã giải quyết' | 'Duyệt ngoại lệ'>(
    'Đã giải quyết'
  );

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const record: DiscrepancyRecord = {
      id: `DISC-${Date.now().toString().slice(-5)}`,
      orderId: order.id,
      reportedBy: currentUser.name,
      reportedDate: new Date().toISOString().slice(0, 10),
      type,
      severity,
      description,
      evidencePhoto: COMPRESSOR_IMG,
      status: 'Chờ xử lý',
      assignedTo,
    };
    onSaveDiscrepancy(record);
    onClose();
  };

  const handleResolve = () => {
    if (!resolutionNote.trim()) return;
    onResolveDiscrepancy(resolutionNote, resolutionType);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-xs">
        {/* Header */}
        <div className="px-5 py-3.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              {existingRecord ? 'Hồ sơ xử lý sai lệch' : 'Lập biên bản sai lệch thiết bị'} — {order.id}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {existingRecord ? (
            /* View & Resolve Existing Discrepancy */
            <div className="space-y-3">
              <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã sự cố:</span>
                  <span className="font-mono font-bold">{existingRecord.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Loại sai lệch:</span>
                  <span className="font-semibold text-rose-600">{existingRecord.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mức độ nghiêm trọng:</span>
                  <span className="font-semibold">{existingRecord.severity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Người báo cáo:</span>
                  <span>{existingRecord.reportedBy} ({existingRecord.reportedDate})</span>
                </div>
                <div className="pt-1 border-t border-slate-200 text-slate-700">
                  <span className="text-slate-500 block mb-0.5">Mô tả hiện trường:</span>
                  <p className="bg-white p-2 rounded border border-slate-200">{existingRecord.description}</p>
                </div>
              </div>

              {/* Resolution Form */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Phương thức xử lý</label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="resType"
                      checked={resolutionType === 'Đã giải quyết'}
                      onChange={() => setResolutionType('Đã giải quyết')}
                    />
                    <span>Đã khắc phục / Bù phụ kiện</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="resType"
                      checked={resolutionType === 'Duyệt ngoại lệ'}
                      onChange={() => setResolutionType('Duyệt ngoại lệ')}
                    />
                    <span>Phê duyệt ngoại lệ (Tiếp tục quy trình)</span>
                  </label>
                </div>

                <label className="block text-slate-700 font-bold mb-1">Biên bản kết luận xử lý</label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Ghi rõ biện pháp khắc phục, thỏa thuận bảo hiểm, hoặc phê chuẩn của ban giám đốc..."
                  className="w-full bg-white border border-slate-300 rounded p-2 text-xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleResolve}
                  className="px-4 py-1.5 rounded text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700"
                >
                  Xác nhận giải quyết sai lệch
                </button>
              </div>
            </div>
          ) : (
            /* Create New Discrepancy Record */
            <form onSubmit={handleSubmitNew} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Loại sai lệch phát hiện</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                >
                  <option value="Hư hỏng khi vận chuyển">Hư hỏng khi vận chuyển</option>
                  <option value="Thiếu tài sản">Thiếu tài sản so với phiếu xuất</option>
                  <option value="Thừa tài sản">Thừa tài sản không có trong lệnh</option>
                  <option value="Sai serial">Sai mã tài sản hoặc số serial</option>
                  <option value="Sai số lượng">Sai số lượng thực tế</option>
                  <option value="Thiếu chứng từ">Thiếu chứng từ hoặc biên bản gốc</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Mức độ nghiêm trọng</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  >
                    <option value="Thấp">Thấp (Sai lệch nhỏ, không ảnh hưởng vận hành)</option>
                    <option value="Trung bình">Trung bình (Cần hiệu chuẩn / bổ sung)</option>
                    <option value="Nghiêm trọng">Nghiêm trọng (Chặn chuyển sổ sách)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Người chịu trách nhiệm xử lý</label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Mô tả chi tiết bằng chứng sai lệch <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ghi rõ vị trí trầy xước, số serial thực tế đọc được trên máy, tình trạng kiện hàng..."
                  className="w-full bg-white border border-slate-300 rounded p-2"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
                >
                  Lưu hồ sơ sai lệch
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

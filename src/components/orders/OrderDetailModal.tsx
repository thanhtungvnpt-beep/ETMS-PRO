import React, { useState } from 'react';
import { TransferOrder, UserProfile, AuditEvent } from '../../types';
import { WORKFLOW_STEPS } from '../WorkflowBanner';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  QrCode,
  Truck,
  ShieldCheck,
  Printer,
  Edit2,
  X,
  FileCheck,
  ChevronRight,
  User,
  Building,
  Layers,
} from 'lucide-react';

import { OrderPrintModal } from './OrderPrintModal';

interface OrderDetailModalProps {
  order: TransferOrder;
  currentUser: UserProfile;
  auditLogs: AuditEvent[];
  onClose: () => void;
  onOpenEditModal: (order: TransferOrder) => void;
  onOpenCancelModal: (order: TransferOrder) => void;
  onOpenQRPrintModal: (order: TransferOrder) => void;
  onOpenDiscrepancyModal: (order: TransferOrder) => void;
  onOpenPrintDossier?: (order: TransferOrder) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  currentUser,
  auditLogs,
  onClose,
  onOpenEditModal,
  onOpenCancelModal,
  onOpenQRPrintModal,
  onOpenDiscrepancyModal,
  onOpenPrintDossier,
}) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'assets' | 'docs' | 'audit'>('flow');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const orderLogs = auditLogs.filter((l) => l.orderId === order.id);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-xs">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-base text-blue-400">{order.id}</span>
            <span className="text-slate-400">|</span>
            <span className="font-semibold text-slate-200">
              {order.fromFactory} → {order.toFactory}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                order.status === 'STICKER_CONFIRMED'
                  ? 'bg-emerald-500 text-white'
                  : order.status === 'CANCELLED'
                  ? 'bg-rose-500 text-white'
                  : 'bg-amber-500 text-slate-900'
              }`}
            >
              {order.status}
            </span>
            <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
              v{order.version}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onOpenPrintDossier) {
                  onOpenPrintDossier(order);
                } else {
                  setIsPrintModalOpen(true);
                }
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              title="Xuất PDF / In Hồ Sơ Lệnh Điều Động 9 Bước"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In hồ sơ PDF (9 bước)</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenEditModal(order)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Sửa lệnh</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('flow')}
            className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'flow'
                ? 'border-blue-600 text-blue-700 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Tiến độ 9 bước nghiệp vụ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('assets')}
            className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'assets'
                ? 'border-blue-600 text-blue-700 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Tài sản điều động ({order.registeredItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'docs'
                ? 'border-blue-600 text-blue-700 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Chứng từ & Giao nhận
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-700 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Nhật ký kiểm toán ({orderLogs.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'flow' && (
            <div className="space-y-4">
              {/* Stepper Progress Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {WORKFLOW_STEPS.map((step) => {
                  const isDone = order.currentStep > step.step || order.status === 'STICKER_CONFIRMED';
                  const isCurrent = order.currentStep === step.step && order.status !== 'STICKER_CONFIRMED';
                  return (
                    <div
                      key={step.step}
                      className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                        isDone
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : isCurrent
                          ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-400'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {isDone ? '✓' : step.step}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 text-[11px]">{step.title}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">{step.role}</div>
                        <div className="text-[10px] text-slate-600 mt-0.5 line-clamp-2">{step.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Meta Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Người lập kế hoạch:</span>
                  <span className="font-bold text-slate-800">{order.plannerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Ngày tạo lệnh:</span>
                  <span className="font-mono font-medium text-slate-800">{order.createdDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Hạn hoàn tất dự kiến:</span>
                  <span className="font-mono font-medium text-slate-800">{order.expectedDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Lý do điều động:</span>
                  <span className="text-slate-800 font-medium">{order.reason}</span>
                </div>
              </div>

              {/* Step 2 Confirmation Status Card */}
              <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Bước 2: Kết quả xác nhận của 2 Nhà máy</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="font-semibold block text-slate-700">Nhà máy A:</span>
                    <div>Người ký: <strong>{order.confirmations.factoryA.signerName || 'Chưa ký'}</strong></div>
                    <div>Ngày ký: <span className="font-mono">{order.confirmations.factoryA.signedDate || '-'}</span></div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="font-semibold block text-slate-700">Nhà máy B:</span>
                    <div>Người ký: <strong>{order.confirmations.factoryB.signerName || 'Chưa ký'}</strong></div>
                    <div>Ngày ký: <span className="font-mono">{order.confirmations.factoryB.signedDate || '-'}</span></div>
                  </div>
                </div>
              </div>

              {/* Step 7 & 8 Status Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-bold text-slate-800 mb-1">Bước 7: Chuyển sổ sách tài sản</div>
                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div>Trạng thái: <strong>{order.bookTransfer.completed ? 'Đã hoàn tất chuyển sổ' : 'Chưa hoàn tất'}</strong></div>
                    <div>Chứng từ tham chiếu: <span className="font-mono">{order.bookTransfer.referenceDocNumber || 'KT-CK-2025/089'}</span></div>
                    <div>Người thực hiện: {order.bookTransfer.transferredBy || 'Nguyễn Văn A'}</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>Bước 8: Tem QR tài sản</span>
                    <button
                      type="button"
                      onClick={() => onOpenQRPrintModal(order)}
                      className="text-blue-600 hover:underline text-[10px] font-semibold"
                    >
                      In tem nhãn
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div>Tổng tem phát hành: <strong>{order.qrPrinting.items.length}</strong></div>
                    <div>Trạng thái in: {order.qrPrinting.completed ? 'Đã in phát hành' : 'Chưa in'}</div>
                    <div>Mã tem mới: {order.qrPrinting.items.map((i) => i.newAssetCode).join(', ')}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="p-2">STT</th>
                      <th className="p-2">Mã tài sản</th>
                      <th className="p-2">Tên thiết bị</th>
                      <th className="p-2">Số serial</th>
                      <th className="p-2 text-center">Số lượng</th>
                      <th className="p-2">Tình trạng</th>
                      <th className="p-2 text-center">Ảnh hiện trường</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.registeredItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-2 tabular-nums">{idx + 1}</td>
                        <td className="p-2 font-mono font-bold text-blue-700">{item.assetCode}</td>
                        <td className="p-2 font-medium text-slate-800">{item.name}</td>
                        <td className="p-2 font-mono text-slate-600">{item.serial}</td>
                        <td className="p-2 text-center tabular-nums font-semibold">{item.quantity}</td>
                        <td className="p-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              item.condition === 'Tốt' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.condition}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-8 object-cover rounded border border-slate-200 inline-block shadow-2xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                <h4 className="font-bold text-slate-800 mb-2">Biên bản giao nhận thiết bị (BBGN)</h4>
                <div className="grid grid-cols-2 gap-3 mb-3 text-[11px]">
                  <div>Số biên bản: <strong className="font-mono">{order.deliveryDoc.docNumber}</strong></div>
                  <div>Ngày giao: <span className="font-mono">{order.deliveryDoc.deliveryDate}</span></div>
                </div>
                <div className="space-y-1.5">
                  {order.deliveryDoc.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-slate-800">{file.name}</span>
                        <span className="text-slate-400">({file.size})</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{file.uploadDate}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Hình ảnh chụp quá trình bốc xếp & giao nhận</h4>
                <div className="grid grid-cols-3 gap-3">
                  {order.deliveryDoc.shipmentImages.map((img, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <img src={img} alt={`Giao hàng ${i + 1}`} className="w-full h-32 object-cover" />
                      <div className="p-1.5 text-[10px] text-slate-600 text-center font-medium">
                        Ảnh chứng từ hiện trường #{i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-500 mb-2">
                Toàn bộ lịch sử can thiệp, ký số và cập nhật được lưu trên hệ thống máy chủ kiểm toán:
              </div>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
                {orderLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-white hover:bg-slate-50 flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{log.action}</span>
                        <span className="font-mono text-[10px] text-slate-400">{log.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{log.summary}</div>
                      {log.details && (
                        <div className="text-[10px] text-slate-500 mt-1 bg-slate-50 p-1.5 rounded font-mono">
                          {log.details}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                        <span>Người thực hiện: <strong>{log.user}</strong></span>
                        <span>•</span>
                        <span>Vai trò: {log.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onOpenCancelModal(order)}
            className="px-3 py-1.5 rounded text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer"
          >
            Yêu cầu hủy lệnh
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onOpenPrintDossier) {
                  onOpenPrintDossier(order);
                } else {
                  setIsPrintModalOpen(true);
                }
              }}
              className="px-3.5 py-1.5 rounded text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In hồ sơ PDF (9 bước)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* 9-Step Printable PDF Dossier Modal */}
      {isPrintModalOpen && (
        <OrderPrintModal
          order={order}
          currentUser={currentUser}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};

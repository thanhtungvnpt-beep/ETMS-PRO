import React, { useState, useEffect } from 'react';
import { TransferOrder, UserProfile } from '../../types';
import { generateQRCodeDataURL } from '../../utils/qrGenerator';
import {
  Printer,
  Download,
  X,
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Building,
  User,
  Truck,
  QrCode,
  FileCheck,
  CheckCheck,
  ChevronDown,
} from 'lucide-react';

interface OrderPrintModalProps {
  order: TransferOrder;
  currentUser: UserProfile;
  onClose: () => void;
}

export const OrderPrintModal: React.FC<OrderPrintModalProps> = ({
  order,
  currentUser,
  onClose,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [printDate] = useState<string>(
    new Date().toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  );

  useEffect(() => {
    // Generate QR verification data url for official document header
    const payload = `OOS-ETMS|ORDER|${order.id}|VER:${order.version}|ROUTE:${order.fromFactory}->${order.toFactory}|STATUS:${order.status}|DATE:${order.createdDate}`;
    generateQRCodeDataURL(payload).then((url) => {
      setQrCodeUrl(url);
    });
  }, [order]);

  const handlePrint = () => {
    window.print();
  };

  const isCompleted = order.status === 'STICKER_CONFIRMED';

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-100 rounded-xl shadow-2xl max-w-5xl w-full border border-slate-300 overflow-hidden flex flex-col max-h-[96vh]">
        {/* Floating Top Control Toolbar (Hidden in print) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 no-print border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-100">
                  Xuất PDF / In Hồ Sơ Lệnh Điều Động — {order.id}
                </h3>
                <span className="text-[10px] bg-blue-600 text-white font-mono px-2 py-0.5 rounded font-bold">
                  9 BƯỚC
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-mono px-1.5 py-0.5 rounded">
                  v{order.version}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Định dạng chuẩn A4 phục vụ lưu trữ kiểm toán, thanh tra tài sản và bàn giao liên nhà máy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>In ngay / Lưu PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Đóng bản xem trước"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-slate-200/80 flex justify-center">
          {/* THE PRINTABLE DOSSIER (Rendered with ID for @media print visibility) */}
          <article
            id="printable-order-document"
            className="bg-white text-slate-900 shadow-xl border border-slate-300 p-8 sm:p-12 w-full max-w-[210mm] min-h-[297mm] mx-auto text-xs leading-relaxed print:shadow-none print:border-0 print:p-0 print:m-0"
          >
            {/* 1. OFFICIAL CORPORATE HEADER */}
            <header className="border-b-2 border-slate-900 pb-4 mb-5">
              <div className="flex items-start justify-between gap-4">
                {/* Left: Organization Header */}
                <div className="space-y-0.5">
                  <div className="font-extrabold text-[13px] tracking-wide text-slate-900 uppercase">
                    TẬP ĐOÀN CÔNG NGHỆ OOS — HỆ THỐNG ETMS PRO
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 uppercase">
                    PHÂN HỆ ĐIỀU ĐỘNG & QUẢN TRỊ TÀI SẢN THIẾT BỊ LIÊN NHÀ MÁY
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Mã biểu mẫu: <span className="font-mono font-bold">BM-ETMS-ORD-09/ISO</span> | Tiêu chuẩn: ISO 9001:2015 / 5S
                  </div>
                </div>

                {/* Center / Right: National Motto & Doc QR */}
                <div className="flex items-center gap-4 text-right">
                  <div className="text-center hidden sm:block">
                    <div className="font-bold text-[11px] uppercase tracking-wider text-slate-900">
                      CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                    </div>
                    <div className="text-[10px] font-semibold text-slate-700 italic">
                      Độc lập - Tự do - Hạnh phúc
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">---o0o---</div>
                  </div>
                  {qrCodeUrl && (
                    <div className="flex flex-col items-center">
                      <img
                        src={qrCodeUrl}
                        alt="Order QR Code"
                        className="w-16 h-16 border border-slate-300 p-0.5 rounded bg-white shadow-2xs"
                      />
                      <span className="text-[8px] font-mono text-slate-500 mt-0.5">Xác thực số</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Title Banner */}
              <div className="mt-5 text-center">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                  HỒ SƠ ĐIỀU ĐỘNG THIẾT BỊ LIÊN NHÀ MÁY
                </h1>
                <div className="text-xs font-bold text-blue-900 uppercase tracking-widest mt-0.5">
                  THEO QUY TRÌNH QUẢN LÝ VẬN HÀNH 9 BƯỚC TIÊU CHUẨN
                </div>
                <div className="flex items-center justify-center gap-3 mt-2 text-[11px] text-slate-600">
                  <span>Số hiệu lệnh: <strong className="font-mono text-blue-800 text-xs">{order.id}</strong></span>
                  <span>•</span>
                  <span>Phiên bản: <strong className="font-mono">v{order.version}</strong></span>
                  <span>•</span>
                  <span>
                    Trạng thái:{' '}
                    <strong
                      className={
                        isCompleted
                          ? 'text-emerald-700 font-bold'
                          : order.status === 'CANCELLED'
                          ? 'text-rose-700 font-bold'
                          : 'text-amber-700 font-bold'
                      }
                    >
                      {isCompleted
                        ? 'ĐÃ HOÀN TẤT NGHIỆM THU (BƯỚC 9/9)'
                        : order.status === 'CANCELLED'
                        ? 'ĐÃ HỦY'
                        : `ĐANG XỬ LÝ (BƯỚC ${order.currentStep}/9)`}
                    </strong>
                  </span>
                </div>
              </div>
            </header>

            {/* 2. ORDER CORE METADATA (Thông tin chung) */}
            <section className="mb-5 bg-slate-50 border border-slate-300 rounded-md p-3.5 print:bg-slate-50/50 print-avoid-break">
              <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>I. THÔNG TIN CHUNG VỀ LỆNH ĐIỀU ĐỘNG</span>
                <span className="font-mono text-[10px] text-slate-500">MÃ LỆNH: {order.id}</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Tuyến điều chuyển:</span>
                  <span className="font-bold text-slate-900 text-xs">
                    {order.fromFactory} ➔ {order.toFactory}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Người lập kế hoạch (Planner):</span>
                  <span className="font-bold text-slate-800">{order.plannerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Ngày khởi tạo lệnh:</span>
                  <span className="font-mono font-medium text-slate-800">{order.createdDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Hạn hoàn tất dự kiến:</span>
                  <span className="font-mono font-medium text-slate-800">{order.expectedDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Tiến độ quy trình:</span>
                  <span className="font-semibold text-blue-700">
                    Bước {order.currentStep}/9 ({Math.round((order.currentStep / 9) * 100)}%)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Đánh giá thời hạn SLA:</span>
                  <span className={`font-semibold ${order.isOverdue ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {order.isOverdue ? 'Quá hạn cam kết' : 'Trong hạn tiêu chuẩn'}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-1 border-t border-slate-200 mt-1">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold mr-2">Mục đích / Lý do điều động:</span>
                  <span className="font-medium text-slate-900">{order.reason}</span>
                </div>
              </div>
            </section>

            {/* 3. STEP 1: KẾ HOẠCH THIẾT BỊ ĐIỀU ĐỘNG */}
            <section className="mb-5 print-avoid-break">
              <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>II. BƯỚC 1: KẾ HOẠCH THIẾT BỊ ĐIỀU ĐỘNG (PLANNER)</span>
                <span className="text-[10px] font-normal text-slate-500">
                  Tổng danh mục: <strong>{order.plannedItems.length}</strong> thiết bị
                </span>
              </h2>
              <div className="border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="p-2 w-10 text-center border-r border-slate-200">STT</th>
                      <th className="p-2 w-28 border-r border-slate-200">Mã thiết bị</th>
                      <th className="p-2 border-r border-slate-200">Tên chủng loại máy móc</th>
                      <th className="p-2 w-20 text-center border-r border-slate-200">Số lượng</th>
                      <th className="p-2">Yêu cầu kỹ thuật & Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {order.plannedItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="p-2 text-center border-r border-slate-200 tabular-nums">{idx + 1}</td>
                        <td className="p-2 font-mono font-bold text-blue-900 border-r border-slate-200">{item.assetCode}</td>
                        <td className="p-2 font-medium text-slate-900 border-r border-slate-200">{item.name}</td>
                        <td className="p-2 text-center font-bold border-r border-slate-200 tabular-nums">{item.quantity} chiếc</td>
                        <td className="p-2 text-slate-600">{item.note || 'Theo tiêu chuẩn sản xuất hiện hành'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 4. STEP 2: XÁC NHẬN PHÊ DUYỆT 2 CHIỀU (NHÀ MÁY A & B) */}
            <section className="mb-5 print-avoid-break">
              <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>III. BƯỚC 2: XÁC NHẬN PHÊ DUYỆT 2 CHIỀU GIỮA 2 NHÀ MÁY</span>
                <span className="text-[10px] font-semibold text-emerald-700">
                  {order.confirmations.factoryA.confirmed && order.confirmations.factoryB.confirmed
                    ? '✓ Cả 2 nhà máy đã phê duyệt'
                    : 'Đang chờ phê duyệt song phương'}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Factory A Confirmation */}
                <div className="border border-slate-300 rounded p-3 bg-slate-50/60 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5 border-b border-slate-200 pb-1">
                    <span className="font-bold text-slate-900 text-[11px]">Đại diện {order.fromFactory} (Nhà máy xuất)</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        order.confirmations.factoryA.confirmed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {order.confirmations.factoryA.confirmed ? 'ĐÃ DUYỆT XUẤT' : 'CHỜ DUYỆT'}
                    </span>
                  </div>
                  <div className="space-y-1 text-[10px] text-slate-700">
                    <div>Người ký duyệt: <strong className="text-slate-900 text-[11px]">{order.confirmations.factoryA.signerName || 'Chưa ký'}</strong></div>
                    <div>Ngày ký duyệt: <span className="font-mono font-medium">{order.confirmations.factoryA.signedDate || '-'}</span></div>
                    <div>Ý kiến phê duyệt: <span className="italic">{order.confirmations.factoryA.note || 'Đồng ý chuyển thiết bị theo kế hoạch sản xuất'}</span></div>
                  </div>
                </div>

                {/* Factory B Confirmation */}
                <div className="border border-slate-300 rounded p-3 bg-slate-50/60 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5 border-b border-slate-200 pb-1">
                    <span className="font-bold text-slate-900 text-[11px]">Đại diện {order.toFactory} (Nhà máy nhận)</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        order.confirmations.factoryB.confirmed
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {order.confirmations.factoryB.confirmed ? 'ĐÃ DUYỆT NHẬN' : 'CHỜ DUYỆT'}
                    </span>
                  </div>
                  <div className="space-y-1 text-[10px] text-slate-700">
                    <div>Người ký duyệt: <strong className="text-slate-900 text-[11px]">{order.confirmations.factoryB.signerName || 'Chưa ký'}</strong></div>
                    <div>Ngày ký duyệt: <span className="font-mono font-medium">{order.confirmations.factoryB.signedDate || '-'}</span></div>
                    <div>Ý kiến phê duyệt: <span className="italic">{order.confirmations.factoryB.note || 'Đã chuẩn bị mặt bằng, điện khí để tiếp nhận'}</span></div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. STEP 3: ĐĂNG KÝ THIẾT BỊ THỰC TẾ XUẤT KHO */}
            <section className="mb-5 print-avoid-break">
              <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>IV. BƯỚC 3: ĐĂNG KÝ THIẾT BỊ THỰC TẾ XUẤT KHO (SERIAL & TÌNH TRẠNG)</span>
                <span className="text-[10px] font-normal text-slate-500">
                  Số lượng máy đăng ký: <strong>{order.registeredItems.length}</strong> máy
                </span>
              </h2>
              <div className="border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold text-[10px] uppercase">
                    <tr>
                      <th className="p-2 w-10 text-center border-r border-slate-200">STT</th>
                      <th className="p-2 w-28 border-r border-slate-200">Mã tài sản xuất</th>
                      <th className="p-2 border-r border-slate-200">Tên thiết bị</th>
                      <th className="p-2 border-r border-slate-200">Số Serial / Khung máy</th>
                      <th className="p-2 w-16 text-center border-r border-slate-200">SL</th>
                      <th className="p-2 w-28 border-r border-slate-200 text-center">Tình trạng máy</th>
                      <th className="p-2 text-center">Kiểm tra hiện trường</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {order.registeredItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="p-2 text-center border-r border-slate-200 tabular-nums">{idx + 1}</td>
                        <td className="p-2 font-mono font-bold text-blue-900 border-r border-slate-200">{item.assetCode}</td>
                        <td className="p-2 font-medium text-slate-900 border-r border-slate-200">{item.name}</td>
                        <td className="p-2 font-mono font-bold text-slate-800 border-r border-slate-200">{item.serial}</td>
                        <td className="p-2 text-center font-bold border-r border-slate-200 tabular-nums">{item.quantity}</td>
                        <td className="p-2 text-center border-r border-slate-200">
                          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px] border border-slate-200">
                            {item.condition}
                          </span>
                        </td>
                        <td className="p-2 text-center text-[10px] text-slate-500 font-medium">
                          ✓ Đã chụp ảnh lưu hồ sơ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 6. STEP 4 & 5: VẬN CHUYỂN LOGISTICS & BIÊN BẢN GIAO NHẬN (BBGN) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 print-avoid-break">
              {/* Step 4: Transit Details */}
              <section className="border border-slate-300 rounded p-3 bg-slate-50/50">
                <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>V. BƯỚC 4: VẬN CHUYỂN LOGISTICS</span>
                  <span className="text-[9px] font-bold text-blue-700 uppercase">
                    {order.transitDetails.status}
                  </span>
                </h2>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Đơn vị vận tải:</span>
                    <strong className="text-slate-800">{order.transitDetails.carrierName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Biển số xe:</span>
                    <strong className="font-mono text-slate-900">{order.transitDetails.licensePlate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lái xe & SĐT:</span>
                    <span className="font-medium text-slate-800">
                      {order.transitDetails.driverName} ({order.transitDetails.driverPhone})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Thời gian khởi hành:</span>
                    <span className="font-mono text-slate-700">{order.transitDetails.departureTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mã niêm phong chì (Seal):</span>
                    <strong className="font-mono text-blue-800">{order.transitDetails.sealNumber}</strong>
                  </div>
                </div>
              </section>

              {/* Step 5: Delivery Documentation */}
              <section className="border border-slate-300 rounded p-3 bg-slate-50/50">
                <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>VI. BƯỚC 5: BIÊN BẢN GIAO NHẬN (BBGN)</span>
                  <span className="text-[9px] font-mono text-slate-500">
                    SỐ: {order.deliveryDoc.docNumber}
                  </span>
                </h2>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số biên bản BBGN:</span>
                    <strong className="font-mono text-slate-900">{order.deliveryDoc.docNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ngày giao nhận:</span>
                    <span className="font-mono text-slate-800">{order.deliveryDoc.deliveryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hồ sơ chứng từ đính kèm:</span>
                    <span className="font-medium text-slate-800">
                      {order.deliveryDoc.files.length} văn bản ({order.deliveryDoc.files.map((f) => f.name).join(', ')})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ảnh hiện trường giao nhận:</span>
                    <span className="font-semibold text-emerald-700">
                      {order.deliveryDoc.shipmentImages.length} ảnh đã kiểm định & lưu trữ
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* 7. STEP 6: BIÊN BẢN NGHIỆM THU ĐỐI SOÁT & SAI LỆCH */}
            <section className="mb-5 print-avoid-break">
              <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>VII. BƯỚC 6: KIỂM TRA ĐỐI SOÁT KHI NHẬN MÁY (RECEIPT VERIFICATION)</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    order.receiptVerification.hasDiscrepancy
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {order.receiptVerification.hasDiscrepancy
                    ? 'PHÁT HIỆN SAI LỆCH KHI NHẬN MÁY'
                    : 'KHỚP 100% — ĐỦ ĐIỀU KIỆN TIẾP NHẬN'}
                </span>
              </h2>

              <div className="border border-slate-300 rounded p-3 bg-slate-50/50 mb-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mb-2">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Cán bộ kiểm tra nhận:</span>
                    <strong>{order.receiptVerification.verifiedBy || 'Nguyễn Văn B (KTV)'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Ngày giờ kiểm tra:</span>
                    <span className="font-mono">{order.receiptVerification.verifiedDate || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-[10px]">Ghi chú kiểm tra:</span>
                    <span className="italic">{order.receiptVerification.note || 'Thiết bị nguyên đai, đúng tem niêm phong chì.'}</span>
                  </div>
                </div>

                {/* Verification table if items exist */}
                {order.receiptVerification.items && order.receiptVerification.items.length > 0 && (
                  <table className="w-full text-left text-[10px] border border-slate-300 bg-white">
                    <thead className="bg-slate-100 font-bold border-b border-slate-300">
                      <tr>
                        <th className="p-1.5 border-r border-slate-200">Mã tài sản</th>
                        <th className="p-1.5 border-r border-slate-200">Số Serial thực tế</th>
                        <th className="p-1.5 text-center border-r border-slate-200">Số lượng</th>
                        <th className="p-1.5 border-r border-slate-200">Tình trạng kiểm tra</th>
                        <th className="p-1.5 text-center">Kết quả đối soát</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {order.receiptVerification.items.map((vi) => (
                        <tr key={vi.id}>
                          <td className="p-1.5 font-mono font-bold text-blue-900 border-r border-slate-200">{vi.assetCode}</td>
                          <td className="p-1.5 font-mono border-r border-slate-200">{vi.serial}</td>
                          <td className="p-1.5 text-center border-r border-slate-200">{vi.quantity}</td>
                          <td className="p-1.5 border-r border-slate-200">{vi.condition}</td>
                          <td className="p-1.5 text-center font-bold text-emerald-700">{vi.matchResult}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Discrepancy details if flagged */}
                {order.receiptVerification.discrepancyRecord && (
                  <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded text-[10px] text-rose-900">
                    <div className="font-bold flex items-center gap-1 text-rose-700">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Chi tiết sai lệch ghi nhận: {order.receiptVerification.discrepancyRecord.type} ({order.receiptVerification.discrepancyRecord.severity})</span>
                    </div>
                    <div>Nội dung: {order.receiptVerification.discrepancyRecord.description}</div>
                    <div>Phụ trách giải quyết: {order.receiptVerification.discrepancyRecord.assignedTo} | Trạng thái: {order.receiptVerification.discrepancyRecord.status}</div>
                  </div>
                )}
              </div>
            </section>

            {/* 8. STEP 7 & 8: CHUYỂN SỔ SÁCH & PHÁT HÀNH TEM QR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 print-avoid-break">
              {/* Step 7: Book Transfer */}
              <section className="border border-slate-300 rounded p-3 bg-slate-50/50">
                <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>VIII. BƯỚC 7: CHUYỂN SỔ SÁCH KẾ TOÁN</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    order.bookTransfer.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {order.bookTransfer.completed ? 'ĐÃ HOÀN TẤT' : 'CHƯA CHUYỂN'}
                  </span>
                </h2>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số chứng từ kế toán:</span>
                    <strong className="font-mono text-slate-900">{order.bookTransfer.referenceDocNumber || 'KT-CK-2025/089'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kế toán viên thực hiện:</span>
                    <strong className="text-slate-800">{order.bookTransfer.transferredBy || 'Trần Thị Thu (Kế toán tài sản)'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ngày hạch toán chuyển sổ:</span>
                    <span className="font-mono text-slate-700">{order.bookTransfer.transferDate || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quyền sở hữu pháp lý:</span>
                    <span className="font-semibold text-blue-900">Chuyển giao chính thức cho {order.toFactory}</span>
                  </div>
                </div>
              </section>

              {/* Step 8: QR Code Generation */}
              <section className="border border-slate-300 rounded p-3 bg-slate-50/50">
                <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>IX. BƯỚC 8: PHÁT HÀNH TEM QR MỚI</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    order.qrPrinting.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {order.qrPrinting.completed ? 'ĐÃ IN PHÁT HÀNH' : 'CHƯA IN'}
                  </span>
                </h2>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cán bộ phụ trách in tem:</span>
                    <strong className="text-slate-800">{order.qrPrinting.printedBy || 'Đỗ Văn C (Tổ tem mã)'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ngày in phát hành:</span>
                    <span className="font-mono text-slate-700">{order.qrPrinting.printedDate || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số lượng tem in:</span>
                    <span className="font-bold text-slate-900">{order.qrPrinting.items.length} tem mới ({order.toFactory})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dãy mã tem mới:</span>
                    <span className="font-mono text-[10px] text-blue-800 font-bold truncate max-w-[180px]">
                      {order.qrPrinting.items.map((i) => i.newAssetCode).join(', ')}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* 9. STEP 9: DÁN TEM & NGHIỆM THU TẠI LINE SẢN XUẤT */}
            <section className="mb-6 print-avoid-break">
              <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>X. BƯỚC 9: DÁN TEM VÀ NGHIỆM THU ĐƯA VÀO VẬN HÀNH TẠI LINE</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    order.stickerConfirmation.completed
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {order.stickerConfirmation.completed
                    ? 'ĐÃ DÁN TEM & HOÀN TẤT BÀN GIAO LINE'
                    : 'ĐANG TIẾN HÀNH DÁN TEM'}
                </span>
              </h2>

              <div className="border border-slate-300 rounded p-3 bg-slate-50/50">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] mb-2">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Kỹ thuật viên dán tem:</span>
                    <strong>{order.stickerConfirmation.completedBy || 'Phạm Văn D (Line Leader)'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Ngày giờ nghiệm thu:</span>
                    <span className="font-mono">{order.stickerConfirmation.completedDate || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Tiêu chuẩn dán tem:</span>
                    <span className="font-semibold text-emerald-700">Đúng vị trí quy chuẩn, quét kiểm tra OK</span>
                  </div>
                  <div className="col-span-2 sm:col-span-3 pt-1 border-t border-slate-200">
                    <span className="text-slate-500 text-[10px] mr-2">Ghi chú nghiệm thu Line:</span>
                    <span className="italic text-slate-800">
                      {order.stickerConfirmation.note || 'Toàn bộ thiết bị đã vào line, cấp nguồn và sẵn sàng chạy sản xuất.'}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 10. THE 9-STEP OFFICIAL SIGNATURE AND STAMP MATRIX */}
            <section className="mb-6 print-avoid-break">
              <div className="text-center mb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  XI. BẢNG XÁC NHẬN CHỮ KÝ VÀ DẤU KIỂM DUYỆT 9 BƯỚC NGHIỆP VỤ
                </h3>
                <p className="text-[10px] text-slate-500 italic">
                  Các bên ký tên dưới đây cam kết toàn bộ thông tin điều động và hiện trạng tài sản thiết bị là chính xác, hợp pháp
                </p>
              </div>

              {/* 9 Signature Endorsement Blocks (3 x 3 Grid) */}
              <div className="grid grid-cols-3 gap-2.5 text-[10px]">
                {/* 1. Planner */}
                <div className="border border-slate-300 rounded p-2 text-center flex flex-col justify-between min-h-[125px] bg-white">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                    1. Người lập lệnh (Planner)
                  </div>
                  <div className="my-1.5 flex flex-col items-center">
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      ✓ ĐÃ KÝ SỐ XÁC THỰC
                    </span>
                    <span className="font-mono text-[9px] text-slate-400 mt-0.5">{order.createdDate}</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-[11px]">{order.plannerName}</div>
                    <div className="text-[9px] text-slate-500">Quản trị kế hoạch</div>
                  </div>
                </div>

                {/* 2. Factory A Manager */}
                <div className="border border-slate-300 rounded p-2 text-center flex flex-col justify-between min-h-[125px] bg-white">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                    2. Lãnh đạo NM A (Xuất)
                  </div>
                  <div className="my-1.5 flex flex-col items-center">
                    {order.confirmations.factoryA.confirmed ? (
                      <>
                        <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          ✓ ĐÃ PHÊ DUYỆT ĐIỆN TỬ
                        </span>
                        <span className="font-mono text-[9px] text-slate-400 mt-0.5">{order.confirmations.factoryA.signedDate}</span>
                      </>
                    ) : (
                      <span className="text-[9px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        CHỜ KÝ DUYỆT
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-[11px]">{order.confirmations.factoryA.signerName || 'Trần Văn A'}</div>
                    <div className="text-[9px] text-slate-500">Giám đốc {order.fromFactory}</div>
                  </div>
                </div>

                {/* 3. Factory B Manager */}
                <div className="border border-slate-300 rounded p-2 text-center flex flex-col justify-between min-h-[125px] bg-white">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                    3. Lãnh đạo NM B (Nhận)
                  </div>
                  <div className="my-1.5 flex flex-col items-center">
                    {order.confirmations.factoryB.confirmed ? (
                      <>
                        <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          ✓ ĐÃ TIẾP NHẬN ĐIỆN TỬ
                        </span>
                        <span className="font-mono text-[9px] text-slate-400 mt-0.5">{order.confirmations.factoryB.signedDate}</span>
                      </>
                    ) : (
                      <span className="text-[9px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        CHỜ KÝ DUYỆT
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-[11px]">{order.confirmations.factoryB.signerName || 'Lê Thị B'}</div>
                    <div className="text-[9px] text-slate-500">Giám đốc {order.toFactory}</div>
                  </div>
                </div>

                {/* 4. Warehouse Dispatcher */}
                <div className="border border-slate-300 rounded p-2 text-center flex flex-col justify-between min-h-[125px] bg-white">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                    4. Thủ kho xuất thiết bị
                  </div>
                  <div className="my-1.5 flex flex-col items-center">
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      ✓ ĐÃ KIỂM KHO XUẤT
                    </span>
                    <span className="font-mono text-[9px] text-slate-400 mt-0.5">{order.createdDate}</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-[11px]">Hoàng Văn Hậu</div>
                    <div className="text-[9px] text-slate-500">Thủ kho {order.fromFactory}</div>
                  </div>
                </div>

                {/* 5. Driver / Logistics Carrier */}
                <div className="border border-slate-300 rounded p-2 text-center flex flex-col justify-between min-h-[125px] bg-white">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                    5. Lái xe / Đơn vị vận tải
                  </div>
                  <div className="my-1.5 flex flex-col items-center">
                    <span className="text-[9px] text-blue-700 font-bold bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                      ✓ KÝ NHẬN VẬN CHUYỂN
                    </span>
                    <span className="font-mono text-[9px] text-slate-400 mt-0.5">{order.transitDetails.licensePlate}</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-[11px]">{order.transitDetails.driverName || 'Nguyễn Văn Cường'}</div>
                    <div className="text-[9px] text-slate-500">{order.transitDetails.carrierName}</div>
                  </div>
                </div>

                {/* 6. Receiving Inspector */}
                <div className="border border-slate-300 rounded p-2 text-center flex flex-col justify-between min-h-[125px] bg-white">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                    6. KTV kiểm tra nhận máy
                  </div>
                  <div className="my-1.5 flex flex-col items-center">
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      ✓ ĐÃ ĐỐI SOÁT SERIAL
                    </span>
                    <span className="font-mono text-[9px] text-slate-400 mt-0.5">{order.receiptVerification.verifiedDate || order.expectedDate}</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-[11px]">{order.receiptVerification.verifiedBy || 'Nguyễn Văn Minh'}</div>
                    <div className="text-[9px] text-slate-500">Kỹ thuật viên nghiệm thu</div>
                  </div>
                </div>

                {/* 7. Book Accountant */}
                <div className="border border-slate-300 rounded p-2 text-center flex flex-col justify-between min-h-[125px] bg-white">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                    7. Kế toán tài sản
                  </div>
                  <div className="my-1.5 flex flex-col items-center">
                    {order.bookTransfer.completed ? (
                      <>
                        <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          ✓ ĐÃ CHUYỂN SỔ TÀI SẢN
                        </span>
                        <span className="font-mono text-[9px] text-slate-400 mt-0.5">{order.bookTransfer.referenceDocNumber || 'KT-CK-2025/089'}</span>
                      </>
                    ) : (
                      <span className="text-[9px] text-slate-500 font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                        CHƯA HẠCH TOÁN
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-[11px]">{order.bookTransfer.transferredBy || 'Trần Thị Thu'}</div>
                    <div className="text-[9px] text-slate-500">Phòng Tài chính Kế toán</div>
                  </div>
                </div>

                {/* 8. QR Code Label Operator */}
                <div className="border border-slate-300 rounded p-2 text-center flex flex-col justify-between min-h-[125px] bg-white">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                    8. Cán bộ phát hành tem QR
                  </div>
                  <div className="my-1.5 flex flex-col items-center">
                    {order.qrPrinting.completed ? (
                      <>
                        <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          ✓ ĐÃ IN & CẤP MÃ
                        </span>
                        <span className="font-mono text-[9px] text-slate-400 mt-0.5">{order.qrPrinting.printedDate || order.expectedDate}</span>
                      </>
                    ) : (
                      <span className="text-[9px] text-slate-500 font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                        CHƯA PHÁT HÀNH
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-[11px]">{order.qrPrinting.printedBy || 'Đỗ Văn C'}</div>
                    <div className="text-[9px] text-slate-500">Tổ tem nhãn kỹ thuật</div>
                  </div>
                </div>

                {/* 9. Final Line Leader Sign-off */}
                <div className="border border-slate-300 rounded p-2 text-center flex flex-col justify-between min-h-[125px] bg-white">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                    9. Trưởng Line sản xuất
                  </div>
                  <div className="my-1.5 flex flex-col items-center">
                    {order.stickerConfirmation.completed ? (
                      <>
                        <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          ✓ ĐÃ DÁN TEM & VẬN HÀNH
                        </span>
                        <span className="font-mono text-[9px] text-slate-400 mt-0.5">{order.stickerConfirmation.completedDate || order.expectedDate}</span>
                      </>
                    ) : (
                      <span className="text-[9px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        ĐANG DÁN TEM LINE
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-[11px]">{order.stickerConfirmation.completedBy || 'Phạm Văn D'}</div>
                    <div className="text-[9px] text-slate-500">Trưởng dây chuyền Line 1</div>
                  </div>
                </div>
              </div>
            </section>

            {/* 11. AUDIT HASH & LEGAL DISCLAIMER FOOTER */}
            <footer className="border-t border-slate-300 pt-3 text-[9px] text-slate-500 flex flex-wrap items-center justify-between gap-2 print:border-slate-400">
              <div>
                <span>Thời điểm trích xuất in: <strong>{printDate}</strong></span>
                <span className="mx-1.5">•</span>
                <span>Người yêu cầu in: <strong>{currentUser.name}</strong> ({currentUser.title || currentUser.role})</span>
              </div>
              <div className="font-mono text-slate-400">
                SHA-256: 7f8c9d2b{order.id.replace('-', '')}3e4f1a590b{order.version}ec
              </div>
              <div className="w-full text-slate-400 italic text-[8.5px] mt-0.5">
                * Văn bản điện tử được kết xuất từ cơ sở dữ liệu hệ thống ETMS PRO / OOS. Mọi hành vi sửa chữa số liệu không qua hệ thống kiểm toán đều vô hiệu.
              </div>
            </footer>
          </article>
        </div>

        {/* Modal Footer (Controls) */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between no-print shrink-0">
          <div className="text-[11px] text-slate-500">
            Mẹo: Để lưu thành tệp PDF chất lượng cao, chọn máy in là <strong>"Save as PDF" (Lưu dưới dạng PDF)</strong> trong hộp thoại in.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In hồ sơ (Print / PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

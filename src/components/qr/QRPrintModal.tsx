import React, { useState, useEffect } from 'react';
import { TransferOrder } from '../../types';
import { generateQRCodeDataURL } from '../../utils/qrGenerator';
import { Printer, Download, X, QrCode, ShieldCheck } from 'lucide-react';

interface QRPrintModalProps {
  order: TransferOrder;
  onClose: () => void;
}

export const QRPrintModal: React.FC<QRPrintModalProps> = ({ order, onClose }) => {
  const [qrImages, setQrImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const generateAll = async () => {
      const results: Record<string, string> = {};
      for (const item of order.qrPrinting.items) {
        const url = await generateQRCodeDataURL(item.qrPayload);
        results[item.newAssetCode] = url;
      }
      setQrImages(results);
    };
    generateAll();
  }, [order]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden text-xs flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Phát hành & In tem QR tài sản — {order.id}
              </h3>
              <p className="text-[11px] text-slate-500">
                Tiêu chuẩn nhãn mã vạch công nghiệp 80mm x 50mm ({order.toFactory})
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Area */}
        <div id="printable-qr-section" className="p-6 overflow-y-auto space-y-4">
          <div className="text-[11px] text-slate-500 mb-2 flex items-center justify-between no-print">
            <span>Tổng số tem: <strong>{order.qrPrinting.items.length}</strong> nhãn</span>
            <span>Khổ in: Thermal Transfer Label 80x50mm</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {order.qrPrinting.items.map((it) => {
              const qrUrl = qrImages[it.newAssetCode];
              return (
                <div
                  key={it.newAssetCode}
                  className="border-2 border-slate-900 rounded-md p-3.5 bg-white shadow-xs flex flex-col justify-between"
                >
                  <div className="border-b border-slate-900 pb-1.5 mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                        ETMS
                      </span>
                      <span className="font-bold text-[11px] tracking-tight text-slate-900">
                        TEM TÀI SẢN DOANH NGHIỆP
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">{order.id}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="shrink-0 border border-slate-900 p-1 rounded bg-white">
                      {qrUrl ? (
                        <img src={qrUrl} alt={it.newAssetCode} className="w-20 h-20" />
                      ) : (
                        <div className="w-20 h-20 bg-slate-100 flex items-center justify-center">
                          <QrCode className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Mã tài sản mới:</span>
                        <div className="font-mono font-black text-lg text-slate-900 leading-none">
                          {it.newAssetCode}
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-500 block">Tên thiết bị:</span>
                        <div className="font-bold text-[11px] text-slate-800 line-clamp-1">{it.name}</div>
                      </div>

                      <div className="text-[9px] text-slate-600 pt-0.5">
                        <span>Đơn vị quản lý: </span>
                        <strong>{order.toFactory}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                    <span>Mã cũ: {it.oldAssetCode}</span>
                    <span>Năm cấp: 2025</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer controls (hidden during print) */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mã định danh duy nhất, không trùng lặp</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-100"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Gửi lệnh in máy in tem nhãn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

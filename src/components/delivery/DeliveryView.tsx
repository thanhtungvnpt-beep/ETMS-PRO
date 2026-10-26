import React, { useState } from 'react';
import { TransferOrder, UserProfile } from '../../types';
import { Truck, FileText, CheckCircle2, AlertTriangle, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { TRUCK_IMG, COMPRESSOR_IMG, CNC_IMG } from '../../data/mockData';

interface DeliveryViewProps {
  orders: TransferOrder[];
  currentUser: UserProfile;
  onOpenOrderDetail: (order: TransferOrder) => void;
}

export const DeliveryView: React.FC<DeliveryViewProps> = ({ orders, currentUser, onOpenOrderDetail }) => {
  const [selectedOrder, setSelectedOrder] = useState<TransferOrder>(orders[0]);

  return (
    <div className="space-y-4 text-xs">
      {/* Top Banner */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600" />
            <span>Quản lý Vận chuyển & Biên bản Giao nhận (Bước 4 & 5)</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Theo dõi phương tiện, lái xe, niêm phong chì và hồ sơ biên bản giao nhận thiết bị giữa các nhà máy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Orders list with delivery details */}
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs space-y-2">
          <h3 className="font-bold text-slate-800 text-xs mb-2">Danh sách chuyến vận chuyển</h3>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
            {orders.map((ord) => {
              const isSelected = selectedOrder.id === ord.id;
              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected ? 'bg-blue-50/80 border-blue-400 shadow-2xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-blue-700">{ord.id}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        ord.transitDetails.status === 'Đã đến cổng nhà máy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.transitDetails.status === 'Đang vận chuyển'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {ord.transitDetails.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-700 font-medium">
                    {ord.fromFactory} → {ord.toFactory}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                    <span>Xe: {ord.transitDetails.licensePlate || 'Chưa điều xe'}</span>
                    <span>BBGN: {ord.deliveryDoc.docNumber || '-'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Order Detailed Delivery dossier */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Hồ sơ vận chuyển chuyến hàng {selectedOrder.id}
              </h3>
              <p className="text-[11px] text-slate-500">
                Tuyến: {selectedOrder.fromFactory} sang {selectedOrder.toFactory}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenOrderDetail(selectedOrder)}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Xem toàn bộ lệnh →
            </button>
          </div>

          {/* Vehicle and Logistics Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Đơn vị vận tải</span>
              <div className="font-bold text-slate-800 text-xs">{selectedOrder.transitDetails.carrierName || 'Vận tải nội bộ'}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Biển kiểm soát xe</span>
              <div className="font-mono font-bold text-slate-800 text-xs">{selectedOrder.transitDetails.licensePlate || '29C-882.15'}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Lái xe & Điện thoại</span>
              <div className="text-slate-800 text-xs">
                {selectedOrder.transitDetails.driverName || 'Hoàng Minh Tuấn'} ({selectedOrder.transitDetails.driverPhone || '0912.456.789'})
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Số niêm phong chì</span>
              <div className="font-mono font-bold text-blue-700 text-xs">{selectedOrder.transitDetails.sealNumber || 'SEAL-VN-99201'}</div>
            </div>
          </div>

          {/* Shipment delivery photos */}
          <div>
            <h4 className="font-bold text-slate-800 text-xs mb-2">Ảnh hiện trường giao nhận thiết bị</h4>
            <div className="grid grid-cols-3 gap-3">
              {(selectedOrder.deliveryDoc.shipmentImages.length > 0
                ? selectedOrder.deliveryDoc.shipmentImages
                : [TRUCK_IMG, COMPRESSOR_IMG, CNC_IMG]
              ).map((img, i) => (
                <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
                  <img src={img} alt={`Giao hàng ${i + 1}`} className="w-full h-28 object-cover" />
                  <div className="p-1.5 bg-slate-50 text-[10px] text-slate-600 text-center font-medium">
                    Ảnh bốc xếp bàn giao #{i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Note (BBGN) */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-slate-800">Biên bản giao nhận đính kèm</div>
              <span className="font-mono text-[11px] text-slate-500">Mã: {selectedOrder.deliveryDoc.docNumber}</span>
            </div>
            <div className="space-y-1.5">
              {selectedOrder.deliveryDoc.files.map((f) => (
                <div key={f.id} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-slate-800">{f.name}</span>
                    <span className="text-slate-400">({f.size})</span>
                  </div>
                  <span className="text-emerald-700 font-semibold text-[10px]">✓ Đã ký đóng dấu</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

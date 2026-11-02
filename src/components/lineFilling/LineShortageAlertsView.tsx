// OOS ETMS PRO — Phase 3: Shortage Detection & Corrective Action Center
import React, { useState } from 'react';
import { LineShortageAlert } from '../../types/lineFillingPhase3';
import {
  getStoredShortageAlerts,
  saveStoredShortageAlerts,
} from '../../services/lineFillingPhase3Storage';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  Users,
  Sparkles,
  PhoneCall,
  RotateCcw,
} from 'lucide-react';

export const LineShortageAlertsView: React.FC = () => {
  const [alerts, setAlerts] = useState<LineShortageAlert[]>(getStoredShortageAlerts);
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');

  const handleResolveAlert = (alertId: string, actionName: string) => {
    const updated = alerts.map((a) => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'ĐÃ_XỬ_LÝ' as const,
          details: `${a.details} • Đã xử lý bằng giải pháp: ${actionName}`,
        };
      }
      return a;
    });
    setAlerts(updated);
    saveStoredShortageAlerts(updated);
    setActionSuccessMsg(`Đã kích hoạt giải pháp "${actionName}" và đóng cảnh báo thành công.`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-4">
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-500 font-bold">Cảnh báo Mức độ CAO</div>
            <div className="text-2xl font-black font-mono text-rose-700 mt-0.5">
              {alerts.filter((a) => a.severity === 'CAO').length}
            </div>
            <div className="text-[10px] text-rose-600">Thiếu hụt &gt; 10 người hoặc thiếu vị trí xung yếu</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-500 font-bold">Cảnh báo Mức độ TRUNG BÌNH</div>
            <div className="text-2xl font-black font-mono text-amber-700 mt-0.5">
              {alerts.filter((a) => a.severity === 'TRUNG BÌNH').length}
            </div>
            <div className="text-[10px] text-slate-500">Thiếu 5 - 9 người, chuyền vẫn chạy được</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-slate-500 font-bold">Đã xử lý bù quân số</div>
            <div className="text-2xl font-black font-mono text-emerald-700 mt-0.5">
              {alerts.filter((a) => a.status === 'ĐÃ_XỬ_LÝ').length}
            </div>
            <div className="text-[10px] text-emerald-600">Đã cân bằng chuyền thành công</div>
          </div>
        </div>
      </div>

      {/* Alerts Action Center List */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-[#082D55] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Trung Tâm Giám Sát Thiếu Hụt & Kích Hoạt Kế Hoạch Ứng Phó
            </h3>
            <p className="text-xs text-slate-500">
              Phát hiện tức thì các vị trí nghiệp vụ thiếu hụt và kích hoạt ngay các hành động khắc phục
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Tự động giám sát bởi hệ thống OOS IoT Engine
          </span>
        </div>

        <div className="space-y-3.5">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                alt.status === 'ĐÃ_XỬ_LÝ'
                  ? 'bg-slate-50 border-slate-200 opacity-70'
                  : alt.severity === 'CAO'
                  ? 'bg-rose-50/40 border-rose-200'
                  : 'bg-amber-50/40 border-amber-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                      alt.severity === 'CAO'
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    MỨC ĐỘ {alt.severity}
                  </span>
                  <h4 className="font-black text-sm text-[#082D55]">
                    {alt.lineCode} ({alt.productModel}) — Thiếu hụt {alt.shortageCount} nhân sự (Đạt {alt.fillingRate}%)
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-slate-500">Phát hiện lúc: {alt.detectedAt}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      alt.status === 'ĐÃ_XỬ_LÝ'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {alt.status === 'ĐÃ_XỬ_LÝ' ? 'Đã xử lý' : 'Chưa xử lý'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-900">Chi tiết vị trí thiếu:</div>
                <div className="font-mono text-rose-600 font-bold">{alt.details}</div>
                <div className="text-slate-600 mt-1">
                  <strong>Khuyến nghị OOS AI:</strong> {alt.recommendedAction}
                </div>
                {alt.assignedTo && (
                  <div className="text-[11px] text-slate-400 mt-1">
                    Người phụ trách: {alt.assignedTo}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {alt.status !== 'ĐÃ_XỬ_LÝ' && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => handleResolveAlert(alt.id, 'Điều chuyển 5 NV từ Line 01 sang')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Điều chuyển từ Line khác</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResolveAlert(alt.id, 'Gọi 8 NV từ Pool Dự phòng Vendor')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Huy động Pool Dự phòng Vendor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResolveAlert(alt.id, 'Yêu cầu tăng ca cuối ca 1.5 giờ')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Đề xuất tăng ca bù công suất</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResolveAlert(alt.id, 'Tạm thời giảm mục tiêu SOP 15%')}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-lg cursor-pointer transition-colors"
                  >
                    <span>Điều chỉnh tạm thời SOP</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

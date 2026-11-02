// OOS ETMS PRO — Phase 3: Workforce Allocation & Line Balancing
import React, { useState } from 'react';
import {
  LineFillingSummary,
  LineTransferLog,
} from '../../types/lineFillingPhase3';
import {
  getStoredLineSummaries,
  getStoredTransferLogs,
  executeWorkforceTransfer,
} from '../../services/lineFillingPhase3Storage';
import {
  Users,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Layers,
  History,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const LineAllocationView: React.FC = () => {
  const [summaries, setSummaries] = useState<LineFillingSummary[]>(getStoredLineSummaries);
  const [logs, setLogs] = useState<LineTransferLog[]>(getStoredTransferLogs);

  // Quick transfer form state
  const [fromLine, setFromLine] = useState<string>('Line 01');
  const [toLine, setToLine] = useState<string>('Line 08');
  const [position, setPosition] = useState<string>('Công nhân sản xuất');
  const [count, setCount] = useState<number>(4);
  const [reason, setReason] = useState<string>('Bù thiếu hụt công nhân đứng line theo lệnh SOP');
  const [statusMsg, setStatusMsg] = useState<string>('');

  const handleTransfer = () => {
    const res = executeWorkforceTransfer(
      fromLine,
      toLine,
      count,
      position,
      'Quản đốc xưởng OOS',
      reason
    );
    if (res.success) {
      setSummaries(res.updatedSummaries);
      setLogs(getStoredTransferLogs());
      setStatusMsg(res.message);
      setTimeout(() => setStatusMsg(''), 5000);
    }
  };

  return (
    <div className="space-y-4">
      {statusMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Allocation Balancing Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Reallocation Form */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#082D55]">
                Điều Phối & Cân Bằng Chuyền (Yamazumi)
              </h3>
              <p className="text-xs text-slate-500">
                Chuyển nhân sự giữa các chuyền để tối ưu hóa công suất
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Chuyền nguồn (Chuyền có nhân sự dư/đủ):
              </label>
              <select
                value={fromLine}
                onChange={(e) => setFromLine(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-800"
              >
                <option value="Line 01">Line 01 (50/50 NV - 100% Đủ)</option>
                <option value="Line 04">Line 04 (40/40 NV - 100% Đủ)</option>
                <option value="Pool Dự phòng KHV">Pool Dự phòng Vendor KHV (Sẵn sàng 15 NV)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Chuyền đích (Chuyền đang thiếu hụt):
              </label>
              <select
                value={toLine}
                onChange={(e) => setToLine(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-blue-900"
              >
                <option value="Line 08">Line 08 (Thiếu 13 người - 74%)</option>
                <option value="Line 03">Line 03 (Thiếu 8 người - 84%)</option>
                <option value="Line 02">Line 02 (Thiếu 5 người - 90%)</option>
                <option value="Line 06">Line 06 (Thiếu 5 người - 91.7%)</option>
                <option value="Line 07">Line 07 (Thiếu 4 người - 92%)</option>
                <option value="Line 05">Line 05 (Thiếu 3 người - 94%)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Vị trí:</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value="Công nhân sản xuất">Công nhân sản xuất</option>
                  <option value="QC / IPQC">QC / IPQC</option>
                  <option value="Hỗ trợ chuyền">Hỗ trợ chuyền</option>
                  <option value="Sửa chữa (Repair)">Sửa chữa (Repair)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số lượng:</label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={count}
                  onChange={(e) => setCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lý do điều chuyển:</label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
              />
            </div>

            <button
              type="button"
              onClick={handleTransfer}
              className="w-full py-2.5 bg-[#1688E8] hover:bg-blue-600 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              Thực hiện điều chuyển ngay
            </button>
          </div>
        </div>

        {/* Right: Transfer History Log */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-[#082D55] flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              Nhật ký điều chuyển nhân sự giữa các Line (Audit Trail)
            </h3>
            <span className="text-xs text-slate-400 font-mono">{logs.length} bản ghi</span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 text-xs">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400">{log.timestamp}</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {log.status}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {log.fromLineCode} ➔ {log.toLineCode}:{' '}
                  <span className="text-blue-600">
                    {log.workerCount} nhân sự
                  </span>{' '}
                  ({log.position})
                </div>
                <div className="text-[11px] text-slate-600">Lý do: {log.reason}</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Người phê duyệt: {log.authorizedBy}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

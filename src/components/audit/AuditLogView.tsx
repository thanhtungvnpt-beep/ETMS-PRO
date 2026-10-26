import React, { useState } from 'react';
import { AuditEvent, UserProfile } from '../../types';
import { History, Search, Filter, ShieldCheck, Download, Calendar } from 'lucide-react';

interface AuditLogViewProps {
  logs: AuditEvent[];
  currentUser: UserProfile;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const filteredLogs = logs.filter((l) => {
    const matchSearch =
      l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchAction = filterAction === 'ALL' || l.action.includes(filterAction);
    return matchSearch && matchAction;
  });

  const exportCSV = () => {
    const headers = ['Mã sự kiện', 'Mã lệnh', 'Thời gian', 'Người thực hiện', 'Vai trò', 'Hành động', 'Nội dung'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.orderId,
      l.timestamp,
      `"${l.user}"`,
      `"${l.role}"`,
      `"${l.action}"`,
      `"${l.summary}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `etms_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-4 space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã sự kiện, mã lệnh, người thực hiện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 focus:bg-white"
          >
            <option value="ALL">Tất cả hành động</option>
            <option value="Tạo lệnh">Tạo lệnh</option>
            <option value="Xác nhận">Xác nhận</option>
            <option value="Đăng ký">Đăng ký tài sản</option>
            <option value="chuyển sổ sách">Chuyển sổ sách</option>
            <option value="tem QR">Tem QR</option>
            <option value="dán tem">Dán tem</option>
            <option value="Hủy">Hủy lệnh</option>
          </select>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-300 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Xuất file kiểm toán (.CSV)</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
            <tr>
              <th className="py-2.5 px-3">Mã SK</th>
              <th className="py-2.5 px-3">Thời gian (Server ISO)</th>
              <th className="py-2.5 px-3">Mã lệnh</th>
              <th className="py-2.5 px-3">Người thực hiện</th>
              <th className="py-2.5 px-3">Vai trò</th>
              <th className="py-2.5 px-3">Hành động</th>
              <th className="py-2.5 px-3">Chi tiết tóm tắt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {filteredLogs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/80">
                <td className="py-2 px-3 text-slate-500 font-bold">{l.id}</td>
                <td className="py-2 px-3 text-slate-600">{l.timestamp}</td>
                <td className="py-2 px-3 font-bold text-blue-700">{l.orderId}</td>
                <td className="py-2 px-3 font-sans font-medium text-slate-800">{l.user}</td>
                <td className="py-2 px-3 font-sans text-slate-500">{l.role}</td>
                <td className="py-2 px-3 font-sans font-semibold text-slate-900">{l.action}</td>
                <td className="py-2 px-3 font-sans text-slate-600 max-w-sm truncate" title={l.summary}>
                  {l.summary}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

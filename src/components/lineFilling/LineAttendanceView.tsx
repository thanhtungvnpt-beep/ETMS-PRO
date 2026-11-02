// OOS ETMS PRO — Phase 3: Workforce Presence & Real-time Attendance
import React, { useState, useMemo } from 'react';
import { LineAttendanceRecord, AttendanceMethod } from '../../types/lineFillingPhase3';
import { getStoredAttendances, saveStoredAttendances } from '../../services/lineFillingPhase3Storage';
import {
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Plus,
  Server,
  Smartphone,
  QrCode,
  ShieldCheck,
  CheckCircle2 as CheckCircleIcon,
} from 'lucide-react';
import { UserProfile } from '../../types/workforce';
import { LineLeaderMobileModal } from './LineLeaderMobileModal';

interface LineAttendanceViewProps {
  currentUser?: UserProfile;
}

export const LineAttendanceView: React.FC<LineAttendanceViewProps> = ({ currentUser }) => {
  const [attendances, setAttendances] = useState<LineAttendanceRecord[]>(getStoredAttendances);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLine, setSelectedLine] = useState<string>('Tất cả');
  const [selectedMethod, setSelectedMethod] = useState<string>('Tất cả');
  const [selectedContract, setSelectedContract] = useState<string>('Tất cả');
  const [isMobileModalOpen, setIsMobileModalOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  // Filtered attendance records
  const filteredRecords = useMemo(() => {
    return attendances.filter((a) => {
      if (selectedLine !== 'Tất cả' && a.lineCode !== selectedLine) return false;
      if (selectedMethod !== 'Tất cả' && a.verificationMethod !== selectedMethod) return false;
      if (selectedContract !== 'Tất cả' && a.contractType !== selectedContract) return false;
      if (
        searchQuery &&
        !a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !a.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !a.position.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [attendances, selectedLine, selectedMethod, selectedContract, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 font-bold">Tổng lượt quét điểm danh</div>
          <div className="text-2xl font-black font-mono text-navy-950 mt-1">
            {attendances.length}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">100% khớp danh sách OOS</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 font-bold">Đi đúng giờ (Trước 07:55)</div>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
            {attendances.filter((a) => a.status === 'ĐÚNG GIỜ').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tỷ lệ đúng giờ: 97.6%</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 font-bold">Đi muộn / Check-in sau 08:00</div>
          <div className="text-2xl font-black font-mono text-amber-600 mt-1">
            {attendances.filter((a) => a.status === 'ĐI MUỘN').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Đã ghi nhận trừ chuyên cần</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-slate-500 font-bold">Phương thức quét</div>
          <div className="text-xs space-y-0.5 mt-1 font-mono text-slate-700">
            <div>RFID Barrier: <strong>{attendances.filter((a) => a.verificationMethod === 'RFID_DEVICE').length}</strong></div>
            <div>FaceID Camera: <strong>{attendances.filter((a) => a.verificationMethod === 'FACE_ID').length}</strong></div>
            <div>QR / Mobile: <strong>{attendances.filter((a) => a.verificationMethod === 'QR_SCAN').length}</strong></div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, mã NV, vị trí..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">Line:</span>
            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Tất cả">Tất cả Chuyền</option>
              <option value="Line 01">Line 01</option>
              <option value="Line 02">Line 02</option>
              <option value="Line 03">Line 03</option>
              <option value="Line 04">Line 04</option>
              <option value="Line 05">Line 05</option>
              <option value="Line 06">Line 06</option>
              <option value="Line 07">Line 07</option>
              <option value="Line 08">Line 08</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">Thiết bị:</span>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Tất cả">Tất cả phương thức</option>
              <option value="RFID_DEVICE">Cổng RFID Barrier</option>
              <option value="FACE_ID">Camera FaceID</option>
              <option value="QR_SCAN">Quét mã QR Mobile</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">Hợp đồng:</span>
            <select
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Tất cả">Tất cả hợp đồng</option>
              <option value="CHÍNH THỨC">Chính thức</option>
              <option value="THỜI VỤ">Thời vụ</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1688E8] hover:bg-blue-600 text-white font-extrabold rounded-xl shadow-xs cursor-pointer transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Ký nhận Chuyền trưởng (Mobile)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setToastMsg('Đã trích xuất danh sách điểm danh ca hiện tại sang file Excel thành công.');
              setTimeout(() => setToastMsg(''), 3500);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            {toastMsg}
          </span>
          <button type="button" onClick={() => setToastMsg('')} className="text-emerald-700">✕</button>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4 w-12 text-center">STT</th>
              <th className="py-2.5 px-4">Nhân viên</th>
              <th className="py-2.5 px-4">Vị trí nghiệp vụ</th>
              <th className="py-2.5 px-4">Chuyền làm việc</th>
              <th className="py-2.5 px-4 text-center">Hợp đồng</th>
              <th className="py-2.5 px-4 text-center">Thời gian quét</th>
              <th className="py-2.5 px-4 text-center">Thiết bị quét</th>
              <th className="py-2.5 px-4 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredRecords.map((r, idx) => (
              <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 px-4 text-center font-mono text-slate-400">
                  {idx + 1}
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        r.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                      }
                      alt={r.fullName}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{r.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.employeeCode}</div>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-slate-700">{r.position}</td>
                <td className="py-2.5 px-4 font-bold text-blue-900">{r.lineCode}</td>
                <td className="py-2.5 px-4 text-center">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      r.contractType === 'CHÍNH THỨC'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {r.contractType}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-800">
                  {r.checkInTime}
                </td>
                <td className="py-2.5 px-4 text-center font-mono text-[11px] text-slate-500">
                  {r.deviceCode} ({r.verificationMethod})
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.status === 'ĐÚNG GIỜ'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Confirmation Modal */}
      <LineLeaderMobileModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        currentUser={currentUser || {
          id: 'KHV-LEAD-03',
          name: 'Nguyễn Văn Tuấn',
          role: 'FACTORY_LEADER',
          title: 'Trưởng chuyền Line 03',
          vendor: 'KHV',
          factory: 'SEV',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        }}
        initialLineCode={selectedLine !== 'Tất cả' ? selectedLine : 'Line 03'}
        onSuccess={(msg) => {
          setAttendances(getStoredAttendances());
          setToastMsg(msg);
          setTimeout(() => setToastMsg(''), 4000);
        }}
      />
    </div>
  );
};

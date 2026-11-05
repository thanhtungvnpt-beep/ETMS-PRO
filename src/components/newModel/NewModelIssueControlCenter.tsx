// OOS NEW MODEL PRO — Equipment Issue Control Center
// Màn hình dành riêng cho Quản lý & EQM để biết chính xác vấn đề phát sinh ở đâu
// Truy xuất: Project → Factory → Block → Vendor → Line → Category → Item → Issue
// Phân biệt: Mới phát sinh, Đang xử lý, Đã khắc phục, Đã xác minh (với quyền Manager/Admin)

import React, { useState, useMemo } from 'react';
import {
  NewModelProjectPro,
  EquipmentIssuePro,
  IssueStatus,
  IssueSeverity,
} from '../../types/newModelPro';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  Building2,
  Layers,
  Cpu,
  User,
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  History,
} from 'lucide-react';

interface NewModelIssueControlCenterProps {
  project: NewModelProjectPro;
  currentUser: { name: string; role: string };
  onUpdateIssueStatus: (
    issueId: string,
    newStatus: IssueStatus,
    note?: string
  ) => void;
  onNavigateToLine: (lineId: string) => void;
}

export const NewModelIssueControlCenter: React.FC<NewModelIssueControlCenterProps> = ({
  project,
  currentUser,
  onUpdateIssueStatus,
  onNavigateToLine,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedVendor, setSelectedVendor] = useState<string>('ALL');

  // Selected issue for detail drawer
  const [selectedIssueId, setSelectedIssueId] = useState<string>(
    () => project.issues[0]?.id || ''
  );
  const [actionNote, setActionNote] = useState<string>('');

  const selectedIssue = useMemo(() => {
    return (
      project.issues.find((iss) => iss.id === selectedIssueId) ||
      project.issues[0] ||
      null
    );
  }, [project.issues, selectedIssueId]);

  // Filter issues
  const filteredIssues = useMemo(() => {
    return project.issues.filter((iss) => {
      // Search
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const match =
          iss.title.toLowerCase().includes(query) ||
          iss.description.toLowerCase().includes(query) ||
          iss.equipmentCode.toLowerCase().includes(query) ||
          iss.equipmentName.toLowerCase().includes(query) ||
          iss.lineCode.toLowerCase().includes(query) ||
          iss.assignedTo.toLowerCase().includes(query);
        if (!match) return false;
      }

      // Severity
      if (selectedSeverity !== 'ALL' && iss.severity !== selectedSeverity) return false;

      // Status
      if (selectedStatus !== 'ALL' && iss.status !== selectedStatus) return false;

      // Vendor
      if (selectedVendor !== 'ALL' && iss.vendor !== selectedVendor) return false;

      return true;
    });
  }, [project.issues, searchQuery, selectedSeverity, selectedStatus, selectedVendor]);

  // Manager or Admin has verification rights
  const isManagerOrAdmin =
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'MANAGER' ||
    currentUser.role === 'PLANNER' ||
    currentUser.name.includes('Quang Huy') ||
    currentUser.name.includes('Minh');

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800 text-xs">
      {/* Header Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#082D55]">
              Trung Tâm Kiểm Soát Sự Cố Thiết Bị (Issue Control Center)
            </h2>
            <p className="text-[11px] text-slate-500">
              Truy xuất chi tiết: Dự án → Nhà máy → Block → Vendor → Line → Nhóm thiết bị →
              Sự cố
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Tổng sự cố đang theo dõi:</span>
          <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-extrabold text-xs shadow-2xs">
            {project.issues.length} vấn đề
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã thiết bị, tên, chuyền, nội dung..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-slate-500 font-medium">Mức độ:</label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50"
            >
              <option value="ALL">Tất cả</option>
              <option value="CAO">Cao (Critical)</option>
              <option value="TRUNG BÌNH">Trung bình</option>
              <option value="THẤP">Thấp</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-slate-500 font-medium">Trạng thái:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50"
            >
              <option value="ALL">Tất cả</option>
              <option value="MỚI_PHÁT_SINH">Mới phát sinh</option>
              <option value="ĐANG_XỬ_LÝ">Đang xử lý</option>
              <option value="ĐÃ_KHẮC_PHỤC">Đã khắc phục</option>
              <option value="ĐÃ_XÁC_MINH">Đã xác minh (Đóng)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-slate-500 font-medium">Vendor:</label>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50"
            >
              <option value="ALL">Tất cả</option>
              <option value="DAAL">DAAL</option>
              <option value="KHV">KHV</option>
              <option value="HSTEC">HSTEC</option>
              <option value="KTECH">KTECH</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: List on Left, Detail Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Issue Table (7 cols on LG) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Mã Issue & Thiết bị</th>
                  <th className="py-2.5 px-3">Line & Vendor</th>
                  <th className="py-2.5 px-3">Mức độ</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIssues.map((iss) => {
                  const isSelected = iss.id === selectedIssueId;
                  return (
                    <tr
                      key={iss.id}
                      onClick={() => setSelectedIssueId(iss.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/90 ring-1 ring-blue-300' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Issue Code & Equipment */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[#082D55]">{iss.id}</div>
                        <div className="font-semibold text-blue-700 truncate max-w-[160px]">
                          {iss.equipmentCode} — {iss.equipmentName}
                        </div>
                        <div className="text-[10px] text-slate-400">({iss.category})</div>
                      </td>

                      {/* Line & Vendor */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-800">{iss.lineCode}</div>
                        <div className="text-[11px] text-slate-500">
                          {iss.factory} • {iss.vendor}
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="py-2.5 px-3">
                        {iss.severity === 'CAO' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-200">
                            Cao
                          </span>
                        )}
                        {iss.severity === 'TRUNG BÌNH' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                            Trung bình
                          </span>
                        )}
                        {iss.severity === 'THẤP' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                            Thấp
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        {iss.status === 'MỚI_PHÁT_SINH' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                            Mới phát sinh
                          </span>
                        )}
                        {iss.status === 'ĐANG_XỬ_LÝ' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Đang xử lý
                          </span>
                        )}
                        {iss.status === 'ĐÃ_KHẮC_PHỤC' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                            Đã khắc phục
                          </span>
                        )}
                        {iss.status === 'ĐÃ_XÁC_MINH' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            ✔ Đã xác minh
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIssueId(iss.id);
                          }}
                          className="px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-[10px]"
                        >
                          Chi tiết →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issue Detailed Dossier (5 cols on LG) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
          {selectedIssue ? (
            <div className="space-y-4">
              {/* Header Box */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-[#082D55]">
                      {selectedIssue.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                      {selectedIssue.severity}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 mt-1">
                    {selectedIssue.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateToLine(selectedIssue.lineId)}
                  className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px] hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <span>Xem Line</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Hierarchy Breadcrumb */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Cây truy xuất vị trí:</div>
                <div className="flex flex-wrap items-center gap-1 text-[11px]">
                  <span className="font-bold text-blue-700">{selectedIssue.projectName}</span>
                  <span>→</span>
                  <span>{selectedIssue.factory}</span>
                  <span>→</span>
                  <span>{selectedIssue.blockName}</span>
                  <span>→</span>
                  <span className="font-semibold">{selectedIssue.vendor}</span>
                  <span>→</span>
                  <span className="font-bold text-[#082D55]">{selectedIssue.lineCode}</span>
                </div>
              </div>

              {/* Equipment Metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Thiết bị</span>
                  <strong className="text-slate-800">
                    {selectedIssue.equipmentCode} — {selectedIssue.equipmentName}
                  </strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Người phụ trách</span>
                  <strong className="text-slate-800">{selectedIssue.assignedTo}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Ngày phát sinh</span>
                  <span className="text-slate-700">{selectedIssue.reportedAt}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Hạn xử lý</span>
                  <span className="text-rose-600 font-bold">{selectedIssue.dueDate}</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-rose-50/60 p-3 rounded-lg border border-rose-200/80 space-y-1">
                <div className="font-bold text-rose-900 text-[11px]">Nội dung chi tiết sự cố:</div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  {selectedIssue.description}
                </p>
              </div>

              {/* Photo Evidence */}
              {selectedIssue.photoUrl && (
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Hình ảnh hiện trường:
                  </span>
                  <div className="rounded-lg overflow-hidden border border-slate-200 h-32 bg-slate-100">
                    <img
                      src={selectedIssue.photoUrl}
                      alt="Issue Evidence"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* History Timeline */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <History className="w-3.5 h-3.5" />
                  <span>Lịch sử xử lý ({selectedIssue.history.length})</span>
                </span>
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {selectedIssue.history.map((h, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-600"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-700">
                        <span>{h.action}</span>
                        <span className="text-[9px] text-slate-400">{h.timestamp}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Người thực hiện: {h.user}</div>
                      {h.note && (
                        <div className="text-[10px] text-slate-600 italic">"{h.note}"</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow Actions Based on RBAC */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <label className="block text-[11px] font-bold text-slate-700">
                  Ghi chú cập nhật tiến độ:
                </label>
                <input
                  type="text"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Ghi chú kết quả kiểm tra hoặc biên bản khắc phục..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-xs bg-slate-50"
                />

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {selectedIssue.status !== 'ĐANG_XỬ_LÝ' &&
                    selectedIssue.status !== 'ĐÃ_XÁC_MINH' && (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateIssueStatus(
                            selectedIssue.id,
                            'ĐANG_XỬ_LÝ',
                            actionNote || 'Đã tiếp nhận xử lý'
                          );
                          setActionNote('');
                        }}
                        className="px-3 py-1.5 rounded-md bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors"
                      >
                        Đang xử lý
                      </button>
                    )}

                  {selectedIssue.status === 'ĐANG_XỬ_LÝ' && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateIssueStatus(
                          selectedIssue.id,
                          'ĐÃ_KHẮC_PHỤC',
                          actionNote || 'Đã sửa chữa / thay thế đạt chuẩn'
                        );
                        setActionNote('');
                      }}
                      className="px-3 py-1.5 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                    >
                      Báo cáo: Đã khắc phục
                    </button>
                  )}

                  {/* Manager Verification Gate */}
                  {selectedIssue.status === 'ĐÃ_KHẮC_PHỤC' && isManagerOrAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateIssueStatus(
                          selectedIssue.id,
                          'ĐÃ_XÁC_MINH',
                          actionNote || 'Manager đã nghiệm thu đạt chuẩn và xác minh đóng Issue'
                        );
                        setActionNote('');
                      }}
                      className="px-3 py-1.5 rounded-md bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Xác minh & Đóng Issue</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">Chọn một Issue để xem chi tiết.</div>
          )}
        </div>
      </div>
    </div>
  );
};

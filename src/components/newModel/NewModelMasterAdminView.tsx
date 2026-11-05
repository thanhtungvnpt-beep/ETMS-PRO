// OOS NEW MODEL — Master Admin & Danh mục dùng chung
// Quản trị viên quản lý danh mục Process, Sub Process / Block, kế thừa dữ liệu Nhà máy, Vendor
// Tuân thủ nghiêm ngặt nguyên tắc: KEEP EXISTING + INTEGRATE + EXTEND + IMPROVE

import React, { useState, useMemo } from 'react';
import {
  ProcessMasterEntity,
  BlockMasterEntity,
  MasterAdminAuditLog,
} from '../../types/newModelPro';
import {
  getStoredProcesses,
  saveStoredProcesses,
  getStoredBlocks,
  saveStoredBlocks,
  getStoredMasterAuditLogs,
  addProcess,
  updateProcess,
  toggleProcessStatus,
  addBlock,
  updateBlock,
  toggleBlockStatus,
} from '../../services/newModelProStorage';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  Power,
  Layers,
  Building2,
  Cpu,
  History,
  FileCheck,
  ChevronRight,
  Info,
  X,
  Lock,
} from 'lucide-react';

interface NewModelMasterAdminViewProps {
  currentUser: { name: string; role: string };
  onClose?: () => void;
  onNavigateToDeclaration?: () => void;
}

export const NewModelMasterAdminView: React.FC<NewModelMasterAdminViewProps> = ({
  currentUser,
  onClose,
  onNavigateToDeclaration,
}) => {
  const [activeTab, setActiveTab] = useState<'process' | 'block' | 'shared-masters' | 'audit'>('process');

  // Master Data state
  const [processes, setProcesses] = useState<ProcessMasterEntity[]>(getStoredProcesses);
  const [blocks, setBlocks] = useState<BlockMasterEntity[]>(getStoredBlocks);
  const [auditLogs, setAuditLogs] = useState<MasterAdminAuditLog[]>(getStoredMasterAuditLogs);

  // Selection & Filters
  const [selectedProcessId, setSelectedProcessId] = useState<string>(processes[0]?.id || 'PRC-001');
  const [processSearch, setProcessSearch] = useState('');
  const [processStatusFilter, setProcessStatusFilter] = useState<'ALL' | 'Active' | 'Inactive'>('ALL');

  const [blockFilterProcessId, setBlockFilterProcessId] = useState<string>('ALL');
  const [blockSearch, setBlockSearch] = useState('');
  const [blockStatusFilter, setBlockStatusFilter] = useState<'ALL' | 'Active' | 'Inactive'>('ALL');

  const [auditFilterType, setAuditFilterType] = useState<string>('ALL');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Modals
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<ProcessMasterEntity | null>(null);
  const [processForm, setProcessForm] = useState({
    code: '',
    name: '',
    description: '',
  });

  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockMasterEntity | null>(null);
  const [blockForm, setBlockForm] = useState({
    processId: processes[0]?.id || '',
    code: '',
    name: '',
    description: '',
  });
  const [blockFormError, setBlockFormError] = useState<string | null>(null);

  // Selected Process Entity
  const selectedProcess = useMemo(() => {
    return processes.find((p) => p.id === selectedProcessId) || processes[0];
  }, [processes, selectedProcessId]);

  // Filtered Processes
  const filteredProcesses = useMemo(() => {
    return processes.filter((p) => {
      const matchSearch =
        p.code.toLowerCase().includes(processSearch.toLowerCase()) ||
        p.name.toLowerCase().includes(processSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(processSearch.toLowerCase());
      const matchStatus =
        processStatusFilter === 'ALL' || p.status === processStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [processes, processSearch, processStatusFilter]);

  // Filtered Blocks
  const filteredBlocks = useMemo(() => {
    return blocks.filter((b) => {
      const matchProcess =
        blockFilterProcessId === 'ALL' || b.processId === blockFilterProcessId;
      const matchSearch =
        b.code.toLowerCase().includes(blockSearch.toLowerCase()) ||
        b.name.toLowerCase().includes(blockSearch.toLowerCase()) ||
        b.description.toLowerCase().includes(blockSearch.toLowerCase());
      const matchStatus =
        blockStatusFilter === 'ALL' || b.status === blockStatusFilter;
      return matchProcess && matchSearch && matchStatus;
    });
  }, [blocks, blockFilterProcessId, blockSearch, blockStatusFilter]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (auditFilterType === 'ALL') return true;
      return log.entityType === auditFilterType;
    });
  }, [auditLogs, auditFilterType]);

  // Blocks belonging to currently selected process
  const blocksForSelectedProcess = useMemo(() => {
    if (!selectedProcess) return [];
    return blocks.filter((b) => b.processId === selectedProcess.id);
  }, [blocks, selectedProcess]);

  // Handlers for Process
  const handleOpenNewProcessModal = () => {
    setEditingProcess(null);
    setProcessForm({ code: '', name: '', description: '' });
    setIsProcessModalOpen(true);
  };

  const handleOpenEditProcessModal = (p: ProcessMasterEntity) => {
    setEditingProcess(p);
    setProcessForm({
      code: p.code,
      name: p.name,
      description: p.description,
    });
    setIsProcessModalOpen(true);
  };

  const handleSaveProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processForm.code.trim() || !processForm.name.trim()) {
      alert('Vui lòng nhập đầy đủ Mã và Tên Process!');
      return;
    }

    if (editingProcess) {
      updateProcess(
        editingProcess.id,
        processForm.name,
        processForm.description,
        currentUser.name
      );
      setProcesses(getStoredProcesses());
      setAuditLogs(getStoredMasterAuditLogs());
      showToast(`Đã cập nhật Process: ${editingProcess.code}`);
    } else {
      const res = addProcess(
        processForm.code,
        processForm.name,
        processForm.description,
        currentUser.name
      );
      if (!res.success) {
        alert(res.message);
        return;
      }
      setProcesses(getStoredProcesses());
      setAuditLogs(getStoredMasterAuditLogs());
      showToast(res.message);
    }
    setIsProcessModalOpen(false);
  };

  const handleToggleProcess = (p: ProcessMasterEntity) => {
    const confirmMsg =
      p.status === 'Active'
        ? `Ngừng sử dụng quy trình "${p.code}"? Các dự án mới sẽ không thể chọn quy trình này.`
        : `Kích hoạt lại quy trình "${p.code}" để sử dụng cho các dự án mới?`;

    if (window.confirm(confirmMsg)) {
      toggleProcessStatus(p.id, currentUser.name);
      setProcesses(getStoredProcesses());
      setAuditLogs(getStoredMasterAuditLogs());
      showToast(
        `Đã chuyển trạng thái ${p.code} sang: ${
          p.status === 'Active' ? 'Inactive' : 'Active'
        }`
      );
    }
  };

  // Handlers for Block
  const handleOpenNewBlockModal = (defaultProcessId?: string) => {
    setEditingBlock(null);
    setBlockFormError(null);
    setBlockForm({
      processId: defaultProcessId || selectedProcess?.id || processes[0]?.id || '',
      code: '',
      name: '',
      description: '',
    });
    setIsBlockModalOpen(true);
  };

  const handleOpenEditBlockModal = (b: BlockMasterEntity) => {
    setEditingBlock(b);
    setBlockFormError(null);
    setBlockForm({
      processId: b.processId,
      code: b.code,
      name: b.name,
      description: b.description,
    });
    setIsBlockModalOpen(true);
  };

  const handleSaveBlock = (e: React.FormEvent) => {
    e.preventDefault();
    setBlockFormError(null);

    if (!blockForm.code.trim() || !blockForm.name.trim() || !blockForm.processId) {
      setBlockFormError('Vui lòng điền đầy đủ các thông tin bắt buộc!');
      return;
    }

    if (editingBlock) {
      updateBlock(
        editingBlock.id,
        blockForm.name,
        blockForm.description,
        currentUser.name
      );
      setBlocks(getStoredBlocks());
      setAuditLogs(getStoredMasterAuditLogs());
      showToast(`Đã cập nhật Block: ${editingBlock.name}`);
    } else {
      const res = addBlock(
        blockForm.processId,
        blockForm.code,
        blockForm.name,
        blockForm.description,
        currentUser.name
      );
      if (!res.success) {
        setBlockFormError(res.message);
        return;
      }
      setBlocks(getStoredBlocks());
      setAuditLogs(getStoredMasterAuditLogs());
      showToast(res.message);
    }
    setIsBlockModalOpen(false);
  };

  const handleToggleBlock = (b: BlockMasterEntity) => {
    const confirmMsg =
      b.status === 'Active'
        ? `Tạm ngưng hoạt động của "${b.name}"?`
        : `Kích hoạt lại "${b.name}"?`;

    if (window.confirm(confirmMsg)) {
      toggleBlockStatus(b.id, currentUser.name);
      setBlocks(getStoredBlocks());
      setAuditLogs(getStoredMasterAuditLogs());
      showToast(`Đã cập nhật trạng thái ${b.name}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Title Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#082D55]">
                MASTER ADMIN — QUẢN LÝ DANH MỤC TIÊU CHUẨN
              </h2>
              <span className="text-[11px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" />
                Chỉ dành cho Quản trị viên (Admin)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Thiết lập quy trình (Process) và phân đoạn sản xuất (Sub Process / Block). Kế thừa danh mục Nhà máy & Vendor dùng chung.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {onNavigateToDeclaration && (
            <button
              type="button"
              onClick={onNavigateToDeclaration}
              className="px-3.5 py-1.5 bg-[#0878E8] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Khai báo dự án mới</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Đóng Admin
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 pt-2 rounded-t-xl">
        <button
          type="button"
          onClick={() => setActiveTab('process')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'process'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>1. Process Master (Quy trình)</span>
          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-600 font-semibold">
            {processes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('block')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'block'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>2. Sub Process / Block Master</span>
          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full text-slate-600 font-semibold">
            {blocks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shared-masters')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'shared-masters'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>3. Danh mục OOS dùng chung</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>4. Nhật ký thay đổi (Audit Log)</span>
          <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded-full text-blue-700 font-semibold">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* ================================================================= */}
      {/* TAB 1: PROCESS MASTER                                             */}
      {/* ================================================================= */}
      {activeTab === 'process' && (
        <div className="space-y-4">
          {/* Top KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Tổng số Process
              </span>
              <div className="text-xl font-black text-[#082D55] mt-1 tabular-nums">
                {processes.length}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Đang hoạt động (Active)
              </span>
              <div className="text-xl font-black text-emerald-600 mt-1 tabular-nums">
                {processes.filter((p) => p.status === 'Active').length}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Ngừng sử dụng (Inactive)
              </span>
              <div className="text-xl font-black text-slate-400 mt-1 tabular-nums">
                {processes.filter((p) => p.status === 'Inactive').length}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Tổng Sub Process / Block
              </span>
              <div className="text-xl font-black text-blue-600 mt-1 tabular-nums">
                {blocks.length}
              </div>
            </div>
          </div>

          {/* Search, Filter & Add Button */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm Process (Mã, Tên, Mô tả)..."
                  value={processSearch}
                  onChange={(e) => setProcessSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <select
                value={processStatusFilter}
                onChange={(e) => setProcessStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="Active">Đang hoạt động (Active)</option>
                <option value="Inactive">Ngừng sử dụng (Inactive)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleOpenNewProcessModal}
              className="px-3 py-1.5 bg-[#0878E8] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Process mới</span>
            </button>
          </div>

          {/* Master Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left 2 Cols: Process Table */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  DANH SÁCH PROCESS ({filteredProcesses.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  Nhấp vào dòng để xem danh sách Block liên kết
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/75 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Mã Process</th>
                      <th className="py-2.5 px-3">Tên Process</th>
                      <th className="py-2.5 px-3">Mô tả</th>
                      <th className="py-2.5 px-3">Trạng thái</th>
                      <th className="py-2.5 px-3">Cập nhật</th>
                      <th className="py-2.5 px-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProcesses.map((p) => {
                      const isSelected = selectedProcessId === p.id;
                      return (
                        <tr
                          key={p.id}
                          onClick={() => setSelectedProcessId(p.id)}
                          className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/80 font-medium' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-[#082D55] bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              {p.code}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-800">{p.name}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">
                            {p.description}
                          </td>
                          <td className="py-2.5 px-3">
                            {p.status === 'Active' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-300">
                                <XCircle className="w-2.5 h-2.5" />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-500 tabular-nums">
                            {p.updatedDate}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div
                              className="flex items-center justify-end gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                title="Sửa thông tin"
                                onClick={() => handleOpenEditProcessModal(p)}
                                className="p-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title={p.status === 'Active' ? 'Ngừng sử dụng' : 'Kích hoạt lại'}
                                onClick={() => handleToggleProcess(p)}
                                className={`p-1 rounded cursor-pointer ${
                                  p.status === 'Active'
                                    ? 'text-red-500 hover:bg-red-50'
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredProcesses.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Không tìm thấy Process nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right 1 Col: Process Inspector & Sub Processes / Blocks */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#082D55] uppercase">
                      Chi tiết Process:
                    </span>
                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {selectedProcess?.code}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      selectedProcess?.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {selectedProcess?.status}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Tên đầy đủ:</span>
                    <span className="font-bold text-slate-800">{selectedProcess?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mô tả nghiệp vụ:</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed bg-slate-50 p-2 rounded border border-slate-200">
                      {selectedProcess?.description || 'Chưa có mô tả'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                    <div>
                      <span className="text-slate-400 block">Tạo bởi:</span>
                      <span className="font-medium">{selectedProcess?.createdBy}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Ngày tạo:</span>
                      <span className="tabular-nums">{selectedProcess?.createdDate}</span>
                    </div>
                  </div>
                </div>

                {/* Linked Blocks */}
                <div className="mt-5 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-[#082D55]">
                      SUB PROCESS / BLOCK THUỘC {selectedProcess?.code} ({blocksForSelectedProcess.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenNewBlockModal(selectedProcess?.id)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm Block</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {blocksForSelectedProcess.map((b) => (
                      <div
                        key={b.id}
                        className="p-2 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs"
                      >
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">{b.name}</span>
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                              {b.code}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                            {b.description}
                          </p>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            b.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                    ))}

                    {blocksForSelectedProcess.length === 0 && (
                      <div className="py-4 text-center text-slate-400 text-xs italic">
                        Chưa có Sub Process nào. Hãy bấm "Thêm Block" để khai báo.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditProcessModal(selectedProcess)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Chỉnh sửa Process
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleProcess(selectedProcess)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                    selectedProcess?.status === 'Active'
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {selectedProcess?.status === 'Active' ? 'Ngừng sử dụng' : 'Kích hoạt lại'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: SUB PROCESS / BLOCK MASTER                                 */}
      {/* ================================================================= */}
      {activeTab === 'block' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[320px]">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm Block theo mã, tên hoặc mô tả..."
                  value={blockSearch}
                  onChange={(e) => setBlockSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Filter by Parent Process */}
              <select
                value={blockFilterProcessId}
                onChange={(e) => setBlockFilterProcessId(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
              >
                <option value="ALL">Tất cả Process cha</option>
                {processes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.name}
                  </option>
                ))}
              </select>

              <select
                value={blockStatusFilter}
                onChange={(e) => setBlockStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="Active">Đang hoạt động (Active)</option>
                <option value="Inactive">Ngừng sử dụng (Inactive)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => handleOpenNewBlockModal()}
              className="px-3 py-1.5 bg-[#0878E8] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Sub Process / Block mới</span>
            </button>
          </div>

          {/* Block Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                DANH MỤC SUB PROCESS / BLOCK TOÀN HỆ THỐNG ({filteredBlocks.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Mỗi Block là đơn vị quản lý Line và phân bổ máy móc chi tiết
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/75 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Mã Block</th>
                    <th className="py-2.5 px-3">Process cha</th>
                    <th className="py-2.5 px-3">Tên Block</th>
                    <th className="py-2.5 px-3">Mô tả công đoạn</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3">Cập nhật</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBlocks.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {b.code}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                          {b.processCode}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {b.name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 max-w-sm truncate">
                        {b.description}
                      </td>
                      <td className="py-2.5 px-3">
                        {b.status === 'Active' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-300">
                            <XCircle className="w-2.5 h-2.5" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-500 tabular-nums">
                        {b.updatedDate}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Sửa Block"
                            onClick={() => handleOpenEditBlockModal(b)}
                            className="p-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title={b.status === 'Active' ? 'Tạm ngưng' : 'Kích hoạt lại'}
                            onClick={() => handleToggleBlock(b)}
                            className={`p-1 rounded cursor-pointer ${
                              b.status === 'Active'
                                ? 'text-red-500 hover:bg-red-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredBlocks.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Không tìm thấy Sub Process / Block nào theo điều kiện lọc.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: DANH MỤC OOS DÙNG CHUNG                                     */}
      {/* ================================================================= */}
      {activeTab === 'shared-masters' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Nguyên tắc kế thừa danh mục OOS:</span>
              <p className="mt-0.5 text-blue-800 leading-relaxed">
                Phân hệ New Model kế thừa trực tiếp danh mục Nhà máy (Factory Master), Nhà thầu (Vendor Master) và Tiêu chuẩn Thiết bị từ hệ thống OOS cốt lõi. Không tạo dữ liệu trùng lặp để đảm bảo tính nhất quán trên toàn bộ phân hệ HR, SOP, EQM, MRO và New Model.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Factory Master Display */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#082D55]" />
                  <span className="text-xs font-bold text-[#082D55] uppercase">
                    1. FACTORY MASTER (NHÀ MÁY)
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">
                  2 Nhà máy chính
                </span>
              </div>

              <div className="mt-3 space-y-2.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#082D55]">SEV — Samsung Electronics Vietnam</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                      Yên Phong, Bắc Ninh
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Cơ sở sản xuất điện thoại thông minh, khung vỏ CNC và bo mạch điện tử SMT.
                  </p>
                  <div className="mt-2 text-[10px] text-slate-600 flex items-center gap-3">
                    <span>Số Line New Model hiện có: <strong>32 Lines</strong></span>
                    <span>Quy mô: <strong>Cấp độ 1</strong></span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#082D55]">SV1 — Samsung Electronics Thái Nguyên</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                      Phổ Yên, Thái Nguyên
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tổ hợp sản xuất thiết bị di động, cơ khí chính xác CNC và lắp ráp hoàn thiện ASSY.
                  </p>
                  <div className="mt-2 text-[10px] text-slate-600 flex items-center gap-3">
                    <span>Số Line New Model hiện có: <strong>24 Lines</strong></span>
                    <span>Quy mô: <strong>Cấp độ 1</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor Master Display */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#082D55]" />
                  <span className="text-xs font-bold text-[#082D55] uppercase">
                    2. VENDOR MASTER (NHÀ THẦU OOS)
                  </span>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">
                  7 Vendor đối tác
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs max-h-72 overflow-y-auto pr-1">
                {[
                  { code: 'DAAL', name: 'Công ty Cổ phần Cơ khí DAAL', spec: 'Gia công phay CNC 5 trục, đồ gá JIG', lines: 12 },
                  { code: 'KHV', name: 'KHV High-Tech Co., Ltd', spec: 'Gia công vỏ Titanium, phay Brother', lines: 10 },
                  { code: 'DREAM TECH', name: 'Dream Tech Vietnam', spec: 'Dán bề mặt SMT, bo mạch PBA', lines: 8 },
                  { code: 'HSTEC', name: 'HSTEC Precision Machinery', spec: 'Mài bóng, xử lý bề mặt nhôm', lines: 8 },
                  { code: 'KTECH', name: 'KTECH Vina Co.', spec: 'Lắp ráp module camera và ép keo IP68', lines: 8 },
                  { code: 'HOJEONGB', name: 'Hojeong B Manufacturing', spec: 'Kiểm tra chức năng RF & buồng âm', lines: 6 },
                  { code: 'HOJEONG VINA', name: 'Hojeong Vina Packaging', spec: 'Đóng gói, dán tem nhãn pallet', lines: 4 },
                ].map((v) => (
                  <div
                    key={v.code}
                    className="p-2 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#082D55] font-mono">{v.code}</span>
                        <span className="text-slate-700 font-semibold text-[11px]">{v.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">{v.spec}</span>
                    </div>
                    <span className="text-[10px] bg-slate-200 font-bold px-2 py-0.5 rounded text-slate-700">
                      {v.lines} Lines
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 4: AUDIT LOG                                                  */}
      {/* ================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-700">Lọc theo loại đối tượng:</span>
              <select
                value={auditFilterType}
                onChange={(e) => setAuditFilterType(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
              >
                <option value="ALL">Tất cả thay đổi</option>
                <option value="PROCESS">Chỉ Process</option>
                <option value="BLOCK">Chỉ Block</option>
                <option value="PROJECT_DECLARATION">Chỉ Khai báo dự án</option>
              </select>
            </div>
            <span className="text-xs text-slate-400">
              Tổng số bản ghi: <strong className="text-slate-700">{filteredAuditLogs.length}</strong>
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/75 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Mã kiểm toán</th>
                    <th className="py-2.5 px-3">Thời gian</th>
                    <th className="py-2.5 px-3">Đối tượng</th>
                    <th className="py-2.5 px-3">Mã thực thể</th>
                    <th className="py-2.5 px-3">Hành động</th>
                    <th className="py-2.5 px-3">Người thực hiện</th>
                    <th className="py-2.5 px-3">Chi tiết thay đổi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                        {log.id}
                      </td>
                      <td className="py-2.5 px-3 tabular-nums text-slate-500">
                        {log.timestamp}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                          {log.entityType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                        {log.entityCode}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            log.action === 'CREATE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : log.action === 'ACTIVATE'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : log.action === 'DEACTIVATE'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {log.user}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: ADD / EDIT PROCESS                                         */}
      {/* ================================================================= */}
      {isProcessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="px-4 py-3 bg-[#082D55] text-white flex items-center justify-between">
              <span className="text-xs font-bold uppercase">
                {editingProcess ? `SỬA PROCESS: ${editingProcess.code}` : 'THÊM PROCESS MỚI'}
              </span>
              <button
                type="button"
                onClick={() => setIsProcessModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProcess} className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mã Process (Process Code) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingProcess}
                  placeholder="Ví dụ: CNC, SMT, ASSY, INJECTION"
                  value={processForm.code}
                  onChange={(e) =>
                    setProcessForm({ ...processForm, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 uppercase disabled:bg-slate-100"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Mã định danh duy nhất (in hoa), dùng để ghép sinh tên dự án tự động.
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên hiển thị Process <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Gia công cơ khí CNC, Dán bề mặt SMT"
                  value={processForm.name}
                  onChange={(e) => setProcessForm({ ...processForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả công đoạn</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả chi tiết mục tiêu, công nghệ và tiêu chuẩn của Process này..."
                  value={processForm.description}
                  onChange={(e) =>
                    setProcessForm({ ...processForm, description: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProcessModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0878E8] hover:bg-blue-600 text-white rounded-lg font-bold transition-all shadow-xs cursor-pointer"
                >
                  {editingProcess ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: ADD / EDIT BLOCK                                           */}
      {/* ================================================================= */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="px-4 py-3 bg-[#082D55] text-white flex items-center justify-between">
              <span className="text-xs font-bold uppercase">
                {editingBlock ? `SỬA SUB PROCESS: ${editingBlock.name}` : 'THÊM SUB PROCESS / BLOCK MỚI'}
              </span>
              <button
                type="button"
                onClick={() => setIsBlockModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBlock} className="p-4 space-y-3 text-xs">
              {blockFormError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
                  {blockFormError}
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Thuộc Process cha <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  disabled={!!editingBlock}
                  value={blockForm.processId}
                  onChange={(e) => setBlockForm({ ...blockForm, processId: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-hidden focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
                >
                  {processes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name} ({p.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mã Block (Block Code) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingBlock}
                  placeholder="Ví dụ: Block 1, Block 2, B1, B2"
                  value={blockForm.code}
                  onChange={(e) => setBlockForm({ ...blockForm, code: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Không được trùng mã Block trong cùng một Process cha.
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên hiển thị Block <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Block 1 - Khu Phay 5 trục Makino"
                  value={blockForm.name}
                  onChange={(e) => setBlockForm({ ...blockForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả công đoạn</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả máy móc, công nghệ hoặc yêu cầu kỹ thuật của Block..."
                  value={blockForm.description}
                  onChange={(e) => setBlockForm({ ...blockForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0878E8] hover:bg-blue-600 text-white rounded-lg font-bold transition-all shadow-xs cursor-pointer"
                >
                  {editingBlock ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#082D55] text-white px-4 py-2.5 rounded-xl shadow-2xl border border-blue-400 flex items-center gap-2.5 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

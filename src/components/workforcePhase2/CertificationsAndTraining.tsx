import React, { useState, useMemo } from 'react';
import {
  EmployeeCertification,
  SkillTrainingPlan,
  EmployeeProfile,
  SkillItem,
  CertificationValidityStatus,
  TrainingPlanStatus,
  SKILL_LEVEL_DEFINITIONS,
  SkillLevel,
} from '../../types/workforcePhase2';
import {
  getStoredCertifications,
  saveStoredCertifications,
  getStoredTrainingPlans,
  saveStoredTrainingPlans,
  getStoredEmployees,
  getStoredSkills,
} from '../../services/workforcePhase2Storage';
import { VENDORS, FACTORIES, UserProfile } from '../../types';

interface Props {
  currentUser: UserProfile;
}

export const CertificationsAndTraining: React.FC<Props> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'CERTS' | 'TRAINING'>('CERTS');
  const [certifications, setCertifications] = useState<EmployeeCertification[]>(() => getStoredCertifications());
  const [trainingPlans, setTrainingPlans] = useState<SkillTrainingPlan[]>(() => getStoredTrainingPlans());
  const [employees] = useState<EmployeeProfile[]>(() => getStoredEmployees());
  const [skills] = useState<SkillItem[]>(() => getStoredSkills());

  // Filter states
  const [filterVendor, setFilterVendor] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Modal states
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [newCert, setNewCert] = useState<{
    employeeId: string;
    skillCode: string;
    certificateName: string;
    certificateNumber: string;
    issuingBody: string;
    issueDate: string;
    expiryDate: string;
    notes: string;
  }>({
    employeeId: employees[0]?.id || '',
    skillCode: '',
    certificateName: '',
    certificateNumber: '',
    issuingBody: '',
    issueDate: new Date().toISOString().slice(0, 10),
    expiryDate: '',
    notes: '',
  });

  const [showAddTrainingModal, setShowAddTrainingModal] = useState(false);
  const [newTraining, setNewTraining] = useState<{
    employeeId: string;
    skillCode: string;
    currentLevel: SkillLevel;
    targetLevel: SkillLevel;
    trainerName: string;
    startDate: string;
    deadlineDate: string;
  }>({
    employeeId: employees[0]?.id || '',
    skillCode: skills[0]?.skillCode || '',
    currentLevel: 1,
    targetLevel: 2,
    trainerName: '',
    startDate: new Date().toISOString().slice(0, 10),
    deadlineDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  });

  const [selectedPlanForUpdate, setSelectedPlanForUpdate] = useState<SkillTrainingPlan | null>(null);
  const [updateProgressVal, setUpdateProgressVal] = useState<number>(0);
  const [updateStatusVal, setUpdateStatusVal] = useState<TrainingPlanStatus>('ĐANG ĐÀO TẠO');
  const [updateOutcomeNotes, setUpdateOutcomeNotes] = useState<string>('');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  // Map employee info
  const employeeMap = useMemo(() => {
    const map = new Map<string, EmployeeProfile>();
    employees.forEach((e) => map.set(e.id, e));
    return map;
  }, [employees]);

  // Map skill info
  const skillMap = useMemo(() => {
    const map = new Map<string, SkillItem>();
    skills.forEach((s) => map.set(s.skillCode, s));
    return map;
  }, [skills]);

  // Filtered Certifications
  const filteredCerts = useMemo(() => {
    return certifications.filter((c) => {
      const emp = employeeMap.get(c.employeeId);
      if (!emp) return false;
      if (filterVendor !== 'ALL' && emp.vendor !== filterVendor) return false;
      if (filterStatus !== 'ALL' && c.verificationStatus !== filterStatus) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = emp.fullName.toLowerCase().includes(term);
        const matchesCode = emp.employeeCode.toLowerCase().includes(term);
        const matchesCertName = c.certificateName.toLowerCase().includes(term);
        const matchesCertNum = c.certificateNumber.toLowerCase().includes(term);
        if (!matchesName && !matchesCode && !matchesCertName && !matchesCertNum) return false;
      }
      return true;
    });
  }, [certifications, employeeMap, filterVendor, filterStatus, searchTerm]);

  // Filtered Training Plans
  const filteredTrainingPlans = useMemo(() => {
    return trainingPlans.filter((p) => {
      const emp = employeeMap.get(p.employeeId);
      if (!emp) return false;
      if (filterVendor !== 'ALL' && emp.vendor !== filterVendor) return false;
      if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = emp.fullName.toLowerCase().includes(term);
        const matchesCode = emp.employeeCode.toLowerCase().includes(term);
        const matchesSkill = (skillMap.get(p.skillCode)?.name || '').toLowerCase().includes(term);
        const matchesTrainer = p.trainerName.toLowerCase().includes(term);
        if (!matchesName && !matchesCode && !matchesSkill && !matchesTrainer) return false;
      }
      return true;
    });
  }, [trainingPlans, employeeMap, skillMap, filterVendor, filterStatus, searchTerm]);

  // KPI summaries
  const certStats = useMemo(() => {
    const valid = certifications.filter((c) => c.verificationStatus === 'CÒN HIỆU LỰC').length;
    const expiring = certifications.filter((c) => c.verificationStatus === 'SẮP HẾT HẠN').length;
    const expired = certifications.filter((c) => c.verificationStatus === 'HẾT HẠN').length;
    return { total: certifications.length, valid, expiring, expired };
  }, [certifications]);

  const trainingStats = useMemo(() => {
    const inProgress = trainingPlans.filter((p) => p.status === 'ĐANG ĐÀO TẠO').length;
    const awaitingReassessment = trainingPlans.filter((p) => p.status === 'CHỜ ĐÁNH GIÁ LẠI').length;
    const completed = trainingPlans.filter((p) => p.status === 'HOÀN THÀNH').length;
    const overdue = trainingPlans.filter((p) => p.status === 'QUÁ HẠN').length;
    return { total: trainingPlans.length, inProgress, awaitingReassessment, completed, overdue };
  }, [trainingPlans]);

  // Add certification
  const handleCreateCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.certificateName || !newCert.certificateNumber || !newCert.issuingBody) {
      showToast('Vui lòng điền đầy đủ tên chứng chỉ, số hiệu và đơn vị cấp.', 'error');
      return;
    }

    // Auto calculate validity status
    let status: CertificationValidityStatus = 'CÒN HIỆU LỰC';
    if (newCert.expiryDate) {
      const expDate = new Date(newCert.expiryDate);
      const now = new Date();
      const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      if (diffDays < 0) status = 'HẾT HẠN';
      else if (diffDays <= 30) status = 'SẮP HẾT HẠN';
    }

    const createdCert: EmployeeCertification = {
      id: `CERT-${Date.now().toString().slice(-6)}`,
      employeeId: newCert.employeeId,
      skillCode: newCert.skillCode || undefined,
      certificateName: newCert.certificateName,
      certificateNumber: newCert.certificateNumber,
      issuingBody: newCert.issuingBody,
      issueDate: newCert.issueDate,
      expiryDate: newCert.expiryDate || undefined,
      verificationStatus: status,
      verifiedBy: currentUser.name,
      verifiedAt: new Date().toISOString().slice(0, 10),
      notes: newCert.notes || undefined,
    };

    const updated = [createdCert, ...certifications];
    setCertifications(updated);
    saveStoredCertifications(updated);
    setShowAddCertModal(false);
    showToast(`Đã thêm chứng chỉ ${createdCert.certificateName} thành công.`);
  };

  // Add Training Plan
  const handleCreateTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTraining.trainerName) {
      showToast('Vui lòng nhập tên giảng viên / người hướng dẫn kèm cặp.', 'error');
      return;
    }

    const createdPlan: SkillTrainingPlan = {
      id: `TRN-${Date.now().toString().slice(-6)}`,
      employeeId: newTraining.employeeId,
      skillCode: newTraining.skillCode,
      currentLevel: newTraining.currentLevel,
      targetLevel: newTraining.targetLevel,
      trainerName: newTraining.trainerName,
      startDate: newTraining.startDate,
      deadlineDate: newTraining.deadlineDate,
      status: 'ĐANG ĐÀO TẠO',
      progressPct: 0,
    };

    const updated = [createdPlan, ...trainingPlans];
    setTrainingPlans(updated);
    saveStoredTrainingPlans(updated);
    setShowAddTrainingModal(false);
    showToast(`Đã khởi tạo kế hoạch đào tạo cho nhân viên.`);
  };

  // Update Training Plan Progress
  const handleSavePlanUpdate = () => {
    if (!selectedPlanForUpdate) return;
    const updated = trainingPlans.map((p) => {
      if (p.id === selectedPlanForUpdate.id) {
        return {
          ...p,
          progressPct: updateProgressVal,
          status: updateStatusVal,
          outcomeNotes: updateOutcomeNotes || p.outcomeNotes,
          completedDate: updateStatusVal === 'HOÀN THÀNH' ? new Date().toISOString().slice(0, 10) : p.completedDate,
        };
      }
      return p;
    });

    setTrainingPlans(updated);
    saveStoredTrainingPlans(updated);
    setSelectedPlanForUpdate(null);
    showToast('Cập nhật tiến độ đào tạo thành công.');
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 border shadow-lg flex items-center gap-3 text-sm font-semibold transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : 'bg-rose-900 text-rose-100 border-rose-700'
          }`}
        >
          <span>{notification.type === 'success' ? '✓' : '⚠'}</span>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Top Banner & Module Selector */}
      <div className="bg-[#0c2340] text-white p-5 border-l-4 border-blue-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 bg-blue-600/40 text-blue-200 border border-blue-400/40">
              MODULE E • WORKFORCE CAPABILITY
            </span>
            <span className="text-xs text-slate-300">Chuẩn hóa chứng chỉ & Lộ trình đào tạo</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mt-1 text-white">
            QUẢN LÝ CHỨNG CHỈ NGHỀ & KẾ HOẠCH ĐÀO TẠO NÂNG BẬC
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Theo dõi chứng chỉ bắt buộc, cảnh báo hết hạn trong 30 ngày và kiểm soát tiến độ đào tạo nâng bậc tay nghề 7 Vendor.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#07172b] p-1 border border-slate-700">
          <button
            onClick={() => {
              setActiveTab('CERTS');
              setFilterStatus('ALL');
            }}
            className={`px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === 'CERTS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            📜 QUẢN LÝ CHỨNG CHỈ ({certifications.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('TRAINING');
              setFilterStatus('ALL');
            }}
            className={`px-4 py-2 text-xs font-bold transition-colors ${
              activeTab === 'TRAINING'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            🎯 KẾ HOẠCH ĐÀO TẠO ({trainingPlans.length})
          </button>
        </div>
      </div>

      {/* KPI Cards based on Tab */}
      {activeTab === 'CERTS' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-blue-600">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng chứng chỉ lưu trữ</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{certStats.total}</div>
            <div className="text-[11px] text-slate-500 mt-1">Đã số hóa & kiểm tra</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-emerald-600">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Còn hiệu lực</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{certStats.valid}</div>
            <div className="text-[11px] text-emerald-600 mt-1">Đủ điều kiện làm việc tiêu chuẩn</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-amber-500">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sắp hết hạn (≤ 30 ngày)</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{certStats.expiring}</div>
            <div className="text-[11px] text-amber-700 mt-1">Cần lập lịch tái thi / tái cấp</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-rose-600">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Đã hết hạn / Vô hiệu</div>
            <div className="text-2xl font-black text-rose-700 mt-1">{certStats.expired}</div>
            <div className="text-[11px] text-rose-600 mt-1">Cảnh báo: không bố trí vận hành độc lập</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-blue-600">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng kế hoạch đào tạo</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{trainingStats.total}</div>
            <div className="text-[11px] text-slate-500 mt-1">Lộ trình theo năng lực mục tiêu</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-indigo-600">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Đang đào tạo kèm cặp</div>
            <div className="text-2xl font-black text-indigo-700 mt-1">{trainingStats.inProgress}</div>
            <div className="text-[11px] text-indigo-600 mt-1">Line Leader / Giảng viên kèm cặp</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-amber-500">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Chờ đánh giá lại</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{trainingStats.awaitingReassessment}</div>
            <div className="text-[11px] text-amber-700 mt-1">Đã xong khóa, chờ HR/Leader sát hạch</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-emerald-600">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Đã hoàn thành</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{trainingStats.completed}</div>
            <div className="text-[11px] text-emerald-600 mt-1">Nâng bậc kỹ năng thành công</div>
          </div>
        </div>
      )}

      {/* Filter and Action Bar */}
      <div className="bg-white border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Vendor Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Vendor:</label>
            <select
              value={filterVendor}
              onChange={(e) => setFilterVendor(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 bg-white font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">Tất cả 7 Vendor</option>
              {VENDORS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Trạng thái:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 bg-white font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {activeTab === 'CERTS' ? (
                <>
                  <option value="CÒN HIỆU LỰC">Còn hiệu lực</option>
                  <option value="SẮP HẾT HẠN">Sắp hết hạn (≤ 30 ngày)</option>
                  <option value="HẾT HẠN">Đã hết hạn</option>
                  <option value="CHƯA XÁC MINH">Chưa xác minh</option>
                </>
              ) : (
                <>
                  <option value="CHƯA BẮT ĐẦU">Chưa bắt đầu</option>
                  <option value="ĐANG ĐÀO TẠO">Đang đào tạo</option>
                  <option value="CHỜ ĐÁNH GIÁ LẠI">Chờ đánh giá lại</option>
                  <option value="HOÀN THÀNH">Hoàn thành</option>
                  <option value="QUÁ HẠN">Quá hạn</option>
                </>
              )}
            </select>
          </div>

          {/* Search Term */}
          <div className="flex items-center gap-1.5 flex-1 md:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, mã NV, chứng chỉ..."
              className="w-full px-3 py-1.5 text-xs border border-slate-300 bg-white placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Button */}
        <div>
          {activeTab === 'CERTS' ? (
            <button
              onClick={() => setShowAddCertModal(true)}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span>+</span>
              <span>CẬP NHẬT CHỨNG CHỈ MỚI</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddTrainingModal(true)}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span>+</span>
              <span>LẬP KẾ HOẠCH ĐÀO TẠO</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'CERTS' ? (
        /* Certifications Table */
        <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Danh sách Chứng chỉ Chuyên môn theo Nhân viên ({filteredCerts.length})
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Hiển thị các chứng chỉ bắt buộc cho công việc kỹ thuật cao
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#0c2340] text-slate-200 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Mã NV</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Vendor / Nhà máy</th>
                  <th className="py-2.5 px-3">Tên chứng chỉ</th>
                  <th className="py-2.5 px-3">Số hiệu / Đơn vị cấp</th>
                  <th className="py-2.5 px-3">Kỹ năng liên kết</th>
                  <th className="py-2.5 px-3 text-center">Ngày cấp</th>
                  <th className="py-2.5 px-3 text-center">Ngày hết hạn</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  <th className="py-2.5 px-3">Người xác minh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCerts.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                      Không tìm thấy chứng chỉ nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredCerts.map((cert) => {
                    const emp = employeeMap.get(cert.employeeId);
                    const skill = cert.skillCode ? skillMap.get(cert.skillCode) : null;

                    return (
                      <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {emp?.employeeCode || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          {emp?.fullName || 'N/A'}
                          <div className="text-[10px] text-slate-500 font-normal">{emp?.position}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-blue-900">{emp?.vendor}</span>
                          <span className="text-slate-400 mx-1">•</span>
                          <span className="text-slate-600">{emp?.factory}</span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-xs">
                          {cert.certificateName}
                          {cert.notes && (
                            <div className="text-[10px] text-slate-400 italic">{cert.notes}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-mono text-slate-700">{cert.certificateNumber}</div>
                          <div className="text-[10px] text-slate-500">{cert.issuingBody}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          {skill ? (
                            <span className="text-xs text-slate-700 font-medium">
                              {skill.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Chứng chỉ tổng quát</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                          {cert.issueDate}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold">
                          {cert.expiryDate ? (
                            <span
                              className={
                                cert.verificationStatus === 'HẾT HẠN'
                                  ? 'text-rose-600'
                                  : cert.verificationStatus === 'SẮP HẾT HẠN'
                                  ? 'text-amber-600'
                                  : 'text-slate-700'
                              }
                            >
                              {cert.expiryDate}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">Vĩnh viễn</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {cert.verificationStatus === 'CÒN HIỆU LỰC' && (
                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              CÒN HIỆU LỰC
                            </span>
                          )}
                          {cert.verificationStatus === 'SẮP HẾT HẠN' && (
                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                              SẮP HẾT HẠN
                            </span>
                          )}
                          {cert.verificationStatus === 'HẾT HẠN' && (
                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              HẾT HẠN
                            </span>
                          )}
                          {cert.verificationStatus === 'CHƯA XÁC MINH' && (
                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                              CHƯA XÁC MINH
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          <div>{cert.verifiedBy || '—'}</div>
                          <div className="text-[10px] text-slate-400">{cert.verifiedAt}</div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Training Plans Table */
        <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Tiến độ Kế hoạch Đào tạo Kỹ thuật 7 Vendor ({filteredTrainingPlans.length})
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Theo dõi tiến độ từ L0/L1 lên L2/L3 theo chuẩn thao tác
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#0c2340] text-slate-200 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Mã Kế hoạch</th>
                  <th className="py-2.5 px-3">Nhân viên</th>
                  <th className="py-2.5 px-3">Vendor / Nhà máy</th>
                  <th className="py-2.5 px-3">Kỹ năng đào tạo</th>
                  <th className="py-2.5 px-3 text-center">Hiện tại → Mục tiêu</th>
                  <th className="py-2.5 px-3">Người hướng dẫn (Trainer)</th>
                  <th className="py-2.5 px-3 text-center">Hạn chót</th>
                  <th className="py-2.5 px-3" style={{ minWidth: 140 }}>Tiến độ</th>
                  <th className="py-2.5 px-3 text-center">Trạng thái</th>
                  <th className="py-2.5 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTrainingPlans.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                      Không có kế hoạch đào tạo nào thỏa mãn bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredTrainingPlans.map((plan) => {
                    const emp = employeeMap.get(plan.employeeId);
                    const skill = skillMap.get(plan.skillCode);
                    const curDef = SKILL_LEVEL_DEFINITIONS[plan.currentLevel];
                    const tarDef = SKILL_LEVEL_DEFINITIONS[plan.targetLevel];

                    return (
                      <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {plan.id}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-800">{emp?.fullName || 'N/A'}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{emp?.employeeCode}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-blue-900">{emp?.vendor}</span>
                          <span className="text-slate-400 mx-1">•</span>
                          <span className="text-slate-600">{emp?.factory}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800">{skill?.name || plan.skillCode}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{plan.skillCode}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 font-bold font-mono">
                            <span className={`px-1.5 py-0.5 text-[10px] border ${curDef.bgClass} ${curDef.borderClass}`}>
                              {curDef.code}
                            </span>
                            <span className="text-slate-400">→</span>
                            <span className={`px-1.5 py-0.5 text-[10px] border ${tarDef.bgClass} ${tarDef.borderClass}`}>
                              {tarDef.code}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800">{plan.trainerName}</div>
                          <div className="text-[10px] text-slate-500">Người kèm cặp</div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                          {plan.deadlineDate}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                            <span>{plan.progressPct}%</span>
                            <span className="text-slate-400 text-[10px]">{plan.startDate}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2">
                            <div
                              className={`h-2 transition-all ${
                                plan.progressPct >= 100
                                  ? 'bg-emerald-600'
                                  : plan.progressPct >= 50
                                  ? 'bg-blue-600'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, plan.progressPct)}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {plan.status === 'ĐANG ĐÀO TẠO' && (
                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                              ĐANG ĐÀO TẠO
                            </span>
                          )}
                          {plan.status === 'CHỜ ĐÁNH GIÁ LẠI' && (
                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              CHỜ ĐÁNH GIÁ LẠI
                            </span>
                          )}
                          {plan.status === 'HOÀN THÀNH' && (
                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              HOÀN THÀNH
                            </span>
                          )}
                          {plan.status === 'QUÁ HẠN' && (
                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              QUÁ HẠN
                            </span>
                          )}
                          {plan.status === 'CHƯA BẮT ĐẦU' && (
                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                              CHƯA BẮT ĐẦU
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedPlanForUpdate(plan);
                              setUpdateProgressVal(plan.progressPct);
                              setUpdateStatusVal(plan.status);
                              setUpdateOutcomeNotes(plan.outcomeNotes || '');
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-blue-100 text-blue-800 border border-slate-300 hover:border-blue-400 transition-colors"
                          >
                            Cập nhật
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Certification */}
      {showAddCertModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-lg w-full p-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 uppercase">
                📜 Cập nhật Chứng chỉ Nghề cho Nhân viên
              </h3>
              <button
                onClick={() => setShowAddCertModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCert} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chọn Nhân viên:</label>
                <select
                  value={newCert.employeeId}
                  onChange={(e) => setNewCert({ ...newCert, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.employeeCode} - {e.fullName} ({e.vendor} - {e.position})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên Chứng chỉ / Bằng nghề:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Chứng chỉ Vận hành An toàn SMT Quốc tế"
                  value={newCert.certificateName}
                  onChange={(e) => setNewCert({ ...newCert, certificateName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số hiệu chứng chỉ:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: CC-SMT-2024-88"
                    value={newCert.certificateNumber}
                    onChange={(e) => setNewCert({ ...newCert, certificateNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Đơn vị cấp:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Hiệp hội IPC / Trung tâm Đào tạo Kỹ thuật"
                    value={newCert.issuingBody}
                    onChange={(e) => setNewCert({ ...newCert, issuingBody: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kỹ năng liên kết (Tùy chọn):</label>
                <select
                  value={newCert.skillCode}
                  onChange={(e) => setNewCert({ ...newCert, skillCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Chứng chỉ nghề chung (Không gắn mã kỹ năng cụ thể) --</option>
                  {skills.map((s) => (
                    <option key={s.skillCode} value={s.skillCode}>
                      [{s.skillCode}] {s.name} ({s.group})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày cấp:</label>
                  <input
                    type="date"
                    required
                    value={newCert.issueDate}
                    onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày hết hạn (Để trống nếu vĩnh viễn):</label>
                  <input
                    type="date"
                    value={newCert.expiryDate}
                    onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú xác minh:</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú hồ sơ gốc, số bản lưu trữ tại phòng nhân sự..."
                  value={newCert.notes}
                  onChange={(e) => setNewCert({ ...newCert, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddCertModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 text-white font-bold hover:bg-blue-800"
                >
                  LƯU CHỨNG CHỈ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Training Plan */}
      {showAddTrainingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-lg w-full p-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 uppercase">
                🎯 Lập Kế hoạch Đào tạo / Nâng bậc Kỹ năng
              </h3>
              <button
                onClick={() => setShowAddTrainingModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTraining} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nhân viên thụ hưởng:</label>
                <select
                  value={newTraining.employeeId}
                  onChange={(e) => setNewTraining({ ...newTraining, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white font-medium"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.employeeCode} - {e.fullName} ({e.vendor} - {e.position})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kỹ năng mục tiêu đào tạo:</label>
                <select
                  value={newTraining.skillCode}
                  onChange={(e) => setNewTraining({ ...newTraining, skillCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white font-medium"
                >
                  {skills.map((s) => (
                    <option key={s.skillCode} value={s.skillCode}>
                      [{s.skillCode}] {s.name} ({s.criticality})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mức hiện tại:</label>
                  <select
                    value={newTraining.currentLevel}
                    onChange={(e) => setNewTraining({ ...newTraining, currentLevel: Number(e.target.value) as SkillLevel })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white font-mono"
                  >
                    {[0, 1, 2, 3].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        L{lvl} - {SKILL_LEVEL_DEFINITIONS[lvl as SkillLevel].name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mục tiêu đào tạo đạt:</label>
                  <select
                    value={newTraining.targetLevel}
                    onChange={(e) => setNewTraining({ ...newTraining, targetLevel: Number(e.target.value) as SkillLevel })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white font-mono font-bold text-blue-900"
                  >
                    {[1, 2, 3, 4].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        L{lvl} - {SKILL_LEVEL_DEFINITIONS[lvl as SkillLevel].name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Giảng viên / Người kèm cặp (Trainer):</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Quản đốc Trần Văn An (Level L4)"
                  value={newTraining.trainerName}
                  onChange={(e) => setNewTraining({ ...newTraining, trainerName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày bắt đầu:</label>
                  <input
                    type="date"
                    required
                    value={newTraining.startDate}
                    onChange={(e) => setNewTraining({ ...newTraining, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hạn chót đánh giá đạt:</label>
                  <input
                    type="date"
                    required
                    value={newTraining.deadlineDate}
                    onChange={(e) => setNewTraining({ ...newTraining, deadlineDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddTrainingModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 text-white font-bold hover:bg-blue-800"
                >
                  KHỞI TẠO KẾ HOẠCH
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update Training Plan Progress */}
      {selectedPlanForUpdate && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-md w-full p-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 uppercase">
                ⚙ Cập nhật Tiến độ Đào tạo ({selectedPlanForUpdate.id})
              </h3>
              <button
                onClick={() => setSelectedPlanForUpdate(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-800">
                  {employeeMap.get(selectedPlanForUpdate.employeeId)?.fullName} (
                  {employeeMap.get(selectedPlanForUpdate.employeeId)?.employeeCode})
                </div>
                <div className="text-slate-500 mt-0.5">
                  Kỹ năng: {skillMap.get(selectedPlanForUpdate.skillCode)?.name}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Tiến độ hoàn thành:</label>
                  <span className="font-bold text-blue-800 text-sm font-mono">{updateProgressVal}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={updateProgressVal}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setUpdateProgressVal(val);
                    if (val === 100) setUpdateStatusVal('CHỜ ĐÁNH GIÁ LẠI');
                  }}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trạng thái:</label>
                <select
                  value={updateStatusVal}
                  onChange={(e) => setUpdateStatusVal(e.target.value as TrainingPlanStatus)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white font-medium"
                >
                  <option value="ĐANG ĐÀO TẠO">Đang đào tạo</option>
                  <option value="CHỜ ĐÁNH GIÁ LẠI">Chờ đánh giá lại (Đã hoàn thành lý thuyết & thực hành)</option>
                  <option value="HOÀN THÀNH">Hoàn thành (Đã qua sát hạch)</option>
                  <option value="QUÁ HẠN">Quá hạn</option>
                  <option value="ĐÃ HỦY">Đã hủy</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú kết quả / Nhận xét huấn luyện:</label>
                <textarea
                  rows={3}
                  placeholder="Ghi nhận điểm mạnh, thao tác đã cải thiện, nội dung cần bổ sung..."
                  value={updateOutcomeNotes}
                  onChange={(e) => setUpdateOutcomeNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForUpdate(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold"
                >
                  HỦY
                </button>
                <button
                  type="button"
                  onClick={handleSavePlanUpdate}
                  className="px-5 py-2 bg-blue-700 text-white font-bold hover:bg-blue-800"
                >
                  LƯU TIẾN ĐỘ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

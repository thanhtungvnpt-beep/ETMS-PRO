import React, { useState, useMemo } from 'react';
import {
  SkillItem,
  SkillCriticality,
  SkillLevel,
  SKILL_LEVEL_DEFINITIONS,
} from '../../types/workforcePhase2';
import {
  getStoredSkills,
  saveStoredSkills,
} from '../../services/workforcePhase2Storage';
import { WORKFORCE_GROUPS, ALL_WORKFORCE_POSITIONS, WorkforceGroup, WorkforceDetailPosition, UserProfile } from '../../types';

interface Props {
  currentUser: UserProfile;
}

export const SkillCatalogConfig: React.FC<Props> = ({ currentUser }) => {
  const [skills, setSkills] = useState<SkillItem[]>(() => getStoredSkills());
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [filterCriticality, setFilterCriticality] = useState<string>('ALL');
  const [filterCertRequired, setFilterCertRequired] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Modal: Add or Edit Skill
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    skillCode: string;
    name: string;
    description: string;
    group: WorkforceGroup;
    applicablePositions: WorkforceDetailPosition[];
    criticality: SkillCriticality;
    requiredLevel: SkillLevel;
    requiresCertification: boolean;
    evaluationCycleMonths: number;
    isActive: boolean;
  }>({
    skillCode: '',
    name: '',
    description: '',
    group: 'Sản xuất',
    applicablePositions: ['Đứng line sản xuất'],
    criticality: 'QUAN TRỌNG',
    requiredLevel: 2,
    requiresCertification: false,
    evaluationCycleMonths: 6,
    isActive: true,
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 3500);
  };

  // Filter skills
  const filteredSkills = useMemo(() => {
    return skills.filter((s) => {
      if (filterGroup !== 'ALL' && s.group !== filterGroup) return false;
      if (filterCriticality !== 'ALL' && s.criticality !== filterCriticality) return false;
      if (filterCertRequired !== 'ALL') {
        const req = filterCertRequired === 'YES';
        if (s.requiresCertification !== req) return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesCode = s.skillCode.toLowerCase().includes(term);
        const matchesName = s.name.toLowerCase().includes(term);
        const matchesDesc = s.description.toLowerCase().includes(term);
        if (!matchesCode && !matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [skills, filterGroup, filterCriticality, filterCertRequired, searchTerm]);

  // Open modal for Create
  const handleOpenCreate = () => {
    const nextNum = skills.length + 1;
    const generatedCode = `SK-PROD-${String(nextNum).padStart(2, '0')}`;
    setFormData({
      skillCode: generatedCode,
      name: '',
      description: '',
      group: 'Sản xuất',
      applicablePositions: ['Đứng line sản xuất'],
      criticality: 'QUAN TRỌNG',
      requiredLevel: 2,
      requiresCertification: false,
      evaluationCycleMonths: 6,
      isActive: true,
    });
    setEditingSkill(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (skill: SkillItem) => {
    setEditingSkill(skill);
    setFormData({
      skillCode: skill.skillCode,
      name: skill.name,
      description: skill.description,
      group: skill.group,
      applicablePositions: [...skill.applicablePositions],
      criticality: skill.criticality,
      requiredLevel: skill.requiredLevel,
      requiresCertification: skill.requiresCertification,
      evaluationCycleMonths: skill.evaluationCycleMonths,
      isActive: skill.isActive,
    });
    setIsModalOpen(true);
  };

  // Submit form
  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.skillCode.trim()) {
      showToast('Vui lòng nhập mã và tên kỹ năng.', 'error');
      return;
    }

    const now = new Date().toISOString().slice(0, 10);

    if (editingSkill) {
      // Update
      const updated = skills.map((s) => {
        if (s.skillCode === editingSkill.skillCode) {
          return {
            ...s,
            ...formData,
            updatedAt: now,
          };
        }
        return s;
      });
      setSkills(updated);
      saveStoredSkills(updated);
      showToast(`Đã cập nhật kỹ năng ${formData.skillCode} thành công.`);
    } else {
      // Check duplicate code
      if (skills.some((s) => s.skillCode === formData.skillCode.trim())) {
        showToast('Mã kỹ năng này đã tồn tại, vui lòng chọn mã khác.', 'error');
        return;
      }
      const newSkill: SkillItem = {
        ...formData,
        skillCode: formData.skillCode.trim(),
        createdAt: now,
        updatedAt: now,
      };
      const updated = [...skills, newSkill];
      setSkills(updated);
      saveStoredSkills(updated);
      showToast(`Đã thêm mới kỹ năng ${newSkill.skillCode} vào danh mục.`);
    }

    setIsModalOpen(false);
  };

  // Toggle active status
  const handleToggleActive = (skill: SkillItem) => {
    const updated = skills.map((s) => {
      if (s.skillCode === skill.skillCode) {
        return { ...s, isActive: !s.isActive, updatedAt: new Date().toISOString().slice(0, 10) };
      }
      return s;
    });
    setSkills(updated);
    saveStoredSkills(updated);
    showToast(`Đã cập nhật trạng thái kỹ năng ${skill.skillCode}.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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

      {/* Header Banner */}
      <div className="bg-[#0c2340] text-white p-5 border-l-4 border-indigo-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 bg-indigo-600/40 text-indigo-200 border border-indigo-400/40">
              MODULE B • SKILL CATALOG & STANDARDS
            </span>
            <span className="text-xs text-slate-300">Chuẩn hóa từ điển năng lực kỹ thuật</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mt-1 text-white">
            DANH MỤC KỸ NĂNG & TIÊU CHUẨN TAY NGHỀ ĐỊNH HƯỚNG
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Quy định các kỹ năng áp dụng cho 23 vị trí chi tiết, cấp độ chuẩn yêu cầu (L0 - L4), điều kiện chứng chỉ và chu kỳ tái thẩm định.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
        >
          <span>+</span>
          <span>THÊM KỸ NĂNG MỚI</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-indigo-600">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng số kỹ năng chuẩn</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{skills.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Bao phủ cả 4 khối nghiệp vụ</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-rose-600">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Kỹ năng Bắt buộc</div>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {skills.filter((s) => s.criticality === 'BẮT BUỘC').length}
          </div>
          <div className="text-[11px] text-rose-600 mt-1">Bắt buộc phải đạt chuẩn trước khi giao việc</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-amber-500">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Yêu cầu có chứng chỉ</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {skills.filter((s) => s.requiresCertification).length}
          </div>
          <div className="text-[11px] text-amber-700 mt-1">Cần chứng chỉ hợp lệ để được xếp L2+</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 shadow-sm border-t-2 border-t-emerald-600">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Đang áp dụng thực tế</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {skills.filter((s) => s.isActive).length}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Kích hoạt trong bảng ma trận</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Group */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Khối nghiệp vụ:</label>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 bg-white font-medium focus:outline-none"
            >
              <option value="ALL">Tất cả khối nghiệp vụ</option>
              {WORKFORCE_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Criticality */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Độ trọng yếu:</label>
            <select
              value={filterCriticality}
              onChange={(e) => setFilterCriticality(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 bg-white font-medium focus:outline-none"
            >
              <option value="ALL">Tất cả mức độ</option>
              <option value="BẮT BUỘC">Bắt buộc</option>
              <option value="QUAN TRỌNG">Quan trọng</option>
              <option value="TIÊU CHUẨN">Tiêu chuẩn</option>
              <option value="BỔ TRỢ">Bổ trợ</option>
            </select>
          </div>

          {/* Requires Cert */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-600">Chứng chỉ:</label>
            <select
              value={filterCertRequired}
              onChange={(e) => setFilterCertRequired(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 bg-white font-medium focus:outline-none"
            >
              <option value="ALL">Tất cả</option>
              <option value="YES">Bắt buộc chứng chỉ</option>
              <option value="NO">Không bắt buộc</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="w-full md:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã kỹ năng, tên gọi..."
            className="w-full px-3 py-1.5 text-xs border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Skills Table */}
      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Từ điển Kỹ năng Chuẩn hóa ({filteredSkills.length})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Áp dụng chung cho 7 Vendor liên kết
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#0c2340] text-slate-200 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3">Mã kỹ năng</th>
                <th className="py-2.5 px-3">Tên kỹ năng</th>
                <th className="py-2.5 px-3">Khối nghiệp vụ</th>
                <th className="py-2.5 px-3">Vị trí áp dụng</th>
                <th className="py-2.5 px-3 text-center">Độ trọng yếu</th>
                <th className="py-2.5 px-3 text-center">Cấp độ chuẩn</th>
                <th className="py-2.5 px-3 text-center">Chứng chỉ</th>
                <th className="py-2.5 px-3 text-center">Chu kỳ tái đánh giá</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSkills.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                    Không tìm thấy kỹ năng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredSkills.map((skill) => {
                  const reqDef = SKILL_LEVEL_DEFINITIONS[skill.requiredLevel];

                  return (
                    <tr key={skill.skillCode} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                        {skill.skillCode}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{skill.name}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{skill.description}</div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {skill.group}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {skill.applicablePositions.slice(0, 2).map((pos) => (
                            <span key={pos} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 text-[10px] border border-slate-300">
                              {pos}
                            </span>
                          ))}
                          {skill.applicablePositions.length > 2 && (
                            <span className="text-[10px] text-slate-400">
                              +{skill.applicablePositions.length - 2} vị trí khác
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold border ${
                            skill.criticality === 'BẮT BUỘC'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : skill.criticality === 'QUAN TRỌNG'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {skill.criticality}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold border ${reqDef.bgClass} ${reqDef.borderClass}`}>
                          {reqDef.code} ({reqDef.name})
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {skill.requiresCertification ? (
                          <span className="text-amber-700 font-bold text-xs">✓ Bắt buộc</span>
                        ) : (
                          <span className="text-slate-400 text-xs">Không</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                        {skill.evaluationCycleMonths} tháng
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleToggleActive(skill)}
                          className={`px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                            skill.isActive
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-slate-200 text-slate-600 border-slate-300'
                          }`}
                        >
                          {skill.isActive ? 'HOẠT ĐỘNG' : 'TẠM KHÓA'}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleOpenEdit(skill)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-blue-100 text-blue-800 border border-slate-300 hover:border-blue-400 transition-colors"
                        >
                          Chỉnh sửa
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

      {/* Modal: Create or Edit Skill */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-lg w-full p-6 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 uppercase">
                {editingSkill ? `⚙ Chỉnh sửa Kỹ năng (${editingSkill.skillCode})` : '➕ Thêm Kỹ năng Chuẩn mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSkill} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã kỹ năng:</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingSkill}
                    placeholder="VD: SK-PROD-SMT-02"
                    value={formData.skillCode}
                    onChange={(e) => setFormData({ ...formData, skillCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white font-mono uppercase disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Khối nghiệp vụ:</label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value as WorkforceGroup })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white font-medium"
                  >
                    {WORKFORCE_GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên kỹ năng:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Vận hành máy gắn linh kiện SMT cao tốc"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả chi tiết năng lực & tiêu chí:</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả tiêu chuẩn thao tác, quy định kiểm tra và các điểm kiểm soát chất lượng..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mức độ trọng yếu:</label>
                  <select
                    value={formData.criticality}
                    onChange={(e) => setFormData({ ...formData, criticality: e.target.value as SkillCriticality })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white font-medium"
                  >
                    <option value="BẮT BUỘC">Bắt buộc</option>
                    <option value="QUAN TRỌNG">Quan trọng</option>
                    <option value="TIÊU CHUẨN">Tiêu chuẩn</option>
                    <option value="BỔ TRỢ">Bổ trợ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cấp độ chuẩn tối thiểu:</label>
                  <select
                    value={formData.requiredLevel}
                    onChange={(e) => setFormData({ ...formData, requiredLevel: Number(e.target.value) as SkillLevel })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chu kỳ tái đánh giá (Tháng):</label>
                  <select
                    value={formData.evaluationCycleMonths}
                    onChange={(e) => setFormData({ ...formData, evaluationCycleMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 bg-white font-mono"
                  >
                    <option value={3}>3 tháng</option>
                    <option value={6}>6 tháng</option>
                    <option value={12}>12 tháng</option>
                    <option value={24}>24 tháng</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2 font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.requiresCertification}
                      onChange={(e) => setFormData({ ...formData, requiresCertification: e.target.checked })}
                      className="accent-blue-600"
                    />
                    <span>Bắt buộc phải có Chứng chỉ</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Vị trí áp dụng ({formData.applicablePositions.length} vị trí đã chọn):
                </label>
                <div className="border border-slate-300 p-2 max-h-36 overflow-y-auto space-y-1 bg-slate-50">
                  {ALL_WORKFORCE_POSITIONS.map((pos) => {
                    const isSelected = formData.applicablePositions.includes(pos);
                    return (
                      <label key={pos} className="flex items-center gap-2 text-[11px] cursor-pointer hover:bg-white p-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, applicablePositions: [...formData.applicablePositions, pos] });
                            } else {
                              setFormData({
                                ...formData,
                                applicablePositions: formData.applicablePositions.filter((p) => p !== pos),
                              });
                            }
                          }}
                          className="accent-blue-600"
                        />
                        <span className={isSelected ? 'font-bold text-blue-900' : 'text-slate-700'}>{pos}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold"
                >
                  HỦY
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-700 text-white font-bold hover:bg-indigo-800"
                >
                  {editingSkill ? 'CẬP NHẬT KỸ NĂNG' : 'LƯU KỸ NĂNG'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

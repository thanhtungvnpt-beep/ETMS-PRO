import React, { useState, useMemo } from 'react';
import {
  EmployeeProfile,
  SeniorityBracket,
  ContractType,
  EmployeeStatus,
} from '../../types/workforcePhase2';
import {
  calculateTenureMonths,
  formatTenureDisplay,
  getSeniorityBracket,
  getStoredEmployees,
  saveStoredEmployees,
} from '../../services/workforcePhase2Storage';
import {
  UserProfile,
  VendorName,
  FactoryName,
  WorkforceGroup,
  VENDOR_LIST,
  FACTORY_LIST,
  WORKFORCE_STRUCTURE,
} from '../../types';
import {
  Users,
  Search,
  Filter,
  Plus,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  FileSpreadsheet,
  Download,
  Info,
} from 'lucide-react';

interface SeniorityProfilesProps {
  employees?: EmployeeProfile[];
  currentUser: UserProfile;
  onSaveEmployee?: (employee: EmployeeProfile) => void;
  onNavigateTab?: (tab: any) => void;
  onOpenSkillMatrix?: (emp?: EmployeeProfile) => void;
}

export const SeniorityProfiles: React.FC<SeniorityProfilesProps> = ({
  employees: propEmployees,
  currentUser,
  onSaveEmployee: propOnSave,
  onNavigateTab,
  onOpenSkillMatrix,
}) => {
  const [localEmployees, setLocalEmployees] = useState<EmployeeProfile[]>(() =>
    propEmployees || getStoredEmployees()
  );
  const employees = propEmployees || localEmployees;

  const onSaveEmployee = (emp: EmployeeProfile) => {
    if (propOnSave) {
      propOnSave(emp);
    } else {
      const idx = localEmployees.findIndex((e) => e.id === emp.id);
      let updated: EmployeeProfile[];
      if (idx >= 0) {
        updated = [...localEmployees];
        updated[idx] = emp;
      } else {
        updated = [emp, ...localEmployees];
      }
      setLocalEmployees(updated);
      saveStoredEmployees(updated);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVendor, setFilterVendor] = useState<string>(
    currentUser.role === 'VENDOR_HR' && currentUser.vendor ? currentUser.vendor : 'ALL'
  );
  const [filterFactory, setFilterFactory] = useState<string>('ALL');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [filterContract, setFilterContract] = useState<string>('ALL');
  const [filterBracket, setFilterBracket] = useState<string>('ALL');

  // Modal states
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Employee Form State
  const [formEmployee, setFormEmployee] = useState<Partial<EmployeeProfile>>({
    employeeCode: '',
    fullName: '',
    vendor: currentUser.role === 'VENDOR_HR' && currentUser.vendor ? currentUser.vendor : 'KHV',
    factory: 'Nhà máy A',
    group: 'Sản xuất',
    position: 'Đứng line sản xuất',
    lineOrStation: '',
    contractType: 'CHÍNH THỨC',
    hireDate: new Date().toISOString().slice(0, 10),
    positionStartDate: new Date().toISOString().slice(0, 10),
    status: 'ĐANG LÀM VIỆC',
    dataSource: 'NHẬP THỦ CÔNG',
    notes: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (filterVendor !== 'ALL' && emp.vendor !== filterVendor) return false;
      if (filterFactory !== 'ALL' && emp.factory !== filterFactory) return false;
      if (filterGroup !== 'ALL' && emp.group !== filterGroup) return false;
      if (filterContract !== 'ALL' && emp.contractType !== filterContract) return false;

      if (filterBracket !== 'ALL') {
        const bracket = getSeniorityBracket(emp.hireDate);
        if (bracket !== filterBracket) return false;
      }

      if (searchTerm.trim() !== '') {
        const q = searchTerm.toLowerCase();
        const matchCode = emp.employeeCode.toLowerCase().includes(q);
        const matchName = emp.fullName.toLowerCase().includes(q);
        const matchPos = emp.position.toLowerCase().includes(q);
        const matchStation = emp.lineOrStation?.toLowerCase().includes(q) || false;
        if (!matchCode && !matchName && !matchPos && !matchStation) return false;
      }

      return true;
    });
  }, [employees, filterVendor, filterFactory, filterGroup, filterContract, filterBracket, searchTerm]);

  // Seniority Bracket Badges
  const getBracketBadge = (bracket: SeniorityBracket) => {
    switch (bracket) {
      case '< 3 tháng':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[11px] font-bold">Dưới 3 tháng (Mới/Thử việc)</span>;
      case '3 - 12 tháng':
        return <span className="bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded text-[11px] font-bold">3 - 12 tháng</span>;
      case '1 - 3 năm':
        return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded text-[11px] font-bold">1 - 3 năm (Trung bình)</span>;
      case '> 3 năm':
        return <span className="bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded text-[11px] font-bold">Trên 3 năm (Kỳ cựu)</span>;
      default:
        return null;
    }
  };

  // Submit new employee
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formEmployee.employeeCode?.trim() || !formEmployee.fullName?.trim() || !formEmployee.hireDate) {
      setFormError('Vui lòng điền đầy đủ Mã nhân viên, Họ tên và Ngày vào làm hợp lệ.');
      return;
    }

    // Check duplicate code
    const isDuplicate = employees.some(
      (emp) => emp.employeeCode.toLowerCase() === formEmployee.employeeCode?.trim().toLowerCase()
    );
    if (isDuplicate) {
      setFormError(`Mã nhân viên "${formEmployee.employeeCode}" đã tồn tại trên hệ thống.`);
      return;
    }

    const newEmp: EmployeeProfile = {
      id: `EMP-${Date.now()}`,
      employeeCode: formEmployee.employeeCode.trim().toUpperCase(),
      fullName: formEmployee.fullName.trim(),
      vendor: formEmployee.vendor as VendorName,
      factory: formEmployee.factory as FactoryName,
      group: formEmployee.group as WorkforceGroup,
      position: formEmployee.position as any,
      lineOrStation: formEmployee.lineOrStation?.trim() || undefined,
      contractType: formEmployee.contractType as ContractType,
      hireDate: formEmployee.hireDate,
      positionStartDate: formEmployee.positionStartDate || formEmployee.hireDate,
      status: (formEmployee.status as EmployeeStatus) || 'ĐANG LÀM VIỆC',
      dataSource: 'NHẬP THỦ CÔNG',
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      notes: formEmployee.notes?.trim() || undefined,
    };

    onSaveEmployee(newEmp);
    setIsAddModalOpen(false);
    setFormEmployee({
      employeeCode: '',
      fullName: '',
      vendor: currentUser.role === 'VENDOR_HR' && currentUser.vendor ? currentUser.vendor : 'KHV',
      factory: 'Nhà máy A',
      group: 'Sản xuất',
      position: 'Đứng line sản xuất',
      lineOrStation: '',
      contractType: 'CHÍNH THỨC',
      hireDate: new Date().toISOString().slice(0, 10),
      positionStartDate: new Date().toISOString().slice(0, 10),
      status: 'ĐANG LÀM VIỆC',
      dataSource: 'NHẬP THỦ CÔNG',
      notes: '',
    });
  };

  // Export CSV UTF-8 BOM
  const handleExportCSV = () => {
    const headers = [
      'Mã nhân viên',
      'Họ và tên',
      'Vendor',
      'Nhà máy',
      'Nhóm nghiệp vụ',
      'Vị trí chi tiết',
      'Công đoạn / Line',
      'Loại hợp đồng',
      'Ngày vào làm',
      'Thâm niên công tác',
      'Nhóm thâm niên',
      'Trạng thái',
    ];

    const rows = filteredEmployees.map((e) => {
      const months = calculateTenureMonths(e.hireDate);
      return [
        e.employeeCode,
        `"${e.fullName.replace(/"/g, '""')}"`,
        e.vendor,
        e.factory,
        e.group,
        `"${e.position.replace(/"/g, '""')}"`,
        `"${(e.lineOrStation || '').replace(/"/g, '""')}"`,
        e.contractType,
        e.hireDate,
        `"${formatTenureDisplay(months)}"`,
        getSeniorityBracket(e.hireDate),
        e.status,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ETMS_Ho_So_Tham_Nien_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 text-xs text-slate-800">
      {/* 1. Top Header */}
      <div className="bg-white rounded border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-blue-100 text-blue-800 font-bold text-xs">
              MODULE A
            </span>
            <h2 className="text-base font-black text-slate-900 tracking-wide flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Quản Lý Hồ Sơ Thâm Niên Nhân Viên (7 Vendor)</span>
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Theo dõi thời gian công tác thực tế, phân loại nhóm thâm niên (&lt;3 tháng, 3-12 tháng, 1-3 năm, &gt;3 năm), bảo toàn lịch sử không suy đoán tay nghề.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-300 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Xuất CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm hồ sơ nhân viên</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Toolbar */}
      <div className="bg-white rounded border border-slate-200 p-3 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo mã NV, họ tên, vị trí, công đoạn line..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filter Vendor */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600 text-[11px]">Vendor:</span>
            <select
              value={filterVendor}
              onChange={(e) => setFilterVendor(e.target.value)}
              disabled={currentUser.role === 'VENDOR_HR' && !!currentUser.vendor}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-bold outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả 7 Vendor</option>
              {VENDOR_LIST.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Factory */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600 text-[11px]">Nhà máy:</span>
            <select
              value={filterFactory}
              onChange={(e) => setFilterFactory(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-bold outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả nhà máy</option>
              {FACTORY_LIST.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Group */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600 text-[11px]">Khối:</span>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-semibold outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả khối</option>
              {WORKFORCE_STRUCTURE.map((g) => (
                <option key={g.group} value={g.group}>
                  {g.group}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Contract */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600 text-[11px]">Hợp đồng:</span>
            <select
              value={filterContract}
              onChange={(e) => setFilterContract(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-semibold outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả loại HĐ</option>
              <option value="CHÍNH THỨC">Chính thức</option>
              <option value="THỜI VỤ">Thời vụ</option>
            </select>
          </div>

          {/* Filter Bracket */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600 text-[11px]">Thâm niên:</span>
            <select
              value={filterBracket}
              onChange={(e) => setFilterBracket(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-semibold outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả mức thâm niên</option>
              <option value="< 3 tháng">&lt; 3 tháng (Mới/Học việc)</option>
              <option value="3 - 12 tháng">3 - 12 tháng</option>
              <option value="1 - 3 năm">1 - 3 năm</option>
              <option value="> 3 năm">&gt; 3 năm (Kỳ cựu)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Employee List Table */}
      <div className="bg-white rounded border border-slate-200 shadow-2xs overflow-hidden">
        <div className="bg-[#0c2340] text-white px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold tracking-wide uppercase">
              Danh sách hồ sơ nhân viên chi tiết ({filteredEmployees.length} nhân sự)
            </h3>
          </div>
          <span className="text-[11px] text-slate-300">
            Dữ liệu định danh thực tế theo mã nhân viên
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <th className="py-2.5 px-3">Mã NV</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-2.5">Vendor & Nhà máy</th>
                <th className="py-2.5 px-2.5">Khối & Vị trí</th>
                <th className="py-2.5 px-2.5">Công đoạn / Line</th>
                <th className="py-2.5 px-2.5">Loại HĐ</th>
                <th className="py-2.5 px-2.5">Ngày vào làm</th>
                <th className="py-2.5 px-2.5">Thời gian công tác</th>
                <th className="py-2.5 px-2.5">Nhóm thâm niên</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 italic">
                    Không tìm thấy nhân viên nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const months = calculateTenureMonths(emp.hireDate);
                  const bracket = getSeniorityBracket(emp.hireDate);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                        {emp.employeeCode}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {emp.fullName}
                      </td>
                      <td className="py-2.5 px-2.5">
                        <span className="font-bold text-slate-800">{emp.vendor}</span>
                        <span className="text-slate-400 mx-1">·</span>
                        <span className="text-slate-600">{emp.factory}</span>
                      </td>
                      <td className="py-2.5 px-2.5">
                        <div className="font-medium text-slate-900">{emp.position}</div>
                        <div className="text-[10px] text-slate-500">{emp.group}</div>
                      </td>
                      <td className="py-2.5 px-2.5 text-slate-600">
                        {emp.lineOrStation || <span className="text-slate-400 italic">—</span>}
                      </td>
                      <td className="py-2.5 px-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            emp.contractType === 'CHÍNH THỨC'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {emp.contractType}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 font-mono text-slate-600">
                        {emp.hireDate}
                      </td>
                      <td className="py-2.5 px-2.5 font-semibold text-slate-900">
                        {formatTenureDisplay(months)}
                      </td>
                      <td className="py-2.5 px-2.5">
                        {getBracketBadge(bracket)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedEmployee(emp)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Chi tiết
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

      {/* 4. Detail Employee Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full border border-slate-300 overflow-hidden flex flex-col">
            <div className="bg-[#0c2340] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold tracking-wide">
                  Chi tiết hồ sơ nhân sự: {selectedEmployee.fullName} ({selectedEmployee.employeeCode})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[11px]">Vendor trực thuộc:</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedEmployee.vendor}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Nhà máy hoạt động:</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedEmployee.factory}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Nhóm nghiệp vụ:</span>
                  <div className="font-semibold text-slate-800">{selectedEmployee.group}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Vị trí công việc:</span>
                  <div className="font-semibold text-slate-800">{selectedEmployee.position}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Công đoạn / Dây chuyền:</span>
                  <div className="font-medium text-slate-800">{selectedEmployee.lineOrStation || 'Chưa gắn line cụ thể'}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Loại hợp đồng:</span>
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                        selectedEmployee.contractType === 'CHÍNH THỨC'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {selectedEmployee.contractType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Calculated Tenure Milestone */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded space-y-2">
                <div className="font-bold text-blue-950 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Dữ liệu thâm niên & thời gian công tác đã xác minh</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-600">Ngày vào làm chính thức:</span>
                    <div className="font-mono font-bold text-slate-900">{selectedEmployee.hireDate}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">Tổng thâm niên tính toán:</span>
                    <div className="font-bold text-blue-700">
                      {formatTenureDisplay(calculateTenureMonths(selectedEmployee.hireDate))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-600">Bắt đầu vị trí hiện tại:</span>
                    <div className="font-mono text-slate-900">{selectedEmployee.positionStartDate}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">Nhóm thâm niên hệ thống:</span>
                    <div>{getBracketBadge(getSeniorityBracket(selectedEmployee.hireDate))}</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 italic border-t border-blue-200/60 pt-1.5">
                  * Nguyên tắc: Thâm niên được tính tự động từ ngày tháng thực tế. Thâm niên dài không tự động quy đổi thành bậc tay nghề cao.
                </div>
              </div>

              {selectedEmployee.notes && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-700 text-[11px]">
                  <span className="font-bold text-slate-900">Ghi chú quản lý:</span> {selectedEmployee.notes}
                </div>
              )}
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">
                Cập nhật lần cuối: {selectedEmployee.updatedAt} • Nguồn: {selectedEmployee.dataSource}
              </span>
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full border border-slate-300 overflow-hidden flex flex-col">
            <div className="bg-[#0c2340] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold tracking-wide">
                  Thêm mới hồ sơ nhân sự (Module A)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-4 space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 font-semibold text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã nhân viên *</label>
                  <input
                    type="text"
                    placeholder="VD: KHV-0106"
                    value={formEmployee.employeeCode}
                    onChange={(e) => setFormEmployee({ ...formEmployee, employeeCode: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    placeholder="VD: Hoàng Minh Châu"
                    value={formEmployee.fullName}
                    onChange={(e) => setFormEmployee({ ...formEmployee, fullName: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vendor *</label>
                  <select
                    value={formEmployee.vendor}
                    onChange={(e) => setFormEmployee({ ...formEmployee, vendor: e.target.value as VendorName })}
                    disabled={currentUser.role === 'VENDOR_HR' && !!currentUser.vendor}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-900"
                  >
                    {VENDOR_LIST.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nhà máy *</label>
                  <select
                    value={formEmployee.factory}
                    onChange={(e) => setFormEmployee({ ...formEmployee, factory: e.target.value as FactoryName })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-900"
                  >
                    {FACTORY_LIST.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối nghiệp vụ *</label>
                  <select
                    value={formEmployee.group}
                    onChange={(e) => {
                      const grp = e.target.value as WorkforceGroup;
                      const defaultPos = WORKFORCE_STRUCTURE.find((s) => s.group === grp)?.positions[0] || 'Other';
                      setFormEmployee({ ...formEmployee, group: grp, position: defaultPos as any });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-900"
                  >
                    {WORKFORCE_STRUCTURE.map((g) => (
                      <option key={g.group} value={g.group}>
                        {g.group}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vị trí chi tiết (23 vị trí) *</label>
                  <select
                    value={formEmployee.position}
                    onChange={(e) => setFormEmployee({ ...formEmployee, position: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-900"
                  >
                    {(WORKFORCE_STRUCTURE.find((s) => s.group === formEmployee.group)?.positions || ['Other']).map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại hợp đồng *</label>
                  <select
                    value={formEmployee.contractType}
                    onChange={(e) => setFormEmployee({ ...formEmployee, contractType: e.target.value as ContractType })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-semibold text-slate-900"
                  >
                    <option value="CHÍNH THỨC">Chính thức</option>
                    <option value="THỜI VỤ">Thời vụ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Công đoạn / Line phụ trách</label>
                  <input
                    type="text"
                    placeholder="VD: Line SMT 01"
                    value={formEmployee.lineOrStation}
                    onChange={(e) => setFormEmployee({ ...formEmployee, lineOrStation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày vào làm thực tế *</label>
                  <input
                    type="date"
                    value={formEmployee.hireDate}
                    onChange={(e) => setFormEmployee({ ...formEmployee, hireDate: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày bắt đầu vị trí hiện tại</label>
                  <input
                    type="date"
                    value={formEmployee.positionStartDate}
                    onChange={(e) => setFormEmployee({ ...formEmployee, positionStartDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú thêm</label>
                <textarea
                  rows={2}
                  placeholder="Kinh nghiệm trước đây, chứng chỉ đặc biệt..."
                  value={formEmployee.notes}
                  onChange={(e) => setFormEmployee({ ...formEmployee, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                />
              </div>

              <div className="bg-slate-50 border-t border-slate-200 -mx-4 -mb-4 px-4 py-3 flex items-center justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-xs cursor-pointer"
                >
                  Lưu hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  NewModelProject,
  EquipmentStandardItem,
} from '../../types/newModelProject';
import { FactoryName } from '../../types/workforce';
import { FACTORIES, UserProfile } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (project: NewModelProject) => void;
  existingProjects: NewModelProject[];
  currentUser: UserProfile;
}

export const CreateProjectModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCreated,
  existingProjects,
  currentUser,
}) => {
  const [projectCode, setProjectCode] = useState(() => {
    const nextNum = existingProjects.length + 1;
    return `PRJ-2025-M${String(nextNum).padStart(2, '0')}`;
  });
  const [modelName, setModelName] = useState('');
  const [factory, setFactory] = useState<FactoryName>('Nhà máy A');
  const [lineCount, setLineCount] = useState<number>(2);
  const [targetOutput, setTargetOutput] = useState('100,000 SP/tháng');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return d.toISOString().slice(0, 10);
  });
  const [plannerName, setPlannerName] = useState(currentUser.name || 'Nguyễn Văn A');
  const [equipmentLeaderName, setEquipmentLeaderName] = useState('Trần Văn Cường');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!projectCode.trim() || !modelName.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Mã dự án và Tên Model mới.');
      return;
    }

    // Check duplicate project code
    const isDuplicate = existingProjects.some(
      (p) => p.projectCode.trim().toLowerCase() === projectCode.trim().toLowerCase()
    );
    if (isDuplicate) {
      setErrorMsg(`Mã dự án "${projectCode}" đã tồn tại. Vui lòng nhập mã khác.`);
      return;
    }

    if (lineCount < 1) {
      setErrorMsg('Số lượng Line sản xuất phải tối thiểu từ 1 Line.');
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // Initial default standard items for demo acceleration
    const defaultStandards: EquipmentStandardItem[] = [
      {
        id: `STD-${Date.now()}-1`,
        equipmentCode: 'EQ-SMT-CORE',
        equipmentName: `Máy dán chip tốc độ cao SMT cho ${modelName}`,
        category: 'Thiết bị chính SMT/Gia công',
        compatibleStandard: 'Tiêu chuẩn High-Precision IPC-A-610',
        qtyPerLine: 2,
        lineCount,
        totalDemand: 2 * lineCount,
        unit: 'Chiếc',
        technicalSpecs: 'Tốc độ > 70,000 CPH, độ chính xác ±25µm',
        isMandatory: true,
      },
      {
        id: `STD-AOI-${Date.now()}-2`,
        equipmentCode: 'EQ-AOI-3D',
        equipmentName: `Máy kiểm tra quang học 3D AOI chuyên dụng`,
        category: 'Thiết bị đo kiểm & Thử nghiệm',
        compatibleStandard: '3D Optical Inspection',
        qtyPerLine: 1,
        lineCount,
        totalDemand: 1 * lineCount,
        unit: 'Chiếc',
        technicalSpecs: 'Kiểm tra lỗi chân hàn và bóng mối hàn BGA',
        isMandatory: true,
      },
    ];

    const newProject: NewModelProject = {
      id: projectCode.trim(),
      projectCode: projectCode.trim(),
      modelName: modelName.trim(),
      factory,
      lineCount,
      targetOutput: targetOutput.trim(),
      startDate,
      targetDate,
      plannerName: plannerName.trim(),
      equipmentLeaderName: equipmentLeaderName.trim(),
      status: 'NEW_PLAN',
      currentStep: 1,
      progressPct: 10,
      isOverdue: false,
      hasIssues: false,
      updatedAt: now,
      planInfo: {
        projectCode: projectCode.trim(),
        modelName: modelName.trim(),
        factory,
        lineCount,
        targetOutput: targetOutput.trim(),
        startDate,
        targetDate,
        plannerName: plannerName.trim(),
        equipmentLeaderName: equipmentLeaderName.trim(),
        specialRequirements: specialRequirements.trim() || undefined,
      },
      equipmentStandards: defaultStandards,
      internalReview: [],
      branchDecisions: [],
      transferOrderLinks: [],
      purchaseOrderLinks: [],
      resourceFulfillment: {
        items: [],
        isAllMandatoryFulfilled: false,
        gateStatus: 'CHƯA ĐIỀN ĐẦY',
      },
      technicalInspections: [
        {
          id: `TINSP-${Date.now()}-1`,
          itemCode: 'CHK-CODE-MOD',
          name: 'Đúng mã hiệu chủng loại & Model tương thích',
          standardCriteria: 'Đối chiếu số serial, catalog kỹ thuật của hãng và mã quy định dự án.',
          result: 'CHƯA KIỂM TRA',
          isMandatory: true,
        },
        {
          id: `TINSP-${Date.now()}-2`,
          itemCode: 'CHK-VISUAL',
          name: 'Kiểm tra ngoại quan, va đập & trầy xước',
          standardCriteria: 'Không móp méo, thanh trượt dẫn hướng không rỉ sét.',
          result: 'CHƯA KIỂM TRA',
          isMandatory: true,
        },
        {
          id: `TINSP-${Date.now()}-3`,
          itemCode: 'CHK-STICKER',
          name: 'Dán tem nhận diện Model mới & Tem kiểm định',
          standardCriteria: `Dán tem màu nhận diện "MODEL ${modelName.slice(0, 15)}" và tem hiệu chuẩn.`,
          result: 'CHƯA KIỂM TRA',
          isMandatory: true,
        },
      ],
      lineSetupTasks: [
        {
          id: `SET-A-${Date.now()}`,
          group: 'A. LẮP ĐẶT THIẾT BỊ',
          taskName: 'Đưa máy vào đúng Layout và cố định chân chống rung',
          details: 'Cân bằng nivo 4 góc sai lệch < 0.05mm/m.',
          status: 'CHƯA THỰC HIỆN',
          assignedTo: equipmentLeaderName,
          deadline: targetDate,
          isMandatory: true,
        },
        {
          id: `SET-B-${Date.now()}`,
          group: 'B. HẠ TẦNG',
          taskName: 'Đấu nối nguồn điện 3 pha, khí nén và hút khói',
          details: 'Kiểm tra sụt áp tải đỉnh < 3%.',
          status: 'CHƯA THỰC HIỆN',
          assignedTo: 'Đội Hạ tầng',
          deadline: targetDate,
          isMandatory: true,
        },
        {
          id: `SET-C-${Date.now()}`,
          group: 'C. IT & CHƯƠNG TRÌNH',
          taskName: 'Cài đặt chương trình nạp & dữ liệu Gerber',
          details: 'Đồng bộ kết nối mạng MES Barcode.',
          status: 'CHƯA THỰC HIỆN',
          assignedTo: 'Kỹ sư IT',
          deadline: targetDate,
          isMandatory: true,
        },
      ],
      finalSignOff: {
        conditions: {
          planApproved: true,
          standardsApproved: false,
          resourcesFulfilled: false,
          technicalInspectionsPassed: false,
          lineSetupCompleted: false,
          noCriticalIssues: true,
          docsComplete: false,
          readyForProduction: false,
        },
        isReadyForSignOff: false,
        decision: 'CHỜ DUYỆT',
      },
      eventLogs: [
        {
          id: `LOG-${Date.now()}`,
          timestamp: now,
          user: currentUser.name,
          role: currentUser.title || currentUser.role,
          action: 'Khởi tạo Kế hoạch Model Mới',
          stepNumber: 1,
          details: `Đăng ký kế hoạch dự án Model mới ${modelName} cho ${lineCount} Line tại ${factory}.`,
        },
      ],
    };

    onCreated(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 shadow-2xl max-w-xl w-full p-6 animate-in fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-600"></span>
            <h3 className="text-base font-bold text-slate-900 uppercase">
              BƯỚC 1: KHỞI TẠO KẾ HOẠCH DỰ ÁN MODEL MỚI
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-bold"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            ⚠ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mã Dự Án (Project Code) <span className="text-rose-600">*</span>:
              </label>
              <input
                type="text"
                required
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value.toUpperCase())}
                placeholder="VD: PRJ-2025-M05"
                className="w-full px-3 py-2 border border-slate-300 bg-white font-mono uppercase font-bold text-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nhà Máy Triển Khai <span className="text-rose-600">*</span>:
              </label>
              <select
                value={factory}
                onChange={(e) => setFactory(e.target.value as FactoryName)}
                className="w-full px-3 py-2 border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {FACTORIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tên Model Mới <span className="text-rose-600">*</span>:
            </label>
            <input
              type="text"
              required
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="VD: Model Galaxy S26 Ultra (Titanium Micro-Sensor)"
              className="w-full px-3 py-2 border border-slate-300 bg-white font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Số lượng Line sản xuất <span className="text-rose-600">*</span>:
              </label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={lineCount}
                onChange={(e) => setLineCount(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 border border-slate-300 bg-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sản lượng / Nhu cầu dự kiến:
              </label>
              <input
                type="text"
                value={targetOutput}
                onChange={(e) => setTargetOutput(e.target.value)}
                placeholder="VD: 150,000 SP/tháng"
                className="w-full px-3 py-2 border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ngày bắt đầu dự kiến:
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 bg-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hạn chót hoàn thành (Target):
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 bg-white font-mono font-bold text-rose-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Planner phụ trách:
              </label>
              <input
                type="text"
                required
                value={plannerName}
                onChange={(e) => setPlannerName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Leader Thiết bị phụ trách:
              </label>
              <input
                type="text"
                required
                value={equipmentLeaderName}
                onChange={(e) => setEquipmentLeaderName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Ghi chú & Yêu cầu kỹ thuật đặc biệt:
            </label>
            <textarea
              rows={3}
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              placeholder="Ghi nhận yêu cầu phòng sạch, độ chính xác JIG, thời gian đáp ứng linh kiện..."
              className="w-full px-3 py-2 border border-slate-300 bg-white"
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-[11px]">
            ℹ <strong>Quy tắc nghiệp vụ:</strong> Sau khi khởi tạo, dự án ở trạng thái <em>&quot;Kế hoạch mới&quot;</em>. Hệ thống sẽ tự động tạo bảng tiêu chuẩn định mức để Planner tiến hành Bước 2 (Khai báo tiêu chuẩn thiết bị).
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold cursor-pointer"
            >
              HỦY
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-700 text-white font-bold hover:bg-blue-800 shadow-sm cursor-pointer"
            >
              KHỞI TẠO DỰ ÁN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

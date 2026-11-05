// OOS NEW MODEL — Project Declaration Wizard (Khai báo dự án mới)
// Quy trình chuẩn 6 bước cho Planner khai báo dự án mới, tự động sinh tên dự án và tên Line
// Tuân thủ KEEP EXISTING + INTEGRATE + EXTEND + IMPROVE

import React, { useState, useMemo } from 'react';
import {
  ProcessMasterEntity,
  BlockMasterEntity,
  EquipmentCategory,
  EquipmentItemPro,
  ProjectDeclarationDraft,
  LineDeclarationDraft,
  NewModelProjectPro,
} from '../../types/newModelPro';
import {
  getStoredProcesses,
  getStoredBlocks,
  createProjectFromDeclaration,
} from '../../services/newModelProStorage';
import { FactoryName, VendorName } from '../../types/workforce';
import {
  ClipboardCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Building2,
  Cpu,
  Layers,
  Calendar,
  Plus,
  Trash2,
  Copy,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowRight,
  Save,
  Check,
} from 'lucide-react';

interface NewModelProjectDeclarationWizardProps {
  currentUser: { name: string; role: string };
  onSuccessCreated: (project: NewModelProjectPro) => void;
  onCancel: () => void;
}

// Default Equipment Templates by Process
const DEFAULT_EQUIPMENT_TEMPLATES: Record<string, EquipmentItemPro[]> = {
  CNC: [
    {
      id: 'EQ-TMP-01',
      code: 'MC-MAKINO-01',
      name: 'Máy phay CNC 5 trục Makino Slim3',
      category: 'Machine',
      specs: 'Trục chính 20,000 rpm, sai số ±0.002mm',
      standardQty: 1,
      deliveredQty: 0,
      unit: 'Chiếc',
      supplier: 'Makino Japan',
      status: 'Chưa kiểm tra',
      isMandatory: true,
    },
    {
      id: 'EQ-TMP-02',
      code: 'JIG-CLAMP-01',
      name: 'Đồ gá kẹp khí nén tự động JIG-01',
      category: 'JIG',
      specs: 'Lực kẹp 5kN, cảm biến tiệm cận vị trí',
      standardQty: 2,
      deliveredQty: 0,
      unit: 'Bộ',
      supplier: 'DAAL Engineering',
      status: 'Chưa kiểm tra',
      isMandatory: true,
    },
    {
      id: 'EQ-TMP-03',
      code: 'SMP-TITAN-01',
      name: 'Mẫu vàng chuẩn gia công Titanium Standard',
      category: 'Master Sample',
      specs: 'Độ bóng bề mặt Ra 0.2, khắc laser CMM',
      standardQty: 1,
      deliveredQty: 0,
      unit: 'Chiếc',
      supplier: 'QA Precision Lab',
      status: 'Chưa kiểm tra',
      isMandatory: true,
    },
    {
      id: 'EQ-TMP-04',
      code: 'MRO-SPINDLE-01',
      name: 'Bạc đạn trục chính Spindle MRO Kit',
      category: 'Spare Part / MRO',
      specs: 'Tuổi thọ 4000 giờ, cấp tốc độ cao P4',
      standardQty: 2,
      deliveredQty: 0,
      unit: 'Bộ',
      supplier: 'NSK Precision',
      status: 'Chưa kiểm tra',
      isMandatory: false,
    },
  ],
  SMT: [
    {
      id: 'EQ-TMP-11',
      code: 'MC-PANAS-01',
      name: 'Máy dán chip Panasonic NPM-D3',
      category: 'Machine',
      specs: 'Tốc độ 84,000 cph, độ chính xác ±0.025mm',
      standardQty: 1,
      deliveredQty: 0,
      unit: 'Chiếc',
      supplier: 'Panasonic',
      status: 'Chưa kiểm tra',
      isMandatory: true,
    },
    {
      id: 'EQ-TMP-12',
      code: 'JIG-FEEDER-01',
      name: 'Mâm Feeder cấp linh kiện tự động 8mm',
      category: 'JIG',
      specs: '8mm Intelligent Feeder',
      standardQty: 10,
      deliveredQty: 0,
      unit: 'Chiếc',
      supplier: 'Dream Tech Supply',
      status: 'Chưa kiểm tra',
      isMandatory: true,
    },
    {
      id: 'EQ-TMP-13',
      code: 'SMP-PBA-GOLD',
      name: 'Bo mạch chuẩn mẫu vàng (Golden Board)',
      category: 'Master Sample',
      specs: 'Đã hiệu chuẩn AOI 3D với 1200 linh kiện',
      standardQty: 1,
      deliveredQty: 0,
      unit: 'Bản',
      supplier: 'QA SMT Lab',
      status: 'Chưa kiểm tra',
      isMandatory: true,
    },
  ],
  DEFAULT: [
    {
      id: 'EQ-TMP-21',
      code: 'MC-GEN-01',
      name: 'Máy sản xuất chuyên dụng Cấp độ 1',
      category: 'Machine',
      specs: 'Đáp ứng tiêu chuẩn an toàn công nghiệp',
      standardQty: 1,
      deliveredQty: 0,
      unit: 'Chiếc',
      status: 'Chưa kiểm tra',
      isMandatory: true,
    },
    {
      id: 'EQ-TMP-22',
      code: 'JIG-FIX-01',
      name: 'Đồ gá định vị chuyên dụng',
      category: 'JIG',
      specs: 'Vật liệu nhôm Bakelite',
      standardQty: 2,
      deliveredQty: 0,
      unit: 'Bộ',
      status: 'Chưa kiểm tra',
      isMandatory: true,
    },
  ],
};

const AVAILABLE_VENDORS: VendorName[] = [
  'DAAL',
  'KHV',
  'DREAM TECH',
  'HSTEC',
  'KTECH',
  'HOJEONGB',
  'HOJEONG VINA',
];

export const NewModelProjectDeclarationWizard: React.FC<NewModelProjectDeclarationWizardProps> = ({
  currentUser,
  onSuccessCreated,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Load active processes and blocks from storage
  const allProcesses = useMemo(() => getStoredProcesses(), []);
  const activeProcesses = useMemo(
    () => allProcesses.filter((p) => p.status === 'Active'),
    [allProcesses]
  );
  const allBlocks = useMemo(() => getStoredBlocks(), []);

  // ==========================================
  // STEP 1 STATE: Project Basic Information
  // ==========================================
  const [selectedProcessId, setSelectedProcessId] = useState<string>(
    activeProcesses[0]?.id || 'PRC-001'
  );
  const selectedProcess = useMemo(() => {
    return (
      activeProcesses.find((p) => p.id === selectedProcessId) ||
      activeProcesses[0] || {
        id: 'PRC-001',
        code: 'CNC',
        name: 'Gia công CNC',
        status: 'Active',
      }
    );
  }, [activeProcesses, selectedProcessId]);

  // Active blocks for this process
  const processActiveBlocks = useMemo(() => {
    return allBlocks.filter(
      (b) => b.processId === selectedProcess.id && b.status === 'Active'
    );
  }, [allBlocks, selectedProcess]);

  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>(
    processActiveBlocks.slice(0, 2).map((b) => b.id)
  );

  const [modelCodename, setModelCodename] = useState<string>('S25 Ultra');

  // Auto-calculated Project Name formula: [Process Code] + " " + [Model Codename]
  const autoProjectName = useMemo(() => {
    const code = selectedProcess.code || 'CNC';
    const model = modelCodename.trim() || 'MODEL';
    return `${code} ${model}`;
  }, [selectedProcess, modelCodename]);

  const [year, setYear] = useState<number>(2026);
  const [startWeek, setStartWeek] = useState<number>(44);
  const [endWeek, setEndWeek] = useState<number>(50);

  // ==========================================
  // STEP 2 STATE: Factory Scope
  // ==========================================
  const [selectedFactories, setSelectedFactories] = useState<
    Array<FactoryName | 'SEV' | 'SV1'>
  >(['SEV', 'SV1']);
  const [primaryFactory, setPrimaryFactory] = useState<
    FactoryName | 'SEV' | 'SV1'
  >('SEV');

  // ==========================================
  // STEP 3 STATE: Vendor & Production Line
  // Structure: Array of assignments: Factory -> Block -> Vendor -> Line Count
  // ==========================================
  interface LineAssignmentConfig {
    id: string;
    factory: FactoryName | 'SEV' | 'SV1';
    blockId: string;
    blockName: string;
    vendor: VendorName;
    lineCount: number;
  }

  const [lineConfigs, setLineConfigs] = useState<LineAssignmentConfig[]>([
    {
      id: 'CFG-1',
      factory: 'SEV',
      blockId: processActiveBlocks[0]?.id || 'BLK-001',
      blockName: processActiveBlocks[0]?.code || 'Block 1',
      vendor: 'DAAL',
      lineCount: 2,
    },
    {
      id: 'CFG-2',
      factory: 'SEV',
      blockId: processActiveBlocks[1]?.id || 'BLK-002',
      blockName: processActiveBlocks[1]?.code || 'Block 2',
      vendor: 'KHV',
      lineCount: 1,
    },
  ]);

  // Handler to add a new line config group
  const handleAddLineConfig = () => {
    const newCfg: LineAssignmentConfig = {
      id: `CFG-${Date.now()}`,
      factory: selectedFactories[0] || 'SEV',
      blockId: selectedBlockIds[0] || processActiveBlocks[0]?.id || 'BLK-001',
      blockName:
        processActiveBlocks.find((b) => b.id === selectedBlockIds[0])?.code ||
        'Block 1',
      vendor: 'DAAL',
      lineCount: 1,
    };
    setLineConfigs([...lineConfigs, newCfg]);
  };

  const handleRemoveLineConfig = (id: string) => {
    if (lineConfigs.length <= 1) {
      alert('Dự án cần có ít nhất một cấu hình Line!');
      return;
    }
    setLineConfigs(lineConfigs.filter((c) => c.id !== id));
  };

  // Generate expanded lines list based on current lineConfigs
  const generatedLines = useMemo(() => {
    const list: LineDeclarationDraft[] = [];
    let lineGlobalIndex = 1;

    lineConfigs.forEach((cfg) => {
      const bObj = allBlocks.find((b) => b.id === cfg.blockId);
      const bName = bObj ? bObj.name : cfg.blockName;
      const bCode = bObj ? bObj.code : 'B1';

      for (let i = 1; i <= cfg.lineCount; i++) {
        // Strict Line Name Formula: [Project Name] [Block Name] [Vendor] Line [N]
        const lineName = `${autoProjectName} ${bCode} ${cfg.vendor} Line ${i}`;
        // Short Code Formula: [Process] [Model] [BlockCode] [Vendor] L[N]
        const lineCode = `${selectedProcess.code} ${modelCodename.trim()} ${bCode} ${cfg.vendor} L${i}`;

        // Get default equipment template for this process
        const template =
          DEFAULT_EQUIPMENT_TEMPLATES[selectedProcess.code] ||
          DEFAULT_EQUIPMENT_TEMPLATES.DEFAULT;

        // Clone template equipment items
        const equipmentItems: EquipmentItemPro[] = template.map((eq, eqIdx) => ({
          ...eq,
          id: `EQ-DECL-${lineGlobalIndex}-${eqIdx + 1}`,
          code: `${eq.code}-${lineGlobalIndex}`,
        }));

        list.push({
          lineIndex: lineGlobalIndex,
          lineCode,
          lineName,
          vendor: cfg.vendor,
          factory: cfg.factory,
          blockId: cfg.blockId,
          blockName: bName,
          equipmentItems,
          purchaseStartWeek: startWeek,
          purchaseEndWeek: Math.min(startWeek + 1, endWeek),
          receivingStartWeek: Math.min(startWeek + 2, endWeek),
          receivingEndWeek: Math.min(startWeek + 2, endWeek),
          setupStartWeek: Math.min(startWeek + 3, endWeek),
          setupEndWeek: endWeek,
        });

        lineGlobalIndex++;
      }
    });

    return list;
  }, [
    lineConfigs,
    autoProjectName,
    selectedProcess,
    modelCodename,
    allBlocks,
    startWeek,
    endWeek,
  ]);

  // ==========================================
  // STEP 4 STATE: Equipment Standards per Line
  // ==========================================
  const [activeLineIndexForStandard, setActiveLineIndexForStandard] = useState<number>(1);
  const [equipmentListByLine, setEquipmentListByLine] = useState<
    Record<number, EquipmentItemPro[]>
  >({});

  // Sync initial generated lines equipment into state
  React.useEffect(() => {
    setEquipmentListByLine((prev) => {
      const next = { ...prev };
      generatedLines.forEach((l) => {
        if (!next[l.lineIndex]) {
          next[l.lineIndex] = l.equipmentItems;
        }
      });
      return next;
    });
  }, [generatedLines]);

  // Current line's equipment
  const currentLineEquipment = useMemo(() => {
    return equipmentListByLine[activeLineIndexForStandard] || [];
  }, [equipmentListByLine, activeLineIndexForStandard]);

  // New Equipment Item form state
  const [newItemForm, setNewItemForm] = useState({
    code: '',
    name: '',
    category: 'JIG' as EquipmentCategory,
    specs: '',
    standardQty: 1,
    unit: 'Chiếc',
    supplier: '',
    isMandatory: true,
  });

  const handleAddEquipmentToCurrentLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.code.trim() || !newItemForm.name.trim()) {
      alert('Vui lòng nhập Mã và Tên thiết bị!');
      return;
    }

    const newItem: EquipmentItemPro = {
      id: `EQ-CUSTOM-${Date.now()}`,
      code: newItemForm.code.trim().toUpperCase(),
      name: newItemForm.name.trim(),
      category: newItemForm.category,
      specs: newItemForm.specs.trim(),
      standardQty: newItemForm.standardQty,
      deliveredQty: 0,
      unit: newItemForm.unit,
      supplier: newItemForm.supplier.trim() || undefined,
      status: 'Chưa kiểm tra',
      isMandatory: newItemForm.isMandatory,
    };

    setEquipmentListByLine((prev) => ({
      ...prev,
      [activeLineIndexForStandard]: [...(prev[activeLineIndexForStandard] || []), newItem],
    }));

    setNewItemForm({
      code: '',
      name: '',
      category: 'JIG',
      specs: '',
      standardQty: 1,
      unit: 'Chiếc',
      supplier: '',
      isMandatory: true,
    });
  };

  const handleRemoveEquipment = (itemId: string) => {
    setEquipmentListByLine((prev) => ({
      ...prev,
      [activeLineIndexForStandard]: (prev[activeLineIndexForStandard] || []).filter(
        (i) => i.id !== itemId
      ),
    }));
  };

  // Copy equipment standards from current line to all lines
  const handleCopyStandardsToAllLines = () => {
    if (window.confirm('Áp dụng danh mục thiết bị của Line này cho TẤT CẢ các Line trong dự án?')) {
      const currentItems = equipmentListByLine[activeLineIndexForStandard] || [];
      const updatedMap: Record<number, EquipmentItemPro[]> = {};
      generatedLines.forEach((l) => {
        updatedMap[l.lineIndex] = currentItems.map((item, idx) => ({
          ...item,
          id: `EQ-DECL-${l.lineIndex}-${idx + 1}`,
        }));
      });
      setEquipmentListByLine(updatedMap);
      alert('Đã đồng bộ tiêu chuẩn thiết bị cho tất cả các Line!');
    }
  };

  // ==========================================
  // STEP 5 STATE: Implementation Schedule
  // ==========================================
  const [batchPurchaseWeeks, setBatchPurchaseWeeks] = useState({
    start: startWeek,
    end: Math.min(startWeek + 1, endWeek),
  });
  const [batchReceivingWeeks, setBatchReceivingWeeks] = useState({
    start: Math.min(startWeek + 2, endWeek),
    end: Math.min(startWeek + 2, endWeek),
  });
  const [batchSetupWeeks, setBatchSetupWeeks] = useState({
    start: Math.min(startWeek + 3, endWeek),
    end: endWeek,
  });

  const [scheduleByLine, setScheduleByLine] = useState<
    Record<
      number,
      {
        purchaseStart: number;
        purchaseEnd: number;
        receivingStart: number;
        receivingEnd: number;
        setupStart: number;
        setupEnd: number;
      }
    >
  >({});

  // Sync initial schedules
  React.useEffect(() => {
    setScheduleByLine((prev) => {
      const next = { ...prev };
      generatedLines.forEach((l) => {
        if (!next[l.lineIndex]) {
          next[l.lineIndex] = {
            purchaseStart: batchPurchaseWeeks.start,
            purchaseEnd: batchPurchaseWeeks.end,
            receivingStart: batchReceivingWeeks.start,
            receivingEnd: batchReceivingWeeks.end,
            setupStart: batchSetupWeeks.start,
            setupEnd: batchSetupWeeks.end,
          };
        }
      });
      return next;
    });
  }, [generatedLines, batchPurchaseWeeks, batchReceivingWeeks, batchSetupWeeks]);

  const handleApplyBatchSchedule = () => {
    const updated: Record<number, any> = {};
    generatedLines.forEach((l) => {
      updated[l.lineIndex] = {
        purchaseStart: batchPurchaseWeeks.start,
        purchaseEnd: batchPurchaseWeeks.end,
        receivingStart: batchReceivingWeeks.start,
        receivingEnd: batchReceivingWeeks.end,
        setupStart: batchSetupWeeks.start,
        setupEnd: batchSetupWeeks.end,
      };
    });
    setScheduleByLine(updated);
    alert('Đã áp dụng lịch trình đồng bộ cho tất cả các Line!');
  };

  // ==========================================
  // STEP 6: Validation & Final Creation
  // ==========================================
  const validationIssues = useMemo(() => {
    const issues: string[] = [];
    if (!selectedProcess) issues.push('Chưa chọn Process quy trình');
    if (!modelCodename.trim()) issues.push('Chưa nhập Tên mã sản phẩm (Model Codename)');
    if (selectedBlockIds.length === 0) issues.push('Chưa chọn Sub Process / Block nào');
    if (selectedFactories.length === 0) issues.push('Chưa chọn Nhà máy nào');
    if (generatedLines.length === 0) issues.push('Số lượng Production Line phải lớn hơn 0');
    if (startWeek > endWeek) issues.push('Tuần bắt đầu không được lớn hơn tuần kết thúc');

    // Check equipment defined
    let hasZeroEquipLine = false;
    generatedLines.forEach((l) => {
      const eq = equipmentListByLine[l.lineIndex];
      if (!eq || eq.length === 0) hasZeroEquipLine = true;
    });
    if (hasZeroEquipLine) {
      issues.push('Một số Line chưa có thiết bị tiêu chuẩn nào');
    }

    return issues;
  }, [
    selectedProcess,
    modelCodename,
    selectedBlockIds,
    selectedFactories,
    generatedLines,
    startWeek,
    endWeek,
    equipmentListByLine,
  ]);

  const isValidToCreate = validationIssues.length === 0;

  // Final Action: Create Project
  const handleFinalizeProject = () => {
    if (!isValidToCreate) {
      alert(`Vui lòng khắc phục các điểm sau trước khi tạo dự án:\n- ${validationIssues.join('\n- ')}`);
      return;
    }

    // Assemble full final draft lines with custom equipment & custom schedule
    const finalLines: LineDeclarationDraft[] = generatedLines.map((l) => {
      const sched = scheduleByLine[l.lineIndex] || {
        purchaseStart: startWeek,
        purchaseEnd: Math.min(startWeek + 1, endWeek),
        receivingStart: Math.min(startWeek + 2, endWeek),
        receivingEnd: Math.min(startWeek + 2, endWeek),
        setupStart: Math.min(startWeek + 3, endWeek),
        setupEnd: endWeek,
      };

      return {
        ...l,
        equipmentItems: equipmentListByLine[l.lineIndex] || l.equipmentItems,
        purchaseStartWeek: sched.purchaseStart,
        purchaseEndWeek: sched.purchaseEnd,
        receivingStartWeek: sched.receivingStart,
        receivingEndWeek: sched.receivingEnd,
        setupStartWeek: sched.setupStart,
        setupEndWeek: sched.setupEnd,
      };
    });

    const draft: ProjectDeclarationDraft = {
      processId: selectedProcess.id,
      processCode: selectedProcess.code,
      processName: selectedProcess.name,
      modelCodename: modelCodename.trim().toUpperCase(),
      projectName: autoProjectName,
      selectedBlockIds,
      factories: selectedFactories,
      primaryFactory,
      year,
      startWeek,
      endWeek,
      plannerName: currentUser.name,
      notes: `Khai báo dự án ${autoProjectName} với ${finalLines.length} Lines sản xuất`,
      lines: finalLines,
    };

    const newProject = createProjectFromDeclaration(draft, currentUser.name);
    onSuccessCreated(newProject);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Wizard Step Indicator */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#082D55]">
                KHAI BÁO DỰ ÁN MỚI (PROJECT DECLARATION)
              </h2>
              <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                Planner Module
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Quy trình chuẩn hóa 6 bước: Thiết lập dự án, liên kết danh mục Process Master, phân bổ Line & Tiêu chuẩn thiết bị
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
          </div>
        </div>

        {/* 6 Step Navigation Bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-4">
          {[
            { step: 1, title: '1. Thông tin cơ bản', icon: Cpu },
            { step: 2, title: '2. Phạm vi Nhà máy', icon: Building2 },
            { step: 3, title: '3. Line & Vendor', icon: Layers },
            { step: 4, title: '4. Tiêu chuẩn Thiết bị', icon: ClipboardCheck },
            { step: 5, title: '5. Kế hoạch Triển khai', icon: Calendar },
            { step: 6, title: '6. Tổng hợp & Tạo', icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            const isCurrent = currentStep === item.step;
            const isCompleted = currentStep > item.step;

            return (
              <button
                key={item.step}
                type="button"
                onClick={() => setCurrentStep(item.step)}
                className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 font-medium hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                    isCurrent
                      ? 'bg-white text-blue-600'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : item.step}
                </div>
                <span className="text-[11px] truncate">{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* STEP 1: THÔNG TIN CƠ BẢN DỰ ÁN                                    */}
      {/* ================================================================= */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-extrabold text-[#082D55] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              BƯỚC 1: THÔNG TIN CƠ BẢN DỰ ÁN
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn Process từ Process Master (chỉ quy trình đang Active). Hệ thống tự động sinh tên dự án theo công thức chuẩn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Process Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                1. Chọn Process quy trình <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProcessId}
                onChange={(e) => {
                  setSelectedProcessId(e.target.value);
                  // Reset selected blocks for new process
                  const newBlocks = allBlocks.filter(
                    (b) => b.processId === e.target.value && b.status === 'Active'
                  );
                  setSelectedBlockIds(newBlocks.map((b) => b.id));
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                {activeProcesses.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.name}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {selectedProcess.description}
              </span>
            </div>

            {/* Model Codename */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                2. Tên mã sản phẩm (Model Codename) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: ON1, S25 Ultra, A56, TAB9"
                value={modelCodename}
                onChange={(e) => setModelCodename(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 uppercase focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Mã dòng sản phẩm mới sẽ đi cùng Process tạo nên tên dự án.
              </span>
            </div>
          </div>

          {/* AUTO-GENERATED PROJECT NAME CALLOUT */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide">
                  Tên dự án được sinh tự động theo quy tắc hệ thống
                </span>
                <div className="text-xl font-black text-[#082D55] mt-0.5 font-mono">
                  {autoProjectName}
                </div>
                <span className="text-[11px] text-blue-700 mt-0.5 block">
                  Công thức: <code>[Process Code] ({selectedProcess.code}) + " " + [Model Codename] ({modelCodename.trim() || '...'})</code>
                </span>
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <span className="text-[10px] font-bold text-blue-800 bg-white/80 px-2.5 py-1 rounded-full border border-blue-200">
                Chuẩn hóa tự động
              </span>
            </div>
          </div>

          {/* Sub Process / Block Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              3. Chọn các Sub Process / Block áp dụng cho dự án ({processActiveBlocks.length} khả dụng){' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {processActiveBlocks.map((b) => {
                const isChecked = selectedBlockIds.includes(b.id);
                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      if (isChecked) {
                        setSelectedBlockIds(selectedBlockIds.filter((id) => id !== b.id));
                      } else {
                        setSelectedBlockIds([...selectedBlockIds, b.id]);
                      }
                    }}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                      isChecked
                        ? 'bg-blue-50/70 border-blue-400 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 opacity-75'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{b.name}</span>
                        <span className="text-[10px] bg-slate-200 px-1 py-0.2 rounded font-mono">
                          {b.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{b.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeframe */}
          <div className="pt-2">
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              4. Thời gian triển khai dự án <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Năm</span>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Tuần bắt đầu</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-400">W</span>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={startWeek}
                    onChange={(e) => setStartWeek(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Tuần kết thúc</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-400">W</span>
                  <input
                    type="number"
                    min={startWeek}
                    max={52}
                    value={endWeek}
                    onChange={(e) => setEndWeek(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
                  />
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-700 font-medium">
              Nhãn thời gian hiển thị: <strong>W{startWeek} – W{endWeek} ({year})</strong>
            </div>
          </div>

          {/* Step 1 Actions */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!modelCodename.trim()) {
                  alert('Vui lòng nhập Tên mã sản phẩm!');
                  return;
                }
                if (selectedBlockIds.length === 0) {
                  alert('Vui lòng chọn ít nhất 1 Sub Process / Block!');
                  return;
                }
                setCurrentStep(2);
              }}
              className="px-5 py-2 bg-[#0878E8] hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Tiếp tục: Phạm vi Nhà máy</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* STEP 2: PHẠM VI NHÀ MÁY (FACTORY SCOPE)                           */}
      {/* ================================================================= */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-extrabold text-[#082D55] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              BƯỚC 2: PHẠM VI NHÀ MÁY TRIỂN KHAI
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn các nhà máy tham gia sản xuất Model này từ danh mục Factory Master dùng chung của OOS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: 'SEV',
                name: 'SEV — Samsung Electronics Vietnam',
                location: 'KCN Yên Phong, Bắc Ninh',
                desc: 'Nhà máy cơ sở chính, năng lực gia công CNC và lắp ráp lớn nhất miền Bắc',
              },
              {
                id: 'SV1',
                name: 'SV1 — Samsung Electronics Thái Nguyên',
                location: 'KCN Phổ Yên, Thái Nguyên',
                desc: 'Tổ hợp công nghệ cao, chuyên gia công cơ khí chính xác và cụm màn hình lớn',
              },
            ].map((fac) => {
              const isSelected = selectedFactories.includes(fac.id as any);
              const isPrimary = primaryFactory === fac.id;

              return (
                <div
                  key={fac.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-400 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFactories([...selectedFactories, fac.id as any]);
                          } else {
                            if (selectedFactories.length <= 1) {
                              alert('Dự án phải có ít nhất 1 nhà máy tham gia!');
                              return;
                            }
                            setSelectedFactories(selectedFactories.filter((f) => f !== fac.id));
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="font-extrabold text-[#082D55] text-sm">{fac.name}</span>
                    </div>

                    {isSelected && (
                      <button
                        type="button"
                        onClick={() => setPrimaryFactory(fac.id as any)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                          isPrimary
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {isPrimary ? '★ Nhà máy chính' : 'Đặt làm chính'}
                      </button>
                    )}
                  </div>

                  <span className="text-[11px] text-blue-700 font-medium mt-1 block">
                    {fac.location}
                  </span>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{fac.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Step 2 Actions */}
          <div className="pt-4 border-t border-slate-200 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại Bước 1</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2 bg-[#0878E8] hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Tiếp tục: Khai báo Line & Vendor</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* STEP 3: KHAI BÁO LINE & VENDOR (AUTO-NAMING ENGINE)              */}
      {/* ================================================================= */}
      {currentStep === 3 && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#082D55] flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                BƯỚC 3: PHÂN BỔ PRODUCTION LINE & VENDOR
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Khai báo Vendor và số lượng chuyền sản xuất cho từng Block. Tên Line được sinh tự động theo quy tắc hệ thống.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddLineConfig}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm nhóm Line</span>
            </button>
          </div>

          {/* Config Groups */}
          <div className="space-y-3">
            {lineConfigs.map((cfg, idx) => (
              <div
                key={cfg.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-5 gap-3 items-center"
              >
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1 font-bold">
                    Nhà máy
                  </span>
                  <select
                    value={cfg.factory}
                    onChange={(e) => {
                      const updated = [...lineConfigs];
                      updated[idx].factory = e.target.value as any;
                      setLineConfigs(updated);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                  >
                    {selectedFactories.map((fac) => (
                      <option key={fac} value={fac}>
                        {fac}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1 font-bold">
                    Sub Process / Block
                  </span>
                  <select
                    value={cfg.blockId}
                    onChange={(e) => {
                      const targetBlock = allBlocks.find((b) => b.id === e.target.value);
                      const updated = [...lineConfigs];
                      updated[idx].blockId = e.target.value;
                      updated[idx].blockName = targetBlock ? targetBlock.code : 'Block 1';
                      setLineConfigs(updated);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                  >
                    {processActiveBlocks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.code} ({b.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1 font-bold">
                    Vendor thực hiện
                  </span>
                  <select
                    value={cfg.vendor}
                    onChange={(e) => {
                      const updated = [...lineConfigs];
                      updated[idx].vendor = e.target.value as any;
                      setLineConfigs(updated);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                  >
                    {AVAILABLE_VENDORS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1 font-bold">
                    Số lượng Line
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={cfg.lineCount}
                    onChange={(e) => {
                      const val = Math.max(1, Number(e.target.value));
                      const updated = [...lineConfigs];
                      updated[idx].lineCount = val;
                      setLineConfigs(updated);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                  />
                </div>

                <div className="flex items-center justify-end sm:pt-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveLineConfig(cfg.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Generated Lines Table Preview */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#082D55] uppercase">
                DANH SÁCH LINE ĐƯỢC TỰ ĐỘNG SINH ({generatedLines.length} LINES)
              </span>
              <span className="text-[11px] text-slate-500">
                Quy tắc: <code>[Dự án] [Block] [Vendor] Line [N]</code>
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Tên Line chuẩn</th>
                    <th className="py-2 px-3">Mã Line ngắn</th>
                    <th className="py-2 px-3">Nhà máy</th>
                    <th className="py-2 px-3">Block</th>
                    <th className="py-2 px-3">Vendor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {generatedLines.map((l) => (
                    <tr key={l.lineIndex} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 font-mono text-slate-400">{l.lineIndex}</td>
                      <td className="py-1.5 px-3 font-bold text-[#082D55]">{l.lineName}</td>
                      <td className="py-1.5 px-3 font-mono text-blue-700 bg-blue-50/50">
                        {l.lineCode}
                      </td>
                      <td className="py-1.5 px-3">{l.factory}</td>
                      <td className="py-1.5 px-3">{l.blockName}</td>
                      <td className="py-1.5 px-3 font-bold">{l.vendor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Step 3 Actions */}
          <div className="pt-4 border-t border-slate-200 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại Bước 2</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2 bg-[#0878E8] hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Tiếp tục: Tiêu chuẩn Thiết bị</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* STEP 4: TIÊU CHUẨN THIẾT BỊ (EQUIPMENT STANDARDS - 4 GROUPS)       */}
      {/* ================================================================= */}
      {currentStep === 4 && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
          <div className="border-b border-slate-200 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#082D55] flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-blue-600" />
                BƯỚC 4: KHAI BÁO DANH MỤC THIẾT BỊ TIÊU CHUẨN
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Khai báo theo 4 nhóm: JIG (Đồ gá), Machine (Máy), Master Sample (Mẫu chuẩn), Spare Part / MRO.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyStandardsToAllLines}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Sao chép tiêu chuẩn sang tất cả các Line</span>
            </button>
          </div>

          {/* Line Selector Tab Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-slate-500 shrink-0">Chọn Line cấu hình:</span>
            {generatedLines.map((l) => (
              <button
                key={l.lineIndex}
                type="button"
                onClick={() => setActiveLineIndexForStandard(l.lineIndex)}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                  activeLineIndexForStandard === l.lineIndex
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Line {l.lineIndex} ({l.vendor})
              </button>
            ))}
          </div>

          {/* Equipment Items Table for Active Line */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                THIẾT BỊ TIÊU CHUẨN CHO: <strong>{generatedLines.find((l) => l.lineIndex === activeLineIndexForStandard)?.lineName}</strong> ({currentLineEquipment.length} mục)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Mã thiết bị</th>
                    <th className="py-2 px-3">Tên thiết bị</th>
                    <th className="py-2 px-3">Phân nhóm</th>
                    <th className="py-2 px-3">Thông số kỹ thuật</th>
                    <th className="py-2 px-3 text-center">Số lượng</th>
                    <th className="py-2 px-3">Đơn vị</th>
                    <th className="py-2 px-3">Bắt buộc</th>
                    <th className="py-2 px-3 text-right">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentLineEquipment.map((eq) => (
                    <tr key={eq.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">{eq.code}</td>
                      <td className="py-2 px-3 font-bold text-slate-800">{eq.name}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            eq.category === 'JIG'
                              ? 'bg-blue-100 text-blue-800'
                              : eq.category === 'Machine'
                              ? 'bg-indigo-100 text-indigo-800'
                              : eq.category === 'Master Sample'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {eq.category}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500 max-w-xs truncate">{eq.specs}</td>
                      <td className="py-2 px-3 text-center font-bold tabular-nums">
                        {eq.standardQty}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{eq.unit}</td>
                      <td className="py-2 px-3">
                        {eq.isMandatory ? (
                          <span className="text-[10px] bg-red-50 text-red-700 font-bold px-1.5 py-0.5 rounded">
                            Bắt buộc
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            Tùy chọn
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveEquipment(eq.id)}
                          className="text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {currentLineEquipment.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400 italic">
                        Chưa có thiết bị nào. Hãy thêm thiết bị mới bên dưới.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Add Equipment Form */}
          <form
            onSubmit={handleAddEquipmentToCurrentLine}
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs"
          >
            <span className="font-bold text-slate-700 block">
              + Thêm thiết bị tiêu chuẩn mới vào Line hiện tại:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Mã thiết bị</span>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: JIG-002, MC-003"
                  value={newItemForm.code}
                  onChange={(e) => setNewItemForm({ ...newItemForm, code: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold uppercase"
                />
              </div>

              <div className="sm:col-span-2">
                <span className="text-[11px] text-slate-500 block mb-1">Tên thiết bị</span>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đồ gá phay nắp lưng Titan"
                  value={newItemForm.name}
                  onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Phân nhóm</span>
                <select
                  value={newItemForm.category}
                  onChange={(e) =>
                    setNewItemForm({ ...newItemForm, category: e.target.value as any })
                  }
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                >
                  <option value="JIG">JIG (Đồ gá)</option>
                  <option value="Machine">Machine (Máy chính)</option>
                  <option value="Master Sample">Master Sample (Mẫu chuẩn)</option>
                  <option value="Spare Part / MRO">Spare Part / MRO</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div className="sm:col-span-2">
                <span className="text-[11px] text-slate-500 block mb-1">Thông số kỹ thuật</span>
                <input
                  type="text"
                  placeholder="Độ chính xác, tiêu chuẩn kỹ thuật..."
                  value={newItemForm.specs}
                  onChange={(e) => setNewItemForm({ ...newItemForm, specs: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Số lượng</span>
                  <input
                    type="number"
                    min={1}
                    value={newItemForm.standardQty}
                    onChange={(e) =>
                      setNewItemForm({ ...newItemForm, standardQty: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Đơn vị</span>
                  <input
                    type="text"
                    value={newItemForm.unit}
                    onChange={(e) => setNewItemForm({ ...newItemForm, unit: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItemForm.isMandatory}
                    onChange={(e) =>
                      setNewItemForm({ ...newItemForm, isMandatory: e.target.checked })
                    }
                    className="rounded text-blue-600"
                  />
                  <span>Bắt buộc</span>
                </label>

                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#0878E8] hover:bg-blue-600 text-white rounded-lg font-bold cursor-pointer transition-all ml-auto"
                >
                  Thêm
                </button>
              </div>
            </div>
          </form>

          {/* Step 4 Actions */}
          <div className="pt-4 border-t border-slate-200 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại Bước 3</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="px-5 py-2 bg-[#0878E8] hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Tiếp tục: Kế hoạch Triển khai</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* STEP 5: KẾ HOẠCH TRIỂN KHAI (PURCHASE, RECEIVING, SETUP SCHEDULE)  */}
      {/* ================================================================= */}
      {currentStep === 5 && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
          <div className="border-b border-slate-200 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#082D55] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                BƯỚC 5: KẾ HOẠCH THỜI GIAN TRIỂN KHAI THEO LINE
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thiết lập thời gian cho 3 giai đoạn: Mua hàng, Nhận hàng (EQM), Setup & Chạy thử.
              </p>
            </div>

            <button
              type="button"
              onClick={handleApplyBatchSchedule}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Áp dụng lịch đồng bộ cho tất cả Line</span>
            </button>
          </div>

          {/* Batch Schedule Controls */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
            <span className="font-bold text-slate-700 block">
              Khung thời gian chuẩn hóa cho toàn dự án:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Purchase Stage */}
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-emerald-700 block mb-2 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  1. Mua hàng (Purchase)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={startWeek}
                    max={endWeek}
                    value={batchPurchaseWeeks.start}
                    onChange={(e) =>
                      setBatchPurchaseWeeks({
                        ...batchPurchaseWeeks,
                        start: Number(e.target.value),
                      })
                    }
                    className="w-16 px-2 py-1 border rounded text-center font-bold"
                  />
                  <span>đến</span>
                  <input
                    type="number"
                    min={batchPurchaseWeeks.start}
                    max={endWeek}
                    value={batchPurchaseWeeks.end}
                    onChange={(e) =>
                      setBatchPurchaseWeeks({
                        ...batchPurchaseWeeks,
                        end: Number(e.target.value),
                      })
                    }
                    className="w-16 px-2 py-1 border rounded text-center font-bold"
                  />
                </div>
              </div>

              {/* Receiving Stage */}
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-blue-700 block mb-2 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  2. Nhận hàng (EQM)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={startWeek}
                    max={endWeek}
                    value={batchReceivingWeeks.start}
                    onChange={(e) =>
                      setBatchReceivingWeeks({
                        ...batchReceivingWeeks,
                        start: Number(e.target.value),
                      })
                    }
                    className="w-16 px-2 py-1 border rounded text-center font-bold"
                  />
                  <span>đến</span>
                  <input
                    type="number"
                    min={batchReceivingWeeks.start}
                    max={endWeek}
                    value={batchReceivingWeeks.end}
                    onChange={(e) =>
                      setBatchReceivingWeeks({
                        ...batchReceivingWeeks,
                        end: Number(e.target.value),
                      })
                    }
                    className="w-16 px-2 py-1 border rounded text-center font-bold"
                  />
                </div>
              </div>

              {/* Setup Stage */}
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-amber-700 block mb-2 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  3. Setup & Chạy thử
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={startWeek}
                    max={endWeek}
                    value={batchSetupWeeks.start}
                    onChange={(e) =>
                      setBatchSetupWeeks({
                        ...batchSetupWeeks,
                        start: Number(e.target.value),
                      })
                    }
                    className="w-16 px-2 py-1 border rounded text-center font-bold"
                  />
                  <span>đến</span>
                  <input
                    type="number"
                    min={batchSetupWeeks.start}
                    max={endWeek}
                    value={batchSetupWeeks.end}
                    onChange={(e) =>
                      setBatchSetupWeeks({
                        ...batchSetupWeeks,
                        end: Number(e.target.value),
                      })
                    }
                    className="w-16 px-2 py-1 border rounded text-center font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Table Preview */}
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Tên Line</th>
                  <th className="py-2 px-3">Vendor</th>
                  <th className="py-2 px-3 text-emerald-700">Mua hàng</th>
                  <th className="py-2 px-3 text-blue-700">Nhận hàng</th>
                  <th className="py-2 px-3 text-amber-700">Setup</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {generatedLines.map((l) => {
                  const s = scheduleByLine[l.lineIndex] || {
                    purchaseStart: startWeek,
                    purchaseEnd: startWeek + 1,
                    receivingStart: startWeek + 2,
                    receivingEnd: startWeek + 2,
                    setupStart: startWeek + 3,
                    setupEnd: endWeek,
                  };
                  return (
                    <tr key={l.lineIndex} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 font-bold text-[#082D55]">{l.lineName}</td>
                      <td className="py-1.5 px-3">{l.vendor}</td>
                      <td className="py-1.5 px-3 font-medium">
                        W{s.purchaseStart} – W{s.purchaseEnd}
                      </td>
                      <td className="py-1.5 px-3 font-medium">
                        W{s.receivingStart} – W{s.receivingEnd}
                      </td>
                      <td className="py-1.5 px-3 font-medium">
                        W{s.setupStart} – W{s.setupEnd}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Step 5 Actions */}
          <div className="pt-4 border-t border-slate-200 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại Bước 4</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(6)}
              className="px-5 py-2 bg-[#0878E8] hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Tiếp tục: Tổng hợp & Tạo dự án</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* STEP 6: TỔNG HỢP & HOÀN TẤT TẠO DỰ ÁN (REVIEW & LAUNCH)          */}
      {/* ================================================================= */}
      {currentStep === 6 && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-extrabold text-[#082D55] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              BƯỚC 6: TỔNG HỢP VÀ PHÊ DUYỆT KHỞI TẠO DỰ ÁN
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kiểm tra lần cuối toàn bộ thông tin dự án trước khi lưu chính thức vào cơ sở dữ liệu OOS.
            </p>
          </div>

          {/* Summary Dashboard Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-[11px] text-blue-700 font-bold uppercase">Tên dự án</span>
              <div className="text-base font-black text-[#082D55] font-mono mt-0.5">
                {autoProjectName}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Quy trình</span>
              <div className="text-base font-black text-slate-800 mt-0.5">
                {selectedProcess.code} ({selectedProcess.name})
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Nhà máy</span>
              <div className="text-base font-black text-slate-800 mt-0.5">
                {selectedFactories.join(', ')} (Chính: {primaryFactory})
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Thời gian</span>
              <div className="text-base font-black text-slate-800 mt-0.5">
                W{startWeek} – W{endWeek} ({year})
              </div>
            </div>
          </div>

          {/* KPI Count Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="text-slate-500 font-bold">Tổng số Line:</span>
              <span className="text-lg font-black text-blue-600 tabular-nums">
                {generatedLines.length}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="text-slate-500 font-bold">Tổng số Block:</span>
              <span className="text-lg font-black text-slate-800 tabular-nums">
                {selectedBlockIds.length}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="text-slate-500 font-bold">Tổng số Vendor:</span>
              <span className="text-lg font-black text-slate-800 tabular-nums">
                {new Set(generatedLines.map((l) => l.vendor)).size}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="text-slate-500 font-bold">Thiết bị tiêu chuẩn:</span>
              <span className="text-lg font-black text-emerald-600 tabular-nums">
                {Object.values(equipmentListByLine).reduce((acc, curr) => acc + curr.length, 0)}
              </span>
            </div>
          </div>

          {/* Pre-flight Validation Checklist */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <span className="font-extrabold text-[#082D55] block">
              KIỂM TRA TÍNH TOÀN VẸN TRƯỚC KHI TẠO (PRE-FLIGHT VALIDATION):
            </span>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Quy trình Process "{selectedProcess.code}" đang hoạt động (Active) hợp lệ</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Tên dự án "{autoProjectName}" sinh tự động theo quy tắc chuẩn</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Đã cấu hình {generatedLines.length} Production Line với tên chuẩn</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Tiêu chuẩn thiết bị và thời gian triển khai đã được thiết lập</span>
              </div>

              {validationIssues.length > 0 && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 mt-2 space-y-1">
                  <span className="font-bold block flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Cần bổ sung các điểm sau:
                  </span>
                  {validationIssues.map((issue, idx) => (
                    <div key={idx} className="pl-5 text-[11px]">
                      • {issue}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Step 6 Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại Bước 5</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleFinalizeProject}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>TẠO DỰ ÁN & MỞ GANTT DASHBOARD</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

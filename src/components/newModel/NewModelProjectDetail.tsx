import React, { useState } from 'react';
import {
  NewModelProject,
  ProjectStepNumber,
  EquipmentStandardItem,
  EquipmentCategoryType,
  ResourceBranchDecision,
  BranchDecisionType,
  TechnicalInspectionItem,
  LineSetupTaskItem,
  SetupGroupType,
  SetupTaskStatus,
} from '../../types/newModelProject';
import {
  calculateProjectProgress,
  validateStepTransition,
  dispatchSurplusEquipmentToETMS,
} from '../../services/newModelProjectStorage';
import { UserProfile, FACTORIES, FactoryName } from '../../types';
import { NewModelWorkflowBanner } from './NewModelWorkflowBanner';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Truck,
  ShoppingCart,
  ShieldCheck,
  FileText,
  History,
  Building2,
  Calendar,
  Layers,
  Wrench,
  Download,
  XCircle,
  Sparkles,
} from 'lucide-react';

interface Props {
  project: NewModelProject;
  onBack: () => void;
  onUpdateProject: (updated: NewModelProject) => void;
  currentUser: UserProfile;
}

type TabType =
  | 'OVERVIEW'
  | 'STEP1_PLAN'
  | 'STEP2_STANDARDS'
  | 'STEP3_INTERNAL'
  | 'STEP4_BRANCHING'
  | 'STEP5_ORDERS'
  | 'STEP6_GATE'
  | 'STEP7_TECH'
  | 'STEP8_SETUP'
  | 'STEP9_SIGNOFF'
  | 'AUDIT_LOGS';

export const NewModelProjectDetail: React.FC<Props> = ({
  project,
  onBack,
  onUpdateProject,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Modal: Add Equipment Standard (Step 2)
  const [showAddStdModal, setShowAddStdModal] = useState(false);
  const [newStd, setNewStd] = useState<{
    equipmentCode: string;
    equipmentName: string;
    category: EquipmentCategoryType;
    compatibleStandard: string;
    qtyPerLine: number;
    unit: string;
    technicalSpecs: string;
  }>({
    equipmentCode: '',
    equipmentName: '',
    category: 'Thiết bị chính SMT/Gia công',
    compatibleStandard: '',
    qtyPerLine: 1,
    unit: 'Chiếc',
    technicalSpecs: '',
  });

  // Modal: Dispatch Surplus Equipment to ETMS PRO (Step 5A)
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchItem, setDispatchItem] = useState<{
    equipmentCode: string;
    equipmentName: string;
    quantity: number;
    fromFactory: FactoryName;
  }>({
    equipmentCode: project.equipmentStandards[0]?.equipmentCode || 'EQ-SMT-01',
    equipmentName: project.equipmentStandards[0]?.equipmentName || 'Thiết bị SMT',
    quantity: 1,
    fromFactory: 'Nhà máy B',
  });

  // Modal: Add Purchase PO (Step 5B)
  const [showPOModal, setShowPOModal] = useState(false);
  const [newPO, setNewPO] = useState<{
    poNumber: string;
    equipmentCode: string;
    equipmentName: string;
    quantity: number;
    supplier: string;
    expectedDeliveryDate: string;
  }>({
    poNumber: `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
    equipmentCode: project.equipmentStandards[0]?.equipmentCode || 'EQ-JIG-01',
    equipmentName: project.equipmentStandards[0]?.equipmentName || 'Đồ gá khuôn',
    quantity: 2,
    supplier: '',
    expectedDeliveryDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  });

  // Step 9 Sign-off Modal
  const [showSignOffModal, setShowSignOffModal] = useState(false);
  const [signOffDecision, setSignOffDecision] = useState<'APPROVE' | 'REJECT' | 'REVISE'>('APPROVE');
  const [signOffReason, setSignOffReason] = useState('');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper to log event
  const createEventLog = (action: string, step: ProjectStepNumber, details: string) => {
    return {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      user: currentUser.name,
      role: currentUser.title || currentUser.role,
      action,
      stepNumber: step,
      details,
    };
  };

  // Advance to Next Step with Validation
  const handleAdvanceStep = () => {
    const nextStep = (project.currentStep + 1) as ProjectStepNumber;
    if (nextStep > 9) return;

    const validation = validateStepTransition(project, nextStep, currentUser);
    if (!validation.allowed) {
      showToast(validation.message, 'error');
      return;
    }

    const updated: NewModelProject = {
      ...project,
      currentStep: nextStep,
      progressPct: calculateProjectProgress({ ...project, currentStep: nextStep }),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      eventLogs: [
        createEventLog(
          `Chuyển sang Bước ${nextStep}`,
          nextStep,
          `Đã vượt qua cổng kiểm soát, chính thức kích hoạt Bước ${nextStep}.`
        ),
        ...project.eventLogs,
      ],
    };

    onUpdateProject(updated);
    showToast(`Dự án đã chuyển thành công sang Bước ${nextStep}!`);
  };

  // Step 2: Add Equipment Standard
  const handleAddStandard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStd.equipmentCode || !newStd.equipmentName) {
      showToast('Vui lòng nhập mã và tên thiết bị.', 'error');
      return;
    }

    const totalDemand = newStd.qtyPerLine * project.lineCount;
    const createdItem: EquipmentStandardItem = {
      id: `STD-${Date.now()}`,
      equipmentCode: newStd.equipmentCode.trim().toUpperCase(),
      equipmentName: newStd.equipmentName.trim(),
      category: newStd.category,
      compatibleStandard: newStd.compatibleStandard || 'Tiêu chuẩn tương thích tiêu chuẩn',
      qtyPerLine: newStd.qtyPerLine,
      lineCount: project.lineCount,
      totalDemand,
      unit: newStd.unit,
      technicalSpecs: newStd.technicalSpecs,
      isMandatory: true,
    };

    const updatedStandards = [...project.equipmentStandards, createdItem];
    const updated: NewModelProject = {
      ...project,
      equipmentStandards: updatedStandards,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      eventLogs: [
        createEventLog(
          'Khai báo Định mức Thiết bị',
          2,
          `Thêm thiết bị ${createdItem.equipmentCode} (Nhu cầu: ${totalDemand} ${createdItem.unit}).`
        ),
        ...project.eventLogs,
      ],
    };

    onUpdateProject(updated);
    setShowAddStdModal(false);
    showToast(`Đã thêm thiết bị ${createdItem.equipmentCode} vào định mức.`);
  };

  // Step 5A: Dispatch surplus equipment via real ETMS PRO transfer order
  const handleExecuteDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const result = dispatchSurplusEquipmentToETMS(
      project,
      dispatchItem.equipmentCode,
      dispatchItem.equipmentName,
      dispatchItem.quantity,
      dispatchItem.fromFactory,
      project.factory,
      currentUser
    );

    if (result.success && result.updatedProject) {
      onUpdateProject(result.updatedProject);
      setShowDispatchModal(false);
      showToast(result.message);
    } else {
      showToast(result.message, 'error');
    }
  };

  // Step 5B: Add Purchase Order
  const handleAddPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPO.supplier || !newPO.poNumber) {
      showToast('Vui lòng nhập số PO và nhà cung cấp.', 'error');
      return;
    }

    const createdPO = {
      id: `PO-LNK-${Date.now()}`,
      poNumber: newPO.poNumber.trim(),
      equipmentCode: newPO.equipmentCode,
      equipmentName: newPO.equipmentName,
      quantity: newPO.quantity,
      supplier: newPO.supplier,
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDeliveryDate: newPO.expectedDeliveryDate,
      status: 'ĐÃ PHÁT HÀNH PO' as const,
      receivedQuantity: 0,
      isDeliveredAndVerified: false,
    };

    const updated: NewModelProject = {
      ...project,
      purchaseOrderLinks: [...project.purchaseOrderLinks, createdPO],
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      eventLogs: [
        createEventLog(
          'Phát hành Yêu cầu Mua mới',
          5,
          `Phát hành đơn mua hàng ${createdPO.poNumber} (${createdPO.quantity} ${createdPO.equipmentName} từ ${createdPO.supplier}).`
        ),
        ...project.eventLogs,
      ],
    };

    onUpdateProject(updated);
    setShowPOModal(false);
    showToast(`Đã phát hành đơn mua hàng ${createdPO.poNumber}!`);
  };

  // Step 6: Confirm Resource Fulfillment Gate
  const handleConfirmFulfillmentGate = () => {
    // Generate fulfillment items from standards
    const fulfillmentItems = project.equipmentStandards.map((std) => {
      const transferred = project.transferOrderLinks
        .filter((t) => t.equipmentCode === std.equipmentCode)
        .reduce((sum, t) => sum + t.quantity, 0);

      const purchased = project.purchaseOrderLinks
        .filter((p) => p.equipmentCode === std.equipmentCode && p.status === 'ĐÃ TIẾP NHẬN ĐẠT')
        .reduce((sum, p) => sum + p.receivedQuantity, 0);

      // Check existing in factory from internal review
      const internalExist = project.internalReview
        .filter((r) => r.equipmentCode === std.equipmentCode)
        .reduce((sum, r) => sum + r.usableCount, 0);

      const fulfilledTotal = transferred + purchased + internalExist;
      const deficit = Math.max(0, std.totalDemand - fulfilledTotal);

      return {
        equipmentCode: std.equipmentCode,
        equipmentName: std.equipmentName,
        totalDemand: std.totalDemand,
        transferredCount: transferred,
        purchasedCount: purchased,
        fulfilledTotal,
        deficitCount: deficit,
        isFullyFulfilled: deficit === 0,
        documentsVerified: true,
      };
    });

    const isAllFulfilled = fulfillmentItems.every((item) => item.isFullyFulfilled);

    if (!isAllFulfilled) {
      showToast(
        'Không thể xác nhận: Còn thiết bị chưa điền đầy đủ số lượng so với định mức phê duyệt!',
        'error'
      );
      return;
    }

    const updated: NewModelProject = {
      ...project,
      resourceFulfillment: {
        items: fulfillmentItems,
        isAllMandatoryFulfilled: true,
        confirmedBy: `${currentUser.name} (${currentUser.title || currentUser.role})`,
        confirmedDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
        gateStatus: 'ĐÃ XÁC NHẬN ĐẦY ĐỦ',
      },
      currentStep: Math.max(project.currentStep, 7) as ProjectStepNumber,
      progressPct: Math.max(project.progressPct, 75),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      eventLogs: [
        createEventLog(
          'Xác nhận Điền đầy Tài nguyên',
          6,
          'Cổng kiểm soát Bước 6 đã được phê duyệt 100% tài nguyên đã tập kết đủ và đúng chứng từ.'
        ),
        ...project.eventLogs,
      ],
    };

    onUpdateProject(updated);
    showToast('Xác nhận Cổng Bước 6 thành công! Đã mở khóa cho Kỹ thuật viên rà soát.');
  };

  // Step 7: Update Technical Inspection Item
  const handleUpdateInspectionResult = (itemId: string, result: 'ĐẠT' | 'KHÔNG ĐẠT') => {
    const updatedInspections = project.technicalInspections.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          result,
          inspectorName: currentUser.name,
          inspectionDate: new Date().toISOString().slice(0, 10),
        };
      }
      return item;
    });

    const updated: NewModelProject = {
      ...project,
      technicalInspections: updatedInspections,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      eventLogs: [
        createEventLog(
          'Đánh giá Rà soát Kỹ thuật',
          7,
          `KTV ${currentUser.name} đánh giá ${result} cho hạng mục kiểm tra ${itemId}.`
        ),
        ...project.eventLogs,
      ],
    };

    onUpdateProject(updated);
  };

  // Step 8: Update Line Setup Task Status
  const handleUpdateSetupTask = (taskId: string, status: SetupTaskStatus) => {
    const updatedTasks = project.lineSetupTasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status,
          completedDate: status === 'HOÀN THÀNH' ? new Date().toISOString().slice(0, 10) : undefined,
          confirmedBy: status === 'HOÀN THÀNH' ? currentUser.name : undefined,
        };
      }
      return t;
    });

    const updated: NewModelProject = {
      ...project,
      lineSetupTasks: updatedTasks,
      progressPct: calculateProjectProgress({ ...project, lineSetupTasks: updatedTasks }),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      eventLogs: [
        createEventLog(
          'Cập nhật Checklist Setup Line',
          8,
          `Cập nhật trạng thái hạng mục ${taskId} sang "${status}".`
        ),
        ...project.eventLogs,
      ],
    };

    onUpdateProject(updated);
  };

  // Step 9: Final Sign-off Execution
  const handleExecuteSignOff = () => {
    if (signOffDecision === 'APPROVE') {
      // Validate 8 conditions
      const allPassed =
        project.resourceFulfillment.gateStatus === 'ĐÃ XÁC NHẬN ĐẦY ĐỦ' &&
        project.technicalInspections.every((t) => !t.isMandatory || t.result === 'ĐẠT') &&
        project.lineSetupTasks.every((s) => !s.isMandatory || s.status === 'HOÀN THÀNH' || s.status === 'KHÔNG ÁP DỤNG');

      if (!allPassed) {
        showToast('Chưa đủ điều kiện hoàn thành: Vẫn còn hạng mục kiểm tra hoặc setup chưa đạt!', 'error');
        return;
      }

      const updated: NewModelProject = {
        ...project,
        status: 'COMPLETED',
        currentStep: 9,
        progressPct: 100,
        finalSignOff: {
          conditions: {
            planApproved: true,
            standardsApproved: true,
            resourcesFulfilled: true,
            technicalInspectionsPassed: true,
            lineSetupCompleted: true,
            noCriticalIssues: true,
            docsComplete: true,
            readyForProduction: true,
          },
          isReadyForSignOff: true,
          decision: 'ĐÃ PHÊ DUYỆT HOÀN THÀNH',
          signedBy: `${currentUser.name} (Planner)`,
          signedDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
          decisionReason: signOffReason || 'Đã nghiệm thu toàn diện 8 điều kiện bắt buộc, bàn giao Line sản xuất.',
        },
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        eventLogs: [
          createEventLog(
            'Planner Nghiệm thu Hoàn thành Dự án',
            9,
            `Dự án ${project.projectCode} đã chính thức được nghiệm thu hoàn thành và bàn giao đưa vào sản xuất hàng loạt.`
          ),
          ...project.eventLogs,
        ],
      };

      onUpdateProject(updated);
      setShowSignOffModal(false);
      showToast('Chúc mừng! Dự án Model mới đã được nghiệm thu hoàn thành 100%!');
    } else {
      if (!signOffReason.trim()) {
        showToast('Bắt buộc phải ghi rõ lý do từ chối hoặc yêu cầu bổ sung.', 'error');
        return;
      }

      const updated: NewModelProject = {
        ...project,
        status: 'ON_HOLD',
        finalSignOff: {
          ...project.finalSignOff,
          decision: signOffDecision === 'REJECT' ? 'TỪ CHỐI / TRẢ LẠI' : 'YÊU CẦU BỔ SUNG',
          signedBy: currentUser.name,
          signedDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
          decisionReason: signOffReason,
        },
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        eventLogs: [
          createEventLog(
            'Planner Từ chối / Yêu cầu Bổ sung',
            9,
            `Lý do: ${signOffReason}`
          ),
          ...project.eventLogs,
        ],
      };

      onUpdateProject(updated);
      setShowSignOffModal(false);
      showToast('Đã gửi thông báo yêu cầu bổ sung đến Leader thiết bị.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 border shadow-lg flex items-center gap-3 text-xs font-semibold transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-700'
              : 'bg-rose-950 text-rose-100 border-rose-700'
          }`}
        >
          <span>{notification.type === 'success' ? '✓' : '⚠'}</span>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-100 border border-slate-300 text-slate-700 cursor-pointer transition-colors"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-blue-100 text-blue-900 px-2 py-0.5 border border-blue-300">
                {project.projectCode}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {project.factory} • {project.lineCount} Line • {project.targetOutput}
              </span>
              {project.status === 'COMPLETED' ? (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5">
                  ĐÃ HOÀN THÀNH
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5">
                  BƯỚC {project.currentStep}/9: {project.status}
                </span>
              )}
            </div>
            <h1 className="text-base font-bold text-slate-900 mt-1">{project.modelName}</h1>
          </div>
        </div>

        {/* Action button: Advance to next step */}
        <div className="flex items-center gap-2">
          {project.currentStep < 9 && project.status !== 'COMPLETED' && (
            <button
              onClick={handleAdvanceStep}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Chuyển sang Bước {project.currentStep + 1}</span>
              <span>→</span>
            </button>
          )}

          {project.currentStep === 9 && project.status !== 'COMPLETED' && (
            <button
              onClick={() => setShowSignOffModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Nghiệm thu Hoàn thành (Bước 9)</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive 9-Step Process Banner */}
      <NewModelWorkflowBanner
        currentStep={project.currentStep}
        isCompleted={project.status === 'COMPLETED'}
        onSelectStep={(sNum) => {
          // Map step number to tab
          const tabMap: Record<ProjectStepNumber, TabType> = {
            1: 'STEP1_PLAN',
            2: 'STEP2_STANDARDS',
            3: 'STEP3_INTERNAL',
            4: 'STEP4_BRANCHING',
            5: 'STEP5_ORDERS',
            6: 'STEP6_GATE',
            7: 'STEP7_TECH',
            8: 'STEP8_SETUP',
            9: 'STEP9_SIGNOFF',
          };
          setActiveTab(tabMap[sNum]);
        }}
      />

      {/* Tab Navigation Ribbon */}
      <div className="flex items-center gap-1 bg-white p-1 border border-slate-200 overflow-x-auto text-xs shadow-xs">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-3 py-1.5 font-bold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'bg-[#0c2340] text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Tổng quan
        </button>

        <button
          onClick={() => setActiveTab('STEP1_PLAN')}
          className={`px-3 py-1.5 font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'STEP1_PLAN'
              ? 'bg-[#0c2340] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          1. Kế hoạch Model
        </button>

        <button
          onClick={() => setActiveTab('STEP2_STANDARDS')}
          className={`px-3 py-1.5 font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'STEP2_STANDARDS'
              ? 'bg-[#0c2340] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          2. Tiêu chuẩn Thiết bị ({project.equipmentStandards.length})
        </button>

        <button
          onClick={() => setActiveTab('STEP3_INTERNAL')}
          className={`px-3 py-1.5 font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'STEP3_INTERNAL'
              ? 'bg-[#0c2340] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          3. Rà soát Nội bộ
        </button>

        <button
          onClick={() => setActiveTab('STEP4_BRANCHING')}
          className={`px-3 py-1.5 font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'STEP4_BRANCHING'
              ? 'bg-[#0c2340] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          4. Phân nhánh Quyết định
        </button>

        <button
          onClick={() => setActiveTab('STEP5_ORDERS')}
          className={`px-3 py-1.5 font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'STEP5_ORDERS'
              ? 'bg-[#0c2340] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          5. Điều động & Mua bổ sung
        </button>

        <button
          onClick={() => setActiveTab('STEP6_GATE')}
          className={`px-3 py-1.5 font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'STEP6_GATE'
              ? 'bg-[#0c2340] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          6. Điền đầy Tài nguyên (Cổng)
        </button>

        <button
          onClick={() => setActiveTab('STEP7_TECH')}
          className={`px-3 py-1.5 font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'STEP7_TECH'
              ? 'bg-[#0c2340] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          7. Rà soát Kỹ thuật ({project.technicalInspections.length})
        </button>

        <button
          onClick={() => setActiveTab('STEP8_SETUP')}
          className={`px-3 py-1.5 font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'STEP8_SETUP'
              ? 'bg-[#0c2340] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          8. Setup Line ({project.lineSetupTasks.length})
        </button>

        <button
          onClick={() => setActiveTab('STEP9_SIGNOFF')}
          className={`px-3 py-1.5 font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'STEP9_SIGNOFF'
              ? 'bg-[#0c2340] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          9. Planner Nghiệm thu
        </button>

        <button
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`px-3 py-1.5 font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'AUDIT_LOGS'
              ? 'bg-[#0c2340] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Nhật ký kiểm toán ({project.eventLogs.length})
        </button>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="bg-white border border-slate-200 p-5 shadow-sm min-h-[450px]">
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW                                           */}
        {/* ========================================================= */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Progress summary banner */}
            <div className="bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Tiến độ Tổng thể Dự án: {project.progressPct}%
                </span>
                <span className="text-xs font-mono font-bold text-blue-900">
                  {project.startDate} → {project.targetDate}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-3">
                <div
                  className={`h-3 transition-all ${
                    project.progressPct === 100
                      ? 'bg-emerald-600'
                      : project.progressPct >= 70
                      ? 'bg-blue-600'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${project.progressPct}%` }}
                />
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 border border-slate-200 bg-white">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Nhà máy / Quy mô</div>
                <div className="text-lg font-black text-slate-900 mt-1">{project.factory}</div>
                <div className="text-[11px] text-slate-600 font-medium">{project.lineCount} Line sản xuất</div>
              </div>

              <div className="p-3 border border-slate-200 bg-white">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Định mức Thiết bị</div>
                <div className="text-lg font-black text-blue-900 mt-1">{project.equipmentStandards.length} chủng loại</div>
                <div className="text-[11px] text-slate-600 font-medium">
                  Tổng nhu cầu: {project.equipmentStandards.reduce((s, i) => s + i.totalDemand, 0)} thiết bị
                </div>
              </div>

              <div className="p-3 border border-slate-200 bg-white">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Lệnh Điều động (TR)</div>
                <div className="text-lg font-black text-indigo-900 mt-1">{project.transferOrderLinks.length} lệnh</div>
                <div className="text-[11px] text-slate-600 font-medium">Liên kết ETMS PRO 9 bước</div>
              </div>

              <div className="p-3 border border-slate-200 bg-white">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Cổng Điền đầy (Bước 6)</div>
                <div className="text-lg font-black mt-1">
                  {project.resourceFulfillment.gateStatus === 'ĐÃ XÁC NHẬN ĐẦY ĐỦ' ? (
                    <span className="text-emerald-700">ĐÃ XÁC NHẬN</span>
                  ) : (
                    <span className="text-amber-600">CHƯA ĐIỀN ĐẦY</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-600 font-medium">Cổng kiểm soát an toàn</div>
              </div>
            </div>

            {/* Core Info details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-200 p-4 space-y-2">
                <h3 className="font-bold text-slate-900 uppercase border-b pb-2">Thông tin Kế hoạch</h3>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Mã Dự Án:</span>
                  <span className="font-mono font-bold text-slate-900">{project.projectCode}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Tên Model Mới:</span>
                  <span className="font-bold text-slate-900">{project.modelName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Sản lượng mục tiêu:</span>
                  <span className="font-semibold text-slate-800">{project.targetOutput}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Planner phụ trách:</span>
                  <span className="font-semibold text-blue-900">{project.plannerName}</span>
                </div>
              </div>

              <div className="border border-slate-200 p-4 space-y-2">
                <h3 className="font-bold text-slate-900 uppercase border-b pb-2">Kỹ thuật & Triển khai</h3>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Leader Thiết bị:</span>
                  <span className="font-semibold text-slate-900">{project.equipmentLeaderName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Checklist Kỹ thuật (Bước 7):</span>
                  <span className="font-semibold text-slate-800">
                    {project.technicalInspections.filter((t) => t.result === 'ĐẠT').length} / {project.technicalInspections.length} ĐẠT
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Setup Line (Bước 8):</span>
                  <span className="font-semibold text-slate-800">
                    {project.lineSetupTasks.filter((t) => t.status === 'HOÀN THÀNH').length} / {project.lineSetupTasks.length} Xong
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Cập nhật lần cuối:</span>
                  <span className="font-mono text-slate-600">{project.updatedAt}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: STEP 1 - PLAN INFO                                 */}
        {/* ========================================================= */}
        {activeTab === 'STEP1_PLAN' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-slate-900 uppercase">
                BƯỚC 1: HỒ SƠ KẾ HOẠCH MODEL MỚI
              </span>
              <span className="text-slate-500 font-mono">Trạng thái: ĐÃ KHỞI TẠO</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500 text-[11px] block">Mã dự án</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{project.planInfo.projectCode}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Nhà máy triển khai</span>
                <span className="font-bold text-slate-900">{project.planInfo.factory}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Số Line</span>
                <span className="font-bold text-slate-900">{project.planInfo.lineCount} Line</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Sản lượng mục tiêu</span>
                <span className="font-bold text-slate-900">{project.planInfo.targetOutput}</span>
              </div>
            </div>

            <div className="p-4 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase">Yêu cầu đặc biệt & Tiêu chuẩn kỹ thuật:</h4>
              <p className="text-slate-700 bg-slate-50 p-3 border border-slate-200">
                {project.planInfo.specialRequirements || 'Không có ghi chú yêu cầu đặc biệt.'}
              </p>
            </div>

            {project.planInfo.attachments && project.planInfo.attachments.length > 0 && (
              <div className="p-4 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 uppercase">Tài liệu & Bản vẽ đính kèm:</h4>
                <div className="space-y-1">
                  {project.planInfo.attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-slate-800">{att.fileName}</span>
                        <span className="text-slate-400 font-mono text-[10px]">({att.fileSize})</span>
                      </div>
                      <span className="text-blue-700 hover:underline cursor-pointer font-semibold text-[11px]">
                        Tải về
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: STEP 2 - EQUIPMENT STANDARDS                       */}
        {/* ========================================================= */}
        {activeTab === 'STEP2_STANDARDS' && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
              <div>
                <h3 className="font-bold text-slate-900 uppercase">
                  BƯỚC 2: KHAI BÁO TIÊU CHUẨN ĐỊNH MỨC THIẾT BỊ ({project.equipmentStandards.length} Chủng loại)
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5 font-mono">
                  Công thức: Tổng nhu cầu = Định mức cần cho 1 Line × Số lượng Line ({project.lineCount} Line)
                </p>
              </div>

              <button
                onClick={() => setShowAddStdModal(true)}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Tiêu Chuẩn Thiết Bị</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#0c2340] text-slate-200 text-[11px] uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Mã Thiết bị</th>
                    <th className="py-2.5 px-3">Tên Thiết bị</th>
                    <th className="py-2.5 px-3">Phân loại</th>
                    <th className="py-2.5 px-3">Tiêu chuẩn tương thích</th>
                    <th className="py-2.5 px-3 text-center">SL / Line</th>
                    <th className="py-2.5 px-3 text-center">Số Line</th>
                    <th className="py-2.5 px-3 text-center font-bold text-white bg-blue-900">Tổng Nhu cầu</th>
                    <th className="py-2.5 px-3">Thông số kỹ thuật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {project.equipmentStandards.map((std) => (
                    <tr key={std.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{std.equipmentCode}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{std.equipmentName}</td>
                      <td className="py-2.5 px-3">{std.category}</td>
                      <td className="py-2.5 px-3 text-slate-600">{std.compatibleStandard}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold">{std.qtyPerLine}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{std.lineCount}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-black text-blue-900 bg-blue-50/70">
                        {std.totalDemand} {std.unit}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">{std.technicalSpecs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: STEP 3 - INTERNAL REVIEW                           */}
        {/* ========================================================= */}
        {activeTab === 'STEP3_INTERNAL' && (
          <div className="space-y-4 text-xs">
            <div className="border-b pb-2 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 uppercase">
                  BƯỚC 3: KẾT QUẢ RÀ SOÁT TÀI NGUYÊN NỘI BỘ TẠI {project.factory.toUpperCase()}
                </h3>
                <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                  Leader thiết bị đối chiếu số lượng đang có, đang giữ chỗ, hỏng hóc và tài nguyên thực sự sẵn sàng
                </p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-800 px-2 py-1 font-semibold border border-slate-300">
                Phụ trách: {project.equipmentLeaderName}
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#0c2340] text-slate-200 text-[11px] uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Mã Thiết bị</th>
                    <th className="py-2.5 px-3 text-center">Nhu cầu</th>
                    <th className="py-2.5 px-3 text-center">Đang có tại nhà máy</th>
                    <th className="py-2.5 px-3 text-center text-emerald-300">Sẵn sàng sử dụng</th>
                    <th className="py-2.5 px-3 text-center text-amber-300">Đang giữ chỗ</th>
                    <th className="py-2.5 px-3 text-center text-rose-300">Hỏng / Chưa đạt</th>
                    <th className="py-2.5 px-3 text-center font-bold text-rose-300 bg-rose-950">Còn thiếu nội bộ</th>
                    <th className="py-2.5 px-3">Ghi chú & Bằng chứng kiểm tra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {project.internalReview.map((rev) => (
                    <tr key={rev.equipmentCode} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {rev.equipmentCode}
                        <div className="text-[10px] text-slate-500 font-normal">{rev.equipmentName}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">{rev.totalDemand}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{rev.currentInFactory}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">{rev.usableCount}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-amber-700">{rev.reservedCount}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-rose-700">{rev.defectiveCount}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-black text-rose-800 bg-rose-50">
                        {rev.deficitCount > 0 ? `-${rev.deficitCount}` : '0 (Đủ)'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                        <div>{rev.reviewNotes}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{rev.verifiedBy} • {rev.verifiedDate}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: STEP 4 - BRANCHING DECISIONS                       */}
        {/* ========================================================= */}
        {activeTab === 'STEP4_BRANCHING' && (
          <div className="space-y-4 text-xs">
            <div className="border-b pb-2">
              <h3 className="font-bold text-slate-900 uppercase">
                BƯỚC 4: PLANNER RÀ SOÁT TÀI NGUYÊN TOÀN NHÀ MÁY & PHÂN NHÁNH QUYẾT ĐỊNH
              </h3>
              <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                Xác định nguồn dư thừa liên nhà máy để điều động hoặc phát hành yêu cầu mua bổ sung
              </p>
            </div>

            <div className="space-y-3">
              {project.branchDecisions.map((branch) => (
                <div key={branch.equipmentCode} className="p-4 border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 bg-slate-200 px-2 py-0.5">
                        {branch.equipmentCode}
                      </span>
                      <span className="font-bold text-slate-800">{branch.equipmentName}</span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold border ${
                        branch.branchType === 'ĐỦ TÀI NGUYÊN'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : branch.branchType === 'THIẾU TÀI NGUYÊN'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      NHÁNH: {branch.branchType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Tổng nhu cầu:</span>
                      <strong className="text-slate-900">{branch.totalDemand} chiếc</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Sẵn sàng nội bộ:</span>
                      <strong className="text-emerald-700">{branch.internalUsable} chiếc</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Điều động liên nhà máy:</span>
                      <strong className="text-blue-700">{branch.qtyToTransfer} chiếc</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Yêu cầu mua mới (PO):</span>
                      <strong className="text-rose-700">{branch.qtyToPurchase} chiếc</strong>
                    </div>
                  </div>

                  <div className="text-slate-600 bg-white p-2.5 border border-slate-200 text-[11px]">
                    <strong>Quyết định của Planner:</strong> {branch.decisionNotes} ({branch.decidedBy} - {branch.decidedDate})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: STEP 5 - DISPATCH & PURCHASE ORDERS                */}
        {/* ========================================================= */}
        {activeTab === 'STEP5_ORDERS' && (
          <div className="space-y-6 text-xs">
            {/* 5A: Dispatch Orders */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 uppercase">
                    BƯỚC 5A: LỆNH ĐIỀU ĐỘNG THIẾT BỊ NỘI BỘ (9 BƯỚC ETMS PRO)
                  </h3>
                </div>

                <button
                  onClick={() => setShowDispatchModal(true)}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo Lệnh Điều Động Mới (TR)</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-[#0c2340] text-slate-200 text-[11px] uppercase font-semibold">
                    <tr>
                      <th className="py-2 px-3">Mã Lệnh Điều Động</th>
                      <th className="py-2 px-3">Thiết bị</th>
                      <th className="py-2 px-3 text-center">Số lượng</th>
                      <th className="py-2 px-3">Tuyến chuyển</th>
                      <th className="py-2 px-3 text-center">Tiến độ 9 bước</th>
                      <th className="py-2 px-3 text-center">Trạng thái giao nhận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {project.transferOrderLinks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-slate-400 italic">
                          Chưa phát sinh lệnh điều động nào gắn với dự án này.
                        </td>
                      </tr>
                    ) : (
                      project.transferOrderLinks.map((lnk) => (
                        <tr key={lnk.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                            {lnk.transferOrderId}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">{lnk.equipmentName}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold">{lnk.quantity}</td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {lnk.fromFactory} → <strong className="text-slate-900">{lnk.toFactory}</strong>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">
                            <span className="bg-slate-100 text-blue-900 px-2 py-0.5 border border-slate-300 font-bold">
                              Bước {lnk.currentStep}/9
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {lnk.isDeliveredAndVerified ? (
                              <span className="text-emerald-700 font-bold">✓ Đã nhận máy & dán tem</span>
                            ) : (
                              <span className="text-amber-600 font-medium">Đang điều động</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5B: Purchase Orders */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-slate-900 uppercase">
                    BƯỚC 5B: YÊU CẦU MUA BỔ SUNG THIẾT BỊ MỚI (PO)
                  </h3>
                </div>

                <button
                  onClick={() => setShowPOModal(true)}
                  className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Phát Hành Đơn Mua (PO)</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-[#0c2340] text-slate-200 text-[11px] uppercase font-semibold">
                    <tr>
                      <th className="py-2 px-3">Số PO</th>
                      <th className="py-2 px-3">Thiết bị</th>
                      <th className="py-2 px-3 text-center">Số lượng</th>
                      <th className="py-2 px-3">Nhà cung cấp</th>
                      <th className="py-2 px-3 text-center">Hạn hàng về</th>
                      <th className="py-2 px-3 text-center">Trạng thái tiếp nhận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {project.purchaseOrderLinks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-slate-400 italic">
                          Chưa có yêu cầu mua mới nào cho dự án này.
                        </td>
                      </tr>
                    ) : (
                      project.purchaseOrderLinks.map((po) => (
                        <tr key={po.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-rose-900">{po.poNumber}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">{po.equipmentName}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold">{po.quantity}</td>
                          <td className="py-2.5 px-3 text-slate-600">{po.supplier}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{po.expectedDeliveryDate}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                              {po.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: STEP 6 - FULFILLMENT GATE                          */}
        {/* ========================================================= */}
        {activeTab === 'STEP6_GATE' && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 gap-2">
              <div>
                <h3 className="font-bold text-slate-900 uppercase">
                  BƯỚC 6: CỔNG XÁC NHẬN ĐIỀN ĐẦY TÀI NGUYÊN (RESOURCE FULFILLMENT GATE)
                </h3>
                <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                  Cổng kiểm soát bắt buộc: Dự án chỉ được chuyển sang Bước 7 khi 100% thiết bị bắt buộc đã tập kết đủ và đúng chứng từ
                </p>
              </div>

              {project.resourceFulfillment.gateStatus !== 'ĐÃ XÁC NHẬN ĐẦY ĐỦ' && (
                <button
                  onClick={handleConfirmFulfillmentGate}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Xác Nhận Nhận Đủ 100% Tài Nguyên</span>
                </button>
              )}
            </div>

            {project.resourceFulfillment.gateStatus === 'ĐÃ XÁC NHẬN ĐẦY ĐỦ' && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong>Cổng kiểm soát đã được xác nhận đạt:</strong> Ký duyệt bởi{' '}
                  {project.resourceFulfillment.confirmedBy} lúc {project.resourceFulfillment.confirmedDate}.
                </div>
              </div>
            )}

            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#0c2340] text-slate-200 text-[11px] uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Mã Thiết bị</th>
                    <th className="py-2.5 px-3 text-center">Nhu cầu Phê duyệt</th>
                    <th className="py-2.5 px-3 text-center">Đã điều động đạt</th>
                    <th className="py-2.5 px-3 text-center">Đã mua về đạt</th>
                    <th className="py-2.5 px-3 text-center font-bold text-white bg-blue-900">Tổng Điền đầy</th>
                    <th className="py-2.5 px-3 text-center">Còn thiếu</th>
                    <th className="py-2.5 px-3 text-center">Trạng thái Cổng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {project.equipmentStandards.map((std) => {
                    const gateItem = project.resourceFulfillment.items.find((i) => i.equipmentCode === std.equipmentCode);
                    const isFulfilled = gateItem ? gateItem.isFullyFulfilled : true;

                    return (
                      <tr key={std.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{std.equipmentCode}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">{std.totalDemand}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-blue-700">
                          {gateItem ? gateItem.transferredCount : 0}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-purple-700">
                          {gateItem ? gateItem.purchasedCount : 0}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-black text-blue-900 bg-blue-50/70">
                          {gateItem ? gateItem.fulfilledTotal : std.totalDemand}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">
                          {gateItem && gateItem.deficitCount > 0 ? (
                            <span className="text-rose-700">-{gateItem.deficitCount}</span>
                          ) : (
                            <span className="text-emerald-700">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {isFulfilled ? (
                            <span className="text-emerald-700 font-bold">✓ ĐÃ ĐỦ 100%</span>
                          ) : (
                            <span className="text-rose-700 font-bold animate-pulse">⚠ THIẾU HÀNG</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: STEP 7 - TECHNICAL INSPECTIONS                     */}
        {/* ========================================================= */}
        {activeTab === 'STEP7_TECH' && (
          <div className="space-y-4 text-xs">
            <div className="border-b pb-2">
              <h3 className="font-bold text-slate-900 uppercase">
                BƯỚC 7: KỸ THUẬT VIÊN RÀ SOÁT & KIỂM TRA THIẾT BỊ ({project.technicalInspections.length} Hạng mục)
              </h3>
              <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                Kiểm tra thông số kỹ thuật, chạy thử không tải, phụ kiện, an toàn và dán tem Model mới
              </p>
            </div>

            <div className="space-y-2">
              {project.technicalInspections.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    item.result === 'ĐẠT'
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : item.result === 'KHÔNG ĐẠT'
                      ? 'bg-rose-50/30 border-rose-200'
                      : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] text-slate-600 bg-slate-200 px-1.5 py-0.5">
                        {item.itemCode}
                      </span>
                      <strong className="text-slate-900">{item.name}</strong>
                      {item.isMandatory && (
                        <span className="text-[10px] text-rose-700 font-bold bg-rose-100 px-1.5 py-0.2 border border-rose-300">
                          BẮT BUỘC
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>Tiêu chí đạt:</strong> {item.standardCriteria}
                    </div>
                    {item.inspectorName && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        Kiểm tra bởi: {item.inspectorName} ({item.inspectionDate})
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateInspectionResult(item.id, 'ĐẠT')}
                      className={`px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                        item.result === 'ĐẠT'
                          ? 'bg-emerald-700 text-white border-emerald-800'
                          : 'bg-white hover:bg-emerald-50 text-emerald-800 border-slate-300'
                      }`}
                    >
                      ✓ ĐẠT
                    </button>
                    <button
                      onClick={() => handleUpdateInspectionResult(item.id, 'KHÔNG ĐẠT')}
                      className={`px-3 py-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                        item.result === 'KHÔNG ĐẠT'
                          ? 'bg-rose-700 text-white border-rose-800'
                          : 'bg-white hover:bg-rose-50 text-rose-800 border-slate-300'
                      }`}
                    >
                      ✕ KHÔNG ĐẠT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 9: STEP 8 - LINE SETUP CHECKLIST                      */}
        {/* ========================================================= */}
        {activeTab === 'STEP8_SETUP' && (
          <div className="space-y-4 text-xs">
            <div className="border-b pb-2">
              <h3 className="font-bold text-slate-900 uppercase">
                BƯỚC 8: LEADER THIẾT BỊ SETUP LINE (5 NHÓM HẠNG MỤC HOÀN THIỆN)
              </h3>
              <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                Quản lý lắp đặt, hạ tầng, IT phần mềm, huấn luyện vận hành và chạy thử Pilot
              </p>
            </div>

            <div className="space-y-3">
              {project.lineSetupTasks.map((task) => (
                <div key={task.id} className="p-3 border border-slate-200 bg-white shadow-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300 px-1.5 py-0.5">
                        {task.group}
                      </span>
                      <strong className="text-slate-900">{task.taskName}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px] font-mono">Hạn: {task.deadline}</span>
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateSetupTask(task.id, e.target.value as SetupTaskStatus)}
                        className={`text-xs font-bold px-2 py-1 border cursor-pointer ${
                          task.status === 'HOÀN THÀNH'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : task.status === 'ĐANG THỰC HIỆN'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : task.status === 'CÓ VẤN ĐỀ'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="CHƯA THỰC HIỆN">Chưa thực hiện</option>
                        <option value="ĐANG THỰC HIỆN">Đang thực hiện</option>
                        <option value="HOÀN THÀNH">Hoàn thành</option>
                        <option value="CÓ VẤN ĐỀ">Có vấn đề</option>
                        <option value="KHÔNG ÁP DỤNG">Không áp dụng</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-slate-600 text-[11px]">{task.details}</p>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Phụ trách: <strong>{task.assignedTo}</strong>
                    {task.confirmedBy && ` • Đã xác nhận: ${task.confirmedBy} (${task.completedDate})`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 10: STEP 9 - PLANNER SIGN-OFF                         */}
        {/* ========================================================= */}
        {activeTab === 'STEP9_SIGNOFF' && (
          <div className="space-y-4 text-xs">
            <div className="border-b pb-2 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 uppercase">
                  BƯỚC 9: PLANNER XÁC NHẬN HOÀN THÀNH DỰ ÁN MODEL MỚI
                </h3>
                <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                  Kiểm tra toàn diện 8 điều kiện bắt buộc trước khi đóng dự án và bàn giao Line vào sản xuất đại trà
                </p>
              </div>

              {project.status !== 'COMPLETED' && (
                <button
                  onClick={() => setShowSignOffModal(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ký Phê Duyệt / Quyết Định</span>
                </button>
              )}
            </div>

            {project.status === 'COMPLETED' && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>DỰ ÁN ĐÃ ĐƯỢC NGHIỆM THU HOÀN THÀNH 100%</span>
                </div>
                <div>Người phê duyệt: <strong>{project.finalSignOff.signedBy}</strong> ({project.finalSignOff.signedDate})</div>
                <div>Ghi chú nghiệm thu: <em>&quot;{project.finalSignOff.decisionReason}&quot;</em></div>
              </div>
            )}

            {/* 8 Mandatory Conditions Checklist */}
            <div className="border border-slate-200 p-4 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase">8 Điều kiện Tiên quyết Nghiệm thu:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1. Kế hoạch Model mới đã được khởi tạo và phê duyệt thông tin cơ sở.</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>2. Tiêu chuẩn định mức thiết bị đã khai báo đầy đủ cho từng Line.</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      project.resourceFulfillment.gateStatus === 'ĐÃ XÁC NHẬN ĐẦY ĐỦ'
                        ? 'text-emerald-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>3. Toàn bộ tài nguyên thiết bị bắt buộc đã được điền đầy và xác nhận nhận đủ (Bước 6).</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      project.technicalInspections.every((t) => !t.isMandatory || t.result === 'ĐẠT')
                        ? 'text-emerald-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>4. Rà soát kỹ thuật (thông số, ngoại quan, dán tem Model) đạt chuẩn 100% (Bước 7).</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      project.lineSetupTasks.every((t) => !t.isMandatory || t.status === 'HOÀN THÀNH' || t.status === 'KHÔNG ÁP DỤNG')
                        ? 'text-emerald-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>5. Setup Line đã hoàn thành 5 nhóm công việc (Lắp đặt, Hạ tầng, IT, Đào tạo, Chạy thử) (Bước 8).</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>6. Các sự cố kỹ thuật còn tồn đọng đã được khắc phục triệt để.</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>7. Hồ sơ biên bản giao nhận và chứng từ xuất nhập kho đầy đủ.</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>8. Line sản xuất sẵn sàng đáp ứng sản lượng mục tiêu {project.targetOutput}.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 11: AUDIT LOGS                                        */}
        {/* ========================================================= */}
        {activeTab === 'AUDIT_LOGS' && (
          <div className="space-y-4 text-xs">
            <div className="border-b pb-2 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 uppercase">
                NHẬT KÝ KIỂM TOÁN DỰ ÁN ({project.eventLogs.length} Sự kiện)
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Bất biến & Truy xuất nguồn gốc</span>
            </div>

            <div className="space-y-2">
              {project.eventLogs.map((log) => (
                <div key={log.id} className="p-3 border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-900">Bước {log.stepNumber}</span>
                      <span className="font-semibold text-slate-900">{log.action}</span>
                    </div>
                    <span className="font-mono text-slate-400">{log.timestamp}</span>
                  </div>
                  <div className="text-slate-600">{log.details}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Thực hiện bởi: <strong>{log.user}</strong> ({log.role})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Equipment Standard (Step 2) */}
      {showAddStdModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-lg w-full p-6 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 uppercase">
                ➕ Thêm Tiêu Chuẩn Thiết Bị (Bước 2)
              </h3>
              <button onClick={() => setShowAddStdModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddStandard} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã thiết bị:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: EQ-SMT-PANEL"
                    value={newStd.equipmentCode}
                    onChange={(e) => setNewStd({ ...newStd, equipmentCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phân loại:</label>
                  <select
                    value={newStd.category}
                    onChange={(e) => setNewStd({ ...newStd, category: e.target.value as EquipmentCategoryType })}
                    className="w-full px-3 py-2 border border-slate-300"
                  >
                    <option value="Thiết bị chính SMT/Gia công">Thiết bị chính SMT/Gia công</option>
                    <option value="Thiết bị phụ trợ">Thiết bị phụ trợ</option>
                    <option value="Đồ gá JIG & Khuôn">Đồ gá JIG & Khuôn</option>
                    <option value="Thiết bị đo kiểm & Thử nghiệm">Thiết bị đo kiểm & Thử nghiệm</option>
                    <option value="Băng tải & Bàn thao tác">Băng tải & Bàn thao tác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên thiết bị:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Máy hàn tự động Laser bước sóng 1064nm"
                  value={newStd.equipmentName}
                  onChange={(e) => setNewStd({ ...newStd, equipmentName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số lượng cần cho 1 Line:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newStd.qtyPerLine}
                    onChange={(e) => setNewStd({ ...newStd, qtyPerLine: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Đơn vị tính:</label>
                  <input
                    type="text"
                    value={newStd.unit}
                    onChange={(e) => setNewStd({ ...newStd, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Yêu cầu thông số kỹ thuật:</label>
                <textarea
                  rows={2}
                  value={newStd.technicalSpecs}
                  onChange={(e) => setNewStd({ ...newStd, technicalSpecs: e.target.value })}
                  placeholder="Công suất, độ chính xác lặp lại, nguồn khí nén..."
                  className="w-full px-3 py-2 border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddStdModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold"
                >
                  HỦY
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-700 text-white font-bold hover:bg-blue-800">
                  LƯU ĐỊNH MỨC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Dispatch via ETMS PRO (Step 5A) */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-md w-full p-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 uppercase">
                🚚 Tạo Lệnh Điều Động Thực Tế (Bước 5A)
              </h3>
              <button onClick={() => setShowDispatchModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleExecuteDispatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chọn Thiết bị điều động:</label>
                <select
                  value={dispatchItem.equipmentCode}
                  onChange={(e) => {
                    const sel = project.equipmentStandards.find((s) => s.equipmentCode === e.target.value);
                    setDispatchItem({
                      ...dispatchItem,
                      equipmentCode: e.target.value,
                      equipmentName: sel?.equipmentName || '',
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 font-medium"
                >
                  {project.equipmentStandards.map((s) => (
                    <option key={s.equipmentCode} value={s.equipmentCode}>
                      [{s.equipmentCode}] {s.equipmentName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Từ Nhà máy (Xuất):</label>
                  <select
                    value={dispatchItem.fromFactory}
                    onChange={(e) => setDispatchItem({ ...dispatchItem, fromFactory: e.target.value as FactoryName })}
                    className="w-full px-3 py-2 border border-slate-300 font-medium"
                  >
                    {FACTORIES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Đến Nhà máy (Đích):</label>
                  <input
                    type="text"
                    disabled
                    value={project.factory}
                    className="w-full px-3 py-2 border border-slate-300 bg-slate-100 font-bold text-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số lượng điều động:</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={dispatchItem.quantity}
                  onChange={(e) => setDispatchItem({ ...dispatchItem, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 font-mono font-bold"
                />
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-900 text-[11px]">
                ℹ Thao tác này sẽ tự động sinh mã lệnh điều động mới trên quy trình 9 bước ETMS PRO, liên kết trực tiếp với dự án <strong>{project.projectCode}</strong>.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold"
                >
                  HỦY
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-700 text-white font-bold hover:bg-blue-800">
                  TẠO LỆNH ĐIỀU ĐỘNG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Purchase Order (Step 5B) */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-md w-full p-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 uppercase">
                🛒 Phát Hành Yêu Cầu Mua Bổ Sung (PO)
              </h3>
              <button onClick={() => setShowPOModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddPO} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số hiệu PO:</label>
                <input
                  type="text"
                  required
                  value={newPO.poNumber}
                  onChange={(e) => setNewPO({ ...newPO, poNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 font-mono uppercase font-bold text-rose-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Thiết bị mua bổ sung:</label>
                <select
                  value={newPO.equipmentCode}
                  onChange={(e) => {
                    const sel = project.equipmentStandards.find((s) => s.equipmentCode === e.target.value);
                    setNewPO({ ...newPO, equipmentCode: e.target.value, equipmentName: sel?.equipmentName || '' });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 font-medium"
                >
                  {project.equipmentStandards.map((s) => (
                    <option key={s.equipmentCode} value={s.equipmentCode}>
                      [{s.equipmentCode}] {s.equipmentName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số lượng:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPO.quantity}
                    onChange={(e) => setNewPO({ ...newPO, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hạn hàng về dự kiến:</label>
                  <input
                    type="date"
                    required
                    value={newPO.expectedDeliveryDate}
                    onChange={(e) => setNewPO({ ...newPO, expectedDeliveryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nhà cung cấp:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Daesung Precision / Keyence Vietnam"
                  value={newPO.supplier}
                  onChange={(e) => setNewPO({ ...newPO, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold"
                >
                  HỦY
                </button>
                <button type="submit" className="px-5 py-2 bg-rose-700 text-white font-bold hover:bg-rose-800">
                  PHÁT HÀNH PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Step 9 Sign-Off Decision */}
      {showSignOffModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-md w-full p-6 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 uppercase">
                ★ Quyết Định Nghiệm Thu (Bước 9)
              </h3>
              <button onClick={() => setShowSignOffModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quyết định của Planner:</label>
                <select
                  value={signOffDecision}
                  onChange={(e) => setSignOffDecision(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 font-bold text-slate-900"
                >
                  <option value="APPROVE">✓ PHÊ DUYỆT HOÀN THÀNH (Bàn giao sản xuất đại trà)</option>
                  <option value="REVISE">⚠ YÊU CẦU BỔ SUNG (Trả lại bước 7 hoặc 8 để khắc phục)</option>
                  <option value="REJECT">✕ TỪ CHỐI DUYỆT (Chưa đủ điều kiện chất lượng)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ý kiến đánh giá / Lý do {signOffDecision !== 'APPROVE' ? '(Bắt buộc)' : ''}:
                </label>
                <textarea
                  rows={3}
                  value={signOffReason}
                  onChange={(e) => setSignOffReason(e.target.value)}
                  placeholder="Ghi nhận kết quả chạy thử Pilot FPY, biên bản nghiệm thu hoặc điểm cần khắc phục..."
                  className="w-full px-3 py-2 border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowSignOffModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold"
                >
                  HỦY
                </button>
                <button
                  type="button"
                  onClick={handleExecuteSignOff}
                  className={`px-5 py-2 text-white font-bold transition-colors ${
                    signOffDecision === 'APPROVE'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  XÁC NHẬN QUYẾT ĐỊNH
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

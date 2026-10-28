// ETMS PRO — New Model Project Storage & Business Engine
import {
  NewModelProject,
  ProjectStepNumber,
  ProjectStatus,
  NewModelProjectKPIs,
} from '../types/newModelProject';
import { INITIAL_NEW_MODEL_PROJECTS } from '../data/mockNewModelProjects';
import { UserProfile, TransferOrder } from '../types';
import { getStoredOrders, saveStoredOrders } from './storage';

const STORAGE_KEY = 'etms_new_model_projects_v1';

// -------------------------------------------------------------
// 1. LOCAL STORAGE ACCESSORS
// -------------------------------------------------------------
export const getStoredNewModelProjects = (): NewModelProject[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NEW_MODEL_PROJECTS));
    return INITIAL_NEW_MODEL_PROJECTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_NEW_MODEL_PROJECTS;
  }
};

export const saveStoredNewModelProjects = (projects: NewModelProject[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const resetNewModelProjectsToSample = (): NewModelProject[] => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NEW_MODEL_PROJECTS));
  return INITIAL_NEW_MODEL_PROJECTS;
};

export const addStoredNewModelProject = (project: NewModelProject): void => {
  const current = getStoredNewModelProjects();
  const updated = [project, ...current];
  saveStoredNewModelProjects(updated);
};

export const updateStoredNewModelProject = (project: NewModelProject): void => {
  const current = getStoredNewModelProjects();
  const index = current.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    current[index] = project;
    saveStoredNewModelProjects([...current]);
  } else {
    saveStoredNewModelProjects([project, ...current]);
  }
};

export const deleteStoredNewModelProject = (id: string): void => {
  const current = getStoredNewModelProjects();
  const filtered = current.filter((p) => p.id !== id);
  saveStoredNewModelProjects(filtered);
};

// -------------------------------------------------------------
// 2. MILESTONE PROGRESS CALCULATION
// -------------------------------------------------------------
export const calculateProjectProgress = (project: NewModelProject): number => {
  if (project.status === 'COMPLETED' || project.currentStep === 9) {
    if (project.finalSignOff.decision === 'ĐÃ PHÊ DUYỆT HOÀN THÀNH') return 100;
  }

  // Weightings across the 9 gates:
  // Step 1: 10%
  // Step 2: 20%
  // Step 3: 30%
  // Step 4: 45%
  // Step 5: 60%
  // Step 6: 75%
  // Step 7: 85%
  // Step 8: 95%
  // Step 9: 100%
  const stepBase: Record<ProjectStepNumber, number> = {
    1: 10,
    2: 20,
    3: 30,
    4: 45,
    5: 60,
    6: 75,
    7: 85,
    8: 92,
    9: 98,
  };

  let progress = stepBase[project.currentStep] || 10;

  // Additional credit for in-step completion
  if (project.currentStep === 8 && project.lineSetupTasks.length > 0) {
    const doneTasks = project.lineSetupTasks.filter(
      (t) => t.status === 'HOÀN THÀNH' || t.status === 'KHÔNG ÁP DỤNG'
    ).length;
    const taskPct = (doneTasks / project.lineSetupTasks.length) * 6;
    progress = Math.min(98, Math.round(92 + taskPct));
  } else if (project.currentStep === 7 && project.technicalInspections.length > 0) {
    const doneInsp = project.technicalInspections.filter((i) => i.result === 'ĐẠT').length;
    const inspPct = (doneInsp / project.technicalInspections.length) * 7;
    progress = Math.min(85, Math.round(78 + inspPct));
  }

  return progress;
};

// -------------------------------------------------------------
// 3. GATE ADVANCE VALIDATION ENGINE
// -------------------------------------------------------------
export const validateStepTransition = (
  project: NewModelProject,
  targetStep: ProjectStepNumber,
  currentUser: UserProfile
): { allowed: boolean; message: string } => {
  // Step 1 -> 2: Must have plan info
  if (targetStep === 2) {
    if (!project.planInfo.modelName || !project.planInfo.factory) {
      return { allowed: false, message: 'Kế hoạch Model mới chưa đầy đủ thông tin bắt buộc.' };
    }
  }

  // Step 2 -> 3: Must have at least 1 declared equipment standard
  if (targetStep === 3) {
    if (project.equipmentStandards.length === 0) {
      return { allowed: false, message: 'Planner chưa khai báo danh mục định mức tiêu chuẩn thiết bị.' };
    }
  }

  // Step 3 -> 4: Leader must have reviewed internal resources
  if (targetStep === 4) {
    if (project.internalReview.length === 0) {
      return { allowed: false, message: 'Leader thiết bị chưa hoàn tất rà soát tài nguyên nội bộ.' };
    }
  }

  // Step 4 -> 5: Planner must have made branch decision
  if (targetStep === 5) {
    if (project.branchDecisions.length === 0 && project.internalReview.some((r) => r.deficitCount > 0)) {
      return { allowed: false, message: 'Planner chưa quyết định phân nhánh điều động hoặc mua bổ sung.' };
    }
  }

  // Step 5 -> 6: Dispatch / Purchase must have records
  if (targetStep === 6) {
    // Allowed to enter step 6 to check fulfillment
  }

  // Step 6 -> 7: STRICT GATEKEEPING: Cannot enter technical inspection unless 100% fulfilled!
  if (targetStep === 7) {
    const isGateSigned = project.resourceFulfillment.gateStatus === 'ĐÃ XÁC NHẬN ĐẦY ĐỦ';
    if (!isGateSigned) {
      return {
        allowed: false,
        message: 'CỔNG KIỂM SOÁT BƯỚC 6 CHƯA ĐẠT: Toàn bộ thiết bị bắt buộc phải được xác nhận nhận đủ và ký duyệt trước khi chuyển sang rà soát kỹ thuật.',
      };
    }
  }

  // Step 7 -> 8: All mandatory technical inspections must be 'ĐẠT'
  if (targetStep === 8) {
    const hasUnchecked = project.technicalInspections.some(
      (t) => t.isMandatory && t.result !== 'ĐẠT'
    );
    if (hasUnchecked) {
      return {
        allowed: false,
        message: 'CỔNG BƯỚC 7 CHƯA ĐẠT: Còn hạng mục rà soát kỹ thuật bắt buộc chưa đạt hoặc chưa kiểm tra.',
      };
    }
  }

  // Step 8 -> 9: Line Setup mandatory tasks must be complete
  if (targetStep === 9) {
    const hasPendingSetup = project.lineSetupTasks.some(
      (t) => t.isMandatory && t.status !== 'HOÀN THÀNH' && t.status !== 'KHÔNG ÁP DỤNG'
    );
    if (hasPendingSetup) {
      return {
        allowed: false,
        message: 'CỔNG BƯỚC 8 CHƯA ĐẠT: Còn hạng mục Setup Line bắt buộc chưa hoàn thành.',
      };
    }
  }

  return { allowed: true, message: 'Đủ điều kiện chuyển bước nghiệp vụ.' };
};

// -------------------------------------------------------------
// 4. STEP 5A: INTEGRATION WITH REAL ETMS PRO TRANSFER ORDERS
// -------------------------------------------------------------
export const dispatchSurplusEquipmentToETMS = (
  project: NewModelProject,
  equipmentCode: string,
  equipmentName: string,
  quantity: number,
  fromFactory: 'Nhà máy A' | 'Nhà máy B' | 'Nhà máy C',
  toFactory: 'Nhà máy A' | 'Nhà máy B' | 'Nhà máy C',
  currentUser: UserProfile
): { success: boolean; message: string; transferOrderId?: string; updatedProject?: NewModelProject } => {
  try {
    const existingOrders = getStoredOrders();
    const newOrderId = `TR-MDL-${Date.now().toString().slice(-4)}`;

    const newTransferOrder: TransferOrder = {
      id: newOrderId,
      createdDate: new Date().toISOString().slice(0, 10),
      expectedDate: project.targetDate,
      fromFactory,
      toFactory,
      reason: `Điều động phục vụ Dự án Model mới ${project.modelName} (${project.projectCode})`,
      plannerName: currentUser.name,
      status: 'WAITING_CONFIRMATION',
      currentStep: 2,
      isOverdue: false,
      version: 1,
      plannedItems: [
        {
          id: `PL-${Date.now()}`,
          assetCode: equipmentCode,
          name: equipmentName,
          quantity,
          note: `Dự án Model mới: ${project.projectCode}`,
        },
      ],
      confirmations: {
        factoryA: { confirmed: false, signerName: '', signedDate: null },
        factoryB: { confirmed: false, signerName: '', signedDate: null },
      },
      registeredItems: [
        {
          id: `REG-${Date.now()}`,
          assetCode: equipmentCode,
          name: equipmentName,
          serial: `SN-${equipmentCode}-${Date.now().toString().slice(-4)}`,
          quantity,
          condition: 'Tốt',
          image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
        },
      ],
      transitDetails: {
        carrierName: 'Vận tải Nội bộ Tập đoàn',
        licensePlate: '29C-999.88',
        driverName: 'Nguyễn Văn Vận Tải',
        driverPhone: '0988.111.222',
        departureTime: '',
        sealNumber: '',
        status: 'Chưa khởi hành',
      },
      deliveryDoc: {
        deliveryDate: project.targetDate,
        docNumber: `BBGN-${newOrderId.replace('TR-', '')}`,
        files: [],
        shipmentImages: [],
      },
      receiptVerification: {
        items: [
          {
            id: `RV-${Date.now()}`,
            assetCode: equipmentCode,
            serial: `SN-${equipmentCode}`,
            quantity,
            condition: 'Tốt',
            matchResult: 'Đủ',
          },
        ],
        hasDiscrepancy: false,
        note: '',
        verifiedDate: null,
        verifiedBy: null,
      },
      bookTransfer: {
        eligible: false,
        transferDate: null,
        transferredBy: null,
        referenceDocNumber: '',
        note: '',
        completed: false,
      },
      qrPrinting: {
        items: [
          {
            newAssetCode: `${toFactory === 'Nhà máy B' ? 'B' : 'C'}-${equipmentCode}`,
            oldAssetCode: equipmentCode,
            name: equipmentName,
            qrPayload: `ETMS|${equipmentCode}|${newOrderId}`,
            printed: false,
          },
        ],
        printedDate: null,
        printedBy: null,
        completed: false,
      },
      stickerConfirmation: {
        items: [],
        note: '',
        completed: false,
        completedDate: null,
        completedBy: null,
      },
    };

    // Save to real ETMS PRO orders
    const updatedOrders = [newTransferOrder, ...existingOrders];
    saveStoredOrders(updatedOrders);

    // Link into project
    const newLink = {
      id: `LNK-${Date.now()}`,
      transferOrderId: newOrderId,
      equipmentCode,
      equipmentName,
      quantity,
      fromFactory,
      toFactory,
      orderStatus: 'WAITING_CONFIRMATION',
      currentStep: 2,
      dispatchedDate: new Date().toISOString().slice(0, 10),
      isDeliveredAndVerified: false,
    };

    const updatedProject: NewModelProject = {
      ...project,
      transferOrderLinks: [...project.transferOrderLinks, newLink],
      eventLogs: [
        {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          user: currentUser.name,
          role: currentUser.title || currentUser.role,
          action: 'Tạo Lệnh Điều Động 9 Bước',
          stepNumber: 5,
          details: `Đã khởi tạo lệnh điều động thực tế ${newOrderId} trên hệ thống ETMS PRO (${quantity} ${equipmentName} từ ${fromFactory} sang ${toFactory}).`,
        },
        ...project.eventLogs,
      ],
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    return {
      success: true,
      message: `Đã tạo lệnh điều động thực tế ${newOrderId} liên kết thành công vào quy trình ETMS PRO 9 bước!`,
      transferOrderId: newOrderId,
      updatedProject,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Lỗi khi tạo lệnh điều động: ${err.message || 'Không xác định'}`,
    };
  }
};

// -------------------------------------------------------------
// 5. KPI SUMMARY ENGINE
// -------------------------------------------------------------
export const calculateNewModelKPIs = (projects: NewModelProject[]): NewModelProjectKPIs => {
  const totalProjects = projects.length;
  const inPlanningCount = projects.filter((p) => p.currentStep <= 4 && p.status !== 'CANCELLED').length;
  const fulfillingResourcesCount = projects.filter(
    (p) => (p.currentStep === 5 || p.currentStep === 6) && p.status !== 'CANCELLED'
  ).length;
  const technicalInspectionCount = projects.filter(
    (p) => p.currentStep === 7 && p.status !== 'CANCELLED'
  ).length;
  const lineSetupCount = projects.filter(
    (p) => p.currentStep === 8 && p.status !== 'CANCELLED'
  ).length;
  const waitingPlannerSignOffCount = projects.filter(
    (p) => p.currentStep === 9 && p.status !== 'COMPLETED' && p.status !== 'CANCELLED'
  ).length;
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length;
  const onHoldOrIssueCount = projects.filter(
    (p) => p.status === 'ON_HOLD' || p.hasIssues || p.isOverdue
  ).length;

  const onTrackRatePct =
    totalProjects > 0
      ? Math.round(((totalProjects - onHoldOrIssueCount) / totalProjects) * 100)
      : 100;

  return {
    totalProjects,
    inPlanningCount,
    fulfillingResourcesCount,
    technicalInspectionCount,
    lineSetupCount,
    waitingPlannerSignOffCount,
    completedCount,
    onHoldOrIssueCount,
    onTrackRatePct,
  };
};

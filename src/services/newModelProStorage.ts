// OOS NEW MODEL PRO — LocalStorage Service & Business Engine
import {
  NewModelProjectPro,
  ProjectLinePro,
  EquipmentItemPro,
  EquipmentIssuePro,
  ItemInspectionStatus,
  IssueStatus,
} from '../types/newModelPro';
import { INITIAL_NEW_MODEL_PROJECT } from '../data/mockNewModelProData';

const STORAGE_KEY_PRO = 'oos_new_model_pro_project_v2';
const STORAGE_KEY_ALL_PRO = 'oos_new_model_pro_all_projects_v2';

export const getStoredNewModelProProject = (): NewModelProjectPro => {
  const raw = localStorage.getItem(STORAGE_KEY_PRO);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_PRO, JSON.stringify(INITIAL_NEW_MODEL_PROJECT));
    return INITIAL_NEW_MODEL_PROJECT;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_NEW_MODEL_PROJECT;
  }
};

export const saveStoredNewModelProProject = (project: NewModelProjectPro): void => {
  localStorage.setItem(STORAGE_KEY_PRO, JSON.stringify(project));
};

export const resetNewModelProToSample = (): NewModelProjectPro => {
  localStorage.setItem(STORAGE_KEY_PRO, JSON.stringify(INITIAL_NEW_MODEL_PROJECT));
  return INITIAL_NEW_MODEL_PROJECT;
};

// Re-calculate Line Progress & Status
export const recalculateLineMetrics = (line: ProjectLinePro): ProjectLinePro => {
  const purchasePct = line.purchaseStage.actualProgressPct || 0;
  const receivingPct = line.receivingStage.actualProgressPct || 0;
  const setupPct = line.setupStage.actualProgressPct || 0;

  // Weighted average: Mua hàng 30%, Nhận hàng 35%, Setup 35%
  const overall = Math.round(purchasePct * 0.3 + receivingPct * 0.35 + setupPct * 0.35);

  let status = line.status;
  if (line.receivingStage.isOverdue || line.purchaseStage.isOverdue) {
    status = 'Nguy cơ trễ';
  } else if (setupPct >= 100) {
    status = 'Hoàn tất';
  } else if (purchasePct === 0 && receivingPct === 0) {
    status = 'Chờ mua hàng';
  } else {
    status = 'Đúng tiến độ';
  }

  return {
    ...line,
    overallProgressPct: overall,
    status,
  };
};

// Update an Equipment Item status (OK or Pending)
export const updateEquipmentItemStatus = (
  project: NewModelProjectPro,
  lineId: string,
  itemId: string,
  newStatus: ItemInspectionStatus,
  pendingReason: string | undefined,
  photoUrl: string | undefined,
  expectedResolutionDate: string | undefined,
  updatedBy: string
): NewModelProjectPro => {
  let itemUpdatedName = '';
  let itemUpdatedCode = '';
  let lineCode = '';
  let lineVendor: any = 'DAAL';
  let lineBlock = '';
  let targetFactory = '';

  const updatedFactories = project.factoriesScope.map((fScope) => {
    const updatedBlocks = fScope.blocks.map((block) => {
      const updatedLines = block.lines.map((line) => {
        if (line.id === lineId) {
          lineCode = line.code;
          lineVendor = line.vendor;
          lineBlock = block.name;
          targetFactory = fScope.factory;

          const updatedItems = line.equipmentItems.map((item) => {
            if (item.id === itemId) {
              itemUpdatedName = item.name;
              itemUpdatedCode = item.code;
              return {
                ...item,
                status: newStatus,
                pendingReason: newStatus === 'Pending' ? pendingReason : undefined,
                photoUrl: newStatus === 'Pending' ? photoUrl || item.photoUrl : undefined,
                expectedResolutionDate:
                  newStatus === 'Pending' ? expectedResolutionDate : undefined,
                checkedBy: updatedBy,
                checkedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              };
            }
            return item;
          });

          // Check if any item pending -> affect receiving or setup
          const hasPending = updatedItems.some((i) => i.status === 'Pending');
          const recProgress = hasPending ? Math.min(line.receivingStage.actualProgressPct, 30) : line.receivingStage.actualProgressPct;

          const modifiedLine = {
            ...line,
            equipmentItems: updatedItems,
            receivingStage: {
              ...line.receivingStage,
              actualProgressPct: recProgress,
            },
          };

          return recalculateLineMetrics(modifiedLine);
        }
        return line;
      });
      return { ...block, lines: updatedLines };
    });
    return { ...fScope, blocks: updatedBlocks };
  });

  // If status is Pending, create or update an Issue automatically in EquipmentIssuePro
  let updatedIssues = [...project.issues];
  if (newStatus === 'Pending' && pendingReason) {
    const existingIssueIndex = updatedIssues.findIndex(
      (iss) => iss.lineId === lineId && iss.equipmentId === itemId
    );
    if (existingIssueIndex >= 0) {
      updatedIssues[existingIssueIndex] = {
        ...updatedIssues[existingIssueIndex],
        description: pendingReason,
        status: 'ĐANG_XỬ_LÝ',
        photoUrl: photoUrl || updatedIssues[existingIssueIndex].photoUrl,
        dueDate: expectedResolutionDate || updatedIssues[existingIssueIndex].dueDate,
        history: [
          ...updatedIssues[existingIssueIndex].history,
          {
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            action: 'Cập nhật lý do Pending',
            user: updatedBy,
            note: pendingReason,
          },
        ],
      };
    } else {
      const newIssue: EquipmentIssuePro = {
        id: `ISS-${Date.now().toString().slice(-4)}`,
        projectId: project.id,
        projectName: project.projectCode,
        factory: targetFactory || 'SEV',
        blockName: lineBlock || 'Block 1',
        vendor: lineVendor,
        lineId,
        lineCode,
        equipmentId: itemId,
        equipmentCode: itemUpdatedCode,
        equipmentName: itemUpdatedName,
        category: 'JIG',
        title: `Sự cố thiết bị: ${itemUpdatedCode}`,
        description: pendingReason,
        severity: 'TRUNG BÌNH',
        assignedTo: `${lineVendor} Tech Team`,
        reportedBy: updatedBy,
        reportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        dueDate: expectedResolutionDate || '2026-11-20',
        photoUrl,
        status: 'ĐANG_XỬ_LÝ',
        history: [
          {
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            action: 'Phát sinh sự cố từ kiểm tra kỹ thuật',
            user: updatedBy,
            note: pendingReason,
          },
        ],
      };
      updatedIssues = [newIssue, ...updatedIssues];
    }
  }

  const updatedProject: NewModelProjectPro = {
    ...project,
    factoriesScope: updatedFactories,
    issues: updatedIssues,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  saveStoredNewModelProProject(updatedProject);
  return updatedProject;
};

// Update Issue Status in Equipment Issue Control Center (with Verification gate)
export const updateEquipmentIssueStatus = (
  project: NewModelProjectPro,
  issueId: string,
  newStatus: IssueStatus,
  user: string,
  role: string,
  note?: string
): NewModelProjectPro => {
  const updatedIssues = project.issues.map((iss) => {
    if (iss.id === issueId) {
      const updatedHistory = [
        ...iss.history,
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          action: `Chuyển trạng thái sang: ${newStatus}`,
          user: `${user} (${role})`,
          note,
        },
      ];

      return {
        ...iss,
        status: newStatus,
        history: updatedHistory,
        resolvedAt:
          newStatus === 'ĐÃ_KHẮC_PHỤC' || newStatus === 'ĐÃ_XÁC_MINH'
            ? new Date().toISOString().replace('T', ' ').substring(0, 16)
            : iss.resolvedAt,
        verifiedBy: newStatus === 'ĐÃ_XÁC_MINH' ? user : iss.verifiedBy,
        verifiedAt:
          newStatus === 'ĐÃ_XÁC_MINH'
            ? new Date().toISOString().replace('T', ' ').substring(0, 16)
            : iss.verifiedAt,
      };
    }
    return iss;
  });

  const updatedProject: NewModelProjectPro = {
    ...project,
    issues: updatedIssues,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  saveStoredNewModelProProject(updatedProject);
  return updatedProject;
};

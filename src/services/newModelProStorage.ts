import {
  NewModelProjectPro,
  ProjectLinePro,
  EquipmentItemPro,
  EquipmentIssuePro,
  ItemInspectionStatus,
  IssueStatus,
  ProcessMasterEntity,
  BlockMasterEntity,
  MasterAdminAuditLog,
  ProjectDeclarationDraft,
  LineDeclarationDraft,
  StageProgress,
  ProjectBlockPro,
  ProjectFactoryPro,
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

// =========================================================================
// MASTER ADMIN STORAGE & AUDIT ENGINE
// =========================================================================

const STORAGE_KEY_PROCESSES = 'oos_new_model_master_processes_v1';
const STORAGE_KEY_BLOCKS = 'oos_new_model_master_blocks_v1';
const STORAGE_KEY_AUDIT_LOGS = 'oos_new_model_master_audit_v1';

export const INITIAL_PROCESSES: ProcessMasterEntity[] = [
  {
    id: 'PRC-001',
    code: 'CNC',
    name: 'Gia công CNC',
    description: 'Phay, tiện, khoan mài vỏ hợp kim nhôm và linh kiện cơ khí chính xác',
    status: 'Active',
    createdBy: 'System Architect',
    createdDate: '2026-09-01 08:00',
    updatedBy: 'Admin OOS',
    updatedDate: '2026-10-15 14:30',
  },
  {
    id: 'PRC-002',
    code: 'SMT',
    name: 'Dán bề mặt SMT',
    description: 'Lắp ráp bản mạch điện tử PBA/PCB, in thiếc hàn, dán chip và IC tốc độ cao',
    status: 'Active',
    createdBy: 'System Architect',
    createdDate: '2026-09-01 08:15',
    updatedBy: 'Admin OOS',
    updatedDate: '2026-10-10 11:20',
  },
  {
    id: 'PRC-003',
    code: 'ASSY',
    name: 'Lắp ráp hoàn thiện',
    description: 'Lắp ráp mô đun màn hình OLED, camera, pin và ép chống nước IP68',
    status: 'Active',
    createdBy: 'System Architect',
    createdDate: '2026-09-02 09:00',
    updatedBy: 'Admin OOS',
    updatedDate: '2026-10-18 16:00',
  },
  {
    id: 'PRC-004',
    code: 'TEST',
    name: 'Kiểm tra chức năng',
    description: 'Đo lường tần số sóng RF, sạc siêu nhanh, cảm biến vân tay và âm thanh stereo',
    status: 'Active',
    createdBy: 'System Architect',
    createdDate: '2026-09-05 10:00',
    updatedBy: 'Admin OOS',
    updatedDate: '2026-10-12 09:30',
  },
  {
    id: 'PRC-005',
    code: 'PACKING',
    name: 'Đóng gói & Xuất hàng',
    description: 'Khắc số IMEI laser, dán tem an ninh, đóng seal hộp và xếp pallet xuất kho',
    status: 'Active',
    createdBy: 'System Architect',
    createdDate: '2026-09-10 14:00',
    updatedBy: 'Admin OOS',
    updatedDate: '2026-10-20 15:45',
  },
  {
    id: 'PRC-006',
    code: 'PAINT',
    name: 'Sơn & Xử lý bề mặt',
    description: 'Quy trình Anodizing, sơn tĩnh điện chân không và sấy hồng ngoại UV',
    status: 'Inactive',
    createdBy: 'Admin OOS',
    createdDate: '2026-09-12 11:00',
    updatedBy: 'Admin OOS',
    updatedDate: '2026-11-01 10:00',
  },
];

export const INITIAL_BLOCKS: BlockMasterEntity[] = [
  // CNC Blocks
  {
    id: 'BLK-001',
    processId: 'PRC-001',
    processCode: 'CNC',
    code: 'Block 1',
    name: 'Block 1 - Khu Phay 5 trục',
    description: 'Dây chuyền máy phay Makino & Mazak gia công khung viền Titanium',
    status: 'Active',
    createdBy: 'System Architect',
    createdDate: '2026-09-01 08:30',
    updatedBy: 'Admin OOS',
    updatedDate: '2026-10-15 14:35',
  },
  {
    id: 'BLK-002',
    processId: 'PRC-001',
    processCode: 'CNC',
    code: 'Block 2',
    name: 'Block 2 - Khu Phay Brother tốc độ cao',
    description: 'Máy phay trung tâm Brother gia công chi tiết mặt lưng và khay SIM',
    status: 'Active',
    createdBy: 'System Architect',
    createdDate: '2026-09-01 08:45',
    updatedBy: 'Admin OOS',
    updatedDate: '2026-10-15 14:40',
  },
  {
    id: 'BLK-003',
    processId: 'PRC-001',
    processCode: 'CNC',
    code: 'Block 3',
    name: 'Block 3 - Khu Mài bóng & Hoàn thiện',
    description: 'Hệ thống đánh bóng tự động và rửa siêu âm chi tiết cơ khí',
    status: 'Active',
    createdBy: 'System Architect',
    createdDate: '2026-09-01 09:00',
    updatedBy: 'Admin OOS',
    updatedDate: '2026-10-15 14:45',
  },
  // SMT Blocks
  {
    id: 'BLK-004',
    processId: 'PRC-002',
    processCode: 'SMT',
    code: 'Block 1',
    name: 'Block 1 SMT - In thiếc & Gắn Chip',
    description: 'Máy in thiếc DEK và máy dán chip Panasonic NPM-D3 tốc độ cao',
    status: 'Active',
    createdBy: 'System Architect',
    createdDate: '2026-09-02 10:00',
    updatedBy: 'Admin OOS',
    updatedDate: '2026-10-10 11:30',
  },
  {
    id: 'BLK-005',
    processId: 'PRC-002',
    processCode: 'SMT',
    code: 'Block 2',
    name: 'Block 2 SMT - Lò hàn & Soi quang học AOI',
    description: 'Lò hàn Nitơ Heller và máy soi lỗi quang học 3D Koh Young',
    status: 'Active',
    createdBy: 'System Architect',
    createdDate: '2026-09-02 10:15',
    updatedBy: 'Admin OOS',
    updatedDate: '2026-10-10 11:35',
  },
  // ASSY Blocks
  {
    id: 'BLK-006',
    processId: 'PRC-003',
    processCode: 'ASSY',
    code: 'Block 1',
    name: 'Block 1 ASSY - Ép màn hình & Gắn Main',
    description: 'Robot tra keo nóng tự động và máy ép chân không màn hình',
    status: 'Active',
    createdBy: 'System Architect',
    createdDate: '2026-09-03 11:00',
    updatedBy: 'Admin OOS',
    updatedDate: '2026-10-18 16:10',
  },
  {
    id: 'BLK-007',
    processId: 'PRC-003',
    processCode: 'ASSY',
    code: 'Block 2',
    name: 'Block 2 ASSY - Vặn ốc & Lắp pin',
    description: 'Tô vít điện tử kiểm soát lực siết thông minh torque controller',
    status: 'Active',
    createdBy: 'System Architect',
    createdDate: '2026-09-03 11:20',
    updatedBy: 'Admin OOS',
    updatedDate: '2026-10-18 16:15',
  },
  // TEST Block
  {
    id: 'BLK-008',
    processId: 'PRC-004',
    processCode: 'TEST',
    code: 'Block 1',
    name: 'Block 1 TEST - Đo kiểm buồng kín RF',
    description: 'Chamber che chắn sóng điện từ và trạm test âm học',
    status: 'Active',
    createdBy: 'System Architect',
    createdDate: '2026-09-05 10:30',
    updatedBy: 'Admin OOS',
    updatedDate: '2026-10-12 09:40',
  },
  // PACKING Block
  {
    id: 'BLK-009',
    processId: 'PRC-005',
    processCode: 'PACKING',
    code: 'Block 1',
    name: 'Block 1 PACKING - Đóng hộp & Cân trọng lượng',
    description: 'Dây chuyền gấp hộp carton và cân kiểm tra trọng lượng chống thiếu phụ kiện',
    status: 'Active',
    createdBy: 'System Architect',
    createdDate: '2026-09-10 14:15',
    updatedBy: 'Admin OOS',
    updatedDate: '2026-10-20 15:50',
  },
  // PAINT Block
  {
    id: 'BLK-010',
    processId: 'PRC-006',
    processCode: 'PAINT',
    code: 'Block 1',
    name: 'Block 1 Sơn - Phòng sạch Anodizing',
    description: 'Dây chuyền xử lý hóa chất mạ bề mặt hợp kim (Đang bảo trì định kỳ)',
    status: 'Inactive',
    createdBy: 'Admin OOS',
    createdDate: '2026-09-12 11:20',
    updatedBy: 'Admin OOS',
    updatedDate: '2026-11-01 10:05',
  },
];

export const INITIAL_AUDIT_LOGS: MasterAdminAuditLog[] = [
  {
    id: 'AUD-2026-001',
    timestamp: '2026-10-20 15:45',
    entityType: 'PROCESS',
    entityCode: 'PACKING',
    action: 'UPDATE',
    user: 'Admin OOS',
    details: 'Cập nhật mô tả tiêu chuẩn đóng thùng pallet quốc tế',
  },
  {
    id: 'AUD-2026-002',
    timestamp: '2026-10-18 16:15',
    entityType: 'BLOCK',
    entityCode: 'BLK-007 (Block 2 ASSY)',
    action: 'UPDATE',
    user: 'Admin OOS',
    details: 'Bổ sung tiêu chuẩn kiểm soát lực siết mô-men xoắn thông minh',
  },
  {
    id: 'AUD-2026-003',
    timestamp: '2026-10-15 14:30',
    entityType: 'PROCESS',
    entityCode: 'CNC',
    action: 'ACTIVATE',
    user: 'Admin OOS',
    details: 'Xác thực kích hoạt Process CNC phục vụ Model ON1 năm 2026',
  },
  {
    id: 'AUD-2026-004',
    timestamp: '2026-11-01 10:00',
    entityType: 'PROCESS',
    entityCode: 'PAINT',
    action: 'DEACTIVATE',
    user: 'Admin OOS',
    details: 'Tạm ngưng sử dụng quy trình Sơn để nâng cấp buồng sạch Class 1000',
  },
];

// --- Process Master CRUD ---
export const getStoredProcesses = (): ProcessMasterEntity[] => {
  const raw = localStorage.getItem(STORAGE_KEY_PROCESSES);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_PROCESSES, JSON.stringify(INITIAL_PROCESSES));
    return INITIAL_PROCESSES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROCESSES;
  }
};

export const saveStoredProcesses = (processes: ProcessMasterEntity[]): void => {
  localStorage.setItem(STORAGE_KEY_PROCESSES, JSON.stringify(processes));
};

export const addProcess = (
  code: string,
  name: string,
  description: string,
  createdBy: string
): { success: boolean; message: string; process?: ProcessMasterEntity } => {
  const list = getStoredProcesses();
  const normalizedCode = code.trim().toUpperCase();

  if (list.some((p) => p.code.toUpperCase() === normalizedCode)) {
    return { success: false, message: `Mã Process "${normalizedCode}" đã tồn tại trên hệ thống!` };
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const newProcess: ProcessMasterEntity = {
    id: `PRC-${String(list.length + 1).padStart(3, '0')}`,
    code: normalizedCode,
    name: name.trim(),
    description: description.trim(),
    status: 'Active',
    createdBy,
    createdDate: now,
    updatedBy: createdBy,
    updatedDate: now,
  };

  const updated = [newProcess, ...list];
  saveStoredProcesses(updated);

  addMasterAuditLog({
    entityType: 'PROCESS',
    entityCode: newProcess.code,
    action: 'CREATE',
    user: createdBy,
    details: `Tạo mới Process: ${newProcess.name} (${newProcess.code})`,
  });

  return { success: true, message: 'Đã tạo Process thành công!', process: newProcess };
};

export const updateProcess = (
  id: string,
  name: string,
  description: string,
  updatedBy: string
): boolean => {
  const list = getStoredProcesses();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const updated = list.map((p) => {
    if (p.id === id) {
      return {
        ...p,
        name: name.trim(),
        description: description.trim(),
        updatedBy,
        updatedDate: now,
      };
    }
    return p;
  });

  saveStoredProcesses(updated);
  const target = list.find((p) => p.id === id);
  if (target) {
    addMasterAuditLog({
      entityType: 'PROCESS',
      entityCode: target.code,
      action: 'UPDATE',
      user: updatedBy,
      details: `Cập nhật thông tin Process: ${target.code}`,
    });
  }
  return true;
};

export const toggleProcessStatus = (id: string, user: string): ProcessMasterEntity | null => {
  const list = getStoredProcesses();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  let affected: ProcessMasterEntity | null = null;

  const updated = list.map((p) => {
    if (p.id === id) {
      const newStatus = p.status === 'Active' ? 'Inactive' : 'Active';
      affected = {
        ...p,
        status: newStatus,
        updatedBy: user,
        updatedDate: now,
      };
      return affected;
    }
    return p;
  });

  saveStoredProcesses(updated);
  if (affected) {
    addMasterAuditLog({
      entityType: 'PROCESS',
      entityCode: (affected as ProcessMasterEntity).code,
      action: (affected as ProcessMasterEntity).status === 'Active' ? 'ACTIVATE' : 'DEACTIVATE',
      user,
      details: `Thay đổi trạng thái Process ${(affected as ProcessMasterEntity).code} sang ${
        (affected as ProcessMasterEntity).status
      }`,
    });
  }
  return affected;
};

// --- Block Master CRUD ---
export const getStoredBlocks = (): BlockMasterEntity[] => {
  const raw = localStorage.getItem(STORAGE_KEY_BLOCKS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_BLOCKS, JSON.stringify(INITIAL_BLOCKS));
    return INITIAL_BLOCKS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_BLOCKS;
  }
};

export const saveStoredBlocks = (blocks: BlockMasterEntity[]): void => {
  localStorage.setItem(STORAGE_KEY_BLOCKS, JSON.stringify(blocks));
};

export const addBlock = (
  processId: string,
  code: string,
  name: string,
  description: string,
  createdBy: string
): { success: boolean; message: string; block?: BlockMasterEntity } => {
  const processes = getStoredProcesses();
  const parentProcess = processes.find((p) => p.id === processId);
  if (!parentProcess) {
    return { success: false, message: 'Không tìm thấy Process cha tương ứng!' };
  }

  const blocks = getStoredBlocks();
  const normalizedCode = code.trim();

  // Validate duplicate block code in same process
  const existsInProcess = blocks.some(
    (b) =>
      b.processId === processId &&
      b.code.trim().toLowerCase() === normalizedCode.toLowerCase()
  );

  if (existsInProcess) {
    return {
      success: false,
      message: `Mã Block "${normalizedCode}" đã tồn tại trong quy trình ${parentProcess.code}! Vui lòng dùng mã khác.`,
    };
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const newBlock: BlockMasterEntity = {
    id: `BLK-${String(blocks.length + 1).padStart(3, '0')}`,
    processId: parentProcess.id,
    processCode: parentProcess.code,
    code: normalizedCode,
    name: name.trim(),
    description: description.trim(),
    status: 'Active',
    createdBy,
    createdDate: now,
    updatedBy: createdBy,
    updatedDate: now,
  };

  const updated = [newBlock, ...blocks];
  saveStoredBlocks(updated);

  addMasterAuditLog({
    entityType: 'BLOCK',
    entityCode: `${parentProcess.code}-${newBlock.code}`,
    action: 'CREATE',
    user: createdBy,
    details: `Tạo mới Sub Process / Block: ${newBlock.name} thuộc ${parentProcess.code}`,
  });

  return { success: true, message: 'Đã tạo Block thành công!', block: newBlock };
};

export const updateBlock = (
  id: string,
  name: string,
  description: string,
  updatedBy: string
): boolean => {
  const blocks = getStoredBlocks();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const updated = blocks.map((b) => {
    if (b.id === id) {
      return {
        ...b,
        name: name.trim(),
        description: description.trim(),
        updatedBy,
        updatedDate: now,
      };
    }
    return b;
  });

  saveStoredBlocks(updated);
  const target = blocks.find((b) => b.id === id);
  if (target) {
    addMasterAuditLog({
      entityType: 'BLOCK',
      entityCode: `${target.processCode}-${target.code}`,
      action: 'UPDATE',
      user: updatedBy,
      details: `Cập nhật thông tin Block: ${target.name}`,
    });
  }
  return true;
};

export const toggleBlockStatus = (id: string, user: string): BlockMasterEntity | null => {
  const blocks = getStoredBlocks();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  let affected: BlockMasterEntity | null = null;

  const updated = blocks.map((b) => {
    if (b.id === id) {
      const newStatus = b.status === 'Active' ? 'Inactive' : 'Active';
      affected = {
        ...b,
        status: newStatus,
        updatedBy: user,
        updatedDate: now,
      };
      return affected;
    }
    return b;
  });

  saveStoredBlocks(updated);
  if (affected) {
    addMasterAuditLog({
      entityType: 'BLOCK',
      entityCode: `${(affected as BlockMasterEntity).processCode}-${(affected as BlockMasterEntity).code}`,
      action: (affected as BlockMasterEntity).status === 'Active' ? 'ACTIVATE' : 'DEACTIVATE',
      user,
      details: `Thay đổi trạng thái Block ${(affected as BlockMasterEntity).name} sang ${
        (affected as BlockMasterEntity).status
      }`,
    });
  }
  return affected;
};

// --- Audit Log Engine ---
export const getStoredMasterAuditLogs = (): MasterAdminAuditLog[] => {
  const raw = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    return INITIAL_AUDIT_LOGS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
};

export const addMasterAuditLog = (
  entry: Omit<MasterAdminAuditLog, 'id' | 'timestamp'>
): void => {
  const list = getStoredMasterAuditLogs();
  const newLog: MasterAdminAuditLog = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    ...entry,
  };
  localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify([newLog, ...list]));
};

// --- Create Full Project from Declaration Draft ---
export const createProjectFromDeclaration = (
  draft: ProjectDeclarationDraft,
  user: string
): NewModelProjectPro => {
  const totalLines = draft.lines.length;

  // Build factories scope hierarchy
  const factoriesScope: ProjectFactoryPro[] = draft.factories.map((fac) => {
    // Find lines for this factory
    const factoryLines = draft.lines.filter((l) => l.factory === fac);

    // Group lines by block
    const blockIds = Array.from(new Set(factoryLines.map((l) => l.blockId)));

    const blocks: ProjectBlockPro[] = blockIds.map((bId) => {
      const bLines = factoryLines.filter((l) => l.blockId === bId);
      const bName = bLines[0]?.blockName || 'Block 1';

      const projectLines: ProjectLinePro[] = bLines.map((l, idx) => {
        const purchaseStage: StageProgress = {
          type: 'PURCHASE',
          name: 'Mua hàng',
          planStartWeek: l.purchaseStartWeek || draft.startWeek,
          planEndWeek: l.purchaseEndWeek || Math.min(draft.startWeek + 1, draft.endWeek),
          planLabel: `W${l.purchaseStartWeek} – W${l.purchaseEndWeek}`,
          actualProgressPct: 0,
          status: 'Chưa bắt đầu',
          isOverdue: false,
          responsibleRole: 'Purchaser',
          actualLabel: '-',
        };

        const receivingStage: StageProgress = {
          type: 'RECEIVING',
          name: 'Nhận hàng',
          planStartWeek: l.receivingStartWeek || draft.startWeek + 2,
          planEndWeek: l.receivingEndWeek || draft.startWeek + 2,
          planLabel: `W${l.receivingStartWeek}`,
          actualProgressPct: 0,
          status: 'Chưa bắt đầu',
          isOverdue: false,
          responsibleRole: 'EQM',
          actualLabel: '-',
        };

        const setupStage: StageProgress = {
          type: 'SETUP',
          name: 'Setup',
          planStartWeek: l.setupStartWeek || draft.startWeek + 3,
          planEndWeek: l.setupEndWeek || draft.endWeek,
          planLabel: `W${l.setupStartWeek} – W${l.setupEndWeek}`,
          actualProgressPct: 0,
          status: 'Chưa bắt đầu',
          isOverdue: false,
          responsibleRole: 'EQM / Tech',
          actualLabel: '-',
        };

        return {
          id: `LINE-${draft.processCode}-${draft.modelCodename}-${l.lineIndex}`,
          code: l.lineCode,
          name: l.lineName,
          factory: fac,
          blockId: bId,
          blockName: bName,
          vendor: l.vendor,
          status: 'Chờ mua hàng',
          overallProgressPct: 0,
          purchaseStage,
          receivingStage,
          setupStage,
          equipmentItems: l.equipmentItems,
          readyForProduction: false,
        };
      });

      return {
        id: bId,
        name: bName,
        code: bName.replace('Block ', 'B'),
        lines: projectLines,
      };
    });

    return {
      factory: fac,
      isActive: true,
      blocks,
    };
  });

  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

  const newProject: NewModelProjectPro = {
    id: `PRJ-${draft.processCode}-${draft.modelCodename}`,
    projectCode: draft.projectName,
    modelCodename: draft.modelCodename,
    process: draft.processCode as any,
    factories: draft.factories,
    primaryFactory: draft.primaryFactory,
    timeframeLabel: `W${draft.startWeek} – W${draft.endWeek} (${draft.year})`,
    startWeek: draft.startWeek,
    endWeek: draft.endWeek,
    currentWeek: draft.startWeek,
    year: draft.year,
    status: 'Mới khởi tạo',
    currentWorkflowStep: 4, // Kế hoạch mua hàng (Planner đặt)
    totalLines: totalLines,
    onTrackLines: totalLines,
    atRiskLines: 0,
    delayedLines: 0,
    projectProgressPct: 0,
    plannerName: draft.plannerName || user,
    createdAt: now,
    updatedAt: now,
    factoriesScope,
    issues: [],
  };

  saveStoredNewModelProProject(newProject);

  addMasterAuditLog({
    entityType: 'PROJECT_DECLARATION',
    entityCode: newProject.projectCode,
    action: 'CREATE',
    user,
    details: `Khai báo dự án mới: ${newProject.projectCode} với ${totalLines} Lines tại ${draft.factories.join(
      ', '
    )}`,
  });

  return newProject;
};


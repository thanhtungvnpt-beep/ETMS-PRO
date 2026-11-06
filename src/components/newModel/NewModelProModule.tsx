// OOS NEW MODEL PRO — Master Coordinator Module
// Tích hợp toàn diện vào kiến trúc OOS, hỗ trợ chuyển đổi Desktop / Mobile,
// Quản lý trạng thái, Gantt Chart, Tiêu chuẩn thiết bị, Mua hàng, Setup, Issue Control Center

import React, { useState } from 'react';
import {
  NewModelProjectPro,
  EquipmentItemPro,
  NewModelSubTab,
  ItemInspectionStatus,
  IssueStatus,
} from '../../types/newModelPro';
import {
  getStoredNewModelProProject,
  saveStoredNewModelProProject,
  resetNewModelProToSample,
  updateEquipmentItemStatus,
  updateEquipmentIssueStatus,
} from '../../services/newModelProStorage';
import { NewModelGanttDashboard } from './NewModelGanttDashboard';
import { NewModelItemInspectionModal } from './NewModelItemInspectionModal';
import { NewModelIssueControlCenter } from './NewModelIssueControlCenter';
import { NewModelEquipmentStandardView } from './NewModelEquipmentStandardView';
import { NewModelPurchaseProgressView } from './NewModelPurchaseProgressView';
import { NewModelSetupView } from './NewModelSetupView';
import { NewModelMobileView } from './NewModelMobileView';
import { NewModelMasterAdminView } from './NewModelMasterAdminView';
import { NewModelProjectDeclarationWizard } from './NewModelProjectDeclarationWizard';
import { NewModelLineCardsDashboard } from './NewModelLineCardsDashboard';
import { NewModelProjectDetail } from './NewModelProjectDetail';
import {
  getStoredNewModelProjects,
  updateStoredNewModelProject,
} from '../../services/newModelProjectStorage';
import { NewModelProject } from '../../types/newModelProject';
import {
  LayoutDashboard,
  Smartphone,
  Monitor,
  RotateCcw,
  Plus,
  ShieldCheck,
  CheckCircle2,
  FolderPlus,
  Layers,
  Settings,
  Activity,
  Calendar,
} from 'lucide-react';

interface NewModelProModuleProps {
  currentUser: { name: string; role: string };
  onBackToMain?: () => void;
}

export const NewModelProModule: React.FC<NewModelProModuleProps> = ({
  currentUser,
}) => {
  const [project, setProject] = useState<NewModelProjectPro>(getStoredNewModelProProject);
  const [nineStepProjects, setNineStepProjects] = useState<NewModelProject[]>(getStoredNewModelProjects);
  const [selected9StepProject, setSelected9StepProject] = useState<NewModelProject>(() => {
    const list = getStoredNewModelProjects();
    return list[0];
  });
  const [activeSubTab, setActiveSubTab] = useState<NewModelSubTab>('line-schedule');
  const [devicePreviewMode, setDevicePreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Inspection Modal state
  const [inspectingItem, setInspectingItem] = useState<{
    item: EquipmentItemPro;
    lineCode: string;
  } | null>(null);

  // Success toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle saving an equipment item status
  const handleSaveItemInspection = (
    newStatus: ItemInspectionStatus,
    reason?: string,
    photoUrl?: string,
    expectedDate?: string
  ) => {
    if (!inspectingItem) return;

    // Find line ID for this item
    let targetLineId = '';
    for (const f of project.factoriesScope) {
      for (const b of f.blocks) {
        for (const l of b.lines) {
          if (l.equipmentItems.some((i) => i.id === inspectingItem.item.id)) {
            targetLineId = l.id;
            break;
          }
        }
      }
    }

    if (!targetLineId) targetLineId = 'LINE-ON1-B1-DAAL-L1';

    const updated = updateEquipmentItemStatus(
      project,
      targetLineId,
      inspectingItem.item.id,
      newStatus,
      reason,
      photoUrl,
      expectedDate,
      currentUser.name
    );

    setProject(updated);
    setInspectingItem(null);
    showToast(
      `Đã cập nhật thiết bị ${inspectingItem.item.code}: ${
        newStatus === 'OK' ? 'ĐẠT (OK)' : 'PENDING (SỰ CỐ)'
      }`
    );
  };

  // Handle issue status transition
  const handleUpdateIssueStatus = (
    issueId: string,
    newStatus: IssueStatus,
    note?: string
  ) => {
    const updated = updateEquipmentIssueStatus(
      project,
      issueId,
      newStatus,
      currentUser.name,
      currentUser.role,
      note
    );
    setProject(updated);
    showToast(`Đã chuyển trạng thái sự cố ${issueId} sang: ${newStatus}`);
  };

  // Handle Reset Sample Data
  const handleResetSampleData = () => {
    if (window.confirm('Khôi phục dữ liệu mẫu dự án CNC ON1 về trạng thái gốc chuẩn?')) {
      const reset = resetNewModelProToSample();
      setProject(reset);
      showToast('Đã khôi phục dữ liệu mẫu chuẩn của dự án CNC ON1.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Device Preview Bar */}
      <div className="flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-slate-200/90 shadow-2xs text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#082D55]">DỰ ÁN NEW MODEL PRO</span>
          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
            Enterprise v3.2
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-600 hidden sm:inline">
            Dự án: <strong>{project.projectCode}</strong> ({project.process})
          </span>
        </div>

        {/* Action Tabs: Gantt vs Declaration vs Master Admin */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveSubTab('line-schedule')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'line-schedule'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kế hoạch Line (Gantt)
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('line-cards')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'line-cards'
                  ? 'bg-[#030C1C] text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-600 hover:text-cyan-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Thẻ Line Pro</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('project-detail')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'project-detail'
                  ? 'bg-[#0c2340] text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>9 Bước & Gantt D3</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('project-declaration')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'project-declaration'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Khai báo dự án (+)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('master-admin')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'master-admin'
                  ? 'bg-[#082D55] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Master Admin</span>
            </button>
          </div>


          {/* Device Switcher (Desktop vs Mobile Field Mode) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setDevicePreviewMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                devicePreviewMode === 'desktop'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>

            <button
              type="button"
              onClick={() => setDevicePreviewMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                devicePreviewMode === 'mobile'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>
        </div>
      </div>


      {/* Main View Render */}
      {devicePreviewMode === 'mobile' ? (
        <NewModelMobileView
          project={project}
          currentUser={currentUser}
          onOpenItemInspection={(item, lineCode) => setInspectingItem({ item, lineCode })}
        />
      ) : (
        <>
          {activeSubTab === 'line-schedule' && (
            <NewModelGanttDashboard
              project={project}
              currentUser={currentUser}
              onSelectSubTab={(tab) => setActiveSubTab(tab)}
              onOpenItemInspection={(item, lineCode) =>
                setInspectingItem({ item, lineCode })
              }
              onResetSampleData={handleResetSampleData}
            />
          )}

          {activeSubTab === 'equipment-list' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('line-schedule')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                ← Quay lại Biểu đồ Gantt & Kế hoạch Line
              </button>
              <NewModelEquipmentStandardView
                project={project}
                currentUser={currentUser}
                onOpenItemInspection={(item, lineCode) =>
                  setInspectingItem({ item, lineCode })
                }
              />
            </div>
          )}

          {(activeSubTab === 'purchase-plan' || activeSubTab === 'purchase-progress') && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('line-schedule')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                ← Quay lại Biểu đồ Gantt & Kế hoạch Line
              </button>
              <NewModelPurchaseProgressView project={project} currentUser={currentUser} />
            </div>
          )}

          {activeSubTab === 'issues' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('line-schedule')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                ← Quay lại Biểu đồ Gantt & Kế hoạch Line
              </button>
              <NewModelIssueControlCenter
                project={project}
                currentUser={currentUser}
                onUpdateIssueStatus={handleUpdateIssueStatus}
                onNavigateToLine={() => setActiveSubTab('line-schedule')}
              />
            </div>
          )}

          {activeSubTab === 'setup-trial' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('line-schedule')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                ← Quay lại Biểu đồ Gantt & Kế hoạch Line
              </button>
              <NewModelSetupView project={project} currentUser={currentUser} />
            </div>
          )}

          {activeSubTab === 'line-cards' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('line-schedule')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                ← Quay lại Biểu đồ Gantt & Kế hoạch Line
              </button>
              <NewModelLineCardsDashboard
                project={project}
                currentUser={currentUser}
                onBackToGantt={() => setActiveSubTab('line-schedule')}
                onViewLineDetails={() => setActiveSubTab('line-schedule')}
              />
            </div>
          )}

          {activeSubTab === 'project-declaration' && (
            <div className="space-y-3">
              <NewModelProjectDeclarationWizard
                currentUser={currentUser}
                onSuccessCreated={(newProject) => {
                  setProject(newProject);
                  setActiveSubTab('line-schedule');
                  showToast(`Đã khởi tạo thành công dự án mới: ${newProject.projectCode}!`);
                }}
                onCancel={() => setActiveSubTab('line-schedule')}
              />
            </div>
          )}


          {activeSubTab === 'master-admin' && (
            <div className="space-y-3">
              <NewModelMasterAdminView
                currentUser={currentUser}
                onClose={() => setActiveSubTab('line-schedule')}
                onNavigateToDeclaration={() => setActiveSubTab('project-declaration')}
              />
            </div>
          )}
        </>
      )}


      {/* Item Inspection & OK/Pending Modal */}
      {inspectingItem && (
        <NewModelItemInspectionModal
          item={inspectingItem.item}
          lineCode={inspectingItem.lineCode}
          currentUser={currentUser}
          onClose={() => setInspectingItem(null)}
          onSave={handleSaveItemInspection}
        />
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#082D55] text-white px-4 py-2.5 rounded-xl shadow-2xl border border-blue-400 flex items-center gap-2.5 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

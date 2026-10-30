import React, { useState, useRef, useEffect } from 'react';
import {
  AboutUsPageData,
  AboutUsTeamMember,
  AboutUsSectionConfig,
  AboutUsCapabilityItem,
  SectionType,
  TeamGroupType,
} from '../../types/aboutUs';
import { UserProfile } from '../../types';
import {
  saveStoredDraftAboutUs,
  publishStoredAboutUs,
  resetStoredAboutUsToInitial,
} from '../../services/aboutUsStorage';
import {
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Save,
  Send,
  RotateCcw,
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Copy,
  Settings2,
  Image as ImageIcon,
  Upload,
  Type,
  Users,
  Cpu,
  Wrench,
  Boxes,
  Truck,
  FolderKanban,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Lightbulb,
  Factory,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Palette,
  GripVertical,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

interface AboutUsPageBuilderProps {
  initialData: AboutUsPageData;
  currentUser: UserProfile;
  onExit: () => void;
  onPublishSuccess?: (publishedData: AboutUsPageData) => void;
}

export const AboutUsPageBuilder: React.FC<AboutUsPageBuilderProps> = ({
  initialData,
  currentUser,
  onExit,
  onPublishSuccess,
}) => {
  // Current working state (draft)
  const [data, setData] = useState<AboutUsPageData>(initialData);

  // Undo / Redo history stacks
  const [historyPast, setHistoryPast] = useState<AboutUsPageData[]>([]);
  const [historyFuture, setHistoryFuture] = useState<AboutUsPageData[]>([]);

  // Selected section ID for property inspector
  const [selectedSectionId, setSelectedSectionId] = useState<string>('sec-group-photo');

  // Preview options
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isCleanPreview, setIsCleanPreview] = useState<boolean>(false);

  // Left panel tab: 'components' | 'tree'
  const [leftTab, setLeftTab] = useState<'components' | 'tree'>('components');

  // Right panel tab: 'content' | 'style'
  const [rightTab, setRightTab] = useState<'content' | 'style'>('content');

  // Save / status state
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Bản nháp đã lưu');

  // Modals
  const [deleteModalSectionId, setDeleteModalSectionId] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Drag and drop section reordering state
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const memberAvatarInputRef = useRef<HTMLInputElement | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Helper to commit state change with undo history
  const updateDataWithHistory = (updater: (prev: AboutUsPageData) => AboutUsPageData) => {
    setData((prev) => {
      const next = updater(prev);
      setHistoryPast((past) => [...past.slice(-20), prev]); // Keep last 20 states
      setHistoryFuture([]); // Clear redo
      setIsDirty(true);
      setStatusMessage('Có thay đổi chưa lưu');
      return next;
    });
  };

  // Undo action
  const handleUndo = () => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryPast((past) => past.slice(0, past.length - 1));
    setHistoryFuture((future) => [data, ...future]);
    setData(previous);
    setIsDirty(true);
    setStatusMessage('Đã hoàn tác thao tác');
  };

  // Redo action
  const handleRedo = () => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    setHistoryFuture((future) => future.slice(1));
    setHistoryPast((past) => [...past, data]);
    setData(next);
    setIsDirty(true);
    setStatusMessage('Đã làm lại thao tác');
  };

  // Save draft
  const handleSaveDraft = () => {
    const saved = saveStoredDraftAboutUs(data, currentUser.name);
    setData(saved);
    setIsDirty(false);
    setStatusMessage('Đã lưu bản nháp lúc ' + saved.lastUpdated);
  };

  // Publish live
  const handlePublish = () => {
    const published = publishStoredAboutUs(data, currentUser.name);
    setData(published);
    setIsDirty(false);
    setStatusMessage('Đã xuất bản thành công lúc ' + published.lastUpdated);
    if (onPublishSuccess) {
      onPublishSuccess(published);
    }
  };

  // Reset to original
  const handleResetToInitial = () => {
    const resetData = resetStoredAboutUsToInitial();
    updateDataWithHistory(() => resetData);
    setIsResetModalOpen(false);
    setStatusMessage('Đã khôi phục dữ liệu ban đầu');
  };

  // Move section up / down
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const sorted = [...data.sections].sort((a, b) => a.order - b.order);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const currentSec = sorted[index];
    const targetSec = sorted[targetIndex];

    const currentOrder = currentSec.order;
    currentSec.order = targetSec.order;
    targetSec.order = currentOrder;

    updateDataWithHistory((prev) => ({
      ...prev,
      sections: [...sorted],
    }));
  };

  // Toggle section visibility
  const toggleSectionVisibility = (id: string) => {
    updateDataWithHistory((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s)),
    }));
  };

  // Duplicate section
  const duplicateSection = (id: string) => {
    const target = data.sections.find((s) => s.id === id);
    if (!target) return;
    const newId = `sec-${target.type.toLowerCase()}-${Date.now().toString().slice(-4)}`;
    const newSection: AboutUsSectionConfig = {
      ...target,
      id: newId,
      title: `${target.title} (Bản sao)`,
      order: target.order + 0.5,
    };

    updateDataWithHistory((prev) => {
      const all = [...prev.sections, newSection];
      all.sort((a, b) => a.order - b.order);
      // Re-index orders
      return {
        ...prev,
        sections: all.map((sec, idx) => ({ ...sec, order: idx + 1 })),
      };
    });
    setSelectedSectionId(newId);
  };

  // Delete section
  const confirmDeleteSection = () => {
    if (!deleteModalSectionId) return;
    updateDataWithHistory((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== deleteModalSectionId),
    }));
    if (selectedSectionId === deleteModalSectionId) {
      setSelectedSectionId(data.sections[0]?.id || '');
    }
    setDeleteModalSectionId(null);
  };

  // Add new block from library
  const addNewSection = (type: SectionType) => {
    const newId = `sec-${type.toLowerCase()}-${Date.now().toString().slice(-4)}`;
    let title = 'Khối mới';
    switch (type) {
      case 'CUSTOM_TEXT':
        title = 'Khối văn bản bổ sung';
        break;
      case 'DIVIDER':
        title = 'Đường phân cách';
        break;
      case 'SPACER':
        title = 'Khoảng trống';
        break;
      case 'BRAND_INTRO':
        title = 'Giới thiệu thương hiệu';
        break;
      case 'GROUP_PHOTO':
        title = 'Ảnh tập thể bộ phận';
        break;
      case 'SLOGANS':
        title = 'Slogan thương hiệu';
        break;
      case 'CAPABILITIES':
        title = 'Năng lực bộ phận';
        break;
      case 'CORE_VALUES':
        title = 'Giá trị cốt lõi';
        break;
      case 'TEAM_MEMBERS':
        title = 'Đội ngũ dự án';
        break;
    }

    const newSec: AboutUsSectionConfig = {
      id: newId,
      type,
      title,
      isVisible: true,
      order: data.sections.length + 1,
      customSettings: {
        bgColor: '#ffffff',
        paddingY: 'md',
        borderStyle: 'subtle',
        textContent:
          type === 'CUSTOM_TEXT'
            ? 'Văn bản giới thiệu chi tiết thêm về hoạt động của bộ phận Outsourcing Operation.'
            : undefined,
        spacerHeight: type === 'SPACER' ? 32 : undefined,
      },
    };

    updateDataWithHistory((prev) => ({
      ...prev,
      sections: [...prev.sections, newSec],
    }));
    setSelectedSectionId(newId);
  };

  // Handle local image file upload for Group Photo
  const handleGroupPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 10MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result as string;
      if (base64Url) {
        updateDataWithHistory((prev) => ({
          ...prev,
          groupPhoto: {
            ...prev.groupPhoto,
            imageUrl: base64Url,
          },
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle member avatar upload
  const handleMemberAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingMemberId) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result as string;
      if (base64Url) {
        updateDataWithHistory((prev) => ({
          ...prev,
          teamMembers: prev.teamMembers.map((m) =>
            m.id === editingMemberId ? { ...m, avatar: base64Url } : m
          ),
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Selected Section Object
  const selectedSection = data.sections.find((s) => s.id === selectedSectionId);

  // Sorted sections
  const sortedSections = [...data.sections].sort((a, b) => a.order - b.order);

  // Group team members
  const directorMembers = data.teamMembers.filter((m) => m.group === 'DIRECTOR');
  const devMembers = data.teamMembers.filter((m) => m.group === 'DEV');
  const advisorMembers = data.teamMembers.filter((m) => m.group === 'ADVISOR');

  // Helper for capability icons
  const renderCapabilityIcon = (iconName: AboutUsCapabilityItem['iconName']) => {
    switch (iconName) {
      case 'users':
        return <Users className="w-4 h-4" />;
      case 'cpu':
        return <Cpu className="w-4 h-4" />;
      case 'wrench':
        return <Wrench className="w-4 h-4" />;
      case 'boxes':
        return <Boxes className="w-4 h-4" />;
      case 'truck':
        return <Truck className="w-4 h-4" />;
      case 'folder':
        return <FolderKanban className="w-4 h-4" />;
      case 'chart':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a1829] text-slate-100 font-sans select-none overflow-hidden">
      {/* ============================================================ */}
      {/* TOP BUILDER TOOLBAR                                          */}
      {/* ============================================================ */}
      <header className="h-14 bg-[#082D55] border-b border-[#152a42] px-4 flex items-center justify-between shrink-0 z-30 shadow-md">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-slate-200 text-xs font-semibold border border-blue-900/60 transition-all cursor-pointer"
            title="Thoát trình thiết kế và quay lại xem trang"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Quay lại xem trang</span>
          </button>

          <div className="h-5 w-px bg-slate-700/60 hidden sm:block" />

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-white">
                Trình chỉnh sửa giao diện Về chúng tôi
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-900 text-cyan-300 border border-blue-700">
                PRO BUILDER
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span className={isDirty ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                ● {statusMessage}
              </span>
              <span>•</span>
              <span>Bởi {currentUser.name}</span>
            </div>
          </div>
        </div>

        {/* Center: Device Switcher & Preview Mode */}
        <div className="hidden md:flex items-center gap-1 bg-[#051C36] p-1 rounded-lg border border-blue-900/60">
          <button
            type="button"
            onClick={() => setPreviewDevice('desktop')}
            className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              previewDevice === 'desktop'
                ? 'bg-[#1688E8] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Xem giao diện Máy tính (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="text-[11px]">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice('tablet')}
            className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              previewDevice === 'tablet'
                ? 'bg-[#1688E8] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Xem giao diện Máy tính bảng (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="text-[11px]">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice('mobile')}
            className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              previewDevice === 'mobile'
                ? 'bg-[#1688E8] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Xem giao diện Điện thoại (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="text-[11px]">Mobile</span>
          </button>

          <div className="h-4 w-px bg-slate-700/60 mx-1" />

          {/* Toggle Clean Preview */}
          <button
            type="button"
            onClick={() => setIsCleanPreview(!isCleanPreview)}
            className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isCleanPreview
                ? 'bg-cyan-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
            }`}
            title="Ẩn đường viền chọn để xem thử trực tiếp"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-[11px]">{isCleanPreview ? 'Đang xem trước' : 'Xem trước'}</span>
          </button>
        </div>

        {/* Right: Actions (Undo, Redo, Save, Publish) */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center bg-[#051C36] rounded-lg border border-blue-900/60 p-0.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyPast.length === 0}
              className="p-1.5 text-slate-300 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed rounded cursor-pointer"
              title="Hoàn tác (Undo)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyFuture.length === 0}
              className="p-1.5 text-slate-300 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed rounded cursor-pointer"
              title="Làm lại (Redo)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Reset Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="p-2 text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-800"
            title="Khôi phục nội dung mẫu ban đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Save Draft Button */}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900/80 hover:bg-blue-800 text-blue-200 text-xs font-bold border border-blue-700 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Lưu nháp</span>
          </button>

          {/* Publish Live Button */}
          <button
            type="button"
            onClick={handlePublish}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1688E8] hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer border border-blue-400/40"
          >
            <Send className="w-3.5 h-3.5 text-cyan-200" />
            <span>Xuất bản</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* THREE-PANEL WORKSPACE                                        */}
      {/* ============================================================ */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* ======================================================== */}
        {/* LEFT PANEL: COMPONENT LIBRARY & SECTION OUTLINE          */}
        {/* ======================================================== */}
        {!isCleanPreview && (
          <aside className="w-72 bg-[#07172B] border-r border-[#152a42] flex flex-col shrink-0 z-20">
            {/* Left Tabs */}
            <div className="flex border-b border-[#152a42] bg-[#051425]">
              <button
                type="button"
                onClick={() => setLeftTab('components')}
                className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 cursor-pointer transition-colors ${
                  leftTab === 'components'
                    ? 'border-[#1688E8] text-white bg-blue-950/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Khối thành phần
              </button>
              <button
                type="button"
                onClick={() => setLeftTab('tree')}
                className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 cursor-pointer transition-colors ${
                  leftTab === 'tree'
                    ? 'border-[#1688E8] text-white bg-blue-950/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Cấu trúc trang ({data.sections.length})
              </button>
            </div>

            {/* Tab 1: Component Library */}
            {leftTab === 'components' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1">
                  Nhấp để thêm khối vào trang
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => addNewSection('GROUP_PHOTO')}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0e243d] hover:bg-blue-900/50 border border-slate-700/60 hover:border-blue-500 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-200 text-xs">Ảnh tập thể bộ phận</div>
                      <div className="text-[10px] text-slate-400">
                        Ảnh đoàn thể, nhà máy, căn chỉnh tỉ lệ
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => addNewSection('SLOGANS')}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0e243d] hover:bg-blue-900/50 border border-slate-700/60 hover:border-blue-500 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded bg-cyan-600/30 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-200 text-xs">Slogan thương hiệu</div>
                      <div className="text-[10px] text-slate-400">
                        Khẩu hiệu song ngữ Anh - Việt
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => addNewSection('TEAM_MEMBERS')}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0e243d] hover:bg-blue-900/50 border border-slate-700/60 hover:border-blue-500 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded bg-emerald-600/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-200 text-xs">Thẻ đội ngũ dự án</div>
                      <div className="text-[10px] text-slate-400">
                        Ban chỉ đạo, nhóm phát triển & cố vấn
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => addNewSection('CAPABILITIES')}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0e243d] hover:bg-blue-900/50 border border-slate-700/60 hover:border-blue-500 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded bg-purple-600/30 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-200 text-xs">7 Năng lực bộ phận</div>
                      <div className="text-[10px] text-slate-400">
                        Lưới 7 phân hệ chức năng vận hành
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => addNewSection('CORE_VALUES')}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0e243d] hover:bg-blue-900/50 border border-slate-700/60 hover:border-blue-500 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded bg-amber-600/30 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-200 text-xs">3 Trụ cột giá trị</div>
                      <div className="text-[10px] text-slate-400">
                        Tối ưu, Quản lý tập trung, Ra quyết định
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => addNewSection('CUSTOM_TEXT')}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0e243d] hover:bg-blue-900/50 border border-slate-700/60 hover:border-blue-500 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Type className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-200 text-xs">Khối văn bản tự do</div>
                      <div className="text-[10px] text-slate-400">
                        Tiêu đề và đoạn văn bản tùy biến
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => addNewSection('DIVIDER')}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0e243d] hover:bg-blue-900/50 border border-slate-700/60 hover:border-blue-500 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <div className="w-4 h-0.5 bg-slate-300 rounded" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-200 text-xs">Đường phân cách</div>
                      <div className="text-[10px] text-slate-400">Đường kẻ phân tách các khu vực</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => addNewSection('SPACER')}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0e243d] hover:bg-blue-900/50 border border-slate-700/60 hover:border-blue-500 text-left transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-200 text-xs">Khoảng trống (Spacer)</div>
                      <div className="text-[10px] text-slate-400">Tạo khoảng cách giữa các khối</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Section Tree & Reorder */}
            {leftTab === 'tree' && (
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 text-xs">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1 py-1">
                  Kéo thả hoặc bấm mũi tên để đổi vị trí
                </div>

                {sortedSections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                      selectedSectionId === sec.id
                        ? 'bg-blue-900/80 border-[#1688E8] text-white shadow-xs'
                        : 'bg-[#0e243d] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <GripVertical className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-mono text-[10px] text-slate-400">{idx + 1}.</span>
                      <span className="font-semibold truncate">{sec.title}</span>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:text-white disabled:opacity-30 rounded hover:bg-slate-700/50 cursor-pointer"
                        title="Di chuyển lên"
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 'down')}
                        disabled={idx === sortedSections.length - 1}
                        className="p-1 hover:text-white disabled:opacity-30 rounded hover:bg-slate-700/50 cursor-pointer"
                        title="Di chuyển xuống"
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSectionVisibility(sec.id)}
                        className={`p-1 rounded hover:bg-slate-700/50 cursor-pointer ${
                          sec.isVisible ? 'text-cyan-400' : 'text-slate-500'
                        }`}
                        title={sec.isVisible ? 'Đang hiển thị' : 'Đang ẩn'}
                      >
                        {sec.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteModalSectionId(sec.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-950/40 cursor-pointer"
                        title="Xóa khối"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        )}

        {/* ======================================================== */}
        {/* CENTER PANEL: VISUAL CANVAS                              */}
        {/* ======================================================== */}
        <main className="flex-1 bg-[#05111F] overflow-y-auto p-4 sm:p-6 flex flex-col items-center">
          {/* Responsive Canvas Frame */}
          <div
            className={`w-full transition-all duration-300 bg-[#F2F6FA] text-slate-800 rounded-xl shadow-2xl min-h-[90vh] pb-16 ${
              previewDevice === 'mobile'
                ? 'max-w-[375px] border-8 border-slate-800 rounded-[32px] overflow-hidden my-4'
                : previewDevice === 'tablet'
                ? 'max-w-[768px] border-4 border-slate-700 rounded-2xl overflow-hidden my-4'
                : 'max-w-5xl my-2'
            }`}
          >
            {/* Top Brand Bar inside Canvas */}
            <div className="bg-[#082D55] text-white px-5 py-4 border-b border-[#123E6E] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                  O
                </div>
                <span className="font-black text-xs tracking-wide">OOS ENTERPRISE</span>
              </div>
              <span className="text-[10px] text-cyan-300 font-mono bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700">
                LIVE PREVIEW
              </span>
            </div>

            {/* Canvas Sections Stack */}
            <div className="p-4 sm:p-8 space-y-8">
              {sortedSections.map((sec, idx) => {
                const isSelected = selectedSectionId === sec.id && !isCleanPreview;

                return (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`relative transition-all rounded-2xl ${
                      isSelected
                        ? 'ring-2 ring-[#1688E8] shadow-lg shadow-blue-500/10'
                        : !isCleanPreview
                        ? 'hover:ring-1 hover:ring-blue-300'
                        : ''
                    } ${!sec.isVisible ? 'opacity-40 grayscale' : ''}`}
                  >
                    {/* Floating Contextual Toolbar when selected */}
                    {isSelected && (
                      <div className="absolute -top-4 left-4 z-30 flex items-center gap-1 bg-[#082D55] text-white px-2 py-1 rounded-md text-[11px] font-bold shadow-lg border border-blue-400">
                        <span className="text-cyan-300 pr-1.5 border-r border-blue-700 truncate max-w-[140px]">
                          ✦ {sec.title}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSection(idx, 'up');
                          }}
                          disabled={idx === 0}
                          className="p-1 hover:text-cyan-300 disabled:opacity-30 cursor-pointer"
                          title="Lên trên"
                        >
                          <MoveUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSection(idx, 'down');
                          }}
                          disabled={idx === sortedSections.length - 1}
                          className="p-1 hover:text-cyan-300 disabled:opacity-30 cursor-pointer"
                          title="Xuống dưới"
                        >
                          <MoveDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateSection(sec.id);
                          }}
                          className="p-1 hover:text-cyan-300 cursor-pointer"
                          title="Nhân bản khối"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSectionVisibility(sec.id);
                          }}
                          className="p-1 hover:text-cyan-300 cursor-pointer"
                          title={sec.isVisible ? 'Ẩn khối' : 'Hiện khối'}
                        >
                          {sec.isVisible ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-amber-400" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModalSectionId(sec.id);
                          }}
                          className="p-1 text-rose-300 hover:text-rose-100 cursor-pointer"
                          title="Xóa khối"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* SECTION CONTENT RENDERER */}
                    {sec.type === 'BRAND_INTRO' && (
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#082D55] to-[#1688E8] flex flex-col items-center justify-center text-white shrink-0 shadow-md">
                            <Factory className="w-7 h-7 text-cyan-400" />
                            <span className="font-black text-[10px] tracking-wider mt-1">OOS</span>
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              {data.header.departmentName}
                            </span>
                            <h2 className="text-xl font-black text-[#082D55] uppercase mt-1 leading-snug">
                              {data.header.systemName}
                            </h2>
                            <p className="text-xs font-bold text-cyan-700 uppercase mb-2">
                              {data.header.subTitle}
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed italic border-l-2 border-blue-500 pl-3">
                              “{data.header.description}”
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {sec.type === 'GROUP_PHOTO' && (
                      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-extrabold text-base text-[#082D55] flex items-center gap-2">
                            <span className="w-2 h-4 bg-blue-600 rounded-full" />
                            <span>{sec.title}</span>
                          </h3>
                          <span className="text-xs text-slate-400 font-semibold">Tập thể OOS</span>
                        </div>
                        <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                          <img
                            src={data.groupPhoto.imageUrl}
                            alt={data.groupPhoto.caption}
                            className={`w-full max-h-[460px] object-${data.groupPhoto.fit} object-${data.groupPhoto.focalPoint}`}
                          />
                          {data.groupPhoto.caption && (
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white text-xs">
                              {data.groupPhoto.caption}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {sec.type === 'SLOGANS' && (
                      <div className="bg-gradient-to-r from-[#082D55] via-[#0E447E] to-[#1688E8] text-white rounded-2xl p-6 sm:p-8 shadow-md">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300 bg-blue-900/60 px-2.5 py-0.5 rounded-full border border-cyan-400/30">
                          THÔNG ĐIỆP THƯƠNG HIỆU
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black mt-2 text-white leading-snug">
                          “{data.slogans.english}”
                        </h3>
                        <div className="text-sm font-bold text-cyan-200 mt-1 uppercase tracking-wide">
                          {data.slogans.vietnamese}
                        </div>
                      </div>
                    )}

                    {sec.type === 'CAPABILITIES' && (
                      <div className="space-y-3">
                        <h3 className="font-extrabold text-base text-[#082D55] flex items-center gap-2">
                          <span className="w-2 h-4 bg-blue-600 rounded-full" />
                          <span>{sec.title}</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          {data.capabilities.map((cap, cIdx) => (
                            <div
                              key={cap.id}
                              className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs shadow-xs"
                                    style={{ backgroundColor: cap.accentColor }}
                                  >
                                    {renderCapabilityIcon(cap.iconName)}
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    0{cIdx + 1}
                                  </span>
                                </div>
                                <h4 className="font-bold text-xs text-[#082D55] mb-1">
                                  {cap.title}
                                </h4>
                                <p className="text-[11px] text-slate-600 leading-normal">
                                  {cap.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sec.type === 'CORE_VALUES' && (
                      <div className="space-y-3">
                        <h3 className="font-extrabold text-base text-[#082D55] flex items-center gap-2">
                          <span className="w-2 h-4 bg-blue-600 rounded-full" />
                          <span>{sec.title}</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {data.coreValues.map((val) => (
                            <div
                              key={val.id}
                              className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs"
                            >
                              <h4 className="font-bold text-xs text-[#082D55] mb-1">
                                {val.title}
                              </h4>
                              <p className="text-[11px] text-slate-600 leading-normal">
                                {val.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sec.type === 'TEAM_MEMBERS' && (
                      <div className="space-y-4">
                        <h3 className="font-extrabold text-base text-[#082D55] flex items-center gap-2">
                          <span className="w-2 h-4 bg-blue-600 rounded-full" />
                          <span>{sec.title}</span>
                        </h3>

                        {/* Chỉ đạo dự án */}
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                          <span className="text-[10px] font-bold uppercase text-blue-900 tracking-wider">
                            Chỉ đạo dự án ({directorMembers.length})
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                            {directorMembers.map((m) => (
                              <div
                                key={m.id}
                                className="flex items-center gap-3 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100"
                              >
                                <img
                                  src={m.avatar}
                                  alt={m.name}
                                  className="w-12 h-12 rounded-lg object-cover border border-white shrink-0"
                                />
                                <div className="min-w-0">
                                  <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                                    {m.position}
                                  </span>
                                  <div className="font-bold text-xs text-[#082D55] truncate mt-0.5">
                                    {m.name}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Nhóm phát triển & Cố vấn */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-white rounded-xl p-3 border border-slate-200">
                            <span className="text-[10px] font-bold uppercase text-emerald-900 tracking-wider">
                              Nhóm phát triển ({devMembers.length})
                            </span>
                            <div className="space-y-2 mt-2">
                              {devMembers.map((m) => (
                                <div
                                  key={m.id}
                                  className="flex items-center gap-2 p-1.5 rounded bg-slate-50 border border-slate-200/60"
                                >
                                  <img
                                    src={m.avatar}
                                    alt={m.name}
                                    className="w-9 h-9 rounded-md object-cover shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-semibold text-xs text-[#082D55] truncate">
                                      {m.name}
                                    </div>
                                    <div className="text-[10px] text-emerald-700 truncate">
                                      {m.position}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-white rounded-xl p-3 border border-slate-200">
                            <span className="text-[10px] font-bold uppercase text-purple-900 tracking-wider">
                              Nhóm cố vấn ({advisorMembers.length})
                            </span>
                            <div className="space-y-2 mt-2">
                              {advisorMembers.map((m) => (
                                <div
                                  key={m.id}
                                  className="flex items-center gap-2 p-1.5 rounded bg-slate-50 border border-slate-200/60"
                                >
                                  <img
                                    src={m.avatar}
                                    alt={m.name}
                                    className="w-9 h-9 rounded-md object-cover shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-semibold text-xs text-[#082D55] truncate">
                                      {m.name}
                                    </div>
                                    <div className="text-[10px] text-purple-700 truncate">
                                      {m.position}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {sec.type === 'CUSTOM_TEXT' && (
                      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                        <h4 className="font-bold text-sm text-[#082D55] mb-2">{sec.title}</h4>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {sec.customSettings?.textContent || 'Nội dung tùy chỉnh.'}
                        </p>
                      </div>
                    )}

                    {sec.type === 'DIVIDER' && (
                      <div className="py-2">
                        <div className="border-t border-slate-300" />
                      </div>
                    )}

                    {sec.type === 'SPACER' && (
                      <div
                        className="bg-slate-200/30 border border-dashed border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400"
                        style={{ height: sec.customSettings?.spacerHeight || 28 }}
                      >
                        Khoảng trống ({sec.customSettings?.spacerHeight || 28}px)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* ======================================================== */}
        {/* RIGHT PANEL: PROPERTY INSPECTOR                          */}
        {/* ======================================================== */}
        {!isCleanPreview && selectedSection && (
          <aside className="w-80 bg-[#07172B] border-l border-[#152a42] flex flex-col shrink-0 z-20">
            {/* Header of Inspector */}
            <div className="p-3 border-b border-[#152a42] bg-[#051425] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-xs text-white truncate max-w-[170px]">
                  {selectedSection.title}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded">
                {selectedSection.type}
              </span>
            </div>

            {/* Right Tabs */}
            <div className="flex border-b border-[#152a42] bg-[#07172B]">
              <button
                type="button"
                onClick={() => setRightTab('content')}
                className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 cursor-pointer transition-colors ${
                  rightTab === 'content'
                    ? 'border-[#1688E8] text-white bg-blue-950/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Dữ liệu & Nội dung
              </button>
              <button
                type="button"
                onClick={() => setRightTab('style')}
                className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 cursor-pointer transition-colors ${
                  rightTab === 'style'
                    ? 'border-[#1688E8] text-white bg-blue-950/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Giao diện & Căn lề
              </button>
            </div>

            {/* Tab 1: Content Inspector */}
            {rightTab === 'content' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {/* General Section Title */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Tiêu đề khối hiển thị
                  </label>
                  <input
                    type="text"
                    value={selectedSection.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDataWithHistory((prev) => ({
                        ...prev,
                        sections: prev.sections.map((s) =>
                          s.id === selectedSection.id ? { ...s, title: val } : s
                        ),
                      }));
                    }}
                    className="w-full bg-[#0e243d] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* INSPECT BRAND_INTRO */}
                {selectedSection.type === 'BRAND_INTRO' && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Tên hệ thống
                      </label>
                      <input
                        type="text"
                        value={data.header.systemName}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            header: { ...prev.header, systemName: val },
                          }));
                        }}
                        className="w-full bg-[#0e243d] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Phụ đề hệ thống
                      </label>
                      <input
                        type="text"
                        value={data.header.subTitle}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            header: { ...prev.header, subTitle: val },
                          }));
                        }}
                        className="w-full bg-[#0e243d] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Tên bộ phận
                      </label>
                      <input
                        type="text"
                        value={data.header.departmentName}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            header: { ...prev.header, departmentName: val },
                          }));
                        }}
                        className="w-full bg-[#0e243d] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Đoạn giới thiệu sứ mệnh
                      </label>
                      <textarea
                        rows={4}
                        value={data.header.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            header: { ...prev.header, description: val },
                          }));
                        }}
                        className="w-full bg-[#0e243d] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {/* INSPECT GROUP_PHOTO */}
                {selectedSection.type === 'GROUP_PHOTO' && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Tải ảnh từ máy tính (PNG / JPG / WEBP)
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleGroupPhotoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-[#0e243d] hover:bg-blue-900/40 border border-dashed border-blue-500/70 text-cyan-300 font-bold transition-all cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Chọn ảnh mới từ máy tính</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Hoặc đường dẫn ảnh (URL)
                      </label>
                      <input
                        type="text"
                        value={data.groupPhoto.imageUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            groupPhoto: { ...prev.groupPhoto, imageUrl: val },
                          }));
                        }}
                        className="w-full bg-[#0e243d] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Tỉ lệ khung hình
                        </label>
                        <select
                          value={data.groupPhoto.aspectRatio}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            updateDataWithHistory((prev) => ({
                              ...prev,
                              groupPhoto: { ...prev.groupPhoto, aspectRatio: val },
                            }));
                          }}
                          className="w-full bg-[#0e243d] border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                        >
                          <option value="16:9">16:9 (Chuẩn)</option>
                          <option value="4:3">4:3 (Cổ điển)</option>
                          <option value="3:2">3:2 (Ngang)</option>
                          <option value="21:9">21:9 (Rộng)</option>
                          <option value="auto">Tự do</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Điểm căn tiêu điểm
                        </label>
                        <select
                          value={data.groupPhoto.focalPoint}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            updateDataWithHistory((prev) => ({
                              ...prev,
                              groupPhoto: { ...prev.groupPhoto, focalPoint: val },
                            }));
                          }}
                          className="w-full bg-[#0e243d] border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                        >
                          <option value="center">Ở giữa (Center)</option>
                          <option value="top">Phía trên (Top)</option>
                          <option value="bottom">Phía dưới (Bottom)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Chú thích ảnh tập thể
                      </label>
                      <textarea
                        rows={2}
                        value={data.groupPhoto.caption}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            groupPhoto: { ...prev.groupPhoto, caption: val },
                          }));
                        }}
                        className="w-full bg-[#0e243d] border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {/* INSPECT SLOGANS */}
                {selectedSection.type === 'SLOGANS' && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Slogan tiếng Anh
                      </label>
                      <input
                        type="text"
                        value={data.slogans.english}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            slogans: { ...prev.slogans, english: val },
                          }));
                        }}
                        className="w-full bg-[#0e243d] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Slogan tiếng Việt
                      </label>
                      <input
                        type="text"
                        value={data.slogans.vietnamese}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            slogans: { ...prev.slogans, vietnamese: val },
                          }));
                        }}
                        className="w-full bg-[#0e243d] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Dòng chú thích phụ (Tùy chọn)
                      </label>
                      <input
                        type="text"
                        value={data.slogans.englishSub || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            slogans: { ...prev.slogans, englishSub: val },
                          }));
                        }}
                        className="w-full bg-[#0e243d] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {/* INSPECT TEAM_MEMBERS */}
                {selectedSection.type === 'TEAM_MEMBERS' && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300">
                        Danh sách thành viên ({data.teamMembers.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newMember: AboutUsTeamMember = {
                            id: `mem-${Date.now().toString().slice(-4)}`,
                            name: 'Nhân sự mới',
                            position: 'Chức danh công việc',
                            group: 'DEV',
                            avatar:
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                            bio: 'Mô tả ngắn gọn về vai trò và kinh nghiệm chuyên môn.',
                          };
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            teamMembers: [...prev.teamMembers, newMember],
                          }));
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-cyan-300 hover:text-cyan-200 bg-blue-900/60 px-2 py-1 rounded cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm thành viên</span>
                      </button>
                    </div>

                    {/* Member Avatar Hidden File Input */}
                    <input
                      type="file"
                      ref={memberAvatarInputRef}
                      accept="image/*"
                      onChange={handleMemberAvatarUpload}
                      className="hidden"
                    />

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {data.teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="p-2.5 rounded-lg bg-[#0e243d] border border-slate-700/80 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-8 h-8 rounded-md object-cover border border-slate-600 shrink-0"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMemberId(member.id);
                                  memberAvatarInputRef.current?.click();
                                }}
                                className="text-[10px] text-cyan-300 hover:underline cursor-pointer"
                              >
                                Đổi ảnh
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                updateDataWithHistory((prev) => ({
                                  ...prev,
                                  teamMembers: prev.teamMembers.filter((m) => m.id !== member.id),
                                }));
                              }}
                              className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                              title="Xóa nhân sự"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateDataWithHistory((prev) => ({
                                    ...prev,
                                    teamMembers: prev.teamMembers.map((m) =>
                                      m.id === member.id ? { ...m, name: val } : m
                                    ),
                                  }));
                                }}
                                placeholder="Họ và tên"
                                className="w-full bg-[#07172B] border border-slate-700 rounded px-2 py-1 text-xs text-white"
                              />
                            </div>
                            <div>
                              <select
                                value={member.group}
                                onChange={(e) => {
                                  const val = e.target.value as TeamGroupType;
                                  updateDataWithHistory((prev) => ({
                                    ...prev,
                                    teamMembers: prev.teamMembers.map((m) =>
                                      m.id === member.id ? { ...m, group: val } : m
                                    ),
                                  }));
                                }}
                                className="w-full bg-[#07172B] border border-slate-700 rounded p-1 text-xs text-white"
                              >
                                <option value="DIRECTOR">Chỉ đạo dự án</option>
                                <option value="DEV">Nhóm phát triển</option>
                                <option value="ADVISOR">Nhóm cố vấn</option>
                              </select>
                            </div>
                          </div>

                          <input
                            type="text"
                            value={member.position}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDataWithHistory((prev) => ({
                                ...prev,
                                teamMembers: prev.teamMembers.map((m) =>
                                  m.id === member.id ? { ...m, position: val } : m
                                ),
                              }));
                            }}
                            placeholder="Chức danh / Vai trò"
                            className="w-full bg-[#07172B] border border-slate-700 rounded px-2 py-1 text-xs text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* INSPECT CUSTOM_TEXT */}
                {selectedSection.type === 'CUSTOM_TEXT' && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Nội dung văn bản
                      </label>
                      <textarea
                        rows={5}
                        value={selectedSection.customSettings?.textContent || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            sections: prev.sections.map((s) =>
                              s.id === selectedSection.id
                                ? {
                                    ...s,
                                    customSettings: {
                                      ...s.customSettings,
                                      textContent: val,
                                    },
                                  }
                                : s
                            ),
                          }));
                        }}
                        className="w-full bg-[#0e243d] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {/* INSPECT SPACER */}
                {selectedSection.type === 'SPACER' && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Độ cao khoảng cách ({selectedSection.customSettings?.spacerHeight || 28}px)
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="100"
                        step="4"
                        value={selectedSection.customSettings?.spacerHeight || 28}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            sections: prev.sections.map((s) =>
                              s.id === selectedSection.id
                                ? {
                                    ...s,
                                    customSettings: {
                                      ...s.customSettings,
                                      spacerHeight: val,
                                    },
                                  }
                                : s
                            ),
                          }));
                        }}
                        className="w-full cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Style Inspector */}
            {rightTab === 'style' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {/* Visibility Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0e243d] border border-slate-700">
                  <div>
                    <div className="font-semibold text-white">Trạng thái hiển thị</div>
                    <div className="text-[10px] text-slate-400">
                      {selectedSection.isVisible ? 'Đang xuất hiện trên trang' : 'Đang ẩn với người dùng'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSectionVisibility(selectedSection.id)}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                      selectedSection.isVisible
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {selectedSection.isVisible ? 'Hiển thị' : 'Ẩn'}
                  </button>
                </div>

                {/* Padding Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Khoảng đệm dọc (Padding Y)
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-[#0e243d] p-1 rounded-lg border border-slate-700">
                    {(['sm', 'md', 'lg'] as const).map((pad) => (
                      <button
                        key={pad}
                        type="button"
                        onClick={() => {
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            sections: prev.sections.map((s) =>
                              s.id === selectedSection.id
                                ? {
                                    ...s,
                                    customSettings: {
                                      ...s.customSettings,
                                      paddingY: pad,
                                    },
                                  }
                                : s
                            ),
                          }));
                        }}
                        className={`py-1 text-xs font-semibold rounded uppercase cursor-pointer ${
                          (selectedSection.customSettings?.paddingY || 'md') === pad
                            ? 'bg-[#1688E8] text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {pad}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background color choice */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Màu nền khối
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'Trắng', color: '#ffffff' },
                      { name: 'Xám nhạt', color: '#F2F6FA' },
                      { name: 'Navy', color: '#082D55' },
                    ].map((preset) => (
                      <button
                        key={preset.color}
                        type="button"
                        onClick={() => {
                          updateDataWithHistory((prev) => ({
                            ...prev,
                            sections: prev.sections.map((s) =>
                              s.id === selectedSection.id
                                ? {
                                    ...s,
                                    customSettings: {
                                      ...s.customSettings,
                                      bgColor: preset.color,
                                    },
                                  }
                                : s
                            ),
                          }));
                        }}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                          selectedSection.customSettings?.bgColor === preset.color
                            ? 'border-cyan-400 ring-1 ring-cyan-400 text-white'
                            : 'border-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                        style={{ backgroundColor: '#0e243d' }}
                      >
                        <div
                          className="w-5 h-5 rounded-full mx-auto mb-1 border border-slate-400"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span className="text-[10px]">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL: CONFIRM DELETE SECTION                                */}
      {/* ============================================================ */}
      {deleteModalSectionId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0e243d] border border-slate-700 rounded-xl p-5 max-w-sm w-full text-slate-100 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-400 mb-2 font-bold text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Xác nhận xóa khối thành phần</span>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Bạn có chắc chắn muốn xóa khối này khỏi trang? Thao tác có thể hoàn tác bằng nút Undo.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteModalSectionId(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDeleteSection}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CONFIRM RESET TO SAMPLE DEFAULTS                      */}
      {/* ============================================================ */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#0e243d] border border-slate-700 rounded-xl p-5 max-w-md w-full text-slate-100 shadow-2xl">
            <div className="flex items-center gap-2.5 text-amber-400 mb-2 font-bold text-sm">
              <RotateCcw className="w-5 h-5 shrink-0" />
              <span>Khôi phục dữ liệu ban đầu</span>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Khôi phục lại toàn bộ hình ảnh tập thể, danh sách nhân sự, và khẩu hiệu ban đầu của OOS.
              Các chỉnh sửa chưa xuất bản sẽ bị ghi đè.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleResetToInitial}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
              >
                Xác nhận khôi phục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

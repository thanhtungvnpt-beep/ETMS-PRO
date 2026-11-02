import React, { useState, useRef } from 'react';
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
  optimizeImageFile,
  PRESET_GROUP_PHOTOS,
  PRESET_AVATARS,
} from '../../utils/imageOptimization';
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
  Camera,
  Check,
  Globe,
  RefreshCw,
  ExternalLink,
  Search,
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

  // Builder mode: 'standard' (Admin Content Manager matching screenshot) vs 'advanced' (3-panel visual builder)
  const [builderMode, setBuilderMode] = useState<'standard' | 'advanced'>('standard');

  // Preview device & modal
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreenPreviewOpen, setIsFullscreenPreviewOpen] = useState<boolean>(false);
  const [isCleanPreview, setIsCleanPreview] = useState<boolean>(false);

  // Selected section ID for advanced property inspector
  const [selectedSectionId, setSelectedSectionId] = useState<string>('sec-group-photo');
  const [leftTab, setLeftTab] = useState<'components' | 'tree'>('components');

  // Save / status state
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Bản nháp đã lưu');

  // Modals
  const [deleteModalSectionId, setDeleteModalSectionId] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [memberAvatarPickerId, setMemberAvatarPickerId] = useState<string | null>(null);

  // File upload input refs & drag state
  const groupFileInputRef = useRef<HTMLInputElement | null>(null);
  const memberFileInputRef = useRef<HTMLInputElement | null>(null);
  const [editingMemberAvatarId, setEditingMemberAvatarId] = useState<string | null>(null);
  const [isDraggingOverGroupPhoto, setIsDraggingOverGroupPhoto] = useState<boolean>(false);
  const [isOptimizingImage, setIsOptimizingImage] = useState<boolean>(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>('');

  // Helper to commit state change with undo history
  const updateDataWithHistory = (updater: (prev: AboutUsPageData) => AboutUsPageData) => {
    setData((prev) => {
      const next = updater(prev);
      setHistoryPast((past) => [...past.slice(-20), prev]);
      setHistoryFuture([]);
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

  // Group Photo File Upload with Canvas Optimization
  const handleGroupPhotoFile = async (file: File) => {
    try {
      setIsOptimizingImage(true);
      const dataUrl = await optimizeImageFile(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        format: 'image/jpeg',
      });
      updateDataWithHistory((prev) => ({
        ...prev,
        groupPhoto: {
          ...prev.groupPhoto,
          imageUrl: dataUrl,
        },
      }));
    } catch (err: any) {
      alert(err.message || 'Lỗi xử lý tệp ảnh');
    } finally {
      setIsOptimizingImage(false);
    }
  };

  // Member Avatar File Upload with Canvas Optimization
  const handleMemberAvatarFile = async (file: File, memberId: string) => {
    try {
      setIsOptimizingImage(true);
      const dataUrl = await optimizeImageFile(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85,
        format: 'image/jpeg',
      });
      updateDataWithHistory((prev) => ({
        ...prev,
        teamMembers: prev.teamMembers.map((m) =>
          m.id === memberId ? { ...m, avatar: dataUrl } : m
        ),
      }));
    } catch (err: any) {
      alert(err.message || 'Lỗi xử lý ảnh đại diện');
    } finally {
      setIsOptimizingImage(false);
      setEditingMemberAvatarId(null);
    }
  };

  // Add new member to specific sub-group (Director, Developers, Advisors) for immediate editing
  const addNewMember = (group: TeamGroupType) => {
    const groupDefaults: Record<TeamGroupType, { name: string; position: string; presetIdx: number; bio: string }> = {
      DIRECTOR: {
        name: 'Thành viên Chỉ đạo mới',
        position: 'Phó Ban Chỉ đạo',
        presetIdx: 0,
        bio: 'Phụ trách điều hành chiến lược và phân bổ nguồn lực đa nhà máy.',
      },
      DEV: {
        name: 'Kỹ sư mới',
        position: 'Kỹ sư phần mềm OOS',
        presetIdx: 2,
        bio: 'Phát triển các mô-đun phần mềm vận hành và tích hợp dữ liệu.',
      },
      ADVISOR: {
        name: 'Cố vấn mới',
        position: 'Cố vấn chuyên môn',
        presetIdx: 5,
        bio: 'Tư vấn quy trình chuẩn hóa và kiểm soát chất lượng chuyển giao.',
      },
    };
    const config = groupDefaults[group];
    const newMember: AboutUsTeamMember = {
      id: `mem-${group.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      name: config.name,
      position: config.position,
      group,
      avatar: PRESET_AVATARS[config.presetIdx]?.url || PRESET_AVATARS[0].url,
      bio: config.bio,
      email: `member.${Date.now().toString().slice(-4)}@oos.company`,
    };
    updateDataWithHistory((prev) => ({
      ...prev,
      teamMembers: [...prev.teamMembers, newMember],
    }));
    setSelectedSectionId('sec-team');
    setStatusMessage(
      `Đã thêm 1 thành viên mới vào ${
        group === 'DIRECTOR'
          ? 'Chỉ đạo dự án'
          : group === 'DEV'
          ? 'Nhóm phát triển'
          : 'Nhóm cố vấn'
      }`
    );
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

  // Categorized team members
  const directorMembers = data.teamMembers.filter((m) => m.group === 'DIRECTOR');
  const devMembers = data.teamMembers.filter((m) => m.group === 'DEV');
  const advisorMembers = data.teamMembers.filter((m) => m.group === 'ADVISOR');

  // Sorted sections
  const sortedSections = [...data.sections].sort((a, b) => a.order - b.order);
  const selectedSection = data.sections.find((s) => s.id === selectedSectionId);

  // Capability icons helper
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
    <div className="flex flex-col h-full bg-[#F2F6FA] text-slate-800 font-sans select-none overflow-hidden">
      {/* ============================================================ */}
      {/* TOP HEADER & CONTROLS                                        */}
      {/* ============================================================ */}
      <header className="h-16 bg-[#082D55] text-white px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-md border-b border-[#123E6E]">
        {/* Left: Exit & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-slate-200 text-xs font-semibold border border-blue-800 transition-all cursor-pointer"
            title="Quay lại trang xem chính thức"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-300" />
            <span className="hidden sm:inline">Quay lại xem trang</span>
          </button>

          <div className="h-5 w-px bg-blue-800 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                Quản lý nội dung - Giới thiệu về chúng tôi
              </h2>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-cyan-200 border border-blue-400/40">
                ADMIN
              </span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-2">
              <span className={isDirty ? 'text-amber-300 font-semibold' : 'text-cyan-300'}>
                ● {statusMessage}
              </span>
              <span>•</span>
              <span>Cập nhật bởi {currentUser.name}</span>
            </div>
          </div>
        </div>

        {/* Center: Mode Switcher (Standard Form vs Canvas Builder) */}
        <div className="hidden lg:flex items-center bg-[#051C36] p-1 rounded-lg border border-blue-900/60">
          <button
            type="button"
            onClick={() => setBuilderMode('standard')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
              builderMode === 'standard'
                ? 'bg-[#1688E8] text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Biểu mẫu quản lý nội dung
          </button>
          <button
            type="button"
            onClick={() => setBuilderMode('advanced')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
              builderMode === 'advanced'
                ? 'bg-[#1688E8] text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Trình thiết kế kéo thả nâng cao
          </button>
        </div>

        {/* Right: Actions */}
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

          {/* Reset Template */}
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="p-2 text-slate-300 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-800"
            title="Khôi phục nội dung mẫu ban đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fullscreen Preview Toggle Button */}
          <button
            type="button"
            onClick={() => setIsFullscreenPreviewOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-cyan-200 text-xs font-bold border border-blue-700 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-cyan-300" />
            <span className="hidden md:inline">Xem trước giao diện</span>
          </button>

          {/* Save Changes Button */}
          <button
            type="button"
            onClick={handlePublish}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#1688E8] hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer border border-blue-400/40"
          >
            <Send className="w-3.5 h-3.5 text-cyan-200" />
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MODE 1: STANDARD OOS ADMIN CONTENT MANAGER (SCREENSHOT MATCH) */}
      {/* ============================================================ */}
      {builderMode === 'standard' && (
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT COLUMN: EDIT FORM */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="mb-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#082D55] tracking-tight">
                Quản lý nội dung - Giới thiệu về chúng tôi
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Cập nhật thông tin hiển thị trên màn hình đăng nhập và trang giới thiệu OOS
              </p>
            </div>

            {/* SECTION 1: ẢNH TẬP THỂ BỘ PHẬN */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#1688E8]" />
                    <h3 className="font-extrabold text-sm sm:text-base text-[#082D55]">
                      Ảnh tập thể bộ phận
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ảnh này sẽ hiển thị trên màn hình đăng nhập (phần giới thiệu) và trang Về chúng tôi.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Khuyến nghị: 1920 × 800 px
                </span>
              </div>

              {/* Photo preview & upload dropzone side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Photo Preview with Delete Button */}
                <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner group h-44 sm:h-48 flex items-center justify-center">
                  <img
                    src={data.groupPhoto.imageUrl}
                    alt="Ảnh tập thể OOS"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  {isOptimizingImage && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-2">
                      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Đang xử lý ảnh...</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      updateDataWithHistory((prev) => ({
                        ...prev,
                        groupPhoto: {
                          ...prev.groupPhoto,
                          imageUrl: PRESET_GROUP_PHOTOS[0].url,
                        },
                      }));
                    }}
                    className="absolute bottom-2.5 right-2.5 p-2 bg-black/70 hover:bg-black/90 text-white rounded-lg backdrop-blur-md shadow-md border border-white/20 transition-all cursor-pointer"
                    title="Đặt lại ảnh mặc định"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                </div>

                {/* Dropzone & Browse Upload Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOverGroupPhoto(true);
                  }}
                  onDragLeave={() => setIsDraggingOverGroupPhoto(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOverGroupPhoto(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleGroupPhotoFile(file);
                  }}
                  className={`h-44 sm:h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center transition-all cursor-pointer ${
                    isDraggingOverGroupPhoto
                      ? 'border-[#1688E8] bg-blue-50/80'
                      : 'border-slate-300 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/30'
                  }`}
                  onClick={() => groupFileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={groupFileInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleGroupPhotoFile(file);
                    }}
                    className="hidden"
                  />

                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#082D55]">
                    Nhấp để tải ảnh mới
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    PNG, JPG (tối đa 5MB) • Kéo thả tệp vào đây
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      groupFileInputRef.current?.click();
                    }}
                    className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-blue-500 text-xs font-bold text-slate-700 hover:text-blue-600 shadow-xs transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>Chọn ảnh</span>
                  </button>
                </div>
              </div>

              {/* URL & Preset Select */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                <div className="w-full sm:flex-1">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Hoặc nhập trực tiếp URL hình ảnh
                  </label>
                  <input
                    type="url"
                    value={data.groupPhoto.imageUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDataWithHistory((prev) => ({
                        ...prev,
                        groupPhoto: { ...prev.groupPhoto, imageUrl: val },
                      }));
                    }}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="w-full sm:w-auto shrink-0 flex items-center gap-1.5 self-end">
                  <span className="text-[11px] text-slate-400">Ảnh mẫu:</span>
                  {PRESET_GROUP_PHOTOS.slice(0, 3).map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        updateDataWithHistory((prev) => ({
                          ...prev,
                          groupPhoto: { ...prev.groupPhoto, imageUrl: p.url },
                        }));
                      }}
                      className="px-2 py-1 text-[10px] font-bold rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                      title={p.title}
                    >
                      Mẫu {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 2: SLOGAN */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1688E8]" />
                  <h3 className="font-extrabold text-sm sm:text-base text-[#082D55]">
                    Slogan thương hiệu
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Slogan sẽ hiển thị trên màn hình đăng nhập và banner trang giới thiệu
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Slogan (Tiếng Anh)
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {data.slogans.english.length}/100
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={100}
                    value={data.slogans.english}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDataWithHistory((prev) => ({
                        ...prev,
                        slogans: { ...prev.slogans, english: val },
                      }));
                    }}
                    placeholder="One Team. Connected Factories. Unified Operations."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Slogan (Tiếng Việt)
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {data.slogans.vietnamese.length}/100
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={100}
                    value={data.slogans.vietnamese}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateDataWithHistory((prev) => ({
                        ...prev,
                        slogans: { ...prev.slogans, vietnamese: val },
                      }));
                    }}
                    placeholder="KẾT NỐI NHÀ MÁY — ĐIỀU PHỐI NGUỒN LỰC — THỐNG NHẤT VẬN HÀNH"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: ĐỘI NGŨ DỰ ÁN & MÀN HÌNH NHẬP LIỆU NHÂN SỰ */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#1688E8]" />
                    <h3 className="font-extrabold text-base sm:text-lg text-[#082D55]">
                      Màn hình nhập liệu đội ngũ nhân sự
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quản lý danh sách, hồ sơ và ảnh đại diện của từng thành viên trong bộ phận OOS
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    Tổng: {data.teamMembers.length} thành viên
                  </span>
                </div>
              </div>

              {/* Sub-bar: Search & Quick Add */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder="Tìm nhanh nhân sự theo họ tên, chức danh hoặc vai trò..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                  {memberSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMemberSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => addNewMember('DIRECTOR')}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 bg-blue-100/70 hover:bg-blue-100 border border-blue-300 rounded-lg cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3 text-blue-700" />
                    <span>+ Chỉ đạo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addNewMember('DEV')}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-100 border border-emerald-300 rounded-lg cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3 text-emerald-700" />
                    <span>+ Kỹ sư</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addNewMember('ADVISOR')}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-purple-700 bg-purple-100/70 hover:bg-purple-100 border border-purple-300 rounded-lg cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3 text-purple-700" />
                    <span>+ Cố vấn</span>
                  </button>
                </div>
              </div>

              {/* Hidden file input for member avatar */}
              <input
                type="file"
                ref={memberFileInputRef}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && editingMemberAvatarId) {
                    handleMemberAvatarFile(file, editingMemberAvatarId);
                  }
                }}
                className="hidden"
              />

              {/* 3 Categories Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. CHỈ ĐẠO DỰ ÁN */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-blue-900">
                          Chỉ đạo dự án
                        </h4>
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-200">
                          {directorMembers.length}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => addNewMember('DIRECTOR')}
                        className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-100/80 hover:bg-blue-100 px-2 py-0.5 rounded cursor-pointer transition-colors"
                        title="Thêm thành viên vào Ban chỉ đạo"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm</span>
                      </button>
                    </div>

                    <div className="team-members-grid space-y-3">
                      {directorMembers
                        .filter(
                          (m) =>
                            !memberSearchQuery ||
                            m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                            m.position.toLowerCase().includes(memberSearchQuery.toLowerCase())
                        )
                        .map((member) => (
                          <div
                            key={member.id}
                            className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-2.5 relative group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="relative group shrink-0">
                                <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMemberAvatarId(member.id);
                                    memberFileInputRef.current?.click();
                                  }}
                                  className="absolute -bottom-1 -right-1 p-1 bg-[#1688E8] hover:bg-blue-600 text-white rounded-full shadow-md cursor-pointer transition-transform hover:scale-110"
                                  title="Tải ảnh chân dung mới"
                                >
                                  <Camera className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="flex-1 space-y-1.5 min-w-0">
                                <div className="flex items-center justify-between gap-1">
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
                                    placeholder="Họ và tên..."
                                    className="w-full px-2 py-0.5 text-xs font-bold rounded border border-slate-300 bg-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateDataWithHistory((prev) => ({
                                        ...prev,
                                        teamMembers: prev.teamMembers.filter((m) => m.id !== member.id),
                                      }));
                                    }}
                                    className="text-slate-300 hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                                    title="Xóa nhân sự"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
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
                                  placeholder="Chức danh..."
                                  className="w-full px-2 py-0.5 text-[11px] rounded border border-slate-300 bg-white"
                                />

                                <input
                                  type="text"
                                  value={member.bio || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateDataWithHistory((prev) => ({
                                      ...prev,
                                      teamMembers: prev.teamMembers.map((m) =>
                                        m.id === member.id ? { ...m, bio: val } : m
                                      ),
                                    }));
                                  }}
                                  placeholder="Tiểu sử / tóm tắt..."
                                  className="w-full px-2 py-0.5 text-[10px] text-slate-500 rounded border border-slate-200 bg-slate-50"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => setMemberAvatarPickerId(member.id)}
                                className="text-blue-600 hover:underline cursor-pointer font-semibold"
                              >
                                Chọn ảnh mẫu
                              </button>
                              <span className="text-slate-400 font-mono">ID: {member.id}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => addNewMember('DIRECTOR')}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm nhân sự Chỉ đạo</span>
                  </button>
                </div>

                {/* 2. NHÓM PHÁT TRIỂN */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-900">
                          Nhóm phát triển
                        </h4>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                          {devMembers.length}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => addNewMember('DEV')}
                        className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-100/80 hover:bg-emerald-100 px-2 py-0.5 rounded cursor-pointer transition-colors"
                        title="Thêm thành viên vào Nhóm phát triển"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm</span>
                      </button>
                    </div>

                    <div className="team-members-grid space-y-3">
                      {devMembers
                        .filter(
                          (m) =>
                            !memberSearchQuery ||
                            m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                            m.position.toLowerCase().includes(memberSearchQuery.toLowerCase())
                        )
                        .map((member) => (
                          <div
                            key={member.id}
                            className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-2.5 relative group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="relative shrink-0">
                                <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMemberAvatarId(member.id);
                                    memberFileInputRef.current?.click();
                                  }}
                                  className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xs cursor-pointer"
                                  title="Đổi ảnh"
                                >
                                  <Camera className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center justify-between gap-1">
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
                                    placeholder="Tên thành viên..."
                                    className="w-full px-2 py-0.5 text-xs font-bold rounded border border-slate-300 bg-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateDataWithHistory((prev) => ({
                                        ...prev,
                                        teamMembers: prev.teamMembers.filter((m) => m.id !== member.id),
                                      }));
                                    }}
                                    className="text-slate-300 hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                                    title="Xóa thành viên"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
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
                                  placeholder="Vai trò..."
                                  className="w-full px-2 py-0.5 text-[11px] rounded border border-slate-300 bg-white"
                                />

                                <input
                                  type="text"
                                  value={member.bio || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateDataWithHistory((prev) => ({
                                      ...prev,
                                      teamMembers: prev.teamMembers.map((m) =>
                                        m.id === member.id ? { ...m, bio: val } : m
                                      ),
                                    }));
                                  }}
                                  placeholder="Tiểu sử / tóm tắt..."
                                  className="w-full px-2 py-0.5 text-[10px] text-slate-500 rounded border border-slate-200 bg-slate-50"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => setMemberAvatarPickerId(member.id)}
                                className="text-emerald-600 hover:underline cursor-pointer font-semibold"
                              >
                                Chọn ảnh mẫu
                              </button>
                              <span className="text-slate-400 font-mono">ID: {member.id}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => addNewMember('DEV')}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm nhân sự Phát triển</span>
                  </button>
                </div>

                {/* 3. NHÓM CỐ VẤN */}
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-600" />
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-purple-900">
                          Nhóm cố vấn
                        </h4>
                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded-full border border-purple-200">
                          {advisorMembers.length}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => addNewMember('ADVISOR')}
                        className="flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-800 bg-purple-100/80 hover:bg-purple-100 px-2 py-0.5 rounded cursor-pointer transition-colors"
                        title="Thêm thành viên vào Nhóm cố vấn"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm</span>
                      </button>
                    </div>

                    <div className="team-members-grid space-y-3">
                      {advisorMembers
                        .filter(
                          (m) =>
                            !memberSearchQuery ||
                            m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                            m.position.toLowerCase().includes(memberSearchQuery.toLowerCase())
                        )
                        .map((member) => (
                          <div
                            key={member.id}
                            className="p-3 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-2.5 relative group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="relative shrink-0">
                                <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMemberAvatarId(member.id);
                                    memberFileInputRef.current?.click();
                                  }}
                                  className="absolute -bottom-1 -right-1 p-0.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-xs cursor-pointer"
                                  title="Đổi ảnh"
                                >
                                  <Camera className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center justify-between gap-1">
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
                                    placeholder="Tên cố vấn..."
                                    className="w-full px-2 py-0.5 text-xs font-bold rounded border border-slate-300 bg-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateDataWithHistory((prev) => ({
                                        ...prev,
                                        teamMembers: prev.teamMembers.filter((m) => m.id !== member.id),
                                      }));
                                    }}
                                    className="text-slate-300 hover:text-rose-500 p-0.5 transition-colors cursor-pointer"
                                    title="Xóa cố vấn"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
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
                                  placeholder="Vai trò..."
                                  className="w-full px-2 py-0.5 text-[11px] rounded border border-slate-300 bg-white"
                                />

                                <input
                                  type="text"
                                  value={member.bio || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateDataWithHistory((prev) => ({
                                      ...prev,
                                      teamMembers: prev.teamMembers.map((m) =>
                                        m.id === member.id ? { ...m, bio: val } : m
                                      ),
                                    }));
                                  }}
                                  placeholder="Tiểu sử / tóm tắt..."
                                  className="w-full px-2 py-0.5 text-[10px] text-slate-500 rounded border border-slate-200 bg-slate-50"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => setMemberAvatarPickerId(member.id)}
                                className="text-purple-600 hover:underline cursor-pointer font-semibold"
                              >
                                Chọn ảnh mẫu
                              </button>
                              <span className="text-slate-400 font-mono">ID: {member.id}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => addNewMember('ADVISOR')}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm nhân sự Cố vấn</span>
                  </button>
                </div>
              </div>
            </div>

            {/* BOTTOM ACTIONS BAR */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePublish}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1688E8] hover:bg-blue-600 active:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Cập nhật lần cuối: <span className="font-semibold text-slate-700">{data.lastUpdated}</span> | bởi <span className="font-semibold text-slate-700">{data.updatedBy}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: REALTIME PREVIEW ON LOGIN / MOBILE CARD */}
          <div className="w-[420px] lg:w-[460px] xl:w-[500px] border-l border-slate-200 bg-[#07172B] p-4 lg:p-6 overflow-y-auto hidden md:flex flex-col shrink-0">
            <div className="flex items-center justify-between mb-3 text-white">
              <span className="text-xs font-bold tracking-tight text-slate-300">
                Xem trước hiển thị trên màn hình đăng nhập
              </span>
              <button
                type="button"
                onClick={() => setIsFullscreenPreviewOpen(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-semibold"
              >
                <span>Xem toàn màn hình</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile / Portal Card Preview */}
            <div className="bg-gradient-to-b from-[#082D55] via-[#093566] to-[#04162B] text-white rounded-3xl p-5 shadow-2xl border border-blue-900/60 space-y-4">
              {/* Header inside Card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1688E8] to-[#55D5FF] flex items-center justify-center text-white shadow-xs">
                    <Factory className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-black text-xs tracking-wider uppercase leading-none">
                      OUTSOURCING
                    </div>
                    <div className="font-bold text-[9px] text-cyan-300 tracking-wider">
                      OPERATION SYSTEM
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[10px] bg-blue-950/80 px-2 py-1 rounded-md border border-blue-800 text-slate-200">
                  <Globe className="w-3 h-3 text-cyan-400" />
                  <span>Tiếng Việt ▾</span>
                </div>
              </div>

              {/* Live Group Photo Card */}
              <div className="rounded-2xl overflow-hidden border border-blue-400/30 shadow-lg relative bg-slate-900">
                <img
                  src={data.groupPhoto.imageUrl}
                  alt="Live Preview"
                  className="w-full h-40 object-cover"
                />
              </div>

              {/* Slogans */}
              <div className="text-center space-y-1">
                <div className="text-base font-serif italic text-cyan-200 tracking-wide">
                  “{data.slogans.english}”
                </div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                  {data.slogans.vietnamese}
                </div>
              </div>

              {/* 7 Capabilities Grid */}
              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {data.capabilities.map((cap) => (
                  <div
                    key={cap.id}
                    className="flex flex-col items-center p-1.5 rounded-lg bg-blue-950/60 border border-blue-900 text-center"
                    title={cap.title}
                  >
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-white mb-1 shadow-xs text-xs"
                      style={{ backgroundColor: cap.accentColor }}
                    >
                      {renderCapabilityIcon(cap.iconName)}
                    </div>
                    <span className="text-[8px] font-medium text-slate-300 line-clamp-1">
                      {cap.title.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>

              {/* 3 Core Values */}
              <div className="space-y-2 pt-2 border-t border-blue-900/60 text-xs">
                {data.coreValues.map((v) => (
                  <div key={v.id} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded bg-blue-900/80 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-[11px]">{v.title}</div>
                      <div className="text-[10px] text-slate-300 line-clamp-1">{v.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer text */}
              <div className="pt-2 border-t border-blue-950 text-[9px] text-center text-slate-400">
                OOS v2.0.0 • Bản quyền © 2025 Outsourcing Operation System
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 2: ADVANCED 3-PANEL DRAG-AND-DROP CANVAS BUILDER        */}
      {/* ============================================================ */}
      {builderMode === 'advanced' && (
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT PANEL: COMPONENT LIBRARY & TREE */}
          <aside className="w-72 bg-[#07172B] border-r border-[#152a42] text-slate-100 flex flex-col shrink-0 z-20">
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
                Cấu trúc ({data.sections.length})
              </button>
            </div>

            {leftTab === 'components' ? (
              <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => addNewSection('GROUP_PHOTO')}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-[#0e243d] hover:bg-blue-900/50 border border-slate-700/60 text-left cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-bold text-slate-200">Ảnh tập thể bộ phận</div>
                    <div className="text-[10px] text-slate-400">Ảnh đoàn thể, tỉ lệ linh hoạt</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => addNewSection('TEAM_MEMBERS')}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-[#0e243d] hover:bg-blue-900/50 border border-slate-700/60 text-left cursor-pointer"
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-bold text-slate-200">Thẻ đội ngũ dự án</div>
                    <div className="text-[10px] text-slate-400">Ban chỉ đạo & kỹ sư</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => addNewSection('SLOGANS')}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-[#0e243d] hover:bg-blue-900/50 border border-slate-700/60 text-left cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-bold text-slate-200">Slogan thương hiệu</div>
                    <div className="text-[10px] text-slate-400">Thông điệp Anh - Việt</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => addNewSection('CAPABILITIES')}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-[#0e243d] hover:bg-blue-900/50 border border-slate-700/60 text-left cursor-pointer"
                >
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-bold text-slate-200">7 Năng lực bộ phận</div>
                    <div className="text-[10px] text-slate-400">Lưới module chức năng</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => addNewSection('CUSTOM_TEXT')}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-[#0e243d] hover:bg-blue-900/50 border border-slate-700/60 text-left cursor-pointer"
                >
                  <Type className="w-4 h-4 text-slate-300" />
                  <div>
                    <div className="font-bold text-slate-200">Khối văn bản tự do</div>
                    <div className="text-[10px] text-slate-400">Đoạn mô tả bổ sung</div>
                  </div>
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 text-xs">
                {sortedSections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                      selectedSectionId === sec.id
                        ? 'bg-blue-900/80 border-[#1688E8] text-white'
                        : 'bg-[#0e243d] border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="font-semibold truncate">{sec.title}</span>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:text-white disabled:opacity-30"
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 'down')}
                        disabled={idx === sortedSections.length - 1}
                        className="p-1 hover:text-white disabled:opacity-30"
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>

          {/* CENTER CANVAS */}
          <main className="flex-1 bg-[#05111F] overflow-y-auto p-4 sm:p-6 flex flex-col items-center">
            <div className="w-full max-w-4xl bg-[#F2F6FA] text-slate-800 rounded-xl shadow-2xl min-h-[85vh] p-6 space-y-6">
              <div className="bg-[#082D55] text-white p-4 rounded-xl flex items-center justify-between">
                <span className="font-black text-xs">OOS ENTERPRISE • BẢN THIẾT KẾ</span>
                <span className="text-[10px] font-mono text-cyan-300">TRỰC QUAN</span>
              </div>

              {sortedSections.map((sec) => (
                <div
                  key={sec.id}
                  onClick={() => setSelectedSectionId(sec.id)}
                  className={`relative p-4 rounded-xl transition-all cursor-pointer ${
                    selectedSectionId === sec.id
                      ? 'ring-2 ring-[#1688E8] bg-blue-50/30'
                      : 'hover:ring-1 hover:ring-blue-200'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">
                    {sec.title}
                  </div>
                  {sec.type === 'GROUP_PHOTO' && (
                    <div className="rounded-xl overflow-hidden max-h-64 bg-slate-900">
                      <img src={data.groupPhoto.imageUrl} alt="Group" className="w-full object-cover" />
                    </div>
                  )}
                  {sec.type === 'SLOGANS' && (
                    <div className="p-4 rounded-xl bg-[#082D55] text-white text-center">
                      <div className="text-lg font-bold">“{data.slogans.english}”</div>
                      <div className="text-xs text-cyan-300 mt-1">{data.slogans.vietnamese}</div>
                    </div>
                  )}
                  {sec.type === 'TEAM_MEMBERS' && (
                    <div className="space-y-6">
                      {/* Sub-group 1: Chỉ đạo dự án (Project Director) */}
                      <div className="bg-white rounded-xl p-4 border border-blue-200/80 shadow-xs">
                        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-blue-100">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                            <h4 className="font-extrabold text-xs uppercase tracking-wider text-blue-900">
                              Chỉ đạo dự án (Project Director)
                            </h4>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              {directorMembers.length} thành viên
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addNewMember('DIRECTOR');
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-lg cursor-pointer transition-all shadow-2xs hover:shadow-xs active:scale-95"
                            title="Thêm nhân sự vào Ban chỉ đạo"
                          >
                            <Plus className="w-3.5 h-3.5 text-blue-600" />
                            <span>Add New Member</span>
                          </button>
                        </div>

                        <div className="team-members-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {directorMembers.map((m) => (
                            <div
                              key={m.id}
                              onClick={(e) => e.stopPropagation()}
                              className="flex flex-col p-3 rounded-xl bg-gradient-to-br from-blue-50/60 to-white border border-blue-200/80 shadow-2xs hover:border-blue-400 transition-all space-y-2.5 group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="relative shrink-0">
                                  <img
                                    src={m.avatar}
                                    alt={m.name}
                                    className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMemberAvatarPickerId(m.id);
                                    }}
                                    className="absolute -bottom-1 -right-1 p-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xs cursor-pointer transition-transform hover:scale-110"
                                    title="Chọn ảnh mẫu / Đổi ảnh"
                                  >
                                    <Camera className="w-3 h-3" />
                                  </button>
                                </div>

                                <div className="flex-1 min-w-0 space-y-1.5">
                                  <div className="flex items-center justify-between gap-1">
                                    <input
                                      type="text"
                                      value={m.name}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        updateDataWithHistory((prev) => ({
                                          ...prev,
                                          teamMembers: prev.teamMembers.map((item) =>
                                            item.id === m.id ? { ...item, name: val } : item
                                          ),
                                        }));
                                      }}
                                      placeholder="Họ và tên..."
                                      className="w-full px-2 py-0.5 text-xs font-bold text-[#082D55] bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateDataWithHistory((prev) => ({
                                          ...prev,
                                          teamMembers: prev.teamMembers.filter((item) => item.id !== m.id),
                                        }));
                                      }}
                                      className="text-slate-300 hover:text-rose-500 p-0.5 cursor-pointer transition-colors"
                                      title="Xóa nhân sự"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <input
                                    type="text"
                                    value={m.position}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      updateDataWithHistory((prev) => ({
                                        ...prev,
                                        teamMembers: prev.teamMembers.map((item) =>
                                          item.id === m.id ? { ...item, position: val } : item
                                        ),
                                      }));
                                    }}
                                    placeholder="Chức danh..."
                                    className="w-full px-2 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50/50 border border-blue-200 rounded focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                              </div>

                              <input
                                type="text"
                                value={m.bio || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateDataWithHistory((prev) => ({
                                    ...prev,
                                    teamMembers: prev.teamMembers.map((item) =>
                                      item.id === m.id ? { ...item, bio: val } : item
                                    ),
                                  }));
                                }}
                                placeholder="Tiểu sử / tóm tắt vai trò..."
                                className="w-full px-2 py-0.5 text-[10px] text-slate-600 bg-white border border-slate-200 rounded"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sub-group 2: Nhóm phát triển (Developers) */}
                      <div className="bg-white rounded-xl p-4 border border-emerald-200/80 shadow-xs">
                        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-emerald-100">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                            <h4 className="font-extrabold text-xs uppercase tracking-wider text-emerald-900">
                              Nhóm phát triển (Developers)
                            </h4>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {devMembers.length} thành viên
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addNewMember('DEV');
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg cursor-pointer transition-all shadow-2xs hover:shadow-xs active:scale-95"
                            title="Thêm kỹ sư vào Nhóm phát triển"
                          >
                            <Plus className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Add New Member</span>
                          </button>
                        </div>

                        <div className="team-members-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {devMembers.map((m) => (
                            <div
                              key={m.id}
                              onClick={(e) => e.stopPropagation()}
                              className="flex flex-col p-3 rounded-xl bg-slate-50/70 border border-slate-200 hover:bg-white hover:border-emerald-400 transition-all space-y-2.5 group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="relative shrink-0">
                                  <img
                                    src={m.avatar}
                                    alt={m.name}
                                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMemberAvatarPickerId(m.id);
                                    }}
                                    className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xs cursor-pointer transition-transform hover:scale-110"
                                    title="Chọn ảnh mẫu / Đổi ảnh"
                                  >
                                    <Camera className="w-3 h-3" />
                                  </button>
                                </div>

                                <div className="flex-1 min-w-0 space-y-1.5">
                                  <div className="flex items-center justify-between gap-1">
                                    <input
                                      type="text"
                                      value={m.name}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        updateDataWithHistory((prev) => ({
                                          ...prev,
                                          teamMembers: prev.teamMembers.map((item) =>
                                            item.id === m.id ? { ...item, name: val } : item
                                          ),
                                        }));
                                      }}
                                      placeholder="Tên kỹ sư..."
                                      className="w-full px-2 py-0.5 text-xs font-bold text-[#082D55] bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateDataWithHistory((prev) => ({
                                          ...prev,
                                          teamMembers: prev.teamMembers.filter((item) => item.id !== m.id),
                                        }));
                                      }}
                                      className="text-slate-300 hover:text-rose-500 p-0.5 cursor-pointer transition-colors"
                                      title="Xóa kỹ sư"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <input
                                    type="text"
                                    value={m.position}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      updateDataWithHistory((prev) => ({
                                        ...prev,
                                        teamMembers: prev.teamMembers.map((item) =>
                                          item.id === m.id ? { ...item, position: val } : item
                                        ),
                                      }));
                                    }}
                                    placeholder="Vai trò..."
                                    className="w-full px-2 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50/50 border border-emerald-200 rounded focus:ring-1 focus:ring-emerald-500"
                                  />
                                </div>
                              </div>

                              <input
                                type="text"
                                value={m.bio || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateDataWithHistory((prev) => ({
                                    ...prev,
                                    teamMembers: prev.teamMembers.map((item) =>
                                      item.id === m.id ? { ...item, bio: val } : item
                                    ),
                                  }));
                                }}
                                placeholder="Tiểu sử / tóm tắt vai trò..."
                                className="w-full px-2 py-0.5 text-[10px] text-slate-600 bg-white border border-slate-200 rounded"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sub-group 3: Nhóm cố vấn (Advisors) */}
                      <div className="bg-white rounded-xl p-4 border border-purple-200/80 shadow-xs">
                        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-purple-100">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                            <h4 className="font-extrabold text-xs uppercase tracking-wider text-purple-900">
                              Nhóm cố vấn (Advisors)
                            </h4>
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                              {advisorMembers.length} thành viên
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addNewMember('ADVISOR');
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-300 rounded-lg cursor-pointer transition-all shadow-2xs hover:shadow-xs active:scale-95"
                            title="Thêm chuyên gia vào Nhóm cố vấn"
                          >
                            <Plus className="w-3.5 h-3.5 text-purple-600" />
                            <span>Add New Member</span>
                          </button>
                        </div>

                        <div className="team-members-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {advisorMembers.map((m) => (
                            <div
                              key={m.id}
                              onClick={(e) => e.stopPropagation()}
                              className="flex flex-col p-3 rounded-xl bg-slate-50/70 border border-slate-200 hover:bg-white hover:border-purple-400 transition-all space-y-2.5 group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="relative shrink-0">
                                  <img
                                    src={m.avatar}
                                    alt={m.name}
                                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMemberAvatarPickerId(m.id);
                                    }}
                                    className="absolute -bottom-1 -right-1 p-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-xs cursor-pointer transition-transform hover:scale-110"
                                    title="Chọn ảnh mẫu / Đổi ảnh"
                                  >
                                    <Camera className="w-3 h-3" />
                                  </button>
                                </div>

                                <div className="flex-1 min-w-0 space-y-1.5">
                                  <div className="flex items-center justify-between gap-1">
                                    <input
                                      type="text"
                                      value={m.name}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        updateDataWithHistory((prev) => ({
                                          ...prev,
                                          teamMembers: prev.teamMembers.map((item) =>
                                            item.id === m.id ? { ...item, name: val } : item
                                          ),
                                        }));
                                      }}
                                      placeholder="Tên cố vấn..."
                                      className="w-full px-2 py-0.5 text-xs font-bold text-[#082D55] bg-white border border-slate-300 rounded focus:ring-1 focus:ring-purple-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateDataWithHistory((prev) => ({
                                          ...prev,
                                          teamMembers: prev.teamMembers.filter((item) => item.id !== m.id),
                                        }));
                                      }}
                                      className="text-slate-300 hover:text-rose-500 p-0.5 cursor-pointer transition-colors"
                                      title="Xóa cố vấn"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <input
                                    type="text"
                                    value={m.position}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      updateDataWithHistory((prev) => ({
                                        ...prev,
                                        teamMembers: prev.teamMembers.map((item) =>
                                          item.id === m.id ? { ...item, position: val } : item
                                        ),
                                      }));
                                    }}
                                    placeholder="Vai trò..."
                                    className="w-full px-2 py-0.5 text-[11px] font-semibold text-purple-700 bg-purple-50/50 border border-purple-200 rounded focus:ring-1 focus:ring-purple-500"
                                  />
                                </div>
                              </div>

                              <input
                                type="text"
                                value={m.bio || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  updateDataWithHistory((prev) => ({
                                    ...prev,
                                    teamMembers: prev.teamMembers.map((item) =>
                                      item.id === m.id ? { ...item, bio: val } : item
                                    ),
                                  }));
                                }}
                                placeholder="Tiểu sử / tóm tắt vai trò..."
                                className="w-full px-2 py-0.5 text-[10px] text-slate-600 bg-white border border-slate-200 rounded"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </main>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: PRESET AVATAR GALLERY QUICK SELECT                    */}
      {/* ============================================================ */}
      {memberAvatarPickerId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-[#082D55]">
                Chọn ảnh chân dung mẫu chất lượng cao
              </h3>
              <button
                type="button"
                onClick={() => setMemberAvatarPickerId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2.5 my-4">
              {PRESET_AVATARS.map((av) => (
                <div
                  key={av.id}
                  onClick={() => {
                    updateDataWithHistory((prev) => ({
                      ...prev,
                      teamMembers: prev.teamMembers.map((m) =>
                        m.id === memberAvatarPickerId ? { ...m, avatar: av.url } : m
                      ),
                    }));
                    setMemberAvatarPickerId(null);
                  }}
                  className="rounded-xl overflow-hidden border-2 border-slate-200 hover:border-blue-500 cursor-pointer transition-all hover:scale-105"
                >
                  <img src={av.url} alt={av.role} className="w-full h-16 object-cover" />
                  <div className="text-[9px] text-center bg-slate-50 py-0.5 text-slate-600 font-semibold truncate">
                    {av.gender}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: FULLSCREEN LIVE PREVIEW                               */}
      {/* ============================================================ */}
      {isFullscreenPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-[#F2F6FA] overflow-y-auto flex flex-col">
          <div className="bg-[#082D55] text-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-cyan-300">XEM TRƯỚC GIAO DIỆN TRANG CHÍNH THỨC</span>
              <span className="text-xs text-slate-300">• OOS Enterprise</span>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreenPreviewOpen(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Đóng xem trước</span>
            </button>
          </div>

          <div className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-8">
            {/* Group Photo */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="font-extrabold text-lg text-[#082D55] mb-3">
                {data.groupPhoto.caption || 'Ảnh tập thể Outsourcing Operation'}
              </h3>
              <div className="rounded-xl overflow-hidden bg-slate-900">
                <img src={data.groupPhoto.imageUrl} alt="Group" className="w-full max-h-[500px] object-cover" />
              </div>
            </div>

            {/* Slogan */}
            <div className="p-8 rounded-2xl bg-[#082D55] text-white text-center shadow-lg">
              <h2 className="text-2xl sm:text-3xl font-black">“{data.slogans.english}”</h2>
              <div className="text-sm font-bold text-cyan-300 mt-2 uppercase tracking-wide">
                {data.slogans.vietnamese}
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-lg text-[#082D55]">Đội ngũ dự án</h3>
              <div className="team-members-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {data.teamMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border">
                    <img src={m.avatar} alt={m.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                        {m.position}
                      </span>
                      <h4 className="font-bold text-sm text-[#082D55] truncate">{m.name}</h4>
                      {m.bio && <p className="text-[11px] text-slate-500 line-clamp-1">{m.bio}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: RESET CONFIRMATION                                    */}
      {/* ============================================================ */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 mb-1">
              Khôi phục dữ liệu ban đầu?
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              Thao tác này sẽ đặt lại ảnh tập thể, danh sách nhân sự và khẩu hiệu về mẫu chuẩn của OOS.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleResetToInitial}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
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

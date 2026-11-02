import React, { useState, useRef } from 'react';
import {
  AboutUsPageData,
  AboutUsTeamMember,
  AboutUsCapabilityItem,
  AboutUsCoreValueItem,
} from '../../types/aboutUs';
import { UserProfile } from '../../types';
import {
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
  Edit3,
  Factory,
  Sparkles,
  Mail,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Camera,
  Upload,
  Link as LinkIcon,
  X,
  Save,
  Trash2,
  Image as ImageIcon,
  Check,
  Plus,
} from 'lucide-react';
import {
  optimizeImageFile,
  PRESET_GROUP_PHOTOS,
  PRESET_AVATARS,
} from '../../utils/imageOptimization';

interface AboutUsViewProps {
  data: AboutUsPageData;
  currentUser: UserProfile;
  onEnterEditMode: () => void;
  onUpdateData?: (updatedData: AboutUsPageData) => void;
}

export const AboutUsView: React.FC<AboutUsViewProps> = ({
  data,
  currentUser,
  onEnterEditMode,
  onUpdateData,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';

  // Quick Inline Edit Modals for Admins
  const [isGroupPhotoModalOpen, setIsGroupPhotoModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AboutUsTeamMember | null>(null);

  // Group Photo Edit State
  const [tempGroupPhotoUrl, setTempGroupPhotoUrl] = useState(data.groupPhoto.imageUrl);
  const [tempGroupCaption, setTempGroupCaption] = useState(data.groupPhoto.caption || '');
  const [tempGroupAspect, setTempGroupAspect] = useState<'16:9' | '4:3' | '3:2' | '21:9' | 'auto'>(
    data.groupPhoto.aspectRatio || '16:9'
  );
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const groupFileInputRef = useRef<HTMLInputElement | null>(null);

  // Member Avatar Edit State
  const [tempMemberAvatar, setTempMemberAvatar] = useState('');
  const [tempMemberName, setTempMemberName] = useState('');
  const [tempMemberPosition, setTempMemberPosition] = useState('');
  const [tempMemberBio, setTempMemberBio] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const memberFileInputRef = useRef<HTMLInputElement | null>(null);

  // Open Group Photo Modal
  const handleOpenGroupPhotoModal = () => {
    setTempGroupPhotoUrl(data.groupPhoto.imageUrl);
    setTempGroupCaption(data.groupPhoto.caption || '');
    setTempGroupAspect(data.groupPhoto.aspectRatio || '16:9');
    setIsGroupPhotoModalOpen(true);
  };

  // Open Member Edit Modal
  const handleOpenMemberModal = (member: AboutUsTeamMember) => {
    setEditingMember(member);
    setTempMemberAvatar(member.avatar);
    setTempMemberName(member.name);
    setTempMemberPosition(member.position);
    setTempMemberBio(member.bio || '');
  };

  // Handle Local File Upload for Group Photo with Canvas Optimization
  const handleGroupFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const compressedDataUrl = await optimizeImageFile(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.82,
        format: 'image/jpeg',
      });
      setTempGroupPhotoUrl(compressedDataUrl);
    } catch (err: any) {
      alert(err.message || 'Không thể xử lý hình ảnh');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Save Group Photo Updates
  const handleSaveGroupPhoto = () => {
    const updatedData: AboutUsPageData = {
      ...data,
      groupPhoto: {
        ...data.groupPhoto,
        imageUrl: tempGroupPhotoUrl,
        caption: tempGroupCaption,
        aspectRatio: tempGroupAspect,
      },
      lastUpdated: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      updatedBy: currentUser.name,
    };

    if (onUpdateData) {
      onUpdateData(updatedData);
    }
    setIsGroupPhotoModalOpen(false);
  };

  // Handle Local File Upload for Member Avatar with Canvas Optimization
  const handleMemberAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const compressedAvatarUrl = await optimizeImageFile(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.85,
        format: 'image/jpeg',
      });
      setTempMemberAvatar(compressedAvatarUrl);
    } catch (err: any) {
      alert(err.message || 'Không thể xử lý ảnh đại diện');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Save Member Updates
  const handleSaveMember = () => {
    if (!editingMember) return;

    const updatedMembers = data.teamMembers.map((m) =>
      m.id === editingMember.id
        ? {
            ...m,
            avatar: tempMemberAvatar,
            name: tempMemberName,
            position: tempMemberPosition,
            bio: tempMemberBio,
          }
        : m
    );

    const updatedData: AboutUsPageData = {
      ...data,
      teamMembers: updatedMembers,
      lastUpdated: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      updatedBy: currentUser.name,
    };

    if (onUpdateData) {
      onUpdateData(updatedData);
    }
    setEditingMember(null);
  };

  // Add new member to specific group
  const handleAddNewMember = (group: 'DIRECTOR' | 'DEV' | 'ADVISOR') => {
    const groupDefaults = {
      DIRECTOR: { title: 'Thành viên Chỉ đạo mới', defaultPos: 'Phó Ban Chỉ đạo', presetIdx: 0 },
      DEV: { title: 'Kỹ sư mới', defaultPos: 'Kỹ sư phần mềm OOS', presetIdx: 2 },
      ADVISOR: { title: 'Cố vấn mới', defaultPos: 'Cố vấn vận hành', presetIdx: 5 },
    };
    const config = groupDefaults[group];
    const newMember: AboutUsTeamMember = {
      id: `mem-${group.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      name: config.title,
      position: config.defaultPos,
      group,
      avatar: PRESET_AVATARS[config.presetIdx]?.url || PRESET_AVATARS[0].url,
      bio: 'Chuyên gia phụ trách hệ thống và vận hành đa nhà máy.',
      email: `member.${Date.now().toString().slice(-4)}@oos.company`,
    };
    const updatedMembers = [...data.teamMembers, newMember];
    const updatedData: AboutUsPageData = {
      ...data,
      teamMembers: updatedMembers,
      lastUpdated:
        new Date().toLocaleDateString('vi-VN') +
        ' ' +
        new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      updatedBy: currentUser.name,
    };
    if (onUpdateData) {
      onUpdateData(updatedData);
    }
    handleOpenMemberModal(newMember);
  };

  // Helper for capability icons
  const renderCapabilityIcon = (iconName: AboutUsCapabilityItem['iconName']) => {
    switch (iconName) {
      case 'users':
        return <Users className="w-5 h-5" />;
      case 'cpu':
        return <Cpu className="w-5 h-5" />;
      case 'wrench':
        return <Wrench className="w-5 h-5" />;
      case 'boxes':
        return <Boxes className="w-5 h-5" />;
      case 'truck':
        return <Truck className="w-5 h-5" />;
      case 'folder':
        return <FolderKanban className="w-5 h-5" />;
      case 'chart':
        return <BarChart3 className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  // Helper for core value icons
  const renderValueIcon = (iconName: AboutUsCoreValueItem['iconName']) => {
    switch (iconName) {
      case 'trending':
        return <TrendingUp className="w-6 h-6 text-blue-500" />;
      case 'shield':
        return <ShieldCheck className="w-6 h-6 text-emerald-500" />;
      case 'lightbulb':
        return <Lightbulb className="w-6 h-6 text-amber-500" />;
      default:
        return <Sparkles className="w-6 h-6 text-cyan-500" />;
    }
  };

  // Group team members
  const directorMembers = data.teamMembers.filter((m) => m.group === 'DIRECTOR');
  const devMembers = data.teamMembers.filter((m) => m.group === 'DEV');
  const advisorMembers = data.teamMembers.filter((m) => m.group === 'ADVISOR');

  // Aspect ratio class helper
  const getAspectRatioClass = (ratio: string) => {
    switch (ratio) {
      case '16:9':
        return 'aspect-video';
      case '4:3':
        return 'aspect-4/3';
      case '3:2':
        return 'aspect-3/2';
      case '21:9':
        return 'aspect-21/9';
      default:
        return 'max-h-[560px] object-cover';
    }
  };

  // Sort sections by order
  const sortedSections = [...data.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-full bg-[#F2F6FA] text-slate-800 pb-16 font-sans">
      {/* Top Banner / Action Header */}
      <div className="bg-[#082D55] text-white border-b border-[#123E6E] px-4 sm:px-8 py-5 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600/60 text-cyan-200 px-2 py-0.5 rounded border border-blue-500/50">
                OOS Enterprise
              </span>
              <span className="text-xs text-slate-300">
                Cập nhật: {data.lastUpdated} | {data.updatedBy}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Về chúng tôi</span>
              <span className="text-slate-400 font-light text-xl">|</span>
              <span className="text-cyan-400 font-bold text-xl sm:text-2xl">About Us</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Giới thiệu bộ phận Outsourcing Operation, đội ngũ dự án và sứ mệnh kết nối các nhà máy.
            </p>
          </div>

          {/* Action buttons: Only visible to ADMIN */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenGroupPhotoModal}
                className="flex items-center gap-2 bg-[#0E3C6E] hover:bg-[#144F8E] text-cyan-300 hover:text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-lg shadow-sm border border-cyan-500/30 transition-all cursor-pointer"
                title="Thay đổi nhanh ảnh tập thể bộ phận"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span className="hidden md:inline">Đổi ảnh tập thể</span>
              </button>

              <button
                type="button"
                onClick={onEnterEditMode}
                className="flex items-center gap-2 bg-[#1688E8] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border border-blue-400/30 shrink-0"
              >
                <Edit3 className="w-4 h-4 text-cyan-200" />
                <span>Chỉnh sửa giao diện</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-blue-900/40 px-3 py-1.5 rounded border border-blue-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Trang chính thức đã xuất bản</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-10">
        {sortedSections.map((sec) => {
          if (!sec.isVisible) return null;

          switch (sec.type) {
            // ========================================================
            // SECTION A: BRAND INTRODUCTION
            // ========================================================
            case 'BRAND_INTRO':
              return (
                <section
                  key={sec.id}
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 transition-all hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                    {/* OOS Logo Badge */}
                    <div className="shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-[#082D55] via-[#1688E8] to-[#55D5FF] p-1 shadow-lg shadow-blue-500/10 flex items-center justify-center">
                      <div className="w-full h-full rounded-xl bg-[#082D55] flex flex-col items-center justify-center text-white p-2 text-center">
                        <Factory className="w-8 h-8 text-cyan-400 mb-1" />
                        <span className="font-black text-xs tracking-wider leading-none">OOS</span>
                        <span className="text-[8px] text-cyan-300 font-mono tracking-tighter">
                          ENTERPRISE
                        </span>
                      </div>
                    </div>

                    {/* Brand Info & Mission */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="inline-block text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 mb-2">
                        {data.header.departmentName}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#082D55] tracking-tight uppercase leading-snug">
                        {data.header.systemName}
                      </h2>
                      <div className="text-xs font-bold text-cyan-700 tracking-wider uppercase mb-3">
                        {data.header.subTitle}
                      </div>
                      <div className="relative pl-0 md:pl-4 border-l-0 md:border-l-2 border-[#1688E8] mt-2">
                        <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                          “{data.header.description}”
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              );

            // ========================================================
            // SECTION B: PROJECT TEAM GROUP PHOTO
            // ========================================================
            case 'GROUP_PHOTO':
              return (
                <section
                  key={sec.id}
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-6 bg-[#1688E8] rounded-full" />
                      <h3 className="font-extrabold text-lg text-[#082D55]">
                        {sec.title || 'Ảnh tập thể bộ phận'}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={handleOpenGroupPhotoModal}
                          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-all cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Chỉnh sửa ảnh này</span>
                        </button>
                      )}
                      <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                        OOS Team
                      </span>
                    </div>
                  </div>

                  <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner group">
                    <img
                      src={data.groupPhoto.imageUrl}
                      alt={data.groupPhoto.caption}
                      className={`w-full ${getAspectRatioClass(
                        data.groupPhoto.aspectRatio
                      )} object-${data.groupPhoto.fit} object-${
                        data.groupPhoto.focalPoint
                      } transition-transform duration-500 group-hover:scale-[1.01]`}
                    />

                    {/* Admin Quick Hover Overlay */}
                    {isAdmin && (
                      <div className="absolute top-3 right-3 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={handleOpenGroupPhotoModal}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs font-bold backdrop-blur-md shadow-lg border border-white/20 cursor-pointer transition-all"
                        >
                          <Camera className="w-4 h-4 text-cyan-300" />
                          <span>Thay đổi ảnh tập thể</span>
                        </button>
                      </div>
                    )}

                    {data.groupPhoto.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-4 sm:p-6 text-white text-xs sm:text-sm font-medium">
                        <div className="flex items-center gap-2 max-w-4xl">
                          <Users className="w-4 h-4 text-cyan-300 shrink-0" />
                          <p className="leading-snug drop-shadow">{data.groupPhoto.caption}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              );

            // ========================================================
            // SECTION C: BRAND SLOGANS
            // ========================================================
            case 'SLOGANS':
              return (
                <section
                  key={sec.id}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#082D55] via-[#0E447E] to-[#1688E8] text-white p-6 sm:p-10 shadow-lg"
                >
                  {/* Subtle Background Pattern */}
                  <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-white">
                    <Factory className="w-64 h-64" />
                  </div>

                  <div className="relative z-10 max-w-3xl space-y-4">
                    <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-cyan-300 bg-blue-900/60 px-3 py-1 rounded-full border border-cyan-400/30">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Thông điệp thương hiệu</span>
                    </div>

                    <div>
                      <h3 className="text-2xl sm:text-3.5xl font-black tracking-tight text-white leading-tight">
                        “{data.slogans.english}”
                      </h3>
                      <div className="mt-2 text-sm sm:text-base font-bold text-cyan-200 tracking-wide uppercase">
                        {data.slogans.vietnamese}
                      </div>
                    </div>

                    {data.slogans.englishSub && (
                      <p className="text-xs sm:text-sm text-slate-300 italic pt-1 border-t border-blue-400/20 max-w-xl">
                        {data.slogans.englishSub}
                      </p>
                    )}
                  </div>
                </section>
              );

            // ========================================================
            // SECTION D: DEPARTMENT CAPABILITIES (7 CARDS)
            // ========================================================
            case 'CAPABILITIES':
              return (
                <section key={sec.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-6 bg-[#1688E8] rounded-full" />
                        <h3 className="font-extrabold text-xl text-[#082D55]">
                          {sec.title || '7 Năng lực bộ phận'}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 pl-4.5">
                        Các phân hệ chức năng điều phối và kết nối nguồn lực xuyên suốt chuỗi sản xuất.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {data.capabilities.map((cap, idx) => (
                      <div
                        key={cap.id}
                        className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110"
                              style={{ backgroundColor: cap.accentColor }}
                            >
                              {renderCapabilityIcon(cap.iconName)}
                            </div>
                            <span className="text-[11px] font-mono font-bold text-slate-400">
                              0{idx + 1}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-[#082D55] mb-1.5 group-hover:text-blue-600 transition-colors">
                            {cap.title}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-normal">
                            {cap.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            // ========================================================
            // SECTION E: CORE VALUE PILLARS
            // ========================================================
            case 'CORE_VALUES':
              return (
                <section key={sec.id} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-6 bg-[#1688E8] rounded-full" />
                    <h3 className="font-extrabold text-xl text-[#082D55]">
                      {sec.title || '3 Trụ cột giá trị cốt lõi'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {data.coreValues.map((val) => (
                      <div
                        key={val.id}
                        className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all"
                      >
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                          {renderValueIcon(val.iconName)}
                        </div>
                        <h4 className="font-extrabold text-base text-[#082D55] mb-2">
                          {val.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                          {val.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              );

            // ========================================================
            // SECTION F: TEAM MEMBERS (3 CATEGORIES)
            // ========================================================
            case 'TEAM_MEMBERS':
              return (
                <section key={sec.id} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-6 bg-[#1688E8] rounded-full" />
                        <h3 className="font-extrabold text-xl text-[#082D55]">
                          {sec.title || 'Đội ngũ dự án & Cố vấn'}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 pl-4.5">
                        Ban chỉ đạo, nhóm phát triển phần mềm và các chuyên gia cố vấn vận hành nhà máy.
                      </p>
                    </div>
                    {isAdmin && (
                      <span className="text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-medium">
                        💡 Rê chuột vào ảnh nhân sự để đổi ảnh trực tiếp
                      </span>
                    )}
                  </div>

                  {/* 1. Chỉ đạo dự án */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        <h4 className="font-extrabold text-sm uppercase tracking-wider text-blue-900">
                          Chỉ đạo dự án
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {directorMembers.length} thành viên
                        </span>
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleAddNewMember('DIRECTOR')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer transition-colors shadow-2xs"
                          title="Thêm nhân sự mới vào Ban chỉ đạo"
                        >
                          <Plus className="w-3.5 h-3.5 text-blue-600" />
                          <span>Thêm nhân sự</span>
                        </button>
                      )}
                    </div>

                    <div className="team-members-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                      {directorMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50/70 to-white border border-blue-100 hover:shadow-sm transition-all group relative"
                        >
                          <div className="relative shrink-0">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm"
                            />
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleOpenMemberModal(member)}
                                className="absolute -bottom-1 -right-1 p-1.5 bg-[#1688E8] hover:bg-blue-600 text-white rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer"
                                title="Thay đổi ảnh đại diện"
                              >
                                <Camera className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded uppercase tracking-wider mb-1">
                              {member.position}
                            </span>
                            <h5 className="font-extrabold text-base text-[#082D55] truncate">
                              {member.name}
                            </h5>
                            {member.bio && (
                              <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 font-normal">
                                {member.bio}
                              </p>
                            )}
                            {member.email && (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1.5">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span className="truncate">{member.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Nhóm phát triển */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <h4 className="font-extrabold text-sm uppercase tracking-wider text-emerald-900">
                          Nhóm phát triển
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {devMembers.length} thành viên
                        </span>
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleAddNewMember('DEV')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer transition-colors shadow-2xs"
                          title="Thêm nhân sự mới vào Nhóm phát triển"
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Thêm nhân sự</span>
                        </button>
                      )}
                    </div>

                    <div className="team-members-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {devMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:shadow-xs transition-all group relative"
                        >
                          <div className="relative shrink-0">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs"
                            />
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleOpenMemberModal(member)}
                                className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer"
                                title="Thay đổi ảnh đại diện"
                              >
                                <Camera className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mb-0.5">
                              {member.position}
                            </span>
                            <h5 className="font-bold text-sm text-[#082D55] truncate">
                              {member.name}
                            </h5>
                            {member.bio && (
                              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                {member.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Nhóm cố vấn */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-600" />
                        <h4 className="font-extrabold text-sm uppercase tracking-wider text-purple-900">
                          Nhóm cố vấn
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {advisorMembers.length} thành viên
                        </span>
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleAddNewMember('ADVISOR')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg cursor-pointer transition-colors shadow-2xs"
                          title="Thêm nhân sự mới vào Nhóm cố vấn"
                        >
                          <Plus className="w-3.5 h-3.5 text-purple-600" />
                          <span>Thêm nhân sự</span>
                        </button>
                      )}
                    </div>

                    <div className="team-members-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {advisorMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:shadow-xs transition-all group relative"
                        >
                          <div className="relative shrink-0">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs"
                            />
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleOpenMemberModal(member)}
                                className="absolute -bottom-1 -right-1 p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer"
                                title="Thay đổi ảnh đại diện"
                              >
                                <Camera className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="inline-block text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded mb-0.5">
                              {member.position}
                            </span>
                            <h5 className="font-bold text-sm text-[#082D55] truncate">
                              {member.name}
                            </h5>
                            {member.bio && (
                              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                {member.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            // ========================================================
            // CUSTOM TEXT OR DIVIDER
            // ========================================================
            case 'CUSTOM_TEXT':
              return (
                <section
                  key={sec.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs"
                >
                  <h4 className="font-bold text-base text-[#082D55] mb-2">{sec.title}</h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {sec.customSettings?.textContent || 'Nội dung tùy chỉnh bổ sung.'}
                  </p>
                </section>
              );

            case 'DIVIDER':
              return (
                <div key={sec.id} className="py-2">
                  <div className="border-t border-slate-200" />
                </div>
              );

            case 'SPACER':
              return <div key={sec.id} style={{ height: sec.customSettings?.spacerHeight || 24 }} />;

            default:
              return null;
          }
        })}
      </div>

      {/* Footer Branding Info */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-12 pt-6 border-t border-slate-300/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-2">
          <span className="font-black text-[#082D55]">OOS ENTERPRISE</span>
          <span>•</span>
          <span>Hệ thống Quản lý Vận hành Đa Nhà máy</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Phiên bản v{data.version}.0</span>
          <span>•</span>
          <span>Bảo mật nội bộ ISO/IEC 27001</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: ADMIN EDIT GROUP PHOTO                              */}
      {/* ============================================================ */}
      {isGroupPhotoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#082D55]">
                    Cập nhật ảnh tập thể bộ phận
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thay đổi hình ảnh xuất hiện trên trang giới thiệu và màn hình OOS
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGroupPhotoModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-sm">
              {/* Image Preview Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Hình ảnh hiện tại
                </label>
                <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 max-h-56 flex items-center justify-center">
                  <img
                    src={tempGroupPhotoUrl}
                    alt="Preview"
                    className="w-full h-56 object-cover"
                  />
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-2">
                      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Đang nén & tải ảnh...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload from Local Device */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="file"
                  ref={groupFileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleGroupFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => groupFileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-blue-400/80 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-bold gap-1.5 transition-all cursor-pointer group"
                >
                  <Upload className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs">Tải ảnh từ máy tính</span>
                  <span className="text-[10px] text-slate-500 font-normal">PNG, JPG (tối đa 10MB)</span>
                </button>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hoặc nhập đường dẫn ảnh (URL)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={tempGroupPhotoUrl}
                      onChange={(e) => setTempGroupPhotoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Đường dẫn web trực tiếp đến hình ảnh
                  </span>
                </div>
              </div>

              {/* Preset Gallery */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Hoặc chọn nhanh ảnh mẫu chất lượng cao
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_GROUP_PHOTOS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => setTempGroupPhotoUrl(preset.url)}
                      className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all group ${
                        tempGroupPhotoUrl === preset.url
                          ? 'border-[#1688E8] shadow-md ring-2 ring-blue-300'
                          : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.title} className="w-full h-16 object-cover" />
                      <div className="p-1.5 bg-white">
                        <div className="text-[10px] font-bold text-slate-800 truncate">
                          {preset.title}
                        </div>
                      </div>
                      {tempGroupPhotoUrl === preset.url && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo Caption & Aspect */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chú thích ảnh
                  </label>
                  <input
                    type="text"
                    value={tempGroupCaption}
                    onChange={(e) => setTempGroupCaption(e.target.value)}
                    placeholder="VD: Tập thể cán bộ kỹ sư Outsourcing Operation..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tỉ lệ hiển thị
                  </label>
                  <select
                    value={tempGroupAspect}
                    onChange={(e) => setTempGroupAspect(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="16:9">16:9 (Chuẩn màn ảnh)</option>
                    <option value="4:3">4:3 (Cổ điển)</option>
                    <option value="3:2">3:2 (Ngang)</option>
                    <option value="21:9">21:9 (Toàn cảnh rộng)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsGroupPhotoModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveGroupPhoto}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#1688E8] hover:bg-blue-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: ADMIN EDIT MEMBER AVATAR & INFO                     */}
      {/* ============================================================ */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#082D55]">
                    Cập nhật ảnh đại diện nhân sự
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingMember.name} • {editingMember.position}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-sm">
              {/* Avatar Preview & Direct Actions */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="relative">
                  <img
                    src={tempMemberAvatar}
                    alt={tempMemberName}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
                  />
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white">
                      <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={memberFileInputRef}
                    accept="image/*"
                    onChange={handleMemberAvatarUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => memberFileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1688E8] hover:bg-blue-600 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải ảnh từ máy tính</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      value={tempMemberAvatar}
                      onChange={(e) => setTempMemberAvatar(e.target.value)}
                      placeholder="Hoặc nhập URL ảnh..."
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Preset Avatar Gallery */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Hoặc chọn nhanh từ thư viện chân dung mẫu
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AVATARS.map((av) => (
                    <div
                      key={av.id}
                      onClick={() => setTempMemberAvatar(av.url)}
                      className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all group ${
                        tempMemberAvatar === av.url
                          ? 'border-[#1688E8] shadow-md ring-2 ring-blue-300'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img src={av.url} alt={av.role} className="w-full h-16 object-cover" />
                      <div className="text-[9px] text-center bg-slate-50 text-slate-600 py-0.5 font-medium truncate">
                        {av.gender}
                      </div>
                      {tempMemberAvatar === av.url && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Member Details */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={tempMemberName}
                      onChange={(e) => setTempMemberName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chức danh / Vai trò
                    </label>
                    <input
                      type="text"
                      value={tempMemberPosition}
                      onChange={(e) => setTempMemberPosition(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tiểu sử / Giới thiệu ngắn
                  </label>
                  <textarea
                    rows={2}
                    value={tempMemberBio}
                    onChange={(e) => setTempMemberBio(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveMember}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#1688E8] hover:bg-blue-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

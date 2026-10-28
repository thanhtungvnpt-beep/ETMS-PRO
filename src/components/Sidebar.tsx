import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Cpu,
  Truck,
  QrCode,
  FileBarChart,
  Settings,
  Shield,
  Layers,
  Boxes,
  Building2,
  PackagePlus,
  ArrowRightLeft,
  History,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  ScanLine,
  Users,
  Briefcase,
  Plus,
  BarChart3,
  Calendar,
  Award,
  Sliders,
  FolderKanban,
  ShoppingCart,
  Wrench,
  Network,
  Sparkles,
} from 'lucide-react';
import { SubsystemType } from './Header';

export type NavTab =
  | 'dashboard'
  | 'orders'
  | 'assets'
  | 'delivery'
  | 'labels'
  | 'reports'
  | 'settings'
  // Nhóm 11 trang Menu TỒN KHO (Bao gồm Biểu đồ D3 Sankey Diagram)
  | 'inventory-overview'
  | 'inventory-catalog'
  | 'inventory-by-factory'
  | 'inventory-intake'
  | 'inventory-dispatch'
  | 'inventory-movements'
  | 'inventory-sankey' // D3 Sankey Diagram for Inter-Factory Flow
  | 'inventory-audit'
  | 'inventory-discrepancies'
  | 'inventory-reports'
  | 'inventory-qr'
  // Nhóm 6 trang Menu QUẢN LÝ NHÂN LỰC (7 Vendor & SOP - Phase 1)
  | 'workforce-overview'
  | 'workforce-input'
  | 'workforce-by-factory'
  | 'workforce-by-vendor'
  | 'workforce-reports'
  | 'workforce-settings'
  // Nhóm 8 trang Menu WORKFORCE INTELLIGENCE (Phase 2 - Thâm niên & Ma trận Kỹ năng)
  | 'workforce-p2-dashboard'
  | 'workforce-seniority'
  | 'workforce-matrix'
  | 'workforce-verification'
  | 'workforce-certs'
  | 'workforce-gaps'
  | 'workforce-alerts'
  | 'workforce-skills'
  // Phân hệ Quản lý Dự án Model Mới (9 Bước Tiêu Chuẩn)
  | 'new-model-projects';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeSubsystem?: SubsystemType;
  onChangeSubsystem?: (subsystem: SubsystemType) => void;
  compact?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeSubsystem = 'EQUIPMENT',
  onChangeSubsystem = () => {},
  compact = false,
}) => {
  return (
    <aside
      className={`bg-[#0a1829] text-slate-200 border-r border-[#152a42] flex flex-col justify-between select-none shrink-0 ${
        compact ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="h-12 border-b border-[#152a42] flex items-center justify-between px-3 shrink-0 bg-[#071322]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
              E
            </div>
            {!compact && (
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wide text-white">ETMS</span>
                <span className="text-[10px] font-bold bg-blue-900/80 text-blue-300 px-1 py-0.2 rounded border border-blue-700/50">
                  PRO
                </span>
              </div>
            )}
          </div>

          {/* Subsystem Tag in Sidebar */}
          {!compact && (
            <span
              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                activeSubsystem === 'WORKFORCE'
                  ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                  : 'bg-blue-950/80 text-blue-300 border-blue-800'
              }`}
            >
              {activeSubsystem === 'WORKFORCE' ? 'Nhân lực' : 'Điều động & Kho'}
            </span>
          )}
        </div>

        {/* Scrollable Navigation links strictly partitioned by Subsystem */}
        <nav className="p-2 space-y-3 overflow-y-auto flex-1 text-xs">
          {/* ======================================================== */}
          {/* PHÂN HỆ 1: ĐIỀU ĐỘNG & TỒN KHO THIẾT BỊ                   */}
          {/* ======================================================== */}
          {activeSubsystem === 'EQUIPMENT' && (
            <>
              {/* Group A: Điều động 9 bước */}
              <div>
                {!compact && (
                  <div className="px-2 mb-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Điều Động Thiết Bị
                  </div>
                )}
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => onSelectTab('dashboard')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      currentTab === 'dashboard'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 shrink-0 text-blue-300" />
                    {!compact && <span>Tổng quan 9 bước V1</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('orders')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      currentTab === 'orders'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 shrink-0 text-blue-300" />
                    {!compact && <span>Lệnh điều động (12)</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('delivery')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      currentTab === 'delivery'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5 shrink-0 text-blue-300" />
                    {!compact && <span>Giao nhận vận chuyển</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('labels')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      currentTab === 'labels'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 shrink-0 text-blue-300" />
                    {!compact && <span>Tem QR điều động</span>}
                  </button>
                </div>
              </div>

              {/* Group: DỰ ÁN MODEL MỚI (9 BƯỚC) */}
              <div>
                {!compact && (
                  <div className="px-2 mb-1 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                      Dự Án Model Mới
                    </span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-1 rounded border border-emerald-500/40 font-bold">
                      9 bước
                    </span>
                  </div>
                )}
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => onSelectTab('new-model-projects')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      currentTab === 'new-model-projects'
                        ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-300'
                        : 'text-emerald-300 hover:text-white hover:bg-emerald-950/80 bg-emerald-950/40 border border-emerald-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FolderKanban className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {!compact && <span className="truncate">Quản lý Dự án Model mới</span>}
                    </div>
                    {!compact && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/30 text-emerald-200">
                        9 B
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Group B: 11 Trang Tồn Kho (Bao gồm Biểu đồ Sankey D3) */}
              <div>
                {!compact && (
                  <div className="px-2 mb-1 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                      Tồn Kho Liên Nhà Máy
                    </span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 font-mono px-1 rounded border border-amber-500/40">
                      11 mục
                    </span>
                  </div>
                )}
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => onSelectTab('inventory-overview')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      currentTab === 'inventory-overview'
                        ? 'bg-amber-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Boxes className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    {!compact && <span className="truncate">1. Tổng quan tồn kho</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('inventory-catalog')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      currentTab === 'inventory-catalog'
                        ? 'bg-amber-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    {!compact && <span className="truncate">2. Danh mục tài sản</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('inventory-by-factory')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      currentTab === 'inventory-by-factory'
                        ? 'bg-amber-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    {!compact && <span className="truncate">3. Tồn kho theo nhà máy</span>}
                  </button>

                  {/* SPECIAL D3 SANKEY DIAGRAM LINK */}
                  <button
                    type="button"
                    onClick={() => onSelectTab('inventory-sankey')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      currentTab === 'inventory-sankey'
                        ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-300'
                        : 'text-blue-300 hover:text-white hover:bg-blue-950/80 bg-blue-950/40 border border-blue-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Network className="w-3.5 h-3.5 text-blue-400 shrink-0 animate-pulse" />
                      {!compact && <span className="truncate">4. Dòng chảy tài sản (D3)</span>}
                    </div>
                    {!compact && (
                      <span className="text-[9px] bg-blue-500 text-white font-black px-1 rounded uppercase">
                        Sankey
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('inventory-intake')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      currentTab === 'inventory-intake'
                        ? 'bg-amber-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <PackagePlus className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    {!compact && <span className="truncate">5. Nhập & tiếp nhận</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('inventory-dispatch')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      currentTab === 'inventory-dispatch'
                        ? 'bg-amber-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    {!compact && <span className="truncate">6. Xuất & điều chuyển</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('inventory-movements')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      currentTab === 'inventory-movements'
                        ? 'bg-amber-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <History className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    {!compact && <span className="truncate">7. Sổ biến động</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('inventory-audit')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      currentTab === 'inventory-audit'
                        ? 'bg-amber-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    {!compact && <span className="truncate">8. Kiểm kê tài sản</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('inventory-discrepancies')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      currentTab === 'inventory-discrepancies'
                        ? 'bg-amber-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    {!compact && <span className="truncate">9. Sai lệch tồn kho</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('inventory-reports')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      currentTab === 'inventory-reports'
                        ? 'bg-amber-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <FileBarChart className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    {!compact && <span className="truncate">10. Báo cáo tồn kho</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('inventory-qr')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      currentTab === 'inventory-qr'
                        ? 'bg-amber-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <ScanLine className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    {!compact && <span className="truncate">11. Quản lý mã QR</span>}
                  </button>
                </div>
              </div>

              {/* Group C: Hệ thống */}
              <div>
                {!compact && (
                  <div className="px-2 mb-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Hệ Thống
                  </div>
                )}
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => onSelectTab('reports')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      currentTab === 'reports'
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    {!compact && <span>Báo cáo tổng hợp</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('settings')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      currentTab === 'settings'
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    {!compact && <span>Cài đặt hệ thống</span>}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* PHÂN HỆ 2: QUẢN LÝ NHÂN LỰC (7 VENDOR & SOP)              */}
          {/* ======================================================== */}
          {activeSubsystem === 'WORKFORCE' && (
            <div className="space-y-4">
              {/* GROUP 1: PHASE 1 - QUẢN LÝ NHÂN LỰC THEO TUẦN & SOP (7 VENDOR) */}
              <div>
                {!compact && (
                  <div className="px-2 mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
                      Nhân Lực Tuần & SOP (Phase 1)
                    </span>
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 font-mono px-1 rounded border border-purple-500/40">
                      6 chức năng
                    </span>
                  </div>
                )}

                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => onSelectTab('workforce-overview')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      currentTab === 'workforce-overview'
                        ? 'bg-purple-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                    {!compact && <span>1. Dashboard Tuần (Ảnh Gốc)</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('workforce-input')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      currentTab === 'workforce-input'
                        ? 'bg-purple-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    {!compact && <span>2. Nhập số liệu tuần</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('workforce-by-vendor')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      currentTab === 'workforce-by-vendor'
                        ? 'bg-purple-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    {!compact && <span>3. Hồ sơ theo 7 Vendor</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('workforce-by-factory')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      currentTab === 'workforce-by-factory'
                        ? 'bg-purple-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    {!compact && <span>4. Phân bổ theo Nhà máy</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('workforce-reports')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      currentTab === 'workforce-reports'
                        ? 'bg-purple-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <FileBarChart className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    {!compact && <span>5. Báo cáo & Xuất dữ liệu</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('workforce-settings')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      currentTab === 'workforce-settings'
                        ? 'bg-purple-600 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    {!compact && <span>6. Cấu hình chu kỳ & Nhắc việc</span>}
                  </button>
                </div>
              </div>

              {/* GROUP 2: PHASE 2 - THÂM NIÊN & MA TRẬN KỸ NĂNG (ĐANG PHÁT TRIỂN) */}
              <div className="pt-2.5 border-t border-[#152a42]">
                {!compact && (
                  <div className="px-2 mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                      Thâm Niên & Kỹ Năng (Phase 2)
                    </span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 font-mono px-1 rounded border border-amber-500/40 font-bold">
                      ĐANG PHÁT TRIỂN
                    </span>
                  </div>
                )}

                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => onSelectTab('workforce-p2-dashboard')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      currentTab === 'workforce-p2-dashboard'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    {!compact && <span>1. Dashboard Năng Lực & Thâm Niên</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('workforce-seniority')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      currentTab === 'workforce-seniority'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    {!compact && <span>2. Hồ sơ Thâm niên & Hợp đồng</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('workforce-matrix')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      currentTab === 'workforce-matrix'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Network className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    {!compact && <span>3. Ma trận Kỹ năng (L0 - L4)</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('workforce-verification')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      currentTab === 'workforce-verification'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    {!compact && <span>4. Xác nhận Năng lực (HR)</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('workforce-certs')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      currentTab === 'workforce-certs'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    {!compact && <span>5. Chứng chỉ & Kế hoạch Đào tạo</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('workforce-gaps')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      currentTab === 'workforce-gaps'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    {!compact && <span>6. Phân tích Thiếu hụt & Điểm nghẽn</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('workforce-alerts')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      currentTab === 'workforce-alerts'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    {!compact && <span>7. Phiếu Cảnh báo Rủi ro Kỹ năng</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('workforce-skills')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      currentTab === 'workforce-skills'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    {!compact && <span>8. Danh mục Kỹ năng Chuẩn hóa</span>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Footer Switcher between Subsystems */}
      {!compact && (
        <div className="p-2.5 border-t border-[#152a42] bg-[#071322] space-y-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (activeSubsystem === 'EQUIPMENT') {
                onChangeSubsystem('WORKFORCE');
                onSelectTab('workforce-overview');
              } else {
                onChangeSubsystem('EQUIPMENT');
                onSelectTab('dashboard');
              }
            }}
            className={`w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-bold transition-all border cursor-pointer ${
              activeSubsystem === 'EQUIPMENT'
                ? 'bg-purple-900/50 hover:bg-purple-800 text-purple-200 border-purple-700/60'
                : 'bg-blue-900/50 hover:bg-blue-800 text-blue-200 border-blue-700/60'
            }`}
          >
            {activeSubsystem === 'EQUIPMENT' ? (
              <>
                <Users className="w-3.5 h-3.5" />
                <span>Sang Quản lý nhân lực →</span>
              </>
            ) : (
              <>
                <Truck className="w-3.5 h-3.5" />
                <span>← Sang Điều động thiết bị</span>
              </>
            )}
          </button>

          <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
            <span>ETMS Enterprise</span>
            <span className="font-mono text-slate-500">v2.4</span>
          </div>
        </div>
      )}
    </aside>
  );
};

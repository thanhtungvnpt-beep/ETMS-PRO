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
  Info,
  Activity,
  UserCheck,
  ChevronDown,
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
  // Nhóm 3 trang Menu LINE FILLING CONTROL (Phase 3 - Giám sát điền đầy theo Line)
  | 'line-filling-control'
  | 'line-filling-allocation'
  | 'line-filling-attendance'
  // Phân hệ Quản lý Dự án Model Mới (9 Bước Tiêu Chuẩn)
  | 'new-model-projects'
  // Phân hệ Về chúng tôi (About Us Page & Admin Visual Builder)
  | 'about-us'
  // Phân hệ Cấp 1: Báo cáo hiện trường (Field Daily Report Pro)
  | 'field-report';

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
              O
            </div>
            {!compact && (
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wide text-white">OOS</span>
                <span className="text-[10px] font-bold bg-blue-900/80 text-cyan-300 px-1 py-0.2 rounded border border-blue-700/50">
                  PRO
                </span>
              </div>
            )}
          </div>

          {/* Subsystem Tag in Sidebar */}
          {!compact && (
            <span
              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                activeSubsystem === 'NEW_MODEL'
                  ? 'bg-blue-950/80 text-cyan-300 border-cyan-800'
                  : activeSubsystem === 'FIELD_REPORT'
                  ? 'bg-blue-950/80 text-cyan-300 border-cyan-800'
                  : activeSubsystem === 'WORKFORCE'
                  ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                  : 'bg-blue-950/80 text-blue-300 border-blue-800'
              }`}
            >
              {activeSubsystem === 'NEW_MODEL'
                ? 'New Model'
                : activeSubsystem === 'FIELD_REPORT'
                ? 'Hiện trường'
                : activeSubsystem === 'WORKFORCE'
                ? 'Nhân lực'
                : 'Điều động & Kho'}
            </span>
          )}
        </div>

        {/* Scrollable Navigation links strictly partitioned by Subsystem */}
        <nav className="p-2 space-y-3 overflow-y-auto flex-1 text-xs">
          {/* TOP-LEVEL SHORTCUTS: DỰ ÁN NEW MODEL & BÁO CÁO HIỆN TRƯỜNG */}
          <div className="pb-1.5 border-b border-[#152a42] space-y-1">
            <button
              type="button"
              onClick={() => {
                onChangeSubsystem('NEW_MODEL');
                onSelectTab('new-model-projects');
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'new-model-projects'
                  ? 'bg-[#1688E8] text-white shadow-md ring-1 ring-cyan-300'
                  : 'text-cyan-200 hover:text-white hover:bg-blue-900/60 bg-blue-950/40 border border-blue-900/60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FolderKanban className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                {!compact && <span className="truncate">Dự án NEW MODEL</span>}
              </div>
              {!compact && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/30 text-cyan-100 font-mono font-bold">
                  PRO
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onChangeSubsystem('FIELD_REPORT');
                onSelectTab('field-report');
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                currentTab === 'field-report'
                  ? 'bg-[#0878E8] text-white shadow-md ring-1 ring-cyan-300'
                  : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <ClipboardCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                {!compact && <span className="truncate">Báo cáo hiện trường</span>}
              </div>
              {!compact && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-blue-900/40 text-cyan-300 font-mono">
                  LIVE
                </span>
              )}
            </button>
          </div>

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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
                      currentTab === 'settings'
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Settings className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    {!compact && <span>Cài đặt hệ thống</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('about-us')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
                      currentTab === 'about-us'
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                    {!compact && <span>Về chúng tôi (About Us)</span>}
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
              {/* GROUP 0: PHASE 3 - LINE FILLING CONTROL (GIÁM SÁT ĐIỀN ĐẦY THEO LINE) */}
              <div>
                {!compact && (
                  <div className="px-2 mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400">
                      Điền Đầy Line (Phase 3)
                    </span>
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-mono px-1 rounded border border-cyan-500/40 font-bold">
                      REAL-TIME
                    </span>
                  </div>
                )}

                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => onSelectTab('line-filling-control')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      currentTab === 'line-filling-control'
                        ? 'bg-[#1688E8] text-white shadow-md ring-1 ring-cyan-300'
                        : 'text-cyan-200 hover:text-white hover:bg-blue-900/60 bg-blue-950/40 border border-blue-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      {!compact && <span className="truncate">Line Filling Control</span>}
                    </div>
                    {!compact && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-cyan-500/30 text-cyan-100 font-mono">
                        LIVE
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('line-filling-allocation')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      currentTab === 'line-filling-allocation'
                        ? 'bg-[#1688E8] text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    {!compact && <span>Phân công theo Line</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('line-filling-attendance')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      currentTab === 'line-filling-attendance'
                        ? 'bg-[#1688E8] text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    {!compact && <span>Điểm danh & hiện diện</span>}
                  </button>
                </div>
              </div>

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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] ${
                      currentTab === 'workforce-skills'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    {!compact && <span>8. Danh mục Kỹ năng Chuẩn hóa</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('about-us')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ease-out cursor-pointer active:scale-[0.98] mt-2 border-t border-[#152a42] pt-2 ${
                      currentTab === 'about-us'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    {!compact && <span>Về chúng tôi (About Us)</span>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PHÂN HỆ 3: BÁO CÁO HIỆN TRƯỜNG (FIELD DAILY REPORT PRO)   */}
          {/* ======================================================== */}
          {activeSubsystem === 'FIELD_REPORT' && (
            <div className="space-y-4">
              {/* GROUP 1: BÁO CÁO HIỆN TRƯỜNG TỔNG QUAN */}
              <div>
                {!compact && (
                  <div className="px-2 mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400">
                      Báo Cáo Hiện Trường
                    </span>
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-mono px-1 rounded border border-cyan-500/40 font-bold">
                      PRO
                    </span>
                  </div>
                )}

                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => onSelectTab('field-report')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      currentTab === 'field-report'
                        ? 'bg-[#0878E8] text-white shadow-md ring-1 ring-cyan-300'
                        : 'text-cyan-200 hover:text-white hover:bg-blue-900/60 bg-blue-950/40 border border-blue-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ClipboardCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      {!compact && <span className="truncate">1. Báo cáo hàng ngày (Daily)</span>}
                    </div>
                    {!compact && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-cyan-500/30 text-cyan-100 font-mono">
                        12 BC
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* GROUP 2: CÁC NHÓM VẤN ĐỀ HIỆN TRƯỜNG (EQM, QC, HR, PRODUCTION) */}
              <div>
                {!compact && (
                  <div className="px-2 mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Nhóm Vấn Đề (4 Khối)
                    </span>
                    <span className="text-[9px] bg-rose-500/20 text-rose-300 font-mono px-1 rounded border border-rose-500/40">
                      5 mở
                    </span>
                  </div>
                )}

                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => onSelectTab('field-report')}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Cpu className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      {!compact && <span>2. Thiết bị (EQM Issues)</span>}
                    </div>
                    {!compact && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        3
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('field-report')}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      {!compact && <span>3. Chất lượng (QC Issues)</span>}
                    </div>
                    {!compact && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        1
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('field-report')}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {!compact && <span>4. Nhân lực (HR Issues)</span>}
                    </div>
                    {!compact && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        0
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('field-report')}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <BarChart3 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      {!compact && <span>5. Sản lượng (Production)</span>}
                    </div>
                    {!compact && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        1
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* GROUP 3: QUẢN LÝ TIẾN ĐỘ & LỊCH SỬ */}
              <div>
                {!compact && (
                  <div className="px-2 mb-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Theo Dõi & Lịch Sử
                  </div>
                )}
                <div className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => onSelectTab('field-report')}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-all cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    {!compact && <span>6. Vấn đề đang xử lý (Open)</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('field-report')}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-all cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {!compact && <span>7. Lịch sử báo cáo (History)</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('field-report')}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-all cursor-pointer"
                  >
                    <FileBarChart className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {!compact && <span>8. Tổng hợp báo cáo (Summary)</span>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PHÂN HỆ 4: DỰ ÁN NEW MODEL PRO (GANTT & STANDARDS)       */}
          {/* ======================================================== */}
          {activeSubsystem === 'NEW_MODEL' && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onChangeSubsystem('EQUIPMENT');
                  onSelectTab('dashboard');
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#10243b] transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                {!compact && <span>Trang chủ</span>}
              </button>

              {/* Group: Dự án NEW MODEL */}
              <div className="pt-1">
                <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-bold bg-[#10243b] text-cyan-300 border border-blue-900/50">
                  <div className="flex items-center gap-2 truncate">
                    <FolderKanban className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    {!compact && <span>Dự án NEW MODEL</span>}
                  </div>
                  {!compact && <ChevronDown className="w-3 h-3 text-cyan-400" />}
                </div>

                <div className="pl-3 mt-1 space-y-0.5 border-l-2 border-blue-900/40 ml-2">
                  <button
                    type="button"
                    onClick={() => onSelectTab('new-model-projects')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-all cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {!compact && <span>Danh sách dự án</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectTab('new-model-projects')}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-bold bg-[#0878E8] text-white shadow-xs transition-all cursor-pointer"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 text-white" />
                    {!compact && <span>Kế hoạch & Tiến độ</span>}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectTab('new-model-projects')}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#10243b] transition-all cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                {!compact && <span>Thiết bị & Tiêu chuẩn</span>}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('new-model-projects')}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#10243b] transition-all cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {!compact && <span>Kế hoạch mua hàng</span>}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('new-model-projects')}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#10243b] transition-all cursor-pointer"
              >
                <Boxes className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                {!compact && <span>Nhận hàng (EQM)</span>}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('new-model-projects')}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#10243b] transition-all cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {!compact && <span>Setup & Chạy thử</span>}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('new-model-projects')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#10243b] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  {!compact && <span>Vấn đề thiết bị</span>}
                </div>
                {!compact && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    3
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('new-model-projects')}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#10243b] transition-all cursor-pointer"
              >
                <FileBarChart className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                {!compact && <span>Báo cáo & KPI</span>}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('settings')}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#10243b] transition-all cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {!compact && <span>Cài đặt</span>}
              </button>
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
              } else if (activeSubsystem === 'WORKFORCE') {
                onChangeSubsystem('FIELD_REPORT');
                onSelectTab('field-report');
              } else if (activeSubsystem === 'FIELD_REPORT') {
                onChangeSubsystem('NEW_MODEL');
                onSelectTab('new-model-projects');
              } else {
                onChangeSubsystem('EQUIPMENT');
                onSelectTab('dashboard');
              }
            }}
            className={`w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-bold transition-all border cursor-pointer ${
              activeSubsystem === 'NEW_MODEL'
                ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400'
                : activeSubsystem === 'FIELD_REPORT'
                ? 'bg-[#0878E8] hover:bg-blue-500 text-white border-blue-400'
                : activeSubsystem === 'EQUIPMENT'
                ? 'bg-purple-900/50 hover:bg-purple-800 text-purple-200 border-purple-700/60'
                : 'bg-cyan-900/50 hover:bg-cyan-800 text-cyan-200 border-cyan-700/60'
            }`}
          >
            {activeSubsystem === 'EQUIPMENT' ? (
              <>
                <Users className="w-3.5 h-3.5" />
                <span>Sang Quản lý nhân lực →</span>
              </>
            ) : activeSubsystem === 'WORKFORCE' ? (
              <>
                <ClipboardCheck className="w-3.5 h-3.5 text-cyan-300" />
                <span>Sang Báo cáo hiện trường →</span>
              </>
            ) : activeSubsystem === 'FIELD_REPORT' ? (
              <>
                <FolderKanban className="w-3.5 h-3.5 text-cyan-300" />
                <span>Sang Dự án New Model →</span>
              </>
            ) : (
              <>
                <Truck className="w-3.5 h-3.5" />
                <span>← Sang Điều động thiết bị</span>
              </>
            )}
          </button>

          <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
            <span>OOS Enterprise</span>
            <span className="font-mono text-slate-500">v2.4</span>
          </div>
        </div>
      )}
    </aside>
  );
};

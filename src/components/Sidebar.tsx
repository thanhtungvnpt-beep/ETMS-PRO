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
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'orders'
  | 'assets'
  | 'delivery'
  | 'labels'
  | 'reports'
  | 'settings'
  // Nhóm 10 trang Menu TỒN KHO
  | 'inventory-overview'
  | 'inventory-catalog'
  | 'inventory-by-factory'
  | 'inventory-intake'
  | 'inventory-dispatch'
  | 'inventory-movements'
  | 'inventory-audit'
  | 'inventory-discrepancies'
  | 'inventory-reports'
  | 'inventory-qr'
  // Nhóm 6 trang Menu QUẢN LÝ NHÂN LỰC (7 Vendor & SOP)
  | 'workforce-overview'
  | 'workforce-input'
  | 'workforce-by-factory'
  | 'workforce-by-vendor'
  | 'workforce-reports'
  | 'workforce-settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  compact?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  compact = false,
}) => {
  // Navigation items structured exactly as in the reference UI
  const isWorkforceActive = currentTab.startsWith('workforce-');

  return (
    <aside
      className={`bg-[#0a1829] text-slate-200 border-r border-[#152a42] flex flex-col justify-between select-none shrink-0 ${
        compact ? 'w-16' : 'w-56'
      }`}
    >
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="h-12 border-b border-[#152a42] flex items-center px-4 gap-2.5 shrink-0 bg-[#071322]">
          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
            E
          </div>
          {!compact && (
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wide text-white">ETMS</span>
              <span className="text-[10px] font-bold bg-blue-900/80 text-blue-300 px-1.5 py-0.2 rounded border border-blue-700/50">
                PRO
              </span>
            </div>
          )}
        </div>

        {/* Navigation list matching reference screenshot */}
        <nav className="p-2 space-y-1 overflow-y-auto flex-1 text-xs">
          {/* 1. Tổng quan điều động chung */}
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-slate-300" />
            {!compact && <span>Tổng quan</span>}
          </button>

          {/* 2. Quản lý nhân lực (Active module in reference screenshot) */}
          <div className="pt-1.5 pb-1">
            <div className="w-full flex items-center gap-2 px-3 py-1 rounded text-xs font-bold text-white bg-[#0e2137]">
              <Users className="w-4 h-4 text-blue-400 shrink-0" />
              {!compact && <span className="truncate">Quản lý nhân lực</span>}
            </div>

            {/* Sub-items under Quản lý nhân lực */}
            <div className="mt-1 space-y-0.5 pl-2">
              <button
                type="button"
                onClick={() => onSelectTab('workforce-overview')}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  currentTab === 'workforce-overview'
                    ? 'bg-[#1d64d8] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                {!compact && <span>Dashboard</span>}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('workforce-input')}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  currentTab === 'workforce-input'
                    ? 'bg-[#1d64d8] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                {!compact && <span>Nhập dữ liệu tuần</span>}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('workforce-by-vendor')}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  currentTab === 'workforce-by-vendor'
                    ? 'bg-[#1d64d8] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                {!compact && <span>Danh sách nhân sự</span>}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('workforce-reports')}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  currentTab === 'workforce-reports'
                    ? 'bg-[#1d64d8] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                }`}
              >
                <FileBarChart className="w-3.5 h-3.5 shrink-0" />
                {!compact && <span>Báo cáo</span>}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('workforce-overview')}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {!compact && <span>Cảnh báo</span>}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('workforce-by-factory')}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  currentTab === 'workforce-by-factory'
                    ? 'bg-[#1d64d8] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                {!compact && <span>Phân tích rủi ro</span>}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('workforce-reports')}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-colors cursor-pointer"
              >
                <Award className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                {!compact && <span>Thâm niên & tay nghề</span>}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('workforce-settings')}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  currentTab === 'workforce-settings'
                    ? 'bg-[#1d64d8] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-[#10243b]'
                }`}
              >
                <Settings className="w-3.5 h-3.5 shrink-0" />
                {!compact && <span>Cài đặt</span>}
              </button>
            </div>
          </div>

          {/* 3. Secondary Enterprise Operations */}
          <div className="pt-2 border-t border-[#152a42] space-y-0.5">
            <button
              type="button"
              onClick={() => onSelectTab('workforce-reports')}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {!compact && <span className="truncate">Kế hoạch sản xuất (SOP)</span>}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('inventory-catalog')}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-colors cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {!compact && <span className="truncate">Quản lý thiết bị</span>}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('orders')}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {!compact && <span className="truncate">Lệnh mua MRO</span>}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('delivery')}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-colors cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {!compact && <span className="truncate">Lệnh thuê dịch vụ</span>}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('inventory-dispatch')}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-colors cursor-pointer"
            >
              <Boxes className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {!compact && <span className="truncate">Lệnh Set / PBa</span>}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('inventory-movements')}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-colors cursor-pointer"
            >
              <FolderKanban className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {!compact && <span className="truncate">Dự án Model mới</span>}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('inventory-overview')}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {!compact && <span className="truncate">Tài sản</span>}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('reports')}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {!compact && <span className="truncate">Báo cáo tổng hợp</span>}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('settings')}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-[#10243b] transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {!compact && <span className="truncate">Cài đặt hệ thống</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Footer system info */}
      {!compact && (
        <div className="p-3 border-t border-[#152a42] text-[11px] text-slate-400 shrink-0 bg-[#071322]">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-0.5">
            <Shield className="w-3 h-3 text-blue-400" />
            <span>ETMS Enterprise</span>
          </div>
          <div className="text-[10px] text-slate-500">Phân hệ Quản lý Nhân lực 7 Vendor</div>
        </div>
      )}
    </aside>
  );
};

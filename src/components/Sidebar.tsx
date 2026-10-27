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
  const dispatchGroup = [
    { id: 'dashboard' as NavTab, label: 'Tổng quan điều động', icon: LayoutDashboard },
    { id: 'orders' as NavTab, label: 'Lệnh điều động', icon: FileSpreadsheet },
    { id: 'delivery' as NavTab, label: 'Giao nhận vận chuyển', icon: Truck },
    { id: 'labels' as NavTab, label: 'Tem QR điều động', icon: QrCode },
  ];

  const inventoryGroup = [
    { id: 'inventory-overview' as NavTab, label: '1. Tổng quan tồn kho', icon: Boxes },
    { id: 'inventory-catalog' as NavTab, label: '2. Danh mục tài sản', icon: Cpu },
    { id: 'inventory-by-factory' as NavTab, label: '3. Tồn kho theo nhà máy', icon: Building2 },
    { id: 'inventory-intake' as NavTab, label: '4. Nhập & tiếp nhận', icon: PackagePlus },
    { id: 'inventory-dispatch' as NavTab, label: '5. Xuất & điều chuyển', icon: ArrowRightLeft },
    { id: 'inventory-movements' as NavTab, label: '6. Sổ biến động', icon: History },
    { id: 'inventory-audit' as NavTab, label: '7. Kiểm kê tài sản', icon: ClipboardCheck },
    { id: 'inventory-discrepancies' as NavTab, label: '8. Sai lệch tồn kho', icon: AlertTriangle },
    { id: 'inventory-reports' as NavTab, label: '9. Báo cáo tồn kho', icon: FileBarChart },
    { id: 'inventory-qr' as NavTab, label: '10. Quản lý mã QR', icon: ScanLine },
  ];

  const workforceGroup = [
    { id: 'workforce-overview' as NavTab, label: '1. Tổng quan nhân lực', icon: Users },
    { id: 'workforce-input' as NavTab, label: '2. Nhập số liệu tuần', icon: FileSpreadsheet },
    { id: 'workforce-by-factory' as NavTab, label: '3. Theo nhà máy', icon: Building2 },
    { id: 'workforce-by-vendor' as NavTab, label: '4. Theo 7 Vendor', icon: Briefcase },
    { id: 'workforce-reports' as NavTab, label: '5. Báo cáo & xuất dữ liệu', icon: FileBarChart },
    { id: 'workforce-settings' as NavTab, label: '6. Cấu hình chu kỳ', icon: Settings },
  ];

  const systemGroup = [
    { id: 'reports' as NavTab, label: 'Báo cáo tổng hợp', icon: FileText },
    { id: 'settings' as NavTab, label: 'Cài đặt & Phân quyền', icon: Settings },
  ];

  return (
    <aside
      className={`bg-navy-950 text-slate-200 border-r border-navy-800 flex flex-col justify-between select-none shrink-0 ${
        compact ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand identity area inside sidebar */}
        <div className="h-12 border-b border-navy-800 flex items-center px-4 gap-2.5 shrink-0">
          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
            E
          </div>
          {!compact && (
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wide text-white">ETMS</span>
              <span className="text-[10px] font-semibold bg-blue-900/80 text-blue-300 px-1.5 py-0.2 rounded border border-blue-700/50">
                PRO
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Navigation links */}
        <nav className="p-2 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* SECTION 1: Điều Động Thiết Bị (9 Bước) */}
          <div>
            {!compact && (
              <div className="px-2.5 mb-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Điều Động (9 Bước)
              </div>
            )}
            <div className="space-y-0.5">
              {dispatchGroup.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-navy-900'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 text-slate-300" />
                    {!compact && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Menu Quản Lý Tồn Kho (10 Trang) */}
          <div>
            {!compact && (
              <div className="px-2.5 mb-1.5 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  Quản Lý Tồn Kho
                </span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-mono px-1 rounded border border-amber-500/40">
                  10 trang
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {inventoryGroup.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-amber-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-navy-900'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 text-amber-300/80" />
                    {!compact && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Menu Quản Lý Nhân Lực (6 Trang) */}
          <div>
            {!compact && (
              <div className="px-2.5 mb-1.5 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
                  Quản Lý Nhân Lực
                </span>
                <span className="text-[9px] bg-purple-500/20 text-purple-300 font-mono px-1 rounded border border-purple-500/40">
                  7 Vendor
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {workforceGroup.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-purple-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-navy-900'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 text-purple-300/80" />
                    {!compact && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Hệ Thống & Quản Trị */}
          <div>
            {!compact && (
              <div className="px-2.5 mb-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Hệ Thống
              </div>
            )}
            <div className="space-y-0.5">
              {systemGroup.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-navy-900'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 text-slate-300" />
                    {!compact && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* Footer system info */}
      {!compact && (
        <div className="p-3 border-t border-navy-800 text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-0.5">
            <Shield className="w-3 h-3 text-blue-400" />
            <span>ETMS Enterprise</span>
          </div>
          <div className="text-[10px] text-slate-400">Module Tồn Kho & Điều Động V1</div>
        </div>
      )}
    </aside>
  );
};

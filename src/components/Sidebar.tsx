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
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'orders'
  | 'assets'
  | 'delivery'
  | 'labels'
  | 'reports'
  | 'settings';

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
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'orders' as NavTab, label: 'Lệnh điều động', icon: FileSpreadsheet },
    { id: 'assets' as NavTab, label: 'Tài sản', icon: Cpu },
    { id: 'delivery' as NavTab, label: 'Giao nhận', icon: Truck },
    { id: 'labels' as NavTab, label: 'Tem tài sản', icon: QrCode },
    { id: 'reports' as NavTab, label: 'Báo cáo', icon: FileBarChart },
    { id: 'settings' as NavTab, label: 'Cài đặt', icon: Settings },
  ];

  return (
    <aside
      className={`bg-navy-950 text-slate-200 border-r border-navy-800 flex flex-col justify-between select-none ${
        compact ? 'w-16' : 'w-52'
      }`}
    >
      <div>
        {/* Brand identity area inside sidebar */}
        <div className="h-12 border-b border-navy-800 flex items-center px-4 gap-2.5">
          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
            E
          </div>
          {!compact && (
            <span className="font-extrabold text-sm tracking-wide text-white">ETMS</span>
          )}
        </div>

        {/* Navigation links */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-navy-900'
                }`}
                title={item.label}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!compact && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer system info */}
      {!compact && (
        <div className="p-3 border-t border-navy-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-0.5">
            <Shield className="w-3 h-3 text-blue-400" />
            <span>ETMS Enterprise</span>
          </div>
          <div className="text-[10px] text-slate-400">Baseline UI/UX V1</div>
        </div>
      )}
    </aside>
  );
};

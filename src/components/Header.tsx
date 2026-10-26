import React from 'react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import {
  Building2,
  ShieldAlert,
  RotateCcw,
  LayoutGrid,
  ListOrdered,
  Bell,
  CheckCircle2,
  ArrowRightLeft,
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  viewMode: 'baseline' | 'detailed';
  onChangeViewMode: (mode: 'baseline' | 'detailed') => void;
  onResetData: () => void;
  recentAuditCount: number;
  onOpenAuditLogs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSelectUser,
  viewMode,
  onChangeViewMode,
  onResetData,
  recentAuditCount,
  onOpenAuditLogs,
}) => {
  return (
    <header className="bg-navy-950 text-white border-b border-navy-800 sticky top-0 z-40 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-600 text-white font-black text-sm tracking-wider shadow-sm">
            E
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg tracking-tight text-white">ETMS PRO</span>
            <span className="text-xs text-slate-400 font-normal hidden sm:inline">
              Enterprise Equipment Transfer Management
            </span>
          </div>
        </div>

        {/* Center: Mode Switcher */}
        <div className="hidden md:flex items-center bg-navy-900 p-0.5 rounded-lg border border-slate-700/60 text-xs">
          <button
            type="button"
            onClick={() => onChangeViewMode('baseline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              viewMode === 'baseline'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Bố cục tham chiếu V1 (9 Khối)</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('detailed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              viewMode === 'detailed'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Không gian quản lý chuyên sâu</span>
          </button>
        </div>

        {/* Right: Actions, Role Selector & User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Reset Baseline Data */}
          <button
            type="button"
            onClick={onResetData}
            title="Khôi phục dữ liệu mẫu gốc theo ảnh tham chiếu"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-navy-900 hover:bg-slate-800 border border-slate-700/60 px-2.5 py-1.5 rounded-md transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Khôi phục dữ liệu gốc</span>
          </button>

          {/* Audit Log / Bell */}
          <button
            type="button"
            onClick={onOpenAuditLogs}
            className="relative p-1.5 text-slate-300 hover:text-white bg-navy-900 hover:bg-slate-800 border border-slate-700/60 rounded-md transition-colors"
            title="Xem nhật ký kiểm toán hệ thống"
          >
            <Bell className="w-4 h-4" />
            {recentAuditCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {recentAuditCount > 99 ? '99+' : recentAuditCount}
              </span>
            )}
          </button>

          {/* Role Switcher */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-700/60">
            <div className="hidden xl:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200">{currentUser.name}</span>
              <span className="text-[11px] text-blue-400 font-mono">{currentUser.title}</span>
            </div>

            <div className="relative">
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const found = INITIAL_USERS.find((u) => u.id === e.target.value);
                  if (found) onSelectUser(found);
                }}
                className="bg-navy-900 border border-slate-700 text-xs text-white rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
              >
                {INITIAL_USERS.map((user) => (
                  <option key={user.id} value={user.id} className="bg-slate-900 text-white">
                    {user.role === 'PLANNER'
                      ? 'Planner (Nguyễn Văn A)'
                      : user.role === 'FACTORY_A'
                      ? 'Nhà máy A (Trần Văn A)'
                      : user.role === 'FACTORY_B'
                      ? 'Nhà máy B (Lê Thị B)'
                      : 'Quản trị viên (Phạm Minh C)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold border border-blue-400/30">
              {currentUser.name.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

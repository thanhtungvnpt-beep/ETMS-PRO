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
  Truck,
  Users,
  Sparkles,
  LogOut,
  Factory,
} from 'lucide-react';

export type SubsystemType = 'EQUIPMENT' | 'WORKFORCE';

interface HeaderProps {
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  viewMode: 'baseline' | 'detailed';
  onChangeViewMode: (mode: 'baseline' | 'detailed') => void;
  activeSubsystem: SubsystemType;
  onChangeSubsystem: (subsystem: SubsystemType) => void;
  onResetData: () => void;
  recentAuditCount: number;
  onOpenAuditLogs: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSelectUser,
  viewMode,
  onChangeViewMode,
  activeSubsystem,
  onChangeSubsystem,
  onResetData,
  recentAuditCount,
  onOpenAuditLogs,
  onLogout,
}) => {
  return (
    <header className="bg-navy-950 text-white border-b border-navy-800 sticky top-0 z-40 px-3 lg:px-5 py-2">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center justify-center w-7 h-7 rounded bg-blue-600 text-white font-black text-xs tracking-wider shadow-sm">
            OOS
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="font-extrabold text-base tracking-tight text-white">OOS PRO</span>
              <span className="text-[10px] text-cyan-300 font-bold bg-blue-900/60 border border-blue-700/50 px-1.5 py-0.2 rounded hidden sm:inline">
                ENTERPRISE
              </span>
            </div>
            <span className="text-[9px] font-semibold text-slate-400 tracking-wider hidden sm:inline">
              OUTSOURCING OPERATION SYSTEM
            </span>
          </div>
        </div>

        {/* Center: Primary Subsystem Switcher (Clear separation of 2 subsystems) */}
        <div className="flex items-center bg-navy-900/90 p-1 rounded-lg border border-slate-700 shadow-inner">
          <button
            type="button"
            onClick={() => onChangeSubsystem('EQUIPMENT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeSubsystem === 'EQUIPMENT'
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>ĐIỀU ĐỘNG & TỒN KHO THIẾT BỊ</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeSubsystem('WORKFORCE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeSubsystem === 'WORKFORCE'
                ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-purple-300" />
            <span>QUẢN LÝ NHÂN LỰC (7 VENDOR)</span>
          </button>
        </div>

        {/* Right: Sub-mode & User info */}
        <div className="flex items-center gap-2">
          {/* Sub-view switcher ONLY for Equipment module */}
          {activeSubsystem === 'EQUIPMENT' && (
            <div className="hidden 2xl:flex items-center bg-navy-900 p-0.5 rounded-md border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => onChangeViewMode('baseline')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  viewMode === 'baseline'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Giao diện 9 khối chuẩn tham chiếu V1"
              >
                9 Khối V1
              </button>
              <button
                type="button"
                onClick={() => onChangeViewMode('detailed')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  viewMode === 'detailed'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Giao diện quản lý danh mục và tồn kho chi tiết"
              >
                Quản lý chi tiết
              </button>
            </div>
          )}

          {/* Reset Baseline Data */}
          <button
            type="button"
            onClick={onResetData}
            title="Khôi phục dữ liệu mẫu gốc ban đầu"
            className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-navy-900 hover:bg-slate-800 border border-slate-700 px-2 py-1 rounded transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden xl:inline">Reset dữ liệu</span>
          </button>

          {/* Audit Log / Bell */}
          <button
            type="button"
            onClick={onOpenAuditLogs}
            className="relative p-1.5 text-slate-300 hover:text-white bg-navy-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors cursor-pointer"
            title="Xem nhật ký kiểm toán hệ thống"
          >
            <Bell className="w-3.5 h-3.5" />
            {recentAuditCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-bold px-1 rounded-full tabular-nums">
                {recentAuditCount > 99 ? '99+' : recentAuditCount}
              </span>
            )}
          </button>

          {/* Role Switcher */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-700/80">
            <div className="hidden xl:flex flex-col text-right leading-tight">
              <span className="text-xs font-bold text-slate-100">{currentUser.name}</span>
              <span className="text-[10px] text-blue-400 font-mono">{currentUser.title}</span>
            </div>

            <select
              value={currentUser.id}
              onChange={(e) => {
                const found = INITIAL_USERS.find((u) => u.id === e.target.value);
                if (found) onSelectUser(found);
              }}
              className="bg-navy-900 border border-slate-700 text-xs text-white rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
            >
              {INITIAL_USERS.map((user) => (
                <option key={user.id} value={user.id} className="bg-slate-900 text-white">
                  {user.name} ({user.role})
                </option>
              ))}
            </select>

            <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold border border-blue-400/40 shrink-0">
              {currentUser.name.charAt(0)}
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Đăng xuất khỏi hệ thống OOS"
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 px-2 py-1 rounded transition-colors cursor-pointer ml-1"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden lg:inline">Đăng xuất</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

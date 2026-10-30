import React, { useState } from 'react';
import { UserProfile, TransferOrder } from '../../types';
import { INITIAL_USERS, INITIAL_ORDERS } from '../../data/mockData';
import {
  Shield,
  Users,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Bell,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { OverdueNotificationConfig } from './OverdueNotificationConfig';

interface SettingsViewProps {
  currentUser: UserProfile;
  orders?: TransferOrder[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  orders = INITIAL_ORDERS,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'notifications' | 'policies' | 'accounts' | 'factories'
  >('notifications');

  return (
    <div className="space-y-4 text-xs">
      {/* Subtab Navigation */}
      <div className="bg-white rounded-lg border border-slate-200 p-1.5 shadow-2xs flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('notifications')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === 'notifications'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Ngưỡng Cảnh Báo Quá Hạn & SLA Điểm Nghẽn</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-black ${
              activeSubTab === 'notifications'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            Slack / Email
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('policies')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === 'policies'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Quy Chuẩn Kiểm Soát 9 Bước</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('accounts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === 'accounts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Tài Khoản & Phân Quyền</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('factories')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-md font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === 'factories'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Danh Mục Nhà Máy</span>
        </button>
      </div>

      {/* SUBTAB 1: OVERDUE NOTIFICATION THRESHOLDS & 9-STEP SLA BOTTLENECK CONFIG */}
      {activeSubTab === 'notifications' && (
        <div className="animate-fadeIn">
          <OverdueNotificationConfig orders={orders} currentUser={currentUser} />
        </div>
      )}

      {/* SUBTAB 2: POLICY GOVERNANCE OVERVIEW */}
      {activeSubTab === 'policies' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
            <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Quy Chuẩn Nghiệp Vụ & Chính Sách Kiểm Soát OOS ETMS PRO</span>
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Thiết lập hệ thống kiểm soát tuân thủ quy trình 9 bước điều động thiết bị liên nhà máy.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kiểm Soát 9 Bước Bắt Buộc</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Mỗi bước chỉ được mở khóa khi bước trước đó đạt điều kiện xác minh đầy đủ. Không cho phép nhảy cóc hoặc phê duyệt tắt.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Chặn Chuyển Sổ Sách Khi Có Sai Lệch</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Nếu Nhà máy B phát hiện thiếu máy, sai serial hoặc hư hỏng ở Bước 6, hệ thống tự động khóa Bước 7 cho đến khi có biên bản xử lý hoặc duyệt ngoại lệ.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Bảo Toàn Lịch Sử & Bất Khả Biến</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Mọi chỉnh sửa, xác nhận hoặc hủy lệnh đều tăng version, lưu diff trước/sau và ghi nhật ký máy chủ. Không cho phép xóa lệnh hoặc lịch sử.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: ROLES & ACCOUNTS DIRECTORY */}
      {activeSubTab === 'accounts' && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs animate-fadeIn">
          <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Danh Sách Tài Khoản & Phân Quyền Người Dùng</span>
          </h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-2.5">Họ và tên</th>
                  <th className="p-2.5">Vai trò hệ thống</th>
                  <th className="p-2.5">Phạm vi phụ trách</th>
                  <th className="p-2.5">Chức danh nghiệp vụ</th>
                  <th className="p-2.5 text-right">Quyền hạn chính</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {INITIAL_USERS.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                        {u.name.charAt(0)}
                      </span>
                      <span>{u.name}</span>
                    </td>
                    <td className="p-2.5 font-mono font-semibold text-blue-700">{u.role}</td>
                    <td className="p-2.5 text-slate-700">{u.factory}</td>
                    <td className="p-2.5 text-slate-600">{u.title}</td>
                    <td className="p-2.5 text-right text-slate-500 text-[11px]">
                      {u.role === 'PLANNER'
                        ? 'Tạo lệnh, Chuyển sổ sách, In tem'
                        : u.role === 'FACTORY_A'
                        ? 'Duyệt xuất, Đăng ký tài sản, Tải BBGN'
                        : u.role === 'FACTORY_B'
                        ? 'Duyệt nhận, Đối chiếu, Dán tem'
                        : 'Toàn quyền kiểm trị & duyệt ngoại lệ'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4: FACTORIES DIRECTORY */}
      {activeSubTab === 'factories' && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs animate-fadeIn">
          <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Danh Mục Cơ Sở Sản Xuất Trong Hệ Thống</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="font-bold text-slate-900 mb-1">Nhà máy A (Miền Bắc)</div>
              <div className="text-[11px] text-slate-600 space-y-0.5">
                <div>Địa điểm: KCN Bắc Thăng Long, Đông Anh, Hà Nội</div>
                <div>Quy mô: 25.000 m² - Gia công cơ khí chính xác</div>
                <div>Trưởng bộ phận: Trần Văn A</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="font-bold text-slate-900 mb-1">Nhà máy B (Miền Nam)</div>
              <div className="text-[11px] text-slate-600 space-y-0.5">
                <div>Địa điểm: Khu công nghệ cao, TP. Thủ Đức, TP. HCM</div>
                <div>Quy mô: 40.000 m² - Lắp ráp thiết bị công nghệ cao</div>
                <div>Trưởng bộ phận: Lê Thị B</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="font-bold text-slate-900 mb-1">Nhà máy C (Duyên Hải)</div>
              <div className="text-[11px] text-slate-600 space-y-0.5">
                <div>Địa điểm: KCN Đình Vũ, Hải An, Hải Phòng</div>
                <div>Quy mô: 30.000 m² - Xưởng đúc và xử lý bề mặt</div>
                <div>Trưởng bộ phận: Ngô Văn C</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { UserProfile } from '../../types';
import { INITIAL_USERS } from '../../data/mockData';
import { Shield, Users, Building2, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';

interface SettingsViewProps {
  currentUser: UserProfile;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currentUser }) => {
  return (
    <div className="space-y-4 text-xs">
      {/* Policy Governance Overview */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
        <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>Quy Chuẩn Nghiệp Vụ & Chính Sách Kiểm Soát ETMS PRO</span>
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

      {/* Roles & Accounts Directory */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
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

      {/* Factories Directory */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
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
    </div>
  );
};

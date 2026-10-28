import React from 'react';
import { ProjectStepNumber } from '../../types/newModelProject';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Truck,
  ShoppingCart,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  XCircle,
  FileText,
  Calendar,
  Building2,
  ClipboardList,
  UserCheck,
  Search,
  BookOpen,
} from 'lucide-react';

interface Props {
  currentStep?: ProjectStepNumber;
  selectedStep?: ProjectStepNumber;
  onSelectStep?: (step: ProjectStepNumber) => void;
  branchType?: 'ĐỦ TÀI NGUYÊN' | 'THIẾU TÀI NGUYÊN' | 'KẾT HỢP';
  isCompleted?: boolean;
}

export const NewModelWorkflowBanner: React.FC<Props> = ({
  currentStep = 1,
  selectedStep,
  onSelectStep,
}) => {
  return (
    <div className="bg-[#071d37] text-white rounded-lg shadow-md border border-[#12335a] overflow-hidden select-none">
      {/* Title Bar */}
      <div className="py-2.5 px-4 text-center border-b border-[#12335a] bg-[#06182e]">
        <h2 className="text-sm font-black tracking-wider uppercase text-white">
          QUY TRÌNH QUẢN LÝ DỰ ÁN MODEL MỚI
        </h2>
        <p className="text-[11px] text-blue-200 font-medium tracking-tight mt-0.5">
          Từ kế hoạch → Điền đầy tài nguyên → Rà soát kỹ thuật → Setup Line → Planner xác nhận hoàn thành
        </p>
      </div>

      <div className="p-3 space-y-3 overflow-x-auto text-slate-800">
        {/* ROW 1: Bước 1 đến Bước 6 kèm Phân nhánh Quyết định */}
        <div className="flex items-stretch gap-1.5 min-w-[1240px]">
          {/* BƯỚC 1: Plan khởi tạo Model mới */}
          <div
            onClick={() => onSelectStep?.(1)}
            className={`flex-1 rounded-md p-2.5 flex flex-col justify-between transition-all cursor-pointer ${
              selectedStep === 1
                ? 'bg-blue-100 ring-2 ring-blue-500 shadow-md'
                : 'bg-[#eaf4fe] hover:bg-blue-100/90'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <h4 className="text-xs font-bold text-blue-900 leading-tight">
                  Plan khởi tạo Model mới
                </h4>
              </div>

              {/* Graphic Icon */}
              <div className="h-14 flex items-center justify-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="w-9 h-9 rounded bg-blue-50 border border-blue-300 flex items-center justify-center text-blue-600 shadow-2xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Bullet list */}
              <ul className="text-[10px] space-y-0.5 text-slate-600 font-medium list-disc list-inside leading-tight mb-2">
                <li>Lập kế hoạch Model mới</li>
                <li>Chọn Model, nhà máy</li>
                <li>Nhập số Line, sản lượng</li>
                <li>Thời gian triển khai</li>
                <li>Gửi cho Planner</li>
              </ul>
            </div>

            <button
              type="button"
              className="w-full py-1 rounded bg-[#c5e2fe] hover:bg-blue-300 text-blue-900 font-bold text-[10px] uppercase tracking-wider text-center transition-colors"
            >
              KẾ HOẠCH MODEL MỚI
            </button>
          </div>

          <div className="flex items-center justify-center text-slate-400 shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* BƯỚC 2: Planner khai báo tiêu chuẩn thiết bị */}
          <div
            onClick={() => onSelectStep?.(2)}
            className={`flex-1 rounded-md p-2.5 flex flex-col justify-between transition-all cursor-pointer ${
              selectedStep === 2
                ? 'bg-emerald-100 ring-2 ring-emerald-500 shadow-md'
                : 'bg-[#eafbf0] hover:bg-emerald-100/90'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <h4 className="text-xs font-bold text-emerald-900 leading-tight">
                  Planner khai báo tiêu chuẩn thiết bị
                </h4>
              </div>

              {/* Graphic Icon */}
              <div className="h-14 flex items-center justify-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div className="w-9 h-9 rounded bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-600 shadow-2xs">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Bullet list */}
              <ul className="text-[10px] space-y-0.5 text-slate-600 font-medium list-disc list-inside leading-tight mb-2">
                <li>Khai báo tiêu chuẩn</li>
                <li>Số thiết bị cần cho 1 Line</li>
                <li>Danh sách thiết bị theo Model</li>
                <li>Thông số kỹ thuật</li>
                <li>Yêu cầu đặc biệt</li>
              </ul>
            </div>

            <button
              type="button"
              className="w-full py-1 rounded bg-[#c1f5d3] hover:bg-emerald-300 text-emerald-900 font-bold text-[10px] uppercase tracking-wider text-center transition-colors"
            >
              TIÊU CHUẨN THIẾT BỊ
            </button>
          </div>

          <div className="flex items-center justify-center text-slate-400 shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* BƯỚC 3: Leader rà soát tài nguyên */}
          <div
            onClick={() => onSelectStep?.(3)}
            className={`flex-1 rounded-md p-2.5 flex flex-col justify-between transition-all cursor-pointer ${
              selectedStep === 3
                ? 'bg-amber-100 ring-2 ring-amber-500 shadow-md'
                : 'bg-[#fef4e8] hover:bg-amber-100/90'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <h4 className="text-xs font-bold text-amber-900 leading-tight">
                  Leader rà soát tài nguyên
                </h4>
              </div>

              {/* Graphic Icon */}
              <div className="h-14 flex items-center justify-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="w-9 h-9 rounded bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-600 shadow-2xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Bullet list */}
              <ul className="text-[10px] space-y-0.5 text-slate-600 font-medium list-disc list-inside leading-tight mb-2">
                <li>Kiểm tra tài nguyên dư thừa nội bộ (nhà máy)</li>
                <li>Đánh giá khả năng sử dụng</li>
                <li>Xác nhận số lượng có thể điều động</li>
              </ul>
            </div>

            <button
              type="button"
              className="w-full py-1 rounded bg-[#fddbb5] hover:bg-amber-300 text-amber-900 font-bold text-[10px] uppercase tracking-wider text-center transition-colors"
            >
              RÀ SOÁT NỘI BỘ
            </button>
          </div>

          <div className="flex items-center justify-center text-slate-400 shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* BƯỚC 4: Planner kiểm tra dư thừa toàn nhà máy */}
          <div
            onClick={() => onSelectStep?.(4)}
            className={`flex-1 rounded-md p-2.5 flex flex-col justify-between transition-all cursor-pointer ${
              selectedStep === 4
                ? 'bg-purple-100 ring-2 ring-purple-500 shadow-md'
                : 'bg-[#f4eefe] hover:bg-purple-100/90'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  4
                </span>
                <h4 className="text-xs font-bold text-purple-900 leading-tight">
                  Planner kiểm tra dư thừa toàn nhà máy
                </h4>
              </div>

              {/* Graphic Icon */}
              <div className="h-14 flex items-center justify-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="w-9 h-9 rounded bg-purple-50 border border-purple-300 flex items-center justify-center text-purple-600 shadow-2xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Bullet list */}
              <ul className="text-[10px] space-y-0.5 text-slate-600 font-medium list-disc list-inside leading-tight mb-2">
                <li>Kiểm tra tồn thiết bị toàn nhà máy</li>
                <li>Tìm thiết bị dư thừa có thể sử dụng</li>
                <li>So sánh với nhu cầu</li>
                <li>Xác định số lượng thiếu / đủ</li>
              </ul>
            </div>

            <button
              type="button"
              className="w-full py-1 rounded bg-[#dfcbfe] hover:bg-purple-300 text-purple-900 font-bold text-[10px] uppercase tracking-wider text-center transition-colors"
            >
              RÀ SOÁT TOÀN NHÀ MÁY
            </button>
          </div>

          {/* DECISION BRANCH: Đủ tài nguyên? -> 5A / 5B */}
          <div className="flex items-center justify-center px-1">
            <div className="w-16 h-16 rounded bg-sky-100 border-2 border-sky-400 rotate-45 flex items-center justify-center shadow-xs">
              <span className="-rotate-45 text-[9px] font-black text-sky-900 text-center leading-tight">
                Đủ tài nguyên?
              </span>
            </div>
          </div>

          {/* DUAL BRANCH: 5A (Đủ) & 5B (Không đủ) */}
          <div className="w-72 flex flex-col justify-between gap-2">
            {/* Branch 5A: ĐỦ -> Tạo lệnh điều động */}
            <div
              onClick={() => onSelectStep?.(5)}
              className="bg-[#e9fbf0] border border-emerald-300 rounded p-2 flex flex-col justify-between transition-all cursor-pointer hover:bg-emerald-100/90"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center">
                    5A
                  </span>
                  <span className="text-[11px] font-bold text-emerald-900">
                    Tạo lệnh điều động (thiết bị dư thừa)
                  </span>
                </div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                  Đủ
                </span>
              </div>

              {/* Graphic Flow: Nhà máy B -> Xe tải -> Nhà máy A */}
              <div className="flex items-center justify-between px-2 py-1 bg-white/70 rounded border border-emerald-200 text-[9px] font-semibold text-slate-700 mb-1">
                <span>Nhà máy B</span>
                <ArrowRight className="w-3 h-3 text-emerald-600" />
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <ArrowRight className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-800 font-bold">Nhà máy A</span>
              </div>

              <ul className="text-[9px] text-slate-600 space-y-0.2 list-disc list-inside mb-1">
                <li>Tạo lệnh điều động thiết bị</li>
                <li>Thực hiện theo quy trình điều động</li>
                <li>Cập nhật vận chuyển và giao nhận</li>
              </ul>

              <button
                type="button"
                className="w-full py-0.5 rounded bg-[#c1f5d3] text-emerald-900 font-bold text-[9px] uppercase tracking-wider text-center"
              >
                ĐIỀU ĐỘNG THIẾT BỊ
              </button>
            </div>

            {/* Branch 5B: KHÔNG ĐỦ -> Tạo lệnh mua hàng */}
            <div
              onClick={() => onSelectStep?.(5)}
              className="bg-[#fef0f0] border border-rose-300 rounded p-2 flex flex-col justify-between transition-all cursor-pointer hover:bg-rose-100/90"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center">
                    5B
                  </span>
                  <span className="text-[11px] font-bold text-rose-900">
                    Tạo lệnh mua hàng (điền đầy tài nguyên)
                  </span>
                </div>
                <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-300">
                  Không đủ
                </span>
              </div>

              {/* Graphic Flow: Mua hàng -> Hàng về kho tổng -> Cung cấp Nhà máy A */}
              <div className="flex items-center justify-between px-2 py-1 bg-white/70 rounded border border-rose-200 text-[9px] font-semibold text-slate-700 mb-1">
                <ShoppingCart className="w-3.5 h-3.5 text-rose-600" />
                <ArrowRight className="w-3 h-3 text-rose-600" />
                <span>Kho tổng</span>
                <ArrowRight className="w-3 h-3 text-rose-600" />
                <span className="text-rose-800 font-bold">Nhà máy A</span>
              </div>

              <ul className="text-[9px] text-slate-600 space-y-0.2 list-disc list-inside mb-1">
                <li>Người mua hàng tạo lệnh mua</li>
                <li>Hàng về kho tổng</li>
                <li>Cung cấp cho nhà máy A, nhận đủ</li>
              </ul>

              <button
                type="button"
                className="w-full py-0.5 rounded bg-[#fec5c5] text-rose-900 font-bold text-[9px] uppercase tracking-wider text-center"
              >
                MUA HÀNG BỔ SUNG
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center text-slate-400 shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* BƯỚC 6: Điền đầy tài nguyên và xác nhận nhận đủ */}
          <div
            onClick={() => onSelectStep?.(6)}
            className={`flex-1 rounded-md p-2.5 flex flex-col justify-between transition-all cursor-pointer ${
              selectedStep === 6
                ? 'bg-amber-100 ring-2 ring-amber-500 shadow-md'
                : 'bg-[#fef5e7] hover:bg-amber-100/90'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  6
                </span>
                <h4 className="text-xs font-bold text-amber-900 leading-tight">
                  Điền đầy tài nguyên và xác nhận nhận đủ
                </h4>
              </div>

              {/* Graphic Icon */}
              <div className="h-14 flex items-center justify-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-600 shadow-2xs">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div className="w-9 h-9 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Bullet list */}
              <ul className="text-[10px] space-y-0.5 text-slate-600 font-medium list-disc list-inside leading-tight mb-2">
                <li>Kiểm tra số lượng, đúng Model</li>
                <li>Xác nhận nhận đủ thiết bị</li>
                <li>Cập nhật trạng thái</li>
                <li>Hoàn tất điền đầy tài nguyên</li>
              </ul>
            </div>

            <button
              type="button"
              className="w-full py-1 rounded bg-[#fddbb5] hover:bg-amber-300 text-amber-900 font-bold text-[10px] uppercase tracking-wider text-center transition-colors"
            >
              HOÀN TẤT TÀI NGUYÊN
            </button>
          </div>
        </div>

        {/* ROW 2: Bước 7, Bước 8, Bước 9 & Bảng Checklist Setup Line */}
        <div className="flex items-stretch gap-2 min-w-[1240px]">
          {/* BƯỚC 7: Rà soát kỹ thuật thiết bị */}
          <div
            onClick={() => onSelectStep?.(7)}
            className={`w-64 rounded-md p-2.5 flex flex-col justify-between transition-all cursor-pointer ${
              selectedStep === 7
                ? 'bg-sky-100 ring-2 ring-sky-500 shadow-md'
                : 'bg-[#eaf5fe] hover:bg-sky-100/90'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  7
                </span>
                <h4 className="text-xs font-bold text-sky-900 leading-tight">
                  Rà soát kỹ thuật thiết bị
                </h4>
              </div>

              {/* Graphic Icon */}
              <div className="h-12 flex items-center justify-center mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-sky-200 text-sky-700 flex items-center justify-center">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded bg-sky-50 border border-sky-300 flex items-center justify-center text-sky-600 shadow-2xs">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <ul className="text-[10px] space-y-0.5 text-slate-600 font-medium list-disc list-inside leading-tight mb-2">
                <li>Kỹ thuật viên kiểm tra từng máy theo checklist</li>
                <li>Phát hiện lỗi, linh kiện cần sửa/bảo dưỡng</li>
                <li>Tạo yêu cầu sửa chữa, bảo dưỡng sớm</li>
                <li>Dán tem ghi rõ Model và thông tin trọng điểm</li>
              </ul>
            </div>

            <button
              type="button"
              className="w-full py-1 rounded bg-[#c5e6fe] hover:bg-sky-300 text-sky-900 font-bold text-[10px] uppercase tracking-wider text-center"
            >
              KIỂM TRA & BẢO DƯỠNG
            </button>
          </div>

          <div className="flex items-center justify-center text-slate-400 shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* BƯỚC 8: Setup máy thành Line (Leader thiết bị) */}
          <div
            onClick={() => onSelectStep?.(8)}
            className={`w-64 rounded-md p-2.5 flex flex-col justify-between transition-all cursor-pointer ${
              selectedStep === 8
                ? 'bg-purple-100 ring-2 ring-purple-500 shadow-md'
                : 'bg-[#f4eefe] hover:bg-purple-100/90'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  8
                </span>
                <h4 className="text-xs font-bold text-purple-900 leading-tight">
                  Setup máy thành Line (Leader thiết bị)
                </h4>
              </div>

              {/* Graphic Icon */}
              <div className="h-12 flex items-center justify-center mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded bg-purple-50 border border-purple-300 flex items-center justify-center text-purple-600 shadow-2xs">
                    <Wrench className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <ul className="text-[10px] space-y-0.5 text-slate-600 font-medium list-disc list-inside leading-tight mb-2">
                <li>Cập nhật tình trạng setup máy</li>
                <li>Xác nhận các hạng mục đã lắp đặt</li>
                <li>Xác nhận hạ tầng, IT, đào tạo, kiểm thử</li>
                <li>Cập nhật tiến độ và hình ảnh</li>
              </ul>
            </div>

            <button
              type="button"
              className="w-full py-1 rounded bg-[#dfcbfe] hover:bg-purple-300 text-purple-900 font-bold text-[10px] uppercase tracking-wider text-center"
            >
              SETUP LINE
            </button>
          </div>

          <div className="flex items-center justify-center text-slate-400 shrink-0">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* BƯỚC 9: Planner xác nhận hoàn thành */}
          <div
            onClick={() => onSelectStep?.(9)}
            className={`w-64 rounded-md p-2.5 flex flex-col justify-between transition-all cursor-pointer ${
              selectedStep === 9
                ? 'bg-emerald-100 ring-2 ring-emerald-500 shadow-md'
                : 'bg-[#eafbf0] hover:bg-emerald-100/90'
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  9
                </span>
                <h4 className="text-xs font-bold text-emerald-900 leading-tight">
                  Planner xác nhận hoàn thành
                </h4>
              </div>

              {/* Graphic Icon */}
              <div className="h-12 flex items-center justify-center mb-1.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center text-emerald-600 shadow-xs">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
              </div>

              <ul className="text-[10px] space-y-0.5 text-slate-600 font-medium list-disc list-inside leading-tight mb-2">
                <li>Kiểm tra kết quả setup của Leader</li>
                <li>Đánh giá đáp ứng kế hoạch sản xuất</li>
                <li>Xác nhận hoàn thành hoặc yêu cầu bổ sung</li>
                <li>Đóng dự án khi đạt yêu cầu</li>
              </ul>
            </div>

            <button
              type="button"
              className="w-full py-1 rounded bg-[#bbf7d0] hover:bg-emerald-300 text-emerald-900 font-bold text-[10px] uppercase tracking-wider text-center"
            >
              XÁC NHẬN HOÀN THÀNH
            </button>
          </div>

          {/* CHECKLIST SETUP LINE (LEADER CẬP NHẬT) */}
          <div className="flex-1 bg-white rounded-md border border-amber-300 p-2.5 shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-amber-200">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-amber-900">
                Checklist Setup Line (Leader cập nhật)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-amber-50/80 text-amber-900 font-bold border-b border-amber-200">
                    <th className="py-1 px-1.5 text-center w-8">STT</th>
                    <th className="py-1 px-2">Hạng mục</th>
                    <th className="py-1 px-2">Nội dung</th>
                    <th className="py-1 px-2">Trạng thái</th>
                    <th className="py-1 px-2">Người phụ trách</th>
                    <th className="py-1 px-2 text-right">Ngày xác nhận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 text-slate-700">
                  <tr>
                    <td className="py-1 px-1.5 text-center font-bold">1</td>
                    <td className="py-1 px-2 font-semibold">Lắp đặt thiết bị</td>
                    <td className="py-1 px-2 text-slate-600">Máy đã lắp đặt đúng vị trí</td>
                    <td className="py-1 px-2">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Hoàn thành</span>
                      </span>
                    </td>
                    <td className="py-1 px-2">Nguyễn Văn A</td>
                    <td className="py-1 px-2 text-right font-mono">10/04/2025</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-1.5 text-center font-bold">2</td>
                    <td className="py-1 px-2 font-semibold">Hạ tầng</td>
                    <td className="py-1 px-2 text-slate-600">Điện, nước, mạng</td>
                    <td className="py-1 px-2">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Hoàn thành</span>
                      </span>
                    </td>
                    <td className="py-1 px-2">Trần Văn B</td>
                    <td className="py-1 px-2 text-right font-mono">12/04/2025</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-1.5 text-center font-bold">3</td>
                    <td className="py-1 px-2 font-semibold">IT và chương trình</td>
                    <td className="py-1 px-2 text-slate-600">Phần mềm, cấu hình</td>
                    <td className="py-1 px-2">
                      <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Đang thực hiện</span>
                      </span>
                    </td>
                    <td className="py-1 px-2">Lê Thị C</td>
                    <td className="py-1 px-2 text-right font-mono">15/04/2025</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-1.5 text-center font-bold">4</td>
                    <td className="py-1 px-2 font-semibold">Đào tạo</td>
                    <td className="py-1 px-2 text-slate-600">Đào tạo kỹ thuật viên</td>
                    <td className="py-1 px-2">
                      <span className="inline-flex items-center gap-1 text-blue-700 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        <span>Chưa thực hiện</span>
                      </span>
                    </td>
                    <td className="py-1 px-2">Phạm Văn D</td>
                    <td className="py-1 px-2 text-right font-mono">-</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-1.5 text-center font-bold">5</td>
                    <td className="py-1 px-2 font-semibold">Kiểm thử</td>
                    <td className="py-1 px-2 text-slate-600">Chạy thử hoàn thiện</td>
                    <td className="py-1 px-2">
                      <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>Có vấn đề</span>
                      </span>
                    </td>
                    <td className="py-1 px-2">Hoàng Văn E</td>
                    <td className="py-1 px-2 text-right font-mono">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

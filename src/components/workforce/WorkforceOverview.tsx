import React, { useState, useMemo } from 'react';
import {
  WeeklyWorkforceSubmission,
  ReportingCycleConfig,
  UserProfile,
  VendorName,
  VENDOR_LIST,
} from '../../types/workforce';
import {
  Users,
  UserCheck,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Settings,
  ClipboardCheck,
  BarChart3,
  Monitor,
  Award,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  X,
  FileSpreadsheet,
  Download,
  Info,
  Check,
} from 'lucide-react';

interface WorkforceOverviewProps {
  submissions: WeeklyWorkforceSubmission[];
  cycles: ReportingCycleConfig[];
  currentUser: UserProfile;
  onNavigateTab: (tab: any) => void;
  onSelectSubmissionToEdit: (submission: WeeklyWorkforceSubmission) => void;
}

// Fixed baseline metrics for the reference cycle (matching uploaded screenshot 100%)
interface VendorMetrics {
  headcount: number;
  sop: number; // in thousand pcs (nghìn SP)
  official: number;
  seasonal: number;
  admin: number;
  prod: number;
  qc: number;
  eqm: number;
  other: number;
  sopNext: number;
  targetHeadcount: number;
  deltaForecast: number;
  riskLevel: 'Cao' | 'Trung bình' | 'Thấp';
}

const VENDOR_BASELINE_DATA: Record<VendorName, VendorMetrics> = {
  KHV: {
    headcount: 820,
    sop: 180,
    official: 588,
    seasonal: 232,
    admin: 165,
    prod: 420,
    qc: 135,
    eqm: 80,
    other: 20,
    sopNext: 190,
    targetHeadcount: 850,
    deltaForecast: -30,
    riskLevel: 'Trung bình',
  },
  'DREAM TECH': {
    headcount: 760,
    sop: 160,
    official: 545,
    seasonal: 215,
    admin: 95,
    prod: 450,
    qc: 130,
    eqm: 70,
    other: 15,
    sopNext: 175,
    targetHeadcount: 830,
    deltaForecast: -70,
    riskLevel: 'Cao',
  },
  HSTEC: {
    headcount: 680,
    sop: 120,
    official: 490,
    seasonal: 190,
    admin: 85,
    prod: 390,
    qc: 125,
    eqm: 65,
    other: 15,
    sopNext: 130,
    targetHeadcount: 620,
    deltaForecast: 60,
    riskLevel: 'Thấp',
  },
  KTECH: {
    headcount: 1250,
    sop: 200,
    official: 900,
    seasonal: 350,
    admin: 135,
    prod: 720,
    qc: 245,
    eqm: 120,
    other: 30,
    sopNext: 220,
    targetHeadcount: 1050,
    deltaForecast: 200,
    riskLevel: 'Thấp',
  },
  HOJEONGB: {
    headcount: 620,
    sop: 110,
    official: 445,
    seasonal: 175,
    admin: 75,
    prod: 360,
    qc: 110,
    eqm: 60,
    other: 15,
    sopNext: 120,
    targetHeadcount: 600,
    deltaForecast: 20,
    riskLevel: 'Thấp',
  },
  'HOJEONG VINA': {
    headcount: 700,
    sop: 140,
    official: 500,
    seasonal: 200,
    admin: 80,
    prod: 410,
    qc: 130,
    eqm: 68,
    other: 12,
    sopNext: 160,
    targetHeadcount: 760,
    deltaForecast: -60,
    riskLevel: 'Cao',
  },
  DAAL: {
    headcount: 598,
    sop: 135,
    official: 424,
    seasonal: 174,
    admin: 70,
    prod: 352,
    qc: 110,
    eqm: 55,
    other: 11,
    sopNext: 150,
    targetHeadcount: 720,
    deltaForecast: -122,
    riskLevel: 'Cao',
  },
};

export const WorkforceOverview: React.FC<WorkforceOverviewProps> = ({
  submissions,
  cycles,
  currentUser,
  onNavigateTab,
  onSelectSubmissionToEdit,
}) => {
  // Vendor filter: 'ALL' or specific vendor name
  const [selectedVendor, setSelectedVendor] = useState<string>('ALL');
  // Specific vendor for the detail breakdown tables (defaults to KHV as shown in screenshot)
  const [detailVendor, setDetailVendor] = useState<VendorName>('KHV');
  // Risk modal state
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [isPhase2ModalOpen, setIsPhase2ModalOpen] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // Active cycle
  const activeCycle = cycles.find((c) => c.isActive) || cycles[0] || {
    id: '2025-W16',
    title: 'Tuần 16 (20/04/2025 - 26/04/2025)',
  };

  // 1. KPI summary values
  const kpiData = useMemo(() => {
    if (selectedVendor === 'ALL') {
      return {
        totalHeadcount: 5428,
        headcountDelta: '+2.3%',
        official: 3892,
        officialDelta: '+1.8%',
        officialPct: '71.7%',
        seasonal: 1536,
        seasonalDelta: '+3.5%',
        seasonalPct: '28.3%',
        totalSOP: '1,245,000',
        sopDelta: '+4.1%',
        ratio: '4.36',
        ratioStatus: 'Ổn định',
        riskCount: '2 / 7',
        riskSub: 'Nhà máy',
        riskBadge: 'Cần chú ý',
      };
    }

    const vData = VENDOR_BASELINE_DATA[selectedVendor as VendorName] || VENDOR_BASELINE_DATA['KHV'];
    const total = vData.headcount;
    const off = vData.official;
    const sea = vData.seasonal;
    const offPct = ((off / total) * 100).toFixed(1) + '%';
    const seaPct = ((sea / total) * 100).toFixed(1) + '%';
    const ratio = (total / vData.sop).toFixed(2);

    return {
      totalHeadcount: total,
      headcountDelta: '+1.5%',
      official: off,
      officialDelta: '+1.2%',
      officialPct: offPct,
      seasonal: sea,
      seasonalDelta: '+2.1%',
      seasonalPct: seaPct,
      totalSOP: (vData.sop * 1000).toLocaleString('vi-VN'),
      sopDelta: '+3.0%',
      ratio,
      ratioStatus: vData.riskLevel === 'Cao' ? 'Cảnh báo' : 'Ổn định',
      riskCount: vData.riskLevel === 'Cao' ? '1 / 1' : '0 / 1',
      riskSub: selectedVendor,
      riskBadge: vData.riskLevel === 'Cao' ? 'Cần chú ý' : 'An toàn',
    };
  }, [selectedVendor]);

  // Dual axis chart data for 7 vendors
  const comparisonData = useMemo(() => {
    return [
      { vendor: 'KHV', headcount: 820, sop: 180 },
      { vendor: 'DREAM TECH', headcount: 760, sop: 160 },
      { vendor: 'HSTEC', headcount: 680, sop: 120 },
      { vendor: 'KTECH', headcount: 1250, sop: 200 },
      { vendor: 'HOJEONGB', headcount: 620, sop: 110 },
      { vendor: 'HOJEONG VINA', headcount: 700, sop: 140 },
      { vendor: 'DAAL', headcount: 598, sop: 135 },
    ];
  }, []);

  // KHV Trend over 5 weeks (Bottom Chart 1)
  const khvTrend = [
    { week: 'Tuần 16', sop: 150, headcount: 750, ratio: 5.0 },
    { week: 'Tuần 17', sop: 150, headcount: 780, ratio: 4.88 },
    { week: 'Tuần 18', sop: 170, headcount: 800, ratio: 4.71 },
    { week: 'Tuần 19', sop: 175, headcount: 810, ratio: 4.63 },
    { week: 'Tuần 20', sop: 180, headcount: 820, ratio: 4.56 },
  ];

  // Forecast table data
  const forecastRows = [
    {
      vendor: 'KHV',
      sopNext: 190,
      targetHeadcount: 850,
      currentHeadcount: 820,
      delta: -30,
      risk: 'Trung bình',
      riskColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      vendor: 'DREAM TECH',
      sopNext: 175,
      targetHeadcount: 830,
      currentHeadcount: 760,
      delta: -70,
      risk: 'Cao',
      riskColor: 'bg-red-100 text-red-800 border-red-300',
    },
    {
      vendor: 'HSTEC',
      sopNext: 130,
      targetHeadcount: 620,
      currentHeadcount: 680,
      delta: 60,
      risk: 'Thấp',
      riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      vendor: 'KTECH',
      sopNext: 220,
      targetHeadcount: 1050,
      currentHeadcount: 1250,
      delta: 200,
      risk: 'Thấp',
      riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      vendor: 'HOJEONGB',
      sopNext: 120,
      targetHeadcount: 600,
      currentHeadcount: 620,
      delta: 20,
      risk: 'Thấp',
      riskColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      vendor: 'HOJEONG VINA',
      sopNext: 160,
      targetHeadcount: 760,
      currentHeadcount: 700,
      delta: -60,
      risk: 'Cao',
      riskColor: 'bg-red-100 text-red-800 border-red-300',
    },
    {
      vendor: 'DAAL',
      sopNext: 150,
      targetHeadcount: 720,
      currentHeadcount: 598,
      delta: -122,
      risk: 'Cao',
      riskColor: 'bg-red-100 text-red-800 border-red-300',
    },
  ];

  return (
    <div className="space-y-3.5 pb-10 text-slate-900 select-none">
      {/* ========================================================= */}
      {/* 1. TOP NAVY HEADER BAR WITH 7 VENDOR BUTTONS & DATE BADGE */}
      {/* ========================================================= */}
      <header className="bg-[#0b1e33] text-white px-4 py-3 rounded shadow-md flex flex-col xl:flex-row xl:items-center justify-between gap-3 border border-slate-700/60">
        <div className="flex items-center gap-3">
          <h1 className="text-sm md:text-base lg:text-lg font-black tracking-wide uppercase text-white flex items-center gap-2">
            <span>QUẢN LÝ NHÂN LỰC THEO TUẦN – CÁC NHÀ MÁY VENDOR (7 VENDOR)</span>
          </h1>
        </div>

        {/* Center-Right: 7 Vendor Filter Chips & Date Picker */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Quick ALL Reset */}
          {selectedVendor !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedVendor('ALL')}
              className="px-2 py-1 rounded text-xs font-semibold bg-blue-700 hover:bg-blue-600 text-white cursor-pointer transition-colors shadow-2xs"
            >
              Tất cả
            </button>
          )}

          {VENDOR_LIST.map((vendor) => {
            const isSelected = selectedVendor === vendor;
            return (
              <button
                key={vendor}
                type="button"
                onClick={() => {
                  setSelectedVendor(isSelected ? 'ALL' : vendor);
                  setDetailVendor(vendor);
                }}
                className={`px-2.5 py-1 rounded text-xs font-bold tracking-wide transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 border-blue-400 text-white shadow-xs'
                    : 'bg-[#132c4a] hover:bg-[#1a385c] text-slate-200 border-[#22446d]'
                }`}
              >
                {vendor}
              </button>
            );
          })}

          {/* Far Right: Current Week Badge */}
          <div className="flex items-center gap-2 bg-[#102742] border border-[#23456c] px-3 py-1 rounded ml-1 cursor-pointer hover:bg-[#163355] transition-colors">
            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <div className="text-right leading-tight">
              <div className="text-[10px] text-slate-300 font-medium">Tuần hiện tại</div>
              <div className="text-xs font-bold text-white">20/04/2025 - 26/04/2025</div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. QUY TRÌNH CẬP NHẬT DỮ LIỆU HÀNG TUẦN (6 STEPS HORIZONTAL) */}
      {/* ========================================================= */}
      <section className="bg-white rounded border border-slate-200 p-3 shadow-2xs">
        <h2 className="text-xs font-bold text-slate-800 mb-2">Quy trình cập nhật dữ liệu hàng tuần</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 relative">
          {/* STEP 1: Admin thiết lập chu kỳ */}
          <div
            onClick={() => onNavigateTab('workforce-settings')}
            className="p-2.5 rounded border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 transition-colors cursor-pointer relative group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                  1
                </span>
                <span className="text-xs font-bold text-blue-950 flex-1 leading-tight">
                  Admin thiết lập chu kỳ
                </span>
                <Settings className="w-4 h-4 text-blue-600 shrink-0" />
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1 pl-1">
                <li className="flex items-start gap-1">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Thiết lập thời gian nhập liệu</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Cấu hình nhắc nhở</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Phân quyền theo vendor</span>
                </li>
              </ul>
            </div>
            <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-400">
              →
            </div>
          </div>

          {/* STEP 2: Vendor nhập dữ liệu */}
          <div
            onClick={() => onNavigateTab('workforce-input')}
            className="p-2.5 rounded border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 transition-colors cursor-pointer relative group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                  2
                </span>
                <span className="text-xs font-bold text-emerald-950 flex-1 leading-tight">
                  Vendor nhập dữ liệu
                </span>
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1 pl-1">
                <li className="flex items-start gap-1">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Nhập số lượng nhân sự theo từng nghiệp vụ</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Nhập SOP tuần</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Xác nhận và gửi dữ liệu</span>
                </li>
              </ul>
            </div>
            <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-400">
              →
            </div>
          </div>

          {/* STEP 3: Hệ thống kiểm tra */}
          <div className="p-2.5 rounded border border-amber-200 bg-amber-50/70 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                  3
                </span>
                <span className="text-xs font-bold text-amber-950 flex-1 leading-tight">
                  Hệ thống kiểm tra
                </span>
                <ClipboardCheck className="w-4 h-4 text-amber-600 shrink-0" />
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1 pl-1">
                <li className="flex items-start gap-1">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Kiểm tra dữ liệu hợp lệ</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Nhắc nhở nếu chưa cập nhật</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Cảnh báo số liệu bất thường</span>
                </li>
              </ul>
            </div>
            <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-400">
              →
            </div>
          </div>

          {/* STEP 4: Phân tích & dự báo */}
          <div
            onClick={() => setIsRiskModalOpen(true)}
            className="p-2.5 rounded border border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 transition-colors cursor-pointer relative group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                  4
                </span>
                <span className="text-xs font-bold text-purple-950 flex-1 leading-tight">
                  Phân tích & dự báo
                </span>
                <BarChart3 className="w-4 h-4 text-purple-600 shrink-0" />
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1 pl-1">
                <li className="flex items-start gap-1">
                  <span className="text-purple-500 font-bold">•</span>
                  <span>So sánh nhân sự và SOP</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-purple-500 font-bold">•</span>
                  <span>Tính toán rủi ro thiếu nhân lực</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-purple-500 font-bold">•</span>
                  <span>Đề xuất giải pháp</span>
                </li>
              </ul>
            </div>
            <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-400">
              →
            </div>
          </div>

          {/* STEP 5: Báo cáo & giám sát */}
          <div
            onClick={() => onNavigateTab('workforce-reports')}
            className="p-2.5 rounded border border-teal-200 bg-teal-50/70 hover:bg-teal-100/70 transition-colors cursor-pointer relative group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                  5
                </span>
                <span className="text-xs font-bold text-teal-950 flex-1 leading-tight">
                  Báo cáo & giám sát
                </span>
                <Monitor className="w-4 h-4 text-teal-600 shrink-0" />
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1 pl-1">
                <li className="flex items-start gap-1">
                  <span className="text-teal-500 font-bold">•</span>
                  <span>Biểu đồ theo nhà máy</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-teal-500 font-bold">•</span>
                  <span>So sánh giữa các vendor</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-teal-500 font-bold">•</span>
                  <span>Cảnh báo sụt giảm nhân sự</span>
                </li>
              </ul>
            </div>
            <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-400">
              →
            </div>
          </div>

          {/* STEP 6: Phát triển giai đoạn 2 */}
          <div
            onClick={() => setIsPhase2ModalOpen(true)}
            className="p-2.5 rounded border border-rose-200 bg-rose-50/70 hover:bg-rose-100/70 transition-colors cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                  6
                </span>
                <span className="text-xs font-bold text-rose-950 flex-1 leading-tight">
                  Phát triển giai đoạn 2
                </span>
                <Users className="w-4 h-4 text-rose-600 shrink-0" />
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1 pl-1">
                <li className="flex items-start gap-1">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Quản lý thâm niên</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Quản lý tay nghề</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>Phân tích năng lực</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. ROW OF 6 KPI CARDS (MATCHING SCREENSHOT LAYOUT)        */}
      {/* ========================================================= */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* KPI 1: Tổng nhân sự */}
        <div className="bg-white rounded border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-700">Tổng nhân sự (7 vendor)</div>
          <div className="flex items-center gap-3 my-1.5">
            <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">
                {kpiData.totalHeadcount.toLocaleString('vi-VN')}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
                <span>↑ {kpiData.headcountDelta.replace('+', '')}</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium border-t border-slate-100 pt-1">
            So với tuần trước
          </div>
        </div>

        {/* KPI 2: Nhân sự chính thức */}
        <div className="bg-white rounded border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-700">Nhân sự chính thức</div>
          <div className="flex items-center gap-3 my-1.5">
            <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">
                {kpiData.official.toLocaleString('vi-VN')}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
                <span>↑ {kpiData.officialDelta.replace('+', '')}</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium border-t border-slate-100 pt-1">
            {kpiData.officialPct}
          </div>
        </div>

        {/* KPI 3: Nhân sự thời vụ */}
        <div className="bg-white rounded border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-700">Nhân sự thời vụ</div>
          <div className="flex items-center gap-3 my-1.5">
            <div className="w-10 h-10 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">
                {kpiData.seasonal.toLocaleString('vi-VN')}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
                <span>↑ {kpiData.seasonalDelta.replace('+', '')}</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium border-t border-slate-100 pt-1">
            {kpiData.seasonalPct}
          </div>
        </div>

        {/* KPI 4: Tổng SOP (kế hoạch SX) */}
        <div className="bg-white rounded border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-700">Tổng SOP (kế hoạch SX)</div>
          <div className="flex items-center gap-3 my-1.5">
            <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 leading-none">
                {kpiData.totalSOP}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
                <span>↑ {kpiData.sopDelta.replace('+', '')}</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium border-t border-slate-100 pt-1">
            SP/tuần
          </div>
        </div>

        {/* KPI 5: Tỷ lệ nhân sự / SOP */}
        <div className="bg-white rounded border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-700">Tỷ lệ nhân sự / SOP</div>
          <div className="flex items-center gap-3 my-1.5">
            <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-none">{kpiData.ratio}</div>
              <div className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-bold mt-1 inline-flex items-center gap-1">
                <span>✔</span> Ổn định
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium border-t border-slate-100 pt-1">
            Người / 1.000 SP
          </div>
        </div>

        {/* KPI 6: Nguy cơ thiếu nhân sự */}
        <div className="bg-white rounded border border-slate-200 p-3 shadow-2xs flex flex-col justify-between relative">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-700">Nguy cơ thiếu nhân sự</div>
            <button
              type="button"
              onClick={() => setIsRiskModalOpen(true)}
              className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Xem chi tiết</span>
              <span>→</span>
            </button>
          </div>
          <div className="flex items-center gap-3 my-1.5">
            <div className="w-10 h-10 rounded bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-red-600 leading-none">
                {kpiData.riskCount}
              </div>
              <div className="text-[10px] bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.2 rounded font-bold mt-1 inline-block">
                {kpiData.riskBadge}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium border-t border-slate-100 pt-1">
            {kpiData.riskSub}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. MID ROW 1: COMPARISON CHART + DONUT CHART + ALERTS     */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Column 1 (5 cols): So sánh nhân sự và SOP theo từng nhà máy */}
        <div className="lg:col-span-6 bg-white rounded border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="bg-[#0c2340] text-white px-3.5 py-2 flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-wide">
              So sánh nhân sự và SOP theo từng nhà máy (tuần 20/04 - 26/04/2025)
            </h3>
            <div className="flex items-center gap-3 text-[11px] text-slate-300">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-500 inline-block rounded-xs"></span>
                <span>Số lượng nhân sự</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block"></span>
                <span>SOP (nghìn SP)</span>
              </span>
            </div>
          </div>

          <div className="p-3 flex-1 flex flex-col justify-between">
            {/* SVG Dual-Axis Chart */}
            <div className="w-full h-56 relative">
              <svg className="w-full h-full" viewBox="0 0 620 220" preserveAspectRatio="none">
                {/* Horizontal grid lines */}
                {[0, 40, 80, 120, 160].map((y, idx) => (
                  <g key={idx}>
                    <line
                      x1="45"
                      y1={20 + y}
                      x2="575"
                      y2={20 + y}
                      stroke="#e2e8f0"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />
                    <text
                      x="38"
                      y={24 + y}
                      textAnchor="end"
                      fontSize="9"
                      fill="#64748b"
                      fontFamily="sans-serif"
                    >
                      {1600 - idx * 400}
                    </text>
                    <text
                      x="585"
                      y={24 + y}
                      textAnchor="start"
                      fontSize="9"
                      fill="#64748b"
                      fontFamily="sans-serif"
                    >
                      {200 - idx * 50}
                    </text>
                  </g>
                ))}

                {/* Y-axis titles */}
                <text
                  x="10"
                  y="110"
                  transform="rotate(-90 10 110)"
                  fontSize="9"
                  fill="#64748b"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  Nhân sự (người)
                </text>
                <text
                  x="615"
                  y="110"
                  transform="rotate(90 615 110)"
                  fontSize="9"
                  fill="#64748b"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  SOP (nghìn SP)
                </text>

                {/* Bars & Line path calculation */}
                {/* X coordinates for 7 items */}
                {/* X range: 50 to 570 => 7 slots, center at 85, 160, 235, 310, 385, 460, 535 */}
                {(() => {
                  const xCenters = [85, 160, 235, 310, 385, 460, 535];
                  const maxHeadcount = 1600;
                  const maxSOP = 200;
                  const chartHeight = 160;
                  const chartBottom = 180;

                  // Line points string
                  const linePoints = comparisonData
                    .map((d, i) => {
                      const cx = xCenters[i];
                      const cy = chartBottom - (d.sop / maxSOP) * chartHeight;
                      return `${cx},${cy}`;
                    })
                    .join(' ');

                  return (
                    <>
                      {/* Bars */}
                      {comparisonData.map((d, i) => {
                        const cx = xCenters[i];
                        const barWidth = 32;
                        const barH = (d.headcount / maxHeadcount) * chartHeight;
                        const barY = chartBottom - barH;
                        const isHovered = hoveredBar === d.vendor;

                        return (
                          <g
                            key={d.vendor}
                            onMouseEnter={() => setHoveredBar(d.vendor)}
                            onMouseLeave={() => setHoveredBar(null)}
                            className="cursor-pointer"
                          >
                            <rect
                              x={cx - barWidth / 2}
                              y={barY}
                              width={barWidth}
                              height={barH}
                              fill={isHovered ? '#1d4ed8' : '#3b82f6'}
                              rx="2"
                              className="transition-colors"
                            />
                            {/* Bar value label */}
                            <text
                              x={cx}
                              y={barY - 4}
                              textAnchor="middle"
                              fontSize="9"
                              fontWeight="bold"
                              fill="#1e293b"
                              fontFamily="sans-serif"
                            >
                              {d.headcount}
                            </text>
                            {/* X-axis label */}
                            <text
                              x={cx}
                              y={chartBottom + 15}
                              textAnchor="middle"
                              fontSize="9"
                              fontWeight={isHovered ? 'bold' : 'normal'}
                              fill={isHovered ? '#1d4ed8' : '#475569'}
                              fontFamily="sans-serif"
                            >
                              {d.vendor}
                            </text>
                          </g>
                        );
                      })}

                      {/* Connecting Line for SOP */}
                      <polyline
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2.5"
                        points={linePoints}
                      />

                      {/* Line nodes & values */}
                      {comparisonData.map((d, i) => {
                        const cx = xCenters[i];
                        const cy = chartBottom - (d.sop / maxSOP) * chartHeight;
                        return (
                          <g key={`node-${d.vendor}`}>
                            <circle
                              cx={cx}
                              cy={cy}
                              r="4.5"
                              fill="#f97316"
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                            <text
                              x={cx}
                              y={cy - 7}
                              textAnchor="middle"
                              fontSize="9"
                              fontWeight="bold"
                              fill="#ea580c"
                              fontFamily="sans-serif"
                            >
                              {d.sop}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>

        {/* Column 2 (3 cols): Cơ cấu nhân sự theo nghiệp vụ (tất cả vendor) */}
        <div className="lg:col-span-3 bg-white rounded border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="bg-[#0c2340] text-white px-3.5 py-2">
            <h3 className="text-xs font-bold tracking-wide">
              Cơ cấu nhân sự theo nghiệp vụ (tất cả vendor)
            </h3>
          </div>

          <div className="p-3 flex-1 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Donut SVG */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                {/* 5 segments: HC: 12.5%, SX: 56.2%, CL: 18.3%, EQM: 10.8%, Other: 2.2% */}
                {/* Circumference = 2 * PI * 54 = 339.29 */}
                {/* Segments:
                    1. HC: 12.5% => 42.4
                    2. SX: 56.2% => 190.7
                    3. CL: 18.3% => 62.1
                    4. EQM: 10.8% => 36.6
                    5. Other: 2.2% => 7.5
                */}
                <circle
                  cx="80"
                  cy="80"
                  r="54"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="24"
                  strokeDasharray="42.4 296.89"
                  strokeDashoffset="0"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="54"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="24"
                  strokeDasharray="190.7 148.59"
                  strokeDashoffset="-42.4"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="54"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="24"
                  strokeDasharray="62.1 277.19"
                  strokeDashoffset="-233.1"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="54"
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="24"
                  strokeDasharray="36.6 302.69"
                  strokeDashoffset="-295.2"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="54"
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="24"
                  strokeDasharray="7.5 331.79"
                  strokeDashoffset="-331.8"
                />
              </svg>

              {/* Center Total Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-black text-slate-900 leading-none">5,428</span>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5">Nhân sự</span>
              </div>
            </div>

            {/* Legend on right */}
            <div className="space-y-1.5 text-xs flex-1 w-full">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shrink-0"></span>
                  <span className="text-[11px]">Hành chính nhân sự</span>
                </span>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="font-semibold text-slate-600">12.5%</span>
                  <span className="font-bold text-slate-900 w-8 text-right">679</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] shrink-0"></span>
                  <span className="text-[11px] font-semibold">Sản xuất</span>
                </span>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="font-semibold text-slate-600">56.2%</span>
                  <span className="font-bold text-slate-900 w-8 text-right">3,052</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0"></span>
                  <span className="text-[11px]">Chất lượng</span>
                </span>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="font-semibold text-slate-600">18.3%</span>
                  <span className="font-bold text-slate-900 w-8 text-right">994</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6] shrink-0"></span>
                  <span className="text-[11px]">Thiết bị (EQM)</span>
                </span>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="font-semibold text-slate-600">10.8%</span>
                  <span className="font-bold text-slate-900 w-8 text-right">586</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899] shrink-0"></span>
                  <span className="text-[11px]">Khác</span>
                </span>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="font-semibold text-slate-600">2.2%</span>
                  <span className="font-bold text-slate-900 w-8 text-right">117</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3 (3 cols): Cảnh báo và rủi ro */}
        <div className="lg:col-span-3 bg-white rounded border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="bg-[#0c2340] text-white px-3.5 py-2 flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-wide">Cảnh báo và rủi ro</h3>
            <button
              type="button"
              onClick={() => setIsRiskModalOpen(true)}
              className="text-[10px] text-blue-300 hover:text-white font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Xem chi tiết</span>
              <span>→</span>
            </button>
          </div>

          <div className="p-2.5 flex-1 space-y-2 overflow-y-auto max-h-64">
            {/* Alert 1: DREAM TECH */}
            <div className="p-2 rounded border border-red-200 bg-red-50/60 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">DREAM TECH</div>
                  <div className="text-[11px] text-slate-600 leading-tight">
                    Tỷ lệ nhân sự/SOP cao (4.75)
                  </div>
                  <div className="text-[11px] font-bold text-red-600 mt-0.5">
                    Nguy cơ thiếu 80 nhân sự
                  </div>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white shrink-0">
                Cao
              </span>
            </div>

            {/* Alert 2: HOJEONG VINA */}
            <div className="p-2 rounded border border-amber-200 bg-amber-50/60 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">HOJEONG VINA</div>
                  <div className="text-[11px] text-slate-600 leading-tight">
                    SOP tăng 20% nhưng nhân sự chỉ tăng 5%
                  </div>
                  <div className="text-[11px] font-bold text-red-600 mt-0.5">
                    Cần bổ sung 65 nhân sự
                  </div>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 shrink-0">
                Trung bình
              </span>
            </div>

            {/* Alert 3: KHV */}
            <div className="p-2 rounded border border-amber-200 bg-amber-50/60 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">KHV</div>
                  <div className="text-[11px] text-slate-600 leading-tight">
                    Tỷ lệ nhân sự thời vụ cao (45%)
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Cần theo dõi biến động</div>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 shrink-0">
                Trung bình
              </span>
            </div>

            {/* Alert 4: DAAL */}
            <div className="p-2 rounded border border-slate-200 bg-slate-50 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">DAAL</div>
                  <div className="text-[11px] text-slate-600 leading-tight">
                    Số lượng nhân sự giảm 8% so với tuần trước
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Cần kiểm tra nguyên nhân</div>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800 shrink-0">
                Thấp
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. MID ROW 2: 3 DETAILED BREAKDOWN TABLES (KHV / DETAIL)  */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Table 1 (4 cols): Chi tiết nhân sự theo nghiệp vụ */}
        <div className="lg:col-span-5 bg-white rounded border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="bg-[#0c2340] text-white px-3.5 py-2 flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-wide">
              Chi tiết nhân sự theo nghiệp vụ (tuần 20/04 - 26/04/2025)
            </h3>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] text-slate-300">Nhà máy:</span>
              <select
                value={detailVendor}
                onChange={(e) => setDetailVendor(e.target.value as VendorName)}
                className="bg-[#102742] text-white text-[11px] font-bold px-2 py-0.5 rounded border border-[#264b75] outline-none cursor-pointer"
              >
                {VENDOR_LIST.map((v) => (
                  <option key={v} value={v} className="bg-slate-900 text-white">
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="py-2 px-3">Nghiệp vụ</th>
                  <th className="py-2 px-2 text-right">Chính thức</th>
                  <th className="py-2 px-2 text-right">Thời vụ</th>
                  <th className="py-2 px-2 text-right">Tổng</th>
                  <th className="py-2 px-2 text-right">Tỷ lệ</th>
                  <th className="py-2 px-3 text-right">So với tuần trước</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr className="hover:bg-slate-50/80">
                  <td className="py-2 px-3 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Hành chính nhân sự</span>
                  </td>
                  <td className="py-2 px-2 text-right font-mono">120</td>
                  <td className="py-2 px-2 text-right font-mono">45</td>
                  <td className="py-2 px-2 text-right font-mono font-bold">165</td>
                  <td className="py-2 px-2 text-right font-mono text-slate-600">20.1%</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-600 font-mono">↑ 2</td>
                </tr>

                <tr className="hover:bg-slate-50/80">
                  <td className="py-2 px-3 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Sản xuất</span>
                  </td>
                  <td className="py-2 px-2 text-right font-mono">480</td>
                  <td className="py-2 px-2 text-right font-mono">220</td>
                  <td className="py-2 px-2 text-right font-mono font-bold">700</td>
                  <td className="py-2 px-2 text-right font-mono text-slate-600">85.4%</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-600 font-mono">↑ 10</td>
                </tr>

                <tr className="hover:bg-slate-50/80">
                  <td className="py-2 px-3 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Chất lượng</span>
                  </td>
                  <td className="py-2 px-2 text-right font-mono">140</td>
                  <td className="py-2 px-2 text-right font-mono">80</td>
                  <td className="py-2 px-2 text-right font-mono font-bold">220</td>
                  <td className="py-2 px-2 text-right font-mono text-slate-600">26.8%</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-600 font-mono">↑ 5</td>
                </tr>

                <tr className="hover:bg-slate-50/80">
                  <td className="py-2 px-3 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    <span>Thiết bị (EQM)</span>
                  </td>
                  <td className="py-2 px-2 text-right font-mono">90</td>
                  <td className="py-2 px-2 text-right font-mono">70</td>
                  <td className="py-2 px-2 text-right font-mono font-bold">160</td>
                  <td className="py-2 px-2 text-right font-mono text-slate-600">19.5%</td>
                  <td className="py-2 px-3 text-right font-bold text-red-600 font-mono">↓ 5</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t border-slate-300 text-slate-900">
                  <td className="py-2 px-3">Tổng cộng</td>
                  <td className="py-2 px-2 text-right font-mono">830</td>
                  <td className="py-2 px-2 text-right font-mono">415</td>
                  <td className="py-2 px-2 text-right font-mono font-black text-blue-900">820</td>
                  <td className="py-2 px-2 text-right font-mono">100%</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-600 font-mono">↑ 12</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Table 2 (3.5 cols): Chi tiết nghiệp vụ - Hành chính nhân sự (KHV) */}
        <div className="lg:col-span-3 bg-white rounded border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="bg-[#0c2340] text-white px-3.5 py-2">
            <h3 className="text-xs font-bold tracking-wide">
              Chi tiết nghiệp vụ - Hành chính nhân sự ({detailVendor})
            </h3>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="py-2 px-3">Nhóm chi tiết</th>
                  <th className="py-2 px-2 text-right">Chính thức</th>
                  <th className="py-2 px-2 text-right">Thời vụ</th>
                  <th className="py-2 px-2 text-right">Tổng</th>
                  <th className="py-2 px-3 text-right">Tỷ lệ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr className="hover:bg-slate-50/80">
                  <td className="py-1.5 px-3">Kế toán</td>
                  <td className="py-1.5 px-2 text-right font-mono">15</td>
                  <td className="py-1.5 px-2 text-right font-mono">5</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold">20</td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-600">12.1%</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-1.5 px-3">Nhân sự</td>
                  <td className="py-1.5 px-2 text-right font-mono">18</td>
                  <td className="py-1.5 px-2 text-right font-mono">6</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold">24</td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-600">14.5%</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-1.5 px-3">Kế hoạch</td>
                  <td className="py-1.5 px-2 text-right font-mono">20</td>
                  <td className="py-1.5 px-2 text-right font-mono">8</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold">28</td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-600">17.0%</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-1.5 px-3">Hành chính</td>
                  <td className="py-1.5 px-2 text-right font-mono">25</td>
                  <td className="py-1.5 px-2 text-right font-mono">10</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold">35</td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-600">21.2%</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-1.5 px-3">Bảo an</td>
                  <td className="py-1.5 px-2 text-right font-mono">18</td>
                  <td className="py-1.5 px-2 text-right font-mono">8</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold">26</td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-600">15.8%</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-1.5 px-3">Người Hàn Quốc</td>
                  <td className="py-1.5 px-2 text-right font-mono">12</td>
                  <td className="py-1.5 px-2 text-right font-mono">4</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold">16</td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-600">9.7%</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-1.5 px-3 text-slate-600 italic">Other (còn lại)</td>
                  <td className="py-1.5 px-2 text-right font-mono">12</td>
                  <td className="py-1.5 px-2 text-right font-mono">4</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold">16</td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-600">9.7%</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t border-slate-300 text-slate-900">
                  <td className="py-1.5 px-3">Tổng cộng</td>
                  <td className="py-1.5 px-2 text-right font-mono">120</td>
                  <td className="py-1.5 px-2 text-right font-mono">45</td>
                  <td className="py-1.5 px-2 text-right font-mono font-black text-blue-900">165</td>
                  <td className="py-1.5 px-3 text-right font-mono">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Table 3 (3.5 cols): Chi tiết nghiệp vụ - Sản xuất (KHV) */}
        <div className="lg:col-span-4 bg-white rounded border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="bg-[#0c2340] text-white px-3.5 py-2">
            <h3 className="text-xs font-bold tracking-wide">
              Chi tiết nghiệp vụ - Sản xuất ({detailVendor})
            </h3>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <th className="py-2 px-3">Nhóm chi tiết</th>
                  <th className="py-2 px-2 text-right">Chính thức</th>
                  <th className="py-2 px-2 text-right">Thời vụ</th>
                  <th className="py-2 px-2 text-right">Tổng</th>
                  <th className="py-2 px-3 text-right">Tỷ lệ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr className="hover:bg-slate-50/80">
                  <td className="py-1.5 px-3 font-medium">Đứng line sản xuất</td>
                  <td className="py-1.5 px-2 text-right font-mono">300</td>
                  <td className="py-1.5 px-2 text-right font-mono">120</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold">420</td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-600">60.0%</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-1.5 px-3">Line Leader / Subleader</td>
                  <td className="py-1.5 px-2 text-right font-mono">50</td>
                  <td className="py-1.5 px-2 text-right font-mono">25</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold">75</td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-600">10.7%</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-1.5 px-3">Support (Transfer, support)</td>
                  <td className="py-1.5 px-2 text-right font-mono">40</td>
                  <td className="py-1.5 px-2 text-right font-mono">20</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold">60</td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-600">8.6%</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-1.5 px-3">Repair & Rework</td>
                  <td className="py-1.5 px-2 text-right font-mono">30</td>
                  <td className="py-1.5 px-2 text-right font-mono">25</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold">55</td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-600">7.9%</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-1.5 px-3">Kho nguyên vật liệu</td>
                  <td className="py-1.5 px-2 text-right font-mono">40</td>
                  <td className="py-1.5 px-2 text-right font-mono">20</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold">60</td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-600">8.6%</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="py-1.5 px-3 text-slate-600 italic">Other (còn lại)</td>
                  <td className="py-1.5 px-2 text-right font-mono">20</td>
                  <td className="py-1.5 px-2 text-right font-mono">10</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold">30</td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-600">4.3%</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t border-slate-300 text-slate-900">
                  <td className="py-1.5 px-3">Tổng cộng</td>
                  <td className="py-1.5 px-2 text-right font-mono">480</td>
                  <td className="py-1.5 px-2 text-right font-mono">220</td>
                  <td className="py-1.5 px-2 text-right font-mono font-black text-blue-900">700</td>
                  <td className="py-1.5 px-3 text-right font-mono">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. BOTTOM ROW: 4 COLUMNS (WEEKLY RATIO + CONTRACTS + SOP  */}
      {/*    BY PLANT + RISK FORECAST TABLE)                        */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5">
        {/* Column 1 (3.5 cols): Tỷ lệ nhân sự / SOP theo tuần (KHV) */}
        <div className="lg:col-span-3 bg-white rounded border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="bg-[#0c2340] text-white px-3 py-2 flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-wide">
              Tỷ lệ nhân sự / SOP theo tuần ({detailVendor})
            </h3>
          </div>

          <div className="p-3 flex-1 flex flex-col justify-between">
            {/* Legend */}
            <div className="flex items-center justify-between text-[10px] text-slate-600 mb-2">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-blue-600 inline-block rounded-xs"></span>
                <span>SOP (nghìn)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-teal-500 inline-block rounded-xs"></span>
                <span>Nhân sự</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                <span>Tỷ lệ (ng/k)</span>
              </span>
            </div>

            {/* SVG Chart */}
            <div className="w-full h-44">
              <svg className="w-full h-full" viewBox="0 0 320 180" preserveAspectRatio="none">
                {/* Horizontal grid lines */}
                {[0, 35, 70, 105, 140].map((y, idx) => (
                  <line
                    key={idx}
                    x1="30"
                    y1={20 + y}
                    x2="295"
                    y2={20 + y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                ))}

                {/* Y-axis left */}
                <text x="25" y="24" fontSize="8" fill="#64748b" textAnchor="end">
                  1200
                </text>
                <text x="25" y="94" fontSize="8" fill="#64748b" textAnchor="end">
                  600
                </text>
                <text x="25" y="160" fontSize="8" fill="#64748b" textAnchor="end">
                  0
                </text>

                {/* Y-axis right */}
                <text x="300" y="24" fontSize="8" fill="#64748b" textAnchor="start">
                  10.0
                </text>
                <text x="300" y="94" fontSize="8" fill="#64748b" textAnchor="start">
                  5.0
                </text>
                <text x="300" y="160" fontSize="8" fill="#64748b" textAnchor="start">
                  0.0
                </text>

                {/* 5 Weeks Bars & Line */}
                {(() => {
                  const xPositions = [55, 110, 165, 220, 275];
                  const chartBottom = 155;
                  const maxH = 135;

                  // Line points
                  const points = khvTrend
                    .map((item, idx) => {
                      const cx = xPositions[idx];
                      const cy = chartBottom - (item.ratio / 10.0) * maxH;
                      return `${cx},${cy}`;
                    })
                    .join(' ');

                  return (
                    <>
                      {/* Bars for SOP & Headcount */}
                      {khvTrend.map((item, idx) => {
                        const cx = xPositions[idx];
                        const sopH = (item.sop / 1000) * maxH * 2.5; // scaled visual
                        const nsH = (item.headcount / 1000) * maxH * 1.2;

                        return (
                          <g key={item.week}>
                            {/* SOP Bar */}
                            <rect
                              x={cx - 15}
                              y={chartBottom - sopH}
                              width="12"
                              height={sopH}
                              fill="#2563eb"
                              rx="1.5"
                            />
                            <text
                              x={cx - 9}
                              y={chartBottom - sopH - 3}
                              textAnchor="middle"
                              fontSize="8"
                              fontWeight="bold"
                              fill="#1e3a8a"
                            >
                              {item.sop}
                            </text>

                            {/* Headcount Bar */}
                            <rect
                              x={cx}
                              y={chartBottom - nsH}
                              width="12"
                              height={nsH}
                              fill="#0d9488"
                              rx="1.5"
                            />
                            <text
                              x={cx + 6}
                              y={chartBottom - nsH - 3}
                              textAnchor="middle"
                              fontSize="8"
                              fontWeight="bold"
                              fill="#0f766e"
                            >
                              {item.headcount}
                            </text>

                            {/* X-axis label */}
                            <text
                              x={cx - 1}
                              y={chartBottom + 13}
                              textAnchor="middle"
                              fontSize="8"
                              fill="#64748b"
                            >
                              {item.week}
                            </text>
                          </g>
                        );
                      })}

                      {/* Red line for Ratio */}
                      <polyline
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        points={points}
                      />

                      {/* Line nodes */}
                      {khvTrend.map((item, idx) => {
                        const cx = xPositions[idx];
                        const cy = chartBottom - (item.ratio / 10.0) * maxH;
                        return (
                          <g key={`ratio-${idx}`}>
                            <circle cx={cx} cy={cy} r="3.5" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
                            <text
                              x={cx}
                              y={cy - 5}
                              textAnchor="middle"
                              fontSize="8"
                              fontWeight="bold"
                              fill="#b91c1c"
                            >
                              {item.ratio.toFixed(2)}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>

        {/* Column 2 (2.5 cols): Số lượng nhân sự theo loại hợp đồng */}
        <div className="lg:col-span-2 bg-white rounded border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="bg-[#0c2340] text-white px-3 py-2">
            <h3 className="text-xs font-bold tracking-wide">
              Số lượng nhân sự theo loại hợp đồng (7 vendor)
            </h3>
          </div>

          <div className="p-3 flex-1 flex flex-col items-center justify-center gap-3">
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                {/* 71.7% Official (blue) vs 28.3% Seasonal (amber) */}
                {/* Circumference = 2 * PI * 42 = 263.89 */}
                {/* Off: 71.7% => 189.2, Sea: 28.3% => 74.7 */}
                <circle
                  cx="60"
                  cy="60"
                  r="42"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="18"
                  strokeDasharray="189.2 74.69"
                  strokeDashoffset="0"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="42"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="18"
                  strokeDasharray="74.7 189.19"
                  strokeDashoffset="-189.2"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-black text-slate-900 leading-none">5,428</span>
                <span className="text-[9px] text-slate-500 font-semibold mt-0.5">Nhân sự</span>
              </div>
            </div>

            <div className="w-full space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                  <span>Chính thức</span>
                </span>
                <div className="font-mono text-[11px]">
                  <span className="font-semibold text-slate-600 mr-1.5">71.7%</span>
                  <span className="font-bold text-slate-900">3,892</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span>Thời vụ</span>
                </span>
                <div className="font-mono text-[11px]">
                  <span className="font-semibold text-slate-600 mr-1.5">28.3%</span>
                  <span className="font-bold text-slate-900">1,536</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3 (2.5 cols): SOP theo nhà máy (tuần 20/04 - 26/04) */}
        <div className="lg:col-span-3 bg-white rounded border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="bg-[#0c2340] text-white px-3 py-2">
            <h3 className="text-xs font-bold tracking-wide">
              SOP theo nhà máy (tuần 20/04 - 26/04)
            </h3>
          </div>

          <div className="p-3 flex-1 flex flex-col justify-around space-y-1.5">
            {[
              { vendor: 'KHV', value: 180 },
              { vendor: 'DREAM TECH', value: 160 },
              { vendor: 'HSTEC', value: 120 },
              { vendor: 'KTECH', value: 200 },
              { vendor: 'HOJEONGB', value: 110 },
              { vendor: 'HOJEONG VINA', value: 140 },
              { vendor: 'DAAL', value: 135 },
            ].map((item) => {
              const maxSOP = 200;
              const pct = (item.value / maxSOP) * 100;
              return (
                <div key={item.vendor} className="flex items-center gap-2 text-xs">
                  <span className="w-24 text-[11px] text-slate-700 font-medium truncate">
                    {item.vendor}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-xs h-3.5 overflow-hidden flex items-center">
                    <div
                      className="bg-blue-600 h-full rounded-xs transition-all flex items-center justify-end pr-1 text-[9px] font-bold text-white"
                      style={{ width: `${pct}%` }}
                    >
                      {item.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 4 (3.5 cols): Dự báo rủi ro thiếu nhân sự (dựa trên SOP) */}
        <div className="lg:col-span-4 bg-white rounded border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="bg-[#0c2340] text-white px-3 py-2 flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-wide">
              Dự báo rủi ro thiếu nhân sự (dựa trên SOP)
            </h3>
            <button
              type="button"
              onClick={() => setIsRiskModalOpen(true)}
              className="text-[10px] text-blue-300 hover:text-white font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Xem chi tiết</span>
              <span>→</span>
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[10px] leading-tight">
                  <th className="py-2 px-2">Nhà máy</th>
                  <th className="py-2 px-1 text-right">
                    SOP tuần tới
                    <br />
                    (nghìn SP)
                  </th>
                  <th className="py-2 px-1 text-right">
                    Nhân sự
                    <br />
                    dự kiến
                  </th>
                  <th className="py-2 px-1 text-right">
                    Nhân sự
                    <br />
                    hiện tại
                  </th>
                  <th className="py-2 px-1 text-right">Chênh lệch</th>
                  <th className="py-2 px-2 text-center">Rủi ro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 text-[11px]">
                {forecastRows.map((r) => (
                  <tr key={r.vendor} className="hover:bg-slate-50/80">
                    <td className="py-1.5 px-2 font-bold text-slate-900">{r.vendor}</td>
                    <td className="py-1.5 px-1 text-right font-mono">{r.sopNext}</td>
                    <td className="py-1.5 px-1 text-right font-mono">{r.targetHeadcount}</td>
                    <td className="py-1.5 px-1 text-right font-mono">{r.currentHeadcount}</td>
                    <td
                      className={`py-1.5 px-1 text-right font-mono font-bold ${
                        r.delta < 0 ? 'text-red-600' : 'text-emerald-600'
                      }`}
                    >
                      {r.delta > 0 ? `+${r.delta}` : r.delta}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold border ${r.riskColor}`}
                      >
                        ▲ {r.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. MODAL: CHI TIẾT CẢNH BÁO & DỰ BÁO RỦI RO               */}
      {/* ========================================================= */}
      {isRiskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full border border-slate-300 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#0c2340] text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold tracking-wide">
                  Chi tiết phân tích & cảnh báo rủi ro nhân lực (Tuần 20/04 - 26/04/2025)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRiskModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="text-[11px] font-bold text-red-900">Mức độ cảnh báo Cao (3)</div>
                  <div className="text-xs text-red-700 mt-1">
                    DREAM TECH, HOJEONG VINA, DAAL có nguy cơ thiếu hụt nghiêm trọng so với SOP kế
                    hoạch tuần tới.
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                  <div className="text-[11px] font-bold text-amber-900">
                    Mức độ cảnh báo Trung bình (1)
                  </div>
                  <div className="text-xs text-amber-700 mt-1">
                    KHV có tỷ lệ lao động thời vụ cao (45%) và thiếu hụt 30 nhân sự cho đợt tăng SOP
                    tuần tới.
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                  <div className="text-[11px] font-bold text-emerald-900">
                    Đảm bảo an toàn nhân lực (3)
                  </div>
                  <div className="text-xs text-emerald-700 mt-1">
                    HSTEC, KTECH, HOJEONGB có nguồn nhân lực dồi dào, tỷ lệ đáp ứng SOP trên 100%.
                  </div>
                </div>
              </div>

              {/* Table of Recommended Actions */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <div className="bg-slate-100 font-bold px-3 py-2 text-slate-800 border-b border-slate-200">
                  Đề xuất giải pháp can thiệp khẩn cấp theo Vendor
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Vendor</th>
                      <th className="py-2 px-3">Hiện trạng rủi ro</th>
                      <th className="py-2 px-3">Giải pháp đề xuất</th>
                      <th className="py-2 px-3">Thời hạn xử lý</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 px-3 font-bold text-red-600">DREAM TECH</td>
                      <td className="py-2 px-3">Thiếu 70-80 nhân sự đứng line</td>
                      <td className="py-2 px-3">
                        Huy động 50 thời vụ từ đối tác cung ứng + chuyển 20 nhân sự từ kho sang hỗ
                        trợ line.
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-700">Trước 22/04/2025</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-red-600">HOJEONG VINA</td>
                      <td className="py-2 px-3">SOP tăng 20%, thiếu 60-65 người</td>
                      <td className="py-2 px-3">
                        Phê duyệt kế hoạch tăng ca 2 giờ/ngày cho line chính + tuyển gấp 30 công
                        nhân.
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-700">Trước 23/04/2025</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-red-600">DAAL</td>
                      <td className="py-2 px-3">Sụt giảm 8% quân số, hụt 122 người</td>
                      <td className="py-2 px-3">
                        Thanh tra nguyên nhân biến động lao động đột biến, bổ sung nhân sự dự phòng
                        từ Vendor liên kết.
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-700">Khẩn cấp (24h)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-amber-600">KHV</td>
                      <td className="py-2 px-3">Thời vụ chiếm 45%, thiếu 30 người</td>
                      <td className="py-2 px-3">
                        Chuyển đổi 20 lao động thời vụ ưu tú sang chính thức để ổn định tay nghề.
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-700">Trước 25/04/2025</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500 italic">
                Dữ liệu được phân tích tự động dựa trên SOP tuần và thuật toán cảnh báo sớm ETMS PRO.
              </span>
              <button
                type="button"
                onClick={() => setIsRiskModalOpen(false)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. MODAL: PHÁT TRIỂN GIAI ĐOẠN 2 (THÂM NIÊN & TAY NGHỀ)   */}
      {/* ========================================================= */}
      {isPhase2ModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full border border-slate-300 overflow-hidden flex flex-col">
            <div className="bg-[#0c2340] text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold tracking-wide">
                  Giai đoạn 2: Quản lý Thâm niên, Tay nghề & Năng lực
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPhase2ModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs text-slate-800">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-950">
                <div className="font-bold text-xs mb-1">
                  Định hướng mở rộng hệ thống ETMS PRO (Phase 2)
                </div>
                <div className="text-[11px] leading-relaxed">
                  Theo kiến trúc hệ thống đã thống nhất, Giai đoạn 1 tập trung vào định lượng số
                  lượng lao động theo 23 vị trí nghiệp vụ và so sánh năng lực đáp ứng SOP tuần của 7
                  Vendor. Giai đoạn 2 sẽ mở rộng chuyên sâu vào chất lượng nguồn nhân lực:
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className="p-3 border border-slate-200 rounded bg-slate-50">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Quản lý thâm niên</span>
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1">
                    <li>• Dưới 3 tháng (học việc)</li>
                    <li>• Từ 3 - 12 tháng</li>
                    <li>• Trên 1 năm (ổn định)</li>
                    <li>• Tỷ lệ biến động turnover</li>
                  </ul>
                </div>

                <div className="p-3 border border-slate-200 rounded bg-slate-50">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Quản lý tay nghề</span>
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1">
                    <li>• Bậc thợ 1 đến 5</li>
                    <li>• Chứng chỉ kỹ thuật máy</li>
                    <li>• Đánh giá định kỳ IQC/OQC</li>
                    <li>• Ma trận kỹ năng (Skill Matrix)</li>
                  </ul>
                </div>

                <div className="p-3 border border-slate-200 rounded bg-slate-50">
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span>Phân tích năng lực</span>
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1">
                    <li>• Hiệu suất lao động (OEE)</li>
                    <li>• Tỷ lệ lỗi theo nhóm thợ</li>
                    <li>• Dự báo năng suất ca</li>
                    <li>• Tối ưu điều phối line</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPhase2ModalOpen(false)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition-colors cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

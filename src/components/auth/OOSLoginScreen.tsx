import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types';
import { INITIAL_USERS } from '../../data/mockData';
import {
  Users,
  Settings,
  Wrench,
  Boxes,
  Truck,
  FolderKanban,
  BarChart3,
  TrendingUp,
  Shield,
  Lightbulb,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  Globe,
  ChevronDown,
  Info,
  Check,
  Factory,
  Sparkles,
} from 'lucide-react';

interface OOSLoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  currentUser?: UserProfile;
}

export const OOSLoginScreen: React.FC<OOSLoginScreenProps> = ({
  onLoginSuccess,
  currentUser,
}) => {
  const [username, setUsername] = useState<string>(currentUser?.name || 'Nguyễn Văn A');
  const [password, setPassword] = useState<string>('••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'vi' | 'en' | 'ko'>('vi');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);
  const [selectedQuickUser, setSelectedQuickUser] = useState<UserProfile>(
    currentUser || INITIAL_USERS[0]
  );
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleQuickSelect = (user: UserProfile) => {
    setSelectedQuickUser(user);
    setUsername(user.name);
    setPassword('••••••••');
    setErrorMessage('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập');
      return;
    }

    // Match with user in mock database or use selectedQuickUser
    const matched =
      INITIAL_USERS.find(
        (u) =>
          u.name.toLowerCase() === username.trim().toLowerCase() ||
          u.id.toLowerCase() === username.trim().toLowerCase()
      ) || selectedQuickUser;

    onLoginSuccess(matched);
  };

  const handleSSOLogin = (provider: 'microsoft' | 'google') => {
    // Authenticate with selected demo user via SSO simulation
    onLoginSuccess(selectedQuickUser);
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col justify-between font-sans antialiased text-slate-800 select-none overflow-x-hidden bg-slate-900"
      style={{
        backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCMv7a2VV67tMWEAIJf8IMNlonmKCALircKkJmZ0bGyA2JxiU5wE7JVdKts9F3X0wV_nrCWDWJSnoTe18sYb3RHgwEygOkRQCQaEC1x0LOHzItwz9GCCFGLSPZnK9X7m7LtWtAl5OMgc-GL1wNFhqY2NF70XYLnUSxwFBawpqZjN2g3chh2AzTSyWCsOhglk_6xgkcI_KKB5KpkJx8ZgagRQ_XDnbV8qka48U_xQSNT')`,
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      {/* Subtle Blue Gradient Overlay Layer */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(3, 30, 74, 0.92) 0%, rgba(3, 30, 74, 0.78) 45%, rgba(2, 23, 62, 0.55) 100%)',
        }}
      />

      {/* TOPBAR: Language selector & Globe icon */}
      <header className="relative z-20 flex justify-end items-center px-6 md:px-12 py-5">
        <div className="flex items-center gap-3">
          {/* Globe Icon */}
          <button
            type="button"
            className="text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Chọn khu vực"
          >
            <Globe className="w-5 h-5" />
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center gap-2 bg-white/95 hover:bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-md shadow-sm transition-all cursor-pointer"
            >
              {selectedLanguage === 'vi' && (
                <>
                  <span className="inline-flex items-center justify-center w-5 h-3.5 bg-red-600 rounded-xs overflow-hidden relative shadow-2xs">
                    <span className="text-yellow-400 font-black text-[10px] leading-none">★</span>
                  </span>
                  <span className="tracking-wide">Tiếng Việt</span>
                </>
              )}
              {selectedLanguage === 'en' && (
                <>
                  <span className="inline-flex items-center justify-center w-5 h-3.5 bg-blue-700 text-white rounded-xs overflow-hidden font-mono text-[9px] font-bold">
                    EN
                  </span>
                  <span className="tracking-wide">English</span>
                </>
              )}
              {selectedLanguage === 'ko' && (
                <>
                  <span className="inline-flex items-center justify-center w-5 h-3.5 bg-white text-blue-700 border border-slate-300 rounded-xs overflow-hidden font-bold text-[9px]">
                    KO
                  </span>
                  <span className="tracking-wide">한국어</span>
                </>
              )}
              <ChevronDown className="w-3 h-3 text-slate-500 ml-0.5" />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-xl border border-slate-200 py-1 text-xs z-30">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLanguage('vi');
                    setIsLangDropdownOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-100 font-medium"
                >
                  <span>Tiếng Việt</span>
                  {selectedLanguage === 'vi' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLanguage('en');
                    setIsLangDropdownOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-100 font-medium"
                >
                  <span>English</span>
                  {selectedLanguage === 'en' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLanguage('ko');
                    setIsLangDropdownOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-100 font-medium"
                >
                  <span>한국어</span>
                  {selectedLanguage === 'ko' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT: Left Showcase & Right Login Form */}
      <main className="relative z-10 flex-1 flex items-center px-6 md:px-12 lg:px-16 py-4">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-[1720px] mx-auto">
          {/* ============================================================ */}
          {/* LEFT: BRAND SHOWCASE & 7 MODULES                             */}
          {/* ============================================================ */}
          <section className="lg:col-span-7 xl:col-span-7 text-white flex flex-col justify-center space-y-7">
            {/* Logo Brand Header */}
            <div className="flex items-center gap-4">
              {/* OOS Circular Blueprint Badge */}
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-cyan-400/80 bg-blue-900/60 p-1 flex items-center justify-center shadow-lg shadow-cyan-500/20 backdrop-blur-xs">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center p-3 relative overflow-hidden">
                  <Factory className="w-8 h-8 text-white drop-shadow" />
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-200 absolute top-2 right-2" />
                </div>
              </div>

              {/* Brand Typography */}
              <div className="flex flex-col">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase leading-none">
                  OUTSOURCING
                  <br />
                  OPERATION <span className="text-cyan-400 font-black">SYSTEM</span>
                </h1>
                <p className="text-xs md:text-sm font-semibold tracking-wider text-cyan-200 mt-1 uppercase">
                  MULTI-FACTORY OPERATIONS MANAGEMENT
                </p>
              </div>
            </div>

            {/* Headline and Core Motto */}
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl md:text-3.5xl font-extrabold leading-snug tracking-tight text-white drop-shadow-md">
                Kết nối nhà máy - Điều phối nguồn lực
                <br />
                Thống nhất vận hành
              </h2>
              <p className="text-sm md:text-base font-normal text-blue-100/90 tracking-wide">
                One Team. Connected Factories. Unified Operations.
              </p>
            </div>

            {/* 7 Functional Module Tiles */}
            <div className="pt-1">
              <div className="grid grid-cols-7 gap-2.5 sm:gap-3 max-w-2xl">
                {/* Module 1: Quản lý nhân lực */}
                <div className="flex flex-col items-center group text-center cursor-default">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#0066FF] shadow-lg shadow-blue-600/30 flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] md:text-xs font-medium text-white/95 leading-tight">
                    Quản lý
                    <br />
                    nhân lực
                  </span>
                </div>

                {/* Module 2: Quản lý thiết bị */}
                <div className="flex flex-col items-center group text-center cursor-default">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#05A357] shadow-lg shadow-emerald-600/30 flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] md:text-xs font-medium text-white/95 leading-tight">
                    Quản lý
                    <br />
                    thiết bị
                  </span>
                </div>

                {/* Module 3: Bảo trì sửa chữa */}
                <div className="flex flex-col items-center group text-center cursor-default">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#E86C00] shadow-lg shadow-amber-600/30 flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105">
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] md:text-xs font-medium text-white/95 leading-tight">
                    Bảo trì
                    <br />
                    sửa chữa
                  </span>
                </div>

                {/* Module 4: MRO vật tư */}
                <div className="flex flex-col items-center group text-center cursor-default">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#8A2BE2] shadow-lg shadow-purple-600/30 flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105">
                    <Boxes className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] md:text-xs font-medium text-white/95 leading-tight">
                    MRO
                    <br />
                    vật tư
                  </span>
                </div>

                {/* Module 5: Điều động thiết bị */}
                <div className="flex flex-col items-center group text-center cursor-default">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#E53935] shadow-lg shadow-red-600/30 flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] md:text-xs font-medium text-white/95 leading-tight">
                    Điều động
                    <br />
                    thiết bị
                  </span>
                </div>

                {/* Module 6: Dự án Model mới */}
                <div className="flex flex-col items-center group text-center cursor-default">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#009688] shadow-lg shadow-teal-600/30 flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105">
                    <FolderKanban className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] md:text-xs font-medium text-white/95 leading-tight">
                    Dự án
                    <br />
                    Model mới
                  </span>
                </div>

                {/* Module 7: Báo cáo tổng hợp */}
                <div className="flex flex-col items-center group text-center cursor-default">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#F59E0B] shadow-lg shadow-yellow-600/30 flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] md:text-xs font-medium text-white/95 leading-tight">
                    Báo cáo
                    <br />
                    tổng hợp
                  </span>
                </div>
              </div>
            </div>

            {/* Core System Pillars */}
            <div className="space-y-4 pt-2 max-w-xl">
              {/* Pillar 1: Tối ưu vận hành */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white tracking-wide">Tối ưu vận hành</h3>
                  <p className="text-xs md:text-sm text-blue-100/80 leading-relaxed font-light">
                    Nâng cao hiệu suất và năng suất trên toàn mạng lưới nhà máy
                  </p>
                </div>
              </div>

              {/* Pillar 2: Quản lý tập trung */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white tracking-wide">Quản lý tập trung</h3>
                  <p className="text-xs md:text-sm text-blue-100/80 leading-relaxed font-light">
                    Dữ liệu chính xác, minh bạch, an toàn cho tất cả nhà máy và đối tác
                  </p>
                </div>
              </div>

              {/* Pillar 3: Hỗ trợ ra quyết định */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white tracking-wide">Hỗ trợ ra quyết định</h3>
                  <p className="text-xs md:text-sm text-blue-100/80 leading-relaxed font-light">
                    Báo cáo trực quan, theo thời gian thực, cảnh báo và phân tích thông minh
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* RIGHT: LOGIN CARD WITH QUICK DEMO SELECTOR                    */}
          {/* ============================================================ */}
          <section className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-7 sm:p-9 text-slate-800 transition-all border border-slate-100">
              {/* Login Header: Logo & Subtext */}
              <div className="text-center flex flex-col items-center mb-5">
                {/* Mini Brand Badge */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full border border-dashed border-blue-500 bg-blue-50 p-1 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center relative">
                      <Factory className="w-5 h-5 text-white" />
                      <TrendingUp className="w-2.5 h-2.5 text-cyan-300 absolute top-1 right-1" />
                    </div>
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase leading-tight">
                      OUTSOURCING
                      <br />
                      OPERATION <span className="text-blue-600">SYSTEM</span>
                    </h4>
                    <p className="text-[9px] font-semibold tracking-wider text-slate-500 uppercase">
                      MULTI-FACTORY OPERATIONS MANAGEMENT
                    </p>
                  </div>
                </div>

                {/* Main Greeting */}
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Chào mừng đến với OOS
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Đăng nhập để truy cập hệ thống Quản lý Outsourcing Operation và vận hành đa nhà máy
                </p>
              </div>

              {/* Quick Demo Role Selector (Convenient testing in AI Studio) */}
              <div className="mb-4 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Chọn nhanh vai trò đăng nhập:</span>
                  </span>
                  <span className="text-[9px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                    {selectedQuickUser.role}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {INITIAL_USERS.slice(0, 4).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickSelect(u)}
                      className={`px-1.5 py-1 rounded text-[10px] font-semibold truncate transition-all cursor-pointer ${
                        selectedQuickUser.id === u.id
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                      title={`${u.name} - ${u.title}`}
                    >
                      {u.name.split(' ')[0]} ({u.role.replace('FACTORY_', 'NM ')})
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-3 p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Input: Username */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-800" htmlFor="username">
                    Tên đăng nhập
                  </label>
                  <div className="relative rounded-lg shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nhập tên đăng nhập"
                      required
                      className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg placeholder-slate-400 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Input: Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-800" htmlFor="password">
                    Mật khẩu
                  </label>
                  <div className="relative rounded-lg shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      required
                      className="block w-full pl-10 pr-10 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg placeholder-slate-400 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    {/* Toggle Visibility Button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between text-xs pt-0.5 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-slate-700 font-medium">Ghi nhớ đăng nhập</span>
                  </label>
                  <a
                    href="#forgot-password"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Vui lòng liên hệ quản trị viên IT hoặc Hotline để khôi phục mật khẩu.');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    Quên mật khẩu?
                  </a>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[#0066FF] hover:bg-[#0055D4] active:bg-[#0047B3] text-white font-semibold py-2.5 px-4 rounded-lg shadow-md shadow-blue-500/20 transition-all text-sm cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </button>

                {/* Divider: Or Continue With */}
                <div className="relative flex py-1.5 items-center">
                  <div className="grow border-t border-slate-200" />
                  <span className="shrink-0 mx-3 text-xs text-slate-400 font-medium">
                    Hoặc đăng nhập bằng
                  </span>
                  <div className="grow border-t border-slate-200" />
                </div>

                {/* SSO Options: Microsoft & Google */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Microsoft SSO */}
                  <button
                    type="button"
                    onClick={() => handleSSOLogin('microsoft')}
                    className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-300 hover:border-slate-400 rounded-lg bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
                  >
                    {/* Microsoft 4 Squares Icon */}
                    <div className="grid grid-cols-2 gap-0.5 w-4 h-4 shrink-0">
                      <span className="bg-[#F25022] w-1.5 h-1.5 rounded-[1px]" />
                      <span className="bg-[#7FBA00] w-1.5 h-1.5 rounded-[1px]" />
                      <span className="bg-[#00A4EF] w-1.5 h-1.5 rounded-[1px]" />
                      <span className="bg-[#FFB900] w-1.5 h-1.5 rounded-[1px]" />
                    </div>
                    <span className="truncate">Tài khoản Microsoft</span>
                  </button>

                  {/* Google SSO */}
                  <button
                    type="button"
                    onClick={() => handleSSOLogin('google')}
                    className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-300 hover:border-slate-400 rounded-lg bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer"
                  >
                    {/* Google G Logo SVG */}
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="truncate">Tài khoản Google</span>
                  </button>
                </div>

                {/* IT Support Help Notice Box */}
                <div className="mt-3.5 p-3 bg-blue-50/80 border border-blue-100 rounded-lg flex items-start gap-2.5 text-slate-700">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    Hệ thống dành cho nhân viên và đối tác được cấp quyền.
                    <br />
                    Liên hệ bộ phận IT nếu bạn cần hỗ trợ truy cập.
                  </p>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 bg-black/40 backdrop-blur-md border-t border-white/10 px-6 md:px-12 py-3 text-xs text-slate-300">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 max-w-[1720px] mx-auto">
          {/* Copyright & System Version Info */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">OOS</span>
            <span className="text-slate-400">v2.0.0</span>
            <span className="text-slate-500">|</span>
            <span>Bản quyền © 2025</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Outsourcing Operation System</span>
          </div>

          {/* Footer Policy & Help Links */}
          <nav className="flex items-center gap-3 text-slate-300">
            <a href="#privacy" className="hover:text-white transition-colors">
              Chính sách bảo mật
            </a>
            <span className="text-slate-500">|</span>
            <a href="#terms" className="hover:text-white transition-colors">
              Điều khoản sử dụng
            </a>
            <span className="text-slate-500">|</span>
            <a href="#help" className="hover:text-white transition-colors">
              Hỗ trợ
            </a>
            <span className="text-slate-500">|</span>
            <a href="#contact" className="hover:text-white transition-colors">
              Liên hệ
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

// OOS NEW MODEL — Text Report Modal (Phiếu chữ chuyên dụng cho Zalo / Microsoft Teams)
// Unicode pure text, giữ nguyên định dạng, icon, xuống dòng, hỗ trợ tùy biến chỉ đạo quản lý

import React, { useState, useMemo } from 'react';
import {
  LineIntelligenceMetrics,
  ProjectIntelligenceMetrics,
  generateExecutiveLineReport,
  generateResponsibleActionReport,
  generateProjectSummaryReport,
} from '../../services/progressIntelligenceEngine';
import {
  Copy,
  Check,
  X,
  FileText,
  Send,
  Sparkles,
  Download,
  Building2,
  Clock,
  Layers,
  User,
} from 'lucide-react';

interface NewModelTextReportModalProps {
  lineMetrics: LineIntelligenceMetrics;
  projectMetrics: ProjectIntelligenceMetrics;
  initialTab?: 'line' | 'action' | 'project';
  onClose: () => void;
}

export const NewModelTextReportModal: React.FC<NewModelTextReportModalProps> = ({
  lineMetrics,
  projectMetrics,
  initialTab = 'line',
  onClose,
}) => {
  const [reportType, setReportType] = useState<'line' | 'action' | 'project'>(initialTab);

  // Customization fields
  const [managerNote, setManagerNote] = useState<string>(
    'Ưu tiên xử lý chốt định vị CMM J-07 trong ngày mai để không gián đoạn tiến độ bàn giao Line.'
  );

  const [selectedRole, setSelectedRole] = useState<string>('Purchaser');
  const [deadline, setDeadline] = useState<string>('17:00 chiều nay (10/11)');
  const [actionCustomNote, setActionCustomNote] = useState<string>(
    'Báo cáo giải trình bằng văn bản nếu nhà cung cấp giao trễ quá 24h.'
  );

  const [copied, setCopied] = useState<boolean>(false);

  // Generate real-time text content based on selections
  const textContent = useMemo(() => {
    if (reportType === 'line') {
      return generateExecutiveLineReport(lineMetrics, managerNote);
    } else if (reportType === 'action') {
      return generateResponsibleActionReport(
        lineMetrics,
        selectedRole,
        deadline,
        actionCustomNote
      );
    } else {
      return generateProjectSummaryReport(
        projectMetrics,
        'Dự án CNC ON1 cần tập trung tháo gỡ điểm nghẽn tại Block 1 SEV (Vendor DAAL) để chuẩn bị cho giai đoạn Setup tuần W47.'
      );
    }
  }, [
    reportType,
    lineMetrics,
    projectMetrics,
    managerNote,
    selectedRole,
    deadline,
    actionCustomNote,
  ]);

  // Handle Clipboard Copy
  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textContent);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textContent;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Download .txt file
  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `OOS_REPORT_${lineMetrics.lineName}_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-sans">
      <div className="bg-[#051329] border-2 border-cyan-400 text-white rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.5)] max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-cyan-800/80 bg-[#030C1C] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-900/60 text-cyan-300 border border-cyan-700/60">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide flex items-center gap-2">
                <span>XUẤT BÁO CÁO TEXT THUẦN (ZALO / TEAMS)</span>
              </h3>
              <span className="text-[11px] text-cyan-300 block font-medium">
                Dành cho gửi tin nhắn nhanh, giữ nguyên Unicode, Emoji và ngắt dòng
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Type Switcher Tabs */}
        <div className="px-5 pt-3 border-b border-cyan-900/60 bg-[#061833] flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReportType('line')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              reportType === 'line'
                ? 'bg-[#030C1C] text-cyan-300 border-t-2 border-x-2 border-cyan-400 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>1. Phiếu tổng hợp Line</span>
            <span className="text-[10px] bg-cyan-900/80 px-1.5 py-0.2 rounded font-mono">
              {lineMetrics.lineName}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setReportType('action')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              reportType === 'action'
                ? 'bg-[#030C1C] text-cyan-300 border-t-2 border-x-2 border-cyan-400 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>2. Phiếu giao việc theo bộ phận</span>
          </button>

          <button
            type="button"
            onClick={() => setReportType('project')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              reportType === 'project'
                ? 'bg-[#030C1C] text-cyan-300 border-t-2 border-x-2 border-cyan-400 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Phiếu tổng hợp Project</span>
          </button>
        </div>

        {/* Customization Options Bar */}
        <div className="p-3.5 bg-[#071D3D] border-b border-cyan-900/60 space-y-2.5 text-xs">
          {reportType === 'line' && (
            <div>
              <span className="font-bold text-cyan-200 block mb-1">
                Ghi chú / Chỉ đạo của Quản lý dự án:
              </span>
              <input
                type="text"
                value={managerNote}
                onChange={(e) => setManagerNote(e.target.value)}
                placeholder="Nhập yêu cầu bổ sung của quản lý..."
                className="w-full px-3 py-1.5 bg-[#030C1C] border border-cyan-800 rounded-lg text-white text-xs focus:outline-hidden focus:border-cyan-400"
              />
            </div>
          )}

          {reportType === 'action' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="font-bold text-cyan-200 block mb-1">Bộ phận nhận:</span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#030C1C] border border-cyan-800 rounded-lg text-white font-bold"
                >
                  <option value="Purchaser">Purchaser (Lê Hoàng Nam)</option>
                  <option value="EQM">EQM (Phạm Quang Huy)</option>
                  <option value="Production">Production (Trần Văn Thành)</option>
                  <option value="QC">QC / QA Leader</option>
                </select>
              </div>

              <div>
                <span className="font-bold text-cyan-200 block mb-1">Hạn phản hồi:</span>
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#030C1C] border border-cyan-800 rounded-lg text-white font-bold"
                />
              </div>

              <div>
                <span className="font-bold text-cyan-200 block mb-1">Yêu cầu bổ sung:</span>
                <input
                  type="text"
                  value={actionCustomNote}
                  onChange={(e) => setActionCustomNote(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#030C1C] border border-cyan-800 rounded-lg text-white text-xs"
                />
              </div>
            </div>
          )}

          {reportType === 'project' && (
            <div className="text-[11px] text-slate-300 flex items-center justify-between">
              <span>
                Tổng hợp {projectMetrics.totalLines} Lines | Project EV: <strong>{projectMetrics.projectEV}%</strong> | SPI: <strong>{projectMetrics.projectSPI}</strong>
              </span>
              <span className="text-cyan-300 font-mono">Dữ liệu tính toán từ Work Units</span>
            </div>
          )}
        </div>

        {/* Text Content Display Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-[#030C1C]">
          <div className="relative">
            <pre className="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap select-all bg-[#051630] border border-cyan-900/60 p-4 rounded-xl shadow-inner font-medium">
              {textContent}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-cyan-800/80 bg-[#030C1C] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="px-3.5 py-2 rounded-xl bg-[#092244] hover:bg-[#0E3366] text-cyan-300 border border-cyan-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải file .TXT</span>
          </button>

          <div className="flex items-center gap-3">
            {copied && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-fadeIn">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Đã sao chép vào Clipboard!</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black transition-all shadow-[0_0_20px_rgba(6,182,212,0.6)] flex items-center gap-2 cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>SAO CHÉP PHIẾU TEXT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

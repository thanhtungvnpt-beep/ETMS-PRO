import React, { useState } from 'react';
import {
  MasterAsset,
  UserProfile,
  StockMovement,
  AssetCategory,
  TechnicalCondition,
} from '../../types';
import {
  PackagePlus,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  UploadCloud,
  FileUp,
  Download,
  Info,
  ShieldCheck,
  Plus,
  X,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import { generateQRCodeDataURL } from '../../utils/qrGenerator';

interface InventoryIntakeProps {
  assets: MasterAsset[];
  currentUser: UserProfile;
  onAddAsset: (newAsset: MasterAsset, movementReason: string) => void;
  onBatchAddAssets?: (newAssets: MasterAsset[], movementReason: string) => void;
}

export const InventoryIntake: React.FC<InventoryIntakeProps> = ({
  assets,
  currentUser,
  onAddAsset,
  onBatchAddAssets,
}) => {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  // Single form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('Cơ khí chính xác');
  const [serial, setSerial] = useState('');
  const [bookOwnership, setBookOwnership] = useState<'Nhà máy A' | 'Nhà máy B' | 'Nhà máy C'>('Nhà máy A');
  const [physicalLocation, setPhysicalLocation] = useState('Xưởng Sản xuất chính - Line 1');
  const [technicalCondition, setTechnicalCondition] = useState<TechnicalCondition>('Tốt');
  const [purchaseYear, setPurchaseYear] = useState<number>(new Date().getFullYear());
  const [originalValue, setOriginalValue] = useState<number>(180000000);
  const [intakeNote, setIntakeNote] = useState('Nhập mới nghiệm thu theo hợp đồng mua sắm');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80');

  // Duplicate checks & warnings
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDuplicateOverrideApproved, setIsDuplicateOverrideApproved] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Bulk CSV import states
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<
    Array<{
      code: string;
      name: string;
      serial: string;
      category: AssetCategory;
      factory: 'Nhà máy A' | 'Nhà máy B' | 'Nhà máy C';
      location: string;
      condition: TechnicalCondition;
      value: number;
      isValid: boolean;
      errorMsg?: string;
    }>
  >([]);
  const [bulkError, setBulkError] = useState<string | null>(null);

  // Validate single entry in real-time
  const duplicateCodeAsset = assets.find(
    (a) => a.code.trim().toUpperCase() === code.trim().toUpperCase()
  );
  const duplicateSerialAsset = assets.find(
    (a) => a.serial.trim().toUpperCase() === serial.trim().toUpperCase()
  );

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    if (!code.trim() || !name.trim() || !serial.trim()) {
      setValidationError('Vui lòng điền đầy đủ Mã tài sản, Tên thiết bị và Số serial.');
      return;
    }

    if (duplicateCodeAsset) {
      setValidationError(`Mã tài sản "${code}" đã tồn tại trong hệ thống (tên máy: ${duplicateCodeAsset.name}). Không thể tạo trùng mã.`);
      return;
    }

    if (duplicateSerialAsset && !isDuplicateOverrideApproved) {
      setValidationError(
        `Số serial "${serial}" đã tồn tại trên tài sản ${duplicateSerialAsset.code} (${duplicateSerialAsset.name}). Cần phê duyệt ngoại lệ có lý do chính đáng để tiếp tục.`
      );
      return;
    }

    // Auto-generate internal unique AST-xxx ID
    const maxNumber = assets.reduce((max, a) => {
      const match = a.id.match(/AST-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    const newId = `AST-${(maxNumber + 1).toString().padStart(3, '0')}`;

    const newAsset: MasterAsset = {
      id: newId,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category,
      serial: serial.trim().toUpperCase(),
      bookOwnership,
      physicalFactory: bookOwnership,
      physicalLocation,
      operationalStatus: 'Sẵn sàng điều chuyển',
      technicalCondition,
      transferHistory: [],
      qrInfo: {
        payload: `ETMS|${code.trim().toUpperCase()}|${serial.trim().toUpperCase()}|${bookOwnership}|v1`,
        code: code.trim().toUpperCase(),
        issuedDate: new Date().toISOString().slice(0, 10),
        isCurrent: true,
        version: 1,
      },
      image: imageUrl,
      intakeDate: new Date().toISOString().slice(0, 10),
      purchaseYear,
      originalValue,
      residualValue: originalValue,
      documents: [
        {
          id: `DOC-${Date.now()}`,
          name: `BB_Nghiem_Thu_${code.trim().toUpperCase()}.pdf`,
          date: new Date().toISOString().slice(0, 10),
          size: '1.4 MB',
        },
      ],
    };

    onAddAsset(
      newAsset,
      `Nhập kho tiếp nhận tài sản mới: ${code} - ${name} (Serial: ${serial}) tại ${bookOwnership}`
    );

    setSuccessMessage(`Đã tiếp nhận và đăng ký thành công tài sản ${newAsset.code} (ID: ${newAsset.id}) vào ${bookOwnership}!`);
    // Reset form
    setCode('');
    setName('');
    setSerial('');
    setIsDuplicateOverrideApproved(false);
    setOverrideReason('');
  };

  // Sample CSV generator for bulk
  const handleLoadSampleCsv = () => {
    const sample = `Mã tài sản,Tên thiết bị,Serial,Nhóm thiết bị,Nhà máy sở hữu,Vị trí thực tế,Tình trạng,Nguyên giá
TS015,Máy mài phẳng tự động,SN-GRIND-2025-01,Cơ khí chính xác,Nhà máy A,Xưởng cơ khí Line 2,Tốt,185000000
TS016,Máy bơm thủy lực cao áp,SN-HYDR-8899,Khí nén & Thủy lực,Nhà máy B,Xưởng lắp ráp C2,Tốt,95000000
TS017,Biến tần trung thế 55kW,SN-INV-5501,Điện & Tự động hóa,Nhà máy C,Kho thiết bị dự phòng,Tốt,120000000`;
    setBulkCsvText(sample);
    parseCsv(sample);
  };

  const parseCsv = (text: string) => {
    setBulkError(null);
    const lines = text.trim().split('\n');
    if (lines.length <= 1) {
      setParsedRows([]);
      return;
    }

    const rows = lines.slice(1).map((line, idx) => {
      const parts = line.split(',').map((p) => p.trim());
      const rCode = parts[0] || '';
      const rName = parts[1] || '';
      const rSerial = parts[2] || '';
      const rCategory = (parts[3] as AssetCategory) || 'Cơ khí chính xác';
      const rFactory = (parts[4] as 'Nhà máy A' | 'Nhà máy B' | 'Nhà máy C') || 'Nhà máy A';
      const rLoc = parts[5] || 'Khu vực nhập';
      const rCond = (parts[6] as TechnicalCondition) || 'Tốt';
      const rVal = parseInt(parts[7], 10) || 50000000;

      let isValid = true;
      let errorMsg = '';

      if (!rCode || !rName || !rSerial) {
        isValid = false;
        errorMsg = 'Thiếu thông tin bắt buộc (Mã, Tên hoặc Serial)';
      } else if (assets.some((a) => a.code.toUpperCase() === rCode.toUpperCase())) {
        isValid = false;
        errorMsg = `Mã ${rCode} bị trùng trong hệ thống`;
      } else if (assets.some((a) => a.serial.toUpperCase() === rSerial.toUpperCase())) {
        isValid = false;
        errorMsg = `Serial ${rSerial} đã được sử dụng`;
      }

      return {
        code: rCode,
        name: rName,
        serial: rSerial,
        category: rCategory,
        factory: rFactory,
        location: rLoc,
        condition: rCond,
        value: rVal,
        isValid,
        errorMsg,
      };
    });

    setParsedRows(rows);
  };

  const handleBulkSubmit = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setBulkError('Không có dòng dữ liệu hợp lệ nào để nhập.');
      return;
    }

    let currentMax = assets.reduce((max, a) => {
      const match = a.id.match(/AST-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);

    const newAssets: MasterAsset[] = validRows.map((row) => {
      currentMax += 1;
      const newId = `AST-${currentMax.toString().padStart(3, '0')}`;
      return {
        id: newId,
        code: row.code.toUpperCase(),
        name: row.name,
        category: row.category,
        serial: row.serial.toUpperCase(),
        bookOwnership: row.factory,
        physicalFactory: row.factory,
        physicalLocation: row.location,
        operationalStatus: 'Sẵn sàng điều chuyển',
        technicalCondition: row.condition,
        transferHistory: [],
        qrInfo: {
          payload: `ETMS|${row.code.toUpperCase()}|${row.serial.toUpperCase()}|${row.factory}|v1`,
          code: row.code.toUpperCase(),
          issuedDate: new Date().toISOString().slice(0, 10),
          isCurrent: true,
          version: 1,
        },
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
        intakeDate: new Date().toISOString().slice(0, 10),
        purchaseYear: new Date().getFullYear(),
        originalValue: row.value,
        residualValue: row.value,
      };
    });

    if (onBatchAddAssets) {
      onBatchAddAssets(
        newAssets,
        `Nhập lô CSV gồm ${newAssets.length} tài sản mới bởi ${currentUser.name}`
      );
    } else {
      newAssets.forEach((a) =>
        onAddAsset(a, `Nhập mới tài sản hàng loạt: ${a.code} tại ${a.bookOwnership}`)
      );
    }

    setSuccessMessage(`Đã nhập thành công ${newAssets.length} tài sản vào hệ thống!`);
    setBulkCsvText('');
    setParsedRows([]);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              TRANG 4
            </span>
            <h1 className="text-xl font-black text-navy-950 flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-blue-600" />
              Nhập & Tiếp Nhận Tài Sản
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Đăng ký tài sản mới vào kho tập trung, kiểm tra nghiêm ngặt trùng mã / trùng serial và kích hoạt mã định danh nội bộ
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setMode('single')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              mode === 'single'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Nhập từng thiết bị
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              mode === 'bulk'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Nhập hàng loạt (CSV)
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MODE 1: Nhập từng thiết bị */}
      {mode === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-navy-950 pb-3 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Thông tin tiếp nhận thiết bị mới
            </h2>

            {validationError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Lỗi kiểm tra tính duy nhất:</div>
                  <div>{validationError}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSingleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Asset Code */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mã tài sản quản lý <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: TS015, B-TS008..."
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 border rounded font-mono uppercase font-bold text-xs ${
                      duplicateCodeAsset
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : 'border-slate-300 focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                  {duplicateCodeAsset && (
                    <span className="text-[11px] text-red-600 font-medium block mt-1">
                      Trùng mã với thiết bị đang có: {duplicateCodeAsset.name}
                    </span>
                  )}
                </div>

                {/* Serial */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số serial nhà sản xuất <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: SN-2025-CNC-888"
                    value={serial}
                    onChange={(e) => setSerial(e.target.value)}
                    className={`w-full px-3 py-2 border rounded font-mono text-xs ${
                      duplicateSerialAsset
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-300 focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                  {duplicateSerialAsset && (
                    <span className="text-[11px] text-amber-700 font-medium block mt-1">
                      Cảnh báo: Serial đã tồn tại trên mã {duplicateSerialAsset.code} ({duplicateSerialAsset.name})
                    </span>
                  )}
                </div>
              </div>

              {/* Duplicate Serial Exception Override Panel */}
              {duplicateSerialAsset && (
                <div className="p-3 bg-amber-50/80 border border-amber-300 rounded text-xs space-y-2">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Chính sách phê duyệt ngoại lệ trùng serial
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Theo quy định ETMS PRO, một số serial chỉ được phép trùng khi thiết bị trước đó đã thanh lý hoặc có biên bản xác nhận từ Nhà máy và Phòng Kế toán.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="overrideCheck"
                      checked={isDuplicateOverrideApproved}
                      onChange={(e) => setIsDuplicateOverrideApproved(e.target.checked)}
                      className="rounded border-amber-300 text-blue-600"
                    />
                    <label htmlFor="overrideCheck" className="font-semibold text-slate-800">
                      Tôi xác nhận đã có biên bản ngoại lệ phê duyệt cho số serial này
                    </label>
                  </div>
                  {isDuplicateOverrideApproved && (
                    <input
                      type="text"
                      placeholder="Nhập số biên bản / người duyệt ngoại lệ..."
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-amber-400 rounded bg-white text-xs"
                      required
                    />
                  )}
                </div>
              )}

              {/* Equipment Name & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên thiết bị <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Máy phay đứng CNC 4 trục"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nhóm thiết bị <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AssetCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white font-medium text-slate-800"
                  >
                    <option value="Cơ khí chính xác">Cơ khí chính xác</option>
                    <option value="Khí nén & Thủy lực">Khí nén & Thủy lực</option>
                    <option value="Điện & Tự động hóa">Điện & Tự động hóa</option>
                    <option value="Đo lường & Thử nghiệm">Đo lường & Thử nghiệm</option>
                    <option value="Phụ trợ xưởng">Phụ trợ xưởng</option>
                  </select>
                </div>
              </div>

              {/* Factory & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nhà máy sở hữu theo sổ sách <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={bookOwnership}
                    onChange={(e) =>
                      setBookOwnership(e.target.value as 'Nhà máy A' | 'Nhà máy B' | 'Nhà máy C')
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white font-medium"
                  >
                    <option value="Nhà máy A">Nhà máy A (Hà Nội)</option>
                    <option value="Nhà máy B">Nhà máy B (Bắc Ninh)</option>
                    <option value="Nhà máy C">Nhà máy C (Vĩnh Phúc)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Vị trí đặt máy thực tế <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Xưởng gia công số 2 - Line CNC 03"
                    value={physicalLocation}
                    onChange={(e) => setPhysicalLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              {/* Financial & Technical Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tình trạng kỹ thuật
                  </label>
                  <select
                    value={technicalCondition}
                    onChange={(e) => setTechnicalCondition(e.target.value as TechnicalCondition)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="Tốt">Tốt (Mới 100%)</option>
                    <option value="Đã qua sử dụng">Đã qua sử dụng (Đạt yêu cầu)</option>
                    <option value="Cần hiệu chuẩn">Cần hiệu chuẩn</option>
                    <option value="Cần bảo dưỡng">Cần bảo dưỡng</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Năm sản xuất / Mua sắm
                  </label>
                  <input
                    type="number"
                    value={purchaseYear}
                    onChange={(e) => setPurchaseYear(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nguyên giá (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="5000000"
                    value={originalValue}
                    onChange={(e) => setOriginalValue(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ghi chú chứng từ tiếp nhận
                </label>
                <input
                  type="text"
                  value={intakeNote}
                  onChange={(e) => setIntakeNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCode('');
                    setName('');
                    setSerial('');
                  }}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Xóa trắng form
                </button>
                <button
                  type="submit"
                  disabled={Boolean(duplicateCodeAsset) || (Boolean(duplicateSerialAsset) && !isDuplicateOverrideApproved)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Xác nhận nhập kho & Phát hành ID nội bộ
                </button>
              </div>
            </form>
          </div>

          {/* Right Guidance & Rules Panel */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <h3 className="font-bold text-xs uppercase tracking-wider text-navy-950 mb-2 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                Quy chuẩn ID & QR ETMS PRO
              </h3>
              <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong>1. ID Nội Bộ Bất Biến:</strong> Hệ thống tự động cấp phát mã ID dạng{' '}
                  <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono font-bold">
                    AST-xxx
                  </code>{' '}
                  để giữ toàn vẹn lịch sử dù tài sản chuyển nhà máy và đổi mã code.
                </p>
                <p>
                  <strong>2. Kiểm tra trùng mã:</strong> Nghiêm cấm trùng lặp mã quản lý tài sản trên toàn hệ thống 3 nhà máy.
                </p>
                <p>
                  <strong>3. Tự động sinh mã QR:</strong> Payload QR tiêu chuẩn sẽ được khởi tạo với cấu trúc{' '}
                  <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">
                    ETMS|CODE|SERIAL|FACTORY|v1
                  </code>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <div className="font-bold text-slate-800 mb-1">Người tiếp nhận thực hiện:</div>
              <div className="text-navy-950 font-bold">{currentUser.name}</div>
              <div className="text-slate-500 text-[11px]">{currentUser.title} ({currentUser.factory})</div>
              <div className="text-[11px] text-slate-400 mt-2">
                Hành động sẽ được ghi nhận vào Sổ biến động kho (Stock Movements Ledger) với loại giao dịch <strong>INTAKE</strong>.
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: Nhập hàng loạt qua CSV */
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Nhập danh sách tài sản hàng loạt qua tệp dữ liệu CSV
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dán nội dung CSV hoặc dùng mẫu chuẩn để kiểm tra tính hợp lệ trước khi đẩy vào sổ sách
              </p>
            </div>
            <button
              onClick={handleLoadSampleCsv}
              className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Nạp mẫu dữ liệu chuẩn
            </button>
          </div>

          {bulkError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
              {bulkError}
            </div>
          )}

          {/* Textarea for CSV */}
          <div>
            <textarea
              rows={5}
              value={bulkCsvText}
              onChange={(e) => {
                setBulkCsvText(e.target.value);
                parseCsv(e.target.value);
              }}
              placeholder="Dán nội dung CSV tại đây (cách nhau bởi dấu phẩy)..."
              className="w-full p-3 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Xem trước dữ liệu ({parsedRows.filter((r) => r.isValid).length}/{parsedRows.length} dòng hợp lệ)
                </span>
                <span className="text-xs text-slate-500">
                  Các dòng báo đỏ sẽ bị loại bỏ hoặc cần sửa đổi
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Mã TS</th>
                      <th className="py-2.5 px-3">Tên thiết bị</th>
                      <th className="py-2.5 px-3">Serial</th>
                      <th className="py-2.5 px-3">Nhóm</th>
                      <th className="py-2.5 px-3">Nhà máy</th>
                      <th className="py-2.5 px-3">Vị trí</th>
                      <th className="py-2.5 px-3 text-right">Nguyên giá</th>
                      <th className="py-2.5 px-3 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={row.isValid ? 'bg-white hover:bg-slate-50' : 'bg-red-50/70'}
                      >
                        <td className="py-2 px-3 font-mono font-bold">{row.code}</td>
                        <td className="py-2 px-3 font-medium">{row.name}</td>
                        <td className="py-2 px-3 font-mono">{row.serial}</td>
                        <td className="py-2 px-3 text-slate-600">{row.category}</td>
                        <td className="py-2 px-3 font-semibold">{row.factory}</td>
                        <td className="py-2 px-3 text-slate-600">{row.location}</td>
                        <td className="py-2 px-3 text-right font-mono">
                          {row.value.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2 px-3 text-center">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" />
                              Hợp lệ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded" title={row.errorMsg}>
                              <AlertTriangle className="w-3 h-3" />
                              {row.errorMsg}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setBulkCsvText('');
                    setParsedRows([]);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 font-semibold hover:bg-slate-50 text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleBulkSubmit}
                  disabled={parsedRows.filter((r) => r.isValid).length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <UploadCloud className="w-4 h-4" />
                  Xác nhận nhập {parsedRows.filter((r) => r.isValid).length} tài sản hợp lệ
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  MasterAsset,
  UserProfile,
  TransferOrder,
  StockMovement,
  InventoryDiscrepancy,
} from '../../types';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Building,
  Filter,
  Layers,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  PieChart,
} from 'lucide-react';

interface InventoryReportsProps {
  assets: MasterAsset[];
  orders: TransferOrder[];
  movements: StockMovement[];
  discrepancies: InventoryDiscrepancy[];
  currentUser: UserProfile;
}

export const InventoryReports: React.FC<InventoryReportsProps> = ({
  assets,
  orders,
  movements,
  discrepancies,
  currentUser,
}) => {
  const [reportType, setReportType] = useState<
    'reconciliation' | 'category_value' | 'transfer_frequency' | 'risk_assets'
  >('reconciliation');
  const [selectedPlant, setSelectedPlant] = useState('ALL');

  // Total value calculation
  const totalBookValue = useMemo(() => {
    return assets.reduce((sum, a) => sum + (a.originalValue || 0), 0);
  }, [assets]);

  // Reconciliation report data
  const reconciliationData = useMemo(() => {
    const plants = ['Nhà máy A', 'Nhà máy B', 'Nhà máy C'] as const;
    return plants.map((plant) => {
      const physical = assets.filter((a) => a.physicalFactory === plant);
      const book = assets.filter((a) => a.bookOwnership === plant);
      const matched = assets.filter(
        (a) => a.physicalFactory === plant && a.bookOwnership === plant
      );
      const importedPendingBook = assets.filter(
        (a) => a.physicalFactory === plant && a.bookOwnership !== plant
      );
      const exportedPendingBook = assets.filter(
        (a) => a.bookOwnership === plant && a.physicalFactory !== plant
      );

      return {
        plant,
        physicalCount: physical.length,
        bookCount: book.length,
        matchedCount: matched.length,
        importedPendingBook: importedPendingBook.length,
        exportedPendingBook: exportedPendingBook.length,
        difference: physical.length - book.length,
      };
    });
  }, [assets]);

  // Category distribution
  const categoryData = useMemo(() => {
    const categories = [
      'Cơ khí chính xác',
      'Khí nén & Thủy lực',
      'Điện & Tự động hóa',
      'Đo lường & Thử nghiệm',
      'Phụ trợ xưởng',
    ] as const;

    return categories.map((cat) => {
      const filtered = assets.filter((a) => a.category === cat);
      const value = filtered.reduce((sum, a) => sum + (a.originalValue || 0), 0);
      return {
        category: cat,
        count: filtered.length,
        totalValue: value,
        percentage: Math.round((filtered.length / (assets.length || 1)) * 100),
      };
    });
  }, [assets]);

  // Transfer frequency matrix
  const transferMatrix = useMemo(() => {
    const matrix: Record<string, number> = {
      'A->B': 0,
      'A->C': 0,
      'B->A': 0,
      'B->C': 0,
      'C->A': 0,
      'C->B': 0,
    };

    orders.forEach((o) => {
      const from = o.fromFactory.replace('Nhà máy ', '');
      const to = o.toFactory.replace('Nhà máy ', '');
      const key = `${from}->${to}`;
      if (matrix[key] !== undefined) {
        matrix[key] += 1;
      }
    });

    return matrix;
  }, [orders]);

  // Risk assets: In maintenance, damaged, or pending discrepancies
  const riskAssets = useMemo(() => {
    return assets.filter(
      (a) =>
        ['Đang sửa chữa', 'Bị khóa', 'Chờ kiểm tra', 'Ngừng sử dụng'].includes(
          a.operationalStatus
        ) ||
        ['Cần bảo dưỡng', 'Hư hỏng', 'Cần hiệu chuẩn'].includes(a.technicalCondition) ||
        discrepancies.some((d) => d.assetCode === a.code && d.status !== 'Đã giải quyết')
    );
  }, [assets, discrepancies]);

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[] = [];
    let fileName = `Bao_Cao_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (reportType === 'reconciliation') {
      headers = [
        'Nhà máy',
        'Số máy thực tế tại chỗ',
        'Số máy sở hữu sổ sách',
        'Khớp 100%',
        'Chờ chuyển sổ vào NM (+)',
        'Đã chuyển đi chờ trừ sổ (-)',
        'Chênh lệch thuần',
      ];
      rows = reconciliationData.map((d) => [
        d.plant,
        d.physicalCount,
        d.bookCount,
        d.matchedCount,
        d.importedPendingBook,
        d.exportedPendingBook,
        d.difference,
      ]);
    } else if (reportType === 'category_value') {
      headers = ['Nhóm thiết bị', 'Số lượng tài sản', 'Tỷ trọng (%)', 'Tổng nguyên giá (VNĐ)'];
      rows = categoryData.map((c) => [
        `"${c.category}"`,
        c.count,
        `${c.percentage}%`,
        c.totalValue,
      ]);
    } else {
      headers = ['Mã tài sản', 'Tên thiết bị', 'Serial', 'Nhà máy', 'Trạng thái', 'Tình trạng KT'];
      rows = riskAssets.map((a) => [
        a.code,
        `"${a.name}"`,
        a.serial,
        a.physicalFactory,
        a.operationalStatus,
        a.technicalCondition,
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              TRANG 9
            </span>
            <h1 className="text-xl font-black text-navy-950 flex items-center gap-2">
              <FileBarChart className="w-5 h-5 text-blue-600" />
              Báo Cáo Tồn Kho & Đối Soát Đa Chiều
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp dữ liệu tồn kho theo tiêu chuẩn kế toán công nghiệp và phân tích luân chuyển thiết bị
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 border border-slate-300 rounded text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            In biểu mẫu
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            Xuất dữ liệu báo cáo (CSV)
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setReportType('reconciliation')}
          className={`px-3 py-2 rounded transition-all flex items-center gap-2 ${
            reportType === 'reconciliation'
              ? 'bg-navy-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          1. Đối soát Sổ sách vs Thực tế
        </button>
        <button
          onClick={() => setReportType('category_value')}
          className={`px-3 py-2 rounded transition-all flex items-center gap-2 ${
            reportType === 'category_value'
              ? 'bg-navy-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          2. Giá trị & Nhóm thiết bị
        </button>
        <button
          onClick={() => setReportType('transfer_frequency')}
          className={`px-3 py-2 rounded transition-all flex items-center gap-2 ${
            reportType === 'transfer_frequency'
              ? 'bg-navy-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          3. Tần suất điều động liên NM
        </button>
        <button
          onClick={() => setReportType('risk_assets')}
          className={`px-3 py-2 rounded transition-all flex items-center gap-2 ${
            reportType === 'risk_assets'
              ? 'bg-navy-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          4. Tài sản rủi ro & Bảo dưỡng ({riskAssets.length})
        </button>
      </div>

      {/* REPORT 1: Đối soát Sổ sách vs Thực tế */}
      {reportType === 'reconciliation' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-navy-950">
                Bảng Cân Đối Hiện Diện Thực Tế Và Quyền Sở Hữu Sổ Sách
              </h3>
              <p className="text-xs text-slate-500">
                Căn cứ phê duyệt của Phòng Kế toán tài sản và Ban Giám đốc các nhà máy
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              Ngày chốt số liệu: {new Date().toISOString().slice(0, 10)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nhà máy</th>
                  <th className="py-3 px-3 text-right">Số máy tại chỗ</th>
                  <th className="py-3 px-3 text-right">Sở hữu sổ sách</th>
                  <th className="py-3 px-3 text-right text-emerald-800">Khớp 100%</th>
                  <th className="py-3 px-3 text-right text-blue-800">Chờ chuyển sổ vào (+)</th>
                  <th className="py-3 px-3 text-right text-amber-800">Đã chuyển đi chưa trừ (-)</th>
                  <th className="py-3 px-3 text-right font-bold">Chênh lệch thuần</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reconciliationData.map((d) => (
                  <tr key={d.plant} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-navy-950">{d.plant}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold">{d.physicalCount}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-900">
                      {d.bookCount}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-700 font-bold">
                      {d.matchedCount}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-blue-700 font-semibold">
                      +{d.importedPendingBook}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-amber-700 font-semibold">
                      -{d.exportedPendingBook}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                          d.difference === 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {d.difference > 0 ? `+${d.difference}` : d.difference}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 2: Phân bổ theo Nhóm thiết bị & Giá trị */}
      {reportType === 'category_value' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">Tổng nguyên giá toàn hệ thống</div>
              <div className="text-2xl font-black text-navy-950 mt-1 font-mono">
                {totalBookValue.toLocaleString('vi-VN')} VNĐ
              </div>
            </div>
            <div className="text-xs text-slate-500 text-right">
              <div>Phân loại trên <strong>5 nhóm máy chính</strong></div>
              <div>Cơ sở tính khấu hao năm tài chính 2025</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nhóm thiết bị</th>
                  <th className="py-3 px-3 text-right">Số lượng máy</th>
                  <th className="py-3 px-3 text-right">Tỷ trọng số lượng</th>
                  <th className="py-3 px-3 text-right">Tổng giá trị (VNĐ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {categoryData.map((cat) => (
                  <tr key={cat.category} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{cat.category}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold">{cat.count}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono">{cat.percentage}%</span>
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-navy-950">
                      {cat.totalValue.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: Ma trận tần suất điều chuyển */}
      {reportType === 'transfer_frequency' && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-navy-950">
              Ma Trận Luân Chuyển Thiết Bị Giữa Các Nhà Máy
            </h3>
            <p className="text-xs text-slate-500">
              Tổng hợp số lượt điều động máy móc theo các tuyến hành lang logistics
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(transferMatrix).map(([corridor, count]) => (
              <div
                key={corridor}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-500">Tuyến luân chuyển:</div>
                  <div className="text-base font-black text-blue-700 mt-1 font-mono">
                    Nhà máy {corridor.replace('->', ' → Nhà máy ')}
                  </div>
                </div>
                <div className="text-2xl font-black text-navy-950 font-mono">
                  {count} <span className="text-xs font-normal text-slate-500">lượt</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REPORT 4: Tài sản rủi ro & Bảo dưỡng */}
      {reportType === 'risk_assets' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-red-50/50 border-b border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-bold text-sm text-red-950">
                  Danh Sách Thiết Bị Có Nguy Cơ / Cần Bảo Dưỡng / Đang Có Sai Lệch
                </h3>
                <p className="text-xs text-red-800">
                  Cần theo dõi đặc biệt và không đủ điều kiện điều động sang nhà máy khác
                </p>
              </div>
            </div>
            <span className="text-xs font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded">
              {riskAssets.length} thiết bị cảnh báo
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Mã tài sản</th>
                  <th className="py-3 px-3">Tên thiết bị</th>
                  <th className="py-3 px-3">Serial</th>
                  <th className="py-3 px-3">Vị trí hiện tại</th>
                  <th className="py-3 px-3">Trạng thái vận hành</th>
                  <th className="py-3 px-3">Tình trạng kỹ thuật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {riskAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-navy-950">{asset.code}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{asset.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{asset.serial}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{asset.physicalFactory}</div>
                      <div className="text-[11px] text-slate-500">{asset.physicalLocation}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {asset.operationalStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                        {asset.technicalCondition}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

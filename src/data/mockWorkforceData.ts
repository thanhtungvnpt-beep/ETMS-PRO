import {
  ReportingCycleConfig,
  WeeklyWorkforceSubmission,
  WorkforcePositionCount,
  WorkforceReminderTask,
  WORKFORCE_STRUCTURE,
  VendorName,
  FactoryName,
} from '../types/workforce';

// Helper to generate full 23 position breakdown with realistic numbers
export const createPositionBreakdown = (
  baseAdmin: number,
  baseProd: number,
  baseQC: number,
  baseEQM: number,
  seasonalFactor: number = 0.25
): WorkforcePositionCount[] => {
  const result: WorkforcePositionCount[] = [];

  WORKFORCE_STRUCTURE.forEach((groupObj) => {
    groupObj.positions.forEach((pos, idx) => {
      let official = 0;
      let seasonal = 0;

      if (groupObj.group === 'Hành chính nhân sự') {
        official = Math.max(1, Math.round((baseAdmin / 7) * (1 + (idx % 2) * 0.4)));
        seasonal = pos === 'Other' || pos === 'Bảo an' ? Math.round(official * seasonalFactor) : 0;
      } else if (groupObj.group === 'Sản xuất') {
        if (pos === 'Đứng line sản xuất') {
          official = Math.round(baseProd * 0.55);
          seasonal = Math.round(official * (seasonalFactor * 1.5));
        } else if (pos === 'Line Leader / Subleader') {
          official = Math.max(2, Math.round(baseProd * 0.12));
          seasonal = 0; // Leaders are official
        } else {
          official = Math.max(2, Math.round((baseProd * 0.33) / 4));
          seasonal = Math.round(official * seasonalFactor);
        }
      } else if (groupObj.group === 'Chất lượng') {
        if (pos === 'Ngoại quan IQC' || pos === 'Ngoại quan OQC') {
          official = Math.round(baseQC * 0.25);
          seasonal = Math.round(official * seasonalFactor);
        } else if (pos === 'Line Leader / Subleader') {
          official = Math.max(1, Math.round(baseQC * 0.1));
          seasonal = 0;
        } else {
          official = Math.max(1, Math.round((baseQC * 0.4) / 5));
          seasonal = Math.round(official * (seasonalFactor * 0.5));
        }
      } else if (groupObj.group === 'Thiết bị') {
        if (pos === 'Trực line') {
          official = Math.round(baseEQM * 0.5);
          seasonal = Math.round(official * (seasonalFactor * 0.8));
        } else if (pos === 'Line Leader / Subleader') {
          official = Math.max(1, Math.round(baseEQM * 0.2));
          seasonal = 0;
        } else {
          official = Math.max(1, Math.round((baseEQM * 0.3) / 2));
          seasonal = 0;
        }
      }

      result.push({
        group: groupObj.group,
        position: pos,
        official,
        seasonal,
        total: official + seasonal,
      });
    });
  });

  return result;
};

// Calculate summary from position array
export const calculateSubmissionTotals = (positions: WorkforcePositionCount[]) => {
  let totalOfficial = 0;
  let totalSeasonal = 0;
  let adminHRTotal = 0;
  let productionTotal = 0;
  let qualityTotal = 0;
  let equipmentTotal = 0;

  positions.forEach((p) => {
    totalOfficial += p.official;
    totalSeasonal += p.seasonal;
    if (p.group === 'Hành chính nhân sự') adminHRTotal += p.total;
    if (p.group === 'Sản xuất') productionTotal += p.total;
    if (p.group === 'Chất lượng') qualityTotal += p.total;
    if (p.group === 'Thiết bị') equipmentTotal += p.total;
  });

  const totalHeadcount = totalOfficial + totalSeasonal;
  const seasonalRatio =
    totalHeadcount > 0 ? Math.round((totalSeasonal / totalHeadcount) * 1000) / 10 : 0;

  return {
    totalOfficial,
    totalSeasonal,
    totalHeadcount,
    seasonalRatio,
    adminHRTotal,
    productionTotal,
    qualityTotal,
    equipmentTotal,
  };
};

// 1. Initial Reporting Cycles
// 1. Initial Reporting Cycles (Covering historical W13-W16 and forecast W17-W20)
export const INITIAL_REPORTING_CYCLES: ReportingCycleConfig[] = [
  {
    id: '2025-W16',
    title: 'Tuần 16 (14/04/2025 - 20/04/2025)',
    startDate: '2025-04-14',
    deadlineDate: '2025-04-18',
    reminderStart: 'Trước 24 giờ',
    reminderFrequency: 'Hằng ngày',
    targetAudience: 'Toàn bộ 7 Vendor',
    isActive: true,
    isLocked: false,
  },
  {
    id: '2025-W15',
    title: 'Tuần 15 (07/04/2025 - 13/04/2025)',
    startDate: '2025-04-07',
    deadlineDate: '2025-04-11',
    reminderStart: 'Trước 24 giờ',
    reminderFrequency: 'Hằng ngày',
    targetAudience: 'Toàn bộ 7 Vendor',
    isActive: false,
    isLocked: true,
  },
  {
    id: '2025-W14',
    title: 'Tuần 14 (31/03/2025 - 06/04/2025)',
    startDate: '2025-03-31',
    deadlineDate: '2025-04-04',
    reminderStart: 'Trước 24 giờ',
    reminderFrequency: 'Hằng ngày',
    targetAudience: 'Toàn bộ 7 Vendor',
    isActive: false,
    isLocked: true,
  },
  {
    id: '2025-W13',
    title: 'Tuần 13 (24/03/2025 - 30/03/2025)',
    startDate: '2025-03-24',
    deadlineDate: '2025-03-28',
    reminderStart: 'Trước 24 giờ',
    reminderFrequency: 'Hằng ngày',
    targetAudience: 'Toàn bộ 7 Vendor',
    isActive: false,
    isLocked: true,
  },
  {
    id: '2025-W17',
    title: 'Tuần 17 (21/04/2025 - 27/04/2025) [Dự báo +1]',
    startDate: '2025-04-21',
    deadlineDate: '2025-04-25',
    reminderStart: 'Trước 24 giờ',
    reminderFrequency: 'Hằng ngày',
    targetAudience: 'Toàn bộ 7 Vendor',
    isActive: false,
    isLocked: false,
  },
  {
    id: '2025-W18',
    title: 'Tuần 18 (28/04/2025 - 04/05/2025) [Dự báo +2]',
    startDate: '2025-04-28',
    deadlineDate: '2025-05-02',
    reminderStart: 'Trước 24 giờ',
    reminderFrequency: 'Hằng ngày',
    targetAudience: 'Toàn bộ 7 Vendor',
    isActive: false,
    isLocked: false,
  },
  {
    id: '2025-W19',
    title: 'Tuần 19 (05/05/2025 - 11/05/2025) [Dự báo +3]',
    startDate: '2025-05-05',
    deadlineDate: '2025-05-09',
    reminderStart: 'Trước 24 giờ',
    reminderFrequency: 'Hằng ngày',
    targetAudience: 'Toàn bộ 7 Vendor',
    isActive: false,
    isLocked: false,
  },
  {
    id: '2025-W20',
    title: 'Tuần 20 (12/05/2025 - 18/05/2025) [Dự báo +4]',
    startDate: '2025-05-12',
    deadlineDate: '2025-05-16',
    reminderStart: 'Trước 24 giờ',
    reminderFrequency: 'Hằng ngày',
    targetAudience: 'Toàn bộ 7 Vendor',
    isActive: false,
    isLocked: false,
  },
];

// Helper to construct submission
const buildSub = (
  id: string,
  cycleId: string,
  vendor: VendorName,
  factory: FactoryName,
  status: any,
  baseAdmin: number,
  baseProd: number,
  baseQC: number,
  baseEQM: number,
  seasonalFactor: number,
  sopPlanQty: number,
  unit: string,
  updatedBy: string,
  updatedAt: string,
  note?: string,
  rejectionReason?: string
): WeeklyWorkforceSubmission => {
  const positions = createPositionBreakdown(baseAdmin, baseProd, baseQC, baseEQM, seasonalFactor);
  const totals = calculateSubmissionTotals(positions);

  return {
    id,
    cycleId,
    vendor,
    factory,
    status,
    positions,
    ...totals,
    sop: {
      id: `SOP-${id}`,
      cycleId,
      vendor,
      factory,
      sopPlanQty,
      unit,
      model: `${vendor}-MD${Math.floor(Math.random() * 50) + 10}`,
      note: note || 'Kế hoạch sản xuất tuần theo lịch giao hàng',
      submittedBy: updatedBy,
      updatedAt,
    },
    updatedBy,
    updatedByRole: 'Vendor HR',
    updatedAt,
    confirmedBy: status === 'CONFIRMED' ? 'Đỗ Văn Thành (Leader NM)' : undefined,
    confirmedAt: status === 'CONFIRMED' ? '2025-04-17 16:30' : undefined,
    rejectionReason,
    revisions: [
      {
        timestamp: updatedAt,
        user: updatedBy,
        role: 'Vendor HR',
        action: 'Khởi tạo nộp số liệu tuần',
        reason: 'Nộp theo chu kỳ tuần quy định',
        previousTotal: 0,
        newTotal: totals.totalHeadcount,
      },
    ],
  };
};

// 2. Initial Workforce Submissions for Current Active Cycle (W16) & Historical (W15)
export const INITIAL_WORKFORCE_SUBMISSIONS: WeeklyWorkforceSubmission[] = [
  // --- TUẦN 16 (Hiện tại) ---
  // 1. KHV - Nhà máy A
  buildSub(
    'SUB-2025-W16-KHV-A',
    '2025-W16',
    'KHV',
    'Nhà máy A',
    'CONFIRMED',
    12, 110, 32, 18, 0.22,
    45000, 'PCS',
    'Kim Young Jin', '2025-04-16 09:30',
    'Tăng sản lượng cụm module điện tử'
  ),

  // 2. KHV - Nhà máy B
  buildSub(
    'SUB-2025-W16-KHV-B',
    '2025-W16',
    'KHV',
    'Nhà máy B',
    'SUBMITTED',
    8, 85, 24, 14, 0.28,
    32000, 'PCS',
    'Kim Young Jin', '2025-04-16 11:15'
  ),

  // 3. DREAM TECH - Nhà máy A (Cảnh báo: SOP tăng mạnh 28% nhưng nhân lực giảm 6%)
  buildSub(
    'SUB-2025-W16-DREAM-A',
    '2025-W16',
    'DREAM TECH',
    'Nhà máy A',
    'SUBMITTED',
    15, 135, 45, 22, 0.18,
    68000, 'PCS',
    'Hoàng Thị Mai', '2025-04-17 14:00',
    'Tăng ca phục vụ đơn hàng xuất khẩu gấp'
  ),

  // 4. DREAM TECH - Nhà máy C (Đang nhập bản nháp)
  buildSub(
    'SUB-2025-W16-DREAM-C',
    '2025-W16',
    'DREAM TECH',
    'Nhà máy C',
    'DRAFT',
    7, 60, 18, 10, 0.35,
    18000, 'PCS',
    'Hoàng Thị Mai', '2025-04-17 16:45',
    'Đang hoàn thiện danh sách nhân sự mới tuyển'
  ),

  // 5. HSTEC - Nhà máy B (Cảnh báo: Tỷ lệ thời vụ cao 43.5%)
  buildSub(
    'SUB-2025-W16-HSTEC-B',
    '2025-W16',
    'HSTEC',
    'Nhà máy B',
    'SUBMITTED',
    6, 55, 18, 10, 0.44,
    21000, 'Bộ',
    'Ngô Quang Huy', '2025-04-16 15:20',
    'Sử dụng nhiều lao động thời vụ phụ line lắp ráp'
  ),

  // 6. KTECH - Nhà máy A
  buildSub(
    'SUB-2025-W16-KTECH-A',
    '2025-W16',
    'KTECH',
    'Nhà máy A',
    'CONFIRMED',
    10, 95, 28, 16, 0.20,
    38000, 'PCS',
    'Bùi Quốc Anh', '2025-04-15 10:10'
  ),

  // 7. KTECH - Nhà máy B
  buildSub(
    'SUB-2025-W16-KTECH-B',
    '2025-W16',
    'KTECH',
    'Nhà máy B',
    'SUBMITTED',
    8, 70, 20, 12, 0.22,
    26000, 'PCS',
    'Bùi Quốc Anh', '2025-04-16 08:45'
  ),

  // 8. HOJEONGB - Nhà máy C
  buildSub(
    'SUB-2025-W16-HOJEONGB-C',
    '2025-W16',
    'HOJEONGB',
    'Nhà máy C',
    'CONFIRMED',
    7, 50, 16, 9, 0.15,
    19500, 'PCS',
    'Phan Thị Ánh', '2025-04-15 14:30'
  ),

  // 9. HOJEONG VINA - Nhà máy A (Quá hạn chưa nộp tuần 16)
  buildSub(
    'SUB-2025-W16-HOJEONGVINA-A',
    '2025-W16',
    'HOJEONG VINA',
    'Nhà máy A',
    'OVERDUE',
    0, 0, 0, 0, 0,
    0, 'PCS',
    'Chưa cập nhật', '—',
    'Chưa nộp báo cáo đúng hạn deadline 18/04'
  ),

  // 10. DAAL - Nhà máy B (Yêu cầu cập nhật lại: thiếu nhân sự kiểm định QA/QC)
  buildSub(
    'SUB-2025-W16-DAAL-B',
    '2025-W16',
    'DAAL',
    'Nhà máy B',
    'REJECTED_REVISION',
    8, 65, 12, 10, 0.32,
    24000, 'PCS',
    'Lê Tuấn Hưng', '2025-04-17 10:20',
    'Báo cáo thiếu 4 nhân sự OQC cho line 3',
    'Leader NM B yêu cầu kiểm tra lại nhân sự QC cho ca 2 trước khi phê duyệt'
  ),

  // 11. DAAL - Nhà máy C
  buildSub(
    'SUB-2025-W16-DAAL-C',
    '2025-W16',
    'DAAL',
    'Nhà máy C',
    'SUBMITTED',
    6, 45, 14, 8, 0.24,
    15500, 'PCS',
    'Lê Tuấn Hưng', '2025-04-16 16:50'
  ),

  // --- TUẦN 15 (Lịch sử đối chiếu) ---
  buildSub('SUB-2025-W15-KHV-A', '2025-W15', 'KHV', 'Nhà máy A', 'CONFIRMED', 12, 115, 30, 18, 0.20, 44000, 'PCS', 'Kim Young Jin', '2025-04-09 10:00'),
  buildSub('SUB-2025-W15-KHV-B', '2025-W15', 'KHV', 'Nhà máy B', 'CONFIRMED', 8, 82, 22, 14, 0.25, 31000, 'PCS', 'Kim Young Jin', '2025-04-09 11:30'),
  buildSub('SUB-2025-W15-DREAM-A', '2025-W15', 'DREAM TECH', 'Nhà máy A', 'CONFIRMED', 15, 145, 48, 22, 0.16, 53000, 'PCS', 'Hoàng Thị Mai', '2025-04-10 14:00'),
  buildSub('SUB-2025-W15-DREAM-C', '2025-W15', 'DREAM TECH', 'Nhà máy C', 'CONFIRMED', 7, 58, 16, 10, 0.30, 17500, 'PCS', 'Hoàng Thị Mai', '2025-04-10 15:30'),
  buildSub('SUB-2025-W15-HSTEC-B', '2025-W15', 'HSTEC', 'Nhà máy B', 'CONFIRMED', 6, 52, 16, 10, 0.38, 20500, 'Bộ', 'Ngô Quang Huy', '2025-04-09 16:00'),
  buildSub('SUB-2025-W15-KTECH-A', '2025-W15', 'KTECH', 'Nhà máy A', 'CONFIRMED', 10, 92, 26, 16, 0.21, 37000, 'PCS', 'Bùi Quốc Anh', '2025-04-08 09:30'),
  buildSub('SUB-2025-W15-KTECH-B', '2025-W15', 'KTECH', 'Nhà máy B', 'CONFIRMED', 8, 68, 18, 12, 0.20, 25500, 'PCS', 'Bùi Quốc Anh', '2025-04-08 11:00'),
  buildSub('SUB-2025-W15-HOJEONGB-C', '2025-W15', 'HOJEONGB', 'Nhà máy C', 'CONFIRMED', 7, 48, 15, 9, 0.14, 19000, 'PCS', 'Phan Thị Ánh', '2025-04-08 14:00'),
  buildSub('SUB-2025-W15-HOJEONGVINA-A', '2025-W15', 'HOJEONG VINA', 'Nhà máy A', 'CONFIRMED', 8, 62, 19, 11, 0.23, 23000, 'PCS', 'Trịnh Bá Long', '2025-04-09 15:00'),
  buildSub('SUB-2025-W15-DAAL-B', '2025-W15', 'DAAL', 'Nhà máy B', 'CONFIRMED', 8, 62, 14, 10, 0.28, 22500, 'PCS', 'Lê Tuấn Hưng', '2025-04-10 10:15'),
  buildSub('SUB-2025-W15-DAAL-C', '2025-W15', 'DAAL', 'Nhà máy C', 'CONFIRMED', 6, 44, 14, 8, 0.22, 15000, 'PCS', 'Lê Tuấn Hưng', '2025-04-10 11:30'),

  // --- TUẦN 14 (Lịch sử đối chiếu) ---
  buildSub('SUB-2025-W14-KHV-A', '2025-W14', 'KHV', 'Nhà máy A', 'CONFIRMED', 12, 110, 28, 17, 0.19, 42000, 'PCS', 'Kim Young Jin', '2025-04-02 10:00'),
  buildSub('SUB-2025-W14-KHV-B', '2025-W14', 'KHV', 'Nhà máy B', 'CONFIRMED', 8, 80, 20, 14, 0.24, 30000, 'PCS', 'Kim Young Jin', '2025-04-02 11:30'),
  buildSub('SUB-2025-W14-DREAM-A', '2025-W14', 'DREAM TECH', 'Nhà máy A', 'CONFIRMED', 15, 140, 46, 21, 0.15, 51000, 'PCS', 'Hoàng Thị Mai', '2025-04-03 14:00'),
  buildSub('SUB-2025-W14-DREAM-C', '2025-W14', 'DREAM TECH', 'Nhà máy C', 'CONFIRMED', 7, 55, 15, 10, 0.28, 17000, 'PCS', 'Hoàng Thị Mai', '2025-04-03 15:30'),
  buildSub('SUB-2025-W14-HSTEC-B', '2025-W14', 'HSTEC', 'Nhà máy B', 'CONFIRMED', 6, 50, 15, 9, 0.35, 19800, 'Bộ', 'Ngô Quang Huy', '2025-04-02 16:00'),
  buildSub('SUB-2025-W14-KTECH-A', '2025-W14', 'KTECH', 'Nhà máy A', 'CONFIRMED', 10, 88, 25, 15, 0.20, 35500, 'PCS', 'Bùi Quốc Anh', '2025-04-01 09:30'),
  buildSub('SUB-2025-W14-KTECH-B', '2025-W14', 'KTECH', 'Nhà máy B', 'CONFIRMED', 8, 65, 17, 12, 0.19, 24800, 'PCS', 'Bùi Quốc Anh', '2025-04-01 11:00'),
  buildSub('SUB-2025-W14-HOJEONGB-C', '2025-W14', 'HOJEONGB', 'Nhà máy C', 'CONFIRMED', 7, 46, 14, 9, 0.13, 18500, 'PCS', 'Phan Thị Ánh', '2025-04-01 14:00'),
  buildSub('SUB-2025-W14-HOJEONGVINA-A', '2025-W14', 'HOJEONG VINA', 'Nhà máy A', 'CONFIRMED', 8, 60, 18, 11, 0.22, 22000, 'PCS', 'Trịnh Bá Long', '2025-04-02 15:00'),
  buildSub('SUB-2025-W14-DAAL-B', '2025-W14', 'DAAL', 'Nhà máy B', 'CONFIRMED', 8, 60, 13, 10, 0.26, 21800, 'PCS', 'Lê Tuấn Hưng', '2025-04-03 10:15'),
  buildSub('SUB-2025-W14-DAAL-C', '2025-W14', 'DAAL', 'Nhà máy C', 'CONFIRMED', 6, 42, 13, 8, 0.20, 14500, 'PCS', 'Lê Tuấn Hưng', '2025-04-03 11:30'),

  // --- TUẦN 13 (Lịch sử đối chiếu) ---
  buildSub('SUB-2025-W13-KHV-A', '2025-W13', 'KHV', 'Nhà máy A', 'CONFIRMED', 12, 108, 27, 16, 0.18, 41000, 'PCS', 'Kim Young Jin', '2025-03-26 10:00'),
  buildSub('SUB-2025-W13-KHV-B', '2025-W13', 'KHV', 'Nhà máy B', 'CONFIRMED', 8, 78, 19, 13, 0.23, 29200, 'PCS', 'Kim Young Jin', '2025-03-26 11:30'),
  buildSub('SUB-2025-W13-DREAM-A', '2025-W13', 'DREAM TECH', 'Nhà máy A', 'CONFIRMED', 15, 136, 44, 20, 0.15, 49500, 'PCS', 'Hoàng Thị Mai', '2025-03-27 14:00'),
  buildSub('SUB-2025-W13-DREAM-C', '2025-W13', 'DREAM TECH', 'Nhà máy C', 'CONFIRMED', 7, 52, 14, 10, 0.27, 16500, 'PCS', 'Hoàng Thị Mai', '2025-03-27 15:30'),
  buildSub('SUB-2025-W13-HSTEC-B', '2025-W13', 'HSTEC', 'Nhà máy B', 'CONFIRMED', 6, 48, 14, 9, 0.33, 19000, 'Bộ', 'Ngô Quang Huy', '2025-03-26 16:00'),
  buildSub('SUB-2025-W13-KTECH-A', '2025-W13', 'KTECH', 'Nhà máy A', 'CONFIRMED', 10, 85, 24, 15, 0.19, 34500, 'PCS', 'Bùi Quốc Anh', '2025-03-25 09:30'),
  buildSub('SUB-2025-W13-KTECH-B', '2025-W13', 'KTECH', 'Nhà máy B', 'CONFIRMED', 8, 62, 16, 11, 0.18, 24000, 'PCS', 'Bùi Quốc Anh', '2025-03-25 11:00'),
  buildSub('SUB-2025-W13-HOJEONGB-C', '2025-W13', 'HOJEONGB', 'Nhà máy C', 'CONFIRMED', 7, 44, 13, 8, 0.12, 18000, 'PCS', 'Phan Thị Ánh', '2025-03-25 14:00'),
  buildSub('SUB-2025-W13-HOJEONGVINA-A', '2025-W13', 'HOJEONG VINA', 'Nhà máy A', 'CONFIRMED', 8, 58, 17, 10, 0.21, 21500, 'PCS', 'Trịnh Bá Long', '2025-03-26 15:00'),
  buildSub('SUB-2025-W13-DAAL-B', '2025-W13', 'DAAL', 'Nhà máy B', 'CONFIRMED', 8, 58, 12, 10, 0.25, 21000, 'PCS', 'Lê Tuấn Hưng', '2025-03-27 10:15'),
  buildSub('SUB-2025-W13-DAAL-C', '2025-W13', 'DAAL', 'Nhà máy C', 'CONFIRMED', 6, 40, 12, 8, 0.19, 14000, 'PCS', 'Lê Tuấn Hưng', '2025-03-27 11:30'),
];

// 3. Initial In-App Reminder Tasks
export const INITIAL_WORKFORCE_REMINDERS: WorkforceReminderTask[] = [
  {
    id: 'REM-01',
    cycleId: '2025-W16',
    vendor: 'HOJEONG VINA',
    factory: 'Nhà máy A',
    type: 'OVERDUE',
    title: 'Báo cáo nhân lực quá hạn',
    message: 'Vendor HOJEONG VINA chưa nộp số liệu tuần 16 cho Nhà máy A. Hạn chót đã qua 24 giờ.',
    createdAt: '2025-04-18 17:01',
    resolved: false,
  },
  {
    id: 'REM-02',
    cycleId: '2025-W16',
    vendor: 'DAAL',
    factory: 'Nhà máy B',
    type: 'REVISION_NEEDED',
    title: 'Yêu cầu cập nhật lại số liệu',
    message: 'Leader NM B yêu cầu DAAL bổ sung nhân sự kiểm định OQC cho ca 2.',
    createdAt: '2025-04-17 11:30',
    resolved: false,
  },
  {
    id: 'REM-03',
    cycleId: '2025-W16',
    vendor: 'DREAM TECH',
    factory: 'Nhà máy C',
    type: 'UPCOMING_DEADLINE',
    title: 'Hồ sơ đang ở trạng thái bản nháp',
    message: 'DREAM TECH tại Nhà máy C đang lưu nháp. Nhắc nhở gửi duyệt trước khi đóng kỳ.',
    createdAt: '2025-04-17 17:00',
    resolved: false,
  },
];

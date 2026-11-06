// ETMS PRO — D3 GANTT Chart Visualization for 9-Step Operational Workflow Milestones
// Visualizes the complete 9-step timeline from plan initialization to final sign-off.

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  NewModelProject,
  ProjectStepNumber,
  PROJECT_STEP_DEFINITIONS,
} from '../../types/newModelProject';
import {
  Calendar,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Info,
  ArrowRight,
  GitBranch,
} from 'lucide-react';

interface Props {
  project: NewModelProject;
  onSelectStep?: (stepNumber: ProjectStepNumber) => void;
  className?: string;
}

export interface MilestoneStepData {
  step: ProjectStepNumber;
  title: string;
  role: string;
  shortDesc: string;
  plannedStart: Date;
  plannedEnd: Date;
  plannedDays: number;
  actualProgressPct: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'OVERDUE' | 'UPCOMING';
  isGate: boolean;
  gateLabel?: string;
  color: string;
  metricsText: string;
}

// Helper to parse dates in either DD/MM/YYYY or YYYY-MM-DD format
export const parseFlexibleDate = (dateStr?: string): Date => {
  if (!dateStr || typeof dateStr !== 'string') return new Date();
  const clean = dateStr.trim();
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        return new Date(y, m, d);
      }
    }
  } else if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      }
    }
  }
  const parsed = new Date(clean);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

// Format date to DD/MM
export const formatDateShort = (d: Date): string => {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};

export const formatDateFull = (d: Date): string => {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const NewModelProjectD3Gantt: React.FC<Props> = ({
  project,
  onSelectStep,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1000);
  const [hoveredStep, setHoveredStep] = useState<MilestoneStepData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [showDependencies, setShowDependencies] = useState<boolean>(true);
  const [showTodayLine, setShowTodayLine] = useState<boolean>(true);
  const [timeGranularity, setTimeGranularity] = useState<'AUTO' | 'WEEK' | 'DAY'>('AUTO');

  // 1. Calculate the project baseline start and target dates
  const projectDateRange = useMemo(() => {
    let start = parseFlexibleDate(project.startDate);
    let end = parseFlexibleDate(project.targetDate);

    // Guard if dates are invalid or identical
    if (end.getTime() <= start.getTime()) {
      end = new Date(start.getTime() + 30 * 86400000);
    }
    const totalMs = end.getTime() - start.getTime();
    const totalDays = Math.max(1, Math.round(totalMs / 86400000));

    return { start, end, totalMs, totalDays };
  }, [project.startDate, project.targetDate]);

  // 2. Generate Milestone Step Timeline Data
  const milestoneData: MilestoneStepData[] = useMemo(() => {
    const { start, totalMs, end } = projectDateRange;
    const now = new Date();

    // Normalized milestone window distribution across the 9 steps
    // (Procurement Step 5 and Setup Step 8 allocate realistic heavier durations)
    const stepWindows: Record<
      ProjectStepNumber,
      { startRatio: number; endRatio: number; isGate: boolean; gateLabel?: string }
    > = {
      1: { startRatio: 0.0, endRatio: 0.1, isGate: false },
      2: { startRatio: 0.08, endRatio: 0.22, isGate: false },
      3: { startRatio: 0.2, endRatio: 0.35, isGate: false },
      4: { startRatio: 0.33, endRatio: 0.46, isGate: false },
      5: { startRatio: 0.42, endRatio: 0.68, isGate: false },
      6: { startRatio: 0.65, endRatio: 0.75, isGate: true, gateLabel: 'Cổng Điền Đầy' },
      7: { startRatio: 0.72, endRatio: 0.85, isGate: false },
      8: { startRatio: 0.82, endRatio: 0.95, isGate: false },
      9: { startRatio: 0.93, endRatio: 1.0, isGate: true, gateLabel: 'Nghiệm Thu Hoàn Thành' },
    };

    const steps: ProjectStepNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    return steps.map((sNum) => {
      const def = PROJECT_STEP_DEFINITIONS[sNum];
      const win = stepWindows[sNum];

      const pStart = new Date(start.getTime() + totalMs * win.startRatio);
      const pEnd = new Date(start.getTime() + totalMs * win.endRatio);
      const plannedDays = Math.max(1, Math.round((pEnd.getTime() - pStart.getTime()) / 86400000));

      // Calculate Step Completion % and Status
      let actualProgressPct = 0;
      let status: MilestoneStepData['status'] = 'UPCOMING';

      if (project.status === 'COMPLETED' || sNum < project.currentStep) {
        actualProgressPct = 100;
        status = 'COMPLETED';
      } else if (sNum === project.currentStep) {
        // Detailed completion estimation based on sub-items in that step
        if (sNum === 1) {
          actualProgressPct = 100;
          status = 'COMPLETED';
        } else if (sNum === 2) {
          actualProgressPct = project.equipmentStandards.length > 0 ? 100 : 50;
          status = 'IN_PROGRESS';
        } else if (sNum === 3) {
          actualProgressPct = project.internalReview.length > 0 ? 80 : 40;
          status = 'IN_PROGRESS';
        } else if (sNum === 4) {
          actualProgressPct = project.branchDecisions.length > 0 ? 80 : 50;
          status = 'IN_PROGRESS';
        } else if (sNum === 5) {
          const totalOrders = project.transferOrderLinks.length + project.purchaseOrderLinks.length;
          actualProgressPct = totalOrders > 0 ? 65 : 30;
          status = 'IN_PROGRESS';
        } else if (sNum === 6) {
          actualProgressPct =
            project.resourceFulfillment.gateStatus === 'ĐÃ XÁC NHẬN ĐẦY ĐỦ' ? 100 : 50;
          status = 'IN_PROGRESS';
        } else if (sNum === 7) {
          const totalIns = project.technicalInspections.length;
          const passed = project.technicalInspections.filter((t) => t.result === 'ĐẠT').length;
          actualProgressPct = totalIns > 0 ? Math.round((passed / totalIns) * 100) : 40;
          status = 'IN_PROGRESS';
        } else if (sNum === 8) {
          const totalTasks = project.lineSetupTasks.length;
          const done = project.lineSetupTasks.filter(
            (t) => t.status === 'HOÀN THÀNH' || t.status === 'KHÔNG ÁP DỤNG'
          ).length;
          actualProgressPct = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 30;
          status = 'IN_PROGRESS';
        } else if (sNum === 9) {
          actualProgressPct = project.finalSignOff.decision ? 100 : 50;
          status = 'IN_PROGRESS';
        }

        // Check overdue condition
        if (now.getTime() > pEnd.getTime() && actualProgressPct < 100) {
          status = 'OVERDUE';
        }
      } else {
        actualProgressPct = 0;
        status = 'UPCOMING';
      }

      // Context metrics text
      let metricsText = '';
      if (sNum === 1) metricsText = `${project.lineCount} Line • ${project.targetOutput}`;
      else if (sNum === 2) metricsText = `${project.equipmentStandards.length} chủng loại thiết bị`;
      else if (sNum === 3) metricsText = `Rà soát tại ${project.factory}`;
      else if (sNum === 4) metricsText = `${project.branchDecisions.length} quyết định phân nhánh`;
      else if (sNum === 5)
        metricsText = `${project.transferOrderLinks.length} Lệnh TR • ${project.purchaseOrderLinks.length} PO`;
      else if (sNum === 6)
        metricsText =
          project.resourceFulfillment.gateStatus === 'ĐÃ XÁC NHẬN ĐẦY ĐỦ'
            ? 'Cổng đã xác nhận 100%'
            : 'Đang gom tài nguyên';
      else if (sNum === 7)
        metricsText = `${project.technicalInspections.filter((t) => t.result === 'ĐẠT').length}/${project.technicalInspections.length} kiểm định ĐẠT`;
      else if (sNum === 8)
        metricsText = `${project.lineSetupTasks.filter((t) => t.status === 'HOÀN THÀNH').length}/${project.lineSetupTasks.length} checklist hoàn thành`;
      else if (sNum === 9)
        metricsText = project.finalSignOff.decision || 'Chờ Planner nghiệm thu 8 điều kiện';

      return {
        step: sNum,
        title: def.title,
        role: def.role,
        shortDesc: def.shortDesc,
        plannedStart: pStart,
        plannedEnd: pEnd,
        plannedDays,
        actualProgressPct,
        status,
        isGate: win.isGate,
        gateLabel: win.gateLabel,
        color: def.color,
        metricsText,
      };
    });
  }, [project, projectDateRange]);

  // 3. Monitor container width via ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 4. Render D3 Chart
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Dimensions
    const totalSvgWidth = Math.max(920, containerWidth);
    const leftAxisWidth = 260; // Space for step names and labels on left
    const rightPadding = 40;
    const chartWidth = totalSvgWidth - leftAxisWidth - rightPadding;
    const headerHeight = 56;
    const rowHeight = 44;
    const totalHeight = headerHeight + milestoneData.length * rowHeight + 20;

    svg
      .attr('width', totalSvgWidth)
      .attr('height', totalHeight)
      .attr('viewBox', `0 0 ${totalSvgWidth} ${totalHeight}`)
      .attr('style', 'max-width: 100%; height: auto; font-family: inherit;');

    // Defs for gradients, patterns, and markers
    const defs = svg.append('defs');

    // Arrow marker for dependency links
    defs
      .append('marker')
      .attr('id', 'gantt-arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 8)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M 0 1.5 L 8 5 L 0 8.5 z')
      .attr('fill', '#94a3b8');

    // Diagonal striped pattern for planned baseline background
    const pattern = defs
      .append('pattern')
      .attr('id', 'planned-stripe')
      .attr('width', 8)
      .attr('height', 8)
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('patternTransform', 'rotate(45)');

    pattern
      .append('rect')
      .attr('width', 4)
      .attr('height', 8)
      .attr('fill', 'rgba(148, 163, 184, 0.25)');

    pattern
      .append('rect')
      .attr('x', 4)
      .attr('width', 4)
      .attr('height', 8)
      .attr('fill', 'rgba(241, 245, 249, 0.7)');

    // Linear gradients for step progress bars
    milestoneData.forEach((m) => {
      const grad = defs
        .append('linearGradient')
        .attr('id', `step-gradient-${m.step}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

      if (m.status === 'COMPLETED') {
        grad.append('stop').attr('offset', '0%').attr('stop-color', '#059669');
        grad.append('stop').attr('offset', '100%').attr('stop-color', '#10b981');
      } else if (m.status === 'OVERDUE') {
        grad.append('stop').attr('offset', '0%').attr('stop-color', '#dc2626');
        grad.append('stop').attr('offset', '100%').attr('stop-color', '#f87171');
      } else if (m.status === 'IN_PROGRESS') {
        grad.append('stop').attr('offset', '0%').attr('stop-color', '#1d4ed8');
        grad.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6');
      } else {
        grad.append('stop').attr('offset', '0%').attr('stop-color', '#94a3b8');
        grad.append('stop').attr('offset', '100%').attr('stop-color', '#cbd5e1');
      }
    });

    // 1. Time Scales
    const minDate = d3.timeDay.offset(projectDateRange.start, -2);
    const maxDate = d3.timeDay.offset(projectDateRange.end, 3);

    const timeScale = d3
      .scaleTime()
      .domain([minDate, maxDate])
      .range([leftAxisWidth, leftAxisWidth + chartWidth]);

    // 2. Background Row Bands
    const rowsGroup = svg.append('g').attr('class', 'gantt-rows');

    milestoneData.forEach((m, idx) => {
      const y = headerHeight + idx * rowHeight;
      const isAlt = idx % 2 === 1;

      // Alternating row background
      rowsGroup
        .append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', totalSvgWidth)
        .attr('height', rowHeight)
        .attr('fill', isAlt ? 'rgba(248, 250, 252, 0.7)' : '#ffffff')
        .attr('class', 'hover:fill-blue-50/50 transition-colors');

      // Row separator line
      rowsGroup
        .append('line')
        .attr('x1', 0)
        .attr('x2', totalSvgWidth)
        .attr('y1', y + rowHeight)
        .attr('y2', y + rowHeight)
        .attr('stroke', '#e2e8f0')
        .attr('stroke-width', 1);
    });

    // Vertical dividing line separating Left labels from Timeline
    rowsGroup
      .append('line')
      .attr('x1', leftAxisWidth)
      .attr('x2', leftAxisWidth)
      .attr('y1', 0)
      .attr('y2', totalHeight)
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 1.5);

    // 3. Time Grid & Header (Dual-tier: Month & Week/Day)
    const headerGroup = svg.append('g').attr('class', 'gantt-header');

    // Header background
    headerGroup
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', totalSvgWidth)
      .attr('height', headerHeight)
      .attr('fill', '#0c2340');

    // Left Axis Header Label
    headerGroup
      .append('text')
      .attr('x', 14)
      .attr('y', headerHeight / 2 + 5)
      .attr('fill', '#f8fafc')
      .attr('font-size', '12px')
      .attr('font-weight', '700')
      .attr('letter-spacing', '0.04em')
      .text('9 BƯỚC NGHIỆP VỤ & PHỤ TRÁCH');

    // Top tier: Months
    const months = d3.timeMonth.range(minDate, maxDate);
    // If range is within 1 month, include minDate month
    const allMonths = months.length > 0 ? months : [minDate];

    allMonths.forEach((monthDate) => {
      const xStart = Math.max(leftAxisWidth, timeScale(monthDate));
      const nextMonth = d3.timeMonth.offset(monthDate, 1);
      const xEnd = Math.min(leftAxisWidth + chartWidth, timeScale(nextMonth));

      if (xEnd > xStart) {
        // Month border
        headerGroup
          .append('line')
          .attr('x1', xStart)
          .attr('x2', xStart)
          .attr('y1', 0)
          .attr('y2', 26)
          .attr('stroke', '#1e3a5f')
          .attr('stroke-width', 1);

        // Month text
        headerGroup
          .append('text')
          .attr('x', (xStart + xEnd) / 2)
          .attr('y', 17)
          .attr('fill', '#93c5fd')
          .attr('font-size', '11px')
          .attr('font-weight', '700')
          .attr('text-anchor', 'middle')
          .text(`Tháng ${monthDate.getMonth() + 1} / ${monthDate.getFullYear()}`);
      }
    });

    // Sub-header divider
    headerGroup
      .append('line')
      .attr('x1', leftAxisWidth)
      .attr('x2', totalSvgWidth)
      .attr('y1', 26)
      .attr('y2', 26)
      .attr('stroke', '#1e3a5f')
      .attr('stroke-width', 1);

    // Bottom tier: Weeks
    const weeks = d3.timeMonday.range(minDate, maxDate);
    const gridGroup = svg.append('g').attr('class', 'gantt-grid');

    weeks.forEach((weekDate, wIdx) => {
      const x = timeScale(weekDate);
      if (x >= leftAxisWidth && x <= leftAxisWidth + chartWidth) {
        // Week tick label in header
        headerGroup
          .append('text')
          .attr('x', x + 16)
          .attr('y', 44)
          .attr('fill', '#e2e8f0')
          .attr('font-size', '10px')
          .attr('font-family', 'monospace')
          .attr('font-weight', '600')
          .attr('text-anchor', 'middle')
          .text(`W${d3.timeFormat('%U')(weekDate)} (${formatDateShort(weekDate)})`);

        headerGroup
          .append('line')
          .attr('x1', x)
          .attr('x2', x)
          .attr('y1', 26)
          .attr('y2', headerHeight)
          .attr('stroke', '#1e3a5f')
          .attr('stroke-width', 1);

        // Vertical grid line through the chart
        gridGroup
          .append('line')
          .attr('x1', x)
          .attr('x2', x)
          .attr('y1', headerHeight)
          .attr('y2', totalHeight)
          .attr('stroke', '#e2e8f0')
          .attr('stroke-dasharray', '3 3')
          .attr('stroke-width', 1);
      }
    });

    // 4. Render Left Labels (Step index, Title, Role, Status)
    const labelsGroup = svg.append('g').attr('class', 'gantt-labels');

    milestoneData.forEach((m, idx) => {
      const y = headerHeight + idx * rowHeight;
      const isCurrent = m.step === project.currentStep;

      const rowLabelG = labelsGroup
        .append('g')
        .attr('class', 'cursor-pointer')
        .on('click', () => onSelectStep?.(m.step))
        .on('mouseenter', (event) => {
          setHoveredStep(m);
          setTooltipPos({ x: event.clientX, y: event.clientY });
        })
        .on('mouseleave', () => {
          setHoveredStep(null);
          setTooltipPos(null);
        });

      // Step Number Badge (Circle)
      rowLabelG
        .append('circle')
        .attr('cx', 24)
        .attr('cy', y + rowHeight / 2)
        .attr('r', 11)
        .attr('fill', m.status === 'COMPLETED' ? '#059669' : m.status === 'OVERDUE' ? '#dc2626' : isCurrent ? '#2563eb' : '#64748b')
        .attr('stroke', isCurrent ? '#93c5fd' : '#ffffff')
        .attr('stroke-width', isCurrent ? 2 : 1);

      rowLabelG
        .append('text')
        .attr('x', 24)
        .attr('y', y + rowHeight / 2 + 4)
        .attr('fill', '#ffffff')
        .attr('font-size', '10px')
        .attr('font-weight', '800')
        .attr('text-anchor', 'middle')
        .text(m.step);

      // Step Title
      rowLabelG
        .append('text')
        .attr('x', 44)
        .attr('y', y + rowHeight / 2 - 4)
        .attr('fill', isCurrent ? '#1d4ed8' : '#0f172a')
        .attr('font-size', '11.5px')
        .attr('font-weight', isCurrent ? '800' : '700')
        .text(`Bước ${m.step}: ${m.title}`);

      // Role & Metrics subtitle
      rowLabelG
        .append('text')
        .attr('x', 44)
        .attr('y', y + rowHeight / 2 + 11)
        .attr('fill', '#64748b')
        .attr('font-size', '9.5px')
        .text(`${m.role} • ${m.metricsText}`);

      // Small Status Tag on the right edge of label area
      let statusBg = '#e2e8f0';
      let statusColor = '#475569';
      let statusLabel = 'Chờ';

      if (m.status === 'COMPLETED') {
        statusBg = '#d1fae5';
        statusColor = '#065f46';
        statusLabel = 'Đạt';
      } else if (m.status === 'OVERDUE') {
        statusBg = '#fee2e2';
        statusColor = '#991b1b';
        statusLabel = 'Trễ';
      } else if (m.status === 'IN_PROGRESS') {
        statusBg = '#dbeafe';
        statusColor = '#1e40af';
        statusLabel = 'Đang làm';
      }

      rowLabelG
        .append('rect')
        .attr('x', leftAxisWidth - 56)
        .attr('y', y + rowHeight / 2 - 9)
        .attr('width', 46)
        .attr('height', 18)
        .attr('rx', 4)
        .attr('fill', statusBg);

      rowLabelG
        .append('text')
        .attr('x', leftAxisWidth - 33)
        .attr('y', y + rowHeight / 2 + 3)
        .attr('fill', statusColor)
        .attr('font-size', '9.5px')
        .attr('font-weight', '700')
        .attr('text-anchor', 'middle')
        .text(statusLabel);
    });

    // 5. Dependency Lines (Curved Bezier connectors between step finishes and step starts)
    if (showDependencies) {
      const depGroup = svg.append('g').attr('class', 'gantt-dependencies');

      milestoneData.forEach((m, idx) => {
        if (idx < milestoneData.length - 1) {
          const next = milestoneData[idx + 1];
          const x1 = timeScale(m.plannedEnd);
          const y1 = headerHeight + idx * rowHeight + rowHeight / 2;
          const x2 = timeScale(next.plannedStart);
          const y2 = headerHeight + (idx + 1) * rowHeight + rowHeight / 2;

          const dx = Math.max(12, Math.abs(x2 - x1) / 2);
          const path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

          depGroup
            .append('path')
            .attr('d', path)
            .attr('fill', 'none')
            .attr('stroke', m.status === 'COMPLETED' ? '#10b981' : '#94a3b8')
            .attr('stroke-width', 1.25)
            .attr('stroke-dasharray', m.status === 'COMPLETED' ? 'none' : '3 2')
            .attr('opacity', 0.75)
            .attr('marker-end', 'url(#gantt-arrow)');
        }
      });
    }

    // 6. Milestone Bars (Planned Baseline & Actual Progress)
    const barsGroup = svg.append('g').attr('class', 'gantt-bars');

    milestoneData.forEach((m, idx) => {
      const y = headerHeight + idx * rowHeight;
      const barHeight = 22;
      const barY = y + (rowHeight - barHeight) / 2;

      const xStart = timeScale(m.plannedStart);
      const xEnd = timeScale(m.plannedEnd);
      const plannedWidth = Math.max(10, xEnd - xStart);

      const actualWidth = (plannedWidth * Math.min(100, Math.max(0, m.actualProgressPct))) / 100;

      const barG = barsGroup
        .append('g')
        .attr('class', 'gantt-bar-item cursor-pointer')
        .on('click', () => onSelectStep?.(m.step))
        .on('mouseenter', (event) => {
          setHoveredStep(m);
          setTooltipPos({ x: event.clientX, y: event.clientY });
        })
        .on('mousemove', (event) => {
          setTooltipPos({ x: event.clientX, y: event.clientY });
        })
        .on('mouseleave', () => {
          setHoveredStep(null);
          setTooltipPos(null);
        });

      // A. Planned baseline background bar (striped pattern with border)
      barG
        .append('rect')
        .attr('x', xStart)
        .attr('y', barY)
        .attr('width', plannedWidth)
        .attr('height', barHeight)
        .attr('rx', 4)
        .attr('fill', 'url(#planned-stripe)')
        .attr('stroke', '#cbd5e1')
        .attr('stroke-width', 1);

      // B. Actual progress filled bar
      if (actualWidth > 0) {
        barG
          .append('rect')
          .attr('x', xStart)
          .attr('y', barY)
          .attr('width', actualWidth)
          .attr('height', barHeight)
          .attr('rx', 4)
          .attr('fill', `url(#step-gradient-${m.step})`)
          .attr('filter', m.status === 'OVERDUE' ? 'drop-shadow(0 0 3px rgba(239, 68, 68, 0.4))' : 'none');
      }

      // C. Text inside/adjacent to bar
      if (plannedWidth > 55) {
        barG
          .append('text')
          .attr('x', xStart + 8)
          .attr('y', barY + 14)
          .attr('fill', actualWidth > 40 ? '#ffffff' : '#334155')
          .attr('font-size', '10px')
          .attr('font-family', 'monospace')
          .attr('font-weight', '700')
          .text(`${m.actualProgressPct}% (${m.plannedDays}d)`);
      } else {
        // Label placed to right of bar
        barG
          .append('text')
          .attr('x', xEnd + 6)
          .attr('y', barY + 14)
          .attr('fill', '#475569')
          .attr('font-size', '10px')
          .attr('font-family', 'monospace')
          .attr('font-weight', '600')
          .text(`${m.actualProgressPct}%`);
      }

      // D. Gate Diamond Marker (For Step 6 and Step 9)
      if (m.isGate) {
        const gateX = xEnd;
        const gateY = barY + barHeight / 2;
        const gateSize = 7;

        barG
          .append('polygon')
          .attr(
            'points',
            `${gateX},${gateY - gateSize} ${gateX + gateSize},${gateY} ${gateX},${gateY + gateSize} ${gateX - gateSize},${gateY}`
          )
          .attr('fill', m.status === 'COMPLETED' ? '#059669' : m.step === 6 ? '#7c3aed' : '#0c2340')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2)
          .attr('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))');
      }
    });

    // 7. Today Line (Current date indicator)
    if (showTodayLine) {
      const today = new Date();
      const todayX = timeScale(today);

      if (todayX >= leftAxisWidth && todayX <= leftAxisWidth + chartWidth) {
        const todayGroup = svg.append('g').attr('class', 'gantt-today-marker');

        // Dashed vertical red/orange line
        todayGroup
          .append('line')
          .attr('x1', todayX)
          .attr('x2', todayX)
          .attr('y1', 26)
          .attr('y2', totalHeight)
          .attr('stroke', '#ef4444')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '4 3');

        // Today Badge on top
        todayGroup
          .append('rect')
          .attr('x', todayX - 30)
          .attr('y', 6)
          .attr('width', 60)
          .attr('height', 16)
          .attr('rx', 3)
          .attr('fill', '#ef4444');

        todayGroup
          .append('text')
          .attr('x', todayX)
          .attr('y', 17)
          .attr('fill', '#ffffff')
          .attr('font-size', '9px')
          .attr('font-weight', '800')
          .attr('text-anchor', 'middle')
          .text('HÔM NAY');
      }
    }
  }, [
    containerWidth,
    milestoneData,
    projectDateRange,
    project.currentStep,
    showDependencies,
    showTodayLine,
    onSelectStep,
  ]);

  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden ${className}`}>
      {/* ======================================================== */}
      {/* 1. TOP HEADER & CONTROLS                                 */}
      {/* ======================================================== */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#0c2340] text-white">
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <span>LỘ TRÌNH GANTT 9 BƯỚC VẬN HÀNH DỰ ÁN</span>
                <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {project.projectCode}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kế hoạch: <strong className="text-slate-800">{project.startDate}</strong> →{' '}
                <strong className="text-slate-800">{project.targetDate}</strong> ({projectDateRange.totalDays} ngày) •
                Quy mô: <strong className="text-slate-800">{project.lineCount} Line</strong> tại{' '}
                <strong className="text-blue-900">{project.factory}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Dependencies toggle */}
          <button
            type="button"
            onClick={() => setShowDependencies(!showDependencies)}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showDependencies
                ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="Bật/Tắt đường liên kết phụ thuộc giữa các bước"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Liên kết</span>
          </button>

          {/* Today line toggle */}
          <button
            type="button"
            onClick={() => setShowTodayLine(!showTodayLine)}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showTodayLine
                ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="Bật/Tắt mốc thời gian hôm nay"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Vạch Hôm nay</span>
          </button>

          {/* Current Step indicator badge */}
          <span className="px-3 py-1.5 bg-[#0c2340] text-white font-bold rounded-lg text-xs shadow-2xs">
            Bước hiện tại: {project.currentStep}/9 ({project.progressPct}%)
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. D3 GANTT SVG CANVAS                                   */}
      {/* ======================================================== */}
      <div ref={containerRef} className="overflow-x-auto relative bg-white">
        <svg ref={svgRef} className="block select-none" />

        {/* Hover Tooltip Overlay */}
        {hoveredStep && tooltipPos && (
          <div
            className="fixed z-50 pointer-events-none bg-[#0c2340] text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700 max-w-xs space-y-1.5 animate-in fade-in duration-150"
            style={{
              left: `${Math.min(window.innerWidth - 320, tooltipPos.x + 15)}px`,
              top: `${Math.min(window.innerHeight - 200, tooltipPos.y + 15)}px`,
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
              <span className="font-bold text-cyan-300">
                Bước {hoveredStep.step}: {hoveredStep.title}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  hoveredStep.status === 'COMPLETED'
                    ? 'bg-emerald-800 text-emerald-200'
                    : hoveredStep.status === 'OVERDUE'
                    ? 'bg-rose-800 text-rose-200'
                    : hoveredStep.status === 'IN_PROGRESS'
                    ? 'bg-blue-800 text-blue-200'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {hoveredStep.status === 'COMPLETED'
                  ? 'ĐÃ HOÀN THÀNH'
                  : hoveredStep.status === 'OVERDUE'
                  ? 'CHẬM TIẾN ĐỘ'
                  : hoveredStep.status === 'IN_PROGRESS'
                  ? 'ĐANG THỰC HIỆN'
                  : 'CHƯA BẮT ĐẦU'}
              </span>
            </div>

            <div className="text-[11px] text-slate-300 space-y-1">
              <div>
                Phụ trách: <strong className="text-white">{hoveredStep.role}</strong>
              </div>
              <div>
                Kế hoạch:{' '}
                <strong className="text-white">
                  {formatDateFull(hoveredStep.plannedStart)} → {formatDateFull(hoveredStep.plannedEnd)}
                </strong>{' '}
                ({hoveredStep.plannedDays} ngày)
              </div>
              <div>
                Tiến độ thực tế:{' '}
                <strong className="text-emerald-300 font-mono">{hoveredStep.actualProgressPct}%</strong>
              </div>
              <div className="text-slate-400 text-[10px] italic">{hoveredStep.metricsText}</div>
            </div>

            <div className="pt-1 text-[10px] text-cyan-300 border-t border-slate-700/80 flex items-center gap-1 font-semibold">
              <span>👉 Nhấp vào dòng để mở chi tiết nghiệp vụ</span>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. FOOTER LEGEND & SUMMARY                               */}
      {/* ======================================================== */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-slate-700">Chú giải:</span>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-600 inline-block shadow-2xs" />
            <span>Đã hoàn thành</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-blue-600 inline-block shadow-2xs" />
            <span>Đang thực hiện</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-rose-600 inline-block shadow-2xs" />
            <span>Chậm tiến độ</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-400 inline-block" />
            <span>Khung kế hoạch (Baseline)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-purple-600 rotate-45 inline-block shadow-2xs" />
            <span>Mốc kiểm soát Cổng (Gate 6 & 9)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-rose-500 border-b-2 border-dashed border-rose-500 inline-block" />
            <span>Vạch mốc hôm nay</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          Nhấp vào bất kỳ bước nào trên biểu đồ để điều hướng trực tiếp
        </div>
      </div>
    </div>
  );
};

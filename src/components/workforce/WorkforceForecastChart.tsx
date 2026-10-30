import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { ForecastDataPoint } from '../../services/workforceForecastService';
import {
  TrendingUp,
  Info,
  Layers,
  Sparkles,
  Calendar,
  Users,
  Target,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface WorkforceForecastChartProps {
  historicalPoints: ForecastDataPoint[];
  forecastPoints: ForecastDataPoint[];
  allPoints: ForecastDataPoint[];
  vendorName?: string;
  factoryName?: string;
  modelName: string;
}

export const WorkforceForecastChart: React.FC<WorkforceForecastChartProps> = ({
  historicalPoints,
  forecastPoints,
  allPoints,
  vendorName = 'ALL',
  factoryName = 'ALL',
  modelName,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // User interactive display toggles
  const [showConfidenceArea, setShowConfidenceArea] = useState<boolean>(true);
  const [showSOPLine, setShowSOPLine] = useState<boolean>(true);
  const [showBreakdownLines, setShowBreakdownLines] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<ForecastDataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Render chart with D3 on points change or resize
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || allPoints.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth || 900;
    const height = 420;
    const margin = { top: 35, right: 65, bottom: 50, left: 65 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('style', 'max-width: 100%; height: auto;');

    // Defs for gradients & shadow filters
    const defs = svg.append('defs');

    // Confidence interval gradient
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'confidence-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#10B981').attr('stop-opacity', 0.28);
    areaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#059669').attr('stop-opacity', 0.04);

    // Glow filter for forecast markers
    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // 1. Scales
    const xScale = d3
      .scalePoint<string>()
      .domain(allPoints.map((d) => d.cycleId))
      .range([0, innerWidth])
      .padding(0.4);

    // Y scale for Headcount (Left axis)
    const minHC = d3.min(allPoints, (d) => Math.min(d.lowerConfidence, d.totalHeadcount)) || 0;
    const maxHC = d3.max(allPoints, (d) => Math.max(d.upperConfidence, d.totalHeadcount)) || 100;
    const yPadding = (maxHC - minHC) * 0.18 || 20;

    const yScaleHC = d3
      .scaleLinear()
      .domain([Math.max(0, Math.floor((minHC - yPadding) / 20) * 20), Math.ceil((maxHC + yPadding) / 20) * 20])
      .nice()
      .range([innerHeight, 0]);

    // Y scale for SOP Output (Right axis)
    const maxSOP = d3.max(allPoints, (d) => d.sopPlanQty) || 10000;
    const yScaleSOP = d3
      .scaleLinear()
      .domain([0, Math.ceil((maxSOP * 1.25) / 10000) * 10000])
      .nice()
      .range([innerHeight, 0]);

    // 2. Grid lines
    const yAxisGrid = d3
      .axisLeft(yScaleHC)
      .tickSize(-innerWidth)
      .tickFormat(() => '')
      .ticks(6);

    g.append('g')
      .attr('class', 'grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', '#E2E8F0')
      .attr('stroke-dasharray', '2,2');

    g.selectAll('.grid .domain').remove();

    // 3. Vertical Background Section to clearly separate Historical vs Forecast
    const lastHistorical = historicalPoints[historicalPoints.length - 1];
    if (lastHistorical && forecastPoints.length > 0) {
      const splitX = xScale(lastHistorical.cycleId) || 0;
      const nextX = xScale(forecastPoints[0].cycleId) || innerWidth;
      const boundaryX = (splitX + nextX) / 2;

      // Forecast background tint
      g.append('rect')
        .attr('x', boundaryX)
        .attr('y', 0)
        .attr('width', innerWidth - boundaryX)
        .attr('height', innerHeight)
        .attr('fill', '#F0FDF4')
        .attr('opacity', 0.6)
        .attr('rx', 4);

      // Boundary line
      g.append('line')
        .attr('x1', boundaryX)
        .attr('x2', boundaryX)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#059669')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4');

      // Forecast badge
      const badgeG = g.append('g').attr('transform', `translate(${boundaryX + 10}, 14)`);
      badgeG
        .append('rect')
        .attr('x', 0)
        .attr('y', -12)
        .attr('width', 135)
        .attr('height', 20)
        .attr('rx', 4)
        .attr('fill', '#DCFCE7')
        .attr('stroke', '#86EFAC');

      badgeG
        .append('text')
        .attr('x', 67)
        .attr('y', 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', '#15803D')
        .text('DỰ BÁO 4 TUẦN TỚI →');
    }

    // 4. Confidence Interval Area (for forecast portion, including transition from last historical)
    if (showConfidenceArea && forecastPoints.length > 0 && lastHistorical) {
      const confidenceData = [lastHistorical, ...forecastPoints];

      const confidenceArea = d3
        .area<ForecastDataPoint>()
        .curve(d3.curveMonotoneX)
        .x((d) => xScale(d.cycleId) || 0)
        .y0((d) => yScaleHC(d.lowerConfidence))
        .y1((d) => yScaleHC(d.upperConfidence));

      g.append('path')
        .datum(confidenceData)
        .attr('fill', 'url(#confidence-gradient)')
        .attr('d', confidenceArea)
        .attr('stroke', '#10B981')
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '2,2');
    }

    // 5. SOP Output Secondary Line (Right axis)
    if (showSOPLine) {
      const sopLine = d3
        .line<ForecastDataPoint>()
        .curve(d3.curveMonotoneX)
        .x((d) => xScale(d.cycleId) || 0)
        .y((d) => yScaleSOP(d.sopPlanQty));

      g.append('path')
        .datum(allPoints)
        .attr('fill', 'none')
        .attr('stroke', '#9333EA')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,3')
        .attr('opacity', 0.85)
        .attr('d', sopLine);

      // SOP markers
      g.selectAll('.sop-dot')
        .data(allPoints)
        .enter()
        .append('circle')
        .attr('class', 'sop-dot')
        .attr('cx', (d) => xScale(d.cycleId) || 0)
        .attr('cy', (d) => yScaleSOP(d.sopPlanQty))
        .attr('r', 3)
        .attr('fill', '#9333EA')
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 1.5);
    }

    // 6. Optional Breakdown Lines (Official vs Seasonal)
    if (showBreakdownLines) {
      // Official Line
      const officialLine = d3
        .line<ForecastDataPoint>()
        .curve(d3.curveMonotoneX)
        .x((d) => xScale(d.cycleId) || 0)
        .y((d) => yScaleHC(d.officialHeadcount));

      g.append('path')
        .datum(allPoints)
        .attr('fill', 'none')
        .attr('stroke', '#2563EB')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.7)
        .attr('d', officialLine);

      // Seasonal Line
      const seasonalLine = d3
        .line<ForecastDataPoint>()
        .curve(d3.curveMonotoneX)
        .x((d) => xScale(d.cycleId) || 0)
        .y((d) => yScaleHC(d.seasonalHeadcount));

      g.append('path')
        .datum(allPoints)
        .attr('fill', 'none')
        .attr('stroke', '#F59E0B')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.8)
        .attr('d', seasonalLine);
    }

    // 7. Historical Headcount Line (Solid Blue)
    if (historicalPoints.length > 0) {
      const histLine = d3
        .line<ForecastDataPoint>()
        .curve(d3.curveMonotoneX)
        .x((d) => xScale(d.cycleId) || 0)
        .y((d) => yScaleHC(d.totalHeadcount));

      g.append('path')
        .datum(historicalPoints)
        .attr('fill', 'none')
        .attr('stroke', '#1E40AF')
        .attr('stroke-width', 3)
        .attr('d', histLine);
    }

    // 8. Forecast Headcount Line (Dashed Emerald, joined from last historical point)
    if (forecastPoints.length > 0 && lastHistorical) {
      const forecastData = [lastHistorical, ...forecastPoints];

      const fcLine = d3
        .line<ForecastDataPoint>()
        .curve(d3.curveMonotoneX)
        .x((d) => xScale(d.cycleId) || 0)
        .y((d) => yScaleHC(d.totalHeadcount));

      g.append('path')
        .datum(forecastData)
        .attr('fill', 'none')
        .attr('stroke', '#059669')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '6,4')
        .attr('d', fcLine);
    }

    // 9. Data Marker Dots
    // Historical dots (Solid blue circles)
    g.selectAll('.hist-dot')
      .data(historicalPoints)
      .enter()
      .append('circle')
      .attr('class', 'hist-dot')
      .attr('cx', (d) => xScale(d.cycleId) || 0)
      .attr('cy', (d) => yScaleHC(d.totalHeadcount))
      .attr('r', 5.5)
      .attr('fill', '#1E40AF')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer');

    // Forecast dots (Diamonds / Glowing green)
    const forecastSymbol = d3.symbol().type(d3.symbolDiamond).size(85);

    g.selectAll('.forecast-dot')
      .data(forecastPoints)
      .enter()
      .append('path')
      .attr('class', 'forecast-dot')
      .attr('d', forecastSymbol)
      .attr('transform', (d) => `translate(${xScale(d.cycleId)}, ${yScaleHC(d.totalHeadcount)})`)
      .attr('fill', '#059669')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)')
      .attr('cursor', 'pointer');

    // 10. Value labels on top of forecast points
    g.selectAll('.forecast-label')
      .data(forecastPoints)
      .enter()
      .append('text')
      .attr('class', 'forecast-label')
      .attr('x', (d) => xScale(d.cycleId) || 0)
      .attr('y', (d) => yScaleHC(d.totalHeadcount) - 12)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#047857')
      .text((d) => `${d.totalHeadcount.toLocaleString()}`);

    // 11. X Axis
    const xAxis = d3.axisBottom(xScale).tickFormat((cycleId) => {
      const pt = allPoints.find((p) => p.cycleId === cycleId);
      return pt ? `${pt.weekLabel}` : cycleId;
    });

    const xAxisG = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisG.selectAll('text').attr('font-size', '11px').attr('font-weight', '600').attr('fill', '#334155');
    xAxisG.selectAll('.domain').attr('stroke', '#94A3B8');

    // Sub-labels for date range under week label
    allPoints.forEach((p) => {
      const x = xScale(p.cycleId);
      if (x !== undefined) {
        g.append('text')
          .attr('x', x)
          .attr('y', innerHeight + 30)
          .attr('text-anchor', 'middle')
          .attr('font-size', '9px')
          .attr('fill', p.isForecast ? '#059669' : '#64748B')
          .attr('font-weight', p.isForecast ? 'bold' : 'normal')
          .text(p.dateRange);
      }
    });

    // 12. Left Y Axis (Headcount)
    const yAxisLeft = d3.axisLeft(yScaleHC).ticks(6).tickFormat((d) => `${Number(d).toLocaleString()}`);
    const yAxisLeftG = g.append('g').call(yAxisLeft);
    yAxisLeftG.selectAll('text').attr('font-size', '10px').attr('font-mono', true).attr('fill', '#1E40AF');
    yAxisLeftG.selectAll('.domain').attr('stroke', '#94A3B8');

    // Left Y Axis Title
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -48)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1E40AF')
      .text('Quân số nhân lực (người)');

    // 13. Right Y Axis (SOP Plan)
    if (showSOPLine) {
      const yAxisRight = d3
        .axisRight(yScaleSOP)
        .ticks(5)
        .tickFormat((d) => `${(Number(d) / 1000).toFixed(0)}k`);
      const yAxisRightG = g.append('g').attr('transform', `translate(${innerWidth},0)`).call(yAxisRight);
      yAxisRightG.selectAll('text').attr('font-size', '10px').attr('font-mono', true).attr('fill', '#9333EA');
      yAxisRightG.selectAll('.domain').attr('stroke', '#E9D5FF');

      // Right Y Axis Title
      g.append('text')
        .attr('transform', 'rotate(90)')
        .attr('y', -innerWidth - 48)
        .attr('x', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .attr('fill', '#9333EA')
        .text('Kế hoạch SOP (PCS)');
    }

    // 14. Interactive Overlay for Hover Crosshair & Tooltip
    const bisect = d3.bisector<ForecastDataPoint, number>((d) => d.weekNumber).center;

    const crosshair = g.append('line').attr('stroke', '#475569').attr('stroke-width', 1).attr('stroke-dasharray', '3,3').style('opacity', 0);

    const overlay = g
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair');

    overlay
      .on('mousemove', (event) => {
        const [mx, my] = d3.pointer(event);

        // Find nearest point
        let nearest = allPoints[0];
        let minDist = Infinity;

        allPoints.forEach((pt) => {
          const px = xScale(pt.cycleId) || 0;
          const dist = Math.abs(px - mx);
          if (dist < minDist) {
            minDist = dist;
            nearest = pt;
          }
        });

        const targetX = xScale(nearest.cycleId) || 0;
        crosshair
          .attr('x1', targetX)
          .attr('x2', targetX)
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .style('opacity', 1);

        setHoveredPoint(nearest);
        setTooltipPos({
          x: targetX + margin.left,
          y: Math.min(my + margin.top, height - 160),
        });
      })
      .on('mouseleave', () => {
        crosshair.style('opacity', 0);
        setHoveredPoint(null);
        setTooltipPos(null);
      });
  }, [allPoints, historicalPoints, forecastPoints, showConfidenceArea, showSOPLine, showBreakdownLines]);

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
      {/* Header bar of chart with title and interactive toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-blue-100 text-blue-700">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-black text-navy-950 uppercase tracking-wide">
              Biểu Đồ Xu Hướng Lịch Sử & Dự Báo Nhu Cầu Nhân Lực 4 Tuần
            </h2>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Mô hình: {modelName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân tích dữ liệu thực tế W13 - W16 kết hợp kế hoạch sản lượng SOP để dự báo nhu cầu W17 - W20
            {vendorName !== 'ALL' && ` • Vendor: ${vendorName}`}
            {factoryName !== 'ALL' && ` • ${factoryName}`}
          </p>
        </div>

        {/* Legend & Interactive Toggles */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Toggle: Confidence Area */}
          <button
            type="button"
            onClick={() => setShowConfidenceArea(!showConfidenceArea)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
              showConfidenceArea
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
            title="Bật/Tắt dải dự báo tin cậy 95%"
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 opacity-60 border border-emerald-600" />
            <span>Dải tin cậy 95%</span>
          </button>

          {/* Toggle: SOP Curve */}
          <button
            type="button"
            onClick={() => setShowSOPLine(!showSOPLine)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
              showSOPLine
                ? 'bg-purple-50 text-purple-800 border-purple-300'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
            title="Bật/Tắt đường sản lượng SOP theo tuần"
          >
            <span className="w-3 h-0.5 bg-purple-600 border-t border-purple-600 border-dashed" />
            <span>Kế hoạch SOP (PCS)</span>
          </button>

          {/* Toggle: Breakdown Lines */}
          <button
            type="button"
            onClick={() => setShowBreakdownLines(!showBreakdownLines)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
              showBreakdownLines
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
            title="Bật/Tắt đường chi tiết Chính thức & Thời vụ"
          >
            <Layers className="w-3 h-3 text-slate-500" />
            <span>Tách Chính thức / Thời vụ</span>
          </button>
        </div>
      </div>

      {/* Primary Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 px-1 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-1 bg-blue-800 rounded-full" />
          <span className="font-bold text-slate-800">Thực tế (W13 - W16):</span>
          <span>Số liệu đã nộp & xác nhận</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-1 bg-emerald-600 rounded-full border-t border-dashed" />
          <span className="font-bold text-emerald-800">Dự báo (W17 - W20):</span>
          <span>Nhu cầu dự kiến</span>
        </div>

        {showConfidenceArea && (
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-2 bg-emerald-200 rounded-xs border border-emerald-400" />
            <span className="text-emerald-700">Dải tin cậy 95% (±4% ~ ±7%)</span>
          </div>
        )}

        {showSOPLine && (
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-purple-600 border-t border-purple-600 border-dotted" />
            <span className="text-purple-700 font-semibold">Sản lượng SOP (Trục phải)</span>
          </div>
        )}
      </div>

      {/* Chart Canvas Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden bg-slate-50/50 rounded-lg p-2 border border-slate-100">
        <svg ref={svgRef} className="w-full select-none" />

        {/* Floating Custom Tooltip */}
        {hoveredPoint && tooltipPos && (
          <div
            className="absolute z-20 pointer-events-none bg-navy-950 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs space-y-2 min-w-[240px] backdrop-blur-md"
            style={{
              left: tooltipPos.x > 500 ? tooltipPos.x - 260 : tooltipPos.x + 15,
              top: tooltipPos.y,
              transform: 'translateY(-20%)',
            }}
          >
            {/* Tooltip Header */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-700">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    hoveredPoint.isForecast ? 'bg-emerald-400 animate-ping' : 'bg-blue-400'
                  }`}
                />
                <span className="font-bold text-sm text-white">
                  {hoveredPoint.weekLabel} ({hoveredPoint.cycleId})
                </span>
              </div>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  hoveredPoint.isForecast
                    ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                    : 'bg-blue-900/80 text-blue-300 border border-blue-700'
                }`}
              >
                {hoveredPoint.isForecast ? 'Dự báo AI' : 'Thực tế'}
              </span>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{hoveredPoint.dateRange}</span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Tổng nhân lực:</span>
                <span className="font-mono font-black text-sm text-cyan-300">
                  {hoveredPoint.totalHeadcount.toLocaleString()}
                </span>
                {hoveredPoint.deltaFromPrevPercent !== undefined && (
                  <span
                    className={`text-[9px] ml-1.5 font-bold ${
                      hoveredPoint.deltaFromPrevPercent > 0
                        ? 'text-emerald-400'
                        : hoveredPoint.deltaFromPrevPercent < 0
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {hoveredPoint.deltaFromPrevPercent > 0 ? `+${hoveredPoint.deltaFromPrevPercent}%` : `${hoveredPoint.deltaFromPrevPercent}%`}
                  </span>
                )}
              </div>

              <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Kế hoạch SOP:</span>
                <span className="font-mono font-bold text-purple-300">
                  {hoveredPoint.sopPlanQty.toLocaleString()} PCS
                </span>
              </div>
            </div>

            {/* Detailed Split */}
            <div className="space-y-1 text-[10px] text-slate-300 bg-slate-900/50 p-2 rounded">
              <div className="flex justify-between">
                <span>Chính thức:</span>
                <span className="font-mono font-bold text-white">
                  {hoveredPoint.officialHeadcount.toLocaleString()} người
                </span>
              </div>
              <div className="flex justify-between">
                <span>Thời vụ:</span>
                <span className="font-mono font-bold text-amber-300">
                  {hoveredPoint.seasonalHeadcount.toLocaleString()} người ({hoveredPoint.seasonalRatio}%)
                </span>
              </div>
              {hoveredPoint.isForecast && (
                <div className="flex justify-between border-t border-slate-800 pt-1 text-emerald-300">
                  <span>Dải tin cậy 95%:</span>
                  <span className="font-mono font-bold">
                    {hoveredPoint.lowerConfidence.toLocaleString()} ~ {hoveredPoint.upperConfidence.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Action Note */}
            {hoveredPoint.actionRecommendation && (
              <div className="text-[10px] bg-slate-900 p-2 rounded border border-slate-800 text-slate-300 leading-snug">
                <span className="font-bold text-amber-400 block mb-0.5">Khuyến nghị vận hành:</span>
                {hoveredPoint.actionRecommendation}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

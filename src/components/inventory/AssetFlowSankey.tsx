import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import {
  sankey as d3Sankey,
  sankeyLinkHorizontal,
  SankeyGraph,
  SankeyNode,
  SankeyLink,
} from 'd3-sankey';
import { TransferOrder, MasterAsset, StockMovement, UserProfile } from '../../types';
import {
  ArrowRightLeft,
  Building2,
  Filter,
  Layers,
  Sparkles,
  Download,
  Maximize2,
  RefreshCw,
  Info,
  CheckCircle2,
  Clock,
  Truck,
  Boxes,
  Cpu,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

interface AssetFlowSankeyProps {
  orders: TransferOrder[];
  assets: MasterAsset[];
  movements: StockMovement[];
  currentUser: UserProfile;
  onSelectOrder?: (orderId: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export type SankeyFlowMode =
  | 'FACTORY_CATEGORY_FACTORY' // Nhà máy xuất -> Loại thiết bị -> Nhà máy nhận
  | 'FACTORY_STATUS_FACTORY'   // Nhà máy xuất -> Trạng thái 9 bước -> Nhà máy nhận
  | 'BOOK_STATUS_PHYSICAL';    // Nhà máy sở hữu sổ sách -> Tình trạng -> Vị trí thực tế

interface CustomSankeyNodeExtra {
  id: string;
  name: string;
  category?: string;
  color: string;
  stage: number;
}

interface CustomSankeyLinkExtra {
  source: string | number;
  target: string | number;
  value: number;
  assetCount: number;
  totalValueVND: number;
  assetNames: string[];
  orderIds: string[];
}

type MySankeyNode = SankeyNode<CustomSankeyNodeExtra, CustomSankeyLinkExtra>;
type MySankeyLink = SankeyLink<CustomSankeyNodeExtra, CustomSankeyLinkExtra>;

const FACTORY_COLORS: Record<string, string> = {
  'Nhà máy A': '#2563eb', // Blue
  'Nhà máy B': '#f59e0b', // Amber
  'Nhà máy C': '#10b981', // Emerald
  'Khu vực sửa chữa': '#ef4444', // Red
  'Đang vận chuyển': '#8b5cf6', // Purple
};

const CATEGORY_COLORS: Record<string, string> = {
  'Khí nén & Thủy lực': '#0284c7', // Sky
  'Gia công Cơ khí & CNC': '#7c3aed', // Violet
  'Điện & Tự động hóa': '#d97706', // Amber
  'Đo lường & Thử nghiệm': '#059669', // Emerald
  'Phụ trợ xưởng': '#db2777', // Pink
  'Robot & Hàn': '#dc2626', // Red
};

const STATUS_COLORS: Record<string, string> = {
  'Hoàn tất (Đã dán tem)': '#16a34a', // Green
  'Đang vận chuyển (Bước 4-5)': '#ea580c', // Orange
  'Chờ dán tem (Bước 7-8)': '#2563eb', // Blue
  'Đang xử lý tiếp nhận': '#9333ea', // Purple
  'Chờ xác nhận (Bước 2)': '#64748b', // Slate
};

export const AssetFlowSankey: React.FC<AssetFlowSankeyProps> = ({
  orders,
  assets,
  movements,
  currentUser,
  onSelectOrder,
  onNavigateTab,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Filters & State
  const [flowMode, setFlowMode] = useState<SankeyFlowMode>('FACTORY_CATEGORY_FACTORY');
  const [selectedFactoryFilter, setSelectedFactoryFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedNode, setSelectedNode] = useState<MySankeyNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<MySankeyLink | null>(null);
  const [hoveredLink, setHoveredLink] = useState<MySankeyLink | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    details: string[];
    value: number;
    extra?: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    details: [],
    value: 0,
  });

  // Calculate flow metrics from TransferOrders & Assets
  const { nodes, links, flowStats } = useMemo(() => {
    // 1. Filter orders based on user selection
    const filteredOrders = orders.filter((o) => {
      if (o.status === 'CANCELLED') return false;
      if (selectedFactoryFilter !== 'ALL') {
        if (o.fromFactory !== selectedFactoryFilter && o.toFactory !== selectedFactoryFilter) {
          return false;
        }
      }
      if (selectedStatusFilter === 'COMPLETED' && o.status !== 'STICKER_CONFIRMED') return false;
      if (
        selectedStatusFilter === 'ACTIVE' &&
        (o.status === 'STICKER_CONFIRMED' || o.status === 'DRAFT')
      )
        return false;
      return true;
    });

    const nodeMap = new Map<string, CustomSankeyNodeExtra>();
    const linkMap = new Map<string, CustomSankeyLinkExtra>();

    const addNode = (id: string, name: string, color: string, stage: number, category?: string) => {
      if (!nodeMap.has(id)) {
        nodeMap.set(id, { id, name, color, stage, category });
      }
    };

    const addLink = (
      sourceId: string,
      targetId: string,
      qty: number,
      assetName: string,
      orderId: string,
      valueVND: number = 100000000
    ) => {
      const key = `${sourceId}__TO__${targetId}`;
      const existing = linkMap.get(key);
      if (existing) {
        existing.value += qty;
        existing.assetCount += qty;
        existing.totalValueVND += valueVND;
        if (!existing.assetNames.includes(assetName)) {
          existing.assetNames.push(assetName);
        }
        if (!existing.orderIds.includes(orderId)) {
          existing.orderIds.push(orderId);
        }
      } else {
        linkMap.set(key, {
          source: sourceId,
          target: targetId,
          value: qty,
          assetCount: qty,
          totalValueVND: valueVND,
          assetNames: [assetName],
          orderIds: [orderId],
        });
      }
    };

    let totalTransferUnits = 0;
    let totalValueVND = 0;
    const routeCounts: Record<string, number> = {};

    if (flowMode === 'FACTORY_CATEGORY_FACTORY') {
      // Stage 0: From Factory
      // Stage 1: Asset Category
      // Stage 2: To Factory
      filteredOrders.forEach((ord) => {
        const fromF = ord.fromFactory;
        const toF = ord.toFactory;
        const fromNodeId = `SRC_${fromF}`;
        const toNodeId = `DST_${toF}`;

        addNode(fromNodeId, `${fromF} (Xuất)`, FACTORY_COLORS[fromF] || '#3b82f6', 0);
        addNode(toNodeId, `${toF} (Nhận)`, FACTORY_COLORS[toF] || '#10b981', 2);

        // Count per item
        const items = ord.plannedItems.length > 0 ? ord.plannedItems : [{ id: '1', name: 'Thiết bị', quantity: 1, assetCode: 'TS', note: '' }];

        items.forEach((item) => {
          const matchingAsset = assets.find((a) => a.code === item.assetCode || a.name === item.name);
          const category = matchingAsset?.category || 'Phụ trợ xưởng';
          const catNodeId = `CAT_${category}`;

          addNode(catNodeId, category, CATEGORY_COLORS[category] || '#6366f1', 1, category);

          const qty = item.quantity || 1;
          const itemVal = matchingAsset?.residualValue || matchingAsset?.originalValue || 150000000;

          // Stage 0 -> Stage 1
          addLink(fromNodeId, catNodeId, qty, item.name, ord.id, itemVal * qty);
          // Stage 1 -> Stage 2
          addLink(catNodeId, toNodeId, qty, item.name, ord.id, itemVal * qty);

          totalTransferUnits += qty;
          totalValueVND += itemVal * qty;

          const route = `${fromF} → ${toF}`;
          routeCounts[route] = (routeCounts[route] || 0) + qty;
        });
      });
    } else if (flowMode === 'FACTORY_STATUS_FACTORY') {
      // Stage 0: From Factory
      // Stage 1: Transfer Progress / 9 Steps Status
      // Stage 2: To Factory
      filteredOrders.forEach((ord) => {
        const fromF = ord.fromFactory;
        const toF = ord.toFactory;
        const fromNodeId = `SRC_${fromF}`;
        const toNodeId = `DST_${toF}`;

        addNode(fromNodeId, `${fromF} (Xuất)`, FACTORY_COLORS[fromF] || '#3b82f6', 0);
        addNode(toNodeId, `${toF} (Nhận)`, FACTORY_COLORS[toF] || '#10b981', 2);

        let statusLabel = 'Đang xử lý';
        if (ord.status === 'STICKER_CONFIRMED') statusLabel = 'Hoàn tất (Đã dán tem)';
        else if (ord.status === 'IN_TRANSIT' || ord.status === 'DELIVERY_UPLOADED')
          statusLabel = 'Đang vận chuyển (Bước 4-5)';
        else if (ord.status === 'BOOK_TRANSFERRED' || ord.status === 'QR_PRINTED')
          statusLabel = 'Chờ dán tem (Bước 7-8)';
        else if (ord.status === 'WAITING_CONFIRMATION')
          statusLabel = 'Chờ xác nhận (Bước 2)';
        else statusLabel = 'Đang xử lý tiếp nhận';

        const statusNodeId = `STATUS_${statusLabel}`;
        addNode(statusNodeId, statusLabel, STATUS_COLORS[statusLabel] || '#94a3b8', 1);

        const qty = ord.plannedItems.reduce((acc, i) => acc + i.quantity, 0) || 1;
        const assetName = ord.plannedItems.map((i) => i.name).join(', ') || 'Thiết bị';
        const orderVal = 350000000;

        addLink(fromNodeId, statusNodeId, qty, assetName, ord.id, orderVal * qty);
        addLink(statusNodeId, toNodeId, qty, assetName, ord.id, orderVal * qty);

        totalTransferUnits += qty;
        totalValueVND += orderVal * qty;
        const route = `${fromF} → ${toF}`;
        routeCounts[route] = (routeCounts[route] || 0) + qty;
      });
    } else {
      // Mode: BOOK_STATUS_PHYSICAL (Book Factory -> Operational Status -> Physical Factory)
      assets.forEach((ast) => {
        const bookF = ast.bookOwnership;
        const physF = ast.physicalFactory;
        const opStatus = ast.operationalStatus;

        const bookNodeId = `BOOK_${bookF}`;
        const statusNodeId = `OP_${opStatus}`;
        const physNodeId = `PHYS_${physF}`;

        addNode(bookNodeId, `${bookF} (Sổ sách)`, FACTORY_COLORS[bookF] || '#2563eb', 0);
        addNode(statusNodeId, opStatus, '#8b5cf6', 1);
        addNode(physNodeId, `${physF} (Hiện diện)`, FACTORY_COLORS[physF] || '#10b981', 2);

        const val = ast.residualValue || 200000000;
        addLink(bookNodeId, statusNodeId, 1, ast.name, ast.activeTransferId || 'TON_KHO', val);
        addLink(statusNodeId, physNodeId, 1, ast.name, ast.activeTransferId || 'TON_KHO', val);

        totalTransferUnits += 1;
        totalValueVND += val;
      });
    }

    // Convert Map to array and assign indices
    const rawNodes = Array.from(nodeMap.values());
    const idToIndex = new Map<string, number>();
    rawNodes.forEach((n, idx) => idToIndex.set(n.id, idx));

    const rawLinks: CustomSankeyLinkExtra[] = [];
    linkMap.forEach((l) => {
      const sIdx = idToIndex.get(l.source as string);
      const tIdx = idToIndex.get(l.target as string);
      if (sIdx !== undefined && tIdx !== undefined) {
        rawLinks.push({
          ...l,
          source: sIdx,
          target: tIdx,
        });
      }
    });

    // Top route
    let topRoute = 'Nhà máy A → Nhà máy B';
    let maxRouteQty = 0;
    Object.entries(routeCounts).forEach(([r, count]) => {
      if (count > maxRouteQty) {
        maxRouteQty = count;
        topRoute = r;
      }
    });

    return {
      nodes: rawNodes,
      links: rawLinks,
      flowStats: {
        totalUnits: totalTransferUnits / 2, // Divided by 2 because links are duplicated in 2-stage flow
        totalValueVND: totalValueVND / 2,
        orderCount: filteredOrders.length,
        topRoute: `${topRoute} (${maxRouteQty} máy)`,
        completedRate: Math.round(
          (filteredOrders.filter((o) => o.status === 'STICKER_CONFIRMED').length /
            Math.max(1, filteredOrders.length)) *
            100
        ),
      },
    };
  }, [orders, assets, flowMode, selectedFactoryFilter, selectedStatusFilter]);

  // Render D3 Sankey Diagram
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0 || links.length === 0) {
      return;
    }

    const containerWidth = containerRef.current.clientWidth || 960;
    const width = Math.max(760, containerWidth);
    const height = 520;
    const margin = { top: 30, right: 160, bottom: 30, left: 160 };

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height);

    // Defs for gradients
    const defs = svg.append('defs');

    // Create Sankey generator
    const sankeyGenerator = d3Sankey<CustomSankeyNodeExtra, CustomSankeyLinkExtra>()
      .nodeWidth(22)
      .nodePadding(18)
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);

    // Clone data for D3 mutation
    const sankeyData: SankeyGraph<CustomSankeyNodeExtra, CustomSankeyLinkExtra> = {
      nodes: nodes.map((d) => ({ ...d })),
      links: links.map((d) => ({ ...d })),
    };

    let graph: SankeyGraph<CustomSankeyNodeExtra, CustomSankeyLinkExtra>;
    try {
      graph = sankeyGenerator(sankeyData);
    } catch (err) {
      console.warn('Sankey cycle/layout error:', err);
      return;
    }

    // Create gradients for links
    graph.links.forEach((link, idx) => {
      const gradientId = `sankey-grad-${idx}`;
      const grad = defs
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', (link.source as MySankeyNode).x1 || 0)
        .attr('x2', (link.target as MySankeyNode).x0 || 0);

      grad
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', (link.source as MySankeyNode).color || '#3b82f6')
        .attr('stop-opacity', 0.55);

      grad
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', (link.target as MySankeyNode).color || '#10b981')
        .attr('stop-opacity', 0.55);
    });

    // Links Layer
    const linkG = svg
      .append('g')
      .attr('class', 'links')
      .attr('fill', 'none')
      .selectAll('path')
      .data(graph.links)
      .enter()
      .append('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (_, idx) => `url(#sankey-grad-${idx})`)
      .attr('stroke-width', (d) => Math.max(2, d.width || 1))
      .attr('cursor', 'pointer')
      .style('transition', 'stroke-opacity 0.2s, stroke-width 0.2s')
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('stroke-opacity', 0.95).attr('stroke-width', Math.max(3, (d.width || 1) + 2));
        setHoveredLink(d as MySankeyLink);

        const sourceNode = d.source as MySankeyNode;
        const targetNode = d.target as MySankeyNode;
        const [x, y] = d3.pointer(event, containerRef.current);

        setTooltipData({
          visible: true,
          x,
          y: y - 10,
          title: `${sourceNode.name} → ${targetNode.name}`,
          details: d.assetNames || ['Thiết bị điều động'],
          value: d.value,
          extra: `Giá trị luân chuyển: ${(d.totalValueVND / 1000000).toLocaleString('vi-VN')} triệu VNĐ • ${
            d.orderIds?.length || 1
          } lệnh điều động`,
        });
      })
      .on('mousemove', function (event) {
        const [x, y] = d3.pointer(event, containerRef.current);
        setTooltipData((prev) => ({ ...prev, x, y: y - 10 }));
      })
      .on('mouseleave', function () {
        d3.select(this).attr('stroke-opacity', 0.55).attr('stroke-width', (d: any) => Math.max(2, d.width || 1));
        setHoveredLink(null);
        setTooltipData((prev) => ({ ...prev, visible: false }));
      })
      .on('click', function (_, d) {
        setSelectedLink(d as MySankeyLink);
        setSelectedNode(null);
      });

    // Nodes Layer
    const nodeG = svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(graph.nodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, MySankeyNode>()
          .subject((d) => d)
          .on('drag', function (event, d) {
            d.y0 = Math.max(margin.top, Math.min(height - margin.bottom - (d.y1! - d.y0!), event.y));
            d.y1 = d.y0 + (d.value ? (d.y1! - d.y0!) : 20);
            d3.select(this).attr('transform', `translate(0, ${d.y0 - (d as any).initialY0 || 0})`);
            sankeyGenerator.update(graph);
            linkG.attr('d', sankeyLinkHorizontal());
          })
      );

    // Node Rectangles
    nodeG
      .append('rect')
      .attr('x', (d) => d.x0 || 0)
      .attr('y', (d) => d.y0 || 0)
      .attr('height', (d) => Math.max(6, (d.y1 || 0) - (d.y0 || 0)))
      .attr('width', (d) => (d.x1 || 0) - (d.x0 || 0))
      .attr('fill', (d) => d.color || '#3b82f6')
      .attr('rx', 4)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('stroke', '#0c2340').attr('stroke-width', 2.5);
        const [x, y] = d3.pointer(event, containerRef.current);
        setTooltipData({
          visible: true,
          x,
          y: y - 10,
          title: d.name,
          details: [`Lưu lượng: ${d.value} thiết bị luân chuyển qua nút này`],
          value: d.value || 0,
        });
      })
      .on('mouseleave', function () {
        d3.select(this).attr('stroke', '#ffffff').attr('stroke-width', 1.5);
        setTooltipData((prev) => ({ ...prev, visible: false }));
      })
      .on('click', function (_, d) {
        setSelectedNode(d as MySankeyNode);
        setSelectedLink(null);
      });

    // Node Text Labels
    nodeG
      .append('text')
      .attr('x', (d) => ((d.x0 || 0) < width / 2 ? (d.x0 || 0) - 8 : (d.x1 || 0) + 8))
      .attr('y', (d) => ((d.y1 || 0) + (d.y0 || 0)) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d) => ((d.x0 || 0) < width / 2 ? 'end' : 'start'))
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#0f172a')
      .text((d) => `${d.name} (${d.value})`);

    // Column Stage Headers
    const stages = [
      { text: '1. Nguồn Xuất Đi', x: margin.left, anchor: 'middle' },
      { text: flowMode === 'FACTORY_CATEGORY_FACTORY' ? '2. Nhóm Thiết Bị' : '2. Tiến Độ Điều Động', x: width / 2, anchor: 'middle' },
      { text: '3. Nơi Tiếp Nhận', x: width - margin.right, anchor: 'middle' },
    ];

    stages.forEach((st) => {
      svg
        .append('text')
        .attr('x', st.x)
        .attr('y', 16)
        .attr('text-anchor', st.anchor)
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .attr('fill', '#475569')
        .text(st.text);
    });
  }, [nodes, links, flowMode]);

  // Export SVG Snapshot
  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ETMS-Asset-Flow-Sankey-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Detail records for the drill-down panel
  const drillDownOrders = useMemo(() => {
    if (selectedLink) {
      const orderIds = selectedLink.orderIds || [];
      return orders.filter((o) => orderIds.includes(o.id));
    }
    if (selectedNode) {
      const nodeName = selectedNode.name;
      return orders.filter((o) => {
        return (
          nodeName.includes(o.fromFactory) ||
          nodeName.includes(o.toFactory) ||
          o.plannedItems.some((item) => nodeName.includes(item.name))
        );
      });
    }
    return orders.slice(0, 8); // Default display
  }, [selectedLink, selectedNode, orders]);

  return (
    <div className="space-y-4">
      {/* 1. Header Banner & Mode Selector */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-navy-950">
            <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-slate-900">
                Biểu đồ Dòng chảy Tài sản (Sankey Diagram)
              </h2>
              <p className="text-xs text-slate-500">
                Trực quan hóa luồng di chuyển, chủng loại và tiến độ điều động thiết bị liên nhà máy bằng D3.js
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => {
                setFlowMode('FACTORY_CATEGORY_FACTORY');
                setSelectedNode(null);
                setSelectedLink(null);
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                flowMode === 'FACTORY_CATEGORY_FACTORY'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Chủng loại thiết bị
            </button>
            <button
              type="button"
              onClick={() => {
                setFlowMode('FACTORY_STATUS_FACTORY');
                setSelectedNode(null);
                setSelectedLink(null);
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                flowMode === 'FACTORY_STATUS_FACTORY'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Tiến độ 9 Bước
            </button>
            <button
              type="button"
              onClick={() => {
                setFlowMode('BOOK_STATUS_PHYSICAL');
                setSelectedNode(null);
                setSelectedLink(null);
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                flowMode === 'BOOK_STATUS_PHYSICAL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Sổ sách vs Hiện vật
            </button>
          </div>

          {/* Export SVG */}
          <button
            type="button"
            onClick={handleExportSVG}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-md text-xs shadow-2xs transition-colors cursor-pointer"
            title="Xuất file vector SVG biểu đồ Sankey"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất SVG</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng thiết bị chu chuyển</div>
            <div className="text-xl font-black text-slate-900">{flowStats.totalUnits} máy móc</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Giá trị tài sản luân chuyển</div>
            <div className="text-xl font-black text-slate-900">
              {(flowStats.totalValueVND / 1000000000).toFixed(2)} tỷ VNĐ
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Tuyến sôi động nhất</div>
            <div className="text-sm font-black text-slate-900 truncate" title={flowStats.topRoute}>
              {flowStats.topRoute}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">Tỷ lệ hoàn tất dán tem</div>
            <div className="text-xl font-black text-emerald-600">{flowStats.completedRate}%</div>
          </div>
        </div>
      </div>

      {/* 3. Main Sankey Canvas Container */}
      <div
        ref={containerRef}
        className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs relative overflow-hidden"
      >
        {/* Canvas Toolbar Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>Lọc theo nhà máy:</span>
            </span>
            <select
              value={selectedFactoryFilter}
              onChange={(e) => setSelectedFactoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded px-2.5 py-1 font-semibold outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả nhà máy (A, B, C)</option>
              <option value="Nhà máy A">Chỉ Nhà máy A</option>
              <option value="Nhà máy B">Chỉ Nhà máy B</option>
              <option value="Nhà máy C">Chỉ Nhà máy C</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Trạng thái lệnh:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded px-2.5 py-1 font-semibold outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả (12 lệnh điều động)</option>
              <option value="ACTIVE">Đang xử lý / Đang luân chuyển</option>
              <option value="COMPLETED">Đã dán tem hoàn tất</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 italic">
            * Nhấp vào đường luồng hoặc kéo thả thanh khối để tương tác
          </div>
        </div>

        {/* D3 SVG Element */}
        <div className="w-full overflow-x-auto">
          <svg ref={svgRef} className="w-full min-w-[720px] select-none block" />
        </div>

        {/* Floating Tooltip */}
        {tooltipData.visible && (
          <div
            className="absolute z-20 pointer-events-none bg-navy-950 text-white rounded-lg p-2.5 shadow-xl border border-slate-700 max-w-xs text-xs transform -translate-x-1/2 -translate-y-full transition-transform duration-75"
            style={{ left: `${tooltipData.x}px`, top: `${tooltipData.y}px` }}
          >
            <div className="font-bold text-sm text-blue-400 mb-1 border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>{tooltipData.title}</span>
              <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                {tooltipData.value} thiết bị
              </span>
            </div>
            {tooltipData.extra && (
              <div className="text-[11px] text-amber-300 mb-1 font-semibold">{tooltipData.extra}</div>
            )}
            <div className="text-[11px] text-slate-300 space-y-0.5">
              {tooltipData.details.slice(0, 4).map((d, i) => (
                <div key={i} className="truncate">
                  • {d}
                </div>
              ))}
              {tooltipData.details.length > 4 && (
                <div className="text-[10px] text-slate-400 italic">
                  + {tooltipData.details.length - 4} tài sản khác...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Drill-Down Detail Table for Selected Flow or Node */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              {selectedLink
                ? `Chi tiết lệnh điều động thuộc luồng: ${(selectedLink.source as MySankeyNode).name} → ${
                    (selectedLink.target as MySankeyNode).name
                  }`
                : selectedNode
                ? `Chi tiết lệnh điều động liên quan tới: ${selectedNode.name}`
                : 'Danh sách các lệnh điều động thiết bị đang hiển thị trên biểu đồ'}
            </h3>
          </div>
          {(selectedLink || selectedNode) && (
            <button
              type="button"
              onClick={() => {
                setSelectedLink(null);
                setSelectedNode(null);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
            >
              Bỏ chọn bộ lọc luồng
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <th className="py-2.5 px-3">Mã lệnh</th>
                <th className="py-2.5 px-3">Tuyến điều chuyển</th>
                <th className="py-2.5 px-3">Danh sách thiết bị</th>
                <th className="py-2.5 px-2 text-center">Số lượng</th>
                <th className="py-2.5 px-3">Trạng thái 9 bước</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {drillDownOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 italic">
                    Không có lệnh điều động nào khớp với lựa chọn này.
                  </td>
                </tr>
              ) : (
                drillDownOrders.map((ord) => {
                  return (
                    <tr key={ord.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                        {ord.id}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900">{ord.fromFactory}</span>
                        <span className="text-slate-400 mx-1.5">→</span>
                        <span className="font-semibold text-slate-900">{ord.toFactory}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="max-w-xs truncate text-slate-900 font-medium">
                          {ord.plannedItems.map((i) => i.name).join(', ')}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {ord.plannedItems.map((i) => i.assetCode).join(', ')}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold">
                        {ord.plannedItems.reduce((acc, i) => acc + i.quantity, 0)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${
                            ord.status === 'STICKER_CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : ord.status === 'IN_TRANSIT'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          Bước {ord.currentStep}/9 — {ord.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {onSelectOrder && (
                          <button
                            type="button"
                            onClick={() => onSelectOrder(ord.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold rounded text-[11px] transition-colors cursor-pointer"
                          >
                            Xem chi tiết
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

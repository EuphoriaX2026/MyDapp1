import type { Address } from 'viem';
import { ZERO_ADDRESS } from '../config/constants';

export const GEN_NODE_SIZE = 16;
export const GEN_CHILDREN_SPACING = 120;
export const GEN_LABEL_WIDTH = 76;
export const GEN_LABEL_GAP = 8;
export const GEN_PADDING_X = 20;
export const GEN_PADDING_Y = 24;
export const GEN_MIN_CANVAS_HEIGHT = 520;
export const GEN_MIN_BAND_HEIGHT = GEN_NODE_SIZE + 20;

export type LayoutNode = {
  address: Address;
  key: string;
  cx: number;
  cy: number;
  color: string;
  userId: string;
  group: number;
  label: string;
};

export type LayoutEdge = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type LayoutResult = {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
};

export type NodeMeta = {
  userId: string;
  status: number;
  highestGroup: number;
};

export type ChildrenPair = {
  left: Address;
  right: Address;
};

/** Types.UserStatus — Free, Active, Inactive, Blocked, Royal, Queen */
const STATUS_COLORS: Record<number, string> = {
  0: '#8B5CF6',
  1: '#3B82F6',
  2: '#F59E0B',
  3: '#EF4444',
  4: '#10B981',
  5: '#10B981',
};

export function isZeroAddress(addr: Address | string | undefined) {
  return !addr || addr.toLowerCase() === ZERO_ADDRESS.toLowerCase();
}

export function nodeColor(status: number) {
  return STATUS_COLORS[status] ?? '#9CA3AF';
}

export function formatIdLabel(userId: string) {
  return `ID: ${userId}`;
}

/** Column X — root hugs the left; each depth steps right (horizontal guide line). */
function columnCenterX(depth: number) {
  return (
    GEN_PADDING_X +
    GEN_LABEL_WIDTH +
    GEN_LABEL_GAP +
    GEN_NODE_SIZE / 2 +
    depth * GEN_CHILDREN_SPACING
  );
}

function makeLayoutNode(
  addr: Address,
  cx: number,
  cy: number,
  metaMap: Record<string, NodeMeta>,
): LayoutNode {
  const key = addr.toLowerCase();
  const meta = metaMap[key];
  const status = meta?.status ?? 0;
  const userId = meta?.userId ?? '…';
  return {
    address: addr,
    key,
    cx,
    cy,
    color: nodeColor(status),
    userId,
    group: meta?.highestGroup ?? 0,
    label: formatIdLabel(userId),
  };
}

type SubtreeLayout = {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  maxDepth: number;
};

/**
 * Place node at horizontal column `depth` and vertical center of [yNorth, ySouth].
 * Left child → north band [yNorth, cy]; right child → south band [cy, ySouth].
 */
function buildSubtree(
  addr: Address,
  depth: number,
  yNorth: number,
  ySouth: number,
  expanded: Record<string, boolean>,
  childrenMap: Record<string, ChildrenPair>,
  metaMap: Record<string, NodeMeta>,
): SubtreeLayout {
  const cx = columnCenterX(depth);
  const cy = (yNorth + ySouth) / 2;
  const parentNode = makeLayoutNode(addr, cx, cy, metaMap);

  const key = addr.toLowerCase();
  const kids = childrenMap[key];
  const isExpanded = !!expanded[key];
  const leftAddr = kids && !isZeroAddress(kids.left) ? kids.left : null;
  const rightAddr = kids && !isZeroAddress(kids.right) ? kids.right : null;

  if (!isExpanded || !kids || (!leftAddr && !rightAddr)) {
    return { nodes: [parentNode], edges: [], maxDepth: depth };
  }

  const nodes: LayoutNode[] = [parentNode];
  const edges: LayoutEdge[] = [];
  let maxDepth = depth;

  const addEdgeTo = (child: LayoutNode) => {
    edges.push({
      x1: cx + GEN_NODE_SIZE / 2,
      y1: cy,
      x2: child.cx - GEN_NODE_SIZE / 2,
      y2: child.cy,
    });
  };

  if (leftAddr && rightAddr) {
    const leftLayout = buildSubtree(
      leftAddr,
      depth + 1,
      yNorth,
      cy,
      expanded,
      childrenMap,
      metaMap,
    );
    const rightLayout = buildSubtree(
      rightAddr,
      depth + 1,
      cy,
      ySouth,
      expanded,
      childrenMap,
      metaMap,
    );
    nodes.push(...leftLayout.nodes, ...rightLayout.nodes);
    edges.push(...leftLayout.edges, ...rightLayout.edges);
    addEdgeTo(leftLayout.nodes[0]);
    addEdgeTo(rightLayout.nodes[0]);
    maxDepth = Math.max(maxDepth, leftLayout.maxDepth, rightLayout.maxDepth);
  } else if (leftAddr) {
    const leftLayout = buildSubtree(
      leftAddr,
      depth + 1,
      yNorth,
      ySouth,
      expanded,
      childrenMap,
      metaMap,
    );
    nodes.push(...leftLayout.nodes);
    edges.push(...leftLayout.edges);
    addEdgeTo(leftLayout.nodes[0]);
    maxDepth = Math.max(maxDepth, leftLayout.maxDepth);
  } else if (rightAddr) {
    const rightLayout = buildSubtree(
      rightAddr,
      depth + 1,
      yNorth,
      ySouth,
      expanded,
      childrenMap,
      metaMap,
    );
    nodes.push(...rightLayout.nodes);
    edges.push(...rightLayout.edges);
    addEdgeTo(rightLayout.nodes[0]);
    maxDepth = Math.max(maxDepth, rightLayout.maxDepth);
  }

  return { nodes, edges, maxDepth };
}

/** Deepest expanded path — each level halves the vertical band. */
function maxExpandedDepth(
  addr: Address,
  expanded: Record<string, boolean>,
  childrenMap: Record<string, ChildrenPair>,
): number {
  const key = addr.toLowerCase();
  if (!expanded[key]) return 0;
  const kids = childrenMap[key];
  if (!kids) return 0;

  let maxChild = 0;
  if (!isZeroAddress(kids.left)) {
    maxChild = Math.max(maxChild, 1 + maxExpandedDepth(kids.left, expanded, childrenMap));
  }
  if (!isZeroAddress(kids.right)) {
    maxChild = Math.max(maxChild, 1 + maxExpandedDepth(kids.right, expanded, childrenMap));
  }
  return maxChild;
}

function minHeightForDepth(expandedDepth: number) {
  return GEN_PADDING_Y * 2 + GEN_MIN_BAND_HEIGHT * 2 ** expandedDepth;
}

export function buildGenealogyLayout(
  root: Address,
  expanded: Record<string, boolean>,
  childrenMap: Record<string, ChildrenPair>,
  metaMap: Record<string, NodeMeta>,
  minScreenWidth: number,
  viewportHeight: number,
): LayoutResult {
  const expandedDepth = maxExpandedDepth(root, expanded, childrenMap);
  const height = Math.max(
    viewportHeight > 0 ? viewportHeight : GEN_MIN_CANVAS_HEIGHT,
    minHeightForDepth(expandedDepth),
    GEN_MIN_CANVAS_HEIGHT,
  );

  const yNorth = GEN_PADDING_Y;
  const ySouth = height - GEN_PADDING_Y;

  const { nodes, edges, maxDepth } = buildSubtree(
    root,
    0,
    yNorth,
    ySouth,
    expanded,
    childrenMap,
    metaMap,
  );

  const width = Math.max(
    minScreenWidth,
    GEN_PADDING_X * 2 +
      GEN_LABEL_WIDTH +
      GEN_LABEL_GAP +
      GEN_NODE_SIZE +
      (maxDepth + 1) * GEN_CHILDREN_SPACING +
      80,
  );

  return { nodes, edges, width, height };
}

export function curvedEdgePath(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const forkX = x1 + dx * 0.35;
  const approachX = x1 + dx * 0.65;
  return `M ${x1} ${y1} C ${forkX} ${y1}, ${approachX} ${y2}, ${x2} ${y2}`;
}

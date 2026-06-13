import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAccount, useReadContract, useReadContracts, usePublicClient } from 'wagmi';
import type { Address } from 'viem';

import { WalletFlowPageShell } from '../components/wallet/WalletFlowPageShell';
import {
  useGenealogyDownlineRaw,
  type GroupFilter,
} from '../hooks/useGenealogyDownlineRaw';
import { formatAddressForDisplay } from '../utils/addressValidation';
import { writeClipboardText } from '../utils/clipboard';
import {
  buildGenealogyLayout,
  curvedEdgePath,
  GEN_LABEL_GAP,
  GEN_LABEL_WIDTH,
  GEN_MIN_CANVAS_HEIGHT,
  GEN_NODE_SIZE,
  isZeroAddress,
  type ChildrenPair,
  type NodeMeta,
} from '../utils/genealogyLayout';
import { contracts } from '../config/wagmi';
import RegisterABI from '../abis/Register-titan.json';
import LensABI from '../abis/Lens-titan.json';
import {
  GenealogyPointsPanel,
  GenealogyPointsReopenBar,
  type PointsPanelTab,
} from '../components/genealogy/GenealogyPointsPanel';
import '../styles/send-money-page.css';
import '../styles/genealogy.css';

const GROUP_IDS = [1, 2, 3, 4, 5, 6, 7] as const;

type IdCardState = {
  address: Address;
  x: number;
  y: number;
};

const GROUP_OPTIONS: { value: GroupFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...GROUP_IDS.map((g) => ({ value: g as GroupFilter, label: `G${g}` })),
];

function formatBigInt(value: bigint) {
  return value.toString();
}

function GenealogyIdMiniCard({
  address,
  viewerAddress,
  x,
  y,
  onClose,
}: {
  address: Address;
  viewerAddress: Address;
  x: number;
  y: number;
  onClose: () => void;
}) {
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
  const [copied, setCopied] = useState(false);
  const { rawForGroup, isLoading } = useGenealogyDownlineRaw(viewerAddress, address);
  const totalRaw = rawForGroup(groupFilter);

  const cardWidth = 280;
  const left = Math.min(Math.max(8, x), window.innerWidth - cardWidth - 8);
  const top = Math.max(8, Math.min(y, window.innerHeight - 140));

  const handleCopy = async () => {
    const ok = await writeClipboardText(address);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <>
      <div className="genealogy-id-card-backdrop" onClick={onClose} role="presentation" />
      <div
        className="genealogy-id-card"
        style={{ left, top }}
        role="dialog"
        aria-label="Node wallet and RAW points"
      >
        <div className="genealogy-id-card-grid">
          <p className="genealogy-id-card-label">Wallet</p>
          <button
            type="button"
            className="genealogy-id-card-copy"
            onClick={() => void handleCopy()}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>

          <p className="genealogy-id-card-wallet">
            {formatAddressForDisplay(address, 6, 4)}
          </p>

          <p className="genealogy-id-card-label">Group</p>
          <p className="genealogy-id-card-label genealogy-id-card-label--right">Total RAW</p>

          <select
            className="genealogy-id-card-select"
            value={groupFilter === 'all' ? 'all' : String(groupFilter)}
            onChange={(e) => {
              const v = e.target.value;
              setGroupFilter(v === 'all' ? 'all' : (Number(v) as GroupFilter));
            }}
            aria-label="Group filter"
          >
            {GROUP_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value === 'all' ? 'all' : String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="genealogy-id-card-raw">
            {isLoading ? '…' : formatBigInt(totalRaw)}
          </p>
        </div>
      </div>
    </>
  );
}

export default function Genealogy() {
  const { address: loggedInAddress, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [screenWidth, setScreenWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 390,
  );
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [treeRoot, setTreeRoot] = useState<Address | undefined>(undefined);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [childrenMap, setChildrenMap] = useState<Record<string, ChildrenPair>>({});
  const [metaMap, setMetaMap] = useState<Record<string, NodeMeta>>({});
  const [visibleAddresses, setVisibleAddresses] = useState<Address[]>([]);
  const [idCard, setIdCard] = useState<IdCardState | null>(null);
  const [loadingChildren, setLoadingChildren] = useState<Record<string, boolean>>({});
  const [pointsPanelOpen, setPointsPanelOpen] = useState(true);
  const [pointsPanelInitialTab, setPointsPanelInitialTab] = useState<PointsPanelTab | null>(
    null,
  );

  useEffect(() => {
    if (loggedInAddress) {
      setTreeRoot(loggedInAddress as Address);
    }
  }, [loggedInAddress]);

  useEffect(() => {
    const onResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const measure = () => {
      setViewportSize({ width: el.clientWidth, height: el.clientHeight });
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [treeRoot, isConnected]);

  const { data: rootBasic } = useReadContract({
    address: contracts.TITAN_REGISTER as `0x${string}`,
    abi: RegisterABI.abi,
    functionName: 'getUserBasicDetails',
    args: treeRoot ? [treeRoot] : undefined,
    query: { enabled: !!treeRoot },
  });

  const loggedInUserId = rootBasic
    ? (rootBasic as readonly [bigint])[0].toString()
    : '—';

  const collectVisible = useCallback(
    (addr: Address | undefined, acc: Address[]) => {
      if (!addr || isZeroAddress(addr)) return;
      const key = addr.toLowerCase();
      if (!acc.some((a) => a.toLowerCase() === key)) acc.push(addr);
      if (!expanded[key]) return;
      const kids = childrenMap[key];
      if (!kids) return;
      if (!isZeroAddress(kids.left)) collectVisible(kids.left, acc);
      if (!isZeroAddress(kids.right)) collectVisible(kids.right, acc);
    },
    [expanded, childrenMap],
  );

  useEffect(() => {
    if (!treeRoot) {
      setVisibleAddresses([]);
      return;
    }
    const list: Address[] = [];
    collectVisible(treeRoot, list);
    setVisibleAddresses(list);
  }, [treeRoot, collectVisible]);

  const metaCalls = useMemo(
    () =>
      visibleAddresses.flatMap((addr) => [
        {
          address: contracts.TITAN_REGISTER as `0x${string}`,
          abi: RegisterABI.abi,
          functionName: 'getUserBasicDetails' as const,
          args: [addr] as const,
        },
        {
          address: contracts.TITAN_REGISTER as `0x${string}`,
          abi: RegisterABI.abi,
          functionName: 'getUserStatus' as const,
          args: [addr] as const,
        },
        {
          address: contracts.TITAN_LENS as `0x${string}`,
          abi: LensABI.abi,
          functionName: 'getUserIncomeCapInfo' as const,
          args: [addr] as const,
        },
      ]),
    [visibleAddresses],
  );

  const { data: metaBatch } = useReadContracts({
    contracts: metaCalls,
    query: { enabled: visibleAddresses.length > 0 },
  });

  useEffect(() => {
    if (!metaBatch || visibleAddresses.length === 0) return;
    setMetaMap((prev) => {
      const next = { ...prev };
      visibleAddresses.forEach((addr, idx) => {
        const base = idx * 3;
        const basic = metaBatch[base]?.result as readonly [bigint] | undefined;
        const statusRaw = metaBatch[base + 1]?.result;
        const groupRaw = metaBatch[base + 2]?.result;
        next[addr.toLowerCase()] = {
          userId: basic?.[0]?.toString() ?? '0',
          status: Number(statusRaw ?? 0),
          highestGroup: Number(groupRaw ?? 0),
        };
      });
      return next;
    });
  }, [metaBatch, visibleAddresses]);

  const fetchChildren = useCallback(
    async (addr: Address) => {
      if (!publicClient) return;
      const key = addr.toLowerCase();
      setLoadingChildren((p) => ({ ...p, [key]: true }));
      try {
        const result = await publicClient.readContract({
          address: contracts.TITAN_REGISTER as `0x${string}`,
          abi: RegisterABI.abi,
          functionName: 'getDirectChildren',
          args: [addr],
        });
        const [left, right] = result as readonly [Address, Address];
        setChildrenMap((p) => ({ ...p, [key]: { left, right } }));
      } finally {
        setLoadingChildren((p) => ({ ...p, [key]: false }));
      }
    },
    [publicClient],
  );

  const toggleExpand = useCallback(
    async (addr: Address) => {
      const key = addr.toLowerCase();
      const willExpand = !expanded[key];
      if (willExpand && !childrenMap[key]) {
        await fetchChildren(addr);
      }
      setExpanded((p) => ({ ...p, [key]: willExpand }));
    },
    [expanded, childrenMap, fetchChildren],
  );

  const layout = useMemo(() => {
    if (!treeRoot) return null;
    const frameWidth = viewportSize.width > 0 ? viewportSize.width : Math.max(360, screenWidth);
    const frameHeight =
      viewportSize.height > 0 ? viewportSize.height : GEN_MIN_CANVAS_HEIGHT;
    return buildGenealogyLayout(
      treeRoot,
      expanded,
      childrenMap,
      metaMap,
      frameWidth,
      frameHeight,
    );
  }, [treeRoot, expanded, childrenMap, metaMap, screenWidth, viewportSize.width, viewportSize.height]);

  const canvasHeight = layout?.height ?? 0;

  const openIdCard = useCallback((addr: Address, rect: DOMRect) => {
    const cardWidth = 280;
    const x = Math.min(rect.left, window.innerWidth - cardWidth - 8);
    const y = Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - 120));
    setIdCard({ address: addr, x, y });
  }, []);

  return (
    <WalletFlowPageShell title="Genealogy" titleMedium variant="flat" backTo="/" settingsSurface={false}>
      <div className="send-money-page genealogy-page section full">
        <div className="genealogy-header-bar">
          <span className="genealogy-header-id">ID: {loggedInUserId}</span>
          <span className="genealogy-header-wallet">
            {loggedInAddress
              ? formatAddressForDisplay(loggedInAddress, 6, 4)
              : 'Not connected'}
          </span>
        </div>

        {isConnected && treeRoot ? (
          pointsPanelOpen ? (
            <GenealogyPointsPanel
              key={pointsPanelInitialTab ?? 'collapsed'}
              initialTab={pointsPanelInitialTab}
              onDismiss={() => {
                setPointsPanelOpen(false);
                setPointsPanelInitialTab(null);
              }}
            />
          ) : (
            <GenealogyPointsReopenBar
              onOpen={(tab) => {
                setPointsPanelInitialTab(tab);
                setPointsPanelOpen(true);
              }}
            />
          )
        ) : null}

        {!isConnected || !treeRoot ? (
          <p className="genealogy-empty-msg">
            Connect your wallet to view your genealogy tree.
          </p>
        ) : layout ? (
          <div className="genealogy-viewport" ref={viewportRef}>
            <div
              className="genealogy-canvas"
              style={{
                width: layout.width,
                height: canvasHeight,
                minWidth: layout.width,
                minHeight: canvasHeight,
              }}
            >
              <svg
                className="genealogy-edges"
                width={layout.width}
                height={canvasHeight}
                aria-hidden
              >
                {layout.edges.map((edge, i) => (
                  <path
                    key={`edge-${i}`}
                    d={curvedEdgePath(edge.x1, edge.y1, edge.x2, edge.y2)}
                    className="genealogy-edge-path"
                  />
                ))}
              </svg>

              <div className="genealogy-nodes-layer">
                {layout.nodes.map((node) => {
                  const labelLeft =
                    node.cx - GEN_LABEL_WIDTH - GEN_LABEL_GAP - GEN_NODE_SIZE / 2;
                  const labelTop = node.cy - 8;
                  const circleLeft = node.cx - GEN_NODE_SIZE / 2;
                  const circleTop = node.cy - GEN_NODE_SIZE / 2;
                  const isLoading = loadingChildren[node.key];

                  return (
                    <div key={node.key} className="genealogy-node-anchor">
                      <button
                        type="button"
                        className="genealogy-label-btn"
                        style={{ left: labelLeft, top: labelTop }}
                        aria-label={node.label}
                        onClick={(e) => {
                          e.stopPropagation();
                          openIdCard(
                            node.address,
                            e.currentTarget.getBoundingClientRect(),
                          );
                        }}
                      >
                        {node.label}
                      </button>
                      <button
                        type="button"
                        className="genealogy-circle-btn"
                        style={{ left: circleLeft, top: circleTop, backgroundColor: node.color }}
                        aria-label={`Group ${node.group}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          void toggleExpand(node.address);
                        }}
                      >
                        <span className="genealogy-circle-num">{node.group}</span>
                      </button>
                      {isLoading ? (
                        <span
                          className="genealogy-loading-dot"
                          style={{ left: circleLeft + GEN_NODE_SIZE + 4, top: circleTop + 2 }}
                          aria-hidden
                        >
                          …
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {idCard && loggedInAddress ? (
          <GenealogyIdMiniCard
            address={idCard.address}
            viewerAddress={loggedInAddress as Address}
            x={idCard.x}
            y={idCard.y}
            onClose={() => setIdCard(null)}
          />
        ) : null}
      </div>
    </WalletFlowPageShell>
  );
}

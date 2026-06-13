import { AppIcon } from '../icons/AppIcon';
import { useState } from 'react';

import { Loader } from '../Loader';
import { usePointsMatrix, type GroupPointsData } from '../../hooks/usePointsMatrix';
import { getGroupLevelLabel } from '../../data/storeRealmProducts';

const GROUP_IDS = [1, 2, 3, 4, 5, 6, 7] as const;

export type PointsPanelTab = 'all' | 'pending' | 'paid' | 'raw';

const TABS: { id: PointsPanelTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'paid', label: 'Paid' },
  { id: 'raw', label: 'Raw' },
];

function formatBigInt(value: bigint) {
  return value.toString();
}

type RowValues = { left: bigint; right: bigint };

function allBranchTotals(points: GroupPointsData): RowValues {
  return {
    left: points.pendingLeft + points.rawLeft + points.paidLeft,
    right: points.pendingRight + points.rawRight + points.paidRight,
  };
}

function valuesForTab(tab: Exclude<PointsPanelTab, 'all'>, points: GroupPointsData): RowValues {
  switch (tab) {
    case 'pending':
      return { left: points.pendingLeft, right: points.pendingRight };
    case 'paid':
      return { left: points.paidLeft, right: points.paidRight };
    case 'raw':
      return { left: points.rawLeft, right: points.rawRight };
  }
}

interface GenealogyPointsPanelProps {
  onDismiss: () => void;
  initialTab?: PointsPanelTab | null;
}

export function GenealogyPointsPanel({
  onDismiss,
  initialTab = null,
}: GenealogyPointsPanelProps) {
  const { groupsData, isLoading } = usePointsMatrix();
  const [activeTab, setActiveTab] = useState<PointsPanelTab | null>(initialTab);

  const handleTabClick = (tab: PointsPanelTab) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  const tableExpanded = activeTab !== null;

  return (
    <div
      className={`genealogy-points-panel${tableExpanded ? ' genealogy-points-panel--expanded' : ''}`}
      role="region"
      aria-label="Points overview"
    >
      <div className="genealogy-points-panel-toolbar">
        <div className="genealogy-points-tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`genealogy-points-tab${activeTab === tab.id ? ' genealogy-points-tab--active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="genealogy-points-close"
          onClick={onDismiss}
          aria-label="Close points panel"
        >
          <AppIcon icon="lucide:x" size={16} strokeWidth={1.75} />
        </button>
      </div>

      {tableExpanded && activeTab ? (
        <div className="genealogy-points-table-wrap" role="tabpanel">
          {isLoading ? (
            <div className="genealogy-points-loading">
              <Loader />
            </div>
          ) : (
            <>
              <div className="genealogy-points-table-head">
                <span>Group</span>
                <span>Left</span>
                <span>Right</span>
              </div>
              {GROUP_IDS.map((groupIdx) => {
                const realmName = getGroupLevelLabel(groupIdx);
                const points = groupsData[groupIdx];
                const { left, right } =
                  activeTab === 'all'
                    ? allBranchTotals(points)
                    : valuesForTab(activeTab, points);
                return (
                  <div key={groupIdx} className="genealogy-points-table-row">
                    <span className="genealogy-points-group-name">{realmName}</span>
                    <span className="genealogy-points-cell">{formatBigInt(left)}</span>
                    <span className="genealogy-points-cell">{formatBigInt(right)}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

interface GenealogyPointsReopenBarProps {
  onOpen: (tab: PointsPanelTab) => void;
}

export function GenealogyPointsReopenBar({ onOpen }: GenealogyPointsReopenBarProps) {
  return (
    <div className="genealogy-points-reopen" role="region" aria-label="Open points overview">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className="genealogy-points-reopen-tab"
          onClick={() => onOpen(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

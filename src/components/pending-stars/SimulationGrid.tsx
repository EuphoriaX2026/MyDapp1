import type { GroupSimulation } from '../../utils/pendingStarsSimulation';
import { formatPendingStarsBigInt } from '../../utils/pendingStarsSimulation';

type SimulationGridProps = {
  sim: GroupSimulation;
  groupName: string;
};

export function SimulationGrid({ sim, groupName }: SimulationGridProps) {
  const rows: { id: string; label: string; left: bigint; right: bigint }[] = [
    { id: 'old-raw', label: 'Old Raw Points', left: sim.oldRawLeft, right: sim.oldRawRight },
    { id: 'new-pending', label: 'New Pending', left: sim.newPendingLeft, right: sim.newPendingRight },
    { id: 'final-raw', label: 'Final Raw', left: sim.finalRawLeft, right: sim.finalRawRight },
    { id: 'after-balance', label: 'After Balance', left: sim.remainingLeft, right: sim.remainingRight },
  ];

  return (
    <>
      <div className="pending-stars-sim-table-wrap">
        <div className="pending-stars-sim-grid pending-stars-sim-grid--table">
          <span className="pending-stars-sim-grid-head pending-stars-sim-grid-head--label pending-stars-sim-grid-head--group">
            {groupName}
          </span>
          <span className="pending-stars-sim-grid-head pending-stars-sim-grid-head--branch">Left</span>
          <span className="pending-stars-sim-grid-head pending-stars-sim-grid-head--branch">Right</span>

          {rows.map((row) => (
            <div key={row.id} className="contents">
              <span className="pending-stars-sim-grid-label">{row.label}</span>
              <span className="pending-stars-sim-grid-value pending-stars-sim-grid-value--branch">
                {formatPendingStarsBigInt(row.left)}
              </span>
              <span className="pending-stars-sim-grid-value pending-stars-sim-grid-value--branch">
                {formatPendingStarsBigInt(row.right)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pending-stars-sim-meta pending-stars-sim-meta--plain">
        <div className="pending-stars-sim-meta-row">
          <span>New Matches</span>
          <strong>{formatPendingStarsBigInt(sim.matches)}</strong>
        </div>
        <div className="pending-stars-sim-meta-row">
          <span>Multiplier</span>
          <strong>{formatPendingStarsBigInt(sim.multiplier)}x</strong>
        </div>
        <div className="pending-stars-sim-meta-row">
          <span>New RFT Shares</span>
          <strong>{formatPendingStarsBigInt(sim.newRftShares)}</strong>
        </div>
      </div>
    </>
  );
}

import { SimulationGrid } from './SimulationGrid';
import type { GroupSimulation } from '../../utils/pendingStarsSimulation';

const INACTIVE_WARNING =
  'You are losing income in this group. Activate this group quickly.';

type PendingStarsGroupCardProps = {
  sim: GroupSimulation;
  isOpen: boolean;
  isInactiveWarning: boolean;
  onToggle: () => void;
};

export function PendingStarsGroupCard({
  sim,
  isOpen,
  isInactiveWarning,
  onToggle,
}: PendingStarsGroupCardProps) {
  return (
    <div
      className={`pending-stars-group-card${isOpen ? ' pending-stars-group-card--open' : ''}${isInactiveWarning ? ' pending-stars-group-card--warning' : ''}`}
    >
      <button
        type="button"
        className={`pending-stars-group-card__toggle${isOpen ? ' pending-stars-group-card__toggle--open' : ''}`}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? `Collapse ${sim.groupName}` : `Expand ${sim.groupName}`}
      >
        {!isOpen ? <span className="pending-stars-group-card__toggle-label">{sim.groupName}</span> : null}
        <span
          className={`pending-stars-sim-card-chevron${isOpen ? ' pending-stars-sim-card-chevron--open' : ''}`}
          aria-hidden
        >
          ▼
        </span>
      </button>

      {isOpen ? (
        <div className="pending-stars-group-card__body">
          {isInactiveWarning ? (
            <p className="pending-stars-group-card__warning">{INACTIVE_WARNING}</p>
          ) : null}

          <SimulationGrid sim={sim} groupName={sim.groupName} />
        </div>
      ) : null}
    </div>
  );
}

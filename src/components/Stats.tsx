import { ArrowUpRight, CheckCheck, Clock3, Inbox, Ticket } from 'lucide-react';
import type { ticketStats } from '../lib/tickets';
import type { Status } from '../types';
export function Stats({
  counts,
  loading,
  onSelect,
}: {
  counts: ReturnType<typeof ticketStats>;
  loading: boolean;
  onSelect: (status: Status | 'All') => void;
}) {
  const cards = [
    {
      label: 'Total tickets',
      key: 'All' as const,
      icon: Ticket,
      tone: 'neutral',
      text: 'Across your workspace',
    },
    {
      label: 'Open',
      key: 'Open' as const,
      icon: Inbox,
      tone: 'blue',
      text: 'Waiting for a first response',
    },
    {
      label: 'In progress',
      key: 'In Progress' as const,
      icon: Clock3,
      tone: 'amber',
      text: 'Being taken care of',
    },
    {
      label: 'Resolved',
      key: 'Resolved' as const,
      icon: CheckCheck,
      tone: 'green',
      text: 'Successfully closed',
    },
  ];
  return (
    <div className="stats-grid">
      {cards.map((stat) => (
        <button
          disabled={loading}
          className={`stat-card ${stat.tone}`}
          key={stat.key}
          onClick={() => onSelect(stat.key)}
          aria-label={`Show ${stat.key === 'All' ? 'all' : stat.label.toLowerCase()} tickets`}
        >
          <div className="stat-top">
            <span>{stat.label}</span>
            <span className="stat-icon">
              <stat.icon size={18} />
            </span>
          </div>
          <div className="stat-number">
            {loading ? '—' : counts[stat.key].toString().padStart(2, '0')}
            <ArrowUpRight size={16} />
          </div>
          <p>{stat.text}</p>
        </button>
      ))}
    </div>
  );
}

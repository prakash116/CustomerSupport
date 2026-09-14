import { CheckCheck, Headphones, Inbox, LayoutGrid, LifeBuoy, Clock3 } from 'lucide-react';
import type { Status } from '../types';
import type { ticketStats } from '../lib/tickets';
export type View = 'Overview' | 'All tickets' | 'In Progress' | 'Resolved';
export function Sidebar({
  view,
  counts,
  onNavigate,
}: {
  view: View;
  counts: ReturnType<typeof ticketStats>;
  onNavigate: (view: View, status: Status | 'All') => void;
}) {
  const items = [
    { name: 'Overview' as const, icon: LayoutGrid, status: 'All' as const },
    { name: 'All tickets' as const, icon: Inbox, status: 'All' as const, count: counts.All },
    {
      name: 'In Progress' as const,
      icon: Clock3,
      status: 'In Progress' as const,
      count: counts['In Progress'],
    },
    { name: 'Resolved' as const, icon: CheckCheck, status: 'Resolved' as const },
  ];
  const homePath = import.meta.env.BASE_URL;
  return (
    <aside className="sidebar">
      <a href={homePath} className="brand" aria-label="Resolve home">
        <span className="brand-icon">
          <Headphones size={23} strokeWidth={2.2} />
        </span>
        resolve<span className="brand-period">.</span>
      </a>
      <div className="workspace">
        <span className="workspace-icon">S</span>
        <div>
          <strong>Support workspace</strong>
          <span>Let’s make someone’s day</span>
        </div>
      </div>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="Main navigation">
        {items.map((item) => (
          <button
            key={item.name}
            className={`nav-item ${view === item.name ? 'active' : ''}`}
            aria-current={view === item.name ? 'page' : undefined}
            onClick={() => onNavigate(item.name, item.status)}
          >
            <item.icon size={18} />
            {item.name === 'In Progress' ? 'In progress' : item.name}
            {item.count !== undefined && <span className="nav-count">{item.count}</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="queue-note">
          <span className="flex items-center gap-2 font-semibold">
            <LifeBuoy size={17} />A little help goes a long way
          </span>
          <p>Every resolved ticket is a better customer experience.</p>
          <div className="queue-progress">
            <span style={{ width: `${counts.All ? (counts.Resolved / counts.All) * 100 : 0}%` }} />
          </div>
          <span className="queue-caption">
            {counts.Resolved} of {counts.All} tickets resolved
          </span>
        </div>
        <div className="profile">
          <span className="avatar profile-avatar">JD</span>
          <div>
            <strong>Jamie Davis</strong>
            <span>Support agent</span>
          </div>
          <span className="online-dot" title="Available" />
        </div>
      </div>
    </aside>
  );
}

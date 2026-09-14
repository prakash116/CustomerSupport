import {
  ArrowDownWideNarrow,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Inbox,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { PRIORITIES, STATUSES, type Ticket } from '../types';
import { shortDate, type Filters } from '../lib/tickets';
import { useTickets } from '../store/useTickets';
import { Avatar, PriorityBadge, StatusSelect } from './Badges';

interface Props {
  tickets: Ticket[];
  total: number;
  filters: Filters;
  page: number;
  pages: number;
  count: number;
  onFilter: (values: Partial<Filters>) => void;
  onClear: () => void;
  onPage: (page: number) => void;
  onOpen: (id: string) => void;
}
export function TicketList({
  tickets,
  total,
  filters,
  page,
  pages,
  count,
  onFilter,
  onClear,
  onPage,
  onOpen,
}: Props) {
  const phase = useTickets((s) => s.phase);
  const error = useTickets((s) => s.error);
  const load = useTickets((s) => s.load);
  const updateStatus = useTickets((s) => s.updateStatus);
  const pending = useTickets((s) => s.pending);
  const loading = phase === 'idle' || phase === 'loading';
  const hasFilters = Boolean(
    filters.search || filters.status !== 'All' || filters.priority !== 'All',
  );
  const title = filters.status === 'All' ? 'All tickets' : `${filters.status} tickets`;
  return (
    <section className="tickets-panel" aria-label="Support tickets" aria-busy={loading}>
      <div className="panel-heading">
        <div>
          <div className="flex items-center gap-2.5">
            <h2>{title}</h2>
            <span className="count-badge">{loading ? '—' : count}</span>
          </div>
          <p>A good day starts with a clear inbox.</p>
        </div>
        <button
          className="icon-button"
          aria-label="Refresh tickets"
          onClick={() => void load()}
          disabled={loading || pending.length > 0}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <div className="ticket-toolbar">
        <div className="tabs" aria-label="Filter by status">
          {(['All', ...STATUSES] as const).map((status) => (
            <button
              key={status}
              className={`tab ${filters.status === status ? 'active' : ''}`}
              aria-pressed={filters.status === status}
              onClick={() => onFilter({ status })}
            >
              {status === 'All' ? (
                <>
                  All tickets <span>{total}</span>
                </>
              ) : status === 'In Progress' ? (
                'In progress'
              ) : (
                status
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-row">
        <label className="search-field">
          <Search size={17} />
          <input
            type="search"
            placeholder="Search by name, subject, or ticket ID..."
            aria-label="Search tickets"
            value={filters.search}
            onChange={(e) => onFilter({ search: e.target.value })}
          />
        </label>
        <div className="filter-actions">
          <label className="filter-select">
            <SlidersHorizontal size={14} />
            <select
              aria-label="Filter by priority"
              value={filters.priority}
              onChange={(e) => onFilter({ priority: e.target.value as Filters['priority'] })}
            >
              <option value="All">All priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="filter-select sort-select">
            <ArrowDownWideNarrow size={15} />
            <select
              aria-label="Sort tickets"
              value={filters.sort}
              onChange={(e) => onFilter({ sort: e.target.value as Filters['sort'] })}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>
      </div>
      {hasFilters && (
        <div className="active-filters">
          <span>
            {count} matching {count === 1 ? 'ticket' : 'tickets'}
          </span>
          <button onClick={onClear}>
            Clear filters
            <X size={12} />
          </button>
        </div>
      )}
      {loading ? (
        <div role="status" className="loading-state">
          <span className="sr-only">Loading tickets…</span>
          {Array.from({ length: 6 }, (_, i) => (
            <div className="skeleton-row" key={i}>
              <div className="skeleton skeleton-avatar" />
              <div className="skeleton skeleton-name" />
              <div className="skeleton skeleton-subject" />
              <div className="skeleton skeleton-badge" />
            </div>
          ))}
        </div>
      ) : phase === 'error' ? (
        <div className="empty-state" role="alert">
          <span className="empty-icon error-icon">
            <CircleAlert size={25} />
          </span>
          <h3>We couldn’t load your tickets</h3>
          <p>{error}</p>
          <button className="secondary-button" onClick={() => void load()}>
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">
            <Inbox size={26} />
          </span>
          <h3>{hasFilters ? 'No tickets found' : 'A fresh start'}</h3>
          <p>
            {hasFilters
              ? 'Try a different search or adjust your filters.'
              : 'Your workspace is clear. Create a ticket to get started.'}
          </p>
          {hasFilters && (
            <button className="secondary-button" onClick={onClear}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Subject</th>
                <th scope="col">Priority</th>
                <th scope="col">Status</th>
                <th scope="col">Created</th>
                <th scope="col">
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="customer-column">
                    <div className="customer-cell">
                      <Avatar name={ticket.customer.name} />
                      <div>
                        <strong>{ticket.customer.name}</strong>
                        <span>{ticket.customer.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="subject-column">
                    <button className="subject-button" onClick={() => onOpen(ticket.id)}>
                      {ticket.subject}
                    </button>
                    <div className="ticket-meta">
                      #{ticket.id}
                      <span>·</span>
                      {ticket.category}
                    </div>
                  </td>
                  <td className="priority-column">
                    <span className="mobile-field-label">Priority</span>
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="status-column">
                    <StatusSelect
                      status={ticket.status}
                      label={`Status for ${ticket.id}`}
                      disabled={pending.includes(ticket.id)}
                      onChange={(status) => void updateStatus(ticket.id, status)}
                    />
                  </td>
                  <td className="date-cell">
                    <time dateTime={ticket.createdAt}>{shortDate(ticket.createdAt)}</time>
                  </td>
                  <td className="open-column">
                    <button
                      className="icon-button"
                      aria-label={`Open ticket ${ticket.id}`}
                      onClick={() => onOpen(ticket.id)}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {phase === 'ready' && count > 0 && (
        <div className="table-footer">
          <span>
            Showing{' '}
            <strong>
              {(page - 1) * 8 + 1}–{Math.min(page * 8, count)}
            </strong>{' '}
            of <strong>{count}</strong> tickets
          </span>
          <nav aria-label="Ticket pagination" className="pagination">
            <button
              onClick={() => onPage(page - 1)}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={13} />
              <span>Previous</span>
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
              .map((p, i, array) => (
                <span className="page-number-wrap" key={p}>
                  {i > 0 && p - array[i - 1] > 1 && <span className="page-ellipsis">…</span>}
                  <button
                    aria-label={`Page ${p}`}
                    aria-current={page === p ? 'page' : undefined}
                    className={page === p ? 'selected' : ''}
                    onClick={() => onPage(p)}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => onPage(page + 1)}
              disabled={page === pages}
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </nav>
        </div>
      )}
    </section>
  );
}

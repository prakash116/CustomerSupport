import { useEffect, useState } from 'react';
import { Check, ChevronRight, Headphones, MessageSquare, Plus, X } from 'lucide-react';
import { defaultFilters, filterTickets, ticketStats, type Filters } from './lib/tickets';
import { useTickets } from './store/useTickets';
import { Sidebar, type View } from './components/Sidebar';
import { Stats } from './components/Stats';
import { TicketList } from './components/TicketList';
import { TicketDetails, NewTicketDialog } from './components/TicketDialogs';

export default function App() {
  const tickets = useTickets((s) => s.tickets);
  const phase = useTickets((s) => s.phase);
  const load = useTickets((s) => s.load);
  const notice = useTickets((s) => s.notice);
  const clearNotice = useTickets((s) => s.clearNotice);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<View>('Overview');
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!notice || notice.kind === 'error') return;
    const timer = window.setTimeout(clearNotice, 4500);
    return () => window.clearTimeout(timer);
  }, [notice, clearNotice]);
  const counts = ticketStats(tickets);
  const filtered = filterTickets(tickets, filters);
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const currentPage = Math.min(page, pages);
  const updateFilters = (values: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...values }));
    setPage(1);
    if (values.status) setView('Overview');
  };
  const currentTicket = tickets.find((ticket) => ticket.id === selected);

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to tickets
      </a>
      <Sidebar
        view={view}
        counts={counts}
        onNavigate={(nextView, status) => {
          setView(nextView);
          setFilters({ ...defaultFilters, status });
          setPage(1);
        }}
      />
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <span className="mobile-brand">
              <Headphones size={20} />
              resolve.
            </span>
            <span className="desktop-crumb">Workspace</span>
            <ChevronRight size={14} />
            <strong>{view === 'In Progress' ? 'In progress' : view}</strong>
          </div>
          <div className="flex items-center gap-3">
            <span className="team-label">
              <span className="online-dot" />
              Support workspace
            </span>
            <span className="avatar small-avatar" title="Jamie Davis">
              JD
            </span>
          </div>
        </header>
        <main id="main-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">A LITTLE CLARITY, EVERY DAY</div>
              <h1>
                {view === 'Overview'
                  ? 'Support overview'
                  : view === 'In Progress'
                    ? 'In progress'
                    : view}
                <span className="heading-dot">.</span>
              </h1>
              <p>Keep track of every conversation, all in one place.</p>
            </div>
            <button
              className="primary-button"
              onClick={() => setCreating(true)}
              disabled={phase !== 'ready'}
            >
              <Plus size={17} />
              New ticket
            </button>
          </div>
          <Stats
            counts={counts}
            loading={phase !== 'ready'}
            onSelect={(status) => updateFilters({ status })}
          />
          <TicketList
            tickets={filtered.slice((currentPage - 1) * 8, currentPage * 8)}
            total={tickets.length}
            filters={filters}
            count={filtered.length}
            page={currentPage}
            pages={pages}
            onFilter={updateFilters}
            onClear={() => {
              setFilters(defaultFilters);
              setPage(1);
              setView('Overview');
            }}
            onPage={setPage}
            onOpen={setSelected}
          />
          <footer className="page-footer">
            <span>
              <MessageSquare size={14} />
              Behind every ticket is a person. You’ve got this.
            </span>
            <span>Made for better conversations</span>
          </footer>
        </main>
      </div>
      {currentTicket && (
        <TicketDetails
          key={currentTicket.id}
          ticket={currentTicket}
          onClose={() => setSelected(null)}
        />
      )}
      {creating && (
        <NewTicketDialog
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            setFilters(defaultFilters);
            setPage(1);
          }}
        />
      )}
      {notice && (
        <div className={`toast ${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
          {notice.kind === 'success' && <Check size={17} />}
          <span>{notice.message}</span>
          <button aria-label="Dismiss notification" onClick={clearNotice}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

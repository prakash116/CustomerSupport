import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  Building2,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  Mail,
  MessageSquare,
  Plus,
  Send,
  X,
} from 'lucide-react';
import { fullDate } from '../lib/tickets';
import { PRIORITIES, type NewTicket, type Ticket } from '../types';
import { useTickets } from '../store/useTickets';
import { Avatar, PriorityBadge, StatusSelect } from './Badges';

function Dialog({
  children,
  onClose,
  className,
  titleId,
}: {
  children: ReactNode;
  onClose: () => void;
  className: string;
  titleId: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={className}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      {children}
    </dialog>
  );
}

export function TicketDetails({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  const updateStatus = useTickets((s) => s.updateStatus);
  const reply = useTickets((s) => s.reply);
  const pending = useTickets((s) => s.pending.includes(ticket.id));
  const notice = useTickets((s) => s.notice);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!body.trim() || pending) return;
    setError(null);
    try {
      await reply(ticket.id, body);
      setBody('');
      window.setTimeout(
        () => messagesEnd.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }),
        50,
      );
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Your reply could not be saved. Please try again.',
      );
    }
  };
  return (
    <Dialog className="detail-dialog" titleId="ticket-title" onClose={onClose}>
      <div className="dialog-topbar">
        <span>
          <MessageSquare size={15} />
          Ticket details
          <ChevronRight size={13} />
          <strong>#{ticket.id}</strong>
        </span>
        <button className="icon-button" aria-label="Close ticket details" onClick={onClose}>
          <X size={19} />
        </button>
      </div>
      <div className="detail-content">
        <div className="detail-heading">
          <span className="category-label">{ticket.category}</span>
          <h2 id="ticket-title">{ticket.subject}</h2>
          <div className="detail-badges">
            <StatusSelect
              label="Ticket status"
              status={ticket.status}
              disabled={pending}
              onChange={(status) => void updateStatus(ticket.id, status)}
            />
            <PriorityBadge priority={ticket.priority} />
            <span className="ticket-reference">#{ticket.id}</span>
          </div>
        </div>
        {notice?.kind === 'error' && (
          <p role="alert" className="form-error">
            {notice.message}
          </p>
        )}
        <section className="customer-card" aria-label="Customer information">
          <div className="customer-summary">
            <Avatar name={ticket.customer.name} large />
            <div>
              <strong>{ticket.customer.name}</strong>
              <span>Customer</span>
            </div>
          </div>
          <div className="customer-info">
            <span>
              <Mail size={14} />
              {ticket.customer.email}
            </span>
            <span>
              <Building2 size={14} />
              {ticket.customer.company}
            </span>
          </div>
        </section>
        <div className="created-detail">
          <CalendarDays size={14} />
          Created <time dateTime={ticket.createdAt}>{fullDate(ticket.createdAt)}</time>
        </div>
        <div className="conversation-heading">
          <h3>Conversation</h3>
          <span>
            {ticket.messages.length} {ticket.messages.length === 1 ? 'message' : 'messages'}
          </span>
        </div>
        <div className="conversation">
          {ticket.messages.map((message) => (
            <article className={`message message-${message.role}`} key={message.id}>
              <div className="message-header">
                <Avatar name={message.author} />
                <div>
                  <strong>
                    {message.author}
                    {message.role === 'agent' && <span className="agent-label">Support</span>}
                  </strong>
                  <time dateTime={message.createdAt}>{fullDate(message.createdAt)}</time>
                </div>
              </div>
              <p>{message.body}</p>
            </article>
          ))}
          <div ref={messagesEnd} />
        </div>
        {ticket.status === 'Resolved' && (
          <div className="resolved-note">
            <CheckCheck size={16} />
            <span>This ticket is resolved. You can reopen it using the status menu.</span>
          </div>
        )}
        <form className="reply-form" onSubmit={submit}>
          <label htmlFor="reply">Add to the conversation</label>
          <textarea
            id="reply"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write a thoughtful reply…"
            rows={4}
            maxLength={5000}
            required
            disabled={pending}
          />
          <div className="reply-footer">
            <span>Demo replies are saved locally.</span>
            <button className="primary-button" type="submit" disabled={pending || !body.trim()}>
              <Send size={14} />
              {pending ? 'Saving…' : 'Save reply'}
            </button>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
    </Dialog>
  );
}

export function NewTicketDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const createTicket = useTickets((s) => s.createTicket);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const fields = new FormData(event.currentTarget);
    const input: NewTicket = {
      name: String(fields.get('name')).trim(),
      email: String(fields.get('email')).trim(),
      subject: String(fields.get('subject')).trim(),
      description: String(fields.get('description')).trim(),
      priority: fields.get('priority') as NewTicket['priority'],
    };
    if (!input.name || !input.subject || !input.description) {
      setError('Please fill in all fields. Spaces alone don’t count.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createTicket(input);
      onCreated();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'Could not create this ticket. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog
      className="create-dialog"
      titleId="create-title"
      onClose={() => {
        if (!saving) onClose();
      }}
    >
      <div className="dialog-topbar">
        <span>
          <Plus size={16} />A new conversation
        </span>
        <button
          className="icon-button"
          aria-label="Close new ticket"
          onClick={onClose}
          disabled={saving}
        >
          <X size={18} />
        </button>
      </div>
      <form onSubmit={submit} className="create-form">
        <h2 id="create-title">Let’s get it sorted.</h2>
        <p>Add a few details and we’ll take it from here.</p>
        <div className="form-grid">
          <label>
            Customer name
            <input
              name="name"
              placeholder="e.g. Olivia Rhye"
              required
              maxLength={80}
              disabled={saving}
            />
          </label>
          <label>
            Email address
            <input
              name="email"
              type="email"
              placeholder="olivia@company.com"
              required
              maxLength={160}
              disabled={saving}
            />
          </label>
        </div>
        <label>
          Subject
          <input
            name="subject"
            placeholder="What can we help with?"
            required
            maxLength={150}
            disabled={saving}
          />
        </label>
        <label>
          Issue details
          <textarea
            name="description"
            rows={5}
            placeholder="Tell us what happened and what you’ve already tried…"
            required
            maxLength={5000}
            disabled={saving}
          />
        </label>
        <label>
          Priority
          <select name="priority" defaultValue="Medium" disabled={saving}>
            {PRIORITIES.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="create-footer">
          <button className="secondary-button" type="button" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={saving}>
            <Plus size={16} />
            {saving ? 'Creating…' : 'Create ticket'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

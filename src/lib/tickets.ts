import type { Priority, Status, Ticket } from '../types';
export interface Filters {
  search: string;
  status: Status | 'All';
  priority: Priority | 'All';
  sort: 'newest' | 'oldest';
}
export const defaultFilters: Filters = {
  search: '',
  status: 'All',
  priority: 'All',
  sort: 'newest',
};
export function filterTickets(tickets: Ticket[], filters: Filters) {
  const query = filters.search.trim().toLowerCase();
  return tickets
    .filter(
      (ticket) =>
        (filters.status === 'All' || ticket.status === filters.status) &&
        (filters.priority === 'All' || ticket.priority === filters.priority) &&
        (!query ||
          [ticket.id, ticket.customer.name, ticket.customer.email, ticket.subject].some((value) =>
            value.toLowerCase().includes(query),
          )),
    )
    .sort((a, b) =>
      filters.sort === 'newest'
        ? Date.parse(b.createdAt) - Date.parse(a.createdAt)
        : Date.parse(a.createdAt) - Date.parse(b.createdAt),
    );
}
export function ticketStats(tickets: Ticket[]) {
  return {
    All: tickets.length,
    Open: tickets.filter((t) => t.status === 'Open').length,
    'In Progress': tickets.filter((t) => t.status === 'In Progress').length,
    Resolved: tickets.filter((t) => t.status === 'Resolved').length,
  };
}
export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}
export function shortDate(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(date),
  );
}
export function fullDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
}

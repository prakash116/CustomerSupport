import { describe, expect, it } from 'vitest';
import { createSeedTickets } from '../mocks/data';
import { defaultFilters, filterTickets, ticketStats } from './tickets';

const tickets = createSeedTickets(Date.parse('2026-09-14T10:00:00Z'));
describe('ticket filtering', () => {
  it('searches names, emails, subjects, and IDs without case or whitespace sensitivity', () => {
    for (const search of ['  OLIVIA  ', 'olivia@acme.com', 'access my account', 'tk-1048']) {
      expect(filterTickets(tickets, { ...defaultFilters, search }).map((t) => t.id)).toEqual([
        'TK-1048',
      ]);
    }
  });
  it('combines search, status, and priority rather than treating them separately', () => {
    expect(
      filterTickets(tickets, {
        ...defaultFilters,
        search: 'account',
        priority: 'High',
        status: 'Open',
      }).map((t) => t.id),
    ).toEqual(['TK-1048']);
    expect(
      filterTickets(tickets, { ...defaultFilters, search: 'Olivia', status: 'Resolved' }),
    ).toEqual([]);
  });
  it('sorts chronologically without mutating the input', () => {
    const originalIds = tickets.map((t) => t.id);
    const oldest = filterTickets(tickets, { ...defaultFilters, sort: 'oldest' });
    expect(oldest[0].id).toBe('TK-1025');
    expect(tickets.map((t) => t.id)).toEqual(originalIds);
  });
  it('derives totals from ticket status, including an empty workspace', () => {
    expect(ticketStats(tickets)).toEqual({ All: 24, Open: 10, 'In Progress': 7, Resolved: 7 });
    expect(ticketStats([])).toEqual({ All: 0, Open: 0, 'In Progress': 0, Resolved: 0 });
  });
});

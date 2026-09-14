import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../lib/api';
import { createSeedTickets } from '../mocks/data';
import { useTickets } from './useTickets';
import type { Ticket } from '../types';

vi.mock('../lib/api', () => ({
  api: { list: vi.fn(), updateStatus: vi.fn(), create: vi.fn(), reply: vi.fn() },
}));
beforeEach(() => {
  vi.resetAllMocks();
  useTickets.setState({ tickets: [], phase: 'idle', error: null, notice: null, pending: [] });
});
describe('ticket state', () => {
  it('exposes a fetch error and recovers when the user retries', async () => {
    vi.mocked(api.list)
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockResolvedValueOnce(createSeedTickets());
    await useTickets.getState().load();
    expect(useTickets.getState()).toMatchObject({ phase: 'error', error: 'Network unavailable' });
    await useTickets.getState().load();
    expect(useTickets.getState()).toMatchObject({ phase: 'ready', error: null });
    expect(useTickets.getState().tickets).toHaveLength(24);
  });
  it('updates optimistically, blocks duplicate updates, and rolls back a failed save', async () => {
    const tickets = createSeedTickets();
    useTickets.setState({ tickets, phase: 'ready' });
    let reject!: (error: Error) => void;
    vi.mocked(api.updateStatus).mockImplementation(
      () =>
        new Promise<Ticket>((_, rejectPromise) => {
          reject = rejectPromise;
        }),
    );
    const updating = useTickets.getState().updateStatus(tickets[0].id, 'Resolved');
    expect(useTickets.getState().tickets[0].status).toBe('Resolved');
    expect(useTickets.getState().pending).toContain(tickets[0].id);
    await useTickets.getState().updateStatus(tickets[0].id, 'In Progress');
    expect(api.updateStatus).toHaveBeenCalledTimes(1);
    reject(new Error('Could not save'));
    await updating;
    expect(useTickets.getState().tickets[0].status).toBe('Open');
    expect(useTickets.getState().pending).toEqual([]);
    expect(useTickets.getState().notice?.kind).toBe('error');
  });
  it('keeps an independent successful update when another ticket fails', async () => {
    const tickets = createSeedTickets();
    useTickets.setState({ tickets, phase: 'ready' });
    vi.mocked(api.updateStatus).mockImplementation(async (id) => {
      if (id === tickets[0].id) throw new Error('Save failed');
      return { ...tickets[1], status: 'Resolved' };
    });
    await Promise.all([
      useTickets.getState().updateStatus(tickets[0].id, 'Resolved'),
      useTickets.getState().updateStatus(tickets[1].id, 'Resolved'),
    ]);
    expect(useTickets.getState().tickets[0].status).toBe('Open');
    expect(useTickets.getState().tickets[1].status).toBe('Resolved');
    expect(useTickets.getState().pending).toEqual([]);
  });
  it('keeps conversation intact and unlocks a ticket if saving a reply fails', async () => {
    const tickets = createSeedTickets();
    useTickets.setState({ tickets, phase: 'ready' });
    vi.mocked(api.reply).mockRejectedValue(new Error('Storage full'));
    await expect(useTickets.getState().reply(tickets[0].id, 'Hello')).rejects.toThrow(
      'Storage full',
    );
    expect(useTickets.getState().tickets[0].messages).toEqual(tickets[0].messages);
    expect(useTickets.getState().pending).toEqual([]);
  });
});

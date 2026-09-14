import { create } from 'zustand';
import { api } from '../lib/api';
import type { NewTicket, Status, Ticket } from '../types';

interface TicketState {
  tickets: Ticket[];
  phase: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  pending: string[];
  notice: { message: string; kind: 'success' | 'error' } | null;
  load: () => Promise<void>;
  updateStatus: (id: string, status: Status) => Promise<void>;
  createTicket: (input: NewTicket) => Promise<Ticket>;
  reply: (id: string, body: string) => Promise<void>;
  clearNotice: () => void;
}
const message = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

export const useTickets = create<TicketState>((set, get) => ({
  tickets: [],
  phase: 'idle',
  error: null,
  pending: [],
  notice: null,
  clearNotice: () => set({ notice: null }),
  load: async () => {
    if (get().phase === 'loading') return;
    set({ phase: 'loading', error: null });
    try {
      set({ tickets: await api.list(), phase: 'ready' });
    } catch (error) {
      set({ phase: 'error', error: message(error) });
    }
  },
  updateStatus: async (id, status) => {
    if (get().pending.includes(id)) return;
    const previous = get().tickets.find((t) => t.id === id);
    if (!previous || previous.status === status) return;
    set((state) => ({
      pending: [...state.pending, id],
      tickets: state.tickets.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
    try {
      const updated = await api.updateStatus(id, status);
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
        notice: { message: `${id} marked as ${status.toLowerCase()}.`, kind: 'success' },
      }));
    } catch (error) {
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? previous : t)),
        notice: { message: message(error), kind: 'error' },
      }));
    } finally {
      set((state) => ({ pending: state.pending.filter((value) => value !== id) }));
    }
  },
  createTicket: async (input) => {
    const ticket = await api.create(input);
    set((state) => ({
      tickets: [ticket, ...state.tickets],
      notice: { message: `${ticket.id} created. You’re all set.`, kind: 'success' },
    }));
    return ticket;
  },
  reply: async (id, body) => {
    if (get().pending.includes(id))
      throw new Error('Please wait for the current change to finish.');
    set((state) => ({ pending: [...state.pending, id] }));
    try {
      const ticket = await api.reply(id, body);
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? ticket : t)),
        notice: { message: 'Reply saved to this conversation.', kind: 'success' },
      }));
    } finally {
      set((state) => ({ pending: state.pending.filter((value) => value !== id) }));
    }
  },
}));

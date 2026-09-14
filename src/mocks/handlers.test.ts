import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers, STORAGE_KEY } from './handlers';
import type { Ticket } from '../types';

const values = new Map<string, string>();
const server = setupServer(...handlers);
const base = 'http://localhost/api/tickets';
beforeAll(() => {
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  });
  server.listen({ onUnhandledRequest: 'error' });
});
afterAll(() => {
  server.close();
  vi.unstubAllGlobals();
});

describe('mock REST API', () => {
  it('fetches seeded tickets and saves the seed to local storage', async () => {
    const response = await fetch(base);
    expect(response.status).toBe(200);
    expect(await response.json()).toHaveLength(24);
    expect(values.has(STORAGE_KEY)).toBe(true);
  });
  it('persists status changes and rejects unsupported status values', async () => {
    const response = await fetch(`${base}/TK-1048`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'Resolved' }),
    });
    expect((await response.json()).status).toBe('Resolved');
    const stored: Ticket[] = JSON.parse(values.get(STORAGE_KEY)!);
    expect(stored.find((t) => t.id === 'TK-1048')?.status).toBe('Resolved');
    const invalid = await fetch(`${base}/TK-1048`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'Deleted' }),
    });
    expect(invalid.status).toBe(400);
  });
  it('creates a ticket with a first message and appends an agent reply', async () => {
    const response = await fetch(base, {
      method: 'POST',
      body: JSON.stringify({
        name: 'Alex Rivera',
        email: 'alex@example.com',
        subject: 'Please check my export',
        description: 'The export is incomplete.',
        priority: 'Medium',
      }),
    });
    expect(response.status).toBe(201);
    const ticket = (await response.json()) as Ticket;
    expect(ticket.status).toBe('Open');
    expect(ticket.messages).toHaveLength(1);
    const reply = await fetch(`${base}/${ticket.id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body: '  I am checking this now.  ' }),
    });
    const updated = (await reply.json()) as Ticket;
    expect(updated.messages).toHaveLength(2);
    expect(updated.messages[1]).toMatchObject({ role: 'agent', body: 'I am checking this now.' });
  });
  it('returns useful errors for invalid input and missing tickets', async () => {
    const invalid = await fetch(base, {
      method: 'POST',
      body: JSON.stringify({ name: ' ', email: 'bad', priority: 'High' }),
    });
    expect(invalid.status).toBe(400);
    const missing = await fetch(`${base}/TK-missing`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'Open' }),
    });
    expect(missing.status).toBe(404);
  });
});

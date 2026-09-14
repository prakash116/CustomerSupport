import { delay, http, HttpResponse } from 'msw';
import { createSeedTickets } from './data';
import { PRIORITIES, STATUSES, type NewTicket, type Status, type Ticket } from '../types';

export const STORAGE_KEY = 'resolve-tickets-v1';
let memory: Ticket[] | null = null;

function readTickets(): Ticket[] {
  if (memory) return memory;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed: unknown = JSON.parse(saved);
      if (
        !Array.isArray(parsed) ||
        !parsed.every(
          (t) =>
            t &&
            typeof t.id === 'string' &&
            typeof t.subject === 'string' &&
            typeof t.customer?.name === 'string' &&
            typeof t.customer?.email === 'string' &&
            STATUSES.includes(t.status) &&
            PRIORITIES.includes(t.priority) &&
            Number.isFinite(Date.parse(t.createdAt)) &&
            Array.isArray(t.messages),
        )
      ) {
        throw new Error('Invalid saved ticket data');
      }
      memory = parsed as Ticket[];
    } catch {
      throw new Error(
        'Saved tickets could not be read. Clear the resolve-tickets-v1 entry in your browser storage to restore the sample tickets.',
      );
    }
  } else {
    const seed = createSeedTickets();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    memory = seed;
  }
  return memory;
}

function saveTickets(tickets: Ticket[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  memory = tickets;
}

function failure(error: unknown) {
  return HttpResponse.json(
    { message: error instanceof Error ? error.message : 'Could not save your changes.' },
    { status: 500 },
  );
}

export const handlers = [
  http.get('*/api/tickets', async () => {
    await delay(450);
    try {
      return HttpResponse.json(readTickets());
    } catch (error) {
      return failure(error);
    }
  }),
  http.patch('*/api/tickets/:id', async ({ params, request }) => {
    await delay(250);
    try {
      const { status } = (await request.json()) as { status: Status };
      if (!STATUSES.includes(status))
        return HttpResponse.json({ message: 'Choose a valid status.' }, { status: 400 });
      const tickets = readTickets();
      const ticket = tickets.find((t) => t.id === params.id);
      if (!ticket) return HttpResponse.json({ message: 'Ticket not found.' }, { status: 404 });
      const updated = { ...ticket, status };
      saveTickets(tickets.map((t) => (t.id === ticket.id ? updated : t)));
      return HttpResponse.json(updated);
    } catch (error) {
      return failure(error);
    }
  }),
  http.post('*/api/tickets', async ({ request }) => {
    await delay(350);
    try {
      const input = (await request.json()) as NewTicket;
      if (
        ![input.name, input.email, input.subject, input.description].every(
          (value) => typeof value === 'string' && value.trim(),
        ) ||
        !PRIORITIES.includes(input.priority) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)
      ) {
        return HttpResponse.json(
          { message: 'Please complete all fields and enter a valid email address.' },
          { status: 400 },
        );
      }
      const tickets = readTickets();
      const createdAt = new Date().toISOString();
      const id = `TK-${Math.max(1048, ...tickets.map((t) => Number(t.id.replace('TK-', '')) || 0)) + 1}`;
      const ticket: Ticket = {
        id,
        customer: { name: input.name.trim(), email: input.email.trim(), company: 'Not specified' },
        subject: input.subject.trim(),
        description: input.description.trim(),
        category: 'General',
        status: 'Open',
        priority: input.priority,
        createdAt,
        messages: [
          {
            id: crypto.randomUUID(),
            role: 'customer',
            author: input.name.trim(),
            body: input.description.trim(),
            createdAt,
          },
        ],
      };
      saveTickets([ticket, ...tickets]);
      return HttpResponse.json(ticket, { status: 201 });
    } catch (error) {
      return failure(error);
    }
  }),
  http.post('*/api/tickets/:id/messages', async ({ params, request }) => {
    await delay(300);
    try {
      const { body } = (await request.json()) as { body: string };
      if (typeof body !== 'string' || !body.trim() || body.length > 5000)
        return HttpResponse.json(
          { message: 'Write a message between 1 and 5,000 characters.' },
          { status: 400 },
        );
      const tickets = readTickets();
      const ticket = tickets.find((t) => t.id === params.id);
      if (!ticket) return HttpResponse.json({ message: 'Ticket not found.' }, { status: 404 });
      const updated: Ticket = {
        ...ticket,
        messages: [
          ...ticket.messages,
          {
            id: crypto.randomUUID(),
            author: 'Jamie Davis',
            role: 'agent',
            body: body.trim(),
            createdAt: new Date().toISOString(),
          },
        ],
      };
      saveTickets(tickets.map((t) => (t.id === ticket.id ? updated : t)));
      return HttpResponse.json(updated);
    } catch (error) {
      return failure(error);
    }
  }),
];

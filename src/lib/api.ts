import type { NewTicket, Status, Ticket } from '../types';

const base = `${import.meta.env.BASE_URL}api/tickets`;
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `The request failed (${response.status}). Please try again.`);
  }
  return response.json() as Promise<T>;
}
export const api = {
  list: () => request<Ticket[]>(base),
  updateStatus: (id: string, status: Status) =>
    request<Ticket>(`${base}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  create: (input: NewTicket) =>
    request<Ticket>(base, { method: 'POST', body: JSON.stringify(input) }),
  reply: (id: string, body: string) =>
    request<Ticket>(`${base}/${encodeURIComponent(id)}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),
};

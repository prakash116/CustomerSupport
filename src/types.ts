export const STATUSES = ['Open', 'In Progress', 'Resolved'] as const;
export const PRIORITIES = ['Low', 'Medium', 'High'] as const;
export type Status = (typeof STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];
export interface Message {
  id: string;
  author: string;
  role: 'customer' | 'agent';
  body: string;
  createdAt: string;
}
export interface Ticket {
  id: string;
  customer: { name: string; email: string; company: string };
  subject: string;
  description: string;
  category: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  messages: Message[];
}
export interface NewTicket {
  name: string;
  email: string;
  subject: string;
  description: string;
  priority: Priority;
}

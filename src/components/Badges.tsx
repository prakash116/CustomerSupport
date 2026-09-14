import { ChevronDown } from 'lucide-react';
import { initials } from '../lib/tickets';
import { STATUSES, type Priority, type Status } from '../types';

export function Avatar({ name, large = false }: { name: string; large?: boolean }) {
  const tone = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 6;
  return (
    <span aria-hidden="true" className={`avatar avatar-${tone} ${large ? 'avatar-large' : ''}`}>
      {initials(name)}
    </span>
  );
}
export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`priority priority-${priority.toLowerCase()}`}>
      <span aria-hidden="true" className="priority-bars">
        <i />
        <i />
        <i />
      </span>
      {priority}
    </span>
  );
}
export function StatusSelect({
  status,
  onChange,
  label,
  disabled = false,
}: {
  status: Status;
  onChange: (status: Status) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <span className={`status status-${status.toLowerCase().replace(' ', '-')}`}>
      <span className="status-dot" />
      <select
        aria-label={label}
        value={status}
        onChange={(e) => onChange(e.target.value as Status)}
        disabled={disabled}
      >
        {STATUSES.map((value) => (
          <option value={value} key={value}>
            {value}
          </option>
        ))}
      </select>
      <ChevronDown size={12} aria-hidden="true" />
    </span>
  );
}

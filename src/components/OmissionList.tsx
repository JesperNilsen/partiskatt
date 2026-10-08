import type { Omission } from '../config/omissions.ts';

export function OmissionList({ items }: { items: readonly Omission[] }) {
  return (
    <ul className="omission-list">
      {items.map((o) => (
        <li key={o.id}>
          <strong>{o.label}.</strong> {o.caveat}
        </li>
      ))}
    </ul>
  );
}

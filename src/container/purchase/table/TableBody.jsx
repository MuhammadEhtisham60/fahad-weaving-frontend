import { StatusBadge, pkr } from "../../../components/ui-kit.jsx";
import { PURCHASE_STATUSES } from "../utils/constants.js";
import { getBalance } from "../utils/helpers.js";

export function TableBody({ rows, onUpdateStatus, onSelect }) {
  return (
    <tbody>
      {rows.map((p) => {
        const balance = getBalance(p);
        return (
          <tr
            key={p.id}
            onClick={() => onSelect?.(p)}
            className="border-t border-border hover:bg-muted/30 transition-smooth whitespace-nowrap cursor-pointer"
          >
            <td className="px-5 py-3 font-mono font-semibold">{p.id}</td>
            <td className="px-5 py-3">{p.vendor}</td>
            <td className="px-5 py-3 text-muted-foreground" title={p.material}>
              {p.material}
            </td>
            <td className="px-5 py-3 text-muted-foreground">{p.date}</td>
            <td className="px-5 py-3 text-right whitespace-nowrap">
              {p.quantity} {p.unit}
            </td>
            <td className="px-5 py-3 text-right font-semibold">{pkr(p.total)}</td>
            <td className="px-5 py-3 text-right text-success">{pkr(p.paid)}</td>
            <td className="px-5 py-3 text-right text-destructive">{balance > 0 ? pkr(balance) : "—"}</td>
            <td className="px-5 py-3">
              <StatusBadge status={p.status} />
            </td>
            <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
              <select
                value={p.status}
                onChange={(e) => onUpdateStatus(p.id, e.target.value)}
                className="h-9 min-w-[8.5rem] px-2 rounded-lg bg-muted border border-transparent text-xs font-semibold focus:bg-background focus:border-ring outline-none cursor-pointer"
                aria-label={`Change status for ${p.id}`}
              >
                {PURCHASE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}

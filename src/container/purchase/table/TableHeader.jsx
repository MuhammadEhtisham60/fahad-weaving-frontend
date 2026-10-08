import { tableColumns } from "../utils/content.js";

export function TableHeader() {
  return (
    <thead className="bg-muted/40 text-xs uppercase text-muted-foreground tracking-wider whitespace-nowrap">
      <tr>
        {tableColumns.map((col) => (
          <th
            key={col.key}
            className={`${col.align === "right" ? "text-right" : "text-left"} px-5 py-3`}
            style={{ minWidth: col.minWidth }}
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

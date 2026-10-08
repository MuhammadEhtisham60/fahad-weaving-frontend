import { Card, SectionTitle } from "../../../components/ui-kit.jsx";
import { pageContent } from "../utils/content.js";
import { TableHeader } from "./TableHeader.jsx";
import { TableBody } from "./TableBody.jsx";

export function PurchaseTable({ rows, onUpdateStatus, onSelect }) {
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="p-5 border-b border-border">
        <SectionTitle title={pageContent.tableTitle} />
      </div>
      <div className="w-full max-w-full overflow-x-auto scrollbar-custom overscroll-x-contain">
        <table className="w-max min-w-full text-sm">
          <TableHeader />
          <TableBody rows={rows} onUpdateStatus={onUpdateStatus} onSelect={onSelect} />
        </table>
      </div>
    </Card>
  );
}

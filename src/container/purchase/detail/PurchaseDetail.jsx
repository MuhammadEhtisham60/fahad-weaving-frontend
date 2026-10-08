import { useState } from "react";
import { X, Eye, FileDown } from "lucide-react";
import { Card, StatusBadge, Button, pkr } from "../../../components/ui-kit.jsx";
import { detailContent } from "../utils/content.js";
import { getBalance } from "../utils/helpers.js";
import { downloadPurchaseOrderPdf } from "../utils/purchaseDocument.js";
import { PurchaseViewModal } from "./PurchaseViewModal.jsx";

export function PurchaseDetail({ purchase, onClose }) {
  const { title, empty, fields, view, downloadPdf } = detailContent;
  const [viewOpen, setViewOpen] = useState(false);

  if (!purchase) {
    return (
      <Card className="h-full min-h-[12rem] flex items-center justify-center text-sm text-muted-foreground text-center px-6">
        {empty}
      </Card>
    );
  }

  const balance = getBalance(purchase);
  const rows = [
    { label: fields.po, value: purchase.id, mono: true },
    { label: fields.vendor, value: purchase.vendor },
    { label: fields.material, value: purchase.material },
    { label: fields.date, value: purchase.date },
    { label: fields.quantity, value: `${purchase.quantity} ${purchase.unit}` },
    { label: fields.total, value: pkr(purchase.total), bold: true },
    { label: fields.paid, value: pkr(purchase.paid), success: true },
    { label: fields.balance, value: balance > 0 ? pkr(balance) : "—", danger: balance > 0 },
    { label: fields.status, badge: purchase.status },
    ...(purchase.notes ? [{ label: fields.notes, value: purchase.notes }] : []),
  ];

  return (
    <>
      <Card className="relative">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 px-2.5"
              onClick={() => setViewOpen(true)}
              title={view}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 px-2.5"
              onClick={() => downloadPurchaseOrderPdf(purchase)}
              title={downloadPdf}
            >
              <FileDown className="h-4 w-4" />
            </Button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
                aria-label="Close details"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <dl className="space-y-3 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0">
              <dt className="text-muted-foreground shrink-0">{row.label}</dt>
              <dd className="text-right font-medium">
                {row.badge ? (
                  <StatusBadge status={row.badge} />
                ) : (
                  <span
                    className={[
                      row.mono && "font-mono",
                      row.bold && "font-semibold",
                      row.success && "text-success",
                      row.danger && "text-destructive",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {row.value}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      {viewOpen && <PurchaseViewModal purchase={purchase} onClose={() => setViewOpen(false)} />}
    </>
  );
}

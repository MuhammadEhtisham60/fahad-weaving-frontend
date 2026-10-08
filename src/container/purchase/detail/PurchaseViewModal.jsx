import { X, Download, Printer, FileText } from "lucide-react";
import { Button } from "../../../components/ui-kit.jsx";
import { viewModalContent } from "../utils/content.js";
import { downloadPurchaseOrderPdf, printPurchaseOrder } from "../utils/purchaseDocument.js";
import { PurchaseOrderDocument } from "./PurchaseOrderDocument.jsx";

export function PurchaseViewModal({ purchase, onClose }) {
  if (!purchase) return null;

  const { title, subtitle } = viewModalContent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-elegant overflow-hidden max-h-[92vh] flex flex-col">
        <div className="bg-gradient-primary px-6 py-4 text-primary-foreground shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{title}</h2>
                <p className="text-sm text-white/80">
                  {subtitle} · {purchase.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => downloadPurchaseOrderPdf(purchase)}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => printPurchaseOrder(purchase)}
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-smooth"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto bg-muted/30">
          <PurchaseOrderDocument purchase={purchase} />
        </div>
      </div>
    </div>
  );
}

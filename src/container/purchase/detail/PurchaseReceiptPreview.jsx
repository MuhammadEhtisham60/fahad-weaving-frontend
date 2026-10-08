import { buildPurchaseReceiptHtml, receiptStyles } from "../utils/receiptTemplate.js";

export function PurchaseReceiptPreview({ purchase }) {
  const html = buildPurchaseReceiptHtml(purchase, { fullDocument: false });

  return (
    <div className="purchase-receipt-preview rounded-lg overflow-hidden border border-border shadow-sm">
      <style>{receiptStyles}</style>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

import { PurchaseReceiptPreview } from "./PurchaseReceiptPreview.jsx";

export function PurchaseOrderDocument({ purchase }) {
  return <PurchaseReceiptPreview purchase={purchase} />;
}

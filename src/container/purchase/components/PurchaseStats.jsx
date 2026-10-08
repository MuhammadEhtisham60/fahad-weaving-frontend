import { ShoppingCart, Truck, Receipt } from "lucide-react";
import { StatCard, pkr } from "../../../components/ui-kit.jsx";
import { statLabels } from "../utils/content.js";

export function PurchaseStats({ total, paidSum, outstanding, pendingCount }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label={statLabels.total} value={pkr(total)} icon={ShoppingCart} gradient="primary" />
      <StatCard label={statLabels.paid} value={pkr(paidSum)} icon={Receipt} gradient="success" />
      <StatCard label={statLabels.outstanding} value={pkr(outstanding)} icon={Receipt} gradient="warning" />
      <StatCard label={statLabels.pending} value={pendingCount} icon={Truck} gradient="info" />
    </div>
  );
}

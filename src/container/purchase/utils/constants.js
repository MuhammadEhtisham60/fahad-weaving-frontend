export { PURCHASE_STATUSES, yarnVendors, purchases as initialPurchases } from "../../../lib/mock-data.js";

export const PURCHASE_UNITS = ["kg", "bag", "cone", "bale"];

export const INPUT_CLASS =
  "w-full h-10 px-3 rounded-lg bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-sm";

export function createEmptyPurchaseForm(vendor) {
  return {
    vendor: vendor ?? "",
    material: "Cotton Yarn 30s",
    quantity: "",
    unit: "kg",
    total: "",
    paid: "",
    status: "Pending",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  };
}

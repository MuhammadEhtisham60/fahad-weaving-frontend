export function nextPoId(rows) {
  const nums = rows.map((p) => parseInt(p.id.replace(/\D/g, ""), 10)).filter(Boolean);
  const next = (nums.length ? Math.max(...nums) : 2400) + 1;
  return `PO-${next}`;
}

export function getBalance(row) {
  return row.total - row.paid;
}

export function paidForStatus(status, total, paid) {
  if (status === "Paid" || status === "Received") return total;
  if (status === "Pending" || status === "Ordered" || status === "On Credit" || status === "Cancelled") return 0;
  if (status === "Partial") return Math.min(paid, total);
  return paid;
}

export function computePurchaseStats(rows) {
  const total = rows.reduce((s, p) => s + p.total, 0);
  const paidSum = rows.reduce((s, p) => s + p.paid, 0);
  const pendingCount = rows.filter((p) => p.status === "Pending" || p.status === "Ordered").length;
  return { total, paidSum, outstanding: total - paidSum, pendingCount };
}

export function normalizeFormSubmit(form) {
  const quantity = Number(form.quantity) || 0;
  const total = Number(form.total) || 0;
  let paid = Number(form.paid) || 0;
  let status = form.status;

  if (status === "Paid") paid = total;
  if (status === "Pending" || status === "Ordered" || status === "On Credit") paid = Math.min(paid, total);
  if (status === "Partial" && paid >= total) status = "Paid";
  if (status === "Partial" && paid <= 0) status = "Pending";

  return {
    vendor: form.vendor,
    material: form.material.trim() || "Yarn / raw material",
    quantity,
    unit: form.unit,
    total,
    paid,
    status,
    date: form.date,
    notes: form.notes.trim(),
  };
}

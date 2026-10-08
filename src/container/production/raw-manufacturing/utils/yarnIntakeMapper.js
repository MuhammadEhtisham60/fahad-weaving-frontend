// Translates between the Yarn Intake API contract (YARN_SIZING_BEAM_WORKFLOW_API_SPEC.md §4.1)
// and the row shape already consumed by RawMaterialTable / RawMaterialDetailModal / Sizing forms.

const KG_TO_LB = 2.20462262;

const pick = (obj, ...keys) => {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
  }
  return undefined;
};

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function deriveStatus(bags, remainingBags, apiStatus) {
  if (apiStatus) return apiStatus;
  if (bags > 0 && remainingBags === 0) return "Fully Sent to Sizing";
  if (remainingBags < bags) return "Partially Sent to Sizing";
  return "Available";
}

/** API record (camelCase or snake_case) → table row */
export function mapYarnIntakeToRow(api) {
  if (!api) return null;

  const bags = toNum(pick(api, "bags"));
  const conesPerBag = toNum(pick(api, "conesPerBag", "cones_per_bag"));
  const weightPerBagKg = toNum(pick(api, "weightPerBagKg", "weight_per_bag_kg"));
  const ratePerBag = toNum(pick(api, "ratePerBag", "rate_per_bag"));

  const netWeightKg = toNum(pick(api, "netWeightKg", "net_weight_kg")) || bags * weightPerBagKg;
  const netWeightLb =
    toNum(pick(api, "netWeightLb", "net_weight_lb")) || Number((netWeightKg * KG_TO_LB).toFixed(2));

  const remainingRaw = pick(api, "remainingBags", "remaining_bags");
  const remainingBags = remainingRaw === undefined ? bags : toNum(remainingRaw);
  const bagsSent = Math.max(0, bags - remainingBags);
  const weightSent = bags > 0 ? Number(((bagsSent / bags) * netWeightLb).toFixed(2)) : 0;

  const supplierDetail = pick(api, "supplierDetail", "supplier_detail");
  const supplierRaw = pick(api, "supplier");
  const supplierId =
    typeof supplierRaw === "object" && supplierRaw !== null ? supplierRaw.id : supplierRaw;
  const supplierName =
    pick(api, "supplierName", "supplier_name") ||
    pick(supplierDetail, "supplierName", "supplier_name", "companyName", "company_name") ||
    (typeof supplierRaw === "object" ? pick(supplierRaw, "supplierName", "supplier_name") : undefined) ||
    (supplierId !== undefined ? `Supplier #${supplierId}` : "");

  const setNo = pick(api, "setNo", "set_no") || "";

  return {
    id: api.id,
    entryNo: pick(api, "entryNo", "entry_no", "intakeNo", "intake_no") || `YI-${api.id}`,
    date: pick(api, "intakeDate", "intake_date") || "",
    name: pick(api, "yarnName", "yarn_name") || "",
    yarnType: pick(api, "yarnType", "yarn_type") || "",
    count: pick(api, "yarnCount", "yarn_count") || "",
    setNo,
    lotNo: setNo,
    supplier: supplierName,
    supplierId,
    productionType: ratePerBag > 0 ? "Self" : "Conversion",
    bags,
    boxes: conesPerBag,
    conesPerBag,
    totalCones: bags * conesPerBag,
    weightPerBagKg,
    ratePerBag,
    totalAmount: toNum(pick(api, "totalRate", "total_rate")) || bags * ratePerBag,
    netWeightKg,
    netWeight: netWeightLb,
    unit: "lb",
    bagsSent,
    weightSent,
    availableBags: remainingBags,
    availableWeight: Math.max(0, Number((netWeightLb - weightSent).toFixed(2))),
    status: deriveStatus(bags, remainingBags, pick(api, "status")),
    notes: pick(api, "notes") || "",
  };
}

/** Normalises list responses: { results }, { data: { results } }, { data: [] } or [] */
export function normalizeYarnIntakeList(response) {
  const body = response?.data && !Array.isArray(response.data) ? response.data : response;
  const list = Array.isArray(body) ? body : body?.results ?? (Array.isArray(response?.data) ? response.data : []);
  return {
    rows: list.map(mapYarnIntakeToRow).filter(Boolean),
    count: body?.count ?? list.length,
    totalPages: body?.totalPages ?? body?.total_pages ?? 1,
    currentPage: body?.currentPage ?? body?.current_page ?? 1,
  };
}

/** Form state → exact POST/PUT body from spec §4.1 */
export function buildYarnIntakePayload(form) {
  const isConversion = form.productionType === "Conversion";
  return {
    yarnName: form.yarnName.trim(),
    yarnType: form.yarnType,
    yarnCount: form.yarnCount,
    setNo: form.setNo.trim(),
    supplier: Number(form.supplier),
    bags: Number(form.bags),
    conesPerBag: Number(form.conesPerBag) || 0,
    weightPerBagKg: Number(form.weightPerBagKg).toFixed(3),
    ratePerBag: (isConversion ? 0 : Number(form.ratePerBag) || 0).toFixed(2),
    intakeDate: form.intakeDate,
    notes: form.notes?.trim() || "",
  };
}

/** Client-side validation mirroring the spec's required fields */
export function validateYarnIntakeForm(form) {
  if (!form.yarnName?.trim()) return "Yarn name is required.";
  if (!form.yarnType) return "Yarn type is required.";
  if (!form.yarnCount) return "Yarn count is required.";
  if (!form.supplier) return "Please select a supplier.";
  if (!form.intakeDate) return "Intake date is required.";
  if (!Number.isInteger(Number(form.bags)) || Number(form.bags) <= 0)
    return "Bags must be a whole number greater than zero.";
  if (Number(form.conesPerBag) < 0) return "Cones per bag cannot be negative.";
  if (!(Number(form.weightPerBagKg) > 0)) return "Weight per bag (KG) must be greater than zero.";
  if (form.productionType !== "Conversion" && Number(form.ratePerBag) < 0)
    return "Rate per bag cannot be negative.";
  return "";
}

export { KG_TO_LB };

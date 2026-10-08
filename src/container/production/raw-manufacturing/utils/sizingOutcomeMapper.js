// Translates between the Sizing Outcome and Yarn Outcome Sizing dispatches API contracts
// and the shape consumed by SizingTable / SizingDetailModal / BeamLoading modals.

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

function deriveSizingStatus(api) {
  const customStatus = pick(api, "status");
  if (customStatus === "In Sizing") return "In Sizing";

  // If this is a yarn outcome without sizing outcome submitted yet
  const isYarnOutcome = Boolean(pick(api, "outcomeType", "outcome_type") === "Sizing" && !pick(api, "sizingOutcome", "sizing_outcome"));
  if (isYarnOutcome) {
    return "In Sizing";
  }

  const beamAssignments = pick(api, "beamAssignments", "beam_assignments") || [];
  const totalBeams = toNum(pick(api, "totalBeams", "total_beams")) || beamAssignments.length;

  if (totalBeams > 0) {
    const hasInProduction = beamAssignments.some(
      (b) => b.status === "In Production" || b.status === "Loaded" || b.status === "IN_USE"
    );
    if (hasInProduction) return "Loaded onto Beams";
    return "Received";
  }

  return customStatus === "Completed" || customStatus === "In Production" ? customStatus : "Received";
}

/** API record (camelCase or snake_case) → table / modal row */
export function mapSizingOutcomeToRow(api) {
  if (!api) return null;

  const isYarnOutcomeRecord = pick(api, "outcomeType", "outcome_type") === "Sizing";
  const sizingOutcomeSub = pick(api, "sizingOutcome", "sizing_outcome");
  const yarnIntakeDetail = pick(api, "yarnIntakeDetail", "yarn_intake_detail");
  const sizingDetail = pick(api, "sizingDetail", "sizing_detail");

  const sizingRaw = pick(api, "sizing", "sizingId", "sizing_id");
  const sizingId =
    typeof sizingRaw === "object" && sizingRaw !== null ? sizingRaw.id : sizingRaw;

  const sizingName =
    pick(api, "sizingName", "sizing_name") ||
    pick(sizingDetail, "sizingName", "sizing_name", "name") ||
    (typeof sizingRaw === "object" ? pick(sizingRaw, "sizingName", "sizing_name") : undefined) ||
    (sizingId ? `Sizing Unit #${sizingId}` : "Sizing Facility");

  const yarnIntakeId =
    pick(yarnIntakeDetail, "id") ||
    pick(api, "yarnIntakeId", "yarn_intake_id", "yarnIntake", "yarn_intake");

  const setNo =
    pick(api, "setNo", "set_no") ||
    pick(yarnIntakeDetail, "setNo", "set_no") ||
    pick(sizingOutcomeSub, "setNo", "set_no") ||
    `SET-${api.id}`;

  const totalBagsOnSizing =
    toNum(pick(api, "totalBagsOnSizing", "total_bags_on_sizing")) ||
    toNum(pick(api, "outcomeBags", "outcome_bags")) ||
    toNum(pick(sizingOutcomeSub, "totalBagsOnSizing", "total_bags_on_sizing"));

  const bagPackingCone =
    toNum(pick(api, "bagPackingCone", "bag_packing_cone")) ||
    toNum(pick(api, "outcomeConesPerBag", "outcome_cones_per_bag")) ||
    toNum(pick(yarnIntakeDetail, "conesPerBag", "cones_per_bag")) ||
    24;

  const totalCones =
    toNum(pick(api, "totalCones", "total_cones")) ||
    totalBagsOnSizing * bagPackingCone;

  const remainingBagsOnSizingStock = toNum(
    pick(api, "remainingBagsOnSizingStock", "remaining_bags_on_sizing_stock")
  );
  const remainingConesOnSizingStock = toNum(
    pick(api, "remainingConesOnSizingStock", "remaining_cones_on_sizing_stock")
  );

  const lagatBags =
    toNum(pick(api, "lagatBags", "lagat_bags")) ||
    toNum(pick(sizingOutcomeSub, "lagatBags", "lagat_bags"));
  const lagatCones =
    toNum(pick(api, "lagatCones", "lagat_cones")) ||
    toNum(pick(sizingOutcomeSub, "lagatCones", "lagat_cones"));

  const setLengthMeter =
    toNum(pick(api, "setLengthMeter", "set_length_meter")) ||
    toNum(pick(sizingOutcomeSub, "setLengthMeter", "set_length_meter"));
  const setLengthGaz =
    toNum(pick(api, "setLengthGaz", "set_length_gaz")) ||
    toNum(pick(sizingOutcomeSub, "setLengthGaz", "set_length_gaz")) ||
    (setLengthMeter > 0 ? Number((setLengthMeter * 1.0936133).toFixed(2)) : 0);

  const rawBeams = pick(api, "beams") || [];
  const beamAssignments = pick(api, "beamAssignments", "beam_assignments") || (Array.isArray(rawBeams) ? rawBeams : []);
  const rawBeamIds = pick(api, "beam_ids", "beamIds") || (Array.isArray(rawBeams) ? rawBeams.map((b) => (typeof b === "object" ? b.id : b)).filter(Boolean) : []);
  const totalBeams =
    toNum(pick(api, "totalBeams", "total_beams")) ||
    (Array.isArray(beamAssignments) ? beamAssignments.length : (Array.isArray(rawBeams) ? rawBeams.length : rawBeamIds.length));

  const sendDate =
    (isYarnOutcomeRecord ? pick(api, "outcomeDate", "outcome_date") : "") ||
    pick(api, "sendDate", "send_date") ||
    pick(yarnIntakeDetail, "intakeDate") ||
    "";

  const outcomeDate =
    (!isYarnOutcomeRecord ? pick(api, "outcomeDate", "outcome_date") : "") ||
    pick(sizingOutcomeSub, "outcomeDate", "outcome_date") ||
    "";

  const brand =
    pick(api, "brand") ||
    pick(yarnIntakeDetail, "yarnName", "yarn_name") ||
    pick(yarnIntakeDetail, "supplier", "supplierName") ||
    "Standard Yarn";

  const count =
    pick(api, "count", "yarn_count", "yarnCount") ||
    pick(yarnIntakeDetail, "yarnCount", "yarn_count") ||
    "";

  const yarnName =
    pick(api, "yarnName", "yarn_name") ||
    pick(yarnIntakeDetail, "yarnName", "yarn_name") ||
    `${brand} ${count}`.trim() ||
    "Sized Warp Set";

  const rawMaterialRef =
    yarnIntakeId ? `INTAKE-${yarnIntakeId}` : (pick(yarnIntakeDetail, "setNo") || setNo);

  const status = isYarnOutcomeRecord && !sizingOutcomeSub
    ? "In Sizing"
    : deriveSizingStatus(api);

  return {
    id: api.id,
    yarnOutcomeId: isYarnOutcomeRecord ? api.id : (pick(api, "yarnOutcomeId", "yarn_outcome_id") || pick(sizingOutcomeSub, "id")),
    yarnIntakeId,
    rawMaterialRef,
    yarnIntakeDetail,
    sizingId,
    sizingDetail,
    sizingName,
    sizingUnit: sizingName,
    setNo,
    sizingNo: setNo, // Backward compatibility
    sendDate,
    outcomeDate,
    date: outcomeDate || sendDate, // Backward compatibility
    totalBagsOnSizing,
    bagsSent: totalBagsOnSizing, // Backward compatibility
    bagPackingCone,
    totalCones,
    remainingBagsOnSizingStock,
    remainingConesOnSizingStock,
    lagatBags,
    lagatCones,
    brand,
    width: toNum(pick(api, "width")) || toNum(pick(sizingOutcomeSub, "width")),
    setLengthMeter,
    setLengthGaz,
    totalTarr: toNum(pick(api, "totalTarr", "total_tarr")) || toNum(pick(sizingOutcomeSub, "totalTarr", "total_tarr")),
    yarnBeam: pick(api, "yarnBeam", "yarn_beam") || "",
    count,
    yarnName,
    totalSetLumbai: toNum(pick(api, "totalSetLumbai", "total_set_lumbai")) || setLengthMeter,
    totalSetShortage: toNum(pick(api, "totalSetShortage", "total_set_shortage")),
    remarks: pick(api, "remarks") || "",
    totalBeams,
    beamsProduced: totalBeams, // Backward compatibility
    beam_ids: rawBeamIds,
    beamIds: rawBeamIds,
    beams: Array.isArray(rawBeams) ? rawBeams : [],
    beamAssignments: Array.isArray(beamAssignments) ? beamAssignments : [],
    status,
    isInSizing: status === "In Sizing",
    createdBy: pick(api, "createdBy", "created_by"),
    createdAt: pick(api, "createdAt", "created_at"),
  };
}

/** Normalises list responses: { results }, { data: { results } }, { data: [] } or [] */
export function normalizeSizingOutcomeList(response) {
  const body = response?.data && !Array.isArray(response.data) ? response.data : response;
  const list = Array.isArray(body)
    ? body
    : body?.results ?? (Array.isArray(response?.data) ? response.data : []);
  return {
    rows: list.map(mapSizingOutcomeToRow).filter(Boolean),
    count: body?.count ?? list.length,
    totalPages: body?.totalPages ?? body?.total_pages ?? 1,
    currentPage: body?.currentPage ?? body?.current_page ?? 1,
  };
}

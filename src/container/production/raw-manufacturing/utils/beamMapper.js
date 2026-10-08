/**
 * Beam & Sizing Outcome Normalizer for Available Sets and Warp Beams Master Inventory.
 */

export function normalizeBeamList(beamsResponse, sizingOutcomes = [], activeLoadings = [], looms = []) {
  if (!beamsResponse) return { count: 0, rows: [] };

  const rawList = Array.isArray(beamsResponse)
    ? beamsResponse
    : Array.isArray(beamsResponse?.results)
    ? beamsResponse.results
    : Array.isArray(beamsResponse?.data)
    ? beamsResponse.data
    : [];

  const loadingsList = Array.isArray(activeLoadings)
    ? activeLoadings
    : Array.isArray(activeLoadings?.results)
    ? activeLoadings.results
    : Array.isArray(activeLoadings?.data)
    ? activeLoadings.data
    : [];

  const outcomesList = Array.isArray(sizingOutcomes)
    ? sizingOutcomes
    : Array.isArray(sizingOutcomes?.results)
    ? sizingOutcomes.results
    : Array.isArray(sizingOutcomes?.data)
    ? sizingOutcomes.data
    : [];

  const loomsList = Array.isArray(looms)
    ? looms
    : Array.isArray(looms?.results)
    ? looms.results
    : Array.isArray(looms?.data)
    ? looms.data
    : [];

  // Map active loading by beam_id and loom_id
  const loadingByBeamId = new Map();
  loadingsList.forEach((loading) => {
    const beamId = loading.beam?.id || loading.beam_id || loading.beam;
    if (beamId) {
      loadingByBeamId.set(Number(beamId), loading);
    }
  });

  // Map sizing outcome by ID
  const outcomeById = new Map();
  outcomesList.forEach((o) => {
    if (o.id) outcomeById.set(Number(o.id), o);
  });

  // Map loom by ID
  const loomById = new Map();
  loomsList.forEach((l) => {
    if (l.id) loomById.set(Number(l.id), l);
  });

  // Also collect beam-to-outcome mappings from sizing outcomes
  const outcomeByBeamId = new Map();
  outcomesList.forEach((outcome) => {
    const assignments = outcome.beamAssignments || outcome.beam_assignments || [];
    assignments.forEach((asg) => {
      const bId = asg.beamId || asg.beam_id || asg.beam?.id || asg.beam;
      if (bId) {
        outcomeByBeamId.set(Number(bId), outcome);
      }
    });
  });

  const rows = rawList.map((b) => {
    const bId = Number(b.id);
    const activeLoading = loadingByBeamId.get(bId);
    const associatedOutcome = outcomeByBeamId.get(bId) || (activeLoading?.sizing_outcome ? outcomeById.get(Number(activeLoading.sizing_outcome.id || activeLoading.sizing_outcome)) : null);
    
    const targetLoomId = activeLoading?.loom?.id || activeLoading?.loom_id || activeLoading?.loom;
    const targetLoom = targetLoomId ? loomById.get(Number(targetLoomId)) : null;

    let status = b.status || "Available";
    if (activeLoading) {
      status = activeLoading.status === "Loaded" ? "In Production" : activeLoading.status;
    } else if (status === "Available" || status === "Created") {
      status = "Available";
    }

    const beamNo = b.beam_number || b.beamNumber || `BM-${b.id}`;
    const beamCode = b.beam_code || b.beamCode || beamNo;
    const yarnName = associatedOutcome?.brand || associatedOutcome?.yarnIntakeDetail?.yarnName || b.production_order || b.yarn_count || "Sized Yarn";
    const yarnCount = b.yarn_count || associatedOutcome?.count || "";
    const ends = b.total_ends || associatedOutcome?.total_tarr || associatedOutcome?.totalTarr || 0;
    const length = b.length || associatedOutcome?.set_length_meter || associatedOutcome?.setLengthMeter || 0;
    const width = associatedOutcome?.width ? `${associatedOutcome.width}"` : b.width ? `${b.width}"` : "68 Inch (172 CM)";
    const weight = b.weight || "—";
    const sizingNo = associatedOutcome?.set_no || associatedOutcome?.setNo || associatedOutcome?.yarnBeam || b.production_order || "SZ-Direct";

    return {
      id: bId,
      beamNo,
      beamCode,
      beamName: b.beam_name || b.beamName || "Warp Beam",
      sizingId: associatedOutcome?.id || null,
      sizingNo,
      sizingName: associatedOutcome?.sizingName || associatedOutcome?.sizingDetail?.sizingName || "",
      yarnName,
      yarnCount,
      ends,
      length,
      width,
      weight,
      status,
      currentLoomId: targetLoomId || null,
      currentLoomNo: targetLoom?.loom_code || activeLoading?.loom?.loom_code || activeLoading?.loom_code || null,
      currentLoomName: targetLoom?.loom_name || activeLoading?.loom?.loom_name || null,
      installationDate: activeLoading?.installation_date || null,
      producedMeters: activeLoading?.total_produced_meters || 0,
      associatedOutcome,
      history: [
        {
          id: `BH-${bId}-1`,
          date: associatedOutcome?.outcomeDate || associatedOutcome?.outcome_date || new Date().toISOString().slice(0, 10),
          loomNo: targetLoom?.loom_code || "—",
          action: activeLoading ? "Installed on Loom" : "Ready from Sizing",
          status,
          operator: "Production Floor",
          remarks: activeLoading ? `Loaded on Loom ${targetLoom?.loom_code || "Loom"}` : "Quality checked and ready in warp inventory.",
        },
      ],
    };
  });

  return {
    count: rawList.length,
    rows,
  };
}

/**
 * Loom Normalizer for Live API Data.
 */

export function normalizeLoomList(loomsResponse, activeLoadings = [], beams = []) {
  if (!loomsResponse) return { count: 0, rows: [] };

  const rawList = Array.isArray(loomsResponse)
    ? loomsResponse
    : Array.isArray(loomsResponse?.results)
    ? loomsResponse.results
    : Array.isArray(loomsResponse?.data)
    ? loomsResponse.data
    : [];

  const loadingsList = Array.isArray(activeLoadings)
    ? activeLoadings
    : Array.isArray(activeLoadings?.results)
    ? activeLoadings.results
    : Array.isArray(activeLoadings?.data)
    ? activeLoadings.data
    : [];

  const beamsList = Array.isArray(beams)
    ? beams
    : Array.isArray(beams?.results)
    ? beams.results
    : Array.isArray(beams?.data)
    ? beams.data
    : [];

  const loadingByLoomId = new Map();
  loadingsList.forEach((loading) => {
    const loomId = loading.loom?.id || loading.loom_id || loading.loom;
    if (loomId) {
      loadingByLoomId.set(Number(loomId), loading);
    }
  });

  const beamById = new Map();
  beamsList.forEach((b) => {
    if (b.id) beamById.set(Number(b.id), b);
  });

  const rows = rawList.map((l) => {
    const lId = Number(l.id);
    const activeLoading = loadingByLoomId.get(lId);
    const targetBeamId = activeLoading?.beam?.id || activeLoading?.beam_id || activeLoading?.beam;
    const targetBeam = targetBeamId ? beamById.get(Number(targetBeamId)) : null;

    let status = l.status || "Active";
    if (activeLoading) {
      status = "Running";
    } else if (status === "Production") {
      status = "Running";
    } else if (status === "Active") {
      status = "Available";
    }

    const loomNo = l.loom_code || l.loomNo || `LM-${l.id}`;
    const name = l.loom_name || l.name || `Loom #${l.id}`;

    return {
      id: lId,
      loomNo,
      name,
      type: l.model_number || l.type || "Rapier High Speed",
      manufacturer: l.model_number || l.manufacturer || "Picanol / Toyota",
      location: l.location || "Weaving Shed 1",
      department: l.location || "Weaving Shed 1 (Rapier)",
      width: l.width ? `${l.width}"` : "75 Inch (190 CM)",
      rpm: l.rpm || 600,
      currentBeamId: targetBeamId || null,
      currentBeamNo: targetBeam?.beamNo || activeLoading?.beam?.beam_number || activeLoading?.beam_code || null,
      status,
      installationDate: l.installation_date || null,
      activeLoading,
    };
  });

  return {
    count: rawList.length,
    rows,
  };
}

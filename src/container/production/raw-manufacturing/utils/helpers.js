// Helper utilities, stats aggregators, ID generators and PDF exporter for Raw Manufacturing

export function computeManufacturingStats(rawMaterials, sizingEntries, beams, looms) {
  const totalRawBags = rawMaterials.reduce((acc, rm) => acc + (Number(rm.bags) || 0), 0);
  const totalRawWeight = rawMaterials.reduce((acc, rm) => acc + (Number(rm.netWeight) || 0), 0);
  
  const totalBagsSentToSizing = rawMaterials.reduce((acc, rm) => acc + (Number(rm.bagsSent) || 0), 0);
  const totalWeightSentToSizing = rawMaterials.reduce((acc, rm) => acc + (Number(rm.weightSent) || 0), 0);
  
  const remainingRawBags = rawMaterials.reduce((acc, rm) => acc + (Number(rm.availableBags) || 0), 0);
  const remainingRawWeight = rawMaterials.reduce((acc, rm) => acc + (Number(rm.availableWeight) || 0), 0);

  const activeSizingBatches = sizingEntries.filter((sz) => sz.status === "In Sizing" || sz.status === "Sent to Sizing").length;
  const sizingBagsInProgress = sizingEntries
    .filter((sz) => sz.status === "In Sizing" || sz.status === "Sent to Sizing")
    .reduce((acc, sz) => acc + (Number(sz.bagsSent) || 0), 0);

  const totalBeams = beams.length;
  const availableBeams = beams.filter((b) => b.status === "Available" || b.status === "Ready for Loom" || b.status === "Created").length;
  const beamsInProduction = beams.filter((b) => b.status === "In Production" || b.status === "Assigned to Loom").length;
  const completedBeams = beams.filter((b) => b.status === "Completed" || b.status === "Removed from Loom").length;

  const totalLooms = looms.length;
  const runningLooms = looms.filter((l) => l.status === "Running").length;
  const idleLooms = looms.filter((l) => l.status === "Idle").length;
  const maintenanceLooms = looms.filter((l) => l.status === "Under Maintenance" || l.status === "Stopped").length;
  const inactiveLooms = looms.filter((l) => l.status === "Inactive").length;

  const totalFabricWovenMeters = looms.reduce((acc, l) => {
    const activeProduced = beams.find((b) => b.id === l.currentBeamId)?.producedMeters || 0;
    const historyProduced = (l.beamHistory || []).reduce((hAcc, h) => hAcc + (Number(h.metersProduced) || 0), 0);
    return acc + activeProduced + historyProduced;
  }, 0);

  const loomUtilization = totalLooms > 0 ? Math.round((runningLooms / totalLooms) * 100) : 0;
  const beamUtilization = totalBeams > 0 ? Math.round((beamsInProduction / totalBeams) * 100) : 0;

  return {
    totalRawBags,
    totalRawWeight,
    totalBagsSentToSizing,
    totalWeightSentToSizing,
    remainingRawBags,
    remainingRawWeight,
    activeSizingBatches,
    sizingBagsInProgress,
    totalBeams,
    availableBeams,
    beamsInProduction,
    completedBeams,
    totalLooms,
    runningLooms,
    idleLooms,
    maintenanceLooms,
    inactiveLooms,
    totalFabricWovenMeters,
    loomUtilization,
    beamUtilization,
  };
}

export function nextRawMaterialId(rows) {
  const nums = rows.map((r) => parseInt(r.id.replace(/\D/g, ""), 10)).filter(Boolean);
  const next = (nums.length ? Math.max(...nums) : 1000) + 1;
  return `RM-${next}`;
}

export function nextRawMaterialEntryNo(rows) {
  const year = new Date().getFullYear();
  const count = rows.length + 1;
  return `RM-${year}-${String(count).padStart(3, "0")}`;
}

export function nextSizingId(rows) {
  const nums = rows.map((r) => parseInt(r.id.replace(/\D/g, ""), 10)).filter(Boolean);
  const next = (nums.length ? Math.max(...nums) : 2000) + 1;
  return `SZ-${next}`;
}

export function nextSizingNo(rows) {
  const count = rows.length + 45;
  return `SZ-${String(count).padStart(5, "0")}`;
}

export function nextBeamId(rows) {
  const nums = rows.map((r) => parseInt(r.id.replace(/\D/g, ""), 10)).filter(Boolean);
  const next = (nums.length ? Math.max(...nums) : 3000) + 1;
  return `BM-${next}`;
}

export function nextBeamNo(rows) {
  const count = rows.length + 125;
  return `BM-${String(count).padStart(5, "0")}`;
}

export function nextLoomId(rows) {
  const nums = rows.map((r) => parseInt(r.id.replace(/\D/g, ""), 10)).filter(Boolean);
  const next = (nums.length ? Math.max(...nums) : 4000) + 1;
  return `LM-${next}`;
}

export function nextLoomNo(rows) {
  const count = rows.length + 1;
  return `LM-${String(count).padStart(3, "0")}`;
}

export function downloadManufacturingPdf(title, rows, columns, summaryText) {
  const pdf = createGenericPdf(title, rows, columns, summaryText);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapePdf(value) {
  return String(value || "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function truncateText(value, maxWidth) {
  const maxChars = Math.max(8, Math.floor(maxWidth / 4.8));
  const str = String(value || "");
  return str.length > maxChars ? `${str.slice(0, maxChars - 3)}...` : str;
}

function createGenericPdf(title, rows, columns, summaryText = "") {
  const pageWidth = 842;
  const pageHeight = 595;
  const left = 36;
  const top = 480;
  const rowHeight = 24;
  const visibleRows = rows.slice(0, 16);
  const generatedAt = new Date();
  const generatedDate = generatedAt.toLocaleDateString("en-PK");
  const generatedTime = generatedAt.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });

  const lines = [
    "0.985 0.982 0.992 rg 0 0 842 595 re f",
    "0.49 0.23 0.93 rg 36 500 770 64 re f",
    "0.75 0.15 0.83 rg 620 500 186 64 re f",
    "1 1 1 rg 52 515 36 36 re f",
    "0.49 0.23 0.93 RG 3 w 58 521 m 58 545 l 65 541 l 72 545 l 79 541 l 84 545 l 84 521 l 58 521 l S",
    "0.49 0.23 0.93 RG 2 w 67 521 m 67 530 l 76 521 m 76 530 l S",
    "BT /F1 12 Tf 1 1 1 rg 98 545 Td (ABC Weaving Mills) Tj ET",
    "BT /F1 7 Tf 0.9 0.84 1 rg 98 531 Td (Raw Manufacturing Management) Tj ET",
    "BT /F1 7 Tf 0.9 0.84 1 rg 98 519 Td (Yarn - Sizing - Beam - Loom) Tj ET",
    `BT /F1 20 Tf 1 1 1 rg 260 540 Td (${escapePdf(title)}) Tj ET`,
    `BT /F1 8 Tf 0.96 0.92 1 rg 260 523 Td (${escapePdf(summaryText || "Production-ready textile inventory tracking")}) Tj ET`,
    `BT /F1 10 Tf 1 1 1 rg 635 546 Td (${escapePdf(`Date: ${generatedDate}`)}) Tj ET`,
    `BT /F1 10 Tf 1 1 1 rg 635 530 Td (${escapePdf(`Time: ${generatedTime}`)}) Tj ET`,
    `BT /F1 10 Tf 1 1 1 rg 635 514 Td (${escapePdf(`Total: ${rows.length} records`)}) Tj ET`,
    "1 1 1 rg 36 82 770 404 re f",
    "0.88 0.84 0.94 RG 36 82 770 404 re S",
    "0.95 0.92 1 rg 36 462 770 24 re f",
    "0.72 0.65 0.82 RG 36 462 770 24 re S",
    "BT /F1 8 Tf 0.25 0.18 0.36 rg",
    ...columns.map((col) => `${col.x} 470 Td (${escapePdf(col.label)}) Tj ${-col.x} -470 Td`),
    "ET",
  ];

  visibleRows.forEach((row, index) => {
    const y = top - 42 - index * rowHeight;
    const fill = index % 2 === 0 ? "1 1 1 rg" : "0.985 0.975 1 rg";
    lines.push(fill);
    lines.push(`${left} ${y - 8} 770 ${rowHeight} re f`);
    lines.push("0.9 0.86 0.95 RG");
    lines.push(`${left} ${y - 8} 770 ${rowHeight} re S`);
    lines.push("BT /F1 8 Tf 0.12 0.1 0.16 rg");
    columns.forEach((col) => {
      const val = row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : "—";
      const text = truncateText(String(val), col.width);
      lines.push(`${col.x} ${y} Td (${escapePdf(text)}) Tj ${-col.x} ${-y} Td`);
    });
    lines.push("ET");
  });

  if (!visibleRows.length) {
    lines.push("BT /F1 11 Tf 0.38 0.34 0.45 rg 320 290 Td (No records found in this view.) Tj ET");
  }

  lines.push("0.49 0.23 0.93 rg 36 58 770 2 re f");
  lines.push(`BT /F1 8 Tf 0.38 0.34 0.45 rg 52 40 Td (${escapePdf(`Showing ${visibleRows.length} of ${rows.length} entries — Raw Manufacturing Module`)}) Tj ET`);
  lines.push("BT /F1 8 Tf 0.38 0.34 0.45 rg 650 40 Td (ABC Weaving ERP) Tj ET");

  const stream = lines.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];

  let body = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return body;
}

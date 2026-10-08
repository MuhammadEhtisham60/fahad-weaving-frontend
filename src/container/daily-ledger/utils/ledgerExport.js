/**
 * Export utilities for Daily Ledger (Daily Cash and All Transactions).
 * Supports direct CSV download, direct PDF binary download (via jsPDF & autoTable),
 * and dedicated direct Print functionality.
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper to format currency numbers cleanly
export const formatCurrency = (val) => {
  const num = parseFloat(val);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const escapeCsvField = (field) => {
  if (field === null || field === undefined) return '""';
  const stringField = String(field);
  if (
    stringField.includes(",") ||
    stringField.includes('"') ||
    stringField.includes("\n") ||
    stringField.includes("\r")
  ) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return `"${stringField}"`;
};

/**
 * Triggers a browser download for CSV data with UTF-8 BOM
 */
export const downloadCsvFile = (filename, csvString) => {
  const blob = new Blob(["\uFEFF" + csvString], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ─────────────────────────────────────────────────────────────
// CSV EXPORTS
// ─────────────────────────────────────────────────────────────

/**
 * Builds and downloads CSV for Daily Cash (Single Day Ledger)
 */
export const exportDailySheetCsv = ({ date, summary = {}, transactions = [] }) => {
  const opening = parseFloat(summary.openingBalance ?? summary.opening_balance ?? 0);
  const incoming = parseFloat(summary.totalIncoming ?? summary.total_incoming ?? 0);
  const outgoing = parseFloat(summary.totalOutgoing ?? summary.total_outgoing ?? 0);
  const closing = parseFloat(
    summary.closingBalance ?? summary.closing_balance ?? opening + incoming - outgoing
  );

  const rows = [
    ["FAHAD WEAVING FACTORY - OPERATIONAL DAILY CASH LEDGER"],
    ["Report Date", date || new Date().toISOString().split("T")[0]],
    ["Generated At", new Date().toLocaleString()],
    [],
    ["SUMMARY FINANCIAL OVERVIEW"],
    ["Opening Balance (PKR)", formatCurrency(opening)],
    ["Total Incoming (PKR)", formatCurrency(incoming)],
    ["Total Outgoing (PKR)", formatCurrency(outgoing)],
    ["Closing Balance (PKR)", formatCurrency(closing)],
    ["Total Transactions", transactions.length],
    [],
    [
      "#",
      "Time",
      "Type",
      "Category",
      "Party / Particulars",
      "Payment Method",
      "Reference #",
      "Description",
      "Income (+ PKR)",
      "Expense (- PKR)",
      "Running Balance (PKR)",
    ],
  ];

  transactions.forEach((tx, idx) => {
    const isIncoming =
      tx.transaction_type === "INCOMING" || tx.transactionType === "INCOMING";
    const amt = parseFloat(tx.amount || 0);
    const running = tx.running_balance ?? tx.runningBalance;

    rows.push([
      idx + 1,
      tx.transaction_time || tx.created_at || "—",
      isIncoming ? "Income (+)" : "Expense (-)",
      tx.category || "General",
      tx.party_name || tx.partyName || "Counter",
      tx.payment_method || tx.paymentMethod || "Cash",
      tx.reference_number || tx.referenceNumber || "",
      tx.description || "",
      isIncoming ? formatCurrency(amt) : "0.00",
      !isIncoming ? formatCurrency(amt) : "0.00",
      running !== undefined && running !== null ? formatCurrency(running) : "",
    ]);
  });

  // Footer summary row
  rows.push([]);
  rows.push([
    "TOTALS",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    formatCurrency(incoming),
    formatCurrency(outgoing),
    formatCurrency(closing),
  ]);

  const csvContent = rows
    .map((row) => row.map(escapeCsvField).join(","))
    .join("\r\n");

  const filename = `daily-cash-ledger-${date || "today"}.csv`;
  downloadCsvFile(filename, csvContent);
};

/**
 * Builds and downloads CSV for All Transactions
 */
export const exportAllTransactionsCsv = ({
  timelineLabel = "All Time",
  summary = {},
  transactions = [],
}) => {
  const opening = parseFloat(summary.openingBalance ?? summary.opening_balance ?? 0);
  const incoming = parseFloat(summary.totalIncoming ?? summary.total_incoming ?? 0);
  const outgoing = parseFloat(summary.totalOutgoing ?? summary.total_outgoing ?? 0);
  const closing = parseFloat(
    summary.closingBalance ?? summary.closing_balance ?? opening + incoming - outgoing
  );

  const rows = [
    ["FAHAD WEAVING FACTORY - ALL TRANSACTIONS LEDGER REPORT"],
    ["Timeline / Period", timelineLabel],
    ["Generated At", new Date().toLocaleString()],
    [],
    ["SUMMARY FINANCIAL OVERVIEW"],
    ["Opening Balance (PKR)", formatCurrency(opening)],
    ["Total Incoming (PKR)", formatCurrency(incoming)],
    ["Total Outgoing (PKR)", formatCurrency(outgoing)],
    ["Closing / Net Balance (PKR)", formatCurrency(closing)],
    ["Transactions Count", transactions.length],
    [],
    [
      "#",
      "Date",
      "Time",
      "Type",
      "Category",
      "Party / Particulars",
      "Payment Method",
      "Reference #",
      "Description",
      "Income (+ PKR)",
      "Expense (- PKR)",
      "Running Balance (PKR)",
    ],
  ];

  transactions.forEach((tx, idx) => {
    const isIncoming =
      tx.transaction_type === "INCOMING" || tx.transactionType === "INCOMING";
    const amt = parseFloat(tx.amount || 0);
    const running = tx.running_balance ?? tx.runningBalance;

    rows.push([
      idx + 1,
      tx.transaction_date || tx.transactionDate || "—",
      tx.transaction_time || "",
      isIncoming ? "Income (+)" : "Expense (-)",
      tx.category || "General",
      tx.party_name || tx.partyName || "Counter",
      tx.payment_method || tx.paymentMethod || "Cash",
      tx.reference_number || tx.referenceNumber || "",
      tx.description || "",
      isIncoming ? formatCurrency(amt) : "0.00",
      !isIncoming ? formatCurrency(amt) : "0.00",
      running !== undefined && running !== null ? formatCurrency(running) : "",
    ]);
  });

  // Footer summary row
  rows.push([]);
  rows.push([
    "TOTALS",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    formatCurrency(incoming),
    formatCurrency(outgoing),
    formatCurrency(closing),
  ]);

  const csvContent = rows
    .map((row) => row.map(escapeCsvField).join(","))
    .join("\r\n");

  const safeLabel = timelineLabel.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
  const filename = `all-transactions-${safeLabel}-${new Date().toISOString().split("T")[0]}.csv`;
  downloadCsvFile(filename, csvContent);
};

// ─────────────────────────────────────────────────────────────
// DIRECT PDF DOWNLOADS (via jsPDF & autoTable)
// ─────────────────────────────────────────────────────────────

/**
 * Draws the top 4 KPI cards and company header directly into jsPDF document
 */
const drawPdfHeaderAndKpis = (doc, { title, periodLabel, summary = {}, transactions = [] }) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const opening = parseFloat(summary.openingBalance ?? summary.opening_balance ?? 0);
  const incoming = parseFloat(summary.totalIncoming ?? summary.total_incoming ?? 0);
  const outgoing = parseFloat(summary.totalOutgoing ?? summary.total_outgoing ?? 0);
  const closing = parseFloat(
    summary.closingBalance ?? summary.closing_balance ?? opening + incoming - outgoing
  );

  const incomingCount = transactions.filter(
    (tx) => tx.transaction_type === "INCOMING" || tx.transactionType === "INCOMING"
  ).length;
  const outgoingCount = transactions.length - incomingCount;

  // Header Banner Background (Navy #0c1f3f)
  doc.setFillColor(12, 31, 63);
  doc.roundedRect(10, 10, pageWidth - 20, 22, 2, 2, "F");

  // Gold accent bar
  doc.setFillColor(201, 162, 39);
  doc.rect(10, 31, pageWidth - 20, 1.2, "F");

  // Logo Badge
  doc.setFillColor(201, 162, 39);
  doc.roundedRect(14, 13.5, 15, 15, 2, 2, "F");
  doc.setTextColor(12, 31, 63);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("FW", 18.5, 23.5);

  // Brand Name & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("FAHAD WEAVING FACTORY", 33, 20);

  doc.setFontSize(7.5);
  doc.setTextColor(201, 162, 39);
  doc.setFont("helvetica", "bold");
  doc.text("OPERATIONAL DAILY LEDGER SUITE", 33, 25.5);

  // Document Title & Meta (Right Aligned)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth - 14, 19, { align: "right" });

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 225, 235);
  doc.text(`Period: ${periodLabel}`, pageWidth - 14, 25, { align: "right" });

  // ─── 4 KPI Summary Cards at Top ─────────────────────────────
  const cardWidth = (pageWidth - 20 - 9) / 4; // 4 cards with 3mm gaps
  const cardHeight = 18;
  const startY = 36;

  const kpis = [
    {
      label: "OPENING BALANCE",
      value: `Rs ${formatCurrency(opening)}`,
      sub: "Start of Period",
      bg: [240, 249, 255],
      border: [186, 230, 253],
      valColor: [15, 23, 42],
    },
    {
      label: "TOTAL INCOMING",
      value: `Rs ${formatCurrency(incoming)}`,
      sub: `${incomingCount} Receipts / Sales`,
      bg: [236, 253, 245],
      border: [167, 243, 208],
      valColor: [5, 150, 105],
    },
    {
      label: "TOTAL OUTGOING",
      value: `Rs ${formatCurrency(outgoing)}`,
      sub: `${outgoingCount} Expenses / Payouts`,
      bg: [255, 251, 235],
      border: [253, 230, 138],
      valColor: [217, 119, 6],
    },
    {
      label: "CLOSING BALANCE",
      value: `Rs ${formatCurrency(closing)}`,
      sub: "Net Available Cash",
      bg: [245, 243, 255],
      border: [221, 214, 254],
      valColor: [67, 56, 202],
    },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 10 + idx * (cardWidth + 3);

    // Card background & border
    doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    doc.setDrawColor(kpi.border[0], kpi.border[1], kpi.border[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, startY, cardWidth, cardHeight, 1.5, 1.5, "FD");

    // Card Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(kpi.label, x + 3, startY + 4.5);

    // Card Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(kpi.valColor[0], kpi.valColor[1], kpi.valColor[2]);
    doc.text(kpi.value, x + 3, startY + 10.5);

    // Card Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.sub, x + 3, startY + 15);
  });

  return startY + cardHeight + 4; // Returns bottom Y coordinate
};

/**
 * Downloads Daily Cash PDF directly
 */
export const downloadDailySheetPdf = ({ date, summary = {}, transactions = [] }) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const periodLabel = date || new Date().toISOString().split("T")[0];
  const tableStartY = drawPdfHeaderAndKpis(doc, {
    title: "OPERATIONAL DAILY CASH LEDGER",
    periodLabel,
    summary,
    transactions,
  });

  const opening = parseFloat(summary.openingBalance ?? summary.opening_balance ?? 0);
  const incoming = parseFloat(summary.totalIncoming ?? summary.total_incoming ?? 0);
  const outgoing = parseFloat(summary.totalOutgoing ?? summary.total_outgoing ?? 0);
  const closing = parseFloat(
    summary.closingBalance ?? summary.closing_balance ?? opening + incoming - outgoing
  );

  const tableRows = transactions.map((tx, idx) => {
    const isIncoming =
      tx.transaction_type === "INCOMING" || tx.transactionType === "INCOMING";
    const amt = parseFloat(tx.amount || 0);
    const running = tx.running_balance ?? tx.runningBalance;

    return [
      idx + 1,
      tx.transaction_time || tx.created_at || "—",
      isIncoming ? "Income (+)" : "Expense (-)",
      tx.category || "General",
      tx.party_name || tx.partyName || "Counter",
      tx.payment_method || tx.paymentMethod || "Cash",
      isIncoming ? `+Rs ${formatCurrency(amt)}` : "—",
      !isIncoming ? `-Rs ${formatCurrency(amt)}` : "—",
      running !== undefined && running !== null ? `Rs ${formatCurrency(running)}` : "—",
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: 10, right: 10, bottom: 14 },
    head: [
      [
        "#",
        "Time",
        "Type",
        "Category",
        "Party / Particulars",
        "Method",
        "Income (+)",
        "Expense (-)",
        "Running Bal",
      ],
    ],
    body: tableRows,
    foot: [
      [
        "SUMMARY TOTALS",
        "",
        "",
        "",
        "",
        "",
        `+Rs ${formatCurrency(incoming)}`,
        `-Rs ${formatCurrency(outgoing)}`,
        `Rs ${formatCurrency(closing)}`,
      ],
    ],
    theme: "striped",
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      font: "helvetica",
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [12, 31, 63],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    footStyles: {
      fillColor: [226, 232, 240],
      textColor: [12, 31, 63],
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { cellWidth: 16 },
      2: { cellWidth: 18 },
      3: { cellWidth: 24, fontStyle: "bold" },
      4: { cellWidth: "auto" },
      5: { cellWidth: 18 },
      6: { halign: "right", textColor: [5, 150, 105], fontStyle: "bold", cellWidth: 24 },
      7: { halign: "right", textColor: [217, 119, 6], fontStyle: "bold", cellWidth: 24 },
      8: { halign: "right", fontStyle: "bold", cellWidth: 26 },
    },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Fahad Weaving Factory Management Suite • System Generated • Page ${data.pageNumber} of ${pageCount}`,
        10,
        doc.internal.pageSize.getHeight() - 6
      );
      doc.text(
        `Exported: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        doc.internal.pageSize.getWidth() - 10,
        doc.internal.pageSize.getHeight() - 6,
        { align: "right" }
      );
    },
  });

  const filename = `daily-cash-ledger-${periodLabel}.pdf`;
  doc.save(filename);
};

/**
 * Downloads All Transactions PDF directly
 */
export const downloadAllTransactionsPdf = ({
  timelineLabel = "All Time",
  summary = {},
  transactions = [],
}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const tableStartY = drawPdfHeaderAndKpis(doc, {
    title: "ALL TRANSACTIONS LEDGER REPORT",
    periodLabel: timelineLabel,
    summary,
    transactions,
  });

  const opening = parseFloat(summary.openingBalance ?? summary.opening_balance ?? 0);
  const incoming = parseFloat(summary.totalIncoming ?? summary.total_incoming ?? 0);
  const outgoing = parseFloat(summary.totalOutgoing ?? summary.total_outgoing ?? 0);
  const closing = parseFloat(
    summary.closingBalance ?? summary.closing_balance ?? opening + incoming - outgoing
  );

  const tableRows = transactions.map((tx, idx) => {
    const isIncoming =
      tx.transaction_type === "INCOMING" || tx.transactionType === "INCOMING";
    const amt = parseFloat(tx.amount || 0);
    const running = tx.running_balance ?? tx.runningBalance;
    const dateStr = tx.transaction_date || tx.transactionDate || "";

    return [
      idx + 1,
      dateStr,
      isIncoming ? "Income (+)" : "Expense (-)",
      tx.category || "General",
      tx.party_name || tx.partyName || "Counter",
      tx.payment_method || tx.paymentMethod || "Cash",
      isIncoming ? `+Rs ${formatCurrency(amt)}` : "—",
      !isIncoming ? `-Rs ${formatCurrency(amt)}` : "—",
      running !== undefined && running !== null ? `Rs ${formatCurrency(running)}` : "—",
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: 10, right: 10, bottom: 14 },
    head: [
      [
        "#",
        "Date",
        "Type",
        "Category",
        "Party / Particulars",
        "Method",
        "Income (+)",
        "Expense (-)",
        "Running Bal",
      ],
    ],
    body: tableRows,
    foot: [
      [
        "SUMMARY TOTALS",
        "",
        "",
        "",
        "",
        "",
        `+Rs ${formatCurrency(incoming)}`,
        `-Rs ${formatCurrency(outgoing)}`,
        `Rs ${formatCurrency(closing)}`,
      ],
    ],
    theme: "striped",
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      font: "helvetica",
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [12, 31, 63],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    footStyles: {
      fillColor: [226, 232, 240],
      textColor: [12, 31, 63],
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { cellWidth: 20 },
      2: { cellWidth: 18 },
      3: { cellWidth: 24, fontStyle: "bold" },
      4: { cellWidth: "auto" },
      5: { cellWidth: 18 },
      6: { halign: "right", textColor: [5, 150, 105], fontStyle: "bold", cellWidth: 24 },
      7: { halign: "right", textColor: [217, 119, 6], fontStyle: "bold", cellWidth: 24 },
      8: { halign: "right", fontStyle: "bold", cellWidth: 26 },
    },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Fahad Weaving Factory Management Suite • System Generated • Page ${data.pageNumber} of ${pageCount}`,
        10,
        doc.internal.pageSize.getHeight() - 6
      );
      doc.text(
        `Exported: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        doc.internal.pageSize.getWidth() - 10,
        doc.internal.pageSize.getHeight() - 6,
        { align: "right" }
      );
    },
  });

  const safeLabel = timelineLabel.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
  const filename = `all-transactions-${safeLabel}-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
};

// ─────────────────────────────────────────────────────────────
// SEPARATE PRINT FUNCTIONALITY
// ─────────────────────────────────────────────────────────────

/**
 * Builds HTML printable layout for direct printing dialog
 */
export const buildLedgerReportHtml = ({
  title = "OPERATIONAL DAILY CASH LEDGER",
  subtitle = "Chronological Cash Flow & Transaction Records",
  dateLabel = "Today",
  summary = {},
  transactions = [],
  isSingleDay = false,
}) => {
  const opening = parseFloat(summary.openingBalance ?? summary.opening_balance ?? 0);
  const incoming = parseFloat(summary.totalIncoming ?? summary.total_incoming ?? 0);
  const outgoing = parseFloat(summary.totalOutgoing ?? summary.total_outgoing ?? 0);
  const closing = parseFloat(
    summary.closingBalance ?? summary.closing_balance ?? opening + incoming - outgoing
  );

  const incomingCount = transactions.filter(
    (tx) => tx.transaction_type === "INCOMING" || tx.transactionType === "INCOMING"
  ).length;
  const outgoingCount = transactions.length - incomingCount;

  const tableRowsHtml =
    transactions.length === 0
      ? `<tr><td colspan="${isSingleDay ? 8 : 9}" style="text-align: center; padding: 30px; color: #64748b;">No transactions recorded for this period.</td></tr>`
      : transactions
          .map((tx, idx) => {
            const isIncoming =
              tx.transaction_type === "INCOMING" || tx.transactionType === "INCOMING";
            const amt = parseFloat(tx.amount || 0);
            const running = tx.running_balance ?? tx.runningBalance;
            const timeStr = tx.transaction_time || "";
            const dateStr = tx.transaction_date || tx.transactionDate || "";

            return `
        <tr class="${idx % 2 === 1 ? "row-even" : ""}">
          <td class="col-center" style="font-family: monospace; color: #64748b;">${idx + 1}</td>
          ${
            !isSingleDay
              ? `<td class="col-nowrap"><strong>${dateStr}</strong>${timeStr ? ` <span style="color:#64748b; font-size:10px;">${timeStr}</span>` : ""}</td>`
              : `<td class="col-nowrap" style="color: #475569;">${timeStr || "—"}</td>`
          }
          <td class="col-nowrap">
            <span class="badge ${isIncoming ? "badge-income" : "badge-expense"}">
              ${isIncoming ? "Income (+)" : "Expense (-)"}
            </span>
          </td>
          <td class="col-nowrap" style="font-weight: 600; color: #1e293b;">${tx.category || "General"}</td>
          <td>
            <div style="font-weight: 600; color: #0f172a;">${tx.party_name || tx.partyName || "Counter"}</div>
            ${tx.description ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">${tx.description}</div>` : ""}
          </td>
          <td class="col-nowrap" style="color: #475569;">${tx.payment_method || tx.paymentMethod || "Cash"}</td>
          <td class="col-right ${isIncoming ? "amt-income" : "col-muted"}">
            ${isIncoming ? `+Rs ${formatCurrency(amt)}` : "—"}
          </td>
          <td class="col-right ${!isIncoming ? "amt-expense" : "col-muted"}">
            ${!isIncoming ? `-Rs ${formatCurrency(amt)}` : "—"}
          </td>
          <td class="col-right amt-balance">
            ${running !== undefined && running !== null ? `Rs ${formatCurrency(running)}` : "—"}
          </td>
        </tr>`;
          })
          .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${title} — Fahad Weaving Factory</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    *, *:before, *:after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0c1f3f;
      background: #fff;
      font-size: 11px;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-bar {
      background: #0c1f3f;
      color: #ffffff;
      padding: 14px 18px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .header-logo {
      width: 36px; height: 36px;
      border: 2px solid #c9a227;
      border-radius: 6px;
      background: rgba(201, 162, 39, 0.15);
      display: flex; align-items: center; justify-content: center;
      color: #c9a227; font-weight: 900; font-size: 16px;
    }
    .brand-name { font-size: 16px; font-weight: 800; letter-spacing: 0.04em; color: #ffffff; }
    .brand-sub { font-size: 8.5px; color: #c9a227; font-weight: 700; letter-spacing: 0.12em; margin-top: 2px; }
    .doc-title { font-size: 12px; font-weight: 800; letter-spacing: 0.06em; color: #ffffff; }
    .doc-meta { font-size: 9.5px; color: rgba(255, 255, 255, 0.8); margin-top: 3px; }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }
    .kpi-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
    }
    .kpi-card.opening { background: #f0f9ff; border-color: #bae6fd; }
    .kpi-card.incoming { background: #ecfdf5; border-color: #a7f3d0; }
    .kpi-card.outgoing { background: #fffbeb; border-color: #fde68a; }
    .kpi-card.closing { background: #f5f3ff; border-color: #ddd6fe; }
    .kpi-label { font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: #475569; }
    .kpi-value { font-size: 15px; font-weight: 800; margin: 3px 0 1px; color: #0f172a; }
    .kpi-card.incoming .kpi-value { color: #059669; }
    .kpi-card.outgoing .kpi-value { color: #d97706; }
    .kpi-card.closing .kpi-value { color: #4338ca; }
    .kpi-sub { font-size: 8.5px; color: #64748b; }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
    }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    th {
      background: #0c1f3f;
      color: #ffffff;
      padding: 7px 7px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      text-align: left;
    }
    td {
      padding: 5.5px 7px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }
    .row-even { background: #f8fafc; }
    .col-center { text-align: center; }
    .col-right { text-align: right; }
    .col-nowrap { white-space: nowrap; }
    .col-muted { color: #94a3b8; }
    .amt-income { color: #059669; font-weight: 700; }
    .amt-expense { color: #d97706; font-weight: 700; }
    .amt-balance { color: #0f172a; font-weight: 800; }

    .badge {
      display: inline-block;
      padding: 2px 5px;
      border-radius: 4px;
      font-size: 8.5px;
      font-weight: 700;
    }
    .badge-income { background: #d1fae5; color: #065f46; }
    .badge-expense { background: #fef3c7; color: #92400e; }

    tfoot td {
      background: #e2e8f0;
      font-weight: 800;
      padding: 7px 7px;
      border-top: 2px solid #0c1f3f;
      color: #0c1f3f;
      font-size: 10.5px;
    }
    .report-footer {
      margin-top: 12px;
      padding-top: 6px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      font-size: 8.5px;
      color: #64748b;
    }
    @media print {
      body { margin: 0; padding: 0; }
    }
  </style>
</head>
<body>
  <div>
    <div class="header-bar">
      <div class="header-left">
        <div class="header-logo">FW</div>
        <div>
          <div class="brand-name">FAHAD WEAVING FACTORY</div>
          <div class="brand-sub">OPERATIONAL DAILY LEDGER SUITE</div>
        </div>
      </div>
      <div style="text-align: right;">
        <div class="doc-title">${title}</div>
        <div class="doc-meta">Period: <strong>${dateLabel}</strong> &nbsp;|&nbsp; Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>

    <div class="summary-grid">
      <div class="kpi-card opening">
        <div class="kpi-label">Opening Balance</div>
        <div class="kpi-value">Rs ${formatCurrency(opening)}</div>
        <div class="kpi-sub">Start of Period</div>
      </div>
      <div class="kpi-card incoming">
        <div class="kpi-label">Total Incoming</div>
        <div class="kpi-value">Rs ${formatCurrency(incoming)}</div>
        <div class="kpi-sub">${incomingCount} Income Receipts</div>
      </div>
      <div class="kpi-card outgoing">
        <div class="kpi-label">Total Outgoing</div>
        <div class="kpi-value">Rs ${formatCurrency(outgoing)}</div>
        <div class="kpi-sub">${outgoingCount} Expense Payouts</div>
      </div>
      <div class="kpi-card closing">
        <div class="kpi-label">Closing Balance</div>
        <div class="kpi-value">Rs ${formatCurrency(closing)}</div>
        <div class="kpi-sub">Net Available Cash</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 25px; text-align: center;">#</th>
          ${!isSingleDay ? '<th style="width: 85px;">Date & Time</th>' : '<th style="width: 55px;">Time</th>'}
          <th style="width: 65px;">Type</th>
          <th style="width: 90px;">Category</th>
          <th>Party / Particulars</th>
          <th style="width: 70px;">Method</th>
          <th style="width: 85px; text-align: right;">Income (+)</th>
          <th style="width: 85px; text-align: right;">Expense (-)</th>
          <th style="width: 95px; text-align: right;">Running Bal</th>
        </tr>
      </thead>
      <tbody>
        ${tableRowsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="${isSingleDay ? 5 : 6}" style="text-align: right; text-transform: uppercase;">
            Summary Totals:
          </td>
          <td style="text-align: right; color: #059669;">+Rs ${formatCurrency(incoming)}</td>
          <td style="text-align: right; color: #d97706;">-Rs ${formatCurrency(outgoing)}</td>
          <td style="text-align: right; color: #0f172a;">Rs ${formatCurrency(closing)}</td>
        </tr>
      </tfoot>
    </table>

    <div class="report-footer">
      <div>Fahad Weaving Factory Management • Official Financial Printout</div>
      <div>Total Records: ${transactions.length}</div>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Triggers direct browser print dialog for printable HTML
 */
export const printDailySheet = ({ date, summary, transactions }) => {
  const html = buildLedgerReportHtml({
    title: "OPERATIONAL DAILY CASH LEDGER",
    subtitle: "Chronological Cash Flow & Transaction Sheet",
    dateLabel: date || "Today",
    summary,
    transactions,
    isSingleDay: true,
  });
  
  const printWindow = window.open("", "_blank", "width=900,height=750");
  if (!printWindow) return;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 350);
};

export const printAllTransactions = ({ timelineLabel, summary, transactions }) => {
  const html = buildLedgerReportHtml({
    title: "ALL TRANSACTIONS LEDGER REPORT",
    subtitle: "Complete Filtered Operational Cash Flow Transactions",
    dateLabel: timelineLabel || "All Time",
    summary,
    transactions,
    isSingleDay: false,
  });

  const printWindow = window.open("", "_blank", "width=900,height=750");
  if (!printWindow) return;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 350);
};

// Aliases for seamless compatibility
export const exportDailySheetPdf = downloadDailySheetPdf;
export const exportAllTransactionsPdf = downloadAllTransactionsPdf;


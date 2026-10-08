/* eslint-disable prettier/prettier */
import { pkr } from "../../../components/ui-kit.jsx";
import { getBalance } from "./helpers.js";
import { detailContent } from "./content.js";

export const receiptBrand = {
  name: "Fahad WEAVING",
  tagline: "PREMIUM YARN • COTTON • TEXTILES",
  contact: "Faisalabad, Pakistan  |  +92 300 0000000  |  info@fahadweaving.com",
  footer: "Fahad Weaving  |  This is a system-generated receipt and does not require a signature.",
};

const receiptCoreStyles = `
  .receipt, .receipt * { box-sizing: border-box; margin: 0; padding: 0; }
  .receipt {
    font-family: "Segoe UI", Inter, system-ui, sans-serif;
    color: #0c1f3f;
    background: #fff;
    overflow: hidden;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .receipt .header {
    background: #0c1f3f;
    color: #fff;
    padding: 22px 28px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
  }
  .receipt .header-left { display: flex; gap: 14px; align-items: flex-start; }
  .receipt .logo {
    width: 44px; height: 44px;
    border: 2px solid #c9a227;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(201,162,39,.12);
    flex-shrink: 0;
  }
  .receipt .brand { font-size: 22px; font-weight: 800; letter-spacing: .06em; line-height: 1.1; }
  .receipt .tagline { font-size: 9px; font-weight: 700; letter-spacing: .14em; color: #c9a227; margin-top: 6px; }
  .receipt .contact { font-size: 10px; color: rgba(255,255,255,.75); margin-top: 8px; line-height: 1.4; }
  .receipt .header-right { text-align: right; flex-shrink: 0; }
  .receipt .doc-title { font-size: 20px; font-weight: 800; letter-spacing: .08em; }
  .receipt .meta { font-size: 11px; margin-top: 8px; color: rgba(255,255,255,.85); }
  .receipt .meta-label { opacity: .7; margin-right: 4px; }
  .receipt .gold-rule { height: 3px; background: linear-gradient(90deg, #c9a227, #e8d5a3, #c9a227); }
  .receipt .section { padding: 24px 28px 8px; }
  .receipt .section-title {
    font-size: 13px; font-weight: 800; color: #0c1f3f;
    padding-bottom: 10px;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 4px;
  }
  .receipt .details .row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 11px 0;
    border-bottom: 1px solid #f0f2f5;
    gap: 16px;
  }
  .receipt .details .row:last-child { border-bottom: none; }
  .receipt .label { font-size: 12px; color: #6b7280; flex-shrink: 0; }
  .receipt .value { text-align: right; font-size: 13px; }
  .receipt .amount-due {
    margin: 16px 28px;
    padding: 18px 22px;
    background: #f7f4ee;
    border: 1px solid #ebe4d4;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }
  .receipt .amount-label { font-size: 14px; font-weight: 800; color: #0c1f3f; }
  .receipt .amount-hint { font-size: 11px; color: #6b7280; margin-top: 4px; }
  .receipt .amount-value { font-size: 26px; font-weight: 800; color: #c62828; text-align: right; }
  .receipt .amount-payable { font-size: 11px; color: #6b7280; text-align: right; margin-top: 4px; }
  .receipt .notes-section { padding: 8px 28px 28px; }
  .receipt .notes-title { font-size: 13px; font-weight: 800; color: #0c1f3f; margin-bottom: 10px; }
  .receipt .notes-list { padding-left: 18px; font-size: 11px; color: #6b7280; line-height: 1.7; }
  .receipt .footer { margin-top: 8px; }
  .receipt .footer-gold { height: 3px; background: #c9a227; }
  .receipt .footer-bar {
    background: #0c1f3f;
    color: rgba(255,255,255,.65);
    font-size: 9px;
    padding: 10px 28px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
`;

export const receiptStyles = receiptCoreStyles;

export function getReceiptData(purchase) {
  const balance = getBalance(purchase);
  const { fields } = detailContent;

  const defaultNotes = [
    "Please clear the outstanding balance within agreed payment terms.",
    `Quote ${purchase.id} in all correspondence and bank transfers.`,
  ];

  return {
    purchase,
    fields,
    balance,
    rows: [
      { label: fields.po, value: purchase.id },
      { label: fields.vendor, value: purchase.vendor },
      { label: fields.material, value: purchase.material },
      { label: fields.date, value: purchase.date },
      { label: fields.quantity, value: `${purchase.quantity} ${purchase.unit}` },
      { label: fields.total, value: pkr(purchase.total) },
      { label: fields.paid, value: pkr(purchase.paid), tone: "paid" },
      { label: fields.balance, value: balance > 0 ? pkr(balance) : "—", tone: "balance" },
      { label: fields.status, value: purchase.status.toUpperCase(), tone: "status" },
    ],
    notes: purchase.notes ? [purchase.notes, ...defaultNotes.slice(1)] : defaultNotes,
    amountDue: balance > 0 ? pkr(balance) : pkr(0),
    payableTo: purchase.vendor,
  };
}

function statusBadgeHtml(status) {
  const map = {
    PAID: { bg: "#e8f5ee", color: "#1b7a45", dot: "#1b7a45" },
    PENDING: { bg: "#faf3e0", color: "#8a6d1d", dot: "#c9a227" },
    PARTIAL: { bg: "#faf3e0", color: "#8a6d1d", dot: "#c9a227" },
    "ON CREDIT": { bg: "#faf3e0", color: "#8a6d1d", dot: "#c9a227" },
    RECEIVED: { bg: "#e8f0fa", color: "#1e4a8a", dot: "#1e4a8a" },
    ORDERED: { bg: "#e8f0fa", color: "#1e4a8a", dot: "#1e4a8a" },
    CANCELLED: { bg: "#fdecea", color: "#b42318", dot: "#b42318" },
    DISPATCHED: { bg: "#e8f0fa", color: "#1e4a8a", dot: "#1e4a8a" },
  };
  const s = map[status.toUpperCase()] || map.PENDING;
  return `<span style="display:inline-flex;align-items:center;gap:6px;background:${s.bg};color:${s.color};padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.04em"><span style="width:6px;height:6px;border-radius:50%;background:${s.dot}"></span>${status}</span>`;
}

function valueCell(row) {
  if (row.tone === "status") return statusBadgeHtml(row.value);
  if (row.tone === "paid") return `<span style="color:#1b7a45;font-weight:700">${row.value}</span>`;
  if (row.tone === "balance") {
    const red = row.value !== "—";
    return `<span style="color:${red ? "#c62828" : "#0c1f3f"};font-weight:700">${row.value}</span>`;
  }
  return `<span style="color:#0c1f3f;font-weight:700">${row.value}</span>`;
}

export function buildPurchaseReceiptHtml(purchase, { fullDocument = true } = {}) {
  const data = getReceiptData(purchase);
  const { purchase: p, rows, notes, amountDue, payableTo } = data;

  const detailRows = rows
    .map(
      (row) => `
    <div class="row">
      <span class="label">${row.label}</span>
      <span class="value">${valueCell(row)}</span>
    </div>`
    )
    .join("");

  const notesHtml = notes.map((n) => `<li>${n}</li>`).join("");

  const body = `
  <div class="receipt">
    <header class="header">
      <div class="header-left">
        <div class="logo" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4h16v3H4V4zm0 5h10v3H4V9zm0 5h16v3H4v-3zm0 5h8v3H4v-3z" fill="#c9a227"/>
          </svg>
        </div>
        <div>
          <div class="brand">${receiptBrand.name}</div>
          <div class="tagline">${receiptBrand.tagline}</div>
          <div class="contact">${receiptBrand.contact}</div>
        </div>
      </div>
      <div class="header-right">
        <div class="doc-title">PURCHASE RECEIPT</div>
        <div class="meta"><span class="meta-label">PO #</span> <strong>${p.id}</strong></div>
        <div class="meta"><span class="meta-label">Date</span> <strong>${p.date}</strong></div>
      </div>
    </header>
    <div class="gold-rule"></div>

    <section class="section">
      <h2 class="section-title">Purchase Details</h2>
      <div class="details">${detailRows}</div>
    </section>

    <section class="amount-due">
      <div>
        <div class="amount-label">Amount Due</div>
        <div class="amount-hint">Outstanding balance for this purchase order</div>
      </div>
      <div class="amount-right">
        <div class="amount-value">${amountDue}</div>
        <div class="amount-payable">Payable to ${payableTo}</div>
      </div>
    </section>

    <section class="notes-section">
      <h3 class="notes-title">Notes</h3>
      <ul class="notes-list">${notesHtml}</ul>
    </section>

    <footer class="footer">
      <div class="footer-gold"></div>
      <div class="footer-bar">
        <span>${receiptBrand.footer}</span>
        <span>Page 1 of 1</span>
      </div>
    </footer>
  </div>`;

  if (!fullDocument) return body;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${p.id} — Purchase Receipt — Fahad Weaving</title>
  <style>
    body {
      background: #eef1f6;
      padding: 24px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body > .receipt {
      max-width: 720px;
      margin: 0 auto;
      box-shadow: 0 8px 32px rgba(12,31,63,.12);
    }
    ${receiptCoreStyles}
    @media print {
      body { background: #fff; padding: 0; }
      body > .receipt { box-shadow: none; max-width: 100%; }
    }
  </style>
</head>
<body>${body}</body>
</html>`;
}

function escapePdf(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function pdfText(x, y, text, size, rgb = "0.05 0.12 0.24") {
  return `BT /F1 ${size} Tf ${rgb} rg ${x} ${y} Td (${escapePdf(text)}) Tj ET`;
}

function pdfRect(x, y, w, h, rgb, stroke = false) {
  const op = stroke ? "S" : "f";
  const colorOp = stroke ? "RG" : "rg";
  return `${rgb} ${colorOp}\n${x} ${y} ${w} ${h} re\n${op}`;
}

export async function createPurchaseReceiptPdf(purchase, options = {}) {
  const data = getReceiptData(purchase);
  const pageWidth = 595;
  const pageHeight = 842;
  const L = 40;
  const R = 555;

  const lines = [
    pdfRect(0, 0, pageWidth, pageHeight, "1 1 1"),
    pdfRect(0, 752, pageWidth, 90, "0.047 0.122 0.247"),
    pdfRect(0, 750, pageWidth, 3, "0.773 0.635 0.349"),
    pdfRect(L, 768, 36, 36, "0.773 0.635 0.349", true),
    pdfText(L + 48, 808, receiptBrand.name, 16, "1 1 1"),
    pdfText(L + 48, 792, receiptBrand.tagline, 7, "0.773 0.635 0.349"),
    pdfText(L + 48, 778, "Faisalabad, Pakistan", 7, "0.85 0.88 0.92"),
    pdfText(360, 808, "PURCHASE RECEIPT", 14, "1 1 1"),
    pdfText(360, 790, `PO #  ${data.purchase.id}`, 10, "1 1 1"),
    pdfText(360, 774, `Date  ${data.purchase.date}`, 10, "1 1 1"),
    pdfText(L, 728, "Purchase Details", 11, "0.047 0.122 0.247"),
    pdfRect(L, 726, R - L, 0.5, "0.88 0.9 0.94"),
  ];

  let y = 708;
  data.rows.forEach((row) => {
    lines.push(pdfText(L, y, row.label, 9, "0.42 0.45 0.5"));
    const val = row.tone === "status" ? row.value : row.value.replace(/Rs\s/g, "Rs ");
    let valColor = "0.047 0.122 0.247";
    if (row.tone === "paid") valColor = "0.11 0.48 0.27";
    if (row.tone === "balance" && data.balance > 0) valColor = "0.78 0.16 0.16";
    const truncated = val.length > 42 ? `${val.slice(0, 39)}...` : val;
    lines.push(pdfText(280, y, truncated, 10, valColor));
    y -= 22;
    lines.push(pdfRect(L, y + 8, R - L, 0.3, "0.94 0.95 0.96"));
  });

  y -= 12;
  lines.push(pdfRect(L, y - 52, R - L, 56, "0.97 0.96 0.93"));
  lines.push(pdfRect(L, y - 52, R - L, 56, "0.9 0.86 0.78", true));
  lines.push(pdfText(L + 12, y - 18, "Amount Due", 11, "0.047 0.122 0.247"));
  lines.push(pdfText(L + 12, y - 32, "Outstanding balance for this purchase order", 8, "0.42 0.45 0.5"));
  lines.push(pdfText(400, y - 22, data.amountDue, 18, "0.78 0.16 0.16"));
  const vendorShort = data.payableTo.length > 28 ? `${data.payableTo.slice(0, 25)}...` : data.payableTo;
  lines.push(pdfText(340, y - 38, `Payable to ${vendorShort}`, 8, "0.42 0.45 0.5"));

  y -= 70;
  lines.push(pdfText(L, y, "Notes", 11, "0.047 0.122 0.247"));
  y -= 16;
  data.notes.forEach((note) => {
    const t = note.length > 75 ? `${note.slice(0, 72)}...` : note;
    lines.push(pdfText(L + 8, y, `• ${t}`, 8, "0.42 0.45 0.5"));
    y -= 14;
  });

  lines.push(pdfRect(0, 28, pageWidth, 3, "0.773 0.635 0.349"));
  lines.push(pdfRect(0, 0, pageWidth, 28, "0.047 0.122 0.247"));
  lines.push(pdfText(L, 12, receiptBrand.footer, 7, "0.75 0.78 0.82"));
  lines.push(pdfText(500, 12, "Page 1 of 1", 7, "0.75 0.78 0.82"));

  const stream = lines.join("\n");

  // Prepare page content as Uint8Array
  const encoder = new TextEncoder();
  const streamBytes = encoder.encode(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);

  // Build objects array; object 4 is font, 5 is contents by default
  const objects = [];
  objects.push(encoder.encode("<< /Type /Catalog /Pages 2 0 R >>"));
  objects.push(encoder.encode("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"));

  // Resources will include Font and optionally XObject for image
  let resources = `<< /Font << /F1 4 0 R >> >>`;

  // If logo bytes provided, build image XObject and include in resources
  let imageObjectBytes = null;
  let imageRefIndex = null;
  if (options.logo && options.logo.data) {
    const img = options.logo;
    const imgLen = img.data.length;
    const imgWidth = img.width || 36;
    const imgHeight = img.height || 36;
    // Image object content (JPEG with DCTDecode)
    const header = `<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgLen} >>\nstream\n`;
    const footer = "\nendstream";
    const headerBytes = encoder.encode(header);
    const footerBytes = encoder.encode(footer);
    // Compose image object bytes
    imageObjectBytes = new Uint8Array(headerBytes.length + imgLen + footerBytes.length);
    imageObjectBytes.set(headerBytes, 0);
    imageObjectBytes.set(img.data, headerBytes.length);
    imageObjectBytes.set(footerBytes, headerBytes.length + imgLen);
    // We'll append this object after font object; record its index later
    resources = `<< /Font << /F1 4 0 R >> /XObject << /Im1 ${"__IMGREF__"} 0 R >> >>`;
  }

  const pageObjTemplate = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources ${resources} /Contents 5 0 R >>`;
  objects.push(encoder.encode(pageObjTemplate));
  objects.push(encoder.encode("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"));
  objects.push(streamBytes);

  // If we have image object, replace placeholder and insert image object into objects array
  if (imageObjectBytes) {
    // image object index will be objects.length + 1 (1-based)
    imageRefIndex = objects.length + 1;
    // Replace placeholder in page object bytes
    const pageObjIndex = 2; // zero-based index in objects array for page object
    const pageObjStr = new TextDecoder().decode(objects[pageObjIndex]);
    const replaced = pageObjStr.replace('__IMGREF__', String(imageRefIndex));
    objects[pageObjIndex] = encoder.encode(replaced);
    // Append image object
    objects.push(imageObjectBytes);
  }

  // Assemble PDF body as binary
  let bodyParts = [];
  const pdfHeader = encoder.encode("%PDF-1.4\n");
  bodyParts.push(pdfHeader);
  const offsets = [0];
  let cursor = pdfHeader.length;
  for (let i = 0; i < objects.length; i++) {
    offsets.push(cursor);
    const idx = i + 1;
    const header = encoder.encode(`${idx} 0 obj\n`);
    bodyParts.push(header);
    cursor += header.length;
    bodyParts.push(objects[i]);
    cursor += objects[i].length;
    const end = encoder.encode(`\nendobj\n`);
    bodyParts.push(end);
    cursor += end.length;
  }
  const xrefPos = cursor;
  // Build xref
  const xrefHeader = encoder.encode(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  bodyParts.push(xrefHeader);
  cursor += xrefHeader.length;
  for (let i = 1; i < offsets.length; i++) {
    const off = String(offsets[i]).padStart(10, "0") + " 00000 n \n";
    const offBytes = encoder.encode(off);
    bodyParts.push(offBytes);
    cursor += offBytes.length;
  }
  const trailer = encoder.encode(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`);
  bodyParts.push(trailer);

  // Concatenate all parts into single Uint8Array
  let total = 0;
  for (const p of bodyParts) total += p.length;
  const out = new Uint8Array(total);
  let pos = 0;
  for (const p of bodyParts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out.buffer;
}

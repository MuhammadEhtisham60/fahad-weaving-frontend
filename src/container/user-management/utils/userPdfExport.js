// PDF export utility for User Management list and profile sheets

export function downloadUsersPdf(rows, filterLabel = "All Users") {
  const pdf = createUsersPdf(rows, filterLabel);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `abc-weaving-users-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadUserSummaryCsv(rows) {
  const headers = [
    "User ID",
    "Username",
    "Full Name",
    "Email",
    "Phone",
    "Role",
    "Department",
    "Designation",
    "Company",
    "Branch",
    "Status",
    "Last Login",
    "Created Date",
  ];

  const csvRows = [headers.join(",")];

  rows.forEach((u) => {
    const row = [
      `"${u.id || ""}"`,
      `"${u.username || ""}"`,
      `"${u.fullName || ""}"`,
      `"${u.email || ""}"`,
      `"${u.phone || ""}"`,
      `"${u.role || ""}"`,
      `"${u.department || ""}"`,
      `"${u.designation || ""}"`,
      `"${u.company || ""}"`,
      `"${u.branch || ""}"`,
      `"${u.status || ""}"`,
      `"${u.lastLogin || ""}"`,
      `"${u.createdDate || ""}"`,
    ];
    csvRows.push(row.join(","));
  });

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `abc-weaving-users-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function createUsersPdf(rows, filterLabel) {
  const pageWidth = 842;
  const pageHeight = 595;
  const left = 36;
  const top = 480;
  const rowHeight = 24;
  const columns = [
    { label: "ID", x: 42, width: 44 },
    { label: "Username", x: 90, width: 75 },
    { label: "Full Name", x: 170, width: 105 },
    { label: "Role", x: 280, width: 85 },
    { label: "Department", x: 370, width: 85 },
    { label: "Designation", x: 460, width: 100 },
    { label: "Phone", x: 565, width: 85 },
    { label: "Branch", x: 655, width: 95 },
    { label: "Status", x: 755, width: 50 },
  ];

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
    "BT /F1 12 Tf 1 1 1 rg 98 545 Td (ABC Weaving ERP) Tj ET",
    "BT /F1 7 Tf 0.9 0.84 1 rg 98 531 Td (SITE Industrial Area - Karachi) Tj ET",
    "BT /F1 7 Tf 0.9 0.84 1 rg 98 519 Td (User Management & Access Control Registry) Tj ET",
    "BT /F1 20 Tf 1 1 1 rg 280 540 Td (User Accounts Directory) Tj ET",
    `BT /F1 8 Tf 0.96 0.92 1 rg 295 523 Td (${escapePdf(`Filter: ${filterLabel} | Total Users: ${rows.length}`)}) Tj ET`,
    `BT /F1 11 Tf 1 1 1 rg 640 546 Td (${escapePdf(`Date: ${generatedDate}`)}) Tj ET`,
    `BT /F1 11 Tf 1 1 1 rg 640 530 Td (${escapePdf(`Time: ${generatedTime}`)}) Tj ET`,
    `BT /F1 11 Tf 1 1 1 rg 640 514 Td (${escapePdf(`Records: ${rows.length}`)}) Tj ET`,
    "1 1 1 rg 36 82 770 404 re f",
    "0.88 0.84 0.94 RG 36 82 770 404 re S",
    "0.95 0.92 1 rg 36 462 770 24 re f",
    "0.72 0.65 0.82 RG 36 462 770 24 re S",
    "BT /F1 8 Tf 0.25 0.18 0.36 rg",
    ...columns.map((column) => `${column.x} 470 Td (${escapePdf(column.label)}) Tj ${-column.x} -470 Td`),
    "ET",
  ];

  visibleRows.forEach((user, index) => {
    const y = top - 42 - index * rowHeight;
    const fill = index % 2 === 0 ? "1 1 1 rg" : "0.985 0.975 1 rg";
    const isActive = user.status === "Active";
    const isSuspended = user.status === "Suspended";
    const isPending = user.status === "Pending";

    const values = [
      user.id || "",
      `@${user.username || ""}`,
      user.fullName || "",
      user.role || "",
      user.department || "",
      user.designation || "",
      user.phone || "",
      user.branch ? user.branch.split(" - ")[0] : "",
      user.status || "",
    ];

    lines.push(fill);
    lines.push(`${left} ${y - 8} 770 ${rowHeight} re f`);
    lines.push("0.9 0.86 0.95 RG");
    lines.push(`${left} ${y - 8} 770 ${rowHeight} re S`);
    lines.push("BT /F1 8 Tf 0.12 0.1 0.16 rg");
    values.forEach((value, columnIndex) => {
      const column = columns[columnIndex];
      if (column.label === "Status") return;
      const text = truncateText(String(value), column.width);
      lines.push(`${column.x} ${y} Td (${escapePdf(text)}) Tj ${-column.x} ${-y} Td`);
    });
    lines.push("ET");

    // Status Badge Box
    if (isActive) lines.push("0.9 0.98 0.94 rg");
    else if (isSuspended) lines.push("0.99 0.92 0.92 rg");
    else if (isPending) lines.push("1 0.97 0.9 rg");
    else lines.push("0.93 0.92 0.95 rg");

    lines.push(`${columns[8].x - 2} ${y - 5} 46 14 re f`);

    if (isActive) lines.push("0.08 0.55 0.26 rg");
    else if (isSuspended) lines.push("0.75 0.15 0.15 rg");
    else if (isPending) lines.push("0.75 0.45 0.1 rg");
    else lines.push("0.39 0.36 0.45 rg");

    lines.push(`BT /F1 7 Tf ${columns[8].x + 4} ${y - 1} Td (${escapePdf(user.status)}) Tj ET`);
  });

  if (!visibleRows.length) {
    lines.push("BT /F1 11 Tf 0.38 0.34 0.45 rg 320 290 Td (No user records found.) Tj ET");
  }

  lines.push("0.49 0.23 0.93 rg 36 58 770 2 re f");
  lines.push(`BT /F1 8 Tf 0.38 0.34 0.45 rg 52 40 Td (${escapePdf(`Showing ${visibleRows.length} of ${rows.length} users | Generated on ${generatedDate}`)}) Tj ET`);
  lines.push("BT /F1 8 Tf 0.38 0.34 0.45 rg 660 40 Td (ABC Weaving Factory ERP) Tj ET");

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

function truncateText(value, maxWidth) {
  const maxChars = Math.max(7, Math.floor(maxWidth / 4.8));
  return value.length > maxChars ? `${value.slice(0, maxChars - 3)}...` : value;
}

function escapePdf(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Filter, Download, Search, Mail, Phone, ArrowUpRight } from "lucide-react";
import { PageHeader, Card, Button, StatusBadge, fmt, pkr } from "../../components/ui-kit.jsx";
import { employees, departments } from "../../lib/mock-data.js";

export const Route = createFileRoute("/hr/employees/")({ component: EmployeesPage });

function EmployeesPage() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");
  const filtered = employees.filter((e) =>
    (dept === "All" || e.department === dept) &&
    (e.name.toLowerCase().includes(q.toLowerCase()) || e.id.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${employees.length} team members across ${departments.length} departments`}
        actions={<>
          <Button variant="outline" onClick={() => downloadEmployeesPdf(filtered)}><Download className="h-4 w-4" /> Export</Button>
          <Link to="/hr/employees/add">
            <Button><Plus className="h-4 w-4" /> New Employee</Button>
          </Link>
        </>}
      />

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search by name or ID..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-sm" />
          </div>
          <select value={dept} onChange={(e)=>setDept(e.target.value)} className="h-10 px-4 rounded-lg bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-sm">
            <option>All</option>
            {departments.map((d)=><option key={d}>{d}</option>)}
          </select>
          <Button variant="outline"><Filter className="h-4 w-4" /> Filters</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {filtered.map((e) => (
          <Link key={e.id} to="/hr/employees/$employeeId" params={{ employeeId: e.id }}>
          <Card className="h-full hover:shadow-elegant hover:-translate-y-0.5 transition-smooth cursor-pointer">
            <div className="flex items-start gap-3">
              <img src={e.avatar} className="h-14 w-14 rounded-2xl object-cover ring-2 ring-primary/20" alt="" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-semibold truncate">{e.name}</div>
                  <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="text-xs text-muted-foreground">{e.designation}</div>
                <div className="mt-1"><StatusBadge status={e.status} /></div>
              </div>
            </div>
            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> {e.phone}</div>
              <div className="flex items-center gap-2"><Mail className="h-3 w-3" /> {e.id.toLowerCase()}@forge.io</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 pt-4 border-t border-border">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Department</div>
                <div className="text-sm font-medium">{e.department}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Salary</div>
                <div className="text-sm font-medium">{e.salaryType === "Per Day" ? `${pkr(e.perDayRate)} / day` : pkr(e.salary)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Shift</div>
                <div className="text-sm font-medium">{e.shift}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Joined</div>
                <div className="text-sm font-medium">{e.joining}</div>
              </div>
            </div>
          </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function downloadEmployeesPdf(rows) {
  const pdf = createEmployeesPdf(rows);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fahad-weaving-employees-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function createEmployeesPdf(rows) {
  const pageWidth = 842;
  const pageHeight = 595;
  const left = 36;
  const top = 480;
  const rowHeight = 24;
  const columns = [
    { label: "ID", x: 42, width: 48 },
    { label: "Name", x: 98, width: 118 },
    { label: "Department", x: 224, width: 88 },
    { label: "Designation", x: 320, width: 112 },
    { label: "Phone", x: 440, width: 98 },
    { label: "Salary Type", x: 546, width: 86 },
    { label: "Salary / Rate", x: 640, width: 92 },
    { label: "Status", x: 740, width: 58 },
  ];
  const visibleRows = rows.slice(0, 18);
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
    "BT /F1 12 Tf 1 1 1 rg 98 545 Td (Fahad Weaving) Tj ET",
    "BT /F1 7 Tf 0.9 0.84 1 rg 98 531 Td (SITE Industrial Area - FSD) Tj ET",
    "BT /F1 7 Tf 0.9 0.84 1 rg 98 519 Td (Factory Management ERP) Tj ET",
    "BT /F1 22 Tf 1 1 1 rg 300 540 Td (Employee List Report) Tj ET",
    "BT /F1 8 Tf 0.96 0.92 1 rg 314 523 Td (Professional workforce summary) Tj ET",
    `BT /F1 11 Tf 1 1 1 rg 650 546 Td (${escapePdf(`Date: ${generatedDate}`)}) Tj ET`,
    `BT /F1 11 Tf 1 1 1 rg 650 530 Td (${escapePdf(`Time: ${generatedTime}`)}) Tj ET`,
    `BT /F1 11 Tf 1 1 1 rg 650 514 Td (${escapePdf(`Records: ${rows.length}`)}) Tj ET`,
    "1 1 1 rg 36 82 770 404 re f",
    "0.88 0.84 0.94 RG 36 82 770 404 re S",
    "0.95 0.92 1 rg 36 462 770 24 re f",
    "0.72 0.65 0.82 RG 36 462 770 24 re S",
    "BT /F1 8 Tf 0.25 0.18 0.36 rg",
    ...columns.map((column) => `${column.x} 470 Td (${escapePdf(column.label)}) Tj ${-column.x} -470 Td`),
    "ET",
  ];

  visibleRows.forEach((employee, index) => {
    const y = top - 42 - index * rowHeight;
    const fill = index % 2 === 0 ? "1 1 1 rg" : "0.985 0.975 1 rg";
    const salary = employee.salaryType === "Per Day" ? `${pkr(employee.perDayRate)} / day` : pkr(employee.salary);
    const isActive = employee.status === "Active";
    const values = [
      employee.id,
      employee.name,
      employee.department,
      employee.designation,
      employee.phone,
      employee.salaryType || "Monthly Fixed",
      salary,
      employee.status,
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
    lines.push(isActive ? "0.9 0.98 0.94 rg" : "0.93 0.92 0.95 rg");
    lines.push(`${columns[7].x - 2} ${y - 5} 50 14 re f`);
    lines.push(isActive ? "0.08 0.55 0.26 rg" : "0.39 0.36 0.45 rg");
    lines.push(`BT /F1 7 Tf ${columns[7].x + 6} ${y - 1} Td (${escapePdf(employee.status)}) Tj ET`);
  });

  if (!visibleRows.length) {
    lines.push("BT /F1 11 Tf 0.38 0.34 0.45 rg 318 290 Td (No employee records found.) Tj ET");
  }

  lines.push("0.49 0.23 0.93 rg 36 58 770 2 re f");
  lines.push(`BT /F1 8 Tf 0.38 0.34 0.45 rg 52 40 Td (${escapePdf(`Showing ${visibleRows.length} of ${rows.length} employees`)}) Tj ET`);
  lines.push("BT /F1 8 Tf 0.38 0.34 0.45 rg 650 40 Td (Fahad Weaving ERP) Tj ET");

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
  const maxChars = Math.max(8, Math.floor(maxWidth / 4.6));
  return value.length > maxChars ? `${value.slice(0, maxChars - 3)}...` : value;
}

function escapePdf(value) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

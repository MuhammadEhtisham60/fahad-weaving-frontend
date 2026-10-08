// Mock data for the entire ERP. Single source so dashboards stay in sync.
export const employees = [
  { id: "EMP001", name: "Ahmad Khan", phone: "+92 300 1234567", cnic: "35202-1234567-1", department: "Production", designation: "Floor Supervisor", joining: "2022-03-12", salaryType: "Monthly Fixed", salary: 65000, perDayRate: 0, payCycle: "Monthly", shift: "Morning (8-5)", status: "Active", avatar: "https://i.pravatar.cc/120?img=12" },
  { id: "EMP002", name: "Fatima Noor", phone: "+92 301 9876543", cnic: "35202-7654321-2", department: "HR", designation: "HR Manager", joining: "2021-07-04", salaryType: "Monthly Fixed", salary: 90000, perDayRate: 0, payCycle: "Monthly", shift: "Morning (9-6)", status: "Active", avatar: "https://i.pravatar.cc/120?img=47" },
  { id: "EMP003", name: "Bilal Ahmed", phone: "+92 333 5551122", cnic: "42101-3344556-3", department: "Production", designation: "Machine Operator", joining: "2023-01-20", salaryType: "Per Day", salary: 0, perDayRate: 1800, payCycle: "15 Days", shift: "Evening (2-11)", status: "Active", avatar: "https://i.pravatar.cc/120?img=15" },
  { id: "EMP004", name: "Ayesha Siddiqui", phone: "+92 321 4422110", cnic: "35202-9988776-4", department: "Accounts", designation: "Accountant", joining: "2020-11-15", salaryType: "Monthly Fixed", salary: 75000, perDayRate: 0, payCycle: "Monthly", shift: "Morning (9-6)", status: "Active", avatar: "https://i.pravatar.cc/120?img=49" },
  { id: "EMP005", name: "Usman Tariq", phone: "+92 345 7788990", cnic: "35202-2233445-5", department: "Store", designation: "Store Keeper", joining: "2022-08-30", salaryType: "Per Day", salary: 0, perDayRate: 1500, payCycle: "15 Days", shift: "Morning (8-5)", status: "Active", avatar: "https://i.pravatar.cc/120?img=33" },
  { id: "EMP006", name: "Sana Iqbal", phone: "+92 311 6655443", cnic: "35202-1122334-6", department: "Sales", designation: "Sales Executive", joining: "2023-06-10", salaryType: "Monthly Fixed", salary: 55000, perDayRate: 0, payCycle: "Monthly", shift: "Morning (9-6)", status: "Inactive", avatar: "https://i.pravatar.cc/120?img=44" },
  { id: "EMP007", name: "Hamza Raza", phone: "+92 302 1010202", cnic: "35202-5566778-7", department: "Production", designation: "Quality Inspector", joining: "2021-02-18", salaryType: "Monthly Fixed", salary: 48000, perDayRate: 0, payCycle: "Monthly", shift: "Night (10-7)", status: "Active", avatar: "https://i.pravatar.cc/120?img=58" },
  { id: "EMP008", name: "Mariam Sheikh", phone: "+92 308 7172829", cnic: "35202-9090909-8", department: "Labour", designation: "Labour", joining: "2022-12-01", salaryType: "Per Day", salary: 0, perDayRate: 1400, payCycle: "15 Days", shift: "Morning (9-6)", status: "Active", avatar: "https://i.pravatar.cc/120?img=20" },
];

export const todayAttendance = [
  { id: "EMP001", checkIn: "08:55", breakStart: "13:00", breakEnd: "13:30", checkOut: "17:05", status: "Present" },
  { id: "EMP002", checkIn: "09:12", breakStart: "13:15", breakEnd: "13:45", checkOut: "18:02", status: "Late" },
  { id: "EMP003", checkIn: "14:00", breakStart: "18:00", breakEnd: "18:30", checkOut: "23:05", status: "Present" },
  { id: "EMP004", checkIn: "09:00", breakStart: "13:00", breakEnd: "13:30", checkOut: "—", status: "Working" },
  { id: "EMP005", checkIn: "08:48", breakStart: "13:00", breakEnd: "13:30", checkOut: "17:10", status: "Present" },
  { id: "EMP007", checkIn: "—", checkOut: "—", status: "Absent" },
  { id: "EMP008", checkIn: "09:05", breakStart: "13:00", breakEnd: "13:25", checkOut: "—", status: "Working" },
];

export const inventory = [
  { id: "ITM-1001", name: "Cotton Yarn 30s", category: "Raw Material", sub: "Yarn", stock: 1250, unit: "kg", min: 500, price: 850, supplier: "Khan Textiles" },
  { id: "ITM-1002", name: "Polyester Thread", category: "Raw Material", sub: "Thread", stock: 320, unit: "spool", min: 400, price: 220, supplier: "Lahore Threads" },
  { id: "ITM-1003", name: "Industrial Sewing Needle", category: "Spare Part", sub: "Machine", stock: 85, unit: "pack", min: 50, price: 1200, supplier: "Singer Co." },
  { id: "ITM-1004", name: "Cotton Fabric Roll", category: "Raw Material", sub: "Fabric", stock: 48, unit: "roll", min: 60, price: 7500, supplier: "Faisal Mills" },
  { id: "ITM-1005", name: "Packing Carton", category: "Packaging", sub: "Box", stock: 2400, unit: "pcs", min: 1000, price: 45, supplier: "PackPro" },
  { id: "ITM-1006", name: "Lubricant Oil 5L", category: "Maintenance", sub: "Oil", stock: 22, unit: "can", min: 30, price: 1800, supplier: "Shell Industrial" },
  { id: "ITM-1007", name: "Finished T-Shirt M", category: "Finished Goods", sub: "Apparel", stock: 5400, unit: "pcs", min: 2000, price: 480, supplier: "—" },
  { id: "ITM-1008", name: "Finished Polo L", category: "Finished Goods", sub: "Apparel", stock: 1850, unit: "pcs", min: 2000, price: 720, supplier: "—" },
];

export const PURCHASE_STATUSES = ["Paid", "Pending", "Partial", "On Credit", "Received", "Ordered", "Cancelled"];

export const yarnVendors = [
  "Khan Textiles (Faisalabad)",
  "Faisal Mills",
  "Lahore Threads",
  "Al-Rehman Yarn Traders",
  "Sargodha Cotton Mills",
  "PackPro",
  "Shell Industrial",
];

export const purchases = [
  { id: "PO-2401", vendor: "Khan Textiles (Faisalabad)", date: "2025-05-02", material: "Cotton Yarn 30s (warp)", quantity: 500, unit: "kg", total: 425000, paid: 425000, status: "Paid" },
  { id: "PO-2402", vendor: "Faisal Mills", date: "2025-05-06", material: "Polyester Yarn 40s (weft)", quantity: 320, unit: "kg", total: 360000, paid: 200000, status: "Partial" },
  { id: "PO-2403", vendor: "Al-Rehman Yarn Traders", date: "2025-05-09", material: "Cotton Cone Yarn 20s", quantity: 180, unit: "kg", total: 156000, paid: 0, status: "On Credit" },
  { id: "PO-2404", vendor: "Sargodha Cotton Mills", date: "2025-05-11", material: "Grey Yarn 16s (loom feed)", quantity: 600, unit: "kg", total: 498000, paid: 0, status: "Pending" },
  { id: "PO-2405", vendor: "Lahore Threads", date: "2025-05-13", material: "Polyester Thread (cone)", quantity: 120, unit: "cone", total: 26400, paid: 26400, status: "Paid" },
  { id: "PO-2406", vendor: "Khan Textiles (Faisalabad)", date: "2025-05-18", material: "Cotton Yarn 30s", quantity: 400, unit: "kg", total: 340000, paid: 0, status: "Ordered" },
];

export const SALE_STATUSES = ["Paid", "Pending", "Partial", "On Credit", "Delivered", "Dispatched", "Cancelled"];

export const clothCustomers = [
  "Metro Garments (Karachi)",
  "Style Hub",
  "Urban Threads",
  "Karachi Outlets",
  "Lahore Bazaar",
  "Faisalabad Wholesale",
  "Sialkot Exporters",
];

export const sales = [
  { id: "INV-9001", customer: "Metro Garments (Karachi)", date: "2025-05-03", product: "Grey Loom Fabric 60\"", quantity: 1200, unit: "meters", total: 480000, paid: 480000, status: "Paid" },
  { id: "INV-9002", customer: "Style Hub", date: "2025-05-05", product: "Finished Cotton Cloth (bleached)", quantity: 800, unit: "meters", total: 352000, paid: 352000, status: "Paid" },
  { id: "INV-9003", customer: "Urban Threads", date: "2025-05-08", product: "Power Loom Grey Roll", quantity: 2400, unit: "meters", total: 820000, paid: 0, status: "Pending" },
  { id: "INV-9004", customer: "Karachi Outlets", date: "2025-05-10", product: "Woven Shirting Fabric", quantity: 450, unit: "meters", total: 198000, paid: 198000, status: "Delivered" },
  { id: "INV-9005", customer: "Lahore Bazaar", date: "2025-05-12", product: "Grey Loom Fabric 48\"", quantity: 3000, unit: "meters", total: 1050000, paid: 500000, status: "Partial" },
  { id: "INV-9006", customer: "Faisalabad Wholesale", date: "2025-05-16", product: "Cotton Greige Cloth", quantity: 1500, unit: "meters", total: 540000, paid: 0, status: "On Credit" },
];

export const payroll = employees.map((e) => {
  const advance = e.id === "EMP001" ? 10000 : e.id === "EMP004" ? 15000 : 0;
  const overtime = e.id === "EMP003" ? 4500 : e.id === "EMP007" ? 3200 : 0;
  const deduction = e.id === "EMP006" ? 2000 : 0;
  const presentDays = e.salaryType === "Per Day" ? (e.id === "EMP003" ? 13 : e.id === "EMP008" ? 12 : 11) : 26;
  const gross = e.salaryType === "Per Day" ? e.perDayRate * presentDays : e.salary;
  const net = gross + overtime - advance - deduction;
  return { ...e, advance, overtime, deduction, presentDays, gross, net, month: "May 2025", paid: e.id !== "EMP002" && e.id !== "EMP008" };
});

export const monthlyChart = [
  { month: "Dec", sales: 2100000, purchases: 1450000 },
  { month: "Jan", sales: 2350000, purchases: 1620000 },
  { month: "Feb", sales: 2050000, purchases: 1380000 },
  { month: "Mar", sales: 2780000, purchases: 1820000 },
  { month: "Apr", sales: 3120000, purchases: 2050000 },
  { month: "May", sales: 1488000, purchases: 1031000 },
];

export const attendanceTrend = [
  { day: "Mon", present: 7, absent: 1, late: 0 },
  { day: "Tue", present: 6, absent: 1, late: 1 },
  { day: "Wed", present: 7, absent: 1, late: 0 },
  { day: "Thu", present: 5, absent: 2, late: 1 },
  { day: "Fri", present: 6, absent: 1, late: 1 },
  { day: "Sat", present: 7, absent: 0, late: 1 },
];

export const departments = ["Production", "HR", "Accounts", "Store", "Sales", "Procurement"];

export function calcHours(a) {
  if (!a.checkIn || a.checkIn === "—" || !a.checkOut || a.checkOut === "—") return 0;
  const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  let total = toMin(a.checkOut) - toMin(a.checkIn);
  if (a.breakStart && a.breakEnd && a.breakStart !== "—") total -= toMin(a.breakEnd) - toMin(a.breakStart);
  return Math.max(0, total / 60);
}

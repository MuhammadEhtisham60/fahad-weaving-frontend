export const pageContent = {
  title: "Purchases",
  subtitle: "Yarn & raw material from vendors — payment tracking for power looms",
  tableTitle: "Yarn & material purchases",
  newButton: "New Purchase",
  exportButton: "Export",
};

export const statLabels = {
  total: "Total Purchases",
  paid: "Paid",
  outstanding: "Outstanding",
  pending: "Pending / ordered",
};

export const formContent = {
  title: "New Yarn Purchase",
  subtitle: "Raw material for power looms",
  save: "Save Purchase",
  cancel: "Cancel",
  labels: {
    vendor: "Vendor / supplier",
    material: "Yarn / material",
    quantity: "Quantity",
    unit: "Unit",
    total: "Bill amount (Rs)",
    paid: "Paid now (Rs)",
    date: "Purchase date",
    status: "Payment status",
    notes: "Notes (optional)",
  },
  placeholders: {
    material: "e.g. Cotton Yarn 30s, Polyester weft",
    quantity: "500",
    total: "425000",
    paid: "0",
    notes: "Loom #, gate pass, delivery challan…",
  },
};

export const viewModalContent = {
  title: "View purchase order",
  subtitle: "Fahad Weaving",
};

export const detailContent = {
  title: "Purchase details",
  empty: "Select a purchase order from the table to view details.",
  view: "View full order",
  downloadPdf: "Download PDF",
  fields: {
    po: "PO #",
    vendor: "Vendor",
    material: "Material",
    date: "Date",
    quantity: "Quantity",
    total: "Total",
    paid: "Paid",
    balance: "Balance",
    status: "Status",
    notes: "Notes",
  },
};

export const tableColumns = [
  { key: "id", label: "PO #", align: "left", minWidth: "5.5rem" },
  { key: "vendor", label: "Vendor", align: "left", minWidth: "11rem" },
  { key: "material", label: "Material", align: "left", minWidth: "14rem" },
  { key: "date", label: "Date", align: "left", minWidth: "6.5rem" },
  { key: "quantity", label: "Qty", align: "right", minWidth: "5.5rem" },
  { key: "total", label: "Total", align: "right", minWidth: "7.5rem" },
  { key: "paid", label: "Paid", align: "right", minWidth: "7.5rem" },
  { key: "balance", label: "Balance", align: "right", minWidth: "7.5rem" },
  { key: "status", label: "Status", align: "left", minWidth: "7rem" },
  { key: "change", label: "Change", align: "left", minWidth: "9rem" },
];

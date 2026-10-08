// Master Constants and Configuration for Raw Manufacturing module

export const YARN_TYPES = [
  "100% Ring Spun Cotton",
  "100% Combed Cotton",
  "Carded Cotton Yarn",
  "Poly-Cotton (PC 65/35)",
  "Poly-Cotton (PC 52/48)",
  "100% Polyester Spun",
  "Viscose Rayon",
  "Open End (OE) Grey Yarn",
];

export const YARN_COUNTS = [
  "10s / 1",
  "16s / 1",
  "20s / 1",
  "20s / 2",
  "30s / 1",
  "40s / 1",
  "52s / 1",
  "60s / 1",
  "80s / 2 Combed",
];

export const RAW_MATERIAL_STATUSES = [
  "Received",
  "Available",
  "Partially Sent to Sizing",
  "Fully Sent to Sizing",
  "Completed",
];

export const SIZING_STATUSES = [
  "Pending",
  "Sent to Sizing",
  "In Sizing",
  "Partially Received",
  "Fully Received",
  "Completed",
];

export const BEAM_STATUSES = [
  "Created",
  "Available",
  "Ready for Loom",
  "Assigned to Loom",
  "In Production",
  "Removed from Loom",
  "Completed",
];

export const LOOM_STATUSES = [
  "Running",
  "Idle",
  "Under Maintenance",
  "Stopped",
  "Inactive",
];

export const LOOM_TYPES = [
  "Rapier High Speed",
  "Air Jet Loom",
  "Projectile (Sulzer)",
  "Water Jet Loom",
  "Auto Shuttle Loom",
];

export const SIZING_UNITS = [
  "Al-Madina Sizing & Warping Mills (Faisalabad)",
  "National Sizing Plant #2 (Karachi)",
  "Super Fine Sizing Works (Sheikhupura)",
  "Al-Rehman High-Tech Sizing (Faisalabad)",
  "Crescent Textile Sizing Division (Faisalabad)",
];

export const WAREHOUSES = [
  "Central Yarn Store - Bay A",
  "Central Yarn Store - Bay B",
  "Raw Material Warehouse 1 (North)",
  "Shed-1 Temporary Holding Area",
  "Warehouse 2 (Weaving Feed)",
];

export const DEPARTMENTS = [
  "Weaving Shed 1 (Rapier)",
  "Weaving Shed 2 (Air Jet)",
  "Weaving Shed 3 (Sulzer)",
  "Sizing & Warping Store",
  "Maintenance & Overhaul",
];

// Live Production Defaults (Zero mock data - all records synchronize with API)
export const initialRawMaterials = [];
export const initialSizingEntries = [];
export const initialBeams = [];
export const initialLooms = [];
export const initialAssignmentLogs = [];

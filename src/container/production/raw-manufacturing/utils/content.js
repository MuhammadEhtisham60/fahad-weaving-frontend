// Content and labels for Raw Manufacturing module

export const pageContent = {
  title: "Raw Manufacturing",
  subtitle: "End-to-end textile flow: Raw Material → Sizing → Beams → Looms → Woven Fabric",
  tabs: [
    { id: "dashboard", label: "Dashboard", badge: null },
    { id: "raw-material", label: "Raw Material", badgeKey: "rawMaterialsCount" },
    { id: "sizing", label: "Sizing Process", badgeKey: "sizingCount" },
    { id: "beams", label: "Available Set", badgeKey: "availableSetsCount" },
    { id: "looms", label: "Looms Floor", badgeKey: "loomsCount" },
    { id: "assignment", label: "Beam & Loom Station", badgeKey: "activeRunningCount" },
  ],
  exportButton: "Export Report",
  newButton: "New Entry",
};

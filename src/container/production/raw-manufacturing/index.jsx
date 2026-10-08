import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Download,
  Plus,
  Layers,
  Package,
  Workflow,
  Disc,
  Factory,
  CheckCircle2,
  Sliders,
  Play,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { PageHeader, Button } from "../../../components/ui-kit.jsx";
import {
  initialRawMaterials,
  initialSizingEntries,
  initialBeams,
  initialLooms,
  initialAssignmentLogs,
} from "./utils/constants.js";
import { pageContent } from "./utils/content.js";
import {
  computeManufacturingStats,
  nextRawMaterialId,
  nextRawMaterialEntryNo,
  nextSizingId,
  nextSizingNo,
  nextBeamId,
  nextBeamNo,
  nextLoomId,
  nextLoomNo,
  downloadManufacturingPdf,
} from "./utils/helpers.js";

// Tab entry points (one feature folder per tab)
import { Dashboard } from "./Dashboard/Dashboard.jsx";
import { RawMaterial } from "./RawMaterial/RawMaterial.jsx";
import { SizingProcess } from "./SizingProcess/SizingProcess.jsx";
import { AvailableSet } from "./AvailableSet/AvailableSet.jsx";
import { LoomFloor } from "./LoomFloor/LoomFloor.jsx";
import { BeamAndLoomStation } from "./BeamAndLoomStation/BeamAndLoomStation.jsx";

import { TraceabilityModal } from "./components/TraceabilityModal.jsx";
import { AssignBeamModal } from "./BeamAndLoomStation/components/AssignBeamModal.jsx";
import { useConfirm } from "../../../common/popups/index.js";

import { RawMaterialFormModal } from "./RawMaterial/form/RawMaterialFormModal.jsx";
import { RawMaterialFormPage } from "./RawMaterial/form/RawMaterialFormPage.jsx";
import { RawMaterialDetailModal } from "./RawMaterial/components/RawMaterialDetailModal.jsx";

import { SizingFormModal } from "./SizingProcess/form/SizingFormModal.jsx";
import { SizingDetailModal } from "./SizingProcess/components/SizingDetailModal.jsx";

import { BeamFormModal } from "./AvailableSet/form/BeamFormModal.jsx";
import { BeamDetailModal } from "./AvailableSet/components/BeamDetailModal.jsx";

import { LoomFormModal } from "./LoomFloor/form/LoomFormModal.jsx";
import { LoomDetailModal } from "./LoomFloor/components/LoomDetailModal.jsx";

import { SizingOutcomeFormModal } from "./SizingProcess/form/SizingOutcomeFormModal.jsx";
import { YarnOutcomeModal } from "./RawMaterial/form/Add/YarnOutcomeModal.jsx";
import { BeamLoadingModal } from "./BeamAndLoomStation/form/Add/BeamLoadingModal.jsx";
import { ProductionLogModal } from "./BeamAndLoomStation/form/Add/ProductionLogModal.jsx";
import { BeamHistoryModal } from "./AvailableSet/components/BeamHistoryModal.jsx";
import {
  useGetYarnIntakesQuery,
  useGetYarnOutcomesQuery,
  useGetSizingOutcomesQuery,
  useDeleteSizingOutcomeMutation,
  useGetBeamsQuery,
  useGetLoomsQuery,
  useGetActiveBeamLoadingsQuery,
} from "../../../store/index.js";
import { normalizeYarnIntakeList } from "./utils/yarnIntakeMapper.js";
import { normalizeSizingOutcomeList } from "./utils/sizingOutcomeMapper.js";
import { normalizeBeamList } from "./utils/beamMapper.js";
import { normalizeLoomList } from "./utils/loomMapper.js";
import { toast } from "sonner";

export const Route = createFileRoute("/production/raw-manufacturing/")({
  component: RawManufacturingPage,
});

function RawManufacturingPage() {
  // Master Module State
  const [rawMaterials, setRawMaterials] = useState(initialRawMaterials);
  const [sizingEntries, setSizingEntries] = useState(initialSizingEntries);
  const [beams, setBeams] = useState(initialBeams);
  const [looms, setLooms] = useState(initialLooms);
  const [assignmentLogs, setAssignmentLogs] = useState(initialAssignmentLogs);

  // Active Tab View
  const [activeTab, setActiveTab] = useState("dashboard");

  // Modals & Selection State
  const [rawMaterialFormState, setRawMaterialFormState] = useState({ open: false, item: null });
  const [rawMaterialDetailState, setRawMaterialDetailState] = useState({ open: false, item: null });
  const [yarnOutcomeModalState, setYarnOutcomeModalState] = useState({ open: false, item: null });

  const [sizingFormState, setSizingFormState] = useState({ open: false, item: null, preselectedRm: null });
  const [sizingOutcomeModalState, setSizingOutcomeModalState] = useState({ open: false, outcome: null });
  const [sizingDetailState, setSizingDetailState] = useState({ open: false, item: null });

  const [beamFormState, setBeamFormState] = useState({ open: false, item: null, preselectedSizing: null });
  const [beamDetailState, setBeamDetailState] = useState({ open: false, item: null });
  const [beamHistoryModalState, setBeamHistoryModalState] = useState({ open: false, beam: null });

  const [loomFormState, setLoomFormState] = useState({ open: false, item: null });
  const [loomDetailState, setLoomDetailState] = useState({ open: false, item: null });

  const [assignBeamModalState, setAssignBeamModalState] = useState({
    open: false,
    loom: null,
    beam: null,
  });
  const [beamLoadingModalState, setBeamLoadingModalState] = useState({
    open: false,
    loom: null,
    beam: null,
    outcome: null,
  });
  const [productionLogModalState, setProductionLogModalState] = useState({
    open: false,
    loading: null,
  });

  const [traceModalState, setTraceModalState] = useState({
    open: false,
    item: null,
    type: "beam",
  });

  // RTK Query: Live Yarn Intakes API data
  const { data: apiIntakeResponse } = useGetYarnIntakesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // RTK Query: Live Sizing Outcomes API data
  const {
    data: apiSizingOutcomesResponse,
    isLoading: loadingSizingOutcomes,
    isFetching: fetchingSizingOutcomes,
    refetch: refetchSizingOutcomes,
  } = useGetSizingOutcomesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // RTK Query: Live Yarn Outcomes sent to Sizing
  const {
    data: apiYarnSizingDispatchesResponse,
    isLoading: loadingYarnDispatches,
    isFetching: fetchingYarnDispatches,
    refetch: refetchYarnDispatches,
  } = useGetYarnOutcomesQuery({ outcome_type: "Sizing" }, {
    refetchOnMountOrArgChange: true,
  });

  // RTK Query: Live Beams API data
  const {
    data: apiBeamsResponse,
    isLoading: loadingBeams,
    isFetching: fetchingBeams,
    refetch: refetchBeams,
  } = useGetBeamsQuery({ page_size: 100 }, {
    refetchOnMountOrArgChange: true,
  });

  // RTK Query: Live Looms API data
  const {
    data: apiLoomsResponse,
    isLoading: loadingLooms,
    isFetching: fetchingLooms,
    refetch: refetchLooms,
  } = useGetLoomsQuery({ page_size: 100 }, {
    refetchOnMountOrArgChange: true,
  });

  // RTK Query: Live Active Beam Loadings
  const {
    data: apiActiveLoadingsResponse,
    refetch: refetchActiveLoadings,
  } = useGetActiveBeamLoadingsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteSizingOutcome] = useDeleteSizingOutcomeMutation();

  // Effective Raw Materials synchronized with Live API
  const effectiveRawMaterials = React.useMemo(() => {
    if (apiIntakeResponse !== undefined && apiIntakeResponse !== null) {
      const normalized = normalizeYarnIntakeList(apiIntakeResponse);
      return normalized.rows || [];
    }
    return rawMaterials;
  }, [apiIntakeResponse, rawMaterials]);

  // Effective Sizing Outcomes synchronized with Live API
  const effectiveSizingEntries = React.useMemo(() => {
    const hasSizingApi = apiSizingOutcomesResponse !== undefined && apiSizingOutcomesResponse !== null;
    const hasYarnSizingApi = apiYarnSizingDispatchesResponse !== undefined && apiYarnSizingDispatchesResponse !== null;

    if (hasSizingApi || hasYarnSizingApi) {
      const sizingNorm = hasSizingApi ? normalizeSizingOutcomeList(apiSizingOutcomesResponse).rows : [];
      const yarnNorm = hasYarnSizingApi ? normalizeSizingOutcomeList(apiYarnSizingDispatchesResponse).rows : [];

      // Track mapped yarn outcome ids that already have an outcome
      const processedYarnOutcomeIds = new Set();
      sizingNorm.forEach((sz) => {
        if (sz.yarnOutcomeId) processedYarnOutcomeIds.add(Number(sz.yarnOutcomeId));
      });

      // Filter in-sizing items that haven't been completed yet
      const pendingInSizing = yarnNorm.filter((y) => {
        const yId = Number(y.yarnOutcomeId || y.id);
        return !processedYarnOutcomeIds.has(yId) && (y.status === "In Sizing" || y.isInSizing);
      });

      // Place pending In Sizing dispatches at the top, followed by recorded outcomes
      return [...pendingInSizing, ...sizingNorm];
    }
    return sizingEntries;
  }, [apiSizingOutcomesResponse, apiYarnSizingDispatchesResponse, sizingEntries]);

  // Effective Looms synchronized with Live API
  const effectiveLooms = React.useMemo(() => {
    if (apiLoomsResponse !== undefined && apiLoomsResponse !== null) {
      const normalized = normalizeLoomList(apiLoomsResponse, apiActiveLoadingsResponse, beams);
      return normalized.rows || [];
    }
    return [];
  }, [apiLoomsResponse, apiActiveLoadingsResponse, beams]);

  // Effective Beams synchronized with Live API
  const effectiveBeams = React.useMemo(() => {
    if (apiBeamsResponse !== undefined && apiBeamsResponse !== null) {
      const normalized = normalizeBeamList(
        apiBeamsResponse,
        effectiveSizingEntries,
        apiActiveLoadingsResponse,
        effectiveLooms
      );
      return normalized.rows || [];
    }
    return [];
  }, [apiBeamsResponse, effectiveSizingEntries, apiActiveLoadingsResponse, effectiveLooms]);

  const handleRefetchSizing = () => {
    if (refetchSizingOutcomes) refetchSizingOutcomes();
    if (refetchYarnDispatches) refetchYarnDispatches();
    if (refetchBeams) refetchBeams();
    if (refetchLooms) refetchLooms();
    if (refetchActiveLoadings) refetchActiveLoadings();
  };

  // Aggregated Real-time Stats
  const stats = computeManufacturingStats(effectiveRawMaterials, effectiveSizingEntries, effectiveBeams, effectiveLooms);

  // --- RAW MATERIAL HANDLERS ---
  const handleSaveRawMaterial = (data) => {
    if (rawMaterialFormState.item) {
      setRawMaterials((prev) =>
        prev.map((r) => (r.id === rawMaterialFormState.item.id ? { ...r, ...data } : r))
      );
    } else {
      const newId = nextRawMaterialId(rawMaterials);
      const newEntryNo = data.entryNo || nextRawMaterialEntryNo(rawMaterials);
      const created = {
        id: newId,
        entryNo: newEntryNo,
        ...data,
      };
      setRawMaterials((prev) => [created, ...prev]);
    }
    setRawMaterialFormState({ open: false, item: null });
  };

  const { confirm, ConfirmDialog } = useConfirm();

  const handleDeleteRawMaterial = async (id) => {
    const isConfirmed = await confirm({
      title: "Delete Raw Material",
      message: "Are you sure you want to delete this raw material record? This action cannot be undone.",
      confirmText: "Delete Record",
      variant: "danger",
    });
    if (isConfirmed) {
      setRawMaterials((prev) => prev.filter((r) => r.id !== id));
      if (rawMaterialDetailState.item?.id === id) setRawMaterialDetailState({ open: false, item: null });
    }
  };

  // --- SIZING HANDLERS ---
  const handleSaveSizing = (data) => {
    if (sizingFormState.item) {
      setSizingEntries((prev) =>
        prev.map((s) => (s.id === sizingFormState.item.id ? { ...s, ...data } : s))
      );
    } else {
      const newId = nextSizingId(sizingEntries);
      const newSizingNo = data.sizingNo || nextSizingNo(sizingEntries);
      const created = {
        id: newId,
        sizingNo: newSizingNo,
        ...data,
      };

      // Deduct available quantity from raw material
      setRawMaterials((prev) =>
        prev.map((rm) => {
          if (rm.id === data.rawMaterialId) {
            const newBagsSent = (rm.bagsSent || 0) + Number(data.bagsSent);
            const newWeightSent = (rm.weightSent || 0) + Number(data.weightSent);
            const newAvailableBags = Math.max(0, rm.bags - newBagsSent);
            const newAvailableWeight = Math.max(0, rm.netWeight - newWeightSent);
            const newStatus =
              newAvailableBags === 0
                ? "Fully Sent to Sizing"
                : newBagsSent > 0
                ? "Partially Sent to Sizing"
                : rm.status;
            return {
              ...rm,
              bagsSent: newBagsSent,
              weightSent: newWeightSent,
              availableBags: newAvailableBags,
              availableWeight: newAvailableWeight,
              status: newStatus,
            };
          }
          return rm;
        })
      );

      setSizingEntries((prev) => [created, ...prev]);
    }
    setSizingFormState({ open: false, item: null, preselectedRm: null });
  };

  const handleDeleteSizing = async (id) => {
    const isConfirmed = await confirm({
      title: "Delete Sizing Record",
      message: "Are you sure you want to delete this sizing outcome set? This action cannot be undone.",
      confirmText: "Delete Record",
      variant: "danger",
    });
    if (isConfirmed) {
      try {
        await deleteSizingOutcome(id).unwrap();
        toast.success("Sizing outcome record deleted successfully.");
      } catch {
        setSizingEntries((prev) => prev.filter((s) => s.id !== id));
      }
      if (sizingDetailState.item?.id === id) setSizingDetailState({ open: false, item: null });
    }
  };

  // --- BEAM HANDLERS ---
  const handleSaveBeam = (data) => {
    if (beamFormState.item) {
      setBeams((prev) =>
        prev.map((b) => (b.id === beamFormState.item.id ? { ...b, ...data } : b))
      );
    } else {
      const newId = nextBeamId(beams);
      const newBeamNo = data.beamNo || nextBeamNo(beams);
      const created = {
        id: newId,
        beamNo: newBeamNo,
        ...data,
      };

      // Increment beams count on sizing entry
      setSizingEntries((prev) =>
        prev.map((sz) => {
          if (sz.id === data.sizingId) {
            return { ...sz, beamsProduced: (sz.beamsProduced || 0) + 1 };
          }
          return sz;
        })
      );

      setBeams((prev) => [created, ...prev]);
    }
    setBeamFormState({ open: false, item: null, preselectedSizing: null });
  };

  const handleDeleteBeam = async (id) => {
    const isConfirmed = await confirm({
      title: "Delete Warp Beam",
      message: "Are you sure you want to delete this warp beam? This action cannot be undone.",
      confirmText: "Delete Beam",
      variant: "danger",
    });
    if (isConfirmed) {
      setBeams((prev) => prev.filter((b) => b.id !== id));
      if (beamDetailState.item?.id === id) setBeamDetailState({ open: false, item: null });
    }
  };

  // --- LOOM HANDLERS ---
  const handleSaveLoom = (data) => {
    if (loomFormState.item) {
      setLooms((prev) =>
        prev.map((l) => (l.id === loomFormState.item.id ? { ...l, ...data } : l))
      );
    } else {
      const newId = nextLoomId(looms);
      const newLoomNo = data.loomNo || nextLoomNo(looms);
      const created = {
        id: newId,
        loomNo: newLoomNo,
        ...data,
      };
      setLooms((prev) => [created, ...prev]);
    }
    setLoomFormState({ open: false, item: null });
  };

  const handleDeleteLoom = async (id) => {
    const isConfirmed = await confirm({
      title: "Delete Loom",
      message: "Are you sure you want to delete this loom? This action cannot be undone.",
      confirmText: "Delete Loom",
      variant: "danger",
    });
    if (isConfirmed) {
      setLooms((prev) => prev.filter((l) => l.id !== id));
      if (loomDetailState.item?.id === id) setLoomDetailState({ open: false, item: null });
    }
  };

  // --- BEAM -> LOOM MOUNTING & DISMOUNTING ACTIONS ---
  const handleMountBeam = ({ loomId, beamId, date, operator, remarks }) => {
    const targetLoom = looms.find((l) => l.id === loomId);
    const targetBeam = beams.find((b) => b.id === beamId);
    if (!targetLoom || !targetBeam) return;

    // Update Loom
    setLooms((prev) =>
      prev.map((l) => {
        if (l.id === loomId) {
          const newHistory = [
            {
              id: `LH-${Date.now()}`,
              beamNo: targetBeam.beamNo,
              installedAt: date,
              removedAt: null,
              metersProduced: 0,
              status: "Running (Active)",
            },
            ...(l.beamHistory || []),
          ];
          return {
            ...l,
            status: "Running",
            currentBeamId: targetBeam.id,
            currentBeamNo: targetBeam.beamNo,
            operator: operator || l.operator,
            beamHistory: newHistory,
          };
        }
        return l;
      })
    );

    // Update Beam
    setBeams((prev) =>
      prev.map((b) => {
        if (b.id === beamId) {
          const newHistory = [
            {
              id: `BH-${Date.now()}`,
              date,
              loomNo: targetLoom.loomNo,
              action: "Installed on Loom",
              status: "In Production",
              operator,
              remarks,
            },
            ...(b.history || []),
          ];
          return {
            ...b,
            status: "In Production",
            currentLoomId: targetLoom.id,
            currentLoomNo: targetLoom.loomNo,
            installationDate: date,
            history: newHistory,
          };
        }
        return b;
      })
    );

    // Add Audit Log
    setAssignmentLogs((prev) => [
      {
        id: `AL-${Date.now()}`,
        date: `${date} ${new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}`,
        beamNo: targetBeam.beamNo,
        loomNo: targetLoom.loomNo,
        action: "Mounted & Activated",
        operator,
        remarks,
      },
      ...prev,
    ]);

    setAssignBeamModalState({ open: false, loom: null, beam: null });
  };

  const handleDismountBeam = ({ loomId, beamId, date, producedMeters, operator, remarks }) => {
    const targetLoom = looms.find((l) => l.id === loomId || l.currentBeamId === beamId);
    const targetBeam = beams.find((b) => b.id === beamId || b.id === targetLoom?.currentBeamId);

    // Update Loom
    if (targetLoom) {
      setLooms((prev) =>
        prev.map((l) => {
          if (l.id === targetLoom.id) {
            const updatedHistory = (l.beamHistory || []).map((h) => {
              if (!h.removedAt && (h.beamNo === targetBeam?.beamNo || h.beamNo === l.currentBeamNo)) {
                return {
                  ...h,
                  removedAt: date,
                  metersProduced: producedMeters,
                  status: "Exhausted / Completed",
                };
              }
              return h;
            });
            return {
              ...l,
              status: "Idle",
              currentBeamId: null,
              currentBeamNo: null,
              beamHistory: updatedHistory,
            };
          }
          return l;
        })
      );
    }

    // Update Beam
    if (targetBeam) {
      setBeams((prev) =>
        prev.map((b) => {
          if (b.id === targetBeam.id) {
            const updatedHistory = [
              {
                id: `BH-${Date.now()}`,
                date,
                loomNo: targetLoom ? targetLoom.loomNo : "—",
                action: "Dismounted / Completed",
                status: "Completed",
                operator,
                remarks,
              },
              ...(b.history || []),
            ];
            return {
              ...b,
              status: "Completed",
              currentLoomId: null,
              currentLoomNo: null,
              removalDate: date,
              producedMeters,
              history: updatedHistory,
            };
          }
          return b;
        })
      );
    }

    // Add Audit Log
    setAssignmentLogs((prev) => [
      {
        id: `AL-${Date.now()}`,
        date: `${date} ${new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}`,
        beamNo: targetBeam ? targetBeam.beamNo : "—",
        loomNo: targetLoom ? targetLoom.loomNo : "—",
        action: "Dismounted (Completed)",
        operator,
        remarks: `${remarks} — ${producedMeters}m woven cloth recorded.`,
      },
      ...prev,
    ]);

    setAssignBeamModalState({ open: false, loom: null, beam: null });
  };

  // --- PDF EXPORTER FOR ACTIVE TAB ---
  const handleExportPdf = () => {
    if (activeTab === "raw-material") {
      downloadManufacturingPdf(
        "Raw Material Inventory Report",
        effectiveRawMaterials,
        [
          { label: "Entry #", key: "entryNo", x: 42, width: 70 },
          { label: "Yarn Name", key: "name", x: 120, width: 150 },
          { label: "Count", key: "count", x: 280, width: 60 },
          { label: "Supplier", key: "supplier", x: 350, width: 120 },
          { label: "Bags In", key: "bags", x: 480, width: 50 },
          { label: "Bags Sent", key: "bagsSent", x: 540, width: 60 },
          { label: "Remaining", key: "availableBags", x: 610, width: 60 },
          { label: "Status", key: "status", x: 680, width: 80 },
        ],
        "Complete incoming raw yarn inventory and sizing dispatch levels"
      );
    } else if (activeTab === "sizing") {
      downloadManufacturingPdf(
        "Sizing Outcomes & Warping Report",
        effectiveSizingEntries,
        [
          { label: "Set #", key: "setNo", x: 42, width: 70 },
          { label: "Sizing Mill", key: "sizingName", x: 120, width: 140 },
          { label: "Count / Yarn", key: "yarnName", x: 270, width: 110 },
          { label: "Length (m)", key: "setLengthMeter", x: 390, width: 70 },
          { label: "Bags", key: "totalBagsOnSizing", x: 470, width: 50 },
          { label: "Lagat", key: "lagatBags", x: 530, width: 50 },
          { label: "Beams", key: "totalBeams", x: 590, width: 50 },
          { label: "Status", key: "status", x: 650, width: 80 },
        ],
        "Sizing sets returned, warp specifications, and beam production summary"
      );
    } else if (activeTab === "beams") {
      downloadManufacturingPdf(
        "Warp Beams Inventory Report",
        beams,
        [
          { label: "Beam #", key: "beamNo", x: 42, width: 65 },
          { label: "Beam Code", key: "beamCode", x: 115, width: 85 },
          { label: "Yarn Name", key: "yarnName", x: 210, width: 140 },
          { label: "Ends", key: "ends", x: 360, width: 50 },
          { label: "Length (m)", key: "length", x: 420, width: 65 },
          { label: "Mounted Loom", key: "currentLoomNo", x: 495, width: 80 },
          { label: "Status", key: "status", x: 585, width: 80 },
        ],
        "Master warp beam inventory and live loom mount status"
      );
    } else if (activeTab === "looms" || activeTab === "assignment") {
      downloadManufacturingPdf(
        "Weaving Looms Floor Report",
        looms,
        [
          { label: "Loom #", key: "loomNo", x: 42, width: 60 },
          { label: "Name / Type", key: "name", x: 110, width: 140 },
          { label: "Location", key: "location", x: 260, width: 120 },
          { label: "RPM", key: "rpm", x: 390, width: 50 },
          { label: "Installed Beam", key: "currentBeamNo", x: 450, width: 90 },
          { label: "Operator", key: "operator", x: 550, width: 110 },
          { label: "Status", key: "status", x: 670, width: 70 },
        ],
        "Power looms shed floor overview and active beam installations"
      );
    } else {
      downloadManufacturingPdf(
        "Manufacturing Summary Report",
        rawMaterials,
        [
          { label: "Entry #", key: "entryNo", x: 42, width: 70 },
          { label: "Yarn Name", key: "name", x: 120, width: 150 },
          { label: "Count", key: "count", x: 280, width: 60 },
          { label: "Supplier", key: "supplier", x: 350, width: 120 },
          { label: "Bags", key: "bags", x: 480, width: 50 },
          { label: "Sent", key: "bagsSent", x: 540, width: 60 },
          { label: "Available", key: "availableBags", x: 610, width: 60 },
          { label: "Status", key: "status", x: 680, width: 80 },
        ],
        "Raw Manufacturing Overview & Pipeline Summary"
      );
    }
  };

  // Shortcut triggers
  const handleOpenNewModal = (type) => {
    if (type === "raw-material") setRawMaterialFormState({ open: true, item: null });
    else if (type === "sizing") setSizingFormState({ open: true, item: null, preselectedRm: null });
    else if (type === "beam") setBeamFormState({ open: true, item: null, preselectedSizing: null });
    else if (type === "loom") setLoomFormState({ open: true, item: null });
  };

  const handleOpenAssignModal = (loom = null, beam = null) => {
    setAssignBeamModalState({ open: true, loom, beam });
  };

  const handleOpenTrace = (item, type) => {
    setTraceModalState({ open: true, item, type });
  };

  if (rawMaterialFormState.open) {
    return (
      <RawMaterialFormPage
        item={rawMaterialFormState.item}
        onSave={handleSaveRawMaterial}
        onBack={() => setRawMaterialFormState({ open: false, item: null })}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title={pageContent.title}
        subtitle={pageContent.subtitle}
        actions={
          <>
            <Button variant="outline" onClick={handleExportPdf}>
              <Download className="h-4 w-4" /> {pageContent.exportButton}
            </Button>
            {activeTab === "raw-material" && (
              <Button onClick={() => setRawMaterialFormState({ open: true, item: null })}>
                <Plus className="h-4 w-4" /> Intake Yarn
              </Button>
            )}
            {activeTab === "sizing" && (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleRefetchSizing} disabled={fetchingSizingOutcomes || fetchingYarnDispatches}>
                  <RefreshCw className={`h-4 w-4 ${fetchingSizingOutcomes || fetchingYarnDispatches ? "animate-spin" : ""}`} /> Refresh
                </Button>
              </div>
            )}
            {activeTab === "beams" && (
              <Button onClick={() => setBeamFormState({ open: true, item: null, preselectedSizing: null })}>
                <Plus className="h-4 w-4" /> Add Warp Beam
              </Button>
            )}
            {activeTab === "looms" && (
              <Button onClick={() => setLoomFormState({ open: true, item: null })}>
                <Plus className="h-4 w-4" /> Add Loom
              </Button>
            )}
            {(activeTab === "dashboard" || activeTab === "assignment") && (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setProductionLogModalState({ open: true, loading: null })}>
                  <Play className="h-4 w-4" /> Log Daily Production
                </Button>
                <Button onClick={() => setBeamLoadingModalState({ open: true, loom: null, beam: null, outcome: null })}>
                  <Factory className="h-4 w-4" /> Mount Beam on Loom
                </Button>
              </div>
            )}
          </>
        }
      />

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-muted/60 rounded-2xl border border-border overflow-x-auto scrollbar-custom">
        {pageContent.tabs.map((t) => {
          const isActive = activeTab === t.id;
          let count = null;
          const availableSetsCount = effectiveSizingEntries.filter(
            (sz) => sz.status === "Completed" || (!sz.isInSizing && sz.status !== "In Sizing")
          ).length;

          if (t.badgeKey === "rawMaterialsCount") count = effectiveRawMaterials.length;
          else if (t.badgeKey === "sizingCount") count = effectiveSizingEntries.length;
          else if (t.badgeKey === "availableSetsCount" || t.badgeKey === "beamsCount") count = availableSetsCount;
          else if (t.badgeKey === "loomsCount") count = effectiveLooms.length;
          else if (t.badgeKey === "activeRunningCount") count = stats.runningLooms;

          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-smooth whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-card text-foreground shadow-sm border border-border/70"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <span>{t.label}</span>
              {count !== null && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Rendering */}
      {activeTab === "dashboard" && (
        <Dashboard
          stats={stats}
          rawMaterials={effectiveRawMaterials}
          sizingEntries={effectiveSizingEntries}
          beams={effectiveBeams}
          looms={effectiveLooms}
          assignmentLogs={assignmentLogs}
          onSelectTab={setActiveTab}
          onOpenNewModal={handleOpenNewModal}
          onOpenAssignModal={handleOpenAssignModal}
          onOpenTraceModal={handleOpenTrace}
        />
      )}

      {activeTab === "raw-material" && (
        <RawMaterial
          rows={effectiveRawMaterials}
          onSelect={(item) => setRawMaterialDetailState({ open: true, item })}
          onEdit={(item) => setRawMaterialFormState({ open: true, item })}
          onDelete={handleDeleteRawMaterial}
          onTrace={handleOpenTrace}
          onSendToSizing={(rm) => setYarnOutcomeModalState({ open: true, item: rm })}
          onAddNew={() => setRawMaterialFormState({ open: true, item: null })}
        />
      )}

      {activeTab === "sizing" && (
        <SizingProcess
          rows={effectiveSizingEntries}
          isLoading={loadingSizingOutcomes || loadingYarnDispatches}
          isFetching={fetchingSizingOutcomes || fetchingYarnDispatches}
          onRefetch={handleRefetchSizing}
          onSelect={(item) => setSizingDetailState({ open: true, item })}
          onEdit={(item) => setSizingOutcomeModalState({ open: true, outcome: item })}
          onAddOutcome={(item) => setSizingOutcomeModalState({ open: true, outcome: item })}
          onDelete={handleDeleteSizing}
          onTrace={handleOpenTrace}
          onLoadOntoLoom={(sz) =>
            setBeamLoadingModalState({ open: true, loom: null, beam: null, outcome: sz })
          }
          onCreateBeam={(sz) => setSizingOutcomeModalState({ open: true, outcome: sz })}
          onAddNew={() => {
            toast.info("Please dispatch yarn boxes from the Yarn Intake tab to create a sizing run.");
            setActiveTab("raw-material");
          }}
        />
      )}

      {activeTab === "beams" && (
        <AvailableSet
          rows={effectiveBeams}
          sizingEntries={effectiveSizingEntries}
          looms={effectiveLooms}
          isLoading={loadingSizingOutcomes || loadingBeams}
          onSelect={(item) => setBeamDetailState({ open: true, item })}
          onSelectSizing={(sz) => setSizingDetailState({ open: true, item: sz })}
          onEdit={(item) => setBeamFormState({ open: true, item, preselectedSizing: null })}
          onDelete={handleDeleteBeam}
          onTrace={handleOpenTrace}
          onMount={(loom, beam, outcome) => setBeamLoadingModalState({ open: true, loom, beam, outcome })}
          onDismount={(loom, beam) => setAssignBeamModalState({ open: true, loom, beam })}
          onAddNew={() => setBeamFormState({ open: true, item: null, preselectedSizing: null })}
        />
      )}

      {activeTab === "looms" && (
        <LoomFloor
          rows={effectiveLooms}
          beams={effectiveBeams}
          onSelect={(item) => setLoomDetailState({ open: true, item })}
          onEdit={(item) => setLoomFormState({ open: true, item })}
          onDelete={handleDeleteLoom}
          onTrace={handleOpenTrace}
          onMount={(loom, beam) => setBeamLoadingModalState({ open: true, loom, beam, outcome: null })}
          onDismount={(loom, beam) => setAssignBeamModalState({ open: true, loom, beam })}
          onAddNew={() => setLoomFormState({ open: true, item: null })}
        />
      )}

      {activeTab === "assignment" && (
        <BeamAndLoomStation
          looms={effectiveLooms}
          beams={effectiveBeams}
          assignmentLogs={assignmentLogs}
          onMount={(loom, beam) => setBeamLoadingModalState({ open: true, loom, beam, outcome: null })}
          onDismount={(loom, beam) => setAssignBeamModalState({ open: true, loom, beam })}
          onTrace={handleOpenTrace}
        />
      )}

      {/* --- MODAL INSTANCES --- */}

      {rawMaterialDetailState.open && (
        <RawMaterialDetailModal
          item={rawMaterialDetailState.item}
          sizingEntries={sizingEntries}
          onSendToSizing={(rm) => {
            setRawMaterialDetailState({ open: false, item: null });
            setYarnOutcomeModalState({ open: true, item: rm });
          }}
          onTrace={handleOpenTrace}
          onClose={() => setRawMaterialDetailState({ open: false, item: null })}
        />
      )}

      {/* Yarn Outcome Dispatch Modal */}
      {yarnOutcomeModalState.open && (
        <YarnOutcomeModal
          yarnIntake={yarnOutcomeModalState.item}
          onClose={() => setYarnOutcomeModalState({ open: false, item: null })}
        />
      )}

      {/* Sizing Modals */}
      {sizingFormState.open && (
        <SizingFormModal
          item={sizingFormState.item}
          preselectedRawMaterial={sizingFormState.preselectedRm}
          rawMaterials={rawMaterials}
          onSave={handleSaveSizing}
          onClose={() => setSizingFormState({ open: false, item: null, preselectedRm: null })}
        />
      )}

      {/* Sizing Outcome Modal (24 fields + Beams) */}
      {sizingOutcomeModalState.open && (
        <SizingOutcomeFormModal
          outcome={sizingOutcomeModalState.outcome}
          onClose={() => setSizingOutcomeModalState({ open: false, outcome: null })}
        />
      )}

      {sizingDetailState.open && (
        <SizingDetailModal
          item={sizingDetailState.item}
          beams={effectiveBeams}
          onAddOutcome={(sz) => {
            setSizingDetailState({ open: false, item: null });
            setSizingOutcomeModalState({ open: true, outcome: sz });
          }}
          onCreateBeam={(sz) => {
            setSizingDetailState({ open: false, item: null });
            setSizingOutcomeModalState({ open: true, outcome: sz });
          }}
          onMountBeam={(sz) => {
            setSizingDetailState({ open: false, item: null });
            setBeamLoadingModalState({ open: true, loom: null, beam: null, outcome: sz });
          }}
          onTrace={handleOpenTrace}
          onClose={() => setSizingDetailState({ open: false, item: null })}
        />
      )}

      {/* Beam Modals */}
      {beamFormState.open && (
        <BeamFormModal
          item={beamFormState.item}
          preselectedSizing={beamFormState.preselectedSizing}
          sizingEntries={effectiveSizingEntries}
          onSave={handleSaveBeam}
          onClose={() => setBeamFormState({ open: false, item: null, preselectedSizing: null })}
        />
      )}

      {beamDetailState.open && (
        <BeamDetailModal
          item={beamDetailState.item}
          looms={effectiveLooms}
          onMount={(loom, beam) => {
            setBeamDetailState({ open: false, item: null });
            setBeamLoadingModalState({ open: true, loom, beam, outcome: null });
          }}
          onDismount={(loom, beam) => {
            setBeamDetailState({ open: false, item: null });
            setAssignBeamModalState({ open: true, loom, beam });
          }}
          onTrace={handleOpenTrace}
          onClose={() => setBeamDetailState({ open: false, item: null })}
        />
      )}

      {/* Beam Multi-Cycle History Modal */}
      {beamHistoryModalState.open && (
        <BeamHistoryModal
          beamId={beamHistoryModalState.beam?.id}
          beamCode={beamHistoryModalState.beam?.beamCode || beamHistoryModalState.beam?.beamNo}
          onClose={() => setBeamHistoryModalState({ open: false, beam: null })}
        />
      )}

      {/* Beam Loading Modal (API-integrated) */}
      {beamLoadingModalState.open && (
        <BeamLoadingModal
          preselectedLoom={beamLoadingModalState.loom}
          preselectedBeam={beamLoadingModalState.beam}
          preselectedOutcome={beamLoadingModalState.outcome}
          onClose={() => setBeamLoadingModalState({ open: false, loom: null, beam: null, outcome: null })}
        />
      )}

      {/* Production Log Modal */}
      {productionLogModalState.open && (
        <ProductionLogModal
          preselectedLoading={productionLogModalState.loading}
          onClose={() => setProductionLogModalState({ open: false, loading: null })}
        />
      )}

      {/* Loom Modals */}
      {loomFormState.open && (
        <LoomFormModal
          item={loomFormState.item}
          onSave={handleSaveLoom}
          onClose={() => setLoomFormState({ open: false, item: null })}
        />
      )}

      {loomDetailState.open && (
        <LoomDetailModal
          item={loomDetailState.item}
          beams={effectiveBeams}
          onMount={(loom, beam) => {
            setLoomDetailState({ open: false, item: null });
            setBeamLoadingModalState({ open: true, loom, beam, outcome: null });
          }}
          onDismount={(loom, beam) => {
            setLoomDetailState({ open: false, item: null });
            setAssignBeamModalState({ open: true, loom, beam });
          }}
          onTrace={handleOpenTrace}
          onClose={() => setLoomDetailState({ open: false, item: null })}
        />
      )}

      {/* Legacy / Direct Mount Modal */}
      {assignBeamModalState.open && (
        <AssignBeamModal
          preselectedLoom={assignBeamModalState.loom}
          preselectedBeam={assignBeamModalState.beam}
          looms={effectiveLooms}
          beams={effectiveBeams}
          onAssign={handleMountBeam}
          onDismount={handleDismountBeam}
          onClose={() => setAssignBeamModalState({ open: false, loom: null, beam: null })}
        />
      )}

      {/* Traceability Modal */}
      {traceModalState.open && (
        <TraceabilityModal
          item={traceModalState.item}
          type={traceModalState.type}
          allData={{ rawMaterials: effectiveRawMaterials, sizingEntries: effectiveSizingEntries, beams: effectiveBeams, looms: effectiveLooms }}
          onClose={() => setTraceModalState({ open: false, item: null, type: "beam" })}
        />
      )}

      {/* Reusable Confirmation Dialog */}
      <ConfirmDialog />
    </div>
  );
}

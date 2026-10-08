import React, { useState, useEffect, useMemo } from "react";
import { X, AlertCircle, Check, Loader2, Disc, Layers } from "lucide-react";
import { toast } from "sonner";
import {
  useGetSizingChoicesQuery,
  useCreateSizingOutcomeMutation,
  useUpdateSizingOutcomeMutation,
} from "../../../../../store/index.js";
import {
  InputField,
  SelectField,
  TextareaField,
} from "../../../../../common/sharefield";

export function SizingOutcomeFormModal({ outcome, onClose, onSuccess }) {
  const isInSizing = Boolean(outcome?.isInSizing || outcome?.status === "In Sizing");
  const isEdit = Boolean(outcome && !isInSizing);

  const { data: sizingChoicesData, isLoading: loadingSizings } = useGetSizingChoicesQuery();

  const [createSizingOutcome, { isLoading: isCreating }] = useCreateSizingOutcomeMutation();
  const [updateSizingOutcome, { isLoading: isUpdating }] = useUpdateSizingOutcomeMutation();
  const isSaving = isCreating || isUpdating;

  // Derive initial values from outcome / yarn outcome dispatch / yarn intake
  const initialSizingId = outcome?.sizingId || outcome?.sizing || "";
  const initialSizingName = outcome?.sizingName || outcome?.sizingUnit || "";
  const initialSetNo = outcome?.setNo || outcome?.yarnIntakeDetail?.setNo || "";
  const initialBags = outcome?.totalBagsOnSizing || outcome?.outcomeBags || outcome?.bagsSent || "";
  const initialConesPerBag = outcome?.bagPackingCone || outcome?.outcomeConesPerBag || outcome?.yarnIntakeDetail?.conesPerBag || "24";
  const initialTotalCones = outcome?.totalCones || (initialBags && initialConesPerBag ? String(Number(initialBags) * Number(initialConesPerBag)) : "");
  const initialBrand = outcome?.brand || outcome?.yarnIntakeDetail?.yarnName || outcome?.yarnIntakeDetail?.supplier || "";
  const initialCount = outcome?.count || outcome?.yarnIntakeDetail?.yarnCount || "";

  // Dispatched beams from outcome / yarn outcome dispatch / yarn intake
  const dispatchedBeams = useMemo(() => {
    const raw = (outcome?.beams && Array.isArray(outcome.beams) ? outcome.beams : [])
      .concat(outcome?.beamAssignments && Array.isArray(outcome.beamAssignments) ? outcome.beamAssignments : [])
      .concat(outcome?.yarnOutcome?.beams && Array.isArray(outcome.yarnOutcome.beams) ? outcome.yarnOutcome.beams : []);
    
    const unique = new Map();
    raw.forEach((b) => {
      if (typeof b === "object" && b && b.id) {
        unique.set(b.id, {
          id: b.id,
          beamNumber: b.beamNumber || b.beamCode || b.beam_number || `BM-${b.id}`,
          beamCode: b.beamCode || b.beamNumber || `BM-${b.id}`,
          beamName: b.beamName || b.beam_name || "Warp Beam",
          yarnCount: b.yarnCount || b.yarn_count || "",
          warpCount: b.warpCount || b.warp_count || "",
          totalEnds: b.totalEnds || b.total_ends || "",
          status: b.status || "In Sizing",
          isDispatched: true,
        });
      }
    });
    return Array.from(unique.values());
  }, [outcome]);

  // Initial beams: from dispatch or outcome
  const initialBeamIds = useMemo(() => {
    if (dispatchedBeams.length > 0) {
      return dispatchedBeams.map((b) => b.id);
    }
    if (outcome?.beam_ids && Array.isArray(outcome.beam_ids)) {
      return outcome.beam_ids.map(Number).filter(Boolean);
    }
    if (outcome?.beamIds && Array.isArray(outcome.beamIds)) {
      return outcome.beamIds.map(Number).filter(Boolean);
    }
    return [];
  }, [dispatchedBeams, outcome]);

  // Form State (All 24 Specification Fields)
  const [formData, setFormData] = useState({
    sizingId: initialSizingId,
    outcomeDate: outcome?.outcomeDate || new Date().toISOString().slice(0, 10),
    setNo: initialSetNo,
    sizingName: initialSizingName,
    totalBagsOnSizing: initialBags,
    bagPackingCone: initialConesPerBag,
    totalCones: initialTotalCones,
    remainingBagsOnSizingStock: outcome?.remainingBagsOnSizingStock ?? "",
    remainingConesOnSizingStock: outcome?.remainingConesOnSizingStock ?? "",
    lagatBags: outcome?.lagatBags ?? (initialBags ? String(initialBags) : ""),
    lagatCones: outcome?.lagatCones ?? (initialTotalCones ? String(initialTotalCones) : ""),
    brand: initialBrand,
    width: outcome?.width ?? "",
    setLengthMeter: outcome?.setLengthMeter ?? "",
    setLengthGaz: outcome?.setLengthGaz ?? "",
    totalTarr: outcome?.totalTarr ?? "",
    yarnBeam: outcome?.yarnBeam ?? "",
    count: initialCount,
    totalSetLumbai: outcome?.totalSetLumbai ?? (outcome?.setLengthMeter || ""),
    totalSetShortage: outcome?.totalSetShortage ?? "",
    remarks: outcome?.remarks ?? "",
  });

  const [selectedBeamIds, setSelectedBeamIds] = useState(initialBeamIds);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (initialBeamIds.length > 0 && selectedBeamIds.length === 0) {
      setSelectedBeamIds(initialBeamIds);
    }
  }, [initialBeamIds]);

  // When lagat bags changes, auto-calculate lagat cones and remaining bags/cones
  const handleLagatBagsChange = (lagatVal) => {
    const lagat = parseFloat(lagatVal) || 0;
    const totalB = parseFloat(formData.totalBagsOnSizing) || 0;
    const packing = parseFloat(formData.bagPackingCone) || 24;

    const lagCones = (lagat * packing).toFixed(2);
    const remBags = Math.max(0, totalB - lagat).toFixed(2);
    const remCones = (parseFloat(remBags) * packing).toFixed(2);

    setFormData((prev) => ({
      ...prev,
      lagatBags: lagatVal,
      lagatCones: lagCones,
      remainingBagsOnSizingStock: remBags,
      remainingConesOnSizingStock: remCones,
    }));
  };

  // Auto-calculate total cones when bags & cones/bag change
  useEffect(() => {
    const bags = Number(formData.totalBagsOnSizing) || 0;
    const packing = Number(formData.bagPackingCone) || 0;
    if (bags > 0 && packing > 0) {
      setFormData((prev) => ({ ...prev, totalCones: String(bags * packing) }));
    }
  }, [formData.totalBagsOnSizing, formData.bagPackingCone]);

  // Auto-calculate gaz from meters (1 meter = 1.09361 gaz)
  const handleMeterChange = (meterVal) => {
    const meters = parseFloat(meterVal) || 0;
    const gaz = meters > 0 ? (meters * 1.0936133).toFixed(2) : "";
    setFormData((prev) => ({
      ...prev,
      setLengthMeter: meterVal,
      setLengthGaz: gaz,
      totalSetLumbai: meterVal,
    }));
    if (formErrors.setLengthMeter || formErrors.set_length_meter || formErrors.setLengthGaz || formErrors.set_length_gaz) {
      setFormErrors((prev) => ({
        ...prev,
        setLengthMeter: null,
        set_length_meter: null,
        setLengthGaz: null,
        set_length_gaz: null,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSizingSelect = (e) => {
    const selectedId = e.target.value;
    const found = sizingOptions.find((s) => String(s.value) === String(selectedId));
    setFormData((prev) => ({
      ...prev,
      sizingId: selectedId,
      sizingName: found ? found.label : prev.sizingName,
    }));
  };

  const handleToggleBeam = (beamId) => {
    setSelectedBeamIds((prev) =>
      prev.includes(beamId) ? prev.filter((id) => id !== beamId) : [...prev, beamId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const errors = {};
    if (!formData.sizingId) errors.sizingId = ["Sizing Unit is required."];
    if (!formData.outcomeDate) errors.outcomeDate = ["Outcome date is required."];

    // Technical Specifications & Dimensions validation
    if (!formData.count?.trim()) errors.count = ["Yarn count is required."];
    if (!formData.width || Number(formData.width) <= 0) errors.width = ["Fabric width (inches) is required."];
    if (!formData.totalTarr || Number(formData.totalTarr) <= 0) errors.totalTarr = ["Total Tarr / Ends is required."];
    if (!formData.setLengthMeter || Number(formData.setLengthMeter) <= 0) errors.setLengthMeter = ["Set length (meters) is required."];
    if (!formData.setLengthGaz || Number(formData.setLengthGaz) <= 0) errors.setLengthGaz = ["Set length (gaz) is required."];
    if (formData.totalSetShortage === "" || formData.totalSetShortage === undefined || formData.totalSetShortage === null) {
      errors.totalSetShortage = ["Total set shortage (%) is required."];
    }
    if (!formData.yarnBeam?.trim()) errors.yarnBeam = ["Yarn Beam ID / Mark is required."];

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const resolvedYarnOutcomeId = outcome?.yarnOutcomeId || (isInSizing ? outcome?.id : undefined);
      const resolvedYarnIntakeId = outcome?.yarnIntakeId || outcome?.yarnIntakeDetail?.id || undefined;

      const payload = {
        yarn_outcome_id: resolvedYarnOutcomeId ? Number(resolvedYarnOutcomeId) : undefined,
        yarn_intake_id: resolvedYarnIntakeId ? Number(resolvedYarnIntakeId) : undefined,
        sizing_id: Number(formData.sizingId),
        outcome_date: formData.outcomeDate,
        set_no: formData.setNo.trim() || undefined,
        sizing_name: formData.sizingName.trim() || undefined,
        total_bags_on_sizing: formData.totalBagsOnSizing ? Number(formData.totalBagsOnSizing) : undefined,
        bag_packing_cone: formData.bagPackingCone ? Number(formData.bagPackingCone) : undefined,
        total_cones: formData.totalCones ? Number(formData.totalCones) : undefined,
        remaining_bags_on_sizing_stock: formData.remainingBagsOnSizingStock ? Number(formData.remainingBagsOnSizingStock) : undefined,
        remaining_cones_on_sizing_stock: formData.remainingConesOnSizingStock ? Number(formData.remainingConesOnSizingStock) : undefined,
        lagat_bags: formData.lagatBags ? String(formData.lagatBags) : undefined,
        lagat_cones: formData.lagatCones ? String(formData.lagatCones) : undefined,
        brand: formData.brand.trim() || undefined,
        width: formData.width ? String(formData.width) : undefined,
        set_length_meter: formData.setLengthMeter ? String(formData.setLengthMeter) : undefined,
        set_length_gaz: formData.setLengthGaz ? String(formData.setLengthGaz) : undefined,
        total_tarr: formData.totalTarr ? String(formData.totalTarr) : undefined,
        yarn_beam: formData.yarnBeam.trim() || undefined,
        count: formData.count.trim() || undefined,
        total_set_lumbai: formData.totalSetLumbai ? String(formData.totalSetLumbai) : undefined,
        total_set_shortage: formData.totalSetShortage ? String(formData.totalSetShortage) : undefined,
        remarks: formData.remarks.trim() || undefined,
        beam_ids: selectedBeamIds.length > 0 ? selectedBeamIds : undefined,
      };

      if (isEdit) {
        await updateSizingOutcome({ id: outcome.id, ...payload }).unwrap();
        toast.success("Sizing outcome updated successfully.");
      } else {
        await createSizingOutcome(payload).unwrap();
        toast.success(`Sizing set returned and recorded successfully with ${selectedBeamIds.length} beam(s). Status is now Received.`);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      if (err?.status === 400 && err?.data) {
        const backendErrs = err.data.errors || err.data;
        if (typeof backendErrs === "object") {
          setFormErrors(backendErrs);
        }
      } else {
        toast.error("Failed to save sizing outcome. Please check the inputs.");
      }
    }
  };

  const sizingOptions = useMemo(() => {
    const rawList = Array.isArray(sizingChoicesData)
      ? sizingChoicesData
      : Array.isArray(sizingChoicesData?.data)
      ? sizingChoicesData.data
      : Array.isArray(sizingChoicesData?.results)
      ? sizingChoicesData.results
      : [];

    return [
      { value: "", label: "-- Select Sizing Mill --" },
      ...rawList.map((c) => ({
        value: c.value ?? c.id,
        label: `${c.label || c.name || c.sizingName || `Sizing #${c.value ?? c.id}`}${c.contactPerson ? ` (${c.contactPerson})` : ""}`,
      })),
    ];
  }, [sizingChoicesData]);

  // const availableBeams = useMemo(() => {
  //   if (Array.isArray(availableBeamsData)) return availableBeamsData;
  //   if (Array.isArray(availableBeamsData?.results)) return availableBeamsData.results;
  //   if (Array.isArray(availableBeamsData?.data)) return availableBeamsData.data;
  //   return [];
  // }, [availableBeamsData]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isEdit
                  ? "Edit Sizing Outcome"
                  : `Return Sizing Set ${formData.setNo ? `(${formData.setNo})` : ""}`}
              </h2>
              <p className="text-xs text-muted-foreground">
                Record returned sizing set from sizing mill, verify technical warp dimensions, and confirm beam assignments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-custom">
          {/* Error Banner */}
          {Object.keys(formErrors).length > 0 && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="h-4 w-4" /> Please resolve the following errors:
              </div>
              <ul className="list-disc list-inside space-y-0.5">
                {Object.entries(formErrors).map(([key, val]) => (
                  <li key={key}>
                    <strong className="capitalize">{key.replace(/_/g, " ")}:</strong>{" "}
                    {Array.isArray(val) ? val.join(", ") : String(val)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form id="sizing-outcome-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Sizing Mill & Set Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                1. Sizing Party & Set Identification
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SelectField
                  label="Sizing Mill / Party"
                  name="sizingId"
                  value={formData.sizingId}
                  onChange={handleSizingSelect}
                  options={sizingOptions}
                  required
                  disabled={Boolean(initialSizingId || isInSizing)}
                  error={formErrors.sizing_id || formErrors.sizingId}
                />

                <InputField
                  label="Outcome Return Date"
                  name="outcomeDate"
                  type="date"
                  value={formData.outcomeDate}
                  onChange={handleChange}
                  required
                  error={formErrors.outcome_date || formErrors.outcomeDate}
                />

                <InputField
                  label="Set Number"
                  name="setNo"
                  value={formData.setNo}
                  onChange={handleChange}
                  placeholder="e.g. SET-2026-001"
                  disabled={Boolean(initialSetNo)}
                  error={formErrors.set_no || formErrors.setNo}
                  inputClassName="font-mono font-semibold"
                />
              </div>
            </div>

            {/* Section 2: Bags & Cones Balance */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Sizing Bags & Cones Balance
                </h3>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Auto-populated from dispatch · Enter Lagat (Consumed) Bags below
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/20 border border-border">
                <InputField
                  label="Total Bags on Sizing"
                  name="totalBagsOnSizing"
                  type="number"
                  value={formData.totalBagsOnSizing}
                  onChange={handleChange}
                  disabled={true}
                  placeholder="e.g. 50"
                  error={formErrors.total_bags_on_sizing}
                />

                <InputField
                  label="Bag Packing (Cones/Bag)"
                  name="bagPackingCone"
                  type="number"
                  value={formData.bagPackingCone}
                  onChange={handleChange}
                  disabled={true}
                  placeholder="24"
                  error={formErrors.bag_packing_cone}
                />

                <InputField
                  label="Total Cones"
                  name="totalCones"
                  type="number"
                  value={formData.totalCones}
                  onChange={handleChange}
                  disabled={true}
                  placeholder="1200"
                  error={formErrors.total_cones}
                />

                <InputField
                  label="Lagat (Consumed) Bags *"
                  name="lagatBags"
                  type="number"
                  step="0.01"
                  value={formData.lagatBags}
                  onChange={(e) => handleLagatBagsChange(e.target.value)}
                  placeholder="e.g. 45.00"
                  inputClassName="font-bold border-primary/40 focus:border-primary"
                  error={formErrors.lagat_bags}
                />

                <InputField
                  label="Lagat Cones"
                  name="lagatCones"
                  type="number"
                  step="0.01"
                  value={formData.lagatCones}
                  onChange={handleChange}
                  disabled={true}
                  placeholder="e.g. 1080.00"
                  error={formErrors.lagat_cones}
                />

                <InputField
                  label="Remaining Bags in Sizing"
                  name="remainingBagsOnSizingStock"
                  type="number"
                  value={formData.remainingBagsOnSizingStock}
                  onChange={handleChange}
                  disabled={true}
                  placeholder="e.g. 5"
                  error={formErrors.remaining_bags_on_sizing_stock}
                />

                <InputField
                  label="Remaining Cones in Sizing"
                  name="remainingConesOnSizingStock"
                  type="number"
                  value={formData.remainingConesOnSizingStock}
                  onChange={handleChange}
                  disabled={true}
                  placeholder="e.g. 120"
                  error={formErrors.remaining_cones_on_sizing_stock}
                />

                <InputField
                  label="Yarn Brand / Name"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  disabled={Boolean(initialBrand)}
                  placeholder="e.g. Diamond Yarn"
                  error={formErrors.brand}
                />
              </div>
            </div>

            {/* Section 3: Technical Specifications & Length */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                3. Technical Specifications & Dimensions <span className="text-destructive">*</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <InputField
                  label="Yarn Count"
                  name="count"
                  value={formData.count}
                  onChange={handleChange}
                  placeholder="e.g. 40/1 or 20/1"
                  disabled={Boolean(initialCount)}
                  required
                  error={formErrors.count}
                />

                <InputField
                  label="Width (Inches)"
                  name="width"
                  type="number"
                  step="0.01"
                  value={formData.width}
                  onChange={handleChange}
                  placeholder="e.g. 63.00"
                  required
                  error={formErrors.width}
                />

                <InputField
                  label="Total Tarr / Ends"
                  name="totalTarr"
                  type="number"
                  step="0.01"
                  value={formData.totalTarr}
                  onChange={handleChange}
                  placeholder="e.g. 4800"
                  required
                  error={formErrors.total_tarr || formErrors.totalTarr}
                />

                <InputField
                  label="Set Length (Meters)"
                  name="setLengthMeter"
                  type="number"
                  step="0.01"
                  value={formData.setLengthMeter}
                  onChange={(e) => handleMeterChange(e.target.value)}
                  placeholder="e.g. 12500"
                  required
                  error={formErrors.set_length_meter || formErrors.setLengthMeter}
                />

                <InputField
                  label="Set Length (Gaz / Yards)"
                  name="setLengthGaz"
                  type="number"
                  step="0.01"
                  value={formData.setLengthGaz}
                  onChange={handleChange}
                  placeholder="e.g. 13670.17"
                  required
                  error={formErrors.set_length_gaz || formErrors.setLengthGaz}
                />

                <InputField
                  label="Total Set Shortage (%)"
                  name="totalSetShortage"
                  type="number"
                  step="0.01"
                  value={formData.totalSetShortage}
                  onChange={handleChange}
                  placeholder="e.g. 2.50"
                  required
                  error={formErrors.total_set_shortage || formErrors.totalSetShortage}
                />

                <InputField
                  label="Yarn Beam ID / Mark"
                  name="yarnBeam"
                  value={formData.yarnBeam}
                  onChange={handleChange}
                  placeholder="e.g. YB-SetA"
                  required
                  error={formErrors.yarn_beam || formErrors.yarnBeam}
                />
              </div>
            </div>

            {/* Section 4: Physical Warp Beams Ready from Sizing */}
            {!isEdit && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Disc className="h-4 w-4 text-primary" /> 4. Physical Warp Beams Ready from Sizing ({selectedBeamIds.length})
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Physical warp beams dispatched for this sizing set returning ready:
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {dispatchedBeams.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {dispatchedBeams.map((beam) => {
                        const isSelected = selectedBeamIds.includes(beam.id);
                        return (
                          <div
                            key={beam.id}
                            onClick={() => handleToggleBeam(beam.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                              isSelected
                                ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30"
                                : "border-border bg-card opacity-60 hover:opacity-100"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-xs text-foreground">
                                {beam.beamCode || beam.beamNumber}
                              </span>
                              {isSelected && (
                                <div className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">
                                  <Check className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-1 truncate">
                              {beam.beamName || "Warp Beam"}
                            </div>
                            <div className="text-[10px] text-primary font-semibold mt-1 flex items-center gap-1">
                              ✓ Ready from Sizing
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 text-center text-xs text-muted-foreground">
                      No specific physical beams were attached when this yarn was dispatched to sizing.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Remarks */}
            <div className="pt-4 border-t border-border">
              <TextareaField
                label="Operational Remarks & Notes"
                name="remarks"
                rows={2}
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Enter sizing recipe, quality observations, or delivery notes..."
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-muted/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="h-10 px-4 rounded-lg border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="sizing-outcome-form"
            disabled={isSaving}
            className="h-10 px-5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Update Sizing Outcome" : `Return Sizing Set (${selectedBeamIds.length} Beams)`}
          </button>
        </div>
      </div>
    </div>
  );
}

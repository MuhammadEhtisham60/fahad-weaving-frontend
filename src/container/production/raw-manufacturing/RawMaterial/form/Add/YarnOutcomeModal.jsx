import React, { useState, useMemo, useEffect } from "react";
import { X, AlertCircle, Loader2, Send, Scale, Package, Calendar, Disc, Check } from "lucide-react";
import { toast } from "sonner";
import {
  useGetSizingChoicesQuery,
  useGetCustomerChoicesQuery,
  useGetCustomersQuery,
  useGetAvailableBeamsQuery,
  useCreateYarnOutcomeMutation,
} from "../../../../../../store/index.js";
import {
  InputField,
  SelectField,
  TextareaField,
} from "../../../../../../common/sharefield";
import { SizingSelect } from "../../components/SizingSelect.jsx";
import { SizingModal } from "../../../../sizing/components/SizingModal.jsx";

export function YarnOutcomeModal({ yarnIntake, onClose, onSuccess }) {
  const { data: sizingChoicesData } = useGetSizingChoicesQuery();
  const { data: customerListData } = useGetCustomersQuery({ page_size: 100 });
  const { data: customerChoicesData } = useGetCustomerChoicesQuery();
  const { data: availableBeamsData, isLoading: loadingBeams } = useGetAvailableBeamsQuery();

  const [createYarnOutcome, { isLoading }] = useCreateYarnOutcomeMutation();

  const [outcomeType, setOutcomeType] = useState("Sizing");
  const [isAddSizingOpen, setIsAddSizingOpen] = useState(false);
  const [selectedBeamIds, setSelectedBeamIds] = useState([]);
  
  const [formData, setFormData] = useState({
    outcomeBags: "",
    outcomeConesPerBag: yarnIntake?.conesPerBag || yarnIntake?.boxes || "24",
    outcomeWeightPerBagKg: yarnIntake?.weightPerBagKg || yarnIntake?.weight_per_bag_kg || "45.36",
    sizing: "",
    yarnBuyer: "",
    ratePerKg: "",
    outcomeDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (yarnIntake) {
      setFormData((prev) => ({
        ...prev,
        outcomeConesPerBag: yarnIntake.conesPerBag || yarnIntake.boxes || prev.outcomeConesPerBag || "24",
        outcomeWeightPerBagKg: yarnIntake.weightPerBagKg || yarnIntake.weight_per_bag_kg || prev.outcomeWeightPerBagKg || "45.36",
      }));
    }
  }, [yarnIntake]);

  const availableBags = yarnIntake?.remainingBags ?? yarnIntake?.availableBags ?? yarnIntake?.bags ?? 100;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleToggleBeam = (beamId) => {
    setSelectedBeamIds((prev) =>
      prev.includes(beamId) ? prev.filter((id) => id !== beamId) : [...prev, beamId]
    );
  };

  const availableBeams = useMemo(() => {
    if (Array.isArray(availableBeamsData)) return availableBeamsData;
    if (Array.isArray(availableBeamsData?.results)) return availableBeamsData.results;
    if (Array.isArray(availableBeamsData?.data)) return availableBeamsData.data;
    return [];
  }, [availableBeamsData]);

  const getFieldError = (camelKey, snakeKey) => {
    const err = formErrors[camelKey] || (snakeKey ? formErrors[snakeKey] : null);
    if (!err) return undefined;
    return Array.isArray(err) ? err[0] : String(err);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const bags = Number(formData.outcomeBags);
    const weightPerBag = Number(formData.outcomeWeightPerBagKg);
    const errors = {};

    const intakeId = Number(yarnIntake?.id || yarnIntake?.yarnIntakeId || yarnIntake?.yarn_intake_id);
    if (!intakeId) {
      errors.yarnIntake = ["Valid Yarn Intake reference is required."];
    }

    if (!bags || bags <= 0) {
      errors.outcomeBags = ["Please enter a valid number of bags."];
    } else if (bags > availableBags) {
      errors.outcomeBags = [`Cannot dispatch more than available stock (${availableBags} bags).`];
    }

    if (!weightPerBag || weightPerBag <= 0) {
      errors.outcomeWeightPerBagKg = ["Weight per bag (KG) is required."];
    }

    if (!formData.outcomeDate) {
      errors.outcomeDate = ["Dispatch Date is required."];
    }

    if (outcomeType === "Sizing" && !formData.sizing) {
      errors.sizing = ["Sizing Unit is required for Sizing outcome type."];
    }

    if (outcomeType === "Sold") {
      if (!formData.yarnBuyer) {
        errors.yarnBuyer = ["Customer / Buyer is required for Sold yarn."];
      }
      if (!formData.ratePerKg || Number(formData.ratePerKg) <= 0) {
        errors.ratePerKg = ["Rate per KG is required for Sold yarn."];
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        yarnIntake: intakeId,
        outcomeType: outcomeType,
        outcomeBags: bags,
        outcomeConesPerBag: formData.outcomeConesPerBag ? Number(formData.outcomeConesPerBag) : 24,
        outcomeWeightPerBagKg: weightPerBag || 45.36,
        outcomeDate: formData.outcomeDate,
        sizing: outcomeType === "Sizing" && formData.sizing ? Number(formData.sizing) : null,
        beam_ids: outcomeType === "Sizing" && selectedBeamIds.length > 0 ? selectedBeamIds : undefined,
        yarnBuyer: outcomeType === "Sold" && formData.yarnBuyer ? Number(formData.yarnBuyer) : null,
        ratePerKg: outcomeType === "Sold" && formData.ratePerKg ? Number(formData.ratePerKg) : null,
        notes: formData.notes.trim() || undefined,
      };

      await createYarnOutcome(payload).unwrap();
      toast.success(`Dispatched ${bags} bag(s) of yarn to ${outcomeType}${selectedBeamIds.length > 0 ? ` with ${selectedBeamIds.length} beam(s)` : ""}.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      if (err?.status === 400 && err?.data) {
        const backendErrs = err.data.errors || err.data;
        if (typeof backendErrs === "object") {
          setFormErrors(backendErrs);
        }
      } else {
        toast.error(err?.data?.message || "Failed to dispatch yarn outcome.");
      }
    }
  };

  const customerOptions = useMemo(() => {
    const rawList = Array.isArray(customerListData)
      ? customerListData
      : Array.isArray(customerListData?.results)
      ? customerListData.results
      : Array.isArray(customerListData?.data)
      ? customerListData.data
      : Array.isArray(customerChoicesData)
      ? customerChoicesData
      : Array.isArray(customerChoicesData?.customers)
      ? customerChoicesData.customers
      : Array.isArray(customerChoicesData?.data)
      ? customerChoicesData.data
      : [];

    return [
      { value: "", label: "-- Select Customer / Buyer --" },
      ...rawList.map((c) => ({
        value: c.id ?? c.value,
        label: c.customerName || c.name || c.companyName || c.label || `Customer #${c.id ?? c.value}`,
      })),
    ];
  }, [customerListData, customerChoicesData]);

  const outcomeTypeOptions = [
    { value: "Sizing", label: "Dispatch to Sizing Mill", description: "Send to sizing unit for warping & sizing" },
    { value: "Weft", label: "Issue as Weft Yarn", description: "Use directly as weft for loom filling" },
    { value: "Sold", label: "Sell Yarn to Customer", description: "Commercial sale of yarn stock" },
  ];

  const calcTotalKg = (Number(formData.outcomeBags) || 0) * (Number(formData.outcomeWeightPerBagKg) || 0);
  const calcTotalLbs = calcTotalKg * 2.20462;
  const calcTotalCones = (Number(formData.outcomeBags) || 0) * (Number(formData.outcomeConesPerBag) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Dispatch Yarn Outcome</h2>
              <p className="text-xs text-muted-foreground">
                {yarnIntake?.name || yarnIntake?.yarnName || "Yarn Batch"} · Available: <strong>{availableBags} Bags</strong>
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
        <div className="p-6 overflow-y-auto space-y-5 flex-1 scrollbar-custom">
          {Object.keys(formErrors).length > 0 && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="h-4 w-4" /> Please resolve errors:
              </div>
              <ul className="list-disc list-inside">
                {Object.entries(formErrors).map(([key, val]) => (
                  <li key={key}>
                    <strong>{key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}:</strong>{" "}
                    {Array.isArray(val) ? val.join(", ") : String(val)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form id="yarn-outcome-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Outcome Type Radio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Dispatch Destination <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {outcomeTypeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setOutcomeType(opt.value);
                      setFormErrors({});
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      outcomeType === opt.value
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border bg-card hover:bg-muted/40"
                    }`}
                  >
                    <div className="font-semibold text-xs text-foreground">{opt.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{opt.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Specific Fields */}
            {outcomeType === "Sizing" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Target Sizing Unit <span className="text-destructive">*</span>
                  </label>
                  <SizingSelect
                    value={formData.sizing}
                    onChange={(val) => {
                      setFormData((prev) => ({ ...prev, sizing: val }));
                      if (formErrors.sizing) {
                        setFormErrors((prev) => {
                          const next = { ...prev };
                          delete next.sizing;
                          return next;
                        });
                      }
                    }}
                    sizings={
                      Array.isArray(sizingChoicesData)
                        ? sizingChoicesData
                        : Array.isArray(sizingChoicesData?.data)
                        ? sizingChoicesData.data
                        : Array.isArray(sizingChoicesData?.results)
                        ? sizingChoicesData.results
                        : []
                    }
                    onOpenAddModal={() => setIsAddSizingOpen(true)}
                    error={Boolean(getFieldError("sizing"))}
                  />
                  {getFieldError("sizing") && (
                    <p className="text-[11px] text-destructive font-medium">
                      {getFieldError("sizing")}
                    </p>
                  )}
                </div>

                {/* Assign Physical Warp Beams Section */}
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Disc className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Assign Physical Warp Beams</h4>
                        <p className="text-[11px] text-muted-foreground">
                          Attach available empty beams to this sizing job
                        </p>
                      </div>
                    </div>
                    {selectedBeamIds.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500 text-white shadow-sm">
                        {selectedBeamIds.length} Beam{selectedBeamIds.length === 1 ? "" : "s"} Selected
                      </span>
                    )}
                  </div>

                  {loadingBeams ? (
                    <div className="py-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading available beams...
                    </div>
                  ) : availableBeams.length === 0 ? (
                    <div className="p-3 rounded-lg bg-muted/40 border border-border text-center text-xs text-muted-foreground">
                      No &apos;Available&apos; physical beams found in inventory. You can create beams in the Beams section or assign later in Sizing.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {availableBeams.map((beam) => {
                        const isSelected = selectedBeamIds.includes(beam.id);
                        return (
                          <div
                            key={beam.id}
                            onClick={() => handleToggleBeam(beam.id)}
                            className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-start justify-between gap-2 ${
                              isSelected
                                ? "bg-purple-500/15 border-purple-500 text-foreground shadow-sm"
                                : "bg-card border-border hover:bg-muted/50 text-foreground"
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="font-mono font-bold text-xs flex items-center gap-1.5">
                                <Disc className={`h-3.5 w-3.5 ${isSelected ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"}`} />
                                {beam.beamNumber || beam.beam_number || `Beam #${beam.id}`}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {beam.yarnCount || beam.yarn_count ? <span>{beam.yarnCount || beam.yarn_count} · </span> : null}
                                {beam.warpCount || beam.warp_count ? <span>{beam.warpCount || beam.warp_count} Ends</span> : null}
                                {beam.length ? <span> · {beam.length}m</span> : null}
                              </div>
                            </div>
                            <div
                              className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? "bg-purple-600 border-purple-600 text-white"
                                  : "border-border bg-card"
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {outcomeType === "Sold" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/20 border border-border">
                <SelectField
                  label="Customer / Buyer"
                  name="yarnBuyer"
                  value={formData.yarnBuyer}
                  onChange={handleChange}
                  options={customerOptions}
                  required
                  error={getFieldError("yarnBuyer", "yarn_buyer")}
                />
                <InputField
                  label="Selling Rate Per KG"
                  name="ratePerKg"
                  type="number"
                  step="0.01"
                  value={formData.ratePerKg}
                  onChange={handleChange}
                  placeholder="e.g. 520.00"
                  required
                  error={getFieldError("ratePerKg", "rate_per_kg")}
                />
              </div>
            )}

            {/* Quantity Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField
                label="Bags to Dispatch"
                name="outcomeBags"
                type="number"
                min="1"
                max={availableBags}
                value={formData.outcomeBags}
                onChange={handleChange}
                placeholder={`Max: ${availableBags}`}
                required
                error={getFieldError("outcomeBags", "outcome_bags")}
              />

              <InputField
                label="Dispatch Date"
                name="outcomeDate"
                type="date"
                value={formData.outcomeDate}
                onChange={handleChange}
                required
                error={getFieldError("outcomeDate", "outcome_date")}
              />

              <InputField
                label="Weight Per Bag (KG)"
                name="outcomeWeightPerBagKg"
                type="number"
                step="0.01"
                min="0.1"
                value={formData.outcomeWeightPerBagKg}
                onChange={handleChange}
                placeholder="45.36"
                required
                error={getFieldError("outcomeWeightPerBagKg", "outcome_weight_per_bag_kg")}
              />

              <InputField
                label="Cones Per Bag"
                name="outcomeConesPerBag"
                type="number"
                min="1"
                value={formData.outcomeConesPerBag}
                onChange={handleChange}
                placeholder="24"
                error={getFieldError("outcomeConesPerBag", "outcome_cones_per_bag")}
              />
            </div>

            {/* Summary Live Calculation Pill */}
            {Number(formData.outcomeBags) > 0 && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Scale className="h-4 w-4" />
                  <span>Calculated Net Weight:</span>
                </div>
                <div className="font-bold text-foreground">
                  {calcTotalKg.toLocaleString(undefined, { maximumFractionDigits: 2 })} KG
                  <span className="text-muted-foreground font-normal ml-1">
                    ({calcTotalLbs.toLocaleString(undefined, { maximumFractionDigits: 2 })} lbs · {calcTotalCones} cones)
                  </span>
                </div>
              </div>
            )}

            <TextareaField
              label="Remarks / Dispatch Notes"
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Dispatched for Set #8 sizing"
            />
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-muted/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-10 px-4 rounded-lg border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="yarn-outcome-form"
            disabled={isLoading}
            className="h-10 px-5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm Dispatch
          </button>
        </div>
      </div>

      {/* Add Sizing Unit Modal */}
      {isAddSizingOpen && (
        <SizingModal
          onClose={() => setIsAddSizingOpen(false)}
          onSuccess={(newSizing) => {
            const newId = newSizing?.id ?? newSizing?.value;
            if (newId) {
              setFormData((prev) => ({ ...prev, sizing: newId }));
              if (formErrors.sizing) {
                setFormErrors((prev) => {
                  const next = { ...prev };
                  delete next.sizing;
                  return next;
                });
              }
            }
            setIsAddSizingOpen(false);
          }}
        />
      )}
    </div>
  );
}

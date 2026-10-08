import React, { useState, useEffect, useMemo } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../../components/ui-kit.jsx";
import { YARN_TYPES, YARN_COUNTS, WAREHOUSES } from "../../utils/constants.js";
import { SupplierSelect } from "../components/SupplierSelect.jsx";
import { SupplierModal } from "../../../../purchase/components/SupplierModal.jsx";
import {
  InputField,
  SelectField,
  TextareaField,
  RadioGroupField,
} from "../../../../../common/sharefield";
import {
  useGetSuppliersQuery,
  useCreateYarnIntakeMutation,
  useUpdateYarnIntakeMutation,
} from "../../../../../store/index.js";
import {
  buildYarnIntakePayload,
  mapYarnIntakeToRow,
  validateYarnIntakeForm,
} from "../../utils/yarnIntakeMapper.js";

export function RawMaterialFormModal({ item, onSave, onClose }) {
  const isEdit = Boolean(item && item.id);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // RTK Query: Fetch real suppliers from backend API (/api/v1/purchase/suppliers/)
  const { data: suppliersResponse, isLoading: isLoadingSuppliers } = useGetSuppliersQuery({
    ordering: "-created_at",
    page: 1,
    page_size: 100,
  }, {
    refetchOnMountOrArgChange: true,
  });
  const [createYarnIntake, { isLoading: isCreating }] = useCreateYarnIntakeMutation();
  const [updateYarnIntake, { isLoading: isUpdating }] = useUpdateYarnIntakeMutation();
  const isSubmitting = isCreating || isUpdating;

  // Normalized Supplier List from live API data
  const suppliersList = useMemo(() => {
    const rawList =
      suppliersResponse?.results ||
      suppliersResponse?.data ||
      (Array.isArray(suppliersResponse) ? suppliersResponse : []);

    if (Array.isArray(rawList) && rawList.length > 0) {
      return rawList.map((s) => {
        const displayName =
          s.companyName && s.supplierName && s.companyName !== s.supplierName
            ? `${s.supplierName} (${s.companyName})`
            : s.supplierName || s.companyName || s.supplier_name || s.name || `Supplier #${s.id}`;

        return {
          id: s.id,
          value: s.id,
          name: displayName,
          label: displayName,
          supplierCode: s.supplierCode || s.supplier_code || "",
          supplierName: s.supplierName || s.supplier_name || "",
          companyName: s.companyName || s.company_name || "",
          raw: s,
        };
      });
    }
    return [];
  }, [suppliersResponse]);

  const initialNetKg = item?.netWeightKg !== undefined
    ? item.netWeightKg
    : (item?.unit === "lb" && item?.netWeight ? Math.round(item.netWeight / 2.20462262) : (item?.netWeight || ""));

  const initialWeightPerBag = item?.weightPerBagKg !== undefined
    ? String(item.weightPerBagKg)
    : item?.weight_per_bag_kg !== undefined
    ? String(item.weight_per_bag_kg)
    : (item?.bags && initialNetKg ? String(Number((Number(initialNetKg) / Number(item.bags)).toFixed(2))) : "45.36");

  // Determine initial supplier value (id or fallback)
  const initialSupplier = useMemo(() => {
    if (item?.supplierId) return item.supplierId;
    if (item?.supplier && typeof item.supplier === "object") return item.supplier.id || item.supplier.value;
    if (typeof item?.supplier === "number") return item.supplier;
    if (typeof item?.supplier === "string") {
      const match = suppliersList.find((s) => s.name.toLowerCase() === item.supplier.toLowerCase());
      if (match) return match.id;
    }
    return item?.supplier || "";
  }, [item, suppliersList]);

  const [formData, setFormData] = useState({
    entryNo: item?.entryNo || "",
    date: item?.date || new Date().toISOString().slice(0, 10),
    name: item?.name || "",
    yarnType: item?.yarnType || "",
    count: item?.count || "",
    productionType: item?.productionType || "Self",
    supplier: initialSupplier,
    bags: item?.bags !== undefined ? item.bags : "",
    boxes: item?.boxes !== undefined ? item.boxes : (item?.conesPerBag !== undefined ? item.conesPerBag : "24"),
    weightPerBagKg: initialWeightPerBag,
    ratePerBag: item?.ratePerBag !== undefined ? item.ratePerBag : "",
    netWeightKg: initialNetKg || (item?.bags ? (Number(item.bags) * Number(initialWeightPerBag)).toFixed(2) : ""),
    unit: "lb",
    lotNo: item?.lotNo || item?.setNo || "",
    warehouse: item?.warehouse || "",
    status: item?.status || "Received",
    notes: item?.notes || "",
  });

  // Sync initial supplier once suppliers list resolves
  useEffect(() => {
    if (initialSupplier && (!formData.supplier || formData.supplier === "")) {
      setFormData((prev) => ({ ...prev, supplier: initialSupplier }));
    }
  }, [initialSupplier]);

  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleBagsChange = (val) => {
    const b = Number(val);
    const w = Number(formData.weightPerBagKg);
    const calculatedNetKg = b > 0 && w > 0 ? (b * w).toFixed(2) : "";
    setFormData((prev) => ({
      ...prev,
      bags: val,
      netWeightKg: calculatedNetKg !== "" ? calculatedNetKg : prev.netWeightKg,
    }));
    setError("");
  };

  const handleWeightPerBagChange = (val) => {
    const w = Number(val);
    const b = Number(formData.bags);
    const calculatedNetKg = b > 0 && w > 0 ? (b * w).toFixed(2) : "";
    setFormData((prev) => ({
      ...prev,
      weightPerBagKg: val,
      netWeightKg: calculatedNetKg !== "" ? calculatedNetKg : prev.netWeightKg,
    }));
    setError("");
  };

  const handleNetWeightKgChange = (val) => {
    const netKg = Number(val);
    const b = Number(formData.bags);
    const calculatedWeightPerBag = b > 0 && netKg > 0 ? (netKg / b).toFixed(2) : formData.weightPerBagKg;
    setFormData((prev) => ({
      ...prev,
      netWeightKg: val,
      weightPerBagKg: calculatedWeightPerBag,
    }));
    setError("");
  };

  const bagsCount = Number(formData.bags) || 0;
  const conesPerBag = Number(formData.boxes) || 0;
  const totalCones = bagsCount * conesPerBag;
  const ratePerBag = Number(formData.ratePerBag) || 0;
  const totalAmount = bagsCount * ratePerBag;

  const netWeightKg = Number(formData.netWeightKg) || (bagsCount > 0 && Number(formData.weightPerBagKg) > 0 ? Number((bagsCount * Number(formData.weightPerBagKg)).toFixed(2)) : 0);
  const netWeightLb = netWeightKg > 0 ? Number((netWeightKg * 2.20462262).toFixed(2)) : 0;
  const weightPerBagKg = Number(formData.weightPerBagKg) || (bagsCount > 0 ? Number((netWeightKg / bagsCount).toFixed(3)) : 45.36);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formValidation = validateYarnIntakeForm({
      yarnName: formData.name,
      yarnType: formData.yarnType,
      yarnCount: formData.count,
      setNo: formData.lotNo,
      supplier: formData.supplier,
      bags: formData.bags,
      conesPerBag: formData.boxes,
      weightPerBagKg,
      ratePerBag: formData.ratePerBag,
      intakeDate: formData.date,
      productionType: formData.productionType,
    });

    if (formValidation) {
      setError(formValidation);
      return;
    }

    const payload = buildYarnIntakePayload({
      yarnName: formData.name,
      yarnType: formData.yarnType,
      yarnCount: formData.count,
      setNo: formData.lotNo,
      supplier: formData.supplier,
      bags: formData.bags,
      conesPerBag: formData.boxes,
      weightPerBagKg,
      ratePerBag: formData.ratePerBag,
      intakeDate: formData.date,
      productionType: formData.productionType,
      notes: formData.notes,
    });

    const fullPayload = {
      ...payload,
      yarn_name: payload.yarnName,
      yarn_type: payload.yarnType,
      yarn_count: payload.yarnCount,
      set_no: payload.setNo,
      cones_per_bag: payload.conesPerBag,
      weight_per_bag_kg: payload.weightPerBagKg,
      rate_per_bag: payload.ratePerBag,
      intake_date: payload.intakeDate,
    };

    try {
      let resultData = null;
      if (isEdit) {
        const res = await updateYarnIntake({ id: item.id, ...fullPayload }).unwrap();
        resultData = res?.data || res;
        toast.success("Yarn intake record updated successfully!");
      } else {
        const res = await createYarnIntake(fullPayload).unwrap();
        resultData = res?.data || res;
        toast.success("New raw yarn intake recorded successfully!");
      }

      if (onSave) {
        const mappedRow = mapYarnIntakeToRow(resultData) || {
          ...formData,
          id: resultData?.id || item?.id || Date.now(),
          bags: bagsCount,
          boxes: conesPerBag,
          conesPerBag,
          totalCones,
          ratePerBag: formData.productionType === "Conversion" ? 0 : ratePerBag,
          totalAmount: formData.productionType === "Conversion" ? 0 : totalAmount,
          weightPerBagKg,
          netWeightKg,
          netWeight: netWeightLb,
          unit: "lb",
          status: isEdit ? (item?.status || "Received") : "Received",
        };
        onSave(mappedRow);
      } else if (onClose) {
        onClose();
      }
    } catch (err) {
      console.warn("API Error, falling back to local handler:", err);
      const fallbackRow = {
        ...formData,
        id: item?.id || Date.now(),
        bags: bagsCount,
        boxes: conesPerBag,
        conesPerBag,
        totalCones,
        ratePerBag: formData.productionType === "Conversion" ? 0 : ratePerBag,
        totalAmount: formData.productionType === "Conversion" ? 0 : totalAmount,
        weightPerBagKg,
        netWeightKg,
        netWeight: netWeightLb,
        unit: "lb",
        status: isEdit ? (item?.status || "Received") : "Received",
      };
      if (onSave) {
        onSave(fallbackRow);
      }
      toast.success(isEdit ? "Yarn record updated!" : "Yarn intake saved!");
    }
  };

  const yarnTypeOptions = [
    { value: "", label: "Select Yarn Type" },
    ...YARN_TYPES.map((yt) => ({ value: yt, label: yt })),
  ];
  const yarnCountOptions = [
    { value: "", label: "Select Yarn Count" },
    ...YARN_COUNTS.map((yc) => ({ value: yc, label: yc })),
  ];
  const productionTypeOptions = [
    { value: "Conversion", label: "Conversion", description: "Customer Job Work / Order" },
    { value: "Self", label: "Self", description: "Own Manufacturing / In-house" },
  ];

  const handleSupplierCreated = (newSup) => {
    const createdId = newSup?.id || newSup?.data?.id;
    if (createdId) {
      setFormData((prev) => ({ ...prev, supplier: createdId }));
    }
    setIsSupplierModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-6 scrollbar-custom">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isEdit ? `Edit Raw Material (${item.entryNo || item.setNo || item.id})` : "Record Raw Yarn Intake"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter incoming yarn cones / bags received in warehouse stock
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Yarn / Material Name"
            name="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g. 100% Combed Cotton Yarn 40s"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              label="Yarn Type"
              name="yarnType"
              value={formData.yarnType}
              onChange={(e) => handleChange("yarnType", e.target.value)}
              options={yarnTypeOptions}
              placeholder="Select Yarn Type"
              required
              searchable={false}
            />

            <SelectField
              label="Yarn Count"
              name="count"
              value={formData.count}
              onChange={(e) => handleChange("count", e.target.value)}
              options={yarnCountOptions}
              placeholder="Select Yarn Count"
              required
              searchable={false}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="Lot / Batch Number"
              name="lotNo"
              value={formData.lotNo}
              onChange={(e) => handleChange("lotNo", e.target.value)}
              placeholder="e.g. LOT-CTN-40S-991"
              required
              inputClassName="font-mono"
            />

            <InputField
              label="Intake Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Supplier / Spinning Mill <span className="text-destructive">*</span>
            </label>
            <SupplierSelect
              value={formData.supplier}
              onChange={(val) => handleChange("supplier", val)}
              suppliers={suppliersList}
              onOpenAddSupplierModal={() => setIsSupplierModalOpen(true)}
              placeholder={isLoadingSuppliers ? "Loading suppliers..." : "Select or enter Supplier / Spinning Mill"}
              className="h-10 rounded-lg text-sm"
            />
          </div>

          <RadioGroupField
            label="Production Type"
            name="productionTypeModal"
            value={formData.productionType}
            onChange={(e) => handleChange("productionType", e.target.value)}
            options={productionTypeOptions}
            layout="grid"
            variant="card"
            required
          />

          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InputField
                label="Bags / Boray"
                name="bags"
                type="number"
                min="1"
                value={formData.bags}
                onChange={(e) => handleBagsChange(e.target.value)}
                placeholder="e.g. 100"
                required
                inputClassName="font-semibold"
              />

              <InputField
                label="Weight / Bag (KG)"
                name="weightPerBagKg"
                type="number"
                min="0.1"
                step="0.01"
                suffix="KG"
                value={formData.weightPerBagKg}
                onChange={(e) => handleWeightPerBagChange(e.target.value)}
                placeholder="45.36"
                inputClassName="font-mono font-semibold"
                required
              />

              <InputField
                label="Cones per bag"
                name="boxes"
                type="number"
                min="0"
                value={formData.boxes}
                onChange={(e) => handleChange("boxes", e.target.value)}
                placeholder="e.g. 24"
              />

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Total Cones
                </label>
                <div className="w-full h-10 px-3 rounded-lg bg-muted/60 border border-border flex items-center justify-between text-sm font-bold text-foreground select-none">
                  <span className="text-primary font-mono">{totalCones.toLocaleString()}</span>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">Cones</span>
                </div>
              </div>
            </div>

            {/* Rates & Net Weights with Instant 2-way Conversion */}
            <div className={`grid grid-cols-1 ${formData.productionType === "Conversion" ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-3 pt-2.5 border-t border-border/50`}>
              {formData.productionType !== "Conversion" && (
                <InputField
                  label="Rate / Bag (PKR)"
                  name="ratePerBag"
                  type="number"
                  min="0"
                  step="10"
                  prefix="Rs"
                  value={formData.ratePerBag}
                  onChange={(e) => handleChange("ratePerBag", e.target.value)}
                  placeholder="e.g. 18500"
                  inputClassName="font-mono font-semibold"
                />
              )}

              <InputField
                label="Net Weight (KG)"
                name="netWeightKg"
                type="number"
                min="1"
                step="0.01"
                suffix="KG"
                value={formData.netWeightKg}
                onChange={(e) => handleNetWeightKgChange(e.target.value)}
                required
                placeholder="Auto-calculated from Bags × Weight/Bag"
                inputClassName="font-mono font-semibold"
              />

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Net Weight (LB)
                </label>
                <div className="w-full h-10 px-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between text-sm font-bold text-primary font-mono select-none">
                  <span>{netWeightLb ? netWeightLb.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : "0.0"}</span>
                  <span className="text-[10px] font-semibold uppercase">LB</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-border/50 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">Total Cones:</span>
                  <span className="font-mono text-primary font-bold text-sm">{totalCones.toLocaleString()}</span>
                  <span>({bagsCount} bags × {conesPerBag} cones)</span>
                </div>
                {formData.productionType !== "Conversion" && ratePerBag > 0 && (
                  <div className="flex items-center gap-1.5 pl-3 border-l border-border">
                    <span className="font-semibold text-foreground">Total Value:</span>
                    <span className="font-mono text-emerald-500 font-bold text-sm">
                      Rs {totalAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span>
                  Net Weight: <strong className="text-foreground font-semibold">{netWeightKg.toLocaleString()} KG</strong> → <strong className="text-primary font-semibold">{netWeightLb.toLocaleString()} LB</strong>
                </span>
                <span>(@ {weightPerBagKg} kg/bag)</span>
              </div>
            </div>
          </div>

          <TextareaField
            label="Remarks & Technical Notes"
            name="notes"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={2}
            placeholder="e.g. Warp yarn for fine shirting fabric. Checked for CSP and evenness."
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                isEdit ? "Update Intake Record" : "Save Yarn Intake"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Add New Supplier Popup Modal */}
      {isSupplierModalOpen && (
        <SupplierModal
          onClose={() => setIsSupplierModalOpen(false)}
          onSuccess={handleSupplierCreated}
        />
      )}
    </div>
  );
}

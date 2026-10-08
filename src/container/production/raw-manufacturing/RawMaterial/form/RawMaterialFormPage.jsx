import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Save,
  Package,
  Scale,
  FileText,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { PageHeader, Card, SectionTitle, Button, fmt } from "../../../../../components/ui-kit.jsx";
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
import { toast } from "sonner";

export function RawMaterialFormPage({ item, onSave, onBack }) {
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

  // Auto calculation handlers: Weight per bag -> Net Weight (KG) -> Net Weight (LB)
  const handleBagsChange = (val) => {
    const b = Number(val);
    const w = Number(formData.weightPerBagKg);
    const calculatedNetKg = b > 0 && w > 0 ? (b * w).toFixed(2) : (val === "" ? "" : formData.netWeightKg);
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
    const calculatedNetKg = b > 0 && w > 0 ? (b * w).toFixed(2) : (val === "" ? "" : formData.netWeightKg);
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

  const handleNetWeightLbChange = (val) => {
    const netLb = Number(val);
    const netKg = netLb > 0 ? (netLb / 2.20462262).toFixed(2) : "";
    const b = Number(formData.bags);
    const calculatedWeightPerBag = b > 0 && Number(netKg) > 0 ? (Number(netKg) / b).toFixed(2) : formData.weightPerBagKg;
    setFormData((prev) => ({
      ...prev,
      netWeightKg: netKg,
      weightPerBagKg: calculatedWeightPerBag,
    }));
    setError("");
  };

  // Real-time calculations
  const bagsCount = Number(formData.bags) || 0;
  const conesPerBag = Number(formData.boxes) || 0;
  const totalCones = bagsCount * conesPerBag;
  const ratePerBag = Number(formData.ratePerBag) || 0;
  const totalAmount = bagsCount * ratePerBag;

  const currentWeightPerBagKg = Number(formData.weightPerBagKg) || 0;
  const weightPerBagLb = currentWeightPerBagKg > 0 ? Number((currentWeightPerBagKg * 2.20462262).toFixed(2)) : 0;

  const netWeightKg = Number(formData.netWeightKg) || (bagsCount > 0 && currentWeightPerBagKg > 0 ? Number((bagsCount * currentWeightPerBagKg).toFixed(2)) : 0);
  const netWeightLb = netWeightKg > 0 ? Number((netWeightKg * 2.20462262).toFixed(2)) : 0;
  const avgLbPerBag = bagsCount > 0 ? (netWeightLb / bagsCount).toFixed(1) : 0;
  const avgLbPerCone = totalCones > 0 ? (netWeightLb / totalCones).toFixed(2) : 0;
  const weightPerBagKg = currentWeightPerBagKg || (bagsCount > 0 && netWeightKg > 0 ? Number((netWeightKg / bagsCount).toFixed(3)) : 45.36);

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
      }
    } catch (err) {
      console.warn("API Error, falling back to local state:", err);
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
    <div className="mx-0 pb-16 space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-smooth mb-3 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Raw Material Inventory
        </button>

        <PageHeader
          title={isEdit ? `Edit Raw Yarn Intake (${item.entryNo || item.setNo || item.id})` : "Record Raw Yarn Intake"}
          subtitle="Register incoming raw yarn cones, bags, weights, rates per bag, and warehouse storage placement"
          actions={
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                <Save className="h-4 w-4" />
                {isEdit ? "Update Intake Record" : "Save Yarn Intake"}
              </Button>
            </div>
          }
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form: 2 Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Material Identification */}
            <Card>
              <div className="flex items-center gap-2.5 pb-2 mb-4 border-b border-border">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <SectionTitle title="Yarn Material Identification" className="mb-0 text-base" />
                </div>
              </div>

              <div className="space-y-4">
                <InputField
                  label="Yarn / Material Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. 100% Combed Cotton Yarn 40s"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                    Supplier / Spinning Mill <span className="text-destructive">*</span>
                  </label>
                  <SupplierSelect
                    value={formData.supplier}
                    onChange={(val) => handleChange("supplier", val)}
                    suppliers={suppliersList}
                    onOpenAddSupplierModal={() => setIsSupplierModalOpen(true)}
                    placeholder={isLoadingSuppliers ? "Loading suppliers..." : "Select Supplier / Spinning Mill"}
                  />
                </div>

                <RadioGroupField
                  label="Production Type"
                  name="productionType"
                  value={formData.productionType}
                  onChange={(e) => handleChange("productionType", e.target.value)}
                  options={productionTypeOptions}
                  layout="grid"
                  variant="card"
                  required
                />
              </div>
            </Card>

            {/* Section 2: Intake Quantities, Cones & Weight Metrics */}
            <Card>
              <div className="flex items-center gap-2.5 pb-3 mb-2 border-b border-border">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <SectionTitle
                    title={formData.productionType === "Conversion" ? "Bags, Cones & Weight Metrics" : "Bags, Cones, Weights & Rate per Bag"}
                    className="mb-0 text-base"
                  />
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formData.productionType === "Conversion"
                      ? "Job work quantities received, cones calculation, and weight in KG & LB"
                      : "Quantities received, cones calculation, weights in KG & LB, and pricing"}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InputField
                    label="Bags / Boray"
                    name="bags"
                    type="number"
                    min="1"
                    value={formData.bags}
                    onChange={(e) => handleBagsChange(e.target.value)}
                    required
                    placeholder="e.g. 100"
                    inputClassName="text-base font-bold"
                  />

                  <div>
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
                      inputClassName="text-base font-semibold font-mono"
                      required
                    />
                    {weightPerBagLb > 0 && (
                      <span className="text-[11px] text-muted-foreground font-medium mt-1 block">
                        ≈ {weightPerBagLb} LB / Bag
                      </span>
                    )}
                  </div>

                  <InputField
                    label="Cones per Bag"
                    name="boxes"
                    type="number"
                    min="0"
                    value={formData.boxes}
                    onChange={(e) => handleChange("boxes", e.target.value)}
                    placeholder="e.g. 24"
                    inputClassName="text-base font-semibold"
                  />

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                      Total Cones
                    </label>
                    <div className="w-full h-10 px-3.5 rounded-lg bg-muted/60 border border-border flex items-center justify-between text-sm font-bold text-foreground">
                      <span className="text-primary font-mono">{totalCones.toLocaleString()}</span>
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase">Cones</span>
                    </div>
                  </div>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 ${formData.productionType === "Conversion" ? "lg:grid-cols-2" : "lg:grid-cols-3"} gap-4`}>
                  {formData.productionType !== "Conversion" && (
                    <InputField
                      label="Rate per Bag (PKR)"
                      name="ratePerBag"
                      type="number"
                      min="0"
                      step="50"
                      prefix="Rs"
                      value={formData.ratePerBag}
                      onChange={(e) => handleChange("ratePerBag", e.target.value)}
                      placeholder="e.g. 12500"
                      inputClassName="text-sm font-bold font-mono"
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
                    placeholder="Auto-calculated: Bags × Weight/Bag"
                    inputClassName="text-sm font-bold font-mono"
                  />

                  <InputField
                    label="Net Weight (LB)"
                    name="netWeightLb"
                    type="number"
                    min="1"
                    step="0.01"
                    suffix="LB"
                    value={formData.netWeightKg ? (Number(formData.netWeightKg) * 2.20462262).toFixed(2) : ""}
                    onChange={(e) => handleNetWeightLbChange(e.target.value)}
                    placeholder="Auto-calculated: KG × 2.20462"
                    inputClassName="text-sm font-bold font-mono text-primary"
                  />
                </div>

                {/* Calculation Summary Strip */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">Total Cones:</span>
                    <span className="font-mono text-primary font-bold text-sm">{totalCones.toLocaleString()} Cones</span>
                    <span className="text-muted-foreground">({bagsCount} bags × {conesPerBag} cones/bag)</span>
                  </div>

                  {formData.productionType !== "Conversion" && ratePerBag > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Total Valuation:</span>
                      <span className="font-mono text-emerald-500 font-bold text-sm">
                        Rs {totalAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span>
                      Net Weight: <strong className="text-foreground font-semibold">{netWeightKg.toLocaleString()} KG</strong> = <strong className="text-primary font-semibold">{netWeightLb.toLocaleString()} LB</strong>
                    </span>
                    <span className="text-muted-foreground">
                      (@ {weightPerBagKg} kg / {weightPerBagLb} lb per bag)
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 3: Remarks & Technical Notes */}
            <Card>
              <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-border">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <SectionTitle title="Quality & Technical Remarks" className="mb-0 text-base" />
                  <p className="text-xs text-muted-foreground">CSP tests, twist factor, yarn grade, and weaving intended use</p>
                </div>
              </div>

              <TextareaField
                label=""
                name="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
                placeholder="e.g. Warp yarn for fine shirting fabric. Checked for CSP 2850, U% 9.2, zero thick/thin flaws. Grade A export quality."
              />
            </Card>
          </div>

          {/* Sidebar: Live Calculation Summary & Specs Card */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="sticky top-24">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Intake Overview</h3>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Total Cones Received
                  </span>
                  <div className="text-2xl font-black text-primary font-mono">{totalCones.toLocaleString()}</div>
                  <span className="text-[11px] text-muted-foreground block">
                    {bagsCount} Bags · {conesPerBag} Cones/Bag
                  </span>
                </div>

                {formData.productionType !== "Conversion" ? (
                  <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Total Value (PKR)
                    </span>
                    <div className="text-2xl font-black text-emerald-500 font-mono">
                      Rs {totalAmount.toLocaleString()}
                    </div>
                    <span className="text-[11px] text-muted-foreground block">
                      @ Rs {ratePerBag.toLocaleString()} per bag
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 block">
                      Production Mode
                    </span>
                    <div className="text-lg font-bold text-foreground">
                      Conversion Order
                    </div>
                    <span className="text-[11px] text-muted-foreground block">
                      Customer raw yarn job work (no rate applied)
                    </span>
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t border-border/70 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Weight per Bag</span>
                    <span className="font-bold font-mono text-foreground">{weightPerBagKg} kg {weightPerBagLb > 0 ? `(${weightPerBagLb} lb)` : ""}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Net Weight (KG)</span>
                    <span className="font-bold font-mono text-foreground">{netWeightKg ? netWeightKg.toLocaleString() : "0"} kg</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Net Weight (LB)</span>
                    <span className="font-bold font-mono text-primary">{fmt(netWeightLb)} lb</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Average per Bag</span>
                    <span className="font-semibold font-mono text-foreground">{avgLbPerBag} lb / bag</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Average per Cone</span>
                    <span className="font-semibold font-mono text-foreground">{avgLbPerCone} lb / cone</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Saving..." : isEdit ? "Update Intake Record" : "Save Yarn Intake"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
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

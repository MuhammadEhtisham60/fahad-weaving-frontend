import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "../../../../../components/ui-kit.jsx";
import { SIZING_UNITS, SIZING_STATUSES } from "../../utils/constants.js";
import {
  InputField,
  SelectField,
  TextareaField,
} from "../../../../../common/sharefield";

export function SizingFormModal({ item, preselectedRawMaterial, rawMaterials = [], onSave, onClose }) {
  const isEdit = Boolean(item);

  const [selectedRmId, setSelectedRmId] = useState(
    item?.rawMaterialId || preselectedRawMaterial?.id || rawMaterials[0]?.id || ""
  );

  const selectedRm = rawMaterials.find((r) => r.id === selectedRmId);

  const [formData, setFormData] = useState({
    sizingNo: item?.sizingNo || "",
    date: item?.date || new Date().toISOString().slice(0, 10),
    bagsSent: item?.bagsSent !== undefined ? item.bagsSent : (selectedRm ? Math.min(50, selectedRm.availableBags || selectedRm.bags) : 40),
    boxesSent: item?.boxesSent || 0,
    weightSent: item?.weightSent || (selectedRm ? Math.min(2500, selectedRm.availableWeight || selectedRm.netWeight) : 2000),
    sizingUnit: item?.sizingUnit || SIZING_UNITS[0],
    expectedReturn: item?.expectedReturn || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    actualReturn: item?.actualReturn || "",
    beamsProduced: item?.beamsProduced !== undefined ? item.beamsProduced : 0,
    status: item?.status || "Sent to Sizing",
    remarks: item?.remarks || "",
  });

  const [error, setError] = useState("");

  const handleBagsChange = (val) => {
    const bags = Number(val);
    let weight = formData.weightSent;
    if (selectedRm && selectedRm.bags > 0) {
      const avgPerBag = selectedRm.netWeight / selectedRm.bags;
      weight = Math.round(bags * avgPerBag);
    }
    setFormData((prev) => ({ ...prev, bagsSent: bags, weightSent: weight }));
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRm) {
      setError("Please select a valid raw yarn batch.");
      return;
    }

    const bags = Number(formData.bagsSent);
    if (bags <= 0) {
      setError("Bags sent to sizing must be greater than zero.");
      return;
    }

    if (!isEdit && selectedRm.availableBags !== undefined && bags > selectedRm.availableBags) {
      setError(
        `Bags sent (${bags}) exceeds available warehouse stock (${selectedRm.availableBags} bags).`
      );
      return;
    }

    onSave({
      ...formData,
      rawMaterialId: selectedRm.id,
      rawMaterialEntry: selectedRm.entryNo,
      yarnName: selectedRm.name,
      lotNo: selectedRm.lotNo,
      bagsSent: bags,
      boxesSent: Number(formData.boxesSent) || 0,
      weightSent: Number(formData.weightSent) || 0,
      beamsProduced: Number(formData.beamsProduced) || 0,
      actualReturn: formData.actualReturn || null,
    });
  };

  const rawMaterialOptions = rawMaterials.map((rm) => ({
    value: rm.id,
    label: `${rm.entryNo} · ${rm.name} (Lot: ${rm.lotNo}) — Available: ${rm.availableBags} Bags`,
  }));

  const sizingUnitOptions = SIZING_UNITS.map((su) => ({ value: su, label: su }));
  const sizingStatusOptions = SIZING_STATUSES.map((st) => ({ value: st, label: st }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-6 scrollbar-custom">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isEdit ? `Edit Sizing Dispatch (${item.sizingNo})` : "Send Raw Material to Sizing"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dispatch raw yarn from warehouse inventory to sizing mill for warping & chemical treatment
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
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
          <SelectField
            label="Select Raw Yarn Batch"
            name="selectedRmId"
            value={selectedRmId}
            onChange={(e) => {
              setSelectedRmId(e.target.value);
              setError("");
            }}
            options={rawMaterialOptions}
            disabled={isEdit}
            required
            searchable={false}
          />

          {selectedRm && (
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs flex items-center justify-between">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Selected Batch Info</span>
                <span className="font-semibold text-foreground">{selectedRm.name} ({selectedRm.count})</span>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block text-[10px] uppercase">Warehouse Stock</span>
                <span className="font-bold text-emerald-500">{selectedRm.availableBags} Bags Available</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Dispatch Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />

            <SelectField
              label="Sizing Mill / Vendor Unit"
              name="sizingUnit"
              value={formData.sizingUnit}
              onChange={(e) => setFormData({ ...formData, sizingUnit: e.target.value })}
              options={sizingUnitOptions}
              required
              searchable={false}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/30 border border-border">
            <InputField
              label="Number of Bags Sent"
              name="bagsSent"
              type="number"
              min="1"
              value={formData.bagsSent}
              onChange={(e) => handleBagsChange(e.target.value)}
              required
              inputClassName="font-semibold"
            />

            <InputField
              label="Weight Sent (KG)"
              name="weightSent"
              type="number"
              min="1"
              step="0.1"
              suffix="KG"
              value={formData.weightSent}
              onChange={(e) => setFormData({ ...formData, weightSent: Number(e.target.value) })}
              required
              inputClassName="font-semibold font-mono"
            />

            <InputField
              label="Boxes Sent (Optional)"
              name="boxesSent"
              type="number"
              min="0"
              value={formData.boxesSent}
              onChange={(e) => setFormData({ ...formData, boxesSent: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField
              label="Expected Return Date"
              name="expectedReturn"
              type="date"
              value={formData.expectedReturn}
              onChange={(e) => setFormData({ ...formData, expectedReturn: e.target.value })}
              required
            />

            <InputField
              label="Actual Return Date"
              name="actualReturn"
              type="date"
              value={formData.actualReturn}
              onChange={(e) => setFormData({ ...formData, actualReturn: e.target.value })}
            />

            <SelectField
              label="Sizing Status"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={sizingStatusOptions}
              required
              searchable={false}
            />
          </div>

          <TextareaField
            label="Sizing Recipe / Remarks"
            name="remarks"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            rows={2}
            placeholder="e.g. PVOH + modified starch sizing recipe. Target pickup 9.8% with zero static."
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Update Sizing Entry" : "Confirm Sizing Dispatch"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


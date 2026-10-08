import React, { useState, useEffect } from "react";
import { X, Factory, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGetSizingByIdQuery,
  useCreateSizingMutation,
  useUpdateSizingMutation,
} from "../../../../store/index.js";
import {
  InputField,
  SelectField,
  TextareaField,
} from "../../../../common/sharefield";

export function SizingModal({ sizingId, onClose, onSuccess }) {
  const isEdit = Boolean(sizingId);

  // Queries & Mutations
  const { data: sizingDetail, isLoading: detailLoading } = useGetSizingByIdQuery(sizingId, {
    skip: !isEdit,
  });
  const [createSizing, { isLoading: isCreating }] = useCreateSizingMutation();
  const [updateSizing, { isLoading: isUpdating }] = useUpdateSizingMutation();

  const isSaving = isCreating || isUpdating;

  // Form State
  const [formData, setFormData] = useState({
    sizingName: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
    address: "",
    status: "Active",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && sizingDetail) {
      setFormData({
        sizingName: sizingDetail.sizingName || "",
        contactPerson: sizingDetail.contactPerson || "",
        contactNumber: sizingDetail.contactNumber || sizingDetail.phoneNo || "",
        email: sizingDetail.email || "",
        address: sizingDetail.address || "",
        status: sizingDetail.status || "Active",
        notes: sizingDetail.notes || "",
      });
    }
  }, [isEdit, sizingDetail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Client-side quick check
    const errors = {};
    if (!formData.sizingName.trim()) {
      errors.sizingName = ["Sizing name is required."];
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        sizingName: formData.sizingName.trim(),
        contactPerson: formData.contactPerson.trim() || undefined,
        contactNumber: formData.contactNumber.trim() || undefined,
        phoneNo: formData.contactNumber.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        status: formData.status || "Active",
        notes: formData.notes.trim() || undefined,
      };

      if (isEdit) {
        const res = await updateSizing({ id: sizingId, ...payload }).unwrap();
        toast.success("Sizing unit updated successfully.");
        if (onSuccess) onSuccess(res?.data || res);
      } else {
        const res = await createSizing(payload).unwrap();
        toast.success("Sizing unit created successfully.");
        if (onSuccess) onSuccess(res?.data || res);
      }
      onClose();
    } catch (err) {
      if (err?.status === 400 && err?.data) {
        const backendErrs = err.data.errors || err.data;
        if (typeof backendErrs === "object") {
          setFormErrors(backendErrs);
        }
      }
    }
  };

  const statusChoices = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isEdit ? "Edit Sizing Unit" : "Add New Sizing Unit"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEdit
                  ? "Update sizing unit specifications, contact info and status"
                  : "Register a sizing facility or partner into factory master records"}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-custom">
          {detailLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <span className="text-xs font-semibold">Loading sizing information...</span>
            </div>
          ) : (
            <form id="sizing-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Validation Summary Error Banner */}
              {Object.keys(formErrors).length > 0 && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertCircle className="h-4 w-4" /> Please resolve the following errors:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {Object.entries(formErrors).map(([key, val]) => (
                      <li key={key}>
                        <strong className="capitalize">{key.replace(/([A-Z])/g, " $1")}:</strong>{" "}
                        {Array.isArray(val) ? val.join(", ") : String(val)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* General Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Facility Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sizing Name */}
                  <InputField
                    label="Sizing Unit / Company Name"
                    name="sizingName"
                    value={formData.sizingName}
                    onChange={handleChange}
                    placeholder="e.g. North Sizing Works"
                    required
                    error={Array.isArray(formErrors.sizingName) ? formErrors.sizingName[0] : formErrors.sizingName}
                  />

                  {/* Status */}
                  <SelectField
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    options={statusChoices}
                    error={Array.isArray(formErrors.status) ? formErrors.status[0] : formErrors.status}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Contact Person */}
                  <InputField
                    label="Contact Person"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="e.g. Tariq Mehmood"
                    error={Array.isArray(formErrors.contactPerson) ? formErrors.contactPerson[0] : formErrors.contactPerson}
                  />

                  {/* Contact Number */}
                  <InputField
                    label="Contact Phone Number"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="e.g. 0301-5550123"
                    error={Array.isArray(formErrors.contactNumber) ? formErrors.contactNumber[0] : (Array.isArray(formErrors.phoneNo) ? formErrors.phoneNo[0] : formErrors.contactNumber || formErrors.phoneNo)}
                  />

                  {/* Email */}
                  <InputField
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. sizing@mill.com"
                    error={Array.isArray(formErrors.email) ? formErrors.email[0] : formErrors.email}
                  />
                </div>

                {/* Address */}
                <TextareaField
                  label="Factory / Mill Address"
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. 12 Mill Road, Faisalabad"
                  error={Array.isArray(formErrors.address) ? formErrors.address[0] : formErrors.address}
                />

                {/* Notes */}
                <TextareaField
                  label="Notes / Remarks"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Enter any contract terms, operational instructions, or quality guidelines..."
                  error={Array.isArray(formErrors.notes) ? formErrors.notes[0] : formErrors.notes}
                />
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
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
            form="sizing-form"
            disabled={isSaving || detailLoading}
            className="h-10 px-5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Update Sizing Unit" : "Save Sizing Unit"}
          </button>
        </div>
      </div>
    </div>
  );
}

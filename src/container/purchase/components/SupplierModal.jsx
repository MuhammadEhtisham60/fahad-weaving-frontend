import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Building, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  useGetSupplierChoicesQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
} from "../../../store/index.js";
import {
  InputField,
  SelectField,
  TextareaField,
} from "../../../common/sharefield";

export function SupplierModal({ supplierId, onClose, onSuccess }) {
  const isEdit = Boolean(supplierId);

  // Queries & Mutations
  const { data: choicesData } = useGetSupplierChoicesQuery();
  const { data: supplierDetail, isLoading: detailLoading } = useGetSupplierByIdQuery(supplierId, {
    skip: !isEdit,
  });
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();

  const isSaving = isCreating || isUpdating;

  // Form State
  const [formData, setFormData] = useState({
    supplierName: "",
    companyName: "",
    address: "",
    phone: "",
    email: "",
    contactPerson: "",
    supplierType: "General",
    status: "Active",
    registrationNumber: "",
    bankAccounts: [],
  });

  const [formErrors, setFormErrors] = useState({});

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && supplierDetail) {
      setFormData({
        supplierName: supplierDetail.supplierName || "",
        companyName: supplierDetail.companyName || "",
        address: supplierDetail.address || "",
        phone: supplierDetail.phone || "",
        email: supplierDetail.email || "",
        contactPerson: supplierDetail.contactPerson || "",
        supplierType: supplierDetail.supplierType || "General",
        status: supplierDetail.status || "Active",
        registrationNumber: supplierDetail.registrationNumber || "",
        bankAccounts: Array.isArray(supplierDetail.bankAccounts)
          ? supplierDetail.bankAccounts.map((b) => ({
              id: b.id,
              bankName: b.bankName || "",
              accountTitle: b.accountTitle || "",
              accountNumber: b.accountNumber || "",
              iban: b.iban || "",
              branchName: b.branchName || "",
              branchCode: b.branchCode || "",
              swiftCode: b.swiftCode || "",
              isPrimary: Boolean(b.isPrimary),
            }))
          : [],
      });
    }
  }, [isEdit, supplierDetail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Bank Account row handlers
  const addBankAccount = () => {
    setFormData((prev) => {
      const isFirst = prev.bankAccounts.length === 0;
      return {
        ...prev,
        bankAccounts: [
          ...prev.bankAccounts,
          {
            bankName: "",
            accountTitle: "",
            accountNumber: "",
            iban: "",
            branchName: "",
            branchCode: "",
            swiftCode: "",
            isPrimary: isFirst,
          },
        ],
      };
    });
  };

  const removeBankAccount = (index) => {
    setFormData((prev) => {
      const updated = prev.bankAccounts.filter((_, i) => i !== index);
      // If we removed the primary account and there are remaining accounts, make the first one primary
      if (updated.length > 0 && !updated.some((b) => b.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return { ...prev, bankAccounts: updated };
    });
  };

  const handleBankChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.bankAccounts];
      if (field === "isPrimary") {
        const isChecked = Boolean(value);
        updated.forEach((item, i) => {
          item.isPrimary = i === index ? isChecked : false;
        });
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return { ...prev, bankAccounts: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Client-side quick check
    const errors = {};
    if (!formData.supplierName.trim()) errors.supplierName = ["Supplier name is required"];
    if (!formData.phone.trim()) errors.phone = ["Phone number is required"];
    if (!formData.contactPerson.trim()) errors.contactPerson = ["Contact person is required"];

    // Validate bank account rows
    formData.bankAccounts.forEach((bank, idx) => {
      if (!bank.bankName.trim() || !bank.accountTitle.trim() || !bank.accountNumber.trim()) {
        errors[`bankAccounts_${idx}`] = "Bank Name, Account Title, and Account Number are required";
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        ...formData,
        supplierName: formData.supplierName.trim(),
        phone: formData.phone.trim(),
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim() || undefined,
        companyName: formData.companyName.trim() || undefined,
        address: formData.address.trim() || undefined,
        registrationNumber: formData.registrationNumber.trim() || undefined,
        bankAccounts: formData.bankAccounts.map((b) => {
          const acc = {
            bankName: b.bankName.trim(),
            accountTitle: b.accountTitle.trim(),
            accountNumber: b.accountNumber.trim(),
            iban: b.iban.trim() || undefined,
            branchName: b.branchName.trim() || undefined,
            branchCode: b.branchCode.trim() || undefined,
            swiftCode: b.swiftCode.trim() || undefined,
            isPrimary: Boolean(b.isPrimary),
          };
          if (b.id) acc.id = b.id;
          return acc;
        }),
      };

      if (isEdit) {
        const res = await updateSupplier({ id: supplierId, ...payload }).unwrap();
        toast.success("Supplier updated successfully");
        if (onSuccess) onSuccess(res?.data || res || { id: supplierId, ...payload });
      } else {
        const res = await createSupplier(payload).unwrap();
        toast.success("Supplier created successfully");
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

  const supplierTypeChoices = choicesData?.supplierTypes || [
    { value: "Yarn", label: "Yarn" },
    { value: "Spare Parts", label: "Spare Parts" },
    { value: "Machinery", label: "Machinery" },
    { value: "Dyes & Chemicals", label: "Dyes & Chemicals" },
    { value: "Packaging", label: "Packaging" },
    { value: "General", label: "General" },
    { value: "Other", label: "Other" },
  ];

  const statusChoices = choicesData?.statusChoices || [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "Blocked", label: "Blocked" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isEdit ? "Edit Supplier" : "Add New Supplier"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEdit ? "Update supplier info and bank account details" : "Register a new vendor/supplier into the system"}
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
              <span className="text-xs font-semibold">Loading supplier information...</span>
            </div>
          ) : (
            <form id="supplier-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Validation Summary Error Banner */}
              {Object.keys(formErrors).length > 0 && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertCircle className="h-4 w-4" /> Please resolve the following errors:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {Object.entries(formErrors).map(([key, val]) => (
                      <li key={key}>
                        <strong className="capitalize">{key.replace("_", " ")}:</strong>{" "}
                        {Array.isArray(val) ? val.join(", ") : String(val)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* General Info Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  Supplier General Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Supplier Name */}
                  <InputField
                    label="Supplier Name"
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleChange}
                    placeholder="e.g. Ali Textile Mills"
                    required
                    error={Array.isArray(formErrors.supplierName) ? formErrors.supplierName[0] : formErrors.supplierName}
                  />

                  {/* Company Name */}
                  <InputField
                    label="Company Name"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Ali Group Pvt Ltd"
                    error={Array.isArray(formErrors.companyName) ? formErrors.companyName[0] : formErrors.companyName}
                  />

                  {/* Contact Person */}
                  <InputField
                    label="Contact Person"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="e.g. Muhammad Ali"
                    required
                    error={Array.isArray(formErrors.contactPerson) ? formErrors.contactPerson[0] : formErrors.contactPerson}
                  />

                  {/* Phone */}
                  <InputField
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 03001234567"
                    required
                    error={Array.isArray(formErrors.phone) ? formErrors.phone[0] : formErrors.phone}
                  />

                  {/* Email */}
                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. supplier@example.com"
                    error={Array.isArray(formErrors.email) ? formErrors.email[0] : formErrors.email}
                  />

                  {/* Registration Number */}
                  <InputField
                    label="Registration / NTN No."
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="e.g. NTN-1234567"
                    error={Array.isArray(formErrors.registrationNumber) ? formErrors.registrationNumber[0] : formErrors.registrationNumber}
                  />

                  {/* Supplier Type */}
                  <SelectField
                    label="Supplier Type"
                    name="supplierType"
                    value={formData.supplierType}
                    onChange={handleChange}
                    options={supplierTypeChoices}
                    searchable={false}
                    error={Array.isArray(formErrors.supplierType) ? formErrors.supplierType[0] : formErrors.supplierType}
                  />

                  {/* Status */}
                  <SelectField
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    options={statusChoices}
                    searchable={false}
                    error={Array.isArray(formErrors.status) ? formErrors.status[0] : formErrors.status}
                  />
                </div>

                {/* Address */}
                <TextareaField
                  label="Address"
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete office/factory address"
                  error={Array.isArray(formErrors.address) ? formErrors.address[0] : formErrors.address}
                />
              </div>

              {/* Bank Accounts Section */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Bank Accounts ({formData.bankAccounts.length})
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Add payout bank details for this supplier. Mark one account as primary.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addBankAccount}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Bank Account
                  </button>
                </div>

                {formData.bankAccounts.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                    No bank accounts added yet. Click &quot;Add Bank Account&quot; to add one.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.bankAccounts.map((bank, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border ${
                          bank.isPrimary ? "border-primary/50 bg-primary/5" : "border-border bg-muted/20"
                        } space-y-3 relative`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">
                              Bank Account #{index + 1}
                            </span>
                            {bank.isPrimary && (
                              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                                Primary Account
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                              <input
                                type="radio"
                                name="primaryBankGroup"
                                checked={Boolean(bank.isPrimary)}
                                onChange={(e) => handleBankChange(index, "isPrimary", e.target.checked)}
                                className="accent-primary h-4 w-4"
                              />
                              Set as Primary
                            </label>
                            <button
                              type="button"
                              onClick={() => removeBankAccount(index)}
                              className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                              title="Remove Bank Account"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {formErrors[`bankAccounts_${index}`] && (
                          <p className="text-[11px] text-destructive">
                            {formErrors[`bankAccounts_${index}`]}
                          </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <InputField
                            size="sm"
                            label="Bank Name"
                            value={bank.bankName}
                            onChange={(e) => handleBankChange(index, "bankName", e.target.value)}
                            placeholder="e.g. HBL"
                            required
                          />

                          <InputField
                            size="sm"
                            label="Account Title"
                            value={bank.accountTitle}
                            onChange={(e) => handleBankChange(index, "accountTitle", e.target.value)}
                            placeholder="e.g. Ali Textile Mills"
                            required
                          />

                          <InputField
                            size="sm"
                            label="Account Number"
                            value={bank.accountNumber}
                            onChange={(e) => handleBankChange(index, "accountNumber", e.target.value)}
                            placeholder="e.g. 1234567890"
                            required
                          />

                          <InputField
                            size="sm"
                            label="IBAN"
                            value={bank.iban}
                            onChange={(e) => handleBankChange(index, "iban", e.target.value)}
                            placeholder="e.g. PK36HABB0000001123456702"
                            inputClassName="font-mono"
                          />

                          <InputField
                            size="sm"
                            label="Branch Name"
                            value={bank.branchName}
                            onChange={(e) => handleBankChange(index, "branchName", e.target.value)}
                            placeholder="e.g. Main Branch"
                          />

                          <InputField
                            size="sm"
                            label="Branch Code"
                            value={bank.branchCode}
                            onChange={(e) => handleBankChange(index, "branchCode", e.target.value)}
                            placeholder="e.g. 0123"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
            form="supplier-form"
            disabled={isSaving || detailLoading}
            className="h-10 px-5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Update Supplier" : "Save Supplier"}
          </button>
        </div>
      </div>
    </div>
  );
}


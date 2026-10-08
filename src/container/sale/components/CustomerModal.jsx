import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Users, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  useGetCustomerChoicesQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from "../../../store/index.js";

export function CustomerModal({ customerId, onClose }) {
  const isEdit = Boolean(customerId);

  // Queries & Mutations
  const { data: choicesData } = useGetCustomerChoicesQuery();
  const { data: customerDetail, isLoading: detailLoading } = useGetCustomerByIdQuery(customerId, {
    skip: !isEdit,
  });
  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();

  const isSaving = isCreating || isUpdating;

  // Form State
  const [formData, setFormData] = useState({
    customerName: "",
    companyName: "",
    address: "",
    phone: "",
    email: "",
    contactPerson: "",
    customerType: "Wholesaler",
    status: "Active",
    registrationNumber: "",
    bankAccounts: [],
  });

  const [formErrors, setFormErrors] = useState({});

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && customerDetail) {
      setFormData({
        customerName: customerDetail.customerName || "",
        companyName: customerDetail.companyName || "",
        address: customerDetail.address || "",
        phone: customerDetail.phone || "",
        email: customerDetail.email || "",
        contactPerson: customerDetail.contactPerson || "",
        customerType: customerDetail.customerType || "Wholesaler",
        status: customerDetail.status || "Active",
        registrationNumber: customerDetail.registrationNumber || "",
        bankAccounts: Array.isArray(customerDetail.bankAccounts)
          ? customerDetail.bankAccounts.map((b) => ({
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
  }, [isEdit, customerDetail]);

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
    if (!formData.customerName.trim()) errors.customerName = ["Customer name is required"];
    if (!formData.phone.trim()) errors.phone = ["Phone number is required"];
    if (!formData.contactPerson.trim()) errors.contactPerson = ["Contact person is required"];

    // Validate bank accounts
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
        customerName: formData.customerName.trim(),
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
        await updateCustomer({ id: customerId, ...payload }).unwrap();
        toast.success("Customer updated successfully");
      } else {
        await createCustomer(payload).unwrap();
        toast.success("Customer created successfully");
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

  const customerTypeChoices = choicesData?.customerTypes || [
    { value: "Wholesaler", label: "Wholesaler" },
    { value: "Retailer", label: "Retailer" },
    { value: "Distributor", label: "Distributor" },
    { value: "Manufacturer", label: "Manufacturer" },
    { value: "Exporter", label: "Exporter" },
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
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isEdit ? "Edit Customer" : "Add New Customer"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEdit ? "Update customer profile and bank accounts" : "Register a new client/customer into the system"}
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
          {detailLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <span className="text-xs font-semibold">Loading customer details...</span>
            </div>
          ) : (
            <form id="customer-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Errors Banner */}
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

              {/* General Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Customer General Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Name */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">
                      Customer Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      placeholder="e.g. Raza Fabrics"
                      className={`w-full h-10 px-3 rounded-lg bg-background border ${
                        formErrors.customerName ? "border-destructive" : "border-border"
                      } text-sm focus:border-ring focus:outline-none`}
                    />
                    {formErrors.customerName && (
                      <p className="text-[11px] text-destructive mt-1">
                        {Array.isArray(formErrors.customerName) ? formErrors.customerName[0] : formErrors.customerName}
                      </p>
                    )}
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="e.g. Raza Group Pvt Ltd"
                      className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:border-ring focus:outline-none"
                    />
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">
                      Contact Person <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      placeholder="e.g. Raza Ahmed"
                      className={`w-full h-10 px-3 rounded-lg bg-background border ${
                        formErrors.contactPerson ? "border-destructive" : "border-border"
                      } text-sm focus:border-ring focus:outline-none`}
                    />
                    {formErrors.contactPerson && (
                      <p className="text-[11px] text-destructive mt-1">
                        {Array.isArray(formErrors.contactPerson) ? formErrors.contactPerson[0] : formErrors.contactPerson}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">
                      Phone Number <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 03211234567"
                      className={`w-full h-10 px-3 rounded-lg bg-background border ${
                        formErrors.phone ? "border-destructive" : "border-border"
                      } text-sm focus:border-ring focus:outline-none`}
                    />
                    {formErrors.phone && (
                      <p className="text-[11px] text-destructive mt-1">
                        {Array.isArray(formErrors.phone) ? formErrors.phone[0] : formErrors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. customer@example.com"
                      className={`w-full h-10 px-3 rounded-lg bg-background border ${
                        formErrors.email ? "border-destructive" : "border-border"
                      } text-sm focus:border-ring focus:outline-none`}
                    />
                    {formErrors.email && (
                      <p className="text-[11px] text-destructive mt-1">
                        {Array.isArray(formErrors.email) ? formErrors.email[0] : formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Registration Number */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">
                      Registration / NTN No.
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="e.g. NTN-9876543"
                      className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:border-ring focus:outline-none"
                    />
                  </div>

                  {/* Customer Type */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">
                      Customer Type
                    </label>
                    <select
                      name="customerType"
                      value={formData.customerType}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:border-ring focus:outline-none cursor-pointer"
                    >
                      {customerTypeChoices.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-lg bg-background border border-border text-sm focus:border-ring focus:outline-none cursor-pointer"
                    >
                      {statusChoices.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-semibold mb-1 text-foreground">
                    Address
                  </label>
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete office/billing address"
                    className="w-full p-3 rounded-lg bg-background border border-border text-sm focus:border-ring focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Bank Accounts Section */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Bank Accounts ({formData.bankAccounts.length})
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Add bank details for customer invoicing & receiving.
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
                                name="primaryBankGroupCustomer"
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
                          <div>
                            <label className="block text-[11px] font-semibold mb-1 text-muted-foreground">
                              Bank Name <span className="text-destructive">*</span>
                            </label>
                            <input
                              type="text"
                              value={bank.bankName}
                              onChange={(e) => handleBankChange(index, "bankName", e.target.value)}
                              placeholder="e.g. HBL"
                              className="w-full h-9 px-2.5 rounded-lg bg-background border border-border text-xs focus:border-ring outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold mb-1 text-muted-foreground">
                              Account Title <span className="text-destructive">*</span>
                            </label>
                            <input
                              type="text"
                              value={bank.accountTitle}
                              onChange={(e) => handleBankChange(index, "accountTitle", e.target.value)}
                              placeholder="e.g. Raza Fabrics"
                              className="w-full h-9 px-2.5 rounded-lg bg-background border border-border text-xs focus:border-ring outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold mb-1 text-muted-foreground">
                              Account Number <span className="text-destructive">*</span>
                            </label>
                            <input
                              type="text"
                              value={bank.accountNumber}
                              onChange={(e) => handleBankChange(index, "accountNumber", e.target.value)}
                              placeholder="e.g. 1234567890"
                              className="w-full h-9 px-2.5 rounded-lg bg-background border border-border text-xs focus:border-ring outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold mb-1 text-muted-foreground">
                              IBAN
                            </label>
                            <input
                              type="text"
                              value={bank.iban}
                              onChange={(e) => handleBankChange(index, "iban", e.target.value)}
                              placeholder="e.g. PK36HABB0000001123456702"
                              className="w-full h-9 px-2.5 rounded-lg bg-background border border-border text-xs focus:border-ring outline-none font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold mb-1 text-muted-foreground">
                              Branch Name
                            </label>
                            <input
                              type="text"
                              value={bank.branchName}
                              onChange={(e) => handleBankChange(index, "branchName", e.target.value)}
                              placeholder="e.g. Main Branch"
                              className="w-full h-9 px-2.5 rounded-lg bg-background border border-border text-xs focus:border-ring outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold mb-1 text-muted-foreground">
                              Branch Code
                            </label>
                            <input
                              type="text"
                              value={bank.branchCode}
                              onChange={(e) => handleBankChange(index, "branchCode", e.target.value)}
                              placeholder="e.g. 0456"
                              className="w-full h-9 px-2.5 rounded-lg bg-background border border-border text-xs focus:border-ring outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          )}
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
            form="customer-form"
            disabled={isSaving || detailLoading}
            className="h-10 px-5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Update Customer" : "Save Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { User, Lock, Save, ShieldAlert } from "lucide-react";
import { Button } from "../../../components/ui-kit.jsx";
import {
  InputField,
  PasswordField,
  SelectField,
  CheckboxField,
} from "../../../common/sharefield/index.js";
import {
  DESIGNATIONS,
  USER_STATUSES,
  GENDERS,
} from "../utils/constants.js";
import { useUserStore } from "../utils/userStore.js";

export function UserForm({ initialData = null, onSave, onCancel, existingUsers = [], apiError = null }) {
  const { roles } = useUserStore();
  const isEdit = Boolean(initialData?.id);

  // Form State - Empty defaults for clean creation
  const [formData, setFormData] = useState(() => ({
    id: initialData?.id || "",
    username: initialData?.username || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    gender: initialData?.gender || "",
    address: initialData?.address || "",
    role: initialData?.role || "",
    designation: initialData?.designation || "",
    status: initialData?.status || "Active",
    password: "",
    confirmPassword: "",
    twoFactorEnabled: initialData?.twoFactorEnabled ?? false,
  }));

  // Populate form state when initialData arrives or updates asynchronously
  useEffect(() => {
    if (initialData && initialData.id) {
      setFormData({
        id: initialData.id || "",
        username: initialData.username || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        gender: initialData.gender || "",
        address: initialData.address || "",
        role: initialData.role || "",
        designation: initialData.designation || "",
        status: initialData.status || "Active",
        password: "",
        confirmPassword: "",
        twoFactorEnabled: initialData.twoFactorEnabled ?? false,
      });
    }
  }, [initialData]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If backend returns field-level error object (e.g. { role: ["Role not found"] }), map to form errors
  useEffect(() => {
    if (apiError && typeof apiError === "object") {
      const fieldErrors = {};
      Object.keys(apiError).forEach((key) => {
        const val = apiError[key];
        fieldErrors[key] = Array.isArray(val) ? val.join(" ") : String(val);
      });
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
    }
  }, [apiError]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Native event handler wrapper for sharefield onChange compatibility
  const handleFieldChange = (field) => (e) => {
    const value = e && e.target !== undefined ? e.target.value : e;
    handleChange(field, value);
  };

  const handleCheckboxChange = (field) => (e) => {
    handleChange(field, e.target.checked);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required.";
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, dots, and hyphens.";
    } else {
      const duplicate = existingUsers.find(
        (u) =>
          u.username.toLowerCase() === formData.username.toLowerCase() &&
          u.id !== formData.id
      );
      if (duplicate) {
        newErrors.username = "This username is already registered.";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    if (!formData.role) {
      newErrors.role = "Please select a system role.";
    }

    if (!formData.status) {
      newErrors.status = "User status is required.";
    }

    // Password validation for new users
    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = "Password is required for new users.";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters.";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    } else if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters.";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        fullName: formData.fullName || formData.username,
      });
    } catch (err) {
      console.error("User form save error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build system role options dynamically from store/API
  const roleOptions = Array.isArray(roles)
    ? roles.map((r) => {
        const val = typeof r === "object" ? r.name || r.id : r;
        const lbl = typeof r === "object" ? r.name || r.title || r.id : r;
        return { value: val, label: lbl };
      })
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error Notification */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive font-semibold flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>Please review the highlighted required fields before saving.</span>
        </div>
      )}

      {/* Section 1: Personal & Basic Information */}
      <div className="rounded-2xl bg-card border border-border p-6 shadow-card space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <User className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">Personal &amp; Basic Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Username"
            name="username"
            id="user-username"
            type="text"
            value={formData.username}
            onChange={handleFieldChange("username")}
            placeholder="e.g. muhammad.ahmed"
            prefix="@"
            required
            error={errors.username}
          />

          <InputField
            label="Official Email"
            name="email"
            id="user-email"
            type="email"
            value={formData.email}
            onChange={handleFieldChange("email")}
            placeholder="user@example.com"
            required
            error={errors.email}
          />

          <InputField
            label="Phone Number"
            name="phone"
            id="user-phone"
            type="text"
            value={formData.phone}
            onChange={handleFieldChange("phone")}
            placeholder="+92 300 1234567"
            required
            error={errors.phone}
          />

          <SelectField
            label="Gender"
            name="gender"
            id="user-gender"
            value={formData.gender}
            onChange={handleFieldChange("gender")}
            placeholder="Select Gender"
            options={GENDERS}
            error={errors.gender}
          />

          <div className="sm:col-span-2">
            <InputField
              label="Address / City"
              name="address"
              id="user-address"
              type="text"
              value={formData.address}
              onChange={handleFieldChange("address")}
              placeholder="e.g. Plot 21, SITE Area, Karachi"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Role, Organization & Access Credentials */}
      <div className="rounded-2xl bg-card border border-border p-6 shadow-card space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <Lock className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">Role, Organization &amp; Access Credentials</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField
            label="System Role"
            name="role"
            id="user-role"
            value={formData.role}
            onChange={handleFieldChange("role")}
            placeholder="Select System Role"
            options={roleOptions}
            required
            error={errors.role}
          />

          <SelectField
            label="Designation"
            name="designation"
            id="user-designation"
            value={formData.designation}
            onChange={handleFieldChange("designation")}
            placeholder="Select Designation"
            options={DESIGNATIONS}
            error={errors.designation}
          />

          <SelectField
            label="Account Status"
            name="status"
            id="user-status"
            value={formData.status}
            onChange={handleFieldChange("status")}
            placeholder="Select Account Status"
            options={USER_STATUSES}
            required
            error={errors.status}
          />

          <PasswordField
            label={isEdit ? "New Password (leave empty to keep current)" : "Password"}
            name="password"
            id="user-password"
            value={formData.password}
            onChange={handleFieldChange("password")}
            placeholder={isEdit ? "••••••••" : "Minimum 6 characters"}
            required={!isEdit}
            error={errors.password}
          />

          <PasswordField
            label="Confirm Password"
            name="confirmPassword"
            id="user-confirm-password"
            value={formData.confirmPassword}
            onChange={handleFieldChange("confirmPassword")}
            placeholder="Re-enter password"
            error={errors.confirmPassword}
          />

          <div className="flex items-center">
            <CheckboxField
              variant="card"
              name="twoFactorEnabled"
              id="user-2fa"
              checked={formData.twoFactorEnabled}
              onChange={handleCheckboxChange("twoFactorEnabled")}
              label="Enforce 2FA Authentication"
              description="Requires OTP verification on login"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4" />
          <span>{isSubmitting ? "Saving User..." : isEdit ? "Save Changes" : "Create User Account"}</span>
        </Button>
      </div>
    </form>
  );
}

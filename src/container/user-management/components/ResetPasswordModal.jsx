import React, { useState } from "react";
import { KeyRound, Eye, EyeOff, Check, X, ShieldAlert, Copy, CheckCheck } from "lucide-react";
import { Button } from "../../../components/ui-kit.jsx";

export function ResetPasswordModal({ user, onConfirm, onClose }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [requireChangeOnLogin, setRequireChangeOnLogin] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let gen = "";
    for (let i = 0; i < 10; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(gen);
    setConfirmPassword(gen);
    setError("");
  };

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter a new password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    onConfirm(user.id, password, requireChangeOnLogin);
  };

  const calculateStrength = (pass) => {
    if (!pass) return { score: 0, label: "None", color: "bg-muted" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: "Weak", color: "bg-destructive" };
    if (score <= 4) return { score, label: "Good", color: "bg-amber-500" };
    return { score, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = calculateStrength(password);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Reset Password</h3>
              <p className="text-xs text-muted-foreground">
                For {user?.fullName} (@{user?.username})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                New Password
              </label>
              <button
                type="button"
                onClick={generateRandomPassword}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Generate Random
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter minimum 6 characters"
                className="w-full h-10 px-3 pr-20 rounded-xl bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-sm font-mono"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {password && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                    title="Copy to clipboard"
                  >
                    {copied ? <CheckCheck className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Strength meter */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Strength:</span>
                  <span className="font-semibold">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-1">
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <div
                      key={idx}
                      className={`h-full flex-1 rounded-full transition-all ${
                        idx <= strength.score ? strength.color : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Confirm New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              placeholder="Re-enter password"
              className="w-full h-10 px-3 rounded-xl bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-sm font-mono"
            />
          </div>

          <label className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={requireChangeOnLogin}
              onChange={(e) => setRequireChangeOnLogin(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded accent-primary"
            />
            <span className="text-muted-foreground leading-relaxed">
              Require user to change password on next login session.
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <KeyRound className="h-4 w-4" />
              <span>Update Password</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Factory, Mail, Lock, User, Building2, Briefcase, Loader2, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, useSignupMutation } from "../../store/index.js";

export const Route = createFileRoute("/auth/signup")({ component: SignUpPage });

export function SignUpPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [signupApi] = useSignupMutation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [factoryName, setFactoryName] = useState("Fahad Weaving Mills Ltd.");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (event) => {
    event.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
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

    if (!agreeTerms) {
      setError("You must agree to the terms and privacy policy.");
      return;
    }

    setIsLoading(true);

    try {
      const generatedUsername = email.trim().split("@")[0] + Math.floor(Math.random() * 1000);
      const response = await signupApi({
        username: generatedUsername,
        email: email.trim(),
        password: password,
      }).unwrap();

      if (response?.data?.tokens) {
        dispatch(
          setCredentials({
            tokens: response.data.tokens,
            user: response.data.user,
          })
        );
        setSuccess(true);
        window.localStorage.setItem("forge-authenticated", "true");
        setTimeout(() => {
          navigate({ to: "/" });
        }, 1000);
      }
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.data?.errors?.detail ||
        err?.data?.detail ||
        (typeof err?.data?.errors === "object"
          ? Object.values(err.data.errors).flat().join(" ")
          : null) ||
        "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-hero text-primary-foreground relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-lg">Fahad Weaving</div>
              <div className="text-[11px] uppercase tracking-widest opacity-80">Factory Suite</div>
            </div>
          </div>
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight">Join the smart factory ecosystem.</h1>
          <p className="mt-4 text-white/85">
            Empower your team with real-time beam tracking, loom monitoring, payroll calculations, and production intelligence.
          </p>
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Instant role-based access & modular permissions</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Full automated yarn-to-fabric workflow tracking</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Multi-device responsive & high-speed cloud sync</span>
            </div>
          </div>
        </div>
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6 lg:p-10 bg-background overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Factory className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="font-bold">Fahad Weaving</div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
            <Link to="/auth/login" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to Sign In
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Register your user profile in the ERP system.</p>

          {success ? (
            <div className="bg-success/10 border border-success/30 text-success p-6 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 mx-auto text-success" />
              <h3 className="font-bold text-base">Account created successfully!</h3>
              <p className="text-xs text-muted-foreground">Redirecting to your factory workspace...</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSignUp}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name *</label>
                  <div className="mt-1 relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Tariq Mehmood"
                      className="w-full h-10 pl-9 pr-3 rounded-lg bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-sm transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Work Email *</label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@weavingfactory.com"
                      className="w-full h-10 pl-9 pr-3 rounded-lg bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Factory / Unit</label>
                <div className="mt-1 relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={factoryName}
                    onChange={(e) => setFactoryName(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-lg bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password *</label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full h-10 pl-9 pr-8 rounded-lg bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm Password *</label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full h-10 pl-9 pr-3 rounded-lg bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              {error && <p className="text-xs font-medium text-destructive">{error}</p>}

              <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="accent-[oklch(0.52_0.22_280)] rounded mt-0.5"
                />
                <span>I agree to the Factory ERP Terms of Service and Data Access Governance Policy</span>
              </label>

              <button
                disabled={isLoading}
                type="submit"
                className="w-full h-11 rounded-lg bg-gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition-smooth flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already registered?{" "}
            <Link to="/auth/login" className="text-primary font-semibold hover:underline">
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

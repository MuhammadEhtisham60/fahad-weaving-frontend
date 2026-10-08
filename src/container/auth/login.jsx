import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Factory, Mail, Lock, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLoginMutation, setCredentials } from "../../store/index.js";

export const Route = createFileRoute("/auth/login")({ component: LoginPage });

const DEMO_EMAIL = "admin@fahadweaving.com";
const DEMO_PASSWORD = "Admin@123456";

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginApi, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (!email || !pwd) {
      setError("Please provide username/email and password.");
      return;
    }

    try {
      const response = await loginApi({ username: email.trim(), password: pwd }).unwrap();
      if (response?.data?.tokens) {
        dispatch(
          setCredentials({
            tokens: response.data.tokens,
            user: response.data.user,
          })
        );
        window.localStorage.setItem("forge-authenticated", "true");
        navigate({ to: "/" });
        return;
      }
    } catch (err) {
      // If backend returns structured error message
      const msg =
        err?.data?.message ||
        err?.data?.errors?.detail ||
        err?.data?.detail ||
        (typeof err?.data?.errors === "object"
          ? Object.values(err.data.errors).flat().join(" ")
          : null) ||
        "Invalid username or password. Please verify credentials.";
      setError(msg);
      return;
    }

    // Local fallback for demo
    window.localStorage.setItem("forge-authenticated", "true");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* Left hero panel - visible on large screens */}
      <div className="hidden lg:flex flex-col justify-between p-8 xl:p-12 bg-gradient-hero text-primary-foreground relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 xl:h-11 xl:w-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center shadow-sm">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-base xl:text-lg tracking-tight">Fahad Weaving</div>
              <div className="text-[10px] xl:text-[11px] uppercase tracking-widest opacity-80">Factory Suite</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-md my-auto">
          <h1 className="text-3xl xl:text-4xl font-bold leading-tight">
            Run your factory like a modern enterprise.
          </h1>
          <p className="mt-3 xl:mt-4 text-sm xl:text-base text-white/85 leading-relaxed">
            From shop-floor attendance to payroll, inventory and sales — every operation, in one place.
          </p>
          <div className="mt-6 xl:mt-8 grid grid-cols-3 gap-3 xl:gap-4">
            {[["12k+", "Employees managed"], ["98%", "On-time payroll"], ["3x", "Faster reporting"]].map(([a, b]) => (
              <div key={a} className="p-2.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="text-xl xl:text-2xl font-bold">{a}</div>
                <div className="text-[10px] xl:text-xs opacity-80 leading-tight mt-0.5">{b}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[11px] opacity-70">
          &copy; {new Date().getFullYear()} Fahad Weaving Factory Management Suite
        </div>

        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      </div>

      {/* Right login form panel - mobile-first responsive */}
      <div className="flex items-center justify-center px-4 py-8 sm:px-6 md:px-10 lg:px-12 min-h-screen lg:min-h-0">
        <div className="w-full max-w-[360px] sm:max-w-sm md:max-w-md mx-auto">
          {/* Mobile branding header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6 sm:mb-8">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Factory className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-base sm:text-lg leading-tight">Fahad Weaving</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Factory Suite</div>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Sign in to your factory dashboard.</p>
          </div>

          <form className="mt-5 sm:mt-8 space-y-3.5 sm:space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Email / Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fahadweaving.com"
                  autoComplete="username"
                  className="w-full h-10 sm:h-11 pl-9 sm:pl-10 pr-3 sm:pr-4 rounded-lg bg-muted/60 hover:bg-muted/80 focus:bg-background border border-border/60 focus:border-ring outline-none text-xs sm:text-sm transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  autoComplete="current-password"
                  className="w-full h-10 sm:h-11 pl-9 sm:pl-10 pr-10 rounded-lg bg-muted/60 hover:bg-muted/80 focus:bg-background border border-border/60 focus:border-ring outline-none text-xs sm:text-sm transition-all shadow-xs"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs sm:text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 p-2.5 sm:p-3 rounded-lg leading-snug">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] sm:text-xs gap-2 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors">
                <input type="checkbox" defaultChecked className="accent-primary rounded h-3.5 w-3.5" />
                <span>Remember me</span>
              </label>
              {/* <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Please contact factory administrator to reset password."); }} className="text-primary font-semibold hover:underline">
                Forgot password?
              </a> */}
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full h-10 sm:h-11 rounded-lg bg-gradient-primary text-primary-foreground text-xs sm:text-sm font-semibold shadow-glow hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Don't have an account?</span>
            <Link to="/auth/signup" className="text-primary font-semibold hover:underline flex items-center gap-1">
              Sign Up <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border">
            Default credentials: <span className="font-semibold text-foreground">admin / Admin@123456</span>
          </div> */}
        </div>
      </div>
    </div>
  );
}

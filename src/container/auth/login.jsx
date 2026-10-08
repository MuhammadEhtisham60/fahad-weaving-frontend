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

  const [email, setEmail] = useState(DEMO_EMAIL);
  const [pwd, setPwd] = useState(DEMO_PASSWORD);
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
          <h1 className="text-4xl font-bold leading-tight">Run your factory like a modern enterprise.</h1>
          <p className="mt-4 text-white/85">From shop-floor attendance to payroll, inventory and sales — every operation, in one place.</p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[["12k+", "Employees managed"], ["98%", "On-time payroll"], ["3x", "Faster reporting"]].map(([a, b]) => (
              <div key={a}>
                <div className="text-2xl font-bold">{a}</div>
                <div className="text-xs opacity-80">{b}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Factory className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="font-bold">Fahad Weaving</div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your factory dashboard.</p>

          <form className="mt-8 space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email / Username</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fahadweaving.com"
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-sm transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  className="w-full h-11 pl-10 pr-11 rounded-lg bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-sm transition-all"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[oklch(0.52_0.22_280)] rounded" />
                <span>Remember me</span>
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Please contact factory administrator to reset password."); }} className="text-primary font-semibold hover:underline">
                Forgot password?
              </a>
            </div>
            <button
              disabled={isLoading}
              type="submit"
              className="w-full h-11 rounded-lg bg-gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition-smooth flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Don't have an account?</span>
            <Link to="/auth/signup" className="text-primary font-semibold hover:underline flex items-center gap-1">
              Sign Up <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border">
            Default credentials: <span className="font-semibold text-foreground">admin / Admin@123456</span>
          </div>
        </div>
      </div>
    </div>
  );
}

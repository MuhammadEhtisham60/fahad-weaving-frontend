import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "../store/index.js";
import appCss from "../styles.css?url";
import { AppShell } from "../components/app-shell.jsx";
import { UIScaleProvider } from "../context/UIScaleContext.jsx";
import { LanguageProvider } from "../context/LanguageContext.jsx";

const factoryIcon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='10' y1='8' x2='56' y2='58' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%237C3AED'/%3E%3Cstop offset='1' stop-color='%23C026D3'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='4' y='4' width='56' height='56' rx='18' fill='url(%23g)'/%3E%3Cpath d='M18 45V24h6v13l8-5v5l8-5v13H18Z' fill='none' stroke='white' stroke-width='4' stroke-linejoin='round' stroke-linecap='round'/%3E%3Cpath d='M25 45v-5m8 5v-5m8 5v-5' stroke='white' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Page not found.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Back to Dashboard</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }) {
  const router = useRouter();
  console.error(error);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 inline-flex items-center justify-center rounded-md bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Fahad Weaving - Factory Management" },
      { name: "description", content: "Modern factory management ERP for employees, attendance, payroll, inventory, purchases and sales." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: factoryIcon },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        <Provider store={store}>
          {children}
        </Provider>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const isAuth = path.startsWith("/auth");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("forge-authenticated") === "true";
  });

  useEffect(() => {
    const authenticated = window.localStorage.getItem("forge-authenticated") === "true";
    setIsAuthenticated(authenticated);

    if (!authenticated && !isAuth) {
      navigate({ to: "/auth/login" });
    }

    if (authenticated && isAuth) {
      navigate({ to: "/" });
    }
  }, [isAuth, navigate]);

  return (
    <Provider store={store}>
      <LanguageProvider>
        <UIScaleProvider>
          <QueryClientProvider client={queryClient}>
            {isAuth ? <Outlet /> : isAuthenticated ? <AppShell><Outlet /></AppShell> : null}
          </QueryClientProvider>
        </UIScaleProvider>
      </LanguageProvider>
    </Provider>
  );
}

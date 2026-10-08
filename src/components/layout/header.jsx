import { Search, Sun, Moon, Bell, Clock as ClockIcon, PanelLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/index.js";
import { UIScaleSelector } from "./UIScaleSelector.jsx";
import { LanguageSelector } from "./LanguageSelector.jsx";
import { useTranslation } from "../../context/LanguageContext.jsx";

export function Header({ open, setOpen, dark, setDark, onShowAttendance }) {
  const { t } = useTranslation();
  const currentUser = useSelector(selectCurrentUser);
  const displayName = currentUser?.fullName ? currentUser.fullName.split(" ")[0] : "Admin";

  return (
    <header className="sticky top-0 h-16 bg-card/80 backdrop-blur-xl border-b border-border z-50 flex justify-between items-center w-full">
      <div className="px-4 lg:px-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-muted transition-smooth text-foreground flex items-center justify-center border border-border/60 shadow-sm"
          title={open ? t("sidebar.collapse", "Collapse Sidebar") : t("sidebar.expand", "Expand Sidebar")}
          aria-label="Toggle Sidebar"
        >
          <PanelLeft className="h-5 w-5 text-foreground" />
        </button>
        <p className="text-xl sm:text-2xl font-semibold font-['Poppins']">
          {t("header.hello")},Fahad {displayName}!
        </p>
      </div>
      <div className="flex justify-end items-center gap-2 sm:gap-4 px-4 lg:px-8">
        <div className="flex-1 max-w-md relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3" />
          <input
            placeholder={t("header.searchPlaceholder")}
            className="w-full h-10 pl-10 pr-4 rtl:pl-4 rtl:pr-10 rounded-lg bg-muted border border-transparent focus:border-ring focus:bg-background outline-none text-sm transition-smooth"
          />
        </div>

        <LanguageSelector />
        <UIScaleSelector />

        <button
          onClick={onShowAttendance}
          className="p-2 rounded-lg hover:bg-muted transition-smooth group flex items-center gap-2"
          title={t("header.markAttendance")}
        >
          <ClockIcon className="h-4 w-4 text-primary group-hover:animate-pulse" />
        </button>

        <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-muted transition-smooth" title={t("header.toggleTheme")}>
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button className="relative p-2 rounded-lg hover:bg-muted transition-smooth" title={t("header.notifications")}>
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <div
          onClick={onShowAttendance}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold cursor-pointer hover:bg-accent/80 transition-smooth"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          {t("header.liveStatus")}
        </div>
      </div>
    </header>
  );
}

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
    <header className="sticky top-0 h-14 sm:h-16 bg-card/80 backdrop-blur-xl border-b border-border z-50 flex justify-between items-center w-full">
      <div className="px-3 sm:px-4 lg:px-6 flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-smooth text-foreground flex items-center justify-center border border-border/60 shadow-sm shrink-0"
          title={open ? t("sidebar.collapse", "Collapse Sidebar") : t("sidebar.expand", "Expand Sidebar")}
          aria-label="Toggle Sidebar"
        >
          <PanelLeft className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
        </button>
        <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold font-['Poppins'] truncate">
          {t("header.hello")}, Fahad {displayName}!
        </p>
      </div>

      <div className="flex justify-end items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 px-2 sm:px-4 lg:px-8 shrink-0">
        <div className="flex-1 max-w-xs md:max-w-sm lg:max-w-md relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3" />
          <input
            placeholder={t("header.searchPlaceholder")}
            className="w-full h-9 sm:h-10 pl-9 sm:pl-10 pr-4 rtl:pl-4 rtl:pr-10 rounded-lg bg-muted border border-transparent focus:border-ring focus:bg-background outline-none text-xs sm:text-sm transition-smooth"
          />
        </div>

        {/* <LanguageSelector />
        <UIScaleSelector /> */}

        <button
          onClick={onShowAttendance}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-smooth group flex items-center gap-2"
          title={t("header.markAttendance")}
        >
          <ClockIcon className="h-4 w-4 text-primary group-hover:animate-pulse" />
        </button>

        <button 
          onClick={() => setDark(!dark)} 
          className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-smooth" 
          title={t("header.toggleTheme")}
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button 
          className="relative p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-smooth" 
          title={t("header.notifications")}
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 h-2 w-2 rounded-full bg-destructive" />
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

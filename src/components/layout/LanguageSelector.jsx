import React from "react";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function LanguageSelector() {
  const { language, setLanguage, languages } = useLanguage();

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="p-2 rounded-lg hover:bg-muted transition-smooth flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        title={`Language: ${currentLang.nativeName}`}
        aria-label={`Current language: ${currentLang.name}. Click to change language.`}
      >
        <Globe className="h-4 w-4 text-foreground" />
        <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
          {currentLang.code === "en" ? "EN" : "اردو"}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40 p-1">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground flex items-center justify-between">
          <span>Language / زبان</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {languages.map((langOption) => {
          const isSelected = language === langOption.code;
          return (
            <DropdownMenuItem
              key={langOption.code}
              onClick={() => setLanguage(langOption.code)}
              className={`flex items-center justify-between cursor-pointer px-2.5 py-1.5 text-sm rounded-md transition-colors ${
                isSelected
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{langOption.nativeName}</span>
                <span className="text-xs text-muted-foreground">({langOption.name})</span>
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import React from "react";
import { Type, Check } from "lucide-react";
import { useUIScale } from "../../context/UIScaleContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function UIScaleSelector() {
  const { uiScale, setUIScale, scaleOptions } = useUIScale();

  const currentOption = scaleOptions.find((opt) => opt.value === uiScale) || scaleOptions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="p-2 rounded-lg hover:bg-muted transition-smooth flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        title={`Text Size: ${currentOption.label}`}
        aria-label={`UI Scale: currently set to ${currentOption.label}`}
      >
        <Type className="h-4 w-4 text-foreground" />
        <span className="text-xs font-semibold px-1 py-0.5 rounded bg-muted text-muted-foreground border border-border/50">
          {uiScale === 0 ? "A" : `${uiScale}x`}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 p-1">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground flex items-center justify-between">
          <span>Text & UI Size</span>
          <span className="text-[10px] text-muted-foreground/70">Global Scale</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {scaleOptions.map((option) => {
          const isSelected = uiScale === option.value;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setUIScale(option.value)}
              className={`flex items-center justify-between cursor-pointer px-2.5 py-1.5 text-sm rounded-md transition-colors ${
                isSelected
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-14 font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">({option.badge})</span>
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

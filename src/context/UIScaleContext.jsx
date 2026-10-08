import React, { createContext, useContext, useEffect, useState } from "react";

export const UI_SCALE_KEY = "uiScale";

export const UI_SCALE_OPTIONS = [
  { label: "Default", value: 0, badge: "Base" },
  { label: "1x", value: 1, badge: "+1px" },
  { label: "2x", value: 2, badge: "+2px" },
  { label: "3x", value: 3, badge: "+3px" },
  { label: "4x", value: 4, badge: "+4px" },
  { label: "5x", value: 5, badge: "+5px" },
];

const UIScaleContext = createContext({
  uiScale: 0,
  setUIScale: () => {},
  scaleOptions: UI_SCALE_OPTIONS,
});

const applyScaleToDOM = (scaleValue) => {
  if (typeof document !== "undefined") {
    const validScale = Math.min(Math.max(Number(scaleValue) || 0, 0), 5);
    document.documentElement.style.setProperty("--ui-scale", `${validScale}px`);
    document.documentElement.setAttribute("data-ui-scale", String(validScale));
  }
};

const getInitialScale = () => {
  if (typeof window === "undefined") return 0;
  try {
    const saved = localStorage.getItem(UI_SCALE_KEY);
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 5) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to read uiScale from localStorage:", e);
  }
  return 0;
};

export function UIScaleProvider({ children }) {
  const [uiScale, setScaleState] = useState(getInitialScale);

  useEffect(() => {
    applyScaleToDOM(uiScale);
  }, [uiScale]);

  const setUIScale = (newScale) => {
    const validScale = Math.min(Math.max(Number(newScale) || 0, 0), 5);
    setScaleState(validScale);
    applyScaleToDOM(validScale);
    try {
      localStorage.setItem(UI_SCALE_KEY, String(validScale));
    } catch (e) {
      console.error("Failed to save uiScale to localStorage:", e);
    }
  };

  return (
    <UIScaleContext.Provider
      value={{
        uiScale,
        setUIScale,
        scaleOptions: UI_SCALE_OPTIONS,
      }}
    >
      {children}
    </UIScaleContext.Provider>
  );
}

export function useUIScale() {
  const context = useContext(UIScaleContext);
  if (!context) {
    throw new Error("useUIScale must be used within a UIScaleProvider");
  }
  return context;
}

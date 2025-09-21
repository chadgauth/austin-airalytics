import {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from "react";

interface DashboardContextType {
  mobileView: "map" | "list";
  setMobileView: (view: "map" | "list") => void;
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  helpOpen: boolean;
  setHelpOpen: (open: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <DashboardContext.Provider
      value={{
        mobileView,
        setMobileView,
        filtersOpen,
        setFiltersOpen,
        helpOpen,
        setHelpOpen,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

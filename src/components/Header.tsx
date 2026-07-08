import { useBilling } from "@/context/BillingContext";
import { useTheme, colorPresets } from "@/context/ThemeContext";
import { useLoading } from "@/context/LoadingContext";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, Clock, Palette, ChevronDown, ChevronUp, Check, Package, Database, Home } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "@/components/Logo";
import { validatePatientName, validateReceiptNumber } from "@/lib/validation";

const Header = () => {
  const { patientName, setPatientName, receiptNumber, setReceiptNumber, isNHIS, setIsNHIS, receiptHistory } = useBilling();
  const { mode, toggleMode, preset, setPreset } = useTheme();
  const { showLoader, hideLoader } = useLoading();
  const [showPresets, setShowPresets] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(false);
  const [receiptInput, setReceiptInput] = useState(String(receiptNumber));
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [patientNameError, setPatientNameError] = useState<string | null>(null);
  const [isValidatingPatient, setIsValidatingPatient] = useState(false);
  const presetRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  useEffect(() => {
    setReceiptInput(String(receiptNumber));
  }, [receiptNumber]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (presetRef.current && !presetRef.current.contains(e.target as Node)) setShowPresets(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNavigation = (path: string) => {
    if (currentPath !== path) {
      showLoader();
      // Small delay to show loading animation
      setTimeout(() => {
        navigate(path);
        setTimeout(() => hideLoader(), 300); // Hide after navigation
      }, 200);
    }
  };

  const handlePatientNameChange = async (value: string) => {
    setPatientName(value);
    if (value.trim()) {
      setIsValidatingPatient(true);
      // Simulate async validation for better UX
      setTimeout(() => {
        const validation = validatePatientName(value);
        setPatientNameError(validation.isValid ? null : validation.error || null);
        setIsValidatingPatient(false);
      }, 300);
    } else {
      setPatientNameError(null);
      setIsValidatingPatient(false);
    }
  };

  const handlePatientNameBlur = () => {
    if (patientName.trim()) {
      const validation = validatePatientName(patientName);
      setPatientNameError(validation.isValid ? null : validation.error || null);
    }
  };

  const isDuplicateReceipt = (num: number) => receiptHistory.some(r => r.receiptNumber === num);

  const handleReceiptChange = (val: string) => {
    setReceiptInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      const validation = validateReceiptNumber(num);
      if (validation.isValid) {
        if (num !== receiptNumber && isDuplicateReceipt(num)) {
          setReceiptError("This receipt number already exists in history.");
        } else {
          setReceiptError(null);
          setReceiptNumber(num);
        }
      } else {
        setReceiptError(validation.error || null);
      }
    } else {
      setReceiptError(null);
    }
  };

  const handleReceiptBlur = () => {
    setEditingReceipt(false);
    const num = parseInt(receiptInput, 10);
    if (isNaN(num) || num <= 0) {
      setReceiptInput(String(receiptNumber));
      setReceiptError(null);
    } else {
      const validation = validateReceiptNumber(num);
      if (!validation.isValid || (num !== receiptNumber && isDuplicateReceipt(num))) {
        setReceiptInput(String(receiptNumber));
        setReceiptError(null);
      }
    }
  };

  return (
    <>
      <header className="h-16 glass-panel border-b border-border/50 flex items-center px-4 gap-3 shrink-0 z-20 md:px-6 md:gap-5">
        <div className="flex items-center gap-2 mr-2 md:gap-3 md:mr-3">
          <Logo size={32} className="animate-float md:size-36" />
          <div className="flex flex-col md:flex-col">
            <span className="font-bold text-foreground text-xs tracking-tight leading-tight md:text-sm">PAHC</span>
            <span className="text-[10px] text-muted-foreground leading-tight md:text-xs">Health Center</span>
          </div>
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden md:flex items-center justify-center gap-1 flex-1">
          <button
            onClick={() => handleNavigation("/")}
            className={cn(
              "w-10 h-10 rounded-xl glass-card flex items-center justify-center transition-all group",
              currentPath === "/" 
                ? "bg-black shadow-2xl text-white" 
                : "hover:bg-secondary/80"
            )}
            style={currentPath === "/" ? { 
              boxShadow: `0 0 20px hsl(${preset.primary}), 0 0 40px hsl(${preset.primary} / 0.5), 0 0 60px hsl(${preset.primary} / 0.3)` 
            } : {}}
            title="Home"
          >
            <Home className={cn(
              "w-4 h-4 transition-colors",
              currentPath === "/" 
                ? "text-white" 
                : "text-muted-foreground group-hover:text-foreground"
            )}
            style={currentPath === "/" ? { color: `hsl(${preset.primary})` } : {}}
            />
          </button>

          <button
            onClick={() => handleNavigation("/history")}
            className={cn(
              "w-10 h-10 rounded-xl glass-card flex items-center justify-center transition-all group",
              currentPath === "/history" 
                ? "bg-black shadow-2xl text-white" 
                : "hover:bg-secondary/80"
            )}
            style={currentPath === "/history" ? { 
              boxShadow: `0 0 20px hsl(${preset.primary}), 0 0 40px hsl(${preset.primary} / 0.5), 0 0 60px hsl(${preset.primary} / 0.3)` 
            } : {}}
            title="Receipt History"
          >
            <Clock className={cn(
              "w-4 h-4 transition-colors",
              currentPath === "/history" 
                ? "text-white" 
                : "text-muted-foreground group-hover:text-foreground"
            )}
            style={currentPath === "/history" ? { color: `hsl(${preset.primary})` } : {}}
            />
          </button>

          <button
            onClick={() => handleNavigation("/items")}
            className={cn(
              "w-10 h-10 rounded-xl glass-card flex items-center justify-center transition-all group",
              currentPath === "/items" 
                ? "bg-black shadow-2xl text-white" 
                : "hover:bg-secondary/80"
            )}
            style={currentPath === "/items" ? { 
              boxShadow: `0 0 20px hsl(${preset.primary}), 0 0 40px hsl(${preset.primary} / 0.5), 0 0 60px hsl(${preset.primary} / 0.3)` 
            } : {}}
            title="Items Management"
          >
            <Package className={cn(
              "w-4 h-4 transition-colors",
              currentPath === "/items" 
                ? "text-white" 
                : "text-muted-foreground group-hover:text-foreground"
            )}
            style={currentPath === "/items" ? { color: `hsl(${preset.primary})` } : {}}
            />
          </button>

          <button
            onClick={() => handleNavigation("/data")}
            className={cn(
              "w-10 h-10 rounded-xl glass-card flex items-center justify-center transition-all group",
              currentPath === "/data" 
                ? "bg-black shadow-2xl text-white" 
                : "hover:bg-secondary/80"
            )}
            style={currentPath === "/data" ? { 
              boxShadow: `0 0 20px hsl(${preset.primary}), 0 0 40px hsl(${preset.primary} / 0.5), 0 0 60px hsl(${preset.primary} / 0.3)` 
            } : {}}
            title="Data Management"
          >
            <Database className={cn(
              "w-4 h-4 transition-colors",
              currentPath === "/data" 
                ? "text-white" 
                : "text-muted-foreground group-hover:text-foreground"
            )}
            style={currentPath === "/data" ? { color: `hsl(${preset.primary})` } : {}}
            />
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto md:gap-3">
          {/* NHIS Toggle */}
          <div className="hidden sm:flex items-center gap-2.5">
            <span className="text-xs text-muted-foreground font-medium">NHIS</span>
            <button
              onClick={() => setIsNHIS(!isNHIS)}
              className={cn(
                "relative w-12 h-6 rounded-full transition-all duration-300 ease-in-out shadow-inner md:w-14 md:h-7",
                isNHIS
                  ? "bg-success shadow-success/30"
                  : "bg-muted"
              )}
            >
              <span className={cn(
                "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.27,1.55)] md:top-0.5 md:w-6 md:h-6",
                isNHIS ? "left-[22px] md:left-[30px]" : "left-0.5"
              )} />
              <span className={cn(
                "absolute inset-0 flex items-center text-[8px] font-bold transition-opacity duration-200 md:text-[9px]",
                isNHIS ? "justify-start pl-1 text-success-foreground opacity-100" : "opacity-0"
              )}>ON</span>
            </button>
            {isNHIS && (
              <Badge className="bg-success/15 text-success border border-success/25 text-[10px] font-semibold animate-scale-in">
                NHIS Active
              </Badge>
            )}
          </div>

          {/* Color Presets */}
          <div className="relative" ref={presetRef}>
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="h-8 w-8 rounded-xl glass-card flex items-center justify-center hover:bg-secondary/80 transition-all text-xs text-muted-foreground md:h-9 md:px-3 md:w-auto"
            >
              <Palette className="w-3.5 h-3.5 md:w-3.5 md:h-3.5" />
              <span className="hidden md:inline-block md:ml-2 md:w-3 md:h-3 rounded-full" style={{ background: `hsl(${preset.primary})` }} />
              <ChevronDown className={cn("hidden md:inline-block md:w-3 md:h-3 md:ml-1 transition-transform", showPresets && "rotate-180")} />
            </button>
            {showPresets && (
              <div className="absolute right-0 top-10 w-48 glass-panel rounded-xl border border-border/50 shadow-xl p-2 z-50 animate-scale-in md:top-11">
                {colorPresets.map(p => (
                  <button
                    key={p.name}
                    onClick={() => { setPreset(p); setShowPresets(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors",
                      preset.name === p.name ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary/60"
                    )}
                  >
                    <span className="w-4 h-4 rounded-full shadow-sm border border-border/30" style={{ background: `hsl(${p.primary})` }} />
                    <span className="flex-1 text-left font-medium">{p.label}</span>
                    {preset.name === p.name && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleMode}
            className="w-8 h-8 rounded-xl glass-card flex items-center justify-center hover:bg-secondary/80 transition-all group md:w-9 md:h-9"
            title={mode === "light" ? "Dark mode" : "Light mode"}
          >
            {mode === "light" ? (
              <Moon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors md:w-4 md:h-4" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors md:w-4 md:h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Patient info below navbar - Mobile optimized */}
      <div className="h-10 glass-panel border-b border-border/30 flex items-center px-4 gap-4 shrink-0 bg-background/50 backdrop-blur-sm md:h-12 md:px-6 md:gap-6">
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <label className="text-[10px] text-muted-foreground whitespace-nowrap font-medium md:text-xs">Patient</label>
          <div className="flex-1">
            <input
              type="text"
              value={patientName}
              onChange={(e) => handlePatientNameChange(e.target.value)}
              onBlur={handlePatientNameBlur}
              placeholder="Patient name..."
              disabled={isValidatingPatient}
              className={cn(
                "h-7 px-2 rounded-lg glass-card text-xs w-full outline-none focus:ring-2 transition-all text-foreground placeholder:text-muted-foreground md:h-8 md:px-3 md:text-sm",
                patientNameError ? "ring-2 ring-destructive/30 border-destructive/50" : "focus:ring-primary/30",
                isValidatingPatient && "opacity-70 cursor-wait"
              )}
            />
            {patientNameError && (
              <p className="text-xs text-destructive mt-1">{patientNameError}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[10px] text-muted-foreground whitespace-nowrap font-medium md:text-xs">Receipt #</label>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-0.5">
              {editingReceipt ? (
                <input
                  type="number"
                  value={receiptInput}
                  onChange={e => handleReceiptChange(e.target.value)}
                  onBlur={handleReceiptBlur}
                  onKeyDown={e => e.key === "Enter" && handleReceiptBlur()}
                  autoFocus
                  className={cn(
                    "h-7 w-20 px-2 rounded-lg glass-card text-xs font-mono text-foreground outline-none transition-all md:h-8 md:w-28 md:px-3 md:text-sm",
                    receiptError ? "ring-2 ring-destructive/30" : "focus:ring-primary/30"
                  )}
                />
              ) : (
                <button
                  onClick={() => setEditingReceipt(true)}
                  className="h-7 px-2 rounded-lg glass-card text-xs flex items-center font-mono text-foreground hover:bg-secondary/50 transition-all cursor-text md:h-8 md:px-3 md:text-sm"
                  title="Click to edit receipt number"
                >
                  {receiptNumber}
                </button>
              )}
              <div className="flex flex-col">
                <button
                  onClick={() => setReceiptNumber(receiptNumber + 1)}
                  className="w-4 h-3.5 rounded-t-md glass-card flex items-center justify-center hover:bg-secondary/80 transition-all md:w-5 md:h-4"
                >
                  <ChevronUp className="w-2 h-2 text-muted-foreground md:w-2.5 md:h-2.5" />
                </button>
                <button
                  onClick={() => { if (receiptNumber > 1) setReceiptNumber(receiptNumber - 1); }}
                  className="w-4 h-3.5 rounded-b-md glass-card flex items-center justify-center hover:bg-secondary/80 transition-all md:w-5 md:h-4"
                >
                  <ChevronDown className="w-2 h-2 text-muted-foreground md:w-2.5 md:h-2.5" />
                </button>
              </div>
            </div>
            {receiptError && (
              <p className="text-[10px] text-destructive">{receiptError}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;

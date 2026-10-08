import { useBilling } from "@/context/BillingContext";
import { useTheme, colorPresets } from "@/context/ThemeContext";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, Palette, Check, Search, ChevronUp, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { validatePatientName, validateReceiptNumber } from "@/lib/validation";

const Header = () => {
  const { patientName, setPatientName, receiptNumber, setReceiptNumber, isNHIS, setIsNHIS, receiptHistory } = useBilling();
  const { mode, toggleMode, preset, setPreset } = useTheme();
  const [showPresets, setShowPresets] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(false);
  const [receiptInput, setReceiptInput] = useState(String(receiptNumber));
  const [patientNameError, setPatientNameError] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const presetRef = useRef<HTMLDivElement>(null);

  useEffect(() => setReceiptInput(String(receiptNumber)), [receiptNumber]);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (presetRef.current && !presetRef.current.contains(event.target as Node)) setShowPresets(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const isDuplicate = (value: number) => receiptHistory.some((receipt) => receipt.receiptNumber === value);
  const handlePatient = (value: string) => {
    setPatientName(value);
    const result = value.trim() ? validatePatientName(value) : { isValid: true };
    setPatientNameError(result.isValid ? null : result.error || null);
  };
  const handleReceipt = (value: string) => {
    setReceiptInput(value);
    const number = Number.parseInt(value, 10);
    const result = validateReceiptNumber(number);
    if (result.isValid && !isDuplicate(number)) {
      setReceiptNumber(number);
      setReceiptError(null);
    } else if (value) setReceiptError(result.error || "Receipt number already exists.");
  };
  const finishReceipt = () => {
    setEditingReceipt(false);
    const number = Number.parseInt(receiptInput, 10);
    if (!Number.isFinite(number) || number <= 0 || isDuplicate(number)) {
      setReceiptInput(String(receiptNumber));
      setReceiptError(null);
    }
  };

  return (
    <header className="shrink-0 border-b border-border/70 bg-card/90 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4 md:h-[68px] md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-lg shadow-primary/25">P</div>
          <div className="min-w-0"><p className="truncate text-sm font-bold tracking-tight">PAHC POS</p><p className="hidden text-[10px] text-muted-foreground sm:block">Health center billing</p></div>
        </div>
        <div className="ml-auto flex items-center gap-2" ref={presetRef}>
          <div className="hidden items-center gap-2 sm:flex"><span className="text-xs text-muted-foreground">NHIS</span><button type="button" role="switch" aria-checked={isNHIS} aria-label="Use NHIS pricing" onClick={() => setIsNHIS(!isNHIS)} className={cn("relative h-6 w-11 rounded-full transition-colors", isNHIS ? "bg-success" : "bg-muted")}><span className={cn("absolute top-1 size-4 rounded-full bg-white shadow transition-transform", isNHIS ? "translate-x-6" : "translate-x-1")} /></button>{isNHIS && <Badge variant="secondary" className="text-[10px] text-success">Active</Badge>}</div>
          <button type="button" aria-label="Choose theme color" aria-expanded={showPresets} onClick={() => setShowPresets(!showPresets)} className="flex size-9 items-center justify-center rounded-xl border border-border bg-background hover:bg-muted"><Palette className="size-4" /></button>
          {showPresets && <div className="absolute right-14 top-12 z-50 flex w-48 flex-col gap-1 rounded-2xl border border-border bg-popover p-2 shadow-xl md:top-16">{colorPresets.map((item) => <button type="button" key={item.name} onClick={() => { setPreset(item); setShowPresets(false); }} className={cn("flex items-center gap-3 rounded-xl px-3 py-2 text-left text-xs", preset.name === item.name ? "bg-primary/10 text-primary" : "hover:bg-muted")}><span className="size-3 rounded-full" style={{ background: `hsl(${item.primary})` }} /><span className="flex-1">{item.label}</span>{preset.name === item.name && <Check className="size-3" />}</button>)}</div>}
          <button type="button" aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"} onClick={toggleMode} className="flex size-9 items-center justify-center rounded-xl border border-border bg-background hover:bg-muted">{mode === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}</button>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-3 border-t border-border/50 bg-muted/30 px-4 py-2.5 md:grid-cols-[minmax(240px,1fr)_auto] md:px-6">
        <label className="flex min-w-0 items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Patient</span><input id="patient-name" value={patientName} onChange={(event) => handlePatient(event.target.value)} placeholder="Enter patient name" aria-invalid={!!patientNameError} className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-primary/30 focus:ring-2" /></label>
        <div className="flex items-center gap-1.5"><span className="hidden text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:block">Receipt</span>{editingReceipt ? <input autoFocus type="number" value={receiptInput} onChange={(event) => handleReceipt(event.target.value)} onBlur={finishReceipt} onKeyDown={(event) => event.key === "Enter" && finishReceipt()} className="h-9 w-20 rounded-lg border border-border bg-background px-2 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30" /> : <button type="button" onClick={() => setEditingReceipt(true)} aria-label={`Edit receipt number ${receiptNumber}`} className="h-9 rounded-lg border border-border bg-background px-3 font-mono text-sm">{receiptNumber}</button>}<div className="flex flex-col gap-0.5"><button type="button" aria-label="Increase receipt number" onClick={() => setReceiptNumber(receiptNumber + 1)} className="flex size-4 items-center justify-center rounded bg-background text-muted-foreground"><ChevronUp className="size-3" /></button><button type="button" aria-label="Decrease receipt number" onClick={() => receiptNumber > 1 && setReceiptNumber(receiptNumber - 1)} className="flex size-4 items-center justify-center rounded bg-background text-muted-foreground"><ChevronDown className="size-3" /></button></div></div>
      </div>
      <div className="flex items-center justify-between px-4 py-1.5 sm:hidden"><span className="text-[10px] text-muted-foreground">Pricing mode</span><button type="button" role="switch" aria-checked={isNHIS} onClick={() => setIsNHIS(!isNHIS)} className={cn("rounded-full px-3 py-1 text-[10px] font-bold", isNHIS ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>{isNHIS ? "NHIS pricing" : "Standard pricing"}</button></div>
      {(patientNameError || receiptError) && <p className="px-4 pb-2 text-xs text-destructive" role="alert">{patientNameError || receiptError}</p>}
    </header>
  );
};
export default Header;
                                                                            

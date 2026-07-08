import { useBilling, type ReceiptRecord } from "@/context/BillingContext";
import { X, ChevronDown, ChevronRight, Clock, FileText } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  onClose: () => void;
}

const HistoryPanel = ({ onClose }: Props) => {
  const { receiptHistory } = useBilling();
  const [expandedReceipt, setExpandedReceipt] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative w-full max-w-md h-full glass-panel border-l border-border/50 flex flex-col animate-slide-in-right"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Receipt History</h2>
              <p className="text-xs text-muted-foreground">{receiptHistory.length} receipts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-card flex items-center justify-center hover:bg-secondary transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {receiptHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
              <FileText className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No receipts yet</p>
              <p className="text-xs mt-1">Completed bills will appear here</p>
            </div>
          ) : (
            receiptHistory.map((receipt, idx) => {
              const isOpen = expandedReceipt === idx;
              return (
                <div
                  key={receipt.receiptNumber}
                  className="glass-card rounded-xl overflow-hidden transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <button
                    onClick={() => setExpandedReceipt(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                        receipt.isNHIS ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
                      )}>
                        #{String(receipt.receiptNumber).slice(-3)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">{receipt.patientName || "Unknown"}</p>
                        <p className="text-[11px] text-muted-foreground">{receipt.date} · {receipt.isNHIS ? "NHIS" : "Cash"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">GH₵{receipt.grandTotal.toFixed(2)}</span>
                      {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>
                  <div className={cn(
                    "overflow-hidden transition-all duration-300",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="px-4 pb-3 space-y-1 border-t border-border/30">
                      {receipt.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs py-1.5">
                          <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                          <span className="text-foreground font-medium">GH₵{(item.unitPrice * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-bold pt-2 border-t border-border/30">
                        <span>Total</span>
                        <span>GH₵{receipt.grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;

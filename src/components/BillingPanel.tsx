import { useBilling } from "@/context/BillingContext";
import { useLoading } from "@/context/LoadingContext";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";
import ReceiptModal from "@/components/ReceiptModal";

const BillingPanel = () => {
  const { patientName, receiptNumber, cart, getPrice, updateQuantity, removeFromCart, clearCart } = useBilling();
  const { showLoader, hideLoader } = useLoading();
  const [showReceipt, setShowReceipt] = useState(false);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const servicesItems = cart.filter(i => i.product.group === "SERVICES");
  const drugsItems = cart.filter(i => i.product.group === "DRUGS");

  const servicesTotal = servicesItems.reduce((sum, i) => sum + getPrice(i.product) * i.quantity, 0);
  const drugsTotal = drugsItems.reduce((sum, i) => sum + getPrice(i.product) * i.quantity, 0);
  const grandTotal = servicesTotal + drugsTotal;
  const hasExpiredOrOverstocked = cart.some(item => {
    const expiryDate = item.product.expiryDate ? new Date(item.product.expiryDate) : null;
    const today = new Date();
    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const expired = expiryDate ? expiryDate < currentDay : false;
    const overstocked = typeof item.product.stock === 'number' && item.quantity > item.product.stock;
    return expired || overstocked;
  });

  return (
    <>
      {/* Mobile: Full width panel */}
      <aside className="md:w-80 w-full glass-sidebar md:border-l border-border/50 flex flex-col shrink-0 md:relative fixed bottom-16 md:bottom-auto left-0 right-0 md:h-auto h-64 bg-background/95 backdrop-blur-lg md:bg-transparent" aria-label="Billing cart and summary">
        <div className="p-3 md:p-4 border-b border-border/50">
          <p className="text-sm font-medium text-foreground truncate">
            {patientName || "No patient"}
          </p>
          <p className="text-xs text-muted-foreground font-mono">Receipt #{receiptNumber}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2" role="region" aria-label="Cart items">
          {cart.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center mt-6 md:mt-10">
              <p>No items in cart</p>
              <p className="text-xs mt-2">Add items from the product list to get started</p>
            </div>
          ) : (
            cart.map((item, idx) => {
              const price = getPrice(item.product);
              const expiryDate = item.product.expiryDate ? new Date(item.product.expiryDate) : null;
              const today = new Date();
              const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const isExpired = expiryDate ? expiryDate < currentDay : false;
              const isLowStock = typeof item.product.stock === 'number' && typeof item.product.lowStockThreshold === 'number' && item.product.stock > 0 && item.product.stock <= item.product.lowStockThreshold;
              return (
                <div
                  key={item.product.id}
                  className="flex items-center gap-2 p-2 md:p-2.5 rounded-xl glass-card animate-slide-up"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{item.product.name}</p>
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] text-muted-foreground">
                        GH₵{price.toFixed(2)} × {item.quantity} = <span className="font-semibold text-foreground">GH₵{(price * item.quantity).toFixed(2)}</span>
                      </p>
                      {isExpired && (
                        <span className="text-[10px] text-destructive font-semibold flex items-center gap-1">
                          <span className="text-xs" role="img" aria-label="warning">⚠️</span>
                          Expired - cannot dispense
                        </span>
                      )}
                      {!isExpired && isLowStock && (
                        <span className="text-[10px] text-amber-900 font-semibold flex items-center gap-1">
                          <span className="text-xs" role="img" aria-label="info">ℹ️</span>
                          Low stock - verify quantity
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg glass-card flex items-center justify-center hover:bg-secondary transition-all focus-visible:ring-2 focus-visible:ring-primary/30"
                      aria-label={`Decrease quantity for ${item.product.name}`}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-semibold w-6 text-center" aria-live="polite">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg glass-card flex items-center justify-center hover:bg-secondary transition-all focus-visible:ring-2 focus-visible:ring-primary/30"
                      aria-label={`Increase quantity for ${item.product.name}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-all focus-visible:ring-2 focus-visible:ring-destructive/30"
                    aria-label={`Remove ${item.product.name} from cart`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 md:p-4 border-t border-border/50 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Services</span>
            <span>GH₵{servicesTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Drugs</span>
            <span>GH₵{drugsTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm md:text-base font-bold text-foreground pt-1 border-t border-border/50">
            <span>Grand Total</span>
            <span>GH₵{grandTotal.toFixed(2)}</span>
          </div>

          {hasExpiredOrOverstocked && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive" role="alert">
              <span className="font-semibold">⚠️ Cannot generate receipt</span>
              <p className="mt-1">Remove expired items or adjust quantities exceeding stock.</p>
            </div>
          )}
          <Button
            className="w-full mt-2 md:mt-3 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 text-sm md:text-base py-2 md:py-3"
            onClick={async () => {
              showLoader();
              setIsGeneratingReceipt(true);
              // Simulate processing time for better UX
              setTimeout(() => {
                setShowReceipt(true);
                setIsGeneratingReceipt(false);
                hideLoader();
              }, 800);
            }}
            disabled={cart.length === 0 || isGeneratingReceipt || hasExpiredOrOverstocked}
            aria-busy={isGeneratingReceipt}
            aria-describedby={hasExpiredOrOverstocked ? "receipt-warning" : undefined}
          >
            {isGeneratingReceipt ? "Generating receipt..." : "Generate Receipt"}
          </Button>
          <AlertDialog open={showConfirmClear} onOpenChange={setShowConfirmClear}>
            <AlertDialogTrigger asChild>
              <button
                disabled={cart.length === 0}
                className="w-full text-xs md:text-sm text-destructive hover:text-destructive/80 disabled:opacity-40 transition-colors py-1 focus-visible:ring-2 focus-visible:ring-destructive/30"
                aria-label="Clear current bill and remove all items"
              >
                Clear Bill
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Current Bill?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all items from the current cart. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearCart}>Confirm Clear</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>

      {showReceipt && <ReceiptModal onClose={() => setShowReceipt(false)} />}
    </>
  );
};

export default BillingPanel;

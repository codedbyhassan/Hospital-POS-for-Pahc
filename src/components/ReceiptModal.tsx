import { useBilling } from "@/context/BillingContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  onClose: () => void;
}

const ReceiptModal = ({ onClose }: Props) => {
  const { patientName, receiptNumber, isNHIS, cart, getPrice, newPatient, saveReceipt } = useBilling();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const servicesItems = cart.filter(i => i.product.group === "SERVICES");
  const drugsItems = cart.filter(i => i.product.group === "DRUGS");
  const servicesTotal = servicesItems.reduce((s, i) => s + getPrice(i.product) * i.quantity, 0);
  const drugsTotal = drugsItems.reduce((s, i) => s + getPrice(i.product) * i.quantity, 0);
  const grandTotal = servicesTotal + drugsTotal;
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const toggle = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const groupByCategory = (items: typeof cart) => {
    const map: Record<string, typeof cart> = {};
    items.forEach(i => {
      const cat = i.product.category;
      if (!map[cat]) map[cat] = [];
      map[cat].push(i);
    });
    return map;
  };

  const renderSection = (title: string, items: typeof cart, total: number) => {
    const isOpen = expandedSections[title];
    const grouped = groupByCategory(items);

    return (
      <div className="glass-card rounded-xl overflow-hidden">
        <button onClick={() => toggle(title)} className="w-full flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors">
          <div className="flex items-center gap-2">
            {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <span className="text-sm font-semibold text-foreground">{title}</span>
          </div>
          <span className="text-sm font-bold text-foreground">GH₵{total.toFixed(2)}</span>
        </button>
        <div className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="border-t border-border/30">
            {Object.entries(grouped).map(([cat, catItems]) => {
              const catKey = `${title}-${cat}`;
              const catOpen = expandedSections[catKey];
              const catTotal = catItems.reduce((s, i) => s + getPrice(i.product) * i.quantity, 0);
              return (
                <div key={cat}>
                  <button onClick={() => toggle(catKey)} className="w-full flex items-center justify-between px-5 py-2 hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-2">
                      {catOpen ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                      <span className="text-xs font-medium text-muted-foreground">{cat}</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">GH₵{catTotal.toFixed(2)}</span>
                  </button>
                  <div className={cn(
                    "overflow-hidden transition-all duration-200",
                    catOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="px-8 pb-2 space-y-1">
                      {catItems.map(item => (
                        <div key={item.product.id} className="flex justify-between text-xs text-muted-foreground py-0.5">
                          <span>{item.product.name} × {item.quantity}</span>
                          <span className="text-foreground font-medium">GH₵{(getPrice(item.product) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const rightCol = pageWidth - margin;

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Patricia Appiagyei Health Centre", margin, 22);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Official Receipt", margin, 29);

    // Divider
    doc.setDrawColor(200);
    doc.line(margin, 33, rightCol, 33);

    // Receipt info
    let y = 40;
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.setFont("helvetica", "bold");
    doc.text("Receipt #:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(receiptNumber), margin + 30, y);

    doc.setFont("helvetica", "bold");
    doc.text("Date:", rightCol - 60, y);
    doc.setFont("helvetica", "normal");
    doc.text(today, rightCol - 45, y);

    y += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Patient:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(patientName || "N/A", margin + 30, y);

    doc.setFont("helvetica", "bold");
    doc.text("Mode:", rightCol - 60, y);
    doc.setFont("helvetica", "normal");
    doc.text(isNHIS ? "NHIS" : "CASH", rightCol - 45, y);

    // Divider
    y += 7;
    doc.setDrawColor(220);
    doc.line(margin, y, rightCol, y);

    // Table header
    y += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80);
    doc.text("Item", margin, y);
    doc.text("Category", 90, y);
    doc.text("Qty", 130, y, { align: "right" });
    doc.text("Unit (GH\u20B5)", 155, y, { align: "right" });
    doc.text("Total (GH\u20B5)", rightCol, y, { align: "right" });

    doc.setDrawColor(230);
    y += 2;
    doc.line(margin, y, rightCol, y);

    // Items grouped by group
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40);
    doc.setFontSize(9);

    const renderGroup = (title: string, items: typeof cart) => {
      if (items.length === 0) return;
      y += 7;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80);
      doc.text(title.toUpperCase(), margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40);

      items.forEach(item => {
        y += 6;
        if (y > 270) { doc.addPage(); y = 20; }
        const price = getPrice(item.product);
        const total = price * item.quantity;
        doc.text(item.product.name, margin + 2, y);
        doc.text(item.product.category, 90, y);
        doc.text(String(item.quantity), 130, y, { align: "right" });
        doc.text(price.toFixed(2), 155, y, { align: "right" });
        doc.text(total.toFixed(2), rightCol, y, { align: "right" });
      });
    };

    renderGroup("Services", servicesItems);
    renderGroup("Drugs", drugsItems);

    // Totals
    y += 5;
    doc.setDrawColor(200);
    doc.line(margin, y, rightCol, y);

    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.setFont("helvetica", "normal");
    doc.text("Services Subtotal:", margin, y);
    doc.text(`GH\u20B5 ${servicesTotal.toFixed(2)}`, rightCol, y, { align: "right" });

    y += 6;
    doc.text("Drugs Subtotal:", margin, y);
    doc.text(`GH\u20B5 ${drugsTotal.toFixed(2)}`, rightCol, y, { align: "right" });

    y += 3;
    doc.setDrawColor(60);
    doc.line(margin, y, rightCol, y);

    y += 7;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Grand Total:", margin, y);
    doc.text(`GH\u20B5 ${grandTotal.toFixed(2)}`, rightCol, y, { align: "right" });

    // Footer
    y += 15;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(140);
    doc.text("Thank you for choosing Patricia Appiagyei Health Centre.", pageWidth / 2, y, { align: "center" });

    doc.save(`PAHC_Receipt_${receiptNumber}.pdf`);
  };

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    // Header info rows
    const headerRows = [
      ["Patricia Appiagyei Health Centre"],
      ["Official Receipt"],
      [],
      ["Receipt #", receiptNumber, "", "Date", today],
      ["Patient", patientName || "N/A", "", "Mode", isNHIS ? "NHIS" : "CASH"],
      [],
      ["Item", "Category", "Group", "Qty", "Unit Price (GH₵)", "Total (GH₵)"],
    ];

    const itemRows = cart.map(item => {
      const price = getPrice(item.product);
      return [
        item.product.name,
        item.product.category,
        item.product.group,
        item.quantity,
        price,
        price * item.quantity,
      ];
    });

    const summaryRows = [
      [],
      ["", "", "", "", "Services Subtotal", servicesTotal],
      ["", "", "", "", "Drugs Subtotal", drugsTotal],
      ["", "", "", "", "GRAND TOTAL", grandTotal],
    ];

    const ws = XLSX.utils.aoa_to_sheet([...headerRows, ...itemRows, ...summaryRows]);

    // Column widths
    ws["!cols"] = [
      { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 6 }, { wch: 18 }, { wch: 18 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Receipt");
    XLSX.writeFile(wb, `PAHC_Receipt_${receiptNumber}.xlsx`);
  };

  const expiredDrugs = drugsItems.filter(item => {
    if (!item.product.expiryDate) return false;
    const expiry = new Date(item.product.expiryDate);
    const todayDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    return expiry < todayDate;
  });

  const overstocked = cart.filter(item => typeof item.product.stock === 'number' && item.quantity > item.product.stock);

  const canCompleteCheckout = expiredDrugs.length === 0 && overstocked.length === 0;

  const handleNewPatient = () => {
    if (!canCompleteCheckout) return;
    saveReceipt();
    newPatient();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div id="receipt-print" className="glass-panel border border-border/50 w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-border/50">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Patricia Appiagyei Health Centre</h2>
              <p className="text-2xl font-bold text-primary mt-1">#{receiptNumber}</p>
              <p className="text-xs text-muted-foreground mt-1">{today}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn(
                "border text-xs font-medium",
                isNHIS ? "bg-success/15 text-success border-success/25" : "bg-secondary text-secondary-foreground border-border"
              )}>
                {isNHIS ? "NHIS" : "CASH"}
              </Badge>
              <button onClick={onClose} className="w-8 h-8 rounded-full glass-card flex items-center justify-center hover:bg-secondary transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {patientName && (
            <div className="mt-3">
              <span className="inline-block px-3 py-1 rounded-full glass-card text-sm text-foreground font-medium">
                {patientName}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {servicesItems.length > 0 && renderSection("Services", servicesItems, servicesTotal)}
          {drugsItems.length > 0 && renderSection("Drugs", drugsItems, drugsTotal)}
        </div>

        <div className="p-6 border-t border-border/50 space-y-4">
          <div className="flex justify-between text-xl font-bold text-foreground">
            <span>Grand Total</span>
            <span>GH₵{grandTotal.toFixed(2)}</span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 text-sm glass-card border-border/50" onClick={exportPDF}>
              Export PDF
            </Button>
            <Button variant="outline" className="flex-1 text-sm bg-success/10 text-success border-success/20 hover:bg-success/20" onClick={exportExcel}>
              Export Excel
            </Button>
            <Button variant="outline" className="flex-1 text-sm glass-card border-border/50" onClick={() => window.print()}>
              🖨️ Print
            </Button>
          </div>

          {(expiredDrugs.length > 0 || overstocked.length > 0) && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive space-y-2">
              {expiredDrugs.length > 0 && (
                <p>Expired drug item{expiredDrugs.length > 1 ? "s" : ""} must be removed before checkout.</p>
              )}
              {overstocked.length > 0 && (
                <p>Some items exceed current stock levels. Adjust quantities before checkout.</p>
              )}
            </div>
          )}

          <Button disabled={!canCompleteCheckout} className="w-full shadow-lg shadow-primary/25" onClick={handleNewPatient}>
            Done — New Patient
          </Button>
          <button onClick={onClose} className="w-full text-sm text-primary hover:text-primary/80 transition-colors py-1">
            ← Back to Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;

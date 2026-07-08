import { useBilling, type ReceiptRecord } from "@/context/BillingContext";
import { useState, useMemo, useEffect } from "react";
import { FileText, TrendingUp, CalendarDays, DollarSign, Receipt, ChevronDown, ChevronRight, Filter, Download, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, isToday, isThisMonth, isThisYear, isSameDay, startOfDay, endOfDay, parseISO, parse } from "date-fns";
import Header from "@/components/Header";

const parseReceiptDate = (dateStr: string): Date => {
  // Handle undefined/null dates gracefully
  if (!dateStr) return new Date();
  // Format: "6 Mar 2026" etc - use date-fns parse with explicit format
  return parse(dateStr, 'd MMM yyyy', new Date());
};

const History = () => {
  const { receiptHistory } = useBilling();
  const [expandedReceipt, setExpandedReceipt] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [filterMode, setFilterMode] = useState<"all" | "day" | "month" | "year">("all");

  const reprintPDF = async (receipt: ReceiptRecord) => {
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
    doc.text(String(receipt.receiptNumber), margin + 30, y);

    doc.setFont("helvetica", "bold");
    doc.text("Date:", rightCol - 60, y);
    doc.setFont("helvetica", "normal");
    doc.text(receipt.date || "N/A", rightCol - 30, y);

    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Patient:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(receipt.patientName || "N/A", margin + 30, y);

    doc.setFont("helvetica", "bold");
    doc.text("Mode:", rightCol - 60, y);
    doc.setFont("helvetica", "normal");
    doc.text(receipt.isNHIS ? "NHIS" : "CASH", rightCol - 30, y);

    // Items table
    y += 15;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240);
    doc.rect(margin, y - 3, pageWidth - 2 * margin, 6, "F");
    doc.setTextColor(60);
    doc.text("Item", margin + 2, y);
    doc.text("Qty", rightCol - 50, y);
    doc.text("Unit Price", rightCol - 30, y);
    doc.text("Total", rightCol - 5, y);

    y += 8;
    doc.setFont("helvetica", "normal");
    receipt.items.forEach(item => {
      doc.text(item.name.substring(0, 40), margin + 2, y);
      doc.text(String(item.quantity), rightCol - 50, y);
      doc.text(`GH₵${item.unitPrice.toFixed(2)}`, rightCol - 30, y);
      doc.text(`GH₵${(item.unitPrice * item.quantity).toFixed(2)}`, rightCol - 5, y);
      y += 5;
    });

    // Totals
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setDrawColor(200);
    doc.line(margin, y, rightCol, y);
    y += 8;

    doc.text("Services Subtotal:", margin, y);
    doc.text(`GH₵${receipt.servicesTotal.toFixed(2)}`, rightCol - 5, y);
    y += 5;

    doc.text("Drugs Subtotal:", margin, y);
    doc.text(`GH₵${receipt.drugsTotal.toFixed(2)}`, rightCol - 5, y);
    y += 5;

    doc.setFontSize(11);
    doc.text("GRAND TOTAL:", margin, y);
    doc.text(`GH₵${receipt.grandTotal.toFixed(2)}`, rightCol - 5, y);

    // Footer
    y += 15;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Thank you for choosing Patricia Appiagyei Health Centre", pageWidth / 2, y, { align: "center" });

    doc.save(`receipt-${receipt.receiptNumber}.pdf`);
  };

  const reprintExcel = async (receipt: ReceiptRecord) => {
    const { default: XLSX } = await import("xlsx");

    // Header info rows
    const headerRows = [
      ["Patricia Appiagyei Health Centre"],
      ["Official Receipt"],
      [],
      ["Receipt #", receipt.receiptNumber, "", "Date", receipt.date || "N/A"],
      ["Patient", receipt.patientName || "N/A", "", "Mode", receipt.isNHIS ? "NHIS" : "CASH"],
      [],
      ["Item", "Category", "Group", "Qty", "Unit Price (GH₵)", "Total (GH₵)"],
    ];

    const itemRows = receipt.items.map(item => [
      item.name,
      item.category,
      item.group,
      item.quantity,
      item.unitPrice,
      item.unitPrice * item.quantity,
    ]);

    const summaryRows = [
      [],
      ["", "", "", "", "Services Subtotal", receipt.servicesTotal],
      ["", "", "", "", "Drugs Subtotal", receipt.drugsTotal],
      ["", "", "", "", "GRAND TOTAL", receipt.grandTotal],
    ];

    const allRows = [...headerRows, ...itemRows, ...summaryRows];
    const ws = XLSX.utils.aoa_to_sheet(allRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Receipt");

    XLSX.writeFile(wb, `receipt-${receipt.receiptNumber}.xlsx`);
  };

  const filteredReceipts = useMemo(() => {
    if (filterMode === "all" && !selectedDate) return receiptHistory;
    return receiptHistory.filter(r => {
      const d = parseReceiptDate(r.date);
      if (selectedDate && filterMode === "day") return isSameDay(d, selectedDate);
      if (filterMode === "day") return isToday(d);
      if (filterMode === "month") return isThisMonth(d);
      if (filterMode === "year") return isThisYear(d);
      return true;
    });
  }, [receiptHistory, filterMode, selectedDate]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(filteredReceipts.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredReceipts]);

  const pagedReceipts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReceipts.slice(start, start + pageSize);
  }, [filteredReceipts, currentPage]);

  const todayTotal = useMemo(() =>
    receiptHistory.filter(r => isToday(parseReceiptDate(r.date))).reduce((s, r) => s + r.grandTotal, 0),
    [receiptHistory]
  );

  const monthTotal = useMemo(() =>
    receiptHistory.filter(r => isThisMonth(parseReceiptDate(r.date))).reduce((s, r) => s + r.grandTotal, 0),
    [receiptHistory]
  );

  const yearTotal = useMemo(() =>
    receiptHistory.filter(r => isThisYear(parseReceiptDate(r.date))).reduce((s, r) => s + r.grandTotal, 0),
    [receiptHistory]
  );

  const filteredTotal = filteredReceipts.reduce((s, r) => s + r.grandTotal, 0);

  const nhisCount = filteredReceipts.filter(r => r.isNHIS).length;
  const cashCount = filteredReceipts.filter(r => !r.isNHIS).length;

  const topItems = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    filteredReceipts.forEach(r => {
      r.items.forEach(item => {
        if (!map[item.name]) map[item.name] = { name: item.name, qty: 0, revenue: 0 };
        map[item.name].qty += item.quantity;
        map[item.name].revenue += item.unitPrice * item.quantity;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [filteredReceipts]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* History Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Section */}
          <div className="h-12 md:h-16 glass-panel border-b border-border/50 flex items-center px-4 md:px-6 gap-3 md:gap-4 shrink-0 z-20">
          <div className="flex items-center gap-2 md:gap-2.5">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Receipt className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-xs md:text-sm">Receipt History</h1>
              <p className="text-[10px] md:text-[11px] text-muted-foreground">{receiptHistory.length} total receipts</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
          {(["all", "day", "month", "year"] as const).map(mode => (
            <button
              key={mode}
              onClick={() => { setFilterMode(mode); if (mode !== "day") setSelectedDate(undefined); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                filterMode === mode
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "glass-card text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              {mode === "all" ? "All" : mode === "day" ? "Today" : mode === "month" ? "Month" : "Year"}
            </button>
          ))}

          <Popover>
            <PopoverTrigger asChild>
              <button className="w-9 h-9 rounded-xl glass-card flex items-center justify-center hover:bg-secondary/80 transition-all">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => { setSelectedDate(d); setFilterMode("day"); }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" /> Today
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold text-foreground">GH₵{todayTotal.toFixed(2)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {receiptHistory.filter(r => isToday(parseReceiptDate(r.date))).length} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" /> This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold text-foreground">GH₵{monthTotal.toFixed(2)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {receiptHistory.filter(r => isThisMonth(parseReceiptDate(r.date))).length} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5" /> This Year
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold text-foreground">GH₵{yearTotal.toFixed(2)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {receiptHistory.filter(r => isThisYear(parseReceiptDate(r.date))).length} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" /> Filtered Total
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold text-primary">GH₵{filteredTotal.toFixed(2)}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {filteredReceipts.length} receipts · {nhisCount} NHIS · {cashCount} Cash
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Row */}
        {topItems.length > 0 && (
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold text-foreground">Top Items by Revenue</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4">
              <div className="space-y-2.5">
                {topItems.map((item, idx) => {
                  const maxRev = topItems[0]?.revenue || 1;
                  return (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-5">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-xs font-medium text-foreground truncate">{item.name}</span>
                          <span className="text-xs font-bold text-foreground ml-2">GH₵{item.revenue.toFixed(2)}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${(item.revenue / maxRev) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">×{item.qty}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Receipt List */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground px-1">
            {filterMode === "all" && !selectedDate ? "All Receipts" :
             selectedDate ? `Receipts for ${format(selectedDate, "PPP")}` :
             filterMode === "day" ? "Today's Receipts" :
             filterMode === "month" ? "This Month's Receipts" : "This Year's Receipts"}
          </h3>

          {filteredReceipts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <FileText className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No receipts found</p>
            </div>
          ) : (
            pagedReceipts.map((receipt, idx) => {
              const isOpen = expandedReceipt === idx;
              return (
                <Card
                  key={`${receipt.receiptNumber}-${idx}`}
                  className="glass-card border-border/50 overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <button
                    onClick={() => setExpandedReceipt(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold",
                        receipt.isNHIS ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
                      )}>
                        #{String(receipt.receiptNumber).slice(-3)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-foreground">{receipt.patientName || "Unknown"}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {receipt.date} · {receipt.timestamp ? format(parseISO(receipt.timestamp), 'HH:mm') : 'N/A'} · {receipt.isNHIS ? "NHIS" : "Cash"} · {receipt.items.length} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">GH₵{receipt.grandTotal.toFixed(2)}</p>
                        <p className="text-[10px] text-muted-foreground">
                          S: GH₵{receipt.servicesTotal.toFixed(2)} · D: GH₵{receipt.drugsTotal.toFixed(2)}
                        </p>
                      </div>
                      {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  <div className={cn(
                    "overflow-hidden transition-all duration-300",
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="px-5 pb-4 space-y-1.5 border-t border-border/30">
                      <div className="grid grid-cols-[1fr_60px_80px_80px] gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pt-3 pb-1">
                        <span>Item</span>
                        <span className="text-right">Qty</span>
                        <span className="text-right">Unit Price</span>
                        <span className="text-right">Total</span>
                      </div>
                      {receipt.items.map((item, i) => (
                        <div key={i} className="grid grid-cols-[1fr_60px_80px_80px] gap-2 text-xs py-1">
                          <span className="text-foreground truncate">{item.name}</span>
                          <span className="text-right text-muted-foreground">{item.quantity}</span>
                          <span className="text-right text-muted-foreground">GH₵{item.unitPrice.toFixed(2)}</span>
                          <span className="text-right font-medium text-foreground">GH₵{(item.unitPrice * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-bold pt-3 border-t border-border/30">
                        <span>Grand Total</span>
                        <span>GH₵{receipt.grandTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex gap-2 pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs glass-card border-border/50"
                          onClick={() => reprintPDF(receipt)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs bg-success/10 text-success border-success/20 hover:bg-success/20"
                          onClick={() => reprintExcel(receipt)}
                        >
                          <FileSpreadsheet className="w-3 h-3 mr-1" />
                          Excel
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
          {filteredReceipts.length > pageSize && (
            <div className="flex items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
              <p>
                Showing {Math.min((currentPage - 1) * pageSize + 1, filteredReceipts.length)}–{Math.min(currentPage * pageSize, filteredReceipts.length)} of {filteredReceipts.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span>Page {currentPage} of {pageCount}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                  disabled={currentPage === pageCount}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;

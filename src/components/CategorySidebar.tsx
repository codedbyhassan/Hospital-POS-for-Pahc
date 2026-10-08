import { useBilling } from "@/context/BillingContext";
import { useProducts } from "@/context/ProductContext";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ListFilter } from "lucide-react";

type CategorySidebarProps = { open: boolean; onToggle: () => void };

const CategorySidebar = ({ open, onToggle }: CategorySidebarProps) => {
  const { activeCategory, setActiveCategory, getCartCountByCategory } = useBilling();
  const { categories } = useProducts();
  const services = categories.filter((category) => category.group === "SERVICES");
  const drugs = categories.filter((category) => category.group === "DRUGS");
  const renderCategory = (category: typeof categories[0]) => {
    const active = activeCategory === category.name;
    const count = getCartCountByCategory(category.name);
    return <button type="button" key={category.name} onClick={() => setActiveCategory(category.name)} aria-current={active ? "page" : undefined} className={cn("flex min-h-10 items-center justify-between rounded-xl px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", active ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><span className="truncate">{category.name}</span>{count > 0 && <span className={cn("ml-2 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px]", active ? "bg-primary-foreground/20" : "bg-primary/10 text-primary")}>{count}</span>}</button>;
  };
  return <nav aria-label="Product categories" className={cn("border-b border-border bg-card transition-[width] md:border-b-0 md:border-r", open ? "md:w-56" : "md:w-16")}><div className="flex items-center justify-between border-b border-border/70 px-3 py-2 md:px-2"><span className={cn("text-[10px] font-bold uppercase tracking-widest text-muted-foreground", !open && "md:sr-only")}>Categories</span><button type="button" onClick={onToggle} aria-label={open ? "Collapse categories" : "Expand categories"} className="hidden size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted md:flex">{open ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}</button><ListFilter className="size-4 text-muted-foreground md:hidden" /></div><div className={cn("flex gap-2 overflow-x-auto px-4 py-2 md:flex-col md:gap-1 md:overflow-visible md:px-2 md:py-4", !open && "md:items-center") }><div className={cn("flex shrink-0 items-center gap-2 md:mb-2", !open && "md:hidden")}><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Services</span><span className="h-px w-6 bg-border md:hidden" /></div>{services.map(renderCategory)}<div className="mx-1 h-8 w-px shrink-0 bg-border md:my-4 md:h-px md:w-full" /><div className={cn("flex shrink-0 items-center gap-2 md:mb-2", !open && "md:hidden")}><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Drugs</span><span className="h-px w-6 bg-border md:hidden" /></div>{drugs.map(renderCategory)}</div></nav>;
};
export default CategorySidebar;

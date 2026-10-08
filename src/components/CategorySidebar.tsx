import { useBilling } from "@/context/BillingContext";
import { useProducts } from "@/context/ProductContext";
import { cn } from "@/lib/utils";

const CategorySidebar = () => {
  const { activeCategory, setActiveCategory, getCartCountByCategory } = useBilling();
  const { categories } = useProducts();
  const services = categories.filter((category) => category.group === "SERVICES");
  const drugs = categories.filter((category) => category.group === "DRUGS");
  const renderCategory = (category: typeof categories[0]) => {
    const active = activeCategory === category.name;
    const count = getCartCountByCategory(category.name);
    return <button type="button" key={category.name} onClick={() => setActiveCategory(category.name)} aria-current={active ? "page" : undefined} className={cn("flex min-h-10 items-center justify-between rounded-xl px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", active ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><span className="truncate">{category.name}</span>{count > 0 && <span className={cn("ml-2 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px]", active ? "bg-primary-foreground/20" : "bg-primary/10 text-primary")}>{count}</span>}</button>;
  };
  return <nav aria-label="Product categories" className="border-b border-border bg-card px-4 py-2 md:w-56 md:shrink-0 md:border-b-0 md:border-r md:px-3 md:py-5"><div className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-1 md:overflow-visible"><div className="flex shrink-0 items-center gap-2 md:mb-2"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Services</span><span className="h-px w-6 bg-border md:hidden" /></div>{services.map(renderCategory)}<div className="mx-1 h-8 w-px shrink-0 bg-border md:my-4 md:h-px md:w-full" /><div className="flex shrink-0 items-center gap-2 md:mb-2"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Drugs</span><span className="h-px w-6 bg-border md:hidden" /></div>{drugs.map(renderCategory)}</div></nav>;
};
export default CategorySidebar;

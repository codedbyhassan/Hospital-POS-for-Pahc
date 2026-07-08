import { useBilling } from "@/context/BillingContext";
import { useProducts } from "@/context/ProductContext";
import { cn } from "@/lib/utils";

const CategorySidebar = () => {
  const { activeCategory, setActiveCategory, getCartCountByCategory } = useBilling();
  const { categories } = useProducts();

  const serviceCategories = categories.filter(c => c.group === "SERVICES");
  const drugCategories = categories.filter(c => c.group === "DRUGS");

  const renderCategoryMobile = (cat: typeof categories[0], idx: number) => {
    const isActive = activeCategory === cat.name;
    const count = getCartCountByCategory(cat.name);

    return (
      <button
        key={cat.name}
        onClick={() => setActiveCategory(cat.name)}
        className={cn(
          "px-3 py-1.5 text-xs rounded-lg transition-all relative flex items-center gap-1.5 whitespace-nowrap",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-secondary/60"
        )}
        style={{ animationDelay: `${idx * 40}ms` }}
      >
        <span>{cat.name}</span>
        {count > 0 && (
          <span className="badge-pop min-w-[16px] h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center px-1">
            {count}
          </span>
        )}
      </button>
    );
  };

  const renderCategory = (cat: typeof categories[0], idx: number) => {
    const isActive = activeCategory === cat.name;
    const count = getCartCountByCategory(cat.name);

    return (
      <button
        key={cat.name}
        onClick={() => setActiveCategory(cat.name)}
        className={cn(
          "w-full text-left px-4 py-2.5 text-sm rounded-r-lg transition-all relative flex items-center justify-between animate-slide-up",
          isActive
            ? "bg-primary/10 text-primary font-medium border-l-[3px] border-primary"
            : "text-muted-foreground hover:bg-secondary/60 border-l-[3px] border-transparent"
        )}
        style={{ animationDelay: `${idx * 40}ms` }}
      >
        <span>{cat.name}</span>
        {count > 0 && (
          <span className="badge-pop min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center px-1.5">
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile: Horizontal category bar at top */}
      <div className="md:hidden h-16 glass-panel border-b border-border/50 flex items-center overflow-x-auto px-4 gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap mr-2">Services</span>
          {serviceCategories.map((c, i) => renderCategoryMobile(c, i))}
        </div>
        <div className="w-px h-8 bg-border/50 mx-2" />
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap mr-2">Drugs</span>
          {drugCategories.map((c, i) => renderCategoryMobile(c, i + serviceCategories.length))}
        </div>
      </div>

      {/* Desktop: Vertical sidebar */}
      <aside className="hidden md:flex w-52 glass-sidebar border-r border-border/50 flex-col py-4 shrink-0 overflow-y-auto">
        <div className="px-4 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Services</span>
        </div>
        <div className="space-y-0.5 mb-4">
          {serviceCategories.map((c, i) => renderCategory(c, i))}
        </div>

        <div className="px-4 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Drugs</span>
        </div>
        <div className="space-y-0.5">
          {drugCategories.map((c, i) => renderCategory(c, i + serviceCategories.length))}
        </div>
      </aside>
    </>
  );
};

export default CategorySidebar;

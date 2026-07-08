import { useBilling } from "@/context/BillingContext";
import { useProducts } from "@/context/ProductContext";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const ProductGrid = () => {
  const { activeCategory, searchQuery, setSearchQuery, isNHIS, addToCart, getPrice, cart } = useBilling();
  const { products } = useProducts();

  const filtered = products.filter(p => {
    if (p.category !== activeCategory) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getCartQty = (id: string) => {
    const item = cart.find(i => i.product.id === id);
    return item ? item.quantity : 0;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 pt-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeCategory}...`}
            className="w-full h-10 pl-10 pr-4 rounded-xl glass-card text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            No items found
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((product, idx) => {
              const qty = getCartQty(product.id);
              const price = getPrice(product);
              const now = new Date();
              const expiry = product.expiryDate ? new Date(product.expiryDate) : null;
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const isExpired = expiry ? expiry < today : false;
              const daysUntilExpiry = expiry ? Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
              const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 30;
              const isOutOfStock = typeof product.stock === 'number' && product.stock <= 0;
              const isLowStock = typeof product.stock === 'number' && typeof product.lowStockThreshold === 'number' && product.stock > 0 && product.stock <= product.lowStockThreshold;

              return (
                <button
                  key={product.id}
                  onClick={() => { if (!isOutOfStock) addToCart(product); }}
                  className={cn(
                    "glass-card rounded-[14px] card-hover relative text-left p-4 flex flex-col gap-1 group transition-all duration-200 animate-slide-up",
                    qty > 0 ? "border-primary shadow-primary/10 shadow-lg" : "border-transparent",
                    (isOutOfStock || isExpired) && "cursor-not-allowed opacity-60",
                    !isOutOfStock && !isExpired && "cursor-pointer"
                  )}
                  style={{ animationDelay: `${idx * 30}ms` }}
                  disabled={isOutOfStock || isExpired}
                >
                  {qty > 0 && (
                    <span className="badge-pop absolute -top-2 -right-2 min-w-[22px] h-[22px] rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center px-1 shadow-lg shadow-primary/30">
                      {qty}
                    </span>
                  )}
                  {(isExpired || isOutOfStock || isLowStock || isExpiringSoon) && (
                    <span className={cn(
                      "absolute top-3 right-3 rounded-full px-2 py-1 text-[10px] font-semibold uppercase",
                      isExpired ? "bg-destructive text-destructive-foreground" : isOutOfStock ? "bg-destructive text-destructive-foreground" : isLowStock ? "bg-amber-100 text-amber-900" : "bg-amber-100 text-amber-900"
                    )}>
                      {isExpired ? "Expired" : isOutOfStock ? "Out of stock" : isLowStock ? "Low stock" : "Expires soon"}
                    </span>
                  )}
                  <span className="text-sm font-medium text-foreground leading-tight">{product.name}</span>
                  <span className="text-[11px] text-muted-foreground">{product.category}</span>
                  <div className="flex items-end justify-between mt-auto pt-2">
                    <span className={cn(
                      "text-lg font-bold transition-colors duration-300",
                      isNHIS ? "nhis-price" : "text-foreground"
                    )}>
                      GH₵{price.toFixed(2)}
                    </span>
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-110">
                      <Plus className="w-4 h-4" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;

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
      <div className="px-4 pt-4 pb-3 md:px-5">
        <div className="relative">
          <label htmlFor="product-search" className="sr-only">Search products in {activeCategory}</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            id="product-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeCategory}...`}
            aria-label={`Search products in ${activeCategory}`}
            className="w-full h-10 pl-10 pr-4 rounded-xl glass-card text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-5 md:px-5">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-center space-y-2">
            <div>
              <p className="text-sm font-medium">No products found</p>
              <p className="text-xs">Try adjusting your search or selecting a different category</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3" role="list">
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
                <li key={product.id}>
                  <button
                    onClick={() => { if (!isOutOfStock) addToCart(product); }}
                    className={cn(
                      "glass-card rounded-[14px] card-hover relative text-left p-3 sm:p-4 flex flex-col gap-1 group transition-all duration-200 animate-slide-up w-full h-full focus-visible:ring-2 focus-visible:ring-primary/30",
                      qty > 0 ? "border-primary shadow-primary/10 shadow-lg" : "border-transparent",
                      (isOutOfStock || isExpired) && "cursor-not-allowed opacity-60",
                      !isOutOfStock && !isExpired && "cursor-pointer"
                    )}
                    style={{ animationDelay: `${idx * 30}ms` }}
                    disabled={isOutOfStock || isExpired}
                    aria-label={`${product.name} - ${isExpired ? 'expired' : isOutOfStock ? 'out of stock' : `GH₵${price.toFixed(2)}`}${qty > 0 ? ` - ${qty} in cart` : ''}`}
                  >
                  {qty > 0 && (
                    <span className="badge-pop absolute -top-2 -right-2 min-w-[22px] h-[22px] rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center px-1 shadow-lg shadow-primary/30">
                      {qty}
                    </span>
                  )}
                  {(isExpired || isOutOfStock || isLowStock || isExpiringSoon) && (
                    <span className={cn(
                      "absolute top-2 right-2 sm:top-3 sm:right-3 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold uppercase",
                      isExpired ? "bg-destructive text-destructive-foreground" : isOutOfStock ? "bg-destructive text-destructive-foreground" : isLowStock ? "bg-amber-100 text-amber-900" : "bg-amber-100 text-amber-900"
                    )}>
                      {isExpired ? "Expired" : isOutOfStock ? "Out" : isLowStock ? "Low" : "Soon"}
                    </span>
                  )}
                  <span className="text-xs sm:text-sm font-medium text-foreground leading-tight line-clamp-2">{product.name}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">{product.category}</span>
                  <div className="flex items-end justify-between mt-auto pt-2">
                    <span className={cn(
                      "text-sm sm:text-base font-bold transition-colors duration-300",
                      isNHIS ? "nhis-price" : "text-foreground"
                    )}>
                      GH₵{price.toFixed(2)}
                    </span>
                    <span className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 sm:group-hover:scale-110">
                      <Plus className="w-4 h-4" />
                    </span>
                  </div>
                  </button>
                </li>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;

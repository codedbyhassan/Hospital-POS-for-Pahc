import Header from "@/components/Header";
import CategorySidebar from "@/components/CategorySidebar";
import ProductGrid from "@/components/ProductGrid";
import BillingPanel from "@/components/BillingPanel";

const Index = () => {
  return (
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        <Header />
        {/* Mobile: Stack layout, Desktop: Side-by-side layout */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          <CategorySidebar />
          <ProductGrid />
          <BillingPanel />
        </div>
      </div>
  );
};

export default Index;

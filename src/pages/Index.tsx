import Header from "@/components/Header";
import CategorySidebar from "@/components/CategorySidebar";
import ProductGrid from "@/components/ProductGrid";
import BillingPanel from "@/components/BillingPanel";
import { useState } from "react";

const Index = () => {
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [billOpen, setBillOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <CategorySidebar open={categoriesOpen} onToggle={() => setCategoriesOpen((value) => !value)} />
        <ProductGrid onOpenBill={() => setBillOpen(true)} />
        <BillingPanel open={billOpen} onToggle={() => setBillOpen((value) => !value)} />
      </div>
    </div>
  );
};

export default Index;

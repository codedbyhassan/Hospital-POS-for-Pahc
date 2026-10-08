import Header from "@/components/Header";
import CategorySidebar from "@/components/CategorySidebar";
import ProductGrid from "@/components/ProductGrid";
import BillingPanel from "@/components/BillingPanel";

const Index = () => <div className="flex h-screen flex-col overflow-hidden bg-background"><Header /><div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row"><CategorySidebar /><ProductGrid /><BillingPanel /></div></div>;
export default Index;

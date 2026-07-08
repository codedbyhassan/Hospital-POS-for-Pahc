import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import Index from "./pages/Index";
import HistoryPage from "./pages/History";
import ItemsManagement from "./pages/ItemsManagement";
import DataManagement from "./pages/DataManagement";
import NotFound from "./pages/NotFound";
import { BillingProvider } from "@/context/BillingContext";
import { ProductProvider } from "@/context/ProductContext";
import { LoadingProvider } from "@/context/LoadingContext";
import MobileNav from "@/components/MobileNav";
import ErrorBoundary from "@/components/ErrorBoundary";

const App = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <ProductProvider>
        <LoadingProvider>
          <BillingProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <HashRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/items" element={<ItemsManagement />} />
                  <Route path="/data" element={<DataManagement />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <MobileNav />
              </HashRouter>
            </TooltipProvider>
          </BillingProvider>
        </LoadingProvider>
      </ProductProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;

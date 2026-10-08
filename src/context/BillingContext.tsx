import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Product } from "@/data/products";
import { useProducts } from "@/context/ProductContext";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ReceiptRecord {
  receiptNumber: number;
  patientName: string;
  isNHIS: boolean;
  date: string;
  timestamp: string; // ISO timestamp for precise time tracking
  items: { name: string; category: string; group: string; quantity: number; unitPrice: number }[];
  servicesTotal: number;
  drugsTotal: number;
  grandTotal: number;
}

interface BillingState {
  patientName: string;
  receiptNumber: number;
  isNHIS: boolean;
  cart: CartItem[];
  searchQuery: string;
  activeCategory: string;
  receiptHistory: ReceiptRecord[];
}

interface BillingContextType extends BillingState {
  setPatientName: (name: string) => void;
  setIsNHIS: (val: boolean) => void;
  setReceiptNumber: (n: number) => void;
  setSearchQuery: (q: string) => void;
  setActiveCategory: (cat: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  newPatient: () => void;
  getPrice: (product: Product) => number;
  getCartCountByCategory: (category: string) => number;
  saveReceipt: () => void;
}

const BillingContext = createContext<BillingContextType | null>(null);

export const useBilling = () => {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error("useBilling must be used within BillingProvider");
  return ctx;
};

export const BillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patientName, setPatientName] = useState("");
  const [receiptNumber, setReceiptNumber] = useState(() => {
    try {
      const saved = localStorage.getItem("pahc-receipt-number");
      return saved ? parseInt(saved, 10) : 9622211;
    } catch {
      return 9622211;
    }
  });
  const [isNHIS, setIsNHIS] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Consulting");
  const [receiptHistory, setReceiptHistory] = useState<ReceiptRecord[]>(() => {
    try {
      const saved = localStorage.getItem("pahc-receipt-history");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Persist receipt data outside state updaters so React StrictMode cannot duplicate side effects.
  useEffect(() => {
    try {
      localStorage.setItem("pahc-receipt-number", receiptNumber.toString());
      localStorage.setItem("pahc-receipt-history", JSON.stringify(receiptHistory));
    } catch {
      // Storage failures should not prevent the till from remaining usable.
    }
  }, [receiptNumber, receiptHistory]);

  const { updateProduct } = useProducts();

  const getPrice = useCallback((product: Product) => {
    return isNHIS ? product.nhisPrice : product.cashPrice;
  }, [isNHIS]);

  const addToCart = useCallback((product: Product) => {
    const expiryDate = product.expiryDate ? new Date(product.expiryDate) : null;
    const today = new Date();
    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (expiryDate && expiryDate < currentDay) {
      return;
    }

    if (typeof product.stock === 'number' && product.stock <= 0) {
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const nextQuantity = existing.quantity + 1;
        if (typeof product.stock === 'number' && nextQuantity > product.stock) {
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, qty: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id !== productId) return item;
      if (qty <= 0) return item;
      if (typeof item.product.stock === 'number' && qty > item.product.stock) {
        return item;
      }
      return { ...item, quantity: qty };
    }).filter(item => item.product.id !== productId || item.quantity > 0));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const saveReceipt = useCallback(() => {
    const servicesItems = cart.filter(i => i.product.group === "SERVICES");
    const drugsItems = cart.filter(i => i.product.group === "DRUGS");
    const servicesTotal = servicesItems.reduce((s, i) => s + (isNHIS ? i.product.nhisPrice : i.product.cashPrice) * i.quantity, 0);
    const drugsTotal = drugsItems.reduce((s, i) => s + (isNHIS ? i.product.nhisPrice : i.product.cashPrice) * i.quantity, 0);

    cart.forEach(item => {
      if (typeof item.product.stock === 'number') {
        const remaining = Math.max(0, item.product.stock - item.quantity);
        updateProduct(item.product.id, { stock: remaining });
      }
    });

    const record: ReceiptRecord = {
      receiptNumber,
      patientName,
      isNHIS,
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      timestamp: new Date().toISOString(),
      items: cart.map(i => ({
        name: i.product.name,
        category: i.product.category,
        group: i.product.group,
        quantity: i.quantity,
        unitPrice: isNHIS ? i.product.nhisPrice : i.product.cashPrice,
      })),
      servicesTotal,
      drugsTotal,
      grandTotal: servicesTotal + drugsTotal,
    };

    setReceiptHistory(prev => {
      return [record, ...prev];
    });
  }, [cart, receiptNumber, patientName, isNHIS, updateProduct]);

  const newPatient = useCallback(() => {
    setCart([]);
    setPatientName("");
    setReceiptNumber(prev => prev + 1);
  }, []);

  const getCartCountByCategory = useCallback((category: string) => {
    return cart.filter(item => item.product.category === category).reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return (
    <BillingContext.Provider value={{
      patientName, receiptNumber, isNHIS, cart, searchQuery, activeCategory, receiptHistory,
      setPatientName, setIsNHIS, setReceiptNumber, setSearchQuery, setActiveCategory,
      addToCart, removeFromCart, updateQuantity, clearCart, newPatient, getPrice, getCartCountByCategory, saveReceipt,
    }}>
      {children}
    </BillingContext.Provider>
  );
};

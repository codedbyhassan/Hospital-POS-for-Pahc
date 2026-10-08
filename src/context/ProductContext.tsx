import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product, Category, categories as defaultCategories, products as defaultProducts } from "@/data/products";

interface ProductContextType {
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, 'name'> & { name: string }) => void;
  deleteCategory: (name: string) => void;
  getNextId: () => string;
}

const ProductContext = createContext<ProductContextType | null>(null);

const STORAGE_KEY = 'pahc-products';
const CATEGORIES_STORAGE_KEY = 'pahc-categories';

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used within ProductProvider");
  return ctx;
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem(STORAGE_KEY);
    const savedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);

    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (error) {
        console.error('Error loading products from localStorage:', error);
      }
    } else {
      // Initialize with default products if none saved
      setProducts(defaultProducts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
    }

    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error('Error loading categories from localStorage:', error);
        setCategories(defaultCategories);
      }
    }
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  }, [products]);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  const getNextId = useCallback(() => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  }, []);

  const addProduct = useCallback((productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: getNextId(),
    };
    setProducts(prev => [...prev, newProduct]);
  }, [getNextId]);

  const updateProduct = useCallback((id: string, productData: Omit<Product, 'id'>) => {
    setProducts(prev => prev.map(product =>
      product.id === id ? { ...productData, id } : product
    ));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  }, []);

  const addCategory = useCallback((categoryData: Omit<Category, 'name'> & { name: string }) => {
    setCategories(prev => [...prev, categoryData]);
  }, []);

  const deleteCategory = useCallback((name: string) => {
    setCategories(prev => prev.filter(category => category.name !== name));
  }, []);

  const value: ProductContextType = {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    getNextId,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

import { Product, Category } from "@/data/products";
import type { ReceiptRecord } from "@/context/BillingContext";

export interface ExportData {
  version: string;
  timestamp: string;
  products: Product[];
  categories: Category[];
  receipts: ReceiptRecord[];
}

export const STORAGE_KEYS = {
  PRODUCTS: 'pahc-products',
  CATEGORIES: 'pahc-categories',
  RECEIPTS: 'pahc-receipt-history',
  AUTO_BACKUP: 'pahc-auto-backup',
  LAST_BACKUP: 'pahc-last-backup',
} as const;

const CURRENT_VERSION = '1.0.0';

const readArray = <T>(key: string): T[] => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

// Export all data to JSON
export const exportData = (): ExportData => {
  const products = readArray<Product>(STORAGE_KEYS.PRODUCTS);
  const categories = readArray<Category>(STORAGE_KEYS.CATEGORIES);
  const receipts = readArray<ReceiptRecord>(STORAGE_KEYS.RECEIPTS);

  return {
    version: CURRENT_VERSION,
    timestamp: new Date().toISOString(),
    products,
    categories,
    receipts,
  };
};

// Import data from JSON
export const importData = (data: ExportData): { success: boolean; errors: string[] } => {
  const errors: string[] = [];

  try {
    // Validate data structure
    if (!data || data.version !== CURRENT_VERSION || !Array.isArray(data.products) || !Array.isArray(data.categories) || !Array.isArray(data.receipts)) {
      errors.push('Invalid data format: missing required fields');
      return { success: false, errors };
    }

    // Validate products
    if (!Array.isArray(data.products)) {
      errors.push('Invalid products data: must be an array');
    } else {
      for (let i = 0; i < data.products.length; i++) {
        const product = data.products[i];
        if (!product.id || !product.name || !product.category || typeof product.cashPrice !== 'number' || typeof product.nhisPrice !== 'number') {
          errors.push(`Invalid product at index ${i}: missing required fields`);
        }
      }
    }

    // Validate categories
    if (!Array.isArray(data.categories)) {
      errors.push('Invalid categories data: must be an array');
    } else {
      for (let i = 0; i < data.categories.length; i++) {
        const category = data.categories[i];
        if (!category.name || !category.group) {
          errors.push(`Invalid category at index ${i}: missing required fields`);
        }
      }
    }

    // Validate receipts
    if (!Array.isArray(data.receipts)) {
      errors.push('Invalid receipts data: must be an array');
    } else {
      for (let i = 0; i < data.receipts.length; i++) {
        const receipt = data.receipts[i];
        if (!receipt.receiptNumber || receipt.patientName === undefined || !receipt.date || !receipt.items) {
          errors.push(`Invalid receipt at index ${i}: missing required fields`);
        }
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Backup current data
    const backup = {
      products: localStorage.getItem(STORAGE_KEYS.PRODUCTS),
      categories: localStorage.getItem(STORAGE_KEYS.CATEGORIES),
      receipts: localStorage.getItem(STORAGE_KEYS.RECEIPTS),
    };

    try {
      // Import data
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
      localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(data.receipts));

      return { success: true, errors: [] };
    } catch (storageError) {
      // Restore backup on error
      if (backup.products === null) localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      else localStorage.setItem(STORAGE_KEYS.PRODUCTS, backup.products);
      if (backup.categories === null) localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      else localStorage.setItem(STORAGE_KEYS.CATEGORIES, backup.categories);
      if (backup.receipts === null) localStorage.removeItem(STORAGE_KEYS.RECEIPTS);
      else localStorage.setItem(STORAGE_KEYS.RECEIPTS, backup.receipts);

      errors.push('Failed to save data to localStorage');
      return { success: false, errors };
    }
  } catch (error) {
    errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { success: false, errors };
  }
};

// Download data as JSON file
export const downloadData = (filename?: string) => {
  const data = exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `pahc-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Upload and import data from file
export const uploadData = (file: File): Promise<{ success: boolean; errors: string[] }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as ExportData;
        const result = importData(data);
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          errors: [`Failed to parse file: ${error instanceof Error ? error.message : 'Invalid JSON'}`]
        });
      }
    };
    reader.onerror = () => {
      resolve({ success: false, errors: ['Failed to read file'] });
    };
    reader.readAsText(file);
  });
};

// Clear all data (with confirmation)
export const clearAllData = (): { success: boolean; errors: string[] } => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.RECEIPTS);
    return { success: true, errors: [] };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
};

// Get data statistics
export const getDataStats = () => {
  const products = readArray<Product>(STORAGE_KEYS.PRODUCTS);
  const categories = readArray<Category>(STORAGE_KEYS.CATEGORIES);
  const receipts = readArray<ReceiptRecord>(STORAGE_KEYS.RECEIPTS);

  return {
    productsCount: products.length,
    categoriesCount: categories.length,
    receiptsCount: receipts.length,
    totalRevenue: receipts.reduce((sum: number, receipt: ReceiptRecord) => sum + receipt.grandTotal, 0),
    lastBackup: localStorage.getItem(STORAGE_KEYS.LAST_BACKUP) || null,
  };
};

// Auto-backup functionality
export const performAutoBackup = () => {
  const data = exportData();
  localStorage.setItem(STORAGE_KEYS.AUTO_BACKUP, JSON.stringify(data));
  localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
};

// Restore from auto-backup
export const restoreFromAutoBackup = (): { success: boolean; errors: string[] } => {
  try {
    const backupData = localStorage.getItem(STORAGE_KEYS.AUTO_BACKUP);
    if (!backupData) {
      return { success: false, errors: ['No auto-backup found'] };
    }

    const data = JSON.parse(backupData) as ExportData;
    return importData(data);
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to restore from auto-backup: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
};

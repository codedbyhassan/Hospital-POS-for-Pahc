import { beforeEach, describe, expect, it } from "vitest";
import {
  STORAGE_KEYS,
  clearAllData,
  exportData,
  getDataStats,
  importData,
  performAutoBackup,
  restoreFromAutoBackup,
} from "@/lib/dataPersistence";

const product = {
  id: "p-1",
  name: "Consultation",
  category: "Consulting",
  group: "SERVICES" as const,
  cashPrice: 15,
  nhisPrice: 10,
};

const category = { name: "Consulting", group: "SERVICES" as const };

beforeEach(() => localStorage.clear());

describe("data persistence", () => {
  it("exports valid stored arrays and statistics", () => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([product]));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify([category]));

    expect(exportData().products).toEqual([product]);
    expect(getDataStats()).toMatchObject({ productsCount: 1, categoriesCount: 1, receiptsCount: 0 });
  });

  it("rejects unsupported backup versions without changing data", () => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([product]));
    const result = importData({ version: "0.0.0", timestamp: new Date().toISOString(), products: [], categories: [], receipts: [] });
    expect(result.success).toBe(false);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)!)).toEqual([product]);
  });

  it("creates and restores an auto-backup", () => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([product]));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify([category]));
    performAutoBackup();
    clearAllData();

    expect(restoreFromAutoBackup().success).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS)!)).toEqual([product]);
  });
});

export {};

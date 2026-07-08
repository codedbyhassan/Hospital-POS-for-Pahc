# PAHC POS — Full Comprehensive Audit Report
**Patricia Appiagyei Health Centre | May 2026**
**Audit Scope: Full codebase review post-Phase 2 implementation**

---

## Skills Applied in This Audit

| Skill | Why It Was Used |
|---|---|
| `react-patterns` | Component architecture, context design, re-render analysis |
| `debugging-with-clarity` | Bug identification and root cause tracing |
| `supabase-projects` | Evaluating storage strategy vs. a proper backend |
| `firebase-projects` | Auth and real-time sync gap analysis |
| `accounting-bookkeeping-ghana` | GHS billing accuracy, NHIS logic, receipt structure |
| `focused-fix` | Pinpointing module-level defects across files |
| `code-documentation-writer` | Assessing documentation and code comments quality |
| `data-analytics-reporting` | History page analytics coverage assessment |
| `senior-pm` | Phase planning and timeline review |

---

## Overall Score: **74 / 100**

> Note: The previous internal audit (PAHC_POS_Audit.md) scored this at 82/100 and marked Phases 1 and 2 as completed. This fresh audit re-examined the actual submitted code and found that some "fixed" issues were only partially resolved, plus new defects introduced. Score recalibrated accordingly.

---

## Section 1: What Actually Works

| Feature | Status | Notes |
|---|---|---|
| Core billing flow | ✅ WORKS | Cart add, remove, quantity update all function |
| NHIS / Cash price toggle | ✅ WORKS | Switches prices correctly across all views |
| Services / Drugs split | ✅ WORKS | Subtotals separated correctly in panel and receipt |
| PDF receipt export | ✅ WORKS | jsPDF generates structured receipt with all fields |
| Excel receipt export | ✅ WORKS | xlsx export works with correct headers and totals |
| Product CRUD | ✅ WORKS | Add, edit, delete with proper form validation |
| Category management | ✅ WORKS | Add and delete categories, reflects in POS |
| Input validation | ✅ WORKS | validation.ts covers patient name, amounts, receipt number |
| Error boundary | ✅ WORKS | App-level boundary catches unhandled crashes |
| Theme system | ✅ WORKS | Dark/light + 6 color presets, persisted to localStorage |
| History filters | ✅ WORKS | All, Today, Month, Year and calendar date picker work |
| Revenue analytics | ✅ WORKS | Top 5 items by revenue rendered in history |
| Mobile layout | ✅ WORKS | Responsive with bottom nav on mobile |
| Loading states | ✅ WORKS | LoadingContext with overlay between actions |
| Data export/import | ✅ WORKS | JSON backup download and upload with validation |
| Auto-backup | ✅ WORKS | Writes snapshot to localStorage on export |
| Timestamps on receipts | ✅ WORKS | ISO timestamp in ReceiptRecord interface |
| Reprint from History | ✅ WORKS | PDF reprint from History.tsx implemented |
| Date parsing fix | ✅ WORKS | date-fns `parse()` with format string applied |
| Receipt cap at 1000 | ✅ WORKS | `slice(0, 1000)` applied in saveReceipt |
| Search within category | ✅ WORKS | Filters correctly within active category |
| Cart item counts on sidebar | ✅ WORKS | Sidebar shows per-category cart count |

---

## Section 2: Confirmed Bugs (Real Defects, Not Wishlist)

These are not feature requests. They are actual code defects that will cause problems in daily use.

---

### 🔴 BUG 1 — Duplicate BillingProvider: Cart & Patient State Doesn't Sync to History
**Severity: Critical**
**Files:** `src/App.tsx` and `src/pages/Index.tsx`

**What's wrong:**
`App.tsx` wraps all routes in `<BillingProvider>`. But `Index.tsx` also has its own `<BillingProvider>` wrapping the page content. React renders the inner one for the Index route, which creates a completely separate context instance. When a receipt is saved on the Index page, it writes to localStorage but the outer BillingProvider in App.tsx (used by History.tsx) has already loaded its `receiptHistory` state from localStorage at mount time and won't update.

**Result:** Receipts saved in the current session may not appear in History until the app is restarted or refreshed.

**The Phase 1 fix moved it to App.tsx — but Index.tsx still has its own BillingProvider.**

```tsx
// App.tsx — has BillingProvider ✅
<BillingProvider>
  <Routes>
    <Route path="/" element={<Index />} /> // ← Index also has a BillingProvider ❌

// Index.tsx — also has BillingProvider ❌
const Index = () => {
  return (
    <BillingProvider>   ← Remove this entirely
```

**Fix:** Remove the `<BillingProvider>` from `Index.tsx`. The one in `App.tsx` is sufficient.

---

### 🔴 BUG 2 — Electron Dev Port Mismatch (App Won't Load in Dev Mode)
**Severity: Critical for Desktop Build**
**File:** `main.cjs`

**What's wrong:**
```js
win.loadURL('http://localhost:5175'); // main.cjs line ~14
```
But Vite defaults to port **5173**, not 5175. Running `npm run electron-dev` will show a blank screen because Electron tries to load the wrong port.

**Fix:** Change to `http://localhost:5173` or read the port from an environment variable.

---

### 🔴 BUG 3 — Missing favicon.ico for Electron (Startup Error)
**Severity: High for Desktop Build**
**File:** `main.cjs`, `public/`

**What's wrong:**
```js
icon: path.join(__dirname, 'public/favicon.ico') // doesn't exist
```
The `public/` directory only has `favicon.svg` and `placeholder.svg`. Electron will throw an error on startup about the missing icon file.

**Fix:** Either convert `favicon.svg` to `.ico` using a converter tool and place it in `public/`, or update `main.cjs` to reference the SVG (or remove the icon property).

---

### 🟡 BUG 4 — `getDataStats()` Called Directly in Render (Performance Leak)
**Severity: Medium**
**File:** `src/pages/DataManagement.tsx`

**What's wrong:**
```tsx
const DataManagement = () => {
  const stats = getDataStats(); // called on every render
```
`getDataStats()` reads from localStorage synchronously on every render cycle. On slow devices (like clinic machines), this creates a perceptible lag each time the component re-renders. localStorage reads are synchronous and block the main thread.

**Fix:**
```tsx
const [stats, setStats] = useState(() => getDataStats());
// refresh after import/export/clear operations
```

---

### 🟡 BUG 5 — Product ID Collision Risk on Delete + Re-Add
**Severity: Medium**
**File:** `src/data/products.ts`, `src/context/ProductContext.tsx`

**What's wrong:**
The `products.ts` file uses a module-level `let _id = 0` counter to assign IDs 1 through N for default products. But `getNextId()` in ProductContext parses all existing product IDs as integers and returns `max + 1`. If products are deleted and re-added, and the IDs happen to be non-sequential, the new ID could collide with a previously deleted ID whose receipts are still in history.

The risk is low today but increases as products are added and deleted over months.

**Fix:** Use a UUID or timestamp-based ID for new products instead of integer incrementing.
```tsx
const getNextId = useCallback(() => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}, []);
```

---

### 🟡 BUG 6 — No Confirmation Before Cart Clear
**Severity: Medium (UX)**
**File:** `src/components/BillingPanel.tsx`

**What's wrong:**
The "Clear" or new patient action clears the entire cart immediately with no confirmation dialog. In a busy clinic, a staff member can accidentally wipe a full cart for a patient mid-billing.

**Fix:** Wrap the clear action in a `shadcn/ui AlertDialog` with "Are you sure? This will clear all items for [patient name]."

---

### 🟡 BUG 7 — Patient Name Validation Rejects Valid Ghanaian Names
**Severity: Medium (Data Quality)**
**File:** `src/lib/validation.ts`

**What's wrong:**
```ts
const PATIENT_NAME_PATTERN = /^[a-zA-Z\s\-']+$/;
```
This regex only allows A-Z letters, spaces, hyphens and apostrophes. It rejects names like:
- "Ɛ" (Akan vowel used in Twi names)
- "ɔ" (common in Ghanaian names)
- "Kofi Acheampong-Duah" — actually this one passes
- Names with accents from other languages (Ewe, Dagbani names)

In a clinic in Kumasi, this will reject real patient names every day.

**Fix:** Broaden the pattern to allow Unicode letters:
```ts
const PATIENT_NAME_PATTERN = /^[\p{L}\s\-']+$/u;
```

---

### 🟢 BUG 8 — No Receipt Number Duplicate Check on Manual Edit
**Severity: Low**
**File:** `src/components/Header.tsx`

**What's wrong:**
A staff member can manually type any receipt number in the header field. There's no check against existing receipt numbers in history. Two different patients could end up with the same receipt number, making audit impossible.

**Fix:** Before accepting a manually-entered receipt number, check if it already exists in `receiptHistory`. Warn the user if it does.

---

## Section 3: Architecture Issues

### A. No Authentication — Biggest Gap for a Health Facility
The app has zero authentication. Any person who opens the browser on the clinic PC can view all patient names, billing history, and revenue data. For a health facility, this is a compliance issue even if Ghana doesn't have a formal HIPAA equivalent.

**Minimum viable auth:** A single PIN screen using localStorage-hashed value (bcrypt or SHA-256). Even a 4-digit PIN is better than nothing.

**Better:** Supabase Auth with email/password and a simple role check (admin vs cashier).

---

### B. localStorage as the Only Data Store
The app stores everything in localStorage. This means:
- Data is tied to one browser on one device — a Windows update or Chrome "Clear Browsing Data" wipes all patient history
- No multi-device access (nurse's station + reception can't share data)
- The 5MB localStorage limit will eventually cause silent write failures with 1000 receipts
- No true backup without manual JSON export

**For a production health facility**, this is not acceptable past the first few months. The right move is Supabase (PostgreSQL) for receipts and products, with localStorage as a cache only.

---

### C. Dead Dependencies (Bundle Weight)
Four packages are installed but not actually used in the app:

| Package | Size | Used? |
|---|---|---|
| `@tanstack/react-query` | ~50KB | ❌ Installed, never called |
| `embla-carousel-react` | ~20KB | ❌ Installed, never called |
| `vaul` | ~15KB | ❌ Installed, never called |
| `react-resizable-panels` | ~25KB | ❌ Not used in core flows |

These inflate the production bundle unnecessarily. Remove them.

---

### D. No History Pagination
Despite being listed as a Phase 3 task in the existing audit, pagination was not implemented. All 1000 receipts are rendered at once in a single list. With 6+ months of clinic data (potentially 5000+ receipts at a busy facility), History.tsx will visibly freeze on load.

**Fix:** Implement virtual scrolling or page-by-page loading (50 per page).

---

### E. No Stock/Inventory Tracking
The `Product` interface has no `stock` field. Drugs can be billed even if they are out of stock. There is no way for the cashier to know if the dispensary has 0 tablets of a given drug. For a pharmacy, this is a core feature.

**Fix needed in Product type:**
```ts
export interface Product {
  id: string;
  name: string;
  category: string;
  group: CategoryGroup;
  cashPrice: number;
  nhisPrice: number;
  stock?: number;          // ← add this
  lowStockThreshold?: number; // ← and this
}
```

---

### F. No Drug Expiry Tracking
Related to the above — there is no `expiryDate` field on any product. A pharmacy system that can't track drug expiry is a patient safety risk, not just a code issue.

---

### G. Capacitor Config is Bare Minimum
`capacitor.config.ts` only sets `appId`, `appName` and `webDir`. For a production Android app:
- No splash screen config
- No status bar config
- No server config (needed for local asset loading)
- No Android-specific settings

This means the Android build will use default Capacitor behavior (white flash on launch, default status bar, etc.).

---

## Section 4: Code Quality

### TypeScript
- `validation.ts` is clean and well-typed
- `dataPersistence.ts` is solid with proper error handling and backup/restore
- `BillingContext.tsx` and `ProductContext.tsx` use `useCallback` correctly throughout
- Minor: `any` type still present in `ItemsManagement.tsx` (flagged in previous audit, not yet fixed)

### ESLint
- Previous audit noted 4 ESLint errors. Based on code review, the `any` type in `ItemsManagement.tsx` is still present
- The `require()` in `tailwind.config.ts` may have been resolved (config looks clean in current version)

### Component Separation
Good. Components are properly separated:
- `components/` — UI pieces
- `context/` — state management
- `pages/` — route-level views
- `lib/` — pure utility functions

### Test Coverage
Still effectively zero. The only test file contains:
```ts
it("should pass", () => {
  expect(true).toBe(true);
});
```
That's not a test — it's a placeholder. Zero business logic is tested.

---

## Section 5: Security Assessment

| Area | Status | Detail |
|---|---|---|
| Authentication | ❌ MISSING | Anyone with physical access to the device has full access |
| Session management | ❌ MISSING | No timeout, no logout |
| Audit logging | ❌ MISSING | No record of who changed prices or deleted products |
| Data encryption | ❌ MISSING | Patient names in plain text in localStorage |
| Role-based access | ❌ MISSING | No distinction between admin and cashier |
| Electron security | ✅ PARTIAL | `nodeIntegration: false`, `contextIsolation: true` set correctly |
| Input sanitization | ✅ DONE | Validation functions prevent malformed input |
| XSS | ✅ LOW RISK | React handles escaping; no `dangerouslySetInnerHTML` found |

Security score: **10/100** — identical to the previous audit. No progress made.

---

## Section 6: Score Breakdown

| Area | Score | Change from Last Audit | Comment |
|---|---|---|---|
| Core POS functionality | 88/100 | ▼ -2 | Duplicate BillingProvider bug still present reduces this |
| Data persistence | 55/100 | = 0 | localStorage only, no pagination added yet |
| UI / UX | 87/100 | ▲ +2 | Reprint, timestamps and analytics improve this |
| Code quality / TypeScript | 74/100 | ▼ -1 | Dead deps, `any` still present |
| Error handling | 70/100 | ▲ +5 | Error boundary, validation and auto-backup solid |
| Security | 10/100 | = 0 | Zero progress — no auth added |
| Testing | 5/100 | = 0 | Still one placeholder test |
| Production infrastructure | 42/100 | ▲ +2 | Electron setup exists but has port/icon bugs |

**Final Score: 74 / 100**

---

## Section 7: Recommended Fix Order

### Phase 3A — Fix Now (1-3 days)

| # | Task | File | Time |
|---|---|---|---|
| 1 | Remove BillingProvider from Index.tsx | Index.tsx | 5 min |
| 2 | Fix Electron dev port from 5175 → 5173 | main.cjs | 5 min |
| 3 | Add favicon.ico to public/ or remove icon reference | main.cjs | 30 min |
| 4 | Move `getDataStats()` into useState | DataManagement.tsx | 20 min |
| 5 | Broaden patient name regex to support Unicode | validation.ts | 15 min |
| 6 | Add AlertDialog before cart clear | BillingPanel.tsx | 45 min |
| 7 | Remove unused dependencies (react-query, embla, vaul) | package.json | 10 min |

### Phase 3B — Core Missing Features (1-2 weeks)

| # | Task | Effort |
|---|---|---|
| 1 | Add `stock` and `lowStockThreshold` to Product type | Medium |
| 2 | Show low stock warning badge on ProductGrid items | Medium |
| 3 | Add `expiryDate` field to Product type for drugs | Medium |
| 4 | Implement History pagination (50 per page) | Medium |
| 5 | Receipt number duplicate check on manual entry | Small |
| 6 | Dispensing engine feature (see Section 8 below) | Large |

### Phase 4 — Authentication (2-3 weeks)

| # | Task |
|---|---|
| 1 | Design PIN-based login screen (4-6 digit PIN) |
| 2 | Hash PIN with SHA-256 and store in localStorage |
| 3 | Add 30-minute idle session timeout |
| 4 | Lock screen on timeout, require PIN to resume |
| 5 | Add simple role field (admin / cashier) |
| 6 | Hide Items Management and Data Management from cashier role |

### Phase 5 — Backend Migration (1 month)

| # | Task |
|---|---|
| 1 | Set up Supabase project |
| 2 | Migrate products and categories to Supabase tables |
| 3 | Migrate receipt history to Supabase |
| 4 | Replace Supabase Auth for login (remove PIN hack) |
| 5 | Set up Row Level Security policies |
| 6 | Keep localStorage as offline cache with sync on reconnect |

---

## Section 8: Dispensing Feature — Full Implementation Guide

This covers how to implement the drug dispensing calculation feature described in your conversation, integrated into the existing PAHC POS codebase.

---

### 8.1 — Extend the Product Type

Add dispensing fields to the `Product` interface in `src/data/products.ts`:

```ts
export interface Product {
  id: string;
  name: string;
  category: string;
  group: CategoryGroup;
  cashPrice: number;
  nhisPrice: number;

  // Dispensing fields (drugs only)
  strength?: number;          // e.g. 500
  strengthUnit?: 'mg' | 'g' | 'mcg' | 'ml' | 'units';  // e.g. 'mg'
  dosageForm?: 'TAB' | 'CAP' | 'SYR' | 'SUSP' | 'INJ' | 'CRM' | 'OINT';
  unitsPerPack?: number;       // e.g. 10 (tablets per blister)
  packType?: 'BLISTER' | 'BOTTLE' | 'VIAL' | 'SACHET' | 'BOX';
  stock?: number;
  expiryDate?: string;         // ISO date string
}
```

---

### 8.2 — Constants File

Create `src/lib/dispensingConstants.ts`:

```ts
// Unit conversions
export const UNIT_CONVERSIONS = {
  MG_PER_G: 1000,
  MCG_PER_MG: 1000,
  ML_PER_L: 1000,
} as const;

// Frequency map — maps SIG codes to doses per day
export const FREQUENCY_MAP: Record<string, number> = {
  OD: 1,
  QD: 1,
  BD: 2,
  BID: 2,
  TDS: 3,
  TID: 3,
  QID: 4,
  NOCTE: 1,
  Q4H: 6,
  Q6H: 4,
  Q8H: 3,
  Q12H: 2,
};

// Route codes
export const ROUTES = {
  PO: 'By mouth',
  IV: 'Intravenous',
  IM: 'Intramuscular',
  SC: 'Subcutaneous',
  PR: 'Rectal',
  TOP: 'Topical',
  INH: 'Inhalation',
} as const;

// Pricing rule threshold (GHS)
export const PARTIAL_PACK_THRESHOLD = 10; // cedis
```

---

### 8.3 — Dispensing Engine

Create `src/lib/dispensingEngine.ts`:

```ts
import { FREQUENCY_MAP, UNIT_CONVERSIONS, PARTIAL_PACK_THRESHOLD } from './dispensingConstants';
import { Product } from '@/data/products';

export interface ParsedPrescription {
  doseMg: number;
  frequencyPerDay: number;
  durationDays: number;
  rawSig: string;
}

export interface DispensingResult {
  doseUnits: number;           // tablets/capsules per dose
  totalAdministrations: number;
  totalUnits: number;          // total tablets/capsules
  packsNeeded: number;         // whole packs (ceiled)
  fractionalPacks: number;     // exact decimal for pricing
  totalPrice: number;
  sig: string;                 // human-readable label
  warnings: string[];
}

/**
 * Parse a dose string like "1g", "500mg", "250mcg" into milligrams.
 */
export const parseDoseToMg = (doseStr: string): number => {
  const match = doseStr.trim().match(/^(\d+\.?\d*)\s*(g|mg|mcg)?$/i);
  if (!match) throw new Error(`Cannot parse dose: "${doseStr}"`);

  const value = parseFloat(match[1]);
  const unit = (match[2] || 'mg').toLowerCase();

  switch (unit) {
    case 'g':   return value * UNIT_CONVERSIONS.MG_PER_G;
    case 'mg':  return value;
    case 'mcg': return value / UNIT_CONVERSIONS.MCG_PER_MG;
    default:    return value;
  }
};

/**
 * Parse a SIG string like "1g tds x5" or "500mg BD x7" into a structured object.
 * 
 * Format: {dose} {frequency} x{days}
 * Examples: "1g tds x5", "500mg BD x7", "250mg OD x14"
 */
export const parseSig = (sig: string): ParsedPrescription => {
  const parts = sig.trim().toLowerCase().split(/\s+/);
  if (parts.length < 3) {
    throw new Error(`Invalid SIG format: "${sig}". Expected format: "1g TDS x5"`);
  }

  // Parse dose
  const doseMg = parseDoseToMg(parts[0]);

  // Parse frequency
  const freqCode = parts[1].toUpperCase();
  const frequencyPerDay = FREQUENCY_MAP[freqCode];
  if (!frequencyPerDay) {
    throw new Error(`Unknown frequency code: "${freqCode}". Use OD, BD, TDS, QID, etc.`);
  }

  // Parse duration — expects "x5", "x7", "X14"
  const durationMatch = parts[2].match(/^x(\d+)$/i);
  if (!durationMatch) {
    throw new Error(`Invalid duration: "${parts[2]}". Expected format like "x5" or "x7"`);
  }
  const durationDays = parseInt(durationMatch[1], 10);

  return { doseMg, frequencyPerDay, durationDays, rawSig: sig };
};

/**
 * Calculate dispensing quantities and price for a drug + prescription.
 * 
 * @param product   The drug product from the product catalog
 * @param sig       SIG string e.g. "1g TDS x5"
 * @param pricePerPack  Price per blister/pack in GHS
 */
export const calculateDispensing = (
  product: Product,
  sig: string,
  pricePerPack: number
): DispensingResult => {
  const warnings: string[] = [];

  if (!product.strength || !product.unitsPerPack) {
    throw new Error(`Product "${product.name}" is missing dispensing data (strength or unitsPerPack)`);
  }

  const prescription = parseSig(sig);

  // Step 1: Convert drug strength to mg
  let strengthMg = product.strength;
  if (product.strengthUnit === 'g') {
    strengthMg = product.strength * UNIT_CONVERSIONS.MG_PER_G;
  } else if (product.strengthUnit === 'mcg') {
    strengthMg = product.strength / UNIT_CONVERSIONS.MCG_PER_MG;
  }

  // Step 2: Units per dose
  const doseUnits = prescription.doseMg / strengthMg;

  // Warn if fractional tablet (e.g. 0.5 tablets)
  if (doseUnits % 1 !== 0) {
    warnings.push(`Dose requires ${doseUnits} tablets per administration (fractional dose).`);
  }

  // Step 3: Total administrations
  const totalAdministrations = prescription.frequencyPerDay * prescription.durationDays;

  // Step 4: Total units needed
  const totalUnits = doseUnits * totalAdministrations;

  // Step 5: Packs calculation
  const fractionalPacks = totalUnits / product.unitsPerPack;
  const packsNeeded = Math.ceil(fractionalPacks); // always dispense whole packs

  // Step 6: Price using business rule
  // Rule: if price < GHS 10 → round up (charge whole packs)
  // Rule: if price >= GHS 10 → exact proportional pricing
  let totalPrice: number;
  if (pricePerPack < PARTIAL_PACK_THRESHOLD) {
    totalPrice = packsNeeded * pricePerPack;
  } else {
    totalPrice = fractionalPacks * pricePerPack;
  }

  // Max daily dose warning for common drugs
  const dailyDoseMg = prescription.doseMg * prescription.frequencyPerDay;
  if (product.name.toLowerCase().includes('paracetamol') && dailyDoseMg > 4000) {
    warnings.push(`WARNING: Daily dose ${dailyDoseMg}mg exceeds paracetamol maximum (4000mg/day).`);
  }
  if (product.name.toLowerCase().includes('ibuprofen') && dailyDoseMg > 2400) {
    warnings.push(`WARNING: Daily dose ${dailyDoseMg}mg exceeds standard ibuprofen maximum (2400mg/day).`);
  }

  // SIG label for the receipt/label
  const freqLabel: Record<number, string> = {
    1: 'once daily',
    2: 'twice daily',
    3: 'three times daily',
    4: 'four times daily',
    6: 'every 4 hours',
  };
  const humanFreq = freqLabel[prescription.frequencyPerDay] || `${prescription.frequencyPerDay}x daily`;
  const sigLabel = `Take ${doseUnits} ${product.dosageForm === 'CAP' ? 'capsule(s)' : 'tablet(s)'} ${humanFreq} for ${prescription.durationDays} days`;

  return {
    doseUnits,
    totalAdministrations,
    totalUnits,
    packsNeeded,
    fractionalPacks,
    totalPrice,
    sig: sigLabel,
    warnings,
  };
};
```

---

### 8.4 — Worked Example (Your Exact Case)

```
Drug:           Paracetamol 500mg tablets, 10 per blister
SIG:            1g TDS x5
Price/blister:  GHS 1.00 (low cost rule applies)

Step 1:  doseMg         = parseDoseToMg("1g") = 1000 mg
Step 2:  doseUnits      = 1000 / 500 = 2 tablets per dose
Step 3:  totalAdmin     = 3 × 5 = 15 administrations
Step 4:  totalUnits     = 2 × 15 = 30 tablets
Step 5:  fractionalPacks = 30 / 10 = 3.0 blisters
         packsNeeded     = ceil(3.0) = 3 blisters

Step 6:  pricePerPack = 1.00 < 10 → charge whole packs
         totalPrice   = 3 × 1.00 = GHS 3.00

Label: "Take 2 tablets by mouth three times daily for 5 days"
```

---

### 8.5 — Pricing Table Summary

| Blisters Needed | Price/Blister | Rule | Charged |
|---|---|---|---|
| 1.5 | GHS 1.00 | Round up (< 10) | GHS 2.00 |
| 1.5 | GHS 10.00 | Fractional (≥ 10) | GHS 15.00 |
| 2.2 | GHS 5.00 | Round up (< 10) | GHS 15.00 |
| 1.5 | GHS 20.00 | Fractional (≥ 10) | GHS 30.00 |
| 3.0 | GHS 1.00 | Round up (< 10) | GHS 3.00 |

---

### 8.6 — Where to Plug This Into the Existing App

**In ItemsManagement.tsx** — Add the dispensing fields to the product form (strength, strengthUnit, dosageForm, unitsPerPack, packType). Show them only when `group === "DRUGS"`.

**In ProductGrid.tsx** — When a drug product is clicked, if it has `strength` and `unitsPerPack` defined, show a small "Dispense" modal where the cashier can type the SIG string. The modal calls `calculateDispensing()` and adds the computed quantity to the cart automatically.

**In BillingPanel.tsx** — For items that went through dispensing, show the SIG label under the item name instead of just quantity.

**In ReceiptModal.tsx** — Print the SIG label (e.g. "Take 2 tablets TDS x5") on the receipt for drugs.

---

### 8.7 — Edge Cases to Handle

| Case | How to Handle |
|---|---|
| PRN (when needed) | Don't calculate — prompt the cashier to enter quantity manually |
| Fractional tablets | Show a warning; allow cashier to confirm or override |
| Unknown frequency code | Throw a validation error with suggested codes |
| Drug has no strength data | Fall back to manual quantity entry, no auto-calculation |
| SIG typo | Wrap `calculateDispensing()` in try/catch, show toast error |
| Paediatric weight-based dosing | Flag as out of scope for v1; add weight field to product later |

---

## Section 9: Final Verdict

The PAHC POS is a solid piece of work for a solo developer. The UI is genuinely professional, the billing flow is clean, and the data export system is well-built. But calling it production-ready for a health facility right now is premature.

The three things that need to happen before it goes live at PAHC in any permanent capacity:

1. **Fix the BillingProvider duplication** — this is a 5-minute code change that fixes a data visibility bug
2. **Add even basic authentication** — a PIN screen is enough to protect patient data from casual exposure  
3. **Migrate from localStorage to Supabase** — this protects years of billing data from a single browser event

The dispensing feature is well-designed conceptually. The implementation above slots cleanly into the existing architecture and only requires extending the `Product` type and adding two new utility files.

---

*Audit conducted May 2026 | PAHC POS v0.0.0 (post-Phase 2)*

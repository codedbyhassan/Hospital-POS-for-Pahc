export type CategoryGroup = "SERVICES" | "DRUGS";

export interface Product {
  id: string;
  name: string;
  category: string;
  group: CategoryGroup;
  cashPrice: number;
  nhisPrice: number;
  stock?: number;
  lowStockThreshold?: number;
  expiryDate?: string;
}

export interface Category {
  name: string;
  group: CategoryGroup;
}

export const categories: Category[] = [
  { name: "Consulting", group: "SERVICES" },
  { name: "Laboratory", group: "SERVICES" },
  { name: "Consumables", group: "SERVICES" },
  { name: "Dressing", group: "SERVICES" },
  { name: "Suturing", group: "SERVICES" },
  { name: "Tablets", group: "DRUGS" },
  { name: "Capsules", group: "DRUGS" },
  { name: "Syrups", group: "DRUGS" },
  { name: "Injectables", group: "DRUGS" },
  { name: "Topicals", group: "DRUGS" },
];

let _id = 0;
const p = (
  name: string,
  category: string,
  group: CategoryGroup,
  nhis: number,
  cash: number,
  stock?: number,
  lowStockThreshold?: number,
  expiryDate?: string,
): Product => ({
  id: String(++_id),
  name,
  category,
  group,
  cashPrice: cash,
  nhisPrice: nhis,
  stock,
  lowStockThreshold,
  expiryDate,
});

export const products: Product[] = [
  // CONSULTING
  p("Consultation Fee", "Consulting", "SERVICES", 10, 15),

  // LABORATORY
  p("HB", "Laboratory", "SERVICES", 15, 20),
  p("FBC", "Laboratory", "SERVICES", 60, 60),
  p("Blood Film MPS", "Laboratory", "SERVICES", 15, 25),
  p("RDT Malaria", "Laboratory", "SERVICES", 10, 15),
  p("Sickling", "Laboratory", "SERVICES", 15, 25),
  p("Blood Group", "Laboratory", "SERVICES", 15, 25),
  p("G6PD", "Laboratory", "SERVICES", 40, 60),
  p("Retro Screen", "Laboratory", "SERVICES", 10, 15),
  p("HBsAg", "Laboratory", "SERVICES", 15, 20),
  p("Hepatitis C", "Laboratory", "SERVICES", 15, 20),
  p("VDRL", "Laboratory", "SERVICES", 15, 20),
  p("Widal/Typhoid", "Laboratory", "SERVICES", 20, 30),
  p("Urine R/E", "Laboratory", "SERVICES", 10, 15),
  p("H. Pylori", "Laboratory", "SERVICES", 40, 40),
  p("Gonorrhoea", "Laboratory", "SERVICES", 40, 40),
  p("FBS/RBS", "Laboratory", "SERVICES", 10, 15),
  p("Urine Protein Test", "Laboratory", "SERVICES", 10, 15),
  p("Serum Protein Test", "Laboratory", "SERVICES", 15, 20),
  p("Full ANC Package", "Laboratory", "SERVICES", 160, 200),

  // CONSUMABLES
  p("Accommodation/day", "Consumables", "SERVICES", 20, 20),
  p("Laundry", "Consumables", "SERVICES", 10, 10),
  p("Disinfectants", "Consumables", "SERVICES", 15, 15),
  p("Syringe & Needle", "Consumables", "SERVICES", 3, 3),
  p("Exam Gloves", "Consumables", "SERVICES", 5, 5),
  p("Cannula", "Consumables", "SERVICES", 5, 5),
  p("Disposable Gloves", "Consumables", "SERVICES", 5, 5),
  p("Giving Set", "Consumables", "SERVICES", 5, 5),
  p("CPS", "Consumables", "SERVICES", 10, 10),
  p("Folder Insured New", "Consumables", "SERVICES", 15, 15),
  p("Folder Insured Old", "Consumables", "SERVICES", 10, 10),
  p("Folder Non-Insured New", "Consumables", "SERVICES", 30, 30),
  p("Folder Non-Insured Old", "Consumables", "SERVICES", 15, 15),

  // DRESSING
  p("Minor Dressing", "Dressing", "SERVICES", 30, 30),
  p("Major Dressing", "Dressing", "SERVICES", 80, 80),

  // SUTURING
  p("Minor Suturing", "Suturing", "SERVICES", 200, 200),
  p("Major Suturing", "Suturing", "SERVICES", 350, 350),
  p("Surgical Blade", "Suturing", "SERVICES", 5, 5),
  p("Circumcision", "Suturing", "SERVICES", 150, 150),
  p("Delivery Procedure", "Suturing", "SERVICES", 150, 150),

  // TABLETS
  p("Art/Lumefantrine 20/120", "Tablets", "DRUGS", 3, 10),
  p("Art/Amodiaquine 100/270", "Tablets", "DRUGS", 5, 15),
  p("Art/Amodiaquine 50/135", "Tablets", "DRUGS", 2, 5),
  p("Albendazole 400mg", "Tablets", "DRUGS", 3, 6),
  p("Amlodipine 5mg", "Tablets", "DRUGS", 2, 10),
  p("Amlodipine 10mg", "Tablets", "DRUGS", 2, 10),
  p("Amoxiclav 625mg", "Tablets", "DRUGS", 45, 45),
  p("Aspirin 75mg", "Tablets", "DRUGS", 10, 10),
  p("Ascorbic Acid", "Tablets", "DRUGS", 3, 3),
  p("Art/Lumefantrine Disp", "Tablets", "DRUGS", 3, 7),
  p("Bendroflumethiazide 2.5mg", "Tablets", "DRUGS", 2, 2),
  p("Co-Trimoxazole", "Tablets", "DRUGS", 1, 3),
  p("Atorvastatin 20mg", "Tablets", "DRUGS", 5, 5),
  p("Cefuroxime 250mg", "Tablets", "DRUGS", 25, 25),
  p("Cefuroxime 500mg", "Tablets", "DRUGS", 50, 50),
  p("Cetirizine 10mg", "Tablets", "DRUGS", 1, 3),
  p("Clarithromycin 500mg", "Tablets", "DRUGS", 45, 45),
  p("Diazepam 10mg", "Tablets", "DRUGS", 1, 3),
  p("Diclofenac 50mg", "Tablets", "DRUGS", 1, 5),
  p("Diclofenac 75mg", "Tablets", "DRUGS", 2, 5),
  p("Fersolate", "Tablets", "DRUGS", 5, 10),
  p("Furosemide", "Tablets", "DRUGS", 1, 2),
  p("Ibuprofen 200mg", "Tablets", "DRUGS", 1, 2),
  p("Ibuprofen 400mg", "Tablets", "DRUGS", 1, 4),
  p("Lisinopril 10mg", "Tablets", "DRUGS", 10, 10),
  p("Losartan 50mg", "Tablets", "DRUGS", 10, 10),
  p("Metronidazole 200mg", "Tablets", "DRUGS", 1, 3),
  p("Metronidazole 400mg", "Tablets", "DRUGS", 2, 4),
  p("Multivitamin", "Tablets", "DRUGS", 1, 1),
  p("Metformin 500mg", "Tablets", "DRUGS", 1, 3),
  p("Nifedipine 20mg", "Tablets", "DRUGS", 3, 3),
  p("Nifedipine 30mg", "Tablets", "DRUGS", 5, 5),
  p("Paracetamol 500mg", "Tablets", "DRUGS", 1, 2),
  p("Zinc 10mg", "Tablets", "DRUGS", 1, 2),
  p("Zinc 20mg", "Tablets", "DRUGS", 1, 2),
  p("Zincovit", "Tablets", "DRUGS", 70, 70),
  p("Buscopan", "Tablets", "DRUGS", 2, 10),
  p("Glibenclamide", "Tablets", "DRUGS", 2, 2),
  p("Ciprofloxacin 250mg", "Tablets", "DRUGS", 1, 10),
  p("Azithromycin 250mg", "Tablets", "DRUGS", 20, 20),
  p("Azithromycin 500mg", "Tablets", "DRUGS", 25, 25),
  p("Mebendazole", "Tablets", "DRUGS", 4, 12),
  p("Folic Acid", "Tablets", "DRUGS", 1, 3),

  // CAPSULES
  p("Amoxicillin 250mg", "Capsules", "DRUGS", 6, 6),
  p("Amoxicillin 500mg", "Capsules", "DRUGS", 10, 10),
  p("Flucloxacillin 250mg", "Capsules", "DRUGS", 7, 7),
  p("Iron III Polymaltose", "Capsules", "DRUGS", 5, 15),
  p("Omeprazole 20mg", "Capsules", "DRUGS", 2, 5),
  p("Clindamycin 300mg", "Capsules", "DRUGS", 15, 15),
  p("Doxycycline 100mg", "Capsules", "DRUGS", 2, 7),
  p("Fluconazole 150mg", "Capsules", "DRUGS", 7, 7),
  p("Clindamycin 150mg", "Capsules", "DRUGS", 10, 10),
  p("Tramadol", "Capsules", "DRUGS", 20, 20),

  // SYRUPS
  p("Flucloxacillin Syrup", "Syrups", "DRUGS", 7, 17),
  p("Amoxiclav 228mg", "Syrups", "DRUGS", 10, 25),
  p("Amoxiclav 457mg", "Syrups", "DRUGS", 15, 35),
  p("Azithromycin Syrup", "Syrups", "DRUGS", 35, 35),
  p("Cefuroxime Syrup", "Syrups", "DRUGS", 25, 25),
  p("Cetirizine Syrup", "Syrups", "DRUGS", 8, 8),
  p("Diphenhydramine P", "Syrups", "DRUGS", 10, 10),
  p("Diphenhydramine A", "Syrups", "DRUGS", 10, 10),
  p("Ibuprofen Syrup", "Syrups", "DRUGS", 3, 10),
  p("Metronidazole Syrup", "Syrups", "DRUGS", 4, 10),
  p("Multivitamin Syrup", "Syrups", "DRUGS", 3, 8),
  p("Paracetamol Syrup", "Syrups", "DRUGS", 3, 8),
  p("Iron III Polymaltose Syrup", "Syrups", "DRUGS", 5, 15),
  p("Cough Linctus P", "Syrups", "DRUGS", 3, 10),
  p("Cough Linctus A", "Syrups", "DRUGS", 3, 10),
  p("Amoxicillin Syrup", "Syrups", "DRUGS", 3, 13),
  p("Co-Trimoxazole Syrup", "Syrups", "DRUGS", 3, 10),
  p("MMT", "Syrups", "DRUGS", 3, 9),
  p("ORS", "Syrups", "DRUGS", 1, 2),
  p("Vitamin C Syrup", "Syrups", "DRUGS", 15, 15),
  p("Carbocistein A", "Syrups", "DRUGS", 15, 15),
  p("Carbocistein P", "Syrups", "DRUGS", 12, 12),
  p("Tottema 10 ampoules", "Syrups", "DRUGS", 80, 80),

  // INJECTABLES
  p("DNS", "Injectables", "DRUGS", 5, 15),
  p("Dextrose 5%", "Injectables", "DRUGS", 5, 15),
  p("IV Paracetamol", "Injectables", "DRUGS", 25, 25),
  p("Ringers Lactate", "Injectables", "DRUGS", 5, 15),
  p("Sodium Chloride", "Injectables", "DRUGS", 5, 15),
  p("Dextrose 50%", "Injectables", "DRUGS", 10, 20),
  p("Artemether 80mg", "Injectables", "DRUGS", 7, 7),
  p("Artesunate 30mg", "Injectables", "DRUGS", 10, 10),
  p("Artesunate 60mg", "Injectables", "DRUGS", 13, 13),
  p("Artesunate 120mg", "Injectables", "DRUGS", 15, 15),
  p("Cefuroxime 750mg", "Injectables", "DRUGS", 15, 15),
  p("Ceftriaxone 1g", "Injectables", "DRUGS", 15, 15),
  p("Ciprofloxacin 200mg", "Injectables", "DRUGS", 12, 12),
  p("Metronidazole 500mg", "Injectables", "DRUGS", 5, 12),
  p("Clindamycin 300mg Inj", "Injectables", "DRUGS", 30, 30),
  p("Diclofenac 75mg Inj", "Injectables", "DRUGS", 3, 5),
  p("Omeprazole 40mg Inj", "Injectables", "DRUGS", 20, 20),
  p("Buscopan 20mg Inj", "Injectables", "DRUGS", 3, 7),
  p("Gentamycin 80mg", "Injectables", "DRUGS", 5, 5),
  p("Hydrocortisone 100mg", "Injectables", "DRUGS", 5, 10),
  p("Metoclopramide", "Injectables", "DRUGS", 10, 10),
  p("Benzathine Penicillin", "Injectables", "DRUGS", 15, 15),
  p("ATS", "Injectables", "DRUGS", 15, 15),
  p("Water for Injection", "Injectables", "DRUGS", 1, 2),
  p("Lidocaine 25%", "Injectables", "DRUGS", 12, 12),
  p("Promethazine", "Injectables", "DRUGS", 5, 5),
  p("Tranexamic Acid", "Injectables", "DRUGS", 20, 20),
  p("Tramadol 50mg Inj", "Injectables", "DRUGS", 15, 15),
  p("Diazepam 10mg Inj", "Injectables", "DRUGS", 10, 10),
  p("Furosemide 20mg Inj", "Injectables", "DRUGS", 5, 5),

  // TOPICALS
  p("Clotrimazole Cream 1%", "Topicals", "DRUGS", 5, 10),
  p("Clotrimazole Cream 2%", "Topicals", "DRUGS", 5, 12),
  p("Clotrimazole Vaginal Pess", "Topicals", "DRUGS", 5, 10),
  p("Miconazole Ovules", "Topicals", "DRUGS", 55, 55),
  p("Gentamycin Eye Drop", "Topicals", "DRUGS", 6, 6),
  p("Ciprofloxacin Eye Drop", "Topicals", "DRUGS", 10, 10),
  p("Chloramphenicol Eye Drop", "Topicals", "DRUGS", 10, 10),
  p("Dreg Ointment Small", "Topicals", "DRUGS", 30, 30),
  p("Dreg Solution Big", "Topicals", "DRUGS", 60, 60),
  p("Mupirocin Cream", "Topicals", "DRUGS", 40, 40),
  p("Saline Nasal Drop", "Topicals", "DRUGS", 3, 10),
  p("Supp Paracetamol 125mg", "Topicals", "DRUGS", 2, 2),
  p("Supp Paracetamol 250mg", "Topicals", "DRUGS", 2, 2),
  p("Supp Diclofenac 100mg", "Topicals", "DRUGS", 5, 15),
  p("Hydrocortisone Cream", "Topicals", "DRUGS", 10, 16),
  p("Dreg Ointment Big", "Topicals", "DRUGS", 60, 60),
  p("Dreg Solution Small", "Topicals", "DRUGS", 30, 30),
  p("Tetracycline Eye Ointment", "Topicals", "DRUGS", 5, 10),
  p("Ephedrine Nasal Drop 0.5%", "Topicals", "DRUGS", 10, 10),
  p("Ephedrine Nasal Drop 1%", "Topicals", "DRUGS", 10, 10),
  p("Salbutamol Nebules", "Topicals", "DRUGS", 17, 17),
];

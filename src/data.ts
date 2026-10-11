export interface PackageItem {
  id: string;
  name: string;
  price: number;
  description: string;
  popular?: boolean;
  badge?: string;
  highlights: string[];
  differenceExplanation?: string;
  includedParamTests?: string[];
}

export interface TestCatalogueItem {
  id: string;
  name: string;
  hindiName?: string;
  category: 'Blood' | 'Urine' | 'Hormone' | 'Infection' | 'Vitamin' | 'Special' | 'Other';
  sampleType: string;
  fastingRequirement: string;
  typicalReportTime: string;
  price: string;
  description?: string;
}

export interface ComparisonRow {
  test: string;
  hindiTest?: string;
  lite: boolean;
  active: boolean;
  total: boolean;
  complete: boolean;
}

export interface FAQItem {
  question: string;
  hindiQuestion: string;
  answer: string;
  hindiAnswer: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  hindiTitle: string;
  description: string;
  hindiDescription: string;
  icon: string;
  actionText: string;
  hindiActionText: string;
  actionHref: string;
}

export const LAB_DETAILS = {
  name: "Bharat Pathology",
  tagline: "Local Pathology Laboratory",
  hindiName: "भारत पैथोलॉजी",
  hindiTagline: "स्थानीय पैथोलॉजी प्रयोगशाला",
  address: "Bhimpura No. 1, Balauli Road, Ballia, Uttar Pradesh 221716",
  hindiAddress: "भीमपुरा नं. 1, बलौली रोड, बलिया, उत्तर प्रदेश 221716",
  hours: "Open daily, 8:00 AM to 7:00 PM",
  hindiHours: "प्रतिदिन खुला, सुबह 8:00 बजे से शाम 7:00 बजे तक",
  phoneDisplay: "+91 88877 90574",
  phoneRaw: "+918887790574",
  telLink: "tel:+918887790574",
  whatsappBaseUrl: "https://wa.me/918887790574",
  whatsappDefaultLink: "https://wa.me/918887790574?text=Hello%20Bharat%20Pathology%2C%20I%20would%20like%20to%20enquire%20about%20home%20sample%20collection.",
  mapsLink: "https://maps.app.goo.gl/mBKgyXy73Zr18qM69?g_st=ac",
  mapsEmbedQuery: "Bhimpura+No.+1+Balauli+Road+Ballia+Uttar+Pradesh+221716",
  footerText: "Local pathology testing and home sample collection in Bhimpura No. 1, Ballia 221716",
  hindiFooterText: "भीमपुरा नं. 1, बलिया 221716 में स्थानीय पैथोलॉजी जांच एवं होम सैंपल कलेक्शन",
  copyright: "© 2026 Bharat Pathology",
  upiPayeeName: "Sanjay Kumar",
  upiIdPlaceholder: "sanjaykumar.bp@upi", // Owner can fill actual VPA in data.ts
  upiWarning: "Check the UPI payee name shown in your payment app is Sanjay Kumar. If it does not match, do not pay and contact Bharat Pathology.",
  hindiUpiWarning: "भुगतान ऐप में प्रदर्शित प्राप्तकर्ता का नाम संजय कुमार (Sanjay Kumar) अवश्य जांचें। यदि नाम मेल न खाए, तो भुगतान न करें और भारत पैथोलॉजी से संपर्क करें।"
};

export const IMAGES = {
  heroLabInterior: "/images/hero-lab-interior.webp",
  homeCollection: "/images/home-sample-collection.webp",
  realExteriorSign: "/images/exterior-sign.webp",
  realEntrance: "/images/entrance.webp",
};

export const RAPID_CARD_INFO = {
  name: "Holiday rapid card",
  hindiName: "हॉलिडे रैपिड कार्ड",
  explanation: "" // OWNER TO FILL: e.g. "Rapid screening card test for seasonal infection markers"
};

export const HEALTH_PACKAGES: PackageItem[] = [
  {
    id: "lite",
    name: "Healthkind Lite",
    price: 1099,
    description: "Core profiles plus Holiday rapid card.",
    highlights: [
      "Fasting blood sugar",
      "Lipid profile",
      "Thyroid profile (T3, T4, TSH)",
      "Liver function test (LFT)",
      "Kidney function test (KFT)",
      "Holiday rapid card screening"
    ],
    includedParamTests: [
      "Fasting blood sugar",
      "Lipid profile",
      "Thyroid profile (T3, T4, TSH)",
      "Liver function test (LFT)",
      "Kidney function test (KFT)",
      "Holiday rapid card"
    ]
  },
  {
    id: "active",
    name: "Healthkind Active",
    price: 1449,
    description: "Adds HbA1c and CBC; excludes Holiday rapid card.",
    differenceExplanation: "", // OWNER TO FILL: specify exact parameter differences if any
    highlights: [
      "Everything in core profiles",
      "HbA1c (3-month blood sugar average)",
      "Complete Blood Count (CBC)",
      "Total 7 essential organ groups",
      "Excludes Holiday rapid card"
    ],
    includedParamTests: [
      "Fasting blood sugar",
      "Lipid profile",
      "Thyroid profile (T3, T4, TSH)",
      "Liver function test (LFT)",
      "Kidney function test (KFT)",
      "HbA1c",
      "Complete Blood Count (CBC)"
    ]
  },
  {
    id: "total",
    name: "Healthkind Total",
    price: 1949,
    popular: true,
    description: "Extended diagnostic parameter screening.",
    differenceExplanation: "", // OWNER TO FILL: e.g. "Includes extended sub-parameter breakdown and clinical risk indices"
    highlights: [
      "Comprehensive diagnostic screening",
      "Core organ profiles + HbA1c + CBC",
      "Extended parameter analysis",
      "Detailed health status overview"
    ],
    includedParamTests: [
      "Fasting blood sugar",
      "Lipid profile",
      "Thyroid profile (T3, T4, TSH)",
      "Liver function test (LFT)",
      "Kidney function test (KFT)",
      "HbA1c",
      "Complete Blood Count (CBC)"
    ]
  },
  {
    id: "complete",
    name: "Healthkind Complete",
    price: 3299,
    badge: "Most comprehensive",
    description: "Adds vitamin, iron, urine, and ESR screening.",
    highlights: [
      "Full Active test groups included",
      "Vitamin B12 & Vitamin D (25-hydroxy)",
      "Iron studies screening",
      "Urine routine & microscopy",
      "ESR & Gamma-GT (GGT) + Phosphorus"
    ],
    includedParamTests: [
      "Fasting blood sugar",
      "Lipid profile",
      "Thyroid profile (T3, T4, TSH)",
      "Liver function test (LFT)",
      "Kidney function test (KFT)",
      "HbA1c",
      "Complete Blood Count (CBC)",
      "Vitamin B12",
      "Vitamin D (25-hydroxy)",
      "Gamma-glutamyl transferase (GGT)",
      "Phosphorus",
      "Iron studies",
      "Urine routine & microscopy",
      "ESR"
    ]
  }
];

export const PACKAGE_COMPARISON: ComparisonRow[] = [
  { test: "Fasting blood sugar", hindiTest: "फास्टिंग ब्लड शुगर (Fasting Sugar)", lite: true, active: true, total: true, complete: true },
  { test: "Lipid profile", hindiTest: "लिपिड प्रोफाइल (कोलेस्ट्रॉल जांच)", lite: true, active: true, total: true, complete: true },
  { test: "Thyroid profile (T3, T4, TSH)", hindiTest: "थायराइड प्रोफाइल (T3, T4, TSH)", lite: true, active: true, total: true, complete: true },
  { test: "Liver function test (LFT)", hindiTest: "लिवर फंक्शन टेस्ट (LFT)", lite: true, active: true, total: true, complete: true },
  { test: "Kidney function test (KFT)", hindiTest: "किडनी फंक्शन टेस्ट (KFT)", lite: true, active: true, total: true, complete: true },
  { test: "HbA1c", hindiTest: "HbA1c (3 माह का औसत शुगर)", lite: false, active: true, total: true, complete: true },
  { test: "Complete blood count (CBC)", hindiTest: "कम्प्लीट ब्लड काउंट (CBC)", lite: false, active: true, total: true, complete: true },
  { test: "Vitamin B12", hindiTest: "विटामिन B12", lite: false, active: false, total: false, complete: true },
  { test: "Vitamin D (25-hydroxy)", hindiTest: "विटामिन D (25-हाइड्रॉक्सी)", lite: false, active: false, total: false, complete: true },
  { test: "Gamma-glutamyl transferase (GGT)", hindiTest: "गामा-ग्लूटामाइल ट्रांसफरेज़ (GGT)", lite: false, active: false, total: false, complete: true },
  { test: "Phosphorus", hindiTest: "फास्फोरस (Phosphorus)", lite: false, active: false, total: false, complete: true },
  { test: "Holiday rapid card", hindiTest: "हॉलिडे रैपिड कार्ड", lite: true, active: false, total: false, complete: false },
  { test: "Iron studies", hindiTest: "आयरन प्रोफाइल (Iron Studies)", lite: false, active: false, total: false, complete: true },
  { test: "Urine routine and microscopy", hindiTest: "यूरिन रूटीन एवं माइक्रोस्कोपी", lite: false, active: false, total: false, complete: true },
  { test: "Erythrocyte sedimentation rate (ESR)", hindiTest: "ESR टेस्ट", lite: false, active: false, total: false, complete: true }
];

export const PACKAGE_COMPARISON_NOTE = "Active and Total show the same visible test groups. Please contact the lab to confirm parameter-level differences, exact inclusions, availability, and preparation requirements before booking.";
export const HINDI_PACKAGE_COMPARISON_NOTE = "एक्टिव (Active) और टोटल (Total) पैकेज समान दिखाई देने वाले टेस्ट ग्रुप दर्शाते हैं। कृपया बुकिंग से पहले पैरामीटर-स्तर के अंतर, सटीक जांच विवरण, उपलब्धता और तैयारी की आवश्यकताओं की पुष्टि के लिए लैब से सीधे संपर्क करें।";

export const TEST_DROPDOWN_OPTIONS = [
  "Healthkind Lite Package - Rs 1,099",
  "Healthkind Active Package - Rs 1,449",
  "Healthkind Total Package - Rs 1,949",
  "Healthkind Complete Package - Rs 3,299",
  "CBC",
  "Widal (Typhoid)",
  "Malaria (MP)",
  "Blood Group & Rh Factor",
  "HBsAg (Hepatitis B)",
  "VDRL",
  "HIV",
  "Blood Sugar",
  "Urine Pregnancy Test",
  "Urine R/M",
  "RA Test",
  "ASO Titre",
  "Mantoux Test",
  "BT-CT",
  "Semen Analysis",
  "Electrolytes",
  "Thyroid Profile",
  "Platelet Count",
  "Calcium",
  "Sputum for AFB",
  "TB Gold",
  "LFT (Liver Function Test)",
  "KFT (Kidney Function Test)",
  "Blood Urea",
  "Serum Uric Acid",
  "Serum Creatinine",
  "Albumin",
  "Lipid Profile",
  "Serum Cholesterol",
  "Biopsy",
  "CRP Test",
  "Multiple tests (list below)",
  "Other test (describe below)"
];

export const PRICED_PACKAGES_MAP: Record<string, { name: string; price: number }> = {
  "Healthkind Lite Package - Rs 1,099": { name: "Healthkind Lite", price: 1099 },
  "Healthkind Active Package - Rs 1,449": { name: "Healthkind Active", price: 1449 },
  "Healthkind Total Package - Rs 1,949": { name: "Healthkind Total", price: 1949 },
  "Healthkind Complete Package - Rs 3,299": { name: "Healthkind Complete", price: 3299 }
};

export const CATALOGUE_TESTS: TestCatalogueItem[] = [
  {
    id: "cbc",
    name: "CBC (Complete Blood Count)",
    hindiName: "सीबीसी (Complete Blood Count)",
    category: "Blood",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Evaluates overall health and detects wide range of disorders including anemia and infection."
  },
  {
    id: "blood-sugar",
    name: "Blood Sugar (Fasting / PP)",
    hindiName: "ब्लड शुगर (Fasting / PP)",
    category: "Blood",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Measures glucose levels in the blood for diabetes screening and monitoring."
  },
  {
    id: "hba1c",
    name: "HbA1c (Glycated Hemoglobin)",
    hindiName: "HbA1c (3 माह का औसत शुगर)",
    category: "Blood",
    sampleType: "Blood",
    fastingRequirement: "No fasting required",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Provides average blood sugar levels over the past 2 to 3 months."
  },
  {
    id: "lft",
    name: "LFT (Liver Function Test)",
    hindiName: "लिवर फंक्शन टेस्ट (LFT)",
    category: "Blood",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Comprehensive panel measuring enzymes, proteins, and bilirubin produced by the liver."
  },
  {
    id: "kft",
    name: "KFT (Kidney Function Test)",
    hindiName: "किडनी फंक्शन टेस्ट (KFT)",
    category: "Blood",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Assesses kidney function through creatinine, urea, and electrolyte parameters."
  },
  {
    id: "lipid-profile",
    name: "Lipid Profile",
    hindiName: "लिपिड प्रोफाइल (कोलेस्ट्रॉल जांच)",
    category: "Blood",
    sampleType: "Blood",
    fastingRequirement: "Fasting required (10-12 hrs)",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Measures cholesterol, HDL, LDL, and triglycerides for cardiovascular risk assessment."
  },
  {
    id: "thyroid-profile",
    name: "Thyroid Profile (T3, T4, TSH)",
    hindiName: "थायराइड प्रोफाइल (T3, T4, TSH)",
    category: "Hormone",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Evaluates thyroid gland activity and hormonal balance."
  },
  {
    id: "widal",
    name: "Widal (Typhoid Test)",
    hindiName: "विडाल (टाइफाइड जांच)",
    category: "Infection",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Serological screening test for enteric typhoid fever."
  },
  {
    id: "malaria-mp",
    name: "Malaria (MP)",
    hindiName: "मलेरिया (MP)",
    category: "Infection",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Detects malarial parasite antigen or slide examination."
  },
  {
    id: "blood-group",
    name: "Blood Group & Rh Factor",
    hindiName: "ब्लड ग्रुप एवं आरएच फैक्टर",
    category: "Blood",
    sampleType: "Blood",
    fastingRequirement: "No fasting needed",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Determines ABO blood group and Rh D antigen."
  },
  {
    id: "hbsag",
    name: "HBsAg (Hepatitis B)",
    hindiName: "HBsAg (हेपेटाइटिस बी)",
    category: "Infection",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Screens for Hepatitis B viral surface antigen."
  },
  {
    id: "vdrl",
    name: "VDRL",
    hindiName: "VDRL जांच",
    category: "Infection",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Serological screening test for treponemal infection."
  },
  {
    id: "hiv",
    name: "HIV 1 & 2 Screening",
    hindiName: "एचआईवी 1 एवं 2 स्क्रीनिंग",
    category: "Infection",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Confidential screening test for antibodies/antigens."
  },
  {
    id: "urine-rm",
    name: "Urine R/M (Routine & Microscopy)",
    hindiName: "यूरिन रूटीन एवं माइक्रोस्कोपी",
    category: "Urine",
    sampleType: "Urine",
    fastingRequirement: "First morning sample preferred",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Detects urinary tract infections, kidney issues, and metabolic conditions."
  },
  {
    id: "upt",
    name: "Urine Pregnancy Test (UPT)",
    hindiName: "यूरिन प्रेग्नेंसी टेस्ट",
    category: "Urine",
    sampleType: "Urine",
    fastingRequirement: "First morning urine preferred",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Rapid qualitative detection of human chorionic gonadotropin (hCG)."
  },
  {
    id: "ra-test",
    name: "RA Test (Rheumatoid Factor)",
    hindiName: "आरए टेस्ट (गठिया जांच)",
    category: "Blood",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Assists in evaluating rheumatoid arthritis and related inflammatory conditions."
  },
  {
    id: "aso-titre",
    name: "ASO Titre",
    hindiName: "एएसओ टिट्रे (ASO Titre)",
    category: "Infection",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Measures antibodies against streptolysin O produced by group A streptococcus."
  },
  {
    id: "mantoux-test",
    name: "Mantoux Test (Tuberculin Skin Test)",
    hindiName: "मान्टोक्स टेस्ट (त्वचा जांच)",
    category: "Infection",
    sampleType: "Intradermal",
    fastingRequirement: "No fasting",
    typicalReportTime: "Confirm with lab (48-72h reading)",
    price: "Confirm with lab",
    description: "Skin test for exposure to Mycobacterium tuberculosis bacteria."
  },
  {
    id: "bt-ct",
    name: "BT-CT (Bleeding & Clotting Time)",
    hindiName: "बीटी-सीटी (BT-CT)",
    category: "Blood",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Measures initial platelet response and coagulation pathway time."
  },
  {
    id: "semen-analysis",
    name: "Semen Analysis",
    hindiName: "सीमेन एनालिसिस",
    category: "Special",
    sampleType: "Semen",
    fastingRequirement: "2-5 days abstinence recommended",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Microscopic evaluation of sperm count, motility, and morphology."
  },
  {
    id: "electrolytes",
    name: "Serum Electrolytes (Na+, K+, Cl-)",
    hindiName: "इलेक्ट्रोलाइट्स (सोडियम, पोटैशियम, क्लोराइड)",
    category: "Blood",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Measures body hydration, acid-base equilibrium, and kidney electrolyte balance."
  },
  {
    id: "platelet-count",
    name: "Platelet Count",
    hindiName: "प्लेटलेट काउंट",
    category: "Blood",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Crucial for viral infections such as dengue and bleeding risk monitoring."
  },
  {
    id: "calcium",
    name: "Serum Calcium",
    hindiName: "सीरम कैल्शियम",
    category: "Blood",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Evaluates bone health, parathyroid function, and neuromuscular activity."
  },
  {
    id: "sputum-afb",
    name: "Sputum for AFB",
    hindiName: "स्पूटम एएफबी (बलगम जांच)",
    category: "Infection",
    sampleType: "Sputum",
    fastingRequirement: "Early morning sputum sample preferred",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Acid-fast bacillus smear microscopy for pulmonary tuberculosis screening."
  },
  {
    id: "tb-gold",
    name: "TB Gold (IGRA)",
    hindiName: "टीबी गोल्ड (TB Gold)",
    category: "Infection",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Interferon-gamma release assay for tuberculosis infection detection."
  },
  {
    id: "blood-urea",
    name: "Blood Urea",
    hindiName: "ब्लड यूरिया",
    category: "Blood",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Assesses nitrogen waste excretion through kidney filtration."
  },
  {
    id: "serum-uric-acid",
    name: "Serum Uric Acid",
    hindiName: "सीरम यूरिक एसिड",
    category: "Blood",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Tests for hyperuricemia, gout, and kidney stone risk."
  },
  {
    id: "serum-creatinine",
    name: "Serum Creatinine",
    hindiName: "सीरम क्रिएटिनिन",
    category: "Blood",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Standard biomarker for glomerular filtration and renal health."
  },
  {
    id: "albumin",
    name: "Serum Albumin",
    hindiName: "सीरम एल्ब्यूमिन",
    category: "Blood",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Measures major circulating protein for nutritional and liver status."
  },
  {
    id: "serum-cholesterol",
    name: "Serum Cholesterol",
    hindiName: "सीरम कोलेस्ट्रॉल",
    category: "Blood",
    sampleType: "Blood",
    fastingRequirement: "Fasting required (10-12 hrs)",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Screening parameter for lipid balance and arterial health."
  },
  {
    id: "biopsy",
    name: "Biopsy / Histopathology",
    hindiName: "बायोप्सी / हिस्टोपैथोलॉजी",
    category: "Special",
    sampleType: "Tissue biopsy",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Pathological examination of surgical or punch biopsy tissue specimens."
  },
  {
    id: "crp-test",
    name: "CRP Test (C-Reactive Protein)",
    hindiName: "सीआरपी टेस्ट (CRP)",
    category: "Infection",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Sensitive marker of acute systemic inflammation and infection."
  },
  {
    id: "vitamin-b12",
    name: "Vitamin B12",
    hindiName: "विटामिन B12",
    category: "Vitamin",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Essential for nerve function, brain health, and red blood cell production."
  },
  {
    id: "vitamin-d",
    name: "Vitamin D (25-Hydroxy)",
    hindiName: "विटामिन D (25-हाइड्रॉक्सी)",
    category: "Vitamin",
    sampleType: "Blood",
    fastingRequirement: "Confirm with lab",
    typicalReportTime: "Confirm with lab",
    price: "Confirm with lab",
    description: "Measures total 25-hydroxyvitamin D for bone and immune support."
  }
];

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: "home-collection",
    title: "Home sample collection",
    hindiTitle: "होम सैंपल कलेक्शन (घर पर जांच)",
    description: "Send a collection request from home and the lab contacts you to confirm details.",
    hindiDescription: "घर से ही सैंपल कलेक्शन का अनुरोध भेजें, लैब कर्मचारी विवरण की पुष्टि के लिए आपसे संपर्क करेंगे।",
    icon: "Home",
    actionText: "Request collection",
    hindiActionText: "कलेक्शन का अनुरोध करें",
    actionHref: "#booking-form"
  },
  {
    id: "lab-testing",
    title: "Laboratory testing",
    hindiTitle: "लैबोरेटरी पैथोलॉजी जांच",
    description: "Contact the lab to ask about available tests and preparation.",
    hindiDescription: "उपलब्ध जांचों, शुल्क एवं आवश्यक तैयारी की जानकारी के लिए लैब से संपर्क करें।",
    icon: "FlaskConical",
    actionText: "Contact lab",
    hindiActionText: "लैब से पूछें",
    actionHref: "tel:+918887790574"
  },
  {
    id: "visit-lab",
    title: "Visit our local lab",
    hindiTitle: "हमारी स्थानीय लैब पर आएं",
    description: "Find us at Bhimpura No. 1, Balauli Road, Ballia.",
    hindiDescription: "भीमपुरा नं. 1, बलौली रोड, बलिया स्थित हमारी लैब में सीधे पधारें।",
    icon: "MapPin",
    actionText: "Get directions",
    hindiActionText: "रास्ता देखें (मैप्स)",
    actionHref: "https://maps.app.goo.gl/mBKgyXy73Zr18qM69?g_st=ac"
  }
];

export const FAQS_DATA: FAQItem[] = [
  {
    question: "Do I need to fast before my test?",
    hindiQuestion: "क्या टेस्ट से पहले भूखे पेट (फास्टिंग) रहना आवश्यक है?",
    answer: "Preparation depends on the test or package. Please call or WhatsApp before collection so the lab can confirm whether fasting or other preparation is needed.",
    hindiAnswer: "जांच की तैयारी टेस्ट अथवा पैकेज के प्रकार पर निर्भर करती है। सैंपल देने से पहले कृपया फोन या व्हाट्सएप पर संपर्क करें ताकि लैब पुष्टि कर सके कि फास्टिंग या अन्य तैयारी आवश्यक है या नहीं।"
  },
  {
    question: "Is home sample collection available?",
    hindiQuestion: "क्या घर पर आकर सैंपल लेने (Home Collection) की सुविधा है?",
    answer: "Yes. Send a request through the website, call, or WhatsApp. The lab will contact you to confirm the test, address, preferred date, and collection details.",
    hindiAnswer: "हाँ। वेबसाइट के माध्यम से अनुरोध भेजें, सीधे कॉल करें अथवा व्हाट्सएप करें। लैब कर्मचारी जांच, पता, सुविधाजनक तिथि और समय की पुष्टि के लिए आपसे संपर्क करेंगे।"
  },
  {
    question: "How much does home collection cost?",
    hindiQuestion: "होम कलेक्शन का क्या शुल्क है?",
    answer: "Any applicable collection charge and total test cost are confirmed by the lab before collection. Individual test prices are not displayed online unless verified.",
    hindiAnswer: "कोई भी लागू होने वाला होम कलेक्शन शुल्क एवं कुल जांच लागत सैंपल लेने से पूर्व लैब द्वारा स्पष्ट बताई जाती है। अलग-अलग टेस्ट की कीमतें सत्यापन के बिना ऑनलाइन प्रदर्शित नहीं की जाती हैं।"
  },
  {
    question: "When will my report be ready?",
    hindiQuestion: "मेरी रिपोर्ट कब तक तैयार हो जाएगी?",
    answer: "Report timing varies by test. The lab confirms expected timing when your request is reviewed.",
    hindiAnswer: "रिपोर्ट तैयार होने का समय प्रत्येक जांच पर निर्भर करता है। जब आपके अनुरोध की समीक्षा होती है, तब लैब अनुमानित समय स्पष्ट करती है।"
  },
  {
    question: "How will I receive my report?",
    hindiQuestion: "मुझे अपनी रिपोर्ट कैसे प्राप्त होगी?",
    answer: "Reports are provided directly through our verified WhatsApp conversation or as a printed physical copy collected from our lab counter at Bhimpura No. 1 after verifying patient details.",
    hindiAnswer: "रिपोर्ट सीधे हमारे सत्यापित व्हाट्सएप पर डिजिटल रूप से अथवा मरीज के विवरण के सत्यापन के बाद भीमपुरा नं. 1 स्थित लैब काउंटर से मुद्रित (हार्डकॉपी) रूप में प्राप्त की जा सकती है।"
  },
  {
    question: "Can I pay online?",
    hindiQuestion: "क्या मैं ऑनलाइन भुगतान कर सकता हूँ?",
    answer: "The four listed preventive packages can be paid through the direct UPI option during booking. Other tests are priced by the lab first and can be paid at the lab.",
    hindiAnswer: "सूचीबद्ध चार प्रिवेंटिव हेल्थ पैकेज का भुगतान बुकिंग के दौरान सीधे UPI विकल्प द्वारा किया जा सकता है। अन्य जांचों की कीमत लैब पहले तय करती है और उनका भुगतान लैब पर किया जा सकता है।"
  }
];

export const BEFORE_TEST_STEPS = [
  {
    number: "01",
    title: "Test confirmed",
    hindiTitle: "जांच एवं तैयारी की पुष्टि",
    text: "The lab reviews your test/package and confirms preparation and collection details.",
    hindiText: "लैब आपके टेस्ट/पैकेज की समीक्षा करती है और आवश्यक तैयारी तथा सैंपल कलेक्शन के विवरण की पुष्टि करती है।"
  },
  {
    number: "02",
    title: "Timing shared",
    hindiTitle: "रिपोर्ट का अपेक्षित समय",
    text: "Expected report timing is shared per selected test, not one fixed time for all.",
    hindiText: "चुने गए टेस्ट के आधार पर रिपोर्ट का अपेक्षित समय बताया जाता है, सभी जांचों के लिए कोई एक निश्चित समय नहीं होता।"
  },
  {
    number: "03",
    title: "Private delivery",
    hindiTitle: "गोपनीय एवं सुरक्षित रिपोर्ट",
    text: "Delivery method confirmed by the lab; private reports are never displayed publicly on this site.",
    hindiText: "डिलीवरी का माध्यम लैब द्वारा सुनिश्चित किया जाता है; आपकी निजी रिपोर्ट इस वेबसाइट पर कभी भी सार्वजनिक नहीं की जाती।"
  }
];

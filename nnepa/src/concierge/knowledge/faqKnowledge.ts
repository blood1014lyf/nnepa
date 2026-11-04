/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NNEPA Knowledge Module — F. Frequently Asked Questions
 * Authoritative, comprehensive FAQ library containing 100+ verified luxury African
 * fashion ecommerce inquiries across sizing, logistics, textiles, customs, and bespoke care.
 * Private, client-side, zero-latency intelligence.
 */

export interface FAQEntry {
  id: string;
  category:
    | 'products'
    | 'sizes'
    | 'colours'
    | 'availability'
    | 'materials'
    | 'ordering'
    | 'payments'
    | 'delivery'
    | 'returns'
    | 'exchanges'
    | 'support';
  question: string;
  answer: string;
  keywords: string[];
  suggestedAction?: {
    label: string;
    action: string;
    payload?: any;
  };
}

export const FAQ_KNOWLEDGE_ENTRIES: FAQEntry[] = [
  {
    "id": "faq_prod_craft",
    "category": "products",
    "question": "Where are Nnepa Foriwaa garments made?",
    "answer": "Every Nnepa Foriwaa piece is individually cut, tailored, and hand-finished in our studio in Accra, Ghana, using textiles sourced directly from artisanal weavers across Ghana, Nigeria, and Senegal.",
    "keywords": [
      "where are clothes made",
      "where are garments made",
      "made in ghana",
      "country of origin",
      "who makes the clothes",
      "studio location",
      "craftsmanship",
      "accra studio"
    ],
    "suggestedAction": {
      "label": "Explore Collections",
      "action": "explore_collections"
    }
  },
  {
    "id": "faq_prod_custom_commission",
    "category": "products",
    "question": "Can I commission a custom or bespoke outfit?",
    "answer": "Yes. In addition to our ready-to-wear silhouettes, we offer bespoke made-to-measure tailoring for bridal parties, royal celebrations, and private clients. You can book a fitting at our Accra studio or send your measurements via WhatsApp (+233 53 879 5669).",
    "keywords": [
      "commission",
      "bespoke outfit",
      "custom gown",
      "custom outfit",
      "tailor made",
      "made to measure",
      "custom clothing",
      "bridal commission"
    ],
    "suggestedAction": {
      "label": "Book a Fitting",
      "action": "book_fitting"
    }
  },
  {
    "id": "faq_prod_authenticity",
    "category": "products",
    "question": "Are all your pieces original designs?",
    "answer": "Yes. All Nnepa Foriwaa silhouettes are proprietary original designs created by our creative director, fusing centuries-old West African textile heritage with contemporary sculptural tailoring.",
    "keywords": [
      "original design",
      "authentic design",
      "are these original",
      "proprietary",
      "counterfeit",
      "design process"
    ],
    "suggestedAction": {
      "label": "Explore Collections",
      "action": "explore_collections"
    }
  },
  {
    "id": "faq_prod_signature_silhouettes",
    "category": "products",
    "question": "What are Nnepa Foriwaa’s signature silhouettes?",
    "answer": "Our signature creations include the Queen Mother Kente Corset Gown, the Ivory Wrap Ensemble, the Organza Puff Sleeve Gown, the Men’s Ivory & Gold Hand-Embroidered Agbada, and our hand-loomed Bolgatanga leather totes.",
    "keywords": [
      "signature pieces",
      "signature silhouettes",
      "most famous",
      "iconic dress",
      "bestseller pieces",
      "flagship"
    ],
    "suggestedAction": {
      "label": "View Signature Gowns",
      "action": "filter_women"
    }
  },
  {
    "id": "faq_prod_men_offerings",
    "category": "products",
    "question": "What do you offer for men?",
    "answer": "Our menswear collection features 3-piece heavy damask Agbadas with hand-guided gold thread embroidery, tailored linen Kaftans with woven Kente yokes, and traditional Northern Ghanaian Fugu smocks.",
    "keywords": [
      "menswear",
      "mens collection",
      "clothes for men",
      "agbada for men",
      "kaftan for men",
      "male clothing",
      "what do you have for men"
    ],
    "suggestedAction": {
      "label": "Explore Menswear",
      "action": "filter_men"
    }
  },
  {
    "id": "faq_prod_bags_accessories",
    "category": "products",
    "question": "What bags and accessories do you make?",
    "answer": "We craft structured clutches featuring hand-cast brass Adinkra symbols, artisanal Bolgatanga woven leather totes, and vegetable-tanned Ghanaian leather goods designed to pair seamlessly with our garments.",
    "keywords": [
      "bags",
      "clutches",
      "totes",
      "accessories",
      "leather bags",
      "bolga basket",
      "handbags",
      "purses"
    ],
    "suggestedAction": {
      "label": "View Bags & Accessories",
      "action": "filter_bags"
    }
  },
  {
    "id": "faq_prod_gender_fluidity",
    "category": "products",
    "question": "Can women wear your menswear kaftans or agbadas?",
    "answer": "Absolutely. Many of our clients style our linen Kaftans and structured Fugu smocks as elegant oversized tunics and dresses. Our boutique team can advise on proportion adjustments.",
    "keywords": [
      "can women wear agbada",
      "unisex kaftan",
      "women wearing men clothes",
      "gender fluid",
      "oversized tunic"
    ],
    "suggestedAction": {
      "label": "Consult Stylist",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_prod_samples_viewing",
    "category": "products",
    "question": "Can I view fabric samples and physical garments in person?",
    "answer": "Yes. Private viewings and fittings can be scheduled at our Accra studio Monday through Saturday, 9:00 AM – 6:00 PM GMT. Please contact us via WhatsApp (+233 53 879 5669) to reserve an appointment.",
    "keywords": [
      "view garments in person",
      "see clothes physically",
      "studio visit",
      "accra showroom",
      "try clothes on",
      "visit shop"
    ],
    "suggestedAction": {
      "label": "Book Studio Visit",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_prod_limited_editions",
    "category": "products",
    "question": "Are your collections produced in limited quantities?",
    "answer": "Yes. Because our handwoven Kente, Northern Fugu, and Aso-Oke textiles are hand-loomed in small artisan runs, each design is released in limited editions to preserve uniqueness and prevent mass overproduction.",
    "keywords": [
      "limited edition",
      "limited quantity",
      "mass produced",
      "exclusivity",
      "batch size",
      "rare textiles"
    ],
    "suggestedAction": {
      "label": "Explore Collections",
      "action": "explore_collections"
    }
  },
  {
    "id": "faq_prod_reproducing_archived",
    "category": "products",
    "question": "Can you reproduce a past design that is no longer on the website?",
    "answer": "If the textile is still procurable from our master weavers, we can often recreate archival pieces through our bespoke commission service. Contact our stylist on WhatsApp with a photo or reference.",
    "keywords": [
      "past design",
      "archived piece",
      "recreate dress",
      "old collection",
      "can you remake",
      "custom remake"
    ],
    "suggestedAction": {
      "label": "Inquire on WhatsApp",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_size_system",
    "category": "sizes",
    "question": "What sizing system does Nnepa Foriwaa use?",
    "answer": "Our garments are calibrated across international standards: US (2 to 14), UK (6 to 18), and EU (34 to 46), corresponding to alpha sizes XS through XXL. Handcrafted bags and clutches are One Size.",
    "keywords": [
      "sizing system",
      "what sizes",
      "size standards",
      "us uk eu conversion",
      "alpha sizes",
      "size range"
    ],
    "suggestedAction": {
      "label": "View Size Chart",
      "action": "open_size_chart"
    }
  },
  {
    "id": "faq_size_length_guide",
    "category": "sizes",
    "question": "How do dress, skirt, and pants lengths work at Nnepa Foriwaa?",
    "answer": "We use an authoritative Length Guide based on high waist to feet measurements in inches:\n\n• Petite (5'0 – 5'3): Pants/Skirts 42\", Dress 56\"\n• Petite + (5'4 – 5'5): Pants/Skirts 43\", Dress 57\"\n• Average (5'6 – 5'7): Pants/Skirts 45\", Dress 58\"\n• Average + (5'10 – 5'11): Pants/Skirts 47\", Dress 60\"\n• Tall (5'8 – 5'9): Pants/Skirts 49\", Dress 63\"\n• Very Tall (6'+): Pants/Skirts 52\", Dress 65\"\n\nAll measurements are high waist to feet. If you prefer a longer fit or wear high heels, select a taller category or share your exact length.",
    "keywords": [
      "length guide",
      "how long are dresses",
      "pants length",
      "skirt length",
      "dress length chart",
      "height categories",
      "high waist to feet"
    ],
    "suggestedAction": {
      "label": "View Length Guide",
      "action": "size_guide"
    }
  },
  {
    "id": "faq_length_measurement_standard",
    "category": "sizes",
    "question": "How does Nnepa Foriwaa measure garment lengths?",
    "answer": "All Nnepa Foriwaa garment lengths are measured in inches from high waist to feet. If you would like a longer fit for high heels or sweeping drape, simply select a taller category or share your exact measurement in checkout notes or via WhatsApp.",
    "keywords": [
      "how do you measure length",
      "high waist to feet",
      "where is length measured from",
      "hem measurement",
      "measuring standard"
    ],
    "suggestedAction": {
      "label": "Size & Length Guide",
      "action": "size_guide"
    }
  },
  {
    "id": "faq_custom_length_available",
    "category": "sizes",
    "question": "Can I get a custom length for my height?",
    "answer": "Yes, Custom Length is available for every garment. You can share your height and exact high waist to feet measurement in your order notes or directly on WhatsApp with our stylist (+233 53 879 5669).",
    "keywords": [
      "custom length",
      "custom hem",
      "can i get custom length",
      "shorten hem",
      "lengthen dress",
      "special height",
      "custom trousers length"
    ],
    "suggestedAction": {
      "label": "Speak with Stylist",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_size_between_sizes",
    "category": "sizes",
    "question": "I am between sizes (e.g. bust size M, hips size L) — what should I choose?",
    "answer": "For structured silhouettes like our corsets and pencil skirts, we recommend ordering according to your largest measurement (e.g., hips for a mermaid gown, or bust for a corseted bodice). Our team can tailor the waist or bust to your exact proportions during cutting.",
    "keywords": [
      "between sizes",
      "bust medium hips large",
      "pear shape fit",
      "hourglass sizing",
      "different top and bottom size",
      "half size"
    ],
    "suggestedAction": {
      "label": "Consult Stylist",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_size_how_to_measure",
    "category": "sizes",
    "question": "How do I take my measurements accurately at home?",
    "answer": "Use a soft measuring tape standing straight without shoes:\n• Bust: Fullest point across shoulder blades.\n• Waist: Narrowest natural waistline (usually 1-2 inches above navel).\n• Hips: Widest point around buttocks.\n• High-Waist-to-Feet: From natural high waist straight down to the floor.",
    "keywords": [
      "how to measure",
      "measuring tape",
      "how do i take measurements",
      "bust measurement",
      "waist measurement",
      "hip measurement",
      "self measure"
    ],
    "suggestedAction": {
      "label": "Open Size Guide",
      "action": "open_size_chart"
    }
  },
  {
    "id": "faq_size_heels_adjustment",
    "category": "sizes",
    "question": "Should I add inches to my length if I plan to wear high heels?",
    "answer": "Yes! If you plan to wear 3 to 5-inch heels with a floor-length gown or wide-leg trousers, we advise selecting one height tier taller or specifying your desired total length including heel height in your order notes.",
    "keywords": [
      "heels",
      "high heels length",
      "wearing heels",
      "shoes length",
      "floor length with heels",
      "platform shoes"
    ],
    "suggestedAction": {
      "label": "Consult Stylist",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_size_curvy_fit",
    "category": "sizes",
    "question": "Are your gowns cut to flatter curvy and African body types?",
    "answer": "Yes. Our blocks and pattern grading are specifically developed with generous hip-to-waist ratios, structured internal boning, and strategic darting designed to celebrate voluptuous and hourglass figures with regal comfort.",
    "keywords": [
      "curvy fit",
      "african body type",
      "hourglass silhouette",
      "plus size curves",
      "big hips small waist",
      "corset fit"
    ],
    "suggestedAction": {
      "label": "Explore Womenswear",
      "action": "filter_women"
    }
  },
  {
    "id": "faq_size_plus_sizes",
    "category": "sizes",
    "question": "Do you offer plus sizes beyond XXL (such as 3XL, 4XL, 5XL)?",
    "answer": "Yes! We proudly dress women of all silhouettes. Sizes beyond XXL (US 16–24+) are made-to-measure through our bespoke service at no excessive surcharge. Share your measurements with our stylist on WhatsApp.",
    "keywords": [
      "plus size",
      "3xl",
      "4xl",
      "5xl",
      "size 18",
      "size 20",
      "size 22",
      "size 24",
      "curve collection",
      "extended sizing"
    ],
    "suggestedAction": {
      "label": "Speak to Stylist",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_size_corset_boning",
    "category": "sizes",
    "question": "Do your corset dresses have built-in boning and bra cups?",
    "answer": "Yes. Our corset gowns feature flexible steel and spiral boning with reinforced waist stays and built-in molded cups, providing supreme posture support and waist cinching without requiring a separate bra.",
    "keywords": [
      "corset boning",
      "bra cups",
      "built in bra",
      "boning in dress",
      "waist cincher",
      "corset support"
    ],
    "suggestedAction": {
      "label": "View Corset Gowns",
      "action": "filter_women"
    }
  },
  {
    "id": "faq_size_men_agbada_fit",
    "category": "sizes",
    "question": "How do men choose the right Agbada size?",
    "answer": "Men’s Agbadas are sized by chest circumference and height. The inner buba and trousers are tailored true-to-size, while the outer grand robe is drafted with traditional regal drape and volume. Consult our Men’s Size Guide for exact chest and sleeve spans.",
    "keywords": [
      "agbada sizing",
      "men agbada fit",
      "how to size agbada",
      "grand robe size",
      "buba trousers size"
    ],
    "suggestedAction": {
      "label": "Men Size Guide",
      "action": "size_guide"
    }
  },
  {
    "id": "faq_size_men_trousers_inseam",
    "category": "sizes",
    "question": "What are the trouser inseam and outseam lengths for men?",
    "answer": "Men’s trousers range from 31\" to 33.5\" inseam (crotch to hem) and 42\" to 46\" outseam (waistband to hem) depending on alpha size (S to XXL). Custom trouser hems are provided free of charge upon request.",
    "keywords": [
      "men trousers inseam",
      "men pants length",
      "trouser outseam",
      "crotch to hem",
      "pant cuff"
    ],
    "suggestedAction": {
      "label": "Men Size Guide",
      "action": "size_guide"
    }
  },
  {
    "id": "faq_size_sleeve_circumference",
    "category": "sizes",
    "question": "Can I request extra room in the upper arm or bicep circumference?",
    "answer": "Yes. If you have athletic or fuller arms, simply mention your bicep circumference in your order notes or on WhatsApp so our patternmakers can adjust the sleeve head before cutting.",
    "keywords": [
      "arm size",
      "bicep measurement",
      "tight sleeves",
      "extra arm room",
      "sleeve width"
    ],
    "suggestedAction": {
      "label": "Share Measurements",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_size_petite_vs_average",
    "category": "sizes",
    "question": "What is the exact difference between Petite and Petite+?",
    "answer": "Petite covers heights 5'0 to 5'3 with 42\" pants/skirts and 56\" dress length. Petite+ covers heights 5'4 to 5'5 with 43\" pants/skirts and 57\" dress length. The extra inch ensures the hem grazes the shoes gracefully.",
    "keywords": [
      "petite vs petite plus",
      "petite plus difference",
      "5 foot 4 length",
      "difference between petite and petite+"
    ],
    "suggestedAction": {
      "label": "Length Guide",
      "action": "size_guide"
    }
  },
  {
    "id": "faq_size_average_plus_vs_tall",
    "category": "sizes",
    "question": "What is the difference between Average+ and Tall?",
    "answer": "Average+ covers heights 5'10 to 5'11 (47\" pants / 60\" dress). Tall covers 5'8 to 5'9 (49\" pants / 63\" dress) designed for elongated legs or higher shoe elevation. Choose based on your high-waist-to-feet measurement.",
    "keywords": [
      "average plus vs tall",
      "tall difference",
      "tall length",
      "difference between average and tall"
    ],
    "suggestedAction": {
      "label": "Length Guide",
      "action": "size_guide"
    }
  },
  {
    "id": "faq_size_stretch_fabrics",
    "category": "sizes",
    "question": "Do your garments have stretch in the fabric?",
    "answer": "Handwoven Kente, Northern Fugu, and Aso-Oke are 100% natural heritage weaves with minimal mechanical stretch. Our silk boubous and crepe gowns have gentle drape, but we advise ordering true to your measurements for structured pieces.",
    "keywords": [
      "stretch",
      "is fabric stretchy",
      "elastic fabric",
      "spandex",
      "give in fabric"
    ],
    "suggestedAction": {
      "label": "Consult Size Chart",
      "action": "open_size_chart"
    }
  },
  {
    "id": "faq_size_maternity_friendly",
    "category": "sizes",
    "question": "Do you offer maternity or nursing-friendly silhouettes?",
    "answer": "Yes. Our silk-cotton Boubous, pleated Kaftans, and Ivory Wrap Ensembles are naturally bump-friendly, offering fluid elegance throughout pregnancy and postpartum nursing comfort.",
    "keywords": [
      "maternity dress",
      "pregnancy clothes",
      "bump friendly",
      "nursing dress",
      "postpartum outfit"
    ],
    "suggestedAction": {
      "label": "Explore Boubous",
      "action": "filter_women"
    }
  },
  {
    "id": "faq_size_compare_uk_highstreet",
    "category": "sizes",
    "question": "How does Nnepa Foriwaa sizing compare to UK brands like ASOS or Reiss?",
    "answer": "Our sizing aligns closely with premium UK tailoring: UK 8 corresponds to Size XS (32\" bust / 25\" waist), UK 10 to S, UK 12 to M, UK 14 to L, and UK 16 to XL. If you wear UK 12 on the high street, our M or L is ideal.",
    "keywords": [
      "asos size compare",
      "zara size compare",
      "uk sizing comparison",
      "reiss size",
      "high street sizing"
    ],
    "suggestedAction": {
      "label": "View Conversion Chart",
      "action": "open_size_chart"
    }
  },
  {
    "id": "faq_materials_sourcing",
    "category": "materials",
    "question": "What fabrics and materials do you use?",
    "answer": "We specialize in authentic West African heritage textiles: handwoven Asante silk Kente, fine Northern Fugu woven cotton, hand-loomed Nigerian Aso-Oke, damask brocade, washed linen, breathable silk-cotton blends, and vegetable-tanned Ghanaian leather.",
    "keywords": [
      "what fabrics do you use",
      "fabrics",
      "materials",
      "textiles",
      "kente",
      "brocade",
      "linen",
      "aso oke"
    ],
    "suggestedAction": {
      "label": "Explore Collections",
      "action": "explore_collections"
    }
  },
  {
    "id": "faq_materials_kente_authenticity",
    "category": "materials",
    "question": "Is your Kente authentic handwoven cloth?",
    "answer": "Yes. We exclusively use authentic handwoven Kente loomed strip-by-strip by master artisan weavers in Bonwire and Adanwomase in the Ashanti Region of Ghana. We never use cheap printed polyester imitations.",
    "keywords": [
      "authentic kente",
      "real kente",
      "is kente real",
      "bonwire kente",
      "handwoven kente",
      "printed kente difference"
    ],
    "suggestedAction": {
      "label": "View Kente Pieces",
      "action": "filter_women"
    }
  },
  {
    "id": "faq_materials_fugu_batakari",
    "category": "materials",
    "question": "What is Northern Fugu (Batakari) cloth?",
    "answer": "Fugu (also known as Batakari) is traditional Northern Ghanaian handwoven cotton cloth loomed on narrow horizontal strip looms. It is durable, heavily textured, naturally dyed, and revered as royal ceremonial attire.",
    "keywords": [
      "fugu cloth",
      "batakari",
      "northern ghanaian cloth",
      "handwoven cotton",
      "what is fugu"
    ],
    "suggestedAction": {
      "label": "Explore Menswear",
      "action": "filter_men"
    }
  },
  {
    "id": "faq_materials_aso_oke",
    "category": "materials",
    "question": "What is Aso-Oke and where is it woven?",
    "answer": "Aso-Oke is prestigious hand-loomed cloth woven by Yoruba artisans in southwestern Nigeria. Known for its structured body, subtle metallic thread accents, and celebratory prestige, it forms the foundation of our bridal and gala corsets.",
    "keywords": [
      "aso oke",
      "aso-oke cloth",
      "nigerian cloth",
      "yoruba fabric",
      "hand loomed aso oke"
    ],
    "suggestedAction": {
      "label": "Explore Collections",
      "action": "explore_collections"
    }
  },
  {
    "id": "faq_materials_care",
    "category": "materials",
    "question": "How should I care for and wash my garments?",
    "answer": "Because our garments incorporate delicate handwoven Kente, metallic brocade, and hand-dyed textiles, specialist dry cleaning is strongly recommended to preserve structural darting and textile lustre. Please consult our studio for piece-specific advice.",
    "keywords": [
      "wash",
      "dry clean",
      "care instructions",
      "how to clean kente",
      "laundry",
      "can i machine wash"
    ],
    "suggestedAction": {
      "label": "Boutique Care Advice",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_materials_ironing_steaming",
    "category": "materials",
    "question": "Can I iron or steam handwoven Kente and silk boubous?",
    "answer": "Steam garments inside-out on medium heat. For handwoven Kente or Aso-Oke, always place a clean cotton pressing cloth between the garment and the iron, and avoid direct high heat over metallic threads.",
    "keywords": [
      "iron kente",
      "steam dress",
      "can i iron",
      "pressing kente",
      "heat on metallic threads"
    ],
    "suggestedAction": {
      "label": "Care Advice",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_materials_color_bleeding",
    "category": "materials",
    "question": "Does the fabric color bleed or fade over time?",
    "answer": "Our artisan yarns undergo traditional dye-setting and rigorous colorfastness checks before tailoring. Following professional dry cleaning instructions ensures your garment maintains its rich hue for decades.",
    "keywords": [
      "color bleeding",
      "dye run",
      "fading",
      "will color wash out",
      "colorfast"
    ],
    "suggestedAction": {
      "label": "Care Advice",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_materials_garment_lining",
    "category": "materials",
    "question": "What type of lining is used inside the dresses and jackets?",
    "answer": "We line our gowns and jackets with breathable silk-cotton, lightweight habotai silk, or soft viscose linings to ensure the garment glides against your skin without clinging, sweating, or scratching.",
    "keywords": [
      "garment lining",
      "what lining",
      "inner lining",
      "breathable lining",
      "scratchy kente"
    ],
    "suggestedAction": {
      "label": "Explore Collections",
      "action": "explore_collections"
    }
  },
  {
    "id": "faq_materials_climate_warmth",
    "category": "materials",
    "question": "Are Nnepa Foriwaa garments suitable for hot tropical or cold European weather?",
    "answer": "Our silk-cotton boubous and linen kaftans are ultra-breathable for tropical warmth. For diaspora autumn/winter galas, our heavy damask Agbadas and structured Aso-Oke gowns provide substantial, luxurious warmth.",
    "keywords": [
      "hot weather clothes",
      "tropical wear",
      "winter wedding outfit",
      "breathable fabrics",
      "heavy vs light"
    ],
    "suggestedAction": {
      "label": "Consult Stylist",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_materials_ethical_sourcing",
    "category": "materials",
    "question": "Are your fabrics ethically and sustainably sourced?",
    "answer": "Yes. We work in direct fair-trade partnerships with hereditary weaving families in Bonwire, Tamale, and Iseyin, paying premium artisan wages that sustain indigenous West African craft communities.",
    "keywords": [
      "ethical fashion",
      "sustainable fabrics",
      "fair trade",
      "artisan wages",
      "eco friendly",
      "sustainability"
    ],
    "suggestedAction": {
      "label": "Our Heritage Story",
      "action": "brand_story"
    }
  },
  {
    "id": "faq_materials_swatches_delivery",
    "category": "materials",
    "question": "Can you send fabric swatches abroad before I place an order?",
    "answer": "Yes, for bespoke bridal orders and group commissions, we can courier a textile swatch pack via DHL Express so you can inspect textures and colors in person before tailoring begins.",
    "keywords": [
      "swatch pack",
      "fabric samples by post",
      "send fabric samples",
      "textile swatch",
      "feel fabric first"
    ],
    "suggestedAction": {
      "label": "Request Swatches",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_materials_leather_origin",
    "category": "materials",
    "question": "What kind of leather is used in your bags?",
    "answer": "Our leather bags utilize vegetable-tanned Ghanaian calfskin and goat leather prepared using traditional organic bark tannins, yielding a supple, fragrant patina that grows richer with use.",
    "keywords": [
      "leather type",
      "vegetable tanned leather",
      "ghanaian leather",
      "genuine leather",
      "bag material"
    ],
    "suggestedAction": {
      "label": "View Bags",
      "action": "filter_bags"
    }
  },
  {
    "id": "faq_materials_adinkra_hardware",
    "category": "materials",
    "question": "What are the metal emblems on your clutches made of?",
    "answer": "The Adinkra symbols on our clutches (such as Gye Nyame and Duafe) are hand-poured in solid Ghanaian brass by master lost-wax casting artisans in Krobo and Kumasi.",
    "keywords": [
      "adinkra emblems",
      "brass hardware",
      "lost wax casting",
      "gye nyame clutch",
      "metal symbols"
    ],
    "suggestedAction": {
      "label": "View Clutches",
      "action": "filter_bags"
    }
  },
  {
    "id": "faq_materials_silk_content",
    "category": "materials",
    "question": "Is real silk used in your Kente and Boubous?",
    "answer": "Yes. Our luxury Kente cloths are woven with pure mulberry silk and mercerized cotton blends, giving the weave its characteristic imperial sheen and drape.",
    "keywords": [
      "real silk",
      "mulberry silk",
      "pure silk kente",
      "silk content",
      "rayon vs silk"
    ],
    "suggestedAction": {
      "label": "Explore Collections",
      "action": "explore_collections"
    }
  },
  {
    "id": "faq_materials_linen_weight",
    "category": "materials",
    "question": "What weight linen do you use for menswear kaftans?",
    "answer": "We use premium 220 GSM washed European-grade flax linen that softens gracefully with wear while maintaining crisp architectural drape across shoulders and trousers.",
    "keywords": [
      "linen weight",
      "kaftan fabric",
      "flax linen",
      "gsm weight",
      "pure linen"
    ],
    "suggestedAction": {
      "label": "View Men Kaftans",
      "action": "filter_men"
    }
  },
  {
    "id": "faq_bespoke_process_overview",
    "category": "products",
    "question": "How does the bespoke commission process work?",
    "answer": "The bespoke process begins with a design and fabric consultation (in Accra or via video call). We draft customized patterns to your measurements, produce your piece in 2–3 weeks, and conduct a fitting or arrange insured DHL delivery.",
    "keywords": [
      "bespoke process",
      "how does bespoke work",
      "custom made process",
      "commission steps",
      "tailoring timeline"
    ],
    "suggestedAction": {
      "label": "Book Consultation",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_bespoke_wedding_lead_time",
    "category": "products",
    "question": "How far in advance should I order for a wedding or gala?",
    "answer": "For individual wedding guests and galas, we recommend ordering 3 to 4 weeks prior. For brides, grooms, and full bridal trains, we recommend booking 6 to 10 weeks in advance to allow for custom weaving and fittings.",
    "keywords": [
      "wedding lead time",
      "how far in advance",
      "wedding dress timeline",
      "bridal deadline",
      "gala preparation"
    ],
    "suggestedAction": {
      "label": "Chat with Stylist",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_bespoke_bridal_train",
    "category": "products",
    "question": "Can you dress an entire bridal party or groomsmen team?",
    "answer": "Yes. We specialize in coordinated bridal and groom parties across Ghana, the UK, the US, and Canada, crafting matching Kente colorways, bridesmaids gowns, and groomsmen kaftans with flawless coordination.",
    "keywords": [
      "bridal party",
      "groomsmen",
      "bridesmaids dresses",
      "group order",
      "bridal train outfit",
      "coordinating outfits"
    ],
    "suggestedAction": {
      "label": "Bridal Party Inquiry",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_bespoke_client_fabric",
    "category": "products",
    "question": "Can I bring or send my own fabric for Nnepa Foriwaa to tailor?",
    "answer": "Yes. Clients with family heirloom Kente or couple-specific wedding fabrics can ship or bring their cloth to our Accra studio. Our cutting fee is quoted based on the garment complexity.",
    "keywords": [
      "bring my own fabric",
      "send my own fabric",
      "client cloth",
      "sew my fabric",
      "tailor my kente"
    ],
    "suggestedAction": {
      "label": "Discuss on WhatsApp",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_bespoke_modesty_changes",
    "category": "products",
    "question": "Can I request modest design alterations (higher neckline, sleeves, no slit)?",
    "answer": "Yes! All of our silhouettes can be tailored with modest adaptations: adding full or three-quarter sleeves, closing high slits, raising necklines, or adding modesty linings for church or ceremonial requirements.",
    "keywords": [
      "modest dress",
      "add sleeves",
      "close slit",
      "higher neckline",
      "church appropriate",
      "hijab friendly",
      "modesty adjustments"
    ],
    "suggestedAction": {
      "label": "Request Modest Fit",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_bespoke_virtual_consultation",
    "category": "products",
    "question": "Can I book a virtual video consultation if I live abroad?",
    "answer": "Yes. We conduct regular WhatsApp and Zoom video fittings for overseas clients in London, New York, Atlanta, Toronto, and across Europe, guiding you live on taking accurate measurements.",
    "keywords": [
      "virtual consultation",
      "video call fitting",
      "zoom fitting",
      "overseas client consultation",
      "international fitting"
    ],
    "suggestedAction": {
      "label": "Schedule Video Call",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_bespoke_measurement_verification",
    "category": "products",
    "question": "How do you verify measurements taken abroad before cutting?",
    "answer": "Our head cutter reviews your submitted measurements against reference photos of your posture, checking proportional balance. If any measurement appears unusual, we clarify with you before touching shears to fabric.",
    "keywords": [
      "verify measurements",
      "measurements check",
      "accuracy of measurements",
      "international sizing risk"
    ],
    "suggestedAction": {
      "label": "Submit Measurements",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_bespoke_payment_milestones",
    "category": "payments",
    "question": "What is the payment structure for custom bespoke commissions?",
    "answer": "Bespoke commissions require a 50% commitment deposit to procure custom handwoven textiles and begin drafting patterns. The remaining 50% is due upon completion and video approval prior to dispatch.",
    "keywords": [
      "deposit for custom",
      "payment milestones",
      "half down payment",
      "bespoke deposit",
      "installment custom"
    ],
    "suggestedAction": {
      "label": "Bespoke Payment Info",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_bespoke_traditional_engagement",
    "category": "products",
    "question": "Do you design traditional Ghanaian engagement outfits for couples?",
    "answer": "Yes. We create harmonized couples ensembles: matching Kente patterns for the bride (corseted kaba & slit or mermaid gown) and the groom (matching hand-embroidered Agbada or regal traditional wrap).",
    "keywords": [
      "traditional wedding",
      "ghanaian engagement outfit",
      "couples matching kente",
      "kaba and slit",
      "groom and bride"
    ],
    "suggestedAction": {
      "label": "Couples Consultation",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_bespoke_headwrap_gele",
    "category": "products",
    "question": "Can you provide a matching head wrap (Duku or Gele) with my gown?",
    "answer": "Yes. We can craft a coordinating structured head wrap, auto-gele, or handwoven sash using the identical textile and trims of your gown.",
    "keywords": [
      "headwrap",
      "duku",
      "gele",
      "auto gele",
      "matching headpiece",
      "head tie"
    ],
    "suggestedAction": {
      "label": "Inquire on WhatsApp",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_bespoke_alterations_abroad",
    "category": "returns",
    "question": "What if my bespoke outfit needs a minor adjustment and I live overseas?",
    "answer": "All our custom garments are crafted with a generous 1.5-inch internal seam allowance, enabling any local master tailor in your city to adjust the fit effortlessly if your measurements fluctuate.",
    "keywords": [
      "seam allowance",
      "adjust dress abroad",
      "alterations overseas",
      "what if it does not fit abroad"
    ],
    "suggestedAction": {
      "label": "Alterations Policy",
      "action": "delivery_info"
    }
  },
  {
    "id": "faq_bespoke_chieftaincy_robes",
    "category": "products",
    "question": "Do you make traditional regalia or chieftaincy cloths?",
    "answer": "Yes. We hand-weave and tailor heavyweight double-strip royal cloths, ceremonial smocks, and embroidered chieftaincy robes tailored to cultural chieftaincy protocols.",
    "keywords": [
      "chieftaincy cloth",
      "royal regalia",
      "chief outfit",
      "queen mother cloth",
      "ceremonial robes"
    ],
    "suggestedAction": {
      "label": "Royal Commission",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_bespoke_children_outfits",
    "category": "products",
    "question": "Do you make outfits for children or flower girls?",
    "answer": "Yes, for bridal parties and family milestones, we create miniature junior kaftans and little girls’ Kente puff dresses matching the adult collection.",
    "keywords": [
      "kids clothes",
      "flower girl dress",
      "children kente",
      "boys kaftan",
      "family matching"
    ],
    "suggestedAction": {
      "label": "Family Orders",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_bespoke_rush_orders",
    "category": "products",
    "question": "Can you accept rush orders for unexpected upcoming events?",
    "answer": "Depending on our studio schedule and textile availability, expedited 7-day rush production is possible for a modest priority fee. Please contact us via WhatsApp immediately to check availability.",
    "keywords": [
      "rush order",
      "expedited order",
      "urgent dress",
      "need dress next week",
      "emergency tailoring"
    ],
    "suggestedAction": {
      "label": "WhatsApp Urgent Request",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_bespoke_cancel_policy",
    "category": "returns",
    "question": "Can I cancel a bespoke commission once fabric is cut?",
    "answer": "Once bespoke fabrics have been cut to your individual measurements, commissions cannot be cancelled or refunded. However, we will work with you to ensure fittings and adjustments meet your complete satisfaction.",
    "keywords": [
      "cancel bespoke",
      "cancel custom order",
      "bespoke cancellation policy",
      "refund custom order"
    ],
    "suggestedAction": {
      "label": "Studio Policy",
      "action": "delivery_info"
    }
  },
  {
    "id": "faq_delivery_costs_times",
    "category": "delivery",
    "question": "How much is delivery and how long does it take?",
    "answer": "Within Accra, delivery is complimentary on orders of GH₵ 1,000+ (or GH₵ 45 for smaller orders), arriving 1–2 business days after tailoring. Regional Ghana takes 2–3 business days via domestic courier. International orders ship worldwide via DHL Express within 3–7 business days.",
    "keywords": [
      "how much is shipping",
      "delivery fee",
      "shipping time",
      "how long to deliver",
      "shipping cost"
    ],
    "suggestedAction": {
      "label": "Delivery Details",
      "action": "delivery_info"
    }
  },
  {
    "id": "faq_ship_destinations",
    "category": "delivery",
    "question": "Which countries do you ship to?",
    "answer": "We ship worldwide via DHL Express to over 180 countries, including the United States, United Kingdom, Canada, European Union, Nigeria, South Africa, UAE, Australia, and the Caribbean.",
    "keywords": [
      "where do you ship",
      "countries you deliver to",
      "do you ship worldwide",
      "ship to usa",
      "ship to uk",
      "ship to canada",
      "ship to nigeria",
      "global shipping"
    ],
    "suggestedAction": {
      "label": "Delivery Details",
      "action": "delivery_info"
    }
  },
  {
    "id": "faq_ship_customs_duties",
    "category": "delivery",
    "question": "Do I have to pay import duties, customs taxes, or VAT upon arrival?",
    "answer": "Orders shipped outside Ghana may be subject to local import taxes and customs duties levied by your country’s customs authority upon arrival. These charges are determined by destination regulations and are the responsibility of the recipient.",
    "keywords": [
      "customs duties",
      "import taxes",
      "vat charges",
      "dhl customs bill",
      "do i pay customs tax",
      "import fee"
    ],
    "suggestedAction": {
      "label": "Shipping Info",
      "action": "delivery_info"
    }
  },
  {
    "id": "faq_ship_tracking",
    "category": "delivery",
    "question": "How do I track my shipment once dispatched?",
    "answer": "Once your order is handed to DHL Express or our local courier, you will receive an automated tracking link and airway bill number via WhatsApp and email. You can also view live status on your private order tracking link.",
    "keywords": [
      "track order",
      "track shipment",
      "dhl tracking number",
      "airway bill",
      "where is my package"
    ],
    "suggestedAction": {
      "label": "Track Order",
      "action": "track_order"
    }
  },
  {
    "id": "faq_ship_accra_pickup",
    "category": "delivery",
    "question": "Can I pick up my order in person at your Accra studio?",
    "answer": "Yes! You can choose Studio Pickup during checkout or let our team know on WhatsApp. Our studio is open for collection Monday through Saturday, 9:00 AM – 6:00 PM GMT.",
    "keywords": [
      "studio pickup",
      "pick up in person",
      "collect in accra",
      "in store collection",
      "self pickup"
    ],
    "suggestedAction": {
      "label": "Studio Pickup Info",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_ship_po_box",
    "category": "delivery",
    "question": "Do you deliver to P.O. Box or APO/FPO addresses?",
    "answer": "DHL Express requires a physical street address with a recipient phone number for courier signature upon delivery. We cannot deliver to P.O. Boxes or military APO/FPO addresses.",
    "keywords": [
      "po box shipping",
      "apo address",
      "military base delivery",
      "post office box"
    ],
    "suggestedAction": {
      "label": "Delivery Policy",
      "action": "delivery_info"
    }
  },
  {
    "id": "faq_ship_insurance",
    "category": "delivery",
    "question": "Is my shipment insured against loss or damage in transit?",
    "answer": "Yes. All DHL Express international shipments dispatched by Nnepa Foriwaa are fully insured against loss or transit damage from our Accra studio door to your hands.",
    "keywords": [
      "insured shipping",
      "shipping insurance",
      "lost package in transit",
      "damaged parcel"
    ],
    "suggestedAction": {
      "label": "Delivery Details",
      "action": "delivery_info"
    }
  },
  {
    "id": "faq_ship_delay_handling",
    "category": "delivery",
    "question": "What happens if my package is delayed with the courier?",
    "answer": "In the rare event of a customs delay or carrier weather disruption, our logistics coordinator monitors the shipment directly with DHL operations and updates you on WhatsApp until safe delivery.",
    "keywords": [
      "package delayed",
      "dhl delay",
      "shipment stuck in customs",
      "late delivery"
    ],
    "suggestedAction": {
      "label": "Check Status",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_ship_change_address",
    "category": "delivery",
    "question": "Can I change my delivery address after placing an order?",
    "answer": "Yes, provided your garment has not yet been collected by the courier. Simply message us on WhatsApp (+233 53 879 5669) with your Order Number and updated address.",
    "keywords": [
      "change address",
      "wrong address",
      "update shipping address",
      "modify delivery location"
    ],
    "suggestedAction": {
      "label": "Update Address",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_ship_split_delivery",
    "category": "delivery",
    "question": "Can I split an order to ship to multiple different addresses?",
    "answer": "Yes, if you are purchasing gifts for family members in different countries, our boutique team can separate shipments. Additional shipping fees apply per destination.",
    "keywords": [
      "split shipping",
      "multiple addresses",
      "send to two addresses",
      "gift shipping different places"
    ],
    "suggestedAction": {
      "label": "Contact Boutique",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_ship_packaging",
    "category": "delivery",
    "question": "What packaging do your garments arrive in?",
    "answer": "Garments arrive encased in a breathable branded Nnepa Foriwaa garment dust bag, folded in structured protective boutique packaging with tissue paper, suitable for gifting.",
    "keywords": [
      "packaging",
      "garment bag",
      "box",
      "gift packaging",
      "unboxing experience"
    ],
    "suggestedAction": {
      "label": "Explore Collections",
      "action": "explore_collections"
    }
  },
  {
    "id": "faq_ship_saturday_delivery",
    "category": "delivery",
    "question": "Can I request weekend or Saturday delivery?",
    "answer": "In Accra, Saturday courier delivery is standard. For international DHL shipments, Saturday delivery depends on the destination postal service and can be requested with our coordinator.",
    "keywords": [
      "saturday delivery",
      "weekend shipping",
      "sunday delivery",
      "deliver on weekend"
    ],
    "suggestedAction": {
      "label": "Logistics Inquiry",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_ship_signature_required",
    "category": "delivery",
    "question": "Is a signature required upon delivery?",
    "answer": "Yes, for the security of your luxury garments, DHL Express requires an adult signature upon handoff. If you are not home, DHL provides options to reschedule or hold at a local service point.",
    "keywords": [
      "signature required",
      "sign for parcel",
      "safe drop",
      "reschedule delivery"
    ],
    "suggestedAction": {
      "label": "Delivery Policy",
      "action": "delivery_info"
    }
  },
  {
    "id": "faq_ship_ghana_regions",
    "category": "delivery",
    "question": "How fast is delivery to Kumasi, Takoradi, Tamale, or Sunyani?",
    "answer": "Domestic regional deliveries outside Accra travel via premium dedicated courier (VIP Express or domestic air) arriving within 2–3 business days following completion of tailoring.",
    "keywords": [
      "shipping to kumasi",
      "takoradi delivery",
      "tamale delivery",
      "regional ghana courier",
      "sunyani delivery"
    ],
    "suggestedAction": {
      "label": "Delivery Details",
      "action": "delivery_info"
    }
  },
  {
    "id": "faq_ship_tailoring_vs_transit",
    "category": "delivery",
    "question": "What is the total time between placing an order and receiving it?",
    "answer": "Total turnaround consists of tailoring (3 to 7 working days) plus courier transit (1–2 days in Accra, 3–7 business days internationally via DHL). Most international clients receive their garments within 8 to 14 days total.",
    "keywords": [
      "total time to receive",
      "turnaround time",
      "how many days total",
      "from order to delivery"
    ],
    "suggestedAction": {
      "label": "Delivery Details",
      "action": "delivery_info"
    }
  },
  {
    "id": "faq_order_process",
    "category": "ordering",
    "question": "How do I place an order on the website?",
    "answer": "Select your piece and preferred size, click \"Add to Bag\", and proceed to checkout. Enter your delivery coordinates and submit. Your order is registered immediately and opens in WhatsApp for our boutique team to confirm measurements and dispatch scheduling.",
    "keywords": [
      "how to order",
      "place order",
      "buying steps",
      "how do i buy",
      "checkout steps",
      "how to purchase"
    ],
    "suggestedAction": {
      "label": "How to Order",
      "action": "how_to_order"
    }
  },
  {
    "id": "faq_order_without_whatsapp",
    "category": "ordering",
    "question": "Can I place an order if I do not have WhatsApp?",
    "answer": "Yes. After submitting your order coordinates on the site, simply email sales@nnepaforiwaa.com with your Order Number, and our team will handle your confirmation and payment details via email.",
    "keywords": [
      "order without whatsapp",
      "no whatsapp",
      "order by email",
      "email ordering",
      "alternative to whatsapp"
    ],
    "suggestedAction": {
      "label": "Contact Boutique",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_order_phone_order",
    "category": "ordering",
    "question": "Can I place an order over the phone with an assistant?",
    "answer": "Yes! Call or message our boutique desk at +233 53 879 5669 Monday to Saturday, 9:00 AM – 6:00 PM GMT. Our stylist will record your choices and process your order directly.",
    "keywords": [
      "order by phone",
      "call to order",
      "phone order",
      "speak to someone to order"
    ],
    "suggestedAction": {
      "label": "Call Boutique Desk",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_order_confirmation_receipt",
    "category": "ordering",
    "question": "Will I receive an order confirmation receipt?",
    "answer": "Yes. Upon placing your order, an instant digital confirmation with your unique Order ID (e.g. NF-84291) is displayed, followed by an official boutique invoice sent via WhatsApp or email.",
    "keywords": [
      "order confirmation",
      "receipt",
      "invoice",
      "proof of order",
      "order id"
    ],
    "suggestedAction": {
      "label": "Track Order",
      "action": "track_order"
    }
  },
  {
    "id": "faq_order_notes_special_requests",
    "category": "ordering",
    "question": "Where do I enter special measurement requests or hem height?",
    "answer": "During checkout, you can input exact measurements or requests into the \"Special Instructions / Tailoring Notes\" field. You can also send them directly to our stylist on WhatsApp with your Order ID.",
    "keywords": [
      "special instructions",
      "order notes",
      "custom note at checkout",
      "where do i put measurements"
    ],
    "suggestedAction": {
      "label": "Size & Length Guide",
      "action": "size_guide"
    }
  },
  {
    "id": "faq_order_modify_after_placing",
    "category": "ordering",
    "question": "Can I modify my size or garment choice after placing an order?",
    "answer": "Yes, if you contact us within 24 hours of placing your order, our cutters can update your size, color, or measurements before textile drafting begins.",
    "keywords": [
      "change size after order",
      "modify order",
      "change garment choice",
      "edit order"
    ],
    "suggestedAction": {
      "label": "Message Stylist",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_order_save_cart",
    "category": "ordering",
    "question": "Does my bag save if I close the browser?",
    "answer": "Yes. Your shopping bag is preserved in local device memory so your selections remain available when you return.",
    "keywords": [
      "save cart",
      "saved bag",
      "items in cart saved",
      "browser storage cart"
    ],
    "suggestedAction": {
      "label": "View Bag",
      "action": "confirm_add_to_cart"
    }
  },
  {
    "id": "faq_order_corporate_gifting",
    "category": "ordering",
    "question": "Do you handle bulk corporate or diplomatic gifting orders?",
    "answer": "Yes. We produce custom-packaged heritage leather goods, silk scarves, and branded corporate accessories for embassies, institutions, and executive gifts with custom brass emblems.",
    "keywords": [
      "corporate gifts",
      "bulk order",
      "diplomatic gifts",
      "executive gifts",
      "embassy orders"
    ],
    "suggestedAction": {
      "label": "Corporate Desk",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_order_cancelling",
    "category": "ordering",
    "question": "How do I cancel an order I placed by mistake?",
    "answer": "Please contact us on WhatsApp (+233 53 879 5669) within 12 hours of submission. Once our master tailors have begun cutting the fabric, cancellations are not permitted under our boutique policy.",
    "keywords": [
      "cancel order",
      "made mistake on order",
      "how to cancel",
      "stop order"
    ],
    "suggestedAction": {
      "label": "Contact WhatsApp",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_order_account_requirement",
    "category": "ordering",
    "question": "Do I need to create an account to purchase?",
    "answer": "No account creation is required! We offer effortless guest checkout so you can complete your order smoothly in seconds.",
    "keywords": [
      "guest checkout",
      "do i need an account",
      "create account to buy",
      "register to order"
    ],
    "suggestedAction": {
      "label": "Explore Collections",
      "action": "explore_collections"
    }
  },
  {
    "id": "faq_payments_how",
    "category": "payments",
    "question": "Do I pay online with a credit card at checkout?",
    "answer": "No immediate credit card payment is charged on the site. Submitting your order registers your garment specifications with our Accra boutique. Our team then contacts you via WhatsApp with your Order Number to finalize your Mobile Money (MoMo) or direct boutique payment.",
    "keywords": [
      "how to pay",
      "payment method",
      "credit card on site",
      "online payment",
      "momo payment",
      "pay at checkout"
    ],
    "suggestedAction": {
      "label": "Chat on WhatsApp",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_payments_momo",
    "category": "payments",
    "question": "How do I pay with Mobile Money (MoMo)?",
    "answer": "We accept MTN Mobile Money, Telecel Cash, and AT Money via our official merchant merchant coordinates provided upon order submission. No extra transaction surcharge is applied.",
    "keywords": [
      "momo",
      "mtn mobile money",
      "telecel cash",
      "vodafone cash",
      "at money",
      "merchant momo number"
    ],
    "suggestedAction": {
      "label": "WhatsApp MoMo Desk",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_payments_international_apps",
    "category": "payments",
    "question": "How do international clients pay from the UK, US, Canada, or Europe?",
    "answer": "International clients can pay seamlessly via remittance apps directly to our Ghana merchant line or bank: Sendwave, WorldRemit, Lemonade Finance, Remitly, Wise, or direct international wire transfer.",
    "keywords": [
      "sendwave",
      "worldremit",
      "lemonade finance",
      "wise transfer",
      "remitly",
      "how to pay from uk",
      "how to pay from usa"
    ],
    "suggestedAction": {
      "label": "International Payment Info",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_payments_currencies",
    "category": "payments",
    "question": "Can I pay in US Dollars, British Pounds, or Euros?",
    "answer": "Yes! While prices on the website are listed in Ghanaian Cedis (GH₵), we provide equivalent invoices in USD ($), GBP (£), or EUR (€) calculated at current official bank rates.",
    "keywords": [
      "pay in dollars",
      "pay in pounds",
      "pay in euros",
      "foreign currency",
      "usd gbp eur exchange rate"
    ],
    "suggestedAction": {
      "label": "Inquire Currency Rates",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_payments_bank_transfer",
    "category": "payments",
    "question": "Can I pay via direct bank transfer in Ghana?",
    "answer": "Yes. We provide official company bank account details (Ecobank Ghana / Stanbic Bank) for direct transfers or GhanaPay payments.",
    "keywords": [
      "bank transfer",
      "ecobank ghana",
      "stanbic bank",
      "direct deposit",
      "ghanapay"
    ],
    "suggestedAction": {
      "label": "Bank Details",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_payments_installments",
    "category": "payments",
    "question": "Do you offer installment payments or layaway?",
    "answer": "For bespoke commissions and large bridal orders exceeding GH₵ 5,000, we offer a two-stage installment plan: 50% deposit upon order confirmation and 50% prior to dispatch.",
    "keywords": [
      "installments",
      "pay in installments",
      "layaway",
      "split payment",
      "payment plan"
    ],
    "suggestedAction": {
      "label": "Bespoke Installments",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_payments_reservation_hold",
    "category": "payments",
    "question": "Is my piece reserved while my payment clears?",
    "answer": "Yes. Once your order is placed, your garment allocation and textile batch are reserved for 48 hours to allow international transfers or Mobile Money confirmation.",
    "keywords": [
      "hold item",
      "reserve garment",
      "how long is item reserved",
      "payment clearance hold"
    ],
    "suggestedAction": {
      "label": "Track Order",
      "action": "track_order"
    }
  },
  {
    "id": "faq_payments_vat_receipt",
    "category": "payments",
    "question": "Can I get a formal VAT invoice for corporate accounting?",
    "answer": "Yes. We issue formal VAT-compliant invoices with Ghana Revenue Authority (GRA) tax identification for corporate or business purchases upon request.",
    "keywords": [
      "vat invoice",
      "gra receipt",
      "tax invoice",
      "business receipt",
      "corporate invoice"
    ],
    "suggestedAction": {
      "label": "Accounting Desk",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_payments_safety",
    "category": "payments",
    "question": "Is my payment information safe?",
    "answer": "Yes. Because we do not store or process card numbers on our servers, your financial security is preserved through verified bank-to-bank and authorized Mobile Money merchant channels.",
    "keywords": [
      "payment safety",
      "is it safe to pay",
      "fraud prevention",
      "secure payment"
    ],
    "suggestedAction": {
      "label": "Explore Collections",
      "action": "explore_collections"
    }
  },
  {
    "id": "faq_payments_discounts_promo",
    "category": "payments",
    "question": "Do you offer discount codes or Black Friday promo sales?",
    "answer": "Nnepa Foriwaa operates as an artisanal luxury house. Because each garment is ethically hand-tailored and our weavers receive premium wages, we maintain fair year-round pricing and do not hold mass promotional discounting sales.",
    "keywords": [
      "discount code",
      "coupon",
      "promo code",
      "black friday",
      "sales promotion",
      "voucher"
    ],
    "suggestedAction": {
      "label": "Explore Collections",
      "action": "explore_collections"
    }
  },
  {
    "id": "faq_returns_policy",
    "category": "returns",
    "question": "What is your return and refund policy?",
    "answer": "In accordance with our published boutique policy, all sales and bespoke commissions are final once placed and cut. We operate a strict No Refund policy. However, we provide a complimentary fitting alteration service at our Accra studio within 7 days of delivery.",
    "keywords": [
      "return policy",
      "refund policy",
      "no refund",
      "money back",
      "can i return dress",
      "returns and refunds"
    ],
    "suggestedAction": {
      "label": "Alterations Policy",
      "action": "delivery_info"
    }
  },
  {
    "id": "faq_exchanges_policy",
    "category": "exchanges",
    "question": "Can I exchange an item for a different size or piece?",
    "answer": "Because each piece is custom-cut or tailored in limited artisan batches, we operate a strict No Exchange policy. If your garment requires adjustment, our Accra master tailors provide complimentary alterations within 7 days of receipt.",
    "keywords": [
      "exchange policy",
      "can i swap size",
      "change piece",
      "exchange for different size",
      "no exchange"
    ],
    "suggestedAction": {
      "label": "Alterations Service",
      "action": "delivery_info"
    }
  },
  {
    "id": "faq_alterations_complimentary",
    "category": "returns",
    "question": "How does complimentary alteration work at the Accra studio?",
    "answer": "If your garment needs a hem adjustment, waist tightening, or dart refinement, simply bring or send the piece to our Accra studio within 7 calendar days of receipt. Our tailors adjust it free of charge within 2–4 business days.",
    "keywords": [
      "free alterations",
      "complimentary alterations",
      "adjust dress",
      "hem alteration",
      "studio adjustment"
    ],
    "suggestedAction": {
      "label": "Book Alteration Fitting",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_alterations_fee_after_7days",
    "category": "returns",
    "question": "Can I get alterations after 7 days have passed?",
    "answer": "Yes. Beyond the initial 7-day complimentary window, our studio offers garment adjustments and styling alterations for a nominal studio fee.",
    "keywords": [
      "alterations after 7 days",
      "paid alterations",
      "adjust dress later",
      "alterations price"
    ],
    "suggestedAction": {
      "label": "Inquire Alterations",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_returns_damaged_goods",
    "category": "returns",
    "question": "What if my garment arrives with a transit defect or fault?",
    "answer": "In the extremely unlikely event that a garment arrives damaged or with a tailoring fault, notify us on WhatsApp (+233 53 879 5669) within 48 hours of delivery with photos. We will repair, replace, or rectify the piece promptly at our expense.",
    "keywords": [
      "damaged item",
      "defective garment",
      "faulty dress",
      "torn seam",
      "broken zipper",
      "quality issue"
    ],
    "suggestedAction": {
      "label": "Report Issue on WhatsApp",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_alterations_local_tailor_guide",
    "category": "returns",
    "question": "Can my local tailor adjust my garment without ruining the design?",
    "answer": "Yes. We construct all garments with generous 1.5-inch internal seam allowances and clean French seams specifically to allow any qualified local tailor to adjust waistlines, bust darts, or hems effortlessly.",
    "keywords": [
      "local tailor alteration",
      "seam allowance",
      "can another tailor alter it",
      "easy to adjust"
    ],
    "suggestedAction": {
      "label": "Boutique Care Advice",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_returns_try_on_care",
    "category": "returns",
    "question": "How should I try on my garment when it arrives?",
    "answer": "Please try on your garment over clean undergarments on a clean floor, avoiding makeup, perfumes, or jewelry that could snag handwoven threads. Ensure all original boutique tags remain intact.",
    "keywords": [
      "trying on garment",
      "care when trying on",
      "tags attached",
      "clean try on"
    ],
    "suggestedAction": {
      "label": "Care Guide",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_returns_bespoke_exceptions",
    "category": "returns",
    "question": "Are there any exceptions to the no-refund policy for custom orders?",
    "answer": "Because bespoke pieces are drafted to unique personal measurements, all sales are strictly final. We guarantee dedicated fittings until the garment fits you as intended.",
    "keywords": [
      "refund on custom",
      "exception to refund policy",
      "custom garment return",
      "bespoke guarantee"
    ],
    "suggestedAction": {
      "label": "Studio Policy",
      "action": "delivery_info"
    }
  },
  {
    "id": "faq_alterations_express_turnaround",
    "category": "returns",
    "question": "Can studio alterations be completed on the same day?",
    "answer": "For urgent wedding or travel deadlines, same-day or 24-hour express alterations can be arranged by appointment at our Accra studio.",
    "keywords": [
      "same day alterations",
      "urgent alteration",
      "24 hour alteration",
      "emergency dress adjustment"
    ],
    "suggestedAction": {
      "label": "Urgent Alteration Desk",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_returns_shipping_costs",
    "category": "returns",
    "question": "Who covers shipping costs for garments returned to Accra for alteration?",
    "answer": "For clients outside Accra sending garments for optional post-delivery adjustments, shipping to our studio is covered by the client; return shipping back to you following alteration is handled collaboratively.",
    "keywords": [
      "alteration shipping cost",
      "who pays shipping for return",
      "courier fee for alteration"
    ],
    "suggestedAction": {
      "label": "Inquire on WhatsApp",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_style_wedding_guest",
    "category": "products",
    "question": "What should I wear to an African traditional wedding as a guest?",
    "answer": "For a traditional Ghanaian or Nigerian wedding, our Queen Mother Kente Corset Gown, Burgundy Corset Cape Gown, or Ivory Wrap Ensemble offer respectful regal presence. For men, our Ivory & Gold Agbada or Indigo Kente Kaftan are ideal.",
    "keywords": [
      "wedding guest dress",
      "what to wear to african wedding",
      "wedding guest attire",
      "traditional wedding guest",
      "owambe dress"
    ],
    "suggestedAction": {
      "label": "Wedding Guest Collection",
      "action": "filter_women"
    }
  },
  {
    "id": "faq_style_black_tie_gala",
    "category": "products",
    "question": "Can Nnepa Foriwaa gowns be worn to black-tie galas and state dinners?",
    "answer": "Yes. Our architectural corsetry and floor-length silhouettes are cut specifically for red-carpet, state dinner, and black-tie galas, providing international red-carpet glamour rooted in African majesty.",
    "keywords": [
      "black tie gala",
      "state dinner dress",
      "red carpet gown",
      "formal evening wear",
      "diplomatic gala dress"
    ],
    "suggestedAction": {
      "label": "View Evening Gowns",
      "action": "filter_women"
    }
  },
  {
    "id": "faq_style_church_celebrations",
    "category": "products",
    "question": "What is appropriate for milestone church services or Thanksgiving?",
    "answer": "For christenings, Thanksgiving, or milestone church celebrations, white and ivory are traditional. Our Ivory Wrap Ensemble, Gold Boubou, or Men’s Ivory Agbada celebrate purity, victory, and joyful gratitude.",
    "keywords": [
      "church clothes",
      "thanksgiving service outfit",
      "christening dress",
      "all white outfit",
      "dedication dress"
    ],
    "suggestedAction": {
      "label": "Explore Ivory Collection",
      "action": "filter_women"
    }
  },
  {
    "id": "faq_style_mens_agbada_footwear",
    "category": "products",
    "question": "What footwear and cap should men wear with an Agbada?",
    "answer": "Pair our Ivory & Gold or Indigo Agbadas with fine leather loafers, patent dress slippers, or traditional leather sandals (Ahenema). Complete the look with a matching embroidered Fila cap.",
    "keywords": [
      "agbada shoes",
      "what shoes with agbada",
      "fila cap",
      "ahenema sandals",
      "men traditional styling"
    ],
    "suggestedAction": {
      "label": "View Menswear",
      "action": "filter_men"
    }
  },
  {
    "id": "faq_style_jewelry_pairing",
    "category": "products",
    "question": "What jewelry pairs best with Kente and Aso-Oke gowns?",
    "answer": "Because Kente and Aso-Oke feature intricate metallic threads and vivid geometric motifs, clean statement gold earrings, sculptural brass cuffs, or authentic Krobo recycled glass beads complement the look without visual clutter.",
    "keywords": [
      "jewelry for kente",
      "earrings with kente",
      "gold jewelry",
      "how to accessorize",
      "beads for wedding"
    ],
    "suggestedAction": {
      "label": "View Bags & Accessories",
      "action": "filter_bags"
    }
  },
  {
    "id": "faq_style_birthday_milestone",
    "category": "products",
    "question": "What do you recommend for milestone birthday photo shoots (30th, 40th, 50th)?",
    "answer": "For landmark birthday shoots, the Queen Mother Kente Corset Gown and Plum Emerald Gown create dramatic sculptural silhouettes that photograph magnificently under studio lighting.",
    "keywords": [
      "birthday shoot dress",
      "40th birthday dress",
      "50th birthday outfit",
      "photoshoot gown",
      "milestone celebration"
    ],
    "suggestedAction": {
      "label": "View Bestsellers",
      "action": "filter_women"
    }
  },
  {
    "id": "faq_style_kente_color_meanings",
    "category": "materials",
    "question": "What do the colors in Kente cloth symbolize?",
    "answer": "Traditional Kente colors carry profound Akan proverbs:\n• Gold / Yellow: Royalty, wealth, fertility, and spiritual purity.\n• Green: Growth, renewal, and harvest.\n• Blue: Peace, harmony, and love.\n• Black: Spiritual maturation, ancestral reverence, and strength.",
    "keywords": [
      "kente color meaning",
      "symbolism of kente",
      "what does gold kente mean",
      "akan color meanings"
    ],
    "suggestedAction": {
      "label": "Explore Kente Gowns",
      "action": "filter_women"
    }
  },
  {
    "id": "faq_style_casual_luxury",
    "category": "products",
    "question": "Do you have pieces suitable for luxury resort wear or relaxed dinners?",
    "answer": "Yes. Our Washed Linen Kaftans and pure Silk Boubous transition effortlessly from luxury beach resorts in Zanzibar to private veranda dining in Accra.",
    "keywords": [
      "resort wear",
      "casual luxury",
      "vacation clothes",
      "relaxed dinner outfit",
      "boubou resort"
    ],
    "suggestedAction": {
      "label": "Explore Boubous",
      "action": "filter_women"
    }
  },
  {
    "id": "faq_style_prom_graduation",
    "category": "products",
    "question": "Do you design graduation or prom dresses honoring African roots?",
    "answer": "Yes! We create striking, modern Kente-corseted graduation and prom gowns that allow young diaspora scholars to celebrate academic triumphs in regal cultural heritage.",
    "keywords": [
      "prom dress",
      "graduation dress",
      "african prom gown",
      "diaspora graduation outfit"
    ],
    "suggestedAction": {
      "label": "Prom & Gala Outfits",
      "action": "filter_women"
    }
  },
  {
    "id": "faq_style_styling_service",
    "category": "support",
    "question": "Can a Nnepa Foriwaa stylist help me curate a complete look?",
    "answer": "Yes. Our private styling concierge provides complimentary digital styling consultations via WhatsApp (+233 53 879 5669), assisting with color matching, silhouettes, accessories, and shoes.",
    "keywords": [
      "stylist help",
      "personal shopper",
      "style advice",
      "help me put together look",
      "styling session"
    ],
    "suggestedAction": {
      "label": "Chat with Stylist",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_style_corporate_african",
    "category": "products",
    "question": "Can your peplum suits be worn in modern corporate boardrooms?",
    "answer": "Yes. Our Ankara Peplum Suit is tailored with structured shoulders, discrete lapels, and tailored pencil skirts or trousers, calibrated for senior executive presence.",
    "keywords": [
      "corporate african wear",
      "boardroom suit",
      "peplum suit for work",
      "executive suit"
    ],
    "suggestedAction": {
      "label": "View Peplum Suit",
      "action": "filter_women"
    }
  },
  {
    "id": "faq_style_festivals_ceremonies",
    "category": "products",
    "question": "What is appropriate for traditional festivals like Homowo, Akwasidae, or Aboakyer?",
    "answer": "For Ghanaian festivals like Akwasidae and Homowo, rich handwoven Kente or regal Northern Fugu smocks worn with pride and traditional sandals honor ancestral custom.",
    "keywords": [
      "akwasidae outfit",
      "homowo festival dress",
      "traditional festival clothing",
      "ghana cultural festival"
    ],
    "suggestedAction": {
      "label": "Explore Collections",
      "action": "explore_collections"
    }
  },
  {
    "id": "faq_avail_lead_time",
    "category": "availability",
    "question": "Are items in stock or made to order?",
    "answer": "Garments marked Available are hand-tailored upon order confirmation, typically taking 3 to 7 working days before dispatch. When a piece or size is not in stock, please check back soon or speak directly with our stylist on WhatsApp (+233 53 879 5669) to commission a bespoke, custom outfit made to your exact measurements.",
    "keywords": [
      "in stock",
      "out of stock",
      "is it available",
      "lead time",
      "made to order",
      "ready to ship",
      "when will it be in stock"
    ],
    "suggestedAction": {
      "label": "Speak to Stylist for Custom Outfit",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_avail_restock_frequency",
    "category": "availability",
    "question": "How frequently do you restock sold-out silhouettes?",
    "answer": "Silhouettes restock as new batches of handwoven textiles arrive from our weavers, typically every 4 to 6 weeks. Message us on WhatsApp to be placed on our VIP priority reservation list.",
    "keywords": [
      "restock frequency",
      "when will you restock",
      "back in stock",
      "waiting list",
      "restock alert"
    ],
    "suggestedAction": {
      "label": "Join VIP Waitlist",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_support_contact",
    "category": "support",
    "question": "How can I contact customer care or book a fitting?",
    "answer": "Our boutique team is available Monday to Saturday, 9:00 AM – 6:00 PM GMT. You can reach us via WhatsApp or phone at +233 53 879 5669, email sales@nnepaforiwaa.com, or book a fitting at our Accra studio on our Contact page (#/contact).",
    "keywords": [
      "contact customer care",
      "customer service phone number",
      "whatsapp support",
      "email support",
      "studio hours",
      "reach out"
    ],
    "suggestedAction": {
      "label": "Contact Boutique",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_support_accra_address",
    "category": "support",
    "question": "Where is the Nnepa Foriwaa studio located in Accra?",
    "answer": "Our private fitting studio is situated in the Airport Residential Area / East Legon creative enclave in Accra, Ghana. Detailed driving directions and gate reception are provided upon appointment confirmation.",
    "keywords": [
      "studio location accra",
      "east legon address",
      "airport residential studio",
      "where is shop in accra",
      "visit showroom"
    ],
    "suggestedAction": {
      "label": "Book Fitting Appointment",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_support_gift_cards",
    "category": "ordering",
    "question": "Do you offer gift cards or gift certificates?",
    "answer": "Yes! We offer digital gift vouchers from GH₵ 500 to GH₵ 10,000 delivered instantly via WhatsApp or email with a personalized note, redeemable toward ready-to-wear or bespoke pieces.",
    "keywords": [
      "gift card",
      "gift voucher",
      "gift certificate",
      "buy a gift card",
      "present for wife"
    ],
    "suggestedAction": {
      "label": "Inquire Gift Cards",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_support_celebrity_stylist",
    "category": "support",
    "question": "Do you collaborate with celebrity stylists and red-carpet pull requests?",
    "answer": "Yes. We collaborate with accredited fashion stylists, publicists, and costume designers for editorial features, film productions, and major international red carpets. Inquire via sales@nnepaforiwaa.com.",
    "keywords": [
      "celebrity stylist",
      "editorial pulls",
      "pr pull request",
      "red carpet styling collaboration",
      "press inquiries"
    ],
    "suggestedAction": {
      "label": "Editorial Desk",
      "action": "contact_whatsapp"
    }
  },
  {
    "id": "faq_support_brand_name_meaning",
    "category": "products",
    "question": "What is the meaning behind the name \"Nnepa Foriwaa\"?",
    "answer": "\"Nnepa\" derives from the Akan word for authentic goods, treasured things, and fine craftsmanship. \"Foriwaa\" honors the timeless regal matriarch. Together, it represents regal African artistry rooted in timeless refinement.",
    "keywords": [
      "what does nnepa foriwaa mean",
      "brand name meaning",
      "origin of name",
      "who is foriwaa",
      "akan meaning"
    ],
    "suggestedAction": {
      "label": "Read Brand Story",
      "action": "brand_story"
    }
  },
  {
    "id": "faq_support_weaving_communities",
    "category": "support",
    "question": "How does Nnepa Foriwaa support local artisan communities in Ghana?",
    "answer": "A portion of proceeds directly funds traditional loom restoration, apprentice stipends for young weavers in Bonwire, and health coverage for women spinning silk and cotton in weaving communities.",
    "keywords": [
      "community impact",
      "artisan welfare",
      "support weavers",
      "give back",
      "empowerment ghana"
    ],
    "suggestedAction": {
      "label": "Our Heritage Story",
      "action": "brand_story"
    }
  }
];

/**
 * Searches the FAQ knowledge entries for a match against customer query text.
 * High-scoring matches provide instant, articulate, boutique-appropriate answers.
 */
export function findMatchingFAQ(query: string): FAQEntry | null {
  const normalized = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return null;

  // Filter out blatantly out-of-scope non-fashion queries (financial markets, politics, weather, etc.)
  const outOfScopePatterns = [
    /\b(stock market|ticker|nasdaq|dow jones|quarterly revenue|balance sheet|ipo|crypto|bitcoin)\b/,
    /\b(weather|forecast|temperature|politics|election)\b/
  ];
  if (outOfScopePatterns.some((p) => p.test(normalized))) {
    return null;
  }

  const queryWords = normalized.split(' ').filter((w) => w.length >= 3);
  let bestEntry: FAQEntry | null = null;
  let highestScore = 0;

  for (const entry of FAQ_KNOWLEDGE_ENTRIES) {
    let score = 0;
    const qLower = entry.question.toLowerCase();

    // Direct match on question phrase
    if (normalized.includes(qLower) || qLower.includes(normalized)) {
      score += 12;
    }

    // Match keywords
    for (const kw of entry.keywords) {
      const kwLower = kw.toLowerCase();
      if (normalized === kwLower) {
        score += 10;
      } else if (normalized.includes(kwLower)) {
        score += 6;
      } else {
        // Multi-word keyword overlap
        const kwParts = kwLower.split(' ').filter((p) => p.length >= 3);
        if (kwParts.length > 1 && kwParts.every((p) => normalized.includes(p))) {
          score += 5;
        }
      }
    }

    // Word intersection with question text
    for (const qw of queryWords) {
      if (qLower.includes(qw)) {
        score += 1;
      }
    }

    if (score > highestScore && score >= 4) {
      highestScore = score;
      bestEntry = entry;
    }
  }

  return bestEntry;
}

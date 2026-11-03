/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * NNEPA Knowledge Module — A. Brand Information
 * Contains only verified information published on the Nnepa Foriwaa website.
 * Edit this file to update brand story, studio hours, or official contact channels.
 */

export interface BrandKnowledge {
  name: string;
  assistantName: string;
  assistantSubtitle: string;
  tagline: string;
  foundedYear: number;
  summary: string;
  story: string[];
  heritagePillars: Array<{
    title: string;
    description: string;
  }>;
  collectionsOverview: Array<{
    key: 'women' | 'men' | 'bags';
    label: string;
    summary: string;
  }>;
  contact: {
    location: string;
    exactStreetAddress: string | null; // Null until published by the boutique
    openingHours: string;
    phone: string;
    whatsappNumber: string;
    whatsappUrl: string;
    email: string;
    fittingPageHash: string;
    fittingTypes: string[];
    socials: {
      instagram: { handle: string; url: string };
      tiktok: { handle: string; url: string };
      facebook: { name: string; url: string };
    };
  };
}

export const BRAND_KNOWLEDGE: BrandKnowledge = {
  name: 'Nnepa Foriwaa',
  assistantName: 'NNEPA',
  assistantSubtitle: 'Your Personal Shopping Concierge',
  tagline: 'Rooted. Refined. Regal.',
  foundedYear: 2015,
  summary:
    'Founded in 2015, Nnepa Foriwaa is a premium African fashion brand in Accra, Ghana, crafting ready-to-wear and custom-tailored clothing for women and men alongside handcrafted bags and accessories.',
  story: [
    'Founded in 2015 and actively in business since, Nnepa Foriwaa crafts clothing for women and men that merges modern silhouettes with the richness of African heritage.',
    'Every piece is sourced from artisans across West Africa and tailored in Accra with refined detail and timeless elegance.'
  ],
  heritagePillars: [
    {
      title: 'Ethically Sourced Fabric',
      description:
        'Direct partnerships with local weavers in Ghana, Nigeria, and Senegal for authentic Ankara, Kente, and Aso-Oke materials.'
    },
    {
      title: 'Made to Measure',
      description:
        'Garments are available in tailored standard sizes or custom-tailored to individual measurements.'
    },
    {
      title: 'Heritage Embroidery',
      description:
        'Hand-embroidered details, beadwork, and traditional weaving techniques inspired by West African royal heritage.'
    }
  ],
  collectionsOverview: [
    {
      key: 'women',
      label: 'Womenswear',
      summary: 'Silk-cotton boubous, handwoven Kente gowns, Ankara peplum sets, organza midis, and quilted Aso-Oke outerwear.'
    },
    {
      key: 'men',
      label: 'Menswear',
      summary: 'Three-piece brocade Agbadas, Kente-yoke linen kaftans, Northern Fugu woven smocks, and tailored Senator two-piece sets.'
    },
    {
      key: 'bags',
      label: 'Bags & Accessories',
      summary: 'Hand-plaited Bolga leather totes, cast-brass Adinkra velvet clutches, silk Kente minaudières, and raffia shoulder bags.'
    }
  ],
  contact: {
    location: 'Accra, Ghana',
    exactStreetAddress: null, // Not publicly listed on website; shared upon fitting confirmation
    openingHours: 'Monday – Saturday, 9:00 AM – 6:00 PM',
    phone: '+233 53 879 5669',
    whatsappNumber: '233538795669',
    whatsappUrl: 'https://wa.me/233538795669',
    email: 'sales@nnepaforiwaa.com',
    fittingPageHash: '#/contact',
    fittingTypes: [
      'Custom Fitting',
      'Bridal & Wedding Collection',
      'Royal Agbada / Men\'s Suit',
      'Measurements & Alterations'
    ],
    socials: {
      instagram: {
        handle: '@nnepaforiwaa',
        url: 'https://www.instagram.com/nnepaforiwaa'
      },
      tiktok: {
        handle: '@nnepa.foriwaa',
        url: 'https://www.tiktok.com/@nnepa.foriwaa'
      },
      facebook: {
        name: 'nnepa foriwaa',
        url: 'https://www.facebook.com/nnepaforiwaa'
      }
    }
  }
};

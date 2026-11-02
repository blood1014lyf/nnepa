/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Product, HeroSlide, Look, Testimonial } from './types.ts';

const lookbook01 = '/assets/images/lookbook_01_gold_boubou.jpg';
const lookbook02 = '/assets/images/lookbook_02_plum_emerald_gown.jpg';
const lookbook03 = '/assets/images/lookbook_03_ivory_wrap_ensemble.jpg';
const lookbook04 = '/assets/images/lookbook_04_burgundy_corset_cape.jpg';
const lookbook05 = '/assets/images/lookbook_05_ankara_peplum_suit.jpg';
const lookbook06 = '/assets/images/lookbook_06_organza_puff_dress.jpg';
const lookbook07 = '/assets/images/lookbook_07_mens_ivory_gold_agbada.jpg';
const lookbook08 = '/assets/images/lookbook_08_mens_indigo_kente_kaftan.jpg';

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    imageUrl: lookbook01
  },
  {
    id: 2,
    imageUrl: lookbook04
  },
  {
    id: 3,
    imageUrl: lookbook02
  },
  {
    id: 4,
    imageUrl: lookbook05
  },
  {
    id: 5,
    imageUrl: lookbook03
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod_1789572165350',
    name: 'Royal Gold Kente Boubou',
    category: 'women',
    subcategory: 'Dresses & Gowns',
    price: 480,
    rating: 5,
    imageUrl: lookbook01,
    hoverImageUrl: lookbook03,
    color: 'Gold & Ochre',
    colorCount: 2,
    badge: 'Exclusive',
    inStock: true,
    description: 'Generously draped silk-cotton boubou finished in Accra with handwoven Asante Kente strip inlays along the neckline and cuffs.',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'prod_1789572165351',
    name: 'Queen Mother Royal Kente Gown',
    category: 'women',
    subcategory: 'Dresses & Gowns',
    price: 2850,
    rating: 5,
    imageUrl: lookbook02,
    hoverImageUrl: lookbook06,
    color: 'Plum & Violet',
    colorCount: 3,
    badge: 'Bestseller',
    inStock: true,
    description: 'Full-length evening gown cut from handwoven Ghanaian silk Kente and weighty brocade, tailored for weddings and formal celebrations.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'prod_1789572165352',
    name: 'Ankara Peplum Two-Piece',
    category: 'women',
    subcategory: 'Tops & Sets',
    price: 650,
    rating: 5,
    imageUrl: lookbook05,
    hoverImageUrl: lookbook04,
    color: 'Crimson & Blush',
    colorCount: 2,
    badge: 'New',
    inStock: true,
    description: 'Structured cotton wax-print peplum bodice paired with an ankle-grazing column skirt for unhurried ease from morning to evening.',
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: 'prod_1789572165353',
    name: 'Pleated Silk Evening Dress',
    category: 'women',
    subcategory: 'Dresses & Gowns',
    price: 980,
    rating: 5,
    imageUrl: lookbook06,
    hoverImageUrl: lookbook02,
    color: 'Emerald & Sage',
    colorCount: 2,
    badge: 'Exclusive',
    inStock: true,
    description: 'Fluid flared silhouette woven with fine silk threads and soft micro-pleats that move lightly with every step.',
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: 'prod_1789572165354',
    name: 'The Patriarch Brocade Agbada',
    category: 'men',
    subcategory: 'Kaftans & Agbada',
    price: 1200,
    rating: 5,
    imageUrl: lookbook07,
    hoverImageUrl: lookbook08,
    color: 'Ivory & Pearl',
    colorCount: 3,
    badge: 'Bestseller',
    inStock: true,
    description: 'Three-piece ceremonial Agbada cut from breathable damask brocade with tonal hand embroidery at the chest and matching trousers.',
    sizes: ['M', 'L', 'XL', 'XXL']
  },
  {
    id: 'prod_1789572165355',
    name: 'Asante Yoke Linen Kaftan',
    category: 'men',
    subcategory: 'Kaftans & Agbada',
    price: 750,
    rating: 5,
    imageUrl: lookbook08,
    hoverImageUrl: lookbook07,
    color: 'Gold & Ochre',
    colorCount: 2,
    badge: 'New',
    inStock: true,
    description: 'Crisp washed-linen kaftan accented with a handwoven Kente shoulder yoke and deep side-seam pockets.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'prod_1789572165356',
    name: 'Northern Fugu Woven Smock',
    category: 'men',
    subcategory: 'Outerwear & Smocks',
    price: 580,
    rating: 5,
    imageUrl: lookbook08,
    hoverImageUrl: lookbook07,
    color: 'Indigo & Navy',
    colorCount: 2,
    badge: 'Exclusive',
    inStock: true,
    description: 'Authentic Northern Ghanaian strip-woven cotton smock with a traditional pleated hem and hand-worked neckline.',
    sizes: ['M', 'L', 'XL']
  },
  {
    id: 'prod_1789572165357',
    name: 'Bolga Woven Leather Tote',
    category: 'bags',
    subcategory: 'Bags & Accessories',
    price: 340,
    rating: 5,
    imageUrl: lookbook01,
    hoverImageUrl: lookbook03,
    color: 'Gold & Ochre',
    colorCount: 3,
    badge: 'Bestseller',
    inStock: true,
    description: 'Hand-plaited elephant grass carryall woven in Bolgatanga and finished with vegetable-tanned Ghanaian leather handles.',
    sizes: ['One Size']
  },
  {
    id: 'prod_1789572165358',
    name: 'Asante Brass Adinkra Clutch',
    category: 'bags',
    subcategory: 'Bags & Accessories',
    price: 260,
    rating: 5,
    imageUrl: lookbook03,
    hoverImageUrl: lookbook04,
    color: 'Ebony & Charcoal',
    colorCount: 2,
    badge: 'New',
    inStock: true,
    description: 'Plush velvet evening clutch set with cast-brass Adinkra hardware and a removable fine chain strap.',
    sizes: ['One Size']
  },
  {
    id: 'prod_1789572165359',
    name: 'Silk Kente Box Minaudière',
    category: 'bags',
    subcategory: 'Bags & Accessories',
    price: 420,
    rating: 5,
    imageUrl: lookbook02,
    hoverImageUrl: lookbook01,
    color: 'Plum & Violet',
    colorCount: 2,
    badge: 'Exclusive',
    inStock: true,
    description: 'Structured evening minaudière wrapped in handwoven silk Kente with a satin interior and concealed clasp.',
    sizes: ['One Size']
  },
  {
    id: 'prod_1789572165360',
    name: 'Foriwaa Organza Puff-Sleeve Midi',
    category: 'women',
    subcategory: 'Dresses & Gowns',
    price: 890,
    rating: 5,
    imageUrl: lookbook04,
    hoverImageUrl: lookbook06,
    color: 'Plum & Violet',
    colorCount: 2,
    badge: 'New',
    inStock: true,
    description: 'Airy silk-organza midi dress gathered softly at the waist with sculpted lantern sleeves and delicate back ties.',
    sizes: ['XS', 'S', 'M', 'L']
  },
  {
    id: 'prod_1789572165361',
    name: 'Osu Matelassé Wrap Blouse & Skirt',
    category: 'women',
    subcategory: 'Tops & Sets',
    price: 760,
    rating: 5,
    imageUrl: lookbook03,
    hoverImageUrl: lookbook05,
    color: 'Ivory & Pearl',
    colorCount: 3,
    inStock: true,
    description: 'Textured cotton-jacquard wrap blouse with side ribbon ties paired with a softly gathered A-line midi skirt.',
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: 'prod_1789572165362',
    name: 'Aburi Silk-Cotton Tiered Gown',
    category: 'women',
    subcategory: 'Dresses & Gowns',
    price: 1350,
    originalPrice: 1550,
    rating: 5,
    imageUrl: lookbook02,
    hoverImageUrl: lookbook01,
    color: 'Crimson & Blush',
    colorCount: 2,
    badge: 'Sale',
    inStock: true,
    description: 'Voluminous three-tier gown cut from breathable Ghanaian cotton-silk with hand-rolled hems and deep concealed pockets.',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'prod_1789572165363',
    name: 'Kumasi Tailored Senator Two-Piece',
    category: 'men',
    subcategory: 'Tops & Sets',
    price: 840,
    rating: 5,
    imageUrl: lookbook07,
    hoverImageUrl: lookbook08,
    color: 'Ebony & Charcoal',
    colorCount: 2,
    badge: 'Bestseller',
    inStock: true,
    description: 'Clean-lined Senator tunic and tapered trouser set tailored in superfine wool-cotton suiting with subtle Kente piping.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'prod_1789572165364',
    name: 'Labone Quilted Aso-Oke Jacket',
    category: 'women',
    subcategory: 'Outerwear & Smocks',
    price: 920,
    rating: 5,
    imageUrl: lookbook05,
    hoverImageUrl: lookbook04,
    color: 'Emerald & Sage',
    colorCount: 2,
    badge: 'New',
    inStock: true,
    description: 'Cropped boxy jacket quilted from hand-loomed Aso-Oke cloth with tied ribbon closures and a smooth cotton voile lining.',
    sizes: ['XS', 'S', 'M', 'L']
  },
  {
    id: 'prod_1789572165365',
    name: 'Cape Coast Raffia & Calfskin Shoulder Bag',
    category: 'bags',
    subcategory: 'Bags & Accessories',
    price: 390,
    rating: 5,
    imageUrl: lookbook04,
    hoverImageUrl: lookbook03,
    color: 'Ivory & Pearl',
    colorCount: 2,
    inStock: false,
    description: 'Softly curved shoulder bag hand-crocheted in natural raffia and trimmed in supple plum-dyed calfskin. Made to order in Accra.',
    sizes: ['One Size']
  }
];

export const LOOKS: Look[] = [
  {
    id: 'l1',
    number: '01',
    imageUrl: lookbook05,
    category: 'Women · Look 01',
    title: 'Heritage Bloom'
  },
  {
    id: 'l2',
    number: '02',
    imageUrl: lookbook07,
    category: 'Men · Look 02',
    title: 'The Patriarch'
  },
  {
    id: 'l3',
    number: '03',
    imageUrl: lookbook03,
    category: 'Women · Look 03',
    title: 'Twin Radiance'
  },
  {
    id: 'l4',
    number: '04',
    imageUrl: lookbook01,
    category: 'Women · Look 04',
    title: 'Flora Royale'
  },
  {
    id: 'l5',
    number: '05',
    imageUrl: lookbook02,
    category: 'Women · Look 05',
    title: 'Evening Pleats'
  },
  {
    id: 'l6',
    number: '06',
    imageUrl: lookbook08,
    category: 'Men · Look 06',
    title: 'The Young Noble'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Akosua',
    location: 'East Legon, Accra',
    tag: 'Ready-to-Wear',
    rating: 5,
    text: 'I bought a ready-to-wear dress for a wedding over the weekend and honestly, the fit was 10/10! No adjustments needed at all. The fabric quality is top tier.'
  },
  {
    id: 't2',
    name: 'Kofi',
    location: 'Kumasi',
    tag: 'Custom Made',
    rating: 5,
    text: 'Ordered a custom-made kaftan set for my sister’s engagement. Tailoring was neat, measurements were spot on, and they delivered right on schedule. Good job!'
  },
  {
    id: 't3',
    name: 'Ama',
    location: 'Tema',
    tag: 'Ready-to-Wear',
    rating: 5,
    text: 'Love their ready-to-wear collection! Needed a classy outfit for Sunday service and got it delivered to my doorstep in Tema. Super comfortable and stylish.'
  },
  {
    id: 't4',
    name: 'Kwadwo',
    location: 'Spintex, Accra',
    tag: 'Custom Made',
    rating: 5,
    text: 'Got a custom-made senator suit for a corporate dinner. The fit was sharp and everyone kept asking where I got it. Nnepa Foriwaa really knows their craft.'
  }
];

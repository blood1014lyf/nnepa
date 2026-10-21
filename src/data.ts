/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Product, HeroSlide, Look, Testimonial } from './types.ts';

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    imageUrl: 'https://images.pexels.com/photos/34993753/pexels-photo-34993753.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1800'
  },
  {
    id: 2,
    imageUrl: 'https://images.pexels.com/photos/30326132/pexels-photo-30326132.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1800'
  },
  {
    id: 3,
    imageUrl: 'https://images.pexels.com/photos/14577493/pexels-photo-14577493.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1800'
  },
  {
    id: 4,
    imageUrl: 'https://images.pexels.com/photos/34993754/pexels-photo-34993754.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1800'
  },
  {
    id: 5,
    imageUrl: 'https://images.pexels.com/photos/6192447/pexels-photo-6192447.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1800'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod_1789572165350',
    name: 'Royal Gold Kente Boubou',
    category: 'women',
    subcategory: 'Couture Boubou',
    price: 480,
    rating: 5,
    imageUrl: 'https://images.pexels.com/photos/20799228/pexels-photo-20799228.jpeg',
    badge: 'Exclusive',
    inStock: true,
    description: 'Elegant designer apparel tailored custom to emphasize royal stature and status. Handcrafted in Accra with authentic Kente strip inlays.',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'prod_1789572165351',
    name: 'Queen Mother Royal Kente Gown',
    category: 'women',
    subcategory: 'Couture Evening Wear',
    price: 2850,
    rating: 5,
    imageUrl: 'https://images.pexels.com/photos/34993753/pexels-photo-34993753.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900',
    badge: 'Bestseller',
    inStock: true,
    description: 'Handcrafted luxury silhouette sculpted from authentic Ghanaian handwoven silk Kente and regal brocade. Designed for high occasions, weddings, and royal galas with signature precision darting.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'prod_1789572165352',
    name: 'Ankara Royal Peplum Ensemble',
    category: 'women',
    subcategory: 'Tailored Two-Piece',
    price: 650,
    rating: 5,
    imageUrl: 'https://images.pexels.com/photos/14484948/pexels-photo-14484948.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640',
    badge: 'New',
    inStock: true,
    description: 'Vibrant custom wax print peplum top tailored with matching pencil silhouette. Engineered for exceptional contour and ease of movement.',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'prod_1789572165353',
    name: 'Staircase Dream Couture Dress',
    category: 'women',
    subcategory: 'Evening Couture',
    price: 980,
    rating: 5,
    imageUrl: 'https://images.pexels.com/photos/28387051/pexels-photo-28387051.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640',
    badge: 'Exclusive',
    inStock: true,
    description: 'Dramatic flared silhouette woven with shimmering silk threads and micro-pleated accents. A head-turning showpiece.',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 'prod_1789572165354',
    name: 'The Patriarch Brocade Agbada',
    category: 'men',
    subcategory: 'Grand Agbada Suite',
    price: 1200,
    rating: 5,
    imageUrl: 'https://images.pexels.com/photos/31762081/pexels-photo-31762081.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640',
    badge: 'Bestseller',
    inStock: true,
    description: 'Three-piece imperial Agbada tailored from heavyweight damask brocade with hand-embroidered neckline and matching trousers.',
    sizes: ['M', 'L', 'XL', 'XXL']
  },
  {
    id: 'prod_1789572165355',
    name: 'Emperor Handwoven Kente Kaftan',
    category: 'men',
    subcategory: 'Bespoke Kaftan',
    price: 750,
    rating: 5,
    imageUrl: 'https://images.pexels.com/photos/34608857/pexels-photo-34608857.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640',
    badge: 'New',
    inStock: true,
    description: 'Crisp structured linen kaftan highlighted with geometric Asante Kente shoulder yoke and hidden hand-stitched pockets.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'prod_1789572165356',
    name: 'Northern Fugu Royal Smock',
    category: 'men',
    subcategory: 'Traditional Smock',
    price: 580,
    rating: 5,
    imageUrl: 'https://images.pexels.com/photos/14577493/pexels-photo-14577493.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900',
    badge: 'Exclusive',
    inStock: true,
    description: 'Authentic Northern Ghanaian hand-spun striped cotton smock featuring traditional flared hemline and intricate chest embroidery.',
    sizes: ['M', 'L', 'XL']
  },
  {
    id: 'prod_1789572165357',
    name: 'Artisanal Bolga Woven Leather Tote',
    category: 'bags',
    subcategory: 'Artisanal Tote',
    price: 340,
    rating: 5,
    imageUrl: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640',
    badge: 'Bestseller',
    inStock: true,
    description: 'Handwoven elephant grass tote crafted by master weavers in Bolgatanga, reinforced with supple dyed Ghanaian leather handles.',
    sizes: ['One Size']
  },
  {
    id: 'prod_1789572165358',
    name: 'Asante Gold Adinkra Clutch',
    category: 'bags',
    subcategory: 'Luxury Clutch',
    price: 260,
    rating: 5,
    imageUrl: 'https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640',
    badge: 'New',
    inStock: true,
    description: 'Velvet evening clutch embossed with brass Adinkra symbol accents and detachable gold-tone chain strap.',
    sizes: ['One Size']
  },
  {
    id: 'prod_1789572165359',
    name: 'Kente Velvet Luxury Minaudière',
    category: 'bags',
    subcategory: 'Box Minaudière',
    price: 420,
    rating: 5,
    imageUrl: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640',
    badge: 'Exclusive',
    inStock: true,
    description: 'Hard-shell evening minaudière enveloped in genuine silk Kente cloth with plush satin lining and magnetic clasp closure.',
    sizes: ['One Size']
  }
];

export const LOOKS: Look[] = [
  {
    id: 'l1',
    number: '01',
    imageUrl: 'https://images.pexels.com/photos/33662802/pexels-photo-33662802.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640',
    category: 'Women · Look 01',
    title: 'Heritage Bloom'
  },
  {
    id: 'l2',
    number: '02',
    imageUrl: 'https://images.pexels.com/photos/31762081/pexels-photo-31762081.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640',
    category: 'Men · Look 02',
    title: 'The Patriarch'
  },
  {
    id: 'l3',
    number: '03',
    imageUrl: 'https://images.pexels.com/photos/29077024/pexels-photo-29077024.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640',
    category: 'Women · Look 03',
    title: 'Twin Radiance'
  },
  {
    id: 'l4',
    number: '04',
    imageUrl: 'https://images.pexels.com/photos/14484948/pexels-photo-14484948.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640',
    category: 'Women · Look 04',
    title: 'Flora Royale'
  },
  {
    id: 'l5',
    number: '05',
    imageUrl: 'https://images.pexels.com/photos/28387051/pexels-photo-28387051.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640',
    category: 'Women · Look 05',
    title: 'Staircase Dream'
  },
  {
    id: 'l6',
    number: '06',
    imageUrl: 'https://images.pexels.com/photos/34608857/pexels-photo-34608857.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640',
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

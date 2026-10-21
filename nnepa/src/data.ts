/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, HeroSlide, Look, Testimonial } from './types.ts';

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
  // WOMEN'S
  {
    id: 'w1',
    name: 'Ankara Wrap Gown',
    category: 'women',
    subcategory: 'Gown',
    price: 285,
    rating: 5,
    imageUrl: 'https://images.pexels.com/photos/32290810/pexels-photo-32290810.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    badge: 'Bestseller'
  },
  {
    id: 'w2',
    name: 'Kente Luxury Set',
    category: 'women',
    subcategory: 'Two-Piece',
    price: 340,
    rating: 5,
    imageUrl: 'https://images.pexels.com/photos/29857668/pexels-photo-29857668.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    badge: 'New'
  },
  {
    id: 'w3',
    name: 'Vibrant Ankara Flare',
    category: 'women',
    subcategory: 'Flare Dress',
    price: 195,
    originalPrice: 260,
    rating: 4,
    imageUrl: 'https://images.pexels.com/photos/33561263/pexels-photo-33561263.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    badge: 'Sale'
  },
  {
    id: 'w4',
    name: 'Serene Aso-oke Gown',
    category: 'women',
    subcategory: 'Evening',
    price: 420,
    rating: 5,
    imageUrl: 'https://images.pexels.com/photos/20799228/pexels-photo-20799228.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    badge: 'Exclusive'
  },
  // MEN'S
  {
    id: 'm1',
    name: 'Royal Agbada Set',
    category: 'men',
    subcategory: 'Agbada',
    price: 520,
    rating: 5,
    imageUrl: 'https://images.pexels.com/photos/29488868/pexels-photo-29488868.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    badge: 'Bestseller'
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
    category: 'Kids · Look 06',
    title: 'Little Chief'
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

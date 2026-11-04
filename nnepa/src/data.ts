/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Product, HeroSlide, Look, Testimonial } from './types.ts';

export const HERO_SLIDES: HeroSlide[] = [];

export const PRODUCTS: Product[] = [];

export const LOOKS: Look[] = [];

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
    text: "Ordered a custom-made kaftan set for my sister's engagement. Tailoring was neat, measurements were spot on, and they delivered right on schedule. Good job!"
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

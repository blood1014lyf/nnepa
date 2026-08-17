/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: 'women' | 'men' | 'kids';
  subcategory: string;
  price: number;
  originalPrice?: number;
  rating: number;
  imageUrl: string;
  badge?: 'Bestseller' | 'New' | 'Sale' | 'Exclusive';
  inStock?: boolean;
  description?: string;
  sizes?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

export interface HeroSlide {
  id: number;
  imageUrl: string;
}

export interface Look {
  id: string;
  number: string;
  imageUrl: string;
  category: string;
  title: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  location?: string;
  text: string;
  rating: number;
  imageUrl?: string;
  tag?: string;
}

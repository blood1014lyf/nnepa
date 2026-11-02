/**
 * Authoritative Server-Side Price List
 * Never trust prices or totals submitted from the client browser.
 */

export interface ServerProductPrice {
  name: string;
  price: number;
}

export const SERVER_PRICE_LIST: Record<string, ServerProductPrice> = {
  'prod_1789572165350': { name: 'Royal Gold Kente Boubou', price: 480 },
  'prod_1789572165351': { name: 'Queen Mother Royal Kente Gown', price: 2850 },
  'prod_1789572165352': { name: 'Ankara Peplum Two-Piece', price: 650 },
  'prod_1789572165353': { name: 'Pleated Silk Evening Dress', price: 980 },
  'prod_1789572165354': { name: 'The Patriarch Brocade Agbada', price: 1200 },
  'prod_1789572165355': { name: 'Asante Yoke Linen Kaftan', price: 750 },
  'prod_1789572165356': { name: 'Northern Fugu Woven Smock', price: 580 },
  'prod_1789572165357': { name: 'Bolga Woven Leather Tote', price: 340 },
  'prod_1789572165358': { name: 'Asante Brass Adinkra Clutch', price: 260 },
  'prod_1789572165359': { name: 'Silk Kente Box Minaudière', price: 420 },
  'prod_1789572165360': { name: 'Foriwaa Organza Puff-Sleeve Midi', price: 890 },
  'prod_1789572165361': { name: 'Osu Matelassé Wrap Blouse & Skirt', price: 760 },
  'prod_1789572165362': { name: 'Aburi Silk-Cotton Tiered Gown', price: 1350 },
  'prod_1789572165363': { name: 'Kumasi Tailored Senator Two-Piece', price: 840 },
  'prod_1789572165364': { name: 'Labone Quilted Aso-Oke Jacket', price: 920 },
  'prod_1789572165365': { name: 'Cape Coast Raffia & Calfskin Shoulder Bag', price: 390 }
};

export function lookupProductPrice(productId: string): ServerProductPrice | null {
  return SERVER_PRICE_LIST[productId] || null;
}

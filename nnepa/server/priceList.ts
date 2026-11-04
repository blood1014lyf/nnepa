/**
 * Authoritative Server-Side Price List
 * Never trust prices or totals submitted from the client browser.
 */

export interface ServerProductPrice {
  name: string;
  price: number;
}

export const SERVER_PRICE_LIST: Record<string, ServerProductPrice> = {};

export function lookupProductPrice(productId: string): ServerProductPrice | null {
  if (SERVER_PRICE_LIST[productId]) {
    return SERVER_PRICE_LIST[productId];
  }
  return null;
}

export function registerProductPrice(productId: string, name: string, price: number): void {
  SERVER_PRICE_LIST[productId] = { name, price };
}

export function removeProductPrice(productId: string): void {
  delete SERVER_PRICE_LIST[productId];
}

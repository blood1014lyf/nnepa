/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LogOut, RefreshCw, ShoppingBag, Phone, MapPin, Calendar, Clock, ExternalLink, Check, Filter } from 'lucide-react';

export type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface StoredOrder {
  orderNumber: number;
  publicId: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

interface AdminDashboardViewProps {
  adminToken: string;
  onLogout: () => void;
  showToast: (message: string) => void;
}

export default function AdminDashboardView({ adminToken, onLogout, showToast }: AdminDashboardViewProps) {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = adminToken || localStorage.getItem('nnepa_foriwaa_token') || '';
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } else {
        showToast('Could not load orders from server.');
      }
    } catch {
      showToast('Network error loading orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (order: StoredOrder, newStatus: OrderStatus) => {
    setUpdatingId(order.publicId);
    try {
      const token = adminToken || localStorage.getItem('nnepa_foriwaa_token') || '';
      const res = await fetch(`/api/admin/orders/${order.publicId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.publicId === order.publicId ? { ...o, status: newStatus } : o))
        );
        showToast(`Order #${order.orderNumber} status changed to ${newStatus}`);
      } else {
        showToast('Failed to update order status');
      }
    } catch {
      showToast('Network error updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-300';
    }
  };

  return (
    <div className="pt-24 pb-20 bg-zinc-50 min-h-screen text-zinc-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header Bar */}
        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-xs mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-plum-dark text-white flex items-center justify-center font-bold text-sm">
                NF
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900">Orders Administration</h1>
                <p className="text-xs text-zinc-500">
                  Total Orders: <strong className="text-zinc-800">{orders.length}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded border border-zinc-300 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={onLogout}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded border-none cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-medium text-zinc-500 mr-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['all', 'new', 'confirmed', 'shipped', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded capitalize cursor-pointer border transition-colors ${
                filterStatus === st
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              {st} ({st === 'all' ? orders.length : orders.filter((o) => o.status === st).length})
            </button>
          ))}
        </div>

        {/* Orders Table / List */}
        {loading && orders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg border border-zinc-200 text-zinc-500 text-sm">
            Loading incoming orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg border border-zinc-200 text-zinc-500 text-sm">
            No {filterStatus !== 'all' ? filterStatus : ''} orders recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const orderDate = new Date(order.createdAt).toLocaleString('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short'
              });

              const customerPhoneDigits = order.customer.phone.replace(/[^0-9]/g, '');

              return (
                <div
                  key={order.publicId}
                  className="bg-white rounded-lg border border-zinc-200 p-5 sm:p-6 shadow-xs hover:border-zinc-300 transition-colors"
                >
                  {/* Top Bar: Order #, Date, Status Selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-bold text-zinc-900">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`text-[0.68rem] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      <a
                        href={`#/order/${order.publicId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-400 hover:text-zinc-700 flex items-center gap-1 font-mono"
                        title="View Customer Order Status Page"
                      >
                        {order.publicId}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {orderDate}
                      </div>

                      {/* Status Dropdown */}
                      <div className="flex items-center gap-1.5">
                        <label className="text-xs font-semibold text-zinc-600">Status:</label>
                        <select
                          value={order.status}
                          disabled={updatingId === order.publicId}
                          onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                          className="text-xs font-semibold px-2.5 py-1 bg-zinc-50 border border-zinc-300 rounded outline-none cursor-pointer focus:border-zinc-500"
                        >
                          <option value="new">New</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Middle Section: Customer & Items */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
                    {/* Customer Info (5 cols) */}
                    <div className="md:col-span-5 space-y-2 text-xs">
                      <div>
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 block">
                          Client
                        </span>
                        <span className="font-bold text-sm text-zinc-900">{order.customer.name}</span>
                      </div>

                      <div className="flex items-center gap-2 text-zinc-700">
                        <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="font-mono">{order.customer.phone}</span>
                        {customerPhoneDigits && (
                          <a
                            href={`https://wa.me/${customerPhoneDigits}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[0.68rem] text-emerald-600 hover:underline font-semibold"
                          >
                            Chat on WhatsApp
                          </a>
                        )}
                      </div>

                      <div className="flex items-start gap-2 text-zinc-700">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span>{order.customer.address}</span>
                      </div>

                      {order.customer.notes && (
                        <div className="bg-zinc-50 p-2.5 rounded border border-zinc-100 text-zinc-600 text-[0.72rem] mt-2">
                          <strong className="text-zinc-800">Notes:</strong> {order.customer.notes}
                        </div>
                      )}
                    </div>

                    {/* Garments Ordered (7 cols) */}
                    <div className="md:col-span-7 bg-zinc-50/70 p-4 rounded-md border border-zinc-100">
                      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                        Garments ({order.items.length})
                      </span>
                      <ul className="space-y-2 divide-y divide-zinc-200/60">
                        {order.items.map((it, idx) => (
                          <li key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-semibold text-zinc-900">{it.name}</span>
                              <span className="text-zinc-500 ml-2">
                                (Size: <strong className="text-zinc-700">{it.size || 'M'}</strong>) × {it.quantity}
                              </span>
                            </div>
                            <span className="font-mono font-semibold text-zinc-800">
                              GH₵ {it.lineTotal.toLocaleString()}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Line Totals */}
                      <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between text-xs font-bold text-zinc-900">
                        <span>Total Due</span>
                        <span className="text-sm font-mono text-plum-dark">
                          GH₵ {order.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

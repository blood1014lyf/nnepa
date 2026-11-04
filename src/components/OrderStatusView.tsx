/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Package, AlertCircle, ArrowLeft, MessageSquare } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon.tsx';

interface OrderItem {
  productId: string;
  name: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface PublicOrder {
  orderNumber: number;
  publicId: string;
  status: 'new' | 'confirmed' | 'shipped' | 'cancelled';
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
}

interface OrderStatusViewProps {
  publicId: string;
  onBackToShop: () => void;
}

export default function OrderStatusView({ publicId, onBackToShop }: OrderStatusViewProps) {
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchOrderStatus = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(publicId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.order) {
            setOrder(data.order);
            setNotFound(false);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (publicId) {
      fetchOrderStatus();
    }
  }, [publicId]);

  const getStatusDisplay = (status: PublicOrder['status']) => {
    switch (status) {
      case 'new':
        return {
          title: 'Order Received & In Review',
          description: 'Our Accra tailoring workshop has received your order request.',
          badge: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'confirmed':
        return {
          title: 'Tailoring Confirmed',
          description: 'Fabric selection and bespoke fitting preparation are underway.',
          badge: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'shipped':
        return {
          title: 'Dispatched for Delivery',
          description: 'Your tailored garments are packaged and en route.',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
      case 'cancelled':
        return {
          title: 'Order Cancelled',
          description: 'This order request has been cancelled.',
          badge: 'bg-rose-100 text-rose-800 border-rose-200'
        };
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 bg-pearl min-h-[75vh] flex items-center justify-center">
        <p className="text-sm font-medium text-plum-dark animate-pulse">
          Loading order details...
        </p>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="pt-32 pb-24 bg-pearl min-h-[75vh]">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl text-plum-dark font-light mb-2">Order Not Found</h1>
          <p className="text-xs text-text-light mb-6">
            We could not locate an order matching reference <code className="font-mono text-plum-dark">{publicId}</code>.
          </p>
          <button
            onClick={onBackToShop}
            className="px-6 py-3 bg-plum-dark hover:bg-plum text-white text-xs font-bold tracking-widest uppercase rounded-[2px] cursor-pointer transition-all border-none"
          >
            Return to Gallery
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusDisplay(order.status);
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const whatsappInquiryUrl = `https://wa.me/233538795669?text=${encodeURIComponent(
    `Hello Nnepa Foriwaa! I am checking on the status of my Order #${order.orderNumber} (Ref: ${order.publicId}).`
  )}`;

  return (
    <div className="pt-28 pb-24 bg-pearl min-h-screen text-plum-dark">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Back Link */}
        <button
          onClick={onBackToShop}
          className="flex items-center gap-2 px-3 py-2 bg-white/50 border border-lilac/10 hover:bg-white text-xs font-bold tracking-[0.2em] uppercase text-mauve-deep mb-8 cursor-pointer rounded-[2px] transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-lavender" />
          Back to gallery
        </button>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-md border border-lilac/25 p-6 sm:p-10 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-100 gap-4">
            <div>
              <span className="text-[0.62rem] font-bold tracking-[0.25em] uppercase text-mauve-deep block mb-1">
                Bespoke Commission
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-plum-dark">
                Order #{order.orderNumber}
              </h1>
              <span className="text-xs text-text-light font-mono block mt-1">
                Placed on {formattedDate}
              </span>
            </div>

            <div className="sm:text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusInfo.badge}`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Status Message */}
          <div className="py-6 border-b border-zinc-100">
            <h2 className="text-sm font-bold text-plum-dark mb-1">{statusInfo.title}</h2>
            <p className="text-xs text-text-light leading-relaxed">{statusInfo.description}</p>
          </div>

          {/* Items Summary */}
          <div className="py-6 border-b border-zinc-100">
            <h3 className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-plum-dark mb-4">
              Garments Commissioned
            </h3>
            <ul className="space-y-3">
              {order.items.map((it, idx) => (
                <li key={idx} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-plum-dark">{it.name}</span>
                    <span className="text-text-muted ml-2">
                      (Size: <strong className="text-plum-dark">{it.size || 'M'}</strong>) × {it.quantity}
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-plum-dark">
                    GH₵ {it.lineTotal.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Total Breakdown */}
          <div className="py-6 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-light">Total</span>
            <span className="font-serif text-2xl font-bold text-lavender">
              GH₵ {order.total.toLocaleString()}
            </span>
          </div>

          {/* WhatsApp Support Button */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2px] font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              Inquire via WhatsApp Assistant
            </a>
            <button
              onClick={onBackToShop}
              className="px-6 py-3.5 bg-plum-dark hover:bg-plum text-white rounded-[2px] font-bold text-xs tracking-wider uppercase border-none cursor-pointer transition-colors"
            >
              Return to Shop
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

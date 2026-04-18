'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SearchIcon, EyeIcon, TruckIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/outline';

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const url = statusFilter ? `/api/orders?status=${statusFilter}` : '/api/orders';
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string, type: 'order' | 'payment' | 'fulfillment') => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      PROCESSING: 'bg-blue-100 text-blue-700',
      SHIPPED: 'bg-purple-100 text-purple-700',
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      PAID: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
      NONE: 'bg-gray-100 text-gray-700',
      FULFILLED: 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-64 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 mt-1">{orders.length} total orders</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Order</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Payment</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{order.order_number}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900">
                        {[order.first_name, order.last_name].filter(Boolean).join(' ') || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-500">{order.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status, 'order')}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.payment_status, 'payment')}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-500">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}

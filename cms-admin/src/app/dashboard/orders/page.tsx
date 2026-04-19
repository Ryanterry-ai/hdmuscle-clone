'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import { SearchIcon, EyeIcon } from '@heroicons/react/outline';

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

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-500/20 text-yellow-400',
      PROCESSING: 'bg-blue-500/20 text-blue-400',
      SHIPPED: 'bg-purple-500/20 text-purple-400',
      DELIVERED: 'bg-emerald-500/20 text-emerald-400',
      CANCELLED: 'bg-red-500/20 text-red-400',
      PAID: 'bg-emerald-500/20 text-emerald-400',
      FAILED: 'bg-red-500/20 text-red-400',
      FULFILLED: 'bg-emerald-500/20 text-emerald-400',
    };
    return colors[status] || 'bg-slate-700 text-slate-400';
  };

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title text-white">Orders</h1>
            <p className="text-slate-400 mt-1">{orders.length} total orders</p>
          </div>
        </div>

        <Card>
          <div className="p-4 border-b border-white/5 flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3)' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-white focus:outline-none focus:border-purple-500/50"
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

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/[0.02]">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Order</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Customer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Payment</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Total</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{order.order_number}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(order.created_at).toLocaleDateString('en-IN')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white">
                          {[order.first_name, order.last_name].filter(Boolean).join(' ') || 'N/A'}
                        </p>
                        <p className="text-xs text-slate-500">{order.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-white">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <p>No orders found</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import { SearchIcon, EyeIcon, PhoneIcon } from '@heroicons/react/outline';

interface Customer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  accept_marketing: boolean;
  orders_count: number;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.first_name && c.first_name.toLowerCase().includes(search.toLowerCase())) ||
    (c.last_name && c.last_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title text-white">Customers</h1>
            <p className="text-slate-400 mt-1">{customers.length} total customers</p>
          </div>
        </div>

        <Card>
          <div className="p-4 border-b border-white/5">
            <div className="relative max-w-md">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3)' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/[0.02]">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Customer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Phone</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Orders</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Marketing</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-medium">
                            {(customer.first_name || customer.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {[customer.first_name, customer.last_name].filter(Boolean).join(' ') || 'N/A'}
                            </p>
                            <p className="text-sm text-slate-500">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {customer.phone ? (
                          <div className="flex items-center gap-2 text-slate-300">
                            <PhoneIcon className="w-4 h-4" />
                            {customer.phone}
                          </div>
                        ) : (
                          <span className="text-slate-500">No phone</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-white">{customer.orders_count}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          customer.accept_marketing ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                        }`}>
                          {customer.accept_marketing ? 'Subscribed' : 'Not subscribed'}
                        </span>
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
              <p>No customers found</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
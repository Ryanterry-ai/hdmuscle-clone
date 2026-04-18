'use client';

import { useState, useEffect } from 'react';
import { SearchIcon, EyeIcon, MailIcon, PhoneIcon } from '@heroicons/react/outline';

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
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 mt-1">{customers.length} total customers</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Location</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Orders</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Marketing</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                          {(customer.first_name || customer.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {[customer.first_name, customer.last_name].filter(Boolean).join(' ') || 'N/A'}
                          </p>
                          <p className="text-sm text-slate-500">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {customer.phone ? (
                        <div className="flex items-center gap-2 text-slate-600">
                          <PhoneIcon className="w-4 h-4" />
                          {customer.phone}
                        </div>
                      ) : (
                        <span className="text-slate-400">No phone</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">{customer.orders_count}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        customer.accept_marketing ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {customer.accept_marketing ? 'Subscribed' : 'Not subscribed'}
                      </span>
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
            <p className="text-slate-500">No customers found</p>
          </div>
        )}
      </div>
    </div>
  );
}

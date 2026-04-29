// components/premium/SubscriptionTracker.jsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Search, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

// Mock data - replace with your actual API data
const mockSubscriptions = [
  {
    id: 'sub_1',
    userId: 'user_101',
    userName: 'Rajesh Kumar',
    userEmail: 'rajesh@example.com',
    planName: 'Premium',
    planPrice: '₹399',
    status: 'active',
    startDate: '2026-01-15',
    expiryDate: '2026-02-15',
    autoRenew: true,
    paymentMethod: 'UPI (Google Pay)',
    lastPaymentId: 'pay_001'
  },
  {
    id: 'sub_2',
    userId: 'user_102',
    userName: 'Priya Sharma',
    userEmail: 'priya@example.com',
    planName: 'Annual Plan',
    planPrice: '₹3,999',
    status: 'active',
    startDate: '2025-11-01',
    expiryDate: '2026-11-01',
    autoRenew: true,
    paymentMethod: 'Credit Card',
    lastPaymentId: 'pay_002'
  },
  {
    id: 'sub_3',
    userId: 'user_103',
    userName: 'Amit Patel',
    userEmail: 'amit@example.com',
    planName: 'Family Plan',
    planPrice: '₹599',
    status: 'expired',
    startDate: '2025-10-10',
    expiryDate: '2026-01-10',
    autoRenew: false,
    paymentMethod: 'Net Banking',
    lastPaymentId: 'pay_003'
  },
  {
    id: 'sub_4',
    userId: 'user_104',
    userName: 'Neha Gupta',
    userEmail: 'neha@example.com',
    planName: 'Basic',
    planPrice: '₹199',
    status: 'cancelled',
    startDate: '2025-12-05',
    expiryDate: '2026-01-05',
    autoRenew: false,
    paymentMethod: 'Wallet',
    lastPaymentId: 'pay_004'
  },
  {
    id: 'sub_5',
    userId: 'user_105',
    userName: 'Vikram Singh',
    userEmail: 'vikram@example.com',
    planName: 'Premium',
    planPrice: '₹399',
    status: 'pending',
    startDate: '2026-01-20',
    expiryDate: '2026-02-20',
    autoRenew: true,
    paymentMethod: 'Credit Card',
    lastPaymentId: 'pay_005'
  }
];

export default function SubscriptionTracker() {
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const getStatusBadge = (status) => {
    const badges = {
      active: { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
      expired: { icon: <XCircle className="w-4 h-4" />, color: 'bg-red-100 text-red-700' },
      cancelled: { icon: <XCircle className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700' },
      pending: { icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-700' }
    };
    return badges[status] || badges.pending;
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.planName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    expired: subscriptions.filter(s => s.status === 'expired').length,
    totalRevenue: subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + parseInt(s.planPrice.replace(/[^0-9]/g, '')), 0)
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Subscribers</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Expired/Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-orange-600">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email or plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Subscriptions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">User</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Plan</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Price</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Expiry Date</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Auto Renew</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub) => {
                  const statusBadge = getStatusBadge(sub.status);
                  return (
                    <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-slate-900">{sub.userName}</p>
                          <p className="text-xs text-slate-500">{sub.userEmail}</p>
                        </div>
                      </td>
                      <td className="p-3 font-medium text-slate-900">{sub.planName}</td>
                      <td className="p-3 text-slate-700">{sub.planPrice}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                          {statusBadge.icon}
                          {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-slate-700">{sub.expiryDate}</td>
                      <td className="p-3">
                        <span className={`text-sm ${sub.autoRenew ? 'text-green-600' : 'text-red-600'}`}>
                          {sub.autoRenew ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="p-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSubscription(sub)}
                          className="text-sm"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Details Modal */}
      {selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Subscription Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedSubscription(null)}>
                ✕
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-500">User Name</p>
                <p className="font-medium">{selectedSubscription.userName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium">{selectedSubscription.userEmail}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Plan</p>
                <p className="font-medium">{selectedSubscription.planName} - {selectedSubscription.planPrice}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Start Date</p>
                <p className="font-medium">{selectedSubscription.startDate}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Expiry Date</p>
                <p className="font-medium">{selectedSubscription.expiryDate}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Payment Method</p>
                <p className="font-medium">{selectedSubscription.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Last Payment ID</p>
                <p className="font-medium text-xs">{selectedSubscription.lastPaymentId}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
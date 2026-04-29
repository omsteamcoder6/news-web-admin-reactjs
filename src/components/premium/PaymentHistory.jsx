// components/premium/PaymentHistory.jsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Download, Filter, Calendar, DollarSign, CreditCard, Search, Loader2 } from 'lucide-react';
import paymentService from '../../services/paymentService';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalRevenue: 0,
    successCount: 0,
    failedCount: 0,
    avgPayment: 0
  });

  // Fetch payments from API
  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.getAllPayments();
      if (result.success) {
        setPayments(result.data);
      } else {
        setError(result.error || 'Failed to fetch payments');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await paymentService.getPaymentStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      success: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
      refunded: 'bg-purple-100 text-purple-700'
    };
    return badges[status] || badges.pending;
  };

  // Apply filters
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.paymentMethod.toLowerCase().includes(filterMethod.toLowerCase());
    const matchesDate = (!dateRange.start || payment.date >= dateRange.start) &&
                       (!dateRange.end || payment.date <= dateRange.end);
    return matchesSearch && matchesStatus && matchesMethod && matchesDate;
  });

  const downloadReport = () => {
    const csv = [
      ['Transaction ID', 'User', 'Email', 'Plan', 'Amount', 'Status', 'Payment Method', 'Date', 'Invoice Number'],
      ...filteredPayments.map(p => [
        p.transactionId,
        p.userName,
        p.userEmail,
        p.planName,
        p.amount,
        p.status,
        p.paymentMethod,
        p.date,
        p.invoiceNumber || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-2 text-slate-600">Loading payments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={fetchPayments} className="mt-2">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards - Same as before but using stats state */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Transactions</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalPayments}</p>
              </div>
              <CreditCard className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Successful Payments</p>
                <p className="text-2xl font-bold text-green-600">{stats.successCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg. Payment Value</p>
                <p className="text-2xl font-bold text-orange-600">₹{Math.round(stats.avgPayment).toLocaleString()}</p>
              </div>
              <Filter className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table - Same as your original code */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Payment Transactions</CardTitle>
            <Button onClick={downloadReport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email or transaction ID..."
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
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Payment Methods</option>
              <option value="razorpay">Razorpay</option>
              <option value="card">Credit Card</option>
              <option value="upi">UPI</option>
              <option value="netbanking">Net Banking</option>
            </select>
            <div className="flex gap-2">
              <input
                type="date"
                placeholder="From"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="date"
                placeholder="To"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Payments Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Transaction ID</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">User</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Plan</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Amount</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Payment Method</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Date</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-mono text-xs text-slate-600">{payment.transactionId}</td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-slate-900">{payment.userName}</p>
                        <p className="text-xs text-slate-500">{payment.userEmail}</p>
                      </div>
                    </td>
                    <td className="p-3 font-medium text-slate-900">{payment.planName}</td>
                    <td className="p-3 font-semibold text-slate-900">₹{payment.amount.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-slate-700">{payment.paymentMethod}</td>
                    <td className="p-3 text-sm text-slate-700">{payment.date}</td>
                    <td className="p-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPayment(payment)}
                        className="text-sm"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Modal - Same as your original */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Payment Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(null)}>
                ✕
              </Button>
            </div>
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-xs text-slate-500">Transaction ID</p>
                <p className="font-mono text-sm font-medium">{selectedPayment.transactionId}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">User</p>
                <p className="font-medium">{selectedPayment.userName}</p>
                <p className="text-xs text-slate-500">{selectedPayment.userEmail}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-slate-500">Plan</p>
                  <p className="font-medium">{selectedPayment.planName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Amount</p>
                  <p className="font-bold text-orange-600 text-lg">₹{selectedPayment.amount.toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <p className={`font-medium ${getStatusBadge(selectedPayment.status)} inline-block px-2 py-1 rounded`}>
                    {selectedPayment.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Payment Method</p>
                  <p className="font-medium">{selectedPayment.paymentMethod}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="font-medium">{selectedPayment.date}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Time</p>
                  <p className="font-medium">{selectedPayment.time}</p>
                </div>
              </div>
              {selectedPayment.invoiceNumber && (
                <div>
                  <p className="text-sm text-slate-500">Invoice Number</p>
                  <p className="font-medium">{selectedPayment.invoiceNumber}</p>
                </div>
              )}
              {selectedPayment.failureReason && (
                <div className="bg-red-50 p-3 rounded">
                  <p className="text-sm text-red-600">Failure Reason: {selectedPayment.failureReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
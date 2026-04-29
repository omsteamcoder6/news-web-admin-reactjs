// services/paymentService.js
import apiClient from "../lib/apiClient";

class PaymentService {
  // Get all payments (for admin side)
  async getAllPayments(filters = {}) {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.search) queryParams.append('search', filters.search);
      
      const queryString = queryParams.toString();
      const endpoint = `/subscriptions/payments${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get(endpoint);
      
      // Transform backend data to match frontend expected format
      const transformedPayments = await this.transformPaymentsData(response.data);
      
      return {
        success: true,
        data: transformedPayments,
        count: transformedPayments.length
      };
    } catch (error) {
      console.error('Error fetching payments:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Get payment statistics (for dashboard stats)
  async getPaymentStats() {
    try {
      const response = await apiClient.get('/subscriptions/stats/dashboard');
      
      // Transform stats to match frontend expected format
      const stats = {
        totalPayments: response.data.totalSubscribers || 0,
        totalRevenue: response.data.totalRevenue || 0,
        successCount: response.data.totalSubscribers || 0, // You'll need to adjust this based on your actual data
        failedCount: 0, // This needs separate API or calculation
        avgPayment: response.data.totalRevenue && response.data.totalSubscribers 
          ? response.data.totalRevenue / response.data.totalSubscribers 
          : 0
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalPayments: 0,
        totalRevenue: 0,
        successCount: 0,
        failedCount: 0,
        avgPayment: 0
      };
    }
  }

  // Transform payment data from backend format to frontend format
  async transformPaymentsData(payments) {
    if (!payments || !Array.isArray(payments)) return [];
    
    // Fetch user details for each payment (if user object is just ID)
    const transformedPayments = await Promise.all(payments.map(async (payment) => {
      let userName = 'Unknown User';
      let userEmail = 'unknown@example.com';
      
      // If user is populated, extract name and email
      if (payment.user && typeof payment.user === 'object') {
        userName = payment.user.name || 'Unknown User';
        userEmail = payment.user.email || 'unknown@example.com';
      } else if (payment.userId && typeof payment.userId === 'object') {
        userName = payment.userId.name || 'Unknown User';
        userEmail = payment.userId.email || 'unknown@example.com';
      }
      
      // Extract plan name
      let planName = 'Unknown Plan';
      if (payment.plan && typeof payment.plan === 'object') {
        planName = payment.plan.name || 'Unknown Plan';
      }
      
      // Format date
      const createdAt = payment.createdAt || payment.created_at;
      const dateObj = new Date(createdAt);
      const date = dateObj.toISOString().split('T')[0];
      const time = dateObj.toTimeString().split(' ')[0];
      
      return {
        id: payment._id,
        transactionId: payment.transactionId || payment.razorpayPaymentId || `TXN_${payment._id}`,
        userId: payment.user?._id || payment.user || payment.userId,
        userName: userName,
        userEmail: userEmail,
        planName: planName,
        amount: payment.amount,
        currency: 'INR',
        status: payment.paymentStatus || payment.status || 'pending',
        paymentMethod: this.formatPaymentMethod(payment.paymentMethod),
        date: date,
        time: time,
        invoiceNumber: payment.invoiceNumber || null,
        failureReason: payment.metadata?.failureReason || null,
        refundDate: payment.refundDate || null,
        orderId: payment.orderId || payment.razorpayOrderId
      };
    }));
    
    return transformedPayments;
  }

  // Format payment method for display
  formatPaymentMethod(method) {
    const methods = {
      'razorpay': 'Razorpay',
      'stripe': 'Credit Card (Stripe)',
      'paypal': 'PayPal',
      'card': 'Credit/Debit Card',
      'upi': 'UPI',
      'netbanking': 'Net Banking',
      'wallet': 'Digital Wallet',
      'cash': 'Cash'
    };
    return methods[method] || method || 'Unknown';
  }

  // Export payments report (CSV)
  async exportPaymentsReport(filters = {}) {
    try {
      const result = await this.getAllPayments(filters);
      if (result.success && result.data.length > 0) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Error exporting payments:', error);
      return [];
    }
  }

  // Get single payment details
  async getPaymentById(paymentId) {
    try {
      const response = await apiClient.get(`/subscriptions/payments/${paymentId}`);
      const transformed = await this.transformPaymentsData([response.data]);
      return transformed[0] || null;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      return null;
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;
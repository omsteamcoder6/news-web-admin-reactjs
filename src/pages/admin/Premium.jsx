// pages/premium/Premium.jsx
'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '../../layout/MainLayout';
import { Button } from '../../components/ui/Button';
import { Plus, Users, CreditCard, LayoutGrid } from 'lucide-react';
import PremiumCard from '../../components/premium/PremiumCard';
import PremiumForm from '../../components/premium/PremiumForm';
import SubscriptionTracker from '../../components/premium/SubscriptionTracker';
import PaymentHistory from '../../components/premium/PaymentHistory';
import subapi from '../../lib/subapi';
import { useAuthStore } from '../../stores/authStore';

export default function PremiumPage() {
  const [activeTab, setActiveTab] = useState('plans');
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await subapi.getAllPlans();
      console.log('API Response:', response);
      // FIXED: Handle both response formats
      const plans = response.data || response;
      setSubscriptionPlans(plans);
      setError(null);
    } catch (err) {
      console.error('Failed to load plans:', err);
      setError(err.message || 'Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'plans', label: 'Plan Management', icon: LayoutGrid },
    { id: 'subscriptions', label: 'Subscription Tracker', icon: Users },
    { id: 'payments', label: 'Payment History', icon: CreditCard },
  ];

  // ========== FIXED: Removed the filter that was hiding plans ==========
  // Now ALL plans from database will show regardless of login status
  const visiblePlans = subscriptionPlans;  // DIRECT ACCESS - NO FILTERING

  const handleCreatePlan = async (newPlan) => {
    try {
      const planData = {
        name: newPlan.name,
        price: newPlan.price.replace('₹', ''),
        period: newPlan.period,
        features: newPlan.features,
        isLimitedOffer: newPlan.isLimitedOffer || false,
        isUnlimited: newPlan.isUnlimited || false,
        magazineLimit: newPlan.magazineLimit ? parseInt(newPlan.magazineLimit) : null,
      };
      
      await subapi.createPlan(planData);
      await loadPlans();
      setIsFormOpen(false);
    } catch (err) {
      console.error('Failed to create plan:', err);
      setError(err.message || 'Failed to create plan');
    }
  };

  const handleEditPlan = async (updatedPlan) => {
    try {
      const planData = {
        name: updatedPlan.name,
        price: updatedPlan.price.replace('₹', ''),
        period: updatedPlan.period,
        features: updatedPlan.features,
        isLimitedOffer: updatedPlan.isLimitedOffer || false,
        isUnlimited: updatedPlan.isUnlimited || false,
        magazineLimit: updatedPlan.magazineLimit ? parseInt(updatedPlan.magazineLimit) : null,
      };
      
      await subapi.updatePlan(updatedPlan.id, planData);
      await loadPlans();
      setEditingPlan(null);
      setIsFormOpen(false);
    } catch (err) {
      console.error('Failed to update plan:', err);
      setError(err.message || 'Failed to update plan');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      await subapi.deletePlan(planId);
      await loadPlans();
    } catch (err) {
      console.error('Failed to delete plan:', err);
      setError(err.message || 'Failed to delete plan');
    }
  };

  const handleOpenEditForm = (plan) => {
    const formattedPlan = {
      id: plan._id || plan.id,
      name: plan.name,
      price: `₹${plan.price}`,
      period: plan.period,
      features: plan.features,
      subscribers: plan.subscribers || 0,
      isLimitedOffer: plan.isLimitedOffer,
      isUnlimited: plan.isUnlimited,
      magazineLimit: plan.magazineLimit,
      eligibleUsers: plan.eligibleUsers || [],
    };
    setEditingPlan(formattedPlan);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPlan(null);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Premium Content & Subscriptions</h1>
            <p className="text-slate-600 mt-1">Manage subscription plans, track users, and view payments</p>
          </div>
          {activeTab === 'plans' && (
            <Button 
              className="bg-orange-500 hover:bg-orange-600 gap-2"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="w-4 h-4" />
              New Plan
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p>{error}</p>
            <button 
              onClick={loadPlans}
              className="text-sm underline mt-2"
            >
              Try again
            </button>
          </div>
        )}

        <div className="border-b border-slate-200">
          <nav className="flex gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-1 py-3 text-sm font-medium transition-all duration-200
                    ${activeTab === tab.id 
                      ? 'text-orange-500 border-b-2 border-orange-500' 
                      : 'text-slate-600 hover:text-slate-900 border-b-2 border-transparent'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'plans' && (
            <>
              {isAuthenticated && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  👤 Logged in as: <strong>{user?.email || user?.id}</strong>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {visiblePlans.map((plan) => (
                  <PremiumCard 
                    key={plan._id || plan.id} 
                    plan={plan} 
                    onEdit={handleOpenEditForm}
                    onDelete={handleDeletePlan}
                  />
                ))}
              </div>
              {visiblePlans.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500">No plans available.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsFormOpen(true)}
                  >
                    Create your first plan
                  </Button>
                </div>
              )}
            </>
          )}

          {activeTab === 'subscriptions' && (
            <SubscriptionTracker 
              getMySubscription={subapi.getMySubscription}
              cancelSubscription={subapi.cancelSubscription}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentHistory 
              getPaymentHistory={subapi.getPaymentHistory}
            />
          )}
        </div>

        {isFormOpen && (
          <PremiumForm
            initialData={editingPlan}
            onSubmit={editingPlan ? handleEditPlan : handleCreatePlan}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </MainLayout>
  );
}
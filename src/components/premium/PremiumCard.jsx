'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Edit2, Trash2 } from 'lucide-react';

export default function PremiumCard({ plan, onEdit, onDelete }) {
  return (
    <Card className="border-2 border-slate-200 hover:border-orange-500 transition relative">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          {plan.isLimitedOffer && (
            <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
              🔥 Limited Offer
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          {/* FIXED: Added ₹ symbol in front of price */}
          <span className="text-3xl font-bold text-orange-500">₹{plan.price}</span>
          <p className="text-sm text-slate-600">/{plan.period}</p>
        </div>
        
        {/* Magazine Limit Display */}
        {plan.isLimitedOffer && plan.magazineLimit && (
          <div className="bg-orange-50 p-2 rounded-lg">
            <p className="text-sm text-orange-700 font-semibold">
              📖 {plan.magazineLimit} magazines per month
            </p>
            <p className="text-xs text-orange-600 mt-1">
              + Free articles included
            </p>
          </div>
        )}
        
        {/* Unlimited badge */}
        {plan.isUnlimited && (
          <div className="bg-green-50 p-2 rounded-lg">
            <p className="text-sm text-green-700 font-semibold">
              ♾️ Unlimited Access
            </p>
          </div>
        )}
        
        <ul className="space-y-2">
          {plan.features?.map((feature, idx) => (
            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">✓</span> 
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            {plan.subscribers?.toLocaleString() || 0} subscribers
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-orange-500 hover:bg-orange-600 gap-2"
            onClick={() => onEdit(plan)}
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
          {onDelete && (
            <Button 
              variant="outline"
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(plan._id || plan.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
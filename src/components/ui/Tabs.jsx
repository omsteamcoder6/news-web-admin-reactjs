'use client';

import { createContext, useContext, useState } from 'react';

const TabsContext = createContext();

export function Tabs({ value, onValueChange, children, className = '' }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }) {
  return (
    <div className={`flex space-x-1 rounded-lg bg-slate-100 p-1 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = '' }) {
  const { value: selectedValue, onValueChange } = useContext(TabsContext);
  const isActive = selectedValue === value;
  
  return (
    <button
      className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
        isActive 
          ? 'bg-white text-slate-900 shadow-sm' 
          : 'text-slate-600 hover:text-slate-900'
      } ${className}`}
      onClick={() => onValueChange(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = '' }) {
  const { value: selectedValue } = useContext(TabsContext);
  
  if (selectedValue !== value) return null;
  
  return <div className={className}>{children}</div>;
}
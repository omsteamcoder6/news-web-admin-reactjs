// dialog.jsx
import * as React from "react";

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-4xl mx-4">
        {children}
      </div>
    </div>
  );
};

export const DialogTrigger = ({ asChild, children, onClick }) => {
  // If asChild is true, clone the child with onClick handler
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        if (children.props.onClick) children.props.onClick(e);
        if (onClick) onClick(e);
      }
    });
  }
  
  // Otherwise, render a button
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
};

export const DialogContent = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar ${className}`}>
      {children}
    </div>
  );
};

export const DialogHeader = ({ children }) => {
  return (
    <div className="px-6 pt-6 pb-4 border-b border-gray-200 sticky top-0 bg-white z-10">
      {children}
    </div>
  );
};

export const DialogTitle = ({ children }) => {
  return (
    <h2 className="text-2xl font-bold text-slate-900">
      {children}
    </h2>
  );
};

export const DialogDescription = ({ children }) => {
  return (
    <p className="text-sm text-gray-500 mt-1">
      {children}
    </p>
  );
};

export const DialogFooter = ({ children }) => {
  return (
    <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2 sticky bottom-0 bg-white">
      {children}
    </div>
  );
};
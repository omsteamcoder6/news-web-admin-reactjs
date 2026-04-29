import * as React from "react";

export const Select = ({ children, value, onValueChange }) => {
  const [open, setOpen] = React.useState(false);
  
  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { onClick: () => setOpen(!open), value });
        }
        if (child.type === SelectContent) {
          return open ? React.cloneElement(child, { 
            onSelect: (val) => {
              onValueChange(val);
              setOpen(false);
            }
          }) : null;
        }
        return child;
      })}
    </div>
  );
};

export const SelectTrigger = ({ children, onClick, value, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${className}`}
    >
      {children || value || "Select option"}
    </button>
  );
};

export const SelectValue = ({ placeholder, children }) => {
  return <span>{children || placeholder}</span>;
};

export const SelectContent = ({ children, onSelect }) => {
  return (
    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
      {React.Children.map(children, child => {
        if (child.type === SelectItem) {
          return React.cloneElement(child, { onSelect });
        }
        return child;
      })}
    </div>
  );
};

export const SelectItem = ({ children, value, onSelect }) => {
  return (
    <div
      className="px-3 py-2 hover:bg-orange-50 cursor-pointer"
      onClick={() => onSelect(value)}
    >
      {children}
    </div>
  );
};
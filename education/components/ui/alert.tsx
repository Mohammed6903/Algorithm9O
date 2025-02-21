// src/components/ui/Alert.tsx

import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'info' | 'warning';
}

const Alert: React.FC<AlertProps> = ({ children, variant = 'info' }) => {
  const alertStyles = {
    success: 'bg-green-100 border border-green-400 text-green-700',
    error: 'bg-red-100 border border-red-400 text-red-700',
    info: 'bg-blue-100 border border-blue-400 text-blue-700',
    warning: 'bg-yellow-100 border border-yellow-400 text-yellow-700',
  };

  return (
    <div className={`p-4 rounded-lg ${alertStyles[variant]}`} role="alert">
      {children}
    </div>
  );
};

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;  // Add className here
}

const AlertDescription: React.FC<AlertDescriptionProps> = ({ children, className = '' }) => {
  return <div className={`mt-2 text-sm ${className}`}>{children}</div>; // Apply className here
};

// Export the components
export { Alert, AlertDescription };

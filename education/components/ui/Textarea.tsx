// src/components/ui/Textarea.tsx

import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, className, ...props }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>}
      <textarea
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
        {...props}
      />
    </div>
  );
};

export default Textarea;

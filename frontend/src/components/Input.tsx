import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  noMargin?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  required,
  disabled,
  className,
  noMargin,
  ...inputProps
}) => {
  return (
    <div className={noMargin ? '' : 'mb-4'}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-black-500 ml-1">*</span>}
      </label>
      <input
        {...inputProps}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-black transition-all ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} ${className || ''}`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fullWidth = false
}) => {
  const baseClasses =
    'font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-black text-white hover:bg-gray-800 focus:ring-gray-400 border border-black',
    secondary:
      'bg-white text-black border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-400',
    danger: 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-400 border border-gray-800',
    outline: 'border border-black text-black hover:bg-black hover:text-white focus:ring-gray-400',
    ghost: 'text-black hover:bg-gray-100 focus:ring-gray-400'
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${className}`;

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
};

export default Button;

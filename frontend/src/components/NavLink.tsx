import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, isActive, children, className = '' }) => {
  return (
    <Link 
      to={to} 
      className={`px-4 py-2 text-sm font-medium transition-colors duration-150 ${
        isActive 
          ? 'bg-gray-100 text-black' 
          : 'text-gray-600 hover:text-black hover:bg-gray-50'
      } ${className}`}
    >
      {children}
    </Link>
  );
};

export default NavLink;

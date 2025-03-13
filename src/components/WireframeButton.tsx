import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

type WireframeButtonProps = {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

const WireframeButton: React.FC<WireframeButtonProps> = ({
  children = 'Button',
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
  disabled = false,
  onClick,
}) => {
  const variantClasses = {
    primary: 'bg-[#0f2c59] hover:bg-[#1a3e6c] text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
    outline: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700',
    text: 'bg-transparent hover:bg-gray-100 text-gray-700',
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} 
        rounded font-medium focus:outline-none
        ${className}
      `}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default WireframeButton; 
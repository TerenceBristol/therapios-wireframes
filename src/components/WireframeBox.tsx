import React from 'react';

type WireframeBoxProps = {
  children?: React.ReactNode;
  height?: string;
  width?: string;
  label?: string;
  className?: string;
};

const WireframeBox: React.FC<WireframeBoxProps> = ({
  children,
  height = 'h-32',
  width = 'w-full',
  label,
  className = '',
}) => {
  return (
    <div className={`relative ${width} ${height} ${className}`}>
      <div className="absolute inset-0 border-2 border-dashed border-gray-300 bg-white p-4 flex flex-col items-center justify-center">
        {label && (
          <span className="text-gray-500 text-sm absolute top-2 left-2">{label}</span>
        )}
        {children || (
          <span className="text-gray-400 text-center">Content Area</span>
        )}
      </div>
    </div>
  );
};

export default WireframeBox; 
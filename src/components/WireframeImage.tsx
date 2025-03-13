import React from 'react';

type WireframeImageProps = {
  width?: string;
  height?: string;
  label?: string;
  className?: string;
};

const WireframeImage: React.FC<WireframeImageProps> = ({
  width = 'w-full',
  height = 'h-40',
  label = 'Image',
  className = '',
}) => {
  return (
    <div className={`${width} ${height} ${className} bg-gray-200 border border-gray-300 flex items-center justify-center`}>
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-1 text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
};

export default WireframeImage; 
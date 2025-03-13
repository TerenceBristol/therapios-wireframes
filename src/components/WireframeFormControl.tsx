import React from 'react';

type InputType = 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';

type WireframeFormControlProps = {
  label?: string;
  type?: InputType;
  placeholder?: string;
  className?: string;
  options?: string[];
  disabled?: boolean;
};

const WireframeFormControl: React.FC<WireframeFormControlProps> = ({
  label = 'Label',
  type = 'text',
  placeholder = 'Placeholder',
  className = '',
  options = ['Option 1', 'Option 2', 'Option 3'],
  disabled = false,
}) => {
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
            placeholder={placeholder}
            rows={3}
            disabled={disabled}
          />
        );
      case 'select':
        return (
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
            disabled={disabled}
          >
            <option value="">{placeholder}</option>
            {options.map((option, index) => (
              <option key={index} value={option.toLowerCase().replace(/\s+/g, '-')}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className="mt-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={disabled}
                />
                <label className="ml-2 block text-sm text-gray-900">{option}</label>
              </div>
            ))}
          </div>
        );
      case 'radio':
        return (
          <div className="mt-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  name="radio-group"
                  disabled={disabled}
                />
                <label className="ml-2 block text-sm text-gray-900">{option}</label>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <input
            type={type}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
            placeholder={placeholder}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      {renderInput()}
    </div>
  );
};

export default WireframeFormControl; 
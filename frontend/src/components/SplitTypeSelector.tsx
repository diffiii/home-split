import React from 'react';
import { SplitType } from '../types';

interface SplitTypeSelectorProps {
  value: SplitType;
  onChange: (type: SplitType) => void;
  className?: string;
}

const SplitTypeSelector: React.FC<SplitTypeSelectorProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const splitTypes = [
    {
      type: 'equal' as SplitType,
      label: 'Equal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M5 8h14" />
        </svg>
      )
    },
    {
      type: 'percentage' as SplitType,
      label: 'Percentage',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 5l-14 14" />
          <circle cx="6.5" cy="6.5" r="2.5" strokeWidth={2} fill="currentColor" />
          <circle cx="17.5" cy="17.5" r="2.5" strokeWidth={2} fill="currentColor" />
        </svg>
      )
    },
    {
      type: 'fixed' as SplitType,
      label: 'Fixed',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="3" width="16" height="18" rx="2" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h8M8 11h5M8 15h3"
          />
        </svg>
      )
    },
    {
      type: 'parts' as SplitType,
      label: 'Parts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="8" y="4" width="8" height="4" strokeWidth={2} fill="currentColor" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h12" />
          <rect x="8" y="16" width="8" height="4" strokeWidth={2} fill="currentColor" />
        </svg>
      )
    },
    {
      type: 'plus_minus' as SplitType,
      label: 'Plus/Minus',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 3v10m-5-5h10"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17h10" />
        </svg>
      )
    }
  ];

  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">Split Type</label>
      <div className="grid grid-cols-5 gap-2">
        {splitTypes.map(splitType => {
          const isSelected = value === splitType.type;
          return (
            <button
              key={splitType.type}
              type="button"
              onClick={() => onChange(splitType.type)}
              className={`
                flex flex-col items-center justify-center p-1.5 rounded-lg border-2 transition-all min-h-[50px]
                ${
                  isSelected
                    ? 'border-black bg-gray-50 text-black'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }
              `}
              title={splitType.label}
            >
              {splitType.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SplitTypeSelector;

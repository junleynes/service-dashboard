import React from 'react';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  ariaLabel?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label, ariaLabel }) => {
  return (
    <label htmlFor={id} className="flex items-center cursor-pointer select-none" aria-label={ariaLabel}>
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`block w-14 h-8 rounded-full transition-colors ${checked ? 'bg-cyan-500' : 'bg-[--bg-tertiary]'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out ${checked ? 'transform translate-x-6' : ''}`}></div>
      </div>
      {label && <div className="ml-3 text-[--text-secondary] font-medium">{label}</div>}
    </label>
  );
};

export default ToggleSwitch;
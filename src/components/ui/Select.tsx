// Select Component

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  isSearchable?: boolean;
  isMulti?: boolean;
  isClearable?: boolean;
  onChange?: (value: string | string[]) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      options,
      placeholder = 'Select an option',
      isSearchable = false,
      isMulti = false,
      isClearable = false,
      onChange,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<string | string[]>(
      (props.value as string | string[]) || (isMulti ? [] : '')
    );
    const wrapperRef = useRef<HTMLDivElement>(null);
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (value: string) => {
      let newValue: string | string[];

      if (isMulti) {
        const currentArray = Array.isArray(selected) ? selected : [];
        if (currentArray.includes(value)) {
          newValue = currentArray.filter((v) => v !== value);
        } else {
          newValue = [...currentArray, value];
        }
      } else {
        newValue = value;
        setIsOpen(false);
      }

      setSelected(newValue);
      onChange?.(newValue);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelected(isMulti ? [] : '');
      onChange?.(isMulti ? [] : '');
    };

    const getDisplayValue = () => {
      if (isMulti) {
        const selectedOptions = options.filter((o) =>
          (selected as string[]).includes(o.value)
        );
        if (selectedOptions.length === 0) return placeholder;
        return selectedOptions.map((o) => o.label).join(', ');
      }

      const selectedOption = options.find((o) => o.value === selected);
      return selectedOption?.label || placeholder;
    };

    return (
      <div className="w-full" ref={wrapperRef}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <div
            className={cn(
              'flex items-center justify-between w-full rounded-lg border bg-white cursor-pointer',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'disabled:bg-slate-50 disabled:cursor-not-allowed',
              error
                ? 'border-red-300'
                : 'border-slate-200 hover:border-slate-300',
              'py-2.5 px-4 text-sm'
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            <span
              className={cn(
                'truncate',
                !selected || (Array.isArray(selected) && selected.length === 0)
                  ? 'text-slate-400'
                  : 'text-slate-900'
              )}
            >
              {getDisplayValue()}
            </span>
            <div className="flex items-center gap-2">
              {isClearable && selected && (
                <X
                  className="w-4 h-4 text-slate-400 hover:text-slate-600"
                  onClick={handleClear}
                />
              )}
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-slate-400 transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </div>
          </div>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-slate-200 shadow-lg animate-fade-in">
              {isSearchable && (
                <div className="p-2 border-b border-slate-100">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              <div className="max-h-60 overflow-y-auto py-1">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-slate-500">
                    No options found
                  </div>
                ) : (
                  filteredOptions.map((option) => {
                    const isSelected = isMulti
                      ? (selected as string[]).includes(option.value)
                      : selected === option.value;

                    return (
                      <div
                        key={option.value}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 text-sm cursor-pointer transition-colors',
                          option.disabled
                            ? 'text-slate-400 cursor-not-allowed'
                            : 'hover:bg-slate-50',
                          isSelected && 'bg-primary-50 text-primary-700'
                        )}
                        onClick={() =>
                          !option.disabled && handleSelect(option.value)
                        }
                      >
                        {option.icon && <span>{option.icon}</span>}
                        <span className="flex-1">{option.label}</span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary-600" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-slate-500">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

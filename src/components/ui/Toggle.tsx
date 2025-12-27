// Toggle Component

import React from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, description, size = 'md', id, ...props }, ref) => {
    const toggleId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const sizes = {
      sm: {
        track: 'w-8 h-4',
        thumb: 'w-3 h-3',
        translate: 'translate-x-4',
      },
      md: {
        track: 'w-11 h-6',
        thumb: 'w-5 h-5',
        translate: 'translate-x-5',
      },
      lg: {
        track: 'w-14 h-7',
        thumb: 'w-6 h-6',
        translate: 'translate-x-7',
      },
    };

    return (
      <div className="flex items-center justify-between">
        {(label || description) && (
          <div className="mr-4">
            {label && (
              <label
                htmlFor={toggleId}
                className="block text-sm font-medium text-slate-700"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={toggleId}
            className="sr-only"
            {...props}
          />
          <label
            htmlFor={toggleId}
            className={cn(
              'relative inline-flex cursor-pointer rounded-full transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              props.checked ? 'bg-primary-600' : 'bg-slate-200',
              sizes[size].track
            )}
          >
            <span
              className={cn(
                'inline-block rounded-full bg-white shadow-sm transform transition-transform duration-200',
                props.checked && sizes[size].translate,
                sizes[size].thumb,
                !props.checked && 'translate-x-0.5'
              )}
            />
          </label>
        </div>
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

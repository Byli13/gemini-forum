import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-300 ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-space-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600',
            'focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50',
            'transition-all duration-200',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

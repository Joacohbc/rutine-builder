import type { InputHTMLAttributes } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  label?: string;
  error?: string;
}

export function Input({ className, icon, label, error, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-text-muted mb-1 ml-1">
          {label}
        </label>
      )}
      <div className={cn(
        "group relative flex items-center w-full h-12 rounded-2xl bg-surface-input border transition-all duration-200 shadow-sm",
        error 
          ? "border-error focus-within:border-error focus-within:ring-1 focus-within:ring-error"
          : "border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",
        className
      )}>
        {icon && (
          <div className={cn(
            "pl-4 pr-3 flex items-center justify-center transition-colors",
            error 
              ? "text-error"
              : "text-text-muted group-focus-within:text-primary"
          )}>
            <Icon name={icon} />
          </div>
        )}
        <input
          className={cn(
            "flex-1 bg-transparent border-none text-base font-normal text-text-main placeholder:text-text-muted focus:outline-none focus:ring-0",
            !icon && "px-4"
          )}
          {...props}
        />
        {error && (
          <div className="pr-3 flex items-center justify-center text-error">
            <Icon name="error" size={20} />
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-error mt-1 ml-1">
          {error}
        </p>
      )}
    </div>
  );
}

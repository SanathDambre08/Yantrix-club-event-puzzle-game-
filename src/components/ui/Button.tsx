import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-display uppercase tracking-widest font-black transition-all duration-100 disabled:opacity-50 disabled:pointer-events-none border-brutal';

  const variants: Record<string, string> = {
    primary:
      'bg-primary text-white shadow-brutal hover:bg-primary-hover active:shadow-brutal-active',
    secondary:
      'bg-surface text-text shadow-brutal hover:bg-surface-elevated active:shadow-brutal-active',
    ghost: 
      'bg-transparent text-text border-transparent hover:bg-surface-elevated hover:border-border',
    danger:
      'bg-danger text-white shadow-brutal hover:opacity-90 active:shadow-brutal-active',
    success:
      'bg-success text-black shadow-brutal hover:opacity-90 active:shadow-brutal-active',
  };

  const sizes: Record<string, string> = {
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-6 py-3 text-sm gap-2',
    lg: 'px-8 py-4 text-base gap-2.5',
    xl: 'px-10 py-5 text-lg gap-3 min-h-[60px]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : icon ? (
        <span className="shrink-0 mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

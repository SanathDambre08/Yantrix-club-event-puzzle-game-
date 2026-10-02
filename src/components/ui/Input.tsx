import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  icon,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-display font-bold uppercase text-text mb-1.5"
        >
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-text transition-colors">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-surface-elevated border-brutal px-4 py-3 text-text font-display font-bold placeholder:text-text-dim
            transition-all duration-100 focus:outline-none focus:bg-accent focus:text-black
            ${error ? 'border-danger bg-danger/10 focus:bg-danger text-danger focus:text-white' : ''}
            ${icon ? 'pl-12' : ''}
            ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-sm font-display font-bold text-danger bg-black text-white p-1 inline-block mt-2 shadow-brutal-sm">{error}</p>}
      {helperText && !error && (
        <p className="text-sm font-display font-bold text-text-muted mt-2">{helperText}</p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  options,
  placeholder,
  id,
  className = '',
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-display font-bold uppercase text-text mb-1.5"
        >
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-surface-elevated border-brutal px-4 py-3 text-text font-display font-bold
          transition-all duration-100 focus:outline-none focus:bg-accent focus:text-black appearance-none cursor-pointer
          ${error ? 'border-danger bg-danger/10 focus:bg-danger text-danger focus:text-white' : ''}
          ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm font-display font-bold text-danger bg-black text-white p-1 inline-block mt-2 shadow-brutal-sm">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  id,
  className = '',
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-display font-bold uppercase text-text mb-1.5"
        >
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full bg-surface-elevated border-brutal px-4 py-3 text-text font-display font-bold placeholder:text-text-dim
          transition-all duration-100 focus:outline-none focus:bg-accent focus:text-black resize-y min-h-[120px]
          ${error ? 'border-danger bg-danger/10 focus:bg-danger text-danger focus:text-white' : ''}
          ${className}`}
        {...props}
      />
      {error && <p className="text-sm font-display font-bold text-danger bg-black text-white p-1 inline-block mt-2 shadow-brutal-sm">{error}</p>}
    </div>
  );
}

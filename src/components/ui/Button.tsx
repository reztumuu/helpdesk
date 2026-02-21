import React from 'react';

type Variant = 'primary' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-5 py-2.5 text-base',
};

const variants: Record<Variant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded-lg',
  outline:
    'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg',
  danger:
    'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 rounded-lg',
};

export default function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: Props) {
  return (
    <button
      className={`${sizes[size]} ${variants[variant]} ${className || ''}`}
      {...props}
    />
  );
}

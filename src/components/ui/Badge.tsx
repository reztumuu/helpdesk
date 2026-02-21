import React from 'react';

type Variant = 'default' | 'success' | 'danger';

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  default:
    'bg-gray-100 text-gray-800',
  success:
    'bg-green-100 text-green-800',
  danger:
    'bg-red-100 text-red-800',
};

export default function Badge({ className, variant = 'default', ...props }: Props) {
  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${variants[variant]} ${className || ''}`}
      {...props}
    />
  );
}

import React from 'react';

type Props = React.SelectHTMLAttributes<HTMLSelectElement>;

const base =
  'border border-gray-300 rounded-lg px-3 py-2 w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';

export default function Select({ className, children, ...props }: Props) {
  return (
    <select className={`${base} ${className || ''}`} {...props}>
      {children}
    </select>
  );
}

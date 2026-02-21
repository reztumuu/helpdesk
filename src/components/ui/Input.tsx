import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

const base =
  'border border-gray-300 rounded-lg px-3 py-2 w-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';

export default function Input({ className, ...props }: Props) {
  return <input className={`${base} ${className || ''}`} {...props} />;
}

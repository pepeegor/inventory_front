import React from 'react'
import clsx from 'clsx'

export default function Select({ options, className, label, children, ...props }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      <select
        className={clsx(
          'w-full px-4 py-2 rounded-md bg-[#1a1b1e] text-[#f0f0f5]',
          'border border-[#2e2e36] focus:outline-none focus:ring-2 focus:ring-[#8e6fff]',
          'transition-all duration-200',
          className
        )}
        {...props}
      >
        {options ? options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        )) : children}
      </select>
    </div>
  )
}

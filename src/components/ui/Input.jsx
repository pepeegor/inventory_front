import React from 'react'
import clsx from 'clsx'

export default function Input({ className, ...props }) {
  return (
    <input
      className={clsx(
        'w-full px-4 py-2 rounded-md bg-[#1a1b1e] text-[#f0f0f5] placeholder-[#a1a1b0]',
        'border border-[#2e2e36] focus:outline-none focus:ring-2 focus:ring-[#8e6fff]',
        'transition-all duration-200',
        className
      )}
      {...props}
    />
  )
}

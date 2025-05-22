import React from 'react'
import clsx from 'clsx'

export default function Button({ children, className, ...props }) {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded-lg font-semibold transition-colors duration-200',
        'bg-[#8e6fff] hover:bg-[#a58cff] text-white',
        'focus:outline-none focus:ring-2 focus:ring-[#8e6fff] focus:ring-offset-2 focus:ring-offset-[#0f0f11]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

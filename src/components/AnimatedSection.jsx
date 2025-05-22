import React from 'react'


export default function AnimatedSection({ className = '', children }) {
  return (
    <section className={`animate-fade-in-up ${className}`.trim()}>
      {children}
    </section>
  )
}

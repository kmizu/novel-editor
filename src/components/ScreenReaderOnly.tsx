import React from 'react'

interface ScreenReaderOnlyProps {
  children: React.ReactNode
  as?: 'span' | 'div' | 'p'
}

export function ScreenReaderOnly({ 
  children, 
  as = 'span' 
}: ScreenReaderOnlyProps) {
  return React.createElement(
    as,
    { className: 'sr-only' },
    children
  )
}
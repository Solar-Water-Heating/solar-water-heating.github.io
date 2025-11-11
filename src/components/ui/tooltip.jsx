import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

export const Tooltip = ({ children, content, tooltipWidth = 0 }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.top - 8, // mb-2 offset
        left: rect.left
      })
    }
  }, [isVisible])

  return (
    <div className="relative inline-flex">
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div
          className="fixed px-3 py-2 bg-slate-900 text-slate-100 text-xs rounded-md border border-slate-700 whitespace-normal shadow-lg"
          style={{
            width: tooltipWidth > 0 ? `${tooltipWidth}px` : 'auto',
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 9999,
            transform: 'translateY(-100%)',
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {content}
          <div className="absolute top-full left-8 border-4 border-transparent border-t-slate-900"></div>
        </div>,
        document.body
      )}
    </div>
  )
}


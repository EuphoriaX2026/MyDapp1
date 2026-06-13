import React from 'react'

interface SimpleTestModalProps {
  isVisible: boolean
  onClose: () => void
}

export const SimpleTestModal = ({ isVisible, onClose }: SimpleTestModalProps) => {
  if (!isVisible) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    console.log('🔍 Backdrop clicked, target:', e.target, 'currentTarget:', e.currentTarget)
    if (e.target === e.currentTarget) {
      console.log('✅ Backdrop click - closing modal')
      onClose()
    }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    console.log('🔍 Button clicked')
    e.preventDefault()
    e.stopPropagation()
    console.log('✅ Button click - closing modal')
    onClose()
  }

  const handleContentClick = (e: React.MouseEvent) => {
    console.log('🔍 Content clicked - stopping propagation')
    e.stopPropagation()
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
        onClick={handleContentClick}
      >
        <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Test Modal</h3>
        <p style={{ margin: '0 0 24px 0', color: '#666' }}>
          This is a simple test modal to debug the close functionality.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleButtonClick}
            style={{
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Close Test Modal
          </button>
        </div>
      </div>
    </div>
  )
}

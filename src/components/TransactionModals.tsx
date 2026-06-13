import { AppIcon } from './icons/AppIcon';
import { useEffect } from 'react'
import { parseTransactionError, formatErrorForDebug, getErrorIcon, getErrorColor, type ParsedError } from '../utils/errorParser'

interface TransactionErrorModalProps {
  isVisible: boolean
  error: any
  onClose: () => void
  onRetry?: () => void
}

export const TransactionErrorModal = ({
  isVisible,
  error,
  onClose,
  onRetry
}: TransactionErrorModalProps) => {
  if (!isVisible || !error) return null

  const parsedError: ParsedError = parseTransactionError(error)
  
  // Log detailed error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Transaction Error Details:', formatErrorForDebug(error, parsedError))
  }

  // Add keyboard escape support
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        onClose()
      }
    }

    // Prevent body scroll when modal is open (mobile fix)
    if (isVisible) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape)
      
      // Close any open Bootstrap modals when transaction modal opens - enhanced for mobile
      const bootstrapModals = document.querySelectorAll('.modal.show, .modal.fade.show')
      bootstrapModals.forEach(modal => {
        const modalInstance = (window as any).bootstrap?.Modal?.getInstance(modal)
        if (modalInstance && modal.id !== 'transactionErrorModal') {
          modalInstance.hide()
        }
      })
      
      // Also force hide any action sheet modals that might be open (mobile specific)
      const actionSheets = document.querySelectorAll('.action-sheet.show')
      actionSheets.forEach(sheet => {
        const modalInstance = (window as any).bootstrap?.Modal?.getInstance(sheet)
        if (modalInstance) {
          modalInstance.hide()
        }
      })
      
      // Additional mobile-specific cleanup for any lingering modal backdrops
      setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop')
        backdrops.forEach(backdrop => backdrop.remove())
      }, 100)
      
      return () => {
        document.body.style.overflow = 'unset'
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isVisible, onClose])

  // Cleanup on component unmount to ensure body overflow is always reset
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleCloseClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClose()
  }

  const handleRetryClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClose()
    if (onRetry) {
      onRetry()
    }
  }

  // Prevent clicks inside modal content from bubbling to backdrop
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleErrorBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className={`transaction-modal transaction-error-modal ${isVisible ? 'show' : ''}`} 
      style={{ 
        display: isVisible ? 'block' : 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)'
      }}
      tabIndex={-1} 
      role="dialog"
      onClick={handleErrorBackdropClick}
    >
      <div className="transaction-modal-dialog" role="document">
        <div className="transaction-modal-content" onClick={handleModalContentClick}>
          <div className={`transaction-modal-icon ${getErrorColor(parsedError.type)}`}>
            <AppIcon icon={getErrorIcon(parsedError.type)} />
          </div>
          <div className="transaction-modal-header">
            <h5 className="transaction-modal-title">{parsedError.title}</h5>
          </div>
          <div className="transaction-modal-body">
            <p>{parsedError.message}</p>
            {parsedError.action && (
              <p className="text-muted small mt-2">
                <strong>What to do:</strong> {parsedError.action}
              </p>
            )}
          </div>
          <div className="transaction-modal-footer">
            <div className="transaction-btn-inline">
              {parsedError.type === 'hook_error' && (
                <button 
                  className="transaction-btn transaction-btn-primary me-2" 
                  onClick={() => window.location.reload()}
                  onTouchEnd={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    window.location.reload()
                  }}
                  type="button"
                >
                  REFRESH PAGE
                </button>
              )}
              {onRetry && parsedError.type !== 'user_rejection' && parsedError.type !== 'hook_error' && (
                <button 
                  className="transaction-btn transaction-btn-primary me-2" 
                  onClick={handleRetryClick}
                  onTouchEnd={handleRetryClick}
                  type="button"
                >
                  TRY AGAIN
                </button>
              )}
              <button 
                className="transaction-btn transaction-btn-secondary" 
                onClick={handleCloseClick}
                onTouchEnd={handleCloseClick}
                type="button"
              >
                {parsedError.type === 'user_rejection' ? 'OK' : 'CLOSE'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Success modal for completed transactions
interface TransactionSuccessModalProps {
  isVisible: boolean
  onClose: () => void
  transactionHash?: string
  exchangeDirection?: 'STABLECOIN_TO_TOKEN' | 'TOKEN_TO_STABLECOIN'
  fromCurrency?: string
  toCurrency?: string
  amount?: string
}

export const TransactionSuccessModal = ({
  isVisible,
  onClose,
  transactionHash,
  exchangeDirection,
  fromCurrency,
  toCurrency,
  amount
}: TransactionSuccessModalProps) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('TransactionSuccessModal render:', { isVisible, transactionHash, fromCurrency, amount })
  }
  
  if (!isVisible) return null

  // Add keyboard escape support
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        onClose()
      }
    }

    // Prevent body scroll when modal is open (mobile fix)
    if (isVisible) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape)
      
      // Close any open Bootstrap modals when transaction modal opens - enhanced for mobile
      const bootstrapModals = document.querySelectorAll('.modal.show, .modal.fade.show')
      bootstrapModals.forEach(modal => {
        const modalInstance = (window as any).bootstrap?.Modal?.getInstance(modal)
        if (modalInstance && modal.id !== 'transactionSuccessModal') {
          modalInstance.hide()
        }
      })
      
      // Also force hide any action sheet modals that might be open (mobile specific)
      const actionSheets = document.querySelectorAll('.action-sheet.show')
      actionSheets.forEach(sheet => {
        const modalInstance = (window as any).bootstrap?.Modal?.getInstance(sheet)
        if (modalInstance) {
          modalInstance.hide()
        }
      })
      
      // Additional mobile-specific cleanup for any lingering modal backdrops
      setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop')
        backdrops.forEach(backdrop => backdrop.remove())
      }, 100)
      
      return () => {
        document.body.style.overflow = 'unset'
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isVisible, onClose])

  // Cleanup on component unmount to ensure body overflow is always reset
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const getSuccessMessage = () => {
    if (exchangeDirection && fromCurrency && toCurrency && amount) {
      const action = exchangeDirection === 'STABLECOIN_TO_TOKEN' ? 'purchased' : 'sold'
      const target = exchangeDirection === 'STABLECOIN_TO_TOKEN' ? toCurrency : fromCurrency
      return `Successfully ${action} ${amount} ${target}!`
    }
    return 'Your transaction was completed successfully!'
  }

  const handleViewTransaction = () => {
    if (transactionHash) {
      // Open in Polygonscan
      window.open(`https://polygonscan.com/tx/${transactionHash}`, '_blank')
    }
  }

  const handleSuccessClose = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClose()
  }

  const handleSuccessBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Prevent clicks inside modal content from bubbling to backdrop
  const handleSuccessModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div 
      className={`transaction-modal transaction-success-modal ${isVisible ? 'show' : ''}`} 
      style={{ 
        display: isVisible ? 'block' : 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)'
      }}
      tabIndex={-1} 
      role="dialog"
      onClick={handleSuccessBackdropClick}
    >
      <div className="transaction-modal-dialog" role="document">
        <div className="transaction-modal-content" onClick={handleSuccessModalContentClick}>
          <div className="transaction-modal-icon text-success">
            <AppIcon icon="lucide:circle-check" />
          </div>
          <div className="transaction-modal-header">
            <h5 className="transaction-modal-title">Transaction Successful</h5>
          </div>
          <div className="transaction-modal-body">
            <p>{getSuccessMessage()}</p>
            {transactionHash && (
              <div className="mt-3">
                <p className="text-muted small mb-2">Transaction Hash:</p>
                <p className="text-break small font-monospace">
                  {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                </p>
              </div>
            )}
          </div>
          <div className="transaction-modal-footer">
            <div className="transaction-btn-inline">
              {transactionHash && (
                <button 
                  className="transaction-btn transaction-btn-outline-primary me-2" 
                  onClick={handleViewTransaction}
                  onTouchEnd={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleViewTransaction()
                  }}
                  type="button"
                >
                  VIEW ON EXPLORER
                </button>
              )}
              <button 
                className="transaction-btn transaction-btn-primary" 
                onClick={handleSuccessClose}
                onTouchEnd={handleSuccessClose}
                type="button"
              >
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

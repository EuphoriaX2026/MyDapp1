import { useState } from 'react'
import { TransactionErrorModal } from './TransactionModals'

export const ModalDebugger = () => {
  const [showModal, setShowModal] = useState(false)
  const [error] = useState(new Error('Test error for debugging modal close functionality'))

  const handleOpenModal = () => {
    console.log('Opening test modal')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    console.log('Closing test modal via onClose callback')
    setShowModal(false)
  }

  const handleForceCloseAll = () => {
    console.log('Force closing all modals')
    setShowModal(false)
    
    // Force hide all modals in DOM
    document.querySelectorAll('.transaction-modal, .modal, .dialogbox').forEach(modal => {
      ;(modal as HTMLElement).style.display = 'none'
    })
  }

  return (
    <div style={{ padding: '20px', position: 'fixed', top: '10px', right: '10px', zIndex: 30000, background: 'white', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h4>Modal Debugger</h4>
      <button onClick={handleOpenModal} style={{ margin: '5px', padding: '10px' }}>
        Open Test Modal
      </button>
      <button onClick={handleForceCloseAll} style={{ margin: '5px', padding: '10px', background: 'red', color: 'white' }}>
        Force Close All
      </button>
      <div>
        <small>Modal State: {showModal ? 'OPEN' : 'CLOSED'}</small>
      </div>
      
      <TransactionErrorModal
        isVisible={showModal}
        error={error}
        onClose={handleCloseModal}
      />
    </div>
  )
}
